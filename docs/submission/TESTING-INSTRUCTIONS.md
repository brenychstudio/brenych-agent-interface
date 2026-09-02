# Testing Instructions

**LIVE URL:** `https://brenych-agent-interface.pages.dev/`

**NO LOGIN REQUIRED.**

**PUBLIC REPO:** `https://github.com/brenychstudio/brenych-agent-interface`

Brenych Studio Agent Interface is a WebMCP evidence workspace. A person can
complete the entire journey manually in any current browser. A compatible WebMCP
host can use seven bounded tools to change the same visible page state.

The Challenge rules allow testing in either the ChatGPT in-app browser or Google
Chrome with WebMCP enabled. Both paths are described below.

---

## Option A — ChatGPT in-app browser

Open the live URL in the ChatGPT desktop app's built-in browser if Site Tools are
available to your account and selected model. The page should expose its site
tools automatically; allow website access when prompted.

This path was **not separately certified by the entrant**. It is offered because
the Challenge rules support it.

### Suggested prompts

**1.**

> Evaluate this studio for Electron, MCP, AI automation, and Supabase, then show me the strongest project evidence.

Expected:

- 100% evidence coverage
- 4 / 4 requirements matched
- BDB is the strongest evidence
- visible page recomposition

**2.**

> Open the strongest project evidence.

Expected: BDB Inspect opens.

**3.**

> Prepare a local collaboration brief for this matched desktop interface work with a two-week discovery timeline.

Expected: an editable local brief appears on the page.

**4.**

> Do you have demonstrated evidence for Swift, Metal, and native iOS?

Expected:

- 0% evidence coverage
- 3 NOT DEMONSTRATED
- no invented fit

---

## Option B — Google Chrome

Production was certified using **Chrome 152.0.7977.66**.

1. Use a current WebMCP-capable Chrome.
2. Open `chrome://flags/#enable-webmcp-testing` and enable **WebMCP testing**.
3. Relaunch Chrome.
4. Open the production URL.

### Expected page status

```text
WEBMCP CONNECTED · AGENT TOOLS ONLINE
```

Without the flag the page truthfully shows `MANUAL MODE` instead. The connected
state is only ever displayed when registration actually succeeded.

### Expected tools

```text
get_profile
get_capabilities
list_projects
get_project
match_requirements
focus_project
create_collaboration_brief
```

Verify with the host's WebMCP testing surface, or in DevTools:

```js
typeof document.modelContext;                                  // "object"
(await document.modelContext.getTools()).map((t) => t.name);    // the seven names
```

### Run the same scenarios

Execute the tools through the host's WebMCP execution surface. In the shipping
Chrome build, `executeTool` takes a registered tool handle and a JSON string:

```js
const tools = await document.modelContext.getTools();
const call = (name, args) =>
  document.modelContext.executeTool(
    tools.find((t) => t.name === name),
    JSON.stringify(args),
  );

// Golden scenario
await call("match_requirements", {
  requirements: ["Electron", "MCP", "AI automation", "Supabase"],
});

// Focus — try it from a deep scroll position, then press BACK TO EVIDENCE
await call("focus_project", { projectId: "bdb" });

// Page-local brief
await call("create_collaboration_brief", {
  projectType: "Desktop agent workspace",
  requirements: ["Electron", "MCP", "AI automation", "Supabase"],
  timeline: "Two-week discovery",
});

// Negative fit
await call("match_requirements", { requirements: ["Swift", "Metal", "native iOS"] });
```

### Expected results

| Scenario | Expected |
| --- | --- |
| Golden match | 100% coverage, 4 / 4 matched, 0 related, 0 not demonstrated, strongest evidence BDB → Weekfield → Distribution Desk, provenance **WEBMCP ACTION** |
| Focus | BDB Inspect opens at the top of the page; **BACK TO EVIDENCE** returns to the exact previous scroll position |
| Brief | editable page-local draft; **PAGE-LOCAL DRAFT ONLY · NO SEND · NO CRM · NO NETWORK WRITE**; nothing is transmitted |
| Negative fit | 0% coverage, 0 / 3 matched, 3 **NOT DEMONSTRATED**, all project scores 0 |

---

## Manual journey (no agent required)

WebMCP enhances the page; it is not an availability dependency.

1. Add requirements in **MANUAL REQUIREMENTS**, then press **EVALUATE EVIDENCE**.
2. The evidence field recomposes and the match panel appears.
3. Select any project node to open Inspect; expand **VIEW EVIDENCE DETAILS**.
4. Press **BACK TO EVIDENCE** to return to the exact previous position.
5. Open **CREATE COLLABORATION BRIEF**, edit any field, then **COPY BRIEF**.
6. Use **Clear match** or **Reset workspace** to return to the initial state.

## Run locally

```bash
npm ci
npm run dev
```

Production build and full gate:

```bash
npm run build
npm run typecheck
npm run test          # 240 tests across 40 files
npm run lint
npm run validate:media
npm run validate:evals
npm audit             # 0 vulnerabilities
```

## Stop conditions

Report rather than work around any of the following:

- `document.modelContext` unavailable in a host that should support it;
- `getTools()` returning anything other than the seven names above;
- host schemas or arguments differing from the source definitions;
- a tool succeeding invisibly or changing the wrong page state;
- Swift, Metal or native iOS receiving any fabricated positive evidence;
- any tool implying filesystem, shell, secret, private-repository or external
  write access.
