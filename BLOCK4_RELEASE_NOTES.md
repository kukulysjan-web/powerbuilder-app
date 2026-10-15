# COALFORGED 2.3.3 – Block 4: KI-Bereinigung

**Datum:** 14.10.2026
**Status:** Abnahmekandidat `2.3.3-b4`, nicht live, keine Gesamtfreigabe.
**Basis:** vom Nutzer abgenommener Block 3 `2.3.3-b3` (manueller SplitBuilder, Physique Current Build).

## Bestandsaufnahme
Im abgenommenen Block-3-Code sind **keine ausführbaren Coach-AI-2.5- oder Nutrition-AI-2.6-Funktionen, KI-Dienstanbindungen oder aktive Release-Menüpunkte** vorhanden. Es wurde daher kein existierender KI-Algorithmus abgeschaltet oder durch eine andere Entscheidungslogik ersetzt.

## Entfernt / geändert
- Ungenutztes `adaptiveCoachInterface:{active:false,...}` aus **neu erzeugten** Program-Engine-Modul-Katalogen entfernt. Alte Plan-Versionen inklusive vorhandener `modules.adaptiveCoachInterface` bleiben unangetastet und lesbar.
- Missverständlichen KI-Wortlaut aus dem Nutrition-Vorschlagsdialog entfernt; die bestehenden Makro-/Restwert-Vorschläge werden klar als deterministische Rechnung erläutert.
- Die aktive Hilfe erklärt Readiness, Coaching und Ernährungsvorschläge als regelbasiert.
- `README.md` und `reference_specs/ACTIVE_SCOPE.md` dokumentieren, dass **2.5 Coach AI** und **2.6 Nutrition AI** nicht zum Produktumfang gehören. Historische Spezifikationen wurden als Archiv bewahrt, aber nicht mehr zur aktiven Roadmap erhoben.
- Versionsmarker `2.3.3-b4` in `index.html`, `manifest.json` und PWA-Cache `sw.js`. Keine Änderung am Storage-Format.

## Bestandsschutz / nicht angerührt
- Rule-based Readiness, Coach-Anpassungen, Wochenreflexion, Kontext-/Re-Entry-Logik, Program Engine und Progression.
- Nutrition Tracker, Lebensmittelbibliothek, Mahlzeiten/Rezepte, Makros, Trendlogik und rechnerische Vorschläge.
- Manueller SplitBuilder, Originalprogramme, Templates, Satzgruppen, Zirkel, Unilateral (Workout-Player-Abnahmetest bleibt **Block 5**).
- Physique Current Build, Check-ins und alle historischen Nutzerdaten.
- LocalStorage-Key `janTrainingUnifiedV1`, Schema v10, Nutzerpläne einschließlich `GENERATED` und ältere Plan-`modules`.

## Tests
22/22 isolierte statische/VM-Funktionstests bestanden. Alle 38 inline App-JavaScript-Blöcke sowie `sw.js` erfolgreich kompiliert; abschnittsweise Quellcode-/Hash-Vergleiche mit Block 3 bestätigen unveränderte geschützte Komponenten. Browser-Start mit `page.set_content(..., wait_until='domcontentloaded')` in Testumgebung nach 20 Sekunden Timeout; daher **kein** realer Android-/Offline-PWA-/Import-Export-End-to-End-Test und keine Behauptung vollständiger Live-Freigabe. Echte lokale Nutzerdaten standen den Tests nicht zur Verfügung.

## Freigabe und Rollback
Keine GitHub-Schreiboperation, kein Deployment und keine produktiven Nutzer-Datenänderungen durchgeführt. Für Rollback das abgenommene `COALFORGED_2.3.3_BLOCK3_MANUAL_ONLY.zip` wieder ausrollen (persönliche Daten separat per JSON-Export sichern). **Block 5 nicht begonnen** – ausschließlich nach erneuter ausdrücklicher Freigabe.
