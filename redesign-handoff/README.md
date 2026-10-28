# MAITRI 2.0 — Frontend Redesign Handoff Package

This directory is a self-contained, documentation-only handoff package designed to provide full context for an independent frontend redesign of MAITRI 2.0 in a separate repository.

> **Redesign Mandate:**
> - **Desktop-first experience** prioritizing serene editorial wellness, atmospheric immersion, and modular ergonomics.
> - **Distinctive visual identity** — deliberate departure from generic SaaS dashboards.
> - **Strict frontend scope** — preserves all product capabilities, real-time biometrics, computer vision, Web Audio synthesis, and backend API contracts without requiring backend, database, or hardware modifications.

---

## 📚 Document Directory & Purpose

### 1. `DESIGN.md`
- **Purpose:** The canonical "Living Terrarium" Design System specification (86 KB).
- **Why It Matters:** Defines the 6 adaptive world spaces (Ghibli Forest, Space Station, Muji Zen Garden, Medical Sanctuary, Deep Focus, and Custom Domain), two-layer color token architecture (CSS `--theme-*-rgb` variables + TypeScript linear color spaces), typography (`Inter` body + `Outfit` display), glassmorphism layers, and motion accessibility standards.

### 2. `DASHBOARD_V2_SPEC.md`
- **Purpose:** Canonical specification for the core `/app` Dashboard experience (62 KB).
- **Why It Matters:** Explains how the Chat Arena, Multimodal Stage (split tiles & side wings), Engines Status Panel, and QuickDock widgets (`CheckIn`, `Today`, `YourWeek`, `JournalNote`, `Yoga`, `BodySignals`, `AdminTools`) compose into a unified desktop interface.

### 3. `COMPANION_CHAT_PLAN.md`
- **Purpose:** Comprehensive architecture for the multimodal AI companion (193 KB).
- **Why It Matters:** Documents the conversational state machine, progressive prompt structure, client-side safety ladder, emotional attunement, suggestion action buttons, and dual-model routing (Local GPU Ollama vs OpenRouter).

### 4. `MAITRI_V2_API_AND_DATA_REFERENCE.md`
- **Purpose:** Master backend API, WebSocket, and data contract reference (63 KB).
- **Why It Matters:** Details every REST endpoint (`/api/auth`, `/api/chat`, `/api/habits`, `/api/journal`, `/api/vitals`, `/api/psychologists`, `/api/community`), WebSocket stream (`/ws/vitals`, `/ws/sessions`), payload schemas, rate limits, and authentication expectations your new frontend must interface with.

### 5. `MAITRI_V2_CURRENT_STATUS.md`
- **Purpose:** Exhaustive feature verification and implementation status matrix (98 KB).
- **Why It Matters:** Clear breakdown of every working screen, feature, and workflow as verified in the live build. Helps distinguish completed features from experimental prototypes.

### 6. `MAITRI_V2_PROJECT_CONTEXT.md`
- **Purpose:** System architecture and subsystem relationship overview (26 KB).
- **Why It Matters:** Explains the React 19 SPA structure, Vite build setup, 17 Zustand stores, Web Audio synthesizers, MediaPipe computer vision pipelines, and Capacitor mobile wrappers.

### 7. `PRODUCT.md`
- **Purpose:** Core product philosophy, user personas, and positioning (17 KB).
- **Why It Matters:** Sets the boundaries of what MAITRI is (a supportive daily companion) and what it is not (not a clinical medical diagnostic tool). Governs UI tone, language, and the strict rule: "never claim what isn't built".

### 8. `MAITRI_V2_KNOWN_ISSUES.md`
- **Purpose:** Register of known defects, visual quirks, and canon deviations (77 KB).
- **Why It Matters:** Highlights historical layout traps, mobile overflow gotchas, and edge cases so the redesign does not repeat past mistakes.

### 9. `MAITRI_V2_HANDOFF_INDEX.md`
- **Purpose:** Master index and context overview for new engineers and AI sessions (5 KB).
- **Why It Matters:** High-level summary of MAITRI's tech stack, release status, and module relationships.

### 10. `MAITRI_V2_AI_RULES.md`
- **Purpose:** Invariant UI, state, and architectural operating rules (7 KB).
- **Why It Matters:** Key constraints including Medical Sanctuary light-mode rules, zero fake progress/dates, and database protection guardrails.

---

## 🧭 Recommended Reading Order

When starting your new frontend repository, read the files in this sequence:

1. **Start with Product & Identity:**
   - [`PRODUCT.md`](PRODUCT.md) → Understand who the product serves and its design tone.
   - [`DESIGN.md`](DESIGN.md) → Absorb the Living Terrarium aesthetic, color tokens, and world mechanics.

2. **Understand the Core Dashboard & Companion:**
   - [`DASHBOARD_V2_SPEC.md`](DASHBOARD_V2_SPEC.md) → Study the layout relationships between the Chat Arena, Multimodal Stage, and QuickDock.
   - [`COMPANION_CHAT_PLAN.md`](COMPANION_CHAT_PLAN.md) → Learn how the companion communicates, attunes, and escalates.

3. **Map the Backend & Screen Inventory:**
   - [`MAITRI_V2_PROJECT_CONTEXT.md`](MAITRI_V2_PROJECT_CONTEXT.md) → Review the component domains and state systems.
   - [`MAITRI_V2_CURRENT_STATUS.md`](MAITRI_V2_CURRENT_STATUS.md) → Check the verified feature list.
   - [`MAITRI_V2_API_AND_DATA_REFERENCE.md`](MAITRI_V2_API_AND_DATA_REFERENCE.md) → Verify backend routes and WebSocket schemas.

4. **Review Traps & Guardrails Before Coding:**
   - [`MAITRI_V2_AI_RULES.md`](MAITRI_V2_AI_RULES.md) & [`MAITRI_V2_KNOWN_ISSUES.md`](MAITRI_V2_KNOWN_ISSUES.md) → Avoid known pitfalls and edge cases.
