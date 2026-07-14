# Presentation — Demo Script & Q&A Cue Card

*Print this or keep it on a phone/second screen. The deck (`Team2-Presentation-Deck.html`) is the slides; this is what the presenters hold. ~15 min total incl. Q&A.*

---

## Roles for the presentation (assign at 4:00, not 4:05)

- **Narrator:** ______________ — talks through every slide + the demo.
- **Demo driver:** ______________ — clicks silently in the sandbox while narrator talks.
- **Coverage-% owner:** ______________ — fills slide 4 from the tracker at freeze.
- **Timekeeper:** ______________ — waves at the 8-min mark so Q&A isn't crushed.

---

## The demo script (slide 3) — exact click path, rehearse once

> Goal: the spine end to end in ~3.5 min. Start WARM — data pre-seeded, one click from the payoff.

1. **Setup is already ON** (don't demo the toggle unless asked) — open the **Admin → Microlearning** module.
2. **Create a topic** — type a real title (e.g. "Ladder Safety Basics"), short description, **Add**. → lands on Topic Content page.
3. **Add content** — add a **Link** (or PDF), show the type chip + Last Updated. *(Add a 2nd item if time — makes the 2/3 → 3/3 land harder.)*
4. **Grant access** — Topic Settings → Add Permission → **By User** → the demo learner.
5. **Switch to the learner** (pre-logged-in second window) → **Microlearning homepage** → the topic shows as **New**.
6. **Open the topic → open the first item** → point out **completion recorded, progress 1/2 → In Progress**.
7. **Open the last item** → **3/3 → Completed**, status flips green. **That's the money shot — pause on it.**

**If it breaks:** "Let me show you the recording" → play the 60-sec backup → keep narrating. Never debug live.

**Pre-flight checklist (do at freeze):**
- [ ] Sandbox loads, demo portal seeded with 1 half-built topic
- [ ] Demo learner account granted + logged in on a 2nd window/tab
- [ ] 60-sec backup recording of the full spine saved & openable
- [ ] Decisions Log open on a second screen (your Q&A answer sheet)

---

## Q&A cue card — the judges MUST ask for a specific agent decision + a hard lesson

**Rule: the OWNER answers their own area.** That visibly proves "no spectators, everyone drove agents." Don't let one person field everything.

Each person fills ONE decision from the Agent-Decisions Log before you present:

| Owner | Your one agent decision (fill in) | Your hard lesson (fill in) |
|---|---|---|
| Captain | | |
| Web 2 | | |
| Web 3 (completion) | | |
| Mobile | | |
| Pat | | |
| John + Chai | | |
| Mika | | |

### The 3 most likely questions — pre-write an answer

1. **"Explain one specific commit or architectural decision an agent made."**
   → Owner names it: *what the agent chose · the alternative it rejected · why.* (Straight from the log.)
2. **"Where did agents collide, and how did you prevent it?"**
   → 1 agent per worktree · scaffold-first · Captain-run merges · TDD gate. Give a real near-miss if you had one.
3. **"What would you do differently / what surprised you?"**
   → One honest adaptation. Specific beats polished.

### Failing answers — do NOT say these (explicit in the rubric)
- ❌ "We let it run for eight hours and it worked."
- ❌ "One team member did everything."

### Your one teachable technique (top of the lessons rubric — say it in 2 sentences)
> ______________________________________________
> (Candidates: TDD cases drove the agents from commit #1 · worktree merge cadence that prevented collisions · agent decisions auto-logged as Linear tickets.)

---

## The one-liner to open AND close with
> "We committed to a realistic scope, protected a spine, shipped **__%** of it, and we can explain every decision our agents made."
