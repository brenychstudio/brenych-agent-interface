# BAI-ULTRA-03A Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finalize the Brenych Studio identity, spatial evidence choreography, and in-place Field → Match → Inspect → Brief continuity without changing accepted domain or WebMCP behavior.

**Architecture:** Add a typed presentation-only tier registry and derive visual node state after matching. Replace the page-flow composition with one persistent `ExperienceStage`: the Evidence Field stays mounted while accessible foreground layers replace one another in the same grid area. Motion values and springs own camera/parallax/proximity presentation state; Zustand remains the only semantic state machine.

**Tech Stack:** React 19, TypeScript 5.9, Zustand 5, Motion 13, CSS, Vitest, Testing Library, Vite.

**Spec:** `docs/superpowers/specs/2026-09-01-bai-ultra-03a-design.md`

## Global Constraints

- Work only in the approved isolated worktree on `fix/bai-ultra-03a`, based on `2405e9d0e9af4f70cab9a10298b925d4c53d2ef6`.
- Keep exactly seven scored projects, four non-scoring showcases, and seven WebMCP tools.
- Do not alter matching strengths, aliases, ranking, coverage, negative fit, `MatchResult`, brief derivation, tool names/annotations, or evidence boundaries.
- Use DOM + Motion only; do not add Three.js, R3F, GSAP, a backend, or network-write behavior.
- Hard-code challenge links as `https://brenychstudio.com` and `https://github.com/brenychstudio/brenych-agent-interface`.
- On 390/430px, Brief uses natural stage/document scrolling; desktop/tablet may use a viewport-bounded internally scrolling document.
- Extended evidence must read as three quiet peripheral signals by default, never as three additional flagship cards.
- Follow strict red-green-refactor. Every production behavior change starts with a focused failing test and an observed expected failure.
- Do not create intermediate commits. After every gate passes, create exactly one commit: `fix: finalize Brenych Studio spatial agent experience`.
- Do not modify `main`, deploy production, tag, record video, or submit.

---

## File map

**Create**

- `src/presentation/projectPresentation.ts` — typed FLAGSHIP/EXTENDED metadata and authored default/match visual slots.
- `src/components/ExperienceStage.tsx` — stable stage composition, inactive-layer semantics, and mode foreground ownership.
- `src/components/StudioContext.tsx` — first-viewport identity, thesis, approved context, and fixed external links.
- `src/styles/experience-stage.css` — single-stage grid/overlap, foreground layers, responsive height and scroll contracts.
- `tests/presentation/projectPresentation.test.ts` — tier completeness, promotion, and frozen matcher/brief/WebMCP output regression.
- `tests/ui/identity-status.test.tsx` — brand/link/status behavior.
- `tests/ui/experience-stage.test.tsx` — persistent same-stage modes, inactive semantics, restoration, and showcase mode behavior.

**Modify**

- `src/app/App.tsx` — compose `ExperienceStage`, save/restore scroll and originating focus, and stop appending Inspect/Brief.
- `src/components/AppShell.tsx` — linked global Brenych Studio identity.
- `src/components/AgentReadyIndicator.tsx` — Manual Mode / Agent Tools Online language.
- `src/components/EvidenceField.tsx` — Motion camera, pointer parallax, bounded drag, proximity state, and mode interactivity.
- `src/components/ProjectNode.tsx` — full-object versus extended-signal rendering and Motion continuity.
- `src/components/ProjectEvidenceInspect.tsx` — in-place layout, manual copy, evidence disclosure, no scrollIntoView.
- `src/components/CollaborationBrief.tsx` — stage document behavior and Continue link.
- `src/components/ShowcaseProofLayer.tsx` — compact approved intro and Match-only subdued state.
- `src/state/selectors.ts` — derive visual form/position from presentation metadata after match output exists.
- `src/styles/shell.css` — identity/composer rails and responsive outer shell.
- `src/styles/evidence-field.css` — authored constellation, camera layer, full/signal geometry, proximity and reduced motion.
- `src/styles/inspect.css` — stable in-stage inspect zones and disclosure.
- `src/styles/brief.css` — centered viewport document plus mobile natural-scroll fallback.
- `src/styles/showcase.css` — full color Field, saturated subdued Match, 25–35% tighter spacing.
- `src/main.tsx` — import `experience-stage.css`.
- Existing UI tests — update obsolete expectations without weakening behavioral coverage.

---

### Task 1: Presentation tiers and frozen semantic outputs

**Files:**
- Create: `src/presentation/projectPresentation.ts`
- Create: `tests/presentation/projectPresentation.test.ts`
- Modify: `src/state/selectors.ts`
- Modify: `tests/application/transitions.test.ts`

**Interfaces:**
- Produces: `ProjectPresentationTier = "flagship" | "extended"`.
- Produces: `ProjectVisualForm = "evidence-object" | "extended-signal"`.
- Produces: `projectPresentation: Readonly<Record<ProjectId, ProjectPresentation>>`.
- Extends `ProjectNodeState` with `presentationTier` and `visualForm`.
- Keeps `selectProjectNodeStates(state): readonly ProjectNodeState[]` as the consumer API.

- [ ] **Step 1: Write failing tier and promotion tests**

Add tests that assert the literal four/three split, seven unique IDs, default extended `visualForm: "extended-signal"`, and `sprintcrm` promoted to `evidence-object` at rank one for `CRM`, `Supabase`, `Gmail`, `operator workflow`.

```ts
expect(flagshipProjectIds).toEqual(["bdb", "weekfield", "distribution-desk", "storyform"]);
expect(extendedProjectIds).toEqual(["sprintcrm", "native-site-control", "presence-os-memory-atlas"]);
expect(selectProjectNodeStates(initial).find(({ projectId }) => projectId === "sprintcrm"))
  .toMatchObject({ presentationTier: "extended", visualForm: "extended-signal", rank: null });
expect(selectProjectNodeStates(matched).find(({ projectId }) => projectId === "sprintcrm"))
  .toMatchObject({ presentationTier: "extended", visualForm: "evidence-object", rank: 1 });
```

- [ ] **Step 2: Add the frozen-output regression test**

Build the CRM/Gmail match with the real matcher, derive a real brief, and execute the real `match_requirements` definition. Assert literal coverage, rank order, match ID equality between facade and tool, and brief project IDs. This catches presentation metadata entering any semantic calculation.

```ts
expect(result.rankedProjects.slice(0, 3).map(({ projectId }) => projectId)).toEqual([
  "sprintcrm", "weekfield", "bdb",
]);
expect(result).toMatchObject({ id: "match-3073d8fe14f0c60e", evidenceCoverage: 0.975 });
expect(brief.relevantProjectIds).toEqual(["sprintcrm", "weekfield"]);
expect(toolResult).toMatchObject({ ok: true, data: { id: "match-3073d8fe14f0c60e", evidenceCoverage: 0.975 } });
```

- [ ] **Step 3: Run the tests and verify RED**

Run: `npm test -- tests/presentation/projectPresentation.test.ts tests/application/transitions.test.ts`

Expected: FAIL because the presentation registry and node fields do not exist and default nodes still use seven equivalent objects.

- [ ] **Step 4: Implement the presentation registry and selector derivation**

Create a frozen registry keyed by every `ProjectId`. Use authored slots keyed by ID, not project-array index. In `selectProjectNodeStates`, calculate rank/match exactly as before, then derive only `presentationTier`, `visualForm`, and transforms. Full-object promotion is `rank !== null && rank <= 3`; it never changes the `MatchResult`.

- [ ] **Step 5: Run focused and semantic suites GREEN**

Run: `npm test -- tests/presentation/projectPresentation.test.ts tests/application/transitions.test.ts tests/domain tests/webmcp`

Expected: PASS with the original domain/WebMCP expectations unchanged.

---

### Task 2: Brenych Studio identity and truthful host status

**Files:**
- Create: `src/components/StudioContext.tsx`
- Create: `tests/ui/identity-status.test.tsx`
- Modify: `src/components/AppShell.tsx`
- Modify: `src/components/AgentReadyIndicator.tsx`
- Modify: `src/components/RequirementComposer.tsx`
- Modify: `src/styles/shell.css`

**Interfaces:**
- Produces: `StudioContext` with no props.
- Retains: `AgentReadyIndicator({ state: RegistrationState })`.

- [ ] **Step 1: Write failing accessible identity tests**

Render the real App and assert the Brenych Studio wordmark, fixed Studio/source URLs, `target="_blank"`, `rel="noopener noreferrer"`, thesis, approved context, `MANUAL MODE`, and supporting host copy. Apply the real `registration_changed` event to the singleton store and assert `AGENT TOOLS ONLINE` replaces Manual Mode.

- [ ] **Step 2: Run identity tests RED**

Run: `npm test -- tests/ui/identity-status.test.tsx`

Expected: FAIL on stale `BRENYCH / EVIDENCE`, missing links/context, and old WebMCP wording.

- [ ] **Step 3: Implement identity and status**

Use literal constants:

```ts
const STUDIO_URL = "https://brenychstudio.com";
const SOURCE_URL = "https://github.com/brenychstudio/brenych-agent-interface";
```

Render `StudioContext` adjacent to the composer in the first-viewport rail. Make the global wordmark a safe external Studio link. Map only `registrationState === "ready"` to Online; idle/checking/registering/error/unavailable remain honest Manual Mode with the approved supporting sentence.

- [ ] **Step 4: Run identity and existing UI tests GREEN**

Run: `npm test -- tests/ui/identity-status.test.tsx tests/ui/manual-flow.test.tsx tests/ui/tool-effects.test.tsx`

Expected: PASS.

---

### Task 3: One persistent ExperienceStage

**Files:**
- Create: `src/components/ExperienceStage.tsx`
- Create: `src/styles/experience-stage.css`
- Create: `tests/ui/experience-stage.test.tsx`
- Modify: `src/app/App.tsx`
- Modify: `src/main.tsx`
- Modify: `tests/ui/persistent-field.test.tsx`

**Interfaces:**
- `ExperienceStage` consumes `activeMode`, composer, field, optional match, optional inspect, and optional brief as React nodes.
- Produces one `[data-testid="experience-stage"]` containing one `[data-testid="evidence-field"]` and one active foreground mode.
- Field receives `interactive: boolean` and `visualMode: ActiveMode`.

- [ ] **Step 1: Write failing same-stage behavior tests**

Render App, retain references to stage and field, evaluate, inspect, create Brief, and assert:

```ts
expect(screen.getByTestId("evidence-field")).toBe(field);
expect(inspect.closest('[data-testid="experience-stage"]')).toBe(stage);
expect(brief.closest('[data-testid="experience-stage"]')).toBe(stage);
expect(stage.nextElementSibling).not.toContain(inspect);
```

In Inspect/Brief, assert the background field has `aria-hidden="true"` and `inert`, composer/match are absent, and only the relevant foreground is present.

- [ ] **Step 2: Run stage tests RED**

Run: `npm test -- tests/ui/experience-stage.test.tsx tests/ui/persistent-field.test.tsx`

Expected: FAIL because Inspect/Brief are appended after `.workspace-layout` and the old composer/match remain in Brief.

- [ ] **Step 3: Implement `ExperienceStage` and recompose App**

Use a single CSS grid container. Keep the field element in the stage canvas in every mode. Render composer/match only for Field/Match. Render Inspect/Brief as the only `.stage-foreground` child for their mode. Set both `inert` and `aria-hidden` on the background canvas in Inspect/Brief and pass `interactive={false}` to remove project buttons from tab order.

- [ ] **Step 4: Run focused UI suites GREEN**

Run: `npm test -- tests/ui/experience-stage.test.tsx tests/ui/persistent-field.test.tsx tests/ui/manual-flow.test.tsx`

Expected: PASS with the exact same field node retained.

---

### Task 4: Spatial camera, asymmetric objects, and proximity

**Files:**
- Modify: `src/components/EvidenceField.tsx`
- Modify: `src/components/ProjectNode.tsx`
- Modify: `src/styles/evidence-field.css`
- Modify: `tests/ui/field-drag.test.tsx`
- Modify: `tests/ui/keyboard.test.tsx`
- Modify: `tests/ui/responsive-contract.test.tsx`

**Interfaces:**
- EvidenceField camera bounds: x `[-76, 76]`, y `[-42, 42]`.
- EvidenceField owns `hoveredProjectId: ProjectId | null` and derives neighbor state from authored positions.
- ProjectNode consumes `interactive`, `proximity: "active" | "neighbor" | "ambient"`, and the selector-provided `visualForm`.

- [ ] **Step 1: Write failing camera and visual-form tests**

Use real pointer events to drag empty field beyond each bound and assert `data-pan-x="76"`, `data-pan-y="42"`, then negative bounds. Move the pointer across the stage and assert non-zero bounded parallax data. Hover/focus BDB and assert one or more other nodes receive `data-proximity="neighbor"`. Assert four default nodes use `data-visual-form="evidence-object"`, three use `extended-signal`, extended signals remain buttons, and node text no longer repeats `FIELD · NOT EVALUATED`.

- [ ] **Step 2: Run spatial tests RED**

Run: `npm test -- tests/ui/field-drag.test.tsx tests/ui/keyboard.test.tsx tests/ui/responsive-contract.test.tsx tests/presentation/projectPresentation.test.ts`

Expected: FAIL on old ±18/±12 bounds, absent parallax/proximity, and identical card rendering.

- [ ] **Step 3: Implement Motion camera and node choreography**

Wrap spatial contents in `motion.div.field-camera`. Drive x/y with `useMotionValue` + `useSpring`; drag updates bounded pan, pointer movement updates smaller parallax values, and pointer leave returns parallax to zero. Use `useReducedMotion` to set all movement directly to the static authored state.

Render `extended-signal` as a compact marker with a short `EXTENDED EVIDENCE` label and title, without the large media/card body. Preserve the button, accessible name, focus ring, and inspect handler. Full objects keep screenshot media. Add Motion hover/focus depth and restrained neighbor response.

- [ ] **Step 4: Run spatial suites GREEN**

Run: `npm test -- tests/ui/field-drag.test.tsx tests/ui/keyboard.test.tsx tests/ui/responsive-contract.test.tsx tests/ui/persistent-field.test.tsx tests/presentation/projectPresentation.test.ts`

Expected: PASS at all structural viewport fixtures.

---

### Task 5: In-place Inspect and exact restoration

**Files:**
- Modify: `src/app/App.tsx`
- Modify: `src/components/ProjectEvidenceInspect.tsx`
- Modify: `src/components/ProjectNode.tsx`
- Modify: `src/styles/inspect.css`
- Modify: `src/styles/evidence-field.css`
- Modify: `tests/ui/inspect.test.tsx`
- Modify: `tests/ui/keyboard.test.tsx`
- Modify: `tests/ui/experience-stage.test.tsx`

**Interfaces:**
- App stores the pre-Inspect `window.scrollY` and originating project element.
- `ProjectEvidenceInspect` no longer calls `scrollIntoView`.
- Detailed records use native `<details>` with summary `VIEW EVIDENCE DETAILS`.

- [ ] **Step 1: Write failing Inspect continuity tests**

Test manual BDB open before evaluation and assert the exact approved two-sentence relevance copy and absence of `No directly matched requirements`. Test matched BDB layout regions, closed evidence details, in-stage ancestry, legible background class, and hidden field controls. Mock only `window.scrollTo`, enter Inspect at a literal scroll position, close with Escape, and assert `{ top: savedY, left: 0, behavior: "instant" }`, prior Match mode, same field node, and origin focus.

- [ ] **Step 2: Run Inspect tests RED**

Run: `npm test -- tests/ui/inspect.test.tsx tests/ui/keyboard.test.tsx tests/ui/experience-stage.test.tsx`

Expected: FAIL because Inspect calls `scrollIntoView`, exposes all records immediately, uses old manual copy, and lacks stage restoration.

- [ ] **Step 3: Implement in-place Inspect**

Remove `surfaceRef` and `scrollIntoView`. Split visible summary/narrative/media/rail from detailed records and limitations. Add Motion layout continuity keyed by project ID between the selected node/media plane and Inspect hero. Save scroll only when entering Inspect from Field/Match; restore it after leaving Inspect/Brief with `requestAnimationFrame`, then restore the originating button focus.

- [ ] **Step 4: Run Inspect and semantic transition suites GREEN**

Run: `npm test -- tests/ui/inspect.test.tsx tests/ui/keyboard.test.tsx tests/ui/experience-stage.test.tsx tests/application/transitions.test.ts`

Expected: PASS with mode history unchanged.

---

### Task 6: Clean Brief foreground and intentional showcase modes

**Files:**
- Modify: `src/components/CollaborationBrief.tsx`
- Modify: `src/components/ShowcaseProofLayer.tsx`
- Modify: `src/styles/brief.css`
- Modify: `src/styles/showcase.css`
- Modify: `tests/ui/brief.test.tsx`
- Modify: `tests/ui/showcase.test.tsx`
- Modify: `tests/ui/experience-stage.test.tsx`
- Modify: `tests/ui/responsive-contract.test.tsx`

**Interfaces:**
- Brief adds a safe external `CONTINUE WITH BRENYCH STUDIO ↗` link.
- Showcase consumes `mode: "field" | "match"`; it is not rendered for Inspect/Brief.
- Desktop Brief uses `max-height: calc(100dvh - var(--header-offset))` and internal overflow; `max-width: 620px` overrides to natural height/visible overflow.

- [ ] **Step 1: Write failing Brief/showcase tests**

Assert Brief is the sole foreground, retains all page-local boundaries, has the fixed safe Studio link, and hides composer, Match panel, and showcase. Assert Field showcase is full-color, Match showcase is `is-subdued` but not desaturated/disabled, and Inspect/Brief have no `Selected studio systems` region in the accessibility tree.

- [ ] **Step 2: Run Brief/showcase tests RED**

Run: `npm test -- tests/ui/brief.test.tsx tests/ui/showcase.test.tsx tests/ui/experience-stage.test.tsx`

Expected: FAIL because showcase remains mounted/grey and Brief lacks the Studio continuation link.

- [ ] **Step 3: Implement Brief and showcase mode behavior**

Add the literal safe external link. Keep copy/update functions unchanged. Apply viewport-bounded internal scrolling above 620px and natural document flow at 620px and below. Change showcase copy to the approved compact title/subtitle, remove global grayscale filters, reduce gaps by approximately 30%, and conditionally render it only for Field/Match.

- [ ] **Step 4: Run Brief/showcase/UI suites GREEN**

Run: `npm test -- tests/ui/brief.test.tsx tests/ui/showcase.test.tsx tests/ui/experience-stage.test.tsx tests/ui/responsive-contract.test.tsx tests/ui/manual-flow.test.tsx`

Expected: PASS.

---

### Task 7: Responsive/accessibility consolidation and full automated gates

**Files:**
- Modify: affected CSS and UI tests only when a failing behavior exposes a real defect.
- Modify: this plan checkbox state.

**Interfaces:** None; this task validates the integrated product.

- [ ] **Step 1: Run the full suite and classify every failure**

Run: `npm run typecheck && npm run test && npm run lint && npm run build`

Expected: all commands exit 0. If a behavior regression appears, add or isolate a failing test before changing production code. If an old source-text CSS assertion describes superseded structure, replace it with an observable DOM/accessibility assertion rather than loosening it.

- [ ] **Step 2: Run integrity gates**

Run: `npm run validate:media && npm run validate:evals && git diff --check && npm audit`

Expected: 15 media records/hash checks pass, eval corpus passes, no whitespace errors, and audit reports zero vulnerabilities.

- [ ] **Step 3: Verify immutable counts and golden/negative behavior**

Run the focused existing suites:

```powershell
npm test -- tests/domain/scenarios.test.ts tests/domain/negative-fit.test.ts tests/media/evidenceMedia.test.ts tests/webmcp/tools.test.ts tests/ui/tool-effects.test.tsx
```

Expected: golden top three BDB → Weekfield → Distribution Desk, negative native iOS fit remains 0%, 15 media assets pass, and seven WebMCP tools remain.

---

### Task 8: Physical browser QA, isolated preview, and single final commit

**Files:**
- Temporary only: QA screenshots outside tracked repo paths.
- No production configuration changes unless the existing preview workflow requires a reversible local build artifact.

**Interfaces:** Preview deployment only; production remains untouched.

- [ ] **Step 1: Start the production build locally and inspect all modes**

Serve `dist` locally. At 390, 430, 768, 1024, 1366, and 1920 verify no horizontal overflow, overlap, clipped actions, stale mode fragments, inaccessible controls, or scroll jump. Verify keyboard focus, Enter/Space, Escape, reduced motion, alt text, and zero console errors.

- [ ] **Step 2: Capture the seven temporary QA images**

Capture default first viewport, Match, BDB Inspect, Brief, showcase, 390 Match, and 390 Inspect outside the worktree. Do not stage them.

- [ ] **Step 3: Deploy an isolated Cloudflare preview**

Use the existing Cloudflare project in preview-only mode. Record the immutable preview URL and verify default/Match/Inspect/Brief on it. Do not promote aliases or deploy production.

- [ ] **Step 4: Run verification-before-completion gates again**

Run fresh: `npm run typecheck`, `npm run test`, `npm run lint`, `npm run build`, `git diff --check`, and `npm audit`. Inspect `git status --short`, `git diff --stat`, and confirm no QA images, secrets, or build artifacts are staged.

- [ ] **Step 5: Create the only commit**

Stage the approved source, tests, design, and plan. Commit exactly:

```text
fix: finalize Brenych Studio spatial agent experience
```

Confirm the branch is one commit ahead of `2405e9d0...`, `main` remains unchanged, no tag exists, and the worktree is clean.
