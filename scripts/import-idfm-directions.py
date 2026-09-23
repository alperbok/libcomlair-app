#!/usr/bin/env python3
"""Construit des index compacts arrêt -> lignes -> directions depuis le GTFS IDFM.

Les deux côtés d'un même arrêt sont regroupés automatiquement :
- même parent_station GTFS, ou
- même nom normalisé et positions distantes de 180 m maximum.

Ainsi chaque fiche Libcomlair reçoit toutes les lignes et toutes les directions
connues pour l'arrêt physique, sans réglage manuel arrêt par arrêt.
"""

import csv
import io
import json
import math
import re
import shutil
import sys
import unicodedata
import zipfile
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path

MAX_SAME_NAME_DISTANCE_M = 180.0

def member(zf, filename):
    for name in zf.namelist():
        if name.rsplit("/", 1)[-1].lower() == filename.lower():
            return name
    raise RuntimeError(f"{filename} introuvable dans le GTFS")

def reader(zf, filename):
    return csv.DictReader(
        io.TextIOWrapper(
            zf.open(member(zf, filename)),
            encoding="utf-8-sig",
            newline=""
        )
    )

def stop_key(raw):
    sid=(raw or "").strip()
    if sid.startswith("IDFM:"):
        sid=sid[5:]
    return sid if sid.isdigit() else ""

def normalize_name(value):
    text=unicodedata.normalize("NFD", value or "")
    text="".join(ch for ch in text if unicodedata.category(ch)!="Mn")
    text=text.casefold()
    text=re.sub(r"[^a-z0-9]+"," ",text)
    return " ".join(text.split())

def distance_m(a, b):
    lat1,lon1=a
    lat2,lon2=b
    r=6371000.0
    p1=math.radians(lat1)
    p2=math.radians(lat2)
    dp=math.radians(lat2-lat1)
    dl=math.radians(lon2-lon1)
    h=math.sin(dp/2)**2+math.cos(p1)*math.cos(p2)*math.sin(dl/2)**2
    return 2*r*math.asin(min(1.0,math.sqrt(h)))

class DSU:
    def __init__(self):
        self.parent={}
        self.rank={}
    def add(self,x):
        if x not in self.parent:
            self.parent[x]=x
            self.rank[x]=0
    def find(self,x):
        self.add(x)
        p=self.parent[x]
        if p!=x:
            self.parent[x]=self.find(p)
        return self.parent[x]
    def union(self,a,b):
        ra,rb=self.find(a),self.find(b)
        if ra==rb:
            return
        if self.rank[ra]<self.rank[rb]:
            ra,rb=rb,ra
        self.parent[rb]=ra
        if self.rank[ra]==self.rank[rb]:
            self.rank[ra]+=1

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

        # Métadonnées des arrêts pour réunir automatiquement les deux côtés.
        stop_meta={}
        parent_groups=defaultdict(list)
        same_name=defaultdict(list)
        for row in reader(zf,"stops.txt"):
            sid=stop_key(row.get("stop_id"))
            if not sid:
                continue
            name=(row.get("stop_name") or "").strip()
            parent=(row.get("parent_station") or "").strip()
            try:
                lat=float(row.get("stop_lat") or "")
                lon=float(row.get("stop_lon") or "")
                coords=(lat,lon)
            except ValueError:
                coords=None
            stop_meta[sid]={
                "name":name,
                "norm":normalize_name(name),
                "parent":parent,
                "coords":coords,
            }
            if parent:
                parent_groups[parent].append(sid)
            if name and coords:
                same_name[normalize_name(name)].append(sid)

        dsu=DSU()
        for sid in stop_meta:
            dsu.add(sid)

        # Cas le plus fiable : les côtés partagent le même parent_station GTFS.
        for members in parent_groups.values():
            if len(members)>1:
                first=members[0]
                for sid in members[1:]:
                    dsu.union(first,sid)

        # Secours générique : même nom et moins de 180 m.
        # Cela couvre les arrêts opposés dont le GTFS n'a pas de parent_station commun.
        for members in same_name.values():
            if len(members)<2:
                continue
            for i in range(len(members)):
                a=members[i]
                ca=stop_meta[a]["coords"]
                if not ca:
                    continue
                for j in range(i+1,len(members)):
                    b=members[j]
                    cb=stop_meta[b]["coords"]
                    if cb and distance_m(ca,cb)<=MAX_SAME_NAME_DISTANCE_M:
                        dsu.union(a,b)

        index=defaultdict(lambda: defaultdict(set))
        for row in reader(zf,"stop_times.txt"):
            sid=stop_key(row.get("stop_id"))
            if not sid:
                continue
            trip=trips.get((row.get("trip_id") or "").strip())
            if not trip:
                continue
            rid,head=trip
            index[sid][rid].add(head)

    # Fusionne toutes les directions au niveau de l'arrêt physique.
    physical=defaultdict(lambda: defaultdict(set))
    for sid, by_route in index.items():
        root=dsu.find(sid) if sid in dsu.parent else sid
        for rid, directions in by_route.items():
            physical[root][rid].update(directions)

    stops={}
    grouped_members=defaultdict(list)
    for sid in stop_meta:
        grouped_members[dsu.find(sid)].append(sid)

    all_ids=set(index)|set(stop_meta)
    for sid in all_ids:
        root=dsu.find(sid) if sid in dsu.parent else sid
        by_route=physical.get(root) or index.get(sid) or {}
        if not by_route:
            continue
        lines=[]
        for rid, directions in by_route.items():
            meta=routes.get(rid,{"id":rid,"shortName":"","longName":""})
            lines.append({
                **meta,
                "directions":sorted(directions, key=str.casefold)
            })
        lines.sort(
            key=lambda x: (
                x.get("shortName") or x.get("longName") or x.get("id") or ""
            ).casefold()
        )
        stops[sid]=lines

    generated=datetime.now(timezone.utc).isoformat()
    shards=defaultdict(dict)
    for sid, lines in stops.items():
        prefix=sid[:3] if len(sid)>=3 else sid.zfill(3)
        shards[prefix][sid]=lines

    for prefix, shard_stops in shards.items():
        payload={
            "version":"idfm-directions-static-v157",
            "generatedAt":generated,
            "stops":shard_stops
        }
        (out_dir/f"{prefix}.json").write_text(
            json.dumps(payload,ensure_ascii=False,separators=(",",":")),
            encoding="utf-8"
        )

    physical_groups=sum(1 for members in grouped_members.values() if len(members)>1)
    grouped_stop_ids=sum(len(members) for members in grouped_members.values() if len(members)>1)

    manifest={
        "version":"idfm-directions-static-v157",
        "generatedAt":generated,
        "stops":len(stops),
        "shards":sorted(shards),
        "physicalGroupsMerged":physical_groups,
        "stopIdsMerged":grouped_stop_ids,
        "sameNameMaxDistanceMeters":MAX_SAME_NAME_DISTANCE_M,
    }
    (out_dir/"manifest.json").write_text(
        json.dumps(manifest,ensure_ascii=False,separators=(",",":")),
        encoding="utf-8"
    )
    print(
        f"{len(stops)} arrêts indexés, "
        f"{physical_groups} groupes physiques fusionnés "
        f"({grouped_stop_ids} identifiants), "
        f"{len(shards)} fichiers -> {out_dir}"
    )

if __name__=="__main__":
    main()
