# Final Submission Packet

One-page source of truth for the submission. Everything here is verified.

## Entry

| Field | Value |
| --- | --- |
| Title | **Brenych Studio Agent Interface** |
| Tagline | **A portfolio that can prove fit, not only present work.** |
| Live URL | `https://brenych-agent-interface.pages.dev/` |
| Repository | `https://github.com/brenychstudio/brenych-agent-interface` |
| License | Apache-2.0 |
| Released runtime | `970c3769000e2f30343f9f4f88d627c49f0738d7` |
| Deployment ID | `e3f4634e-34ea-4541-835e-b9e37cf44c32` |
| Host-certified runtime | `cf7fc81c7b7829c1adecb9ee4c215cbaeda61ac6` (deployment `863608ce-6ac2-42f3-a7f3-8e40b8650cbc`) — identical JavaScript bundle, one CSS declaration apart |
| WebMCP | **Chrome certification PASS** (Chrome 152.0.7977.66) |
| Tool count | **7** |
| ChatGPT Site Tools | **NOT SEPARATELY CERTIFIED** — the Challenge accepts Chrome |
| Video | use [`DEMO-SCRIPT.md`](DEMO-SCRIPT.md) · target 75–90 s · public YouTube |

Paste the description from [`DEVPOST-DESCRIPTION.md`](DEVPOST-DESCRIPTION.md).

## Tomorrow runbook

1. **Check whether ChatGPT Site Tools access is restored.**

2. **If yes:** run the four testing prompts from
   [`TESTING-INSTRUCTIONS.md`](TESTING-INSTRUCTIONS.md) and record useful
   footage. Log the observed result in
   [`WEBMCP-CERTIFICATION.md`](WEBMCP-CERTIFICATION.md) — record exactly what
   happened, and do not mark it passed unless it actually passed.

3. **Regardless:** record the final demo using Site Tools if available,
   otherwise the certified Chrome WebMCP host. Both are acceptable.

4. **Export the final MP4.**
   Recommended filename: `brenych-agent-interface-webmcp-challenge.mp4`

5. **Upload to YouTube with Public visibility.**

6. **Verify:** video plays · audio works · public access works · duration under
   3 minutes.

7. **Open the Devpost submission.**

8. **Paste:** title · description · live URL · public repository · YouTube URL.

9. **Check every required field.**

10. **Submit.**

11. **After submission:** do not modify the runtime unless Devpost or OpenAI
    explicitly requires a fix.

## The four demo prompts

```text
1. Evaluate this studio for Electron, MCP, AI automation, and Supabase,
   then show me the strongest project evidence.
   → 100% coverage · 4/4 matched · BDB strongest · page recomposes

2. Open the strongest project evidence.
   → BDB Inspect opens

3. Prepare a local collaboration brief for this matched desktop interface
   work with a two-week discovery timeline.
   → editable page-local brief appears; nothing is sent

4. Do you have demonstrated evidence for Swift, Metal, and native iOS?
   → 0% coverage · 3 NOT DEMONSTRATED · no invented fit
```

## Chrome setup (certified host)

```text
chrome://flags/#enable-webmcp-testing  → Enabled → relaunch
open https://brenych-agent-interface.pages.dev/
page must read: WEBMCP CONNECTED · AGENT TOOLS ONLINE
```

## Do not claim

- ChatGPT Site Tools certification, unless that run actually happened
- "first in the world" · "fully autonomous" · "AI decides suitability"
- live URLs for projects that have no public deployment

## Document map

| Document | Purpose |
| --- | --- |
| [`SUBMISSION-FREEZE.md`](SUBMISSION-FREEZE.md) | Authoritative release record |
| [`WEBMCP-CERTIFICATION.md`](WEBMCP-CERTIFICATION.md) | Technical certification evidence |
| [`DEVPOST-DESCRIPTION.md`](DEVPOST-DESCRIPTION.md) | Final Devpost copy |
| [`TESTING-INSTRUCTIONS.md`](TESTING-INSTRUCTIONS.md) | Judge-facing testing guide |
| [`DEMO-SCRIPT.md`](DEMO-SCRIPT.md) | Voiceover and shot plan |
| [`VIDEO-CHECKLIST.md`](VIDEO-CHECKLIST.md) | Recording and upload checklist |
| [`CHALLENGE-REVIEW.md`](CHALLENGE-REVIEW.md) | Mapping to the four criteria |
| [`SUBMISSION-CHECKLIST.md`](SUBMISSION-CHECKLIST.md) | Completion state |
| [`HACKATHON-WORK.md`](HACKATHON-WORK.md) | Work provenance |
| [`ASSET-RIGHTS-CHECK.md`](ASSET-RIGHTS-CHECK.md) | Asset rights review — COMPLETE |
