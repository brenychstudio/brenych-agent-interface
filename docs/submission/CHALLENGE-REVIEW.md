# Provisional Challenge Criteria Review

Review date: **2026-08-31**

Status: **provisional release review**. Scores reflect the current local product and source evidence. They must be revisited after the public deployment, real Chrome WebMCP execution, ChatGPT desktop Site Tools evaluation, and final demo video exist.

## Score summary

| Criterion | Provisional score |
| --- | ---: |
| WebMCP leverage | **8.5 / 10** |
| Execution | **7.5 / 10** |
| Potential impact | **7.5 / 10** |
| Creativity & ambition | **8.5 / 10** |

No score is a submission claim or judge prediction.

## WebMCP leverage — 8.5 / 10

### Evidence

- BAI exposes seven purpose-specific tools rather than one generic escape hatch.
- Read operations distinguish profile, capability, project-list, and project-dossier discovery.
- `match_requirements`, `focus_project`, and `create_collaboration_brief` update the same visible interface a person uses.
- The agent's work is inspectable: matching visibly recomposes the evidence field, focus opens real evidence, and brief creation produces a human-editable page-local draft.
- Manual and WebMCP commands share one application facade and deterministic semantic state.
- Tool annotations truthfully distinguish read-only operations from reversible local UI mutations.
- There is no filesystem, shell, database, CRM, email, token, arbitrary-fetch, private-repository, or network-write tool.

### Remaining weakness

The central promise is proven by source tests and fake-host execution, not yet by a real Chrome host or ChatGPT Site Tools session. Until the final deployed page exposes exactly seven tools and the natural-language prompt table passes, the strongest challenge-specific claim remains provisional.

## Execution — 7.5 / 10

### Evidence

- The architecture is small and coherent: pure domain logic, one application facade, Zustand semantic state, an isolated WebMCP adapter, and React presentation.
- Deterministic matching keeps exact, alias, related, and missing evidence visibly separate.
- Negative fits remain visible instead of being converted into optimistic recommendations.
- Seven scored projects remain isolated from four explicitly non-scoring Showcase Proof systems.
- The experience includes semantic ranks, bounded connection traces, evidence-backed Inspect, public/private provenance, editable Brief, honest fallback, keyboard paths, responsive intent, and reduced-motion support.
- Physical normal-browser QA passed the full manual journey at 390, 430, 768, 1024, and 1366 CSS pixels with no horizontal overflow, clipped buttons, or console errors. All 15 unique evidence assets loaded across the inspected projects and Showcase.
- Keyboard QA confirmed Enter-to-open, Escape-to-return, and a visible 2px focus outline. The manual Swift + Metal + native iOS case returned 0% coverage with all three requirements marked **NOT DEMONSTRATED** and no fabricated direct evidence.
- The final staged BAI-ULTRA-03 worktree passed a clean install, typecheck, 31 test files / 162 tests, lint, build, media and eval validators, diff-check, and an npm audit with 0 vulnerabilities.

### Remaining weakness

There is no certified public deployment, final release SHA, deployed console/network record, or real-host execution matrix yet. The five target widths, complete keyboard-only journey, accessibility-tree semantics, reduced motion, and color-independent state comprehension now have physical normal-browser evidence, but deployed performance and network measurements remain pending.

## Potential impact — 7.5 / 10

### Evidence

- The product addresses a real agent-era problem: portfolios are visually rich but structurally ambiguous to agents.
- The pattern could extend beyond portfolios to vendor evaluation, procurement evidence, grant review, expert directories, and other proof-based discovery workflows.
- Evidence coverage, verification, limitations, and negative fit can reduce unsupported capability claims.
- The interface keeps human review central instead of hiding agent activity in a separate automation layer.
- The manual fallback makes the same evidence useful even without a compatible agent host.

### Remaining weakness

The current application is a curated, single-studio corpus with no longitudinal use data, external evaluator study, or proof that agents select the right tool across accounts and models. Broader impact is plausible but not yet measured. The release should present this as a reusable interaction pattern, not as validated market adoption.

## Creativity & ambition — 8.5 / 10

### Evidence

- BAI treats the portfolio itself as an agent-operable evidence surface instead of attaching a chatbot to a conventional site.
- The persistent authored field translates deterministic rank state into visible spatial recomposition.
- Inspect retains the field as context while exposing real imagery, Why Selected reasoning, evidence provenance, limitations, and public/private boundaries.
- The editable Brief makes the agent-to-human handoff concrete without introducing a backend, submission action, or hidden persistence.
- Supporting visual systems are deliberately shown without contaminating the scored evidence graph.
- The design combines a restrained editorial interface with explicit machine-readable contracts and trust boundaries.

### Remaining weakness

The ambition currently lives within a front-end demonstration and a bounded static dataset. The submission still needs a concise video that makes the agent-driven state changes unmistakable; otherwise judges may perceive a polished portfolio matcher before they perceive the WebMCP interaction model.

## Twenty-second judge test

### What is it?

A public evidence workspace that evaluates what a portfolio can actually prove against stated requirements.

### What does WebMCP add?

Typed tools let an agent discover evidence, run deterministic matching, focus the relevant proof, and create a reversible collaboration brief without guessing from page layout.

### What changes visibly?

The same evidence field a person sees recomposes after `match_requirements`; `focus_project` opens the selected proof; `create_collaboration_brief` reveals an editable page-local document.

### Where does human control remain?

Every core action has a manual path. The human sees provenance, inspects reasons and limitations, edits the brief, returns, clears, or resets. No tool can send, persist, access private systems, or perform an external write.

## Release-critical findings

1. Real localhost Chrome WebMCP execution is currently `BLOCKED_BY_HOST_ACCESS`; the observed normal browser exposed no `document.modelContext`.
2. The deployed-host tool inventory and direct match/focus/brief/negative-fit effects are not yet certified.
3. ChatGPT desktop Site Tools discovery and prompts A–H are not yet run.
4. Public repository, live deployment, video, Devpost entry, final release SHA/tag, and submission freeze remain external release gates.

## Important remaining work

- Preserve the verified local gate and deploy only the exact committed release build.
- Repeat the verified accessibility journey on the deployed build and record deployed performance/network observations.
- Capture exact Chrome version, flag, origin, tool inventory, inputs, results, visible effects, and console/network observations.
- Repeat direct certification on the deployed origin before recording ChatGPT Site Tools results.
- Make the demo video show the seven tools and visible state changes early enough that WebMCP leverage is unmistakable.

## Provisional recommendation

The concept and local execution are strong enough to continue toward submission, but the release is **not yet safe to describe as fully WebMCP-certified or submission-ready**. Keep the current scores provisional until the host, deployment, Site Tools, video, and final freeze gates are complete.
