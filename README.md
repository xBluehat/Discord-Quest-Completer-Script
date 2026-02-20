<!-- 
  Language Selection / Sprachauswahl 
-->
<div align="center">

# 🎮 Discord-Quest-Completer-Script

[![English](https://img.shields.io/badge/Language-English-blue)](#-english) [![Deutsch](https://img.shields.io/badge/Sprache-Deutsch-red)](#-deutsch)

</div>

---

<a name="english"></a>
## 🇺🇸 English

A specialized JavaScript script designed to automate the completion of Discord Quests (Drops). This script injects directly into the Discord client (Web or Desktop) via the developer console, interacting with internal Webpack modules and Flux stores to simulate game activity, streaming, video watching, and embedded activities.

> **⚠️ DISCLAIMER**  
> This script is for **educational and research purposes only**.  
> Using this script technically constitutes "self-botting" and interacts with internal Discord APIs in unauthorized ways. It may violate Discord's Terms of Service. **Use at your own risk.** The author is not responsible for any account bans or restrictions.

### ✨ Features

*   **Zero Dependencies:** Runs directly in the browser/client console.
*   **Comprehensive Support:** Handles all major quest types:
    *   `WATCH_VIDEO` & `WATCH_VIDEO_ON_MOBILE`
    *   `PLAY_ON_DESKTOP` (Mocks game processes)
    *   `STREAM_ON_DESKTOP` (Mocks stream metadata)
    *   `PLAY_ACTIVITY` (Embedded Activities)
*   **Visual Feedback:** Provides a clean, color-coded CLI output with real-time progress bars in the DevTools console.
*   **Auto-Detection:** Automatically finds active, enrolled quests and processes them sequentially.
*   **Multi-Build Compatibility:** Dynamic module discovery supports various Discord client builds (e.g., Stable, PTB, Canary) by scanning multiple export structures.

### 🚀 How to use this script

1.  Accept a quest under **Discover -> Quests**.
2.  Enable Developer Mode if using the Desktop App:
    *   Add `"DANGEROUS_ENABLE_DEVTOOLS_ONLY_ENABLE_IF_YOU_KNOW_WHAT_YOURE_DOING": true` to `%appdata%/discord/settings.json`.
3.  Press `Ctrl+Shift+I` to open **DevTools**.
4.  Go to the **Console** tab.
5.  Paste the code from `Discord-Quest-Completer-Script.js` and hit enter.
    > **Note:** If you're unable to paste into the console, type `allow pasting` and hit enter first.
6.  The script will automatically detect and complete your quest. Depending on the type:
    *   **Play/Watch Quests:** Just wait, the script simulates the game/video logic.
    *   **Activity Quests:** Just wait, the script simulates activity heartbeats in a voice channel.
    *   **Stream Quests:** You must join a Voice Channel (VC) with a friend/alt and **stream any window**. The script handles the rest by mocking the specific game stream metadata.
7.  Wait for the progress bar to fill and claim your reward!

### 🛠️ How it Works

The script leverages Discord's internal architecture to simulate user actions:

1.  **Webpack Interception:** It intercepts `webpackChunkdiscord_app` to retrieve the internal `require` function, allowing access to Discord's modules.
2.  **Dynamic Store Retrieval:** It locates critical Flux Stores (`RunningGameStore`, `ApplicationStreamingStore`, `QuestsStore`) using a robust fallback system compatible with multiple Discord versions.
3.  **Task Automation & Mocking:**
    *   **Gaming (`PLAY_ON_DESKTOP`):** Overrides `getRunningGames` to inject a fake running process that matches the Quest's Application ID.
    *   **Streaming (`STREAM_ON_DESKTOP`):** Overrides `getStreamerActiveStreamMetadata` to make Discord believe you are streaming the required game, even if you are just sharing a Notepad window.
    *   **Activities (`PLAY_ACTIVITY`):** Locates a valid Voice Channel and sends direct API heartbeats (`/quests/{id}/heartbeat`) with a generated stream key, simulating an active Embedded Activity session.
    *   **Video (`WATCH_VIDEO`):** Calculates the necessary watch time and sends precise progress updates to the API endpoints, bypassing actual playback.

---

<br>

<a name="deutsch"></a>
## 🇩🇪 Deutsch

Ein spezialisiertes JavaScript-Skript zur Automatisierung von Discord Quests (Drops). Dieses Skript injiziert sich über die Entwicklerkonsole direkt in den Discord-Client (Web oder Desktop) und interagiert mit internen Webpack-Modulen und Flux-Stores, um Spielaktivitäten, Streams, das Ansehen von Videos und Embedded Activities zu simulieren.

> **⚠️ HAFTUNGSAUSSCHLUSS**  
> Dieses Skript dient ausschließlich **Bildungs- und Forschungszwecken**.  
> Die Nutzung stellt technisch gesehen "Self-Botting" dar und greift auf nicht autorisierte Weise auf interne Discord-APIs zu. Dies kann gegen die Nutzungsbedingungen von Discord verstoßen. **Nutzung auf eigene Gefahr.** Der Autor haftet nicht für Kontosperrungen oder Einschränkungen.

### ✨ Funktionen

*   **Keine Abhängigkeiten:** Läuft direkt in der Konsole des Browsers/Clients.
*   **Umfassende Unterstützung:** Beherrscht alle gängigen Quest-Typen:
    *   `WATCH_VIDEO` & `WATCH_VIDEO_ON_MOBILE`
    *   `PLAY_ON_DESKTOP` (Simuliert Spielprozesse)
    *   `STREAM_ON_DESKTOP` (Simuliert Stream-Metadaten)
    *   `PLAY_ACTIVITY` (Embedded Activities)
*   **Visuelles Feedback:** Bietet eine saubere, farbcodierte CLI-Ausgabe mit Echtzeit-Fortschrittsbalken in der DevTools-Konsole.
*   **Automatische Erkennung:** Findet automatisch aktive, angenommene Quests und arbeitet diese nacheinander ab.
*   **Multi-Build Kompatibilität:** Dynamische Modulsuche unterstützt verschiedene Discord-Versionen (z. B. Stable, PTB, Canary) durch Scannen verschiedener Export-Strukturen.

### 🚀 Verwendung des Skripts

1.  Nimm eine Quest unter **Entdecken -> Quests** an.
2.  Aktiviere den Entwicklermodus (falls du die Desktop-App nutzt):
    *   Füge `"DANGEROUS_ENABLE_DEVTOOLS_ONLY_ENABLE_IF_YOU_KNOW_WHAT_YOURE_DOING": true` in die Datei `%appdata%/discord/settings.json` ein.
3.  Dücke `Strg+Umschalt+I`, um die **DevTools** zu öffnen.
4.  Wechsle zum Reiter **Konsole**.
5.  Füge den Code aus `Discord-Quest-Completer-Script.js` ein und drücke Enter.
    > **Hinweis:** Falls du nichts einfügen kannst, tippe zuerst `allow pasting` ein und bestätige mit Enter.
6.  Das Skript erkennt und erledigt die Quest automatisch. Je nach Typ:
    *   **Play/Watch Quests:** Einfach warten, das Skript simuliert das Spiel oder Video.
    *   **Activity Quests:** Einfach warten, das Skript simuliert die Aktivität in einem Sprachkanal.
    *   **Stream Quests:** Du musst einem Sprachkanal (VC) mit einem Freund/Zweitaccount beitreten und **irgendein Fenster streamen**. Das Skript manipuliert die Metadaten so, dass es wie das geforderte Spiel aussieht.
7.  Warte, bis der Ladebalken voll ist, und hole dir deine Belohnung ab!

### 🛠️ Funktionsweise

Das Skript nutzt die interne Architektur von Discord, um Nutzeraktionen zu simulieren:

1.  **Webpack Interception:** Es greift auf `webpackChunkdiscord_app` zu, um die interne `require`-Funktion abzufangen und Zugriff auf Discord-Module zu erhalten.
2.  **Dynamische Store-Suche:** Es findet kritische Flux-Stores (`RunningGameStore`, `ApplicationStreamingStore`, `QuestsStore`) über ein robustes Fallback-System, das mit verschiedenen Discord-Versionen kompatibel ist.
3.  **Task-Automatisierung & Simulation:**
    *   **Gaming (`PLAY_ON_DESKTOP`):** Überschreibt `getRunningGames`, um einen gefälschten laufenden Prozess einzuschleusen, der der Application-ID der Quest entspricht.
    *   **Streaming (`STREAM_ON_DESKTOP`):** Überschreibt `getStreamerActiveStreamMetadata`. Dadurch glaubt Discord, du würdest das geforderte Spiel streamen, selbst wenn du nur ein Notepad-Fenster teilst.
    *   **Activities (`PLAY_ACTIVITY`):** Sucht einen gültigen Sprachkanal und sendet direkte API-Heartbeats (`/quests/{id}/heartbeat`) mit einem generierten Stream-Key, um eine aktive Session zu simulieren.
    *   **Video (`WATCH_VIDEO`):** Berechnet die benötigte Zeit und sendet präzise Fortschritts-Updates direkt an die API, ohne das Video tatsächlich abzuspielen.
