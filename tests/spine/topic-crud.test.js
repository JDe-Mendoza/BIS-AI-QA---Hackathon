// Suite B - Topic CRUD & Dashboard (T0). The first step of the demo spine:
// an admin BUILDS a topic (before a learner can open it and tick it complete).
// VERIFIED 2026-07-14 against the merged team2-hackathon code (HAC-343 / PR 11844):
// v1/model/services/ht2microlearning.cfc, BuildYourOwnForm.js, AddTopic.test.js,
// 8716_MicrolearningSchema.sql. Scope: Support MDs Suite B + "TDD - Spine Test Cases"
// Suite A + CONTRACTS.md + HAC-382 [decision][admin] "Validate Title only; Description optional".
//
// Runs against the CONTRACT ORACLE (the CF backend cannot be imported into Vitest);
// real backend behaviour is exercised in the Playwright-on-staging lane (tests/README.md).

import { describe, it, expect, beforeEach } from 'vitest';
import {
  createTopicStore,
  validateTopic,
  capField,
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
      status: 'active', // schema fldStatus DEFAULT 'active'
    });
  });

  it('B1b - description is OPTIONAL: a valid title with no description still persists (HAC-382)', () => {
    const res = store.saveTopic({ title: 'Ladder Safety' }); // no description supplied
    expect(res.error).toBe(false);

    const { topic } = store.getTopicDetails(res.topicId);
    expect(topic.title).toBe('Ladder Safety');
    expect(topic.description).toBe(''); // schema fldDescription DEFAULT ''
  });

  it('B2 - empty title: backend returns a bare {error:true}; the FE layer owns the message', () => {
    // Backend envelope (svc.cfc L59-61): bare error, NO message string, nothing persisted.
    const res = store.saveTopic({ title: '   ', description: 'has a body but no title' });
    expect(res).toEqual({ error: true });
    expect(store.getTopics({ status: 'active' }).topics).toHaveLength(0);

    // FE layer (AddTopicModal / validateTopic) is where "Please enter a title." lives.
    expect(validateTopic({ title: '' })).toEqual({ valid: false, message: TITLE_REQUIRED_MESSAGE });
    expect(validateTopic({ title: '   ' }).valid).toBe(false); // whitespace treated as empty
    expect(TITLE_REQUIRED_MESSAGE).toBe('Please enter a title.');
  });

  it('B3 - title is CAPPED at 150 (trimmed + truncated), not rejected', () => {
    expect(TITLE_MAX).toBe(150);
    expect(capField('x'.repeat(200), TITLE_MAX)).toHaveLength(150);
    expect(capField('  spaced  ', TITLE_MAX)).toBe('spaced'); // trims like left(trim())
    // a 200-char title persists truncated to 150 (matches dev AddTopic.test.js "capped at 150")
    const { topicId } = store.saveTopic({ title: 'y'.repeat(200) });
    expect(store.getTopicDetails(topicId).topic.title).toHaveLength(150);
  });

  it('B4 - description is CAPPED at 500 and is optional (empty allowed)', () => {
    expect(DESCRIPTION_MAX).toBe(500);
    expect(capField('z'.repeat(600), DESCRIPTION_MAX)).toHaveLength(500);
    const { topicId } = store.saveTopic({ title: 'ok', description: 'z'.repeat(600) });
    expect(store.getTopicDetails(topicId).topic.description).toHaveLength(500);
    expect(store.saveTopic({ title: 'no desc' }).error).toBe(false); // optional
  });

  it('B5 - no image => API imageUrl "" resolves to the default (never broken)', () => {
    const { topicId } = store.saveTopic({ title: 'Fire Extinguisher Basics' });
    const { topic } = store.getTopicDetails(topicId);
    // Real API returns "" for no image (CONTRACTS.md says null - discrepancy raised to Rejith).
    expect(topic.imageUrl).toBe('');
    expect(displayImageUrl(topic)).toBe(DEFAULT_TOPIC_IMAGE);
    expect(displayImageUrl({ imageUrl: null })).toBe(DEFAULT_TOPIC_IMAGE); // robust either way
  });

  it('B8 - edit title/description persists and does not create a second topic', () => {
    const { topicId } = store.saveTopic({ title: 'Old Title', description: 'old body' });
    const edit = store.saveTopic({ topicId, title: 'New Title', description: 'new body' });
    expect(edit).toMatchObject({ error: false, topicId });

    const { topic } = store.getTopicDetails(topicId);
    expect(topic).toMatchObject({ topicId, title: 'New Title', description: 'new body' });
    expect(store.getTopics({ status: 'active' }).topics).toHaveLength(1);
  });

  // T1 - UI/DOM behaviours that need the real admin FE (counter, crop modal, grid/list,
  // pillbox, search + empty states, card hover/clickability). Playwright/manual lane per
  // tests/README.md "Layer boundary". NB B11 search: the merged getTopics is title-ONLY,
  // so the spec's name/activity/description search is not yet implemented.
  it.todo('B6 [T1] image upload + crop modal -> cropped image saved and shown on card');
  it.todo('B7 [T1] image >4MB or non-JPG/PNG -> rejected with the format/size helper');
  it.todo('B9 [T1] dashboard grid <-> list toggle renders the same topics in both layouts');
  it.todo('B10 [T1] status pillbox (Active/Draft/Deactivated) filters cards to that status');
  it.todo('B11 [T1] search matches name/activity/description (merged code is title-only - gap)');
  it.todo('B12 [T1] search no match -> "No topics found."');
  it.todo('B13 [T1] no topics at all -> Welcome empty state');
  it.todo('B14 [T1] Active card is clickable (hover); Deactivated card is not clickable');
});
