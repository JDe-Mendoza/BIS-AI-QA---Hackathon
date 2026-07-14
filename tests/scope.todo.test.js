// Full committed scope - Support MDs "TDD - Test Cases (Full Scope).md" (Suites A-N).
// Placeholder map so the whole scope is visible and traceable in one run. Fill in
// tier order: T0 spine first (get green by the noon gate), then T1, then T2.
// Do NOT flesh out T2 until the T0 spine is green. The T0 spine suites - A, B, C, H
// and I - are worked separately under tests/spine/; this file is the remaining map.
// [GUARD] = stop-the-line case.
//
// Field constraints (load-bearing, from the V2 spec + frozen decisions):
//   Topic: title <=150 required, description <=500 OPTIONAL (HAC-382), image JPG/PNG <4MB,
//          status Active(default)/Draft/Deactivated
//   Content: title <=50 required, type Link/PDF/Video(URL+MP4 <80MB)/SCORM,
//            sorted alphabetically, completeAgain edit-only

import { describe, it } from 'vitest';

// Suite A - Setup & Access: worked in tests/spine/setup-access.test.js
// (A1/A2/A2b green against the settings-contract oracle; A3/A4 [T1] todo).

// Suite B - Topic CRUD & Dashboard: worked in tests/spine/topic-crud.test.js
// (B1/B1b/B2/B3/B4/B5/B8 green against the topic-contract oracle; B6/B7/B9-B14 todo).

// Suite C - Content CRUD: worked in tests/spine/content-crud.test.js
// (C1/C2/C3/C6/C7/C8/C11 green against the content-contract oracle; C4/C5/C9/C10 todo).

describe('Suite D - Content lifecycle: deactivate/reactivate/purge/bulk [T1]', () => {
  it.todo('D1-D3 deactivate hides from learner / date+by shown / reactivate restores');
  it.todo('D4 [GUARD] purge (purge code) -> permanent delete AND all completion records removed');
  it.todo('D5-D7 bulk-select action bars + select-all');
});

describe('Suite E - Edit extras: drag-reorder & Complete Again [T1/T2]', () => {
  it.todo('E4 [T1] [GUARD] Preview (eye) must NOT record completion for the admin');
  it.todo('E1-E3 [T2] drag reorder persists; Complete Again unchecked/checked semantics');
});

describe('Suite F - Permissions [T1]', () => {
  it.todo('F1 add By User -> that user sees the topic; non-granted does not');
  it.todo('F3 remove permission -> access lost (drops off homepage)');
  it.todo('F2 By Company Role (final types: By User + By Company Role per HAC-387; By Location dropped)');
});

describe('Suite G - Multi-language & auto-translate [T2]', () => {
  it.todo('G1-G5 default language chip, add/delete language, per-language fields, auto-translate');
});

// Suite H - Learner homepage: worked in tests/spine/learner-home.test.js
// (H1/H2/H2b/H5 green against the learner-contract oracle; H3/H4/H6/H7/H8 [T1] todo).

describe('Suite J - SCORM completion [T2]', () => {
  it.todo('J1 open SCORM does NOT auto-complete; J2 runtime callback completes; J3 confirm signal');
});

describe('Suite K - Notifications Email+SMS [T2]', () => {
  it.todo('K1 assign fires Email+SMS; K2 update fires; K3 on assign/update not via scheduler');
});

describe('Suite L - Unavailable topic/content [T1]', () => {
  it.todo('L1 web deactivated/purged link -> "Cannot be found" modal after login');
  it.todo('L3 mobile -> snackbar/toast; L2 [T2] draft -> "temporarily unavailable"');
});

describe('Suite M - Home-page Training section entry [T2]', () => {
  it.todo('M1 portal home surfaces assigned/in-progress/completed microlearning');
});

describe('Suite N - Mobile (SafeTapp) [T1] - executed manually per TEST-STRATEGY (Playwright is web-only)', () => {
  it.todo('N1-N5 3rd tab, card fields, content list, open-to-complete in-app, SCORM');
  it.todo('N6 [GUARD] completion syncs both ways mobile/web (shared completion API)');
});
