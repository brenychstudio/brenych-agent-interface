# BAI-ULTRA-02 Design

**Status:** Approved for implementation by the user-provided `BAI-ULTRA-02` task.

## Goal

Turn the existing deterministic WebMCP evidence workspace into a challenge-grade,
agent-native product experience with real approved media, authored spatial
recomposition, cinematic evidence inspection, honest provenance, and an editable
local collaboration brief.

## Non-negotiable architecture

The existing flow remains:

```text
public evidence -> pure domain -> AgentInterface -> StatePort/Zustand
                -> WebMCP and manual controls -> shared React interface
```

The seven `ProjectId` values remain the complete scored Evidence Graph. Matching
strengths, evidence coverage, ranking, negative fit, one-hop related edges, and
stable `MatchResult.id` remain unchanged. The four visual studio systems are a
separate `ShowcaseProof` catalog with `scoring: false`; they cannot enter
`Project`, `EvidenceRecord`, `MatchDataset`, `rankProjects()`, or collaboration
brief project IDs.

## Data and media

Add a typed presentation registry for exactly 15 approved screenshot derivatives.
Each record owns a stable ID, a core-project or showcase owner, primary/secondary
role, relative public path, descriptive alt text and caption, fixed dimensions,
`user_approved_screenshot` provenance, `publicSafe: true`, and a SHA-256 digest.
The source directory is never recorded in committed files and is never modified.

Add exactly four `ShowcaseProof` records: WEBHERO, Photo Web, Artist Stage, and
Model Site. Add display-only verified highlights to the seven core projects.
Highlights and media are presentation evidence and cannot change scoring.

## Experience

The persistent evidence field becomes a dark editorial stage within the quiet
paper shell. Core nodes use real media where approved and typographic art direction
where no approved screenshot exists. Before evaluation all seven are neutral.
After evaluation deterministic rank state changes position, scale, depth, and
opacity: rank one dominates, ranks two and three remain near, and all other
projects recede without disappearing.

Active Match Mode includes a bounded requirement-to-capability-to-project trace.
It is semantic, derived from actual match evidence, limited in count, and rendered
with CSS/SVG. Reduced motion renders the settled state immediately.

Inspect remains an integrated surface rather than a modal. The field stays mounted,
the selected node remains dominant, peers recede, and the inspect surface exposes
up to two real images plus a structured evidence rail: what the project is, why it
was selected, matched requirements, verified highlights, evidence visibility,
public/private boundary, and limitations. Back/Escape restores the previous field
state and keyboard focus.

The collaboration brief keeps its local-only authority model. It becomes the
primary quiet document in Brief Mode, while the stage is a low-memory trace. It
retains editable project type, requirements, context, timeline, budget, evidence
chips, known gaps, copy, and back controls.

The supporting studio layer appears below the core experience with explicit
`SUPPORTING PROOF - NON-SCORING` and `NOT INCLUDED IN EVIDENCE COVERAGE` labels.
It becomes visually quieter whenever a match, inspect, or brief is active.

## WebMCP

Keep the seven existing names and annotations. Add a human-readable title, a
selection-oriented description, and descriptions for every schema input. Make
the read-only versus visible-state-changing distinctions explicit, especially
`get_capabilities` versus `match_requirements` and `get_project` versus
`focus_project`.

Continue to register only through `document.modelContext`. Preserve same-origin
defaults, registration cancellation, duplicate-start protection, and unsupported
browser fallback. Add an adapter test that proves registration forwards only the
abort signal and never adds cross-origin exposure.

Create a machine-readable corpus of at least 24 deterministic WebMCP eval cases.
It covers profile/capability/project discovery, read-only evidence access, direct,
ambiguous, and negative fit, stateful focus and brief flows, and adversarial prompts
for which no unsafe tool exists. Tests validate the corpus without an LLM.

## Accessibility, responsive behavior, and performance

Every core project remains a real button with visible focus, Enter/Space inspect,
and Escape return. Images have meaningful alt text and reserved dimensions. No
meaning is color-only. Integrated surfaces do not trap focus. ARIA live regions
remain limited to real state changes.

Desktop uses controlled 2.5D DOM transforms. Tablet uses an asymmetric two-column
field. At 620px and below the field becomes a ranked vertical stream with full-width
media and a compact match summary. Supported QA widths are 390, 430, 768, 1024,
and 1366 pixels, with no horizontal overflow.

Only the first necessary primary image loads eagerly; other core secondary and
supporting images load lazily with async decoding. No new runtime dependency,
WebGL engine, video runtime, network write, backend, or API is introduced.

## Verification and release boundary

Required gates are media/hash validation, eval validation, typecheck, full tests,
lint, production build, diff check, audit, security scan, responsive browser QA,
and independent engineering/product review. Create exactly one final commit named
`feat: harden WebMCP evidence experience`. Do not push, deploy, publish, or begin
ULTRA-03.
