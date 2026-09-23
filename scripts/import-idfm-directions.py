#!/usr/bin/env python3
"""Construit des index compacts arrêt -> lignes -> directions depuis le GTFS IDFM."""

import csv
import io
import json
import shutil
import sys
import zipfile
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path

def member(zf, filename):
    for name in zf.namelist():
        if name.rsplit("/", 1)[-1].lower() == filename.lower():
            return name
    raise RuntimeError(f"{filename} introuvable dans le GTFS")

def reader(zf, filename):
    return csv.DictReader(io.TextIOWrapper(zf.open(member(zf, filename)), encoding="utf-8-sig", newline=""))

def main():
    if len(sys.argv) < 2:
        raise SystemExit("Usage: import-idfm-directions.py GTFS.zip [repertoire-sortie]")
    src=Path(sys.argv[1])
    out_dir=Path(sys.argv[2] if len(sys.argv)>2 else "data/idfm-directions")
    if out_dir.exists():
        shutil.rmtree(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    with zipfile.ZipFile(src) as zf:
        routes={}
        for row in reader(zf,"routes.txt"):
            rid=(row.get("route_id") or "").strip()
            if not rid:
                continue
            routes[rid]={
                "id":rid,
                "shortName":(row.get("route_short_name") or "").strip(),
                "longName":(row.get("route_long_name") or "").strip(),
            }

        trips={}
        for row in reader(zf,"trips.txt"):
            tid=(row.get("trip_id") or "").strip()
            rid=(row.get("route_id") or "").strip()
            head=(row.get("trip_headsign") or "").strip()
            if tid and rid and head:
                trips[tid]=(rid,head)

        index=defaultdict(lambda: defaultdict(set))
        for row in reader(zf,"stop_times.txt"):
            sid=(row.get("stop_id") or "").strip()
            if not sid.startswith("IDFM:"):
                continue
            key=sid[5:]
            if not key.isdigit():
                continue
            trip=trips.get((row.get("trip_id") or "").strip())
            if not trip:
                continue
            rid,head=trip
            index[key][rid].add(head)

    stops={}
    for sid, by_route in index.items():
        lines=[]
        for rid, directions in by_route.items():
            meta=routes.get(rid,{"id":rid,"shortName":"","longName":""})
            lines.append({
                **meta,
                "directions":sorted(directions, key=str.casefold)
            })
        lines.sort(key=lambda x: (x.get("shortName") or x.get("longName") or x.get("id") or "").casefold())
        stops[sid]=lines

    generated=datetime.now(timezone.utc).isoformat()
    shards=defaultdict(dict)
    for sid, lines in stops.items():
        prefix=sid[:2] if len(sid)>=2 else sid.zfill(2)
        shards[prefix][sid]=lines

    for prefix, shard_stops in shards.items():
        payload={
            "version":"idfm-directions-static-v155",
            "generatedAt":generated,
            "stops":shard_stops
        }
        (out_dir/f"{prefix}.json").write_text(
            json.dumps(payload,ensure_ascii=False,separators=(",",":")),
            encoding="utf-8"
        )

    manifest={
        "version":"idfm-directions-static-v155",
        "generatedAt":generated,
        "stops":len(stops),
        "shards":sorted(shards),
    }
    (out_dir/"manifest.json").write_text(
        json.dumps(manifest,ensure_ascii=False,separators=(",",":")),
        encoding="utf-8"
    )
    print(f"{len(stops)} arrêts indexés dans {len(shards)} fichiers -> {out_dir}")

if __name__=="__main__":
    main()
