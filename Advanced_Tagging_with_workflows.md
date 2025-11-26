# Advanced Tagging with Workflows

## Overview

This document explores the concept of **nested/leveled tags** and **workflows** for the Veo Tagger extension. The goal is to enable more sophisticated tagging scenarios where:

1. Tags can trigger follow-up tags (hierarchical/nested tagging)
2. Context-aware boards appear based on previous selections
3. Workflows guide users through multi-step tagging sequences
4. Sub-tags provide additional detail to parent tags

---

## Use Cases

### Example 1: Possession-Based Workflow

**Workflow: Match Phases**

```
Step 1: Phase Selection
├── In Possession → Opens "Possession Board"
├── Out of Possession → Opens "Defensive Board"  
├── Contested → Opens "Contest Board"
└── Out of Play → Opens "Set Piece Board"

Step 2 (if "In Possession"): Possession Board
├── Zone: A3 | M3 | D3 (Attacking/Middle/Defensive Third)
├── Channel: Left | Center | Right
└── Player on ball: [On-field player buttons]

Step 3 (if Player Tagged): Action Board
├── Pass Short
├── Pass Long
├── Dribble
├── Shot
└── Turn/Receive
```

### Example 2: Goal Workflow

**Workflow: Goal Scored**

```
Step 1: Goal Tag (automatic timestamp)
│
Step 2: Scorer Selection
├── [On-field player buttons]
│
Step 3: Assist Selection
├── [On-field player buttons]
├── No Assist
│
Step 4: Goal Type (optional)
├── Open Play
├── Set Piece
├── Counter Attack
├── Individual Effort
```

### Example 3: Passing Chain

**Workflow: Passing Sequence**

```
Step 1: Start Passing Chain (begins recording)
│
Step 2: Tag Each Pass
├── Player: [On-field buttons]
├── Pass Type: Short | Long | Through | Cross
├── [Repeat until...]
│
Step 3: End Passing Chain
├── Lost Possession
├── Shot
├── Foul Won
└── Out of Play
```

---

## Data Model

### Nested Tag Structure

```javascript
// A recorded tag with nested sub-tags
{
  id: "tag_123",
  name: "Goal",
  type: "event",
  timestamp: 1234.56,
  color: "#f1c40f",
  
  // NEW: Sub-tags array
  subTags: [
    { key: "scorer", playerId: "player_1", playerName: "John Smith", playerNumber: "10" },
    { key: "assister", playerId: "player_2", playerName: "Jane Doe", playerNumber: "7" },
    { key: "goalType", value: "Open Play" }
  ],
  
  // NEW: Workflow reference
  workflowId: "goal_workflow",
  workflowCompleted: true
}
```

### Workflow Definition

```javascript
{
  id: "possession_workflow",
  name: "Possession Analysis",
  description: "Track possession phases, zones, and actions",
  isTemplate: false,
  templateId: null,  // Reference to original template if copied
  
  steps: [
    {
      id: "step_1",
      name: "Phase",
      type: "board",  // Show a board of options
      boardId: "phase_board",
      required: true,
      branches: {
        // Value selected → next step
        "In Possession": "step_2_possession",
        "Out of Possession": "step_2_defense",
        "Contested": "step_2_contest",
        "Out of Play": null  // End workflow
      }
    },
    {
      id: "step_2_possession",
      name: "Possession Details",
      type: "multi-select",  // Multiple selections on same screen
      fields: [
        {
          key: "zone",
          label: "Zone",
          options: ["A3", "M3", "D3"],
          required: true
        },
        {
          key: "channel", 
          label: "Channel",
          options: ["Left", "Center", "Right"],
          required: false
        }
      ],
      next: "step_3_player"
    },
    {
      id: "step_3_player",
      name: "Player on Ball",
      type: "player-select",
      required: false,
      next: "step_4_action"
    },
    {
      id: "step_4_action",
      name: "Action",
      type: "board",
      boardId: "action_board",
      required: false,
      next: null  // End workflow
    }
  ],
  
  // Auto-advance settings
  settings: {
    autoAdvanceOnSelect: true,  // Move to next step immediately
    allowSkip: true,            // Allow skipping optional steps
    allowBack: true,            // Allow going back to previous step
    timeoutSeconds: null        // Auto-close after X seconds (null = never)
  }
}
```

### Step Types

| Type | Description | UI |
|------|-------------|-----|
| `board` | Show a tag board | Grid of tag buttons |
| `player-select` | Select a player | On-field player buttons |
| `multi-select` | Multiple fields on one screen | Grouped option buttons |
| `text-input` | Free text entry | Text field |
| `duration` | Start/stop a duration | Toggle button |
| `confirm` | Yes/No confirmation | Two buttons |

---

## UI/UX Design

### Workflow Mode Indicator

When a workflow is active, show a visual indicator:

```
┌─────────────────────────────────────┐
│ 🔄 Possession Analysis (Step 2/4)   │
│ ──────────────────────────────────  │
│                                     │
│  Zone:  [A3] [M3] [D3]             │
│                                     │
│  Channel: [Left] [Center] [Right]  │
│                                     │
│  [Skip] [Back]              [Next] │
└─────────────────────────────────────┘
```

### Workflow Selection

Add a "Workflows" section to the main view:

```
┌─────────────────────────────────────┐
│ Quick Workflows                     │
│ ──────────────────────────────────  │
│ [Possession] [Goal] [Foul] [Set Pc] │
└─────────────────────────────────────┘
```

### Sub-Tag Display in Recorded Tags

```
┌─────────────────────────────────────┐
│ 23:45  Goal                    [📝x]│
│        └─ Scorer: #10 J. Smith      │
│        └─ Assist: #7 J. Doe         │
│        └─ Type: Open Play           │
└─────────────────────────────────────┘
```

---

## Implementation Feasibility

### Is This Reasonably Possible?

**Yes.** The current architecture supports this with modifications:

| Component | Current State | Required Changes |
|-----------|---------------|------------------|
| State Management | Boards, tags, teams | Add `workflows`, `activeWorkflow`, `workflowStep` |
| Storage | chrome.storage.local | Add workflow definitions, expand tag schema |
| UI | Single-level tag buttons | Add workflow mode, step navigation, nested display |
| Content Script | Timestamp capture | No changes needed |
| Background Script | Hotkey handling | Add workflow-aware hotkey routing |

### Complexity Assessment

| Feature | Complexity | Effort |
|---------|------------|--------|
| Nested tag data model | Low | 2-3 hours |
| Workflow definition schema | Medium | 4-6 hours |
| Workflow execution engine | Medium-High | 8-12 hours |
| Workflow UI (step display) | Medium | 6-8 hours |
| Workflow editor UI | High | 12-16 hours |
| Template system | Medium | 4-6 hours |
| **Total Estimate** | | **36-51 hours** |

---

## Creating, Saving, and Editing Workflows

### Workflow Management in Settings

```
Settings > Workflows Tab
├── My Workflows
│   ├── [Possession Analysis]  [Edit] [Duplicate] [Delete]
│   ├── [Goal Tracking]        [Edit] [Duplicate] [Delete]
│   └── [+ Create New Workflow]
│
├── Templates
│   ├── [Soccer - Basic] (Template)     [Use Template]
│   ├── [Soccer - Advanced] (Template)  [Use Template]
│   └── [Basketball] (Template)         [Use Template]
│
└── Import/Export
    ├── [Export All Workflows]
    └── [Import Workflow]
```

### Workflow Editor

A step-by-step wizard for creating workflows:

```
┌─────────────────────────────────────────────┐
│ Edit Workflow: Possession Analysis          │
├─────────────────────────────────────────────┤
│                                             │
│ Steps:                                      │
│ ┌─────────────────────────────────────────┐ │
│ │ 1. Phase Selection        [Edit][Del]  │ │
│ │    Type: Board (phase_board)           │ │
│ │    Branches: 4 defined                 │ │
│ └─────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────┐ │
│ │ 2. Possession Details     [Edit][Del]  │ │
│ │    Type: Multi-select                  │ │
│ │    Fields: Zone, Channel               │ │
│ └─────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────┐ │
│ │ 3. Player on Ball         [Edit][Del]  │ │
│ │    Type: Player Select                 │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ [+ Add Step]                                │
│                                             │
│ [Cancel]                    [Save Workflow] │
└─────────────────────────────────────────────┘
```

### Step Editor Modal

```
┌─────────────────────────────────────────────┐
│ Edit Step: Phase Selection                  │
├─────────────────────────────────────────────┤
│                                             │
│ Step Name: [Phase Selection          ]      │
│                                             │
│ Type: [Board            ▼]                  │
│                                             │
│ Board: [phase_board     ▼]                  │
│                                             │
│ Required: [✓]                               │
│                                             │
│ Branching:                                  │
│ ┌─────────────────────────────────────────┐ │
│ │ If "In Possession" → [Step 2: Poss... ▼]│ │
│ │ If "Out of Possession" → [Step 2: Def ▼]│ │
│ │ If "Contested" → [Step 2: Contest    ▼]│ │
│ │ If "Out of Play" → [End Workflow     ▼]│ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ [Cancel]                        [Save Step] │
└─────────────────────────────────────────────┘
```

---

## Templates System

### Template Behavior

1. **Templates are read-only** - Cannot be modified directly
2. **"Use Template" creates a copy** - User gets their own editable version
3. **Templates can be updated** - App updates can push new template versions
4. **Track template origin** - Know which template a workflow was based on

### Template Schema

```javascript
{
  id: "template_soccer_advanced",
  name: "Soccer - Advanced Analysis",
  description: "Comprehensive soccer tagging with possession, phases, and set pieces",
  version: "1.2.0",
  author: "Veo Tagger",
  isTemplate: true,
  
  // Template includes both boards and workflows
  includes: {
    boards: ["phase_board", "possession_board", "defensive_board", "setpiece_board"],
    workflows: ["possession_workflow", "goal_workflow", "foul_workflow"]
  },
  
  // Full definitions
  boards: [...],
  workflows: [...]
}
```

### Template Installation Flow

```
┌─────────────────────────────────────────────┐
│ Use Template: Soccer - Advanced Analysis    │
├─────────────────────────────────────────────┤
│                                             │
│ This will create copies of:                 │
│                                             │
│ Boards (4):                                 │
│   • Phase Selection                         │
│   • Possession Actions                      │
│   • Defensive Actions                       │
│   • Set Pieces                              │
│                                             │
│ Workflows (3):                              │
│   • Possession Analysis                     │
│   • Goal Tracking                           │
│   • Foul & Cards                            │
│                                             │
│ ⚠️ Existing items with same names will be  │
│    renamed with "(Copy)" suffix.            │
│                                             │
│ [Cancel]              [Install Template]    │
└─────────────────────────────────────────────┘
```

---

## Hotkey Integration

### Workflow-Aware Hotkeys

When a workflow is active, hotkeys can be context-sensitive:

```javascript
// Global hotkeys (always active)
{
  "g": { action: "startWorkflow", workflowId: "goal_workflow" },
  "p": { action: "startWorkflow", workflowId: "possession_workflow" }
}

// Step-specific hotkeys (active during workflow step)
// Automatically assigned: 1, 2, 3... for options
// Or manually configured in step definition
```

### Quick-Fire Mode

For rapid tagging, allow a "quick-fire" hotkey sequence:

```
Press: p → 1 → 2 → 3 → Enter
       │   │   │   │   └── Confirm/Next
       │   │   │   └────── Action: Pass Short
       │   │   └────────── Player: #10
       │   └────────────── Zone: A3
       └────────────────── Start Possession Workflow
```

---

## State Management

### Extended State Object

```javascript
state = {
  // Existing...
  boards: [],
  teams: [],
  recordedTags: [],
  
  // NEW: Workflow state
  workflows: [],                    // Workflow definitions
  activeWorkflowId: null,           // Currently running workflow
  activeWorkflowStep: null,         // Current step ID
  activeWorkflowData: {},           // Data collected so far in workflow
  workflowStartTimestamp: null,     // Video timestamp when workflow started
  
  // NEW: Template tracking
  installedTemplates: [],           // List of installed template IDs
  
  // NEW: Quick workflows for main view
  quickWorkflowIds: []              // Workflows shown in quick access
}
```

### Workflow Execution Flow

```
1. User triggers workflow (button or hotkey)
   ↓
2. Set activeWorkflowId, activeWorkflowStep = first step
   ↓
3. Capture video timestamp → workflowStartTimestamp
   ↓
4. Render current step UI
   ↓
5. User makes selection
   ↓
6. Store in activeWorkflowData
   ↓
7. Determine next step (linear or branched)
   ↓
8. If next step exists → Go to step 4
   If no next step → Complete workflow
   ↓
9. Create recorded tag with all sub-tags
   ↓
10. Clear workflow state, return to normal mode
```

---

## Export Format

Extended CSV format to support nested data:

```csv
Timestamp,End Time,Name,Type,Duration,Player,Note,SubTag_Scorer,SubTag_Assister,SubTag_Zone,SubTag_Channel
23:45,,Goal,event,,,,"#10 J. Smith","#7 J. Doe",,
24:12,24:45,In Possession,duration,33s,,,,,A3,Center
24:15,,Pass Short,event,,#10 J. Smith,,,,A3,Center
```

Or JSON export for full fidelity:

```json
{
  "tags": [
    {
      "timestamp": 1425.5,
      "name": "Goal",
      "type": "event",
      "subTags": [
        { "key": "scorer", "playerNumber": "10", "playerName": "J. Smith" },
        { "key": "assister", "playerNumber": "7", "playerName": "J. Doe" }
      ],
      "workflowId": "goal_workflow"
    }
  ]
}
```

---

## Migration Path

### Phase 1: Foundation (v1.1)
- Add `subTags` array support to recorded tags
- Simple sub-tag UI (prompt-based)
- No workflow engine yet

### Phase 2: Basic Workflows (v1.2)
- Workflow definition schema
- Linear workflows (no branching)
- Workflow execution engine
- Basic workflow editor

### Phase 3: Advanced Workflows (v1.3)
- Branching workflows
- Multi-select steps
- Advanced workflow editor
- Hotkey integration

### Phase 4: Templates (v1.4)
- Template system
- Built-in sport templates
- Import/Export workflows
- Template versioning

---

## Open Questions

1. **Workflow Cancellation** - What happens to partial data if user cancels mid-workflow?
   - Option A: Discard all data
   - [My selection ->]Option B: Save partial data as incomplete tag
   - Option C: Prompt user to choose

2. **Concurrent Workflows** - Can multiple workflows run simultaneously?
   - e.g., Possession workflow running while also tracking a foul
   - Likely: No, one workflow at a time for simplicity

3. **Duration Tags in Workflows** - How do duration tags interact with workflows?
   - Option: Workflow can span a duration tag (start workflow = start duration)

4. [Keep as future option] **Offline Template Updates** - How to update templates for users who have modified copies?
   - Option: Notify user of new version, let them manually update

5. [Keep as future idea] **Workflow Analytics** - Should we track workflow usage patterns?
   - Could help improve templates and identify common patterns

---

---

## User Personas & Tagging Modes

Different users have different skill levels and time constraints. The system must support multiple **tagging modes** to accommodate all users with the same underlying workflow definitions.

### User Personas

| Persona | Skill Level | Time | Approach |
|---------|-------------|------|----------|
| **Novice Multi-Pass** | Beginner | Has time for multiple passes | Tag phases first, then review and add details |
| **Novice Time-Constrained** | Beginner | Limited time | Tag periods, review immediately after each one |
| **Advanced Real-Time** | Expert | Tagging live | Tag everything in real-time as game unfolds |

---

### User 1: Novice Multi-Pass

**Workflow:**
1. **First Pass** - Go through entire game tagging high-level phases
   - "In Possession" / "Out of Possession" / "Set Piece"
   - Substitutions (track who's on field)
2. **Second Pass** - Return to each possession, add detail tags
   - Seek to possession start time
   - Open possession detail board
   - Tag: Zone, Channel, Players, Actions

**System Requirements:**
- Duration tags (possession periods) can be **expanded later**
- "Add Details" button on recorded duration tags
- When adding details, video seeks to that tag's timestamp
- Details are linked to parent tag, not standalone

**UI Flow:**
```
First Pass:
┌─────────────────────────────────┐
│ [In Poss.] [Out Poss.] [Set Pc] │
│                                 │
│ Recorded Tags:                  │
│ 00:00-01:23  In Possession      │
│ 01:23-02:45  Out of Possession  │
│ 02:45-03:12  In Possession      │
└─────────────────────────────────┘

Second Pass (click "In Possession" tag):
┌─────────────────────────────────┐
│ Adding details to:              │
│ 00:00-01:23 In Possession       │
│ [Seek to Start] [Play]          │
│ ─────────────────────────────── │
│ Zone:    [A3] [M3] [D3]         │
│ Channel: [L]  [C]  [R]          │
│ ─────────────────────────────── │
│ Actions at timestamps:          │
│ 00:05 Pass - #10 → #7           │
│ 00:12 Dribble - #7              │
│ [+ Add Action]                  │
│ ─────────────────────────────── │
│ [Done - Back to Game]           │
└─────────────────────────────────┘
```

---

### User 2: Novice Time-Constrained

**Workflow:**
1. Tag possession start (duration tag begins)
2. Watch until possession ends
3. Tag possession end (duration tag completes)
4. **Immediately** seek back to start of that possession
5. Open possession board, tag details while reviewing
6. When done, seek to where they left off (end of possession)
7. Continue watching

**System Requirements:**
- "Review Mode" toggle or automatic prompt
- After ending a duration tag, offer: "Review this period?"
- Track "resume point" so user can return to live playback position
- Quick seek buttons: [Go to Start] [Resume Live]

**UI Flow:**
```
Step 1-3: Tag possession period
┌─────────────────────────────────┐
│ Video playing at 02:45          │
│ [In Possession ●] ← Active      │
│                                 │
│ ...watching...                  │
│                                 │
│ Video at 03:12 - possession lost│
│ [In Possession ■] ← Click=End   │
└─────────────────────────────────┘

Step 4: Prompt appears
┌─────────────────────────────────┐
│ ┌─────────────────────────────┐ │
│ │ Possession Tagged: 27 sec   │ │
│ │ (02:45 - 03:12)             │ │
│ │                             │ │
│ │ [Review Now] [Skip - Keep   │ │
│ │              Watching]      │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘

Step 5: Review Mode (video seeks to 02:45)
┌─────────────────────────────────┐
│ 📍 Review Mode - 02:45-03:12    │
│ [Resume at 03:12]               │
│ ─────────────────────────────── │
│ Zone:    [A3] [M3] [D3]         │
│ Channel: [L]  [C]  [R]          │
│ [+ Add Action at current time]  │
│ ─────────────────────────────── │
│ [Done - Resume Game]            │
└─────────────────────────────────┘
```

---

### User 3: Advanced Real-Time

**Workflow:**
1. Tag possession start → **Automatically** opens possession board
2. Tag details in real-time (Zone, Channel, Actions)
3. Continue tagging actions as they happen
4. Click "End Possession" button on possession board
5. Returns to phase board, continues watching live

**System Requirements:**
- "Auto-advance" setting per workflow
- Possession board has "End Possession" button
- No video seeking - everything is real-time
- Quick hotkeys for rapid tagging

**UI Flow:**
```
Step 1: Tag start (auto-transitions)
┌─────────────────────────────────┐
│ [In Poss.] [Out Poss.] [Set Pc] │
│      ↓                          │
│   Click!                        │
└─────────────────────────────────┘
         ↓ Immediately
┌─────────────────────────────────┐
│ ● In Possession (recording)     │
│ Started: 02:45                  │
│ ─────────────────────────────── │
│ Zone:    [A3] [M3] [D3]         │
│ Channel: [L]  [C]  [R]          │
│ Player:  [4][5][6][7][10][11]   │
│ ─────────────────────────────── │
│ Actions (tag as they happen):   │
│ [Pass S] [Pass L] [Drib] [Shot] │
│ ─────────────────────────────── │
│ [ End Possession - Lost Ball ]  │
│ [ End Possession - Shot ]       │
│ [ End Possession - Foul ]       │
└─────────────────────────────────┘

Step 2-4: Rapid real-time tagging
┌─────────────────────────────────┐
│ ● In Possession (02:45 - now)   │
│ Zone: M3 | Channel: Center      │
│ ─────────────────────────────── │
│ 02:47 Pass S - #10              │
│ 02:52 Pass L - #7               │
│ 02:58 Drib - #11                │
│ 03:05 Pass S - #11              │
│ [+ Tag Action] [hotkeys: 1-9]   │
│ ─────────────────────────────── │
│ [ End: Lost ] [ End: Shot ]     │
└─────────────────────────────────┘
```

---

## Unified Design: Tagging Mode System

To support all three personas, the system needs a **Tagging Mode** concept:

### Mode Definitions

```javascript
const TAGGING_MODES = {
  SIMPLE: {
    name: "Simple",
    description: "Tag phases only. Add details later.",
    autoAdvanceToDetailBoard: false,
    promptReviewAfterDuration: false,
    showDetailBoardInMain: false
  },
  
  REVIEW: {
    name: "Review After",
    description: "Tag phases, then review each one immediately.",
    autoAdvanceToDetailBoard: false,
    promptReviewAfterDuration: true,  // Ask "Review now?"
    showDetailBoardInMain: false
  },
  
  REALTIME: {
    name: "Real-Time",
    description: "Full detail tagging as you watch.",
    autoAdvanceToDetailBoard: true,   // Auto-open detail board
    promptReviewAfterDuration: false,
    showDetailBoardInMain: true       // Show all options at once
  }
};
```

### Mode Selection UI

Add a mode selector to settings or main view:

```
┌─────────────────────────────────────┐
│ Tagging Mode:                       │
│ ○ Simple      - Phases only         │
│ ○ Review      - Review after each   │
│ ● Real-Time   - Full detail live    │
└─────────────────────────────────────┘
```

Or as a quick toggle in main view:

```
┌─────────────────────────────────────┐
│ Mode: [Simple ▼]                    │
│ Board: [Possession ▼]               │
└─────────────────────────────────────┘
```

---

---

## Double-Tap Hotkey for Sub-Tags

### Concept

A single hotkey press records a quick tag. **Double-tapping** the same hotkey (or clicking the tag button) opens the sub-tag board for that tag.

| Action | Result |
|--------|--------|
| Press `P` once | Record "In Possession" tag at current timestamp |
| Press `P` twice quickly | Record "In Possession" AND open Possession Detail board |
| Click [In Possession] button | Same as double-tap - opens detail board |
| Long-press [In Possession] | Opens detail board without recording (for review mode) |

### Implementation

```javascript
// Hotkey handler with double-tap detection
const DOUBLE_TAP_THRESHOLD = 300; // ms
let lastKeyPress = {};

function handleHotkey(key, timestamp) {
  const now = Date.now();
  const lastPress = lastKeyPress[key] || 0;
  const isDoubleTap = (now - lastPress) < DOUBLE_TAP_THRESHOLD;
  
  lastKeyPress[key] = now;
  
  const tag = findTagByHotkey(key);
  if (!tag) return;
  
  if (isDoubleTap && tag.subTagBoard) {
    // Double-tap: Record tag AND open sub-tag board
    recordTag(tag, timestamp);
    openBoard(tag.subTagBoard, { parentTagId: lastRecordedTagId });
  } else {
    // Single tap: Just record the tag
    // (But wait briefly in case it's the first of a double-tap)
    setTimeout(() => {
      if (lastKeyPress[key] === now) {
        // No second tap came - record single tag
        recordTag(tag, timestamp);
      }
    }, DOUBLE_TAP_THRESHOLD);
  }
}
```

### Tag Definition with Sub-Board

```javascript
{
  id: "in_possession",
  name: "In Possession",
  type: "duration",
  hotkey: "p",
  color: "#2ecc71",
  
  // NEW: Sub-tag board reference
  subTagBoard: "possession_details_board",
  
  // NEW: What happens on double-tap
  doubleTapBehavior: "open_board"  // "open_board" | "add_player" | "none"
}
```

### Visual Indicator

Tags with sub-boards show a subtle indicator:

```
┌─────────────────────────────────────┐
│ [In Poss. ▸]  [Out Poss. ▸]  [Set] │
│     └─ ▸ indicates sub-board exists │
└─────────────────────────────────────┘
```

---

## Board Composition: Tag Visibility Rules

### Problem

When viewing the **Defense Board**, you want to see:
- ✅ Game Phase tags (In/Out of Possession markers for reference)
- ✅ Defense-specific tags (Press High, Drop Deep, etc.)
- ❌ NOT Possession board tags (they're irrelevant when defending)

### Solution: Board Includes & Excludes

Each board can specify:
1. **Own tags** - Tags defined directly on this board
2. **Include from** - Other boards whose tags should also appear
3. **Exclude from** - Boards whose tags should NOT appear (overrides includes)
4. **Show recorded from** - Which boards' RECORDED tags to display in the list

### Board Definition

```javascript
{
  id: "defense_board",
  name: "Defensive Phase",
  
  // Tags defined on this board
  tags: [
    { id: "press_high", name: "Press High", type: "event", hotkey: "h" },
    { id: "drop_deep", name: "Drop Deep", type: "event", hotkey: "d" },
    { id: "won_ball", name: "Won Ball", type: "event", hotkey: "w" }
  ],
  
  // NEW: Include tags from other boards in the button area
  includeTags: {
    from: ["game_phase_board"],   // Show phase tags for context
    position: "top",              // Where to show them: "top" | "bottom" | "side"
    style: "compact"              // How to show them: "full" | "compact" | "mini"
  },
  
  // NEW: Exclude certain boards' tags
  excludeTags: {
    from: ["possession_board"]    // Don't show possession tags
  },
  
  // NEW: What recorded tags to show in the list below
  showRecordedFrom: {
    boards: ["game_phase_board", "defense_board"],  // Only these
    // OR
    boards: "*",                  // Show all recorded tags
    // OR  
    boards: "current_phase"       // Smart: only tags from current game phase
  }
}
```

### UI Layout with Includes

```
┌─────────────────────────────────────────────────┐
│ Defense Board                                   │
├─────────────────────────────────────────────────┤
│ ┌─ Game Phase (from: game_phase_board) ───────┐ │
│ │ [In Poss.] [Out Poss. ●] [Set Piece]        │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ ┌─ Defensive Actions ─────────────────────────┐ │
│ │ [Press High]  [Drop Deep]  [Hold Line]      │ │
│ │ [Won Ball]    [Tackle]     [Interception]   │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ Players: [4] [5] [6] [7] [8]                    │
│                                                 │
│ ─────────────────────────────────────────────── │
│ Recorded (Defense & Phase only):                │
│ 12:34  Out of Possession (active)               │
│ 12:45  Press High - #6                          │
│ 12:52  Won Ball - #8                            │
└─────────────────────────────────────────────────┘
```

### Smart "Current Phase" Filtering

When `showRecordedFrom: "current_phase"`:

```javascript
function getRecordedTagsForDisplay(board, allTags, currentPhaseTag) {
  if (board.showRecordedFrom === "current_phase") {
    // Only show tags recorded DURING the current active phase
    const phaseStart = currentPhaseTag?.timestamp || 0;
    const phaseEnd = currentPhaseTag?.endTime || Infinity;
    
    return allTags.filter(tag => 
      tag.timestamp >= phaseStart && 
      tag.timestamp <= phaseEnd
    );
  }
  // ... other filtering logic
}
```

This means when you're in "Out of Possession" mode, you only see tags recorded during this defensive phase, not the previous possession.

---

## Board Relationships Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     GAME PHASE BOARD                        │
│  [In Possession]  [Out of Possession]  [Set Piece]          │
└─────────────┬─────────────────┬─────────────────────────────┘
              │                 │
              ▼                 ▼
┌─────────────────────┐  ┌─────────────────────┐
│  POSSESSION BOARD   │  │   DEFENSE BOARD     │
│  ─────────────────  │  │   ──────────────    │
│  includes:          │  │   includes:         │
│    game_phase_board │  │     game_phase_board│
│  excludes:          │  │   excludes:         │
│    defense_board    │  │     possession_board│
│  ─────────────────  │  │   ──────────────    │
│  Zone: A3/M3/D3     │  │   Press High        │
│  Channel: L/C/R     │  │   Drop Deep         │
│  Pass/Dribble/Shot  │  │   Won Ball          │
└─────────────────────┘  └─────────────────────┘
              │                 │
              ▼                 ▼
┌─────────────────────────────────────────────────────────────┐
│              All tags flow to RECORDED TAGS list            │
│   (filtered by current board's showRecordedFrom setting)    │
└─────────────────────────────────────────────────────────────┘
```

---

## Configuration UI

### Board Settings: Includes/Excludes

```
┌─────────────────────────────────────────────────────────────┐
│ Edit Board: Defense                                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Board Name: [Defense                    ]                   │
│                                                             │
│ ─── Tag Buttons to Include ───                              │
│                                                             │
│ Include tags from:                                          │
│ ☑ Game Phase Board     (shows In/Out Possession buttons)    │
│ ☐ Possession Board                                          │
│ ☐ Set Piece Board                                           │
│                                                             │
│ Position: [Top ▼]   Style: [Compact ▼]                      │
│                                                             │
│ ─── Recorded Tags to Show ───                               │
│                                                             │
│ Show recorded tags from:                                    │
│ ○ All boards                                                │
│ ○ Only this board                                           │
│ ● Current phase + this board                                │
│ ○ Custom selection:                                         │
│   ☑ Game Phase Board                                        │
│   ☑ Defense Board                                           │
│   ☐ Possession Board                                        │
│                                                             │
│ [Cancel]                                      [Save Board]  │
└─────────────────────────────────────────────────────────────┘
```

### Tag Settings: Sub-Board Link

```
┌─────────────────────────────────────────────────────────────┐
│ Edit Tag: In Possession                                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Name: [In Possession        ]                               │
│ Type: [Duration ▼]                                          │
│ Hotkey: [P]                                                 │
│ Color: [🟢]                                                 │
│                                                             │
│ ─── Sub-Tag Board (Double-Tap) ───                          │
│                                                             │
│ On double-tap or click:                                     │
│ ○ Nothing (quick tag only)                                  │
│ ● Open board: [Possession Details ▼]                        │
│ ○ Prompt for player                                         │
│                                                             │
│ [Cancel]                                        [Save Tag]  │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Features to Support All Modes

### 1. Expandable Duration Tags

Duration tags can have **child tags** added at any time:

```javascript
{
  id: "tag_123",
  name: "In Possession",
  type: "duration",
  timestamp: 165.5,      // Start
  endTime: 192.3,        // End
  
  // Child tags within this duration
  childTags: [
    { timestamp: 167.2, name: "Pass Short", player: "#10" },
    { timestamp: 171.8, name: "Dribble", player: "#7" },
    { timestamp: 175.1, name: "Pass Long", player: "#7" }
  ],
  
  // Properties of the possession
  properties: {
    zone: "M3",
    channel: "Center",
    outcome: "Lost Ball"
  }
}
```

### 2. Review Mode State

Track when user is reviewing vs watching live:

```javascript
state = {
  // ...existing state
  
  // Review mode
  isReviewMode: false,
  reviewingTagId: null,        // Which tag we're adding details to
  resumeTimestamp: null,       // Where to return after review
  
  // Tagging mode preference
  taggingMode: "REALTIME"      // SIMPLE | REVIEW | REALTIME
}
```

### 3. "Add Details" on Recorded Tags

In the recorded tags list, duration tags show an "expand" option:

```
┌─────────────────────────────────────────────┐
│ 02:45-03:12  In Possession  [+Details][📝x] │
│   └─ Zone: M3, Channel: Center              │
│   └─ 3 actions tagged                       │
│   └─ Outcome: Lost Ball                     │
└─────────────────────────────────────────────┘
```

Clicking [+Details]:
1. Video seeks to 02:45
2. Opens detail board in "review mode"
3. Any tags added are associated with parent
4. "Done" returns video to previous position (or resume point)

### 4. Context-Aware Board Display

The active board changes based on context:

| Context | Board Shown |
|---------|-------------|
| No active duration | Phase Board |
| In Possession active (Real-Time mode) | Possession Detail Board |
| Reviewing a possession tag | Possession Detail Board |
| In Possession active (Simple mode) | Phase Board (no auto-switch) |

### 5. Workflow Configuration

Workflows can specify behavior per mode:

```javascript
{
  id: "possession_workflow",
  name: "Possession Tagging",
  
  // Mode-specific behavior
  modeSettings: {
    SIMPLE: {
      steps: ["phase_only"],
      autoAdvance: false
    },
    REVIEW: {
      steps: ["phase_only"],  // Same as simple, but prompts review
      autoAdvance: false,
      promptReview: true
    },
    REALTIME: {
      steps: ["phase_with_details"],  // Combined board
      autoAdvance: true
    }
  }
}
```

---

## Implementation Approach

### Phased Rollout for Multi-Mode Support

**Phase 1: Simple Mode (Current + Expandable Tags)**
- Add `childTags` to duration tag data model
- Add [+Details] button to recorded duration tags
- Click seeks video and shows detail board
- Details saved as child tags

**Phase 2: Review Mode**
- Add "Review now?" prompt after duration tag ends
- Track `resumeTimestamp` 
- Add [Resume Game] button during review
- Mode selector in settings

**Phase 3: Real-Time Mode**
- Auto-advance to detail board when duration starts
- Combined boards with "End Possession" options
- Hotkey support for rapid tagging
- Mode selector in main view for quick switching

---

## Conclusion

Implementing nested tags and workflows is **feasible and would significantly enhance** the Veo Tagger's capabilities. The recommended approach is:

1. **Start with the data model** - Add sub-tag support first
2. **Build linear workflows** - Simpler version without branching
3. **Iterate based on usage** - See what users actually need
4. **Add templates last** - Once workflow patterns are established

The estimated total effort is **36-51 hours** for a full implementation, but this can be broken into phases to deliver value incrementally.

**Supporting multiple user personas** (Novice Multi-Pass, Novice Time-Constrained, Advanced Real-Time) requires:

1. **Tagging Mode system** - User selects their preferred mode
2. **Expandable duration tags** - Add details to any tag later
3. **Review mode** - Seek to tag, add details, resume
4. **Auto-advance option** - For real-time taggers
5. **Same data model** - All modes produce compatible data

This approach lets users **grow with the tool** - start with Simple mode, graduate to Review mode, eventually use Real-Time mode as they get faster.

