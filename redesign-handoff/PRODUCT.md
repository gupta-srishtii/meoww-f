# Product
<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primary — knowledge workers under attentional and postural load.** Developers, researchers, designers, analysts and creative professionals: desk-bound, screen-bound, working long sessions in Chromium-based browsers on capable hardware. The job is to protect attention and physical health *while working*, not in a separate wellness ritual afterward. They are receptive to biosensor hardware and accustomed to paying for individual productivity tooling. When audiences conflict, design decisions break toward this user.

**Secondary — wellness practitioners as content creators.** Yoga instructors, movement therapists and studios, addressed through the pose recording studio. This is a supply-side audience: every instructor who authors a library expands content depth at no engineering cost.

**Institutional — employers, universities, clinics.** Organisations deploying wellness provision to a population; served by the Enterprise tier and the governance layer (roles, crisis alerting, cost accounting, uptime monitoring).

## Product Purpose

MAITRI is a full-stack adaptive wellness workspace. It senses the user's physiological and emotional state through camera, microphone and Bluetooth biosensors; adapts the surrounding environment — visuals, ambient audio, and the behaviour of an AI companion — in response; guides active recovery through structured practice; and records the outcome so the loop compounds over time.

The operating thesis is a four-stage closed loop, each stage backed by a shipped mechanism:

| Stage | Meaning | Mechanism |
|---|---|---|
| **Sense** | Observe real state, not self-report | Facial expression analysis, voice tone classification, hand gesture tracking, 33-point skeletal pose tracking, Bluetooth heart-rate telemetry |
| **Adapt** | Change the environment in response | Six adaptive worlds swapping palette, imagery, companion behaviour and audio engine; procedurally synthesized soundscapes; a companion whose prompt carries the detected emotion |
| **Guide** | Direct active recovery, with feedback | Guided yoga routines with live posture scoring and spoken correction; timed hold cues; breathing rhythm guidance |
| **Record** | Persist the outcome so it compounds | Habit streaks, reflection journal, biometric history, session summaries with posture-match scores |

Success is a user who stays in the loop: sessions that end with a recorded outcome rather than an abandoned tab, and practice that is verified as performed correctly rather than self-reported.

## Positioning

The wellness software category ships **content libraries** — a catalogue the user must choose from, perform unsupervised, and self-report on. MAITRI closes that loop instead. Three claims a neighbouring product could not truthfully copy:

1. **All perception runs on the user's own device.** Facial emotion analysis, pose detection, voice analysis and speech synthesis execute in the browser; no video or audio is ever transmitted. Privacy is an architectural fact, not a policy promise.
2. **Content creation is a recording session, not an engineering task.** An instructor performs an asana on camera for ~30 seconds; a seven-stage pipeline (smoothing, transition detection, hold-phase extraction, outlier removal, key-frame computation, per-landmark variance analysis, composite health score) derives a publishable, versioned reference. Adding a pose costs instructor time, not developer time, and the reference figure is a trained body rather than a developer's approximation.
3. **Scoring against biological tolerance, not guessed thresholds.** Per-landmark tolerance is derived from the instructor's own natural variance while holding the pose, in a hip-centred torso-scaled coordinate space, weighted across nine body regions at five importance tiers. Corrections name the specific region that is out of alignment.

Supporting posture: append-only, fully auditable content (nothing is deleted; exactly one active reference per pose step enforced in the schema; rollback creates a new version), and a governance layer most early-stage wellness products defer.

## Operating Context

- **The workspace is used during work, not instead of it.** The dashboard, companion and ambient audio run alongside the user's real task; the environment participates in the session rather than sitting beside it.
- **Long sessions.** Procedural audio never loops and never repeats specifically because sessions run for hours.
- **Camera and microphone are live but local.** Perception is continuous and on-device; users must be able to understand and trust that boundary at a glance.
- **Hardware is optional.** A simulated telemetry mode ships alongside the Bluetooth path, so every flow demonstrates and evaluates fully with no device present.
- **Recognised surfaces today:** marketing landing, pricing, blog/changelog, legal, auth (incl. OTP verification and password reset), dashboard workspace shell (desktop sidebar + chat drawer; a separate mobile shell with bottom tabs), wellness sanctuary (breathing, meditation, focus), health telemetry incl. live ECG, hardware/device pairing, journal, daily checklist, settings, "Talk to Someone" (psychologist directory and therapy sessions), Maitri Circle (community feed, circles, challenges), yoga launcher, pose detail, active pose-detection practice, pose recording studio, Pose Creator, a psychologist portal, and a ten-screen administrative console.
- **Deployment:** Vercel (frontend), Render Singapore (API), Supabase (Postgres). Installable PWA; Capacitor Android shell.

## Capabilities and Constraints

**Live to all users:** AI companion chat — one persona in steady, supportive and crisis modes, with the world as flavour — emotion-, time- and context-aware conversation with cross-session memory, streaming replies, personal document knowledge base (RAG), live web search routing, a user-chosen model (the owner's GPU rig by owner-issued access key, or the user's own OpenRouter key) with honest offline replies when neither is set; on-device voice — spoken replies (off by default), dictation into the message box, and two-way voice conversations you can interrupt (`docs/COMPANION_VOICE_PLAN.md`); six adaptive environments with procedural soundscapes and a WebGL2 gradient backdrop (with fallback); facial/voice/gesture/pose perception; Bluetooth and simulated telemetry, plus a live ECG/temperature/humidity feed from MAITRI's ESP8266 sensor node (one shared device per deployment — demonstration grade); breathing, meditation and focus programmes with an activity heatmap; habit tracking, reflections journal with auto-draft and an independent privacy lock, document upload; health telemetry views; a psychologist directory with consented AI handoff summaries and real-time therapy chat; the Maitri Circle community (feed, supportive reactions, circles, challenges, reporting); crisis and SOS protocols; auth with OTP email verification, OTP password reset, Google SSO, dual-token cookies, and six roles (user, beta tester, instructor, psychologist, admin, super-admin).

**Live to administrators:** ten-screen console (overview, users and plans, yoga library, community moderation, psychologist verification, therapy sessions, feedback, crisis triage, AI usage and cost, uptime), crisis detection on every companion message, per-user and per-model AI cost metering against budget, ban and appeal workflow.

**Live to verified psychologists:** a practitioner portal — sessions, notes, escalation to senior levels, supervision requests.

**Built but access-gated:** the pose recording studio and the Pose Creator are reachable by **instructors and administrators** (owner ruling D16, 2026-10-02: `useIsInstructor()` in the UI, `requireRole('admin','superadmin','instructor')` on every authoring route). The yoga page itself, with practice and pose scoring, is open to every signed-in user; the admin-only gate was removed.

**Companion voice, spoken replies — live (2026-10-21), off by default:** Settings → Voice → "Read replies aloud". Speech is made on the device: Kokoro-82M (downloaded once from Hugging Face, used only after it passes a self-test on that device) or the browser's own on-device voice; network system voices are never used. Long phone numbers are pointed to on screen, not read out.

**Dictation — live (2026-10-21):** the composer mic transcribes speech into the message box on the device (a one-time ~67 MB download, asked for first); it never sends by itself, and no audio leaves the device.

**Voice conversations — live (2026-10-21):** talk with the companion and it answers out loud; talking over it interrupts. Speech is recognised and spoken on the device; the soundscape is lowered, not stopped, while it runs; a crisis reply never ends the conversation and "Need help now?" stays on screen. Started from the empty composer's voice button or the stage's Voice button; leaving the stage ends it. The old speech-to-text, which sent audio to Google's servers, has been removed.

Yoga's spoken pose corrections are a separate system and are unchanged.

**All six worlds are open (2026-10-21):** Custom Domain is live, with its own palette (presets, a hue and accent harmony) and ambient drone frequency, designed in Settings → Custom World Controls. Nothing is locked as "Coming soon". The orb customizer has been retired: the companion is the floating MAITRI orb.

**Content shipped:** 8 asanas across 19 steps and 3 routines (15-min Morning Awakening, 20-min Stress & Anxiety Relief, 10-min Office & Back Care); only the first routine is reachable from the UI. Instructors can author further poses in the Pose Creator. **No instructor reference has been recorded on record yet**, so every pose still scores against hand-authored joint angles.

**Scaffolded only, not exposed:** the stretching module.

**Not built — never imply otherwise:**
- Voice-driven navigation (moving around the app by voice) is not built; voice is for talking with the companion and dictating into the message box.
- Payment processing is not integrated, and **plan entitlements are not enforced** — every signed-in user sees every feature regardless of plan. Plans are provisioned administratively.
- Therapy sessions have no payment flow.
- The interface, companion and voice synthesis are **English-only**. No i18n layer exists.
- No SpO₂ measurement: the figure shown is simulated (the Bluetooth heart-rate service and the AD8232 ECG cannot measure blood oxygen).

**Hard constraints:**
- Bluetooth biosensor pairing requires a Chromium browser (Chrome, Edge, Brave). Firefox and Safari do not implement Web Bluetooth. Every other capability remains fully available there via simulated telemetry — this constrains the hardware-connected experience, not access to the product.
- Perception is client-side by architecture. No design may imply server-side video or audio processing.
- Legal terms are seated in New Delhi, India; the platform is India-first with global English-speaking reach.
- Stack is fixed by the existing codebase: React 19 + TypeScript 6 + Vite 8, Tailwind 3.4, Framer Motion 12, Zustand 5, React Router 7 (code-split), three.js + React Three Fiber (lazy-loaded, yoga only); Express 5 + PostgreSQL with Knex migrations, row-level security on the original personal-data tables, Zod validation at request boundaries, WebSockets for live telemetry and therapy chat.

**Terminology (use these names, not synonyms):** the *companion* (not "assistant" or "bot"); the *Chroma companion orb*; *worlds* (not "themes" or "modes"); *reflections* / the *journal*; *asanas* and *steps*; the *recording studio*; *telemetry* for biometric data.

## Brand Commitments

Binding — future design work preserves these rather than reinterpreting them:

- **The MAITRI name, the all-caps wordmark, and `public/assets/logo.png`.** The PWA application name is strictly "MAITRI".
- **The Chroma companion orb is the product's face.** It is the identity anchor across every surface. It may be restyled, but never removed or demoted below a secondary element.
- **The six named worlds are product truth, not styling:** Ghibli Forest, Space Station, Muji Zen Garden, Medical Sanctuary, Deep Focus, Custom Domain. Their names and identities are fixed; Medical Sanctuary is the only light-mode environment and signals the clinical/care context deliberately.

Undecided: no confirmed verbal voice or tone-of-voice guide has been established. Existing product copy is evidence of current practice, not an approved standard.

## Evidence on Hand

Real, in-repo, and usable:

- `docs/PROJECT_OVERVIEW.md` — board-level capability record, current as of 2 October 2026. The authority for what is built versus gated versus absent.
- `README.md` — architecture map and feature table.
- `docs/ai-handoff/` (current status, known issues, full technical context), `docs/pricing.md`, `docs/database_backup_strategy.md`, `docs/SECURITY_AUDIT.md`, `docs/PROJECT_BACKLOG.md`, `docs/yoga-studio/`.
- Brand and world assets in `public/assets/`: `logo.png`, `favicon.png`, six world backgrounds (`forest_background.webp`, `space_background.webp`, `Zen_background.webp`, `Medical_background.webp`, `Focus_background.webp`, `Custom_background.webp`), and four companion character videos (`character.mp4`, `character_medical.mp4`, `character_space.mp4`, `character_zen.mp4`).
- Real product scale figures: ~60,000 lines across 289 source files (224 frontend, 65 backend); 32 tables, 13 versioned migrations; 149 commits over six weeks (24 Jul – 5 Sep 2026); 387 automated tests across 22 suites (pose pipeline, persistence, safety protocol, design-system rules).
- Published tier structure: Basic (free), Starter ($9/mo, $7 annual), Pro ($29/$24), Enterprise ($99/$84).

**Absences that must never be fabricated:** there are no customers, no testimonials, no case studies, no press coverage, no usage or retention metrics, no revenue, no funding, no benchmarks against competitors, no clinical validation or medical endorsement, and no third-party certifications. The product is a deployed beta. Any surface needing social proof must use what is real — the technical mechanism, the privacy architecture, the shipped content inventory — not invented endorsement.

## Product Principles

1. **Sense, adapt, guide, record — every surface serves one stage of the loop.** Anything that does not advance the loop is decoration competing with the user's actual work.
2. **On-device perception is the promise; make it legible.** The strongest differentiator is invisible by nature. Design must make the local-only boundary evident where the camera and microphone are in use, without turning it into a compliance banner.
3. **Never claim what is not built.** Gated, scaffolded and absent capabilities are named honestly. No invented proof, no implied payment flow, no implied localisation.
4. **The environment participates in work; it never competes with it.** Motion, audio and companion presence are ambient by default and step forward only when the user's state or an active practice calls for it.
5. **Verified practice over reported practice.** Wherever the product guides movement, it shows the user what is actually happening in their body — the scored, corrected feedback loop is the value, and interfaces must foreground it.
6. **Optional hardware, never a dead end.** Every flow reads as complete with simulated telemetry and on a non-Chromium browser.

## Accessibility & Inclusion

No formal conformance standard is claimed. Two requirements are binding on all future work:

- **`prefers-reduced-motion` must be honoured.** The product is built on continuous motion — the companion orb, WebGL gradient backdrops, Framer Motion transitions, character video. None of it currently respects the setting; every new and revised surface must, and the reduced-motion state must remain a complete experience rather than a stripped one.
- **Every flow must be fully keyboard-operable**, including the workspace shell, dialogs, the settings and world pickers, and practice controls.

Current coverage is partial (re-checked 2026-10-02): the yoga surfaces were built against both requirements (`useMotionTier()` in `src/lib/useMotionPreference.ts`, keyboard-operable body map and Pose Wall, focus rings), and `src/index.css` neutralises the global ambient keyframes under `prefers-reduced-motion`. The rest of the workspace — companion orb, landing, dashboard, admin console, community and psychologist screens — has not been audited. Treat that as a known deficit to close, not as the standard.

Additional context, not yet a requirement: English-only interface, and gesture/pose/camera features assume mobility and a visible face — non-camera paths must stay first-class rather than degraded.
