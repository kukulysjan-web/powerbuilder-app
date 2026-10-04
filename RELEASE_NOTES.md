# COALFORGED 2.0.6.2 – Cinematic Warm Image Treatment

**Release:** 2.0.6.2  
**Focus:** Image Treatment Feintuning  
**Basis:** 2.0.6 FINAL

## Änderung

Kleiner visueller Polish-Pass für die bereits eingebauten COALFORGED-Bilder. Die Bildwelt ist bewusst etwas weniger entsättigt und minimal präsenter, ohne die dunkle, ruhige Heritage-Forge-Hierarchie zu verändern.

### Angepasst
- Home Hero und Today's Training: etwas mehr Sättigung und Helligkeit
- Training Hero, Workout Cards und Exercise Thumbnails: leicht mehr Farbinformation und Präsenz
- Nutrition Hero und Meal Thumbnails: weniger grau, weiterhin klar untergeordnet zur Daten-UI
- More / Profil und sekundäre Atmosphärenbilder: subtil angeglichen
- Onboarding-Bildbehandlung: gleiche visuelle Sprache wie die App

### Unverändert
- Trainingslogik
- Nutrition Engine
- Coach-Logik
- Datenformat v6
- Nutrition Schema v2
- LocalStorage-Key `janTrainingUnifiedV1`
- Navigation, Layout und Screenflows

## Technik
- `APP_VERSION`: `2.0.6.2`
- Service-Worker-Cache: `coalforged-v2.0.6.2`
- keine Datenmigration
- keine neuen Assets
- bestehende Root-Bildpfade bleiben unverändert

## Update-Hinweis
Den Inhalt des ZIPs in den GitHub-Repository-Root hochladen und vorhandene Dateien ersetzen. Danach die Seite neu laden bzw. das PWA-Update übernehmen.

## 2.0.6.2 Changes

- Home, Training and Nutrition imagery is now less desaturated.
- Warm highlight treatment was increased slightly for a more cinematic forge feel.
- Meal thumbnails and training thumbnails retain more natural color.
- Background image treatment remains subdued enough to protect readability.
- Service worker cache was bumped so the update can be installed cleanly.

- Home nutrition card restores the cinematic food background.
- Home coach/insight card restores the mountain atmosphere with readable masking.

## Home image placement correction

- Nutrition background is attached directly to the Home nutrition card so it cannot disappear behind the card background.
- Mountain artwork was moved from the Coach Insight card to the Home Progress card.
- Coach Insight is image-free again.
- Version remains 2.0.6.2; this is a correction inside the same release candidate.
