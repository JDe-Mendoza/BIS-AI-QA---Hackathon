# Lessons - Team 2 QA lane

House format (one line each) - these are the lines that win Q&A:

```
- [SHORT-TAG-IN-CAPS]: what happened -> the rule you'd tell the next team.
```

Aim for >=1 QA lesson by code freeze. Cross-cutting findings also go to the
board via `swb discover` (they reach every session); this file is the durable,
teachable summary.

---

- [SWB-WORKSPACE-SCOPING]: The Switchboard hooks fired and `@you` mentions showed up in this folder, so it looked connected - but `swb doctor` was red ("team not resolved") and only mention-digests arrived, not the full board. -> A folder isn't a recognized swb workspace until it has a `.swb.json` with `teamKey`; drop that in first, then you get full digests and every coordinate verb works.
- [NODE-TEST-VS-JEST]: A dev repo's done-gate `testCommand` was `node --test`, which can never pass on a Jest repo (jest globals, JSX, and extensionless TS imports all fail under Node's built-in runner). -> Point `testCommand` at the framework the repo actually uses (`npx jest` for the dev repos); a done-gate that can't pass is worse than no gate.
