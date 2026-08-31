# BAI-ULTRA-01 — Complete Functional WebMCP Vertical Slice

**Status:** Approved for implementation
**Date:** 2026-08-27
**Target:** Codex 5.6 Ultra / VS Code / Windows
**Workspace:** repository root

## Mission

Build a standalone, trustworthy portfolio evidence workspace where a human or a browser agent can submit requirements, receive the same deterministic evidence match, inspect the evidence behind the ranking, and create an editable local collaboration brief. The application is one persistent page and has no backend, authentication, database, LLM, remote MCP server, or external write path.

The P0 flow is:

```text
field → requirements → match → evidence recomposition → inspect → brief
```

This design covers only `BAI-ULTRA-01`. Spatial polish, agent evals, production deployment, submission assets, and release certification remain deferred to ULTRA-02/03.

## Locked Architecture

```text
Pure domain
→ application façade/services
→ Zustand semantic state
→ WebMCP + manual UI
```

- The domain layer owns evidence fixtures, validation, normalization, aliases, matching, ranking, reason derivation, and brief derivation. It imports no React, Zustand, DOM, or WebMCP code.
- The application façade is the only orchestration boundary. It calls pure domain functions and applies local reversible state transitions through a state port.
- Zustand stores semantic facts and explicit transitions, not business rules.
- The WebMCP adapter is an experimental transport boundary. It delegates to the same façade used by manual UI controls.
- React renders selectors and invokes façade operations. Components do not mutate fixtures or reproduce matching logic.

The explicit mode model is intentionally small:

```text
field → match → inspect → brief
```

An explicit `returnMode`/bounded mode history preserves the prior field or match state when inspect or brief closes. No state-machine dependency is introduced.

## Module Boundaries

```text
src/
  domain/        typed public fixtures and pure functions
  application/   queries, commands, façade, validation orchestration
  state/         Zustand store, state port, selectors, transitions
  webmcp/        port, browser adapter, tools, results, lifecycle
  components/    persistent shell and interaction surfaces
  styles/        tokens and authored CSS
tests/
  domain/
  application/
  webmcp/
  ui/
docs/
  PUBLIC-EVIDENCE-BOUNDARY.md
```

Files may be split further when a unit gains more than one responsibility, but responsibilities may not be collapsed across these boundaries.

## Public Evidence Model

The evidence graph has three separate concepts:

```text
Project ← EvidenceRecord → Capability
```

Exactly seven projects are included:

```text
bdb
distribution-desk
weekfield
sprintcrm
storyform
native-site-control
presence-os-memory-atlas
```

`weekfield` is the canonical challenge ID and display name. Its public portfolio evidence is transparently identified as `CreatorOps`, with `https://brenychstudio.com/work/creatorops` as the public case URL. They are not represented as two projects.

Each project contains only a public display record: ID, display/public names, product type, maturity, visibility, verification levels, summary, capability IDs, limitations, safe public links, and prohibited claims. Each evidence record contains a safe claim, capability ID, project ID, evidence visibility, verification level, and source label/reference. Private paths, repository internals, prompts, credentials, RPC names, customer data, and security-sensitive implementation details never enter fixtures.

Canonical visibility:

```ts
type PublicVisibility = "public" | "public_summary_only";
```

Canonical verification:

```ts
type VerificationLevel =
  | "verified_remote"
  | "verified_local"
  | "portfolio_public"
  | "owner_verified_private";
```

Evidence visibility is independent of capability strength:

```ts
type EvidenceVisibility =
  | "public_repo"
  | "public_site"
  | "portfolio_case"
  | "owner_verified_private";
```

`owner_verified_private` describes the provenance of a public-safe summary; it does not create a private dataset record. Public/private visibility never changes matching or ranking scores.

The capability taxonomy is seeded only from evidence attached to these seven projects. Unsupported examples such as `webmcp` or `multilingual-web` are excluded unless a project record contains direct verified evidence. P0 aliases include explicit mappings for Electron/desktop app, MCP/Model Context Protocol, AI automation, Supabase, CRM, Gmail communication, operator workflow, WebGL/3D web, XR/WebXR, spatial archive, and interactive interface.

## Deterministic Matching Contract

All matching is pure, deterministic, local, and versioned. It uses no fuzzy search, embeddings, LLM, network request, or probabilistic model.

Match strengths are locked:

```text
exact canonical match = 1.00
recognized alias      = 0.90
explicit related edge = 0.45
missing               = 0.00
```

Related-capability edges are curated, directed, and one hop only. No transitive relation inference is allowed.

Processing order:

1. Validate 1–12 requirements and bound every item to 80 characters.
2. Normalize Unicode, case, whitespace, and punctuation while retaining original text for display.
3. Deduplicate normalized requirements for scoring.
4. Canonically sort the deduplicated normalized set for stable identity.
5. Resolve an exact capability, explicit alias, or explicit one-hop relation.
6. Collect supporting evidence records.
7. Select the strongest evidence-backed match once per project and requirement.
8. Compute coverage as the arithmetic mean of the strongest strength for each unique requirement.
9. Rank projects by score, then exact/alias count, then covered-requirement count, then stable project ID.
10. Build the immutable result.

Multiple evidence records cannot inflate a project score for the same requirement. Evidence count is descriptive only.

`MatchResult.id` is permutation-stable:

```text
normalize → dedupe → canonical sort
→ methodVersion + dataVersion
→ stable deterministic hash
```

The method version begins at `1.0.0`; fixtures carry a separate data version. Evidence confidence is a deterministic summary label, not a probability. Coverage is always labelled `EVIDENCE COVERAGE`.

Negative-fit inputs such as Swift, Metal, native iOS, and CoreML remain missing and produce honestly low coverage without fallback project inflation.

## Application Façade

The façade exposes the operations required by both transports:

- get public profile;
- query capabilities;
- list/query projects;
- get a public-safe project dossier;
- evaluate requirements;
- focus a project;
- create/update a collaboration brief;
- clear a match;
- close inspect/brief;
- reset semantic user state.

`evaluateRequirements` calls the pure matcher, then applies one reversible local state transition containing the result, active mode, provenance, and derived selection state. `focusProject` validates the ID and derives its reason exclusively from the current match and evidence. Without an active match, inspection is allowed but explicitly states that no requirement evaluation is active.

`createCollaborationBrief` validates its own requirements. If they differ from the active match, the façade computes a fresh deterministic match before creating the draft, preventing stale evidence. The draft records its source match ID and exposes later edits as local draft changes. There is no submission, persistence, CRM, email, booking, or network operation.

## Zustand Semantic State

The store contains:

- WebMCP availability and registration state;
- current requirements;
- current `MatchResult`;
- focused project ID;
- active mode and bounded return mode/history;
- collaboration draft;
- the latest real application action/provenance;
- explicit transition actions.

Highlights, why-selected copy, evidence field positions, ranked presentation, and missing markers are derived selectors wherever possible. Reset clears user semantic state but preserves the current WebMCP availability/registration status.

Provenance distinguishes manual and site-tool actions and drives a real ARIA live announcement. The UI never displays simulated reasoning or “AI is thinking” language.

## WebMCP Boundary

The application registers exactly seven tools through `document.modelContext`:

1. `get_profile`
2. `get_capabilities`
3. `list_projects`
4. `get_project`
5. `match_requirements`
6. `focus_project`
7. `create_collaboration_brief`

The first four tools are genuinely read-only. `match_requirements` intentionally performs a reversible local UI write and is therefore locked to:

```ts
annotations: {
  readOnlyHint: false,
  untrustedContentHint: true,
}
```

`focus_project` and `create_collaboration_brief` also use `readOnlyHint: false`; brief results that echo user-authored content use `untrustedContentHint: true`. No tool is exposed cross-origin and no `exposedTo` option is set.

Input schemas use explicit required fields, limits, enums where available, and `additionalProperties: false`. The application repeats all validation at runtime before any state write. Bounds are:

- requirement count: 1–12; each 1–80 characters;
- general query: at most 120 characters;
- capability result limit: 1–40;
- project result limit: 1–7;
- project type: 1–100 characters;
- context: at most 600 characters;
- timeline and budget: at most 120 characters each.

Tool results are compact and JSON-compatible, with the adapter responsible for exactly one transport serialization. Tool-facing summaries target the current WebMCP character budgets; the full editable brief remains in local UI state rather than being echoed in full.

## WebMCP Lifecycle

A single lifecycle owner outside React render churn controls registration. It has one active registration promise and one `AbortController` per document generation.

Lifecycle behavior:

```text
detect document.modelContext
→ start one registration promise
→ register seven tools with one controller
→ mark ready
```

On partial failure, it aborts the controller to unregister already-added tools before reporting a non-fatal registration error. Duplicate starts share the current promise. Teardown aborts once and waits for the registration attempt to settle before any re-registration. Tool execution observes its separate cancellation signal and checks cancellation before committing local state.

An unavailable API marks the integration unavailable without throwing into React; manual mode remains fully functional. `webmcp-types` is pinned as a development dependency and all experimental declarations/calls remain inside the browser adapter.

## Persistent UI

One mounted shell contains:

- a restrained product header and WebMCP readiness indicator;
- the manual requirement composer;
- the DOM-based 2.5D evidence field;
- the evidence coverage and requirement matrix rail;
- a stable-shell project inspect layer;
- the collaboration brief workspace;
- activity/provenance and reset controls.

Project nodes are semantic buttons styled as editorial technical objects, not dashboard cards. Their CSS transform variables come from deterministic derived field positions. Match mode moves leading evidence forward, recedes secondary evidence, and leaves partial/missing requirements visible. The base field never unmounts during inspect or brief modes.

The visual foundation uses authored CSS: warm off-white surfaces, ink typography, thin structural lines, large editorial headings, restrained mono system labels, subtle perspective, and short controlled motion. No portfolio runtime code or private product media is copied. The structural field works at 390, 768, and 1366 pixels; mobile becomes a controlled vertical/depth field without losing functionality.

Keyboard and accessibility foundations include semantic buttons, deterministic DOM focus order, Enter to inspect, Escape to return, visible focus, ARIA labels, a live region for real actions, non-color match states, and a complete reduced-motion path.

## Collaboration Brief

The brief is an in-memory editable draft containing project type, requirements, context, timeline, budget, relevant evidence projects, known gaps, source match ID, and draft provenance. User edits never use HTML injection. `COPY BRIEF` is a user-gesture clipboard operation with a graceful fallback; it is not a network or persistence write. There is no submit/send/booking control.

## Error and Security Model

- Invalid input returns a compact, stable application error and causes no partial mutation.
- Unknown project IDs never change focus.
- Aborted tools never commit late state.
- Registration failure never breaks manual mode.
- React renders all user text as ordinary text; no `innerHTML` or `dangerouslySetInnerHTML` is used.
- Runtime code has no filesystem, shell, Git, database, private API, local-network, credential, secret, analytics, or LLM access.
- Public links are curated fixture values, never user-created URLs.
- All state-changing actions are reversible from visible controls.

## TDD and Verification

Implementation proceeds in the locked order:

1. domain types;
2. seven-project public evidence fixtures;
3. fixture integrity tests;
4. normalization and alias resolution;
5. deterministic matching;
6. ranking and stable result identity;
7. negative-fit tests;
8. application façade;
9. Zustand store and transitions;
10. WebMCP port, adapter, and seven contracts;
11. lifecycle and duplicate-registration protection;
12. manual requirements flow;
13. Match Mode;
14. evidence field recomposition;
15. Project Evidence Inspect;
16. Collaboration Brief;
17. integration/UI tests;
18. all quality and manual gates.

Required automated coverage includes fixture integrity, normalization, alias and related-edge matching, deduplication, permutation-stable IDs, ranking tie-breaks, scenarios A–D, negative fit, façade/store parity, transitions, reset, exact tool set and annotations, schema/runtime validation, lifecycle unavailable/partial-failure/duplicate/abort behavior, UI side effects, persistent field mounting, inspect return, brief derivation/editing/copying, keyboard behavior, and reduced motion.

Final gates are:

```text
npm run typecheck
npm run test
npm run lint
npm run build
git diff --check
git diff --cached --check
```

Manual QA covers scenarios A–D and functional surfaces at 390, 768, and 1366 pixels. Real WebMCP browser validation is attempted only when the API is available; adapter, contract, and manual-mode tests are authoritative for ULTRA-01 when it is unavailable.

## Git and Completion Policy

The repository remains local on `main`, with no remote, push, PR, or deployment. The design document and implementation remain uncommitted until every required gate passes. Then exactly one local commit is created:

```text
feat: build WebMCP evidence workspace vertical slice
```

If a required gate fails or a genuine task STOP condition is reached, no commit is created. Work stops after the complete P0 spine passes; ULTRA-02 is not started.
