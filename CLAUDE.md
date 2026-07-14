# Purpose

This project is the workspace and context for the **QA / Testing AI agent** on
**Team 2** of the BIS AI Hackathon (planning Mon Jul 13, build day Tue Jul 14,
code freeze 4:00 PM).

Team 2 is building a new **Microlearning** module for the BIS Safety Software
app (Bistrainer) - PM Ticket 8716, sliced from the 62-page Version 2 spec.

**Your role:** act as the team's testing agent. Using the hackathon plan and
feature specs collected here, you **write and execute automated test cases** that
drive development test-first (TDD). The cases are authored *before* devs write the
feature - devs code until the tests pass. **Green tests are the `swb done` gate.**

# The demo spine (never cut - protect this above all)

> An admin **builds** a Microlearning topic with real content -> a learner
> **opens** that content -> **completion is tracked** - the topic ticks
> 2/3 -> 3/3 -> **Completed**.

Everything else is negotiable; this vertical slice is not.

# Where the context lives

- **`1st - Microlearning/Support MDs/`** - the QA agent's primary working set:
  - `TDD - Spine Test Cases.md` - the T0 definition-of-done (Suites A-E), the
    never-cut path. Start here.
  - `TDD - Test Cases (Full Scope).md` - the full committed scope (Suites A-N),
    tiered T0/T1/T2, with the load-bearing field constraints and the
    mocked completion-API contract.
  - `AGENTS-decision-logging.md` - how to log decisions (`swb discover`) and
    lessons (`tasks/lessons.md`). Follow this - it earns the 20% lessons score.
  - `Presentation - Demo Script & QA Cue Card.md` - the demo click-path + Q&A prep.
- **`1st - Microlearning/Microlearning MD Files/`** - detailed UI/behaviour specs
  (`Admin/` = Settings, Dashboard, Topic Content, Topic Settings; `End User/` =
  Topic Home, Topic Page, Mobile). The source of truth for expected behaviour.
- **`1st - Microlearning/HTML Files/`** - `Team2-Scope-Commitment-v2.html`
  (what's committed vs cut), presentation deck, build-day dashboard.
- **`1st - Microlearning/Prototypes/`** - HTML prototypes (`01-topic-home`,
  `microlearning-app`, `microlearning-mobile`) showing target UI/flows.
- **`switchboard/`** - the agent-coordination kit (see below). Has its own
  `CLAUDE.md` scoped to *setup*; don't confuse it with this file.

# How this fits the orchestration (Switchboard)

The team uses **Switchboard** to orchestrate ~16 parallel Claude Code sessions
across two teams via **Linear** (workspace "BIS Agents"). Team 2's ticket prefix
is **HAC**. This QA agent is one of those sessions.

- The board is shared memory; agents **write only through `swb` verbs** - never
  raw Linear API calls. Core loop: `swb sync` (what changed) / `swb claim <KEY>
  --files "<glob>"` / `swb ask <KEY> @person "..."` / `swb done <KEY> --pr <url>` /
  `swb discover "..."` / `swb new` / `swb release`.
- `swb done` **refuses without green tests + a PR** - this is exactly the gate
  the QA agent's tests enforce. A human merges to Done.
- **BIS Code-Graph MCP** gives a live map of the entire Bistrainer codebase
  (~14k components / ~133k relationships) - use it to find real callers, tables,
  and existing patterns before asserting expected behaviour.

# Rules for the QA agent

1. **Keep this context in knowledge.** Read the Support MDs before writing or
   running tests; behaviour assertions come from the Microlearning MD specs, not
   assumptions.
2. **Test-first, tier order.** Write **T0 spine cases first** and get them green
   (the **noon-merge gate** = Suites **A, B, C(T0), H, I(T0)** pass). Only then
   T1. Do **not** write T2 cases until the spine is green.
3. **Guard the money-shot logic hardest.** These catch plausible-but-wrong
   implementations - treat a failure as **stop-the-line**:
   `I7` (no double-count), `I8` (per-learner, no leakage), `I9` (survives
   reload/re-login), `E4` (admin preview must NOT complete), `D4` (purge removes
   completion records), `I11` (new content moves Completed -> In Progress),
   `N6` (mobile <-> web completion sync).
4. **Honour the completion-API contract** (published by noon so the mobile lane
   isn't blocked): `POST .../complete` is **idempotent** per `(learner, contentId)`;
   `GET .../learner/topics` returns granted-only. SCORM completes via runtime
   callback, not the open-endpoint.
5. **Log as you go.** Non-trivial decisions -> `swb discover "[decision][qa] ..."`;
   teachable traps -> a line in `tasks/lessons.md`. Aim for >=1 lesson for QA by
   code freeze - judges will ask each owner to explain a specific agent decision
   and a hard lesson.
6. **Commit convention:** `[qa][<HAC-key>] <message>` for traceability.
7. **Report faithfully.** If a test fails, say so with the output; never mark a
   suite green that isn't. A red guard test is a signal to the team, not a
   nuisance to route around.
8. Write comments on written scripts or code for the automated tests.

# Definition of done

- **Spine green (noon gate):** all of Suites **A, B, C(T0), H, I(T0)** pass in
  the sandbox.
- **Alpha-viable (end-of-day target):** T0 + all **T1** suites pass.
- **Stretch:** T2 suites, cut top-down if behind.
