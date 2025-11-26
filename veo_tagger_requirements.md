# Veo Tagger Chrome Extension Requirements

Idea - a chrome extension that allows users to tag video content in real-time from app.veo.co. Get's time stamps from the video player and allows users to tag events and durations.

## 1. User Interface & Navigation ✅
*   **Default View**: ✅ The extension opens in the Chrome **Side Panel** by default when the icon is clicked.
*   **Pop-Out Mode**: ✅
    *   Discreet button (bottom-left) to close the Side Panel.
    *   Opens new tab to app.veo.co if not already there.
*   **Panel Stability**: ✅ Team Panel and Tag Panel render correctly without blank states or broken HTML structures.

## 2. Tagging Logic & Configuration ✅
*   **Tag Boards**: ✅ Support multiple "Boards" to organize sets of tags.
    *   ✅ Boards can be organized by categories/tags (e.g., Soccer, Basketball, Defense, Offense)
    *   ✅ Predefined category list prevents spelling errors
    *   ✅ Boards grouped by categories in Quick List view
*   **Tag Types**: ✅
    *   **Event Tags**: ✅ For instantaneous moments. **Default Color: Yellow** (`#f1c40f`).
    *   **Duration Tags**: ✅ For actions with a start and end time. **Default Color: Green** (`#2ecc71`). Red (`#e74c3c`) when active.
*   **Color Picker Behavior**: ✅
    *   Automatically switches to **Yellow** when an Event tag is being configured.
    *   Automatically switches to **Green** when a Duration tag is being configured.
*   **Default Configuration**: ✅ DEFAULT_BOARD reflects these color defaults.

## 3. Team Management ✅
*   **Team & Roster Management**: ✅
    *   **Create/Delete Teams**: ✅ Users can create named teams and delete them.
    *   **Roster Management**: ✅ Add players with a **Number** and **Name**.
    *   **Game Day Player Status**: ✅
        *   **Squad**: ✅ Checkbox to mark if a player is in the game day squad.
        *   **Starter**: ✅ Checkbox to mark if a player is in the starting lineup.
        *   **Guest Player**: ✅ Ability to add a guest player to the game day roster.
*   **Match State (On Field)**: ✅
    *   **Visual Representation**: ✅ Display "On Field" players as clickable buttons.
*   **Substitutions**: ✅
    *   **Sub Mode**: ✅ A toggle switch to enable substitution mode.
    *   **Workflow**: ✅ When in Sub Mode, clicking an "On Field" player opens a modal to select a substitute from the "Bench".
    *   **Recording**: ✅ Substitutions are recorded with automatic timestamp.
*   **Player Tagging**: ✅
    *   **Association**: ✅ Clicking an "On Field" player (when NOT in Sub Mode) associates that player with the **last recorded event tag**.
    *   **Standalone**: ✅ If no recent event (within 10 seconds) exists, it records a standalone "Player" tag.


## 4. Interaction & Controls ✅
*   **Hotkeys**: ✅
    *   ✅ Users can assign hotkeys to specific tags.
    *   **Global Capture**: ✅ Hotkeys function even when the extension popup or side panel is NOT focused (via content script).
*   **Video Synchronization**: ✅
    *   **Click-to-Seek**: ✅ Clicking on a recorded tag's timestamp in the list seeks the video player to that specific timestamp.
    *   **Note on tags**: ✅ Ability to add a note to a tag (click tag name to add/edit note).  

## 5. Data Management ✅
*   **Export**: ✅ Functionality to export the list of recorded tags (CSV format).
*   **Platform**: ✅ The extension is specifically designed to work on `app.veo.co` and handles the authenticated session context.

## 6. Session Management ✅
*   **Session State**: ✅ The extension maintains a session state specific to each match (by match ID). State includes recorded tags, match state (on field players, squad), and quick list boards.
*   **Session Sync**: ✅ Session state is synchronized with chrome.storage.local and updated in real-time.
*   **Session Saved**: ✅ Session state persists across navigation and browser restarts. Automatically restored when returning to a match. 

## 7. Organization ✅
*   **Main View**: ✅
    *   ✅ Board dropdown for quick select boards (game-specific)
    *   ✅ Shows only boards selected in Quick List, or all if none selected
*   **Settings Page**: ✅
    *   **Manage Boards**: ✅
        *   ✅ Create board with name and categories
        *   ✅ Delete board
        *   ✅ Manage available categories (predefined list to prevent typos)
        *   ✅ Edit board categories (checkbox selection)
        *   ✅ Select boards to be in Quick List for current game
        *   ✅ Quick List shows boards grouped by categories with green shading for selected
    *   **Edit Boards (Tags)**: ✅
        *   ✅ Add event/duration tag to board
        *   ✅ Remove tag from board
        *   ✅ Configure tag (name, type, hotkey, color)
    *   **Manage Teams**: ✅
        *   ✅ Create team
        *   ✅ Delete team
        *   ✅ Add player to roster (number + name)
        *   ✅ Remove player from roster
        *   ✅ Edit player details
    *   **Game Day Squad**: ✅
        *   ✅ Select team
        *   ✅ Mark players as "Squad" (game day available)
        *   ✅ Mark players as "Starter" (starting lineup)
        *   ✅ Add guest player to squad (game-specific, not added to team roster)
        *   ✅ Manage on-field players via Lineup modal
       
## 8. Game Management ✅
*   ✅ Games are tracked by URL match ID (extracted from app.veo.co/matches/{matchId}/)
*   ✅ Teams and boards are maintained across games (global state)
*   ✅ Game day squad (roster/on-field players) are specific to each game
*   ✅ Quick list of boards is specific to each game
*   ✅ Tagged events are specific to each game
*   ✅ Recent Games view shows last 10 games with:
    *   Game title (click title to fetch from page)
    *   Team name
    *   Tag count
    *   Date (parsed from match ID)
    *   Colored cards with click navigation
*   ✅ Automatic game switching when navigating between game URLs




