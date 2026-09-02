# Devpost Submission Copy — FINAL

This is the final submission copy. Paste the title, tagline and description into
Devpost as written.

## Title

Brenych Studio Agent Interface

## Tagline

A portfolio that can prove fit, not only present work.

## Description

Most portfolios are designed for people to browse. When an AI agent needs to
determine whether a studio is a strong fit for a specific project, it still has
to infer capabilities from marketing copy, screenshots, navigation and visual
presentation.

Brenych Studio Agent Interface turns a real creative-technology portfolio into a
shared evidence workspace for people and AI agents.

The website exposes seven structured WebMCP tools directly from the live page:
profile and capability discovery, project listing and inspection, deterministic
requirement matching, project focusing and local collaboration-brief creation.

The key idea is that the agent does not operate inside a separate chatbot layer.
Its actions change the same visible interface the human is looking at.

An agent can evaluate requirements such as Electron, MCP, AI automation and
Supabase. The interface then recomposes its spatial evidence field around the
strongest real project evidence. The user can immediately inspect why a project
ranked highly, view real screenshots, see verified capabilities and limitations,
and understand which evidence is public and which is owner-verified.

The matching system is deliberately deterministic rather than probabilistic.
Requirements are normalized and matched through explicit exact, alias and
related relationships. There are no embeddings, fuzzy matching or LLM-generated
scores. When the portfolio does not demonstrate something — for example Swift,
Metal or native iOS — the interface returns NOT DEMONSTRATED instead of
manufacturing a fit.

This makes WebMCP a strong fit for the product. Without structured site tools, an
agent would have to guess how to navigate the portfolio and interpret what each
visual project proves. With WebMCP, the site exposes the exact operations an
agent needs while preserving the website as the shared human-facing workspace.

People and agents can therefore evaluate a potential collaboration together: the
agent can discover capabilities, match requirements, surface the strongest
evidence, open a specific project and prepare an editable collaboration brief,
while the human watches the same state change, inspects the evidence and remains
in control.

The collaboration brief is page-local and editable. Nothing is sent
automatically and there is no hidden CRM write or autonomous outreach.

The application is built with React, TypeScript, Zustand and Motion and is
deployed on Cloudflare Pages. Domain matching remains isolated from the browser
integration layer, while WebMCP is registered through the current
document.modelContext API.

The production build exposes exactly seven WebMCP tools and was end-to-end
certified in a real WebMCP-enabled Chrome host, including tool registration,
tool invocation, visible interface recomposition, project focusing, scroll
restoration, collaboration-brief creation and negative-fit behavior.

Brenych Studio Agent Interface explores a simple idea for the agent-native web:

a website should not only present what someone has built — it should also be
able to provide structured evidence of what that work proves.

## Devpost fields

| Field | Value |
| --- | --- |
| Live URL | `https://brenych-agent-interface.pages.dev/` |
| Public repository | `https://github.com/brenychstudio/brenych-agent-interface` |
| License | Apache-2.0 |
| Certified runtime commit | `cf7fc81c7b7829c1adecb9ee4c215cbaeda61ac6` |
| Video URL | operational step — paste the public YouTube URL |

## Technical facts available if a field asks for them

- Exactly 7 bounded WebMCP tools registered through `document.modelContext`.
- 7 scoring project records; 4 non-scoring showcase systems.
- 18 user-approved WebP evidence assets showing reviewed project interfaces.
- Deterministic matcher with fixed weights — exact `1.00`, alias `0.90`,
  related `0.45`, missing `0.00`. Coverage is evidence coverage, not probability.
- 240 automated tests across 40 files; `npm audit` reports 0 vulnerabilities.
- Certified in Google Chrome 152.0.7977.66 with WebMCP enabled; 0 console errors.
- No LLM runtime, backend, database, authentication, analytics pipeline, or
  private-source access. No external write path of any kind.

## Claims discipline

Do not add: "first in the world", "fully autonomous", "AI decides suitability",
or "ChatGPT certified". ChatGPT Site Tools was not separately certified; the
certified host is Chrome, which the Challenge rules accept.
