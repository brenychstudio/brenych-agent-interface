# Brenych Agent Interface

Brenych Agent Interface is a local evidence workspace for showing how a portfolio fits a stated need. It is designed around a simple premise: a portfolio should be able to prove fit, not only present work. A person and a browser agent work against the same visible evidence field, shared semantic state, and bounded actions.

## Why WebMCP

WebMCP lets a compatible browser agent use the same constrained application commands as the manual interface. That makes an agent action inspectable: a requirements match visibly recomposes the evidence field, a project focus opens the same evidence inspect, and a brief becomes an editable local draft. It is not a chatbot, an autonomous workflow, or access to private systems.

## Core flow

```text
Evidence field → requirements → deterministic match → ranked evidence field
→ project inspect → why selected → editable local collaboration brief
```

The manual composer remains fully usable when `document.modelContext` is unavailable. In that case the readiness indicator reports that WebMCP is unavailable and no browser integration is required to evaluate evidence, inspect a project, or draft a brief.

## Architecture

The architecture is intentionally locked:

```text
Pure domain → application façade → Zustand semantic state → WebMCP and React UI
```

- The pure domain owns public-safe fixtures, normalization, alias resolution, deterministic matching, ranking, evidence collection, and brief derivation.
- The application façade is the shared command boundary for manual controls and WebMCP tools.
- Zustand stores reversible semantic transitions rather than matching rules.
- Motion animates the deterministic depth variables; authored CSS supplies the bounded perspective field and reduced-motion fallback.
- The WebMCP adapter is an isolated experimental transport boundary.
- React renders visible state and calls the façade; it does not calculate scores or mutate evidence data.

## WebMCP tool surface

Exactly seven tools are registered when the API is available:

- `get_profile`
- `get_capabilities`
- `list_projects`
- `get_project`
- `match_requirements`
- `focus_project`
- `create_collaboration_brief`

The first four are read-only queries. `match_requirements` updates only reversible local UI state so that the shared evidence field visibly reflects the result; it is therefore explicitly marked non-read-only and flags returned requirement content as untrusted. `focus_project` opens the local inspect surface, and `create_collaboration_brief` creates an in-memory editable draft. Neither performs a network, persistence, CRM, email, or external write. User-authored material returned by the brief tool is marked as untrusted content. No cross-origin exposure option is used.

## Run

```bash
npm install
npm run dev
```

Quality commands:

```bash
npm run typecheck
npm run test
npm run lint
npm run build
```

There is no required testing flag. If a browser offers WebMCP development support, it may be enabled separately for local experimentation, but the application has no runtime flag or polyfill dependency.

## Manual scenarios

Use the composer, add the requirements, and select **EVALUATE EVIDENCE**.

| Scenario | Requirements | Expected evidence behavior |
| --- | --- | --- |
| A | Electron, MCP, AI automation, Supabase | BDB, Distribution Desk, and Weekfield are strong evidence. |
| B | CRM, Supabase, Gmail, operator workflow | SprintCRM is the strongest evidence. |
| C | WebGL, XR, spatial archive, interactive interface | Presence OS / Memory Atlas is the strongest evidence. |
| D | Swift, Metal, native iOS | Low coverage with the missing capabilities visibly retained. |

From a result, select a project node to inspect its claims, source labels, limitations, and public boundary. Then create a collaboration brief, edit its local fields, copy it, return to the evidence field, clear the match, or reset the workspace. Keyboard users can focus project nodes and use Enter or Space to inspect and Escape to return.

## Evidence, provenance, and private boundary

The field contains seven curated public-safe project records. Each visible claim carries explicit visibility and verification provenance. An owner-verified private provenance can support a public-safe summary, but private code, paths, credentials, prompts, customer data, internal RPC names, and execution details are not present in the dataset or tool results.

Matching is local and deterministic: normalized requirements resolve only through curated exact capabilities, aliases, or one-hop related edges. Scores use evidence coverage, not probability, and a stable match ID preserves equivalent requirement sets regardless of input order. The system keeps negative fits visible instead of inflating a result.

## Security and scope

This is a local-only front-end workspace. It has no backend, authentication, database, filesystem or shell access, analytics, remote MCP, LLM calls, runtime network integration, external writes, or stored user draft. The collaboration brief exists only in the current page state and is reversible through visible controls.

## Status and limitations

`BAI-ULTRA-01` is a P0 functional vertical slice: deterministic evidence matching, seven bounded WebMCP tools, one persistent UI, a Motion-backed structural 2.5D field, inspect, editable local brief, keyboard foundations, reduced-motion handling, and structural checks at 390, 768, and 1366 pixels are implemented and covered by automated tests.

Known limitations: jsdom verifies structural responsive availability rather than pixels; real-browser WebMCP availability depends on the host browser and is not claimed here; no cross-browser certification, full accessibility certification, WebMCP agent selection evals, WebGL, advanced spatial physics, production deployment, or submission material is included.

`BAI-ULTRA-02` is the next task for hardening, spatial polish, and eval work; it is not implemented in this repository state.
