# BAI-ULTRA-01 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete local-first WebMCP evidence workspace vertical slice: deterministic evidence matching, shared human/agent state, spatial evidence recomposition, project inspect, and editable collaboration brief.

**Architecture:** Pure typed fixtures and domain functions feed an application façade that is the only orchestration boundary. Manual React controls and seven WebMCP tools call the same façade, which writes reversible semantic state through a Zustand-backed state port; the persistent UI renders derived selectors.

**Tech Stack:** Vite, React 19, TypeScript, Zustand, Motion, authored CSS, Vitest, React Testing Library, jsdom, ESLint, `webmcp-types`.

**Spec:** `docs/superpowers/specs/2026-08-27-bai-ultra-01-design.md`

## Global Constraints

- Work only in `C:\PROJECTS\brenych-agent-interface`; do not modify source repositories.
- Keep exactly seven public-safe projects and exactly seven WebMCP tools.
- Use `document.modelContext`; never reference `navigator.modelContext`.
- `match_requirements` uses `readOnlyHint: false` and `untrustedContentHint: true`.
- Runtime code has no backend, database, authentication, LLM, remote MCP, analytics, filesystem, shell, private API, local-network, secret, or external write path.
- Matching strengths are exact `1`, alias `0.9`, related `0.45`, missing `0`; related edges are explicit, directed, and one hop.
- Matching deduplicates normalized requirements, prevents evidence-count inflation, excludes visibility from score, and produces permutation-stable IDs.
- Field, match, inspect, and brief remain inside one mounted page without React Router.
- All user strings are bounded and rendered as plain React text.
- Layouts must work at 390, 768, and 1366 pixels with reduced-motion support.
- Do not create intermediate commits. Create exactly one commit after every gate passes.
- Stop after ULTRA-01; do not add ULTRA-02/03 scope.

## File Map

```text
package.json / tsconfig*.json / vite.config.ts / eslint.config.js
src/domain/         types, limits, fixtures, validation, pure matching
src/application/    shared façade and StatePort
src/state/          Zustand adapter, transitions, selectors
src/webmcp/         port, browser adapter, seven tools, lifecycle
src/components/     persistent shell and interaction surfaces
src/styles/         authored tokens and surface CSS
tests/domain/       fixtures and pure matching
tests/application/  façade/store transitions
tests/webmcp/       contracts, lifecycle, tool effects
tests/ui/           persistent accessible UI flows
docs/PUBLIC-EVIDENCE-BOUNDARY.md
README.md
```

---

### Task 1: Foundation and Public Evidence Graph

**Files:**
- Create: `package.json`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `vite.config.ts`, `eslint.config.js`, `index.html`, `.gitignore`
- Create: `src/domain/types.ts`, `src/domain/limits.ts`, `src/domain/profile.ts`, `src/domain/capabilities.ts`, `src/domain/projects.ts`, `src/domain/evidence.ts`, `src/domain/fixtureIntegrity.ts`
- Create: `tests/setup.ts`, `tests/domain/fixtures.test.ts`
- Create: `docs/PUBLIC-EVIDENCE-BOUNDARY.md`

**Interfaces:**
- Produces: `ProjectId`, `CapabilityId`, `Project`, `Capability`, `EvidenceRecord`, `MatchResult`, `CollaborationBrief`, `AgentAction`, `InputError`.
- Produces: `projects`, `capabilities`, `evidenceRecords`, `profile`, `assertFixtureIntegrity()`.

- [ ] **Step 1: Add project configuration**

Set scripts to `vite`, `tsc -b --pretty false`, `vitest run`, `eslint .`, and `tsc -b && vite build`. Declare React 19, Zustand, Motion, Vitest, RTL, jsdom, ESLint, TypeScript, Vite, and `webmcp-types`. Configure jsdom and `compilerOptions.types: ["vite/client", "webmcp-types"]`.

- [ ] **Step 2: Install dependencies**

Run: `npm install`

Expected: lockfile created with no install failure.

- [ ] **Step 3: Write the failing fixture test**

```ts
expect(projects.map((project) => project.id)).toEqual([
  "bdb", "distribution-desk", "weekfield", "sprintcrm", "storyform",
  "native-site-control", "presence-os-memory-atlas",
]);
expect(() => assertFixtureIntegrity({ projects, capabilities, evidenceRecords })).not.toThrow();
expect(new Set(evidenceRecords.map((record) => record.capabilityId))).toEqual(
  new Set(capabilities.map((capability) => capability.id)),
);
```

- [ ] **Step 4: Verify the red state**

Run: `npm run test -- tests/domain/fixtures.test.ts`

Expected: FAIL because fixture modules do not exist.

- [ ] **Step 5: Implement types and exact limits**

```ts
export const INPUT_LIMITS = {
  requirementCount: 12,
  requirementLength: 80,
  queryLength: 120,
  projectTypeLength: 100,
  contextLength: 600,
  timelineLength: 120,
  budgetLength: 120,
  capabilityLimit: 40,
  projectLimit: 7,
} as const;
```

`MatchResult` contains ID, requirement results, coverage, deterministic confidence, matched/partial/missing labels, ranked projects, `methodVersion: "1.0.0"`, and data version.

- [ ] **Step 6: Add exactly seven safe projects, capabilities, and evidence records**

Use the approved IDs and transparent Weekfield/CreatorOps mapping. Omit repository URLs for BDB, Distribution Desk, StoryForm, and Native Site Control. Include only evidence-backed capabilities required by scenarios A–C; exclude unsupported `webmcp` and `multilingual-web`.

- [ ] **Step 7: Implement fixture integrity validation**

Reject duplicate IDs, project counts other than seven, dangling references, capabilities without evidence, unsafe URL schemes, private repository links on summary-only records, and missing provenance/limitations.

- [ ] **Step 8: Make the fixture suite green**

Run: `npm run test -- tests/domain/fixtures.test.ts`

Expected: PASS.

Run: `npm run typecheck`

Expected: PASS.

- [ ] **Step 9: Review without committing**

Run: `git status --short`; confirm all files belong to this repository and create no commit.

---

### Task 2: Deterministic Matching and Stable Identity

**Files:**
- Create: `src/domain/normalizeRequirement.ts`, `src/domain/matchCapability.ts`, `src/domain/collectEvidence.ts`, `src/domain/rankProjects.ts`, `src/domain/matchRequirements.ts`
- Modify: `src/domain/capabilities.ts`, `src/domain/types.ts`
- Create: `tests/domain/normalization.test.ts`, `tests/domain/matching.test.ts`, `tests/domain/ranking.test.ts`, `tests/domain/scenarios.test.ts`, `tests/domain/negative-fit.test.ts`

**Interfaces:**
- Produces: `normalizeRequirement()`, `resolveCapabilityAlias()`, `matchCapability()`, `collectEvidence()`, `scoreRequirementCoverage()`, `rankProjects()`, `buildMatchResult()`.

- [ ] **Step 1: Write normalization and identity tests**

```ts
expect(normalizeRequirement("  Model-Context   Protocol! ")).toEqual({
  original: "Model-Context   Protocol!",
  normalized: "model context protocol",
});
const first = buildMatchResult(["Electron", "MCP", "Supabase"]);
const second = buildMatchResult(["supabase", "Electron", "MCP", "MCP"]);
expect(second.id).toBe(first.id);
expect(second.evidenceCoverage).toBe(first.evidenceCoverage);
```

- [ ] **Step 2: Verify the red state**

Run: `npm run test -- tests/domain/normalization.test.ts`

Expected: FAIL with missing functions.

- [ ] **Step 3: Implement validation and normalization**

Use Unicode NFKC, lowercase, punctuation-to-space conversion, whitespace collapse, and trim. Validate 1–12 items of 1–80 characters before matching. Hash `methodVersion|dataVersion|canonicalSortedUniqueRequirements` with a stable local algorithm.

- [ ] **Step 4: Write alias and related-edge tests**

Assert canonical `mcp` is `1`, `Model Context Protocol → mcp` is `0.9`, `XR → webxr` is `0.9`, one configured directed relation is `0.45`, and unrelated or two-hop inputs remain missing.

- [ ] **Step 5: Implement explicit alias and directed relation resolution**

Use normalized phrase maps and readonly `{ from, to }` edges. Do not use substring guessing, edit distance, stemming, recursion, embeddings, or model calls.

- [ ] **Step 6: Write non-inflating ranking tests**

```ts
const result = buildMatchResult(["MCP"]);
const bdb = result.rankedProjects.find((project) => project.projectId === "bdb");
expect(bdb?.score).toBe(1);
expect(bdb?.matchedRequirementIds).toHaveLength(1);
```

Add a tie assertion for score → exact/alias count → covered count → project ID.

- [ ] **Step 7: Implement evidence collection, coverage, and ranking**

Keep one strongest match for each project/requirement. Coverage is the mean strongest strength per unique requirement. Project score is the mean contribution across those requirements. Evidence visibility never changes either value.

- [ ] **Step 8: Add scenarios A–D**

Assert A includes BDB, Distribution Desk, Weekfield; B ranks SprintCRM first; C ranks Presence OS first; D shows Swift/Metal/native iOS as missing with low coverage.

- [ ] **Step 9: Run all domain tests**

Run: `npm run test -- tests/domain`

Expected: PASS with no hardcoded showcase percentage.

Run: `npm run typecheck`

Expected: PASS.

- [ ] **Step 10: Review without committing**

Inspect for unsupported claims, fuzzy matching, magic weights, duplicate evidence scoring, and visibility-based ranking. Create no commit.

---

### Task 3: Application Façade and Semantic State

**Files:**
- Create: `src/application/StatePort.ts`, `src/application/AgentInterface.ts`
- Create: `src/domain/buildCollaborationBrief.ts`
- Create: `src/state/appStore.ts`, `src/state/storeStatePort.ts`, `src/state/selectors.ts`
- Create: `tests/application/facade.test.ts`, `tests/application/transitions.test.ts`

**Interfaces:**
- Produces: `createAgentInterface()`, `createStoreStatePort()`, `useAppStore`, semantic selectors.
- Façade operations: profile/capability/project queries, match, focus, brief create/update, clear, close, and reset.

- [ ] **Step 1: Write atomic façade tests**

```ts
const result = app.matchRequirements({ requirements: ["Electron", "MCP"] }, "manual");
expect(state.snapshot()).toMatchObject({ activeMode: "match", matchResult: result });
expect(state.events).toHaveLength(1);
```

Also assert invalid input leaves the snapshot unchanged.

- [ ] **Step 2: Verify the red state**

Run: `npm run test -- tests/application/facade.test.ts`

Expected: FAIL with missing façade/port.

- [ ] **Step 3: Define `StatePort` and implement the façade**

Calculate and validate complete domain results before one `state.apply(event)` call. Accept provenance `"manual" | "webmcp"`. Keep all query and command orchestration outside Zustand.

- [ ] **Step 4: Write transition tests**

Cover `field → match → inspect → brief`, return to the exact prior state, focus without a match, clear match, brief freshness, and semantic reset preserving WebMCP registration status.

- [ ] **Step 5: Implement Zustand transitions and selectors**

Use explicit events for match, focus, brief create/update, return, clear, reset, and registration. Derive highlights, why-selected, missing markers, ranked node state, and transforms; do not store recomputable presentation values.

- [ ] **Step 6: Implement brief freshness**

When submitted brief requirements differ canonically from the current match, compute/apply a fresh match, then create the draft with its source match ID, relevant ranked projects, and missing requirements.

- [ ] **Step 7: Run application and domain suites**

Run: `npm run test -- tests/application tests/domain`

Expected: PASS.

Run: `npm run typecheck`

Expected: PASS.

- [ ] **Step 8: Review without committing**

Confirm the façade is the shared mutation path and Zustand contains no scoring rules. Create no commit.

---

### Task 4: Seven WebMCP Contracts and Lifecycle

**Files:**
- Create: `src/webmcp/webMcpPort.ts`, `src/webmcp/browserWebMcpPort.ts`, `src/webmcp/toolDefinitions.ts`, `src/webmcp/registerAgentTools.ts`, `src/webmcp/toolLifecycle.ts`, `src/webmcp/toolResults.ts`
- Create: `tests/webmcp/fakeWebMcpPort.ts`, `tests/webmcp/tools.test.ts`, `tests/webmcp/annotations.test.ts`, `tests/webmcp/lifecycle.test.ts`, `tests/webmcp/tool-effects.test.ts`

**Interfaces:**
- Consumes: `AgentInterface` and registration-status state actions.
- Produces: `WebMcpPort`, `BrowserWebMcpPort`, `createToolDefinitions()`, `ToolLifecycle.start()`, `ToolLifecycle.stop()`.

- [ ] **Step 1: Write exact contract tests**

```ts
expect(definitions.map((tool) => tool.name).sort()).toEqual([
  "create_collaboration_brief", "focus_project", "get_capabilities",
  "get_profile", "get_project", "list_projects", "match_requirements",
]);
expect(byName.match_requirements.annotations).toEqual({
  readOnlyHint: false,
  untrustedContentHint: true,
});
```

Assert the first four query tools use `readOnlyHint: true`; schemas mirror `INPUT_LIMITS` and use `additionalProperties: false`.

- [ ] **Step 2: Verify the red state**

Run: `npm run test -- tests/webmcp/tools.test.ts tests/webmcp/annotations.test.ts`

Expected: FAIL because tool definitions are absent.

- [ ] **Step 3: Implement compact results and seven façade-backed handlers**

Runtime-validate every input. Check the execution signal before mutating operations. Return compact public-safe JSON-compatible results; do not echo full user context or draft bodies.

- [ ] **Step 4: Define the injectable port and browser adapter**

```ts
export interface WebMcpPort {
  isAvailable(): boolean;
  registerTool(definition: WebMcpToolDefinition, options: { signal: AbortSignal }): Promise<void>;
}
```

Only `browserWebMcpPort.ts` may read `document.modelContext`. Do not use `exposedTo`.

- [ ] **Step 5: Write lifecycle tests**

Cover unavailable API, seven registrations, concurrent starts sharing one promise, StrictMode-style start/stop/start, partial failure cleanup, idempotent stop, and cancellation before a local write.

- [ ] **Step 6: Implement lifecycle ownership**

Maintain one controller, one in-flight promise, and an ownership generation. Partial failure aborts prior registrations and reports `error`; unavailable reports `unavailable`; success reports `ready`. Teardown aborts once and clears ownership only after settlement.

- [ ] **Step 7: Run the WebMCP suite**

Run: `npm run test -- tests/webmcp`

Expected: PASS.

Run: `npm run typecheck`

Expected: PASS without a broad `any` around `document.modelContext`.

- [ ] **Step 8: Search boundary violations and review without committing**

Run: `rg -n "navigator\\.modelContext|exposedTo|read_file|execute_command|fetch_url|call_api" src tests`

Expected: no forbidden implementation references. Create no commit.

---

### Task 5: Persistent Shell, Manual Match Flow, and Evidence Field

**Files:**
- Create: `src/main.tsx`, `src/app/App.tsx`
- Create: `src/components/AppShell.tsx`, `src/components/AgentReadyIndicator.tsx`, `src/components/RequirementComposer.tsx`, `src/components/EvidenceField.tsx`, `src/components/ProjectNode.tsx`, `src/components/MatchPanel.tsx`, `src/components/RequirementMatrix.tsx`, `src/components/AgentActivity.tsx`, `src/components/ResetControl.tsx`
- Create: `src/styles/tokens.css`, `src/styles/global.css`, `src/styles/shell.css`, `src/styles/evidence-field.css`
- Create: `tests/ui/manual-flow.test.tsx`, `tests/ui/match-mode.test.tsx`, `tests/ui/persistent-field.test.tsx`

**Interfaces:**
- Consumes: shared façade, Zustand selectors, lifecycle bootstrap.
- Produces: one mounted accessible manual and agent-responsive surface.

- [ ] **Step 1: Write the manual-flow test**

Render `App`, add Electron/MCP/AI automation/Supabase, activate `EVALUATE EVIDENCE`, and assert coverage, BDB, Distribution Desk, Weekfield, and the real provenance announcement.

- [ ] **Step 2: Verify the red state**

Run: `npm run test -- tests/ui/manual-flow.test.tsx`

Expected: FAIL because UI modules are absent.

- [ ] **Step 3: Implement bootstrap and persistent shell**

Mount once, instantiate the façade once, bootstrap WebMCP outside render churn, retain manual mode for every registration state, and provide a skip target plus live region.

- [ ] **Step 4: Implement the bounded requirement composer**

Support example chips, text add/remove, errors, evaluate, edit, clear, and reset. Invoke only façade operations and render no chat transcript.

- [ ] **Step 5: Implement Match Mode and requirement matrix**

Render `EVIDENCE COVERAGE`, deterministic confidence, matched/partial/not-demonstrated groups, ranked evidence, visibility labels, and provenance. Never use probability language.

- [ ] **Step 6: Write persistent recomposition tests**

Capture the field element before evaluation, run a match, assert the same element remains mounted, and assert leading nodes expose foreground rank/state while missing requirements remain visible.

- [ ] **Step 7: Implement the DOM-based 2.5D field**

Use button nodes and selector-provided CSS variables for `translate3d`, scale, opacity, and z-index. Mobile becomes a vertical/depth sequence. Do not add WebGL, camera controls, or advanced physics.

- [ ] **Step 8: Add visual, responsive, and reduced-motion foundations**

Use warm off-white/ink tokens, thin lines, editorial hierarchy, mono system labels, subtle perspective, restrained Motion, visible focus, non-color state copy, and full reduced-motion overrides.

- [ ] **Step 9: Run UI tests and static gates**

Run: `npm run test -- tests/ui/manual-flow.test.tsx tests/ui/match-mode.test.tsx tests/ui/persistent-field.test.tsx`

Expected: PASS.

Run: `npm run typecheck && npm run lint`

Expected: PASS.

- [ ] **Step 10: Review without committing**

Confirm there is no router, generic dashboard, copied portfolio component, chat pattern, or hidden write. Create no commit.

---

### Task 6: Evidence Inspect and Collaboration Brief

**Files:**
- Create: `src/components/ProjectEvidenceInspect.tsx`, `src/components/CollaborationBrief.tsx`
- Create: `src/styles/inspect.css`, `src/styles/brief.css`
- Create: `tests/ui/inspect.test.tsx`, `tests/ui/brief.test.tsx`, `tests/ui/keyboard.test.tsx`
- Modify: `src/app/App.tsx`, `src/components/EvidenceField.tsx`

**Interfaces:**
- Consumes: focused-project, reason, brief, and mode selectors plus façade commands.
- Produces: stable-shell inspect, editable in-memory brief, copy flow, and return/reset controls.

- [ ] **Step 1: Write the inspect test**

Run a match, activate BDB, assert `SELECTED EVIDENCE`, deterministic `WHY SELECTED`, matched requirements, claims, limitations, and public boundary. Assert the field remains mounted and Escape restores the prior match.

- [ ] **Step 2: Implement stable-shell inspect**

Keep the field behind a dominant inspect surface with dim/recede state. Render only derived evidence and curated links. Focus the inspect heading on entry and restore the project node on exit.

- [ ] **Step 3: Write the brief test**

Create a scenario-A brief and assert editable project type/requirements/context/timeline/budget, relevant projects, known gaps, source match, `COPY BRIEF`, and `BACK TO EVIDENCE`. Assert no submit/send/CRM/booking control.

- [ ] **Step 4: Implement the brief workspace**

Bind inputs to façade updates, keep evidence/gaps tied to the source match, and format plain clipboard text. Call `navigator.clipboard.writeText` only from the user button, with a selected-text fallback and visible outcome.

- [ ] **Step 5: Add keyboard and motion tests**

Test Tab-reachable nodes, Enter inspect, Escape return, focus restoration, live announcements, non-color labels, and reduced-motion hooks.

- [ ] **Step 6: Run complete UI and static suites**

Run: `npm run test -- tests/ui`

Expected: PASS.

Run: `npm run typecheck && npm run lint`

Expected: PASS.

- [ ] **Step 7: Review without committing**

Confirm why-selected is derived, brief state is in-memory/reversible, and no unsafe HTML exists. Create no commit.

---

### Task 7: Integration, Documentation, Manual QA, and Final Commit

**Files:**
- Create: `tests/ui/tool-effects.test.tsx`, `tests/ui/responsive-contract.test.tsx`, `README.md`
- Modify: implementation files only for defects revealed by verification

**Interfaces:**
- Consumes: complete application.
- Produces: verified P0 release candidate and the only local commit.

- [ ] **Step 1: Write end-to-end in-process tool-effect tests**

Execute match, focus, and brief through real definitions on the fake port. Assert visible match/inspect/brief modes equal the semantic results from direct manual façade calls.

- [ ] **Step 2: Add responsive contract tests**

Assert critical controls remain rendered and labelled under 390, 768, and 1366 viewport hooks. Keep visual inspection as final authority.

- [ ] **Step 3: Write README**

Cover product purpose, WebMCP value, flow, architecture, run commands, scenarios A–D, optional testing flag, evidence policy, private boundary, and ULTRA-01 status. Add no Devpost copy.

- [ ] **Step 4: Run all automated gates separately**

```powershell
npm run typecheck
npm run test
npm run lint
npm run build
git diff --check
```

Expected: every command PASS with no new warning caused by implementation.

- [ ] **Step 5: Run manual scenarios and interaction flow**

Verify A–D, inspect, brief create/edit/copy, clear, reset, keyboard actions, and fully functional manual mode when WebMCP is unavailable.

- [ ] **Step 6: Inspect 390, 768, and 1366 surfaces**

Verify no horizontal overflow; composer, field, ranked results, inspect return, brief editing/copy, focus, and reduced-motion remain functional. Save useful QA screenshots under `qa-screenshots/` only.

- [ ] **Step 7: Attempt real WebMCP smoke verification**

If `document.modelContext` exists, verify seven tools, match, focus, brief, and teardown. If unavailable, record `NOT_AVAILABLE`; adapter/contract/manual tests remain authoritative for ULTRA-01.

- [ ] **Step 8: Run self-review searches**

```powershell
rg -n "TODO|TBD|dangerouslySetInnerHTML|innerHTML|navigator\\.modelContext|exposedTo|successProbability|fitProbability" src tests docs README.md
rg -n "fetch\\(|XMLHttpRequest|WebSocket|localStorage|sessionStorage|supabase|apiKey|secret" src
```

Expected: no critical placeholder, unsafe rendering, deprecated API, fake probability, runtime network/storage integration, or secret.

- [ ] **Step 9: Stage and run cached diff check**

```powershell
git add .
git diff --cached --check
git status --short
```

Expected: PASS with only intended target-repository files staged.

- [ ] **Step 10: Create the single commit**

Only after all prior gates pass:

```powershell
git commit -m "feat: build WebMCP evidence workspace vertical slice"
```

Expected: one root commit on `main`, no remote, clean worktree.

- [ ] **Step 11: Produce the required final report**

Populate every task-requested evidence/domain/WebMCP/UI/security/QA/files/limitations field from verified results. Report real-browser status accurately and name ULTRA-02 as next without starting it.
