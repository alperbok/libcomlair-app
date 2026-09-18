import csv, json, sys

src, dest = sys.argv[1], sys.argv[2]
rows = []
with open(src, encoding="utf-8-sig", newline="") as f:
    reader = csv.DictReader(f, delimiter=";")
    for r in reader:
        commune = (r.get("commune") or "").strip()
        if commune.casefold() != "poitiers":
            continue
        def first(*names):
            for n in names:
                if r.get(n):
                    return r[n].strip()
            return ""
        rows.append({
            "nom": first("nom", "name"),
            "adresse": " ".join(x for x in [first("numero"), first("voie"), first("lieu_dit")] if x),
            "commune": commune,
            "code_postal": first("code_postal"),
            "activite": first("activite"),
            "latitude": first("latitude"),
            "longitude": first("longitude"),
            "entree_plain_pied": first("entree_plain_pied"),
            "sanitaires": first("sanitaires_presence", "sanitaires_adaptes")
        })
        if len(rows) >= 1000:
            break

with open(dest, "w", encoding="utf-8") as f:
    json.dump({"source":"Acceslibre / data.gouv.fr","ville":"Poitiers","etablissements":rows}, f, ensure_ascii=False, separators=(",",":"))
print(f"{len(rows)} établissements écrits dans {dest}")
