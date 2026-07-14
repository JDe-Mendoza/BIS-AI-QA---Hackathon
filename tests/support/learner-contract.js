// Executable spec of the learner homepage contract (Suite H), VERIFIED against the merged
// code: v1/model/services/ht2mllearner.cfc getMyTopics + learnerTopicRowToStruct.
//   - progress derived: 0 done => new; done>=total => completed; else inprogress. (H2)
//   - each topic carries completedActivities + totalActivities (the "X/Y"). (H5)
//   - active topics only; filter all|inprogress|completed on the derived progress.
//
// Grant-filtering (only granted topics appear, H1) is now REAL in the merged code: getMyTopics
// calls visibilityFilterSql (HAC-390) - zero-perms-open, else direct-user or role grant. The
// full permission/visibility model lives in the Suite F permission oracle; this models the
// granted-only slice (all H cases here carry grants). Filter/sort match HAC-393 (see getMyTopics).
//
// Reuses deriveProgress from the completion oracle so H2 and Suite I stay in lockstep.

import { deriveProgress } from './completion-contract.js';

export function createLearnerStore() {
  const topics = new Map(); // topicId -> { title, totalActivities, completedByUser, grantedTo }

  function addTopic({ topicId, title = '', totalActivities = 0, grantedTo = [] }) {
    topics.set(topicId, {
      topicId,
      title,
      totalActivities,
      completedByUser: new Map(), // userId -> completed count
      grantedTo: new Set(grantedTo),
    });
  }

  function setCompleted(topicId, userId, count) {
    topics.get(topicId).completedByUser.set(userId, count);
  }

  function learnerTopic(t, userId) {
    const done = t.completedByUser.get(userId) ?? 0;
    return {
      topicId: t.topicId,
      title: t.title,
      completedActivities: done,
      totalActivities: t.totalActivities,
      progress: deriveProgress(done, t.totalActivities),
    };
  }

  // Mirrors getMyTopics: granted-only (H1); filter (HAC-393 H3: "inprogress" includes New);
  // ordered alphabetically by title (HAC-393 H6).
  function getMyTopics(userId, { filter = 'all' } = {}) {
    const matchesFilter = (progress) =>
      filter === 'all' ||
      progress === filter ||
      (filter === 'inprogress' && progress === 'new'); // In Progress shows New + In Progress
    const list = [...topics.values()]
      .filter((t) => t.grantedTo.has(userId)) // H1 - granted-only (visibilityFilterSql)
      .map((t) => learnerTopic(t, userId))
      .filter((t) => matchesFilter(t.progress))
      .sort((a, b) => a.title.localeCompare(b.title)); // alphabetical by title
    return { error: false, topics: list };
  }

  return { addTopic, setCompleted, getMyTopics };
}
