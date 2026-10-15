# Release-Anleitung – 2.3.3-rc1

**Aktueller Status:** Nicht veröffentlicht; der nachfolgende Ablauf ist ausschließlich für eine später genehmigte Veröffentlichung gedacht.

1. **Privates JSON-Backup der echten Nutzerdaten** direkt aus COALFORGED exportieren. Das Release-ZIP enthält keine persönlichen Nutzerdaten.
2. **Testbranch/Testbereitstellung:** komplette Web-App aus dem Release-ZIP bereitstellen. Nötig sind besonders `index.html`, `sw.js`, `manifest.json`, `.nojekyll`, Icons und alle `.webp`-/`.svg`-Assets. Nicht nur die HTML-Datei ersetzen.
3. **Android-/PWA-Abnahme:** `RC1_MOBILE_ABNAHME.md` abarbeiten, einschließlich echtem Reload, Offline und Export/Import.
4. **Live-Freigabe** gesondert erteilen. Erst danach die geprüften Webdateien auf GitHub `main` hochladen. QA-Dokumente und historisches Referenzmaterial können im Repository bleiben, sind für die laufende App jedoch nicht erforderlich.
5. **Nach Deployment:** Seite hart aktualisieren und ggf. PWA komplett schließen/neustarten, auf korrekten Cache warten und Start/Workout/History nochmals prüfen.

## Rückfall

- Vor Live-Änderung den aktuellen GitHub-Commit/Branch und ein vollständiges öffentliches Code-Backup sichern. Letzte in dieser Sitzung gelesene GitHub-Referenz: `20dbd4296d3f625dbc74d38f2723bcf959124ef9` (Stand des früheren Checkpoints; vor Deploy erneut prüfen).
- Bei App-Fehlern die **zuvor laufenden Web-Dateien einschließlich `sw.js`** aus dem gesicherten Commit wiederherstellen, dann Browser/PWA auf erneutes Laden überprüfen. Keinesfalls Nutzerdaten löschen oder den LocalStorage zurücksetzen.
- Bei Datenproblem: App-Import nur nach privatem Backup und auf Testkopie prüfen; persönliches Backup niemals nach GitHub hochladen.

**GitHub-Upload:** https://github.com/kukulysjan-web/powerbuilder-app/upload/main

**Live-Adresse:** https://kukulysjan-web.github.io/powerbuilder-app/ (RC1 dort noch nicht veröffentlicht)
