# COALFORGED 2.3.3 · Block 2 – Prüfbericht

Datum: 2026-10-14
Basis: unverändertes 2.3.2-ZIP und GitHub Referenz `main` 20dbd4296d3f625dbc74d38f2723bcf959124ef9.

## Automatisierte Prüfung

- 39 Inline-Skripte mit `node --check` ohne Syntaxfehler.
- 15/15 isolierte Funktionsprüfungen erfolgreich.
- Kern-Skripte `cf232-implementation`, `cf23-block2-current-build`, `cf23-block1-data-foundation` bytegenau unverändert.
- Funktional geändert: `index.html`, `manifest.json`, `sw.js`; Block 2 bringt keine neue Storage-Schema-Version.
- Archivierte Ziel-/Potential-Daten eines Testzustandes bleiben nach allen Lesevorgängen unverändert.

### Funktionsprüfungen

PASS Conservative nav whitelist
PASS Stale overview/target/potential routes always current
PASS Current has five original stats and all region values
PASS KFA composition uses same snapshot + correct FFM FFMI
PASS Empty Current never invents composition
PASS KFA-range yields FFM interval
PASS Physique nav no Target/Potential actions
PASS Gateway contains only real current metrics
PASS History retains trend & timeline not goal reviews
PASS Goal-linked Program Engine UI removed
PASS Generator remains but target editor entry buttons removed
PASS Readonly bridges do not expose legacy targets/potential
PASS All persistent data records remain byte-identical after readings
PASS Checkin save no longer invokes potential evaluator
PASS Storage key and schema version unchanged
VERIFIED_ASSERTIONS 15

## Unverändert

- Current Build: Gewicht, Body Fat, FFM/FFMI/nFFMI, Maße, Datenabdeckung
- Sämtliche gespeicherten Trainingsprogramme und Gruppen-/Unilateral-Engine
- JSON Import / Export und Legacy-Migrationsfunktionen
- `janTrainingUnifiedV1`, Schema v10, bisherige User-Daten

## Offene manuelle Abnahme auf Android/PWA

1. COALFORGED App-Daten als JSON exportieren und extern sichern.
2. Fortschritt → Körper: zeigt nur Current Build, Check-in, History.
3. Aktuelles Gewicht, KFA-Bereich, FFM/FFMI/nFFMI, sämtliche Maße und regionale Trends kontrollieren.
4. Einen Check-in speichern, anschließend History und Reload überprüfen.
5. Bestehenden Plan öffnen, ändern und ohne Datenverlust wieder verlassen.
6. Prüfen, ob Supersatz- und Unilateral-Einstellungen aus 2.3.2 unverändert bleiben.
7. Nach PWA-Neustart Cache-Aktualisierung und erfasste Historie prüfen.

**Grenze:** Chromium/Playwright blockierte URL-Navigation mit `ERR_BLOCKED_BY_ADMINISTRATOR`. Deshalb kein behaupteter visueller oder Smartphone-End-to-End-Erfolg. Kein produktiver Upload wurde ausgeführt.
