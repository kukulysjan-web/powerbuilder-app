# COALFORGED 2.4.0 UX RC1 – Testbericht

## Prüfverfahren

- Browser: installiertes Chromium, Playwright, mobile Viewport 390 × 844.
- Einbettung der statischen HTML-/CSS-/JS-Ressourcen in einen isolierten Browser-Frame; lokale Tests verwenden bewusst einen **simulierten** localStorage, keine echten Nutzerdaten.
- Testplan: vollständiges manuelles COALFORGED-Engine-Programm mit zwei Übungen plus live hinzugefügter unilateraler Übung.
- Bestehende 2.3.3-Engine wird verwendet (keine parallele Trainings-Engine).

## Durchgeführte Tests

- Grundansicht mit vier Navigationspunkten und vereinfachter Startseite
- Physique: neuen Gewichtspunkt speichern; weiteren Messpunkt ergänzen; 7-Tage-Trend anzeigen; FFMI-Statistik weiter erreichbar
- Workout: alle Sätze in einer Karte; Satz hinzufügen; ursprünglicher Plan unverändert
- Satz abschließen; abgeschlossene Wiederholungen rückwirkend korrigieren
- Zwei bestehende Übungen während einer laufenden Einheit zu einem Supersatz verbinden
- Rundenpause verändern; gespeicherter Wert korrekt
- Während der Einheit Übung hinzufügen; ursprünglicher Plan unverändert
- Unilateral-Modus mit zwei Seitenzeilen pro Satz
- Automatische Persistierung im bestehenden Storage-Key und erneutes Rendern
- Test-Workout vollständig abschließen; Historie mit Snapshot, alter Plan weiterhin unverändert
- Beim Workout-Abschluss wird der zuvor gestartete Pausentimer geschlossen
- Veränderten Workout-Snapshot ausdrücklich als neue Planversion übernehmen; alte Versionshistorie bleibt bestehen
- Vereinfachter manueller SplitBuilder, Kraftansicht, Ernährungs-Schnellerfassung
- JavaScript-Laufzeitfehler im synthetischen Browser-Szenario: **keine**

## Offene Tests / Risiken

- End-to-End-Reload auf echter installierter PWA und echter Browser-Persistenz; in der Umgebung war direkter lokaler `file://`-/HTTP-Seitenstart gesperrt. Die Tests verwendeten einen Browser-Frame mit Storage-Simulation.
- Android-Touch- und kleine Bildschirmgrößen; Software-Tastatur und Timer-Overlay
- Import/Export eigener JSON-Backups und große Bestandsdaten
- Originalprogramme: deren ursprüngliche Spieler, Progressions- und Sessionregeln sind nicht vollständig auf die neue Inline-UX umgestellt.
- Code enthält historische legacy Physique-/Generator-Bereiche für Rückwärtskompatibilität, keine aktive neue Funktionsaufnahme.

**Ergebnis:** Feature-Abnahmekandidat für manuelle COALFORGED-Trainingspläne, noch kein gehärteter Produktionsrelease.
