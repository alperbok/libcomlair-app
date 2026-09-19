#!/usr/bin/env python3
"""Normalise un export CSV PRIM d'Île-de-France Mobilités pour Libcomlair.

Usage:
  python scripts/import-metro.py source.csv

Ce premier importateur reste volontairement prudent :
- il ne conserve que les lignes identifiées comme Métro quand un champ de mode existe ;
- il n'invente aucune information PMR absente ;
- il accepte plusieurs noms de colonnes afin de faciliter le test des exports PRIM.
"""
import csv, json, sys
from pathlib import Path

OUT = Path("data/stations-metro-officielles.json")

def val(row, *keys):
    lower = {str(k).strip().casefold(): v for k, v in row.items()}
    for key in keys:
        v = lower.get(key.casefold())
        if v not in (None, ""):
            return str(v).strip()
    return ""

def accessibility(raw):
    text = str(raw or "").strip()
    return text if text else "inconnue"

def normalize(row):
    mode = val(row, "mode", "mode_transport", "transportmode", "type")
    if mode and "metro" not in mode.casefold() and "métro" not in mode.casefold():
        return None

    name = val(row, "nom", "name", "nom_long", "stop_name", "nom_zda")
    lat = val(row, "latitude", "lat", "stop_lat")
    lon = val(row, "longitude", "lon", "lng", "stop_lon")
    if not name:
        return None

    lat_f = lon_f = None
    try:
        if lat and lon:
            lat_f, lon_f = float(lat.replace(",", ".")), float(lon.replace(",", "."))
    except ValueError:
        lat_f = lon_f = None

    return {
        "name": name,
        "city": val(row, "commune", "ville", "city"),
        "category": "Transports",
        "transportType": "Métro",
        "sourceId": val(row, "id", "id_refa", "id_zda", "stop_id"),
        "lat": lat_f,
        "lon": lon_f,
        "accessibilityLevel": accessibility(val(
            row, "niveau_accessibilite", "niveau d'accessibilité",
            "accessibilite", "accessibilité"
        )),
        "access": [],
        "details": [],
        "officialSource": "Île-de-France Mobilités — PRIM"
    }

def main():
    if len(sys.argv) != 2:
        raise SystemExit("Usage: python scripts/import-metro.py source.csv")

    stations, seen = [], set()
    with Path(sys.argv[1]).open("r", encoding="utf-8-sig", newline="") as fh:
        sample = fh.read(4096)
        fh.seek(0)
        try:
            dialect = csv.Sniffer().sniff(sample, delimiters=",;\t")
        except csv.Error:
            dialect = csv.excel
        for row in csv.DictReader(fh, dialect=dialect):
            station = normalize(row)
            if not station:
                continue
            key = station["sourceId"] or (
                station["name"].casefold(),
                round(station["lat"], 5) if station["lat"] is not None else None,
                round(station["lon"], 5) if station["lon"] is not None else None,
            )
            if key in seen:
                continue
            seen.add(key)
            stations.append(station)

    stations.sort(key=lambda x: (x["city"].casefold(), x["name"].casefold()))
    payload = {
        "schemaVersion": 1,
        "generatedBy": "scripts/import-metro.py",
        "stationsCount": len(stations),
        "stations": stations
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"{len(stations)} stations écrites dans {OUT}")

if __name__ == "__main__":
    main()
