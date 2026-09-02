# Submission Freeze

Status: **SUBMISSION READY — VIDEO / DEVPOST FORM REMAIN OPERATIONAL STEPS**

The runtime is certified and frozen. Every field below was copied from verified
release and certification output, not inferred from a branch name. The remaining
items are operational submission steps, not product work.

## Release record

| Field | Value |
| --- | --- |
| Runtime certified commit | `cf7fc81c7b7829c1adecb9ee4c215cbaeda61ac6` |
| Canonical live URL | `https://brenych-agent-interface.pages.dev/` |
| Certified deployment ID | `863608ce-6ac2-42f3-a7f3-8e40b8650cbc` |
| Immutable deployment URL | `https://863608ce.brenych-agent-interface.pages.dev` |
| Deployment environment | Production |
| Deployment branch | `main` |
| Public repository | `https://github.com/brenychstudio/brenych-agent-interface` |
| License | Apache-2.0 |
| WebMCP host certification | **PASS** — Chrome 152.0.7977.66 with WebMCP enabled |
| ChatGPT Site Tools | **NOT SEPARATELY CERTIFIED** |
| Annotated tag | Not created; the release is identified by commit and deployment ID |
| YouTube URL | Operational step — record and upload before submitting |
| Devpost submission timestamp | Operational step — record after the human submit action |

The production application was successfully certified through a real
WebMCP-enabled Chrome host. Tool discovery, tool execution, visible page
recomposition, project focus, scroll restoration, collaboration-brief creation
and negative-fit behaviour were all observed on the deployed origin.

## Production verification

| Check | Result |
| --- | --- |
| HTTP status | 200 |
| `X-Robots-Tag: noindex` | absent on the canonical URL (preview URLs remain noindex) |
| `<meta name="robots" content="noindex">` | absent |
| Console errors | 0 |
| Smoke QA widths | 390, 768, 1366, 1920 — PASS |
| Horizontal overflow | 0 |
| Nested vertical scroll | 0 |
| Document scrollbars | 1 |
| Media request failures | 0 |
| Scroll restore | PASS |
| Reduced motion | PASS |
| Served bundle | checksum-verified identical to the local certified build |

## Engineering gate at the certified commit

| Gate | Result |
| --- | --- |
| Typecheck / lint / build | PASS |
| Automated tests | 240 passed across 40 files |
| Media validation | PASS |
| Eval validation | PASS |
| `git diff --check` | clean |
| `npm audit` | 0 vulnerabilities |
| Core projects / showcase / tools / media | 7 / 4 / 7 / 18 |

## ChatGPT Site Tools

ChatGPT in-app browser certification was not independently completed before
submission. This is recorded as **NOT SEPARATELY CERTIFIED** rather than as a
failure, and no Site Tools pass is claimed anywhere in this repository.

The Challenge rules allow judges to test using either the ChatGPT in-app browser
or Google Chrome with WebMCP enabled. The certified host for this entry is
Chrome. Judge instructions for both paths are in
[`TESTING-INSTRUCTIONS.md`](TESTING-INSTRUCTIONS.md).

If a Site Tools run is completed later, record the observed result in
[`WEBMCP-CERTIFICATION.md`](WEBMCP-CERTIFICATION.md) and update the status here.
Do not mark it passed on the basis of Chrome results, unit tests, or source
inspection.

## Remaining operational steps

- record the demo video using [`DEMO-SCRIPT.md`](DEMO-SCRIPT.md);
- upload it to YouTube with **Public** visibility and verify signed-out playback;
- complete every required Devpost field and submit;
- record the YouTube URL and Devpost timestamp in this file afterwards.

After the human confirms Devpost submission, do not modify the submitted
repository, live deployment, or Devpost entry until judging ends. If development
must continue, use a separate branch or copy rather than changing the submitted
artifact.
