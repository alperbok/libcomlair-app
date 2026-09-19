#!/usr/bin/env python3
"""Construit data/gares-officielles.json à partir d'un export JSON officiel.

Usage:
  python scripts/import-gares.py source.json

Le script n'invente aucune donnée d'accessibilité : les champs absents restent vides.
"""
import json, sys
from pathlib import Path

OUT = Path("data/gares-officielles.json")

def pick(d, *keys):
    for k in keys:
        if k in d and d[k] not in (None, ""):
            return d[k]
    return None

def normalize(row):
    fields = row.get("fields", row)
    name = pick(fields, "nom_gare", "Nom_Gare", "nom", "name", "gare", "libelle", "stop_name")
    city = pick(fields, "commune", "city", "ville")
    uic = pick(fields, "code_uic", "Code_UIC", "uic", "uic_code")
    lat = pick(fields, "latitude", "lat")
    lon = pick(fields, "longitude", "lon", "lng")
    geo = pick(fields, "position_geographique", "Position géographique", "coordonnees_geographiques", "geopoint", "coordinates")
    if isinstance(geo, (list, tuple)) and len(geo) >= 2:
        lat, lon = lat or geo[0], lon or geo[1]
    if not name:
        return None
    return {
        "name": str(name),
        "city": str(city or ""),
        "category": "Transports",
        "transportType": "Train / Gare",
        "uic": str(uic or ""),
        "lat": lat,
        "lon": lon,
        "address": "",
        "phone": "3635",
        "pmrPhone": "3635 puis #45",
        "website": "",
        "access": [],
        "details": [],
        "officialSource": "Données officielles de transport"
    }

def main():
    if len(sys.argv) != 2:
        raise SystemExit("Usage: python scripts/import-gares.py source.json")
    raw = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    rows = raw.get("results", raw.get("records", raw)) if isinstance(raw, dict) else raw
    stations = [s for s in (normalize(r) for r in rows) if s]
    stations.sort(key=lambda x: (x["city"].casefold(), x["name"].casefold()))
    payload = {
        "schemaVersion": 1,
        "generatedBy": "scripts/import-gares.py",
        "stations": stations
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"{len(stations)} gares écrites dans {OUT}")

if __name__ == "__main__":
    main()
