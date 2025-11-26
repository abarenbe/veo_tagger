// background.js
// Ensure side panel behavior is set to allow click handling
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false })
    .catch((error) => console.error(error));

chrome.runtime.onInstalled.addListener(async () => {
    // Inject content script into existing tabs
    const manifest = chrome.runtime.getManifest();
    const contentScripts = manifest.content_scripts;

    if (contentScripts) {
        for (const cs of contentScripts) {
            const tabs = await chrome.tabs.query({ url: cs.matches });
            for (const tab of tabs) {
                // Skip restricted pages (like chrome://)
                if (tab.url.startsWith('chrome://') || tab.url.startsWith('edge://') || tab.url.startsWith('about:')) continue;

                try {
                    await chrome.scripting.executeScript({
                        target: { tabId: tab.id, allFrames: cs.all_frames || false },
                        files: cs.js
                    });
                    console.log(`Injected content script into tab ${tab.id}`);
                } catch (err) {
                    console.warn(`Failed to inject content script into tab ${tab.id}:`, err);
                }
            }
        }
    }
});

// Handle extension icon click
chrome.action.onClicked.addListener(async (tab) => {
    // Check if we are on a Veo page
    if (tab.url && (tab.url.includes("app.veo.co") || tab.url.includes(".veo.co"))) {
        // Already on Veo, just open the side panel
        chrome.sidePanel.open({ tabId: tab.id });
    } else {
        // Not on Veo, open a new tab
        const newTab = await chrome.tabs.create({ url: "https://app.veo.co" });

        // We need to wait for the tab to be ready before opening the side panel
        // However, chrome.sidePanel.open requires a user gesture context which we have here (the click).
        // But if we await the tab loading, we might lose the gesture context?
        // Actually, chrome.sidePanel.open can be called with windowId.
        // Let's try opening it immediately for the new tab ID.
        // Note: The side panel might not be able to attach until the tab has committed navigation.

        // A robust way is to listen for the tab update
        const listener = (tabId, changeInfo, updatedTab) => {
            if (tabId === newTab.id && changeInfo.status === 'complete') {
                chrome.sidePanel.open({ tabId: newTab.id });
                chrome.tabs.onUpdated.removeListener(listener);
            }
        };
        chrome.tabs.onUpdated.addListener(listener);

        // Fallback: try opening it immediately (sometimes works if it's just about the window)
        // chrome.sidePanel.open({ tabId: newTab.id });
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "closeSidePanel" && sender.tab) {
        const tabId = sender.tab.id;
        // Disable the side panel for this tab to force it to close
        chrome.sidePanel.setOptions({
            tabId: tabId,
            enabled: false
        }, () => {
            // Re-enable it after a short delay so it can be opened again later
            setTimeout(() => {
                chrome.sidePanel.setOptions({
                    tabId: tabId,
                    enabled: true
                });
            }, 500);
        });
    }

    if (request.action === "hotkeyPressed") {
        handleHotkey(request.key, request.timestamp);
    }

    if (request.action === "recordTag") {
        recordTag(request.tag, request.timestamp);
    }
});

async function handleHotkey(key, timestamp) {
    const data = await chrome.storage.local.get(['tagBoards', 'activeBoardId']);
    if (!data.tagBoards || !data.activeBoardId) return;

    const activeBoard = data.tagBoards.find(b => b.id === data.activeBoardId);
    if (!activeBoard) return;

    const tag = activeBoard.tags.find(t => t.hotkey === key);
    if (tag) {
        recordTag(tag, timestamp);
    }
}

async function recordTag(tag, timestamp) {
    // Get active tab to find URL/Match ID
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    let matchId = 'default_session';

    if (tab && tab.url) {
        const match = tab.url.match(/matches\/([a-zA-Z0-9-]+)\//);
        if (match && match[1]) {
            matchId = match[1];
        }
    }

    const data = await chrome.storage.local.get(['games']);
    const games = data.games || {};

    // Initialize game session if not exists
    if (!games[matchId]) {
        games[matchId] = {
            tags: [],
            matchState: { onField: [], roster: [], guests: [] },
            lastAccessed: Date.now()
        };
    }

    const recordedTags = games[matchId].tags;

    // Handle duration tags with toggle behavior
    if (tag.type === 'duration') {
        const activeDurationTagIndex = recordedTags.findIndex(t =>
            t.type === 'duration' && t.name === tag.name && !t.endTime
        );

        if (activeDurationTagIndex !== -1) {
            // Stop the duration tag
            recordedTags[activeDurationTagIndex].endTime = timestamp;
            recordedTags[activeDurationTagIndex].duration = timestamp - recordedTags[activeDurationTagIndex].timestamp;
        } else {
            // Start new duration tag
            const newTag = {
                id: Date.now().toString(),
                name: tag.name,
                type: tag.type,
                timestamp: timestamp,
                color: tag.color,
                hotkey: tag.hotkey,
                endTime: null,
                duration: null
            };
            recordedTags.push(newTag);
        }
    } else {
        // Event tag - simple recording
        const newTag = {
            id: Date.now().toString(),
            name: tag.name,
            type: tag.type,
            timestamp: timestamp,
            color: tag.color,
            hotkey: tag.hotkey
        };

        if (tag.description) {
            newTag.description = tag.description;
        }

        recordedTags.push(newTag);
    }

    games[matchId].lastAccessed = Date.now();
    await chrome.storage.local.set({ games });
}
