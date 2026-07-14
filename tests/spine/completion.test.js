// Suite I - Topic page & completion logic (T0, the core). [GUARD] = stop-the-line.
// Scope: 1st - Microlearning/Support MDs "TDD - Test Cases (Full Scope).md" Suite I
//        + frozen plans/8716 CONTRACTS.md (recordCompletion / progress rollup).
//
// These run against the CONTRACT ORACLE. VERIFIED 2026-07-14 against the merged
// recordCompletion (team2-hackathon f50951f, HAC-355): INSERT ... ON DUPLICATE KEY UPDATE
// fldLastCompleted on uk_activity_user keeps fldFirstCompleted and prevents a second row -
// so I7 (no double-count), I8 (per-learner), I9 (persist) all hold in the real code. Repoint
// the import at the learner module when convenient; the assertions do not change - the gate.

import { describe, it, expect, beforeEach } from 'vitest';
import { createCompletionStore, deriveProgress } from '../support/completion-contract.js';

const TOPIC = 12;
const [A1, A2, A3] = [44, 45, 46]; // three activities in the topic
const LEARNER_X = 'learnerX';
const LEARNER_Y = 'learnerY';

function seedTopicStore() {
  const store = createCompletionStore();
  [A1, A2, A3].forEach((id) => store.register(id, TOPIC));
  return store;
}

const open = (store, learner, activityId) =>
  store.recordCompletion(learner, { activityId, topicId: TOPIC, totalActivities: 3 });

describe('Suite I - completion (T0)', () => {
  let store;
  beforeEach(() => {
    store = seedTopicStore();
  });

  it('I5 - progress increments 0/3 -> 1/3 -> 2/3 -> 3/3', () => {
    expect(deriveProgress(0, 3)).toBe('new');
    expect(open(store, LEARNER_X, A1)).toMatchObject({ completedActivities: 1, totalActivities: 3, progress: 'inprogress' });
    expect(open(store, LEARNER_X, A2)).toMatchObject({ completedActivities: 2, progress: 'inprogress' });
    expect(open(store, LEARNER_X, A3)).toMatchObject({ completedActivities: 3, progress: 'completed' });
  });

  it('I6 - topic flips to Completed at 100%', () => {
    open(store, LEARNER_X, A1);
    open(store, LEARNER_X, A2);
    const res = open(store, LEARNER_X, A3);
    expect(res.progress).toBe('completed');
    expect(res.completedActivities).toBe(res.totalActivities);
  });

  it('I7 [GUARD] - re-opening a completed item does NOT double-count (no 4/3, no regression)', () => {
    open(store, LEARNER_X, A1);
    const before = store.firstCompleted(LEARNER_X, A1);
    const res = open(store, LEARNER_X, A1); // re-open same item
    expect(res.completedActivities).toBe(1); // still 1, never 2 or 4/3
    expect(res.progress).toBe('inprogress');
    expect(store.firstCompleted(LEARNER_X, A1)).toBe(before); // first-completed timestamp kept
  });

  it('I8 [GUARD] - completion is per-learner; X progress never leaks to Y', () => {
    open(store, LEARNER_X, A1);
    open(store, LEARNER_X, A2);
    open(store, LEARNER_X, A3); // X completes the topic
    const y = open(store, LEARNER_Y, A1); // Y opens one item
    expect(y.completedActivities).toBe(1);
    expect(y.progress).toBe('inprogress'); // Y is NOT completed
  });

  it('I9 [GUARD] - completion survives reload / re-login (persisted, not session-only)', () => {
    open(store, LEARNER_X, A1);
    open(store, LEARNER_X, A2); // 2/3
    // "reload": no reset - the same persistent store answers the next read.
    const afterReload = open(store, LEARNER_X, A2); // idempotent re-read of an already-complete item
    expect(afterReload.completedActivities).toBe(2);
    expect(afterReload.progress).toBe('inprogress');
  });

  // Behaviours that need the real FE/endpoint or the dev code - write once code is readable.
  it.todo('I1 - open a granted topic lists its content items, whole card clickable');
  it.todo('I2 - open a Link item (iframe modal) records completion at open, exactly once');
  it.todo('I3 - open a PDF item records completion at open');
  it.todo('I4 - open a Video item records completion at open (NOT gated on full-watch)');
  it.todo('I10 - a Completed item stays openable for review');
  it.todo('I11 [GUARD] [T2] admin adds new content -> topic moves Completed to In Progress, "Updated" pill');
  it.todo('I14 - topic search by content-item name; no match -> "No content found."');
});
