# COALFORGED 2.3.3-rc1 — technischer Release-Kandidat

**Stand:** 14.10.2026  
**Basis:** genehmigte Zwischenstände 2.3.3-b2 bis -b5  
**Status:** Abnahmekandidat, **nicht veröffentlicht**. Android-, UI-, Service-Worker- und Offline-Gerätetest ausstehend.

## Enthalten

1. **Physique — Current Build only:** Current-Build-Eingaben, KFA/FFM/FFMI/nFFMI, Check-ins, Körpermaße und bestehende Statistik-/Historienfunktion erhalten. Target Build/Potential aus aktiver UI und Navigation entfernt, alte Werte bleiben archiviert/lesbar.
2. **Trainingsplanung manuell:** automatischen Split-/Archetypen-Generator und aktive TDE-Einstiege entfernt. Manueller SplitBuilder, Originalprogramme, Bennett-Builder, Templates, bestehende und historische `GENERATED`-Pläne bleiben kompatibel.
3. **Keine geplanten KI-Module:** Produktverweise Coach AI 2.5 und Nutrition AI 2.6 bereinigt. Regelbasierter Coach, Nutrition Tracker, Rezepte, Food-Library und Makrobilanz bleiben.
4. **Workout-Player:** automatisierte Runden-/Übungsnavigation für Supersatz, Trisatz, Giant Set und Zirkel; korrekte Pausen nach Übungen/Runden; seitengetrennte unilaterale Eingaben (Startseite schwächer, 0 s zwischen Seiten, 90 s solo zwischen Arbeitssätzen), manuelle Timersteuerung, Fortschritt, Verlauf, Progressionsregeln.
5. **Release-/PWA-Metadaten:** Kennung `2.3.3-rc1`, HTML-Titel berichtigt, Cache `coalforged-v2.3.3-rc1`, Master v1.46 mit dokumentiertem QA-/Freigabestatus.

## Bestandsschutz

- **LocalStorage-Schlüssel:** `janTrainingUnifiedV1` unverändert.
- **Datenformat:** v10 unverändert; kein Schema-Reset und kein Löschen gespeicherter Nutzer-/Workout-/Physique-/Nutrition-Daten durch diese RC-Metadatenkorrektur.
- **Originalprogramme und bestehende Imports:** Code gegenüber dem getesteten Block 5 bis auf Versions-/Cachebezeichnungen unverändert.
- Alte Target-, Potential- und Generator-Datensätze werden **nicht** aus vorhandenen Backups gelöscht.

## Qualitätssicherung

- Block-5-Workout: **28/28** isolierte Integrationstests bestanden.
- Block-6-Import/PWA: **20/20** isolierte Tests bestanden (einschließlich Pre-Import-Backup, Rollback und simuliertem Offline-Fallback).
- Block-6-Strukturtests: **9/9** Prüfgruppen bestanden, darunter **39/39** App-JavaScript-Blöcke syntaxvalidiert.
- Mobile Responsivität **nur statisch** (Viewport/Styles) geprüft. Ein erfolgreicher Browserstart ist wegen `ERR_BLOCKED_BY_ADMINISTRATOR` nicht nachgewiesen.

## Kein Release ohne

1. Privaten JSON-Datenexport auf dem Smartphone erstellen.
2. App auf einer Testbereitstellung/mit Testdaten im realen Android-Browser öffnen; Navigation, Forms, Timer und Statistiken verifizieren.
3. Supersatz, Zirkel, unilateral, Pause → Reload → Fortsetzen → Abschluss → History/Progression testen.
4. Live-PWA installieren, Offline-/Cacheupdate und Daten-Import-/Export-Roundtrip auf dem Gerät testen.
5. Nutzerfreigabe für Veröffentlichung erteilen. **Es ist kein GitHub-Commit und kein Live-Deployment erfolgt.**
