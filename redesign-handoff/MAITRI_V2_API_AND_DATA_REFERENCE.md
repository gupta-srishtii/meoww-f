# MAITRI v2.0 — API, DATA & ENVIRONMENT REFERENCE

> **Verified 2026-10-02** (fix chunks 1–5) by reading every `*.routes.js`, every migration and
> `backend/src/index.js`, and by booting `index.js` against a scratch PostgreSQL 17. When this file and the code disagree, the code wins — update this
> file.
>
> Architecture and "why" live in `MAITRI_V2_PROJECT_CONTEXT.md`. Rules about the yoga tables live
> in `MAITRI_V2_CANON_AND_GUARDRAILS.md`. Defects are in `MAITRI_V2_KNOWN_ISSUES.md`.

---

## 1. Request pipeline (`backend/src/index.js`)

```
helmet (CSP off, COOP same-origin-allow-popups)
 → cors (exact-match allow-list in production; ANY origin when NODE_ENV !== 'production')
 → express.json / urlencoded (10 MB, measured on the DECOMPRESSED body)
 → cookieParser
 → apiLimiter  /api       60 req/min/IP   (skips /api/yoga — M2 — /api/vitals/hardware — P1-9 — and
                                            /api/admin/sandbox/vitals/frame — admin sandbox, 2026-10-21)
 → chatLimiter /api/chat  20 req/min/IP
 → hardwareLimiter /api/vitals/hardware 300 req/min/IP
 → sandboxFrameLimiter /api/admin/sandbox/vitals/frame 180 req/min/IP (2 frames a second + headroom)
 → sandboxSafetyLimiter /api/admin/sandbox/crisis 30 req/min/IP (under the global 60; 2026-10-21)
 → sandboxCompanionLimiter /api/admin/sandbox/companion/turn 12 req/min/IP (under the global 60; 2026-10-22)
 → sandboxSessionsLimiter /api/admin/sandbox/{sessions,escalations,psychologist-sessions} 30 writes/min/IP (GETs skip it; 2026-10-22)
 → initDb()               (pool connect + knex migrate.latest() — runs on EVERY boot)
 → GET /api/csrf-token
 → requireCsrf            (all routes below; see exemptions in §4)
 → feature routers (table below)
 → GET /health
 → errorHandler           (honours err.status; stack trace when NODE_ENV !== 'production')
server.listen → ONE upgrade router (utils/wsGateway.js): cookie + Origin auth, then
                /ws/vitals or /ws/sessions (both noServer WebSocketServers) — see §5
```

| Mount | Router | Auth at mount | Extra limiter |
|---|---|---|---|
| `/api/auth` | `features/auth/auth.routes.js` | per route | `authLimiter` 10 / 15 min on register, login, OTP, google, forgot/reset, appeal |
| `/api/chat` | `features/companion-chat/chat.routes.js` | **`optionalAuth`** | `chatLimiter` |
| `/api/habits` | `features/habits/habits.routes.js` | `requireAuth` | — |
| `/api/mood` *(2026-10-02)* | `features/mood/mood.routes.js` | `requireAuth` | — |
| `/api/documents` | `features/documents/documents.routes.js` | `requireAuth` | — |
| `/api/journal` | `features/journal/journal.routes.js` | `requireAuth` | — |
| `/api/account` | `features/account/account.routes.js` | `requireAuth` | — |
| `/api/vitals` | `features/vitals/vitals.routes.js` | **per route**: device key on `/hardware`, `requireAuth` elsewhere | `hardwareLimiter` on `/hardware` |
| `/api/feedback` | `features/feedback/feedback.routes.js` | per route (`optionalAuth`) | 10 / 15 min on POST |
| `/api/admin` | `features/admin/admin.routes.js` | `requireAuth` + `requireAdmin` (router-wide) | `sandboxFrameLimiter` on `/sandbox/vitals/frame`, `sandboxSafetyLimiter` on `/sandbox/crisis`, `sandboxCompanionLimiter` on `/sandbox/companion/turn`, `sandboxSessionsLimiter` (writes) on `/sandbox/sessions`, `/sandbox/escalations`, `/sandbox/psychologist-sessions` (2026-10-21 → 22) |
| `/api/yoga` | `features/yoga-recordings/recordings.routes.js` | `requireAuth` (router-wide) | `yogaLimiter` 120 / min |
| `/api/psychologists` **and** `/api/psychologist` | `features/psychologist/psychologist.routes.js` (same router mounted twice) | per route | — |
| `/api/community` | `features/community/community.routes.js` | `requireAuth` | — |
| `/api/circles` | `features/community/circles.routes.js` | `requireAuth` | — |
| `/api/challenges` | `features/community/challenges.routes.js` | `requireAuth` | — |

## 2. Authentication & roles

- **Tokens:** access JWT 15 min (`maitri_token`, httpOnly) + refresh token 7 days
  (`maitri_refresh_token`, httpOnly, stored in `refresh_tokens`). `sameSite: 'none'` + `secure`
  in production (cross-site Vercel ↔ Render), `lax` in dev. `Authorization: Bearer` is also
  accepted.
- **`requireAuth`** (`middleware/auth.js`): cookie first, then Bearer; re-reads the user (incl.
  `role`, `is_banned`) from the DB; on expiry attempts a refresh via `maitri_refresh_token`.
- **`optionalAuth`**: on a missing/invalid/expired token sets
  `req.user = { id: null, email: 'guest@maitri.ai' }` — it does **not** refresh. Never use it on
  a route that writes an audit identity (canon D6). See `KNOWN_ISSUES` P0-1.
- **`requireAdmin` / `requireSuperAdmin` / `requireRole(...roles)`** (`middleware/adminAuth.js`):
  `ADMIN_EMAIL` (default `yourcompanionmaitri@gmail.com`) is the protected super-admin and is
  fast-tracked. `requireRole` deliberately does **not** set `req.user.is_admin`.
- **`requirePsychologist` / `requireVerifiedPsychologist` / `requireSessionParticipant`**
  (`middleware/psychologistAuth.js`).
- **Roles** (`users.role`, `VARCHAR(20)`, no CHECK): `user`, `beta_tester`, `instructor`,
  `psychologist`, `admin`, `superadmin`. Frontend mirror: `UserRole` + `deriveRole()` in
  `src/store/useUserStore.ts`; `isAdmin` excludes `instructor`.
- **Plans** (`users.subscription_plan`): `basic` (default), `starter`, `pro`, `enterprise` — set
  by admins only; no payment provider is connected.
- **Account flows:** register → 6-digit email OTP (`pending_registrations`, `otp_codes`; email via
  Brevo) → account created on verify. Password reset is **live** and OTP-based
  (`/forgot-password` → `/reset-password`). Google sign-in via `google-auth-library`.
  Ban → appeal (`ban_appeals`) → admin review. Self-service account deletion cascades.

## 3. HTTP routes

Paths are relative to the mount in §1. `AUTH` = `requireAuth`, `OPT` = `optionalAuth`.

### 3.1 Auth — `/api/auth`
| Method | Path | Notes |
|---|---|---|
| GET | `/me` | AUTH — current user |
| PUT | `/profile` | AUTH |
| POST | `/register`, `/login`, `/verify-otp`, `/resend-otp`, `/google` | zod-validated, rate-limited |
| POST | `/forgot-password`, `/reset-password` | OTP reset |
| POST | `/appeal-ban` | banned users |
| POST | `/cancel-subscription` | AUTH |
| POST | `/logout` | clears cookies, deletes refresh token |
| DELETE | `/delete-account` | AUTH — cascades personal data |

### 3.2 Companion chat — `/api/chat` (OPT, CSRF-exempt, **JSON bodies only** — 415 otherwise)
**Model routing — the USER chooses** (owner decisions of 2026-10-08, superseding the 2026-10-02
"server route for everyone"; `services/companionModel.js` `resolveCompanionRoute`,
`services/companionAccess.js`). Exactly two routes, chosen in Settings → AI Companion
Intelligence Model (§3.3a):
1. **`rig`** — the owner's GPU rig: `COMPANION_API_BASE_URL` (any OpenAI-compatible endpoint; the
   owner's Ollama `gemma2:27b`), `COMPANION_MODEL`, optional `COMPANION_FALLBACK_MODEL` /
   `COMPANION_API_KEY`. **Reachable only with an owner-issued access key**: the user's saved key
   must be in `COMPANION_RIG_ACCESS_KEYS`, compared in constant time on save **and on every
   request**, so removing a key from the env revokes everyone using it at once. **In production
   the rig is reached through a Cloudflare Tunnel** (2026-10-09): Render → `https://rig.<domain>/v1`
   → Cloudflare Access (service token, policy action Service Auth) → `cloudflared` on the rig →
   `http://localhost:11434`. The backend adds `CF-Access-Client-Id` / `CF-Access-Client-Secret`
   to every rig request and to the status probe when `COMPANION_CF_ACCESS_CLIENT_ID` / `_SECRET`
   are set. Two separate locks: the rig access key decides which **users** may use the rig; the
   service token decides which **callers** may reach Ollama at all. Runbook: KNOWN_ISSUES deploy
   item 9.

   **The rig runs one generation at a time** (2026-10-09, `services/rigQueue.js`, inside
   `requestCompletion`; `tests/rigQueue.test.ts`). One home GPU and a 27B model cannot take two at
   once, so every rig request — chat (JSON and SSE) and the background memory summary — takes a
   single process-wide slot, first come first served:
   - The slot is held until the reply body is **fully consumed** (read to the end, cancelled, or
     failed), not merely until headers arrive. `streamParser.js` cancels the rest of the body when
     it stops at `[DONE]`, which is what frees the slot for streams. The 60 s time-to-first-byte
     budget starts once the slot is held, so waiting in line never counts against it.
   - **A user who leaves is dropped.** The controller ties an AbortSignal to the response's
     `close` (fired with `!res.writableEnded`). Leaving while waiting removes the request from the
     line before any fetch; leaving mid-reply aborts the upstream request, so Ollama stops
     generating and the next request starts at once. An aborted request never tries the fallback
     model, and the controller sends nothing.
   - **Caps:** at most 150 s in line (`RIG_MAX_WAIT_MS`), then the honest "can't reach" reply; at
     most 300 s holding the slot (`RIG_MAX_HOLD_MS`), then the upstream request is cut off and the
     slot freed — a hung rig cannot block everyone.
   - **Not queued:** OpenRouter (BYOK) requests run in parallel immediately, and the Settings
     status probe (`GET /models`, no GPU work).
   - **In-process:** correct while the API runs as **one** instance (Render today). Scaling out
     would give each instance its own slot; the fix then is a shared lock (e.g. a PostgreSQL
     advisory lock) or `OLLAMA_NUM_PARALLEL=1` on the rig as a backstop.
2. **`openrouter`** — the user's own OpenRouter key, on a **three-tier free ladder** (owner
   ruling 2026-10-24; `BYOK_MODELS` in `services/companionModel.js`):

   | Tier | Model | Why |
   |---|---|---|
   | 1 | `google/gemma-4-31b-it:free` | dense 31B; the strongest free Gemma |
   | 2 | `google/gemma-4-26b-a4b-it:free` | MoE, 3.8B active: fast |
   | 3 | `nvidia/nemotron-3.5-lightning:free` | a different family and upstream; MoE, 3B active |

   - **Fall-through:** any failure before the reply starts moves to the next tier at once: an
     error status (429 rate-limited and 503 busy are the free tier's usual ones; 404 a delisted
     model or a provider without the model), a network error, or no response headers within
     **20 s** (`BYOK_TIMEOUT_MS`). A `Retry-After` is not waited out. The user leaving stops the
     ladder (no further tier is tried). All three failing ⇒ the honest "can't reach" reply.
     Once a tier has started answering, its stream is the reply; there is no mid-stream switch.
   - **Why these three:** on 2026-10-24 OpenRouter no longer listed `google/gemma-2-9b-it:free`,
     `meta-llama/llama-3.1-8b-instruct:free` (the old ladder: every BYOK chat had been failing
     over to the offline reply) or `qwen/qwen-2.5-7b-instruct:free`. Live check that day with a
     free key: both Gemma 4 tiers answered 429 "temporarily rate-limited upstream" (they share an
     upstream, so they fail together); `nvidia/nemotron-3-super-120b-a12b:free`, the first pick for
     tier 3, answered 404; `nvidia/nemotron-3.5-lightning:free` answered in 1.2 s (2.1 s to first
     byte through the whole ladder, streamed), with 0 reasoning tokens.
   - **Swapping models without a deploy:** `COMPANION_BYOK_MODELS` (comma-separated OpenRouter ids)
     replaces the ladder; junk entries are ignored, an empty value keeps the default.
     `openrouter/free` (OpenRouter's random free-model router) answered too, in 5.4 s; it can be
     added as a last tier this way, at the cost of an unpredictable model.
   - **Sampling** (`BYOK_SAMPLING`, applied by `turnLogic.samplingFor(…, { route: 'byok' })` on
     every tier, outside crisis): temperature **0.65**, `top_p` **0.85**, `frequency_penalty`
     **0.3** (against the stock "It sounds like…" / "I hear you" openers), `max_tokens` **350**
     (+120 with the hidden reflection). Crisis keeps 0.3 / 550 on every route; the rig's body is
     unchanged (no `top_p`, no penalty). Providers that don't support a parameter ignore it
     (OpenRouter's default): none of the three Gemma/Nemotron endpoints lists
     `frequency_penalty` today.
   - **Reasoning off:** every OpenRouter request carries `reasoning: { enabled: false }`
     (`BYOK_REQUEST_EXTRAS`), since the free models are reasoning-capable and hidden reasoning
     would spend the 350 tokens before the reply. Verified: `reasoning_tokens: 0`.
   - **Reply polish** (`services/replyPolish.js`, every route, after the hidden tags): drops
     chat-template tokens (a leading role header; an end-of-turn or new-turn token ends the
     reply), `<think>` blocks, the folded-instruction marker lines, markdown markers (line-start
     bullets, numbers, headings; `**`, `__`) and a stock opener at the very start ("Certainly!",
     "Of course!", "As an AI language model,"). It removes markers, never the companion's words
     (a sentence about being an AI stays). Streaming-safe at any chunk size
     (`tests/replyPolish.test.ts`); applied in `createVisibleReply` (live chat's stream, the
     sandbox, the eval harness) and on the JSON path.

Neither usable ⇒ honest offline replies that point the user to Settings. **Users with no key get
no model** (owner decision Q1, 2026-10-08) — the rig is no longer a free default. A user who never
chose but saved an OpenRouter key earlier still resolves to OpenRouter. If the provider migration
hasn't run, access falls back to the pre-choice behaviour. Conversation memory routes the same way.
`OPENROUTER_API_KEY` does not route chat or memory (the psychologist handoff summary still reads
it). A key in the request body is ignored. Gemma models get the system prompt folded into the
first user turn; roles are normalised to alternate.

Request additions: `timeZone` (IANA; the companion's "late night" comes from it, not the server
clock) and `userProfile.detectedEmotion.mood`. Every response path (JSON, SSE first + final
`meta` event, offline, error) carries: `riskLevel` (`none`/`elevated`/`acute`), `isCrisis`,
`helplines` (country-aware, when risk ≠ none), `suggestHumanSupport`, `escalationCategory`,
`escalationReason`, `suggestedAction` (`breathing`/`grounding`/`meditation`/`journal`/
`talk_to_someone` or null). The model's hidden `<risk/>`/`<suggest/>` tags are stripped from the
stream (`services/replyTags.js`); its risk reading can raise, never lower, the keyword tier, and a
model-only "acute" is capped at "elevated" (`combineRisk` in `utils/crisisSignals.js`).

**Companion overhaul switches (2026-10-22, `docs/COMPANION_CHAT_PLAN.md`; `companion-chat/companionFlags.js`;
all default to today's behaviour; a change needs a restart):**
- `COMPANION_SAFETY_LADDER=v2` turns on the calibrated ladder (`utils/crisisLadder.js`). The client
  contract is unchanged (`riskLevel` stays `none`/`elevated`/`acute`). The meta adds `safetyCheck:
  { reason } | null`, where reason is `ask`, `venting-likely`, `third-party` or `resolved`; the
  client ignores it. A `check` writes no `safety_alerts` row and owes no helplines.
- `COMPANION_PROMPT=v2` turns on the progressive conversator (`companionPromptV2.js`).
- `COMPANION_REFLECTION=rig|all` turns on the hidden reflection, which needs prompt v2. The note
  `<reflect>…</reflect>` is removed in `replyTags.js` and never reaches the client, the voice, a log
  or the database. The final `meta` then carries `stage` (one of `attune`, `inquire`, `reframe`,
  `catalyse`, `consolidate`, `light`, `repair`, `boundary`, `safety`).
- `COMPANION_EXEMPLARS=on` (2026-10-23, Phase 4) adds at most two few-shot examples
  (`companion-chat/exemplars.js`, bank in `exemplars/*.json`) to prompt v2, chosen from cues in the
  latest message. None in safety mode or on any ladder check. It needs prompt v2 and has no effect
  on the client contract.
- Request addition: `messages[].stage` on the companion's replies, the stage the client echoes
  back (D10). Only known stages are read; it is advisory and never read for safety.
- **State on the dev backend (:3001) since 2026-10-23:** ladder v2 and prompt v2 on, examples on
  (since 05:00 IST); reflection off. Production (Render) is unchanged until the owner sets the
  variables.

Independent of the switches, the uploaded-documents block in the prompt is capped (about 1,200
tokens, newest first) and framed as reference, never instructions (`documents/documentsContext.js`).

| Method | Path | Notes |
|---|---|---|
| POST | `/` | buffered JSON reply |
| POST | `/stream` | SSE stream (`services/streamParser.js`) |
| POST | `/summarize` | journal auto-draft / conversation summary |

### 3.3 Personal data
| Mount | Method · Path |
|---|---|
| `/api/habits` | GET `/` · POST `/` · PATCH `/:id/increment` · PATCH `/:id` · DELETE `/:id` |
| `/api/journal` | GET `/` · POST `/` · DELETE `/:id` · GET `/settings` · POST `/verify-password` · POST `/set-password` (independent journal lock) |
| `/api/documents` | POST `/upload` (multer, 10 MB, pdf/txt/md/csv/json; PDF text via `pdf-parse`) · GET `/` · DELETE `/:id` |
| `/api/vitals` | AUTH: GET `/` (own rows only) · POST `/` (zod) · GET `/latest` (own stream) · GET `/devices` · POST `/devices` `{label?}` → `201 { device, deviceKey }` (**the key is returned once**; ≤ 5 active per user) · POST `/devices/:id/revoke`. DEVICE: **POST `/hardware`** — `X-Device-Key` required (401 otherwise), CSRF-exempt, stored under the key's owner and streamed to the owner only |
| `/api/feedback` | GET `/` · POST `/` |
| `/api/mood` *(2026-10-02)* | POST `/` `{ mood: 1–5, tags?: enum[], note?: ≤280, source?, world?, localDate: YYYY-MM-DD (±1 day) }` → `201 { checkin, isCrisis, riskLevel }` (the note is crisis-scanned; a hit is still saved and raises a `safety_alerts` row) · GET `/?days=1–90` (default 7) → `{ checkins }`. **Append-only: no PATCH/PUT/DELETE** |

### 3.3a Account — `/api/account` (AUTH, CSRF-protected)
| Method | Path | Notes |
|---|---|---|
| GET | `/openrouter-key` | `{ hasKey, last4, updatedAt, serverKeyConfigured, companionServerConfigured, companionConnected, storageAvailable }` — never the key. `companionServerConfigured`: the rig endpoint exists; `companionConnected` (2026-10-08): chat has a usable route for this user |
| PUT | `/openrouter-key` | `{ apiKey }` (20–256 printable chars) → encrypted with AES-256-GCM (`utils/secretBox.js`), **also sets the provider to `openrouter`**, same status body; 503 when `USER_KEY_ENCRYPTION_SECRET` is unset |
| DELETE | `/openrouter-key` | clears it, and the provider if it was `openrouter` |
| GET | `/companion` *(2026-10-08)* | `{ provider, effectiveProvider, openRouter: { hasKey, last4, updatedAt }, rig: { hasKey, last4, updatedAt, valid, available }, storageAvailable }` — never a key. `effectiveProvider` is what chat will use now (`null` = offline); `rig.valid` is false when the owner has revoked the saved key; `rig.available` = the rig is configured on this server |
| PUT | `/companion/provider` | `{ provider: 'rig' \| 'openrouter' \| null }` → same body; 400 otherwise |
| PUT | `/companion/rig-key` | `{ accessKey }` → checked against `COMPANION_RIG_ACCESS_KEYS` (400 "That access key isn't recognised."), stored encrypted (`v1:` envelope, AAD `rig:user:<id>`), **sets the provider to `rig`**; 503 when key storage or the rig isn't configured |
| DELETE | `/companion/rig-key` | clears it, and the provider if it was `rig` |
| GET | `/companion/rig-status` | `{ configured, online, checkedAt }` — a 3 s probe of the rig's `/models`, cached 30 s (`services/rigStatus.js`) |

### 3.4 Admin — `/api/admin` (admin only)
| Area | Routes |
|---|---|
| Overview | GET `/stats`, `/token-usage`, `/cost-alerts` · GET `/uptime` **(2026-10-21: measured telemetry, `features/admin/systemTelemetry.js`)** → `{ checked_at, uptime_seconds, started_at, process{node_version, platform, arch, pid}, memory{rss_mb, heap_used_mb, heap_total_mb, heap_limit_mb, external_mb}, database{status: ok·slow·down, ping_ms, error, total_connections, idle_connections, waiting_requests, max_connections}, websockets{vitals_ws, therapy_ws, total, therapy_rooms, vitals_ready, therapy_ready}, email{configured, provider: brevo, transport, last_delivery{at, ok, status, error, test? (a delivered admin sandbox test, 2026-10-22)}·null}, auth{jwt_secret: set·weak, google_sign_in, super_admin_email, active_refresh_sessions} }` — a `SELECT 1` on the pool (never `queryDb`, which can run migrations) capped at 3 s; unmeasured figures are `null`; `afkUsers` is gone |
| Users | GET `/users` (`?filter=` adds `unverified`, 2026-10-21) · GET `/users/:id` (2026-10-21: + `role`, `subscription_plan`, `plan_expires_at`, `plan_updated_at`, `therapy{total, open, recent[5]}`, `psychologist`) · PUT `/users/:id` · PATCH `/users/:id/ban` (toggles; **body `{ banned: true|false }` sets that state, 409 if already so** — 2026-10-21), `/users/:id/admin-role`, `/users/:id/role`, `/users/:id/plan` · **PATCH `/users/:id/verify`** (2026-10-21: sets `is_verified`; 404 missing, 409 already verified; logged with the admin) · POST `/users/:id/cancel-subscription` (→ Basic, clears the end date, stamps `plan_updated_at`; 2026-10-21: 404 missing, 409 already Basic, returns the new plan fields) · DELETE `/users/:id` |
| Safety | GET `/safety-alerts` · PATCH `/safety-alerts/:id` |
| Feedback & appeals | GET `/feedback` · DELETE `/feedback/:id` · GET `/appeals` (`?status=pending·approved·rejected`, default every status; always returns `counts` — 2026-10-21) · PATCH `/appeals/:id` |
| Community | GET `/community-reports` (`?status=` validated; 2026-10-21: + `author_id`, `author_username`, `author_email`, `author_is_banned`, `author_role`, `comment_anon_handle` — the comment's author for a comment report, else the post's) · PATCH `/community-reports/:id` |
| Psychologists | GET `/psychologists` (2026-10-21: + `active_sessions`, own and escalated-to) · PATCH `/psychologists/:id/verification` (`level` = junior·experienced·senior·specialist; a tier change keeps the first `verified_at`) |
| **Clinical oversight (2026-10-21)** | `features/admin/oversight.controller.js`, zod `adminControlSchemas`. GET `/escalations?view=pending·accepted·closed·all` (default pending; closed = resolved·dismissed·rejected) → `{ escalations, counts{pending, accepted, closed} }` with requester, assignee, closer, session status · **PATCH `/escalations/:id`** `{ action: 'assign', psychologistId }` (verified, at or above `target_level`, not the requester → escalation `accepted`, session `escalated_to_psychologist_id` + `active`, system line, room broadcast; 409 on an ended session) · `{ action: 'resolve', notes ≤ 2000 }` (pending or accepted) · `{ action: 'dismiss', notes }` (pending only; 409 if a practitioner has it) — both set `resolution_notes`, `resolved_at`, `resolved_by`, and a still-pending case returns an `escalated` session to `active` with a system line · GET `/psychologist-sessions?status=&search=` (server-side; 100 newest + `hasMore`; + practitioner title/credentials, escalated-to, `message_count`, `open_escalations`) · **GET `/psychologist-sessions/:id/messages`** (UUID; the latest 500, oldest first, `sender_name`, `total`, `truncated`; every read logged with the admin's id) · **PATCH `/psychologist-sessions/:id`** `{ action: 'complete' · 'cancel' }` (open sessions only, else 409; `ended_at`, system line, broadcast) |
| **Tools & Sandbox (2026-10-21 → 22, complete: Phases 0–8)** | `features/admin-sandbox/` (`docs/ADMIN_SANDBOX_PLAN.md`), mounted inside this router (`router.use('/sandbox', …)`, after requireAuth + requireAdmin). Every path first passes `requireSandboxEnabled`: with `ADMIN_SANDBOX=off` it answers **404 `{ error, sandbox: 'off' }`** (a plain 404 means an API from before the sandbox). **GET `/sandbox/status`** → `{ sandbox: true, enabled, checkedAt, you{superadmin}, model{provider: rig·openrouter·null, rig{online, checkedAt}·null, error}, email{configured, provider, lastDelivery{at, ok, status, error}·null}, sandboxDatabase{state: not-configured·refused·set·connecting·ready·unreachable·failed, host, database, reason, checkedAt, migrations{applied, latest, ranNow}·null} }` (from Phase 7 the sandbox pool's own state: `set` until something connects). The model block is the caller's own route, and the rig is probed only when that route is the rig (cached 30 s). The status never holds a key, DSN, user name or password. It writes nothing. **Vitals (Phase 1):** **POST `/sandbox/vitals/frame`** `{ heartRate 40–180, hrv 10–120, spo2 85–100, stressLevel 0–100 (clamped), leadsOff: boolean, ecgRaw: ≤ 200 numbers (rounded, 0–1023), seq?: whole number }` → `broadcastVitals(caller)` with `{ deviceId: 'maitri-sandbox', …readings (zeros when leadsOff, the sensor's rule), ecgRaw, source: 'simulated', seq? }` and nothing else, so no flag lingers in the cached snapshot. Writes nothing; never calls the persisting ingest route. **400** malformed · **409** while a real sensor streams to the account (online and not simulated) · 200 `{ sandbox: true, ok, seq }`. **POST `/sandbox/vitals/stop`** → `clearSimulatedStream(caller)`: the cached snapshot back to offline and the ECG buffer emptied if it was simulated; a sensor's stream is never touched → `{ sandbox: true, ok, cleared }`. Start and stop are logged with the admin's id; frames are not. **Safety (Phase 2)** — both under `sandboxSafetyLimiter` (30/min), writing nothing, never reaching live chat's alert write: **POST `/sandbox/crisis/scan`** `{ messages?: (string | { role: user·assistant·ai·companion, content } | { sender, text })[] ≤ 50, each 1–5000 chars; priorLevel?: none·elevated·acute; simulatedModelRisk?: none·elevated·acute; reply?: ≤ 8000 chars; country? | iso? (2–3 letters, not both) }`, messages or a reply required → `{ sandbox: true, messages[{ index, sender, inWindow, scanned, (the person's:) level, matches, hits[{ label, tier, matched, negated, negation, counted }], escalation{ shouldEscalate, category, reason } }], conversation{ window: 10, windowStart, level, latestLevel, latestSender, priorLevel, priorLevelFromMessages, priorLevelGiven, matches, crisisMode, escalation, model{ given, combined, capped }·null, final }·null, helplines{ query{ by, value }, resolvedBy: default·match·unknown, code, region, emergency, lines }, reply{ mentionsHelpline, found[] }·null }`; **400** with the reason; the log holds the admin, the action and counts only. **GET `/sandbox/crisis/helplines?country=…` or `?iso=…`** → `{ sandbox: true, query, resolvedBy, code, region, emergency, lines, countries[{ code, region, aliases, emergency, lines }] }`; **400** for both or a bad code. The comparison with the client's fallback list is done in the client. **Companion (Phase 3)** — `sandboxCompanionLimiter` (12/min) on the turn, the global 60 on the plan; one turn at a time per admin (**409**); nothing written (no `safety_alerts`, `token_usage`, memory or camera history): **POST `/sandbox/companion/plan`** and **POST `/sandbox/companion/turn`** take `{ messages: (string | { role, content } | { sender, text })[] 1–50, the last the person's; mode?: auto·steady·supportive·crisis; world?: forest·space·zen·medical·focus·custom; time?: { zone } | { hour 0–23 }; checkinMood?: 1–5; cameraMood?: sad·anxious·intense·displeased·happy·surprised·calm; memorySummary? ≤ 1000; extraContext?: ≤ 12 lines of ≤ 300; name? ≤ 60; bio? ≤ 200; suggestHuman?: auto·on·off; country? ≤ 80; temperature?: 0–1.5; maxTokens?: 16–1024; context?: synthetic·real }` (**400** with the reason). The plan answers `{ sandbox: true, plan{ risk, escalation, suggestHuman{ auto, used, forced }, helplines, camera, checkinMood, mode{ auto, used, forced }, world, time, context{ source, lines, limit, dropped, documents }, history, sampling{ live, used }, webSearch{ wouldSearch, performed: false }, systemPrompt, promptChars }, route{ kind: rig·openrouter, models }·null, accessError }` with no model call. The turn streams chat's framing — `data: {"meta"}` first and last, `data: {"chunk"}`, `data: [DONE]` — plus `data: {"sandbox": { phase: 'plan', plan, route, accessError }}` first, `data: {"raw"}` per model chunk (before the tag filter), and `data: {"sandbox": { phase: 'end', outcome: ok·no-route·unreachable·error, model, attempts, usedFallback, settle{ modelRisk, modelRiskTag, finalRisk, raised, firstCrisisTurn, mentionedHelpline, owesHelplines, suggestedAction }, tags, timings{ contextMs, queueWaitMs, timeToHeadersMs, ttftMs, firstTextMs, generationMs, totalMs, chunks, rawChars, estTokens, tokensPerSecond } }}` before `[DONE]`; it uses the caller's own route through the real rig queue and stops when the caller leaves. *(Companion overhaul, 2026-10-22:)* both also take `safetyLadder?: live·v1·v2`, `promptVersion?: live·v1·v2`, `reflection?: live·on·off` and (2026-10-23) `exemplars?: live·on·off`, and a companion message may carry its `stage`. The plan adds `flags{ ladder, prompt, reflection, exemplars: { used, live, options } }`, `v2{ stage, loop, exemplars[{ id, pattern, score }] }·null`, `safetyCheck` and the ladder's fields in `risk` (`ladder, serverLevel, reason, latestServerLevel, answer, afterCheck, mustCheck, checkAsked`). The end frame adds `style` (replyStyle.js), `safetyCheck`, `helplineInReply`, `reflection` (the note's keys: admins only), `reflectionStatus: ok·missing·unclosed·overlong·untagged·off`, `reflectionLeak`, `stage`, and (2026-10-23) `exemplarIds` and `exemplarCopy` (eight words in a row from a shown example). **POST `/sandbox/crisis/scan`** takes `ladder?: v1·v2` (default: the server's `COMPANION_SAFETY_LADDER`), and `check` as a level on v2. On v2 every message adds `ladderLevel, reason, answer, afterCheck, mustCheck` and hits with `class, frame, countedLadder`; a companion message adds `safetyCheck`; the conversation adds `ladderLevel, reason, latestLadderLevel, answer, afterCheck, checkAsked, mustCheck, finalLadder, mode`. **E-mail (Phase 5)** — the global limiter plus its own quota; writes nothing (no `otp_codes` row): **GET `/sandbox/email/test`** → `{ sandbox: true, superadmin, configured, quota{ limit: 5, used, remaining, resetAt·null } }`, using none. **POST `/sandbox/email/test`** `{ to: one address, deliver?: boolean }` sends the real sign-in template (`services/otpEmail.js`, shared with `sendOtpEmail`) with a code `TEST-nnnnnn` that is stored nowhere, through Brevo in **sandbox mode** (`"headers": { "X-Sib-Sandbox": "drop" }` inside the JSON body: validated, answered with a message id, sent nowhere) unless `deliver` is exactly `true` → `{ sandbox: true, configured, ok, mode: sandbox·deliver, status (Brevo's HTTP status)·null, messageId·null, error·null, durationMs·null, code, quota }`. **403** for any admin but the superadmin (`req.user.role === 'superadmin'`, i.e. `ADMIN_EMAIL`) · **400** a bad `to` or a non-boolean `deliver` · **503** no Brevo key (quota untouched) · **429** after 5 in a sliding hour per superadmin (in memory, per process), with `quota`. A Brevo refusal is a 200 with `ok: false` and counts. Only a delivered test changes `email.last_delivery`, marked `test: true`; the uptime page says "(an admin test send)". **Sessions (Phase 7)** — every one reads and writes the **sandbox database only** (`SANDBOX_DATABASE_URL`, `sandboxDb.js`), never `DATABASE_URL`. It connects on first use; before migrating it refuses a database with any account outside `@sandbox.maitri.invalid` (or one that isn't empty and has no users table), runs production's migrations programmatically, checks again, and checks again inside every write's transaction. **GET `/sandbox/sessions/setup`** → `{ sandbox: true, database{state, host, database, reason, checkedAt, migrations}, actors{ seeded, client, admin, practitioners[{ userId, email, username, name, role, level, psychologistId, verification, acceptingClients }] }·null, counts{ sessions, messages, pending_escalations }·null }` (200 whatever the state). Every other route answers **503 `{ error: "Sandbox database not configured / refused / unreachable …", sandbox: true, database }`** unless the database is ready, and writes nothing. **POST `/sandbox/sessions/seed`** → `{ sandbox: true, created, actors }`: one client, four practitioners (junior, experienced, senior, specialist; verified; not accepting clients) and a stand-in admin, by upsert (again: `created: 0`); no password can match. **POST `/sandbox/sessions`** `{ state: requested·active·escalated·completed, practitioner?: level (junior), concern? ≤ 1000, handoff?: boolean, escalation?: { targetLevel: experienced·senior·specialist, urgency: normal·urgent·critical, reason 1–1000 } (escalated), rating?: 1–5, feedback? ≤ 500 (completed) }` runs the real handlers in order as the actors — requestSession (client) → acceptSession (practitioner) → requestEscalation → completeSession → rateSession (client) — each after its route's own check, in its own transaction, its room broadcasts sent after the commit; it stops at the first refusal → **201** `{ sandbox: true, ok: true, target, session, steps[{ step, as, status, ok, ms, message, body }] }` or **200** with `ok: false` and the refusing step. **POST `/sandbox/sessions/:id/advance`** `{ step: accept·complete·rate, by?: practitioner·client (complete), rating (rate) }`, **POST `/sandbox/sessions/:id/messages`** `{ as: client·practitioner·system, content 1–2000 }` (the practitioner is the escalated-to one once a case is taken; a system line is inserted as the handlers insert theirs), **POST `/sandbox/sessions/:id/escalate`** `{ targetLevel, urgency, reason }` (as the session's practitioner) and **POST `/sandbox/escalations/:id/accept`** `{ as?: level (specialist) }` → `{ sandbox: true, ok, step, session? }`. **400** with the reason · **404** an id that isn't a UUID (an escalation id that isn't a positive integer) or no such session · **409** before seeding. **POST `/sandbox/sessions/reset`** → `{ sandbox: true, removed{ sessions, messages, escalations, supervision } }`: the synthetic clients' sessions with their messages and escalations; the actors stay and their ratings reset. **The oversight mirror:** **GET `/sandbox/escalations`**, **PATCH `/sandbox/escalations/:id`**, **GET `/sandbox/psychologist-sessions`**, **GET `/sandbox/psychologist-sessions/:id/messages`**, **PATCH `/sandbox/psychologist-sessions/:id`** — the same `oversight.controller.js` and `adminControlSchemas` validators as the live routes (shapes as above), bound to the sandbox database; the stand-in admin acts (it is what `resolved_by` records), and the log has the real admin's id and `sandbox: true`. **GET `/sandbox/psychologists?status=`** → `{ success, sandbox: true, psychologists[] }` in the admin list's shape, for the assign dialog. Room broadcasts go to `/ws/sessions`, keyed by the sandbox session's id. Each action is logged with the admin's id; what a message or a reason says never is |
| **To-do (2026-10-09)** | Global list shared by every admin (`features/admin/todos.controller.js`, zod `adminTodoSchemas`). GET `/todos` → the live tree (archived rows omitted) · POST `/todos` `{ title ≤ 280, parentId? }` → 201 + tree; **one level of subtasks** (400 "Subtasks can't have subtasks of their own.", 404 for a missing/archived parent) · PATCH `/todos/:id` `{ title?, done? }` — completing records `completed_by`/`completed_at` (first completer kept), un-completing clears both · DELETE `/todos/:id` **archives** the task and its subtasks (`archived_at`; nothing is deleted). Every write returns the whole tree; last write wins |
| **Yoga (D14)** | GET `/yoga/overview`, `/yoga/poses`, `/yoga/recordings` · POST `/yoga/poses/:id/archive`, `/yoga/poses/:id/unarchive` (status changes; 409 when already in that state) · POST `/yoga/recordings/:tier/:id/retire` (raw → `deleted = TRUE`; processed `pending_review`/`failed` → `rejected`, approved → 409; published `active` → `rolled_back`) · POST `/yoga/poses/:slug/recordings/retire` (all three tiers for a slug) · **DELETE `/yoga/poses/:id?confirm=permanent`** — the only hard delete: the custom pose and every recording row for its slug, one transaction (400 without the confirmation) |

### 3.5 Yoga — `/api/yoga` (AUTH router-wide; 20 routes)
`AUTHORS` = `requireRole('admin','superadmin','instructor')`.

| # | Method | Path | Guard | Request → Response |
|---|---|---|---|---|
| 1 | GET | `/poses` | AUTH | `[{ asanaId, steps:[{ stepId, recordingStatus, activeVersion }] }]` — only asanas that already have recording rows |
| 2 | GET | `/poses/:asanaId` | AUTH | `{ asanaId, steps:[{ stepId, activeReference\|null }] }` |
| 3 | POST | `/poses` | AUTHORS | create a custom-pose **draft**; server assigns `slug` and step ids; `created_by` from session |
| 4 | PATCH | `/poses/:poseId` | AUTHORS + owner | update a draft; **403 on a published row** |
| 5 | POST | `/poses/:poseId/publish` | AUTHORS + owner | `draft → published` |
| 6 | POST | `/poses/:poseId/archive` | AUTHORS + owner | `published → archived` (status change) |
| 7 | GET | `/custom-catalog` | AUTH | all **published** custom poses — read by every user |
| 8 | GET | `/custom-catalog/mine` | AUTHORS | caller's drafts + published |
| 9 | GET | `/custom-catalog/archived` | admin, superadmin | archived custom poses (added after D12 — `KNOWN_ISSUES` D-1) |
| 10 | POST | `/recordings/raw` | AUTHORS | `{ asanaId, stepId, recording }` → `201 { id, capturedAt }`; gzip accepted |
| 11 | GET | `/recordings/raw?asanaId=&stepId=` | AUTHORS | metadata only, never `frames_data` |
| 12 | GET | `/recordings/raw/:id` | AUTHORS | full Tier 1 row; 404 if soft-deleted |
| 13 | POST | `/recordings/process/:rawId` | AUTHORS | `{ asanaId, stepId, processed }` → `201 { id, status }` — both success (`pending_review`) and failure (`failed`) are recorded |
| 14 | GET | `/recordings/processed?stepId=[&asanaId=]` | AUTHORS | `asanaId` optional (owner ruling M5, 2026-08-29) |
| 15 | GET | `/recordings/processed/:id` | AUTHORS | full Tier 2 row |
| 16 | POST | `/references/publish` | AUTHORS | `{ processedRecordingId, regionWeights, voiceGuidance? }` → `201 { id, version, previousVersionId, status }`; one transaction; 409 on version collision (23505) or non-`pending_review` source. `voiceGuidance` (D15) is validated (`assertPublishVoiceGuidance`) and stored in `recording_metadata.voiceGuidance`; any other body field is ignored |
| 17 | POST | `/references/rollback/:versionId` | AUTHORS | creates a NEW version copying the target; current active → `rolled_back` |
| 18 | GET | `/references/versions/:asanaId/:stepId` | AUTH | version list ASC |
| 19 | GET | `/references/active/all` | AUTH | **bare array** `[{ asanaId, stepId, …PublishedPoseReference }]` — loaded on every yoga entry |
| 20 | GET | `/references/active/:asanaId/:stepId` | AUTH | 404 if none active |

Ordering note: custom reads live under `/custom-catalog`, not `/poses/custom`, because
`GET /poses/:asanaId` would shadow the latter (canon D12.3).

### 3.6 Psychologist ecosystem — `/api/psychologists` (also `/api/psychologist`)
| Area | Routes |
|---|---|
| Directory | GET `/browse`, `/browse/:id` (OPT) |
| Practitioner profile | POST `/register` · GET/PUT `/profile/me` (AUTH) |
| Sessions | POST `/sessions/request` · GET `/sessions/my-sessions` · GET `/sessions/psychologist-sessions` (psychologist) · POST `/sessions/:id/accept` (psychologist) · POST `/sessions/:id/complete` (participant) · POST `/sessions/:id/notes` (psychologist) · POST `/sessions/:id/rate` · GET/POST `/sessions/:id/messages` (participant). Since 2026-10-22 the session and escalation handlers come from factories (`createSessionController`, `createEscalationController`), wired here to `queryDb` and `/ws/sessions`; routes and responses unchanged |
| Escalation & supervision | POST `/escalation/request` · GET `/escalation/queue` · POST `/escalation/:id/accept` · POST `/supervision/request` · GET `/supervision/queue` · POST `/supervision/:id/respond` |
| AI handoff | POST `/handoff/summary` — AI summary of the companion conversation, shared only with user consent (`services/handoffSummarizer.js`) |

### 3.7 Community ("Maitri Circle")
| Mount | Routes |
|---|---|
| `/api/community` | POST `/posts` · GET `/feed` · GET `/feed/circle/:circleId` · GET/DELETE `/posts/:id` · POST `/posts/:id/react` · POST `/posts/:id/comment` · DELETE `/comments/:id` · POST `/reports` · GET `/achievements` |
| `/api/circles` | POST `/` · GET `/` · GET/PUT/DELETE `/:id` · POST `/join` · POST `/:id/invite` · DELETE `/:id/members/:userId` · GET `/:id/leaderboard` |
| `/api/challenges` | POST `/` · GET `/` · GET `/:id` · POST `/:id/join` · POST `/:id/complete` · GET `/:id/leaderboard` |

Posts and comments run through `community.moderation.js` (`classifyContent` — crisis language
returns helpline guidance, 112 / helplines).

### 3.8 Misc
- `GET /api/csrf-token` — sets `maitri_csrf_secret` cookie, returns `{ csrfToken }`.
- `GET /health` — `{ status, database, version, uptime_seconds, memory }`; 503 when the DB is
  down. It does **not** say *which* database you are connected to.

## 4. CSRF

`src/utils/fetchInterceptor.ts` monkey-patches `window.fetch`: for backend URLs it sets
`credentials: 'include'` and, on mutating methods, adds `x-csrf-token` (fetched from
`/api/csrf-token`), retrying once on a CSRF 403. **Client code never sets the header by hand.**
`curl` must call `/api/csrf-token` first. Server-side exemptions and the permissive fallback are
documented in `KNOWN_ISSUES` P1-7.

## 5. WebSockets (same port as HTTP)

Both are `noServer` `WebSocketServer`s behind **one** `upgrade` listener, `utils/wsGateway.js`
(two path-bound servers on one HTTP server 400'd each other's handshakes — KNOWN_ISSUES N-WS).
Every handshake is authenticated by `utils/wsAuth.js` before it is accepted: `Origin` must be on
the CORS allow-list (`config/origins.js`, production only), then the `maitri_token` cookie, or
the `maitri_refresh_token` cookie when the access token has expired; banned / deleted users are
refused; a DB error refuses (503). Unknown paths get 404, unauthenticated upgrades 401.

| Path | Purpose | Scope |
|---|---|---|
| `/ws/vitals` | Live hardware telemetry (`INIT_SNAPSHOT`, `VITALS_UPDATE`, rolling 300-sample ECG buffer at 100 Hz) → `EcgWaveform`, `EnvironmentGauge` | **Per user** — only readings from the user's paired devices (P1-9) |
| `/ws/sessions` | Therapy session rooms: `JOIN_SESSION` → `SESSION_JOINED` or `SESSION_JOIN_DENIED {status}`, `TYPING`; server pushes `NEW_MESSAGE`, `STATUS_CHANGED` | Join runs the REST participant rule (`sessionParticipant.js`): client, psychologist, **the practitioner the case was escalated to (2026-10-21)**, or admin (P1-8). Checked on join only. The admin sandbox's room monitor (2026-10-22) joins a sandbox session's room by id as an admin; the session driver's broadcasts go out through the same functions after each commit. Sandbox ids come from the sandbox database (`gen_random_uuid()`) |

## 6. Database

PostgreSQL (Supabase in production, pooler port 6543). Pool in `backend/database/db.js`
(`max: 5`). **`db.migrate.latest()` runs on every backend boot** — pointing a dev server at the
production `DATABASE_URL` applies pending migrations to production. `queryDb(text, params,
userId?)` wraps a single statement in a transaction with `set_config('app.current_user_id')`
when a `userId` is passed (used by RLS policies on the original user tables). Multi-statement
transactions use their own client (`withTransaction` in `recordings.controller.js`).

### 6.1 Migrations (`backend/database/migrations/`, Knex, append-only)

| File | Creates / changes |
|---|---|
| `20260725020528_init.js` | `users`, `habits`, `journal_entries`, `vitals`, `user_documents`, `refresh_tokens` + RLS policies + indexes. *(Edited after it ran — adds `journal_password`; see KNOWN_ISSUES P1-4.)* |
| `20260804000000_add_admin_and_banned_columns.js` | `users.is_admin`, `users.is_banned` (also UPDATEs `is_verified`, which no migration creates) |
| `20260805000000_add_roles_and_subscriptions.js` | `users.role`, `subscription_plan`, `plan_expires_at`, `plan_updated_at` |
| `20260806000000_add_monitoring_and_safety_tables.js` | `safety_alerts`, `token_usage`, `system_uptime` |
| `20260807000000_add_avatar_to_users.js` | `users.avatar` |
| `20260827000000_yoga_pose_recordings.js` | **Yoga Tier 1/2/3** — see §6.3 |
| `20260828000001_add_conversation_summary.js` | `users.conversation_summary`, `users.last_chat_at` (cross-session companion memory) |
| `20260831_yoga_custom_asanas.js` | `yoga_custom_asanas` (D12) |
| `20260901_add_hardware_vitals.js` | `vitals.device_id/temperature/humidity/leads_off/source` + `ecg_readings` |
| `20260902_community_layer.js` | `circles`, `circle_members`, `community_posts`, `community_reactions`, `community_comments`, `challenges`, `challenge_participants`, `community_reports` |
| `20260902_psychologist_ecosystem.js` | `psychologists`, `psychologist_verification_documents`, `therapy_sessions`, `therapy_messages`, `escalation_requests`, `supervision_requests` |
| `20260902161000_add_journal_password_to_users.js` | `users.journal_password` |
| `20260725020529_add_legacy_auth_feedback_tables.js` *(added 2026-10-02, P1-4)* | `otp_codes`, `pending_registrations`, `feedback`, `ban_appeals`, `users.is_verified` — verbatim from `database/schema.sql`, all `IF NOT EXISTS`. Sorts before `20260804…` so fresh DBs work; a pending no-op on production. **Its `down` drops live tables — never roll it back on production** |
| `20261002000000_add_user_openrouter_key.js` *(P1-5)* | `users.openrouter_key_ciphertext` (`v1:` AES-256-GCM envelope), `openrouter_key_last4`, `openrouter_key_updated_at` |
| `20261002000001_add_hardware_devices.js` *(P1-9)* | `hardware_devices` (`user_id`, `label`, `key_hash` SHA-256 UNIQUE, `key_prefix`, `last_device_id`, `last_seen_at`, `revoked_at`) + `idx_ecg_user` |
| `20261002000002_add_mood_checkins.js` *(dashboard overhaul, owner-approved)* | `mood_checkins` (`user_id` → users ON DELETE CASCADE, `mood` SMALLINT CHECK 1–5, `tags` TEXT[], `note` VARCHAR(280), `source`, `world`, `local_date` DATE, `created_at` TIMESTAMPTZ) + `idx_mood_checkins_user_date` + RLS policy `mood_checkins_isolation`. Append-only by API. Proved on PostgreSQL 17 on 2026-10-03: fresh up (16 files) → down → up |
| `20261008000000_add_companion_provider.js` *(refinement Phase 4a, owner-approved)* | `users.companion_provider` VARCHAR(16) + CHECK `users_companion_provider_check` (NULL, `'rig'`, `'openrouter'`), `rig_key_ciphertext` (`v1:` envelope), `rig_key_last4`, `rig_key_updated_at`. Additive and nullable. Proved on a scratch PostgreSQL 2026-10-08 (up → down → up, CHECK rejects bad values, re-run harmless). **Applied to production by accident on 2026-10-08** and kept by owner decision (KNOWN_ISSUES) |
| `20261009000000_add_admin_todos.js` *(refinement Phase 5, owner-approved)* | `admin_todos` (`id` SERIAL, `parent_id` → admin_todos ON DELETE CASCADE, `title` VARCHAR(280) CHECK non-blank, `done`, `position`, `created_by`/`completed_by` → users ON DELETE SET NULL, `completed_at`, `archived_at`, `created_at`/`updated_at` TIMESTAMPTZ) + partial index `admin_todos_live_idx` (live rows). Seeds the owner's 6 tasks + 4 subtasks **only when the table is empty**. Proved on a throwaway PostgreSQL 2026-10-09 |
| `20261021000000_add_escalation_resolution.js` *(admin control center, owner brief 2026-10-21)* | `escalation_requests.resolution_notes` TEXT, `resolved_by` → users ON DELETE SET NULL; the status CHECK (any CHECK on `status`, whatever its name) replaced by `pending · accepted · rejected · resolved · dismissed`. Additive; down folds resolved → accepted, dismissed → rejected first. Proved on PostgreSQL 17 2026-10-21 (incl. a renamed legacy check). **Applied to production 2026-10-21 15:54 IST after a backup** (KNOWN_ISSUES deploy item 10) |

All three 2026-10-02 migrations were proved on PostgreSQL 17 the same day: fresh up → down → up,
and the production upgrade path (legacy tables pre-existing with rows → exactly these three run,
nothing lost).

### 6.2 Table inventory (35 application tables)

| Domain | Tables |
|---|---|
| Identity | `users`, `refresh_tokens`, `otp_codes`*, `pending_registrations`*, `ban_appeals`* |
| Personal data | `habits`, `journal_entries`, `user_documents`, `vitals`, `ecg_readings`, `hardware_devices`, `mood_checkins` (2026-10-02) |
| Ops & safety | `safety_alerts`, `token_usage`, `system_uptime`, `feedback`*, `admin_todos` (2026-10-09) |
| Yoga | `yoga_raw_recordings`, `yoga_processed_recordings`, `yoga_published_references`, `yoga_custom_asanas` |
| Community | `circles`, `circle_members`, `community_posts`, `community_reactions`, `community_comments`, `community_reports`, `challenges`, `challenge_participants` |
| Psychologists | `psychologists`, `psychologist_verification_documents`, `therapy_sessions`, `therapy_messages`, `escalation_requests`, `supervision_requests` |

\* created out-of-band in production; a migration exists since 2026-10-02 (`20260725020529`, P1-4).

### 6.3 Yoga persistence — the three recording tiers (canon §9, Phase 7)

```
Tier 1  yoga_raw_recordings        every frame (~0.5–2 MB)   never deleted, never modified
   ↓ KeyFrameProcessor runs CLIENT-SIDE (D2); the server validates structure only
Tier 2  yoga_processed_recordings  key frame + stats          never deleted, never modified
   ↓ instructor previews, then approves
Tier 3  yoga_published_references  what practice reads        versioned, append-only
```

**Tier 1 — `yoga_raw_recordings` (10 cols):** `id UUID PK`, `asana_id VARCHAR(100)`,
`step_id VARCHAR(100)` (free text — no FK to any catalog), `frames_data JSONB` (raw image-space
`[0,1]` landmarks — **x mirrored since `33a5355`**, see KNOWN_ISSUES P0-3), `duration_ms`,
`frame_count`, `average_fps REAL` (float4, lossy), `metadata JSONB`, `captured_at` (server
`NOW()`; client `capturedAt` is validated then discarded), `deleted BOOLEAN` (soft delete; reads
filter `deleted = FALSE`).

**Tier 2 — `yoga_processed_recordings` (18 cols):** `raw_recording_id → Tier 1`, `asana_id`,
`step_id`, `key_frame JSONB` (**hip-centred, torso-scaled**), `landmark_statistics JSONB`,
`transition_frames`, `transition_duration_ms`, `hold_frames JSONB` (**raw image space** — a
different space from `key_frame`), `hold_duration_ms`, `hold_frame_count`,
`stability_score REAL`, `health_score JSONB`, `outlier_frames_removed`, `processing_error`,
`processing_config JSONB` (includes `expectedHoldDurationSec` since the B4 fix),
`processed_at`, `status ∈ {pending_review, approved, rejected, failed}` — `rejected` is
unreachable by design (D10: rejection is client-side only).

**Tier 3 — `yoga_published_references` (15 cols):** `processed_recording_id`,
`raw_recording_id`, `asana_id`, `step_id`, `key_frame`, `landmark_variance JSONB`,
`transition_frames`, `region_weights JSONB`, `version INT`, `previous_version_id` (self-FK),
`approved_by VARCHAR(100)` (**from the session, never the body** — D6), `approved_at`,
`recording_metadata JSONB`, `status ∈ {active, superseded, rolled_back}`.
`UNIQUE(asana_id, step_id, version)` is what actually serialises concurrent publishes. Partial
index `idx_published_active … WHERE status = 'active'`.

**Units contract (the B1 rule — `COMMENT ON COLUMN` in the migration):**
`landmark_variance` holds **σ (standard deviation), torso-normalised**, copied verbatim from
`landmark_statistics[].stdDev`. **Never square it; never recompute it from `hold_frames`.**
`RecordedPoseValidator` squares it itself. Because Tier 3 is append-only, a units mistake here
is permanent.

**Field provenance on publish:** every Tier 3 column is derived server-side from Tier 2 / Tier 1
inside one transaction (lock Tier 2 row `FOR UPDATE` → find the version tail `FOR UPDATE` →
supersede the previous active → insert `version = max + 1` → mark Tier 2 `approved`). The only
instructor-authored input is `regionWeights` (all 9 regions × 5 levels). `recordingVersion` in
`recording_metadata` is overwritten server-side (the client always sends `0`). Rollback inserts
a copy of the target as a new version whose `previous_version_id` points at the **chronological**
predecessor, and marks the current active row `rolled_back`.

**`yoga_custom_asanas` (D12):** `slug VARCHAR(100) UNIQUE` (becomes `YogaAsana.id` and the
`asana_id` of every recording; may never collide with a native id — enforced server-side against
`RESERVED_SLUGS` and again client-side at merge), `name`, `sanskrit_name`, `difficulty`,
`pose_type ∈ {standing, balance, floor}`, `glyph` (lucide icon name, never an emoji),
`execution_mode ∈ {sequential, loop}`, `cycle_count`, `bilateral`, `preparation`, `benefits`,
`body_areas JSONB`, `common_mistakes JSONB`, `defaults JSONB`, `steps JSONB` (1–12 steps; each
with non-null `regionWeights`, `holdDurationSec` 3–300, voice/breath guidance — **no
`targetAngles`**), `created_by`, `published_by`, timestamps, `status ∈ {draft, published, archived}`.

## 7. Frontend data layer

- **API base:** `src/utils/apiConfig.ts` — `VITE_API_URL` if set; otherwise
  `<page protocol>//<page hostname>:3001` (so a phone on the LAN reaches the dev machine's
  backend); `WS_BASE_URL` is derived from it. The Capacitor build must set `VITE_API_URL` to the
  deployed backend. Every client (stores, pages, `yogaRecordingsApi.ts`, `customPoseApi.ts`)
  goes through `getApiBaseUrl()` — don't hardcode a host.
- **Zustand stores (`src/store/`):** `useUserStore` (auth, profile, role, vitals, habits, journal,
  BLE/hardware device — persisted), `useChatStore` (messages, TTS voice, OpenRouter key —
  persisted), `uiStore` (worlds, custom world colours, background mode — persisted),
  `useMusicStore`, `useDocumentStore`, `useToastStore`, `useSafetyStore` (crisis/SOS state),
  `usePsychologistStore`, `useCommunityStore`, `useWorldStore` (re-export stub),
  `useAdminTodoStore` (2026-10-09; the admin to-do tree with optimistic updates and rollback —
  not persisted; re-syncs on open and window focus). `uiStore` also holds a **non-persisted**
  `previewWorld` (Settings hover preview; `useEffectiveWorld()` = `previewWorld ?? activeWorld`)
  and runs every world change through `document.startViewTransition`.
- **Feature locks:** `src/lib/features.ts` — `FEATURES.companionVoice`, `customWorld`,
  `orbCustomizer` (all `false` since 2026-10-08) and `isWorldLocked()`. Each feature returns with a
  one-line flip; the locked Settings bodies are kept behind the flags.
- **Yoga stores (`src/wellness-engine/yoga/store/`):** `useYogaPracticeStore` (practice state
  machine — **permanently locked**, Rule 14), `useYogaStore` (view mode, persisted
  `completedSessions` + `lastPracticedPoseId`, transient `lastReceipt`), `useCustomPoseStore`
  (`catalogVersion` repaint signal, author drafts — deliberately **not** persisted).
- **Yoga API clients:** `utils/yogaRecordingsApi.ts`, `utils/customPoseApi.ts`. Catalog load:
  `utils/useYogaCatalog.ts` — `Promise.all([custom catalog, active references])` →
  `mergeCustomPoses` **first** → `mergeActiveReferences` **second** (reverse the order and every
  custom pose's reference is silently discarded).

## 8. Environment variables

| Variable | Where read | Purpose |
|---|---|---|
| `DATABASE_URL` | `backend/database/db.js`, `backend/knexfile.js` | Postgres DSN. Quotes/whitespace are stripped. Non-localhost ⇒ SSL |
| `JWT_SECRET` | `backend/src/config/jwt.js` | Required in production (throws if missing); dev fallback exists |
| `OPENROUTER_API_KEY` | `services/handoffSummarizer.js`, account status | Server-side OpenRouter key. **Since 2026-10-02 it no longer routes companion chat or memory** — see `COMPANION_*` |
| `COMPANION_API_BASE_URL` | `services/companionModel.js` | The **rig route**: an OpenAI-compatible base URL — `http://127.0.0.1:11434/v1` locally, the Cloudflare Tunnel hostname `https://rig.<domain>/v1` in production (never Ollama's port exposed directly). Since 2026-10-08 it is used only for users who chose the rig and hold a key in `COMPANION_RIG_ACCESS_KEYS`. Unset ⇒ the rig is unavailable |
| `COMPANION_API_KEY` | same | Bearer key for that endpoint; optional (Ollama ignores it) |
| `COMPANION_MODEL`, `COMPANION_FALLBACK_MODEL` | same | Model ids on that endpoint (default `gemma2:27b`; fallback optional) |
| `COMPANION_TIMEOUT_MS` | same | Time to first byte per model, default 60000 (a cold 27B load is slow). Keep it < 100000 behind Cloudflare, whose proxy answers 524 after 100 s |
| `COMPANION_CF_ACCESS_CLIENT_ID`, `COMPANION_CF_ACCESS_CLIENT_SECRET` *(2026-10-09)* | `services/companionModel.js`, `services/rigStatus.js` | Cloudflare Access service token for the tunnel hostname, sent as `CF-Access-Client-Id` / `CF-Access-Client-Secret`. Both or neither (one alone is ignored). Unset ⇒ no extra headers (a local rig). Tokens expire — renewal means updating both |
| `COMPANION_RIG_ACCESS_KEYS` *(2026-10-08)* | `services/companionModel.js` | Comma-separated access keys the owner issues for the rig route. Checked in constant time when a user saves one and on every chat request — **removing a key revokes it immediately**. Unset ⇒ the rig is unavailable to everyone ("Not set up on this server") |
| `USER_KEY_ENCRYPTION_SECRET` | `utils/secretBox.js` | ≥ 32 random chars (trimmed; shorter counts as unset); encrypts users' own OpenRouter keys and rig access keys. Unset ⇒ keys cannot be saved: the status reports `storageAvailable: false` (Settings shows "Saving keys isn’t enabled on this server yet") and PUT answers 503 "Saving personal API keys is not enabled on this server.", logged; nothing else is affected. Rotating it invalidates every saved key |
| `BREVO_API_KEY`, `EMAIL_FROM` | `services/emailService.js` | Transactional email (OTP, ban notices). Without a key, OTPs are logged to the terminal (dev) |
| `ADMIN_EMAIL` | `middleware/adminAuth.js`, admin controller | Protected super-admin identity (default `yourcompanionmaitri@gmail.com`) |
| `GOOGLE_CLIENT_ID` | `features/auth/googleIdentity.js` | The **only** accepted Google token audience; unset ⇒ Google sign-in answers 503 (P1-6) |
| `FRONTEND_URL` | `config/origins.js` (CORS + WebSocket Origin check) | Production frontend origin |
| `NODE_ENV` | many | `production` tightens CORS, cookies, error output |
| `PORT`, `LOG_LEVEL` | index, logger | — |
| `YOGA_TEST_DATABASE_URL` | `tests/yogaPersistence.test.ts` | **Local** scratch DB for the persistence suite; never `DATABASE_URL` (D7) |
| `ADMIN_SANDBOX` *(2026-10-21)* | `features/admin-sandbox/sandboxConfig.js` | `off` (also `false` · `0` · `no` · `disabled`) turns every `/api/admin/sandbox/*` route into a 404 `{ sandbox: 'off' }`, and the console hides the nav item. Anything else, unset included, leaves the zero-write modules on (owner ruling 9) |
| `SANDBOX_DATABASE_URL` *(2026-10-21)* | same | The session simulator's own Postgres (ruling 1, S2): synthetic sessions never touch `DATABASE_URL`. It is **refused** when it reaches the same database as `DATABASE_URL`, read the way node-postgres reads a DSN: every local name (localhost, 127.x, ::1, a socket) is one server, `host`/`port`/`user` query parameters count, and a matching Supabase project ref (direct host or pooler user) counts. It is also refused when it is not on this machine, unless the next variable allows that. Unset means the Sessions module is off. Read by `sandboxConfig.js` (the DSN check) and `sandboxDb.js` (the pool, from Phase 7: the connect-time check and migrations — next row) |
| `SANDBOX_DATABASE_ALLOW_REMOTE` *(2026-10-21)* | same | `1` (`true` · `yes` · `on`) accepts a remote sandbox database |
| *(Phase 7, 2026-10-22)* | `features/admin-sandbox/sandboxDb.js` | With `SANDBOX_DATABASE_URL` set and accepted, the sandbox pool connects on first use (the Sessions tab), refuses a database with any account outside `@sandbox.maitri.invalid` before migrating it, and runs the migrations programmatically. Use an **empty** local Postgres (for example a podman `postgres:17` on its own port) |
| `VITE_API_URL`, `VITE_GOOGLE_CLIENT_ID` | frontend build | Only `VITE_`-prefixed vars reach the bundle |

The backend loads the **root** `.env` if it exists (`dotenv` with `override: true`), else
`backend/.env`. `backend/knexfile.js` also calls `dotenv.config({ override: true })` — which is
why the knex **CLI** can silently retarget production (see `MAITRI_V2_DEV_WORKFLOW_AND_TESTING.md`).

## 9. Deployment

| Piece | Where | Config |
|---|---|---|
| Frontend SPA | Vercel — `https://maitriv2-0.vercel.app` | `vercel.json` (SPA rewrite) |
| Backend | Render, Singapore, **free plan** (cold starts 30–60 s) | `render.yaml` sets `PORT`, `NODE_ENV=production`, `FRONTEND_URL`; `BREVO_API_KEY`, `GOOGLE_CLIENT_ID`, `USER_KEY_ENCRYPTION_SECRET` declared `sync: false` (values set in the dashboard; `USER_KEY_ENCRYPTION_SECRET` was seen **unset** on 2026-10-23, KNOWN_ISSUES deploy item 1; `GOOGLE_CLIENT_ID` is [UNKNOWN]). `DATABASE_URL`, `JWT_SECRET`, `OPENROUTER_API_KEY` also live in the dashboard |
| Database | Supabase Postgres | migrations auto-apply on backend boot |
| Retired PWA | `public/sw.js` is a kill switch: clears `maitri-*` caches and unregisters itself | keep until no client can still have the old worker |
| Android | Capacitor 8 — `capacitor.config.ts` (`com.maitri.sanctuary`), `android/`, `scripts/build-android.ps1`, `npm run build:mobile` | don't touch unless asked (AI rules §6) |
| Hardware | ESP8266 NodeMCU + AD8232 ECG + DHT11 — `hardware/` (PlatformIO) | posts to `/api/vitals/hardware` every 0.5 s with `X-Device-Key` (`DEVICE_KEY` in `config.h`, from the pairing panel) |
