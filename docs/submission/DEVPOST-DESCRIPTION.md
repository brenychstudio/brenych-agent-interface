# Brenych Agent Interface

> A portfolio that can prove fit, not only present work.

## Problem

Professional portfolios are designed for people. An agent must otherwise infer capabilities from navigation, prose, and screenshots, with no reliable way to distinguish demonstrated evidence from a plausible guess.

## Solution

Brenych Agent Interface is a WebMCP evidence workspace where people and agents evaluate real project capabilities together. A bounded tool surface exposes profile discovery, evidence search, deterministic requirement matching, visible project focus, and collaboration-brief creation.

WebMCP keeps both participants on the same page. The agent can evaluate requirements, the evidence field visibly recomposes, and the human can inspect why each project was selected. A collaboration brief then appears as an editable, page-local working document with no send or persistence action.

## Human + agent flow

1. The person or agent supplies project requirements.
2. `match_requirements` runs the deterministic matcher and visibly recomposes the evidence field.
3. `focus_project` opens the selected project's evidence, provenance, and limitations.
4. `create_collaboration_brief` creates an editable page-local draft for human review.
5. Negative fit remains visible as **NOT DEMONSTRATED** rather than being inflated into a match.

## Implementation

- React and TypeScript render the shared interface.
- Zustand owns reversible semantic UI state.
- Motion animates deterministic spatial recomposition.
- A pure deterministic matcher evaluates evidence coverage; it is not probabilistic scoring.
- Exactly 7 bounded WebMCP tools expose the application facade.
- 15 user-approved WebP evidence assets show reviewed project interfaces.
- Supporting showcase systems never change scores or ranks.

There is no LLM runtime, backend, database, analytics pipeline, or private-source access. The application cannot read private repositories, credentials, customer records, or a user's filesystem. Collaboration drafts remain in page state and are never submitted automatically.

## Trust model

Technical claims come from curated evidence records, not screenshot text. Evidence coverage is not a probability, unsupported requirements remain visible, and every inspect surface distinguishes public evidence from public-safe summaries. The same application facade serves manual controls and WebMCP tools.

## Release status

- Public live site: **PENDING**
- Real WebMCP host certification: **PENDING**
- ChatGPT Site Tools certification: **PENDING**
- Demo video and public YouTube URL: **PENDING**

These items must be updated only after the corresponding public checks are completed.
