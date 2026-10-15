# COALFORGED 2.4.0 UX Lab 2 — ORIGINALPROGRAMME

**STATUS: EXPERIMENTELL, NICHT RELEASE- ODER LIVE-FREIGEGEBEN. FEATURE-FREEZE NOCH NICHT ERREICHT.**

## Umgesetzt
- Originalprogramme Kilo/Kilo, Peter the Powerbuilder, Revenge of Peter und Bennett besitzen einen Adapter für den direkten Workout-Listen-Player mit jeweils allen Arbeitssätzen in einer Karte.
- Satzwerte lassen sich direkt bearbeiten. Zusätzlich können eigenständige Session-Sätze und -Übungen erfasst, Zusatzübungen ausgetauscht und Übungen spontan gruppiert werden (Supersatz/Trisatz/Giant Set/Zirkel).
- Native Programmlogik, Programmvorlagen, Trainingspläne, Phasen und gespeicherte Historie werden nicht absichtlich überschrieben. Zusätzliche Sätze erscheinen separat unter `trainingSession.cfuxOriginal` und sollen nicht automatisch native Progressionsentscheidungen verändern.
- Die historischen FSDP-Kurzprogramme sind in der bisherigen App bereits aus der aktiven Auswahl entfernt, bleiben für Bestandsdaten verfügbar.
- Kein neues Schema und kein geänderter Storage-Key. PWA-Cache Lab 2 enthält neuen Adapter.

## Kritische offene Punkte — BLOCKIERT RELEASE
1. In Browser-Automation kommt es beim Abschließen eines Originalprogramm-Satzes wiederholt zu einem Hänger. Das kann ein Adapter-Reentrancy-Problem sein. Die Ursache ist noch nicht sicher isoliert. Die native Komplettlogik wurde daher noch nicht als funktionsfähig in diesem Lab belegt.
2. Browser-Automation zum Gruppieren und anschließenden Rendern unter laufendem Originalprogramm konnte nicht vollständig erfolgreich abgeschlossen werden.
3. Trainingseinheit-Extras nach Abschluss und Persistenz in realer App-Historie sowie Korrektur-/Reload-Prüfungen sind noch nicht erfolgreich end-to-end verifiziert.
4. Der Austausch einer vorgegebenen Originalprogramm-Übung ist **bewusst gesperrt**, da dies sonst Progression falsch zuordnen könnte; Austausch von Zusatzübungen ist möglich.
5. Android-/Offline-/PWA-Tests und Tests mit persönlichen Bestandsdaten fehlen.

## Tests
- Node JS Syntaxprüfung für `cf-ux-original.js` und `cf-ux.js`: bestanden.
- Chromium: Seite lädt; 7 Original-Kilo/Kilo-Übungskarten im aktiven Sitzungsmodell nachweisbar; direkte Satzlisten werden gerendert.
- Chromium: native Satzabschluss-Brückentest **nicht bestanden / Hänger**. Kein seriöser Anspruch auf fertige Integration.
- Bestehender 2.4.0-UX-RC1-Stand wurde nicht verändert.

## Sicherheit
Nicht in das produktiv genutzte Repository hochladen. Vor jedem späteren Gerätetest kompletten JSON-Export erstellen; keine Nutzerdaten ins Repository. Den Freeze erst nach bestandenen Originalprogramm- und Bestandsdaten-Tests starten.
