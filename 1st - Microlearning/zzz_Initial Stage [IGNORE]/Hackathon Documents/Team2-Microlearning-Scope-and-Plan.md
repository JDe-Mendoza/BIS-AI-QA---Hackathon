# Team 2 — Microlearning (PM Ticket 8716): Committed Scope & Build Plan

**Planning day:** Mon Jul 13 · **Build day:** Tue Jul 14 (8:15am → 4:00pm code freeze)
**Team 2 roster:** Rejith (Captain/merge + dev), Sabareesh (dev), Raj (dev), Udayan (dev), Mika (Design/PM), John D (QA), Chai (QA), Patrick (PM — board + scope + presentation)
**Prepared by:** Patrick (PM) for cross-team critique + scope lock

---

## 1. The strategic read

The full Ticket 8716 spec is an enterprise LMS module: dashboard, topic + activity CRUD, five activity types with per-language variants, edit/deactivate/reactivate/purge, topic settings, three permission types, a full events/scheduling/notification engine, public/network sharing, decommissioning, end-user web + mobile, CEUs, and audit notes. That is weeks of real work, not one build day.

The rubric rewards **realistic-and-90%-done over inflated-and-half-done**, and the cross-team critique will actively try to cut us. So we commit to **one clean vertical slice that a judge can watch end to end** — an admin builds content, a learner consumes it, and completion is tracked — plus a small set of clearly-labelled stretch items we will cut first if a lane slips.

**The spine we commit to:** *An admin can build a Microlearning topic with real activities, grant a learner access, and the learner can open those activities and have their completion tracked.* Everything else is foundation-only or a stretch.

---

## 2. Committed scope (this is what we are judged against)

Written as shippable statements. If it's on this list, we finish it to ~90%+.

**Admin — build content**

1. An admin can turn Microlearning **on in Setup**, and the Microlearning tab (portal menu) + admin module appear.
2. An admin sees a **Microlearning dashboard**: topics as cards (grid + list), an Active / Draft / Deactivated pillbox, a working search, an Add Topic button, and the empty state.
3. An admin can **create a topic** via *Build Your Own* (title with char-count + validation, description, default image, portal-language default chip). The *Generate Using AI* button renders **greyed with "Coming soon."**
4. An admin lands on the **Topic Details page** (header + status badge, description collapsible, Add Activity, activity grid/list, empty state).
5. An admin can **add activities** of type **Link, PDF, and Video URL (YouTube/Vimeo)** and see them listed with the correct type icon and last-updated date.
6. An admin can **edit** an activity's fields.

**Access — minimal permission path**

7. An admin can **grant a learner access** through **one** permission type (**By Location** — simplest single path). This is what makes the learner side real without the events engine.

**Learner — consume content**

8. A learner sees granted topics on the **Microlearning homepage** with progress status (New / In Progress / Completed), the All/In Progress/Complete filter, and search.
9. A learner can **open a topic** and see its activities.
10. A learner can **open a Link / PDF / Video activity, completion is recorded**, and the topic's progress updates (e.g. 2/3 → 3/3 → Completed).

**Quality**

11. **Automated tests ship**: topic CRUD, activity CRUD, and completion tracking are covered by QA's TDD suite, and those tests are the `swb done` gate from the first commit.

---

## 3. Stretch items (built only if a lane is ahead — and the order we cut them)

These are *not* in the committed statement. Adding them earns nothing at judging beyond the spine; they exist to soak up spare capacity. **Cut order = top of this list goes first.**

1. Image upload + crop/preview modal (fall back to default image)
2. Deactivate / Reactivate activity (+ Deactivated pillbox view)
3. Draft topic status (pause access)
4. Drag-to-reorder activities (the 6-dots handle)
5. Notes / audit trail on topic actions

---

## 4. Explicit non-goals (foundation-only — provision in the schema, do NOT build)

We tell the schema/contract owners to leave room for these, but we build none of them. Calling them out pre-empts the critique.

- **Microlearning Events** — scheduling, frequency, email + text notifications, the custom email editor. *(Biggest cut. Learner access comes from the permission in #7, not from an event.)*
- Multi-language activity variants + auto-translate (portal language only)
- CEUs
- Public / network topics (BIS Accounting), Launch to Companies, Decommissioning
- Purge + the 31-day billing window (Deactivate is our furthest "off" state)
- Uploaded MP4 video + SCORM ZIP "Activity" type + watch-completion detection (Link/PDF/Video-URL cover the demo cheaply)
- Mobile app (web app experience only)
- Bulk-select, Show More pagination, Push to Subportals (already out of Phase 1)

---

## 5. How the scope maps to the rubric

| Criterion | Weight | How this scope wins it |
|---|---|---|
| Prototype completeness | 25% | A tight slice we can land ~90%; the full admin→learner loop demos live in the sandbox. |
| Code quality & standards | 20% | New module follows BIS CFML patterns + anchor files; UI matches Figma/CP Lens; contracts frozen before parallel work. |
| Agent orchestration | 20% | Every person holds ≥1 claimed ticket, worktrees + ownership guard prevent collision, PM sweeps Backlog, captain merges on cadence. |
| Automated testing | 15% | QA TDD cases written today gate `swb done` from the first commit — testing drives development, not a bolt-on. |
| Lessons learned | 20% | PM captures the roadblock/adaptation story live; we document one novel technique (candidate: an agent whose only job is auditing merge-conflict resolutions). |

---

## 6. Work breakdown — lanes & owners

Four build lanes + QA + PM/merge. Realistic capacity note: with ~4 devs, the admin and learner lanes are the tight ones — that's exactly why the stretch list is cut-first.

| Lane | Primary owner | Support | Scope |
|---|---|---|---|
| **Scaffolding / critical path** | Rejith (captain) | Sabareesh | DB schema + migrations, frozen API contracts, module registration (god-file lane) |
| **Backend / CFML** | Sabareesh | Rejith | Topic CRUD, Activity CRUD, completion tracking, By-Location permission service |
| **Admin frontend** | Raj | Mika | Dashboard, Create-Topic modal, Topic Details, Add-Activity modal, edit |
| **Learner frontend** | Udayan | Raj | Learner homepage, topic view, activity open + completion UI |
| **Shared UI + design** | Mika | — | Card, Modal, Pillbox/Tabs, StatusBadge, SearchField, tokens; answers @design |
| **QA / test contracts** | John D (backend) | Chai (frontend) | TDD failing tests → acceptance criteria; owns `testCommand`; review pairs |
| **PM / board / merge** | Patrick (PM) + Rejith (merge) | — | Backlog sweep (Gate 1), promote→Todo, scope cuts, hourly board-reader sweep, presentation |

**God-file / serialized lanes** (one ticket at a time, owned by Rejith): portal-menu registration, `Application.cfc`/routing, and the Setup → System Modules list where the Microlearning toggle registers. **DB-change owner = Sabareesh** — all schema changes route through one person, batched, so no two agents migrate the same table.

---

## 7. Critical path — what must exist before lanes branch

The whole day hinges on **freezing three things fast** so parallel work can't diverge:

**CP‑1 → CP‑2 → CP‑3 are the critical path. Nothing downstream is safe until they land.**

- **CP‑1 · DB schema + migrations** (Sabareesh) — `microlearning_topic`, `microlearning_activity`, `microlearning_completion`, `microlearning_permission` + the Setup toggle row. *Blocks all backend.*
- **CP‑2 · API / interface contracts** (Rejith) — request/response shapes for topic, activity, completion, and permission endpoints. **Interfaces are law.** Once frozen, frontend builds against mocks while backend builds the real endpoints **in parallel.** *This is the single biggest unblock of the day.*
- **CP‑3 · Frontend module scaffold + shared components** (Mika + Raj) — the Microlearning route/shell plus Card, Modal, Pillbox, StatusBadge, SearchField, design tokens. *Blocks all admin/learner FE feature tickets.*
- **CP‑QA · TDD fixtures + `testCommand`** (John D) — failing tests written against CP‑2's contract; wired into `.swb.json` so `swb done` is real, not theatre.

**Target: contracts (CP‑2) frozen by ~9:30–10:00.** After that, six feature tickets branch at once.

### Every person leaves planning day with ≥1 ticket that does NOT depend on scaffolding

(Per the planning-day exit rule — nobody idles until 10am.)

- Rejith → draft & freeze the API contract doc (is the scaffolding, starts at 8:15)
- Sabareesh → write the migration scripts (is the scaffolding)
- Mika → shared UI primitives (Card/Modal/Pillbox/Badge) — pure, no backend
- Raj → the greyed *Generate Using AI* modal + Create-Topic modal shell against mocked contract
- Udayan → Learner homepage **empty state** + card component against mock data
- John D → backend TDD test files against the contract
- Chai → frontend component test scaffolding (jest/RTL)
- Patrick → pre-write all Backlog ticket bodies tonight so build day starts with *claiming*, not writing

---

## 8. Build-day timeline (mirrors the agenda)

- **8:15** — Scaffolding sprint. CP‑1/CP‑2/CP‑3 owners start; everyone else picks up a non-blocked ticket above.
- **~9:30–10:00** — Contracts frozen (CP‑2). Backend + frontend feature lanes branch into parallel worktrees.
- **12:00** — **Mandatory merge checkpoint.** Captain merges all worktrees to the team branch, run the full test suite, then lunch. (No lane merges after finishing on its own — merge on cadence.)
- **12:30–3:30** — Build block 2: learner lane completes (needs completion endpoint), integration, second informal merge ~2:30.
- **3:30** — Freeze prep: final merge, automated test run, deploy to sandbox.
- **4:00** — **Code freeze. No commits after 4:00.**
- **4:00–4:30** — Presentation prep (Patrick owns the showing).

---

## 9. Orchestration policy decisions (for AGENTS.md)

- **Backlog sweeper (Gate 1):** Patrick, continuous — promote real tickets, kill junk.
- **Assign at promote, or self-claim?** Self-claim from Todo (keeps devs moving), PM watches for proposal→claim bias.
- **Gate 2:** ON (default) — agents ask in chat before claim/done.
- **WIP = 1** per person. Finish or `release` before the next claim.
- **Ticket size:** 30–90 min of agent work, acceptance criteria + files-to-touch + blocked-by required before promote.
- **Merge cadence:** per-ticket to team branch + the mandatory noon checkpoint + ~2:30 + final at 3:30. Rejith owns it.
- **Conflict resolutions get a human (or a dedicated audit-agent) eye** — agents resolve conflicts confidently and wrongly.
- **No drive-by refactors** — changes only inside a ticket's declared files.
- **testCommand:** frontend build/lint/jest **+** a CFML smoke script hitting the topic/activity/completion endpoints (John D defines the exact command).
- **Fallback drill:** if kit/Linear/network breaks at 10am → manual `swb` recipes + the board in the browser; keep building.

---

## 10. Pre-decided scope-cut ladder (if a lane is behind at 1pm)

Patrick calls the cut. Order: **stretch list (§3) top-down first**, then inside the committed slice we drop, in order: (a) list view — keep grid only, (b) search on the learner side, (c) the third activity type (keep Link + PDF, drop Video URL), (d) the By-Location permission UI → hard-code a demo grant. We never cut the core loop: create topic → add activity → learner opens → completion tracked.
