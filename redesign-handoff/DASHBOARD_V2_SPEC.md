# MAITRI Dashboard v2 — Review & Implementation Spec


> **Status: APPROVED by the owner on 2026-10-17, with a Rule 1 exemption** for `/app`,
> `src/components/dashboard/**`, `src/layouts/AppLayout.tsx` and `docs/DESIGN.md`.
> **All seven phases implemented 2026-10-17 (uncommitted)** — see §14 and CURRENT_STATUS §J.
> Dashboard v2 is the `/app` on desktop and phone. The design as built is in DESIGN.md ("Dashboard `/app`"). The owner reviews after each phase.
>
> The owner's answers are recorded in §14 and override anything earlier in this document that
> disagrees with them. §1 and §3 are kept as written, because they explain why each decision was
> needed.

---

## 0. Summary

The dashboard becomes a **workspace with the conversation in the middle**:

```
┌──────────────────────────────────────────────┬───┐
│  Chat arena (ChatArena)                      │ ‹ │  ← Quick dock, collapsed (56 px tab,
│  companion left · user right                 │ ░ │     pixel-art loop inside)
│                                              │ ░ │
│  ┌ + ┐ [ What's on your mind?        ] 🎙 ◉  │   │  ← Composer: +, textarea, dictation, morph slot
├──────────────────────┬───────────────────────┼───┴──────────┐
│  Companion tile      │  User camera tile     │  Engines     │  ← Stage (StageGrid) + Engines panel
│  (keyed orb video)   │  (live / avatar card) │  ● Percep.   │
│   [Leave][Cam][Vox]  │                       │  ● Model …   │
└──────────────────────┴───────────────────────┴──────────────┘
```

When the dock is open it becomes a ~340 px column on the right. The top-right cell holds the
dock's **upper zone**. The bottom-right cell holds its **lower zone** and the Engines panel (§4.3).
"Leave stage" collapses the bottom row and the arena takes the full height.

---

## 1. Conflicts with standing owner decisions (resolve before any code)

These are not style notes. Each one reverses something the owner ruled on and recorded.

| # | v2 asks for | What stands today (read) | Recommendation |
|---|---|---|---|
| **C1** | A Discord/Meet **call metaphor**: "Discon" pill, reconnect sequence, entry sound | DESIGN.md "Dashboard `/app`": *"The companion is a presence, not a call: no 'Connected' badge, hang-up, 'call disconnected' overlay."* The 2026-10-02 rebuild removed a video-call dashboard on purpose. | Keep the **stage** idea but not call language. The control is **"Leave stage" / "Join stage"**, never "Disconnect", "End call" or a red hang-up. Red stays reserved for crisis/SOS. The entry chime is soft and can be turned off. Record the reversal in DESIGN.md. |
| **C2** | A **dictation mic** and a **two-way voice mode** as headline composer controls | `FEATURES.companionVoice = false` since 2026-10-08 (`src/lib/features.ts`). Chrome's Web Speech recognition sends audio to Google, which breaks PRODUCT.md claim 1 ("no video or audio is ever transmitted"). The on-device rework is PROJECT_BACKLOG §V. | Build both controls now in their **locked** state: `aria-disabled`, a lock glyph, and a "Coming soon" title, matching `LockedPresenceChip`. They unlock when §V lands. **Do not** unlock them on Web Speech. The morph slot still works (§6.3). |
| **C3** | The chat as the **main canvas** of `/app` | AppLayout renders `ChatPanel` as a resizable right drawer on **every** `/app` page. DESIGN.md: "The chat drawer is the conversation at full height on every `/app` page." | On `/app` only, hide the drawer and its toggle. Every other page keeps the drawer. Both surfaces render the **same extracted chat pieces** (§5.2) over the same `useChatStore`, so there is still one conversation. |
| **C4** | Nothing about **check-in, next step, Your week, greeting** | These are the current dashboard. `mood_checkins` with `/api/mood` was built for them on 2026-10-02 (migration not yet on production). | Don't drop them silently. Proposal: **Check-in** and **Your week** become dock widgets, and Check-in is in the default layout. The greeting and the `lib/nextStep.ts` primary action become the arena's empty state (§5.3). Owner decides (Q4). |
| **C5** | A **pixel-art loop video** in the dock tab and a companion **entry sound** | Rule 2 bans unrequested media. Neither asset exists: `public/assets` has only the four `character*.mp4` files and the world backdrops. | The pixel-art loop is explicitly requested, so it is allowed, but someone has to supply or commission it (Q6). Until then the tab shows a static world-tinted strip. The chime is **synthesised** with WebAudio (`utils/WebAudioSynth`), so it needs no asset file. |
| **C6** | An "Engines" telemetry panel naming FaceMesh, BLE, providers | AI_RULES §8 says values are **measured or omitted**. DESIGN.md says no library names on the companion stage, and the page *"never shows a face-emotion verdict"*. | Engines shows **states that are real**: Off, Starting, Running on this device, Simulated, Not connected. No made-up latency, FPS or "AI load" numbers. Plain names: "Perception", not "FaceMesh". No emotion readout. Simulated telemetry is labelled "Simulated". (§9) |
| **C7** | "**Import Chat**" in the `+` menu | Not built anywhere (read). AI_RULES §8: never imply what is not built. | Ship it as a locked "Coming soon" item, or leave it out of the menu. Owner decides (Q7). The rest of the menu maps to features that exist (§7). |
| **C8** | Panels filling the viewport | DESIGN.md has the **Visible World Rule** (the world stays visible) and the **one-gold-per-viewport** rule. | Use 12 px gaps between all cells, a translucent arena, and the world backdrop behind everything. The send button uses the **world accent**, as `ChatPanel` does today, never gold. The companion stays the only gold light source. |

---

## 2. Feasibility review

### 2.1 Component hierarchy — critique

The proposed split is sound. Five structural problems need fixing:

1. **The dock and the Engines panel have no deterministic rule.** "If the bottom space has nothing allocated, merge; if large widgets, minimize" is not implementable as written. **Fix:** the dock has two named zones. The **upper zone** sits beside the arena. The **lower zone** shares the bottom-right cell with Engines. The rule becomes one line: *lower zone non-empty ⇒ Engines compact*. (§4.3)
2. **One grid with spanning areas animates badly.** If the dock "spans both rows" through `grid-template-areas`, the areas change in one step and the arena jumps by ~220 px. **Fix:** use two independent row grids. Each row animates only its own right-hand track width, and nothing ever changes area. (§4.1)
3. **A live video avatar on every companion message is a performance trap.** Each one is another decoder plus a chroma-key pass. **Fix:** message avatars are the **static orb**. Companion.tsx already has one as its loading fallback; extract it as `CompanionStillOrb`. The live keyed video exists once, in the stage. (§5.3)
4. **Camera ownership is tangled.** `usePerception` both acquires the stream and runs MediaPipe, and on denial it silently sets `cameraEnabled = false` (read: `usePerception.ts`). A Meet-style "camera off → avatar card" needs to know *why* the camera is off. **Fix:** split it into `useCameraStream` (acquire/release, typed status) and `usePerception` (attaches to a `<video>`, reports engine status). (§6.2)
5. **ChatPanel is a 486-line monolith** shared by the drawer and the phone sheet. **Fix:** extract `ChatMessageList`, `ComposerBar` and the `useChatComposer` hook first, with no visual change to the drawer. Then the arena composes them. (§5.2)

### 2.2 Responsive behaviour — use the container, not the viewport

The space available to `/app` depends on the sidebar (256 px, or the 64 px rail) as much as on the
window. A 1440 px window with the sidebar expanded gives `/app` about the same width as a 1280 px
window with the rail. So the layout is driven by the **dashboard root's measured size**
(`ResizeObserver`), through a pure, unit-tested resolver (§4.2). It is not driven by `lg:` or `xl:`
classes.

| Container width (dashboard root) | Typical window | Behaviour |
|---|---|---|
| ≥ 1100 px | 1440 + sidebar, 1280 + rail | Full layout. Engines full (260 px). Dock opens inline at 340 px. |
| 860–1099 px | 1280 + sidebar, 1024 + rail | Engines starts **compact**. The dock opens inline, the arena keeps ≥ 420 px, and Engines stays compact. |
| 640–859 px | 1024 + sidebar, tablets 768–1023 | The dock opens as an **overlay sheet** over the arena, the one stated exception to "non-overlapping", because inline would leave the arena under 420 px. Engines shows only as a status pill in the stage bar. Stage tiles stay side by side. |
| < 768 px **viewport** | phones | A separate tree: `MobileAppLayout` → `src/phone/dashboard/MobileDashboard.tsx` (AI_RULES §5). See §11. |

Height matters too. Stage height is `clamp(180px, 32cqh, 340px)`. Under 560 px of container height the
page scrolls instead of crushing the arena below ~300 px.

**Invariant:** the arena column is never narrower than **420 px**. The resolver gives space back in
this order: Engines full → compact, then Engines compact → pill, then the dock goes inline → overlay.

### 2.3 Performance budget

What runs at once with everything on: the companion `mp4` (1280×720) decoded and keyed at ≤ 640 px
wide per frame (`requestVideoFrameCallback`), the camera at 640×480 through Hands, FaceMesh and the
emotion detector **on the main thread, every frame** (read: `usePerception.ts`), the WebGL2 ambient
background, the pixel-art loop, a streaming chat, and grid transitions.

| Risk | Rule |
|---|---|
| **Layout animation over video** | Animate **CSS grid tracks** (`grid-template-columns/rows`, 220–300 ms, `cubic-bezier(0.4,0,0.2,1)`). **Never** put Framer `layout` on an element that contains `<video>`, `<canvas>` or the message list. Framer is only for the `+` menu, the morph icon cross-fade, stage-tile enter/exit (opacity/scale on the tile) and message entry. |
| **Canvas resize thrash** | The keyed canvas keeps a fixed backing store (≤ 640 wide, as today). Only its CSS size follows the tile, so `canvas.width` is never set on resize. |
| **`backdrop-filter` over moving video** | A blur over live video recomposites every frame. Stage tiles use **Panel Ink** (`#0F172A`, allowed by DESIGN.md) with no blur. Control pills over video use `bg-black/55` without blur. Glass blur is for the arena, dock and Engines only. |
| **Perception cost** | Throttle MediaPipe to ~15 inferences/s, not every frame. Pause it while the tab is hidden or the camera tile is off-screen. Moving it to a worker is out of scope (record it in KNOWN_ISSUES). |
| **Streaming re-renders** | The list subscribes to message **ids**, and each `MessageRow` is memoised on `id + text`. Rows get `content-visibility: auto; contain-intrinsic-size: auto 96px`. The scroller gets `contain: layout paint`. |
| **Autoscroll fighting the reader** | Stick to the bottom only when the reader is within 80 px of it. Otherwise show a "New messages" pill. Today's ChatPanel always scrolls, which the arena must not copy. |
| **Third decoder** | The pixel-art loop plays only while the dock is **collapsed**, the tab is visible and reduced motion is off. Otherwise it shows its poster frame. |
| **Hidden tab** | All three videos pause and perception pauses. The camera stream stays held, so returning is instant. |

**Acceptance:** at 1440×900 in Chrome, with camera and companion on, a performance trace of 10 s idle
shows no long tasks over 50 ms outside MediaPipe inference. A dock open/close shows ≥ 55 fps. Test on
the owner's laptop and record the numbers in CURRENT_STATUS.

---

## 3. Decisions to nail down (owner questions)

The recommended answer is first. The spec below assumes it, and every assumption is marked **[Qn]**.

| # | Question | Recommendation |
|---|---|---|
| **Q1** | Do you confirm reversing "presence, not a call" (C1)? | Yes, with "Join/Leave stage" wording, no red, a soft optional chime. |
| **Q2** | Voice and dictation: locked chips now, or block v2 on the on-device rework (C2)? | Locked now. v2 ships, and the controls unlock with BACKLOG §V. |
| **Q3** | Should the camera **auto-start on page load** when it was on last time? Today it does: `cameraEnabled` is persisted in `maitri-ui-storage` and `usePerception` starts on mount (read). | **No.** On load the user tile shows the avatar card with "Turn camera on". The camera only starts from a gesture: Join stage or the camera button. A camera light that comes on just from opening the dashboard costs trust in a mental-health product. The *preference* is still remembered and used on Join. |
| **Q4** | Where do check-in, next step and Your week go (C4)? | Check-in and Your week become dock widgets, and Check-in is in the default dock. The greeting and next step become the empty arena state. |
| **Q5** | Should dock layout persist in localStorage or on the server? | localStorage v1, keyed per user id, versioned. Server sync later, which needs a migration and its own approval. |
| **Q6** | Who supplies the pixel-art loop, and what is its licence? | Owner supplies it. Portrait loop, ≤ 1.5 MB WebM/AV1 + MP4 fallback, ≥ 56×480 safe area, seamless, no text. Static strip until then. |
| **Q7** | "Import Chat": locked item, or left out of the menu? | Leave it out until there's a format and a backend. A menu full of locks feels unfinished. |
| **Q8** | What does the "perspective" pill do? It isn't defined. | **Swap focus**: the selected tile takes ~2/3 of the stage width. If you meant something else (a different camera, mirroring), say so. |
| **Q9** | Should "Leave stage" also stop the ambient soundscape? | No. The soundscape belongs to the world, not the stage. Leave stops camera, perception, companion video and voice mode only. |
| **Q10** | Should the dock's quick-journal scratchpad save to the real journal? | Yes. Saving creates a journal entry through the existing journal API, and it **honours the journal privacy lock**: locked journal ⇒ locked widget. No separate scratch store. |
| **Q11** | Where does the stage live on mobile? | A collapsible 2-tile strip above the messages, collapsed by default (§11). |

---

## 4. Layout & CSS architecture

### 4.1 Structure — two row grids inside one column grid

```
<section class="dash-v2" style="--stage-h --dock-w --side-w">   ← grid: rows [minmax(0,1fr) var(--stage-h)], gap 12px
  <div class="dash-row-top">     ← grid: cols [minmax(420px,1fr) var(--dock-w)], gap 12px
      <ChatArena/>  <QuickDock zone="upper"/>
  </div>
  <div class="dash-row-stage">   ← grid: cols [minmax(0,1fr) var(--side-w)], gap 12px
      <StageGrid/>  <SideCell>  <EnginesPanel/> <QuickDock zone="lower"/>  </SideCell>
  </div>
</section>
```

- Rows and columns change only through **custom properties** written by `useDashboardLayout`.
  `grid-template-*` transitions interpolate between same-count track lists in current Chromium,
  Firefox and Safari 16+. Verify this in Phase 1. If clamp-to-px interpolation misbehaves anywhere,
  the hook writes resolved px values instead.
- `.dash-v2` gets `height: calc(100dvh - 2 * var(--main-pad))` and `min-height: 560px`.
  `container-type: size` makes `cqh` usable. AppLayout's `<main>` keeps its own padding, and the
  dashboard reads it as a CSS variable, not a magic number.
- The transitions are `grid-template-columns 260ms` and `grid-template-rows 300ms`, both on
  `cubic-bezier(0.4,0,0.2,1)`. Under `prefers-reduced-motion` they are instant. The global
  `src/index.css` rule already stops looping utilities, so add the grid properties to it.
- The values live in `src/index.css` under a `.dash-v2` block (scoped, like
  `.pose-recording-studio`). Tailwind handles everything inside the cells.

### 4.2 The resolver — `src/lib/dashboard/layout.ts` (pure, tested)

```ts
export type EnginesMode = 'full' | 'compact' | 'pill' | 'hidden';
export type DockPresentation = 'collapsed' | 'inline' | 'overlay';

export interface LayoutInput {
  width: number;               // dashboard root, px
  height: number;
  dockOpen: boolean;
  lowerZoneCount: number;      // widgets placed in the dock's lower zone
  enginesPreference: 'open' | 'closed';
  stage: 'collapsed' | 'open'; // from the stage machine (entering/leaving count as open)
}

export interface LayoutOutput {
  dock: DockPresentation;
  engines: EnginesMode;
  dockWidth: number;           // 56 collapsed | 300–380 inline | 0 overlay (sheet floats)
  sideWidth: number;           // bottom-right cell; matches dockWidth when the dock is inline
  stageHeight: number;         // 0 when collapsed
  arenaMinWidth: 420;
}

export function resolveDashboardLayout(input: LayoutInput): LayoutOutput;
```

Rules, in order. Each rule is one test case in `tests/dashboardLayout.test.ts`:

1. `stage === 'collapsed'` ⇒ `stageHeight = 0` and `engines = 'hidden'`. The engines status moves to a
   compact strip at the top of the arena header (the user needs to know the model's state, not the camera's).
2. Dock closed ⇒ `dockWidth = 56`. `sideWidth` is 260 for `engines: full`, 0 for `pill`/`hidden`.
3. Dock open and `width - 56 - 340 - 24 ≥ 420` ⇒ `inline`, `dockWidth = sideWidth = clamp(300, 0.24·width, 380)`.
4. Dock inline and `lowerZoneCount > 0` ⇒ `engines = 'compact'` (a 44 px strip at the top of the side cell, with the lower zone below it).
5. Dock open but rule 3 fails ⇒ `overlay`. The dock floats over the arena as a sheet (focus-trapped, Esc closes), and `engines = 'pill'`.
6. `enginesPreference === 'closed'` ⇒ `pill` at most. The pill lives in the stage control bar and reopens the panel.
7. Width 860–1099 with no explicit preference ⇒ Engines defaults to `compact`.
8. `stageHeight = clamp(180, 0.32·height, 340)`.

### 4.3 The side cell (bottom-right)

| Dock | Lower zone | Side cell contains |
|---|---|---|
| collapsed | — | Engines **full** (260 px), or nothing if closed |
| inline | empty | Engines **full** at dock width |
| inline | ≥ 1 widget | Engines **compact strip** (44 px) + the lower-zone widget(s) |
| overlay | — | nothing (Engines is a pill) |

The lower zone holds **at most one** widget. Its size is `tall` by definition, because it fills the cell.

---

## 5. Component breakdown

New files live under `src/components/dashboard/` in subfolders. Pure logic goes in
`src/lib/dashboard/`. The old components (`CompanionStage`, `MoodCheckIn`, `NextStepCard`, `TodayCard`,
`MoodWeek`, `BodySignalsCard`, `AdminTools`, `DashboardGreeting`) stay, and are reused as widgets or
empty states where §8 says so. Delete one only once nothing imports it, and only with the owner's
OK (AI_RULES §4).

```
pages/dashboard.tsx                      — picks DesktopDashboard | phone MobileDashboard (useIsMobile)
components/dashboard/
  DesktopDashboard.tsx                   — the grid (§4.1), owns useDashboardLayout + useStageController
  useDashboardLayout.ts                  — ResizeObserver → resolveDashboardLayout → CSS vars
  arena/ChatArena.tsx                    — header, SupportCard slot, ChatMessageList, ComposerBar
  arena/ArenaEmptyState.tsx              — greeting + nextStep primary + starters
  chat/ChatMessageList.tsx               — extracted from ChatPanel (bubbles, chips, sources, referral)
  chat/MessageRow.tsx                    — memoised; variant 'drawer' | 'arena'
  chat/useChatComposer.ts                — draft, send, upload, liveSpeechDraft + composerDraft sync
  composer/ComposerBar.tsx               — +, textarea, dictation, morph slot
  composer/ComposerActionMenu.tsx        — the floating menu (§7)
  composer/composerActions.ts            — the action registry (§7)
  stage/StageGrid.tsx                    — the two tiles + control bar
  stage/CompanionFeed.tsx                — wraps <Companion size="md"/> (live keyed video)
  stage/UserCameraFeed.tsx               — live <video> | avatar card | status states
  stage/StageControlBar.tsx              — Leave/Join, camera, voice (locked), focus swap, engines pill
  stage/useStageController.ts            — runs the machine's side effects (§6.2)
  stage/useCameraStream.ts               — getUserMedia lifecycle, typed status
  engines/EnginesPanel.tsx               — full | compact | pill renderings
  engines/useEngineStatuses.ts           — composes the five sources (§9)
  dock/QuickDock.tsx                     — tab | inline | overlay; zone prop
  dock/DockTab.tsx                       — 56 px tab + pixel-art loop
  dock/DockCustomizer.tsx                — add/remove/reorder (buttons, not drag)
  dock/widgets/*.tsx                     — one file per widget (§8), lazy
components/companion/CompanionStillOrb.tsx — extracted static orb (message avatars, loading fallback)
lib/dashboard/{layout,stageMachine,dockLayout,composerAvailability}.ts — pure, tested
store/useDashboardStore.ts               — §6.1
phone/dashboard/MobileDashboard.tsx      — §11
```

### 5.1 AppLayout change (the only one)

`const onDashboard = location.pathname === '/app'`. When it is true, don't render the chat drawer or its
floating toggle, and don't set `data-chat-drawer`. The `maitri-open-chat` window event focuses the
arena composer instead of opening the drawer. Nothing else in AppLayout changes (AI_RULES §5: desktop
is sacred).

### 5.2 Chat extraction (Phase 1, no visual change)

Move ChatPanel's state into `useChatComposer` and its markup into `ChatMessageList` + `ComposerBar`.
`ChatPanel` becomes a thin composition and **looks identical** in the drawer and in `ChatBottomSheet`.
Check that with a before/after screenshot at 1440 and 375. Everything ChatPanel does today must keep
working in every surface: the elevated-risk SupportCard, suggestion chips, the referral card, web
sources, the offline "Connect a model" banner, "MAITRI is speaking / Stop", the "New conversation"
confirmation, document upload, web search, and the always-visible **"Need help now?"** SOS link.

### 5.3 ChatArena

- **Bubbles:** the companion is on the left with a 32 px `CompanionStillOrb` avatar. The user is on the
  right with `AvatarBadge` at 32 px, which already renders a photo URL or an `icon:` id. The avatar shows
  on the first message of a consecutive run only (WhatsApp grouping); later rows indent to match.
  The user bubble uses the world accent and the companion bubble uses glass, as in ChatPanel today.
  Max bubble width is `min(72ch, 78%)`. Reading text is 14 px, mono only for measured values.
- **Header:** the conversation title "MAITRI", "New conversation" (moved from the old drawer toolbar),
  and the engines strip while the stage is collapsed (§4.2 rule 1).
- **Empty state:** the time-of-day greeting with `preferredName` (`lib/greeting.ts`), the `nextStep`
  primary as one chip, and the three existing starters **[Q4]**.
- **Safety:** an active `useSafetyStore().supportCard` pins `SupportCard` above the list, as today.
  Acute risk and manual SOS still open the full-screen flow, unchanged.
- **Accessibility:** the list is `role="log" aria-live="polite"`, as today, with a "Skip to composer" link.

---

## 6. State

### 6.1 `useDashboardStore` (new, Zustand)

```ts
interface DashboardPrefs {            // persisted: 'maitri-dashboard:<userId>', version 1
  stagePreference: 'joined' | 'left';
  cameraPreference: boolean;          // replaces uiStore.cameraEnabled for /app; see note
  enginesPreference: 'open' | 'closed';
  dockOpen: boolean;
  focusTile: 'companion' | 'user' | null;   // [Q8]
  dockLayout: DockLayout;             // §8
}
interface DashboardRuntime {          // never persisted
  stage: StageState;                  // §6.2
  dispatchStage: (e: StageEvent) => void;
  perception: EngineStatus;           // written by usePerception
}
```

- **Per-user key.** On a shared machine, user B must not inherit user A's dock. It is read on sign-in
  and cleared from memory on sign-out.
- **`uiStore.cameraEnabled`:** only `CompanionStage` writes it (read: grep). YogaPlayer's comment
  says it ignores it. v2 stops using it. Leave the field in place so old persisted state still parses,
  and mark it deprecated.

**What reads and writes which store:**

| Store | v2 reads | v2 writes |
|---|---|---|
| `useChatStore` | `messages`, `isTyping`, `liveSpeechDraft`, `composerDraft`, `openRouterKeyStatus.companionConnected`, `webSearchEnabled`, `isSpeaking` | `sendMessage(text, activeWorld)`, `setComposerDraft`, `toggleWebSearch`, `startNewChat`, `stopSpeaking` |
| `useWorldStore` (= `uiStore`) | `activeWorld` (companion clip, Medical light variant), `backgroundMode`, `voiceEnabled` | none (voice stays locked) |
| `useUserStore` | `avatar`, `preferredName`, `deviceState`, `hardwareSource`, `vitals.source`, `userId` | `setHandPos`, `setDetectedEmotion` (via perception, unchanged), the pairing actions from the `+` menu |
| `useSafetyStore` | `supportCard` | `triggerManualSOS` |
| `useMoodStore` | latest check-in (empty state, widget) | `submit` (widget) |
| `useDashboardStore` | everything above | everything above |

### 6.2 Stage state machine — `src/lib/dashboard/stageMachine.ts`

A **pure reducer** (`(state, event) → state`) tested with `node:test`, like every other test in this
repo. Side effects (getUserMedia, timers, the chime, stopping TTS) live in `useStageController`, which
reacts to state changes. That keeps the timing testable without a DOM.

Camera and companion are separate dimensions, because camera-off and stage-left are different things:

```ts
type StagePhase = 'left' | 'joining' | 'joined' | 'leaving';
type CameraState = 'off' | 'requesting' | 'live' | 'denied' | 'unavailable' | 'error';
type CompanionState = 'absent' | 'arriving' | 'present';

interface StageState { phase: StagePhase; camera: CameraState; companion: CompanionState; cameraWanted: boolean; }

type StageEvent =
  | { type: 'JOIN'; cameraWanted: boolean; fromGesture: boolean }
  | { type: 'LEAVE' }
  | { type: 'CAMERA_TOGGLE' }
  | { type: 'CAMERA_GRANTED' } | { type: 'CAMERA_DENIED' }
  | { type: 'CAMERA_UNAVAILABLE' } | { type: 'CAMERA_ERROR' } | { type: 'CAMERA_ENDED' }
  | { type: 'USER_TILE_SETTLED' }      // camera live, or resolved to off/denied/unavailable/error, or 2.5 s timeout
  | { type: 'COMPANION_DUE' }          // 350 ms after USER_TILE_SETTLED
  | { type: 'COMPANION_ENTERED' }      // tile entry animation finished
  | { type: 'COLLAPSE_DONE' };
```

**Sequence (join, from a gesture):**

```
left ──JOIN──▶ joining {camera: cameraWanted ? 'requesting' : 'off', companion: 'absent'}
  user tile fades in (avatar card while requesting)
  ── CAMERA_GRANTED → camera 'live' │ DENIED/UNAVAILABLE/ERROR → that state (tile shows why)
  ── USER_TILE_SETTLED ─ effect waits 350 ms ─▶ COMPANION_DUE → companion 'arriving'
       (tile: opacity 0→1, scale 0.96→1, 220 ms; chime if fromGesture && chime enabled)
  ── COMPANION_ENTERED ─▶ joined {companion: 'present'}
```

- **The companion never waits on the camera.** Denial, a missing device or a 2.5 s timeout all settle
  the user tile, and the companion still arrives.
- **Leave:** `LEAVE` → `leaving`. The effect **immediately** stops every camera track (the hardware light
  goes off at once), stops perception, unmounts the companion video (keying stops), stops TTS and ends
  voice mode. Then the stage row collapses (300 ms) → `COLLAPSE_DONE` → `left`. The conversation and
  model are untouched.
- **Camera toggle while joined:** `live → off` **stops the tracks**. Hiding the video is not enough,
  and it is the honest version of Meet's mute. `off → requesting → live` calls getUserMedia again.
  Permission is remembered, so this is fast, and the tile shows the avatar card with "Starting camera…"
  in between. `cameraPreference` follows the toggle.
- **Page load:** `stagePreference: 'joined'` restores `joined` **without** the entry sequence or the
  chime (no gesture). The camera starts `off` regardless of preference **[Q3]**.
- **`CAMERA_ENDED`** (unplugged, or revoked in browser settings) → `error`, with "Camera stopped. Turn it on again."
- **Reduced motion:** no scale, 150 ms fades. The 350 ms gap stays, because it carries the meaning
  ("someone joined").
- **Illegal events are no-ops**, for example `COMPANION_DUE` while `leaving`. That is tested, because
  timer events can arrive after a Leave.

**`useCameraStream` fixes a live bug (read: `usePerception.ts`):** the current effect awaits script
loads and then calls `getUserMedia` without a cancellation flag. If the camera is turned off while
models load, cleanup runs before the stream exists, and the stream that arrives later is never stopped,
**so the camera light stays on**. MediaPipe's `Camera` helper also acquires a second stream. The new
hook owns exactly one stream, checks an `aborted` flag after every `await`, and feeds frames to Hands
and FaceMesh from its own `requestVideoFrameCallback` loop (throttled, §2.3). Add the bug to
KNOWN_ISSUES now, whether or not v2 is approved. MediaPipe scripts load from **unpinned** jsDelivr
URLs, so pin the versions in the same change.

### 6.3 Composer morph slot

```ts
type MorphSlot = 'send' | 'send-disabled' | 'voice' | 'voice-locked' | 'voice-end';

function morphSlot(draft: string, isTyping: boolean, voiceMode: 'off' | 'on', voiceUnlocked: boolean): MorphSlot {
  if (draft.trim()) return isTyping ? 'send-disabled' : 'send';
  if (voiceMode === 'on') return 'voice-end';
  return voiceUnlocked ? 'voice' : 'voice-locked';
}
```

- It is **one `<button>`** with a fixed 40×40 box. The icon cross-fades (`AnimatePresence mode="popLayout"`,
  150 ms) and the background goes accent ↔ glass (150 ms colour). The textarea never reflows. The
  `aria-label` follows the slot: "Send message", "Start voice conversation", "Voice conversation:
  coming soon", "End voice conversation".
- Enter sends, Shift+Enter makes a newline, and IME composition is respected, as in ChatPanel today.
- **Dictation** (the separate mic, left of the slot) inserts text into the draft and **never auto-sends**.
  That is the difference from voice mode. Today's "Talk" toggle auto-sends on a final transcript. v2
  doesn't. Both controls are locked until BACKLOG §V **[Q2]**.
- Voice mode's own machine (listening → thinking → speaking → listening, with barge-in) is specified
  with BACKLOG §V, not here. Only the interface above is fixed now.

---

## 7. `+` action menu — data contract

`src/components/dashboard/composer/composerActions.ts`, with availability logic in
`src/lib/dashboard/composerAvailability.ts` (pure, tested).

```ts
export type ComposerActionId = 'add-document' | 'pair-device' | 'web-search' | 'new-conversation' | 'import-chat';

export interface ComposerContext {
  isUploading: boolean;
  webSearchEnabled: boolean;
  deviceState: DeviceConnectionState;
  webBluetooth: boolean;                // 'bluetooth' in navigator
  messageCount: number;
  features: typeof FEATURES;
}

export type Availability =
  | { state: 'ready' }
  | { state: 'busy'; label: string }           // e.g. "Adding file…"
  | { state: 'locked'; reason: string }        // shown, aria-disabled, "Coming soon"
  | { state: 'hidden' };

export interface ComposerAction {
  id: ComposerActionId;
  group: 'add' | 'connect' | 'conversation';
  label: string;                         // sentence case, plain: "Add a document"
  hint?: string;                         // one line under the label
  icon: LucideIcon;
  kind: 'file' | 'toggle' | 'command' | 'navigate';
  accept?: string;                       // kind 'file'
  availability: (ctx: ComposerContext) => Availability;
  isOn?: (ctx: ComposerContext) => boolean;      // kind 'toggle' → role="menuitemcheckbox"
  run: (ctx: ComposerContext, deps: ComposerDeps) => void | Promise<void>;
}
```

| id | Maps to (exists today — read) | Availability |
|---|---|---|
| `add-document` | `useDocumentStore.uploadFile` (RAG), `.txt,.md,.json,.csv,.pdf,.doc,.docx` | busy while uploading |
| `pair-device` | `useUserStore` pairing actions; in a non-Chromium browser it offers **Simulated** | label "Sensor connected" when connected (opens `/app/devices`) |
| `web-search` | `useChatStore.toggleWebSearch` | toggle with On/Off |
| `new-conversation` | `startNewChat`, with the existing confirm step | hidden when only the welcome message exists |
| `import-chat` | **not built** | `hidden` **[Q7]** |

**Behaviour:** the `+` rotates **45°** into a × (200 ms) rather than 90/180°, because 45° is the turn that
reads as "close". The menu opens upward, anchored to the button, on glass. `role="menu"` with roving
focus (↑↓, Home/End). Esc or an outside click closes it and returns focus to `+`. Groups are separated
by a hairline. Hit targets are ≥ 40 px desktop and 44 px phone.

---

## 8. Quick dock — widget contract

```ts
export type DockWidgetId = 'today' | 'check-in' | 'your-week' | 'journal-note' | 'yoga' | 'body-signals' | 'admin-tools';
export type DockWidgetSize = 'compact' | 'standard' | 'tall';   // ~120 / ~240 / fills remaining height

export interface DockWidgetContext {
  isAdmin: boolean;
  deviceState: DeviceConnectionState;
  journalLocked: boolean;
}

export interface DockWidgetDefinition<C = undefined> {
  id: DockWidgetId;
  title: string;                         // "Today", "Quick note"
  description: string;                   // one line, shown in the customizer
  icon: LucideIcon;
  sizes: readonly DockWidgetSize[];
  defaultSize: DockWidgetSize;
  zones: readonly ('upper' | 'lower')[];
  availability: (ctx: DockWidgetContext) => Availability;   // same union as §7
  load: () => Promise<{ default: React.ComponentType<DockWidgetProps<C>> }>;  // React.lazy
  defaultConfig?: C;
}

export interface DockWidgetProps<C = undefined> {
  instanceId: string;
  size: DockWidgetSize;
  config: C;
  setConfig: (next: C) => void;
  visible: boolean;                      // false while the dock is collapsed or off-screen → pause timers
}

export interface DockWidgetInstance { instanceId: string; widgetId: DockWidgetId; size: DockWidgetSize; config?: unknown; }
export interface DockLayout { version: 1; upper: DockWidgetInstance[]; lower: DockWidgetInstance[] /* ≤ 1 */; }
```

`src/lib/dashboard/dockLayout.ts` holds the pure `parseDockLayout(raw): DockLayout`. It drops unknown
ids, duplicates of single-instance widgets, a second lower-zone item and bad sizes, and falls back to
the default when the JSON is malformed. Unit-test it, because it reads untrusted localStorage.

| Widget | Reuses | Notes |
|---|---|---|
| `today` | `TodayCard` / `HabitList` | Default upper. Text progress ("2 of 4 habits done"), as today. |
| `check-in` | `MoodCheckIn` | Default upper **[Q4]**. Append-only, unchanged. |
| `your-week` | `MoodWeek` | |
| `journal-note` | journal API | Saves a real entry. Locked when the journal privacy lock is on **[Q10]**. No autosave claim. |
| `yoga` | links into `/app/yoga` | Lists only what the UI can reach today (Morning Awakening, PRODUCT.md). |
| `body-signals` | `BodySignalsCard` | Live while a sensor is connected. Otherwise one quiet "Connect a sensor" line, never zeros. Simulated is tagged. |
| `admin-tools` | `AdminTools` | `hidden` unless `useIsAdminUser()`. |

- **Panel-as-Unit Rule:** the dock is the panel. Widgets render **bare**, as sections with a 12 px
  uppercase-free heading and hairline separators, never a `GlassCard` inside the dock's glass. Each
  reused card needs a `bare` prop that drops its own container.
- **Customize mode:** a "Customize" button in the dock header switches each section to Move up / Move
  down / Size / Remove buttons plus an "Add widget" list. There is no drag-and-drop in v1: buttons are
  keyboard- and screen-reader-complete and cheaper to build. Drag can be added later.
- **"Pin to dashboard"** buttons on source pages (Journal, Checklist, Yoga, Health) are **Phase 5b**.
  They call `addWidget(id)` and toast "Pinned to your dashboard".
- **Default layout:** `upper: [today, check-in]`, `lower: []`.

### 8.1 Dock tab (collapsed)

The tab is 56 px wide and spans the top row: the pixel-art loop fills it (`object-fit: cover`), with a
chevron button at the top (`aria-expanded`, `aria-controls`, label "Open your dock"). The loop plays
only under the conditions in §2.3. Its poster frame is the first frame. With no asset yet **[Q6]**, the
tab shows a world-tinted vertical gradient. The whole tab is the button's hit area.

---

## 9. Engines panel — status contract

```ts
export type EngineId = 'perception' | 'biometrics' | 'ambient-audio' | 'companion-model' | 'voice';
export type EngineLevel = 'off' | 'starting' | 'on' | 'simulated' | 'attention' | 'locked';

export interface EngineStatus {
  id: EngineId;
  name: string;            // plain: "Perception", "Body sensor", "Soundscape", "Companion model", "Voice"
  level: EngineLevel;
  detail: string;          // one line of truth: "Running on this device", "Simulated telemetry"
  action?: { label: string; to?: string; run?: () => void };  // "Connect", "Settings", "Retry"
}
```

| Engine | Source (exists — read) | Levels |
|---|---|---|
| Perception | `usePerception` status (new, §6.2) | off · starting ("Loading on this device") · on ("Running on this device") · attention ("Couldn't start — Retry") |
| Body sensor | `useUserStore.deviceState`, `hardwareSource`, `vitals.source` | off ("Not connected", Connect) · starting (scanning/connecting) · on ("Live — Bluetooth") · simulated ("Simulated telemetry") |
| Soundscape | `globalAudioManager.subscribe` / `getActiveSource()`, plus the world's synth type | off · on ("Forest soundscape" / "Music") |
| Companion model | `GET /companion` → `effectiveProvider`, `GET /companion/rig-status` → `online` (both exist) | off ("Not connected", Settings) · on ("Local GPU — online" / "Your OpenRouter key") · attention ("Local GPU — offline") |
| Voice | `FEATURES.companionVoice` | locked ("Coming soon") |

- **Never shown:** emotion labels, invented FPS, latency or load figures, library or vendor names.
  If a measured figure is added later (for example, real perception inferences/s), it is in mono and
  measured from the loop.
- **Colour:** `on` = world-accent dot. `simulated` = accent hairline + "Simulated" tag. `off` = slate.
  `attention` = slate dot + plain text + action. **No red or amber** (red is crisis-only, and DESIGN.md
  removed warning colours from absent sensors). `locked` = lock glyph.
- **Polling:** `/companion/rig-status` is cached 30 s server-side. The client polls every 60 s only while
  Engines is visible and the tab is visible. `/companion` is fetched on mount and after Settings saves.
- **Compact strip:** five 44 px icon chips with a dot each. Each chip's `aria-label` is the full sentence
  ("Companion model: Local GPU, online"). A tap opens a popover with detail + action.
- No backend change is needed: both endpoints exist.

---

## 10. Cross-cutting rules

- **Medical Sanctuary** (the one light world): verify every surface. Stage tiles stay dark islands
  (`surface-ink`), like the current camera preview. The arena and dock use the Medical white-glass remap.
- **Focus:** every control gets a world-accent `focus-visible` ring. Tab order is arena → composer →
  stage bar → Engines → dock. The overlay dock traps focus.
- **Copy:** warm and plain. "Join stage", "Leave stage", "Camera off", "MAITRI joined" (announced
  politely to screen readers). Never "Disconnected", "Call ended" or "Initialising perception engine".
- **Privacy line:** the user tile keeps "On this device only" while live, as the current preview does
  (PRODUCT.md principle 2).
- **Chime:** a two-note WebAudio sine under 400 ms, at −18 dBFS relative to the synth bus. It plays only
  on a gesture-initiated join. It is off when the soundscape is muted, and it has a toggle in Settings →
  Sound **[Q1]**.
- **Emoji ban:** Lucide only (`tests/emojiBan.test.ts`).

---

## 11. Mobile (< 768 px) — `src/phone/dashboard/MobileDashboard.tsx`

This is a separate composition inside `MobileAppLayout`, sharing only the extracted chat pieces, the
stores and the pure libs. No desktop classes change.

- The chat takes the full height. The composer sits above the bottom tab bar with
  `env(safe-area-inset-bottom)` and 44 px targets.
- The **stage** is a collapsible strip pinned above the messages: two 96 px tiles plus Join/Leave and
  Camera, collapsed by default **[Q11]**. The same machine drives it.
- **Engines** is a status pill in the header that opens a bottom sheet.
- **Dock** is a header button that opens a full-height sheet with the same widgets, rendered `standard`.
  No pixel-art tab on phones (battery).
- The `+` menu opens as a bottom sheet rather than a popover.

---

## 12. Phases & verification

Stop for owner review after each phase (same cadence as the refinement plan).

| Phase | Scope | Done when |
|---|---|---|
| **0** | Owner answers §1 and §3. DESIGN.md "Dashboard `/app`" rewritten from the answers. Record the camera-light bug and unpinned MediaPipe in KNOWN_ISSUES. | Decisions recorded |
| **1** | Foundations, no visible change: chat extraction (§5.2), `CompanionStillOrb`, `useCameraStream` + perception status (fixes the bug), `stageMachine`, `layout`, `dockLayout`, `composerAvailability` + tests, `useDashboardStore`. | Drawer and phone sheet pixel-identical before/after. New tests green. |
| **2** | `DesktopDashboard` grid, `ChatArena`, `ComposerBar` + menu + morph slot (locked voice), AppLayout `/app` drawer change. | Chat fully usable on `/app` at 1440 / 1280 / 1024. |
| **3** | Stage: tiles, control bar, controller effects, chime, collapse/expand. | Join/Leave/camera sequences match §6.2 by hand. Camera light off within one frame of Leave. |
| **4** | Engines panel (full/compact/pill), the five sources, polling. | Every level reachable and truthful (pull the sensor, stop the rig, mute audio). |
| **5** | Dock: tab, inline/overlay, widgets, customize mode. **5b:** "Pin to dashboard" on source pages. | Resolver rules observed live. Layout survives reload and sign-out/in as another user. |
| **6** | Mobile composition. | 375 px and 390 px pass. Desktop unchanged. |
| **7** | Docs: DESIGN.md, CURRENT_STATUS, KNOWN_ISSUES, PRODUCT.md surface list. Retire unused old components (owner OK). Performance trace (§2.3). | Handoff updated. Trace numbers recorded. |

**Every phase:** `npx tsc -b`, `npm test`, `npx oxlint`, `npm run build`. Screenshots at 1440, 1024 and
375 (Playwright headless shell if Chrome is backgrounded). Check Medical. Check reduced motion. Do a
keyboard-only pass.

**New tests:** `tests/stageMachine.test.ts` (sequences, illegal events, leave mid-join, denial path,
load without a gesture), `tests/dashboardLayout.test.ts` (one case per §4.2 rule, plus the 420 px
invariant across widths 640–1920), `tests/dockLayout.test.ts` (malformed and hostile JSON),
`tests/composerAvailability.test.ts`, and a `morphSlot` case table.

---

## 13. Out of scope

On-device STT/TTS and voice mode behaviour (BACKLOG §V). Chat import. Server-side dock sync.
Drag-and-drop customisation. Moving perception to a worker. Multi-camera selection. Any change to
`useYogaPracticeStore`, the yoga camera path, or the companion persona and model routing.

---

## 14. Owner decisions (2026-10-17) and build log

**Answers to §1 and §3**
- **C1 / Q1:** confirmed. "Join Stage" / "Leave Stage", quiet accents, no red, the soft WebAudio chime on join.
- **C2 / Q2:** confirmed. Mic and voice button ship locked "Coming soon". The voice button still morphs into Send when text is typed.
- **Q3:** confirmed. **The camera never starts on page load.** It only starts from a gesture.
- **C4 / Q4:** **postponed to the last phase.** Check-in, habits and the next step come after the arena, stage and dock container.
- **Q5:** confirmed. localStorage per user, `maitri-dashboard:<user key>`. The client has no user id, so the key is a hash of the signed-in e-mail (`lib/chatHistory.ts → userStorageKey`).
- **Q6:** confirmed. An animated fallback in the 56 px tab until a video asset exists.
- **C7 / Q7:** confirmed. No "Import Chat". The menu has `add-document`, `pair-device`, `web-search`, `new-conversation`.
- **Q8:** perspective button confirmed, **plus a drag divider between the companion and camera tiles** (Phase 3; `tileSplit` 0.3–0.7 already lives in `useDashboardStore`).
- **Q10:** confirmed. The quick note saves to the journal and honours the privacy lock.
- **Q11:** confirmed. A collapsible strip above the messages on phones.
- **§6.2 bug fix:** confirmed. `useCameraStream` extracted.

**Added scope**
- **Remove the floating music player** (`<MusicPlayer />` in AppLayout). Move the soundscape library into a glass popover opened from the sidebar's bottom sound row.
- **Chat history:** view past conversations, switch or continue one, and start a New Chat, from the left of the arena header.

**Phase 1 — foundations (done 2026-10-17)**
- Pure, tested logic: `lib/dashboard/{stageMachine,layout,dockLayout,composerAvailability,prefs}.ts` and `lib/chatHistory.ts`. Tests are in `tests/{stageMachine,dashboardLayout,dockLayout,composerAvailability,dashboardPrefs,chatHistory}.test.ts` (69 new).
- `store/useDashboardStore.ts` holds preferences, persisted per user, plus the stage machine at runtime. `store/useChatHistoryStore.ts` holds history per user.
- Chat extraction: `dashboard/chat/{useChatComposer,MessageRow,ChatMessageList,ChatStatusBanners}` and `dashboard/composer/{ComposerBar,ComposerActionMenu}`. `ChatPanel` is now a thin composition. The drawer and phone sheet look as before (checked in screenshots).
- `companion/CompanionStillOrb.tsx` is extracted. `Companion` gained `size="fill"`.
- `dashboard/useCameraStream.ts` added and `usePerception` rebuilt on it. This fixes the camera-light leak. MediaPipe and face-api URLs are pinned, inference is throttled (15/s landmarks, 2/s expressions), and the hook reports camera and perception status.
- `uiStore` no longer persists `cameraEnabled` (Q3).
- Sound: `ui/SoundscapeMenu.tsx`, opened from the sidebar row and from the collapsed rail. The floating player is removed from AppLayout only; phones still have it (see KNOWN_ISSUES 2026-10-17).

**Phase 2 — grid, arena, composer, history (done 2026-10-17)**
- `dashboard/DesktopDashboard.tsx`, `dashboard/useDashboardLayout.ts` and the `.dash-v2` grid in `index.css`.
- `dashboard/arena/{ChatArena,ChatHistoryMenu,ArenaEmptyState}.tsx`. The `+` menu has four actions, and the `+` turns 45° into ×. The voice button morphs into Send.
- AppLayout: no drawer and no drawer toggle on `/app`. The `maitri-open-chat` event focuses the arena composer.
- `pages/dashboard.tsx`: desktop and tablet get v2. Phones keep the 2026-10-03 page until Phase 6.
- **Interim:** until Phase 3 the stage row holds the existing `CompanionStage` (`fill`), so the companion never leaves `/app`. The Engines and dock tracks stay at 0 until Phases 4 and 5.
- New Chat no longer asks "Start over?" in the arena, because the conversation goes into history. The drawer keeps its confirmation unchanged.

**Phase 3 directive (2026-10-17)**
- Remove the floating player **on phones too**. The sound menu hangs from the phone header's speaker button.
- Keep the soundscape track names as they are.
- Perspective toggles companion 2/3 ↔ camera 2/3. The divider clamps to 0.3–0.7 and persists `tileSplit`.

**Phase 3 — the stage (done 2026-10-17)**
- `dashboard/stage/{StageGrid,CompanionFeed,UserCameraFeed,StageControlBar,StageDivider,useStageController}`, `lib/dashboard/tileSplit.ts` (+ `tests/tileSplit.test.ts`), `utils/stageChime.ts`, `arena/JoinStageButton.tsx`, and the `.dash-v2-tiles` CSS.
- The companion tile shows the live keyed companion for the world. It is mounted only while arriving or present, so Leave stops decoding and keying. The camera tile shows live video with "On this device only". Otherwise it shows the avatar card with a plain reason and one action (off, starting, blocked, no camera, stopped).
- Join, from the header button while the stage is left: the camera first, then the companion **350 ms after the camera answers**, with the two-note chime (gesture joins only). Leave: the camera is released in the same commit, speech stops, and the row collapses over 300 ms. The arena takes the full height.
- **The camera preference now defaults to ON**, so an explicit Join starts it, as the owner described. A page load still never starts the camera (Q3). The store starts already restored, so the row doesn't slide open on every load.
- **Perception models start only once the companion has arrived.** Their start-up blocked the main thread for ~1.6 s (measured, headless Chromium) and stretched the 350 ms gap to ~2 s.
- The divider is a focusable separator: drag, ←/→ 5 %, Home/End, Enter or double-click to even out. It previews while dragging and saves once on release.
- `focusTile` was removed from the preferences. The split alone expresses perspective.
- The grid transitions switch on one frame after the first measurement, so the first real size doesn't slide in.
- `CompanionStage` is back to its 2026-10-03 form (phones only).
- Not built yet: a Settings toggle for the chime (spec §10). It plays on gesture joins only and is quiet.

**Phase 4 — the Engines panel (done 2026-10-17)**
- `lib/dashboard/engineStatus.ts` (pure, `tests/engineStatus.test.ts`, 15 tests, including one that no status carries a number, a library name or an emotion word), `dashboard/engines/{useEngineStatuses.ts,EnginesPanel.tsx}`. The store gains runtime `perception`, `perceptionRetry` and `model` (with `refreshModel` and `refreshRigStatus`).
- **Full** (260 px column), **compact** (56 px strip under the dock tab; it shows four engines because voice is always "Coming soon"), **pill** (in the stage control bar while the panel is closed, showing the count of engines that are on), and **inline** (a small status row in the arena header while the stage is left, spec §4.2 rule 1).
- **Close** (×) saves `enginesPreference: 'closed'`, and the stage tiles widen over 260 ms. The pill reopens it with `'open'`.
- Sources: perception's own run state (written by the stage controller; "Try again" restarts the models), the device and sensor-node fields, the GlobalAudioManager's active source with the sound menu's label, `GET /api/account/companion` (`effectiveProvider`) and `/companion/rig-status`.
- **Body sensor:** only the sensor node's live stream (`hardwareSource 'live'` and `isHardwareOnline`) is "Live". A paired band with no stream still produces simulated drift, so it is "Simulated" ("Paired, demo readings").
- **Polling:** the model route is fetched once per Engines mount, and that fetch also probes the rig. After that the rig is probed every 60 s only while the full panel, the compact strip or the header row is on screen and the tab is visible. Returning to the tab probes at once. The pill never polls.
- "Choose" (soundscape) opens the sound menu through a `maitri-open-sound` window event that AppLayout handles.

**Phase 5 — the quick dock (done 2026-10-17)**
- `dashboard/dock/{QuickDock,DockTab,DockWidgetFrame,DockPicker,DockLowerZone,widgetRegistry}`, `dock/widgets/{JournalNoteWidget,YogaWidget,BodySignalsWidget,AdminToolsWidget}`, and edit operations in `lib/dashboard/dockLayout.ts` (add, remove, move, moveToZone, setWidgetSize, nextSize; +7 tests). `BodySignalsCard` and `AdminTools` gain a `bare` variant. The Engines horizontal strip is `EnginesStrip`.
- **Tab:** 56 px, the whole tab is a button. A CSS ambient fallback (breathing accent glow plus six drifting motes, 12–21 s, transform/opacity only) is double-gated by `useMotionTier` and `prefers-reduced-motion`.
- **Inline:** ~340 px (`clamp(320, 0.3·w, 380)`; the width formula changed from `0.24·w` / 300 min). The column is right-justified and clipped, so the panel reveals from the right as the track animates. **Overlay:** when inline would push the arena under 420 px, a modal sheet with a focus trap, Esc and outside-press to close, and focus returned to the tab. **Header opener** when even the tab doesn't fit.
- **Lower zone:** one tall widget in the bottom-right cell, under the 44 px Engines strip (one panel). "Move beside the stage" is offered only while the dock is inline.
- **Widgets:** *Quick note* saves through `addJournalEntry` (POST /api/journal, no reflection), is locked when `GET /api/journal/settings` says the journal is protected, and says so when it can't check. *Yoga* starts `morning_stretch_15` through `/app/yoga-practice` (the routine the UI already reaches) and links to the studio. *Body signals* shows bare readings with stacked "Simulated" tags, or "No sensor connected. Connect one". *Admin tools* is hidden for non-admins.
- **Customize:** Move up / Move down / Size (cycles the widget's allowed sizes) / beside the stage ↔ back up / Remove, plus "Add a widget" (single-instance, max 8). It is runtime-only; the layout persists per user (`dockLayout`).
- **Default dock changed** to Quick note + Yoga, since Today and Check-in are postponed. Prefs version 2 migrates an untouched old default (Today + Check-in) to the new one; a dock the user arranged is kept.

**Phase 6 — the phone layout (done 2026-10-17)**
- `src/phone/dashboard/{MobileDashboard,MobileStageStrip,PhoneSheets}.tsx` and `src/phone/components/BottomSheet.tsx`. `pages/dashboard.tsx` now renders `MobileDashboard` on phones. **The 2026-10-03 phone page is retired.** Its check-in, Today, Your week and next step return as dock widgets in Phase 7, so `CompanionStage`, `DashboardGreeting`, `MoodCheckIn`, `NextStepCard`, `TodayCard` and `MoodWeek` have no importers until then.
- **MobileAppLayout on `/app`:** the root is `h-[100dvh] overflow-hidden`, and `<main>` is a full-height flex column with bottom padding `calc(57px + max(safe-area, 10px) + 8px)`, so the page never scrolls and the composer docks just above the tab bar. There is no chat sheet on `/app`, and `maitri-open-chat` focuses the arena composer. Other pages are unchanged.
- **MobileHeader on `/app`:** the Chat button is replaced by the **Engines pill** (count of engines that are on → Engines sheet) and the **Dock button** (→ Quick Dock sheet). Both are 36 px to look at, with a 44 px tap area. The header also listens for `maitri-open-sound`. The avatar and brand links gained invisible 44 px hit areas.
- **Stage strip:** the same `useStageController` and machine, collapsed by default (Q11). Collapsed, it is a 44 px row: the status, then Join stage or Show. Expanded, it shows two 96 px tiles (`CompanionFeed` / `UserCameraFeed` with `compact`) and Camera / Leave stage. The keyed companion is mounted only while expanded. A camera left on while collapsed keeps running, and the row shows "Camera on" with a one-tap off. Join expands the strip, so the entrance is seen.
- **Chat:** the arena list with greeting and starters, a header with History / New chat, and the composer. The `+` menu opens as a bottom sheet (`ComposerBar.menuRenderer`, `ComposerActionMenu variant="sheet"`). Mic and voice stay locked.
- **Bottom sheets** are portalled, open with a slide (a fade under reduced motion), and close by dragging the handle (only the handle starts a drag), tapping the backdrop, Esc, or the close button. They are modal: focus moves in, Tab is trapped, and focus returns to the opener. The background is opaque.
- **Touch targets:** a scoped `.phone-touch` rule (index.css) sets a 44 px minimum on buttons, block-level links, text inputs and menu items across the phone dashboard and its sheets. Inline text links are exempt (WCAG 2.5.8).
- **Dock sheet:** every placed widget (upper, then lower) at `size="standard"`, with Customize (DockWidgetFrame controls + picker; no lower zone on phones). No animated tab on phones.

**Phase 7 — the postponed widgets, the next step, retirement, docs (done 2026-10-17)**
- `dock/widgets/{CheckInWidget,TodayWidget,YourWeekWidget}.tsx`, registered in `widgetRegistry.ts` (Check-in: compact/standard; Today: compact/standard/tall; Your week: compact/standard). They are bare ports of the old cards, with the same rules (append-only check-in with tags, note and crisis scan; progress in words; omitted days as outlines). `CheckInPanel` is shared with the arena. The mood row is a content-sized flex row, because "Struggling" overflowed equal columns in the narrow dock (measured 61 px in 56 px).
- **Check-in is choose-then-Save (two taps), not one tap.** Check-ins are append-only with no edit or delete, so a single mis-tap would become a permanent row. This is a deliberate deviation from "one-tap submission".
- **Arena next step** (`arena/ArenaNextStep.tsx`): before today's check-in, a quiet prompt that opens the dock or the Dock sheet and focuses its Check-in (a pending flag survives the lazy load), or opens `CheckInPanel` inline when the dock lacks it. After the check-in, `lib/nextStep.ts`'s primary step ("Begin" → the tool, "Open chat" → an editable draft in the composer) and at most one quiet secondary. It uses the accent, not gold.
- `pages/dashboard.tsx` fetches the week's check-ins for both layouts.
- **Default dock is Check-in + Today again** (the spec's default). The Phase 5 v1 → v2 swap is retired (the migration is now the identity, version kept at 2), so saved docks are untouched.
- **Retired** (no importers, verified): `CompanionStage`, `DashboardGreeting`, `NextStepCard`, `TodayCard`, `MoodCheckIn`, `MoodWeek` and `ui/MusicPlayer.tsx`, plus the `.music-player-default` CSS. Left in place and listed in KNOWN_ISSUES: `useVoiceInput.ts`, `uiStore.musicWidget*`, and the non-bare branches of `BodySignalsCard` / `AdminTools`.
- DESIGN.md "Dashboard `/app`" is rewritten to the design as built. KNOWN_ISSUES has been pruned of resolved items.

**Owner review — full-height dock, compact stage, side wings (2026-10-17 → 20)**
- **Part 1 (committed by the owner):** the resolver (`lib/dashboard/layout.ts`) and grid (`.dash-v2`) now use a main column plus a dock column. The dock runs the full height and splits only while a lower-zone widget sits beside the stage (`dockSpan: 'split'`), with Engines beside the stage inside the main column. `ENGINES_AUTO_FULL_MIN` is now 1300 px. There is a new persisted preference `stagePosition` and a runtime `stageSince`. The resolver handles side wings: 200–300 px each; the wings win over an inline dock (which becomes the overlay); the stage falls back below when even the tab leaves no room; and the arena is ≥ 420 px in both positions (tested 440–2200 px).
- **Part 2 (2026-10-20):**
  - `lib/breathPace.ts`: the companion's breathing timing, shared by `Companion.tsx` and the new breathing guide. It includes a CSS animation-delay helper so the CSS guide starts in phase.
  - `lib/dashboard/stageGeometry.ts` (+ `tests/stageGeometry.test.ts`): compact tiles about 4:3, at most 512 px, centred. Tiles narrow to no less than 1.2:1 when that lets both 140 px strips fit (what a 1440 × 900 window with the full sidebar needs). `formatStageDuration` formats the timer.
  - `stage/StageSideStrips.tsx`: "Breathe with MAITRI · in 4 s, out 6 s" (a guide, not a reading) and the session strip (time on stage from `stageSince`, the soundscape and "Choose").
  - `stage/CameraHost.tsx`: the camera tile is portalled once into a stable host element that the bottom slot or the right-wing slot adopts with `appendChild`, so switching never remounts the `<video>`.
  - `DesktopDashboard` now owns the stage controller (shared by both positions) and renders the wings. `StageGrid` is presentational and compact. `StageControlBar` gains the layout button (with a "Wings need room" state when wings are chosen but don't fit), wrapping for narrow wings, and no Perspective in wings mode. `QuickDock` gains `mergeLower` / `lowerAvailable`, so a lower-zone widget joins the dock panel while the stage is on the sides.
- **Verified (headless Chromium, fake camera, temporary fixture, deleted afterwards):**
  - **1440 × 900 bottom stage:** tiles 346 × 271 px, both strips 140 px, the guide animating from the shared clock's phase, and the dock tab 848 px tall (full height).
  - **Bottom → side wings → bottom, with the camera live and perception "Running":** the same `<video>` element throughout, never paused, the same stream id, 1 camera acquisition, 1 live track. Perception was still "Running" after the round trip, and there was no model-restart long task.
  - **1440 wings:** 215 px each, the chat 622 px, the stage row 0 px.
  - **1280 × 800:** with the full sidebar, the bottom stage has no strips and the wings are 200 px with the chat 492 px; with the rail, the strips show and the wings are 222 px.
  - **Dock:** wings at 1440 with the dock open → overlay dialog containing the lower widget. 1920 with the rail → the dock inline and full height with the lower widget merged in. Bottom stage with a lower widget → the split returns.
  - No horizontal overflow anywhere.
