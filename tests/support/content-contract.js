// Executable spec of the content (Activity) CRUD contract (Suite C), VERIFIED 2026-07-14
// against the merged code (team2-hackathon f50951f, HAC-348 backend / HAC-349 form):
//   v1/model/services/ht2microlearning.cfc  saveActivity + uploadActivityFile
//   v1/views/ht2microlearning/src/components/addActivity/ActivityForm.js  (TITLE_MAX)
// plus CONTRACTS.md (Activity shape) + Support MDs Suite C.
//
// CONTRACT ORACLE (the CF backend can't be imported into Vitest; real behaviour is exercised
// in Playwright-on-staging). Verified rules:
//   - saveActivity: empty title OR invalid type OR foreign topic => bare { error:true }; the
//     title is capped left(trim(title),150). (C6)
//   - CONTENT_TITLE_MAX = 150 (HAC-377: fldTitle VARCHAR(150), SAME AS TOPICS - the spec/mockup
//     "50 / counter 0/50" is superseded).
//   - one `url` field carries both: link|video -> browse URL in fldUrl (https:// prefixed when
//     the scheme is missing); pdf|mp4|scorm -> the uploadActivityFile path in fldFilePath.
//   - new content is APPENDED (fldSortOrder = MAX+1) and listed by fldSortOrder = creation
//     order, reorderable via drag (E1). NB the spec's "sorted alphabetically" is superseded by
//     sortOrder + drag-reorder. (C7)
//   - completionMode by type: open (link/pdf/video) | watch (mp4) | score (scorm).

export const CONTENT_TITLE_MAX = 150; // HAC-377: same as topics; supersedes the mockup's 50
export const TITLE_REQUIRED_MESSAGE = 'Please enter a title.';
export const CONTENT_TYPES = ['link', 'pdf', 'video', 'mp4', 'scorm'];
export const URL_TYPES = ['link', 'video']; // carry a browse URL; the rest carry a file path

// Frozen completion mode by type: open (link/pdf/video) | watch (mp4) | score (scorm).
export function completionMode(type) {
  if (type === 'mp4') return 'watch';
  if (type === 'scorm') return 'score';
  return 'open';
}

// saveActivity validation: title required AND type must be a known content type.
export function validateActivity({ title, type = 'link' } = {}) {
  if (title == null || String(title).trim() === '') {
    return { valid: false, message: TITLE_REQUIRED_MESSAGE };
  }
  if (!CONTENT_TYPES.includes(String(type).toLowerCase())) {
    return { valid: false, message: null }; // invalid type => bare error (no copy)
  }
  return { valid: true, message: null };
}

export function capField(value, max) {
  return String(value ?? '').trim().slice(0, max);
}

// link/video URLs get an https:// scheme when none was supplied (mirrors the backend).
export function normalizeUrl(url) {
  const u = String(url ?? '').trim();
  if (u !== '' && !/^https?:\/\//i.test(u)) return 'https://' + u;
  return u;
}

export function createContentStore(now = () => new Date().toISOString()) {
  const byId = new Map();
  let nextId = 44; // matches the CONTRACTS.md example activityId

  function saveActivity({ activityId = 0, topicId, title, type = 'link', url = '' } = {}) {
    const t = String(type).toLowerCase();
    if (!validateActivity({ title, type: t }).valid) return { error: true };

    // one `url` field routes by type: link/video -> browse URL; else -> file path
    const isUrlType = URL_TYPES.includes(t);
    const fields = {
      title: capField(title, CONTENT_TITLE_MAX),
      type: t,
      url: isUrlType ? normalizeUrl(url) : '',
      fileUrl: isUrlType ? '' : String(url ?? '').trim(),
      completionMode: completionMode(t),
      status: 'active',
    };

    if (activityId && byId.has(activityId)) {
      Object.assign(byId.get(activityId), fields, { lastUpdated: now() });
      return { error: false, activityId };
    }
    // append: fldSortOrder = COALESCE(MAX(sortOrder in topic),0)+1
    const sortOrder =
      [...byId.values()].filter((a) => a.topicId === topicId).reduce((m, a) => Math.max(m, a.sortOrder), 0) + 1;
    const id = activityId && activityId > 0 ? activityId : nextId++;
    byId.set(id, { activityId: id, topicId, ...fields, sortOrder, lastUpdated: now() });
    return { error: false, activityId: id };
  }

  // Listed by fldSortOrder (creation order), active-only unless includeInactive. (C7)
  function getActivities(topicId, { includeInactive = false } = {}) {
    return [...byId.values()]
      .filter((a) => a.topicId === topicId)
      .filter((a) => includeInactive || a.status === 'active')
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  return { saveActivity, getActivities };
}
