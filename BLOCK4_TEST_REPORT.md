# COALFORGED 2.3.3 – Block 4 · Testbericht

**Datum:** 14.10.2026  
**Ergebnis:** 22/22 bestanden, keine fehlgeschlagenen Prüfungen.

## Einzeltests

- **PASS** – 1: 38 inline scripts pass JS compilation
- **PASS** – 2: service worker valid JS
- **PASS** – 3: AI product modules / promotional UI absent
- **PASS** – 4: inert adaptive Coach module removed from new Program Engine plan catalog
- **PASS** – 5: no active external generative AI endpoint
- **PASS** – 6: only four explicitly scoped substitutions + version/title + help line
- **PASS** – 7: active manual SplitBuilder, groups and Unilateral modules byte-identical to block 3
- **PASS** – 8: deterministic readiness and nutrition main algorithms byte-identical
- **PASS** – 9: local store and existing schema unchanged
- **PASS** – 10: legacy GENERATED plans remain supported
- **PASS** – 11: Readiness coach calculates -10% weight and -1 set correctly
- **PASS** – 12: Coach remains unadjusted with no active recommendation
- **PASS** – 13: Coach saves recommendation without losing other state branches
- **PASS** – 14: Nutrition Tracker adds food records correctly
- **PASS** – 15: Nutrition Tracker preserves fallback historical day values
- **PASS** – 16: macro remainder indicators remain deterministic
- **PASS** – 17: nutrition-suggestion screen retained, disclaimer is accurate
- **PASS** – 18: help sheet clarifies scope without AI roadmap
- **PASS** – 19: shipped assets and archived specs byte-identical to block 3
- **PASS** – 20: version, manifest and PWA cache consistent
- **PASS** – 21: historical Master v1.45 remains authoritative
- **PASS** – 22: protect records from schema rewriting and retired field stripping

## Testgrenzen

- Tests laufen mit Node.js / isoliertem VM-Kontext und synthetischen Beispieldaten, nicht mit dem persönlichen Browser-/App-Speicher.
- Vollständiger Browserstart via Playwright (`set_content`, `domcontentloaded`) wegen Timeout (20 s) fehlgeschlagen; deshalb keine zuverlässige visuelle Geräte-/PWA-Validierung.
- Keine Prüfung eines realen Offline-Updates, Geräte-Caches oder Import-/Export-Roundtrips auf dem Smartphone.
- Die im ZIP enthaltenen historischen Spezifikationen sind archivierte Referenzen, kein aktiver Produktumfang.
- Vor Freigabe: Live-Cache-Aktualisierung, aktuelle Training/Coach/Nutrition-Screens, persistenter JSON-Export/Import und Rollback auf Block 3 auf einem Testgerät prüfen.
- Block 5 unverändert und nicht begonnen.
