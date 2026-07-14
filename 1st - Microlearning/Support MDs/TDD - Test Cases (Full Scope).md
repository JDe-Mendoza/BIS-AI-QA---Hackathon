# TDD — Microlearning Test Cases (Full Committed Scope)

**Purpose:** the definition-of-done for the *entire* committed scope, written as cases QA's agent implements **before** dev writes the feature — TDD drives development from commit #1. Devs code until these pass.

**How to read the tiers** (from the scope commitment — build order = cut order):
- **[T0]** = the demo spine. Never cut. Green by the noon merge.
- **[T1]** = strong completeness. Build in block 2. Makes it alpha-viable.
- **[T2]** = cut first, top-down, if behind at noon. Do NOT write these tests until T0 is green.

**Field constraints are load-bearing** (validation + copy come straight from the V2 spec):
Topic — `title` ≤150 required · `description` ≤500 required · `image` JPG/PNG <4MB (default if none) · `status` Active/Draft/Deactivated (defaults **Active** on create).
Content — `title` ≤50 required · `type` Link/PDF/Video(URL+MP4, MP4 <80MB)/SCORM · `status` Active/Deactivated · sorted **alphabetically** · `completeAgain` edit-only.

---

## Suite A — Setup & Access [T0]

- **A1 [T0]** Toggle ON in Setup > System Modules → end-user Microlearning tab AND Admin module tile both appear.
- **A2 [T0]** Toggle OFF → both the tab and the tile are hidden.
- **A3 [T1]** Clicking the Admin tile opens the module → Dashboard.
- **A4 [T1]** Role gating (demo can hardcode): Course Admin **cannot** toggle in Setup but **can** open the module once enabled; the other three admin roles can do both.

## Suite B — Topic CRUD & Dashboard [T0]

- **B1 [T0]** Create topic with valid title + description → persists, appears as a card, `status = Active`.
- **B2 [T0]** Empty title → blocked, "Please enter a title." No topic created.
- **B3 [T0]** Title > 150 chars → blocked; char counter reflects count.
- **B4 [T0]** Description > 500 chars → blocked; char counter shown.
- **B5 [T0]** No image uploaded → default topic image used (not broken/empty).
- **B6 [T1]** Image upload + **crop** modal → cropped image saved and shown on card.
- **B7 [T1]** Image > 4MB or non-JPG/PNG → rejected with the format/size helper message.
- **B8 [T0]** Edit topic title/description → persists on card + Topic Content page.
- **B9 [T1]** Dashboard grid ↔ list toggle → same topics, both layouts render.
- **B10 [T1]** Status pillbox (Active / Draft / Deactivated) → filters cards to that status.
- **B11 [T1]** Search matches topic name / activity name / description, **scoped to the active pill**; `(x)` clears.
- **B12 [T1]** Search no match → "No topics found." (❓ icon).
- **B13 [T1]** No topics at all → Welcome empty state ("Welcome to your Microlearning module!…").
- **B14 [T1]** Active card is clickable (hover state) → opens Topic Content; Deactivated card is **not** clickable (no hover).

## Suite C — Content CRUD [T0]

- **C1 [T0]** Add **Link** content with valid URL → persists under topic, correct type chip + Last Updated date.
- **C2 [T0]** Add **PDF** content (upload) → persists, PDF openable.
- **C3 [T0]** Add **Video** content by **URL** (YouTube/Vimeo) → persists, playable in-portal.
- **C4 [T1]** Add **Video** content by **MP4 upload** (<80MB) → persists, playable; MP4 >80MB rejected.
- **C5 [T2]** Add **SCORM** "Activity" (.zip) → persists, plays in SCORM runtime.
- **C6 [T0]** Content title empty → "Please enter a title."; title > 50 → blocked (counter "0/50").
- **C7 [T0]** New content inserted **alphabetically** among existing items.
- **C8 [T0]** Topic with no content → content empty state ("You have not created any activities yet…").
- **C9 [T1]** Edit content item → changes persist in grid + list.
- **C10 [T1]** Content grid ↔ list toggle renders both.
- **C11 [T0]** Content added to a topic is visible to a learner with access.

## Suite D — Content lifecycle: Deactivate / Reactivate / Purge / Bulk [T1]

- **D1 [T1]** Deactivate content (× + confirm) → moves to Deactivated tab; learner loses access.
- **D2 [T1]** Deactivated card shows **Date Deactivated** + **Deactivated By**.
- **D3 [T1]** Reactivate (↺ + confirm) → back to Active; learner regains access.
- **D4 [T1]** Purge (🗑) requires **purge code** → permanent delete; item gone AND all its completion records removed.
- **D5 [T1]** Bulk-select on **Active** tab → action bar shows "{n} items selected" · Cancel · **Deactivate**.
- **D6 [T1]** Bulk-select on **Deactivated** tab → Cancel · **Purge** · **Reactivate**.
- **D7 [T1]** Select-all checkbox (list header) selects every row.

## Suite E — Edit extras: drag-reorder & Complete Again [T2]

- **E1 [T2]** Drag 6-dot handle reorders content; new order persists.
- **E2 [T2]** Edit with **Complete Again UNCHECKED** → content updated, existing completions preserved.
- **E3 [T2]** Edit with **Complete Again CHECKED** → users who already completed it must complete again; **latest completion record retained**; success modal reflects the checked variant.
- **E4 [T1] ⭐** **Preview (eye) must NOT record completion** — admin previewing a content item does not mark it complete for that admin.

## Suite F — Permissions [T1]

- **F1 [T1]** Add Permission **By User** → that user sees the topic on their homepage; a non-granted user does not.
- **F2 [T2]** Add Permission **By Company Role** → all users in that role see the topic.
- **F3 [T1]** Remove a permission → that user/role loses access (topic drops off their homepage).
- **F4 [T1]** By Location is **out of scope** — not present in the Add Permission UI.

## Suite G — Multi-language & auto-translate [T2]

- **G1 [T2]** Default language chip = the portal language.
- **G2 [T2]** Add a language (topic create or Manage Languages) → per-language Title (≤50) / Description (≤300) captured.
- **G3 [T2]** **Auto-translate** ("Uses default language" → Add) populates the language version from the default.
- **G4 [T2]** Content-level language versions carry per-language Title / Description / **Source** (separate video URL/file per language).
- **G5 [T2]** Delete a language (with confirm) → its version is removed.

## Suite H — Learner homepage [T0]

- **H1 [T0]** Only topics the learner is granted appear (permission-gated).
- **H2 [T0]** Status is derived: **New** = 0/Y complete · **In Progress** = 1…Y-1 · **Completed** = Y/Y.
- **H3 [T1]** Filter **In Progress** shows **New AND In Progress** together (per the resolved decision, not New-excluded).
- **H4 [T1]** Filter **Complete** shows Completed only; **All** shows everything.
- **H5 [T0]** Grid shows `Content: X/Y`; list shows `X/Y` too (not total-only).
- **H6 [T1]** Topics ordered **alphabetically**; Load More paginates.
- **H7 [T1]** No granted topics → "Welcome to Microlearning! You have no microlearning topics currently available."
- **H8 [T1]** Search no results → "No topics found." (❓ icon).

## Suite I — Topic page & completion logic (the core) [T0] ⭐

> Test this hardest — it's the heart of the demo.

- **I1 [T0]** Open a granted topic → its content items are listed and openable (grid, whole card clickable).
- **I2 [T0]** Open a **Link** item (iframe-in-modal) → completion recorded **at open**, exactly once.
- **I3 [T0]** Open a **PDF** item (iframe-in-modal) → completion recorded at open.
- **I4 [T0]** Open a **Video** item (URL or MP4, in-portal) → completion recorded **at open** (NOT gated on full-watch).
- **I5 [T0]** Progress increments correctly: 0/3 → open item → **1/3** → **2/3** → **3/3**.
- **I6 [T0]** All items complete → topic status flips to **Completed**.
- **I7 [T0] ⭐** Re-opening an already-completed item does **NOT** double-count (no 4/3, no regression).
- **I8 [T0] ⭐** Completion is **per-learner** — learner X's progress never leaks to learner Y.
- **I9 [T0] ⭐** Completion **survives reload / re-login** (persisted, not session-only).
- **I10 [T1]** A **Completed** item stays openable for review.
- **I11 [T2] ⭐ (Updated flag)** Admin adds a new content item to a topic the learner already completed → topic moves **Completed → In Progress**, "● Updated" pill shows.
- **I12 [T2] (Updated flag)** Admin edits a completed item with **Complete Again** → that item returns to Start; topic → In Progress.
- **I13 [T2]** A plain "Updated" badge (no Complete Again) **clears when opened** and requires **no** re-completion.
- **I14 [T1]** Topic search by content-item name; no match → "No content found." (❓ icon).

## Suite J — SCORM completion [T2]

- **J1 [T2]** Opening a SCORM item does **not** auto-complete on open (unlike Link/PDF/Video).
- **J2 [T2]** SCORM runtime reports completion/passed → item marked complete, topic progress updates.
- **J3 [T2]** (Dev open Q) Confirm which runtime signal is used — completion vs passed status — and test that exact signal.

## Suite K — Notifications (Email + SMS) [T2]

- **K1 [T2]** Assigning a topic to a learner fires an **Email + SMS** notification.
- **K2 [T2]** Updating a topic the learner has → notification fires.
- **K3 [T2]** Notifications fire on **assignment/update**, NOT via a scheduler (the Events cadence engine is out of scope — assert no scheduling UI exists).

## Suite L — Unavailable topic/content [T1]

- **L1 [T1]** Web: tapping an email/SMS link to a **deactivated / purged / decommissioned** topic → after login, modal "⚠️ Cannot be found" + "…no longer available."
- **L2 [T2]** Web: link to a **Draft** topic → "…temporarily unavailable. Please check back again later."
- **L3 [T1]** Mobile: same unavailable case → **snackbar/toast** (not a modal): "Sorry! The microlearning topic or the content item is no longer available."

## Suite M — Home-page Training-section entry [T2]

- **M1 [T2]** Portal home / Training area surfaces a Microlearning section with **assigned · in-progress · completed** items, each linking into its topic.

## Suite N — Mobile (SafeTapp) [T1]

- **N1 [T1]** Microlearning appears as the **3rd tab** on the Training page (Course · Training Record · Microlearning).
- **N2 [T1]** Topic list cards show thumbnail, status label, name, `Content: X/Y`, status color bar.
- **N3 [T1]** Open a topic → content list with type chip + Incomplete/Completed status.
- **N4 [T1]** Open Link / PDF / Video **in-app** → completion recorded (parity with web open-to-complete).
- **N5 [T2]** Open SCORM in-app → completion via runtime.
- **N6 [T1] ⭐** Completion **syncs both ways**: complete on mobile → reflects on web; complete on web → reflects on mobile (shared completion API).
- **N7 [T2]** Tapping a deactivated/purged/decommissioned topic → snackbar (see L3).

---

## The mocked completion-API contract (publish by the noon merge)

So the mobile lane isn't blocked waiting on the learner lane:

```
POST /microlearning/topics/{topicId}/content/{contentId}/complete
  → 200 { topicId, contentId, completedAt, topicProgress: { done, total }, topicStatus }
  → idempotent: a second call for the same (learner, contentId) does NOT increment
  → SCORM items: completion set by runtime callback, not this open-endpoint
GET  /microlearning/learner/topics
  → [ { topicId, title, status, progress: { done, total } } ]   // granted-only, alphabetical
```

## Definition of done

- **Spine green (noon-merge gate):** all of **A, B, C(T0), H, I(T0)** pass in the sandbox.
- **Alpha-viable (end-of-day target):** T0 + all **T1** suites pass.
- **Stretch:** T2 suites, cut top-down if behind.

**Highest-value guard tests** — the ones most likely to catch a plausible-but-wrong agent implementation. Treat a failure here as stop-the-line:
`I7` (double-count) · `I8` (per-learner leakage) · `I9` (persistence) · `E4` (preview must not complete) · `D4` (purge removes completion records) · `I11` (Updated moves Completed→In Progress) · `N6` (cross-platform sync).
