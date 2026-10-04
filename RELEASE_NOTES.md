# COALFORGED 2.0.6 – Design 2.0

**Release:** 2.0.6  
**Focus:** Visual Fidelity / UX Redesign  
**Basis:** 2.0.5.1

## Was neu ist

COALFORGED 2.0.6 setzt den vollständigen Design-2.0-Pass um. Die vorhandene Trainings-, Ernährungs-, Progressions- und Storage-Logik bleibt bestehen; der Schwerpunkt dieses Releases liegt auf visueller Hierarchie, Screenflows und mobiler Bedienung.

### Splash & Onboarding
- neuer COALFORGED Splash
- First-Run-Onboarding mit drei Slides
- lokaler Onboarding-State ohne Account- oder Cloud-Zwang

### Home
- kompakte Begrüßung statt großem Slogan-Hero
- Today's Training als primäre Aktion
- kompakte Nutrition-, Progress- und Coach-Module

### Training
- neue Training-Übersicht
- Workout-Detail mit Exercise List
- fokussiertes Satzlogging für Gewicht / Wiederholungen / RIR
- Workout-Abschluss-Screen
- bestehende Kilo/Kilo-, Peter- und Revenge-Engine bleibt darunter erhalten

### Nutrition
- Today / Woche / Analyse als klarer Flow
- großer Kalorienring und kompakte Makros
- Meal Cards mit Bildern
- Food Search und Food Detail auf Mobile als fokussierte Screens
- What Fits Next? integriert
- BLS/OFF, Rezepte, Templates und Nutrition Engine bleiben erhalten

### Progress & Analyse
- neue Tabs: Übersicht / Kraft / Körper / Ernährung / Compliance
- Analyse vor Dateneingabe
- e1RM-, Gewichts-, Nutrition- und Adherence-Trends kompakt dargestellt
- bestehende Datenwerkzeuge bleiben unter Daten & Einstellungen erreichbar

### Mehr / Einstellungen
- kompakter Profilkopf
- Ziele, Körperdaten, Training, Ernährung und Coach als Listenstruktur
- App Einstellungen, Benachrichtigungen, Darstellung, Datenschutz und Hilfe
- kein Fake-Account, kein Fake-Premium-Layer

## Technik
- APP_VERSION: `2.0.6`
- Service-Worker-Cache: `coalforged-v2.0.6`
- LocalStorage-Key unverändert: `janTrainingUnifiedV1`
- Datenformat unverändert: v6
- Nutrition Schema unverändert: v2
- Bilder weiterhin direkt im Repository-Root
- persistenter BLS-Cache bleibt von SW-Cleanup ausgenommen

## Update-Hinweis
Für GitHub Pages den Inhalt des Release-ZIPs in den Repository-Root hochladen und vorhandene Dateien ersetzen. Danach die Web-App einmal neu laden bzw. das bereitgestellte PWA-Update übernehmen.
