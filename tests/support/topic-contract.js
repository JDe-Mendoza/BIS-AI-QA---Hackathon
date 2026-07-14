// Executable spec of the FROZEN topic-CRUD contract (admin lane), VERIFIED against
// the merged implementation on team2-hackathon (HAC-343 / PR 11844), read 2026-07-14:
//   v1/model/services/ht2microlearning.cfc   saveTopic/getTopics/getTopicDetails
//   v1/views/ht2microlearning/src/components/addTopic/BuildYourOwnForm.js  (limits)
//   v1/views/.../addTopic/__tests__/AddTopic.test.js   (FE validation copy)
//   db_scripts/8716_MicrolearningSchema.sql   (column types + defaults)
// plus plans/8716 CONTRACTS.md and HAC-382 [decision][admin] "Validate Title only;
// Description optional".
//
// CONTRACT ORACLE, not production code. It makes the topic rules executable so Suite B
// (T0) runs GREEN and now matches the merged code. The ColdFusion backend cannot be
// imported into Vitest; real backend behaviour is exercised in the Playwright-on-staging
// lane (see tests/README.md).
//
// Verified rules (svc.cfc line refs):
//   - saveTopic: empty/whitespace title => BARE { error:true } (L59-61). The
//     "Please enter a title." copy is the FE layer only (validateTopic), rendered by
//     AddTopicModal, which also blocks the call client-side. Description is OPTIONAL.
//   - title/description are CAPPED, not rejected: FE maxLength + backend
//     left(trim(x),150|500) (L57-58) trim then truncate silently. (B3/B4)
//   - create defaults status "active" (L79; schema fldStatus DEFAULT 'active'). (B1)
//   - getTopics filters by status, searches fldTitle ONLY (L35), orders recency DESC (L38).
//   - no image => the API returns imageUrl "" (topicRowToStruct: fldImagePath ?: "").
//     NB CONTRACTS.md freezes this as null - discrepancy raised to @rejith.krishnan;
//     displayImageUrl treats both "" and null as no-image so B5 is robust either way.

export const TITLE_MAX = 150;
export const DESCRIPTION_MAX = 500;
export const TITLE_REQUIRED_MESSAGE = 'Please enter a title.';
export const DEFAULT_TOPIC_IMAGE = '/microlearning/assets/topic-default.png';

// FE-layer validation (AddTopicModal / BuildYourOwnForm): title-only. This is where the
// single message lives - the backend does NOT echo it. (HAC-382; dev AddTopic.test.js A2)
export function validateTopic({ title } = {}) {
  if (title == null || String(title).trim() === '') {
    return { valid: false, message: TITLE_REQUIRED_MESSAGE };
  }
  return { valid: true, message: null };
}

// Field cap: FE maxLength + backend left(trim(x), max) => trimmed then truncated, never
// rejected. Mirrors svc.cfc L57-58 and the dev "title capped at 150" test. (B3/B4)
export function capField(value, max) {
  return String(value ?? '').trim().slice(0, max);
}

// FE image resolution: a missing image (imageUrl "" OR null) falls back to the default,
// so a topic created without an upload never renders broken/empty. (B5)
export function displayImageUrl(topic) {
  return topic && topic.imageUrl ? topic.imageUrl : DEFAULT_TOPIC_IMAGE;
}

// A persistent topic store (think: tblht2MicrolearningTopic behind saveTopic/getTopics).
export function createTopicStore(now = () => new Date().toISOString()) {
  const byId = new Map();
  let nextId = 12; // matches the CONTRACTS.md example topicId

  // Mirrors ajaxht2microlearning.saveTopic -> the bisapi envelope.
  function saveTopic({ topicId = 0, title, description = '', languages = [] } = {}) {
    // Backend guard: empty/whitespace title => bare { error:true } (no message; that is
    // the FE's job). Verified: svc.cfc L59-61.
    if (!validateTopic({ title }).valid) return { error: true };

    const cleanTitle = capField(title, TITLE_MAX); // left(trim(title),150)
    const cleanDescription = capField(description, DESCRIPTION_MAX); // left(trim(description),500)

    if (topicId && byId.has(topicId)) {
      const existing = byId.get(topicId);
      existing.title = cleanTitle;
      existing.description = cleanDescription;
      existing.languages = languages;
      existing.lastUpdated = now();
      return { error: false, topicId };
    }

    const id = topicId && topicId > 0 ? topicId : nextId++;
    byId.set(id, {
      topicId: id,
      title: cleanTitle,
      description: cleanDescription,
      imageUrl: '', // no image => API returns "" (see header note / Rejith discrepancy)
      status: 'active', // create default; schema fldStatus DEFAULT 'active'
      activityCount: 0,
      providerName: '', // derived from the company in real code
      languages,
      lastUpdated: now(),
    });
    return { error: false, topicId: id };
  }

  // Mirrors getTopics - status filter + fldTitle-ONLY search, newest first.
  // NB the spec's broader search (name/activity/description, B11) is NOT in the merged
  // code yet - the query is title-only (svc.cfc L35).
  function getTopics({ status = 'active', search = '' } = {}) {
    const term = String(search).trim().toLowerCase();
    return {
      error: false,
      topics: [...byId.values()]
        .filter((t) => t.status === status)
        .filter((t) => term === '' || t.title.toLowerCase().includes(term))
        .sort((a, b) => b.topicId - a.topicId), // recency proxy (svc orders lastUpdated DESC, id DESC)
    };
  }

  // Mirrors getTopicDetails - bare { error:true } when not found (svc.cfc L114-116).
  function getTopicDetails(topicId) {
    const topic = byId.get(topicId);
    if (!topic) return { error: true };
    return { error: false, topic, activities: [] };
  }

  return { saveTopic, getTopics, getTopicDetails };
}
