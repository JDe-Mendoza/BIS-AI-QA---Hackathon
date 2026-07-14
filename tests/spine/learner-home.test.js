// Suite H - Learner homepage (T0). The spine's entry point: the learner sees only granted
// topics with derived status and X/Y progress. VERIFIED against the merged
// v1/model/services/ht2mllearner.cfc (getMyTopics + learnerTopicRowToStruct). Scope: Support
// MDs Suite H + "TDD - Spine Test Cases" Suite D.

import { describe, it, expect, beforeEach } from 'vitest';
import { createLearnerStore } from '../support/learner-contract.js';

const [P, Q] = [12, 13];
const LEARNER = 'u1';
const OTHER = 'u2';

describe('Suite H - Learner homepage (T0)', () => {
  let store;
  beforeEach(() => {
    store = createLearnerStore();
  });

  it('H1 - only topics the learner is granted appear (permission-gated)', () => {
    store.addTopic({ topicId: P, title: 'Granted', totalActivities: 3, grantedTo: [LEARNER] });
    store.addTopic({ topicId: Q, title: 'Not granted', totalActivities: 3, grantedTo: [OTHER] });
    expect(store.getMyTopics(LEARNER).topics.map((t) => t.topicId)).toEqual([P]); // Q not shown
  });

  it('H2 - status derived: New=0/Y, In Progress=1..Y-1, Completed=Y/Y', () => {
    store.addTopic({ topicId: P, title: 'T', totalActivities: 3, grantedTo: [LEARNER] });
    const progress = () => store.getMyTopics(LEARNER).topics[0].progress;

    expect(progress()).toBe('new'); // 0/3
    store.setCompleted(P, LEARNER, 1);
    expect(progress()).toBe('inprogress'); // 1/3
    store.setCompleted(P, LEARNER, 2);
    expect(progress()).toBe('inprogress'); // 2/3
    store.setCompleted(P, LEARNER, 3);
    expect(progress()).toBe('completed'); // 3/3
  });

  it('H5 - each topic exposes Content: X/Y (completedActivities / totalActivities)', () => {
    store.addTopic({ topicId: P, title: 'T', totalActivities: 3, grantedTo: [LEARNER] });
    store.setCompleted(P, LEARNER, 2);
    expect(store.getMyTopics(LEARNER).topics[0]).toMatchObject({ completedActivities: 2, totalActivities: 3 });
  });

  it('H2b - per-learner: one learner completing a topic does not change another learner status', () => {
    store.addTopic({ topicId: P, title: 'T', totalActivities: 2, grantedTo: [LEARNER, OTHER] });
    store.setCompleted(P, LEARNER, 2); // LEARNER completes it
    expect(store.getMyTopics(LEARNER).topics[0].progress).toBe('completed');
    expect(store.getMyTopics(OTHER).topics[0].progress).toBe('new'); // OTHER unaffected
  });

  // T1 - filters/order/empty-states. My two H-drift flags were CONFIRMED (Mika, 2026-07-14,
  // after a reversal): SPEC wins on both, the merged code is the bug, fix tracked in HAC-393 -
  //   - H3: the "In Progress" filter MUST include New (Figma 58-1851); the merged code that
  //     excludes New is the bug. Expected: In Progress shows New + In Progress together.
  //   - H6: the learner homepage sorts ALPHABETICALLY; the merged code's recency order is the bug.
  //   Treat include-New + alphabetical as the expected behaviour once HAC-393 lands.
  it.todo('H3 [T1] filter In Progress includes New (HAC-393 fix; merged code drops New = bug)');
  it.todo('H4 [T1] filter Complete shows Completed only; All shows everything');
  it.todo('H6 [T1] topics ordered ALPHABETICALLY + Load More (HAC-393 fix; merged recency = bug)');
  it.todo('H7 [T1] no granted topics -> Welcome empty state');
  it.todo('H8 [T1] search no results -> "No topics found."');
});
