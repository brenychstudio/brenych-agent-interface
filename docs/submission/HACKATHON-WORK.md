# Hackathon Work Provenance

Brenych Studio Agent Interface (BAI) is a new WebMCP Challenge application
created during the 2026 submission period. The products represented by its
evidence existed before the challenge; they contribute only reviewed,
public-safe evidence and are not presented as challenge implementation work.

## Current release

| Field | Value |
| --- | --- |
| Final certified runtime | `cf7fc81c7b7829c1adecb9ee4c215cbaeda61ac6` |
| Production URL | `https://brenych-agent-interface.pages.dev/` |
| Deployment ID | `863608ce-6ac2-42f3-a7f3-8e40b8650cbc` |
| WebMCP Chrome certification | **PASS** |
| Automated tests | 240 across 40 files |
| License | Apache-2.0 |

## Challenge-period commit history

These rows are development history, not the current release. The current
certified runtime is the commit recorded above.

| Date | Commit | Work |
| --- | --- | --- |
| 2026-08-28 | `3a5ed34e30c6dba0b80f95c5f7e5ce19c508eaef` | `feat: build WebMCP evidence workspace vertical slice` |
| 2026-08-31 | `769342ab8d61bf4c247b878aab5e1301d8e4d605` | `feat: harden WebMCP evidence experience` |
| 2026-09-01 | `2405e9d0e9af4f70cab9a10298b925d4c53d2ef6` | `chore: prepare WebMCP challenge release` |
| 2026-09-01 | `33368842a7c0b3ab5f129a8300faa9a7025bc7fe` | `fix: finalize Brenych Studio spatial agent experience` |
| 2026-09-02 | `0c64d93ea0b4772f58f519a7f2fe5100264018e8` | `fix: complete cinematic evidence presentation` |
| 2026-09-02 | `ee5d836912744b8e25d3248e6abca8175300b955` | `fix: finalize submission motion and navigation` |
| 2026-09-02 | `cf7fc81c7b7829c1adecb9ee4c215cbaeda61ac6` | `fix: execute WebMCP tools in hosts that pass no execution options` |

## What was built during the challenge

BAI introduced its WebMCP adapter and seven-tool surface, deterministic evidence
graph and matcher, shared human-agent evidence interface, visible spatial
recomposition, project Inspect flow, and page-local collaboration brief. The
challenge application also added its public-safe evidence dataset, media
registry, scoring-isolation checks, security boundary checks, and eval corpus.

The final release additionally delivered the cinematic media viewer and Inspect
choreography, canonical scroll-state handling for both manual and agent-driven
navigation, a shared animated disclosure, deterministic match terminology, and a
truthful WebMCP connection indicator that only reports a connected state when
registration actually succeeded.

### Real-host compatibility work

Certification against a real WebMCP-enabled Chrome host exposed a host
invocation compatibility issue that unit-level and type-level testing did not
reproduce: the shipping host invokes tool execute handlers with input only,
while the pinned development type package declares a second options argument.
All seven tools registered and enumerated correctly, but every real invocation
failed.

The browser adapter was hardened so the options/signal argument is optional,
with a regression test covering both host invocation shapes. Tool names, input
schemas, annotations, outputs, matching and visible state semantics were
unchanged. This is legitimate challenge work: it is exactly the class of defect
that only appears when a submission is certified against the real host rather
than against its own test doubles.

## Boundary with pre-existing products

Pre-existing source products remain distinct from BAI. Their prior product
development is not claimed as challenge work; BAI uses selected public evidence
from them to demonstrate a new human-agent evaluation workflow. Evidence
provenance is recorded in
[`../EVIDENCE-MEDIA-MANIFEST.md`](../EVIDENCE-MEDIA-MANIFEST.md) and
[`../../ASSET-NOTICE.md`](../../ASSET-NOTICE.md).
