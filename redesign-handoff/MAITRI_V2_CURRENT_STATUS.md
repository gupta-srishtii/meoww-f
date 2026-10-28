# MAITRI v2.0 — CURRENT STATUS

## Local frontend update — 2026-10-28, public-entry phase

[V-EXEC / V-INSPECT] Resumed the existing frontend checkout after interruption. The baseline production build and nine automated tests passed before further work. All source files are currently untracked; no commit or push was made. Historical backend claims below refer to the original project, not this isolated frontend.

Completed the public introduction by preserving the existing lazy Three.js/React Three Fiber scene, original mascot, six-world previews, product-loop storytelling and full-screen demo authentication. Fixed landing-to-Home scroll reset, authentication success/duplicate-submit guards, mobile navigation clearance, authentication heading contrast, opaque authentication entrance and touch scrolling over the canvas. Existing Settings, themes, worlds, mascot and chat were preserved.

Verification: production TypeScript/Vite build passes; nine automated tests pass; the existing browser regression suite passes (40 theme/page combinations, six worlds, seven Settings sections, ten responsive route cases, chat, explicit mascot follow and wellness controls). The new isolated `npm run test:entry` suite passes on development and built production assets: public navigation, six world previews, signup, password login, validation, persistence, Home entry, keyboard, 375/390/768px layouts, reduced motion and simulated WebGL unavailability. Both browser suites report zero runtime exceptions. Screenshot review corrected auth contrast; physical mobile/GPU performance and non-Chromium browsers remain unverified.

Exact files edited in this resumed phase and limits are recorded at the end of `MASTER_REQUIREMENTS_AUDIT.md`. No original backend, production service or API credentials were used.

> **State verified: 2026-10-02; §B baselines and §H re-verified 2026-10-03** after the dashboard
> rebuild + companion chat overhaul, **§B re-verified and §I added 2026-10-09** after the dashboard
> & settings refinement (both committed 2026-10-09, not pushed — §A). Re-verify before relying on this document — run
> the commands in §B yourself; they take under two minutes.
>
> Verification tiers: **[V-EXEC]** executed on 2026-10-02 · **[V-INSPECT]** read in the repo on
> 2026-10-02 · **[HISTORICAL]** recorded by an earlier session, not re-run · **[UNKNOWN]** not
> verifiable from the repository — do not assume.

---

## A. Git state

| Field | Value | Tier |
|---|---|---|
| Branch | `main` | [V-EXEC] |
| HEAD | `1c15743f855e990888232f310f8cbb7385845b17` — `1c15743` "Update yoga.tsx" (2026-09-05) | [V-EXEC] |
| Remote | `origin https://github.com/Vaibhavsolanki1/Maitriv2.0.git` | [V-EXEC] |
| Working tree before the 2026-10-02 docs consolidation | clean | [V-EXEC] |
| 2026-10-02 work | Docs consolidation + fix chunks 1–5 committed together on 2026-10-02 (the commit after `1c15743`; see `git log`). Not pushed | [V-EXEC] |
| 2026-10-03 work | Dashboard rebuild + companion chat overhaul (§H) — **committed 2026-10-09** together with the refinement, split by layer (see the commits row) | [V-EXEC] |
| 2026-10-08 → 09 work | Dashboard & Settings refinement, Phases 1–7 plus 6b (§I) — **complete, committed 2026-10-09**. Folded into DESIGN.md, the yoga design record §6a, the API reference, KNOWN_ISSUES and PROJECT_BACKLOG §V; `docs/DASHBOARD_REFINEMENT_PLAN.md` was committed once in the docs commit and can now be deleted (owner, 2026-10-09) | [V-EXEC] 2026-10-09 |
| 2026-10-09 (later) | Docs cleanup (PRODUCT.md voice + yoga access, overhaul plan folded and deleted) and the **Cloudflare Tunnel rig architecture**: `COMPANION_CF_ACCESS_CLIENT_ID` / `_SECRET` sent to the rig (`services/companionModel.js`, `services/rigStatus.js`, +1 test in `tests/companionModel.test.ts`); runbook KNOWN_ISSUES deploy item 9. Tunnel not yet set up. Then the **rig queue** — one generation at a time, users who leave are dropped, OpenRouter bypasses it (`services/rigQueue.js`, `requestCompletion`, `streamParser.js` cancel, chat controller disconnect signal; `tests/rigQueue.test.ts`, 8 tests; also proved end to end over real sockets against a fake streaming Ollama) | [V-EXEC] 2026-10-09 |
| 2026-10-09 commits | Six local commits on top of `59701c6`, **not pushed**: `b78807d` companion backend (overhaul + model choice + mood + admin to-dos) · `5e59de7` dashboard / Settings / companion UI · `058a129` yoga authoring · `93c547d` rig Cloudflare Access headers · `24c8c89` rig queue · then the docs commit. Every code commit was checked on its own in a separate worktree: 457, 519, 532, 533, 541 tests green; `tsc -b` 0 | [V-EXEC] 2026-10-09 | [V-EXEC] 2026-10-09 |
| 2026-10-17 work | **Dashboard v2, Phases 1–7 — complete** (§J) — owner-approved `docs/DASHBOARD_V2_SPEC.md` with a Rule 1 exemption. **Uncommitted** in the working tree | [V-EXEC] 2026-10-17 |
| 2026-10-20 → 21 work | **Companion voice V0–V2** (`docs/COMPANION_VOICE_PLAN.md`, owner-approved incl. Q1–Q9): the V0 bench (`scripts/voice-bench/`), the pure voice modules, a cancellable chat stream (interrupted replies), soundscape ducking, spoken replies (V2), dictation (V3), voice conversations with barge-in (V4) and the records (V6). 809 tests green, `tsc -b` 0 (app, node and the worker project), `npm run build` green. **Uncommitted** | [V-EXEC] 2026-10-21 |
| 2026-10-21 (later) | **Custom Domain unlocked, Custom World Controls rebuilt, orb customizer removed** (§K). 820 tests green, `tsc -b` 0 | [V-EXEC] 2026-10-21 |
| 2026-10-21 (Settings polish) | **Settings audit and polish, profile identity card, ambient volume glide** (§L) — owner request, a Rule 1 exemption for Settings. **Uncommitted.** 820 tests green, `tsc -b` 0, `npm run build` green, oxlint clean on the changed files | [V-EXEC] 2026-10-21 |
| 2026-10-21 (admin control center) | **Admin panel overhaul** (§M) — owner brief: escalation actions, session review drawer + transcript, measured telemetry, Service Health Matrix, manual e-mail verification, one-click plan cancellation, moderation shortcuts, practitioner tiers, the to-do drawer in `/admin`, the WorldPicker guard. One new migration, `20261021000000` — **applied to production 2026-10-21 15:54 IST after a backup**, when the local :3001 backend (production DSN) was restarted at the owner's choice (§M.1). **Uncommitted** (Settings-polish commit `e065e25` is HEAD). After the zero-crash follow-up: 862 tests green (964 with a scratch DB), `tsc -b` 0, oxlint 41 / 0 (same set as HEAD), `npm run build` green | [V-EXEC] 2026-10-21 |
| 2026-10-21 (owner commits) | `e065e25` "settings visual" (§L, 09:24 IST) and `cb86dda` "admin panel update" (§M and its migration, 16:32 IST) were committed by the owner. The rows above that say "Uncommitted" for §L and §M predate those commits. The working tree was clean at `cb86dda` when the sandbox work began | [V-EXEC] 2026-10-21 |
| 2026-10-21 → 22 (Admin Tools & Sandbox) | **Complete: Phases 0–8 of `docs/ADMIN_SANDBOX_PLAN.md`, each approved on review** (§N–§N.8). Phases 0–2 **committed by the owner as `0ed2136` "admin tools"** (10-21 23:51 IST); **Phases 3–8 are uncommitted** on top of it, ready for the owner's commit. No migration. Final gates 2026-10-22 (§N.8): `tsc -b` 0, **1296 / 1296** (1407 / 1407 with a scratch DSN), oxlint 41 / 0, build green, every module checked in the browser at 1440 and 375 px. :3001 (pid 2269140, restarted 10:44 IST 10-22) serves Phases 0–5; Phase 6 is client-only; **Sessions needs `SANDBOX_DATABASE_URL` in `.env` and a restart** | [V-EXEC] 2026-10-22 |
| 2026-10-22 → 23 (Companion chat plan) | `docs/COMPANION_CHAT_PLAN.md`, owner-approved 2026-10-22, **committed by the owner** through `7aa8b52` "chatv2 hope", `852b1c6`, `574427c`, `12d22d4` "chat v3" and `a84a353` "qwen2.5 pipelines n shi" (10-23 18:06 IST). **Uncommitted on top:** the 402 handling, then the local zero-cost pipeline and `maitri-companion:local-v1` (§O). Gates 2026-10-23 evening: `tsc -b` 0, **1518 / 1518**, oxlint 41 / 0 | [V-EXEC] 2026-10-23 |
| Commits | 149 (2026-07-24 → 2026-09-05) | [V-EXEC] |

Most recent commits: `1c15743` re-gate yoga page to admins · `031bb06` journal password ·
`a23d442` voice-guidance type + merge · `489a265` admin yoga panel + archived catalog route ·
`33a5355` studio QoL fixes (dropdowns, detail drawer, archive, x-flip) · `68eabce` community
layer · `76419be` wellness heatmap/chroma-key · `5d182b2` psychologist ecosystem + ESP8266
hardware link · `0530cc4` custom pose studio (D12).

Commit messages are often non-descriptive ("fix", "meow", "hi"); read the diff, not the message.

## B. Verified baselines (2026-10-02, after fix chunks 1–5, Fedora 44, Node v22.23.2, npm 10.9.8)

| Gate | Command | Result | Tier |
|---|---|---|---|
| Typecheck | `npx tsc -b` | **exit 0** (covers `src/` only — `tests/` is not type-checked) | [V-EXEC] |
| Tests | `npm test` | **1296 / 1296** on 2026-10-22, 274 suites (Admin Tools & Sandbox complete, §N.8). Earlier: **541 / 541** on 2026-10-09 (+1 later that day: rig Cloudflare Access headers; +8: rig queue); 532 / 532 earlier (+48 in the refinement: chroma key, feature locks, world preview and cross-fade, model routing, profile save, admin to-dos, Pose Creator model); was 484 on 2026-10-03 | [V-EXEC] 2026-10-09 |
| Tests + DB | `YOGA_TEST_DATABASE_URL=… npm test` (PostgreSQL 17, Podman) | **1407 / 1407** on 2026-10-22 (fresh podman `postgres:17`; all four database suites ran). Earlier: **565 / 565** on 2026-10-03 (was 514); the persistence suite alone **75 / 75** | [V-EXEC] 2026-10-03 |
| Migrations | programmatic runner (DEV_WORKFLOW §4.2) | fresh DB: 15 up → all down (empty schema) → 15 up (identical 33 tables) → 0 pending. Production-shaped DB (legacy tables out-of-band with rows, all migrations to `1c15743`): exactly the 3 new ones run, every row kept | [V-EXEC] |
| Real backend | `backend/src/index.js` booted from an env-free copy against scratch (DEV_WORKFLOW §4.3) | `/health` connected; migrations on boot; every mount answers; key store, device pairing + ingest, both WebSockets, Origin/auth refusals, Google 503, chat 415 verified over HTTP/WS. Exposed P1-12 and P1-13 (pre-existing 500s, since fixed) | [V-EXEC] |
| Lint (repo) | `npx oxlint` (1.74.0) | **41 warnings, 0 errors, exit 0** — unchanged from 2026-10-03, re-run 2026-10-09 and 2026-10-22 | [V-EXEC] 2026-10-22 |
| Lint (yoga frontend) | `npx oxlint src/wellness-engine/yoga` | **0 diagnostics** | [V-EXEC] |
| Build | `npm run build` | **exit 0** (pre-existing >500 kB chunk warning) | [V-EXEC] |
| Backend modules | `node --check` + dynamic import of every changed route/WS module | load cleanly | [V-EXEC] |

**The gate for new work:** no new failing tests, `tsc -b` = 0, no new oxlint diagnostics
anywhere in `src/wellness-engine/yoga/**`, repo total ≤ 41 warnings / 0 errors, and an empty
`git diff` on the permanently locked yoga files (canon §1.1).

## C. Feature status

| Area | Status | Notes |
|---|---|---|
| Auth (email + OTP, Google, refresh cookies, password reset, ban/appeal, account deletion) | **Live** | Password reset is OTP-based and enabled (older docs said "disabled during beta") |
| Roles & plans | **Live** | Roles: user, beta_tester, instructor, psychologist, admin, superadmin. Plans basic/starter/pro/enterprise assigned by admins; **no payment provider** |
| AI companion (one persona in steady / supportive / crisis modes, world as flavour, streaming, user-chosen model, check-in + time-zone + context aware, merging memory, web search, documents) | **Live — overhauled 2026-10-03; model choice 2026-10-08** | The user chooses in Settings: the owner's GPU rig (`COMPANION_*`, Ollama Gemma-2-27B) **only with an owner-issued access key** (`COMPANION_RIG_ACCESS_KEYS`, revocable), or their own OpenRouter key (free ladder since 2026-10-24: Gemma 4 31B → Gemma 4 26B-A4B → Nemotron 3.5 Lightning; the old Gemma 2 9B / Llama 3.1 8B ids had been delisted). **No key ⇒ no model** (honest offline replies). Production needs KNOWN_ISSUES deploy item 5. Measured on the rig 2026-10-22 with `scripts/companion-eval/` (baseline in `docs/COMPANION_CHAT_PLAN.md` §11); BYOK not yet run. **Overhaul Phases 0–3 built 2026-10-22 (committed 7aa8b52), Phase 4 (few-shot examples, `COMPANION_EXEMPLARS`), the Phase 5 training spike and the Phase 6/7 dataset foundation built 2026-10-23, uncommitted.** All behind switches that default off (`COMPANION_SAFETY_LADDER`, `COMPANION_PROMPT`, `COMPANION_REFLECTION`, `COMPANION_EXEMPLARS`); the documents cap is on regardless. **Dev :3001 runs ladder v2 and prompt v2 since 2026-10-23, and the few-shot examples since 05:00 IST that day**; production does not. **Track B (fine-tuning) ran end to end on the rig for $0 on 2026-10-23** (§O): a local gemma2:27b dataset, a Qwen 2.5 7B LoRA, `maitri-companion:local-v1` in Ollama for evaluation only. It asks the due safety question too rarely (5 of 20 against 13) to serve; live chat still uses gemma2:27b |
| Companion voice | **All live (locally), uncommitted — 2026-10-21: spoken replies (Kokoro-82M on the device after a self-test, else the browser's on-device system voice), dictation (Moonshine-base + Silero v5), two-way voice conversations with barge-in** | `FEATURES.voiceOutput`, `.dictation`, `.voiceMode` on; the old Web Speech path and the fake "Kokoro" are gone (KNOWN_ISSUES, closed). Composer mic: on-device speech-to-text into the box, never sends (plan §14). Voice conversations from the composer's empty-box button or the stage's Voice button; leaving the stage ends them (plan §15). Settings → Voice: "Read replies aloud" (off by default), five voices, where the voice is made, download / remove. On-device Kokoro only after a self-test, else the browser's on-device voice. Plan and V0 numbers: `docs/COMPANION_VOICE_PLAN.md`. Yoga's spoken corrections are separate and unchanged. Uncommitted |
| Settings (world picker with live hover preview, profile identity card, model picker, ambience mixer, Voice (2026-10-21), Custom World Controls (2026-10-21), account & session) | **Live — refined 2026-10-08, polished 2026-10-21** (Rule 1 exemptions) | All six worlds open since 2026-10-21; the orb customizer was removed (§K); identity card, world-accent mixer and account dialog (§L), uncommitted |
| Dashboard `/app` | **Live (locally) — Dashboard v2, complete 2026-10-17, desktop and phone** — chat arena with history, `+` menu and morphing Send/voice button; the stage (live companion + camera tiles, Join/Leave with the chime, drag divider, perspective); the Engines panel (full / compact / pill, closeable); the quick dock (tab, inline or overlay, lower zone, Customize; Quick note, Yoga, Body signals, Admin tools). **Phones (Phase 6):** a stage strip (collapsed by default), full-height chat, and Engines / Dock bottom sheets from the header | Design: DESIGN.md "Dashboard `/app`"; build log: `docs/DASHBOARD_V2_SPEC.md` §14. Check-in, Today and Your week are dock widgets (default dock: Check-in + Today); the next step is in the arena's empty state. Uncommitted. Mood check-ins stored append-only in `mood_checkins` (migration not yet on production) |
| Safety layer (three-tier risk → alerts, inline support card for elevated, crisis & SOS modals for acute/manual, inline referral) | **Live — revised 2026-10-03** | Helpline numbers must be verified before release |
| Psychologist ecosystem (register → verify, browse, sessions, real-time chat, handoff summary, escalation, supervision) | **Live** | Real-time chat socket was broken by N-WS and unauthenticated (P1-8) — both fixed 2026-10-02, not yet tried in a browser; no session payments |
| Community — Maitri Circle (feed, reactions, comments, reports, circles, challenges, moderation) | **Live (untested by suite)** | |
| Wellness Sanctuary — breathing, meditation, focus + activity heatmap | **Live** | Stretching module is still a stub, not exposed |
| Health telemetry — simulated + Web Bluetooth | **Live** | Bluetooth needs Chromium |
| Hardware Link — ESP8266 + AD8232 ECG + DHT11 → live ECG waveform | **Live** | Boards must be **paired** (device key, P1-9) and re-flashed; per-user streams; no SpO₂ from AD8232 |
| Habits/checklist, journal (AI reflection, auto-draft, password lock), documents | **Live** | |
| Admin console (users, plans, safety, usage/cost, uptime, feedback, appeals, community, psychologists, sessions, yoga) | **Live — control center overhaul 2026-10-21 (§M), uncommitted** | Escalations: assign / resolve / dismiss; session review drawer with an on-request, logged transcript; measured telemetry and a Service Health Matrix; manual e-mail verification; one-click plan cancellation; moderation shortcuts to the author; practitioner tiers. Yoga: archive / unarchive / retire / confirmed permanent delete (D14) |
| Admin to-do drawer (global list shared by admins, one level of subtasks, archive-only) | **Live — 2026-10-09** (desktop) | `admin_todos` migration not yet on production (deploy item 8) |
| Marketing site (landing, pricing, blog, legal) | **Live** | Blog content hardcoded; legal review pending |
| PWA (offline cache, install prompt, IndexedDB sync queue) | **Live** | |
| Android (Capacitor) | **Scaffolded** | Built only on request (AI rules §6) |
| **Yoga** — see §D | **Code complete; content not recorded; open to all signed-in users (D16)** | |

## D. Yoga Content Studio status

### D.1 Implementation phases (`docs/yoga-studio/implementation_tasks.md`)

| Phase | Status | Evidence |
|---|---|---|
| 1 Data model | Complete | `poseRecordingTypes.ts` |
| 2 Capture | Complete — the `33a5355` x-flip was moved out of the frozen file into `selfieSpace.ts` (D13) | `LandmarkCaptureService.ts`, `utils/selfieSpace.ts` |
| 3 Processing | Complete (B1 remediated; B3 stability ceiling + B4 per-step hold duration fixed 2026-08-29) | `KeyFrameProcessor.ts` |
| 4 Recorded validator | Complete (N9 remediated) | `RecordedPoseValidator.ts` |
| 5 Animation | Complete (B2/N2/N3 remediated) | `poseRenderSpace.ts`, `YogaPlayer.tsx` |
| 6 Recording Studio | Complete; later restyled (D11) and fixed (`33a5355`) | `PoseRecordingStudio.tsx`, `v2/studio/*` |
| 7 Backend persistence | **Complete and verified** — committed `a99d204` "phase7-done"; GO/NO-GO 19/20 pass, 1 partial by choice (identical-DSN guard not exercised against production) | [HISTORICAL] 2026-08-29 |
| 8 Record all 19 native steps | **No evidence of having started** | [UNKNOWN] — production DB not inspectable from the repo |

### D.2 Follow-on work (all shipped)
| Track | Decision | Status |
|---|---|---|
| V2 Spatial Studios — theme bridge, MediaPipe consolidation, lazy 3D skeleton + match particles, Studio glass/body map/health dashboard | **D11** (2026-08-29) | Shipped |
| Yoga landing rework L0–L7 (Threshold / Pose Wall / Ledger, instructor role, Studio gateway) | — | Shipped; L1's "open to all users" restored by **D16** |
| Practice player immersion P0–P4 (container-query grid, stage well, reference plate, cue track) | — | Shipped |
| Studio atmosphere S0–S3 (honest hero, sanctuary light, bento wall) | — | Shipped |
| Honest ledger H1–H2 + global polish G1–G3 (true summary, heatmap, emoji ban test) | — | Shipped (emoji ban green again since P0-2) |
| Instructor Pose Studio — Pose Creator, `yoga_custom_asanas`, 6 routes | **D12** (2026-08-31) | Shipped; +1 extra route since (D-1) |
| Studio fixes (dropdowns, stage rail, archive + visibility gate, detail drawer, wheel-scroll fix, selfie flip, voice guidance) | — | Shipped; voice-guidance persistence completed by **D15**, the practice-time flip by **D13** |

### D.3 What still has to happen before yoga is "live"
1. ~~P0-3, P0-4, P1-1, P1-2~~ — ruled and implemented 2026-10-02 (D13–D16).
2. ~~Prove the persistence suite on a scratch DB; confirm D14.4~~ — done 2026-10-02 (75/75 on
   PostgreSQL 17; D14.4 ratified, amending D10).
3. **Phase 8:** record and publish the 19 native steps (runbook:
   `docs/yoga-studio/YOGA_STUDIO_REMAINING_WORK.md`).
4. Manual acceptance (record → publish → hard refresh → practise; scores ≥ 80 correct / < 50
   wrong) — never performed with a real person. [UNKNOWN]

## E. Open problems — summary

Full register with evidence: `MAITRI_V2_KNOWN_ISSUES.md`. Fixed on 2026-10-02 (chunks 1–5):
P0-1…P0-4, P1-1…P1-6, P1-8, P1-9, plus N-WS (both WebSockets broken), N-RL (hardware vs global
rate limit), N-VH (vitals history leak), N-CH (form-post to chat), N-OR (no WebSocket Origin
check).

| ID | One line |
|---|---|
| **Deploy** | Set `GOOGLE_CLIENT_ID` + `USER_KEY_ENCRYPTION_SECRET` on Render; pair and re-flash every ESP8266; **(2026-10-03)** set `COMPANION_API_BASE_URL`/`COMPANION_MODEL`, back up before `mood_checkins` runs, verify helplines |
| P1-7 | CSRF exemptions + permissive header fallback |
| P1-10 | Journal lock password stored in plain text |
| P1-11 | The 2026-10-02 UI changes have not been tried in a browser (backend proved on PostgreSQL). The 2026-10-03 dashboard/chat UI **was** exercised in a browser against a scratch backend (§H) |
| ~~P1-12, P1-13~~ | Fixed after the chunk-5 commit (community feed count query; `avatar_url` references removed) — proved by `tests/appRoutesDatabase.test.ts` |
| D-1, D-5 | Canon deviations awaiting a ruling |

## F. Owner decisions

| # | Question | State |
|---|---|---|
| 1 | P0-3 — x convention | **Ruled (D13)**, implemented |
| 2 | P0-4 — admin deletes | **Ruled (D14)**: archive / unarchive / confirmed permanent delete, implemented |
| 3 | P1-1 — persist Studio voice guidance | **Ruled (D15)**, amends D5, implemented |
| 4 | P1-2 — who may open `/app/yoga` | **Ruled (D16)**: everyone signed in; authoring instructor/admin |
| 5 | P1-5 — where the OpenRouter key lives | **Ruled**: encrypted in the database (`USER_KEY_ENCRYPTION_SECRET`) |
| 6 | **D14.4** — recording *retire* reaches Tier 2 `rejected` | **Ruled 2026-10-02**: approved, amends D10 |
| 6a | **D-4 / D-6** — `voiceGuidance` type and merge step | **Ruled 2026-10-02**: ratified with D15 |
| 7 | **D-1, D-5** — post-hoc canon deviations | **Open** — ratify in canon §17, or revert |

## G. Historical record (closed — kept short on purpose)

- **Phase 7 adversarial review (2026-08-27)** found H1, H2, M1–M6, L1–L10. By 2026-08-29: H1, M1,
  M2, L1, L8 fixed; M5 fixed by owner ruling (`asanaId` optional on `GET /recordings/processed`);
  L2 (§12.4 "Approved by" column + per-version preview), L7 (`.env.example` change surface) and
  M6 (untyped `tests/`) **explicitly deferred** by the owner. M4 and L10 remain (KNOWN_ISSUES P3).
- **Scratch-DB verification (2026-08-29):** PostgreSQL 17 locally, persistence suite run for the
  first time, migration up→down→up clean, real `index.js` booted, all 13 routes proved
  registered, suite proved able to fail. The detailed checklist and review documents
  (`claudereview/*`, the Phase 7 handoff files) were deleted on 2026-10-02 as done; they remain in
  git history (`git log --diff-filter=D --name-only -- claudereview docs`, then
  `git show <commit>^:<path>`).
- **July 2026 beta hardening:** every item of the July beta checklists is done except the
  external legal review, blog content review and the Render paid-plan upgrade (tracked in
  `docs/PROJECT_BACKLOG.md`).

## H. 2026-10-03 — dashboard rebuild + companion chat overhaul (committed 2026-10-09)

Owner-approved on 2026-10-02 in one session: Phase 1 (dashboard rebuild + mood migration, with an
explicit **Rule 1 exemption** for `/app` and global Zen/Medical fixes) and Phase 2 (companion
persona, safety tiers, model routing). The plan (`docs/DASHBOARD_OVERHAUL_PLAN.md`) was folded
into `docs/DESIGN.md` ("Dashboard `/app`" and the world fixes), the API reference (`/api/mood`,
`mood_checkins`) and PROJECT_BACKLOG §Q (its open points), then deleted on 2026-10-09 — it was
never committed; its text survives only as the loose git blob `020048b0` (`git cat-file -p
020048b0367682c12082b2f1329313cb030337a3`) until `git gc` prunes it. Fixed defects: KNOWN_ISSUES "Fixed on 2026-10-03".

| Verification | Result | Tier |
|---|---|---|
| Gates | tsc 0 · 484/484 · 565/565 with DB · oxlint 41/0 · yoga 0 · build 0 | [V-EXEC] |
| Migration `20261002000002` | PostgreSQL 17 scratch: fresh up (16 files) → RLS on, policy present, FK CASCADE → down (table gone) → up | [V-EXEC] |
| Real backend on scratch (DEV_WORKFLOW §4.3) + a fake OpenAI-compatible model | `/api/mood` append-only (201; PATCH/DELETE 404; 400 on bad mood/tag/date; 401 anonymous; per-user isolation; crisis note → `high` alert); chat JSON + SSE: Gemma system-fold, hidden tags never streamed, keyword `elevated` raised to `acute` by the model, country-aware helplines appended once, referral fields on success, "idk" after a disclosure stays `elevated`, unreachable model → honest fallback | [V-EXEC] |
| Browser (isolated Vite on 127.0.0.1:5174 → scratch backend; the owner's session untouched) | Dashboard in all six worlds; measured contrast failures on the dashboard: Medical 8 → 0, Focus 0, Forest/Space/Zen 1 (sidebar label, since fixed in source); Medical 0 on settings, journal, wellness, circle, psychologists, checklist; chat send, inline support card (collapsed in the drawer), acute full-screen + skip, suggestion chip; 390×844 phone layout via iframe, no horizontal scroll | [V-EXEC] |
| Not verified | The eval harness on the BYOK route (the rig route was run 2026-10-22, `docs/COMPANION_CHAT_PLAN.md` §11); reduced-motion emulation; the keyed companion video (the automation tab is hidden, so the static fallback orb showed) | [UNKNOWN] |

The owner's dev backend (`node --watch`, Supabase DSN) was stopped with approval before the
migration was added; restart it against a local scratch database.

## I. 2026-10-08 → 10-09 — dashboard & settings refinement (committed 2026-10-09)

Owner-approved on 2026-10-08 as a Rule 1 exemption for the surfaces it named; Phase 6b (the
Recording Studio) was added by the owner on 2026-10-09. Ten items: calm companion motion, the
Medical character, the world picker with hover preview, three "Coming soon" locks (Custom world,
orb customizer, voice), the model choice (rig by access key or own OpenRouter key), Profile rows,
the Pose Creator and Recording Studio rebuilds, and the admin to-do drawer. Where the decisions
live now: `docs/DESIGN.md` (motion pace, world picker, Coming Soon, settings rows, admin drawer,
authoring surfaces), `docs/yoga-studio/YOGA_SURFACES_DESIGN_RECORD.md` §6a, the API reference
(§3.2, §3.3a, §3.4, §6, §8), KNOWN_ISSUES ("Fixed on 2026-10-08 → 10-09", deploy items 5 and 8,
the 2026-10-08 production-migration incident) and PROJECT_BACKLOG §V (voice).

| Verification (2026-10-09, end of Phase 7) | Result | Tier |
|---|---|---|
| Gates | `tsc -b` 0 · `npm test` 532/532 · `oxlint` 41 warnings / 0 errors (≤ baseline) · yoga subtree 0 · build 0 · `git diff` empty on the locked yoga files and existing migrations | [V-EXEC] |
| Impeccable detector over all 49 changed UI files | No new findings. One hit on an added line is the reduced-motion rule that disables `animate-bounce` (a false positive); the rest predate this work (`SOSProtocolModal` gray-on-colour, two `animate-bounce`, two indigo gradients in `AppLayout`, Inter flagged as overused — it is the documented body face) | [V-EXEC] |
| Migrations | `20261008000000` proved on scratch PostgreSQL (up → down → up, CHECK) and **on production by accident** (KNOWN_ISSUES); `20261009000000` proved on a throwaway PostgreSQL (seed once, archive cascade, CHECK) | [V-EXEC] 2026-10-08/09 |
| Browser, the owner's session on the local stack (Vite :5173 → backend :3001 → podman PG :5433) | Dashboard and Settings in Forest, Space, Zen, Medical and Focus at desktop width; Custom shown locked in the picker; the admin drawer in Medical; Creator and Studio in Focus; dashboard, Settings, Creator and Studio at 375 px in Focus and Medical inside the phone shell with no sideways overflow | [V-EXEC] |
| Reduced motion (headless Chromium, `--force-prefers-reduced-motion`, a temporary fixture mounting the real components) | Companion float held at 0,0 and its ring stopped; Settings reveal, world-card zoom, sidebar collapse and Studio controls all `transition-property: none`; zero running animations (3 without the preference). The sidebar collapse lacked its opt-out — fixed in Phase 7 | [V-EXEC] |
| Owner | Reviewed every phase in the browser; a real record → preview → approve run in the rebuilt Studio (2026-10-09). The local database held no recording rows afterwards, so where that take was stored is unconfirmed | [HISTORICAL] owner report |
| Not verified | Live orb motion in real time (the automation tab reports itself hidden, which pauses animation frames); the backdrop's 800 ms opacity dissolve still plays under reduced motion (opacity only, by design) | [UNKNOWN] |

## J. 2026-10-17 — Dashboard v2, Phases 1–7, complete (uncommitted)

The owner approved `docs/DASHBOARD_V2_SPEC.md` on 2026-10-17 with a Rule 1 exemption for `/app`,
`src/components/dashboard/**`, `AppLayout.tsx` and DESIGN.md. Their answers and the build log are in
the spec's §14. Short version: the desktop `/app` is now a chat arena (history, New chat, a `+` menu,
a locked mic and voice button that morphs into Send). The floating music player is gone from the
desktop shell, and its library opens from the sidebar's sound row. The camera never starts on page
load. The camera-light leak in `usePerception` is fixed. Phones are unchanged.

| Verification (2026-10-17) | Result | Tier |
|---|---|---|
| Gates | `tsc -b` 0 · `npm test` 610/610 (541 → 610: 69 new tests in 6 files) · `oxlint` 41 warnings / 0 errors (= baseline) · `npm run build` 0 | [V-EXEC] |
| Browser: headless Chromium driven over CDP in real time, with a temporary fixture page mounting the real AppLayout + `/app` (API stubbed, user and conversation seeded); fixture deleted afterwards | 1440×900 Forest and Medical; 1024×700 with the collapsed rail; the `+` menu open (focus on first item, `+` turned to ×); typing morphs the button into Send; history panel (groups, current, times); sound menu beside the sidebar, track switch updates the sidebar row; the empty state; the drawer on another route looks as before; the phone chat sheet renders through the recomposed ChatPanel; a seeded "camera on" stays off on load | [V-EXEC] |
| Behaviour, same fixture | Send → user bubble + labelled offline reply + history entry; opening a past chat files the current one; New chat files the current one and focuses the composer; signing in as another account shows an empty history and a fresh chat, and switching back finds the first account's chat in its own history | [V-EXEC] |
| Not verified | A real camera (this machine has none), so the `useCameraStream` grant/deny paths and the leak fix ran only in code review and type checks; the live model (the fixture stubs the API); reduced motion; the owner's own session | [UNKNOWN] |

**Phase 3 (the stage), same day.** Spec §14 has the details.

| Verification (2026-10-17, Phase 3) | Result | Tier |
|---|---|---|
| Gates | `tsc -b` 0 · `npm test` 616/616 (+6 `tileSplit`) · `oxlint` 41 / 0 errors · build 0 | [V-EXEC] |
| Real camera path: headless Chromium with its **fake camera device** (`--use-fake-device-for-media-stream`), driven over CDP in real time, temporary fixture (deleted) | Load restores the stage with the camera off (avatar card). "Turn camera on" gives live video (1280 px), "On this device only", and the camera button pressed. **Leave: 0 live tracks two frames (56 ms) after the click**, the row collapses to 0, and "Join stage" appears in the header. **Join: camera live at ~30 ms, companion at ~400 ms (gap 379 ms = 350 ms + render), 2 chime oscillators**, "MAITRI joined the stage." announced. **Leak scenario:** a camera that takes 1.5 s to start, switched off at 300 ms, gives 1 stream acquired and 0 live tracks. Denied gives "Camera blocked…" + Try again (Medical) | [V-EXEC] |
| Divider and perspective (real CDP mouse and keyboard input) | Drag clamps at 30 % / 70 % and saves `tileSplit` 0.3. Perspective → 755/377 px and back → 377/755 px, with the label flipping. → moves +5 %, Enter returns to 50 %, a far drag clamps at 70 % | [V-EXEC] |
| Phone 375 px | No floating player. The header speaker opens the sound menu below it (12,52 → 320 px wide). No horizontal overflow | [V-EXEC] |
| Not verified | A physical webcam and MediaPipe hand tracking on real hardware; the chime's sound (only its two oscillators were counted); reduced motion; the owner's session | [UNKNOWN] |

**Phase 4 (Engines), same day.** Spec §14 has the details.

| Verification (2026-10-17, Phase 4) | Result | Tier |
|---|---|---|
| Gates | `tsc -b` 0 · `npm test` 631/631 (+15 `engineStatus`) · `oxlint` 41 / 0 errors · build 0 | [V-EXEC] |
| Browser: fixture with the API stubbed (rig offline or online, or no model) and Chrome's fake camera; deleted afterwards | 1440: full panel 260 px beside the tiles (430/430 px). Rows: "Camera off" → after the camera came on, **"Running on this device" (MediaPipe really ran)**; body sensor "Simulated · Demo readings · Manage"; soundscape "Off · Choose" (opens the sound menu); model "Local GPU, offline · Settings" or "Local GPU, online"; voice "Coming soon". **Close:** tiles 430 → 488 (mid-transition) → 566 px, the pill shows "Engines: 0 running", `closed` saved; the pill reopens. 1024 with the rail: the compact strip fits (205/205 px). Stage left: the inline row in the header (Forest and Medical) | [V-EXEC] |
| Polling | On mount: 1 model fetch + 1 rig probe (was 2 — de-duplicated). With the panel closed, nothing polls. The 60 s interval and pause-while-hidden were reviewed in code only; a minute-long wait and a hidden tab weren't simulated | [V-EXEC] / [V-INSPECT] |
| Not verified | A real Bluetooth band and the ESP8266 stream (the "Live" body-sensor state); "Try again" after a real perception failure; the owner's session | [UNKNOWN] |

**Phase 5 (quick dock), same day.** Spec §14 has the details.

| Verification (2026-10-17, Phase 5) | Result | Tier |
|---|---|---|
| Gates | `tsc -b` 0 · `npm test` 639/639 (+7 dock edits, +1 prefs migration) · `oxlint` 41 / 0 errors · build 0 | [V-EXEC] |
| Browser, fixture with the API stubbed; deleted afterwards | Tab 56 px with 6 motes. **Open inline:** arena 1076 → 934 (mid) → 832 px, Engines aligned to the dock width, focus moves in. **Quick note:** typing shows "Not saved yet"; Save **POSTed `{title:"Evening", content:…, reflection:"", world:"forest"}` to /api/journal** and showed "Saved to your journal." **Locked journal:** "Your journal is locked. Open the Journal to unlock it…". **Customize:** picker = Body signals (user) / + Admin tools (admin); Move up reordered; Add + Size → tall; "Move beside the stage" → lower `journal-note:tall` with the Engines **44 px strip** on top; all saved. **Overlay** at 1024 with the full sidebar: arena unchanged at 660 px, `role=dialog aria-modal`, Engines → pill, Esc closed it and focus returned to the tab. Body-signal tiles don't overflow. Medical correct | [V-EXEC] |
| Not verified | Reload persistence in a real session (the fixture clears storage; the writes themselves were read back); real journal and lock against the backend; reduced motion on the tab; the owner's session | [UNKNOWN] |

**Phase 6 (phone layout), same day.** Spec §14 has the details.

| Verification (2026-10-17, Phase 6) | Result | Tier |
|---|---|---|
| Gates | `tsc -b` 0 · `npm test` 639/639 · `oxlint` 41 / 0 errors · build 0 | [V-EXEC] |
| 375×812 and 390×844, phone shell, fixture with the API stubbed and the fake camera; deleted afterwards | **No page scroll (0), no horizontal overflow (0)**. Composer bottom 661 px, tab bar top 736 px (docked above it). **A script measured every visible control: none under 44 px** (header 36 px buttons counted with their 44 px hit areas; first pass found the suggestion chip link and two header links under 44 px, now fixed). Forest and Medical | [V-EXEC] |
| Stage strip | Collapsed: no companion video mounted. Show → tiles 96 px, companion mounted. Camera on → 1 live track. Hide → "Camera on" chip, still 1 live track. Chip → 0 live tracks. Leave → "MAITRI isn't on stage" + Join. Join → expanded, "MAITRI is here", 2 chime oscillators, camera respects the user's off preference | [V-EXEC] |
| Sheets | `+` sheet: 4 items at 44 px, focus on close. Engines sheet: 5 real rows. Dock sheet: Quick note + Yoga at standard size. Closed by **handle drag (160 px)**, **Esc** and **backdrop tap**. Keyboard: Enter opens, focus moves in, 30 Tabs stay inside, Esc returns focus to the opener. An opaque background replaced 95 % after text showed through in screenshots | [V-EXEC] |
| Regression | Other phone pages keep the Chat button and its sheet. Desktop `/app` keeps the `+` popover and the full stage | [V-EXEC] |
| Not verified | A real phone (touch drag, iOS safe areas, the soft keyboard over the composer: `100dvh` does not shrink for the iOS keyboard); the owner's session | [UNKNOWN] |

**Phase 7 (postponed widgets, next step, retirement, docs), same day — Dashboard v2 complete.** Spec §14 has the details.

| Verification (2026-10-17, Phase 7) | Result | Tier |
|---|---|---|
| Gates | `tsc -b` 0 · `npm test` 639/639 · `oxlint` **40** warnings / 0 errors (one fewer: it was in the deleted `MusicPlayer.tsx`) · build 0 | [V-EXEC] |
| Browser, fixture with the mood/habits API stubbed; deleted afterwards | Fresh user: the dock is Check-in + Today, and the arena shows "Start with a check-in…". **Check in** opened the dock and focused the first mood. Low + Anxious + Save **POSTed `{mood:2, tags:["anxious"], source:"dashboard", localDate}`**; the dock showed "Low · at 5:47 AM · Anxious · Check in again", and the arena's next step became "A two-minute breath to settle" (Begin → `/app/wellness?tab=breathing`, secondary "Talk it through"). Struggling today → "Talk it through with MAITRI"; **Open chat placed "I'm not doing great today." in the composer, focused, not sent**. Today compact: "1 of 2 habits done · Next: Drink water". Your week: "3 check-in days" plus the screen-reader sentence. With no Check-in in the dock, the prompt opened the check-in **inline** (focus on the radio). Mood labels fit (Struggling 61 px in 73 px). **Phone 375:** no page scroll, no overflow, no target under 44 px, and Check in opens the Dock sheet with focus on the mood | [V-EXEC] |
| Not verified | The real `/api/mood` and `/api/habits` against the backend; the owner's session; real devices | [UNKNOWN] |

**Owner review follow-up (2026-10-17 → 20): full-height dock, compact bottom stage with side strips, and side wings.** Spec §14 has the details.

| Verification (2026-10-20) | Result | Tier |
|---|---|---|
| Gates | `tsc -b` 0 · `npm test` 655/655 · `oxlint` 40 / 0 errors · build 0 | [V-EXEC] |
| Camera continuity across bottom ↔ wings (headless Chromium fake camera) | Same `<video>` element, never paused, same stream id, 1 acquisition, 1 live track. Perception "Running" before and after a round trip, with no restart | [V-EXEC] |
| Layouts at 1440 × 900 and 1280 × 800 (full sidebar and rail) | Compact 4:3 tiles plus strips where they fit; wings of 200–222 px with the chat ≥ 492 px; full-height dock tab; the overlay or merged lower widget when wings meet an open dock; no horizontal overflow | [V-EXEC] |
| Not verified | A physical webcam; the owner's session; the breathing guide's phase match with the companion, judged by eye (both read `performance.now()`; only the CSS delay was checked) | [UNKNOWN] |

## K. 2026-10-21 — Custom Domain unlocked, controls rebuilt, orb customizer removed

Owner request, 2026-10-21. Design record: `docs/DESIGN.md` "Coming soon" and "Custom World Controls".

- **Custom Domain is live**: `FEATURES.customWorld = true`. `isWorldLocked` still follows the flag, so it returns `false` for every world now, and the lock path (picker card, `setWorld` guard, fallback on load) comes back if the flag is turned off.
- **Custom World Controls rebuilt** (`components/settings/CustomWorldControls.tsx`, `lib/customWorld.ts`): a preview strip with "Active Sanctuary" or "Switch to Custom Domain", six presets, a hue slider with four accent harmonies, a 40–432 Hz drone with four resonance points, and Reset to defaults. Shown in every world.
- **Two fixes underneath it.** `uiStore` now writes the `--custom-*` properties whatever the active world (before, colours chosen elsewhere were lost on switching, and the picker card showed the defaults), plus derived border, panel, glow and text tints. The Custom drone's frequency now **glides** (`WebAudioSynth.setFrequency`, a separate effect in `AppLayout` / `MobileAppLayout`) instead of restarting the synth on every slider step.
- **Orb customizer removed**: the `orbCustomizer` flag, its Settings body and "Coming soon" card, the Coming-soon group, and `components/ui/ColorWheelPicker.tsx`. The companion is the standardized floating still orb (`CompanionStillOrb.tsx`).
- **Tests**: `tests/customWorld.test.ts` (new); `tests/featureLocks.test.ts` and `tests/worldPreview.test.ts` now assert that Custom opens, loads as itself and can be previewed. **820 / 820**, `tsc -b` 0, `npm run build` green.

| Check | Result | Tier |
|---|---|---|
| Headless Chromium, a temporary fixture page mounting the real components against Vite :5173 (deleted afterwards) | The section at 1280 px in Forest (not active: Switch button), Custom with the Emerald preset (Active Sanctuary, page in emerald), Medical (light: readable, drone track visible after a fix) and 390 px (presets and resonance chips one per row). The world picker in Forest shows the Custom card unlocked and wearing the emerald palette | [V-EXEC] 2026-10-21 |
| Real audio glide | Not heard, only checked in the code (headless run, no sound) | [UNKNOWN] |

Open: `Custom_background.webp` has marketing UI baked in (KNOWN_ISSUES, 2026-10-21). The volume restart noted here was fixed the same day (§L).

## L. 2026-10-21 — Settings audit and polish, profile identity card, ambient volume glide (uncommitted)

Owner request, 2026-10-21: a Rule 1 exemption for the Settings page (`src/pages/settings.tsx`, `src/components/settings/**`) and
the soundscape effects in `AppLayout.tsx` / `MobileAppLayout.tsx`. Design record: `docs/DESIGN.md` "Settings sections and rows".

- **Profile identity card** (`ProfileIdentity.tsx`, rewritten): avatar in a world-accent aura ring that is the control (hover or
  focus shows "Change"; a camera badge for touch), the live name, @handle, plan and role pills; left-aligned glass fields with
  labels, help and in-field counts (amber at 90 %); the greeting preview as a speech bubble beside MAITRI's chat avatar. Autosave
  unchanged (700 ms, blur, unmount) with "Changes save automatically / Saving… / Saved / Couldn't save — Retry".
- **Ambience mixer** (`AmbienceMixer.tsx`, new): no hard-coded cyan left — slider, percentage, background-mode cards and status
  dot follow the world accent; stale copy ("golden companion card", "1.2s crossfade") replaced with the owner's wording; a status
  line that says what is really playing and an "Open sound menu" button (`maitri-open-sound`), which replaced help text that sent
  phone users to a sidebar. Background mode is now a pair of native-radio choice cards (the old buttons exposed no pressed state).
- **Volume glides, never restarts.** `audioVolume` left the soundscape effect's dependencies in both layouts; a separate effect
  calls `webAudioSynth.setVolume`, and `setVolume` now anchors its 50 ms ramp at the current gain (a bare ramp from a past event
  jumped). Side effect fixed with it: moving the Settings slider while a *library* soundscape played used to stop that soundscape
  (the effect's cleanup stopped the shared synth).
- **Account & Session** (`AccountSession.tsx`, new; `AccountBadges.tsx`, new): plan-and-role card in one accent and one neutral
  (was amber + indigo + amber), plan end date when set, an inline confirmation before "Cancel subscription" (**behaviour change —
  flagged to the owner**: it is immediate and only an administrator can restore a plan), a signed-in chip with the e-mail, "Sign out"
  (was "Log Out"), Delete account set apart. The delete dialog is now an `alertdialog` portalled to `<body>` with focus management,
  Escape / outside press, a spinner while deleting; its last line no longer promises "the main landing page" (sign-out lands on sign-in).
- **Harmonised**: `SettingsSection` icon tile lights in the accent while open, 16 px side padding on phones; page title in the
  headline style; Custom World Controls got its own icon (palette); Voice section gap 28 → 24 px; the model picker's key field no
  longer pushes "Connect" out of its card at 375 px (`min-w-0`); `settings.tsx` subscribes to the section state only (it re-rendered
  every section on each volume step).

| Check | Result | Tier |
|---|---|---|
| Gates | `npx tsc -b` 0 · `npm test` 820 / 820 · `npx oxlint` (changed files) 0 findings · `npm run build` green · impeccable detector: no findings | [V-EXEC] 2026-10-21 |
| Real layouts, temporary fixture mounting `AppLayout` / `MobileAppLayout` + Settings, synth calls counted (deleted afterwards) | Five volume steps → 5 `setVolume`, **0** `start` / `stop`; a world change → 1 `start`; ambience off → no `setVolume` | [V-EXEC] 2026-10-21 |
| Headless Chromium screenshots, temporary Settings fixture (deleted) | Zen, Space, Forest, Custom, Medical at 864 px (1440 with sidebar + drawer) and 1144 px; 375 px phone; saved / error / idle status, cancel confirmation, delete dialog (dark and Medical) | [V-EXEC] 2026-10-21 |
| Hover / focus overlay on the avatar | Not captured (programmatic focus did not trigger `:focus-visible` headless); checked in the built CSS only | [V-INSPECT] |
| Real audio | Not heard (headless, no sound) | [UNKNOWN] |

### L.1 Follow-up the same day (owner request): world picker fix, voice clarity

- **The world picker no longer previews while its section is closed.** A closed `SettingsSection` keeps its body mounted (clipped,
  `inert`), so the picker's position tracking still found its full-size rectangle under the sections below and previewed worlds
  as the pointer crossed them; closing mid-preview also left the preview on. `WorldPicker` now takes `collapsed` (from
  `settings.tsx`), tracks nothing while closed or inside an `inert` ancestor or at zero size, and on closing clears the pending
  hover and returns to the active world at once (not after the 120 ms intent delay).
- **Voice & Speech says what each model is for**: Spoken replies (Kokoro-82M) speaks — replies, conversation answers, previews;
  Dictation (Moonshine-base) listens, never speaks, and needs no WebGPU (it runs on WASM). Without a WebGPU adapter the row says
  "Requires WebGPU, which this browser isn't providing" (plus "so the system voice speaks instead" when one exists) with a folded
  "Why, and how to turn WebGPU on" note. Previews that can't play say why — "Voice preview requires the Kokoro Spoken Replies model
  or an installed local system voice." — on the button and in a line under the voices.

| Check | Result | Tier |
|---|---|---|
| World picker, real Settings in headless Chromium, synthetic pointer moves, store read back (temporary fixture, deleted; View Transitions disabled in the fixture so changes apply at once) | **Before the fix:** sweeping the closed section's area previewed Space; closing mid-preview kept it; moving over the closed area kept previewing. **After:** no preview while closed; an open hover still previews; 120 ms after closing the page is back on the active world | [V-EXEC] 2026-10-21 |
| Voice section in a browser with no WebGPU adapter and no system voice (the headless shell) | Zen and Space at 864 / 375 px, Medical — copy and the folded help render; `tsc -b` 0 · 820 / 820 · oxlint 0 · build green · detector clean | [V-EXEC] 2026-10-21 |
| Browser steps in the help | From the WebGPU implementation-status wiki (gpuweb, edited 2026-10-02) and Chrome's WebGPU troubleshooting guide; not tried in Brave or Firefox here | [V-INSPECT] |
| "Blocked by Shields in Brave" (in the owner's brief) | Not found in any source: Brave 1.93+ anonymises what WebGPU reports but does not disable it. The help names the flags instead. If Shields do block it on a real machine, add a line | [UNKNOWN] |

## M. 2026-10-21 — Admin control center (uncommitted)

The owner pasted a brief on 2026-10-21 asking for the whole `/admin` console to become a working
control center. That is a Rule 1 exemption for `src/pages/admin/**` and the WorldPicker guard.
Backend: `features/admin/oversight.controller.js` and `systemTelemetry.js` (both DB-free, wired in
`admin.controller.js`), `adminControlSchemas` (`middleware/schemas.js`), migration `20261021000000`.
Frontend: `components/admin/AdminDialog.tsx` (the one dialog the console uses), `pages/admin/adminControl.ts`
(pure model) and `adminApi.ts`. Routes: API reference §3.4.

- **Escalations** (`/admin/sessions`): Pending / Assigned / Closed tabs with counts. **Assign
  Specialist** offers the verified practitioners at or above the requested level, excluding the
  requester, ordered by who accepts clients and has room. The practitioner joins the session, which
  goes back to `active`, and the room is told who joined. **Resolve Case** records clinical notes,
  and **Dismiss** records a rationale (`resolution_notes`, `resolved_at`, `resolved_by`). Closing a
  still-pending case returns an `escalated` session to `active` and tells the client their
  psychologist continues. Admin changes lock the row and re-check its state.
- **The assigned practitioner can now open the session.** Before, the participant rule refused
  them (KNOWN_ISSUES "Fixed on 2026-10-21"). This also fixes practitioners who accept from their
  own queue.
- **Sessions**: server-side search (client, practitioner, session id; `%`/`_` matched literally)
  and status filter, both kept in the URL (`?search=`, `?status=`, `?session=` opens a drawer).
  The **review drawer** shows timing and duration, both parties, the parsed AI hand-off, clinical
  notes, the rating, and Mark Completed / Cancel Session for a stuck session (inline confirmation;
  both people get a system line). It also has a **transcript** that loads only when asked, with
  every read logged with the admin's id.
- **Telemetry**: `/api/admin/uptime` measures, and anything unmeasured is null. The uptime page
  shows heap used of allocated (neutral) and of the V8 limit (the bar that carries severity), RSS,
  external memory, the pool tiles and a `SELECT 1` round trip, the WebSocket split, the process,
  and a **Service Health Matrix** (PostgreSQL, WebSocket gateway, Email engine, Auth service) in
  place of the fake AFK card. It polls every 5 s while visible. On the Overview, the telemetry
  card shows the same data with **Run DB Check**.
- **Overview**: the four tier cards open `/admin/users?filter=<tier>`, recent sign-ups have
  **View**, and ban appeals have Pending / Approved / Rejected tabs with counts.
- **Users**: Basic and Unverified filters. **Verify Email** (`PATCH /users/:id/verify`) in the
  table and the detail, with a confirmation. **Cancel Subscription** cancels on the server after a
  confirmation. The **detail** (`?view=<id>`) shows the account summary, therapy count and recent
  sessions (each links to its drawer, plus "Open session history"), and quick actions: Edit
  Profile, Verify Email, Suspend / Lift Suspension, Cancel Subscription.
- **Community**: search by reporter e-mail, reported text or reason; "Reported by …" on each
  card; **View Author** and **Suspend Author**. The ban endpoint now accepts `{ banned: true|false }`
  (409 when already in that state), so two moderators can't undo each other.
- **Psychologists**: search by name, e-mail or licence number. The review dialog has a clinical
  tier selector for all four tiers the database allows, including "experienced", which the brief
  didn't list. The button is status-aware: Verify & Grant as … / Update Tier / Suspend / Reject.
  A tier change keeps the first verification date.
- **Layout**: one icon per nav item. The admin **to-do drawer** is mounted on `/admin` (desktop,
  like `/app`), and the sidebar sits above its panel.
- **WorldPicker**: the grid also gets `pointer-events: none` while its section is closed. The real
  fix (`collapsed`, `track`) shipped in §L.1 and `e065e25`.

| Check | Result | Tier |
|---|---|---|
| Gates | `tsc -b` 0 · `npm test` **857 / 857** · with a scratch PostgreSQL 17 **959 / 959** (persistence 75, app routes 9, admin control center 21) · `oxlint` 41 warnings / 0 errors, the same set as HEAD · `npm run build` 0 · emoji ban green | [V-EXEC] 2026-10-21 |
| New tests | `adminControlCenter` (23: schemas, every controller path against fakes, telemetry incl. timeout, the participant rule, migration SQL, route table), `adminConsoleModel` (14: candidates, actions, duration, hand-off parsing, health matrix), `adminControlCenterDatabase` (21, needs `YOGA_TEST_DATABASE_URL`: the endpoints on real SQL). The participant test was shown to fail without the fix | [V-EXEC] |
| Migration `20261021000000` | Throwaway PostgreSQL 17 (podman, 127.0.0.1:5441): fresh up (19 files) → all five statuses insert, a bogus one is refused (23514), the urgency check intact → down (statuses folded, columns gone, narrow check back) → up → re-run harmless. A table with a differently named legacy status check: replaced | [V-EXEC] |
| Real stack in headless Chromium (CDP) | The real backend booted from an env-free copy of `backend/` (DEV_WORKFLOW §4.3) on :3099 against a seeded throwaway database, plus a second Vite on :5174. The owner's :3001 and :5173 weren't touched. **Overview**: telemetry rows, Run DB Check updates the time, tier links, View links, appeal tabs. **Sessions**: assign (candidates correct, focus inside, toast, tabs recount), drawer + transcript, Escape returns focus to the opener, resolve (submit disabled until notes), search and filter in the URL, cancelling a stuck session, no sideways scroll at 390 px. **Users**: unverified → verify, `?view=` detail, inline confirmations moving focus in and back, Cancel Subscription over the edit modal. **Community**: search, the suspend confirmation names the anonymous author. **Psychologists**: licence search, approve as specialist. **Uptime**: both meters, three live WebSockets (2 vitals, 1 therapy, 1 room) drawn as a 67 / 33 split. **To-do drawer** opens from the admin sidebar. **WorldPicker**: closed grid `pointer-events: none` + inert, a sweep over all six card positions never previews; an open card does | [V-EXEC] 2026-10-21 |
| Not verified | A real Brevo delivery (the sandbox had no key: "Not configured"); the console in the Medical world; a real phone; the owner's session | [UNKNOWN] |

### M.1 Follow-up the same day (owner brief): zero-crash pages, :3001 restarted

**The crash.** The :3001 backend was still the process started on 2026-10-20, so it was running
the code from before §M. Against it, the new pages threw: `/admin` and `/admin/sessions` read
`counts.pending` from responses without `counts`, `/admin/uptime` read
`stats.memory.heap_used_mb`, and the user detail read `therapy.total`. This was reproduced in
headless Chromium (today's frontend against an env-free copy of HEAD's backend on a throwaway
database).

**The fix** (frontend only). Every read of a new response field is guarded. Where the old API is
silent, the model (`adminControl.ts`) fills in what it can instead of a blank default:
- escalation counts are derived from the list, and the list is filtered to the tab (the old API
  ignores `?view=`);
- appeals are counted and filtered the same way;
- sessions are filtered in the page when the API ignored `?status=` / `?search=`;
- telemetry is a `TelemetryPayload` in which every section is optional. The old fields (RSS,
  Node.js, live connections, uptime) are still shown, the Service Health Matrix marks a missing
  service "Not reported", and a note says the API predates measured telemetry;
- the user detail shows "—" for an unreported plan or role (never "Basic"/"User") and says
  therapy history isn't reported;
- report cards hide the author shortcuts when no author was sent.

| Check | Result | Tier |
|---|---|---|
| Before the fix, legacy API | `/admin`, `/admin/sessions`, `/admin/uptime`, `/admin/users?view=` crashed (TypeError on `pending` / `heap_used_mb` / `total`); community and psychologists rendered | [V-EXEC] 2026-10-21 |
| After the fix, legacy API | All six pages render with no console errors. Uptime shows the legacy figures plus the note; the matrix shows four "Not reported" rows | [V-EXEC] 2026-10-21 |
| After the fix, current API | All six pages render with no console errors. `GET /appeals`, `/appeals?status=pending`, `/escalations`, `/escalations?view=closed` and `/uptime` return 200 with `counts` and every telemetry section (curl against the sandbox) | [V-EXEC] 2026-10-21 |
| Gates | `tsc -b` 0 · `npm test` **862 / 862** (+5 model tests for legacy and partial payloads) · with a scratch DB **964 / 964** · oxlint 41 / 0, the same set as HEAD · build green | [V-EXEC] 2026-10-21 |

**The restart (owner's choice: "back up prod, then restart").**
- *Inspected first, read-only:* production was Postgres 17.6 with 18 migrations through
  `20261009000000`, the standard status check, no escalation rows, and a free lock. Only
  `20261021000000` was pending.
- *Backed up:* `backend/backups/maitri_backup_2026-10-21T10-22-52Z_pre-20261021000000.dump`. It was made with `pg_dump -F c` (17.11, run in podman with
  the DSN passed as `PG*` variables), is 131 MB and mode 600, and `pg_restore --list` reads 974
  entries / 37 tables.
- *Ignored:* `.gitignore` now ignores `backend/backups/` and `*.dump`.
- *Restarted:* `node backend/src/index.js` (old pid 120909, under `npm run server` started by the
  IDE) got SIGTERM. A new `npm run server` now runs from the repo root, detached
  (`setsid nohup`), logging to `backend/dev-server.log`; its pid was 1813630 at 15:54 IST.
- *Result:* `/health` is ok and connected, and both boot migration passes logged success. A
  read-only check afterwards showed 19 migrations, the five-status check, `resolution_notes` and
  `resolved_by`, and nothing pending.
- *Not verified:* authenticated `/api/admin/*` calls on :3001. They need the owner's session,
  and no token was minted from the production secret. Unauthenticated calls return 401 as
  expected.


## N. 2026-10-21 — Admin Tools & Sandbox, Phase 0 (Foundations) (uncommitted)

The owner pasted a brief for an all-purpose testing, simulation and diagnostics suite, asked for a
plan first, and approved it with rulings on all ten decisions (`docs/ADMIN_SANDBOX_PLAN.md` §0;
Rule 1 exemption, ruling 10). Phase 0 builds the shell every module will plug into. No module is
built yet; each phase stops for the owner's review. The plan's build log is its §10.

**Built.**
- **Backend:** `features/admin-sandbox/`, mounted inside the admin router after requireAuth +
  requireAdmin. It has two parts:
  - `sandboxConfig.js` (pure): the `ADMIN_SANDBOX=off` kill switch, and the guard that keeps a
    sandbox DSN off the production database.
  - `sandbox.controller.js` (DB-free factory): `requireSandboxEnabled` (404 `{ sandbox: 'off' }`)
    and `GET /api/admin/sandbox/status`. Status reports the caller's model route and the rig, e-mail,
    the sandbox database's state and superadmin. It writes nothing.
- **Frontend:**
  - `/admin/tools/:module`: a status strip, "Running now" with Stop and Stop all, six module links,
    and an honest panel per module until its phase lands.
  - A "Tools & Sandbox" nav item, which hides only when the server says the sandbox is off.
  - `useSandboxStore` (not persisted): the status, and live activities with their stop functions.
  - The "Sandbox active" banner in `AppLayout`, `MobileAppLayout` and `AdminLayout`.
  - `.dash-v2` subtracts `--sandbox-banner-h`.
  - Pure models in `src/lib/sandbox/`.
- **Docs:** the plan, DESIGN.md "Admin tools & sandbox", the API reference (§3.4 row and three
  env vars), KNOWN_ISSUES "Added 2026-10-21 (Admin Tools & Sandbox)", and both `.env.example` files.

**Found by the end-to-end check, and fixed before handing over.** The first version of the database guard compared host strings literally:
- **Local aliases:** with `DATABASE_URL` on `127.0.0.1:5441/maitri_scratch`, it accepted a sandbox DSN of `LOCALHOST:5441/maitri_scratch`, which is the same database.
- **Driver parsing:** the guard now reads a DSN the way node-postgres does:
  - every local name is one server;
  - `host`, `port` and `user` query parameters override;
  - `dbname` is ignored;
  - a Supabase project ref matches through a direct host or a pooler user.

  A parity test holds it to `pg-connection-string`.

Aliases a URL can't reveal (an IP for a host name) are left to Phase 7's connect-time check.

| Check | Result | Tier |
|---|---|---|
| Gates | `tsc -b` 0 · `npm test` **924 / 924** (+62: `adminSandbox` 34, `adminSandboxModel` 19, `adminSandboxStore` 9) · oxlint 41 / 0, the same warning set as HEAD (yoga subtree 0) · `npm run build` green · no change under `src/wellness-engine/` or `backend/database/migrations/` | [V-EXEC] 2026-10-21 |
| The new tests can fail | Five deliberate breaks, each caught: production DSN accepted, kill switch falling through, stops halting at the first failure, the superadmin note dropped, a failed stop forgotten. Plus the alias normalisation removed. Restored and green | [V-EXEC] 2026-10-21 |
| Real backend over HTTP | Env-free copy of `backend/` on :3099 against a throwaway Postgres 17 container on :5441 (DEV_WORKFLOW §4.3), with scratch users. **Default:** no session 401 · plain user 403 · admin 200 with `superadmin: false` · superadmin 200 with `true` · unknown sandbox path is a plain 404. **`ADMIN_SANDBOX=off`:** admin gets 404 `{ sandbox: 'off' }`, user still 403. **Local `SANDBOX_DATABASE_URL`:** `set`, host and database shown, and the sandbox database still had 0 tables. **The production database spelled `LOCALHOST`:** `refused` (after the fix above) | [V-EXEC] 2026-10-21 |
| UI in headless Chromium | A temporary fixture mounted the real `AdminLayout` + page, `AppLayout` and `MobileAppLayout`, calling the :3099 copy with a Bearer token. It blocked every other cross-origin request and every WebSocket, and nothing was blocked. All verified: <br>• `/admin/tools` redirects to Vitals, and the strip shows live status. <br>• Admin banner: sticky and opaque, pinned flush to the top after scrolling (top 0). <br>• Desktop `/app`: the banner adds 40 px with **no page overflow**, and the chat toggle moves below it on `/app/journal`. <br>• Medical: the banner stays legible. <br>• 375 px: no horizontal overflow on the admin page, and the phone banner sits under the header with a 44 px Stop all. <br>• Clicking the real banner's Stop all ran the stop function and removed the bar and the height variable. <br>The fixture files and container were deleted afterwards | [V-EXEC] 2026-10-21 |
| Phone header | It doesn't stick on long pages. Measured on HEAD's own layout too, so it is pre-existing (KNOWN_ISSUES). The banner shares its block | [V-EXEC] 2026-10-21 |
| Not verified | The owner's :3001 backend (production DSN) still runs code from before this work. It was **not restarted**, so `/admin/tools` there says the API predates the sandbox until it is. Phase 0 adds no migration, so a restart migrates nothing. A real phone; the owner's session | [UNKNOWN] |

### N.1 Phase 0 review, the :3001 restarts, and Phase 1 — Vitals & ECG (uncommitted)

The owner approved Phase 0 and confirmed rulings 3 and 10 (plan §0). They asked for :3001 to be restarted so it serves the sandbox endpoints, then for Phase 1.

**The restarts.** Before each one, the :3001 process was checked:
- it was `node backend/src/index.js` under `npm run server`, with no watcher, from the repo root;
- the DSN host was the production Supabase pooler;
- 19 migrations were on disk and none had changed, so `migrate.latest()` had nothing to run.

Both times it got SIGTERM, shut down gracefully, and was started detached (`setsid nohup npm run server >> backend/dev-server.log`, with a marker line).
- **17:44 IST:** the Phase 0 endpoints. New pid 2397075.
- **18:14 IST:** after Phase 1's backend changes. New pid **2560130**.

Each time `/health` was ok and connected, and both migration passes logged success. No authenticated call was made against production.

**Phase 1 built** (plan §10 has the file-by-file log):
- the seeded vitals and ECG generator (six rhythms, rate–rhythm coupling, stress bands);
- local and socket modes, with one app-wide 2 Hz clock;
- the relay: `POST /api/admin/sandbox/vitals/frame` and `/vitals/stop`, with their own 180/min limiter, writing nothing and never calling the persisting ingest route;
- ruling 2's honest labels across the socket handler, Body signals and the Engines row;
- the Vitals module;
- the rebuilt dock widget (small, medium and tall);
- `AdminTools.tsx` retired.

| Check | Result | Tier |
|---|---|---|
| Gates | `tsc -b` 0 · `npm test` **978 / 978** (+54: `sandboxVitals` 23, `sandboxVitalsRelay` 14, `sandboxVitalsFlow` 15, `engineStatus` +2) · oxlint 41 / 0, the same set as HEAD (yoga 0) · build green · no change under `src/wellness-engine/` or migrations | [V-EXEC] 2026-10-21 |
| Generator, measured | R peaks within 0.2 % of the set rate at 40, 72, 130 and 180 bpm. RMSSD within about 10 % of the HRV slider. Premature beats at 0.60 coupling, about 1 in 8, each with a full compensatory pause. ADC range 443–814 | [V-EXEC] 2026-10-21 |
| The new tests can fail | Nine deliberate breaks, each caught (labels, tab routing, storage, the compensatory pause, leads-off zeros, the sensor-frame ECG reset, the Engines rule, the 409 stop, the drift pause). Restored and green | [V-EXEC] 2026-10-21 |
| HTTP and WebSocket | Env-free backend copy on :3099 with a throwaway Postgres 17 (DEV_WORKFLOW §4.3), cookie and CSRF as a browser does it. <br>• Frames: three echoed with seq 0–2, `source: 'simulated'` and no other flag. Leads off relayed as zeros. <br>• Refusals: 400 malformed, 403 non-admin. <br>• Stop: clears the cached snapshot (offline, no samples). <br>• Real sensor: a paired one streaming makes a frame 409, and stop leaves it untouched. <br>• Rate limit: the 181st request in a minute gets 429, so the global 60/min doesn't apply. <br>• **Database:** only the real sensor's 1 `vitals` and 1 `ecg_readings` row | [V-EXEC] 2026-10-21 |
| Headless Chromium against that backend | **Socket mode end to end:** 15 frames accepted, 15 back over `/ws/vitals`; nothing reached any other server. <br>**Vitals module** (1440 px): controls, trace, counters, readings. <br>**`/app` desktop:** <br>• the dock widget shows the stream with its actions first; <br>• Body signals tags every reading "Simulated"; <br>• the Engines row's name is "Body sensor: Sandbox stream (simulated)"; <br>• "Live from your sensor" and "NodeMCU Online" never appear, and the page doesn't overflow. <br>**Phone dock sheet** (375 px): 44 px targets. <br>**Widget sizes:** small and tall | [V-EXEC] 2026-10-21 |
| `/app/health` | Draws the simulated ECG at the right scale. **Pre-existing:** `EcgWaveform` labels it "AD8232 … HARDWARE ADC · LIVE HARDWARE", even in Simulated mode with no stream. Recorded in KNOWN_ISSUES for the owner, not changed (outside ruling 2's files) | [V-EXEC] 2026-10-21 |
| Not verified | A real browser session on :3001 (needs the owner's login). A real paired ESP8266 alongside a stream. Timings in a foreground tab: the headless shell's virtual clock reports the socket round trip as 0 ms | [UNKNOWN] |

### N.2 Phase 1 review and Phase 2 — Safety (uncommitted)

The owner approved Phase 1 and extended ruling 2 to `/app/health` (`EcgWaveform` and `health.tsx` say "SIMULATED ECG STREAM" and "SIMULATED STREAM"; plan §0), then asked for Phase 2. The plan's §10 has the file-by-file log.

**Built:**
- `POST /api/admin/sandbox/crisis/scan` and `GET /api/admin/sandbox/crisis/helplines`, writing nothing, with their own 30/min limiter;
- small shared helpers in `crisisSignals.js` (ruling 3): `explainRisk`, `CONVERSATION_WINDOW`, a carried-in prior level, `helplineCountries()`. Live chat's behaviour is unchanged;
- the Safety module: the scanner beside the client floor, a 38-phrase sample library with a confusion matrix, previews of the real support card and the real acute flow (snapshot and restore, storage kept real, links logged), and the helpline inspector with no links;
- one deliberate deviation from the brief: the comparison with the client's fallback runs in the client, against the list in its bundle, because the API never imports client code (plan §10).

**:3001 was not restarted.** It is still pid 2560130 on the production DSN and serves Phases 0–1, so the Safety module's requests there fail with "Request failed (404)" until a restart (read in the code: `sandboxRequest` reports a plain 404 that way). Phase 2 adds no migration, so a restart would migrate nothing. Not done without the owner's say-so.

| Check | Result | Tier |
|---|---|---|
| Gates | `tsc -b` 0 · `npm test` **1059 / 1059** (+81: `sandboxSafety` 34, `sandboxSafetyModel` 31, `sandboxSafetyPreview` 16) · oxlint 41 / 0, none in Phase 2's files · `npm run build` green · no change under `src/wellness-engine/` or migrations | [V-EXEC] 2026-10-21 |
| The new tests can fail | 13 deliberate breaks, each caught: <br>• the preview: no storage guard, no restore, the acute flow ending on a hidden card, links let through; <br>• the engine: negated acute counted as none; <br>• the scanner: the carried-in level ignored, the cap never reported, the log carrying the words, a route before the kill switch; <br>• the client: the floor effect dropped, an over-read scored as a match, the fallback always "identical", a live link on the inspector. <br>Restored and green | [V-EXEC] 2026-10-21 |
| The sample library on the real engine | **35 of 38** as the rules expect. Under-read: "I wish I could go to sleep and not wake up" and "I don't want to be here anymore" (elevated → none), and "I took a whole bottle of sleeping pills" (acute → none). The client floor reads 3 of the 8 acute phrases as acute. Pinned in `tests/sandboxSafetyModel.test.ts`; KNOWN_ISSUES | [V-EXEC] 2026-10-21 |
| HTTP | Env-free backend copy on :3099 with a throwaway Postgres 17 on :5441 (DEV_WORKFLOW §4.3), cookie and CSRF as a browser sends them. <br>• **Refusals:** 401 without a session, 403 for a plain user, 400 malformed, 403 without the CSRF header, 400 for a country and an ISO code together. <br>• **Answers:** an acute conversation, a carried-in level with the model cap, all 38 samples, and GB, Germany (unknown) and none given, each as designed. <br>• **Limits:** 30 answered, then 429. `ADMIN_SANDBOX=off` gives 404 `{ sandbox: 'off' }` on both. <br>• **Database:** every table's row count, and the insert, update and delete counters, identical before and after | [V-EXEC] 2026-10-21 |
| Headless Chromium against that backend | A temporary fixture mounted the real `AdminLayout`, page and app-wide crisis modals. It blocked every other cross-origin request and every WebSocket; nothing was blocked. <br>• **Views, 1440 and 375 px:** the scanner, the library and the inspector, no page overflow. <br>• **Support card:** GB's list; clicking its `tel:` logged it and left the page as it was. <br>• **Takeovers:** the intervention screen and the locked SOS protocol, with the ribbon the topmost element. At 375 px it covers the SOS card's top border, never its content. <br>• **The full walk, through the real buttons:** 3 skips, the lock, "I am safe now". Storage kept skip count 2 and the real emergency contact throughout, every field came back, and the banner entry went. The audit listed the SOS numbers, with KIRAN, iCall and AASRA not in the server's list. <br>• **Medical:** legible. <br>The fixture, the copy and the container were removed afterwards | [V-EXEC] 2026-10-21 |
| Phone admin console | At 375 × 812, `<main>` is 48 px tall under the stacked nav (`AdminLayout`'s aside, unchanged since HEAD; the sandbox's nav item adds a row). The phone views were checked with the nav hidden in the fixture only. KNOWN_ISSUES | [V-EXEC] 2026-10-21 |
| Not verified | The owner's :3001 (not restarted). A real phone, and dialling behaviour on one: the guard was proved in headless Chromium and in tests | [UNKNOWN] |

### N.3 Phase 2 review, :3001, and Phase 3 — Companion turn tester and benchmark (uncommitted)

The owner approved Phase 2. They asked for three things:
- restart :3001;
- add the safety previews to the dock's tall size;
- keep the keyword gaps and the SOS numbers recorded.

Then they asked for Phase 3. The plan's §10 has the file-by-file log.

**:3001.** No server was running at 03:5x on 10-22:
- The log shows a graceful SIGTERM at 23:52:25 on 10-21. That wasn't from this work: the Phase 2 cleanup stopped only the :3099 copy, and :3001 was checked as still up after it. It came 49 s after the owner's commit `0ed2136` (23:51:36). Who sent it is unknown.
- The machine rebooted at 03:42 (`uptime -s`).

Before starting it again:
- no watcher;
- both DSNs on the production pooler (host only printed);
- 19 migrations, none new since the last restart, which had applied everything through `20261021000000`.

It was started from the repo root as `setsid nohup npm run server >> backend/dev-server.log`, with a marker line, at 03:56 IST. It is pid **81745** under `npm run server`. `/health` connected, both migration passes ran with nothing to do, and `/api/admin/sandbox/crisis/helplines` answers 401 without a session (the route exists). Phase 3's backend changes came after, so **:3001 doesn't serve `/companion/*`**, and runs live chat from before the ruling-3 extraction, until it is restarted. Phase 3 adds no migration.

**Built:**
- the shared turn helpers (`turnLogic.js`) and context wording (`contextLines.js`), moved out of `chat.controller.js` and `contextAssembler.js` unchanged in behaviour, with fuzzed parity against the old code;
- `POST /api/admin/sandbox/companion/plan` and `/companion/turn`, with their own 12/min limiter;
- the Companion module (the tester and the benchmark);
- the dock's safety quick launches;
- the ribbon moved into the banner.

| Check | Result | Tier |
|---|---|---|
| Gates | `tsc -b` 0 · `npm test` **1120 / 1120** (+61: `sandboxCompanion` 43, `sandboxCompanionModel` 16, `sandboxSafetyModel` +2) · oxlint 41 / 0, none in Phase 3's files · `npm run build` green · no change under `src/wellness-engine/` or migrations | [V-EXEC] 2026-10-22 |
| Refactor parity | The old inline code, lifted verbatim from a pre-edit backup, against the shared helpers: 4,000 randomised context row sets and 6,000 chunked streams with their settles. All identical | [V-EXEC] 2026-10-22 |
| The new tests can fail | 15 deliberate breaks, each caught: <br>• helplines owed ignoring a model raise; <br>• trailing whitespace kept; crisis sampling as hot as steady; context wording drifting; <br>• the camera tracked per admin; writing after a disconnect; the queue wait not measured; a forced mode ignored; owed helplines not appended; TTFT counting the queue; <br>• live chat no longer writing model-raised alerts; <br>• the SSE reader dropping split lines; raw text leaking into the reply; `suggest` tags not marked; <br>• p90 by rounding, caught only after the test added counts where rounding and nearest rank differ | [V-EXEC] 2026-10-22 |
| HTTP | Env-free backend copy on :3099, a throwaway Postgres 17 on :5441, and a fake OpenAI-compatible rig on :11500, with rig keys saved through the real account API. <br>• **Refusals:** 401 no session, 403 plain user, 400 when the last message is the companion's, 409 for a second turn of the same admin. <br>• **Plan:** no model request. **"My real context":** the admin's check-in, habit, name and bio in the prompt; the synthetic fields ignored; Supportive picked from the low check-in. <br>• **Steady turn:** the model got temperature 0.7, 450 tokens, and the system prompt folded into one user turn (gemma). Both tags were removed. TTFT 412 ms, total 2,095 ms, against the fake's 400 ms + 14 × 120 ms. <br>• **Crisis turn:** temperature 0.3, 550 tokens; keyword elevated, model acute, combined acute; helplines appended. <br>• **Leaving:** the model saw the disconnect after 2 of 14 chunks, and the next turn waited 0 ms. <br>• **The shared slot:** a real user's `/api/chat/stream` and a sandbox turn at once. The sandbox turn waited **1,880 ms** in line, and the model never ran two at once. <br>• **Database:** every table's row count and write counters identical across every sandbox call. **Positive control:** the live chat call in the same window wrote its 2 `safety_alerts` and 1 `token_usage` row. <br>• **Limits:** 12 turns in a minute, then 429. `ADMIN_SANDBOX=off` gives 404 `{ sandbox: 'off' }` on the turn and the plan | [V-EXEC] 2026-10-22 |
| Headless Chromium against that backend | Real time over the DevTools protocol: virtual time runs ahead of a streamed reply, so `--virtual-time-budget` dumped before the turn ended. The fixture mounted the real `AdminLayout` + page, `AppLayout` + `Dashboard` and the crisis modals. Every other cross-origin request and every WebSocket was blocked; none was attempted. <br>• **1440 px:** before a run, with "Auto (live chat: Steady)" and the plan; after a run, with the reply, the marked tags, Safety and Timings; the crisis turn; the prompt inspector (3,900 characters); the benchmark (3 runs, varying length). <br>• **375 px:** the settings, the crisis turn and the benchmark, with no page overflow. <br>• **`/app` dock:** the tall widget's quick launches. Support card put the real card at the top of the arena, with the banner naming the preview. Acute flow put the takeover over the dashboard under the ribbon. In the lower zone, which shares the cell with Engines, the quick launches are one short scroll in. The fixture and every server and container were removed afterwards | [V-EXEC] 2026-10-22 |
| Not verified | A real model (the owner's rig, or OpenRouter). A real browser session on :3001, which doesn't serve the routes until restarted | [UNKNOWN] |

### N.4 Phase 3 review, :3001, and Phase 4 — Voice out and in (uncommitted)

The owner approved Phase 3 and asked for :3001 to be restarted, then for Phase 4. The plan's §10 has the file-by-file log.

**:3001.** The same checks as every restart:
- pid 81745, parent `npm run server`, cwd the repo root, no watcher;
- both DSNs on the production pooler (host only printed);
- 19 migrations, none new.

It got SIGTERM and exited gracefully (logged at 04:45:06.567). It was started again detached with a marker line, at 04:45 IST, as pid **353498**. `/health` connected, both migration passes had nothing to do, and the Phase 3 routes answer 401 without a session. Phase 4 adds no backend code.

**Built:** the voice tester (Companion & Voice → Voice, `?view=voice`, a lazily loaded chunk):
- voice out on the on-device or system voice, with the 5 presets and a test-only toggle for all 28 English Kokoro voices;
- voice in from the microphone, the on-device voice, or a recording file, with WER.

The models are reached only through `deviceVoice` and `deviceStt`, downloads are asked first, and no voice setting changes.

| Check | Result | Tier |
|---|---|---|
| Gates | `tsc -b` 0 · `npm test` **1151 / 1151** (+31, `sandboxVoice`) · oxlint 41 / 0 · `npm run build` green (`VoicePanel` its own chunk) · no change to existing voice files, `src/wellness-engine/` or migrations | [V-EXEC] 2026-10-22 |
| The new tests can fail | 13 deliberate breaks, each caught except two: <br>• the job numbering was checked against its own constant; <br>• a bare worker import passed the import rule. <br>Both tests were strengthened, and those breaks plus a direct `new Worker` are now caught. Restored and green | [V-EXEC] 2026-10-22 |
| Resampler | The first version (a 3-tap box) let 9 kHz through at about 59 %, so the test failed. The windowed-sinc replacement holds 9 kHz under 5 % and 3 kHz within 2 %, keeps a steady level exactly, and takes about 0.66 s for a 20 s take | [V-EXEC] 2026-10-22 |
| Real speech recognition | Headless Chromium driven in real time over CDP. The fake microphone played an `espeak-ng` recording of the reference. <br>• **Mic:** the panel asked before the 67 MB download; the mic showed as a sandbox activity while on and was released after. Moonshine (real, from Hugging Face) started in 4,964 ms and transcribed 5.2 s in 474 ms (RTF 0.09), WER **0.0 %** (12 / 12). <br>• **File:** WER 0.0 %, RTF 0.08, model start 1,224 ms from the cache. <br>• **A different reference:** WER 38.5 % (2 / 2 / 1 of 13), coloured correctly at 375 px. <br>• **Never blocked:** no request from the page was blocked | [V-EXEC] 2026-10-22 |
| UI | 1440 and 375 px, no overflow. <br>• **States:** "Requires WebGPU" (the headless shell has none); the dictation guard, with its controls disabled; the 326 MB question, with the device voice still idle (WebGPU stubbed in the fixture, never confirmed). <br>• **Voices:** 28 behind the toggle; "No local English voice" for the system voice. <br>• **Settings:** the admin's read aloud, route, reply voice and dictation silence were identical before and after every run | [V-EXEC] 2026-10-22 |
| Not verified | Kokoro synthesis (no WebGPU in the headless shell; on the owner's desktop the device voice fails, KNOWN_ISSUES). A system voice speaking (none in the headless shell). The on-device-voice reference. A real microphone and a real phone | [UNKNOWN] |

### N.5 Phase 4 review and Phase 5 — Access previews and the e-mail test (uncommitted)

The owner approved Phase 4 and sent the Phase 5 brief. The plan's §10 has the file-by-file log. :3001 was **not** restarted (still pid 353498): the new routes reach it only after a restart, which waits for the owner.

**Built:**
- **Role and plan preview** (`/admin/tools/access`, and the dock's tall Admin tools widget): an overlay on `useUserStore`. Storage keeps the real role and plan throughout, so a reload or a closed tab ends it; a refresh from the server lands in the real values and the preview stays; signing out ends it. `AdminLayout` and the dock read the real role, and the banner never reads it, so an admin can't lock themselves out. The panel says what each choice changes on screen today, each claim with the file it rests on (a test keeps them true), and warns in amber that Cancel subscription is real during a paid-plan preview.
- **E-mail test** (`GET`/`POST /api/admin/sandbox/email/test`): the real sign-in template (`otpEmail.js`, shared with `sendOtpEmail`), a code marked `TEST-`, Brevo sandbox mode unless Deliver to inbox is ticked and confirmed. Superadmin only, 5 an hour, nothing written; the uptime page marks a delivered test.

| Check | Result | Tier |
|---|---|---|
| Gates | `tsc -b` 0 · `npm test` **1196 / 1196** (+45: `sandboxAccess` 25, `sandboxEmail` 19, `adminConsoleModel` 1) · oxlint 41 / 0 · `npm run build` green · no change under `src/wellness-engine/` or migrations | [V-EXEC] 2026-10-22 |
| The new tests can fail | 18 deliberate breaks, all caught: storage writing the shown role; a server refresh overwriting the preview; the superadmin e-mail bypassing a role preview; the genuine selector reading the preview; `AdminLayout` on the shown role; sign-out keeping the preview; the plan setter ignoring it; a dead Stop-all handler; a drifted readout claim; the sandbox flag not in the body; no superadmin check; the quota off by one; deliver unless false; a 503 that counts; the recipient in the log; a second copy of the template; a sandbox send recorded as a delivery; the quota line. Restored and green | [V-EXEC] 2026-10-22 |
| Template | `buildOtpEmail` compared with HEAD's inline template: HTML, subject and text identical | [V-EXEC] 2026-10-22 |
| Real backend over HTTP | Env-free copy on :3099, throwaway Postgres 17 on :5441, the **copy's** Brevo URL pointed at a local fake that recorded each request (real Brevo was never called). Plain user 403 · admin 403 · bad address / `deliver: "yes"` 400, nothing sent · sandbox send 200 with Brevo 201, message id and ~50 ms; the flag `X-Sib-Sandbox: drop` in the JSON body and no sandbox HTTP header; the `TEST-` code in subject, text and HTML · uptime `last_delivery` untouched by sandbox sends, `test: true` after a delivered one · a Brevo 400 reported as `ok: false` and counted · sixth send 429 with the reset time · table rows and write counters identical before and after four sends · a real sign-up's code built from the same template, without the flag | [V-EXEC] 2026-10-22 |
| UI in headless Chromium | The real `AdminLayout` + page, `AppLayout`, `MobileAppLayout` and Settings against that copy, every other request and every socket blocked (none were). <br>• **Preview, 1440:** "Viewing as Standard user · Pro plan" on screen and in the banner; storage held superadmin / Basic; the amber warning. <br>• **E-mail:** a sandbox send's mode, status 201, message id, 49 ms and code; the Deliver question with the box still unticked; the tester off for a non-superadmin. <br>• **/app under the preview:** no Admin Panel link, Upcoming and Early Access, the Pro pill; `fetchUserData` landed in the real values; the dock widget kept with its pickers on user / Pro; End preview there brought the admin link back and cleared the banner. <br>• **Settings:** Cancel subscription shown under the Pro preview (not pressed). <br>• **375 px:** the module and the phone shell, no overflow. <br>Fixture files, the copy and the container were deleted afterwards | [V-EXEC] 2026-10-22 |
| Not verified | A send through real Brevo, in sandbox mode or delivered (needs :3001 restarted and the owner's go-ahead). A real phone; the owner's session | [UNKNOWN] |

### N.6 Phase 5 review, :3001, and Phase 6 — Sound (uncommitted)

The owner approved Phase 5 (and its three choices: the dock widget kept through a role preview, instant-apply pickers, a warning rather than a hidden Cancel subscription), asked for :3001 to be restarted, then for Phase 6. The plan's §10 has the file-by-file log.

**:3001.** The same checks as every restart: pid 353498, parent `npm run server`, cwd the repo root, no watcher; both DSNs on the production pooler (host only printed); 19 migrations, none new. SIGTERM at 10:44:22 IST, a graceful exit, then started detached with a marker line as pid **2269140**. `/health` connected, both migration passes had nothing to do, and `GET`/`POST /api/admin/sandbox/email/test` answer 401 without a session. No real e-mail was sent.

**Built:** the Sound module (`/admin/tools/sound`): a live readout from a read-only analyser tap on each engine (level, measured pitch beside the configured one, the AudioContexts); the six worlds played through the real soundscape synth, with what each description claims checked; the meditation engine's four ambiences; four tests (frequency sweep, volume ramp, duck to 20 %, start/stop cycling); and the six track names checked against what they play. Nothing is recorded; no setting is written.

| Check | Result | Tier |
|---|---|---|
| Gates | `tsc -b` 0 · `npm test` **1231 / 1231** (+35, `sandboxSound`) · oxlint 41 / 0 · `npm run build` green (`SoundModule` its own 41 kB chunk) · no change under `src/wellness-engine/` or migrations | [V-EXEC] 2026-10-22 |
| The new tests can fail | 23 deliberate breaks, all caught (the plan's §10 lists them). Two real bugs were caught on the way: steep noise read as tones (a global-median tonality test; now the local floor), and the meditation engine's ambience recorded before `acquireAudio` cleared it | [V-EXEC] 2026-10-22 |
| Engine taps | Against a fake AudioContext: the analyser hangs off the synth's duck stage (and the meditation engine's master) beside the destination, feeds nothing, and is made once; `diagnostics()` follows start, setFrequency and stop | [V-EXEC] 2026-10-22 |
| Real engines, headless Chromium in real time (48 kHz) | **Worlds:** Medical 120.0 Hz (Δ −0.01), Focus 60.0, Custom 174.0 gliding to 300.0, Forest and Zen unpitched. **Meditation engine:** 200.0 + 210.0 Hz, 528.0 + 264.0 Hz, rain and forest stream unpitched. **Sweep** 12 / 12 within ±0.05 Hz. **Ramp** linear within 0.08 dB, silent at 0. **Duck** −14.0 dB (−14.0 expected), 0.33 s down, 0.63 s up. **Start/stop:** clicks at **6 of 6 stops** (−11.2 dBFS step), 0 of 6 starts | [V-EXEC] 2026-10-22 |
| Isolation | The music-player block (buttons disabled, the reason shown); Stop all from the banner ended it; the ambience volume, sound switch, Custom frequency, music volume and meditation volume identical before and after every run; no request blocked | [V-EXEC] 2026-10-22 |
| UI | 1440 and 375 px, no horizontal overflow; the sweep and ramp tables keep their numbers on one line | [V-EXEC] 2026-10-22 |
| Not verified | Hearing it: the headless shell renders audio with no speaker, so the numbers are the signal's, not a room's. A real phone; Safari's AudioContext | [UNKNOWN] |

### N.7 Phase 6 review, the stop fade, and Phase 7 — Sessions on the sandbox database (uncommitted)

The owner approved Phase 6, kept the meditation engine's tap, asked for the ~20 ms stop fade, confirmed ruling 10 for `/admin/sessions` again, then asked for Phase 7 (plan §4.3, §5, ruling 1). The plan's §10 has the file-by-file log.

**The stop fade.** `WebAudioSynth.stop()` fades each voice over 20 ms before its oscillators stop. Measured with the lab's own test in headless Chromium: 0 of 6 stops click (6 of 6 before), and five world switches and the final Stop are clean (3 of 5 switches and the Stop clicked on the old engine). KNOWN_ISSUES marks it fixed.

**Built:** the session and escalation controllers as DB-free factories (production wiring in `psychologist.routes.js`, route lines unchanged); the guarded sandbox database (`SANDBOX_DATABASE_URL`: the DSN check, a connect-time check that refuses any non-synthetic account before migrating, programmatic migrations, a check inside every write); synthetic actors; the session driver running the real handlers as those actors; the real oversight controller bound to the sandbox database; `/admin/tools/sessions` (database and actors, create, drive, the live room monitor, reset); and the "Sandbox data" source in `/admin/sessions` under the banner "Viewing Sandbox Database — Synthetic Data Only".

| Check | Result | Tier |
|---|---|---|
| Gates | `tsc -b` 0 · `npm test` **1296 / 1296** (+65: `sandboxSessions` 39, `sandboxSessionsModel` 24, the fade 2) · oxlint 41 / 0 · `npm run build` green (`SessionsModule` its own 31 kB chunk) · no change under `src/wellness-engine/` or migrations | [V-EXEC] 2026-10-22 |
| Real database (scratch `postgres:17`, `YOGA_TEST_DATABASE_URL`) | `sandboxSessionsDatabase` 9 / 9: a database holding a real account refused before any migration ran on it; the DATABASE_URL database refused by its DSN; 19 migrations, seed, all four states through the real handlers as the right actors, messages from all three, the specialist's accept, the oversight queue, assign, resolve (by the stand-in), dismiss, transcript, close, reset; a real account appearing later refused at the next write with nothing written. The existing route suites 30 / 30 through the factory wiring | [V-EXEC] 2026-10-22 |
| The new tests can fail | 40 deliberate breaks, all caught (four on the real database). Three of my first tests had gaps the breaks found; tightened | [V-EXEC] 2026-10-22 |
| End to end, real app, headless Chromium | An env-free backend copy on :3099 (scratch `DATABASE_URL`, separate scratch sandbox DB), its own Vite on :5175: connect and migrate, seed, create escalated, join the room; the room heard the client's line, typing both ways, and the specialist's accept. With the monitor still joined, assigned the senior in `/admin/sessions`' real dialog and came back to both broadcasts. Resolve recorded "By sandbox_admin". Not configured, refused for 13 non-synthetic accounts, and refused as the production DSN each said so and offered no write. The stand-in "production" database held 0 synthetic rows afterwards | [V-EXEC] 2026-10-22 |
| UI | 1440 and 375 px (the console's nav hidden at 375, its phone layout already in KNOWN_ISSUES) and the Medical world: no overflow, no console error. Fixed on the way: the banner unreadable in Medical (now `.surface-ink`), too tall when pinned on a phone (a compact strip), a squeezed status line at 375 | [V-EXEC] 2026-10-22 |
| :3001 | Not restarted: it serves Phases 0–5 and doesn't know Phase 7's routes yet. Using Sessions there needs a restart (the owner's call) and `SANDBOX_DATABASE_URL` in `.env` pointing at a local, empty Postgres (the owner's to set; I don't edit `.env`) | — |
| Not verified | The client's `/app/sessions` view and the psychologist portal (out of scope: synthetic actors can't sign in). A real phone | [UNKNOWN] |

### N.8 Phase 7 review and Phase 8 — docs and final gates; the suite complete (uncommitted)

The owner approved Phase 7 and its four choices (the stand-in admin, the two extra routes, the room monitor that keeps listening across tabs, the compact phone banner) and asked for Phase 8. The plan's §10 has the log; its §9 lists what stays open.

**Docs updated:** the plan (status complete, §2, §5, §8, §9, §10); `docs/README.md`; DESIGN.md; this file (§A, §B, here); the API reference; KNOWN_ISSUES (nothing new in Phase 8); PROJECT_CONTEXT (§F.10, the route table, the timeline); DEV_WORKFLOW (the sandbox suites, §4.4); the next-agent briefing and the index; both `.env.example` files; one stale comment in `sandboxConfig.js`.

| Gate | Result | Tier |
|---|---|---|
| Typecheck | `npx tsc -b` exit 0, no output | [V-EXEC] 2026-10-22 |
| Tests | `npm test` **1296 / 1296**, 274 suites, 0 skipped; the 18 sandbox suites hold 431 | [V-EXEC] 2026-10-22 |
| Tests + DB | `YOGA_TEST_DATABASE_URL` on a fresh podman `postgres:17`: **1407 / 1407**; yoga persistence, app routes, admin control center and sandbox sessions database suites all ran | [V-EXEC] 2026-10-22 |
| G3 | `tests/emojiBan.test.ts` 8 / 8; the suite imports icons from `lucide-react` only (35 files, no other icon library, no inline SVG) | [V-EXEC] 2026-10-22 |
| Lint | `npx oxlint` 41 warnings / 0 errors; `src/wellness-engine/yoga` 0 diagnostics | [V-EXEC] 2026-10-22 |
| Locked files | `git diff` empty on the CANON §1 list (locked yoga files, the yoga canon, `backend/database/migrations`); nothing changed under `src/wellness-engine/` | [V-EXEC] 2026-10-22 |
| Build | `npm run build` exit 0; the tools page and each heavy module are their own chunks | [V-EXEC] 2026-10-22 |
| Browser, every module | Real app, headless Chromium, an env-free copy on :3099 with scratch `DATABASE_URL` and `SANDBOX_DATABASE_URL`: all seven views at 1440 and 375 px with no overflow and no console error; one session through all six with three simulations live at once (vitals stream, Pro plan preview, the room monitor), listed on `/admin` and on `/app`, all ended by the banner's Stop all; a turn with no model route ended honestly; the safety library 35 of 38 as expected (the 3 known keyword gaps) | [V-EXEC] 2026-10-22 |
| :3001 | Not restarted in Phases 7–8. It serves Phases 0–5 (Sound is client-only). Sessions there needs `SANDBOX_DATABASE_URL` in `.env` (an empty local Postgres; the owner's to set) and a restart (asked for, then checked as every restart is) | [V-INSPECT] 2026-10-22 |
| Not verified | Hearing the sound lab; a real phone; Safari; Kokoro on WebGPU | [UNKNOWN] |

## O. 2026-10-23 — Track B on the rig: the local zero-cost pipeline and `maitri-companion:local-v1` (uncommitted)

Owner briefs, the evening of 2026-10-23: $0 for cloud APIs (the OpenRouter key is valid, but the account has no credits), so the dataset pipeline, the training and the eval all run locally. A GNOME shell crash interrupted the first eval; a second brief resumed it. Detail in `docs/COMPANION_CHAT_PLAN.md` §6.11 and §11; findings in KNOWN_ISSUES ("the local zero-cost pipeline").

- **Pipeline:**
  - `pilot --provider=ollama` runs every role on the rig's gemma2:27b: no key, no budget, $0.
  - It folds Gemma's instructions, refuses a prompt the server cut (`ContextError`), prints a time
    report instead of a bill, and takes `--threshold=` for the judge's bar.
  - The critic now refuses code fences, which gemma2:27b wraps whole turns in.
  - Judge drops keep their record.
  - The harness gains `--model=<tag>`.
- **Pilot, seed 201:**
  - 6 of 15 conversations, 52 SFT examples and 15 DPO pairs, in 46 min.
  - It ran with `--threshold=2,3,3`: gemma2:27b scores R7 a 3 on nearly every reply, so the default
    bar kept 0 of 15.
- **Training:**
  - 50 LoRA steps on Qwen 2.5 7B at 1,137 tokens/s, 16.89 GiB peak, loss 1.58 → 0.31, no NaN;
  - a 4.68 GB Q4_K_M, template parity 3 of 3;
  - `maitri-companion:local-v1` in Ollama.
- **Eval against gemma2:27b** (same flags; `scripts/companion-eval/reports/local-v1-benchmark/comparison.md`, git-ignored):
  - Safety net: every acute turn went to the takeover and every elevated turn onto a card, for both.
  - Safety check asked when due: **5 of 20 against 13**.
  - Sycophancy rejected: 93.8 % against 100 %.
  - Note well-formed: 100 % against 79 %. Boilerplate: 0.9 % against 6.2 %.
  - Slowed down on playing-down turns: 26.7 % against 10 %.
  - First text: 0.6 s against 2.0 s.
  - Not a candidate for live chat.

| Gate | Result | Tier |
|---|---|---|
| Typecheck | `npx tsc -b` exit 0 | [V-EXEC] 2026-10-23 |
| Tests | `npm test` **1518 / 1518** (+6: the local provider, the fence, the threshold, the time report) | [V-EXEC] 2026-10-23 |
| Lint | `npx oxlint` 41 warnings / 0 errors, none in the changed files | [V-EXEC] 2026-10-23 |
| Backend | No backend file changed. :3001 is pid 405095 (the owner's restart, 20:14 IST, after the crash), `/health` ok | [V-EXEC] 2026-10-23 |
| Open | The ladder reads "I wish I could (just) disappear" as `none` (for the advisor, D12). A model trained on gemma2:27b's outputs is a Gemma "Model Derivative" (Gemma Terms of Use §1.1(e)), an owner decision before any such model serves users. Local data needs more check, acute and Hinglish cards | [V-INSPECT] 2026-10-23 |


## Local frontend Phase 2 Settings update - 2026-10-28

The existing seven Settings sections are complete with editable local identity/avatar, live greeting, honest provider/audio status, independent world/theme persistence, spacious desktop modals and a working direct Journal shortcut. Profile writes validate input and preserve immutable account fields. Real Web Audio gain scheduling was corrected. Production build, all 11 automated tests and the isolated Settings browser suite passed. Light/dark screenshots were reviewed at desktop and mobile sizes. See MASTER_REQUIREMENTS_AUDIT.md for the exact changed-file inventory and test coverage. Historical backend notes below/above describe separate work, not connections made by this frontend phase.

## Local frontend Phase A world ecosystem - 2026-10-28

Six distinct lightweight environment treatments now extend the existing renderer, with world-specific lighting, geometry, motion, surface treatment and synthesized sound texture. Theme palettes remain independent. The compact selector supports optional preview/apply/cancel and the existing Theme Studio still handles custom drafts and persistence. Added an original Medical architectural-light SVG, fixed narrow-screen Home card sizing and removed duplicate selector IDs. The existing navigation/audio popover and earlier Settings/profile work were preserved. Production build, 11 automated tests, the 96-case world/theme/layout browser suite and Settings regression pass; detailed coverage and final route regression results are recorded in MASTER_REQUIREMENTS_AUDIT.md. No new dependencies, backend work, commits or pushes.

## Lead demo sprint checkpoint 1 - 2026-10-28
Home composition completed and production build passed. The hero uses the existing world environment with a small bottom editorial treatment. Supporting content is reduced to mood, daily habits, intention and reflection; breathing/focus remain in an accessible disclosure and journey history is compact. Existing world rendering, wellness data and routes are retained. Next: verify automatic Home mascot follow and Settings opt-out, then implement the Wellness Studio in the existing Yoga view. No backend, commits or pushes.

## Lead demo sprint checkpoint 2 - 2026-10-28
The single original Home mascot now follows automatically on fine-pointer desktops with bounded spring motion, protected-control avoidance, typing/modal pause, touch idle, reduced-motion handling and a persistent Settings opt-out. Escape rests it for the visit. Removed the follow toolbar/menu. All 11 automated tests pass; isolated browser checks pass automatic movement, viewport bounds, typing/modal pause, opt-out persistence, Escape, reduced motion and 1440/390px Home layouts. Restored the visible top-right world selector and confined Theme Studio access to Settings while preserving the existing music popover. Next: implement Yoga/Meditation within the existing Yoga route.

## Lead demo sprint checkpoint 3 - 2026-10-28
Wellness Studio is implemented in the existing Yoga route. The landing has Yoga and Meditation pathways. Yoga retains routines, catalog, projected 3D guide/rotation, camera permission handling, local recording and instructor tools, and adds previous/next, resume, end and completion controls. Meditation provides breathing, body scan and quiet sessions, 1/3/5/10/15-minute durations, written cues, orb, optional existing ambient audio, pause/resume/end/completion and deduplicated local history. Production compilation passed. All 13 automated tests pass. The isolated lead browser suite passes Home/mascot checks, Yoga controls and camera denial, meditation timers (real pause checks plus accelerated-clock completion), persistence, reduced motion and 96 meditation world/theme/layout combinations. Next: final existing route/Settings/public-entry regression, visual review and any fixes. No backend, commits or pushes.

## Lead demo sprint final verification — 2026-10-28
[V-EXEC] Verified and finalized the lead demo sprint across all requirements:
1. **Redesigned Home & Worlds/Themes**: Verified on all six worlds (Forest, Space, Zen, Medical, Deep Focus, Custom Domain) and all eight themes (Ivory Bloom, Velvet Night, Kyoto Stillness, Dreamscape, Aurora Borealis, Ember Glow, Solar Dune, Monochrome Atelier) with zero horizontal overflow and proper contrast.
2. **Desktop Home Mascot Follow**: The single original MAITRI mascot follows the cursor automatically on desktop Home with bounded spring physics, obstacle avoidance, typing/dialog pause, Escape resting, reduced-motion suppression and persistent Settings opt-out (`cursorFollow`). Mascot is cleanly hidden in non-Home views.
3. **Wellness Studio (Yoga & Meditation)**: Both pathways fully functional within the existing Wellness Studio. Yoga features rotatable 3D illustrated guide, guided steps, start/pause/resume/end flow, accelerated-clock completion, local camera mirror, graceful camera denial fallback, and instructor authoring/recording. Meditation provides 3 sessions (breathing, body scan, quiet), 1/3/5/10/15 min durations, cue cycling, breathing orb, pause/resume/end, and deduplicated progress persistence in `maitri_wellness_journey`.
4. **All Automated Suites Passing**:
   - `npm test`: 13/13 unit tests passed (companion streaming, store duplicates, service failures, theme contrast, community, wellness deduplication, auth, conversation clear, settings persistence, profile editing, legacy handles, Home follow preference, meditation progress).
   - `npm run test:lead`: passed (automatic follow, bounds, typing/modal pause, settings persistence, Escape, reduced motion, responsive Home, yoga/meditation pathways, timers, completion, camera denial, 96 world/theme combinations).
   - `npm run test:entry`: passed (public introduction, WebGL scene, signup, password login, validation, persistence, home navigation, 6 world previews, mobile 375/390/768px, keyboard, reduced motion, WebGL fallback).
   - `npm run test:settings`: passed (7 sections, 6 worlds, 8 themes, profile validation, real audio graph, 6 responsive layouts, preview cancel, privacy reset).
   - `npm run test:worlds`: passed (96 world/theme layout combinations, preview cancel/apply, custom persistence, reduced motion, mobile effect budget, audio textures).
   - `npm run test:browser`: passed (40 theme/route combinations across 5 main views, 10 mobile route combinations, 6 worlds, 7 settings sections, 6 public world previews, auth forms, chat, automatic mascot follow).
5. **Production Build**: `npm run build` (`tsc -b && vite build`) passed with zero errors, 1,656 modules transformed cleanly.
6. **Visual Review**: Verified screenshots across desktop (1440px), tablet (768px), and mobile (390px/375px) without visual overlap or clipping.
7. **Scope & Honest Limits**: Physical camera/microphone hardware features use graceful browser fallbacks; AI companion responses and telemetry remain simulated locally; no production backend contacted, no commits or pushes.

