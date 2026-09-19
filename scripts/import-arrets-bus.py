#!/usr/bin/env python3
"""Prépare les arrêts de bus Libcomlair depuis un GTFS (ZIP ou stops.txt/CSV).

Usage:
  python scripts/import-arrets-bus.py source.zip
  python scripts/import-arrets-bus.py stops.txt

Règles:
- ne conserve que les points d'arrêt (location_type vide ou 0);
- ne transforme jamais une accessibilité inconnue en "non accessible";
- dédoublonne prudemment par nom + coordonnées arrondies.
"""
import csv, io, json, sys, zipfile
from pathlib import Path

OUT = Path("data/arrets-bus-officiels.json")

def val(row, *keys):
    for key in keys:
        v = row.get(key)
        if v not in (None, ""):
            return str(v).strip()
    return ""

def wheelchair(raw):
    raw = str(raw or "").strip()
    if raw == "1": return "accessible"
    if raw == "2": return "non_accessible"
    return "inconnue"

def normalize(row):
    if val(row, "location_type") not in ("", "0"):
        return None
    name = val(row, "stop_name", "name", "nom")
    lat, lon = val(row, "stop_lat", "lat", "latitude"), val(row, "stop_lon", "lon", "longitude")
    if not name or not lat or not lon:
        return None
    try:
        lat_f, lon_f = float(lat), float(lon)
    except ValueError:
        return None
    return {"name":name,"category":"Transports","transportType":"Bus / Arrêt",
            "lat":lat_f,"lon":lon_f,
            "wheelchair":wheelchair(val(row,"wheelchair_boarding")),
            "officialSource":"Point d’Accès National transport.data.gouv.fr"}

def rows_from(source):
    if source.suffix.lower() == ".zip":
        with zipfile.ZipFile(source) as z:
            names = {n.lower(): n for n in z.namelist()}
            target = next((orig for low,orig in names.items() if low.endswith("stops.txt")), None)
            if not target:
                raise SystemExit("stops.txt absent du GTFS")
            text = io.TextIOWrapper(z.open(target), encoding="utf-8-sig", newline="")
            yield from csv.DictReader(text)
    else:
        with source.open("r", encoding="utf-8-sig", newline="") as fh:
            yield from csv.DictReader(fh)

def main():
    if len(sys.argv) != 2:
        raise SystemExit("Usage: python scripts/import-arrets-bus.py source.zip|stops.txt")
    stops, seen = [], set()
    for row in rows_from(Path(sys.argv[1])):
        stop = normalize(row)
        if not stop: continue
        key=(stop["name"].casefold(),round(stop["lat"],5),round(stop["lon"],5))
        if key in seen: continue
        seen.add(key); stops.append(stop)
    stops.sort(key=lambda x:x["name"].casefold())
    payload={"schemaVersion":1,"generatedBy":"scripts/import-arrets-bus.py",
             "stationsCount":len(stops),"stops":stops}
    OUT.parent.mkdir(parents=True,exist_ok=True)
    OUT.write_text(json.dumps(payload,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(f"{len(stops)} arrêts écrits dans {OUT}")

if __name__=="__main__":
    main()
