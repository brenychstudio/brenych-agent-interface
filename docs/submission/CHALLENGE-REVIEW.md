# Challenge Criteria Review

Review date: **2026-09-02**
Subject: released runtime `970c3769000e2f30343f9f4f88d627c49f0738d7` at
`https://brenych-agent-interface.pages.dev/`

This document maps the shipped product to the four official judging criteria. It
records evidence, not self-assigned scores.

---

## WebMCP leverage

- Exactly **seven real tools** registered through the current
  `document.modelContext` API — `get_profile`, `get_capabilities`,
  `list_projects`, `get_project`, `match_requirements`, `focus_project`,
  `create_collaboration_brief`.
- **Real tool invocation** through the host's own registered-tool handles, not
  direct application calls.
- **Visible same-page state changes.** Agent actions recompose the interface the
  human is already looking at; there is no separate chat surface.
- **Deterministic requirement matching** — normalized requirements resolved
  through explicit exact, alias and one-hop related edges with fixed weights. No
  embeddings, fuzzy matching or model-generated scores.
- **`focus_project`** opens the same Inspect surface a person reaches by
  clicking, including exact scroll restoration on return.
- **Page-local collaboration brief** — editable, reversible, never transmitted.
- **Negative-fit behaviour** — unsupported requirements stay visible as
  **NOT DEMONSTRATED** instead of being inflated into a match.
- **Chrome host certification: PASS** on the deployed production origin.

Read-only tools are annotated `readOnlyHint: true`; the three state-changing
tools are truthfully marked non-read-only, and the two that accept free text
carry `untrustedContentHint: true`.

## Execution

- **Public working production URL**, HTTP 200, no authentication required.
- **Responsive 390 → 1920**, verified at 390, 768, 1366 and 1920: zero
  horizontal overflow, zero nested vertical scroll, one document scrollbar.
- **Real project evidence** — seven curated public-safe project records and 18
  user-approved WebP evidence assets with pinned hashes, dimensions and
  provenance.
- **Manual fallback** — the full requirements → match → inspect → brief journey
  works without any agent. WebMCP enhances the page; it is not a dependency.
- **Cinematic Inspect and media viewer** — a shared spatial object that expands
  from its cover and returns to it, verified frame-by-frame to land pixel-exact
  with no reversals.
- **Accessibility and reduced motion** — focus is trapped and restored, surfaces
  are keyboard-reachable, and `prefers-reduced-motion` resolves every surface to
  its final state with no travelling media.
- **244 automated tests** across 41 files, plus media and eval validators.
- **Zero known production console errors**; `npm audit` reports 0
  vulnerabilities.

## Potential impact

- Portfolios currently communicate almost entirely to humans; their structure is
  visual and editorial rather than machine-readable.
- Without structured tools, agents infer capability from unstructured
  presentation — navigation, prose and screenshots — which is exactly where
  plausible-sounding but unfounded conclusions come from.
- Structured evidence can improve evaluation, procurement, collaboration
  discovery and agent-assisted business workflows, because the agent reads what
  a body of work actually demonstrates rather than what it appears to claim.
- Honest negative results are part of that value: a system that can say
  **NOT DEMONSTRATED** is more useful for procurement than one that always finds
  a fit.
- The human remains the decision authority throughout. Nothing is sent, booked,
  emailed or persisted by the agent.

## Creativity and ambition

- **Portfolio as evidence interface rather than chatbot.** The agent operates on
  the page instead of beside it.
- **Spatial evidence recomposition** — ranking is expressed as visible spatial
  reordering of a shared field, so a person can watch an agent's reasoning take
  effect.
- **Shared human/agent visible workspace** — both participants act through one
  application facade, so manual and agent paths cannot diverge in behaviour.
- **Deterministic negative fit** as a designed feature rather than an error path.
- **Real portfolio evidence** from shipped studio products, with reviewed
  provenance, instead of synthetic demo records.

---

## Twenty-second judge test

**What is it?** A real creative-technology portfolio that exposes its evidence
as seven WebMCP tools, so people and agents can evaluate fit on the same page.

**What does WebMCP add?** Structured operations — discovery, deterministic
matching, focus and brief creation — instead of an agent guessing at navigation
and screenshots.

**What changes visibly?** The evidence field recomposes around the strongest
real evidence, Inspect opens on the agent's selection, and a page-local brief
appears — all in the interface the human is watching.

**Where does human control remain?** Everywhere. Every agent action is labelled
**WEBMCP ACTION**, every surface is reversible, the manual journey is complete on
its own, and nothing is ever sent.

## Honest limitations

- ChatGPT Site Tools was **not separately certified**; the certified host is
  Chrome, which the Challenge rules accept. No Site Tools pass is claimed.
- The evidence corpus is curated rather than open-ended: the matcher is only as
  good as the recorded evidence, which is the deliberate trade for determinism.
- Two projects have no public live URL, so they carry no live-site call to
  action rather than an invented one.
