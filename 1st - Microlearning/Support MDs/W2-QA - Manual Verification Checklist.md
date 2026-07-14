# W2-QA - Manual Verification Checklist (wave 2)

Ticket HAC-354. Owners: @john.demendoza / @chaitanya.thakur. Run against team2.staging.bissafety.app.

BLOCKED-ON: staging visibility gap (Mika) - the wave-2 microlearning PRs (HAC-348/349/350/351/386)
are merged to team2-hackathon but not yet showing on staging. Execute this pass once the module is
deployed/visible there.

Every expected result below is VERIFIED against the merged code (team2-hackathon f50951f).
Tags: AUTO = also covered by the Vitest contract oracle in tests/ (repoint/E2E later via Playwright);
MANUAL = human-only on staging; GUARD = stop-the-line (a failure blocks the wave).

## Preconditions
- [ ] Setup > System Modules: `ht2_microlearning_enabled` toggled ON for the test company.
- [ ] Accounts: 1 admin; learner ALICE and learner BOB; a company role R with ALICE in it, BOB not.

## S1 - Setup & Access (Suite A)
- [ ] A1 toggle ON  -> admin Microlearning tile AND learner Microlearning tab both appear.  [AUTO-A1]
- [ ] A2 toggle OFF -> both disappear.  [AUTO-A2]

## S2 - Topic build (Suite B)
- [ ] B1  create topic (title + optional description) -> lands on Topic Details, status Active.  [AUTO-B1]
- [ ] B1b create with NO description -> still saves (description optional, HAC-382).  [AUTO-B1b]
- [ ] B2  empty title -> message "Please enter a title.", no topic created.  [AUTO-B2]
- [ ] B3  title counter caps at 150 (NOT 50).  [AUTO-B3]
- [ ] B5  no image -> default topic image renders (imageUrl "" -> default; never broken/empty).  [AUTO-B5]
- [ ] B8  edit title/description -> persists on the card + Topic Content page.  [AUTO-B8]

## S3 - Content (Suite C)
- [ ] C1  add Link (URL) -> persists, Link type chip, Last Updated stamp; URL gets https:// if omitted.  [AUTO-C1]
- [ ] C2  add PDF (upload <=15MB) -> persists, openable; >15MB or non-PDF rejected.  [AUTO-C6 partial; size MANUAL]
- [ ] C3  add Video by URL -> persists, plays in-portal.  [AUTO-C3]
- [ ] C6  empty title -> "Please enter a title."; invalid type rejected; title caps at 150.  [AUTO-C6]
- [ ] C7  content lists in CREATION order (sortOrder), NOT alphabetical; drag-reorder persists.  [AUTO-C7]
- [ ] C9  edit a content item -> persists, no duplicate row.  [AUTO-C9]

## S4 - Permissions (Suite F) - By User / By Company Role (By Location is GONE)
- [ ] F0 topic with NO permission rows -> visible to ALL company learners (HAC-390).  [AUTO-F0]
- [ ] F1 grant By User = ALICE -> ALICE sees the topic; BOB does NOT.  [AUTO-F1]
- [ ] F2 grant By Company Role = R -> ALICE (in R) sees it; BOB (not in R) does NOT.  [AUTO-F2]
       Role-ID resolution CONFIRMED sound (Rejith, HAC-354): fldSysCompanyRoleID stores
       fldTrainingRole_ID values, so By-Company-Role grants resolve. Still spot-check live.
- [ ] F3 remove ALICE's grant while another permission remains -> ALICE loses access; others unaffected.  [AUTO-F3]
- [ ] F4 Add Permission modal offers ONLY By User + By Company Role (no By Location).  [AUTO-F4]

## S6 - Learner discovery + completion (Suites H, I) - the spine
- [ ] H1 ALICE homepage shows only granted topics.  [AUTO-H1]
- [ ] H2 status derived: 0/Y New; 1..Y-1 In Progress; Y/Y Completed.  [AUTO-H2]
- [ ] H5 card shows Content: X/Y.  [AUTO-H5]
- [ ] I2/I3/I4 open Link / PDF / Video -> completion recorded AT OPEN, exactly once.  [MANUAL; logic AUTO via oracle]
- [ ] I5/I6 progress ticks 2/3 -> 3/3 -> Completed, live (no reload).  [AUTO-I5/I6]
- [ ] I7 GUARD re-open a completed item -> no double-count (stays 3/3).  [GUARD, AUTO-I7]
- [ ] I8 GUARD BOB's progress is independent of ALICE.  [GUARD, AUTO-I8]
- [ ] I9 GUARD reload / re-login -> progress persists.  [GUARD, AUTO-I9]

## Known issues to watch (confirm status; do not fail the build on these)
- HAC-393 (In Review): the learner "In Progress" filter MUST include New, and the homepage sorts
  ALPHABETICALLY. Until it lands, the merged code drops New + sorts by recency (the bug). Re-verify
  H3/H6 after it merges.
- F2 role-ID resolution: raised to @rejith.krishnan on HAC-354 - confirm By-Company-Role grants resolve.
- imageUrl: null / "" / absent all mean "use default image"; consumers key on FALSY, never === null
  (Rejith ruling).

## Review pair (with @chaitanya.thakur)
- [ ] Cross-review wave-2 PRs (HAC-348 / 349 / 350 / 351 / 386) against the expected results above.
- [ ] Log any new drift as a QA finding on HAC-354 and tag the code owner.
