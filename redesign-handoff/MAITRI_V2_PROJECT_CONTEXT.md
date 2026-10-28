# MAITRI v2.0 — PROJECT CONTEXT

> Full-project context for a fresh AI (or human) session. **Verified 2026-10-02 against HEAD
> `1c15743`** by walking the tree and reading the code. Anything not directly verifiable is
> marked **[UNKNOWN — DO NOT ASSUME]**.
>
> Companion files: *current state* → `MAITRI_V2_CURRENT_STATUS.md` · *routes, tables, env* →
> `MAITRI_V2_API_AND_DATA_REFERENCE.md` · *yoga rules* → `MAITRI_V2_CANON_AND_GUARDRAILS.md` ·
> *what is broken* → `MAITRI_V2_KNOWN_ISSUES.md` · *how to run/test* →
> `MAITRI_V2_DEV_WORKFLOW_AND_TESTING.md` · *how to behave* → `MAITRI_V2_AI_RULES.md`.

---

## A. Identity

| Field | Value |
|---|---|
| Product | **MAITRI 2.0** — *Adaptive AI Wellness Companion for Mind & Workspace* |
| Version | `2.0.0-beta.1` (root `package.json`); backend package `2.0.0` |
| Repository | `github.com/Vaibhavsolanki1/Maitriv2.0`, branch `main` |
| Contributors (git) | Vaibhav Solanki (`Vaibhavsolanki1`), Aksh Rastogi (`ChickenWings` — the owner referred to as *Aksh* in review documents), Srishti Gupta (1 commit) |
| History | 149 commits, 2026-07-24 → 2026-09-05 |
| Licence | Proprietary |
| Live | Frontend `https://maitriv2-0.vercel.app` (Vercel) · API on Render (Singapore) · Supabase Postgres |

**What it is.** A full-stack wellness workspace built around a closed loop:
**Sense** (camera emotion, voice tone, hand/pose tracking, Bluetooth and ESP8266 biosensors) →
**Adapt** (six themed "worlds", procedural audio, an AI companion whose prompt carries the
user's state) → **Guide** (breathing, meditation, focus, scored yoga, human psychologists) →
**Record** (habits, journal, vitals history, session receipts). All perception runs in the
browser; no camera or microphone stream leaves the device.

**Product & design authority:** `docs/PRODUCT.md` (who it's for, what may be claimed) and
`docs/DESIGN.md` (the "Living Terrarium" design system). Board-level summary:
`docs/PROJECT_OVERVIEW.md`.

## B. Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript ~6.0, Vite 8, Tailwind 3.4, Framer Motion 12, Zustand 5, React Router 7 (all pages lazy-loaded), lucide-react |
| 3D (yoga only, lazy) | `three` + `@react-three/fiber` (D11; `@react-three/drei` declined) |
| Perception | MediaPipe Pose/Hands (CDN script + `@mediapipe/*`), `@vladmandic/face-api`, Web Audio analysis, Web Speech recognition |
| Speech out | `kokoro-js` in-browser TTS (5 voices) with Web Speech fallback |
| Backend | Node ESM, Express 5, `pg` pool + Knex migrations, zod, helmet, express-rate-limit, cookie-parser, multer + pdf-parse, pino, `ws`, google-auth-library, bcryptjs, jsonwebtoken |
| AI | OpenRouter (free-tier model cascade) |
| Email | Brevo transactional API |
| Mobile | Capacitor 8 Android shell (`android/`); the PWA was removed |
| Hardware | ESP8266 NodeMCU + AD8232 ECG + DHT11, PlatformIO (`hardware/`) |
| Tests | Node's built-in runner, TS via `--experimental-strip-types` + `tests/resolve-ts.mjs`; no Jest, no React test infra |
| Lint | oxlint 1.74 (`.oxlintrc.json`); ESLint is not used |

## C. Repository map

```
Maitriv2.0/
├── README.md                 product README + quick start
├── docs/                     ALL project documentation (index: docs/README.md)
│   ├── ai-handoff/           ← this package
│   └── yoga-studio/          yoga canon + design records
├── src/                      React SPA (224 TS/TSX files, ~49k lines)
│   ├── App.tsx               route table (marketing · auth · /app · /psychologist · /admin)
│   ├── layouts/AppLayout.tsx desktop shell: left sidebar + right chat drawer
│   ├── phone/                MOBILE shell — MobileAppLayout, BottomTabBar, MobileHeader, ChatBottomSheet
│   ├── pages/                route components (+ admin/, psychologist/)
│   ├── components/           community/ companion/ dashboard/ profile/ psychologist/ safety/ ui/ wellness/
│   ├── store/                Zustand stores (see API reference §7)
│   ├── lib/                  themeTokens, useThemeTokens, useMotionPreference, useAdaptiveQuality
│   ├── utils/                apiConfig, fetchInterceptor (CSRF), EmotionDetector, VoiceAudioAnalyzer,
│   │                         KokoroTTS, WebAudioSynth, ProceduralWellnessAudio, GlobalAudioManager,
│   │                         chromaKey, offlineSync (IndexedDB queue), pwaManager, platform, …
│   └── wellness-engine/      breathing/ meditation/ focus/ stretching/(stub) yoga/
├── backend/                  Express API — its own package.json (65 JS files, ~11k lines)
│   ├── database/db.js        THE pool + initDb() (runs knex migrate.latest on boot)
│   ├── database/migrations/  13 Knex migrations (append-only)
│   ├── knexfile.js
│   ├── scripts/              backup.js, restore.js  (npm run db:backup / db:restore)
│   └── src/
│       ├── index.js          app assembly, limiters, mounts, WebSockets, graceful shutdown
│       ├── config/jwt.js
│       ├── middleware/       auth, adminAuth (requireAdmin/requireRole), psychologistAuth, csrf,
│       │                     errorHandler, validate + schemas (zod)
│       ├── features/         admin · auth · community · companion-chat · documents · feedback ·
│       │                     habits · journal · psychologist · vitals · yoga-recordings
│       ├── services/         contextAssembler, conversationMemory, emotionEngine, emailService,
│       │                     otpEmail (the sign-in template, pure; 2026-10-22), handoffSummarizer,
│       │                     streamParser, webSearchService
│       └── utils/            logger (pino), safetyScanner
├── tests/                    22 *.test.ts suites + fixtures/ + resolve-ts.mjs
├── hardware/                 ESP8266 firmware (PlatformIO) + README + simulators
├── android/                  Capacitor-generated Android project (don't edit by hand)
├── public/                   assets (world backgrounds, character videos, logo), sw.js (kill switch)
├── database/                 LEGACY: schema.sql (only source of 4 out-of-band tables) + unused db.js
├── scripts/                  build-android.ps1, create_favicon.js, migrate_admin.js, migrate_appeals.js
├── .agents/rules/            Antigravity/Gemini workspace rules (tool-loaded — keep in place)
├── test_db.cjs               stray script pointing at production — delete (KNOWN_ISSUES P3)
└── render.yaml · vercel.json · capacitor.config.ts · vite.config.ts · tailwind.config.js · tsconfig*.json
```

## D. Frontend architecture

### D.1 Routing (`src/App.tsx`)
- **Marketing:** `/`, `/pricing`, `/blog`, `/blog/:id`, `/privacy`, `/terms`, `/cookies`.
- **Auth:** `/login`, `/register` (one `AuthPage`: login, register + OTP, Google, password
  reset), `/banned` (appeal form).
- **Workspace `/app`** → `ResponsiveAppLayout`: **`MobileAppLayout` below 768px, `AppLayout`
  above.** They are two separate trees (AI rules §5 — never merge them). Children: dashboard
  (index), `circle`, `circle/my-circles`, `circle/challenges`, `psychologists`, `sessions`,
  `yoga`, `yoga-practice`, `wellness` (+ `breathing`/`meditation`/`focus` aliases), `health`,
  `devices`, `journal`, `settings`, `checklist`, `upcoming`.
- **Psychologist portal `/psychologist`** (`PsychologistLayout`): dashboard, sessions,
  supervision, profile; onboarding at `/psychologist/register`.
- **Admin `/admin`** (`AdminLayout`): dashboard, users, yoga, community, psychologists, sessions,
  feedback, safety-alerts, usage, uptime, and (2026-10-21 →) `tools/:module`, the Tools & Sandbox
  suite (§F.10).
- Global modals mounted in `App`: `CrisisInterventionModal`, `SOSProtocolModal`,
  `PsychologistSuggestionModal`; plus `ToastContainer`, `ScrollToTop`.
- **Auth guard:** `AppLayout` and `AdminLayout` redirect unauthenticated users to `/login`;
  `AdminLayout` also shows "Access Restricted" unless `isAdmin` or the super-admin email.
  `PsychologistLayout` performs **no** role check client-side — the backend's
  `requirePsychologist` is the only gate. Client role checks are affordances; the backend is the
  authorisation.

### D.2 Worlds, theming, design system
- Six worlds: **Ghibli Forest, Space Station, Muji Zen Garden, Medical Sanctuary (the only light
  world), Deep Focus, Custom Domain.** Config in `src/store/uiStore.ts`; a `.world-*` class on
  the root swaps `--theme-*` CSS custom properties in `src/index.css`.
- Theme bridge: space-separated `--theme-*-rgb` mirrors back Tailwind's `colors.world`
  (`bg-world-accent/20`, `text-world-primary`); JS/canvas/WebGL read tokens via
  `src/lib/themeTokens.ts` / `useThemeTokens()`; `isLightWorld()` is load-bearing (Medical).
- Motion: `useMotionTier()` (`src/lib/useMotionPreference.ts`) — reduced motion kills ambient
  motion, never UI feedback. `prefers-reduced-motion` blocks exist in `index.css`.
- House rules enforced in review (details in `docs/DESIGN.md`): gold only for the companion and
  the single primary action; glass over atmosphere; 1px hairlines; 12px type floor at ≥600
  weight; measured numbers in mono via `<Telemetry>`; **no OS emoji in UI** — lucide icons only
  (`tests/emojiBan.test.ts`); verify everything on Medical Sanctuary.

### D.3 Offline & mobile
No PWA: `public/sw.js` only unregisters the retired cache-first worker. `src/utils/offlineSync.ts` (IndexedDB
mutation queue). Capacitor: `capacitor.config.ts`, `android/`, `npm run build:mobile`,
`src/utils/platform.ts` (`isCapacitorNative`, `useIsMobile`, haptics) is the single source of
truth for platform checks.

## E. Backend architecture

Feature-first: each `backend/src/features/<domain>/` holds `*.routes.js` + `*.controller.js`
(community and psychologist have several). Validation: zod schemas via `middleware/validate.js`
for most routes; the yoga feature uses hand-written `yoga-recordings/validation.js` because its
JSONB payloads need structural checks (33 landmarks, 9 body regions, 5 importance levels).
Errors flow to `errorHandler`. Logging: pino (`utils/logger.js`). Graceful shutdown closes the
HTTP server then the pool (10 s force-exit). Full pipeline, routes, tables and env vars:
`MAITRI_V2_API_AND_DATA_REFERENCE.md`.

## F. Subsystems

### F.1 AI companion chat (`features/companion-chat/`, `services/*`, `src/store/useChatStore.ts`, `components/dashboard/ChatPanel.tsx`)
> **2026-10-22:** the turn's pure decisions (the settle step, the visible reply, sampling, the prompt's inputs, the metadata frame) live in `companion-chat/turnLogic.js`, and the context-line wording in `services/contextLines.js`. Both are shared with the admin sandbox's turn tester (`docs/ADMIN_SANDBOX_PLAN.md`, ruling 3). Parts of this section predate the 2026-10-02 overhaul; `MAITRI_V2_API_AND_DATA_REFERENCE.md` and CURRENT_STATUS §H describe today's flow.
- **Model routing:** a free-tier OpenRouter cascade (`candidateModels` in `chat.controller.js`):
  the last working model is cached and tried first; on failure the top 3 others are raced in
  parallel, then the rest; with no key at all a scripted per-world persona answers offline.
- **Streaming:** `POST /api/chat/stream` (SSE, `services/streamParser.js`).
- **Prompt assembly:** per-world persona · `emotionEngine.getEmotionConfig()` (camera emotion →
  tone tier, temperature, max tokens) · `contextAssembler.buildUserContext()` (habits, latest
  journal, latest vitals) · time-of-day from the client's `localTime` · optional web search
  (`webSearchService.js`, DuckDuckGo + location) · document knowledge (`user_documents`, the
  caller's own rows only — never without a user id, no in-memory fallback) · cross-session memory (`users.conversation_summary`, maintained by
  `conversationMemory.js`). Only the last 8 messages are sent to the model.
- **Safety:** `utils/safetyScanner.js` scans every message; a crisis hit writes a
  `safety_alerts` row (admin triage queue) and switches the prompt into a `<crisis_mode>` block
  with helpline guidance; `detectEscalationNeed` can suggest a human psychologist.
- **Metering:** each model call writes `token_usage` (tokens + estimated cost) → admin usage
  dashboard with budget alerts.
- **Voice:** Web Speech recognition in; Kokoro TTS out (`utils/KokoroTTS.ts`,
  `preprocessForSpeech`, covered by `tests/ttsCleaning.test.ts`); voice/chat navigation intents
  are dispatched as events that `AppLayout` and `MobileAppLayout` listen for.
- Users may save their own OpenRouter key in Settings or the chat banner. It is stored
  server-side, AES-256-GCM-encrypted (`utils/secretBox.js`, `USER_KEY_ENCRYPTION_SECRET`), via
  `/api/account/openrouter-key`; the browser only sees `hasKey` + last four characters. The
  server key, when set, still takes precedence in chat. `/api/chat` accepts JSON bodies only.

### F.2 Safety layer
`CrisisInterventionModal`, `SOSProtocolModal` (grounding box-breathing, emergency contacts in
`useSafetyStore`), `PsychologistSuggestionModal`; admin `/admin/safety-alerts`. Tested by
`tests/safetyCrisisSOS.test.ts`.

### F.3 Psychologist ecosystem ("Talk to Someone")
Practitioners register (`/psychologist/register`) → admin verifies
(`psychologists.verification_status`: pending/verified/rejected/suspended; levels
junior→specialist). Users browse (`/app/psychologists`), request a session, optionally consent to
an **AI handoff summary** of their companion conversation (`HandoffConsentModal`,
`services/handoffSummarizer.js`), then chat in real time (`SessionChat`, `therapy_messages`,
`/ws/sessions` — cookie-authenticated, joins limited to the session's client, psychologist, the
practitioner the case was escalated to, or an admin). Psychologists can escalate to a senior level
or request supervision. Admin: `/admin/psychologists` (verification, tiers), `/admin/sessions`
(escalations: assign / resolve / dismiss; session review drawer with a logged transcript; closing a
stuck session — `features/admin/oversight.controller.js`, 2026-10-21; a "Sandbox data" source, §F.10). Since 2026-10-22 `session.controller.js` and `escalation.controller.js` are DB-free factories wired in `psychologist.routes.js`. Front-end state: `usePsychologistStore`. Payments for
sessions are not implemented (`hourly_rate` is informational).

### F.4 Community — "Maitri Circle"
Feed of posts (types incl. thoughts/streaks; visibility community/circle; optional anonymous
handle), supportive reactions (no "likes"), comments, reports → admin moderation
(`/admin/community`, `community.moderation.js` with crisis-language detection). Private
**circles** (invite codes, leaderboards, streak visibility) and **challenges** (join, daily
completion, streaks, leaderboard). State: `useCommunityStore`. Pages: `/app/circle*`.

### F.5 Wellness Sanctuary (`/app/wellness`)
`BreathingModule` (breathing ring), `MeditationModule` (Zen timer), `FocusModule` (Pomodoro) —
each ~500 lines with procedural audio (`ProceduralWellnessAudio`, `GlobalAudioManager`) and
session history (`utils/wellnessHistory.ts` → `MindfulActivityHeatmap`). **Stretching is still a
12-line stub and is not exposed.**

### F.6 Health telemetry & hardware
- **Simulated stream** and **Web Bluetooth GATT heart-rate** pairing live in `useUserStore`
  (`connectDevice`, `updateVitals`, `hardwareSource: 'simulated' | 'live'`); readings persist via
  `POST /api/vitals`. Chromium only for Bluetooth.
- **ESP8266 "Hardware Link"** (`/app/devices`): firmware samples AD8232 ECG at 100 Hz, does
  on-device R-peak/BPM/HRV processing (`hardware/src/ecg_processor.cpp`) and DHT11 temp/humidity,
  and POSTs every 0.5 s to `/api/vitals/hardware` with its paired `X-Device-Key`; the backend
  stores to `vitals`/`ecg_readings` under the key's owner and streams on `/ws/vitals` (that
  owner's sockets only) → `EcgWaveform` (scrolling ECG, flatline/lead-off audio cues)
  and `EnvironmentGauge` on `/app/health` (device status and telemetry terminal on `/app/devices`). **AD8232 cannot measure SpO₂** —
  that needs a MAX30102. Boards are paired on `/app/devices` (Paired Sensors; up to 5 per
  user, revocable). Wiring, pairing and flashing: `hardware/README.md`.

### F.7 Daily practice
Habits/checklist (`/app/checklist`, `habits` table, streaks, calendar), Reflections journal
(`/app/journal`: AI reflection, auto-draft from the day's chat via `/api/chat/summarize`,
independent password lock), documents knowledge base (upload/list/delete), avatar customiser
(lucide icon set, legacy emoji values map to a default).

### F.8 Admin console (`/admin`)
Overview & subscription mix, user management (search, role incl. instructor/psychologist, plan,
ban/unban, delete — super-admin protected), yoga overview (poses and recordings: archive / unarchive / retire, and one
confirmed permanent pose delete — D14), community reports, psychologists & sessions, feedback, safety alerts, AI
token usage & cost, uptime/AFK. Deleting a user requires re-entering the admin's password.

### F.9 Marketing site
Landing (hero video, interactive sandbox `DemoWalkthrough`, world carousel), pricing (Basic free
/ Starter $9 / Pro $29 / Enterprise $99 per month — `docs/pricing.md`), blog/changelog (hardcoded
content), legal (privacy/terms/cookies, New Delhi jurisdiction). Header switches to
Dashboard/Log out when signed in.

### F.10 Admin Tools & Sandbox (`/admin/tools/:module`, the `/app` dock widget; `docs/ADMIN_SANDBOX_PLAN.md`, complete 2026-10-22)
An all-purpose testing, simulation and diagnostics suite for admins. Backend:
`features/admin-sandbox/` under `/api/admin/sandbox` (admin router, then the `ADMIN_SANDBOX=off`
kill switch); front end: `pages/admin/tools/` (one lazily loaded panel per tab),
`components/sandbox/`, pure logic in `src/lib/sandbox/`, state in `store/useSandboxStore.ts`
(not persisted: a reload ends every simulation).
- **Vitals & ECG** — simulated vitals and ECG rhythms, in the browser or over the admin's own
  `/ws/vitals`, labelled `source: 'simulated'` everywhere they show. Writes nothing.
- **Companion & Voice** — one companion turn through live chat's own decisions and the admin's model
  route, with no alert, usage, memory or camera write; a benchmark; on-device voice out and in,
  timed (WER for dictation).
- **Sessions** — synthetic therapy sessions in a separate Postgres (`SANDBOX_DATABASE_URL`, owner
  ruling 1, S2) driven through the real session, escalation and oversight code by synthetic actors;
  a live `/ws/sessions` room monitor; `/admin/sessions` reads it on its "Sandbox data" source. The
  pool refuses production by DSN and any database with a non-synthetic account (before migrating and
  before every write).
- **Safety** — the crisis engine on any phrase or conversation, a 38-phrase sample library, previews
  of the support card and the acute flow (state snapshotted and restored), helpline lookups.
- **Access** — role and plan previews (a client overlay; the server still sees the real account) and
  a Brevo e-mail test (superadmin, 5/hour, sandbox mode by default).
- **Sound** — the procedural engines measured through read-only analyser taps: pitch, level, sweep,
  ramp, duck and click tests; world and track names checked against what plays.
Every live simulation shows in a "Sandbox active" banner on `/admin` and `/app` with Stop all.
Tests: `tests/sandbox*.test.ts` and `tests/adminSandbox*.test.ts` (DB-free); the sandbox database
suite runs on a scratch DSN (`tests/sandboxSessionsDatabase.test.ts`).

## G. The Yoga Content Studio (the most heavily specified subsystem)

**Paradigm:** instead of developers hand-writing joint-angle targets, an instructor *records* a
pose; a 7-stage pipeline turns it into a versioned reference that practice is scored against.
Canon: `docs/yoga-studio/yogastudioplanfinal.md` (v1.1) + `implementation_tasks.md` (phases 1–8,
**Implementation Rules 1–18**). Rules digest: `MAITRI_V2_CANON_AND_GUARDRAILS.md`.

**Catalog:** `YOGA_POSE_LIBRARY` in `data/yogaSessionsData.ts` — **8 native asanas, 19 steps**
(mountain_pose, raised_arms, tree_pose, child_pose, cobra_pose, warrior_2, cat_cow, lotus_pose)
plus 3 routines (`morning_stretch_15`, `stress_relief_20`, `back_neck_care_10`). The file is
frozen (Rule 15). Custom poses authored in the **Pose Creator** (D12) are stored in
`yoga_custom_asanas` and **appended to that array at runtime**; published references are
injected the same way (§9.4). Load order is custom catalog **first**, references **second**
(`utils/useYogaCatalog.ts`).

**Two scoring paths per step:**
```
publishedReference?.status === 'active' ?
  YES → RecordedPoseValidator  (live landmarks vs recorded key frame, per-landmark σ tolerance,
                                9 body regions × 5 importance tiers)
  NO  → YogaPoseValidator      (legacy joint angles vs targetAngles)  ← LOCKED, permanent fallback
```

**Authoring pipeline (instructor/admin):** Recording Studio (`components/PoseRecordingStudio.tsx`
+ `v2/studio/*`, CSS scoped under `.pose-recording-studio` — Rule 17) → `LandmarkCaptureService`
(33 MediaPipe landmarks ~30 fps) → `KeyFrameProcessor` (smoothing, transition detection, hold
extraction, outlier removal, key frame, per-landmark variance, health score) → Tier 1/2/3
persistence → publish. Approve stays disabled until the preview is viewed.

**Coordinate spaces — the most error-prone part of the codebase:**

| Data | Space |
|---|---|
| MediaPipe output, Tier 1 `frames_data`, Tier 2 `hold_frames` | raw image space `[0,1]` (Tier 1 x is **mirrored** since `33a5355` — KNOWN_ISSUES P0-3) |
| `key_frame`, `landmark_variance` | hip-centred, torso-scaled (torso = 1.0) |
| What the 2D/3D renderers draw | render space via `poseRenderSpace.toRenderSpace()` |

Mixing them caused the historic **B1** (variance in a different space → 4.5× tolerance
inflation) and **B2/N3** (recorded skeleton off-canvas) defects, both fixed before Phase 7.

**Surfaces (all built — see `docs/yoga-studio/YOGA_SURFACES_DESIGN_RECORD.md`):**
- **Launcher** `/app/yoga` (`YogaModule`, `v2/launcher/*`): "Threshold, Wall, Ledger" — honest
  hero (`heroAction.ts`: resume / browse / awaiting), the **Pose Wall** (silhouette per pose,
  locked until a reference exists; detail drawer → configuration modal), the **Ledger** (real
  streak, `practiceCalendar` heatmap). Ambient "sanctuary" lighting. Open to every signed-in
  user (D16, 2026-10-02).
- **Practice player** (`components/YogaPlayer.tsx`, `v2/practice/*`, `v2/three/*`): container-query
  grid (guide rail / stage / camera rail), lazy 3D instructor skeleton with GPU match particles
  and a three-level fallback to the 2D `StickmanCanvas`, reference plate, cue track, breath ring,
  speech queue; **honest session receipt** (`sessionReceipt.ts`, `YogaSummary`).
- **Recording Studio** `?mode=recording-studio` and **Pose Creator** `?mode=pose-creator`
  (`v2/authoring/*`) — gated to instructors/admins in `YogaModule` (`useIsInstructor()`; D16).
  Publishing stores the Studio's voice guidance with the reference (D15).
- **Admin yoga** `/admin/yoga` — archive / unarchive, retire recordings, one confirmed
  permanent delete (D14).

**Status:** code for phases 1–7, V2 spatial studios (D11), the surface reworks and the Pose
Creator (D12) is complete. **Phase 8 — recording the 19 native steps — has no evidence of having
started** [UNKNOWN — check production]. Remaining work: `docs/yoga-studio/YOGA_STUDIO_REMAINING_WORK.md`.

## H. Conventions

- **Naming:** pages lowercase camelCase (`dashboard.tsx`); components PascalCase; stores
  `useXStore.ts` (except `uiStore.ts`); backend dirs kebab-case, files `x.routes.js` /
  `x.controller.js`.
- **Exports:** pages and components use named exports; backend routers `export default router`;
  controllers export named handlers.
- **Imports:** backend is ESM — always include the `.js` extension; no `require()` (except the
  stray `test_db.cjs`).
- **Data access:** controllers use `queryDb()` (or the exported `pool` for transactions) from
  `backend/database/db.js`. All SQL is parameterised.
- **Client calls:** plain `fetch` through `getApiBaseUrl()`; the global interceptor adds
  credentials + CSRF. Errors surface as toasts (`useToastStore`).
- **Comments carry rationale.** Many yoga files hold long "why" comments citing canon sections
  and traps; do not delete comments (AI rules §4).
- **No `// TODO`, no `throw new Error('not implemented')`** in yoga code (Rules 8–9).

## I. Timeline (for orientation)

| Dates | Milestone |
|---|---|
| 2026-07-24 → 07-26 | Foundation; beta hardening (bcrypt/JWT cookies, CSRF, RLS, Knex, pino, validation); first deploy |
| 07-29 → 08-07 | Yoga Studio phases 1–6; admin console; roles & plans; OTP email verification (several SMTP fixes for Render; now the Brevo API) |
| 08-26 → 08-29 | Pre-Phase-7 remediation (B1/B2/N2/N3/N9); **Phase 7** persistence (`a99d204`, verified 81/81 on a scratch DB); B3/B4 tuning fixes; PWA; wellness modules; security pass |
| 08-29 → 08-31 | D11 V2 spatial studios; yoga landing rework (L0–L7); player immersion (P); studio atmosphere (S); honest ledger + emoji ban (H/G); D12 Pose Creator |
| 09-01 → 09-05 | Psychologist ecosystem; ESP8266 hardware link; community layer; admin yoga; studio fixes (dropdowns, detail drawer, archive, x-flip); journal password; **yoga page re-gated to admins** |
| 10-02 | Documentation consolidated into `docs/` (this package) |
| 10-21 → 10-22 | Admin control center (oversight actions, telemetry); Admin Tools & Sandbox, Phases 0–8 (§F.10) |

## J. Known unknowns

See the bottom of `MAITRI_V2_KNOWN_ISSUES.md`. Most important: whether any yoga reference has
been published in production, and in which x-coordinate convention.
