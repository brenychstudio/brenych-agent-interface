# Brenych Agent Interface

**A portfolio that can prove fit, not only present work.**

Brenych Agent Interface (BAI) is a WebMCP evidence workspace where people and agents evaluate real project capabilities together. Instead of making an agent infer structure from portfolio navigation, prose, and screenshots, the page exposes typed tools for profile discovery, evidence search, deterministic matching, visible project focus, and collaboration-brief creation.

The agent does not act in a hidden chat layer. Its state-changing tools update the same visible interface the human inspects and controls:

```text
match_requirements            → the evidence field recomposes
focus_project                 → the selected project's evidence opens
create_collaboration_brief    → a page-local editable brief appears
```

**Live URL:** [brenych-agent-interface.pages.dev](https://brenych-agent-interface.pages.dev/) — final verification state is recorded in [`docs/submission/SUBMISSION-FREEZE.md`](docs/submission/SUBMISSION-FREEZE.md).

## Challenge thesis

Without WebMCP, a person can still use the complete manual journey. With WebMCP, an agent can use bounded, typed evidence operations to evaluate requirements, reveal why a project fits, focus the proof, and prepare a reversible brief while the human watches the same page change.

BAI is not a chatbot and does not call an LLM. It has no backend, database, authentication, analytics, private-repository access, or external write path.

## Demo flow

1. Ask the agent to evaluate Brenych Studio for **Electron, MCP, AI automation, and Supabase**.
2. `match_requirements` runs the deterministic matcher and visibly recomposes the evidence field. BDB, Weekfield, and Distribution Desk carry the strongest relevant evidence.
3. Ask the agent to open BDB. `focus_project` opens the same Inspect surface available by selecting the BDB node manually.
4. Review real imagery, verified claims, deterministic **Why Selected** reasoning, limitations, and the public/private boundary.
5. Ask for a collaboration brief. `create_collaboration_brief` opens an editable draft stored only in current page state.
6. Evaluate **Swift, Metal, and native iOS** to see unsupported requirements remain visible as a negative fit.

Manual controls provide the same `requirements → match → inspect → brief` flow when WebMCP is unavailable.

## Seven WebMCP tools

BAI registers exactly seven tools through `document.modelContext` when the host API is available:

| Tool | Effect |
| --- | --- |
| `get_profile` | Read the public workspace profile. |
| `get_capabilities` | Search or list the curated capability catalog. |
| `list_projects` | Search compact public project summaries. |
| `get_project` | Read one detailed evidence dossier without changing page focus. |
| `match_requirements` | Evaluate requirements and update visible page-local match state. |
| `focus_project` | Select and open one public project in Inspect. |
| `create_collaboration_brief` | Create an editable page-local draft without sending it anywhere. |

The first four tools are read-only. The final three change only reversible local UI state and are truthfully marked non-read-only. No tool can access a filesystem, shell, Git, private repository, database, email, CRM, OAuth token, or arbitrary URL.

## Architecture

```text
Pure domain → application façade → Zustand semantic state → WebMCP + React UI
```

- The pure TypeScript domain owns fixtures, normalization, alias resolution, matching, ranking, evidence collection, and brief derivation.
- The application façade is the one command boundary shared by manual controls and WebMCP tools.
- Zustand stores reversible semantic transitions, never alternative scoring logic.
- The WebMCP adapter owns registration, duplicate protection, cancellation, teardown, and unsupported-host fallback.
- React renders visible state; Motion and authored CSS animate deterministic spatial ranks with a reduced-motion fallback.

## Evidence and scoring integrity

The scoring corpus contains exactly seven projects:

`bdb`, `distribution-desk`, `weekfield`, `sprintcrm`, `storyform`, `native-site-control`, and `presence-os-memory-atlas`.

Normalization resolves only curated exact capabilities, aliases, and one-hop related edges. Scoring weights are fixed:

| Evidence relation | Weight |
| --- | ---: |
| Exact | `1.00` |
| Alias | `0.90` |
| Related | `0.45` |
| Missing | `0.00` |

Coverage means **evidence coverage**, not probability or predicted success. There is no fuzzy matching, embedding model, LLM score, screenshot-derived score, or visibility-based weighting. Negative fits remain visible instead of being inflated.

## Human control

WebMCP enhances the page; it is not an availability dependency. Humans can enter requirements, evaluate evidence, inspect every project, edit a brief, copy it, go back, clear the match, and reset the workspace without an agent.

Agent actions are visibly labeled. Inspect and Brief remain reversible, keyboard-accessible page states. A collaboration draft stays in memory and disappears with page state; BAI cannot submit, book, email, persist, or synchronize it.

## Public/private boundary

The field contains seven curated public-safe project records and 15 reviewed WebP evidence derivatives. Screenshot pixels are approved visual evidence, while technical claims come only from verified evidence records. Visible UI text in a screenshot is not treated as technical authority.

Private code, absolute workstation paths, credentials, prompts, customer records, internal RPC names, and execution details are excluded from the dataset and tool results. See [`docs/PUBLIC-EVIDENCE-BOUNDARY.md`](docs/PUBLIC-EVIDENCE-BOUNDARY.md), [`docs/EVIDENCE-MEDIA-MANIFEST.md`](docs/EVIDENCE-MEDIA-MANIFEST.md), and [`ASSET-NOTICE.md`](ASSET-NOTICE.md).

## Supporting studio systems

Four media-led Showcase Proof systems — WEBHERO, Photo Web, Artist Stage, and Model Site — demonstrate supporting studio craft. They are explicitly `scoring = false` and never enter projects, evidence records, ranking, coverage, match IDs, or brief derivation.

## Run locally

Requirements: a current Node.js release and npm.

```bash
npm ci
npm run dev
```

For a production build:

```bash
npm run build
npm run typecheck
npm run test
npm run lint
npm run validate:media
npm run validate:evals
npm audit
```

The Vite production output is written to `dist/`.

## Enable WebMCP in Chrome

Challenge testing supports Google Chrome 149 or later with WebMCP testing enabled:

1. Open `chrome://flags/#enable-webmcp-testing`.
2. Enable **WebMCP testing**.
3. Restart Chrome.
4. Visit the live BAI URL and inspect `document.modelContext`.

Ordinary Chrome does not expose ChatGPT Site Tools. Chrome testing is the direct WebMCP host method described by the challenge rules.

## Test with ChatGPT Site Tools

Site Tools are tested in the ChatGPT desktop app's built-in browser when the account and selected model have access:

1. Open the built-in Browser from the ChatGPT desktop app.
2. Visit the live BAI URL.
3. Allow website access when prompted.
4. Confirm the Site Tools arrow appears in the address bar.
5. Run the golden prompts in [`docs/submission/TESTING-INSTRUCTIONS.md`](docs/submission/TESTING-INSTRUCTIONS.md).

Site Tools use the tools provided by the current page and share its live state. If the feature is unavailable to the account, manual mode remains fully functional and the certification status must be reported as host-limited rather than passed.

## Eval corpus

[`evals/webmcp-evals.json`](evals/webmcp-evals.json) contains 28 deterministic cases covering profile and capability discovery, project search and read, direct/ambiguous/negative fit, contextual focus, brief creation, and adversarial requests. Five cases explicitly check that private repositories, credentials, filesystem access, shell commands, and boundary-overriding instructions do not map to unsafe tools.

The eval validator checks corpus structure, bounded arguments, exact tool names, expected UI state, category coverage, and adversarial notes. Expected outputs are not changed to conceal real-host failures.

## Hackathon work

BAI itself was created during the 2026 challenge period. The represented source products predate the challenge and contribute reviewed public evidence only. Exact dates, commits, and the boundary between prior work and new challenge implementation are documented in [`docs/submission/HACKATHON-WORK.md`](docs/submission/HACKATHON-WORK.md).

## Security

- No runtime secret, credential, or environment variable is required.
- No network write, backend, database, authentication, analytics, remote MCP server, or LLM SDK exists.
- Security tests scan tracked and untracked release text for workstation paths, credential assignments, provider-token shapes, private-key headers, email addresses, and private/link-local URLs. For the private release gate, set `BAI_PRIVATE_USERNAME` in the shell before running `npm test`; that runtime-only value is scanned case-insensitively and is never committed. Binary publication is restricted to the 15 registered WebPs and five hash- and dimension-pinned release captures.
- Media tests require exactly 15 registered WebP derivatives; files, hashes, dimensions, captions, ownership, roles, and public-safe semantics must match the manifest, and reserve source stems are rejected.
- WebMCP lifecycle tests cover cancellation, duplicate registration, teardown, and unsupported-browser fallback.

## License

Software source is licensed under the [Apache License 2.0](LICENSE). Evidence screenshot and trademark boundaries are described in [`ASSET-NOTICE.md`](ASSET-NOTICE.md).

## Release and submission

- Public repository: `https://github.com/brenychstudio/brenych-agent-interface`
- Live deployment, release commit, tag, and certification state: [`docs/submission/SUBMISSION-FREEZE.md`](docs/submission/SUBMISSION-FREEZE.md)
- Judge testing: [`docs/submission/TESTING-INSTRUCTIONS.md`](docs/submission/TESTING-INSTRUCTIONS.md)
- WebMCP certification: [`docs/submission/WEBMCP-CERTIFICATION.md`](docs/submission/WEBMCP-CERTIFICATION.md)
