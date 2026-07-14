# Agent Decision Logging — drop-in for your AGENTS.md

> **You already have the channel.** Switchboard's `swb discover` + `tasks/lessons.md` are how we log decisions and lessons — no new tooling. Paste the section below into your AGENTS.md (or into your session as a standing instruction). ~30 seconds. This earns us the 20% lessons-learned score at judging.

---

## Standing instruction: log your decisions & lessons

### 1. Decisions & cross-cutting findings → `swb discover`

When your agent makes a **non-trivial call** — a schema choice, an API shape, a library pick, a pattern chosen over an obvious alternative, or a workaround for a blocker — run:

```
swb discover "[decision][<lane>] <what you decided> — rejected <alternative>, because <why>. (<KEY/commit>)"
```

Example:
```
swb discover "[decision][learner] completion is idempotent per (user,content) — rejected append-only log, because re-opens double-counted. (HAC-355)"
```

That reaches every session in one turn and lands in `DISCOVERIES.md` + the pinned thread. Mika reads these and files the keepers into the Notion lessons log.

### 2. Teachable lessons → `tasks/lessons.md` format

When something *taught* you a rule (a trap, a surprise, an adaptation), add a line to `tasks/lessons.md` in the house format:

```
- **[SHORT-TAG-IN-CAPS]**: what happened → the rule you'd tell the next team.
```

Example:
```
- **[EVENTUAL-CONSISTENCY]**: Linear search lagged writes 17s → verify-after-write reads by ID, never filtered search.
```

These are the lines that win Q&A. Aim for **at least one per lane** by code freeze.

## What counts as "non-trivial" (log these)

- Data model / schema decisions (how completion is stored, topic↔content relationship)
- API contract shape — especially the completion API the mobile lane depends on
- Choosing one BIS pattern over another, or deviating from an existing module
- Any workaround for a blocker, flaky behaviour, or an agent limitation
- Merge-conflict resolutions that changed behaviour

## What NOT to log (keep the signal high)

- Formatting, renames, comment tweaks
- Straightforward CRUD wiring with no real choice
- Anything the ticket already fully specified

## Commit convention (traceability for Q&A)

Prefix commits `[<lane>][<HAC-key>] <message>` — e.g. `[learner][HAC-355] record completion once per item`. Lets any teammate trace a decision back to an owner when a judge asks.

---

### Why this matters (say it to your agent)
Judges WILL ask each of us to explain one specific decision our agents made + a hard lesson. "We let it run and it worked" and "one person did everything" are failing answers. `swb discover` as you go = you can actually answer.
