// Executable spec of the learner homepage contract (Suite H), VERIFIED against the merged
// code: v1/model/services/ht2mllearner.cfc getMyTopics + learnerTopicRowToStruct.
//   - progress derived: 0 done => new; done>=total => completed; else inprogress. (H2)
//   - each topic carries completedActivities + totalActivities (the "X/Y"). (H5)
//   - active topics only; filter all|inprogress|completed on the derived progress.
//
// NB grant-filtering (only granted topics appear, H1) is NOT in the merged code yet - the
// getMyTopics WHERE is company + active only; the user-grant join is W2-4 (permissions,
// now By User / By Company Role per HAC-387). This oracle encodes the INTENDED granted-only
// rule so H1 is authored now; repoint when W2-4 lands.
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

  // Mirrors getMyTopics: granted-only (H1, intended rule), progress-derived, filterable.
  function getMyTopics(userId, { filter = 'all' } = {}) {
    const list = [...topics.values()]
      .filter((t) => t.grantedTo.has(userId)) // H1 - granted-only (W2-4 in the real code)
      .map((t) => learnerTopic(t, userId))
      .filter((t) => filter === 'all' || t.progress === filter);
    return { error: false, topics: list };
  }

  return { addTopic, setCompleted, getMyTopics };
}
