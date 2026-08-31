# BAI-ULTRA-02 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add real evidence media, a separate non-scoring studio-proof layer, premium spatial/inspect/brief presentation, and WebMCP eval hardening without changing the deterministic matcher.

**Architecture:** Keep the seven-project pure evidence graph and shared `AgentInterface`/Zustand state spine. Add media, showcase, and display-copy records in a one-way presentation layer, then let existing semantic modes drive deterministic authored React/CSS compositions.

**Tech Stack:** React 19, TypeScript, Zustand, Motion, authored CSS/SVG, Vitest, React Testing Library, jsdom, Vite, FFmpeg for deterministic build-time image derivatives.

**Spec:** `docs/superpowers/specs/2026-08-31-bai-ultra-02-design.md`

## Global Constraints

- Preserve exactly seven scored `ProjectId` values and exactly four `ShowcaseProof` records.
- Do not change match weights, coverage, ranking, negative-fit behavior, or stable match identity.
- Import exactly 15 selected screenshots and none of the four reserve screenshots.
- Never record or mutate the external source directory; committed provenance is only `user-approved challenge evidence screenshot`.
- Keep exactly seven WebMCP tool names and their current truthful annotations.
- Use `document.modelContext` only; no `exposedTo`, cross-origin exposure, backend, network write, or LLM call.
- Add no runtime dependency and no Three.js, R3F, GSAP, WebGL, video runtime, or fake imagery.
- Preserve keyboard/manual mode, reduced motion, local-only brief authority, and mounted-field history.
- Do not create intermediate commits; create exactly one final commit only after all gates pass.

## File map

```text
src/domain/                         seven scored projects and unchanged matcher
src/presentation/evidenceMedia.ts   typed 15-asset registry and lookup helpers
src/presentation/showcaseProofs.ts  four non-scoring studio systems
src/presentation/displayLabels.ts   public-safe typed-value labels
src/components/                     stage, trace, node, inspect, showcase, brief
src/styles/                         authored responsive/reduced-motion presentation
public/evidence/                    optimized screenshot derivatives only
evals/webmcp-evals.json             deterministic selection/state corpus
tests/media/                        import/hash/loading contracts
tests/presentation/                 showcase separation and display-copy contracts
tests/evals/                        eval corpus validator
tests/webmcp/                       metadata, adapter, lifecycle, side effects
docs/EVIDENCE-MEDIA-MANIFEST.md      human-readable derivative provenance
```

---

### Task 1: Media derivatives and typed manifest

**Files:**
- Create: `tests/media/evidenceMedia.test.ts`
- Create: `src/presentation/evidenceMedia.ts`
- Create: `public/evidence/**`
- Create: `docs/EVIDENCE-MEDIA-MANIFEST.md`
- Modify: `package.json`

**Interfaces:**
- Produces: `EvidenceMediaId`, `EvidenceMedia`, `evidenceMedia`, `mediaForOwner()`.
- `EvidenceMedia.ownerId` accepts `ProjectId | ShowcaseProofId`; `contentHash` is lowercase SHA-256.

- [ ] **Step 1: Write the failing media contract**

```ts
expect(evidenceMedia).toHaveLength(15);
expect(new Set(evidenceMedia.map((item) => item.id)).size).toBe(15);
for (const item of evidenceMedia) {
  expect(existsSync(`public${item.src}`)).toBe(true);
  expect(createHash("sha256").update(readFileSync(`public${item.src}`)).digest("hex"))
    .toBe(item.contentHash);
}
```

- [ ] **Step 2: Verify RED**

Run: `npm run test -- tests/media/evidenceMedia.test.ts`

Expected: FAIL because the registry and derivatives do not exist.

- [ ] **Step 3: Create the 15 derivatives without mutating source files**

Use FFmpeg to create high-quality WebP assets under `public/evidence/`. Crop only
`BDB (2)` to `954x870` at source offset `652:96`. Keep UI screenshots near source
resolution and cap the large art/photography/WebGL captures at 2400-2560 pixels.

- [ ] **Step 4: Add exact typed records, dimensions, captions, and computed hashes**

All records use:

```ts
sourceKind: "user_approved_screenshot";
publicSafe: true;
```

- [ ] **Step 5: Document and validate**

Add `validate:media` and run it. Expected: 15 records, 15 files, all hashes valid,
no reserve filenames, and no absolute local path.

---

### Task 2: Non-scoring showcase and display-only evidence copy

**Files:**
- Create: `tests/presentation/showcaseProofs.test.ts`
- Create: `src/presentation/showcaseProofs.ts`
- Create: `src/presentation/displayLabels.ts`
- Modify: `src/domain/types.ts`, `src/domain/projects.ts`
- Modify: `src/application/AgentInterface.ts`

**Interfaces:**
- Produces: `ShowcaseProofId`, `ShowcaseProof`, `showcaseProofs`.
- Adds `Project.verifiedHighlights` and `ProjectDossier.verifiedHighlights` as display-only data.

- [ ] **Step 1: Write isolation and copy tests**

```ts
expect(showcaseProofs).toHaveLength(4);
expect(showcaseProofs.every((proof) => proof.scoring === false)).toBe(true);
expect(showcaseProofs.map((proof) => proof.id)).toEqual([
  "webhero", "photo-web", "artist-stage", "model-site",
]);
expect(buildMatchResult(requirements)).toEqual(baselineResult);
```

Assert proof IDs are absent from `projects`, evidence record project IDs, ranked
projects, brief relevant IDs, coverage inputs, and stable match identity.

- [ ] **Step 2: Verify RED**

Run: `npm run test -- tests/presentation/showcaseProofs.test.ts`

Expected: FAIL because showcase and display-highlight records do not exist.

- [ ] **Step 3: Implement the isolated records and verified public copy**

Use the approved BDB, Distribution Desk, Weekfield, StoryForm, SprintCRM, Native
Site Control, and Presence copy. Do not add or remove capability IDs or evidence.

- [ ] **Step 4: Verify GREEN and matcher regression**

Run: `npm run test -- tests/presentation/showcaseProofs.test.ts tests/domain`

Expected: PASS with unchanged canonical scenario IDs, coverage, and ranking.

---

### Task 3: Authored spatial evidence stage

**Files:**
- Create: `tests/ui/evidence-media.test.tsx`
- Create: `tests/ui/capability-traces.test.tsx`
- Create: `src/components/CapabilityConnections.tsx`
- Modify: `src/state/selectors.ts`
- Modify: `src/components/EvidenceField.tsx`, `src/components/ProjectNode.tsx`
- Modify: `src/styles/evidence-field.css`, `src/styles/tokens.css`

**Interfaces:**
- Produces: deterministic default/ranked node transforms and bounded capability traces.
- Consumes: `mediaForOwner()`, `MatchResult`, and existing dossier/node state.

- [ ] **Step 1: Write failing behavioral UI tests**

Assert approved projects render real images with alt/dimensions/loading attributes,
non-media projects remain honest typographic objects, all seven buttons remain
visible/actionable, rank one uses semantic dominant state, and active match traces
name actual requirement/capability/project triples.

- [ ] **Step 2: Verify RED**

Run: `npm run test -- tests/ui/evidence-media.test.tsx tests/ui/capability-traces.test.tsx`

- [ ] **Step 3: Implement minimal stage behavior**

Use Motion-backed CSS custom properties for position, scale, z-depth, opacity, and
rank choreography. Use an SVG visual trace plus semantic text; bound trace count.

- [ ] **Step 4: Verify GREEN and persistent-field regression**

Run: `npm run test -- tests/ui/evidence-media.test.tsx tests/ui/capability-traces.test.tsx tests/ui/persistent-field.test.tsx tests/ui/match-mode.test.tsx`

---

### Task 4: Cinematic inspect, match hierarchy, showcase, and brief

**Files:**
- Create: `tests/ui/showcase.test.tsx`
- Create: `src/components/ShowcaseProofLayer.tsx`
- Create: `src/styles/showcase.css`
- Modify: `tests/ui/inspect.test.tsx`, `tests/ui/brief.test.tsx`, `tests/ui/responsive-contract.test.tsx`
- Modify: `src/app/App.tsx`, `src/components/ProjectEvidenceInspect.tsx`
- Modify: `src/components/MatchPanel.tsx`, `src/components/CollaborationBrief.tsx`
- Modify: `src/styles/shell.css`, `src/styles/inspect.css`, `src/styles/brief.css`, `src/main.tsx`

**Interfaces:**
- Inspect consumes dossier, focus context, active match, and owner media.
- Showcase consumes only `showcaseProofs` and `evidenceMedia`; it emits no domain event.

- [ ] **Step 1: Write failing integrated-surface tests**

Assert field identity persists; inspect has primary/secondary media, public-safe
labels, verified highlights, why-selected, boundaries, and limitations; showcase
contains exactly four non-scoring articles; Brief Mode retains editable local fields
and authority labels; 390/430/768/1024/1366 flows remain operable.

- [ ] **Step 2: Verify RED**

Run: `npm run test -- tests/ui/inspect.test.tsx tests/ui/showcase.test.tsx tests/ui/brief.test.tsx tests/ui/responsive-contract.test.tsx`

- [ ] **Step 3: Implement the surfaces and authored responsive CSS**

Keep native buttons/headings, visible focus, Escape/back history, async image
decoding, lazy secondary/supporting media, reduced-motion static state, and no focus
trap. Make showcase quieter in match/inspect/brief modes.

- [ ] **Step 4: Verify GREEN**

Run the same four test files plus `tests/ui/keyboard.test.tsx` and
`tests/ui/manual-flow.test.tsx`. Expected: PASS.

---

### Task 5: WebMCP metadata, browser adapter, and side-effect parity

**Files:**
- Modify: `tests/webmcp/tools.test.ts`, `tests/webmcp/tool-effects.test.ts`
- Create: `tests/webmcp/browser-port.test.ts`
- Modify: `src/webmcp/toolDefinitions.ts`

**Interfaces:**
- Preserves the seven names and annotation objects.
- Every tool exposes non-empty `title` and selection-oriented `description`.
- Every schema property exposes a non-empty `description`.

- [ ] **Step 1: Write failing metadata, port, and parity tests**

```ts
expect(definitions.every((tool) => tool.title?.trim())).toBe(true);
expect(allSchemaProperties(definitions).every((property) => property.description)).toBe(true);
```

Assert manual and WebMCP match/focus/brief snapshots differ only in provenance, and
that the browser port forwards `{ signal }` without `exposedTo`.

- [ ] **Step 2: Verify RED**

Run: `npm run test -- tests/webmcp/tools.test.ts tests/webmcp/browser-port.test.ts tests/webmcp/tool-effects.test.ts`

- [ ] **Step 3: Add concise titles/descriptions without changing execution**

Make read-versus-visible-focus and discover-versus-evaluate intent unambiguous.

- [ ] **Step 4: Verify GREEN and lifecycle regression**

Run: `npm run test -- tests/webmcp`. Expected: PASS.

---

### Task 6: Deterministic WebMCP eval corpus

**Files:**
- Create: `evals/webmcp-evals.json`
- Create: `tests/evals/corpus.test.ts`
- Modify: `package.json`

**Interfaces:**
- Implements `WebMcpEvalCase` with user messages, expected tool/arguments/state,
  forbidden tools, and notes.

- [ ] **Step 1: Write the failing validator**

Assert at least 24 unique cases; valid categories/roles/tool names; arguments are
strict-schema compatible; every required category exists; adversarial prompts have
no expected tool and forbid all unsafe behavior.

- [ ] **Step 2: Verify RED**

Run: `npm run test -- tests/evals/corpus.test.ts`

- [ ] **Step 3: Add a 28-case machine-readable corpus**

Include profile, capability, project search, evidence read, direct/ambiguous/negative
fit, contextual focus, brief, and adversarial cases. Do not invoke an LLM.

- [ ] **Step 4: Add `validate:evals` and verify GREEN**

Run: `npm run validate:evals`. Expected: PASS.

---

### Task 7: Security, accessibility, responsive, and production verification

**Files:**
- Modify only files implicated by fresh failures.

**Interfaces:**
- Produces no feature API; proves the acceptance contract.

- [ ] **Step 1: Run focused validators and full engineering gates**

```text
npm run validate:media
npm run validate:evals
npm run typecheck
npm run test
npm run lint
npm run build
git diff --check
npm audit
```

- [ ] **Step 2: Scan committed code/assets**

Search for absolute user paths, user identifiers, token/secret markers, private
repository paths, `navigator.modelContext`, `exposedTo`, network writes, and reserve
asset names. Investigate every hit.

- [ ] **Step 3: Run physical browser QA**

Review 390, 430, 768, 1024, and 1366 widths, including requirements, field, match,
inspect, showcase, and brief. Capture only temporary QA screenshots and verify no
horizontal overflow, unreadable media, or focus loss.

- [ ] **Step 4: Measure output**

Record largest JavaScript chunk, total media payload, per-asset sizes, and confirm no
new runtime dependency.

---

### Task 8: Independent review and one final commit

**Files:**
- Review the complete diff from baseline `3a5ed34e30c6dba0b80f95c5f7e5ce19c508eaef`.

**Interfaces:**
- Produces the engineering and challenge-product review findings for the final report.

- [ ] **Step 1: Request independent engineering and product reviews**

Review state regressions, matcher identity, tool lifecycle/contracts, accessibility,
security, bundle growth, media loading, WebMCP leverage, clarity, credibility, and
visible human control. Fix all Critical and Important findings, then re-run affected
tests and the full gates.

- [ ] **Step 2: Inspect the final diff**

Run `git status --short`, `git diff --stat`, `git diff`, and `git diff --check`.

- [ ] **Step 3: Create exactly one commit**

```text
git add <reviewed ULTRA-02 files>
git commit -m "feat: harden WebMCP evidence experience"
```

- [ ] **Step 4: Stop at ULTRA-02**

Do not push, deploy, publish, create a remote, or begin ULTRA-03.
