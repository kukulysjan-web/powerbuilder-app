# COALFORGED 2.4.0 UX – Release Candidate 1

Status: **lokaler Integrationstest / Abnahmekandidat**, **kein Feature-Freeze**, **nicht live veröffentlicht**.
Basis: unverändertes 2.3.3-RC1-Paket; die bisherigen persönlichen Daten werden nicht in dieses ZIP exportiert.

## Implementierte UX-Änderungen

1. **Startseite:** fokussierter Trainingseinstieg, Ernährungsstatus und Gewicht, vier Hauptnavigationseinträge (Heute / Training / Ernährung / Mehr).
2. **Manueller SplitBuilder:** eine direkt bearbeitbare Liste aus Trainingstagen und Übungen, mit Inline-Feldern für Sätze/Wiederholungen/RIR/Pause; bestehende Planbibliothek, Satzgruppen-Konfiguration und erweiterte Einstellungen bleiben erreichbar.
3. **Aktiver Workout-Player für COALFORGED-Engine-Pläne:** alle Sätze einer Übung in einer Karte; kg, Wdh. und RIR direkt editierbar, auch nach Abschluss; Sätze hinzufügen und letzten Satz entfernen; Übungen hinzufügen, austauschen, umsortieren oder entfernen; Supersätze, Trisätze, Giant Sets und Zirkel spontan erstellen; Pausenzeiten ändern; Links-/Rechts-Tracking innerhalb einer Karte. Änderungen bleiben zunächst in der **Session-Kopie**. Die Vorlage wird nicht automatisch geändert.
4. **Planübernahme:** Nach abgeschlossener Einheit kann die veränderte Trainingsstruktur ausdrücklich als **neue Planversion** gespeichert werden. Vorherige Pläne/Versionen/Historie bleiben erhalten.
5. **Physique:** Gewicht als zentrale Kennzahl; Messpunkte und bereinigte, rückblickende 7-Kalendertage-Kurve; Zeiträume 4W, 3M, 6M, alle; Messpunktbearbeitung; übrige Current-Build-Statistiken/Körpermaße in aufklappbaren Details. Datenbasis ist `state.physique`, nicht Demodaten.
6. **Fortschritt:** vier große Kraftkennzahlen/e1RM; erweiterte Analyse in einer aufklappbaren Ansicht.
7. **Ernährung:** sofort erreichbare Aktionen „Lebensmittel“ und „Tageswerte“; bestehende Mahlzeiten, Favoriten, Rezepte, Makros und Verlauf unangetastet.
8. **Coach / Commitment:** kein neuer Coach-Bereich oder KI-Modul. Keine neue Commitment-/Lock-/Unlock-Funktion. Vorhandene regelbasierte Programme bleiben unverändert.
9. **PWA:** Cache auf `coalforged-v2.4.0-ux-rc1` angehoben; neue `cf-ux.js` und `cf-ux.css` werden offline vorgehalten.

## Unveränderte Daten und Grundregeln

- `janTrainingUnifiedV1`, Datenformat, vorhandene Originalprogramme und deren Progressionsregeln sind unverändert.
- Der technische Plan-Snapshot des laufenden Workouts ist getrennt von der gespeicherten Planversion.
- Bestands-Target/Potential-Daten bleiben archiviert, werden nicht aktiv ausgewertet oder gelöscht.
- Alte historische `GENERATED`-Pläne werden nicht gelöscht.

## Einschränkungen vor Feature-Freeze

- **Originalprogramme (Kilo/Kilo, Peter, Revenge, Bennett und FSDP-Sonderprogramme)** besitzen noch ihre geschützten bisherigen Workout-Player. Die neue spontane Bearbeitung ist hier **noch nicht** durchgängig integriert. Es wäre gefährlich, die Plan-/Progressionsregeln ohne programmeigene Tests zu überschreiben.
- Vollständige reale Android-/PWA-/Offline-/Import-/Export-Regression und UX-Tests mit deinen eigenen Daten stehen aus. Synthetische Browserprüfungen ersetzen diese nicht.
- Kein automatischer GitHub-Upload und keine Live-Veröffentlichung. Den Feature-Freeze bitte erst nach Lückenschluss und Praxistest durchführen.

## Für die spätere Veröffentlichung

Beim manuellen GitHub-Upload müssen mindestens folgende **vier** Dateien ersetzt/neu hinzugefügt werden:
`index.html`, `cf-ux.js`, `cf-ux.css`, `sw.js`.
Bei einem kompletten Repository-Upload die restlichen Assets nicht löschen. Vorher private lokale Daten per App-Export sichern (niemals auf GitHub hochladen).
