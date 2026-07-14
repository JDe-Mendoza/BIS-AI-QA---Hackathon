// Suite C - Content CRUD (T0). Admin adds the content items a learner will open. VERIFIED
// 2026-07-14 against the merged code (team2-hackathon f50951f): HAC-348 saveActivity/
// uploadActivityFile + HAC-349 ActivityForm.js. Scope: Support MDs Suite C + CONTRACTS.md.
//
// Runs against the content-contract oracle (the CF backend can't be imported into Vitest).
// Two spec-vs-code corrections applied after reading the merged code:
//   - content title cap is 150, not 50 (HAC-377: same as topics; mockup "0/50" is superseded)
//   - new content is APPENDED by sortOrder (creation order + drag-reorder), not alphabetical

import { describe, it, expect, beforeEach } from 'vitest';
import {
  createContentStore,
  validateActivity,
  capField,
  normalizeUrl,
  CONTENT_TITLE_MAX,
  TITLE_REQUIRED_MESSAGE,
} from '../support/content-contract.js';

const TOPIC = 12;

describe('Suite C - Content CRUD (T0)', () => {
  let store;
  beforeEach(() => {
    store = createContentStore();
  });

  it('C1 - add Link with a URL persists (type=link, https:// normalized, open-to-complete)', () => {
    const res = store.saveActivity({ topicId: TOPIC, title: 'Mirror checks', type: 'link', url: 'ex.com/a' });
    expect(res.error).toBe(false);
    const [a] = store.getActivities(TOPIC);
    expect(a).toMatchObject({ title: 'Mirror checks', type: 'link', url: 'https://ex.com/a', completionMode: 'open' });
    expect(a.lastUpdated).toBeTruthy();
    expect(normalizeUrl('ex.com/a')).toBe('https://ex.com/a'); // scheme added when missing
  });

  it('C2 - add PDF persists (type=pdf, the file path lands in fileUrl, open-to-complete)', () => {
    store.saveActivity({ topicId: TOPIC, title: 'Handbook', type: 'pdf', url: 'https://s3/ht2/x.pdf' });
    const [a] = store.getActivities(TOPIC);
    expect(a).toMatchObject({ type: 'pdf', fileUrl: 'https://s3/ht2/x.pdf', url: '', completionMode: 'open' });
  });

  it('C3 - add Video by URL persists (type=video)', () => {
    store.saveActivity({ topicId: TOPIC, title: 'Intro clip', type: 'video', url: 'https://youtu.be/x' });
    const [a] = store.getActivities(TOPIC);
    expect(a).toMatchObject({ type: 'video', url: 'https://youtu.be/x', completionMode: 'open' });
  });

  it('C6 - empty title blocked; invalid type blocked; title capped at 150 (HAC-377, not 50)', () => {
    expect(store.saveActivity({ topicId: TOPIC, title: '  ', type: 'link' })).toEqual({ error: true });
    expect(store.saveActivity({ topicId: TOPIC, title: 'ok', type: 'gif' })).toEqual({ error: true }); // bad type
    expect(store.getActivities(TOPIC)).toHaveLength(0);
    expect(validateActivity({ title: '', type: 'link' })).toEqual({ valid: false, message: TITLE_REQUIRED_MESSAGE });
    expect(CONTENT_TITLE_MAX).toBe(150);
    expect(capField('x'.repeat(200), CONTENT_TITLE_MAX)).toHaveLength(150);
  });

  it('C7 - new content is APPENDED in creation order (sortOrder), not alphabetical', () => {
    store.saveActivity({ topicId: TOPIC, title: 'Zebra crossing', type: 'link', url: 'https://u' });
    store.saveActivity({ topicId: TOPIC, title: 'Apple ladder', type: 'link', url: 'https://u' });
    store.saveActivity({ topicId: TOPIC, title: 'Mirror checks', type: 'link', url: 'https://u' });
    // merged code orders by fldSortOrder (append + drag-reorder), NOT the mockup's alphabetical
    expect(store.getActivities(TOPIC).map((a) => a.title)).toEqual([
      'Zebra crossing',
      'Apple ladder',
      'Mirror checks',
    ]);
  });

  it('C8 - a topic with no content returns an empty list (empty state)', () => {
    expect(store.getActivities(TOPIC)).toEqual([]);
  });

  it('C11 - content added to a topic appears in its content list (visible to a permitted learner)', () => {
    const { activityId } = store.saveActivity({ topicId: TOPIC, title: 'Visible item', type: 'link', url: 'https://u' });
    expect(store.getActivities(TOPIC).map((a) => a.activityId)).toContain(activityId);
    // learner-side visibility is cross-checked in Suite H (getMyTopics/getTopic return active content)
  });

  it.todo('C4 [T1] add Video by MP4 upload (<80MB) -> completionMode=watch; >80MB rejected');
  it.todo('C5 [T2] add SCORM (.zip) -> completionMode=score, plays in runtime');
  it('C9 [T1] edit a content item persists (saveActivity with activityId updates the same row)', () => {
    const { activityId } = store.saveActivity({ topicId: TOPIC, title: 'Old', type: 'link', url: 'https://a' });
    const edit = store.saveActivity({ activityId, topicId: TOPIC, title: 'New', type: 'video', url: 'https://youtu.be/x' });
    expect(edit).toMatchObject({ error: false, activityId });
    const items = store.getActivities(TOPIC);
    expect(items).toHaveLength(1); // updates in place, no duplicate row
    expect(items[0]).toMatchObject({ activityId, title: 'New', type: 'video', url: 'https://youtu.be/x', completionMode: 'open' });
  });
  it.todo('C10 [T1] content grid <-> list toggle renders both');
});
