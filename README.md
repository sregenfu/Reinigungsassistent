# CleanHome – Dein Reinigungs- & Haushaltsassistent

Eine moderne, lokale Web-App zur Organisation deines Haushalts – speziell zugeschnitten auf Häuser mit mehreren Etagen, offenen Wohnbereichen, unterschiedlichen Bodenbelägen (Laminat, Fliesen, Teppich), offener Treppe und Großpflanzen.

## ✨ Funktionen im Überblick

1. **📅 Putz- & Terminplaner**
   - Automatische Fälligkeiten (Täglich, alle X Tage, wöchentlich, monatlich).
   - Hervorhebung von heute fälligen und überfälligen Aufgaben.
   - Filterung nach Etagen (EG, 1. OG, 2. OG / DG, Treppe, ganzes Haus) und Bodenbelägen.
   - 1-Klick-Abhaken setzt das nächste Intervall automatisch.

2. **🏠 2D / 3D Raum- & Bodenplaner**
   - **📸 Panorama-Raumgenerator:** Weitwinkel- oder Panoramafoto hochladen, 4 Raumecken anpassen – der Raum wird automatisch mit $50\,\text{m}^2$, echten Bodenbelägen und Fensterfronten in 2D und 3D erzeugt.
   - **📸 Echte Foto-Oberflächen (Kamera / Datei):** Jedes Zimmer (Boden), jede Wand (Tapete) und jedes Möbelstück (Couch-Stoff, Esstisch-Holz, Teppich) kann mit einem echten Foto versehen werden. Mit dem quadratischen Cropper wählst du einen Ausschnitt, der in 2D und 3D nahtlos gekachelt wird. Inklusive Vorlagen für Eichenholz, Marmor, Berber-Wolle und Polsterstoff.
   - **Reale Raumaufteilung:** Ein zusammenhängender $50\,\text{m}^2$ großer Hauptraum (Wohn- und Esszimmer auf Laminat mit integrierter Fliesen-Küchenzone), separater Eingangsflur und Gäste-WC.
   - **🧱 Wände einziehen:** Eigenes Wand-Werkzeug in der Toolbar sowie horizontale & vertikale Trennwände im Auswahlpool, um Räume exakt zu unterteilen. In 3D werden massive Wände gerendert.
   - **🪜 Treppen zwischen Etagen:** Treppen verfügen nun über Ziel-Etagen (z. B. *EG $\rightarrow$ 1. OG* oder *1. OG $\rightarrow$ 2. OG / DG*), Richtungsanzeige (Auf- / Abwärts) und führen in 3D durchgängig in die nächste Etage.
   - **🏢 Komplette Hausansicht (3D):** Im 3D-Modus gibt es den Button **🏢 Gesamtes Haus (3D)**, der alle 3 Stockwerke mit Decken, Wänden, Treppenläufen und Möbeln gleichzeitig übereinander darstellt. Inklusive echtem Giebeldach mit Dachstuhl und Ein-/Ausschalt-Taste (**🏠 Dach: An / Aus**) zum Hineinblicken.
   - **Variable $\text{m}^2$ & Umrisse:** 8 Anfasser an Ecken und Kanten zum Verziehen von Räumen und Möbeln; Maßeingabe direkt in Metern oder $\text{m}^2$.
   - **🛋️ Möbel- & Elementpool:** Designer L-Eckcouch, Esstisch mit 6 Stühlen, Kochinsel, Waschtisch, Hänge-WC, Fenster, Türen mit Anschlag und Großpflanzen.

3. **📱 Handy- & Tablet-App (PWA & Kamera):**
   - Als **Progressive Web App** direkt auf dem Smartphone oder Tablet installierbar (Home-Bildschirm).
   - Öffnet im Vollbildmodus ohne Browserleiste und greift direkt auf die Handykamera zu.

4. **🌿 Pflanzenmanager**
   - Tracking von Gieß- und Düngeterminen für Großpflanzen (z. B. Ficus, Monstera, Palmen).
   - Eigener Hinweis für Laubabwurf (Blätter regelmäßig aufsaugen/absammeln).
   - Schnelle Erledigung per "Gegossen" / "Gedüngt"-Button.

4. **🛒 Einkaufsliste für Haushaltsbedarf**
   - Schnellauswahl-Chips für Reinigungsmittel (Laminatpflege, Gallseife, Badreiniger, Dünger, Staubsaugerbeutel).
   - Eigene Artikel hinzufügen und abhaken.

5. **💡 Flecken- & Putzkompass**
   - Durchsuchbare Erste-Hilfe-Datenbank für Flecken: Rotwein, Fett, Kerzenwachs, Kaffee, Pflanzenerde, Urin, Kalk.
   - Spezifische Anleitungen je nach Untergrund (Teppich, Laminat, Fliesen, Polster).

6. **💾 Speicher & Datensicherheit**
   - Speichert automatisch im Browser (`localStorage`).
   - Export- und Importfunktion als JSON-Datei.
   - Taste "Muster-Haus laden" zum sofortigen Start mit vorkonfiguriertem Grundriss.

## � Auf dem iPhone / iPad installieren (Ohne Mac & ohne App Store)

### Option 1: Im selben WLAN (1-Klick Start)
1. Mache am Windows-PC einen Doppelklick auf die Datei [start-handy-server.bat](start-handy-server.bat) (oder führe `node server.js` aus).
2. Öffne **Safari** auf deinem iPhone oder iPad und rufe die angezeigte Adresse auf:
   ```text
   http://192.168.178.75:3000
   ```
3. Tippe in Safari unten auf das **Teilen-Symbol** (Viereck mit Pfeil nach oben) $\rightarrow$ **„Zum Home-Bildschirm“**.
4. Die App startet nun wie eine native App im Vollbildmodus ohne Browserleiste und unterstützt Finger-/Touch-Gesten sowie Kamera-Upload.

### Option 2: Dauerhaft online über GitHub Pages
Das Projekt enthält bereits den automatischen GitHub-Pages-Workflow [.github/workflows/deploy-pages.yml](.github/workflows/deploy-pages.yml). Sobald du das Repository pushst, ist die App unter deiner kostenlosen GitHub-URL erreichbar und kann weltweit auf jedem Smartphone installiert werden.

### Option 3: Natives iOS-Projekt (mit Apple RoomPlan / LiDAR)
Im Ordner `ios-plugin` befindet sich die Swift-Bridge `CleanHomeRoomPlanPlugin.swift` und die Konfiguration `capacitor.config.ts`. Falls du später die native Apple-LiDAR-API für automatischen 3D-Raumscan kompilieren möchtest, kann das über einen kostenlosen Cloud-Build-Dienst (z. B. GitHub Actions mit macOS-Runner) erfolgen – ganz ohne physisches MacBook.
