// Executable spec of the content (Activity) CRUD contract (Suite C).
// Source: plans/8716 CONTRACTS.md (Activity shape + saveActivity) + Support MDs Suite C.
//
// NB the real ajaxht2microlearning.saveActivity is still a STUB in the merged code
// (v1/model/services/ht2microlearning.cfc L142-155, owned by W2-1/HAC-348), and the Add/Edit
// Activity form is HAC-349. So Suite C runs against THIS oracle and gets repointed once the
// content backend lands. Verified shape bits (from CONTRACTS.md + schema): type enum
// link|pdf|video(|mp4|scorm), completionMode open|watch|score, status active|deactivated.
//
// CONTENT_TITLE_MAX: Support MDs / C6 say 50 (counter "0/50"). NB the schema column is
// VARCHAR(150) (provisioned wide) - the 50 cap is the FE constraint per spec and is UNVERIFIED
// until the Add-Content form (HAC-349) exists; confirm the real maxLength then.

export const CONTENT_TITLE_MAX = 50;
export const TITLE_REQUIRED_MESSAGE = 'Please enter a title.';
export const CONTENT_TYPES = ['link', 'pdf', 'video']; // T0; mp4/scorm are later tiers

// Frozen completion mode by type: open (link/pdf/video) | watch (mp4) | score (scorm).
export function completionMode(type) {
  if (type === 'mp4') return 'watch';
  if (type === 'scorm') return 'score';
  return 'open';
}

// Title-only validation, mirroring the topic form (empty/whitespace blocked).
export function validateActivity({ title } = {}) {
  if (title == null || String(title).trim() === '') {
    return { valid: false, message: TITLE_REQUIRED_MESSAGE };
  }
  return { valid: true, message: null };
}

export function capField(value, max) {
  return String(value ?? '').trim().slice(0, max);
}

export function createContentStore(now = () => new Date().toISOString()) {
  const byId = new Map();
  let nextId = 44; // matches the CONTRACTS.md example activityId

  function saveActivity({ activityId = 0, topicId, title, type = 'link', url = '', fileUrl = '' } = {}) {
    if (!validateActivity({ title }).valid) return { error: true };
    const id = activityId && activityId > 0 ? activityId : nextId++;
    byId.set(id, {
      activityId: id,
      topicId,
      title: capField(title, CONTENT_TITLE_MAX),
      type,
      url,
      fileUrl,
      completionMode: completionMode(type),
      status: 'active',
      sortOrder: 0,
      lastUpdated: now(),
    });
    return { error: false, activityId: id };
  }

  // Content is listed ALPHABETICALLY by title (C7 / Support MDs "sorted alphabetically").
  // NB the merged admin getTopicDetails currently orders by fldSortOrder - reconcile when
  // the content backend (HAC-348) + drag-reorder (E1) land; spec default is alphabetical.
  function getActivities(topicId, { includeInactive = false } = {}) {
    return [...byId.values()]
      .filter((a) => a.topicId === topicId)
      .filter((a) => includeInactive || a.status === 'active')
      .sort((a, b) => a.title.localeCompare(b.title));
  }

  return { saveActivity, getActivities };
}
