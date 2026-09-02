# WebMCP Certification

This document is the public technical certification record for the released
production application. It separates source-level evidence from real-host
certification: automated tests prove the contracts and deterministic handlers,
but only a real host can prove that a browser discovered and executed the tools.

Every `PASS` below was physically observed on the deployed production origin in
a real WebMCP-enabled Chrome host.

## Status vocabulary

| Status | Meaning |
| --- | --- |
| `PASS` | The named check was physically run on the recorded host and met the expected result. |
| `FAIL` | The check was physically run and did not meet the expected result. |
| `NOT_RUN` | No physical result exists. |
| `NOT_SEPARATELY_CERTIFIED` | The path was not independently exercised by the entrant; no pass is claimed. |
| `BLOCKED_BY_HOST_ACCESS` | The intended host/API was unavailable; this is not a pass. |

Do not replace any non-pass status with `PASS` on the basis of unit tests or
source inspection.

## Certified subject

| Field | Value |
| --- | --- |
| Deployed URL | `https://brenych-agent-interface.pages.dev/` |
| Immutable deployment URL | `https://863608ce.brenych-agent-interface.pages.dev` |
| Deployment ID | `863608ce-6ac2-42f3-a7f3-8e40b8650cbc` |
| Environment / branch | Production / `main` |
| Release SHA | `cf7fc81c7b7829c1adecb9ee4c215cbaeda61ac6` |
| Certification date | 2026-09-02 |

## Host environment

| Field | Value | Status |
| --- | --- | --- |
| Browser | Google Chrome `152.0.7977.66` | `PASS` |
| Flag | `chrome://flags/#enable-webmcp-testing` enabled | `PASS` |
| `typeof document.modelContext` | `"object"` | `PASS` |
| `typeof navigator.modelContext` | `"undefined"` | `PASS` — the application targets the current `document.modelContext` API, not the deprecated one |
| Exposed API surface | `getTools`, `registerTool`, `executeTool`, `ontoolchange` | `PASS` |
| Registration state | `ready` | `PASS` |
| Visible ready copy | `WEBMCP CONNECTED · AGENT TOOLS ONLINE` | `PASS` |
| Console errors | 0 | `PASS` |

Truthful-state check: in a Chrome session **without** the flag,
`document.modelContext` is `undefined` and the page truthfully displays
`MANUAL MODE — Agent tools activate in a supported WebMCP host`. The connected
state is never displayed unless registration actually reached `ready`.

## Registered tools

`getTools()` returned exactly seven tools, with no duplicates, no legacy names
and no extra internal tools.

| # | Tool | Annotations |
| --- | --- | --- |
| 1 | `get_profile` | `readOnlyHint: true` |
| 2 | `get_capabilities` | `readOnlyHint: true` |
| 3 | `list_projects` | `readOnlyHint: true` |
| 4 | `get_project` | `readOnlyHint: true` |
| 5 | `match_requirements` | `readOnlyHint: false`, `untrustedContentHint: true` |
| 6 | `focus_project` | `readOnlyHint: false` |
| 7 | `create_collaboration_brief` | `readOnlyHint: false`, `untrustedContentHint: true` |

`match_requirements`, `focus_project` and `create_collaboration_brief` are
truthfully marked non-read-only because they mutate visible, reversible
page-local state. Host-reported input schemas matched the source definitions,
including `additionalProperties: false` on every tool.

```text
TOOL_COUNT=7
DUPLICATES=none
UNEXPECTED_TOOLS=none
SCHEMA_PARITY=PASS
ANNOTATION_PARITY=PASS
```

## Host compatibility finding

During Chrome certification the shipping host invoked tool `execute` handlers
with the **input object only**, while the pinned development type package
declares a second options argument carrying the cancellation signal. Depending
on the documented shape meant the handler threw before any tool logic ran: all
seven tools registered and enumerated correctly, but every real invocation
failed. Unit and type-level testing did not reproduce this, because both sides
of the test called the documented signature.

The browser adapter was hardened so the options/signal argument is optional. A
host that supplies a signal keeps its exact cancellation behaviour; a host that
supplies none runs against a signal that never aborts.

This is a host-compatibility fix, not a WebMCP semantic change:

- tool names — unchanged;
- input schemas — unchanged;
- annotations — unchanged;
- tool outputs — unchanged;
- matching and ranking — unchanged;
- visible state semantics — unchanged.

A regression test now covers both host invocation shapes, so a future host that
does pass options remains supported and cancellation stays enforced.

## Direct WebMCP execution

Every call below was issued through the browser's own registered-tool handles
returned by `getTools()`. No application function was called directly.

| Check | Result | Status |
| --- | --- | --- |
| `get_profile` | structured serializable result | `PASS` |
| `get_capabilities` | structured serializable result | `PASS` |
| `list_projects` | structured serializable result | `PASS` |
| `get_project` (`projectId: bdb`) | structured serializable result | `PASS` |
| Read tools leave page state unchanged | mode remained `field`; no UI corruption | `PASS` |
| `match_requirements` | golden scenario executed | `PASS` |
| Visible recomposition | match mode active, field recomposed | `PASS` |
| Provenance | **WEBMCP ACTION** visible | `PASS` |
| `focus_project` | BDB Inspect opened | `PASS` |
| WebMCP scroll restore | deep position preserved exactly | `PASS` |
| `create_collaboration_brief` | editable page-local brief opened | `PASS` |
| External write observed | none | `PASS` |
| Negative fit | unsupported requirements reported honestly | `PASS` |
| Console errors | 0 | `PASS` |

```text
READ_TOOLS=PASS
MATCH_REQUIREMENTS=PASS
VISIBLE_RECOMPOSITION=PASS
FOCUS_PROJECT=PASS
WEBMCP_SCROLL_RESTORE=PASS
COLLABORATION_BRIEF=PASS
NEGATIVE_FIT=PASS
CONSOLE_ERRORS=0
```

### Golden scenario

Input: `Electron`, `MCP`, `AI automation`, `Supabase`

Visible page:

```text
EVIDENCE COVERAGE      100%
EVIDENCE MODEL         DETERMINISTIC
REQUIREMENTS MATCHED   4 / 4
RELATED                0
NOT DEMONSTRATED       0
STRONGEST EVIDENCE     01 BDB · 02 Weekfield · 03 Distribution Desk
PROVENANCE             WEBMCP ACTION
```

Tool output: `evidenceCoverage: 1`, `matched: [electron, mcp, ai automation,
supabase]`, `partial: []`, `missing: []`, ranked `bdb 0.75`, `weekfield 0.6125`,
`distribution-desk 0.25`. Tool output and visible page state agree, and both
match the committed scenario contract in `tests/domain/scenarios.test.ts`.

### Focus and scroll restoration

From a deliberately deep Evidence scroll position of `1400`:

```text
focus_project(bdb) → activeMode=inspect, scrollY=0, BDB heading visible,
                     four Inspect zones present, provenance WEBMCP ACTION
BACK TO EVIDENCE   → activeMode=match, scrollY=1400 (exact), focus returned to
                     the BDB project control
```

This certifies the agent-driven scroll-origin behaviour: a WebMCP transition has
no originating click to capture from, so the workspace position is recorded on
the state transition itself and restored exactly on return.

### Collaboration brief

Input: `projectType: "Desktop agent workspace"`, the four golden requirements,
`timeline: "Two-week discovery"`.

Result: `relevantProjectIds: [bdb, weekfield, distribution-desk]`,
`knownGaps: []`, linked to the source match ID.

Visible page: brief mode active, provenance **WEBMCP ACTION**, five editable
fields (Project type, Requirements, Context, Timeline, Budget) with the timeline
carried through, relevant evidence listing BDB / Weekfield / Distribution Desk,
and the notice **PAGE-LOCAL DRAFT ONLY · NO SEND · NO CRM · NO NETWORK WRITE**.
No send, submit, email or share control exists. Nothing was transmitted.

### Negative fit

Input: `Swift`, `Metal`, `native iOS`

```text
EVIDENCE COVERAGE      0%
REQUIREMENTS MATCHED   0 / 3
NOT DEMONSTRATED       3
```

Tool output: `evidenceCoverage: 0`, `matched: []`, `partial: []`,
`missing: [swift, metal, native ios]`, and all seven projects scored `0`. No
invented match, no fuzzy rescue, no probabilistic claim, no hallucinated project
proof. This matches the committed contract in
`tests/domain/negative-fit.test.ts`.

## ChatGPT desktop Site Tools

```text
CHATGPT_SITE_TOOLS=NOT_SEPARATELY_CERTIFIED
```

ChatGPT in-app browser certification was not independently completed before
submission. No Site Tools pass is claimed, and no Chrome result, unit test or
source inspection is offered as a substitute for one.

Judges may test the production site in the ChatGPT in-app browser or in Google
Chrome with WebMCP enabled, as allowed by the Challenge rules. Prompts for both
paths are in [`TESTING-INSTRUCTIONS.md`](TESTING-INSTRUCTIONS.md).

If a Site Tools run is completed later, record the exact prompt, the selected
tool, the arguments, the visible page effect and the observed status here. If
the page loads but Site Tools are unavailable to the account or model, record
`BLOCKED_BY_HOST_ACCESS`. Do not mark the path passed.

## Certification stop conditions

Certification must stop and the release must not claim full WebMCP success if:

- `document.modelContext` is unavailable in the intended WebMCP test host;
- `getTools()` returns anything other than the seven frozen names;
- host metadata, schemas, or actual arguments materially differ from the source contract;
- direct calls succeed invisibly or update the wrong page state;
- Swift, Metal, or native iOS receives fabricated positive evidence;
- an agent selects or implies a filesystem, shell, secret, private-repository, or external-write tool;
- the deployed behaviour differs from the locally certified behaviour;
- the tested deployment does not correspond to the recorded release SHA.

None of these conditions were met during the certifying run.

## Final sign-off

```text
DEPLOYED_DIRECT_CERTIFICATION=PASS
CHROME_WEBMCP_CERTIFICATION=PASS
CHATGPT_SITE_TOOLS_CERTIFICATION=NOT_SEPARATELY_CERTIFIED

CERTIFIED_AT=2026-09-02
RELEASE_SHA=cf7fc81c7b7829c1adecb9ee4c215cbaeda61ac6
DEPLOYED_URL=https://brenych-agent-interface.pages.dev/
DEPLOYMENT_ID=863608ce-6ac2-42f3-a7f3-8e40b8650cbc
HOST=Google Chrome 152.0.7977.66 with enable-webmcp-testing
TOOL_COUNT=7
CONSOLE_ERRORS=0
```
