# Public Evidence Boundary

This application holds only public-safe, evidence-backed portfolio summaries.
It excludes private source code, repository internals, credentials, prompts,
customer data, security-sensitive implementation details, and private paths.
Owner-verified and locally verified records are public-safe summaries, not
private datasets; their provenance never changes a match score.

| ID | Public display name | Visibility | Verification | Maturity | Safe capabilities | Portfolio URL | Repository URL | Prohibited claims | Last verified reference |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `bdb` | BDB | `public_summary_only` | `owner_verified_private` | owner-verified implementation | Electron; Model Context Protocol; AI automation | — | — | Production status; private implementation details | BDB owner-verified public-safe summary |
| `distribution-desk` | Distribution Desk | `public_summary_only` | `owner_verified_private` | owner-verified implementation | Electron; publishing workflow; integration workflow | — | — | AI automation; Supabase workflow; customer outcomes; private implementation details | Distribution Desk owner-verified public-safe summary |
| `weekfield` | Weekfield (public evidence: CreatorOps) | `public` | `portfolio_public` | beta-ready prototype | AI automation; Supabase; operator workflow | `https://brenychstudio.com/work/creatorops` | — | Separate CreatorOps project count; private implementation details | CreatorOps public case |
| `sprintcrm` | SprintCRM | `public` | `verified_remote` | public case | CRM; Gmail communication; operator workflow; Supabase | `https://brenychstudio.com/work/sprintcrm` | `https://github.com/brenychstudio/SprintCRM` | Customer data access; production adoption metrics | SprintCRM verified remote public case |
| `storyform` | StoryForm | `public_summary_only` | `verified_local` | owner-verified implementation | Electron; media workflow | — | — | WebGL/3D web interface; public interactive site; private source availability | StoryForm local verification |
| `native-site-control` | Native Site Control | `public_summary_only` | `verified_local` | owner-verified implementation | Site-control architecture; control contracts; manifest/revision/validation | — | — | Interactive web control surface; operator workflow; native iOS implementation; private repository access | Native Site Control local verification |
| `presence-os-memory-atlas` | Presence OS Memory Atlas | `public` | `portfolio_public` | functional MVP prototype | WebGL/3D web; WebXR; spatial archive; interactive interface | `https://brenychstudio.com/immersive/presence-os-memory-atlas` | — | Native XR application delivery; private implementation details | Public portfolio route audit at clean HEAD `0a6904a95351be55ef5f8dc89e4e3dddbfb9a5e6` |

Weekfield is the canonical project record: its public CreatorOps case is not an
eighth project. Summary-only projects have no public links unless a verified
public URL is added to this matrix. A provenance label may describe owner/local
verification; when `sourceReference` is present, it must be an HTTPS URL with a
hostname or a same-site absolute path beginning with one `/`. Unsupported capabilities, including
`webmcp` and `multilingual-web`, remain excluded until direct verified evidence
is added to an approved project record.
