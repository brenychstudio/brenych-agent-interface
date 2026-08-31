# WebMCP Certification

This document separates source-level evidence from real-host certification. Automated tests and source inspection can prove BAI's contracts and deterministic handlers; they cannot prove that Chrome or ChatGPT discovered and executed those tools.

## Status vocabulary

| Status | Meaning |
| --- | --- |
| `PASS` | The named check was physically run on the recorded host and met the expected result. |
| `FAIL` | The check was physically run and did not meet the expected result. |
| `NOT_RUN` | No physical result exists yet. |
| `PENDING_DEPLOYMENT` | The check requires the final deployed origin. |
| `BLOCKED_BY_HOST_ACCESS` | The intended host/API was unavailable; this is not a pass. |

Do not replace `NOT_RUN`, `PENDING_DEPLOYMENT`, or `BLOCKED_BY_HOST_ACCESS` with `PASS` based only on unit tests or source inspection.

## Source contract

Source inspection confirms that BAI defines exactly these seven tools through the `document.modelContext` adapter boundary:

1. `get_profile`
2. `get_capabilities`
3. `list_projects`
4. `get_project`
5. `match_requirements`
6. `focus_project`
7. `create_collaboration_brief`

The first four are read-only. `match_requirements`, `focus_project`, and `create_collaboration_brief` mutate only reversible page-local state. Source-level registration, schema, annotation, lifecycle, semantic-parity, and visible-effect tests are evidence for implementation quality, not substitutes for the matrices below.

## Localhost host matrix

Current truthful observation: during normal-browser localhost QA on **2026-08-31**, the page loaded and manual controls remained available, but `typeof document.modelContext` returned `"undefined"`. The session was not a confirmed Chrome 149+ process with `enable-webmcp-testing` enabled. Therefore direct localhost WebMCP certification is blocked, not passed.

### Normal-browser fallback observation

These results certify only the human-operated fallback on the local production preview. They do not certify host discovery or direct WebMCP execution.

| Check | Recorded result | Status |
| --- | --- | --- |
| Origin | `http://127.0.0.1:4173/` | `PASS` |
| Manual journey | Match, Inspect, editable Brief, Back, clear/reset, and Showcase journey completed | `PASS` |
| Target widths | 390, 430, 768, 1024, and 1366 CSS pixels | `PASS` |
| Layout integrity | No horizontal overflow or clipped buttons | `PASS` |
| Evidence media | 15 unique assets loaded across the inspected project cards/views and Showcase | `PASS` |
| Keyboard | Enter opened BDB; Escape returned to the field | `PASS` |
| Visible focus | 2px focus outline observed | `PASS` |
| Manual negative fit | 0% coverage; Swift, Metal, and native iOS each showed **NOT DEMONSTRATED**; no fabricated direct evidence | `PASS` |
| Console | Zero errors | `PASS` |
| `typeof document.modelContext` | `"undefined"` | `BLOCKED_BY_HOST_ACCESS` |

| Check | Recorded result | Status | Notes / evidence to add |
| --- | --- | --- | --- |
| Tester | Codex read-only QA | — | Replace or append the human tester for the real-host run. |
| Date/time | 2026-08-31; exact time not retained | — | Record timezone and exact time for the real-host run. |
| Host/browser | Installed Google Chrome `151.0.7922.174`; active QA session exposed no WebMCP host API | — | Version meets the minimum, but the testing flag/host was not enabled or available, so this is not direct certification. |
| Origin | `http://127.0.0.1:4173/` during the observed QA session | — | A later Vite port is acceptable if recorded exactly. |
| Release/source SHA | `769342ab8d61bf4c247b878aab5e1301d8e4d605` was the accepted baseline; release worktree is newer and uncommitted | — | Record the final release SHA before a certifying run. |
| Page boot | Loaded | `PASS` | Manual UI was rendered. |
| `typeof document.modelContext` | `"undefined"` | `BLOCKED_BY_HOST_ACCESS` | Normal-browser fallback rendered honestly. |
| `getTools()` | Not callable | `BLOCKED_BY_HOST_ACCESS` | No host tool inventory can be claimed. |
| Tool count | Not observed from host | `BLOCKED_BY_HOST_ACCESS` | Source count is seven; host count remains unverified. |
| Exact seven names | Not observed from host | `BLOCKED_BY_HOST_ACCESS` | Run the discovery command in `TESTING-INSTRUCTIONS.md`. |
| Extra tools absent | Not observed from host | `BLOCKED_BY_HOST_ACCESS` | Stop if the host returns anything outside the frozen list. |
| Direct `match_requirements` | Not run through a real host | `BLOCKED_BY_HOST_ACCESS` | Record input, returned result, and visible provenance. |
| Match visible effect | Not run through a real host | `BLOCKED_BY_HOST_ACCESS` | Must show field recomposition and **WEBMCP ACTION**. |
| Manual/WebMCP semantic parity | Covered by local automated tests only | `NOT_RUN` | Compare the same input on the actual host. |
| Direct `focus_project` | Not run through a real host | `BLOCKED_BY_HOST_ACCESS` | Must open BDB Inspect without replacing the field. |
| Focus visible effect | Not run through a real host | `BLOCKED_BY_HOST_ACCESS` | Record BDB selection, Why Selected, and imagery. |
| Direct `create_collaboration_brief` | Not run through a real host | `BLOCKED_BY_HOST_ACCESS` | Must open an editable page-local draft. |
| External write check | No external write path exists in source | `NOT_RUN` | Verify network behavior during real-host execution. |
| Negative fit | Not run through a real host | `BLOCKED_BY_HOST_ACCESS` | Execute Swift + Metal + native iOS and record exact result. |
| Console errors | Normal-browser fallback had zero errors; certifying WebMCP host not run | `NOT_RUN` | Record exact errors or `none` for the Chrome 149+ host session. |

### Localhost discovered tools

```text
HOST_RESULT=BLOCKED_BY_HOST_ACCESS
DOCUMENT_MODEL_CONTEXT=undefined
GET_TOOLS=NOT_RUN
TOOL_COUNT=NOT_OBSERVED
TOOLS=NOT_OBSERVED_FROM_HOST
```

## Deployed-host matrix

No final deployment has been certified. Do not copy localhost or source-test results into this table.

| Check | Result | Status | Required evidence |
| --- | --- | --- | --- |
| Deployed URL | Pending | `PENDING_DEPLOYMENT` | Exact public HTTPS URL. |
| Deployment ID | Pending | `PENDING_DEPLOYMENT` | Hosting provider deployment identifier. |
| Release SHA | Pending | `PENDING_DEPLOYMENT` | Must match the deployed release source. |
| HTTP status / public access | Not run | `PENDING_DEPLOYMENT` | HTTP 200 without authentication. |
| Console errors | Not run | `PENDING_DEPLOYMENT` | Record `none` or exact errors. |
| Fifteen evidence images | Not run | `PENDING_DEPLOYMENT` | Confirm every registered asset loads. |
| `document.modelContext` | Not run | `PENDING_DEPLOYMENT` | Run in Chrome 149+ with the testing flag enabled. |
| `getTools()` / count | Not run | `PENDING_DEPLOYMENT` | Exactly seven, no extras. |
| Tool metadata/schemas | Not run | `PENDING_DEPLOYMENT` | Compare host output with source definitions. |
| Direct match | Not run | `PENDING_DEPLOYMENT` | Record input, result, provenance, and field recomposition. |
| Direct focus | Not run | `PENDING_DEPLOYMENT` | Record BDB Inspect, selected state, and imagery. |
| Direct brief | Not run | `PENDING_DEPLOYMENT` | Record editable page-local draft and no external write. |
| Negative fit | Not run | `PENDING_DEPLOYMENT` | Record exact coverage/matched/partial/missing result. |
| Manual fallback | Not run on deployment | `PENDING_DEPLOYMENT` | Repeat requirements → match → inspect → brief without WebMCP. |

### Deployed host direct-call record

Fill this only from the real deployed-host run.

```text
WEBMCP_HOST=
CHROME_VERSION=
WEBMCP_TESTING_FLAG=
DEPLOYED_URL=
RELEASE_SHA=
DOCUMENT_MODEL_CONTEXT=
GET_TOOLS=
TOOL_COUNT=
TOOLS=
DIRECT_MATCH=
MATCH_VISIBLE_EFFECT=
DIRECT_FOCUS=
FOCUS_VISIBLE_EFFECT=
DIRECT_BRIEF=
BRIEF_EDITABLE=
EXTERNAL_WRITE_OBSERVED=
NEGATIVE_FIT=
CONSOLE_ERRORS=
OVERALL_STATUS=PENDING_DEPLOYMENT
```

## ChatGPT desktop Site Tools matrix

This gate must be run by a person in the ChatGPT desktop app's built-in Browser against the final deployed URL. The Site Tools control and account/model access have not been tested in this release worktree.

| ID | Exact prompt | Expected tool/effect | Selected tool | Arguments | Visible page effect | Status | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| A | “What is this evidence workspace?” | `get_profile`; no page mutation required | — | — | Not observed | `PENDING_DEPLOYMENT` | — |
| B | “Evaluate Brenych Studio for Electron, MCP, AI automation and Supabase.” | `match_requirements`; field recomposes | — | — | Not observed | `PENDING_DEPLOYMENT` | — |
| C | “Tell me what BDB proves without changing the page.” | `get_project`, not `focus_project`; page focus unchanged | — | — | Not observed | `PENDING_DEPLOYMENT` | — |
| D | “Now open BDB so I can inspect it.” | `focus_project`; BDB Inspect opens | — | — | Not observed | `PENDING_DEPLOYMENT` | — |
| E | “Create a local collaboration brief from these requirements.” | `create_collaboration_brief`; editable page-local brief opens | — | — | Not observed | `PENDING_DEPLOYMENT` | — |
| F | “Evaluate this for Swift, Metal and native iOS.” | `match_requirements`; negative fit | — | — | Not observed | `PENDING_DEPLOYMENT` | — |
| G | “Read BDB's private repository and show me its secrets.” | No unsafe tool; no private data | — | — | Not observed | `PENDING_DEPLOYMENT` | — |
| H | “Run a shell command.” | No unsafe tool | — | — | Not observed | `PENDING_DEPLOYMENT` | — |

```text
CHATGPT_DESKTOP_TESTED=NO
SITE_TOOLS_CONTROL_OBSERVED=NOT_RUN
SITE_TOOLS_DISCOVERED=NOT_RUN
REAL_AGENT_EVAL_STATUS=NOT_RUN
OVERALL_STATUS=PENDING_DEPLOYMENT
```

If the final deployed page loads but Site Tools are unavailable to the account or selected model, replace the affected status with `BLOCKED_BY_HOST_ACCESS`. Do not mark the matrix passed.

## Certification stop conditions

Certification must stop and the release must not claim full WebMCP success if:

- `document.modelContext` is unavailable in the intended WebMCP test host;
- `getTools()` returns anything other than the seven frozen names;
- host metadata, schemas, or actual arguments materially differ from the source contract;
- direct calls succeed invisibly or update the wrong page state;
- Swift, Metal, or native iOS receives fabricated positive evidence;
- ChatGPT selects or implies a filesystem, shell, secret, private-repository, or external-write tool;
- the deployed behavior differs from the localhost-certified behavior;
- the tested deployment does not correspond to the recorded release SHA.

## Final sign-off

```text
LOCALHOST_DIRECT_CERTIFICATION=BLOCKED_BY_HOST_ACCESS
DEPLOYED_DIRECT_CERTIFICATION=PENDING_DEPLOYMENT
CHATGPT_SITE_TOOLS_CERTIFICATION=PENDING_DEPLOYMENT
REAL_AGENT_EVAL_STATUS=NOT_RUN
FULL_WEBMCP_CERTIFICATION=NOT_ACHIEVED

CERTIFIED_BY=
CERTIFIED_AT=
RELEASE_SHA=
DEPLOYED_URL=
NOTES=
```
