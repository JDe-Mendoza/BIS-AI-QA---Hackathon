# QA agent - Vitest test suite

Automated test cases for the Microlearning module (PM 8716), authored test-first
from the specs in `../1st - Microlearning/Support MDs/` and the frozen
`plans/8716 CONTRACTS.md`. Green here is the `swb done` gate.

## Run

```powershell
npm install       # first time only (installs vitest)
npm test          # vitest run - all specs once
npm run test:watch
npm run test:spine   # just the T0 spine
npm run test:guard   # just the stop-the-line guards
```

## Layout

```
tests/
  support/completion-contract.js   # executable oracle of the FROZEN completion rules
  spine/completion.test.js          # Suite I (T0 core) - I5/I6/I7/I8/I9 run green today
  scope.todo.test.js                # Suites A-N mapped as it.todo(), tier-ordered
```

## How specs bind to the code (the "read the changes" seam)

Right now the completion specs assert against the contract oracle
(`support/completion-contract.js`) so the guard logic is executable before any
feature code exists. The real code lives in the developers' `team2-hackathon`
repo (React frontend; ColdFusion `ajaxht2ml*.cfc` backend).

Once that code is available and mounted (see the `code` path in `vitest.config.js`):
1. Repoint each spec's import from `../support/completion-contract.js` to the real
   module (e.g. the learner completion/progress helper).
2. The assertions do not change - if the real implementation is correct, the same
   guard tests stay green. That repoint is the definition-of-done gate.

The agent reads what the devs changed via `git ... pull` + `git log`/`git diff`
(or PR diffs from the URLs devs attach on `swb done`), then writes/updates the
matching spec.

## Tiers & order (do not skip)

- T0 spine first -> green by the noon gate (Suites A, B, C(T0), H, I(T0)).
- T1 next (alpha-viable). T2 last, cut top-down if behind.
- Guard tests (stop-the-line): I7, I8, I9, E4, D4, I11, N6.

## Layer boundary

Vitest = unit/logic/contract on the JS/React code + frozen payload shapes.
Web E2E (full flows on team2.staging.bissafety.app) is Playwright in
`../../hackathon-automation/`; case management + manual/mobile is TestRail. See
`../../8716/8716/TEST-STRATEGY.html`.
