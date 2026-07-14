// Suite C - Content CRUD (T0). Admin adds the content items a learner will open. Runs against
// the content-contract oracle: the real saveActivity is still a STUB in the merged code
// (ht2microlearning.cfc L142-155, owned by W2-1/HAC-348) and the Add/Edit Activity form is
// HAC-349 - repoint here when they land. Scope: Support MDs Suite C + CONTRACTS.md Activity shape.

import { describe, it, expect, beforeEach } from 'vitest';
import {
  createContentStore,
  validateActivity,
  capField,
  CONTENT_TITLE_MAX,
  TITLE_REQUIRED_MESSAGE,
} from '../support/content-contract.js';

const TOPIC = 12;

describe('Suite C - Content CRUD (T0)', () => {
  let store;
  beforeEach(() => {
    store = createContentStore();
  });

  it('C1 - add Link with a valid URL persists (type=link, open-to-complete, lastUpdated stamp)', () => {
    const res = store.saveActivity({ topicId: TOPIC, title: 'Mirror checks', type: 'link', url: 'https://ex.com/a' });
    expect(res.error).toBe(false);
    const [a] = store.getActivities(TOPIC);
    expect(a).toMatchObject({ title: 'Mirror checks', type: 'link', url: 'https://ex.com/a', completionMode: 'open' });
    expect(a.lastUpdated).toBeTruthy();
  });

  it('C2 - add PDF persists (type=pdf, open-to-complete)', () => {
    store.saveActivity({ topicId: TOPIC, title: 'Handbook', type: 'pdf', fileUrl: 'https://s3/x.pdf' });
    const [a] = store.getActivities(TOPIC);
    expect(a).toMatchObject({ type: 'pdf', fileUrl: 'https://s3/x.pdf', completionMode: 'open' });
  });

  it('C3 - add Video by URL persists (type=video)', () => {
    store.saveActivity({ topicId: TOPIC, title: 'Intro clip', type: 'video', url: 'https://youtu.be/x' });
    const [a] = store.getActivities(TOPIC);
    expect(a).toMatchObject({ type: 'video', url: 'https://youtu.be/x', completionMode: 'open' });
  });

  it('C6 - empty title blocked ("Please enter a title."); over-limit capped at 50', () => {
    expect(store.saveActivity({ topicId: TOPIC, title: '  ', type: 'link' })).toEqual({ error: true });
    expect(store.getActivities(TOPIC)).toHaveLength(0);
    expect(validateActivity({ title: '' })).toEqual({ valid: false, message: TITLE_REQUIRED_MESSAGE });
    expect(CONTENT_TITLE_MAX).toBe(50);
    expect(capField('x'.repeat(80), CONTENT_TITLE_MAX)).toHaveLength(50);
  });

  it('C7 - new content is inserted alphabetically among existing items', () => {
    store.saveActivity({ topicId: TOPIC, title: 'Zebra crossing', type: 'link', url: 'u' });
    store.saveActivity({ topicId: TOPIC, title: 'Apple ladder', type: 'link', url: 'u' });
    store.saveActivity({ topicId: TOPIC, title: 'Mirror checks', type: 'link', url: 'u' });
    expect(store.getActivities(TOPIC).map((a) => a.title)).toEqual([
      'Apple ladder',
      'Mirror checks',
      'Zebra crossing',
    ]);
  });

  it('C8 - a topic with no content returns an empty list (empty state)', () => {
    expect(store.getActivities(TOPIC)).toEqual([]);
  });

  it('C11 - content added to a topic appears in its content list (visible to a permitted learner)', () => {
    const { activityId } = store.saveActivity({ topicId: TOPIC, title: 'Visible item', type: 'link', url: 'u' });
    expect(store.getActivities(TOPIC).map((a) => a.activityId)).toContain(activityId);
    // learner-side visibility is cross-checked in Suite H (getMyTopics/getTopic return active content)
  });

  it.todo('C4 [T1] add Video by MP4 upload (<80MB) -> completionMode=watch; >80MB rejected');
  it.todo('C5 [T2] add SCORM (.zip) -> completionMode=score, plays in runtime');
  it.todo('C9 [T1] edit content item persists in grid + list');
  it.todo('C10 [T1] content grid <-> list toggle renders both');
});
