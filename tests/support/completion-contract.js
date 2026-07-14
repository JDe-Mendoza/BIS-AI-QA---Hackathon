// Executable spec of the FROZEN learner completion contract.
// Source of truth: plans/8716 CONTRACTS.md (ajaxht2mllearner.cfc) +
// 1st - Microlearning/Support MDs (Suite I completion logic).
//
// This is the CONTRACT ORACLE, not production code. Its job is to make the
// completion rules executable so the guard specs (I7/I8/I9) run GREEN today,
// before the real learner module is readable. When the team2-hackathon code is
// wired in, the specs get repointed at the real recordCompletion/progress logic
// and MUST still pass - that repoint is the whole point of "read the code".
//
// Frozen rules encoded here:
//   - recordCompletion({activityId}) is idempotent per (learner, activityId);
//     duplicate calls do NOT increment and KEEP the first-completed timestamp. (I7)
//   - completion is per-learner - one learner's progress never leaks to another. (I8)
//   - state is external to any session, so it survives reload/re-login. (I9)
//   - progress: 0 complete => "new"; 1..total-1 => "inprogress"; total => "completed". (I5/I6)

export function deriveProgress(completed, total) {
  if (total === 0 || completed === 0) return 'new';
  if (completed >= total) return 'completed';
  return 'inprogress';
}

// A persistent store (think: the DB tblht2MicrolearningCompletion). Not reset on
// "reload" - reusing the same store instance across calls models persistence.
export function createCompletionStore(now = () => new Date().toISOString()) {
  // Map<learnerId, Map<activityId, firstCompletedIso>>
  const byLearner = new Map();
  const topicOf = new Map(); // activityId -> topicId

  function completionsFor(learnerId) {
    if (!byLearner.has(learnerId)) byLearner.set(learnerId, new Map());
    return byLearner.get(learnerId);
  }

  function register(activityId, topicId) {
    topicOf.set(activityId, topicId);
  }

  function belongsToTopic(activityId, topicId) {
    return topicId == null || topicOf.get(activityId) === topicId;
  }

  // Mirrors ajaxht2mllearner.recordCompletion - returns the bisapi envelope shape.
  function recordCompletion(learnerId, { activityId, topicId, totalActivities }) {
    const done = completionsFor(learnerId);
    if (!done.has(activityId)) {
      done.set(activityId, now()); // first completion only - idempotent thereafter
    }
    const activitiesInTopic = [...done.keys()].filter((id) => belongsToTopic(id, topicId));
    const completedActivities = topicId == null ? done.size : activitiesInTopic.length;
    return {
      error: false,
      completedActivities,
      totalActivities,
      progress: deriveProgress(completedActivities, totalActivities),
    };
  }

  function firstCompleted(learnerId, activityId) {
    return completionsFor(learnerId).get(activityId) ?? null;
  }

  return { recordCompletion, firstCompleted, deriveProgress, register };
}
