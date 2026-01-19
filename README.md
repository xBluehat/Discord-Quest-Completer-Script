# 🎮 Discord-Quest-Completer-Script

A specialized JavaScript script designed to automate the completion of Discord Quests (Drops). This script injects directly into the Discord client (Web or Desktop) via the developer console, interacting with internal Webpack modules and Flux stores to simulate game activity, streaming, and video watching.

> **⚠️ DISCLAIMER**  
> This script is for **educational and research purposes only**.  
> Using this script technically constitutes "self-botting" and interacts with internal Discord APIs in unauthorized ways. It may violate Discord's Terms of Service. **Use at your own risk.** The author is not responsible for any account bans or restrictions.

## ✨ Features

*   **Zero Dependencies:** Runs directly in the browser/client console.
*   **Comprehensive Support:** Handles all major quest types:
    *   `WATCH_VIDEO` & `WATCH_VIDEO_ON_MOBILE`
    *   `PLAY_ON_DESKTOP` (Mocks game processes)
    *   `STREAM_ON_DESKTOP` (Mocks stream metadata)
    *   `PLAY_ACTIVITY` (Embedded Activities)
*   **Visual Feedback:** Provides a clean, color-coded CLI output with real-time progress bars in the DevTools console.
*   **Auto-Detection:** Automatically finds active, enrolled quests and processes them sequentially.

## 🚀 How to use this script

1.  Accept a quest under **Discover -> Quests**.
2.  Press `Ctrl+Shift+I` to open **DevTools**.
3.  Go to the **Console** tab.
4.  Paste the code from `Discord-Quest-Completer-Script.js` and hit enter.
    
    > **Note:** If you're unable to paste into the console, you might have to type `allow pasting` and hit enter first.

5.  Follow the printed instructions depending on what type of quest you have:
    *   If your quest says to **"play"** the game or **watch a video**, you can just wait and do nothing.
    *   If your quest says to **"stream"** the game, join a VC with a friend or alt and stream *any* window.
6.  Wait a bit for it to complete the quest.
7.  You can now claim the reward!

You can track the progress by looking at the `Quest progress:` prints in the Console tab, or by looking at the progress bar in the quests tab.

## 🛠️ How it Works

The script leverages Discord's internal architecture:

1.  **Webpack Interception:** It accesses `webpackChunkdiscord_app` to retrieve internal modules (the "Require" function).
2.  **Store Retrieval:** It searches for specific Flux Stores (`RunningGameStore`, `ApplicationStreamingStore`, `QuestsStore`) to fetch status and inject data.
3.  **Process Mocking:**
    *   For **Gaming Quests**, it overrides `getRunningGames` to return a fake game object matching the Quest's Application ID.
    *   For **Video Quests**, it calculates the required watch time and sends progress updates to the API endpoints directly.
