# COALFORGED 2.3.3-b5 — Block 5: Testbericht

**Datum:** 14.10.2026  
**Basis:** abgenommener Block 4 (`COALFORGED_2.3.3_BLOCK4_AI_CLEANUP.zip`)  
**Status:** technischer Abnahmekandidat; keine Produktions-/Android-/PWA-Freigabe.

## Ergebnisse

- **28/28 isolierte JavaScript-Integrationstests bestanden** (`node block5_integration_tests.cjs`).
- **39/39 eingebettete Script-Blöcke syntaktisch validiert** (`new Function`, keine Ausführung des gesamten DOM).
- `sw.js` syntaktisch validiert (`node --check`).
- ZIP-Integrität und SHA-256-Dateiprüfsummen beim Paketbau kontrolliert.
- Übernahme des Block-4-Stands geprüft: Bestandsdateien unverändert, abgesehen von beabsichtigten Änderungen in `index.html`, `sw.js`, versionierten Paket-Metadaten und den neuen Block-5-Dateien.

## Getestete Abläufe

1. Trisatz mit verschiedenen Satzmengen; Einzelsätze danach.
2. Giant Set / Viererzirkel und korrekte Reihenfolge für Folgerunden.
3. Effektive Engine-Satzzahlen statt ausschließlich ursprünglicher Übungsvorgaben.
4. 0-Sekunden-Übergang zwischen Gruppenübungen und 120-Sekunden-Rundenpause.
5. Bilateraler Satz: gültiges Logging, automatischer Wechsel, kein unterdrückter Gruppentimer.
6. Unilaterale linke/rechte Seite separat: nur nach beiden Seiten ein voller Satz.
7. Seitenwechsel ohne Übernahme des RIR-Eintrags der Gegenseite.
8. Erhalt von Teilsatz-/Seitenstatus nach JSON-Serialisierung einer laufenden Session.
9. Vollständiges Durchlaufen von zwei Gruppenrunden und weiteren Einzelsätzen.
10. Unterbrechung, Pausierung, manuelle Timeranpassung und Überspringen.
11. Timerhydration aus persistiertem Deadline-Zeitpunkt nach simuliertem Reload.
12. Manuelle Pause, auch bei deaktivierten automatischen Pausen.
13. Getrennte Seitenhistorie und Fixed-Progression ohne unzulässige automatische Steigerung.
14. Eindeutig als PARTIAL aufgelöste Teilsätze bleiben von `ok`-Vollsätzen getrennt.
15. Originale Engine-Abschlussfunktion: versionierte Speicherung aller Sets in Planhistorie.
16. Verlaufsschirm mit Link-/Rechts-Gewicht, Wiederholungen und RIR.
17. Regler- und Protokollcode greift bei geschützten Originalprogrammen nicht ein.

## Behobener Fehler

In Block 4 wurde für bilaterale Program-Engine-Sätze die Funktion `startTimer` temporär durch ein No-op ersetzt. Diese Unterdrückung erfasste versehentlich auch den unmittelbar nachfolgenden **Gruppen-Rundentimer**. Der neue Block-5-Save-Adapter protokolliert bilaterale Sets direkt und startet genau einen Scheduler-Timer; die bestehenden Validierungen einschließlich Steady-State-Lastsperre bleiben erhalten.

## Datenintegrität

- Storage-Key **`janTrainingUnifiedV1`** unverändert; keine Schemaänderung oder Datenbereinigung.
- Alte Pläne, Templates, Programme, Trainingsverläufe, Ernährungsdaten und Current-Build-Daten werden weder gelöscht noch umgeschrieben.
- History speichert die ursprünglichen Planversionen und vollständige Seitenwerte. Ein bewusst aufgelöster Teilsatz wird nicht als voller Satz für Progression gewertet.
- Neue Historienanzeige liest ausschließlich bestehende Plandaten.

## Grenzen der Prüfung

- **Echter Browser-Start nicht verifiziert:** Chromium/Playwright wurden beim Laden von `file://` *und* `http://127.0.0.1` durch die Laufzeitumgebung mit `ERR_BLOCKED_BY_ADMINISTRATOR` blockiert. Es liegen deshalb keine bestätigten End-to-End-UI-Screenshots und keine echte Browserkonsole vor.
- **Kein echter Android-/PWA-/Offline-Gerätetest:** Service-Worker-Cache auf `coalforged-v2.3.3-b5` vorbereitet, aber nicht am Mobilgerät geprüft.
- Simulierte Engine-/Timer-/Reload-Tests sind nützlich, ersetzen jedoch keinen Test mit realen Nutzerdaten und Smartphone-Interaktion.
- GitHub-Repository und Live-App absichtlich **nicht** verändert.

**Empfehlung zur Abnahme:** Auf einer Testkopie einen Supersatz, Viererzirkel und einseitige Übung anlegen, Session beginnen, pausieren, Seite 1+2 erfassen, Reload auslösen, Workout abschließen, den neuen Plan-Verlauf öffnen. Vor Datenimport einen JSON-Export sichern.
