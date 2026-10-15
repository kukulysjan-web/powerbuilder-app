# COALFORGED 2.3.3 – Block 3 · Testbericht

Status: Abnahmekandidat, nicht live.
Datum: 2026-10-14

## Resultate

14/14 isolierte gezielte Tests bestanden. 38/38 Inline-Skripte und Service Worker ohne Syntaxfehler.

### Testfälle

- **PASS** – Generator-Wizard incl. preview/test API physically removed
- **PASS** – No generator/Target builder button remains in active HTML
- **PASS** – Manual SplitBuilder, plans and programme modules byte-identical to block 2
- **PASS** – Legacy GENERATED type, exact key/schema v10, protected originals preserved
- **PASS** – No AI cleanup / no Physique edits in this block
- **PASS** – PWA version, cache and manifest consistency
- **PASS** – Manual new split still opens with 3 editable days
- **PASS** – Manual exercise add and exercise settings editable
- **PASS** – Manual draft save uses CUSTOM source type and persisted structure
- **PASS** – Manual template created without generator
- **PASS** – Existing GENERATED template loads, edits, saves, retains provenance
- **PASS** – Old generated Engine plan and progression/history remain readable
- **PASS** – Personal measurement, food and workout history unchanged by manual actions
- **PASS** – Read-only schema/store does not invent a generator UI state

## Exakte Codekontrolle

- Entfernt: `33,609` Bytes `index.html` (netto).
- Manuelle SplitBuilder-, Program-Engine-, Gruppen-/Unilateral-Implementierungen bleiben gegenüber Block 2 bytegenau unverändert.
- Keine aktiven `cf231*`-Referenzen, Generator-Einstiege oder CF231-Test-APIs mehr.
- `GENERATED` bleibt als Legacy-Quelltyp zulässig und vorhandene Herkunftsdaten werden nicht gelöscht.
- State-Key, State-Schema und Physique-Bestand unverändert.

## Grenzen

- Der synthetische VM-Test prüft echte Produktfunktionen im isolierten Zustand; er ist kein vollständiger Browser-, Android-, PWA- oder Persistenz-Reload-Test.
- Browser-Navigation war durch die Ausführungsumgebung blockiert. Ein Gerätetest auf dem persönlichen Datenbestand wurde nicht ausgeführt.
- Vor Veröffentlichung prüfen: manuelle Pläne öffnen/erstellen/speichern, alte Generator-Pläne öffnen, Reload, Program Engine, originale Programme, Backup-/Import-/Export sowie Offline-PWA-Cache.
- Block 4 nicht implementiert.
