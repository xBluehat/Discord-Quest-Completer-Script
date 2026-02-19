/**
 * Discord Quest Completer - Automated Script
 * 
 * This script interacts with Discord's internal Webpack modules to automate
 * the completion of "Quests" (Drops). It supports Video, Gameplay, and Streaming tasks.
 * 
 * WARNING: This script uses internal APIs. Use at your own risk.
 */

// Clear console for a clean output state on start
console.clear();

// ============================================================================
// UTILITIES & LOGGING
// ============================================================================

/**
 * Logger utility to provide formatted, color-coded output in the DevTools console.
 * Uses CSS styling for better readability.
 */
const logger = {
    log: (msg, color = "#00b0f4") => console.log(`%c[QuestBot] %c${msg}`, "color: #7289da; font-weight: bold; background: #2c2f33; padding: 2px 5px; border-radius: 3px;", `color: ${color}; font-weight: bold;`),
    info: (msg) => console.log(`%c ℹ️ %c${msg}`, "font-size: 14px;", "color: #b9bbbe;"),
    success: (msg) => console.log(`%c ✅ %c${msg}`, "font-size: 14px;", "color: #43b581; font-weight: bold;"),
    warn: (msg) => console.log(`%c ⚠️ %c${msg}`, "font-size: 14px;", "color: #faa61a;"),
    /**
     * Renders a visual progress bar in the console.
     * @param {number} current - Current progress (seconds)
     * @param {number} total - Target progress (seconds)
     */
    bar: (current, total) => {
        const percentage = Math.min(100, (current / total) * 100);
        const filled = Math.floor(percentage / 5); // 20 segments total
        const empty = 20 - filled;
        const bar = "█".repeat(filled) + "░".repeat(empty);
        const color = percentage >= 100 ? "#43b581" : "#00b0f4";
        console.log(`%c[${bar}] %c${percentage.toFixed(1)}% %c(${current}/${total}s)`, `color: ${color}; font-family: monospace;`, `color: ${color}; font-weight: bold;`, "color: #72767d;");
    }
};

logger.log("Initializing script...", "white");

// ============================================================================
// WEBPACK INJECTION & MODULE RETRIEVAL
// ============================================================================

// Remove existing jQuery reference if present to avoid conflicts
delete window.$;

let wpRequire;

// Attempt to intercept the Webpack chunk loader to expose the 'require' function.
// This allows us to import internal Discord modules dynamically.
try {
    wpRequire = webpackChunkdiscord_app.push([[Symbol()], {}, r => r]);
    webpackChunkdiscord_app.pop(); // Clean up the stack
} catch (e) {
    logger.warn("Could not retrieve webpackChunkdiscord_app. Are you running this in the Discord Client or Web App?");
}

/**
 * Helper to find a specific module within Webpack's cache.
 * @param {Function} filter - Predicate function to identify the module.
 */
const getModule = (filter) => {
    const found = Object.values(wpRequire.c).find(x => x?.exports && filter(x.exports));
    return found ? found.exports : null;
};

// Define variables for internal Stores
let ApplicationStreamingStore, RunningGameStore, QuestsStore, ChannelStore, GuildChannelStore, FluxDispatcher, api;

try {
    // 1. Try finding modules using the "Working" selectors provided (A/Ay/h/Bo + proto property)
    const findModule = (filter) => Object.values(wpRequire.c).find(x => filter(x));

    ApplicationStreamingStore = findModule(x => x?.exports?.A?.proto?.getStreamerActiveStreamMetadata)?.exports?.A;
    RunningGameStore = findModule(x => x?.exports?.Ay?.getRunningGames)?.exports?.Ay;
    QuestsStore = findModule(x => x?.exports?.A?.proto?.getQuest)?.exports?.A;
    ChannelStore = findModule(x => x?.exports?.A?.proto?.getAllThreadsForParent)?.exports?.A;
    GuildChannelStore = findModule(x => x?.exports?.Ay?.getSFWDefaultChannel)?.exports?.Ay;
    FluxDispatcher = findModule(x => x?.exports?.h?.proto?.flushWaitQueue)?.exports?.h;
    api = findModule(x => x?.exports?.Bo?.get)?.exports?.Bo;

    // 2. If not found, fallback to Standard/Previous structures (Z/ZP, __proto__)
    if (!ApplicationStreamingStore || !QuestsStore || !api) {
        logger.info("New selectors failed, trying fallbacks...");

        if (!ApplicationStreamingStore) ApplicationStreamingStore = findModule(x => x?.exports?.Z?.__proto__?.getStreamerActiveStreamMetadata)?.exports?.Z;
        if (!RunningGameStore) RunningGameStore = findModule(x => x?.exports?.ZP?.getRunningGames)?.exports?.ZP;
        if (!QuestsStore) QuestsStore = findModule(x => x?.exports?.Z?.__proto__?.getQuest)?.exports?.Z;
        if (!ChannelStore) ChannelStore = findModule(x => x?.exports?.Z?.__proto__?.getAllThreadsForParent)?.exports?.Z;
        if (!GuildChannelStore) GuildChannelStore = findModule(x => x?.exports?.ZP?.getSFWDefaultChannel)?.exports?.ZP;
        if (!FluxDispatcher) FluxDispatcher = findModule(x => x?.exports?.Z?.__proto__?.flushWaitQueue)?.exports?.Z;
        if (!api) api = findModule(x => x?.exports?.tn?.get)?.exports?.tn;
    }

    // 3. Last resort fallback (A/Ay/h/Bo but with __proto__)
    if (!ApplicationStreamingStore || !QuestsStore || !api) {
        if (!ApplicationStreamingStore) ApplicationStreamingStore = findModule(x => x?.exports?.A?.__proto__?.getStreamerActiveStreamMetadata)?.exports?.A;
        if (!RunningGameStore) RunningGameStore = findModule(x => x?.exports?.Ay?.getRunningGames)?.exports?.Ay; // Often same as new check
        if (!QuestsStore) QuestsStore = findModule(x => x?.exports?.A?.__proto__?.getQuest)?.exports?.A;
        if (!ChannelStore) ChannelStore = findModule(x => x?.exports?.A?.__proto__?.getAllThreadsForParent)?.exports?.A;
        if (!GuildChannelStore) GuildChannelStore = findModule(x => x?.exports?.Ay?.getSFWDefaultChannel)?.exports?.Ay;
        if (!FluxDispatcher) FluxDispatcher = findModule(x => x?.exports?.h?.__proto__?.flushWaitQueue)?.exports?.h;
        if (!api) api = findModule(x => x?.exports?.Bo?.get)?.exports?.Bo;
    }

    if (!QuestsStore || !api) {
        throw new Error("Critical modules could not be found.");
    }

    logger.success("Internal Discord modules loaded successfully.");
} catch (e) {
    logger.warn("Failed to load modules. Discord might have updated their internal structure.");
    console.error(e);
}

// ============================================================================
// QUEST LOGIC & CONFIGURATION
// ============================================================================

const supportedTasks = ["WATCH_VIDEO", "PLAY_ON_DESKTOP", "STREAM_ON_DESKTOP", "PLAY_ACTIVITY", "WATCH_VIDEO_ON_MOBILE"];

// Retrieve and filter active quests from the QuestsStore
// Criteria: Enrolled, Not Completed, Not Expired, Supported Task Type
let quests = [...QuestsStore.quests.values()].filter(x =>
    x.userStatus?.enrolledAt &&
    !x.userStatus?.completedAt &&
    new Date(x.config.expiresAt).getTime() > Date.now() &&
    supportedTasks.find(y => Object.keys((x.config.taskConfig ?? x.config.taskConfigV2).tasks).includes(y))
);

// Check if running in Native App (Desktop) or Browser
let isApp = typeof DiscordNative !== "undefined";

if (quests.length === 0) {
    logger.info("No active, uncompleted quests found. Please check your Gift Inventory settings.");
} else {
    logger.log(`Starting processing for ${quests.length} quest(s)...`, "yellow");

    /**
     * Recursive function to process quests one by one.
     */
    let doJob = function () {
        const quest = quests.pop(); // Process LIFO

        // Base case: No more quests
        if (!quest) {
            logger.success("All jobs completed!");
            return;
        }

        // Generate a random Process ID (PID) to simulate a real application
        const pid = Math.floor(Math.random() * 30000) + 1000;

        // Extract Quest Metadata
        const applicationId = quest.config.application.id;
        const applicationName = quest.config.application.name;
        const questName = quest.config.messages.questName;
        const taskConfig = quest.config.taskConfig ?? quest.config.taskConfigV2;
        const taskName = supportedTasks.find(x => taskConfig.tasks[x] != null);
        const secondsNeeded = taskConfig.tasks[taskName].target;
        let secondsDone = quest.userStatus?.progress?.[taskName]?.value ?? 0;

        logger.log(`Starting Quest: ${questName}`, "white");
        logger.info(`Type: ${taskName} | App: ${applicationName} | Target: ${secondsNeeded} seconds`);

        // --------------------------------------------------------------------
        // HANDLER: WATCH_VIDEO
        // --------------------------------------------------------------------
        if (taskName === "WATCH_VIDEO" || taskName === "WATCH_VIDEO_ON_MOBILE") {
            const maxFuture = 10; // Allow slight future timestamps
            const speed = 7;      // Seconds to increment per loop
            const interval = 1;   // Loop delay
            const enrolledAt = new Date(quest.userStatus.enrolledAt).getTime();
            let completed = false;

            let fn = async () => {
                logger.info("Spoofing video playback...");

                while (true) {
                    // Calculate server-side logic validation boundaries
                    const maxAllowed = Math.floor((Date.now() - enrolledAt) / 1000) + maxFuture;
                    const diff = maxAllowed - secondsDone;
                    const timestamp = secondsDone + speed;

                    // Only send update if we are within allowed time boundaries
                    if (diff >= speed) {
                        const res = await api.post({
                            url: `/quests/${quest.id}/video-progress`,
                            body: { timestamp: Math.min(secondsNeeded, timestamp + Math.random()) }
                        });

                        completed = res.body.completed_at != null;
                        secondsDone = Math.min(secondsNeeded, timestamp);
                        logger.bar(secondsDone, secondsNeeded);
                    }

                    if (timestamp >= secondsNeeded) {
                        break;
                    }

                    // Wait before next heartbeat
                    await new Promise(resolve => setTimeout(resolve, interval * 1000));
                }

                // Finalize completion if server hasn't confirmed yet
                if (!completed) {
                    await api.post({ url: `/quests/${quest.id}/video-progress`, body: { timestamp: secondsNeeded } });
                    logger.bar(secondsNeeded, secondsNeeded);
                }

                logger.success(`${questName} completed!`);
                doJob(); // Next quest
            };
            fn();

            // --------------------------------------------------------------------
            // HANDLER: PLAY_ON_DESKTOP (Game Mocking)
            // --------------------------------------------------------------------
        } else if (taskName === "PLAY_ON_DESKTOP") {
            if (!isApp) {
                logger.warn("PLAY_ON_DESKTOP behaves inconsistently in browsers. Please use the Desktop App.");
            } else {
                // Fetch public application data to get accurate executable names
                api.get({ url: `/applications/public?application_ids=${applicationId}` }).then(res => {
                    const appData = res.body[0];
                    const exeName = appData.executables?.find(x => x.os === "win32")?.name?.replace(">", "") ?? appData.name.replace(/[\/\\:*?"<>|]/g, "");

                    // Construct a fake game process object
                    const fakeGame = {
                        cmdLine: `C:\\Program Files\\${appData.name}\\${exeName}`,
                        exeName,
                        exePath: `c:/program files/${appData.name.toLowerCase()}/${exeName}`,
                        hidden: false,
                        isLauncher: false,
                        id: applicationId,
                        name: appData.name,
                        pid: pid,
                        pidPath: [pid],
                        processName: appData.name,
                        start: Date.now(),
                    };

                    // Backup original store functions
                    const realGames = RunningGameStore.getRunningGames();
                    const fakeGames = [fakeGame];
                    const realGetRunningGames = RunningGameStore.getRunningGames;
                    const realGetGameForPID = RunningGameStore.getGameForPID;

                    // OVERRIDE: Inject our fake game into the Store
                    RunningGameStore.getRunningGames = () => fakeGames;
                    RunningGameStore.getGameForPID = (pid) => fakeGames.find(x => x.pid === pid);

                    // Notify Discord internals that a game "started"
                    FluxDispatcher.dispatch({ type: "RUNNING_GAMES_CHANGE", removed: realGames, added: [fakeGame], games: fakeGames });

                    logger.info(`Simulating game: ${applicationName}`);
                    logger.info(`Estimated wait time: ${Math.ceil((secondsNeeded - secondsDone) / 60)} minutes.`);

                    // Listener for heartbeat success (progress updates)
                    let fn = data => {
                        let progress = quest.config.configVersion === 1
                            ? data.userStatus.streamProgressSeconds
                            : Math.floor(data.userStatus.progress.PLAY_ON_DESKTOP.value);

                        logger.bar(progress, secondsNeeded);

                        if (progress >= secondsNeeded) {
                            logger.success(`${questName} completed!`);

                            // RESTORE: Cleanup and reset Store functions to original state
                            RunningGameStore.getRunningGames = realGetRunningGames;
                            RunningGameStore.getGameForPID = realGetGameForPID;
                            FluxDispatcher.dispatch({ type: "RUNNING_GAMES_CHANGE", removed: [fakeGame], added: [], games: [] });
                            FluxDispatcher.unsubscribe("QUESTS_SEND_HEARTBEAT_SUCCESS", fn);

                            doJob(); // Next quest
                        }
                    };

                    // Subscribe to the heartbeat event
                    FluxDispatcher.subscribe("QUESTS_SEND_HEARTBEAT_SUCCESS", fn);
                });
            }
            // --------------------------------------------------------------------
            // HANDLER: STREAM_ON_DESKTOP
            // --------------------------------------------------------------------
        } else if (taskName === "STREAM_ON_DESKTOP") {
            if (!isApp) {
                logger.warn("Streaming quests require the Desktop App.");
            } else {
                // Mock the Streamer Store to pretend we are streaming the specific App ID
                let realFunc = ApplicationStreamingStore.getStreamerActiveStreamMetadata;
                ApplicationStreamingStore.getStreamerActiveStreamMetadata = () => ({
                    id: applicationId,
                    pid,
                    sourceName: null
                });

                logger.info(`Simulating stream for ${applicationName}`);
                logger.info(`Requirement: You must be in a VC and streaming any window!`);
                logger.warn("NOTE: At least one other person or bot must be in the VC.");

                let fn = data => {
                    let progress = quest.config.configVersion === 1
                        ? data.userStatus.streamProgressSeconds
                        : Math.floor(data.userStatus.progress.STREAM_ON_DESKTOP.value);

                    logger.bar(progress, secondsNeeded);

                    if (progress >= secondsNeeded) {
                        logger.success(`${questName} completed!`);

                        // Restore original function
                        ApplicationStreamingStore.getStreamerActiveStreamMetadata = realFunc;
                        FluxDispatcher.unsubscribe("QUESTS_SEND_HEARTBEAT_SUCCESS", fn);
                        doJob();
                    }
                };
                FluxDispatcher.subscribe("QUESTS_SEND_HEARTBEAT_SUCCESS", fn);
            }
            // --------------------------------------------------------------------
            // HANDLER: PLAY_ACTIVITY (Embedded Activities)
            // --------------------------------------------------------------------
        } else if (taskName === "PLAY_ACTIVITY") {
            // Find a valid channel (Private channel or first Guild Voice Channel)
            const channelId = ChannelStore.getSortedPrivateChannels()[0]?.id ?? Object.values(GuildChannelStore.getAllGuilds()).find(x => x != null && x.VOCAL.length > 0).VOCAL[0].channel.id;
            const streamKey = `call:${channelId}:1`;

            let fn = async () => {
                logger.info(`Starting Activity in Channel ID: ${channelId}...`);

                while (true) {
                    // Send manual heartbeat to the API
                    const res = await api.post({ url: `/quests/${quest.id}/heartbeat`, body: { stream_key: streamKey, terminal: false } });
                    const progress = res.body.progress.PLAY_ACTIVITY.value;
                    logger.bar(progress, secondsNeeded);

                    // Wait 20 seconds between heartbeats (Discord standard)
                    await new Promise(resolve => setTimeout(resolve, 20 * 1000));

                    if (progress >= secondsNeeded) {
                        // Send terminal heartbeat to finish
                        await api.post({ url: `/quests/${quest.id}/heartbeat`, body: { stream_key: streamKey, terminal: true } });
                        break;
                    }
                }

                logger.success(`${questName} completed!`);
                doJob();
            };
            fn();
        }
    };

    // Kick off the loop
    doJob();
}