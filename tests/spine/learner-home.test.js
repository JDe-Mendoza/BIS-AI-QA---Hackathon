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

  // T1 - filters + order. VERIFIED against HAC-393 (merged 2026-07-14): getMyTopics sorts
  // ORDER BY COALESCE(tl.fldTitle, t.fldTitle) (alphabetical, H6) and the "inprogress" filter
  // matches progress inprogress OR new (In Progress includes New per Figma 58-1851, H3).
  it('H3 [T1] filter In Progress includes New (New + In Progress together, HAC-393)', () => {
    store.addTopic({ topicId: 1, title: 'Apple', totalActivities: 2, grantedTo: [LEARNER] }); // new 0/2
    store.addTopic({ topicId: 2, title: 'Mango', totalActivities: 2, grantedTo: [LEARNER] });
    store.setCompleted(2, LEARNER, 1); // inprogress 1/2
    store.addTopic({ topicId: 3, title: 'Zebra', totalActivities: 2, grantedTo: [LEARNER] });
    store.setCompleted(3, LEARNER, 2); // completed 2/2
    expect(store.getMyTopics(LEARNER, { filter: 'inprogress' }).topics.map((t) => t.title)).toEqual([
      'Apple', // New - included per HAC-393
      'Mango', // In Progress
    ]); // Zebra (Completed) excluded; alphabetical
  });

  it('H4 [T1] filter Complete shows only Completed; All shows everything', () => {
    store.addTopic({ topicId: 1, title: 'Apple', totalActivities: 2, grantedTo: [LEARNER] }); // new
    store.addTopic({ topicId: 3, title: 'Zebra', totalActivities: 2, grantedTo: [LEARNER] });
    store.setCompleted(3, LEARNER, 2); // completed
    expect(store.getMyTopics(LEARNER, { filter: 'completed' }).topics.map((t) => t.title)).toEqual(['Zebra']);
    expect(store.getMyTopics(LEARNER, { filter: 'all' }).topics.map((t) => t.title)).toEqual(['Apple', 'Zebra']);
  });

  it('H6 [T1] topics are ordered ALPHABETICALLY by title (HAC-393, not recency)', () => {
    store.addTopic({ topicId: 1, title: 'Zebra', totalActivities: 1, grantedTo: [LEARNER] });
    store.addTopic({ topicId: 2, title: 'Apple', totalActivities: 1, grantedTo: [LEARNER] });
    store.addTopic({ topicId: 3, title: 'Mango', totalActivities: 1, grantedTo: [LEARNER] });
    expect(store.getMyTopics(LEARNER).topics.map((t) => t.title)).toEqual(['Apple', 'Mango', 'Zebra']);
  });

  it.todo('H7 [T1] no granted topics -> Welcome empty state');
  it.todo('H8 [T1] search no results -> "No topics found."');
});
