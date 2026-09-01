# BAI-ULTRA-03B Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the creator-approved cinematic evidence presentation: full-bleed single-scroll Inspect/Brief, uncropped and inspectable evidence media, honest latent Native Site Control presentation, real Presence OS/SprintCRM media, restrained showcase motion, and verified live continuation links.

**Architecture:** Keep Zustand and `AgentInterface` as the only semantic state path and add only presentation metadata/state after domain matching. A single Motion `LayoutGroup` spans the persistent evidence stage, full-width paper foreground, showcase chapters, and a shared portal-based media dialog. MotionValues/refs own high-frequency pointer and scroll effects; document flow owns vertical scrolling.

**Tech Stack:** React 19, TypeScript 5.9, Zustand 5, Motion 13, CSS, Vitest, Testing Library, Vite, Cloudflare Pages.

**Spec:** Creator-approved `BAI-ULTRA-03B — FINAL CINEMATIC EVIDENCE PRESENTATION + MEDIA INSPECT + LIVE PROJECT CONTINUATION` task attached in this session. It is not copied verbatim into the repository because it contains workstation-local source paths.

## Global Constraints

- Work only in the isolated 03B worktree on `fix/bai-ultra-03b`, based on `33368842a7c0b3ab5f129a8300faa9a7025bc7fe`.
- Keep `main`, `fix/bai-ultra-03a`, the 03A worktree, and production untouched.
- Keep exactly seven scored projects, four non-scoring showcase systems, and seven WebMCP tools.
- Do not edit `src/domain/matchRequirements.ts`, `src/domain/rankProjects.ts`, `src/domain/buildCollaborationBrief.ts`, or `src/webmcp/toolDefinitions.ts`, including formatting-only edits.
- Matching, ranking, evidence coverage, aliases, negative fit, `MatchResult` identity, brief derivation, tool names/schemas/annotations, and public/private evidence semantics remain frozen.
- Preserve `presentationTier: "flagship" | "extended"`; add a separate presentation-only default-presence model with four evidence objects, two extended signals, and one latent record.
- Use one natural document scroll for Inspect and Brief at 390, 430, 768, 1024, 1366, and 1920 pixels; no nested vertical document region.
- Every interface screenshot uses real dimensions and `object-fit: contain`; never crop, stretch, reconstruct, enhance, or fabricate media.
- Import exactly two Presence OS images and one SprintCRM image; keep the third Presence image outside the repository as reserve. Never commit the absolute source path.
- Approved media selection: Presence primary `presence-os-memory-atlas-1.png`, Presence secondary `presence-os-memory-atlas-3.png`, reserve `presence-os-memory-atlas-5.png`, SprintCRM `sprintcrm-hero.webp`.
- Use only existing Motion. Add no Three.js, R3F, GSAP, lightbox/carousel/video runtime, backend, LLM API, or network-write behavior.
- Pointer/drag/scroll animation must not update React state per pixel; use MotionValues or mutable refs. Preserve pan approximately ±76/±42 and parallax ±18/±12.
- `Apply`-style semantics do not exist here: all existing human-controlled brief and AgentInterface authority boundaries remain unchanged.
- Follow strict red → observed expected failure → green → refactor for every behavior change. Read and follow `writing-good-tests.md` before changing tests.
- Do not create intermediate commits. After engineering gates and physical QA, create exactly one commit: `fix: complete cinematic evidence presentation`.
- Deploy only an isolated 03B Cloudflare preview after the final commit and clean-worktree check. Do not deploy production, merge, push, tag, or claim creator approval.

## Certified Preflight Facts

- Baseline at `33368842a7c0b3ab5f129a8300faa9a7025bc7fe`: typecheck PASS, `175/175` tests PASS, lint PASS, build PASS, media/evals PASS, diff-check PASS, and npm audit 0 vulnerabilities.
- Baseline bundle: JS `405.43 kB` / `125.88 kB gzip`; CSS `30.47 kB` / `6.76 kB gzip`.
- Approved input inventory is exactly four files: three Presence OS / Memory Atlas screenshots plus one SprintCRM screenshot. SprintCRM privacy review found blank credentials fields and no personal/customer/secret/path data.
- Verified showcase continuation URLs are WEBHERO `https://brenychstudio.com/immersive/webhero/`, Photo Web `https://photo.brenychstudio.com/`, and Artist Stage `https://brenych-artist-stage.brenychinfo.workers.dev/`.
- Verified core/global destinations are Presence OS `https://brenychstudio.com/immersive/presence-os-memory-atlas/`, Studio `https://brenychstudio.com/`, and source `https://github.com/brenychstudio/brenych-agent-interface`.
- Model Site has no deployed public URL (`hosting.liveUrl: null`, deployment `not-deployed`), so it receives no live-site CTA. SprintCRM and Native Site Control likewise receive no invented public URL.

---

## File Map

**Create**

- `src/components/CinematicMediaInspect.tsx` — shared accessible portal dialog, media navigation, body/root inert lifecycle, focus trap/restore, and optional verified continuation.
- `src/components/ShowcaseProofChapter.tsx` — one authored showcase chapter with MotionValue-driven viewport/scroll choreography and media triggers.
- `src/styles/media-inspect.css` — focused editorial full-viewport viewer styles and reduced-motion behavior.
- `src/presentation/projectLinks.ts` — verified presentation-only showcase continuation URLs and core link lookup without scoring imports.
- `tests/ui/media-inspect.test.tsx` — shared core/showcase dialog behavior, complete-image policy, navigation, focus, inert, and scroll restoration.
- `tests/ui/presentation-03b.test.tsx` — cross-surface full-bleed/single-scroll/heading/contain acceptance hooks.

**Modify**

- `src/app/App.tsx`, `src/components/ExperienceStage.tsx` — one `LayoutGroup`, media-viewer orchestration, staged foreground lifecycle, and full-bleed paper ownership.
- `src/components/EvidenceField.tsx`, `src/components/ProjectNode.tsx`, `src/state/selectors.ts` — MotionValue camera, latent NSC filtering/promotion, and the full evidence index.
- `src/components/ProjectEvidenceInspect.tsx`, `src/components/CollaborationBrief.tsx` — four-zone Inspect, typographic NSC state, viewer triggers, verified rail links, natural document flow, and sticky Back.
- `src/components/ShowcaseProofLayer.tsx`, `src/presentation/showcaseProofs.ts`, `src/presentation/types.ts` — four chapters, exact descriptions/three labels, verified links, and media-inspect data.
- `src/presentation/projectPresentation.ts`, `src/presentation/evidenceMedia.ts` — default-presence metadata and 18-asset typed registry.
- `src/styles/experience-stage.css`, `src/styles/evidence-field.css`, `src/styles/inspect.css`, `src/styles/brief.css`, `src/styles/showcase.css`, `src/main.tsx` — full-width paper, natural scroll, contain geometry, staged entry, restrained scroll motion, and viewer import.
- `docs/EVIDENCE-MEDIA-MANIFEST.md`, `ASSET-NOTICE.md`, `docs/submission/ASSET-RIGHTS-CHECK.md` — 18 reviewed media records and rights/count wording.
- Existing presentation/UI/media/security tests — replace superseded 03A expectations with stronger 03B behavior contracts without weakening frozen regression coverage.

---

### Task 1: Full-Bleed Foreground and One Natural Scroll

**Files:**
- Test: `tests/ui/presentation-03b.test.tsx`
- Modify: `tests/ui/experience-stage.test.tsx`, `tests/ui/brief.test.tsx`, `tests/ui/responsive-contract.test.tsx`
- Modify: `src/components/ExperienceStage.tsx`, `src/components/ProjectEvidenceInspect.tsx`, `src/components/CollaborationBrief.tsx`
- Modify: `src/styles/experience-stage.css`, `src/styles/inspect.css`, `src/styles/brief.css`

**Interfaces:**
- `ExperienceStage` continues to consume the existing `mode`, `studioRail`, `field`, `match`, `inspect`, and `brief` nodes.
- `.stage-foreground` becomes the full-width paper owner; `.stage-foreground-inner` bounds readable content without exposing dark side bands.
- Inspect/Brief keep the field canvas mounted, `inert`, and `aria-hidden` while using document flow rather than `max-height`/`overflow:auto`.

- [ ] **Step 1: Write the failing structural tests.** Assert Inspect/Brief foregrounds own the stage, background remains inert, only active foreground content exists, project name is the Inspect `h2`, and both surfaces expose the runtime contract `data-scroll-owner="document"` with no nested scroll-region role/tab stop. Physical browser QA, rather than a source-text assertion, proves the computed scrollbar count.

```tsx
expect(screen.getByRole("heading", { name: "BDB", level: 2 })).toBeInTheDocument();
expect(screen.getByTestId("experience-stage")).toHaveAttribute("data-foreground", "inspect");
expect(screen.getByTestId("foreground-paper")).toContainElement(
  screen.getByRole("heading", { name: "BDB" }),
);
expect(screen.getByTestId("evidence-field").closest("[data-stage-canvas]")).toHaveAttribute("inert");
expect(screen.getByRole("region", { name: "BDB evidence inspect" }))
  .toHaveAttribute("data-scroll-owner", "document");
```

- [ ] **Step 2: Run RED.** Run `npm test -- tests/ui/presentation-03b.test.tsx tests/ui/experience-stage.test.tsx tests/ui/brief.test.tsx tests/ui/responsive-contract.test.tsx`. Expected: fail on old generic heading, constrained surfaces, and nested-scroll CSS.
- [ ] **Step 3: Implement the minimal full-bleed topology.** Keep one field node, make the paper backdrop full stage width, add an inner readable wrapper, remove desktop/tablet surface height caps and overflow, and make Back sticky relative to document flow.
- [ ] **Step 4: Run GREEN and refactor.** Re-run the focused command, then `npm test -- tests/ui/manual-flow.test.tsx tests/ui/inspect.test.tsx`. Expected: all pass with scroll/focus restoration retained.

---

### Task 2: Complete Screenshot Geometry and Real Media Import

**Files:**
- Modify: `tests/media/evidenceMedia.test.ts`, `tests/security/publicBoundary.test.ts`, `tests/ui/presentation-03b.test.tsx`, `tests/ui/inspect.test.tsx`
- Modify: `src/presentation/types.ts`, `src/presentation/evidenceMedia.ts`
- Add: `public/evidence/presence-os-memory-atlas/presence-os-memory-field.webp`
- Add: `public/evidence/presence-os-memory-atlas/presence-os-spatial-inspect.webp`
- Add: `public/evidence/sprintcrm/sprintcrm-workspace.webp`
- Modify: `docs/EVIDENCE-MEDIA-MANIFEST.md`, `ASSET-NOTICE.md`, `docs/submission/ASSET-RIGHTS-CHECK.md`, `src/styles/inspect.css`

**Interfaces:**
- Add media IDs `presence-os-memory-field`, `presence-os-spatial-inspect`, and `sprintcrm-workspace` to `EvidenceMediaId`.
- Preserve `EvidenceMedia` fields and `mediaForOwner(ownerId)`.
- Total registry/file/manifest count becomes exactly 18; primary count 10, secondary count 8.

- [ ] **Step 1: Write failing manifest/contain tests.** Pin the expected 18 IDs, owner/role/sourceKind/publicSafe metadata, actual file hashes/dimensions, exact public-tree count, and `aspect-ratio: width / height` data/style hooks. Require all Inspect screenshot buttons/images to advertise `data-fit="contain"` and never `cover`.
- [ ] **Step 2: Run RED.** Run `npm test -- tests/media/evidenceMedia.test.ts tests/security/publicBoundary.test.ts tests/ui/presentation-03b.test.tsx`. Expected: fail at 15 records and missing files/contain hooks.
- [ ] **Step 3: Create reviewed derivatives outside tracked paths first.** Use FFmpeg WebP lossless or visually indistinguishable high-quality encoding; never crop the selected screenshots. Visually compare every derivative with the original at full detail before copying it into its final path. Compute dimensions, SHA-256, and byte size from the derivative—not the source.
- [ ] **Step 4: Import only the three approved derivatives and update typed/docs records.** Do not copy `presence-os-memory-atlas-5.png`. Add explicit sourceKind/publicSafe fields to the human manifest table and update rights/count language.
- [ ] **Step 5: Implement contain geometry.** Use real `width`, `height`, and a CSS custom property or inline `aspectRatio: \`${width} / ${height}\``. All Inspect/preview images use `width:100%`, `height:auto`, `object-fit:contain`, centered on a neutral backing.
- [ ] **Step 6: Run GREEN.** Run `npm run validate:media` and the three focused suites. Expected: 18/18 hashes, dimensions, paths, manifest rows, and binary allowlist pass.

---

### Task 3: Latent Native Site Control and Full Evidence Index

**Files:**
- Modify: `tests/presentation/projectPresentation.test.ts`, `tests/ui/evidence-media.test.tsx`, `tests/ui/field-drag.test.tsx`, `tests/ui/inspect.test.tsx`, `tests/ui/tool-effects.test.tsx`
- Modify: `src/presentation/projectPresentation.ts`, `src/state/selectors.ts`, `src/components/EvidenceField.tsx`, `src/components/ProjectNode.tsx`, `src/components/ProjectEvidenceInspect.tsx`, `src/styles/evidence-field.css`, `src/styles/inspect.css`

**Interfaces:**

```ts
export type ProjectDefaultPresence = "evidence-object" | "extended-signal" | "latent";
export type ProjectVisualForm = ProjectDefaultPresence;
```

- Flagship IDs remain BDB, Weekfield, Distribution Desk, StoryForm.
- Extended tier remains SprintCRM, Native Site Control, Presence OS; default presence is two extended signals plus one latent NSC record.
- `selectProjectNodeStates` still returns all seven semantic records; `EvidenceField` renders latent NSC only when top-three promoted or directly focused.

- [ ] **Step 1: Write failing presence and parity tests.** Assert default visible project buttons = 6, full evidence index buttons = 7, NSC absent from the constellation but reachable from the closed-by-default disclosure, direct focus opens its typographic Inspect, and a real site-control match promotes it when ranked top three.

```ts
expect(nodes.find(({ projectId }) => projectId === "native-site-control"))
  .toMatchObject({ defaultPresence: "latent", visualForm: "latent" });
expect(screen.queryByRole("button", { name: /Project Native Site Control, field/ })).not.toBeInTheDocument();
expect(screen.getByText("7 VERIFIED PROJECT RECORDS")).toBeInTheDocument();
expect(within(screen.getByText("FULL EVIDENCE INDEX").closest("details")!).getAllByRole("button"))
  .toHaveLength(7);
```

Add literal frozen regression assertions for default golden match, CRM match, negative fit, MatchResult IDs, coverage, brief project IDs, and all seven real WebMCP tools before implementing presence metadata.
- [ ] **Step 2: Run RED.** Run the presentation/evidence/inspect/tool suites. Expected: NSC still appears as a default signal and no index exists.
- [ ] **Step 3: Implement presentation-only latent filtering and index.** Keep ranking inputs untouched. Use real buttons that call the same `agent.focusProject` path and pass the originating element for focus restoration. The disclosure is closed by default and keyboard-native.
- [ ] **Step 4: Implement honest NSC Inspect.** Show `ARCHITECTURE FOUNDATION`, `PUBLIC UI NOT YET AVAILABLE`, no media/fake thumbnail, and exactly these six approved foundation bullets: `typed site contracts`, `site manifest`, `revision model`, `validation and apply boundaries`, `repository provider boundary`, and `deployment provider boundary`. Do not claim an Admin UI.
- [ ] **Step 5: Run GREEN plus frozen suites.** Run `npm test -- tests/presentation/projectPresentation.test.ts tests/ui/evidence-media.test.tsx tests/ui/inspect.test.tsx tests/ui/tool-effects.test.tsx tests/domain tests/webmcp`. Expected: presentation changes only; all frozen outputs identical.

---

### Task 4: Shared Cinematic Media Inspect

**Files:**
- Create: `src/components/CinematicMediaInspect.tsx`, `src/styles/media-inspect.css`, `tests/ui/media-inspect.test.tsx`
- Modify: `src/app/App.tsx`, `src/components/ProjectEvidenceInspect.tsx`, `src/components/ShowcaseProofLayer.tsx`, `src/main.tsx`

**Interfaces:**

```ts
export interface MediaInspectCollection {
  readonly title: string;
  readonly media: readonly EvidenceMedia[];
  readonly liveUrl?: string;
}

export interface MediaInspectRequest extends MediaInspectCollection {
  readonly activeId: EvidenceMediaId;
  readonly origin: HTMLElement;
}
```

`CinematicMediaInspect` consumes one open request and `onClose`. It portals outside the inert application root, uses the same media registry objects, and does not create a semantic Zustand mode.

- [ ] **Step 1: Read `writing-good-tests.md`, then write failing dialog tests.** Open from core primary/secondary and showcase primary/secondary; assert `role="dialog"`, `aria-modal`, title/caption association, contain dimensions, Escape, ArrowLeft/Right, Prev/Next, verified-link conditionality, focus wrap, background inert, body lock, original body styles/scroll restoration, and origin focus restoration.
- [ ] **Step 2: Run RED.** Run `npm test -- tests/ui/media-inspect.test.tsx tests/ui/inspect.test.tsx tests/ui/showcase.test.tsx`. Expected: component and triggers absent.
- [ ] **Step 3: Implement the minimal shared portal dialog.** Use `AnimatePresence`/Motion and shared `layoutId` values; store previous body overflow/position and root inert state; trap Tab/Shift+Tab across real controls; restore every prior value and focus on close/unmount. Navigate only within the selected project collection.
- [ ] **Step 4: Wire unambiguous media buttons.** Field cards still open projects. Only media inside Inspect/showcase opens the dialog, with a restrained `VIEW FULL INTERFACE ↗` affordance. Secondary images remain lazy; active dialog image becomes eager.
- [ ] **Step 5: Run GREEN and accessibility suites.** Re-run focused tests plus `tests/ui/keyboard.test.tsx` and `tests/ui/responsive-contract.test.tsx`.

---

### Task 5: Cinematic Project Entry/Exit and MotionValue Camera

**Files:**
- Modify: `tests/ui/field-drag.test.tsx`, `tests/ui/experience-stage.test.tsx`, `tests/ui/inspect.test.tsx`, `tests/ui/responsive-contract.test.tsx`
- Modify: `src/app/App.tsx`, `src/components/ExperienceStage.tsx`, `src/components/EvidenceField.tsx`, `src/components/ProjectNode.tsx`, `src/components/ProjectEvidenceInspect.tsx`, `src/styles/experience-stage.css`, `src/styles/evidence-field.css`, `src/styles/inspect.css`

**Interfaces:**
- One `LayoutGroup` wraps field, foreground, showcase, and media viewer.
- `EvidenceField` stores semantic hover/focus and drag-start/end only in React state; `panX`, `panY`, `pointerX`, and `pointerY` are MotionValues/refs.
- Stable observable hooks include selected project ID, foreground phase, shared layout IDs, and reduced-motion final state; tests do not assert exact milliseconds.

- [ ] **Step 1: Write failing motion-architecture tests.** Assert pointer/drag preserves ±76/±42 and ±18/±12 observable data, 50 high-frequency pointer moves leave a stable `data-render-count` while the camera transform changes, one LayoutGroup marker, selected/receded hooks, shared media layout IDs, Back/Escape exact focus/page-position restoration, and immediate reduced-motion final phase. This tests the real render behavior rather than grepping implementation source for state setters.
- [ ] **Step 2: Run RED.** Run the four focused UI suites. Expected: current pointer path still calls React state per pixel and staged foreground hooks are absent.
- [ ] **Step 3: Move high-frequency input to MotionValues/refs.** Update DOM diagnostic attributes only at bounded low frequency or derive them from refs for tests; do not render on every pixel. Keep touch page scrolling unclaimed.
- [ ] **Step 4: Add staged Motion variants.** Encode selected-node wake/recede, media travel, paper backdrop, and content stagger with a total target around 650–800ms. Close reverses the same logic. `useReducedMotion` resolves immediately with no traveling media or delay.
- [ ] **Step 5: Run GREEN.** Re-run focused suites and the full application transition suite. Physical motion quality remains a later browser gate, not an automated PASS claim.

---

### Task 6: Four-Zone Inspect, Brief Continuity, and Verified Links

**Files:**
- Create: `src/presentation/projectLinks.ts`
- Modify: `tests/ui/inspect.test.tsx`, `tests/ui/brief.test.tsx`, `tests/presentation/showcaseProofs.test.ts`
- Modify: `src/components/ProjectEvidenceInspect.tsx`, `src/components/CollaborationBrief.tsx`, `src/presentation/showcaseProofs.ts`, `src/presentation/types.ts`, `src/styles/inspect.css`, `src/styles/brief.css`

**Interfaces:**
- Inspect zones are project identity, media hero (or honest typographic frame), public evidence summary, and evidence rail; low-level records remain in `VIEW EVIDENCE DETAILS`.
- Core links continue from existing dossier evidence; presentation link lookup adds only independently verified showcase links.
- Every external link uses `target="_blank"` and `rel="noopener noreferrer"`.

- [ ] **Step 1: Write failing content/link tests.** Assert project name is dominant `h2`, selected-evidence text is only a kicker, primary/secondary are complete/clickable, summary line length hooks exist, rail contains maturity/verification/visibility/verified continuation, Brief remains full-bleed/single-scroll and preserves every authority string/action.
- [ ] **Step 2: Run RED.** Run Inspect/Brief/showcase presentation tests.
- [ ] **Step 3: Implement four-zone geometry without semantic changes.** Reorder existing dossier/focus/match values only; do not derive new score/reason text. Preserve heading focus, disclosure, brief creation, draft editing/copy, and `CONTINUE WITH BRENYCH STUDIO ↗`.
- [ ] **Step 4: Add verified links only.** Hard-code verified HTTPS destinations in the presentation registry. Omit Artist Stage when independent identity/status verification is not conclusive; omission does not block the task. Do not invent SprintCRM or NSC routes.
- [ ] **Step 5: Run GREEN.** Re-run focused tests, public-boundary tests, and frozen semantic tests.

---

### Task 7: Showcase Chapters and Restrained Scroll Choreography

**Files:**
- Create: `src/components/ShowcaseProofChapter.tsx`
- Modify: `tests/presentation/showcaseProofs.test.ts`, `tests/ui/showcase.test.tsx`, `tests/ui/media-inspect.test.tsx`
- Modify: `src/components/ShowcaseProofLayer.tsx`, `src/presentation/showcaseProofs.ts`, `src/presentation/types.ts`, `src/styles/showcase.css`

**Interfaces:**
- `ShowcaseProof` gains exactly three presentation-only `capabilityLabels` and optional verified `liveUrl`.
- `ShowcaseProofChapter` consumes one typed proof, resolved two-item media collection, index, mode, and media-open callback.
- Motion uses `useScroll`/`useTransform`; React scroll state is forbidden.

- [ ] **Step 1: Write failing chapter tests.** Assert exactly four systems, two clickable images per system, exact approved 1–2 sentence summaries, exactly three labels each, Match retains full color, reduced motion exposes static final state, and live CTA appears only for verified URLs.
- [ ] **Step 2: Run RED.** Run presentation/showcase/media-viewer suites. Expected: no labels/actions/chapter motion hooks.
- [ ] **Step 3: Implement `ShowcaseProofChapter`.** Use a local ref with `useScroll`; map progress to restrained primary/secondary y ranges and entry opacity/contrast. Text remains the stable anchor. Avoid perspective rotation, wobble, and continuous animation.
- [ ] **Step 4: Run GREEN.** Re-run focused suites and responsive tests.

---

### Task 8: Frozen Contract and Integrated Regression Certification

**Files:**
- Modify only tests when a new regression assertion is missing; do not edit frozen production files.

- [ ] **Step 1: Run focused immutable outputs.** Run `npm test -- tests/domain/fixtures.test.ts tests/domain/scenarios.test.ts tests/domain/negative-fit.test.ts tests/presentation/projectPresentation.test.ts tests/presentation/showcaseProofs.test.ts tests/webmcp/tools.test.ts tests/webmcp/semantic-parity.test.ts tests/webmcp/lifecycle.test.ts`.
- [ ] **Step 2: Prove frozen files have no diff.** Run `git diff --exit-code 33368842a7c0b3ab5f129a8300faa9a7025bc7fe -- src/domain/matchRequirements.ts src/domain/rankProjects.ts src/domain/buildCollaborationBrief.ts src/webmcp/toolDefinitions.ts`.
- [ ] **Step 3: Run all automated gates.** Run, in order, `npm run typecheck`, `npm run test`, `npm run lint`, `npm run build`, `npm run validate:media`, `npm run validate:evals`, `git diff --check`, and `npm audit`. Record final test count and bundle sizes; investigate/justify JS gzip delta over 30kB against 125.88kB baseline.
- [ ] **Step 4: Scan tracked changes.** Search the staged/diff content for workstation paths/usernames, credentials, Bearer/password strings, emails, private data, and unapproved binary files. Inspect every hit; synthetic test fixtures remain clearly fake.

---

### Task 9: Physical Browser QA, Motion Proof, Single Commit, and Isolated Preview

**Files:**
- Temporary only: QA screenshots/video outside tracked source or under an ignored QA directory.
- No production deployment/config mutation.

- [ ] **Step 1: Build and serve the final app locally.** Use the production `dist`; exercise first viewport, default Field, Match, Weekfield/BDB/Presence/SprintCRM/NSC Inspect, Brief, WEBHERO/Photo Web chapters, desktop/mobile media viewer, and reduced motion.
- [ ] **Step 2: Inspect all required widths.** At 390, 430, 768, 1024, 1366, and 1920 verify one vertical document scrollbar, no horizontal overflow, no image crop/stretch, no text/media collision, no dark side bands/dead zones/z-index errors, reachable sticky Back, all 18 media requests successful, keyboard/focus behavior, and zero console errors.
- [ ] **Step 3: Create motion proof if recording is supported.** Capture 20–35 seconds of pointer parallax, bounded pan, match recomposition, project open, viewer, close, and showcase scroll. Keep it untracked. If unavailable, report exactly `MOTION_PROOF=MANUAL_REVIEW_REQUIRED`; never infer motion quality from DOM tests.
- [ ] **Step 4: Re-run verification immediately before commit.** Repeat all Task 8 automated/security/frozen gates. Confirm `main` and 03A are unchanged, 03B has no untracked QA artifact, and the only expected diff is approved 03B source/tests/docs/media.
- [ ] **Step 5: Create exactly one implementation commit.** Stage the approved diff and commit `fix: complete cinematic evidence presentation`. Verify worktree clean and `HEAD` equals the new commit.
- [ ] **Step 6: Deploy only the isolated 03B Pages preview.** Retrieve current official Wrangler/Pages syntax first. Deploy `dist` with preview branch `fix/bai-ultra-03b`; do not promote/update production. Record deployment ID, immutable URL, branch URL, current commit SHA, `environment=preview`, `commit_dirty=false`, and `noindex=true`.
- [ ] **Step 7: Verify the deployed preview physically.** Recheck representative desktop/mobile Field → Match → Inspect → viewer → Inspect → Brief flow, all external links, all 18 media, console/network, current SHA metadata, and noindex. Return the task’s exact final-report template with status `PASS_WITH_CREATOR_REVIEW` unless a real stop condition requires `BLOCKED`; do not claim creator approval.
