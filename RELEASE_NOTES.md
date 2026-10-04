# COALFORGED 2.0.6.3 – Universal Exercise Registry & Exercise-State Fix

**Release:** 2.0.6.3  
**Basis:** 2.0.6.2 Cinematic Warm

## Ziel

Trainingsprogramme besitzen weiterhin ihre quellentreue Prescription (Sätze, Wiederholungen, RIR, Pausen und Progressionsregeln). Die konkrete Übung besitzt dagegen eine universelle Identität und ihre eigenen Leistungsdaten.

## Änderungen

- universelle Exercise Registry für Original- und eigene Übungen
- stabile Exercise IDs; eigene Übungen behalten ihre Identität auch beim Umbenennen
- Kilo/Kilo, Peter und Revenge referenzieren konkrete Übungen über diese Identität
- Gewichte, tatsächlich absolvierte Reps, RIR, Notizen/Cues und Verlauf werden je konkreter Übung getrennt
- Wechsel innerhalb desselben Slots übernimmt nicht mehr die Sätze/Gewichte einer anderen Übung
- Wechsel zurück auf eine zuvor verwendete Übung stellt deren eigenen Zustand wieder her
- Kilo/Kilo Progressionszustände werden künftig übungsspezifisch getrennt
- bestehende Daten werden bestmöglich in das neue Modell migriert
- alte `exerciseWeights` bleiben als Kompatibilitätsspiegel bestehen; kanonisch ist die Registry-Performance
- Übungsbibliothek zeigt die universelle Registry inklusive Originalübungen und letztem bekannten Gewicht
- Datenformat auf v7 angehoben; Nutrition Schema bleibt v2

## Schutzregeln

- Kilo/Kilo-, Peter- und Revenge-Programmlogik wurde nicht verändert.
- Sätze/Reps bleiben Eigentum der jeweiligen Program Prescription.
- Die Registry trennt Identität/Performance der Übung von der Programmlogik.
- Storage-Key bleibt `janTrainingUnifiedV1`.

## PWA

- `APP_VERSION`: `2.0.6.3`
- Service-Worker-Cache: `coalforged-v2.0.6.3`
- Datenformat: `7`
- Nutrition Schema: `2`
- Exercise Registry Schema: `1`
