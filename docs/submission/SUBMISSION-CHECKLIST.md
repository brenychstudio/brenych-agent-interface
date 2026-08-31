# WebMCP Challenge Submission Checklist

Current status: **release preparation in progress; external host, deployment, video, and submission gates are pending**.

Checked items below are supported by files or local source inspection in the current workspace. They do not imply that the final release commit, public repository, deployed app, Chrome host, ChatGPT Site Tools, YouTube video, or Devpost submission has been completed.

## Required Devpost fields

- [x] Project title prepared: **Brenych Agent Interface**.
- [ ] Public live URL entered and tested.
- [ ] Public repository URL entered and tested.
- [x] English project description drafted in [`DEVPOST-DESCRIPTION.md`](DEVPOST-DESCRIPTION.md).
- [x] English judge testing instructions drafted in [`TESTING-INSTRUCTIONS.md`](TESTING-INSTRUCTIONS.md).
- [ ] Public YouTube URL entered and tested.
- [x] English demo script drafted in [`DEMO-SCRIPT.md`](DEMO-SCRIPT.md).

## Local release materials

- [x] Root Apache License 2.0 file is present.
- [x] `ASSET-NOTICE.md` is present and separates software licensing from screenshot/trademark rights.
- [x] Hackathon-period work and commit provenance are documented in [`HACKATHON-WORK.md`](HACKATHON-WORK.md).
- [x] Asset rights and the 15 approved evidence derivatives are documented in [`ASSET-RIGHTS-CHECK.md`](ASSET-RIGHTS-CHECK.md).
- [x] Four final BAI UI screenshots are present under `docs/submission/images/`.
- [x] Video requirements are documented in [`VIDEO-CHECKLIST.md`](VIDEO-CHECKLIST.md).
- [x] WebMCP certification matrices and truthful pending statuses are present in [`WEBMCP-CERTIFICATION.md`](WEBMCP-CERTIFICATION.md).
- [x] Provisional judging-criteria review is present in [`CHALLENGE-REVIEW.md`](CHALLENGE-REVIEW.md).
- [x] `SUBMISSION-FREEZE.md` is present as a clearly marked **PREPARED — NOT YET FROZEN** record.
- [ ] Complete and freeze `SUBMISSION-FREEZE.md` only after the final URLs, release SHA, tag, deployment, video, and submission state are known.

## Frozen product contracts

- [x] Source defines exactly seven WebMCP tools.
- [x] The seven names are `get_profile`, `get_capabilities`, `list_projects`, `get_project`, `match_requirements`, `focus_project`, and `create_collaboration_brief`.
- [x] Source keeps exactly seven scored projects.
- [x] Source keeps exactly four non-scoring Showcase Proof systems.
- [x] Eval corpus currently contains exactly 28 retained cases and at least five adversarial cases.
- [x] Manual fallback remains part of the product contract.
- [x] Final release diff independently reviewed; no Critical or Important issue remains and none of the frozen contracts changed unexpectedly.

## Final local engineering gate

Run these commands on the exact proposed release worktree. Record output in the final release report.

- [x] `git status` reviewed; every change belongs to ULTRA-03 release preparation.
- [x] `git diff` reviewed.
- [x] `git diff --check` passes.
- [x] `npm ci` passes with 0 vulnerabilities.
- [x] `npm run typecheck` passes.
- [x] `npm run test` passes: 31 files, 162 tests.
- [x] `npm run lint` passes.
- [x] `npm run build` passes.
- [x] `npm run validate:media` passes: 5 tests.
- [x] `npm run validate:evals` passes: 1 test covering the exact 28-case corpus.
- [x] `npm audit` reports 0 vulnerabilities.
- [x] Independent public-boundary scan has no unexplained credential, path, private-code, or customer-data hit; remaining hits are explicit synthetic security fixtures or documented localhost test URLs.
- [x] Fifteen media hashes and dimensions match `docs/EVIDENCE-MEDIA-MANIFEST.md`.
- [x] Production payload recorded: JS 397,784 B (123,432 B gzip), CSS 25,428 B (5,911 B gzip), evidence media 2,463,620 B, largest asset 488,110 B.
- [ ] Final release commit created only after all required engineering gates pass.

## Responsive and accessibility release QA

Physically test the final build; structural jsdom tests are not sufficient for this gate.

- [x] 390px: full manual flow passes with no horizontal overflow or clipped buttons.
- [x] 430px: full manual flow passes with no horizontal overflow or clipped buttons.
- [x] 768px: full manual flow passes with no horizontal overflow or clipped buttons.
- [x] 1024px: full manual flow passes with no horizontal overflow or clipped buttons.
- [x] 1366px: full manual flow passes with no horizontal overflow or clipped buttons.
- [x] The 15 unique evidence assets load across the inspected project cards/views and Showcase.
- [x] Keyboard Enter opens BDB, Escape returns to the field, and the active control has a visible 2px focus outline.
- [x] Space-to-inspect and a complete keyboard-only match → inspect → brief edit → back → field traversal are physically verified.
- [x] Semantic headings and button names are coherent in the browser accessibility tree.
- [x] Evidence images have useful alternatives; repeated ranking thumbnails use intentionally empty decorative alternatives.
- [x] State-change announcements are exposed through a polite live status region.
- [x] Reduced-motion mode is physically checked: the media query matched and motion durations collapsed to `0.01ms` before the browser preference was restored.
- [x] Evidence states remain understandable without color through explicit rank, tier, matched, and unmatched text.

Normal-browser QA also confirmed zero console errors and a truthful manual negative fit: Swift, Metal, and native iOS produced 0% coverage, all three were **NOT DEMONSTRATED**, and no direct evidence was fabricated. These local fallback results do not complete any WebMCP-host gate below.

## Direct WebMCP certification

- [x] Installed Chrome version recorded: `151.0.7922.174` (the observed session still lacked the enabled WebMCP host API).
- [ ] `enable-webmcp-testing` enabled and Chrome relaunched.
- [ ] `typeof document.modelContext` returns `"object"`.
- [ ] `getTools()` returns exactly seven names and no extras.
- [ ] Host tool metadata and schemas match source definitions.
- [ ] Direct `match_requirements` succeeds and visibly recomposes the field with **WEBMCP ACTION** provenance.
- [ ] Direct `focus_project` opens BDB Inspect in the persistent field.
- [ ] Direct `create_collaboration_brief` opens an editable page-local draft with no external write.
- [ ] Swift + Metal + native iOS remains a negative fit.
- [x] Exact localhost result recorded in [`WEBMCP-CERTIFICATION.md`](WEBMCP-CERTIFICATION.md) as `BLOCKED_BY_HOST_ACCESS`; this is not a direct-host pass.

Current localhost direct-host status: `BLOCKED_BY_HOST_ACCESS` because the observed normal-browser session exposed no `document.modelContext`. This is not checked as passed.

## Public repository

- [x] GitHub CLI/account verified as the intended `brenychstudio` account.
- [x] Repository-name collision check completed; the target repository was absent before release creation.
- [ ] `brenychstudio/brenych-agent-interface` exists and is public.
- [ ] Default branch is `main`.
- [ ] Remote HEAD equals the final local release SHA.
- [ ] GitHub detects the Apache-2.0 license.
- [ ] README, source, `public/evidence`, `evals`, and `docs` are visible.
- [ ] No private data appears in the public repository.
- [ ] Repository homepage points to the tested live URL.
- [ ] No force push used.

## Deployment and live smoke

- [x] Hosting account/project ownership verified before any write.
- [x] No unrelated Cloudflare Pages project occupies the intended deployment name.
- [ ] Final `dist/` is built from the recorded release SHA.
- [ ] Production deployment ID recorded.
- [ ] Public HTTPS URL recorded.
- [ ] HTTP 200 without authentication.
- [ ] App boots without console errors.
- [ ] All 15 evidence images load.
- [ ] Manual match, Inspect, Brief, Showcase, mobile, and refresh smoke tests pass.
- [ ] Safe response headers are present and do not break WebMCP, modules, fonts, or images.
- [ ] Direct WebMCP match/focus/brief/negative-fit certification repeated on the deployed origin.
- [ ] Live results recorded in [`WEBMCP-CERTIFICATION.md`](WEBMCP-CERTIFICATION.md).

## ChatGPT desktop Site Tools

- [ ] Final deployed URL opened in the ChatGPT desktop app's built-in Browser.
- [ ] Site Tools arrow/control observed.
- [ ] Site Tools discovered for the current page.
- [ ] Prompt A selects `get_profile`.
- [ ] Prompt B selects `match_requirements` and visibly recomposes the field.
- [ ] Prompt C selects `get_project`, not `focus_project`.
- [ ] Prompt D selects `focus_project` and opens BDB.
- [ ] Prompt E selects `create_collaboration_brief` and opens an editable draft.
- [ ] Prompt F shows the Swift + Metal + native iOS negative fit.
- [ ] Prompt G uses no unsafe tool and reveals no private data.
- [ ] Prompt H uses no unsafe shell tool.
- [ ] Selected tool, arguments, visible effect, PASS/FAIL, and notes recorded for every prompt.

If Site Tools are unavailable to the account/model, record `BLOCKED_BY_HOST_ACCESS`; do not check these items or claim full certification.

## Demo video and YouTube

- [ ] Recorded from the final public live site.
- [ ] Uses real Site Tools if host access is available; any limitation is disclosed honestly.
- [ ] Shows seven tools, golden match, BDB Inspect, editable brief, negative fit, and human control.
- [ ] 1080p minimum with calm visible cursor and appropriate zoom.
- [ ] Clear English narration/audio.
- [ ] No notifications, private tabs, credentials, local paths, or unapproved assets.
- [ ] Final runtime is under three minutes; target 2:20–2:45 and never exceed 2:55.
- [ ] Music, if any, has explicit rights; voiceover plus interface audio is the safe default.
- [ ] Uploaded to YouTube with public visibility.
- [ ] Public YouTube URL tested while signed out.

## Final Devpost review

- [ ] Title is **Brenych Agent Interface**.
- [ ] One-line thesis is **A portfolio that can prove fit, not only present work.**
- [ ] Live URL opens without authentication.
- [ ] Public repository opens and license is detected.
- [ ] English description is concise and judge-readable.
- [ ] Testing instructions point to the exact live URL and truthful host paths.
- [ ] YouTube URL is public, includes audio, and is under three minutes.
- [ ] Final URLs are tested from a signed-out/private context.
- [ ] Submission is saved before **September 3, 2026 at 1:00 PM PDT**, the challenge deadline stated by Devpost.
- [ ] Human explicitly approves the final Devpost fields.
- [ ] Human performs the final Devpost submit action.
- [ ] Submission timestamp and identifiers are recorded in the prepared freeze document.

**Do not automatically click or claim final Devpost submission.** The final submit action requires explicit human confirmation after every external field and gate above is verified.
