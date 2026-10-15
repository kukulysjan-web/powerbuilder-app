# COALFORGED 2.3.3-b5 – Workout Player

**Zwischenstand / Block 5** – folgt auf den genehmigten Block 4, noch nicht freigegeben für Block 6 oder Live-Deployment.

### Änderungen

- Satzgruppen (Supersätze, Trisätze, Giant Sets, Zirkel) laufen im Program-Engine-Workout in definierter Reihenfolge.
- Satzgruppen berücksichtigen individuelle, tatsächlich aktive Satzmengen; erledigte Übungen werden nicht wiederholt.
- Vorher fehlerhaft unterdrückter Runden-Timer repariert; nur ein Timer pro Übergang.
- Separat einstellbare Pausen zwischen Übungen/Seiten und nach einer vollständigen Runde; freie Pausen bleiben bedienbar.
- Persistenter Rest-Timer bei Pause/Resume und Reload, einschließlich manuell angehaltener Timer.
- Workout-Status nennt bereits erfasste Sätze und nächsten Schritt.
- Unilateral: linke/rechte Seite eigenständig, vollständiger Satz nur nach beiden Seiten, Teil-Sätze separat markiert.
- Per-Seite-Historie speichert alle vollständigen Sätze, kein versehentliches automatisches Gewichts-Upgrade.
- Neue read-only Trainingshistorie für manuelle Program-Engine-Pläne, inklusive Links-/Rechts-Werten aus der gespeicherten Planversion.
- Zwischenversion und Offline-Cache auf `2.3.3-b5` angehoben.

### Bestandsschutz

- **Keine Änderung an Key oder Datenformat** (`janTrainingUnifiedV1`, Schema v10).
- Physique Current Build, regelbasierter Coach, Nutrition Tracker, manueller SplitBuilder, Originalprogramme und gespeicherte Pläne/Verläufe bleiben erhalten.
- Keine Arbeit an Block 6 und keine Veröffentlichung auf GitHub/Live-App.

### Tests

28/28 Integrationstests erfolgreich; 39/39 Script-Syntaxprüfungen. **Android-/Browser-UI/PWA-Test offen**, da Browserstart durch Umgebungsrichtlinie blockiert. Siehe `BLOCK5_TEST_REPORT.md`.
