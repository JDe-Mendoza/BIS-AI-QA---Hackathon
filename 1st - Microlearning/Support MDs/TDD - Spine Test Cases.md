# TDD — Microlearning Spine Test Cases

**Purpose:** the definition-of-done for the demo spine, written as cases QA's agent implements **before** dev writes the feature. These drive development from commit #1 — devs code until these pass. Green here = the `swb done` gate.

**Scope:** T0 spine only (the never-cut path) + the cheapest T1 guards. Do NOT write cases for T2 (auto-translate, SCORM, email/SMS) until the spine is green.

**The spine:** admin creates a topic → adds content → learner opens it → completion tracked → topic ticks 2/3 → 3/3 → Completed.

---

## Suite A — Topic CRUD (Admin)

**A1 — Create topic with valid title**
- Given an admin on the Microlearning Dashboard
- When they create a topic with a valid title and description
- Then the topic persists and appears as a card on the Dashboard with status **Draft/Active** as designed

**A2 — Title validation blocks bad input**
- Given the Create Topic form
- When the title is empty OR exceeds the character limit
- Then save is blocked and a validation message shows; no topic is created

**A3 — Edit topic metadata persists**
- Given an existing topic
- When the admin edits title/description and saves
- Then the changes persist and show on the card and Topic Content page

**A4 — Default image fallback**
- Given a topic created without an uploaded image
- Then the default topic image is shown (not a broken/empty image)

**A5 — Deactivate hides from learner (T1 guard)**
- Given an active topic granted to a learner
- When the admin deactivates it
- Then it no longer appears on that learner's homepage

## Suite B — Content CRUD (Admin)

**B1 — Add Link content**
- Given a topic's Content page
- When the admin adds a **Link** item with a valid URL
- Then it persists under the topic, showing the correct type icon and a last-updated timestamp

**B2 — Add PDF content**
- Same as B1 for a **PDF** item; the PDF is retrievable/openable

**B3 — Add Video content**
- Same as B1 for a **Video** item (URL embed and/or uploaded MP4); the video is playable

**B4 — Edit content item persists**
- Given an existing content item
- When the admin edits it and saves
- Then the changes persist and show in both grid and list views

**B5 — Empty state**
- Given a topic with no content
- Then the Content page shows the empty state, not a broken/blank grid

**B6 — Content visible to a permitted learner**
- Given content added to a topic and a learner with access
- Then that content appears when the learner opens the topic

## Suite C — Completion tracking (the swb-done gate) ⭐

> This is the heart of the demo. Test it hardest.

**C1 — Opening an item records completion exactly once**
- Given a learner viewing a topic with 3 content items, 0 complete
- When they open and complete item 1
- Then completion is recorded **once** and topic progress reads **1/3**

**C2 — Progress increments correctly**
- Given the learner has completed 1 of 3
- When they complete item 2
- Then progress reads **2/3** and topic status is **In Progress**

**C3 — Topic flips to Completed at 100%**
- Given the learner has completed 2 of 3
- When they complete item 3
- Then progress reads **3/3** and topic status flips to **Completed**

**C4 — Re-opening a completed item does NOT double-count**
- Given a learner who already completed item 1
- When they open item 1 again
- Then progress stays the same (no 4/3, no regression)

**C5 — Completion is per-learner**
- Given learner X completed a topic and learner Y has not
- Then Y's homepage still shows the topic as New/In Progress (X's progress doesn't leak to Y)

**C6 — Completion survives reload**
- Given a learner completed 2/3
- When they reload / re-open the homepage
- Then progress still reads 2/3 (persisted, not session-only)

## Suite D — Learner homepage (spine entry)

**D1 — Only granted topics appear**
- Given a learner granted topic P but not topic Q
- Then the homepage shows P and not Q

**D2 — Status + filter**
- Given topics in New / In Progress / Completed states
- When the learner uses the All / In Progress / Complete filter
- Then only matching topics show

**D3 — Open topic shows its content**
- Given a granted topic with content
- When the learner opens it
- Then all its content items are listed and openable

## Suite E — Mobile parity (T1, if mobile lane lands)

**E1 — Browse + open in-app**
- Given the SafeTapp Training tab
- Then granted topics list, and opening a Link/PDF/Video item opens it in-app

**E2 — Completion syncs**
- Given a learner completes an item on mobile
- Then the same progress reflects on web (shared completion API), and vice-versa

---

## The mocked completion-API contract (publish by noon merge)

So the mobile lane isn't blocked, the learner lane publishes this stub early:

```
POST /microlearning/topics/{topicId}/content/{contentId}/complete
  → 200 { topicId, contentId, completedAt, topicProgress: { done, total }, topicStatus }
  → idempotent: calling twice for the same (learner, contentId) does NOT increment
GET  /microlearning/learner/topics
  → [ { topicId, title, status, progress: { done, total } } ]  // granted-only
```

## Definition of done (what "spine green" means)

All of **Suite A, B, C, D** pass in the sandbox = the spine is green. That is the noon-merge gate. Suites C4/C5/C6 are the ones most likely to catch a plausible-but-wrong agent implementation — treat a failure there as a stop-the-line.
