# COALFORGED 2.3.3-rc1 – Geräte- und Live-Abnahme (noch offen)

**Vorbereitung:** Den aktuellen Smartphone-Datenbestand in der Live-App als JSON exportieren, privat sichern und nicht in ein öffentliches Repository kopieren. Für die erste Prüfung eine Testkopie mit Testdaten nutzen.

## Android / Browser – visuelle und funktionale Prüfung

- [ ] Startseite öffnet ohne JavaScript-Fehler; Hauptnavigation und Touch-Elemente bei ca. 360–430 px Breite nutzbar.
- [ ] Physique zeigt nur Current Build, Gewicht/KFA/FFM/FFMI/nFFMI und Messwerte; Check-ins und Statistik-Historie sind erreichbar.
- [ ] Weder Target Build/Potential noch automatischer Generator, TDE oder AI-2.5/2.6-Einstiege werden aktiv angeboten.
- [ ] Manuell zwei Übungen zu einem Supersatz, drei zum Trisatz, vier zum Giant Set und alle zu einem Zirkel hinzufügen, Reihenfolge bearbeiten und speichern.
- [ ] Einseitigen Iliac Pulldown/Preacher Curl anlegen: links/rechts einzeln erfassen; Nullpause zwischen Seiten, 90 Sekunden nach kompletter Einzelübung.
- [ ] Gruppentimer testen: A1 → A2 ohne Pause; nach der kompletten Gruppe exakt eine Rundenpause, kein doppelter Timer.
- [ ] Unterschiedliche Satzzahlen, vorzeitige Satzbeendigung, manueller Timer, Aussetzen und Wiederaufnehmen testen.
- [ ] Während eines halben unilateral Satzes reloaden und danach erst die andere Seite abschließen.
- [ ] Session pausieren → Bildschirm schließen/neu laden → fortsetzen; Timerzustand und Eingaben müssen unverändert sein.
- [ ] Workout vollständig abschließen; Planhistorie, RIR, Gewichte, Wiederholungen und linke/rechte Seite prüfen.
- [ ] Originalprogramme Kilo/Kilo, Peter, Revenge, Bennett öffnen und mindestens einen nicht-destruktiven Test-Workout-Flow prüfen.
- [ ] Nutrition-Tageswerte, Rezepte, Makros und Readiness-Regeln prüfen.
- [ ] Export → erneuter Import des identischen Backups auf einer Testkopie → Datenvergleich; bei fehlgeschlagenem Import darf kein alter Zustand verloren gehen.

## PWA / Offline

- [ ] `index.html`, `sw.js`, `manifest.json` und Bild-/Icondateien gemeinsam auf Testbereitstellung ausrollen.
- [ ] PWA in Chrome installieren, Cacheaktualisierung auf `coalforged-v2.3.3-rc1` beobachten und App neu starten.
- [ ] Nach vollständigem Online-Erstladen Gerät offline schalten; Start und Kernnavigation prüfen.
- [ ] Offline ein Test-Workout erfassen, App neu laden und erhaltene lokale Daten prüfen; anschließend wieder online.
- [ ] Erst nach erfolgreicher Testbereitstellung und ausdrücklicher Freigabe `main` / GitHub Pages aktualisieren.

**Freigabestatus:** Alle Häkchen noch offen. Vorangegangene Node-/Mock-Tests ersetzen diese Prüfung nicht.
