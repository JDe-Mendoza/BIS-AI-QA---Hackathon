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
- [READ-THE-MERGED-CODE]: My Suite B oracle assumed `saveTopic` returns the "Please enter a title." message on an empty title; reading the merged dev code (`ht2microlearning.cfc` + the dev's own `AddTopic.test.js`) showed it returns a bare `{error:true}` (the copy is FE-only) and that `imageUrl` comes back `""`, not the contract's `null`. -> An assumed oracle is a hypothesis, not a gate; read the real dev code (read-only `git` over HTTPS is enough) and reconcile before trusting the assertion, or you gate on your own guess.
- [SWB-ASK-ONE-LINE]: A multi-line `swb ask` message (PowerShell here-string) posted only its first line - everything after the first newline was silently dropped in the `.cmd`/argv chain on Windows, so the drift findings never reached the board until re-sent as one line. -> Pass `swb` message bodies as a SINGLE line (no newlines), then `swb show` to confirm the whole thing landed.
