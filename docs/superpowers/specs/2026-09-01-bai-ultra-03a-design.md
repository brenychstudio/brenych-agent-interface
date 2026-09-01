# BAI-ULTRA-03A Design

**Status:** Approved in conversation on 2026-09-01 and authorized for implementation.

## Goal

Complete the creator-directed visual correction without changing the accepted
engineering contracts. The result must unmistakably present Brenych Studio, make
the Evidence Field feel like an authored spatial environment, and keep Field,
Match, Inspect, and Brief continuous inside one stable stage.

The correction is presentation-only. It does not add products, a backend, WebGL,
new WebMCP tools, new scoring inputs, or new public claims.

## Frozen contracts

The complete scored dataset remains exactly:

```text
bdb
distribution-desk
weekfield
sprintcrm
storyform
native-site-control
presence-os-memory-atlas
```

The non-scoring showcase remains exactly `webhero`, `photo-web`, `artist-stage`,
and `model-site`. The seven WebMCP tool names and annotations remain unchanged.
Matching strengths, aliases, evidence coverage, ranking, negative-fit behavior,
`MatchResult`, brief derivation, and public/private evidence boundaries remain
unchanged.

Presentation metadata may consume domain project IDs, but domain, application,
matcher, and WebMCP modules must not import presentation-tier metadata. This
one-way dependency makes it structurally impossible for the new tiers to affect
scoring or agent output.

## Public identity and first viewport

The global identity becomes `BRENYCH STUDIO / AGENT INTERFACE`. The Brenych Studio
wordmark and the explicit `VISIT BRENYCH STUDIO ↗` link open
`https://brenychstudio.com` in a new tab with `noopener noreferrer`. `VIEW SOURCE
↗` opens the current public GitHub repository with the same safety attributes.

The first viewport combines a compact identity/context rail with the existing
requirement composer and the main evidence stage. It presents the thesis:

```text
A portfolio that can prove fit, not only present work.
```

and the approved context:

```text
The agent-facing evidence layer of Brenych Studio.
People and AI agents can evaluate real requirements,
inspect the proof behind a match and prepare a
collaboration brief in the same live interface.
```

No introductory landing section is inserted before the interactive workspace.
The first viewport continues to expose the composer and enough of the field to
make the starting action obvious.

The WebMCP status uses two truthful public states. A supported, registered host
shows `AGENT TOOLS ONLINE`. Every absent or not-yet-ready host state shows
`MANUAL MODE` with `Agent tools activate in a supported WebMCP host.`. Error
details remain available to implementation diagnostics but are not presented as
a broken-product headline.

## Presentation tiers

A typed presentation registry defines:

- FLAGSHIP: BDB, Weekfield, Distribution Desk, StoryForm.
- EXTENDED: SprintCRM, Native Site Control, Presence OS / Memory Atlas.

The default field renders the four flagship projects as full evidence objects.
Extended projects remain real focusable project buttons, but use compact,
low-prominence peripheral-signal visuals. They are not hidden from keyboard users
and remain inspectable.

After evaluation, rank controls the visual form. Ranks one through three always
render as full evidence objects, including an extended project. Lower-ranked
extended projects return to controlled peripheral signals. This visual promotion
is derived after the unchanged match result exists and cannot feed back into it.

## Spatial Evidence Field

The field remains DOM- and Motion-based. It gains a camera layer that contains the
grid, semantic capability traces, and all seven project controls.

The default composition is authored by project ID rather than array index:

- BDB: primary, left and near;
- Weekfield: primary, upper-right;
- Distribution Desk: middle and farther back;
- StoryForm: lower and near;
- extended evidence: three small peripheral signals.

This hierarchy is editorial and never displays a rank or winner before an
evaluation. Repeated `FIELD · NOT EVALUATED` labels are removed from nodes; one
field-level message communicates the unevaluated state.

Pointer movement drives subtle camera parallax. Dragging empty stage space drives
a visibly bounded camera pan, targeting approximately ±76 horizontal and ±42
vertical pixels. Motion springs settle both inputs. Hover and keyboard focus bring
the active object forward and create a restrained response in its nearest visual
neighbors. Flagship objects may use very small staggered ambient drift, while
extended signals remain quiet. `prefers-reduced-motion` disables parallax,
drifting, spring travel, and FLIP-style movement while preserving the authored
static hierarchy.

Match Mode visibly recomposes the constellation: rank one converges to a dominant
central/near position, ranks two and three take supporting near positions, and
remaining projects move to a controlled periphery. Existing requirement to
capability to project traces remain derived from real match evidence.

Tablet and mobile use authored responsive compositions rather than an unsafe
absolute desktop projection. At narrow widths the ranked reading order remains
deterministic, every project is reachable, and top evidence receives the largest
media plane.

## One stable ExperienceStage

`ExperienceStage` becomes the single structural owner for Field, Match, Inspect,
and Brief. It uses one position-relative/grid-overlap composition area with
mode-specific layers rather than appending surfaces after the workspace.

The Evidence Field is mounted exactly once throughout the workflow. Field and
Match expose it as the active canvas. Inspect keeps it as a legible background
memory. Brief keeps only a restrained atmospheric trace. Hidden foreground modes
are unmounted; inactive background controls use both `inert` and `aria-hidden`
semantics so invisible or visually subordinate controls cannot receive focus or
remain in the accessibility tree.

The identity/composer rail and Match panel participate in the same stage grid.
They are absent from the active layout in Inspect and Brief. The showcase is
outside the stable core stage but renders only for Field and Match.

## Inspect continuity and layout

Selecting a project stores the current page scroll position and originating
button. The selected field node moves to its inspect state through Motion layout
continuity; the Inspect surface enters in the same stage area. The old automatic
`scrollIntoView` behavior is removed.

The background field remains readable and cannot be dimmed to a disabled or
unloaded appearance. It is non-interactive while Inspect is active.

The desktop Inspect layout has three reliable zones:

- left/lower narrative: project identity, product category, why selected,
  matched/related requirements, and verified highlights;
- center/right media: large primary image and a bounded secondary image;
- evidence rail: maturity, verification, and public/private boundary.

Low-level evidence records and limitations move under an accessible `VIEW
EVIDENCE DETAILS` disclosure. A manual open without an active match says:

```text
Opened manually. Evaluate requirements to see evidence-backed relevance.
```

It does not render `No directly matched requirements` as an error-like state.

Back or Escape removes Inspect in place, restores the exact previous Field/Match
state, preserves the still-mounted field camera/composition, restores the saved
page scroll position, and returns focus to the originating project control.

## Brief continuity

Brief replaces the active foreground of the same ExperienceStage and starts
directly below the global header. The composer, Match panel, Inspect content, and
showcase are not visible or interactive around it. The mounted field is only a
restrained atmospheric background and is excluded from keyboard and accessibility
navigation.

The document is centered, height-bounded to the available viewport, and internally
scrollable. Back remains visible. Existing editable page-local fields, match
provenance, copy behavior, `PAGE-LOCAL DRAFT ONLY`, `NO SEND`, `NO CRM`, and `NO
NETWORK WRITE` remain unchanged.

The bottom of the document adds `CONTINUE WITH BRENYCH STUDIO ↗`, an external
safe link to `https://brenychstudio.com`. It is navigation, never a submission or
network-write action.

## Showcase behavior

The showcase retains its four approved systems and real-color image compositions.
Its introduction becomes the compact `SELECTED STUDIO SYSTEMS` with:

```text
Creative, spatial and product interfaces from the wider Brenych Studio practice.
```

Field Mode renders full color and normal contrast. Match Mode may reduce prominence
slightly but retains full saturation and an intentional loaded appearance. Inspect
and Brief do not render the showcase, removing it from view, keyboard navigation,
and the accessibility tree. Section gaps decrease by roughly 25–35 percent without
changing image ownership or claims.

## State, errors, and accessibility

The existing Zustand mode history remains the semantic source of truth. No
parallel visual state machine is introduced. Presentation state is limited to
camera pan, pointer parallax, hover/focus proximity, saved scroll position, and
disclosure state.

Manual and WebMCP actions continue through the same `AgentInterface`. Existing
input validation and local draft errors remain inline. Motion never gates data or
interaction. Enter/Space inspect, Escape return, visible focus, semantic headings,
meaningful alt text, and manual fallback remain supported.

QA covers 390, 430, 768, 1024, 1366, and 1920 pixels, horizontal overflow,
headline/media collision, z-index mistakes, hidden controls, scroll jumps, and
reduced motion.

## TDD and verification

Implementation begins with failing behavior tests for:

- flagship versus extended default presentation;
- top-three promotion of extended evidence;
- unchanged match result, coverage, rank, ID, brief derivation, and WebMCP output;
- one shared stage and persistent field identity;
- Inspect replacing rather than following the field in document flow;
- Brief replacing composer/match foreground content;
- showcase visibility by mode;
- exact Back/Escape mode, scroll, and focus restoration;
- manual Inspect wording;
- Brenych Studio links and safe external attributes;
- `MANUAL MODE` and `AGENT TOOLS ONLINE` status labels.

Tests assert observable behavior through real components and real domain/application
objects. Source-text assertions are avoided for new behavior. Each test is first
run red, then implemented minimally, and rerun green before refactoring.

Final gates are typecheck, the full test suite, lint, production build, diff check,
`npm audit`, golden and negative manual flows, zero browser console errors, all 15
media assets loaded, and exactly seven registered WebMCP tools. Temporary visual
QA captures cover default, Match, BDB Inspect, Brief, showcase, 390 Match, and 390
Inspect, and are not committed.

## Git and release boundary

Work occurs only on branch `fix/bai-ultra-03a` in the approved isolated
worktree, based on clean commit
`2405e9d0e9af4f70cab9a10298b925d4c53d2ef6`.

Because the task explicitly requires one local commit only after all gates pass,
this design and the implementation plan remain uncommitted until final validation.
The sole commit message will be:

```text
fix: finalize Brenych Studio spatial agent experience
```

An isolated Cloudflare preview may be deployed for creator review. Main,
production, release tags, final WebMCP host certification, video, Devpost, and
submission remain untouched.
