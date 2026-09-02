# WebMCP Challenge Submission Checklist

Current status: **product complete and certified; submission materials prepared;
only operational submission steps remain.**

Certified runtime `cf7fc81c7b7829c1adecb9ee4c215cbaeda61ac6` at
`https://brenych-agent-interface.pages.dev/`.

---

## Repository / product — COMPLETE

- [x] Production live and publicly reachable (HTTP 200, no authentication)
- [x] Public repository
- [x] Apache-2.0 license at repository root
- [x] README with production URL, run instructions and WebMCP overview
- [x] Source, assets and testing instructions available
- [x] WebMCP registered through the current `document.modelContext` API
- [x] Exactly seven tools, no duplicates or extras
- [x] Chrome host certification — PASS (Chrome 152.0.7977.66)
- [x] Golden match certified — 100% coverage, 4 / 4 matched, BDB strongest
- [x] Negative fit certified — 0% coverage, 3 NOT DEMONSTRATED, all scores 0
- [x] Production smoke QA at 390 / 768 / 1366 / 1920
- [x] Provider trace scan — 0 findings
- [x] Private-path scan — 0 findings
- [x] Credential scan — 0 findings

### Supporting engineering evidence

- [x] 240 automated tests across 40 files
- [x] Typecheck, lint, build, media validation, eval validation all pass
- [x] `npm audit` — 0 vulnerabilities
- [x] Frozen contracts: 7 core projects, 4 showcase systems, 7 tools, 18 media
- [x] Zero production console errors

## Submission materials — PREPARED

- [x] Final Devpost description prepared — [`DEVPOST-DESCRIPTION.md`](DEVPOST-DESCRIPTION.md)
- [x] Final testing instructions prepared — [`TESTING-INSTRUCTIONS.md`](TESTING-INSTRUCTIONS.md)
- [x] Final video script prepared — [`DEMO-SCRIPT.md`](DEMO-SCRIPT.md)
- [x] Final shot list prepared — [`DEMO-SCRIPT.md`](DEMO-SCRIPT.md)
- [x] Recording checklist prepared — [`VIDEO-CHECKLIST.md`](VIDEO-CHECKLIST.md)
- [x] Criteria mapping prepared — [`CHALLENGE-REVIEW.md`](CHALLENGE-REVIEW.md)
- [x] Production URL prepared
- [x] Public repository URL prepared
- [x] One-page runbook prepared — [`FINAL-SUBMISSION-PACKET.md`](FINAL-SUBMISSION-PACKET.md)

## Final operational steps

These are not product-development blockers.

- [ ] Optional: ChatGPT Site Tools test if account access is available
- [ ] Record the final demo (75–90 seconds)
- [ ] Upload a **Public** YouTube video
- [ ] Verify YouTube playback, audio and public access
- [ ] Paste the video URL into Devpost
- [ ] Complete every required Devpost field
- [ ] Final link audit
- [ ] Submit

## Human review — COMPLETE

- [x] Final submission asset-rights review completed — creator confirmation
      recorded in [`ASSET-RIGHTS-CHECK.md`](ASSET-RIGHTS-CHECK.md) on 2026-09-02.

## Claims discipline

Never record a `PASS` that was not physically observed. In particular:

- ChatGPT Site Tools is **NOT SEPARATELY CERTIFIED**; do not upgrade it on the
  basis of Chrome results, unit tests or source inspection;
- do not add "first in the world", "fully autonomous", "AI decides suitability"
  or "ChatGPT certified" to any submission field;
- do not invent live URLs for projects that have no public deployment.

## After submission

Do not modify the submitted repository, live deployment or Devpost entry until
judging ends. If development must continue, use a separate branch or copy.
