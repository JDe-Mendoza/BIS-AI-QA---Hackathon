// Suite B - Topic CRUD & Dashboard (T0). The first step of the demo spine:
// an admin BUILDS a topic (before a learner can open it and tick it complete).
// Scope: Support MDs "TDD - Test Cases (Full Scope).md" Suite B + "TDD - Spine Test
// Cases.md" Suite A + frozen plans/8716 CONTRACTS.md (saveTopic/getTopics)
// + HAC-382 [decision][admin] "Validate Title only; Description optional".
//
// These run against the CONTRACT ORACLE today. Repoint the import at the real
// team2-hackathon admin module (ajaxht2microlearning.saveTopic/getTopics) once the
// code is wired (see tests/README.md); the assertions do not change - that is the
// definition-of-done gate.

import { describe, it, expect, beforeEach } from 'vitest';
import {
  createTopicStore,
  validateTopic,
  withinLimits,
  displayImageUrl,
  TITLE_MAX,
  DESCRIPTION_MAX,
  TITLE_REQUIRED_MESSAGE,
  DEFAULT_TOPIC_IMAGE,
} from '../support/topic-contract.js';

describe('Suite B - Topic CRUD & Dashboard (T0)', () => {
  let store;
  beforeEach(() => {
    store = createTopicStore();
  });

  it('B1 - create topic with valid title + description persists as an Active card', () => {
    const res = store.saveTopic({
      title: 'Defensive Driving',
      description: 'Mirror checks and following distance.',
    });
    expect(res.error).toBe(false);
    expect(res.topicId).toBeGreaterThan(0);

    const { topics } = store.getTopics({ status: 'active' });
    expect(topics).toHaveLength(1);
    expect(topics[0]).toMatchObject({
      topicId: res.topicId,
      title: 'Defensive Driving',
      status: 'active', // defaults to Active on create
    });
  });

  it('B1b - description is OPTIONAL: a valid title with no description still persists (HAC-382)', () => {
    const res = store.saveTopic({ title: 'Ladder Safety' }); // no description supplied
    expect(res.error).toBe(false);

    const { topics } = store.getTopics({ status: 'active' });
    expect(topics).toHaveLength(1);
    expect(topics[0].title).toBe('Ladder Safety');
  });

  it('B2 - empty title is blocked with "Please enter a title." and no topic is created', () => {
    const res = store.saveTopic({ title: '   ', description: 'has a body but no title' });
    expect(res).toMatchObject({ error: true, message: TITLE_REQUIRED_MESSAGE });
    expect(store.getTopics({ status: 'active' }).topics).toHaveLength(0);

    // Title is the single validated field; the message copy is fixed (HAC-382).
    expect(validateTopic({ title: '' })).toEqual({ valid: false, message: TITLE_REQUIRED_MESSAGE });
    expect(TITLE_REQUIRED_MESSAGE).toBe('Please enter a title.');
  });

  it('B3 - title limit is 150: exactly 150 is allowed, 151 exceeds the counter limit', () => {
    expect(TITLE_MAX).toBe(150);
    expect(withinLimits({ title: 'x'.repeat(150) })).toBe(true);
    expect(withinLimits({ title: 'x'.repeat(151) })).toBe(false);
  });

  it('B4 - description limit is 500: exactly 500 allowed, 501 exceeds; empty is allowed (optional)', () => {
    expect(DESCRIPTION_MAX).toBe(500);
    expect(withinLimits({ title: 'ok', description: 'x'.repeat(500) })).toBe(true);
    expect(withinLimits({ title: 'ok', description: 'x'.repeat(501) })).toBe(false);
    expect(withinLimits({ title: 'ok', description: '' })).toBe(true); // optional
  });

  it('B5 - no image uploaded resolves to the default topic image (null imageUrl, never broken)', () => {
    const { topicId } = store.saveTopic({ title: 'Fire Extinguisher Basics' });
    const { topic } = store.getTopicDetails(topicId);
    expect(topic.imageUrl).toBeNull();
    expect(displayImageUrl(topic)).toBe(DEFAULT_TOPIC_IMAGE);
    expect(displayImageUrl(topic)).toBeTruthy(); // not broken/empty
  });

  it('B8 - edit title/description persists and does not create a second topic', () => {
    const { topicId } = store.saveTopic({ title: 'Old Title', description: 'old body' });
    const edit = store.saveTopic({ topicId, title: 'New Title', description: 'new body' });
    expect(edit).toMatchObject({ error: false, topicId });

    const { topic } = store.getTopicDetails(topicId);
    expect(topic).toMatchObject({ topicId, title: 'New Title', description: 'new body' });
    expect(store.getTopics({ status: 'active' }).topics).toHaveLength(1);
  });

  // T1 - UI/DOM behaviours that need the real admin FE (counter turns red, crop modal,
  // grid/list toggle, pillbox filter, search + empty states, card hover/clickability).
  // These belong to the Playwright/manual lane per tests/README.md "Layer boundary";
  // stubbed here for traceability. Flesh out once the admin module is readable.
  it.todo('B6 [T1] image upload + crop modal -> cropped image saved and shown on card');
  it.todo('B7 [T1] image >4MB or non-JPG/PNG -> rejected with the format/size helper');
  it.todo('B9 [T1] dashboard grid <-> list toggle renders the same topics in both layouts');
  it.todo('B10 [T1] status pillbox (Active/Draft/Deactivated) filters cards to that status');
  it.todo('B11 [T1] search matches name/activity/description scoped to the active pill; (x) clears');
  it.todo('B12 [T1] search no match -> "No topics found."');
  it.todo('B13 [T1] no topics at all -> Welcome empty state');
  it.todo('B14 [T1] Active card is clickable (hover); Deactivated card is not clickable');
});
