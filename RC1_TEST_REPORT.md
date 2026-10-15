# COALFORGED 2.3.3-rc1 — Abschlussbericht Block 6

**Datum:** 14. Oktober 2026  
**Basis:** abgenommener Block 5 (`COALFORGED_2.3.3_BLOCK5_WORKOUT_PLAYER.zip`)  
**Status:** technischer Release-Kandidat erstellt. **Keine Geräte-, Produktions- oder Live-Freigabe.**

## Automatisierte Ergebnisse

| Kategorie | Resultat | Aussagekraft |
|---|---:|---|
| Workout-Player-Integration (`block5_integration_tests.cjs`) | 28/28 | Isolierte Program-Engine-/State- und Timer-Tests mit simuliertem Kontext |
| Import, Datensicherung & PWA (`RC1_DATA_PWA_TESTS.cjs`) | 20/20 | Originale Import-Schutzfunktionen im VM-Kontext; Service-Worker-Events mit Cache-/Fetch-Mocks |
| Struktur-/Integritätsprüfungen (`RC1_STRUCTURE_TESTS.py`) | 9/9 | Script-Syntax, Assets, Manifest, responsive CSS **statisch**, Modulpräsenz, Quellvergleich |
| App-Script-Syntax innerhalb Strukturprüfung | 39/39 | Alle eingebetteten JS-Scriptblöcke syntaktisch gültig; **kein DOM-Laufzeittest** |
| `sw.js` | bestanden | `node --check` |

**Insgesamt 57/57 isolierte Tests bzw. Prüfgruppen bestanden; darin sind die 39 Script-Syntaxchecks enthalten und nicht zusätzlich aufaddiert.**

Die einzelnen Testprotokolle sind im ZIP: `RC1_BLOCK5_TEST_LOG.txt`, `RC1_DATA_PWA_TEST_LOG.txt`, `RC1_STRUCTURE_TEST_LOG.txt`. Alle Tests sind reproduzierbar mit Node.js 22 und Python 3 plus BeautifulSoup/Pillow.

## Konkrete Abdeckung

- **Workout:** Supersatz, Trisatz, Giant Set, 4er-Zirkel, unterschiedliche aktive Satzzahlen, Solo-Übungen, Gruppenrundenpause, kein Doppeltimer, automatische Navigation.
- **Unilateral:** links/rechts getrennte Werte und RIR; halber Satz wird nicht vollständig gewertet; Persistenz nach JSON-Serialisierung einer Session; Historie und Progressionskontrolle.
- **Timer:** Pause/Resume, manuelle Anpassung, Skip, simulierte Reload-Hydration; nach Pause kein doppelter Runden-Timer.
- **Engine-Abschluss:** Versionierte historische Logs mit beiden Seiten gespeichert.
- **Datenimport:** v11 abgewiesen; Legacy-/v10-Muster akzeptiert; Backup des alten JSON vor Überschreiben; sauberer Abbruch/Rollback bei simuliertem Backup-, Migrations- oder Schreibfehler.
- **PWA:** `install`/`activate`/`fetch`-Logik per VM und Mocks; Core-Cachedateien und Offline-Navigations-Fallback; alter COALFORGED-Cache entfernt, persistenter Fremd-Cache bleibt.
- **Artefakte:** lokale Grafiken existieren, Manifest-Icons sind korrekt dimensioniert, sämtliche Inline-Scripts parsen, Viewport und responsive Breakpoints vorhanden; keine externe JS-Abhängigkeit.
- **Codebestand:** `index.html` enthält exakt die Block-5-Logik mit nur zwei Versions-/Titelersetzungen. `sw.js` enthält nur angepasste Versions-/Cachezeichenketten. Alle sonstigen vorbestehenden App-/Asset-Dateien sind unverändert; geänderte Textdokumente sind Release-/QA-Metadaten.

## Nicht bestanden / nicht nachweisbar

**Keine automatisierten Tests fehlgeschlagen.** Folgende Prüfungen wurden **nicht** erfolgreich durchgeführt und sind deshalb weiterhin offen:

1. **Browser:** Chromium/Playwright blockiert den Aufruf sowohl über `file://` als auch über den lokalen HTTP-Server mit `net::ERR_BLOCKED_BY_ADMINISTRATOR`. Keine echte Screenshot-/Browserkonsole/Interaktionsabnahme.
2. **Smartphone:** Kein realer Android-Touch-, Darstellungs-, Timer-, Standby- oder WakeLock-Test.
3. **Echte PWA:** Offline-/Service-Worker-Test erfolgte nur mit Cache-/Fetch-Mocks; kein installierter Service Worker im Browser und kein kontrollierter Offline-Gerätetest.
4. **Persönliche Daten:** Keine echten Nutzer-JSON-Daten verfügbar. Import-Backup-/Rollback-Funktionen wurden isoliert geprüft, jedoch kein vollständiger Datei-Export-→ Import-→ Reimport-Roundtrip an einer laufenden App.
5. **Geschützte Originalprogramme:** Modulpräsenz/Quellunverändertheit nachgewiesen, aber nicht jede Original-Workout-Regel in einem echten UI-Weg erneut durchgespielt.
6. **Deployment:** GitHub `main` und Live-PWA nicht geändert; kein veröffentlichter Release nachgewiesen.

## Versions- und Datenschutzbestätigung

- `APP_VERSION`: `2.3.3-rc1`
- PWA Cache: `coalforged-v2.3.3-rc1`
- Storage-Key: `janTrainingUnifiedV1`
- Datenformat: v10
- Änderungen gegenüber Block 5 im ausführbaren Code: ausschließlich Titel-/Versionskennung und Cachebezeichnung.
- Historische Target-/Potential-/Generator-Felder wurden nicht gelöscht.
- Keine Endnutzer-Daten in diesem Paket enthalten.

## Gesamtbewertung

**Technische Freigabe zum Testen: JA.**  
**Abnahme für echten Android-/Offline-Einsatz oder Live-Deployment: NEIN, noch offen.**  
Die Freigabe benötigt das erfolgreiche Abarbeiten von `RC1_MOBILE_ABNAHME.md` und eine ausdrückliche Nutzerentscheidung zur Live-Veröffentlichung.
