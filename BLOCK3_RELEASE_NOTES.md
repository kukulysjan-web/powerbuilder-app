# COALFORGED 2.3.3 – Block 3: Nur manuelle Trainingsplanung

**Datum:** 14.10.2026
**Status:** Abnahmekandidat 2.3.3-b3; keine Veröffentlichung / kein Gesamt-Release.
**Basis:** abgenommener Block-2-Stand `2.3.3-b2`.

## Entfernt (nur Block 3)
- Gesamtes `cf231-archetype-workflow`-Modul inkl. Archetypen-Auswahl, Zielbuild-Erstellung, automatischem Programmvorschlag, Zeitbudget-/Splitgenerator, Generatorvorschau und Übergabe in SplitBuilder.
- `cf231-archetype-style` und UI-Einstieg „Archetype Program Generator“ aus Training / Plan.
- Abhängiger, inzwischen überflüssiger Block-2-Generator-UI-Wrapper.
- Drei ausschließlich vom gelöschten Modul verwendete Archetypen-Bilddateien sowie ihren PWA-Precache-Eintrag.
- Überholter Archetype-Testbericht aus dem auszuliefernden Paket; ursprüngliche Specs verbleiben als historische Referenzen.

**Training Design Engine:** In der 2.3.3-b2-Codebasis gab es kein separat aktives TDE-Modul. Deshalb kein separater TDE-Eingriff. Der tatsächlich vorhandene Generator ist entfernt.

## Unverändert (Bestandsschutz)
- Allgemeiner manueller SplitBuilder (`cf223`), Übungsbibliothek, Templates/Drafts (`cf221`), Program Engine (`cf224`), Bennett-Builder, Originalprogramme Kilo/Kilo, Peter, Revenge, Bennett.
- 2.3.2-Implementierung von Satzgruppen, Supersätzen, Trisätzen, Giant Sets, Zirkel und Unilateral (`cf232`); ihre vollständige Player-Praxisprüfung folgt in Block 5.
- Abgenommener Physique-Rückbau aus Block 2 (Current Build, Check-ins, History).
- Vorhandener Coach, Nutrition Tracker und alle in Block 4 erst zu bereinigenden KI-Roadmap-Verweise.
- State-Key `janTrainingUnifiedV1`, Schema v10, alle vorhandenen Plan-/Session-/Mess-/Nutrition-/Workout-Daten.
- Legacy-Quelltyp `GENERATED` bleibt lesbar. Gespeicherte/generated Altpläne, `sourceSnapshot.archetype`, Progression und Workout-Historie werden nicht bereinigt oder gelöscht. Lediglich die aktive Benutzeroberfläche zeigt keine neue Generator-Aktion mehr.

## Technische Änderungen
- `index.html`: Version `2.3.3-b3`, Generator-/Archetype-Modul vollständig gelöscht, Training-Plan-Katalogtext auf manuelle Pläne und Altpläne angepasst.
- `manifest.json`: Beschreibung des Block-3-Stands.
- `sw.js`: Cache `coalforged-v2.3.3-b3`, ungenutzte Bild-Prefetches entfernt.
- Nicht destruktiv; keine Schema-Migration, keine Storage-Löschung und keine Veränderung an bestehenden Originalprogrammen.

## Tests
- 14/14 isolierte Integrations- und Regressionstests bestanden.
- 38/38 aktive Inline-JavaScript-Blöcke sowie Service Worker syntaktisch geprüft.
- Unveränderte Hashes der manuellen Builder-, Engine-, Satzgruppen-/Unilateral-Module verglichen mit Block 2.
- Historischer `GENERATED`-Plan in Testkontext geöffnet, verändert, erneut gespeichert – Quelltyp, `sourceSnapshot`, Unilateral und Satzgruppen erhalten.
- Reale Android-/PWA-/Reload-/Import-Export-End-to-End-Tests offen: Browserlaufzeit in dieser Umgebung blockiert externe/file Navigation bzw. vollständige HTML-Ausführung.

## Version & Freigabe
**Nicht live hochgeladen.** Block 4 ausdrücklich nicht begonnen. Erst nach User-Abnahme fortfahren. Vor einem Gerätetest persönliche Daten als JSON aus COALFORGED exportieren und sichern.
