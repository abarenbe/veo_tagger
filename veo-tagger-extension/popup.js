// popup.js
console.log("Popup script loaded - Top level");

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOMContentLoaded fired");
    // --- DOM Elements ---
    // Views
    const viewMain = document.getElementById('view-main');
    const viewSettings = document.getElementById('view-settings');

    // Main View Elements
    const settingsBtn = document.getElementById('settings-btn');
    const mainBoardSelect = document.getElementById('main-board-select');
    const tagsContainer = document.getElementById('tags-container');
    const onFieldContainer = document.getElementById('on-field-container');
    const recordedTagsList = document.getElementById('recorded-tags-list');
    const subModeToggle = document.getElementById('sub-mode-toggle');

    // Settings View Elements
    const backToMainBtn = document.getElementById('back-to-main-btn');
    const exportBtn = document.getElementById('export-btn');
    const tabSettingsBoards = document.getElementById('tab-settings-boards');
    const tabSettingsTeams = document.getElementById('tab-settings-teams');
    const settingsBoardsPanel = document.getElementById('settings-boards-panel');
    const settingsTeamsPanel = document.getElementById('settings-teams-panel');

    // Settings: Boards
    const settingsBoardSelect = document.getElementById('settings-board-select');
    const newBoardBtn = document.getElementById('new-board-btn');
    const deleteBoardBtn = document.getElementById('delete-board-btn');
    const addTagBtn = document.getElementById('add-tag-btn');
    const settingsTagsList = document.getElementById('settings-tags-list');
    const boardTagsContainer = document.getElementById('board-tags-container');
    const editBoardTagsBtn = document.getElementById('edit-board-tags-btn');

    // Settings: Teams
    const settingsTeamSelect = document.getElementById('settings-team-select');
    const newTeamBtn = document.getElementById('new-team-btn');
    const deleteTeamBtn = document.getElementById('delete-team-btn');
    const playerNumberInput = document.getElementById('player-number-input');
    const playerNameInput = document.getElementById('player-name-input');
    const addPlayerBtn = document.getElementById('add-player-btn');
    const rosterList = document.getElementById('roster-list');

    // Modals
    const tagModal = document.getElementById('tag-modal');
    const tagNameInput = document.getElementById('tag-name-input');
    const tagTypeInput = document.getElementById('tag-type-input');
    const tagHotkeyInput = document.getElementById('tag-hotkey-input');
    const tagColorInput = document.getElementById('tag-color-input');
    const tagSubboardInput = document.getElementById('tag-subboard-input');
    const saveTagBtn = document.getElementById('save-tag-btn');
    const cancelTagBtn = document.getElementById('cancel-tag-btn');

    const boardModal = document.getElementById('board-modal');
    const boardNameInput = document.getElementById('board-name-input');
    const boardTagsCheckboxes = document.getElementById('board-tags-checkboxes');
    const saveBoardBtn = document.getElementById('save-board-btn');
    const cancelBoardBtn = document.getElementById('cancel-board-btn');
    const manageBoardTagsBtn = document.getElementById('manage-board-tags-btn');
    const availableTagsContainer = document.getElementById('available-tags-container');

    const teamModal = document.getElementById('team-modal');
    const teamNameInput = document.getElementById('team-name-input');
    const saveTeamBtn = document.getElementById('save-team-btn');
    const cancelTeamBtn = document.getElementById('cancel-team-btn');

    const subModal = document.getElementById('sub-modal');
    const subOutName = document.getElementById('sub-out-name');
    const subInSelect = document.getElementById('sub-in-select');
    const confirmSubBtn = document.getElementById('confirm-sub-btn');
    const cancelSubBtn = document.getElementById('cancel-sub-btn');

    const errorMsg = document.getElementById('error-msg');
    const modeToggleBtn = document.getElementById('mode-toggle-btn');

    // Pop-out icons
    const iconPopOut = document.getElementById('icon-pop-out');
    const iconPopIn = document.getElementById('icon-pop-in');

    // Lineup modal elements
    const lineupBtn = document.getElementById('lineup-btn');
    const lineupModal = document.getElementById('lineup-modal');
    const lineupList = document.getElementById('lineup-list');
    const closeLineupBtn = document.getElementById('close-lineup-btn');
    const sortToggleBtn = document.getElementById('sort-toggle-btn');

    // Note modal elements
    const noteModal = document.getElementById('note-modal');
    const noteInput = document.getElementById('note-input');
    const saveNoteBtn = document.getElementById('save-note-btn');
    const cancelNoteBtn = document.getElementById('cancel-note-btn');

    // Board composition elements
    const editCompositionBtn = document.getElementById('edit-composition-btn');
    const includeFromText = document.getElementById('include-from-text');
    const showRecordedText = document.getElementById('show-recorded-text');
    const compositionModal = document.getElementById('composition-modal');
    const includeBoardsCheckboxes = document.getElementById('include-boards-checkboxes');
    const includePositionSelect = document.getElementById('include-position-select');
    const showRecordedCheckboxes = document.getElementById('show-recorded-checkboxes');
    const saveCompositionBtn = document.getElementById('save-composition-btn');
    const cancelCompositionBtn = document.getElementById('cancel-composition-btn');

    // --- State ---
    let state = {
        currentView: 'main', // 'main' or 'settings'
        activeSettingsTab: 'boards', // 'boards' or 'teams'

        boards: [],
        activeBoardId: null,
        boardTagsList: [], // Available board tags to choose from
        teams: [],
        activeTeamId: null,

        // Session specific data
        currentMatchId: 'default_session',
        recordedTags: [],
        sortOrder: 'entered', // 'entered' or 'timestamp'
        matchState: {
            onField: [],
            roster: [],
            guests: []
        },
        quickListBoardIds: [], // Game-specific quick list of board IDs

        // Track active duration tags
        activeDurationTags: {},

        // Track last tag timestamp for player association
        lastTagRealTime: null,

        // Track which tag is being edited
        currentEditingTagIndex: null,
        currentEditingChildIndex: null,

        // Track sub-tag mode (adding details to a parent tag)
        addingToParentTagId: null,
        resumeTimestamp: null,

        // Double-tap hotkey detection
        lastHotkeyPress: {}
    };

    // Default Data
    const DEFAULT_BOARDS = [
        // ===== GAME STATE BOARD =====
        // Main board for tracking game phases, halves, and possession states
        {
            id: 'game_state',
            name: 'Game State',
            boardTags: ['Soccer', 'Game Phase'],
            includeTags: { from: [], position: 'top' },
            showRecordedFrom: '*',
            tags: [
                // Half tracking
                { id: 'gs1', name: '1st Half', type: 'duration', hotkey: '1', color: '#2c3e50', subTagBoard: null },
                { id: 'gs2', name: '2nd Half', type: 'duration', hotkey: '2', color: '#34495e', subTagBoard: null },
                // Game phase - possession states (double-tap opens possession board)
                { id: 'gs3', name: 'In Possession', type: 'duration', hotkey: 'p', color: '#27ae60', subTagBoard: 'possession_details' },
                { id: 'gs4', name: 'Out of Possession', type: 'duration', hotkey: 'o', color: '#e74c3c', subTagBoard: null },
                { id: 'gs5', name: 'Contested', type: 'duration', hotkey: 'c', color: '#f39c12', subTagBoard: null },
                { id: 'gs6', name: 'Out of Play', type: 'duration', hotkey: 'x', color: '#95a5a6', subTagBoard: null },
                // Substitution marker
                { id: 'gs7', name: 'Substitution', type: 'event', hotkey: 's', color: '#9b59b6', subTagBoard: null }
            ]
        },
        // ===== POSSESSION DETAILS BOARD =====
        // Sub-board for detailed possession tagging (actions, zones, channels)
        {
            id: 'possession_details',
            name: 'Possession Details',
            boardTags: ['Soccer', 'Possession'],
            // Include game state tags at top for context
            includeTags: { from: ['game_state'], position: 'top' },
            // Only show tags from game state and this board
            showRecordedFrom: ['game_state', 'possession_details'],
            tags: [
                // Actions
                { id: 'pd1', name: 'Pass', type: 'event', hotkey: 'p', color: '#3498db', subTagBoard: null },
                { id: 'pd2', name: 'Dribble', type: 'event', hotkey: 'd', color: '#9b59b6', subTagBoard: null },
                { id: 'pd3', name: 'Shot', type: 'event', hotkey: 's', color: '#e74c3c', subTagBoard: null },
                { id: 'pd4', name: 'Cross', type: 'event', hotkey: 'c', color: '#1abc9c', subTagBoard: null },
                { id: 'pd5', name: 'Turn', type: 'event', hotkey: 't', color: '#f1c40f', subTagBoard: null },
                { id: 'pd6', name: 'Lost Ball', type: 'event', hotkey: 'l', color: '#7f8c8d', subTagBoard: null },
                // Third of field (zones)
                { id: 'pd7', name: 'A3 (Attack)', type: 'event', hotkey: 'a', color: '#e74c3c', subTagBoard: null },
                { id: 'pd8', name: 'M3 (Middle)', type: 'event', hotkey: 'm', color: '#f39c12', subTagBoard: null },
                { id: 'pd9', name: 'D3 (Defense)', type: 'event', hotkey: 'z', color: '#27ae60', subTagBoard: null },
                // Side of field (channels)
                { id: 'pd10', name: 'Left', type: 'event', hotkey: 'q', color: '#2980b9', subTagBoard: null },
                { id: 'pd11', name: 'Center', type: 'event', hotkey: 'w', color: '#8e44ad', subTagBoard: null },
                { id: 'pd12', name: 'Right', type: 'event', hotkey: 'e', color: '#16a085', subTagBoard: null }
            ]
        },
        // ===== EXISTING BOARDS =====
        {
            id: 'soccer_basic',
            name: 'Soccer (Basic)',
            boardTags: ['Soccer'],
            includeTags: { from: [], position: 'top' },
            showRecordedFrom: '*',
            tags: [
                { id: 't1', name: 'Goal', type: 'event', hotkey: 'g', color: '#f1c40f', subTagBoard: null },
                { id: 't2', name: 'Foul', type: 'event', hotkey: 'f', color: '#e74c3c', subTagBoard: null },
                { id: 't3', name: 'Corner', type: 'event', hotkey: 'c', color: '#3498db', subTagBoard: null },
                { id: 't4', name: 'Shot', type: 'event', hotkey: 's', color: '#9b59b6', subTagBoard: null },
                { id: 't5', name: 'Possession', type: 'duration', hotkey: 'p', color: '#2ecc71', subTagBoard: null }
            ]
        },
        {
            id: 'soccer_advanced',
            name: 'Soccer (Advanced)',
            boardTags: ['Soccer'],
            includeTags: { from: [], position: 'top' },
            showRecordedFrom: '*',
            tags: [
                { id: 'sa1', name: 'Goal', type: 'event', hotkey: 'g', color: '#f1c40f', subTagBoard: null },
                { id: 'sa2', name: 'Assist', type: 'event', hotkey: 'a', color: '#f39c12', subTagBoard: null },
                { id: 'sa3', name: 'Shot on Target', type: 'event', hotkey: 't', color: '#9b59b6', subTagBoard: null },
                { id: 'sa4', name: 'Shot off Target', type: 'event', hotkey: 'o', color: '#8e44ad', subTagBoard: null },
                { id: 'sa5', name: 'Corner', type: 'event', hotkey: 'c', color: '#3498db', subTagBoard: null },
                { id: 'sa6', name: 'Foul', type: 'event', hotkey: 'f', color: '#e74c3c', subTagBoard: null },
                { id: 'sa7', name: 'Yellow Card', type: 'event', hotkey: 'y', color: '#f1c40f', subTagBoard: null },
                { id: 'sa8', name: 'Red Card', type: 'event', hotkey: 'r', color: '#c0392b', subTagBoard: null },
                { id: 'sa9', name: 'Offside', type: 'event', hotkey: 'x', color: '#95a5a6', subTagBoard: null },
                { id: 'sa10', name: 'Possession', type: 'duration', hotkey: 'p', color: '#2ecc71', subTagBoard: null }
            ]
        },
        {
            id: 'basketball',
            name: 'Basketball',
            boardTags: ['Basketball'],
            includeTags: { from: [], position: 'top' },
            showRecordedFrom: '*',
            tags: [
                { id: 'bb1', name: '2pt Make', type: 'event', hotkey: '2', color: '#2ecc71', subTagBoard: null },
                { id: 'bb2', name: '2pt Miss', type: 'event', hotkey: 'w', color: '#e74c3c', subTagBoard: null },
                { id: 'bb3', name: '3pt Make', type: 'event', hotkey: '3', color: '#27ae60', subTagBoard: null },
                { id: 'bb4', name: '3pt Miss', type: 'event', hotkey: 'e', color: '#c0392b', subTagBoard: null },
                { id: 'bb5', name: 'Free Throw', type: 'event', hotkey: '1', color: '#f39c12', subTagBoard: null },
                { id: 'bb6', name: 'Foul', type: 'event', hotkey: 'f', color: '#e67e22', subTagBoard: null },
                { id: 'bb7', name: 'Rebound', type: 'event', hotkey: 'r', color: '#3498db', subTagBoard: null },
                { id: 'bb8', name: 'Turnover', type: 'event', hotkey: 't', color: '#95a5a6', subTagBoard: null }
            ]
        }
    ];

    // Double-tap detection constants
    const DOUBLE_TAP_MS = 300;

    // Color defaults for tag types
    const TAG_TYPE_COLORS = {
        event: '#f1c40f',    // Yellow
        duration: '#2ecc71'   // Green
    };

    const DURATION_ACTIVE_COLOR = '#e74c3c'; // Red for active duration tags

    // --- Initialization ---
    async function init() {
        try {
            await loadCurrentGameContext();
            await loadState();
            setupModeToggle();
            setupEventListeners();
            setupSortToggle();
            setupNavigationListener();
            render();
        } catch (e) {
            errorMsg.textContent = `Async Init Error: ${e.message}`;
            console.error(e);
        }
    }

    async function loadCurrentGameContext() {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tab && tab.url) {
                const match = tab.url.match(/matches\/([a-zA-Z0-9-]+)\//);
                if (match && match[1]) {
                    state.currentMatchId = match[1];

                // Set title from saved metadata or default
                chrome.storage.local.get(['games'], (result) => {
                    const games = result.games || {};
                    const game = games[state.currentMatchId];
                    const savedTitle = game?.metadata?.title;

                    const h1Element = document.querySelector('h1');
                    if (h1Element) {
                        if (savedTitle) {
                            h1Element.textContent = savedTitle;
                        } else {
                            h1Element.textContent = 'Veo Tagger';
                            h1Element.style.cursor = 'pointer';
                            h1Element.title = 'Click to fetch game title';
                        }
                    }
                });
            } else {
                // Not a game URL - keep default title
                state.currentMatchId = 'default_session';
                const h1Element = document.querySelector('h1');
                if (h1Element) {
                    h1Element.textContent = 'Veo Tagger';
                    h1Element.style.cursor = 'default';
                    h1Element.title = '';
                }
                console.log("Not on a game page - URL does not match pattern");
            }
        }
    }

    function fetchGameTitle() {
        if (state.currentMatchId === 'default_session') {
            console.log("Not on a game page, cannot fetch title");
            return;
        }

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, { action: "getGameTitle" }, (response) => {
                    if (chrome.runtime.lastError) {
                        console.log("Could not fetch game title:", chrome.runtime.lastError);
                        return;
                    }
                    console.log("Got game title response:", response);
                    if (response && response.title) {
                        console.log("Setting game title:", response.title);
                        const h1Element = document.querySelector('h1');
                        if (h1Element) {
                            h1Element.textContent = response.title;
                            h1Element.style.cursor = 'default';
                            h1Element.title = '';
                        }
                        // Save game title to metadata
                        updateGameMetadata(state.currentMatchId, { title: response.title });
                    } else {
                        console.log("No title in response or response is null");
                    }
                });
            }
        });
    }

    function setupNavigationListener() {
        // Listen for tab updates (URL changes)
        chrome.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
            if (changeInfo.url) {
                const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
                if (activeTab && activeTab.id === tabId) {
                    console.log("URL changed, reloading game context...");
                    await loadCurrentGameContext();
            await loadState();
            render();
        }
            }
        });
    }

    // --- State Management ---
    async function loadState() {
        console.log("Loading state...");
        const result = await chrome.storage.local.get(['tagBoards', 'activeBoardId', 'boardTagsList', 'teams', 'activeTeamId', 'games']);
            console.log("Loaded result:", result);

            // Global Settings
        state.boardTagsList = result.boardTagsList || [];

            if (result.tagBoards && Array.isArray(result.tagBoards) && result.tagBoards.length > 0) {
                console.log("Found existing boards:", result.tagBoards.length);
                state.boards = result.tagBoards;
                state.activeBoardId = result.activeBoardId || state.boards[0].id;
            } else {
                console.log("No boards found (or empty), loading defaults...", DEFAULT_BOARDS);
            state.boards = JSON.parse(JSON.stringify(DEFAULT_BOARDS));
                state.activeBoardId = state.boards[0].id;
            saveGlobalState();
            }

            state.teams = result.teams || [];
            state.activeTeamId = result.activeTeamId || (state.teams.length > 0 ? state.teams[0].id : null);

            // Session Specific Data
            const games = result.games || {};
        const session = games[state.currentMatchId] || { tags: [], matchState: { onField: [], roster: [], guests: [] }, quickListBoardIds: [] };

            state.recordedTags = session.tags || [];
        state.matchState = session.matchState || { onField: [], roster: [], guests: [] };
        state.quickListBoardIds = session.quickListBoardIds || [];

        // Ensure all matchState properties exist
        if (!state.matchState.roster) state.matchState.roster = [];
        if (!state.matchState.guests) state.matchState.guests = [];
        if (!state.matchState.onField) state.matchState.onField = [];

        // Rebuild activeDurationTags from recorded tags
        state.activeDurationTags = {};
        state.recordedTags.forEach(tag => {
            if (tag.type === 'duration' && !tag.endTime) {
                state.activeDurationTags[tag.name] = tag.id;
            }
        });

        // Sync onField with roster
            if (state.matchState.onField.length > 0) {
                state.matchState.onField.forEach(id => {
                    if (!state.matchState.roster.includes(id)) {
                        state.matchState.roster.push(id);
                    }
                });
            }
        }

        function saveGlobalState() {
            if (!state.boards || state.boards.length === 0) {
                console.error("Attempted to save empty boards! Aborting save.", state.boards);
                return;
            }
        console.log("Saving global state...", { boards: state.boards, teams: state.teams, boardTagsList: state.boardTagsList });
            chrome.storage.local.set({
                tagBoards: state.boards,
                activeBoardId: state.activeBoardId,
            boardTagsList: state.boardTagsList,
                teams: state.teams,
                activeTeamId: state.activeTeamId
            }, () => {
                if (chrome.runtime.lastError) {
                    console.error("Error saving global state:", chrome.runtime.lastError);
                } else {
                    console.log("Global state saved successfully.");
                }
            });
        }

        function saveSessionState() {
            console.log("Saving session state...", state.currentMatchId);
            chrome.storage.local.get(['games'], (result) => {
                if (chrome.runtime.lastError) {
                    console.error("Error getting games for save:", chrome.runtime.lastError);
                    return;
                }
                const games = result.games || {};

            // Preserve existing metadata if it exists
            const existingGame = games[state.currentMatchId] || {};
            const metadata = existingGame.metadata || {};

                games[state.currentMatchId] = {
                    tags: state.recordedTags,
                matchState: state.matchState,
                quickListBoardIds: state.quickListBoardIds,
                metadata: {
                    ...metadata,
                    lastAccessed: Date.now(),
                    teamName: state.activeTeamId ? (state.teams.find(t => t.id === state.activeTeamId)?.name || '') : ''
                }
                };
                chrome.storage.local.set({ games: games }, () => {
                    if (chrome.runtime.lastError) {
                        console.error("Error saving session state:", chrome.runtime.lastError);
                    } else {
                        console.log("Session state saved successfully.");
                    }
                });
            });
        }

    function updateGameMetadata(matchId, metadataUpdates) {
        chrome.storage.local.get(['games'], (result) => {
            if (chrome.runtime.lastError) {
                console.error("Error getting games for metadata update:", chrome.runtime.lastError);
                return;
            }
            const games = result.games || {};
            if (!games[matchId]) {
                games[matchId] = {
                    tags: [],
                    matchState: { onField: [], roster: [], guests: [] },
                    quickListBoardIds: [],
                    metadata: {}
                };
            }
            games[matchId].metadata = {
                ...(games[matchId].metadata || {}),
                ...metadataUpdates,
                lastAccessed: Date.now()
            };
            chrome.storage.local.set({ games: games });
            });
        }

        function saveState() {
            saveGlobalState();
            saveSessionState();
        }

    // --- Rendering ---
        function render() {
            if (state.currentView === 'main') {
                viewMain.style.display = 'block';
                viewSettings.style.display = 'none';
                renderMainView();
            } else {
                viewMain.style.display = 'none';
                viewSettings.style.display = 'block';
                renderSettingsView();
            }
        }

        function renderMainView() {
        // Check if we're on a game page
        if (state.currentMatchId === 'default_session') {
            renderRecentGamesView();
        } else {
            renderGameView();
        }
    }

    function renderGameView() {
        // Show the normal game tagging interface
        const gameControls = document.querySelector('.game-controls');
        if (gameControls) gameControls.style.display = 'block';

        tagsContainer.style.display = 'grid';

        // Show all hr elements in main view
        const hrs = viewMain.querySelectorAll('hr');
        hrs.forEach(hr => hr.style.display = 'block');

        // Restore h3 headers
        const h3s = viewMain.querySelectorAll('h3');
        h3s.forEach((h3, index) => {
            h3.style.display = 'block';
            // Restore original text
            if (index === 0) h3.textContent = 'On Field';
            if (index === 1) h3.textContent = 'Recorded Tags';
        });

        // Show lineup button and sub mode toggle
        const lineupBtn = document.getElementById('lineup-btn');
        const subModeToggle = document.getElementById('sub-mode-toggle');
        if (lineupBtn) lineupBtn.parentElement.style.display = 'flex';
        if (subModeToggle) subModeToggle.parentElement.style.display = 'flex';

        // Show on field container and recorded tags
        if (onFieldContainer.parentElement) onFieldContainer.parentElement.style.display = 'block';
        if (recordedTagsList.parentElement) recordedTagsList.parentElement.style.display = 'block';

        // Show sort button
        const sortBtn = document.getElementById('sort-toggle-btn');
        if (sortBtn) sortBtn.style.display = 'inline-block';

            renderBoardSelect();
            renderTags();
            renderRecordedTags();
            renderOnField();
        }

    function renderRecentGamesView() {
        // Hide the game tagging interface
        document.querySelector('.game-controls').style.display = 'none';
        tagsContainer.style.display = 'none';
        document.querySelectorAll('hr').forEach(hr => hr.style.display = 'none');
        onFieldContainer.parentElement.style.display = 'none';

        // Show recent games list
        recordedTagsList.parentElement.style.display = 'block';
        const h3 = recordedTagsList.parentElement.querySelector('h3');
        if (h3) h3.textContent = 'Recent Games';
        const sortBtn = document.getElementById('sort-toggle-btn');
        if (sortBtn) sortBtn.style.display = 'none';

        chrome.storage.local.get(['games'], (result) => {
            const games = result.games || {};
            const gameEntries = Object.entries(games)
                .filter(([matchId]) => matchId !== 'default_session')
                .map(([matchId, gameData]) => ({
                    matchId,
                    ...gameData,
                    metadata: gameData.metadata || {}
                }))
                .sort((a, b) => (b.metadata.lastAccessed || 0) - (a.metadata.lastAccessed || 0))
                .slice(0, 10); // Show last 10 games

            recordedTagsList.innerHTML = '';

            if (gameEntries.length === 0) {
                recordedTagsList.innerHTML = '<li class="empty-state">No recent games. Navigate to a game on app.veo.co to start tagging.</li>';
                return;
            }

            gameEntries.forEach((game, index) => {
                const li = document.createElement('li');
                li.style.listStyle = 'none';
                li.style.marginBottom = '10px';
                li.style.cursor = 'pointer';
                li.style.padding = '0';

                // Create colored card container
                const card = document.createElement('div');
                card.style.padding = '14px';
                card.style.borderRadius = '8px';
                card.style.transition = 'transform 0.2s, box-shadow 0.2s';
                card.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';

                // Assign colors from a palette
                const colors = ['#3498db', '#2ecc71', '#9b59b6', '#e67e22', '#1abc9c', '#e74c3c', '#f39c12', '#34495e'];
                const bgColor = colors[index % colors.length];
                card.style.backgroundColor = bgColor;
                card.style.color = 'white';

                // Extract date from match ID if no title (format: YYYYMMDD-name-hash)
                let gameTitle = game.metadata.title;
                let gameDate = '';

                if (!gameTitle && game.matchId) {
                    // Try to parse date from match ID (e.g., "20251123-ces-03933e8a")
                    const dateMatch = game.matchId.match(/^(\d{4})(\d{2})(\d{2})-/);
                    if (dateMatch) {
                        const [, year, month, day] = dateMatch;
                        const date = new Date(year, month - 1, day);
                        gameDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                        gameTitle = `Game ${gameDate}`;
                    } else {
                        gameTitle = game.matchId;
                    }
                } else if (gameTitle) {
                    // If we have a title, try to extract date from match ID for the date line
                    const dateMatch = game.matchId.match(/^(\d{4})(\d{2})(\d{2})-/);
                    if (dateMatch) {
                        const [, year, month, day] = dateMatch;
                        const date = new Date(year, month - 1, day);
                        gameDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                    }
                }

                // Game title
                const titleSpan = document.createElement('div');
                titleSpan.style.fontWeight = 'bold';
                titleSpan.style.fontSize = '15px';
                titleSpan.style.marginBottom = '6px';
                titleSpan.textContent = gameTitle;
                card.appendChild(titleSpan);

                // Team name
                const teamName = game.metadata.teamName || '';
                if (teamName) {
                    const teamSpan = document.createElement('div');
                    teamSpan.style.fontSize = '13px';
                    teamSpan.style.marginBottom = '6px';
                    teamSpan.style.opacity = '0.95';
                    teamSpan.textContent = teamName;
                    card.appendChild(teamSpan);
                }

                // Details line (tags count and date)
                const detailsSpan = document.createElement('div');
                detailsSpan.style.fontSize = '11px';
                detailsSpan.style.opacity = '0.85';
                const tagCount = (game.tags || []).length;
                const detailsParts = [`${tagCount} tag${tagCount !== 1 ? 's' : ''}`];
                if (gameDate) {
                    detailsParts.push(gameDate);
                }
                detailsSpan.textContent = detailsParts.join(' • ');
                card.appendChild(detailsSpan);

                // Hover effect
                card.onmouseenter = () => {
                    card.style.transform = 'translateY(-2px)';
                    card.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
                };
                card.onmouseleave = () => {
                    card.style.transform = 'translateY(0)';
                    card.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                };

                card.onclick = () => {
                    // Navigate to the game
                    const gameUrl = `https://app.veo.co/matches/${game.matchId}/`;
                    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                        if (tabs[0]) {
                            chrome.tabs.update(tabs[0].id, { url: gameUrl });
                        }
                    });
                };

                li.appendChild(card);
                recordedTagsList.appendChild(li);
            });
        });
        }

        function renderSettingsView() {
            if (state.activeSettingsTab === 'boards') {
                settingsBoardsPanel.style.display = 'block';
                settingsTeamsPanel.style.display = 'none';
                tabSettingsBoards.classList.add('active');
                tabSettingsBoards.style.backgroundColor = '#3498db';
                tabSettingsTeams.classList.remove('active');
                tabSettingsTeams.style.backgroundColor = '#95a5a6';

                renderBoardSelect();
            renderAvailableTags();
            renderBoardTags();
            renderBoardComposition();
                renderSettingsTagsList();
            renderQuickList();
            } else {
                settingsBoardsPanel.style.display = 'none';
                settingsTeamsPanel.style.display = 'block';
                tabSettingsBoards.classList.remove('active');
                tabSettingsBoards.style.backgroundColor = '#95a5a6';
                tabSettingsTeams.classList.add('active');
                tabSettingsTeams.style.backgroundColor = '#3498db';

                renderTeamSelect();
                renderRoster();
            }
        }

        function renderBoardSelect() {
            mainBoardSelect.innerHTML = '';
            settingsBoardSelect.innerHTML = '';

        // For main view: show only boards in the quick list, or all boards if quick list is empty
        let boardsToShowInMain = state.boards;
        if (state.quickListBoardIds.length > 0) {
            boardsToShowInMain = state.boards.filter(board => state.quickListBoardIds.includes(board.id));
        }

        // If no boards match the quick list (e.g., boards were deleted), show all
        if (boardsToShowInMain.length === 0) {
            boardsToShowInMain = state.boards;
        }

        // Ensure active board is valid for main view
        const activeBoardInList = boardsToShowInMain.find(b => b.id === state.activeBoardId);
        if (!activeBoardInList && boardsToShowInMain.length > 0) {
            state.activeBoardId = boardsToShowInMain[0].id;
            saveGlobalState();
        }

        boardsToShowInMain.forEach(board => {
                const optionMain = document.createElement('option');
                optionMain.value = board.id;
                optionMain.textContent = board.name;
                optionMain.selected = board.id === state.activeBoardId;
                mainBoardSelect.appendChild(optionMain);
        });

        // For settings view: show all boards
        state.boards.forEach(board => {
                const optionSettings = document.createElement('option');
                optionSettings.value = board.id;
                optionSettings.textContent = board.name;
                optionSettings.selected = board.id === state.activeBoardId;
                settingsBoardSelect.appendChild(optionSettings);
            });
        }

        function renderTeamSelect() {
            settingsTeamSelect.innerHTML = '';

            if (state.teams.length === 0) {
                const option = document.createElement('option');
                option.text = "No teams created";
                settingsTeamSelect.appendChild(option);
                return;
            }

            state.teams.forEach(team => {
                const option = document.createElement('option');
                option.value = team.id;
                option.textContent = team.name;
                option.selected = team.id === state.activeTeamId;
                settingsTeamSelect.appendChild(option);
            });
        }

        function renderTags() {
            tagsContainer.innerHTML = '';
            const activeBoard = state.boards.find(b => b.id === state.activeBoardId);
            if (!activeBoard) return;

        // Check if we're in sub-tag mode - show indicator
        if (state.addingToParentTagId) {
            const parentTag = state.recordedTags.find(t => t.id === state.addingToParentTagId);
            if (parentTag) {
                const indicator = document.createElement('div');
                indicator.className = 'subtag-mode-indicator';
                indicator.style.cssText = 'background: #3498db; color: white; padding: 8px; border-radius: 4px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; font-size: 12px;';
                indicator.innerHTML = `
                    <span>Adding details to: <strong>${parentTag.name}</strong> (${formatTime(parentTag.timestamp)})</span>
                    <button id="exit-subtag-mode" style="background: white; color: #3498db; padding: 2px 8px; font-size: 11px; width: auto;">Done</button>
                `;
                tagsContainer.appendChild(indicator);
                
                // Add event listener after adding to DOM
                setTimeout(() => {
                    const exitBtn = document.getElementById('exit-subtag-mode');
                    if (exitBtn) {
                        exitBtn.onclick = () => exitSubTagMode();
                    }
                }, 0);
            }
        }

        // Render included tags from other boards (if configured)
        if (activeBoard.includeTags && activeBoard.includeTags.from && activeBoard.includeTags.from.length > 0) {
            const position = activeBoard.includeTags.position || 'top';
            
            if (position === 'top') {
                renderIncludedTags(activeBoard.includeTags.from);
            }
        }

        // Render this board's own tags
            activeBoard.tags.forEach(tag => {
            renderTagButton(tag, activeBoard.id);
        });

        // Render included tags at bottom if configured
        if (activeBoard.includeTags && activeBoard.includeTags.from && activeBoard.includeTags.from.length > 0) {
            const position = activeBoard.includeTags.position || 'top';
            
            if (position === 'bottom') {
                renderIncludedTags(activeBoard.includeTags.from);
            }
        }
    }

    function renderIncludedTags(boardIds) {
        // Create a section header for included tags
        const header = document.createElement('div');
        header.style.cssText = 'grid-column: 1/-1; font-size: 10px; color: #7f8c8d; margin: 5px 0 2px 0; text-transform: uppercase;';
        header.textContent = 'From Other Boards';
        tagsContainer.appendChild(header);

        boardIds.forEach(boardId => {
            const board = state.boards.find(b => b.id === boardId);
            if (board && board.tags) {
                board.tags.forEach(tag => {
                    renderTagButton(tag, boardId, true);
                });
            }
        });

        // Add separator after included tags
        const separator = document.createElement('div');
        separator.style.cssText = 'grid-column: 1/-1; height: 1px; background: #ddd; margin: 8px 0;';
        tagsContainer.appendChild(separator);
    }

    function renderTagButton(tag, sourceBoardId, isIncluded = false) {
                const btn = document.createElement('button');
                btn.className = 'tag-btn';

        // Check if this is an active duration tag
        const isActiveDuration = tag.type === 'duration' && state.activeDurationTags[tag.name];

        if (isActiveDuration) {
            btn.style.backgroundColor = DURATION_ACTIVE_COLOR;
            btn.style.animation = 'pulse 1s infinite';
            btn.classList.add('duration-active');
        } else {
                btn.style.backgroundColor = tag.color;
        }

        // Dim included tags slightly
        if (isIncluded) {
            btn.style.opacity = '0.85';
        }

                btn.textContent = tag.name;

        // Show indicator if tag has a sub-board
        if (tag.subTagBoard) {
            const subIndicator = document.createElement('span');
            subIndicator.textContent = '▸';
            subIndicator.style.cssText = 'position: absolute; bottom: 2px; right: 4px; font-size: 10px; opacity: 0.7;';
            btn.style.position = 'relative';
            btn.appendChild(subIndicator);
        }

                if (tag.hotkey) {
                    const hint = document.createElement('span');
                    hint.className = 'hotkey-hint';
                    hint.textContent = tag.hotkey;
                    btn.appendChild(hint);
                }

        // Click handler - opens sub-board if available
        btn.onclick = () => {
            triggerTag(tag);
            // If tag has a sub-board, open it after recording
            if (tag.subTagBoard) {
                setTimeout(() => openSubBoard(tag.subTagBoard), 50);
            }
        };

                tagsContainer.appendChild(btn);
    }

    const sortRecordedTagsBtn = document.getElementById('sortRecordedTagsBtn');
    if (sortRecordedTagsBtn) {
        sortRecordedTagsBtn.addEventListener('click', () => {
            state.sortOrder = state.sortOrder === 'entered' ? 'chronological' : 'entered';
            sortRecordedTagsBtn.textContent = state.sortOrder === 'entered' ? 'Sort: Newest First' : 'Sort: Chronological';
            saveGlobalState();
            renderRecordedTags();
            });
        }

        function renderRecordedTags() {
            recordedTagsList.innerHTML = '';
            if (state.recordedTags.length === 0) {
                recordedTagsList.innerHTML = '<li class="empty-state">No tags recorded yet.</li>';
                return;
            }

        // Filter tags based on current board's showRecordedFrom setting
        const activeBoard = state.boards.find(b => b.id === state.activeBoardId);
        let tagsToShow = [...state.recordedTags];

        if (activeBoard && activeBoard.showRecordedFrom && activeBoard.showRecordedFrom !== '*') {
            // Filter to only show tags from specified boards
            const allowedBoardIds = Array.isArray(activeBoard.showRecordedFrom) 
                ? activeBoard.showRecordedFrom 
                : [activeBoard.showRecordedFrom];
            
            // Include current board
            if (!allowedBoardIds.includes(activeBoard.id)) {
                allowedBoardIds.push(activeBoard.id);
            }

            tagsToShow = tagsToShow.filter(tag => {
                // Check if this tag came from an allowed board
                const tagDef = findTagDefinitionWithBoard(tag.name);
                if (tagDef) {
                    return allowedBoardIds.includes(tagDef.boardId);
                }
                return true; // Show tags without a board match (like player tags)
            });
        }

        if (state.sortOrder === 'entered') {
            // Show newest first (reverse chronological order of entry)
            tagsToShow.reverse();
        } else {
            // Sort by timestamp (ascending)
            tagsToShow.sort((a, b) => a.timestamp - b.timestamp);
        }

        // Update button text based on current sort order
        if (sortRecordedTagsBtn) {
            sortRecordedTagsBtn.textContent = state.sortOrder === 'entered' ? 'Sort: Newest First' : 'Sort: Chronological';
        }

        tagsToShow.forEach(tag => {
            renderRecordedTagItem(tag);
            
            // Render child tags if they exist
            if (tag.childTags && tag.childTags.length > 0) {
                tag.childTags.forEach(childTag => {
                    renderRecordedTagItem(childTag, true, tag.id);
                });
            }
        });
    }

    function findTagDefinitionWithBoard(tagName) {
        // Find the tag definition and which board it belongs to
        for (const board of state.boards) {
            const tag = board.tags.find(t => t.name === tagName);
            if (tag) return { tag, boardId: board.id };
        }
        return null;
    }

    function renderRecordedTagItem(tag, isChild = false, parentId = null) {
                const li = document.createElement('li');
                li.className = 'tag-item';
        li.style.cursor = 'pointer';
        
        // Style child tags differently
        if (isChild) {
            li.style.marginLeft = '20px';
            li.style.borderLeft = '3px solid #3498db';
            li.style.fontSize = '12px';
            li.style.opacity = '0.9';
        }

        // Time span
                const timeSpan = document.createElement('span');
                timeSpan.className = 'tag-time';
        let timeText = formatTime(tag.timestamp);
        if (tag.type === 'duration' && tag.endTime) {
            timeText += ` - ${formatTime(tag.endTime)}`;
        } else if (tag.type === 'duration' && !tag.endTime) {
            timeText += ' (active)';
        }
        timeSpan.textContent = timeText;

        // Info span
                const infoSpan = document.createElement('span');
                let infoText = `${tag.name}`;
                if (tag.player) {
                    infoText += ` (${tag.player.number} ${tag.player.name})`;
                }
                if (tag.description) {
                    infoText += ` - ${tag.description}`;
                }
        if (tag.note) {
            infoText += ` [${tag.note}]`;
        }
        // Show child count for parent tags
        if (tag.childTags && tag.childTags.length > 0) {
            infoText += ` (${tag.childTags.length} details)`;
        }
                infoSpan.textContent = infoText;
                infoSpan.style.flexGrow = '1';
                infoSpan.style.marginLeft = '10px';

        // Click to seek - on the time and info spans
        const seekHandler = (e) => {
            e.stopPropagation();
            seekToTimestamp(tag.timestamp);
        };
        timeSpan.onclick = seekHandler;
        infoSpan.onclick = seekHandler;
        timeSpan.title = 'Click to seek to this timestamp';
        infoSpan.title = 'Click to seek to this timestamp';

        // Note button - Pencil Icon
        const noteBtn = document.createElement('button');
        noteBtn.innerHTML = `<svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>`;
        noteBtn.style.backgroundColor = tag.note ? '#3498db' : 'transparent';
        noteBtn.style.color = tag.note ? 'white' : '#7f8c8d';
        noteBtn.style.border = tag.note ? 'none' : '1px solid #ddd';
        noteBtn.style.padding = '4px';
        noteBtn.style.display = 'flex';
        noteBtn.style.alignItems = 'center';
        noteBtn.style.justifyContent = 'center';
        noteBtn.style.width = '24px';
        noteBtn.style.height = '24px';
        noteBtn.style.borderRadius = '4px';
        noteBtn.style.marginRight = '5px';
        noteBtn.title = 'Add/Edit Note';
        noteBtn.onclick = (e) => {
            e.stopPropagation();
            if (isChild && parentId) {
                // For child tags, find parent and the child
                const parentTag = state.recordedTags.find(t => t.id === parentId);
                if (parentTag) {
                    const childIndex = parentTag.childTags.findIndex(c => c.id === tag.id);
                    openNoteModalForChild(parentTag, childIndex);
                }
            } else {
                openNoteModal(tag);
            }
        };

        // Delete button
                const deleteBtn = document.createElement('button');
                deleteBtn.textContent = 'x';
                deleteBtn.style.backgroundColor = '#e74c3c';
                deleteBtn.style.padding = '2px 6px';
                deleteBtn.style.fontSize = '10px';
                deleteBtn.style.width = 'auto';
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
                    if (confirm("Delete this tag?")) {
                if (isChild && parentId) {
                    // Remove from parent's childTags
                    const parentTag = state.recordedTags.find(t => t.id === parentId);
                    if (parentTag && parentTag.childTags) {
                        parentTag.childTags = parentTag.childTags.filter(c => c.id !== tag.id);
                    }
                } else {
                    // If it's an active duration tag, remove from tracking
                    if (tag.type === 'duration' && !tag.endTime) {
                        delete state.activeDurationTags[tag.name];
                    }
                        state.recordedTags = state.recordedTags.filter(t => t.id !== tag.id);
                }
                        saveSessionState();
                        renderRecordedTags();
                renderTags();
                    }
                };

        // Append elements in correct order: timeSpan, infoSpan, [detailsBtn], noteBtn, deleteBtn
                li.appendChild(timeSpan);
                li.appendChild(infoSpan);

        // Add Details button for duration tags (only on parent tags)
        if (!isChild && tag.type === 'duration') {
            const detailsBtn = document.createElement('button');
            detailsBtn.textContent = '+';
            detailsBtn.style.backgroundColor = '#3498db';
            detailsBtn.style.padding = '2px 6px';
            detailsBtn.style.fontSize = '10px';
            detailsBtn.style.width = 'auto';
            detailsBtn.style.marginRight = '5px';
            detailsBtn.title = 'Add details to this tag';
            detailsBtn.onclick = (e) => {
                e.stopPropagation();
                addDetailsToTag(tag);
            };
            li.appendChild(detailsBtn);
        }

        li.appendChild(noteBtn);
        li.appendChild(deleteBtn);
        recordedTagsList.appendChild(li);
    }

    function openNoteModalForChild(parentTag, childIndex) {
        if (childIndex >= 0 && parentTag.childTags[childIndex]) {
            state.currentEditingTagIndex = state.recordedTags.indexOf(parentTag);
            state.currentEditingChildIndex = childIndex;
            noteInput.value = parentTag.childTags[childIndex].note || '';
            noteModal.style.display = 'flex';
            noteInput.focus();
        }
        }

        function renderRoster() {
            rosterList.innerHTML = '';
            const activeTeam = state.teams.find(t => t.id === state.activeTeamId);
            if (!activeTeam) return;

            activeTeam.players.forEach(player => {
                const li = document.createElement('li');
                li.style.display = 'flex';
                li.style.alignItems = 'center';
                li.style.padding = '5px';
                li.style.borderBottom = '1px solid #eee';

                const numberSpan = document.createElement('span');
                numberSpan.textContent = `#${player.number}`;
                numberSpan.style.width = '30px';
                numberSpan.style.fontWeight = 'bold';

                const nameSpan = document.createElement('span');
                nameSpan.textContent = player.name;
                nameSpan.style.flexGrow = '1';

                const deleteBtn = document.createElement('button');
                deleteBtn.textContent = 'x';
                deleteBtn.style.backgroundColor = '#e74c3c';
                deleteBtn.style.padding = '2px 6px';
                deleteBtn.style.marginLeft = '10px';
                deleteBtn.style.fontSize = '10px';
                deleteBtn.style.width = 'auto';
                deleteBtn.onclick = () => {
                    if (confirm(`Remove ${player.name} from Team?`)) {
                        activeTeam.players = activeTeam.players.filter(p => p.id !== player.id);
                        state.matchState.roster = state.matchState.roster.filter(id => id !== player.id);
                        state.matchState.onField = state.matchState.onField.filter(id => id !== player.id);

                    saveGlobalState();
                    saveSessionState();
                        renderRoster();
                    }
                };

                li.appendChild(numberSpan);
                li.appendChild(nameSpan);
                li.appendChild(deleteBtn);
                rosterList.appendChild(li);
            });
        }

        function renderOnField() {
            onFieldContainer.innerHTML = '';
            const activeTeam = state.teams.find(t => t.id === state.activeTeamId);

        // Combine team players and guests
        let allPlayers = [];
        if (activeTeam) {
            allPlayers = [...activeTeam.players];
        }
        // Add guests
        if (state.matchState.guests) {
            allPlayers = [...allPlayers, ...state.matchState.guests];
        }

        if (allPlayers.length === 0 || state.matchState.onField.length === 0) {
            onFieldContainer.innerHTML = '<div class="empty-state" style="grid-column: 1/-1;">No players on field. Click Lineup to set Starting XI.</div>';
                return;
            }

            state.matchState.onField.forEach(playerId => {
            const player = allPlayers.find(p => p.id === playerId);
            if (!player) return;

                const btn = document.createElement('button');
            btn.className = 'player-btn';
            btn.style.backgroundColor = player.isGuest ? '#8e44ad' : '#34495e';
                btn.style.color = 'white';
                btn.style.padding = '5px';
                btn.style.fontSize = '11px';
                btn.style.borderRadius = '4px';
                btn.style.border = 'none';
                btn.style.cursor = 'pointer';

            btn.innerHTML = `<strong>${player.number}</strong><br>${player.name.split(' ')[0]}`;

                if (subModeToggle.checked) {
                    btn.onclick = () => openSubModal(player);
                btn.style.border = '2px solid #e74c3c';
                btn.title = "Click to substitute out";
                } else {
                    btn.onclick = () => tagPlayer(player);
                    btn.style.border = 'none';
                btn.title = "Click to tag player";
                }

                onFieldContainer.appendChild(btn);
            });
        }

    function renderLineup() {
        lineupList.innerHTML = '';
        const activeTeam = state.teams.find(t => t.id === state.activeTeamId);

        // Render team players
        if (activeTeam) {
            activeTeam.players.forEach(player => {
                renderLineupItem(player, false);
            });
        }

        // Render guest players
        if (state.matchState.guests) {
            state.matchState.guests.forEach(guest => {
                renderLineupItem(guest, true);
            });
        }
    }

    function renderLineupItem(player, isGuest) {
        const li = document.createElement('li');
        li.style.display = 'flex';
        li.style.alignItems = 'center';
        li.style.padding = '5px';
        li.style.borderBottom = '1px solid #eee';
        if (isGuest) {
            li.style.backgroundColor = '#f3e5f5';
        }

        const numberSpan = document.createElement('span');
        numberSpan.textContent = `#${player.number}`;
        numberSpan.style.width = '30px';
        numberSpan.style.fontWeight = 'bold';

        const nameSpan = document.createElement('span');
        nameSpan.textContent = player.name + (isGuest ? ' (Guest)' : '');
        nameSpan.style.flexGrow = '1';

        const isAvailable = state.matchState.roster.includes(player.id);

        const availableCheckbox = document.createElement('input');
        availableCheckbox.type = 'checkbox';
        availableCheckbox.checked = isAvailable;
        availableCheckbox.title = "Available for Match (In Squad)";
        availableCheckbox.style.marginRight = '15px';
        availableCheckbox.onchange = () => {
            if (availableCheckbox.checked) {
                if (!state.matchState.roster.includes(player.id)) {
                    state.matchState.roster.push(player.id);
                }
            } else {
                state.matchState.roster = state.matchState.roster.filter(id => id !== player.id);
                state.matchState.onField = state.matchState.onField.filter(id => id !== player.id);
            }
            saveSessionState();
            renderLineup();
            renderOnField();
        };

        const isStarter = state.matchState.onField.includes(player.id);
        const starterCheckbox = document.createElement('input');
        starterCheckbox.type = 'checkbox';
        starterCheckbox.checked = isStarter;
        starterCheckbox.title = "Starting XI";
        starterCheckbox.disabled = !isAvailable;
        starterCheckbox.onchange = () => {
            if (starterCheckbox.checked) {
                if (!state.matchState.onField.includes(player.id)) {
                    state.matchState.onField.push(player.id);
                }
            } else {
                state.matchState.onField = state.matchState.onField.filter(id => id !== player.id);
            }
            saveSessionState();
            renderOnField();
        };

        li.appendChild(numberSpan);
        li.appendChild(nameSpan);
        li.appendChild(availableCheckbox);
        li.appendChild(starterCheckbox);

        // Delete button for guests
        if (isGuest) {
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'x';
            deleteBtn.style.backgroundColor = '#e74c3c';
            deleteBtn.style.padding = '2px 6px';
            deleteBtn.style.marginLeft = '5px';
            deleteBtn.style.fontSize = '10px';
            deleteBtn.style.width = 'auto';
            deleteBtn.onclick = () => {
                if (confirm(`Remove guest ${player.name}?`)) {
                    state.matchState.guests = state.matchState.guests.filter(g => g.id !== player.id);
                    state.matchState.roster = state.matchState.roster.filter(id => id !== player.id);
                    state.matchState.onField = state.matchState.onField.filter(id => id !== player.id);
                    saveSessionState();
                    renderLineup();
                    renderOnField();
                }
            };
            li.appendChild(deleteBtn);
        }

        lineupList.appendChild(li);
    }

    function renderAvailableTags() {
        availableTagsContainer.innerHTML = '';

        if (state.boardTagsList.length === 0) {
            availableTagsContainer.innerHTML = '<span style="color: #bdc3c7; font-style: italic;">No categories defined. Click "Manage" to add.</span>';
        } else {
            const tagsHtml = state.boardTagsList.map(tag =>
                `<span style="display: inline-block; background-color: #e8daef; color: #6c3483; padding: 3px 8px; border-radius: 3px; margin-right: 5px; margin-bottom: 5px; font-size: 11px;">${tag}</span>`
            ).join('');
            availableTagsContainer.innerHTML = tagsHtml;
        }
    }

    function renderBoardTags() {
        boardTagsContainer.innerHTML = '';
        const activeBoard = state.boards.find(b => b.id === state.activeBoardId);
        if (!activeBoard) return;

        if (!activeBoard.boardTags || activeBoard.boardTags.length === 0) {
            boardTagsContainer.innerHTML = '<span style="color: #bdc3c7; font-style: italic;">No categories</span>';
        } else {
            const tagsHtml = activeBoard.boardTags.map(tag =>
                `<span style="display: inline-block; background-color: #ecf0f1; color: #2c3e50; padding: 3px 8px; border-radius: 3px; margin-right: 5px; margin-bottom: 5px; font-size: 11px;">${tag}</span>`
            ).join('');
            boardTagsContainer.innerHTML = tagsHtml;
        }
    }

    function renderBoardComposition() {
        const activeBoard = state.boards.find(b => b.id === state.activeBoardId);
        if (!activeBoard) return;

        // Display include tags from
        if (includeFromText) {
            if (activeBoard.includeTags && activeBoard.includeTags.from && activeBoard.includeTags.from.length > 0) {
                const boardNames = activeBoard.includeTags.from
                    .map(id => state.boards.find(b => b.id === id)?.name || id)
                    .join(', ');
                includeFromText.textContent = boardNames + ` (${activeBoard.includeTags.position || 'top'})`;
            } else {
                includeFromText.textContent = 'None';
            }
        }

        // Display show recorded from
        if (showRecordedText) {
            if (!activeBoard.showRecordedFrom || activeBoard.showRecordedFrom === '*') {
                showRecordedText.textContent = 'All boards';
            } else if (Array.isArray(activeBoard.showRecordedFrom)) {
                const boardNames = activeBoard.showRecordedFrom
                    .map(id => state.boards.find(b => b.id === id)?.name || id)
                    .join(', ');
                showRecordedText.textContent = boardNames || 'None selected';
            } else {
                showRecordedText.textContent = activeBoard.showRecordedFrom;
            }
        }
    }

    function renderCompositionModal() {
        const activeBoard = state.boards.find(b => b.id === state.activeBoardId);
        if (!activeBoard) return;

        // Ensure board has composition properties
        if (!activeBoard.includeTags) {
            activeBoard.includeTags = { from: [], position: 'top' };
        }
        if (!activeBoard.showRecordedFrom) {
            activeBoard.showRecordedFrom = '*';
        }

        // Render include boards checkboxes
        includeBoardsCheckboxes.innerHTML = '';
        state.boards.forEach(board => {
            if (board.id === activeBoard.id) return; // Skip current board
            
            const label = document.createElement('label');
            label.style.display = 'flex';
            label.style.alignItems = 'center';
            label.style.padding = '4px';
            label.style.cursor = 'pointer';
            label.style.fontSize = '12px';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = board.id;
            checkbox.checked = activeBoard.includeTags.from.includes(board.id);
            checkbox.style.marginRight = '8px';

            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(board.name));
            includeBoardsCheckboxes.appendChild(label);
        });

        // Set position select
        includePositionSelect.value = activeBoard.includeTags.position || 'top';

        // Set show recorded radio
        const showAll = !activeBoard.showRecordedFrom || activeBoard.showRecordedFrom === '*';
        document.querySelectorAll('input[name="show-recorded"]').forEach(radio => {
            radio.checked = (radio.value === 'all' && showAll) || 
                           (radio.value === 'selected' && !showAll);
        });

        // Render show recorded boards checkboxes
        showRecordedCheckboxes.innerHTML = '';
        state.boards.forEach(board => {
            const label = document.createElement('label');
            label.style.display = 'flex';
            label.style.alignItems = 'center';
            label.style.padding = '4px';
            label.style.cursor = 'pointer';
            label.style.fontSize = '12px';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = board.id;
            checkbox.checked = Array.isArray(activeBoard.showRecordedFrom) && 
                              activeBoard.showRecordedFrom.includes(board.id);
            checkbox.style.marginRight = '8px';

            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(board.name));
            showRecordedCheckboxes.appendChild(label);
        });
    }

    function renderBoardTagsCheckboxes(currentTags = []) {
        boardTagsCheckboxes.innerHTML = '';

        if (state.boardTagsList.length === 0) {
            boardTagsCheckboxes.innerHTML = '<div style="text-align: center; color: #95a5a6; padding: 10px;">No categories available. Add categories in Settings first.</div>';
            return;
        }

        state.boardTagsList.forEach(tag => {
            const label = document.createElement('label');
            label.style.display = 'flex';
            label.style.alignItems = 'center';
            label.style.padding = '4px';
            label.style.cursor = 'pointer';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = tag;
            checkbox.checked = currentTags.includes(tag);
            checkbox.style.marginRight = '8px';

            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(tag));
            boardTagsCheckboxes.appendChild(label);
        });
    }

    function renderSettingsTagsList() {
        settingsTagsList.innerHTML = '';
        const activeBoard = state.boards.find(b => b.id === state.activeBoardId);
        if (!activeBoard) return;

        if (activeBoard.tags.length === 0) {
            settingsTagsList.innerHTML = '<li class="empty-state">No tags in this board.</li>';
            return;
        }

        activeBoard.tags.forEach(tag => {
            const li = document.createElement('li');
            li.className = 'tag-item';
            li.style.display = 'flex';
            li.style.justifyContent = 'space-between';
            li.style.alignItems = 'center';

            const infoSpan = document.createElement('span');
            infoSpan.textContent = `${tag.name} (${tag.type})`;
            infoSpan.style.color = tag.color;
            infoSpan.style.fontWeight = 'bold';

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Delete';
            deleteBtn.style.backgroundColor = '#e74c3c';
            deleteBtn.style.padding = '5px 10px';
            deleteBtn.style.fontSize = '12px';
            deleteBtn.style.width = 'auto';
            deleteBtn.style.marginLeft = '10px';

            deleteBtn.onclick = () => {
                if (confirm(`Delete tag "${tag.name}"?`)) {
                    activeBoard.tags = activeBoard.tags.filter(t => t.id !== tag.id);
                    saveGlobalState();
                    render();
                }
            };

            li.appendChild(infoSpan);
            li.appendChild(deleteBtn);
            settingsTagsList.appendChild(li);
        });
    }

    function renderQuickList() {
        const quickListContainer = document.getElementById('quick-list-boards');
        if (!quickListContainer) return;

        quickListContainer.innerHTML = '';

        if (state.boards.length === 0) {
            quickListContainer.innerHTML = '<li class="empty-state">No boards available</li>';
            return;
        }

        // Group boards by tags
        const boardsByTag = {};
        const untaggedBoards = [];

        state.boards.forEach(board => {
            if (board.boardTags && board.boardTags.length > 0) {
                board.boardTags.forEach(tag => {
                    if (!boardsByTag[tag]) {
                        boardsByTag[tag] = [];
                    }
                    boardsByTag[tag].push(board);
                });
            } else {
                untaggedBoards.push(board);
            }
        });

        // Render boards grouped by tags
        Object.keys(boardsByTag).sort().forEach(tag => {
            // Tag header
            const tagHeader = document.createElement('li');
            tagHeader.style.fontWeight = 'bold';
            tagHeader.style.fontSize = '11px';
            tagHeader.style.color = '#7f8c8d';
            tagHeader.style.marginTop = '8px';
            tagHeader.style.marginBottom = '4px';
            tagHeader.textContent = tag;
            quickListContainer.appendChild(tagHeader);

            // Boards under this tag
            boardsByTag[tag].forEach(board => {
                quickListContainer.appendChild(createQuickListItem(board));
            });
        });

        // Render untagged boards
        if (untaggedBoards.length > 0) {
            if (Object.keys(boardsByTag).length > 0) {
                const otherHeader = document.createElement('li');
                otherHeader.style.fontWeight = 'bold';
                otherHeader.style.fontSize = '11px';
                otherHeader.style.color = '#7f8c8d';
                otherHeader.style.marginTop = '8px';
                otherHeader.style.marginBottom = '4px';
                otherHeader.textContent = 'Other';
                quickListContainer.appendChild(otherHeader);
            }

            untaggedBoards.forEach(board => {
                quickListContainer.appendChild(createQuickListItem(board));
            });
        }
    }

    function createQuickListItem(board) {
        const li = document.createElement('li');
        const isSelected = state.quickListBoardIds.includes(board.id);

        // Create styled button instead of checkbox
        const itemDiv = document.createElement('div');
        itemDiv.style.display = 'flex';
        itemDiv.style.alignItems = 'center';
        itemDiv.style.padding = '8px';
        itemDiv.style.fontSize = '13px';
        itemDiv.style.cursor = 'pointer';
        itemDiv.style.borderRadius = '4px';
        itemDiv.style.marginBottom = '2px';
        itemDiv.style.transition = 'all 0.2s';

        if (isSelected) {
            itemDiv.style.backgroundColor = '#27ae60';
            itemDiv.style.color = 'white';
            itemDiv.style.fontWeight = '500';
        } else {
            itemDiv.style.backgroundColor = '#f8f9fa';
            itemDiv.style.color = '#333';
        }

        // Hover effect
        itemDiv.onmouseenter = () => {
            if (isSelected) {
                itemDiv.style.backgroundColor = '#229954';
            } else {
                itemDiv.style.backgroundColor = '#e9ecef';
            }
        };
        itemDiv.onmouseleave = () => {
            if (isSelected) {
                itemDiv.style.backgroundColor = '#27ae60';
            } else {
                itemDiv.style.backgroundColor = '#f8f9fa';
            }
        };

        itemDiv.onclick = () => {
            if (state.quickListBoardIds.includes(board.id)) {
                state.quickListBoardIds = state.quickListBoardIds.filter(id => id !== board.id);
            } else {
                state.quickListBoardIds.push(board.id);
            }
            saveSessionState();
            renderBoardSelect();
            renderQuickList();
        };

        itemDiv.textContent = board.name;
        li.appendChild(itemDiv);
        return li;
    }

    // --- Tagging Functions ---
    function triggerTag(tag) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, { action: "getTimestamp" }, (response) => {
                    const timestamp = (response && response.timestamp) ? response.timestamp : 0;

                    // Check if we're in sub-tag mode (adding details to a parent tag)
                    if (state.addingToParentTagId) {
                        const parentTag = state.recordedTags.find(t => t.id === state.addingToParentTagId);
                        if (parentTag) {
                            // Initialize childTags array if needed
                            if (!parentTag.childTags) {
                                parentTag.childTags = [];
                            }

                            // Create child tag
                            const childTag = {
                                id: Date.now().toString(),
                                name: tag.name,
                                type: tag.type,
                                color: tag.color,
                                timestamp: timestamp
                            };

                            if (tag.description) {
                                childTag.description = tag.description;
                            }

                            parentTag.childTags.push(childTag);
                            
                            saveSessionState();
                            renderRecordedTags();
                            renderTags();
                            return;
                        }
                    }

                    // Normal tag recording (not in sub-tag mode)
                    // Handle duration tags - toggle behavior
                    if (tag.type === 'duration') {
                        const activeTagId = state.activeDurationTags[tag.name];

                        if (activeTagId) {
                            // Stop the active duration tag
                            const activeTag = state.recordedTags.find(t => t.id === activeTagId);
                            if (activeTag) {
                                activeTag.endTime = timestamp;
                                activeTag.duration = timestamp - activeTag.timestamp;
                            }
                            delete state.activeDurationTags[tag.name];
                        } else {
                            // Start new duration tag
                            const newTag = {
                                id: Date.now().toString(),
                                name: tag.name,
                                type: tag.type,
                                color: tag.color,
                                hotkey: tag.hotkey,
                                timestamp: timestamp,
                                endTime: null,
                                duration: null,
                                childTags: [] // Initialize child tags array
                            };
                            state.recordedTags.push(newTag);
                            state.activeDurationTags[tag.name] = newTag.id;
                        }
                    } else {
                        // Event tag - simple recording
                        const newTag = {
                            id: Date.now().toString(),
                            name: tag.name,
                            type: tag.type,
                            color: tag.color,
                            hotkey: tag.hotkey,
                            timestamp: timestamp
                        };

                        if (tag.description) {
                            newTag.description = tag.description;
                        }

                        state.recordedTags.push(newTag);
                    }

                    // Track when we recorded this tag for player association
                    state.lastTagRealTime = Date.now();

                    saveSessionState();
                    renderRecordedTags();
                    renderTags(); // Update button state for duration tags
                });
            }
        });
    }

        function tagPlayer(player) {
        const now = Date.now();

            // Find the last recorded tag
            if (state.recordedTags.length > 0) {
                const lastTag = state.recordedTags[state.recordedTags.length - 1];

            // Check if within 10 seconds (using real time, not video time)
            const timeSinceLastTag = state.lastTagRealTime ? (now - state.lastTagRealTime) / 1000 : Infinity;

            // If last tag is an event, recent (< 10 seconds), and has no player
            if (lastTag.type === 'event' && !lastTag.player && timeSinceLastTag < 10) {
                    lastTag.player = {
                        id: player.id,
                        name: player.name,
                        number: player.number
                    };

                    saveSessionState();
                    renderRecordedTags();
                    return;
                }
            }

            // Fallback: Record a standalone player tag
            triggerTag({
                name: `${player.number} ${player.name}`,
                type: "player",
            color: player.isGuest ? "#8e44ad" : "#34495e"
        });
    }

    function seekToTimestamp(timestamp) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: "seekToTimestamp",
                    timestamp: timestamp
                });
            }
        });
    }

    // --- Sub-Tag / Detail Mode Functions ---
    function openSubBoard(boardId, parentTagId = null) {
        const board = state.boards.find(b => b.id === boardId);
        if (!board) {
            console.log("Sub-board not found:", boardId);
            return;
        }

        // If parentTagId provided, enter sub-tag mode
        if (parentTagId) {
            state.addingToParentTagId = parentTagId;
            // Store current video position as resume point
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0]) {
                    chrome.tabs.sendMessage(tabs[0].id, { action: "getTimestamp" }, (response) => {
                        state.resumeTimestamp = (response && response.timestamp) ? response.timestamp : null;
                    });
                }
            });
        }

        // Switch to the sub-board
        state.activeBoardId = boardId;
        saveGlobalState();
        render();
    }

    function exitSubTagMode() {
        state.addingToParentTagId = null;
        
        // Optionally seek back to resume point
        if (state.resumeTimestamp !== null) {
            seekToTimestamp(state.resumeTimestamp);
            state.resumeTimestamp = null;
        }
        
        render();
    }

    function addDetailsToTag(parentTag) {
        // Enter sub-tag mode for an existing tag
        state.addingToParentTagId = parentTag.id;
        
        // Seek to the tag's timestamp
        seekToTimestamp(parentTag.timestamp);
        
        // Store current position for resume
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, { action: "getTimestamp" }, (response) => {
                    state.resumeTimestamp = (response && response.timestamp) ? response.timestamp : null;
                });
            }
        });

        // If the tag has a subTagBoard defined, switch to it
        // Otherwise stay on current board
        const tagDef = findTagDefinition(parentTag.name);
        if (tagDef && tagDef.subTagBoard) {
            state.activeBoardId = tagDef.subTagBoard;
            saveGlobalState();
        }
        
        render();
    }

    function findTagDefinition(tagName) {
        // Find the tag definition across all boards
        for (const board of state.boards) {
            const tag = board.tags.find(t => t.name === tagName);
            if (tag) return tag;
        }
        return null;
    }

    // --- Substitution Modal ---
        let pendingSubOutId = null;

        function openSubModal(playerOut) {
            pendingSubOutId = playerOut.id;
            subOutName.textContent = playerOut.name;
            subInSelect.innerHTML = '';

            const activeTeam = state.teams.find(t => t.id === state.activeTeamId);

        // Combine team players and guests
        let allPlayers = [];
        if (activeTeam) {
            allPlayers = [...activeTeam.players];
        }
        if (state.matchState.guests) {
            allPlayers = [...allPlayers, ...state.matchState.guests];
        }

        // Filter players NOT on field AND are in roster (available)
        const benchPlayers = allPlayers.filter(p =>
            !state.matchState.onField.includes(p.id) &&
            state.matchState.roster.includes(p.id)
        );

            if (benchPlayers.length === 0) {
                const option = document.createElement('option');
                option.text = "No subs available";
                subInSelect.appendChild(option);
                confirmSubBtn.disabled = true;
            } else {
                benchPlayers.forEach(p => {
                    const option = document.createElement('option');
                    option.value = p.id;
                option.textContent = `#${p.number} ${p.name}${p.isGuest ? ' (Guest)' : ''}`;
                    subInSelect.appendChild(option);
                });
                confirmSubBtn.disabled = false;
            }

            subModal.style.display = 'flex';
        }

    // --- Event Listeners Setup ---
    function setupEventListeners() {
        // H1 click to fetch game title
        const h1Element = document.querySelector('h1');
        if (h1Element) {
            h1Element.addEventListener('click', () => {
                if (state.currentMatchId !== 'default_session') {
                    fetchGameTitle();
                }
            });
        }

        // Note Modal
        saveNoteBtn.addEventListener('click', () => {
            if (state.currentEditingTagIndex !== null && state.currentEditingTagIndex >= 0) {
                const tag = state.recordedTags[state.currentEditingTagIndex];
                if (tag) {
                    // Check if we're editing a child tag
                    if (state.currentEditingChildIndex !== null && state.currentEditingChildIndex >= 0) {
                        if (tag.childTags && tag.childTags[state.currentEditingChildIndex]) {
                            tag.childTags[state.currentEditingChildIndex].note = noteInput.value.trim();
                        }
                    } else {
                        tag.note = noteInput.value.trim();
                    }
                    saveSessionState();
                    renderRecordedTags();
                }
            }
            noteModal.style.display = 'none';
            state.currentEditingTagIndex = null;
            state.currentEditingChildIndex = null;
        });

        cancelNoteBtn.addEventListener('click', () => {
            noteModal.style.display = 'none';
            state.currentEditingTagIndex = null;
            state.currentEditingChildIndex = null;
        });

        // Sub mode toggle
        subModeToggle.addEventListener('change', renderOnField);

        // Confirm substitution
        confirmSubBtn.addEventListener('click', () => {
            const subInId = subInSelect.value;
            if (subInId && pendingSubOutId) {
                // Update onField state
                state.matchState.onField = state.matchState.onField.map(id =>
                    id === pendingSubOutId ? subInId : id
                );

                // Find players for recording
                const activeTeam = state.teams.find(t => t.id === state.activeTeamId);
                let allPlayers = activeTeam ? [...activeTeam.players] : [];
                if (state.matchState.guests) {
                    allPlayers = [...allPlayers, ...state.matchState.guests];
                }

                const playerOut = allPlayers.find(p => p.id === pendingSubOutId);
                const playerIn = allPlayers.find(p => p.id === subInId);

                if (playerOut && playerIn) {
                    triggerTag({
                        name: "Substitution",
                        type: "event",
                        color: "#95a5a6",
                        description: `Out: ${playerOut.name}, In: ${playerIn.name}`
                    });
                }

                saveSessionState();
                renderOnField();
                subModal.style.display = 'none';
                pendingSubOutId = null;
            }
        });

        cancelSubBtn.addEventListener('click', () => {
            subModal.style.display = 'none';
            pendingSubOutId = null;
        });

        // Navigation
        settingsBtn.addEventListener('click', () => {
            state.currentView = 'settings';
            render();
        });

        backToMainBtn.addEventListener('click', () => {
            state.currentView = 'main';
            render();
        });

        // Settings Tabs
        tabSettingsBoards.addEventListener('click', () => {
            state.activeSettingsTab = 'boards';
            render();
        });

        tabSettingsTeams.addEventListener('click', () => {
            state.activeSettingsTab = 'teams';
            render();
        });

        // Main View Selects
        mainBoardSelect.addEventListener('change', (e) => {
            state.activeBoardId = e.target.value;
            saveGlobalState();
            render();
        });

        // Settings View Selects
        settingsBoardSelect.addEventListener('change', (e) => {
            state.activeBoardId = e.target.value;
            saveState();
            render();
        });

        editBoardTagsBtn.addEventListener('click', () => {
            const activeBoard = state.boards.find(b => b.id === state.activeBoardId);
            if (!activeBoard) return;

            const currentTags = activeBoard.boardTags || [];
            renderBoardTagsCheckboxes(currentTags);
            boardNameInput.value = activeBoard.name;
            boardModal.style.display = 'flex';

            // Change modal title and button text
            const modalTitle = boardModal.querySelector('h3');
            if (modalTitle) modalTitle.textContent = 'Edit Board Categories';
            saveBoardBtn.textContent = 'Save';

            // Override save handler for editing
            const originalHandler = saveBoardBtn.onclick;
            saveBoardBtn.onclick = () => {
                const selectedTags = Array.from(boardTagsCheckboxes.querySelectorAll('input[type="checkbox"]:checked'))
                    .map(cb => cb.value);

                activeBoard.boardTags = selectedTags;
                saveGlobalState();
                render();
                boardModal.style.display = 'none';

                // Restore original state
                if (modalTitle) modalTitle.textContent = 'New Board';
                saveBoardBtn.textContent = 'Create';
                saveBoardBtn.onclick = originalHandler;
            };
        });

        manageBoardTagsBtn.addEventListener('click', () => {
            const currentTags = state.boardTagsList.join(', ');
            const newTags = prompt('Manage available categories (comma-separated):\n\nThese will be available when creating or editing boards.', currentTags);

            if (newTags !== null) {
                state.boardTagsList = newTags ? newTags.split(',').map(t => t.trim()).filter(t => t) : [];
                saveGlobalState();
                render();
            }
        });

        // Board Composition Modal
        if (editCompositionBtn) {
            editCompositionBtn.addEventListener('click', () => {
                renderCompositionModal();
                compositionModal.style.display = 'flex';
            });
        }

        if (saveCompositionBtn) {
            saveCompositionBtn.addEventListener('click', () => {
                const activeBoard = state.boards.find(b => b.id === state.activeBoardId);
                if (!activeBoard) return;

                // Save include tags from
                const selectedIncludeBoards = Array.from(
                    includeBoardsCheckboxes.querySelectorAll('input[type="checkbox"]:checked')
                ).map(cb => cb.value);

                activeBoard.includeTags = {
                    from: selectedIncludeBoards,
                    position: includePositionSelect.value
                };

                // Save show recorded from
                const showAllRadio = document.querySelector('input[name="show-recorded"][value="all"]');
                if (showAllRadio && showAllRadio.checked) {
                    activeBoard.showRecordedFrom = '*';
                } else {
                    const selectedShowBoards = Array.from(
                        showRecordedCheckboxes.querySelectorAll('input[type="checkbox"]:checked')
                    ).map(cb => cb.value);
                    activeBoard.showRecordedFrom = selectedShowBoards.length > 0 ? selectedShowBoards : '*';
                }

                saveGlobalState();
                render();
                compositionModal.style.display = 'none';
            });
        }

        if (cancelCompositionBtn) {
            cancelCompositionBtn.addEventListener('click', () => {
                compositionModal.style.display = 'none';
            });
        }

        settingsTeamSelect.addEventListener('change', (e) => {
            state.activeTeamId = e.target.value;
            saveState();
            render();
        });

        // Team Management
        newTeamBtn.addEventListener('click', () => {
            teamNameInput.value = '';
            teamModal.style.display = 'flex';
        });

        deleteTeamBtn.addEventListener('click', () => {
            if (!state.activeTeamId) return;
            if (confirm("Delete this team?")) {
                state.teams = state.teams.filter(t => t.id !== state.activeTeamId);
                state.activeTeamId = state.teams.length > 0 ? state.teams[0].id : null;
                saveGlobalState();
                render();
            }
        });

        saveTeamBtn.addEventListener('click', () => {
            const name = teamNameInput.value.trim();
            if (name) {
                const newTeam = {
                    id: Date.now().toString(),
                    name: name,
                    players: []
                };
                state.teams.push(newTeam);
                state.activeTeamId = newTeam.id;
                saveGlobalState();
                render();
                teamModal.style.display = 'none';
            }
        });

        cancelTeamBtn.addEventListener('click', () => {
            teamModal.style.display = 'none';
        });

        // Player Management
        addPlayerBtn.addEventListener('click', () => {
            const number = playerNumberInput.value.trim();
            const name = playerNameInput.value.trim();

            if (name && number) {
                const activeTeam = state.teams.find(t => t.id === state.activeTeamId);
                if (activeTeam) {
                    activeTeam.players.push({
                        id: Date.now().toString(),
                        number: number,
                        name: name
                    });
                    activeTeam.players.sort((a, b) => parseInt(a.number) - parseInt(b.number));

                    saveGlobalState();
                    renderRoster();

                    playerNumberInput.value = '';
                    playerNameInput.value = '';
                    playerNumberInput.focus();
                }
            }
        });

        // Lineup Management
        lineupBtn.addEventListener('click', () => {
            renderLineup();
            lineupModal.style.display = 'flex';
        });

        closeLineupBtn.addEventListener('click', () => {
            lineupModal.style.display = 'none';
        });

        // Add Guest Player button in lineup modal
        const addGuestBtn = document.getElementById('add-guest-btn');
        if (addGuestBtn) {
            addGuestBtn.addEventListener('click', () => {
                const number = prompt('Guest player number:');
                if (!number) return;
                const name = prompt('Guest player name:');
                if (!name) return;

                const guest = {
                    id: 'guest_' + Date.now().toString(),
                    number: number.trim(),
                    name: name.trim(),
                    isGuest: true
                };

                if (!state.matchState.guests) {
                    state.matchState.guests = [];
                }
                state.matchState.guests.push(guest);
                state.matchState.roster.push(guest.id);

                saveSessionState();
                renderLineup();
            });
        }

        // Board Management
        newBoardBtn.addEventListener('click', () => {
            boardNameInput.value = '';
            renderBoardTagsCheckboxes([]);
            boardModal.style.display = 'flex';
        });

        deleteBoardBtn.addEventListener('click', () => {
            if (state.boards.length <= 1) {
                alert("Cannot delete the last board.");
                return;
            }
            if (confirm("Are you sure you want to delete this board?")) {
                state.boards = state.boards.filter(b => b.id !== state.activeBoardId);
                state.activeBoardId = state.boards[0].id;
                saveGlobalState();
                render();
            }
        });

        saveBoardBtn.addEventListener('click', () => {
            const name = boardNameInput.value.trim();

            // Get selected tags from checkboxes
            const selectedTags = Array.from(boardTagsCheckboxes.querySelectorAll('input[type="checkbox"]:checked'))
                .map(cb => cb.value);

            if (name) {
                const newBoard = {
                    id: Date.now().toString(),
                    name: name,
                    boardTags: selectedTags, // Board category tags
                    tags: [] // Tag buttons for events/durations
                };
                state.boards.push(newBoard);
                state.activeBoardId = newBoard.id;
                saveGlobalState();
                render();
                boardModal.style.display = 'none';
            }
        });

        cancelBoardBtn.addEventListener('click', () => {
            boardModal.style.display = 'none';
        });

        // Tag Management
        addTagBtn.addEventListener('click', () => {
            tagNameInput.value = '';
            tagHotkeyInput.value = '';
            // Set default color based on default type (event)
            tagTypeInput.value = 'event';
            tagColorInput.value = TAG_TYPE_COLORS.event;
            
            // Populate subboard select
            populateSubboardSelect('');
            
            tagModal.style.display = 'flex';
        });

        // Auto-switch color when tag type changes
        tagTypeInput.addEventListener('change', (e) => {
            const type = e.target.value;
            if (TAG_TYPE_COLORS[type]) {
                tagColorInput.value = TAG_TYPE_COLORS[type];
            }
        });

        saveTagBtn.addEventListener('click', () => {
            const name = tagNameInput.value.trim();
            const type = tagTypeInput.value;
            const hotkey = tagHotkeyInput.value.toLowerCase();
            const color = tagColorInput.value;
            const subTagBoard = tagSubboardInput ? tagSubboardInput.value : null;

            if (name) {
                const activeBoard = state.boards.find(b => b.id === state.activeBoardId);
                if (activeBoard) {
                    activeBoard.tags.push({
                        id: Date.now().toString(),
                        name: name,
                        type: type,
                        hotkey: hotkey,
                        color: color,
                        subTagBoard: subTagBoard || null
                    });
                    saveGlobalState();
                    render();
                    tagModal.style.display = 'none';
                }
            }
        });

        cancelTagBtn.addEventListener('click', () => {
            tagModal.style.display = 'none';
        });

        // Hotkey Input Handler
        tagHotkeyInput.addEventListener('keydown', (e) => {
            e.preventDefault();
            if (e.key.length === 1) {
                tagHotkeyInput.value = e.key;
            }
        });

        // Export Data
        exportBtn.addEventListener('click', exportData);

        // Storage Listener (Real-time updates)
        chrome.storage.onChanged.addListener((changes, namespace) => {
            if (namespace === 'local') {
                if (changes.tagBoards) {
                    state.boards = changes.tagBoards.newValue;
                    renderBoardSelect();
                    renderTags();
                }
                if (changes.activeBoardId) {
                    state.activeBoardId = changes.activeBoardId.newValue;
                    renderBoardSelect();
                    renderTags();
                }
                if (changes.teams) {
                    state.teams = changes.teams.newValue || [];
                    renderTeamSelect();
                    renderRoster();
                }
                if (changes.activeTeamId) {
                    state.activeTeamId = changes.activeTeamId.newValue;
                    renderTeamSelect();
                    renderRoster();
                }
                if (changes.games) {
                    const games = changes.games.newValue || {};
                    const session = games[state.currentMatchId];

                    if (session) {
                        if (JSON.stringify(state.recordedTags) !== JSON.stringify(session.tags)) {
                            state.recordedTags = session.tags || [];
                            // Rebuild activeDurationTags
                            state.activeDurationTags = {};
                            state.recordedTags.forEach(tag => {
                                if (tag.type === 'duration' && !tag.endTime) {
                                    state.activeDurationTags[tag.name] = tag.id;
                                }
                            });
                            renderRecordedTags();
                            renderTags();
                        }
                        if (JSON.stringify(state.matchState) !== JSON.stringify(session.matchState)) {
                            state.matchState = session.matchState || { onField: [], roster: [], guests: [] };
                            renderOnField();
                        }
                        if (JSON.stringify(state.quickListBoardIds) !== JSON.stringify(session.quickListBoardIds)) {
                            state.quickListBoardIds = session.quickListBoardIds || [];
                            renderBoardSelect();
                            renderQuickList();
                        }
                    }
                }
            }
        });

        // Global Hotkey Listener (Popup)
        let hotkeyBuffer = '';
        let hotkeyTimeout = null;
        const HOTKEY_DELAY = 400;
        let pendingTagTrigger = null;

        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
                return;
            }

            // Check for Number Keys (Player Hotkeys)
            if (/^\d$/.test(e.key)) {
                e.preventDefault();
                hotkeyBuffer += e.key;

                if (hotkeyTimeout) clearTimeout(hotkeyTimeout);

                hotkeyTimeout = setTimeout(() => {
                    const numberVal = parseInt(hotkeyBuffer);
                    hotkeyBuffer = '';

                    const activeTeam = state.teams.find(t => t.id === state.activeTeamId);
                    let allPlayers = activeTeam ? [...activeTeam.players] : [];
                    if (state.matchState.guests) {
                        allPlayers = [...allPlayers, ...state.matchState.guests];
                    }

                    const player = allPlayers.find(p => parseInt(p.number) === numberVal);

                        if (player && state.matchState.onField.includes(player.id)) {
                            if (subModeToggle.checked) {
                                openSubModal(player);
                            } else {
                                tagPlayer(player);
                        }
                    }
                }, HOTKEY_DELAY);
                return;
            }

            const activeBoard = state.boards.find(b => b.id === state.activeBoardId);
            if (!activeBoard) return;

            // Find tag with this hotkey (check current board and included boards)
            let tag = activeBoard.tags.find(t => t.hotkey === e.key);
            let tagSourceBoard = activeBoard;

            // Also check included boards
            if (!tag && activeBoard.includeTags && activeBoard.includeTags.from) {
                for (const boardId of activeBoard.includeTags.from) {
                    const includedBoard = state.boards.find(b => b.id === boardId);
                    if (includedBoard) {
                        const foundTag = includedBoard.tags.find(t => t.hotkey === e.key);
                        if (foundTag) {
                            tag = foundTag;
                            tagSourceBoard = includedBoard;
                            break;
                        }
                    }
                }
            }

            if (tag) {
                e.preventDefault();
                
                const now = Date.now();
                const lastPress = state.lastHotkeyPress[e.key];

                // Check for double-tap
                if (lastPress && (now - lastPress) < DOUBLE_TAP_MS) {
                    // Double-tap detected! Clear single-tap timeout
                    if (pendingTagTrigger) {
                        clearTimeout(pendingTagTrigger);
                        pendingTagTrigger = null;
                    }
                    
                    // Trigger tag and open sub-board if available
                triggerTag(tag);
                    
                    if (tag.subTagBoard) {
                        // After triggering, enter sub-tag mode with the most recent tag
                        setTimeout(() => {
                            const latestTag = state.recordedTags[state.recordedTags.length - 1];
                            if (latestTag) {
                                openSubBoard(tag.subTagBoard, latestTag.id);
                            }
                        }, 50);
                    }
                    
                    state.lastHotkeyPress[e.key] = 0; // Reset to prevent triple-tap issues
                } else {
                    // First press - set up delayed trigger
                    state.lastHotkeyPress[e.key] = now;
                    
                    // If tag has a sub-board, delay the trigger slightly to detect double-tap
                    if (tag.subTagBoard) {
                        pendingTagTrigger = setTimeout(() => {
                            triggerTag(tag);
                            pendingTagTrigger = null;
                        }, DOUBLE_TAP_MS);
                    } else {
                        // No sub-board, trigger immediately
                        triggerTag(tag);
                    }
                }
            }
        });
    }

    // --- Export Function ---
    function exportData() {
        if (state.recordedTags.length === 0) {
            alert("No tags to export.");
            return;
        }

        const headers = ["Timestamp", "End Time", "Name", "Type", "Duration (s)", "Hotkey", "Player", "Note", "Parent Tag"];
        const rows = [];
        
        // Process each tag and its child tags
        state.recordedTags.forEach(tag => {
            // Add the parent tag
            rows.push(formatTagForExport(tag, ''));
            
            // Add child tags if they exist
            if (tag.childTags && tag.childTags.length > 0) {
                tag.childTags.forEach(childTag => {
                    rows.push(formatTagForExport(childTag, tag.name));
                });
            }
        });

        const csvContent = [headers.join(","), ...rows].join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `veo-tags-${state.currentMatchId}-${new Date().toISOString().slice(0, 10)}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    function formatTagForExport(tag, parentName) {
        const time = formatTime(tag.timestamp);
        const endTime = tag.endTime ? formatTime(tag.endTime) : '';
        const duration = tag.type === 'duration' ? (tag.duration ? tag.duration.toFixed(1) : 'Ongoing') : '';
        const name = `"${tag.name.replace(/"/g, '""')}"`;

        let playerInfo = '';
        if (tag.player) {
            playerInfo = `"${tag.player.number} ${tag.player.name}"`;
        }

        const note = tag.note ? `"${tag.note.replace(/"/g, '""')}"` : '';
        const parent = parentName ? `"${parentName.replace(/"/g, '""')}"` : '';

        return [time, endTime, name, tag.type, duration, tag.hotkey || '', playerInfo, note, parent].join(",");
    }

        // --- Helpers ---
    function openNoteModal(tag) {
        state.currentEditingTagIndex = state.recordedTags.indexOf(tag);
        noteInput.value = tag.note || '';
        noteModal.style.display = 'flex';
        noteInput.focus();
    }

        function formatTime(seconds) {
        if (seconds === null || seconds === undefined) return '--:--';
        const totalSeconds = Math.floor(seconds);
        const mm = Math.floor(totalSeconds / 60);
        const ss = totalSeconds % 60;
            return `${mm.toString().padStart(2, '0')}:${ss.toString().padStart(2, '0')}`;
        }

    function setupSortToggle() {
        if (sortToggleBtn) {
            sortToggleBtn.onclick = () => {
                state.sortOrder = state.sortOrder === 'entered' ? 'timestamp' : 'entered';
                sortToggleBtn.textContent = state.sortOrder === 'entered' ? 'Sort: Entered' : 'Sort: Time';
                renderRecordedTags();
            };
        }
    }

    function populateSubboardSelect(selectedValue) {
        if (!tagSubboardInput) return;
        
        tagSubboardInput.innerHTML = '<option value="">None (no sub-tags)</option>';
        
        state.boards.forEach(board => {
            // Don't include the current board as an option
            if (board.id === state.activeBoardId) return;
            
            const option = document.createElement('option');
            option.value = board.id;
            option.textContent = board.name;
            option.selected = board.id === selectedValue;
            tagSubboardInput.appendChild(option);
        });
        }

        function setupModeToggle() {
            const urlParams = new URLSearchParams(window.location.search);
            const isPopOut = urlParams.get('mode') === 'popout';

            if (isPopOut) {
                modeToggleBtn.title = "Go Back In";
            if (iconPopOut) iconPopOut.style.display = 'none';
            if (iconPopIn) iconPopIn.style.display = 'block';
            } else {
                modeToggleBtn.title = "Pop Out";
            if (iconPopOut) iconPopOut.style.display = 'block';
            if (iconPopIn) iconPopIn.style.display = 'none';
            }

            modeToggleBtn.addEventListener('click', () => {
                if (isPopOut) {
                    window.close();
                } else {
                    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                        const currentTabId = tabs.length > 0 ? tabs[0].id : null;
                        let url = "popup.html?mode=popout";
                        if (currentTabId) {
                            url += `&tabId=${currentTabId}`;
                        }

                        chrome.windows.create({
                            url: url,
                            type: "popup",
                            width: 320,
                            height: 600
                        }, () => {
                            chrome.runtime.sendMessage({ action: "closeSidePanel" });
                        });
                    });
                }
            });
        }

    // Initialize the app
    init();
    });
