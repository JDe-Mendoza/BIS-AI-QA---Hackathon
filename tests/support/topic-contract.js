// Executable spec of the FROZEN topic-CRUD contract (admin lane).
// Source of truth: plans/8716 CONTRACTS.md (ajaxht2microlearning.saveTopic /
// getTopics / getTopicDetails) + HAC-382 [decision][admin] "Validate Title only;
// Description optional" + Admin/02 - Dashboard.md (02.e Add Topic) + Admin/04 - Topic Settings.md.
//
// This is the CONTRACT ORACLE, not production code. Its job is to make the topic
// rules executable so Suite B (T0) runs GREEN today, before the real admin module
// is readable. When the team2-hackathon code is wired in, the specs get repointed
// at the real saveTopic/getTopics/getTopicDetails and MUST still pass - that
// repoint is the definition-of-done gate (see tests/README.md).
//
// Frozen rules encoded here:
//   - saveTopic({topicId:0,...}) creates; topicId>0 edits the same row.
//     Returns the bisapi envelope { error:false, topicId }. (B1/B8)
//   - Validation is TITLE-ONLY (HAC-382): empty/whitespace title => error with the
//     single message "Please enter a title." and NO topic persisted. Description is
//     OPTIONAL - a valid title with no description still saves. (B2)
//   - New topic defaults to status "active" (draft/deactivated are stretch). (B1)
//   - No image => imageUrl null; the FE renders the default image for null. (B5)
//   - Field limits (counter/maxlength in the FE): title <= 150, description <= 500.
//     These are the counter thresholds, not extra error copy. (B3/B4)
//   - status/progress strings are lowercase per the bisapi envelope convention.

export const TITLE_MAX = 150;
export const DESCRIPTION_MAX = 500;
export const TITLE_REQUIRED_MESSAGE = 'Please enter a title.';
export const DEFAULT_TOPIC_IMAGE = '/microlearning/assets/topic-default.png';

// Mirrors the Add-Topic form validation (HAC-336 addTopic/BuildYourOwnForm.js):
// title is the ONLY required/validated field; empty or whitespace-only is rejected
// with the one canonical message. Description is intentionally not validated (HAC-382).
export function validateTopic({ title } = {}) {
  if (title == null || String(title).trim() === '') {
    return { valid: false, message: TITLE_REQUIRED_MESSAGE };
  }
  return { valid: true, message: null };
}

// The FE counter/maxlength limits (title 150, description 500). Description is
// optional, so an empty description is within limits. This is the length rule the
// counter enforces - the DOM "counter turns red / cannot type past" behaviour is
// verified in the Playwright/manual lane (see tests/README.md "Layer boundary").
export function withinLimits({ title = '', description = '' } = {}) {
  return String(title).length <= TITLE_MAX && String(description).length <= DESCRIPTION_MAX;
}

// FE image resolution: a null imageUrl falls back to the default topic image, so a
// topic created without an upload never renders a broken/empty image. (B5)
export function displayImageUrl(topic) {
  return topic && topic.imageUrl != null ? topic.imageUrl : DEFAULT_TOPIC_IMAGE;
}

// A persistent topic store (think: tblht2MicrolearningTopic behind saveTopic/getTopics).
// Not reset between calls - reusing one instance models the DB across requests.
export function createTopicStore(now = () => new Date().toISOString()) {
  const byId = new Map();
  let nextId = 12; // matches the CONTRACTS.md example topicId

  // Mirrors ajaxht2microlearning.saveTopic - returns the bisapi envelope.
  function saveTopic({ topicId = 0, title, description = '', languages = [] } = {}) {
    const check = validateTopic({ title }); // title-only validation (HAC-382)
    if (!check.valid) return { error: true, message: check.message };

    if (topicId && byId.has(topicId)) {
      const existing = byId.get(topicId);
      existing.title = title;
      existing.description = description;
      existing.languages = languages;
      existing.lastUpdated = now();
      return { error: false, topicId };
    }

    const id = topicId && topicId > 0 ? topicId : nextId++;
    byId.set(id, {
      topicId: id,
      title,
      description,
      imageUrl: null, // no image on create => FE shows the default (B5)
      status: 'active', // default on create; draft/deactivated are stretch (B1)
      activityCount: 0,
      languages,
      lastUpdated: now(),
    });
    return { error: false, topicId: id };
  }

  // Mirrors ajaxht2microlearning.getTopics - status/search filtered (search scoped
  // to title + description here; activity-name search is a T1 UI concern).
  function getTopics({ status = 'active', search = '' } = {}) {
    const term = String(search).trim().toLowerCase();
    const topics = [...byId.values()]
      .filter((t) => t.status === status)
      .filter(
        (t) =>
          term === '' ||
          t.title.toLowerCase().includes(term) ||
          String(t.description || '').toLowerCase().includes(term),
      );
    return { error: false, topics };
  }

  // Mirrors ajaxht2microlearning.getTopicDetails - the topic plus its activities.
  function getTopicDetails(topicId) {
    const topic = byId.get(topicId) ?? null;
    return { error: topic == null, topic, activities: [] };
  }

  return { saveTopic, getTopics, getTopicDetails };
}
