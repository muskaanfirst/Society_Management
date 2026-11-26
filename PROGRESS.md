# Project Progress

- [x] Public landing page at `/` + professional login copy at `/login`.
      `app/page.tsx` was previously just `redirect("/login")` -- `/login`
      already lived at the right path, so no file "move" was actually
      needed; the real work was building real landing-page content and
      cleaning up the login screen's copy. Only `app/page.tsx`,
      `app/login/page.tsx`, and one global `scroll-behavior: smooth` CSS
      rule (for the navbar's anchor links) were touched -- no API route,
      `lib/store.tsx`, DB query, or auth logic changed, confirmed by diff.

      **Landing page** (plain Server Component, no client JS needed):
      sticky navbar with a real file-existence check (`fs.existsSync` for
      `public/tiet-logo.png`, server-side since this is a Server Component)
      falling back to a crimson "TI" badge since that file doesn't exist
      yet -- will start using a real logo automatically the moment one is
      added, no code change needed. Full-width hero (`next/image` `fill` +
      `priority` over `public/thapar-campus.jpg`, `bg-black/45` overlay,
      serif "Thapar Society Nexus" / "Seamlessly Connected." + a "Get
      Started" CTA). About section with the exact overview copy given.
      Features section: 6 cards exactly as specified (crimson-tinted icon
      square, green "Active" pill, title + 2-line description, full-width
      slate `#64748B`/`#475569` hover "Learn More" button), using
      Technical/Non-Technical wording throughout, no "Track A/B" jargon.
      Minimal footer. Every "Learn More" (6/6) and the navbar "Login"
      button verified in the browser to link to `/login`.

      **Login page**: removed all prototype/lab-demo copy ("Lab Demo
      Shortcuts", "Prototype build -- connects to a real database, demo
      accounts only."). One flagged judgment call: renamed the wordmark
      from "SocMag" to "Thapar Society Nexus" to match the new landing
      page's branding -- having two different product names back-to-back
      in the same login flow would have undercut the "looks official" goal
      of this task. Quick sign-in buttons relabeled "Student" / "Technical
      Society Head" / "Non-Technical Society Head" per the request, same
      underlying `doLogin(...)` calls and accounts, completely untouched.

      VERIFIED for real: `npx tsc --noEmit`, `npm run lint`, and `npm run
      build` all pass with zero errors (`/` now prerenders as static
      content). Live browser pass: confirmed the hero image actually
      renders behind the dark overlay (looked flat gray at a glance in a
      small screenshot -- zoomed in and confirmed real campus-building
      photo content, not a rendering bug); confirmed all 6 feature cards,
      the About section, and the footer render correctly; confirmed all 6
      "Learn More" links plus the navbar Login button point to `/login`;
      confirmed the polished login page shows no prototype copy and that
      the "Student" quick sign-in button still logs in for real (landed on
      `/student/societies`), proving the login logic itself was untouched.
- [x] 3-tier automated test suite, built and run to 100% green for real.

      **The one real design problem**: Tiers 2 and 3 hit the live API routes
      against the live dev Postgres database -- the same one manually
      demoed against all session (several real seed slots already booked,
      real applications already graded). A naive test suite would quietly
      corrupt that demo data. Fixed with one shared fixture convention used
      by both tiers (`frontend/tests/helpers/testDb.ts`): every row a test
      creates is synthetic and clearly marked -- user ids/emails prefixed
      `test-`/`test.`, slot venues prefixed `TEST-` and dated in 2099 -- and
      cleanup deletes *by those markers*, not specific ids, so it's safe
      and idempotent even after a crashed prior run. Verified directly
      against the live DB after real runs: zero leftover `test-%` rows,
      every time.

      **Tier 1** -- `mle-service/test_main.py` (pytest + FastAPI
      `TestClient`, `pytest`/`httpx` added to `requirements.txt`): health
      check, perfect-match -> 100%, opposite vectors -> ~0%, mismatched
      keys -> 400, unknown tag -> 400, missing field -> 422.
      REAL RESULT: **6 passed in 2.93s**.

      **Tier 2** -- `frontend/tests/*.test.ts` (vitest, installed with
      `vite` as its required peer dep). `tests/globalSetup.ts` spawns both
      mle-service and `next dev` itself and tears them down after, so
      `npm run test:integration` needs no manually-started servers. Covers
      `/api/auth/login` (valid / non-@thapar.edu / wrong-password),
      `/api/societies`, `/api/calculate-compatibility`, `/api/slots/book`
      (including the atomic double-booking 409), `/api/test-submit`,
      `/api/applications/portfolio`, `/api/grades`, `/api/events`.
      REAL RESULT: **8 test files, 15 tests passed in 26.57s**.

      **Tier 3** -- `frontend/e2e/*.spec.ts` (`@playwright/test`, Chromium
      only). `playwright.config.ts`'s `webServer` array starts both
      servers; `e2e/globalSetup.ts`/`globalTeardown.ts` create/destroy the
      synthetic e2e student + two throwaway slots. Three specs: (a) student
      onboarding quiz -> real MLE compatibility scores show up; (b) Track A
      assessment -- answers all 8 questions, flags a real `visibilitychange`
      tab-switch (dispatched via `page.evaluate`, since real OS-level
      switches can't be simulated in a test runner -- the same technique
      used earlier this session to verify it manually) and a real
      blur/focus focus-loss duration, submits, confirms a real score; (c)
      Track B -- books a real interview slot through the UI, then as the
      real Non-Tech manager grades it GREEN and confirms the grade survives
      a hard page reload (proving it's server state, not local UI state).
      REAL RESULT: **3 passed in 44.2s** (confirmed stable across 3
      consecutive clean runs before this one).

      Real bugs found and fixed along the way (not scope creep -- these
      were blocking a green run): spawning `npm.cmd` directly on Windows
      reproducibly throws `EINVAL`; the `shell: true` workaround for that
      silently breaks Next's own `.env.local` loading in a spawned child
      (every DB route 500s with "DATABASE_URL is not set") -- fixed by
      spawning Next's CLI entry directly via `node` and explicitly passing
      the parsed `.env.local` through the child's `env`. An async
      `exec()`-based process-tree kill let vitest exit before `taskkill`
      finished, leaking the whole server tree (confirmed via `netstat` --
      fixed with a blocking `execSync`). Several Playwright locators hit
      strict-mode ambiguity (e.g. "Next" substring-matching Next.js's own
      dev-tools button) or a race where the onboarding quiz remounts after
      every full page navigation, not just the first -- all fixed and
      re-verified.

      `npx tsc --noEmit`, `npm run lint`, and `npm run build` all still
      pass clean with the new test tooling in place. `.gitignore` updated
      for `frontend/test-results/`, `frontend/playwright-report/`.
- [x] UI interactivity pass on top of the Pastel Bento-Grid design: filter
      pills, date-strip filters, tactile micro-interactions, and toast
      notifications -- React state + Tailwind transitions only, no new npm
      packages. No API route, `lib/store.tsx` logic, or existing `fetch()`
      call's behavior was modified (confirmed by diffing the changed-file
      list against `app/api/`, `lib/store.tsx`, `lib/db.ts` before calling
      this done).
      Four pieces needed a judgment call since the ask didn't map onto an
      existing element 1:1 (all flagged to the user up front in the plan):
      - **"Top Matches" filter pill** (`student/societies/page.tsx`) filters
        to `personaResult.recommendedSocietyIds` (already in `lib/store.tsx`
        after the onboarding quiz runs) -- no new fetch, no store change.
        Shows "Take the onboarding quiz..." instead of an empty grid when
        `personaResult` is still null.
      - **`CompatibilityRing.tsx`** (new): small SVG ring, no score
        visualization existed anywhere before this. `stroke-dashoffset`
        animates in via CSS transition on mount. Used in `OnboardingQuiz`'s
        result step and the student Profile page's Persona Match card.
        Deliberately NOT added to Societies list cards -- that would need a
        fresh `/api/calculate-compatibility` call (which re-writes
        `compatibility_scores` server-side) on every page load.
      - **Events Feed date strip** (`CampusCalendar.tsx`): added a "This
        week" 7-day pill strip + a new flat, filterable event list below the
        existing month grid (kept as-is). Each list row (and the day-detail
        modal) got a "Register" button wired to the already-built, already-
        tested `POST /api/events/register` -- the only genuinely new
        frontend->backend call added in this task, since nothing in the UI
        called that endpoint before.
      - **Track B audition-slot date strip**: same 7-day-pill pattern
        (computed from the dates actually present, never empty), filtering
        the available-slot list in `BookInterviewModal.tsx` and the
        Interview Slots section on `manager/society/page.tsx`.

      `Toast.tsx` (new): a `ToastProvider`/`useToast()` context (plain React
      state, no library), mounted once in `app/layout.tsx` inside
      `AppProvider` so a toast fired right before a `router.push` still
      shows on the next page. Dark rounded-full pill, bottom-center,
      auto-dismiss after 3000ms. Wired at: login success, slot booked
      (`BookInterviewModal`), assessment submitted, event registered
      (`CampusCalendar`), and all three Grading actions (shortlist / rubric
      grade / bulk-shortlist-greens).

      Micro-interactions swept across every bento card (`transition-all
      duration-200 hover:-translate-y-1 hover:shadow-lg`) and every button
      (`active:scale-95` or the pre-existing equivalent) in: login, both
      societies pages, the assessment page, My Slots, both profile pages,
      My Society, Grading, and the onboarding quiz.

      VERIFIED for real: `npx tsc --noEmit`, `npm run lint`, and `npm --
      prefix frontend run build` all pass with zero errors. Live browser
      pass with both servers running: confirmed the Top Matches pill's
      empty-state and active black styling; completed the onboarding quiz
      and watched the `CompatibilityRing` animate to 67% on both the quiz
      result screen and the Profile page; filtered the Events Feed by a
      specific day and registered for an event, confirming via DOM
      inspection that the toast renders with the exact right text
      ("Registered for MUDRA Open Dance Workshop!") and also caught it live
      in a screenshot; filtered Track B slots by day in
      `BookInterviewModal` and completed a real booking (status flipped to
      "Interview Booked"); confirmed the Grading page's Shortlist/grade
      actions still update the table correctly with the toast wiring in
      place. (Two near-misses during testing were the screenshot tool
      cropping tall viewports -- same quirk hit earlier with the bottom nav
      -- not actual bugs: confirmed via `getBoundingClientRect()` that the
      toast was rendering correctly just below the crop line.) Both servers
      were stopped after verification.
- [x] Visual-only "Pastel Bento-Grid" reskin of `frontend/` -- warm off-white
      canvas (#F7F7F5), white cards, five rotating pastel bento-accent colors
      (lavender/amber/sky/pink/sage), jet-black primary buttons and a solid
      dark floating pill nav, generous rounded-full/rounded-3xl corners,
      border-black/5 everywhere. No API route, `lib/store.tsx`, `fetch()`
      call, form handler, or the Track A anti-cheat logic was touched --
      confirmed by diffing the exact file list against the plan before
      starting and spot-checking the assessment page's diff for zero logic
      lines changed.
      New: `frontend/components/pastelAccents.ts` (a tiny deterministic
      id -> one-of-5-literal-Tailwind-class-strings hash, so every society
      gets a consistent color everywhere it appears, written as literal
      strings so Tailwind's scanner doesn't purge them from the production
      build). Updated: `globals.css` + `tailwind.config.js` (new color
      tokens), `BottomNav.tsx` (solid black capsule instead of a white bar
      with a black active-item highlight), every page/component that had a
      `bg-slate-card` dark hero card (recolored to a pastel with dark text),
      a literal `bg-accent` primary button (recolored to jet-black), or
      `border-slate-200` (recolored to `border-black/5`). Societies/My Slots
      lists and the assessment question list become responsive
      `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`-style bento grids on wider
      screens instead of a fixed mobile-width single column; the student/
      manager layout containers widen from `max-w-lg` to `max-w-lg
      lg:max-w-5xl` to allow it. `StatusBadge`'s `Rejected` status moved
      from red to the pastel-pink token (true login/validation errors stay
      red). One scope call made and flagged to the user: kept a single
      floating-bottom pill nav at every screen size rather than also adding
      a separate desktop left-sidebar variant (would need real layout
      restructuring for a purely cosmetic "optional" ask).
      VERIFIED for real: `npx tsc --noEmit`, `npm run lint`, and `npm run
      build` all pass with zero errors. Then a live browser pass with both
      servers running: screenshotted Login, the Societies bento grid, a
      Society detail hero card, the Track A assessment question grid, My
      Society's stat tiles, and the Grading table at a 1440px desktop width
      (confirmed multi-column bento layout, pastel per-society colors, big
      bold stat numbers, solid black nav -- verified the nav's real
      `background-color: rgb(17,17,17)` via computed styles since the
      screenshot tool crops tall viewports) and again at a 375px mobile
      width (confirmed everything collapses to a clean single column with
      the same colors and the nav still floating correctly).
- [x] Wire the entire frontend to the real API routes and build a real Track A
      anti-cheat assessment flow -- every page under `frontend/app/` and most
      of `frontend/components/` previously read `frontend/lib/mockData.ts`
      (fake societies, fake in-memory applications) and mutated state purely
      client-side; none of the 8 API routes built earlier were called
      anywhere. `frontend/lib/mockData.ts` and `frontend/lib/slots.ts` are
      now deleted (confirmed nothing imports them before deleting).

      THREE NEW BACKEND PIECES (needed before the frontend could work at all,
      not optional -- discovered while mapping real flows onto the existing
      8 routes):
      - `frontend/app/api/applications/route.ts` (new): `GET ?studentId=`
        (a student's own applications, LEFT JOINed to `test_submissions` for
        score) and `POST` (creates the initial `Pending` application row --
        an upsert that never resets an already-Assessed/Shortlisted status
        or blanks out a saved form/portfolio value on a repeat call).
      - `frontend/app/api/test-questions/route.ts` (new): serves `MCQ_BANK`
        with `correctIndex` stripped -- the client never receives the answer
        key, since the assessment page is a real client component now.
      - `frontend/lib/db.ts`: added `types.setTypeParser(1082, v => v)` --
        `pg` default-parses Postgres `DATE` columns into JS `Date` objects,
        which serialize as a full ISO timestamp and broke the UI's
        `new Date(dateString + "T00:00:00")` parsing pattern. Found and
        fixed by actually hitting this in the browser (events/slots showed
        garbled dates before the fix).

      FRONTEND REWIRE:
      - `frontend/lib/types.ts` rewritten to match the real API response
        shapes (numeric ids for applications/slots/events now that they're
        real `BIGSERIAL` rows, `TechGradeRow`/`NonTechGradeRow` replacing the
        old flat `Application`, etc).
      - `frontend/lib/api.ts` (new): a small `apiFetch` wrapper (JSON +
        error handling) and a `formatTime` helper (`"17:00:00"` -> `"5:00
        PM"`), used by every page below instead of repeating fetch
        boilerplate.
      - `frontend/lib/store.tsx` shrunk to auth/session only (`currentUser`,
        `personaResult`, `login`, `logout`, `savePersonaResult`) -- every
        former in-memory mutation (`submitTechAssessment`,
        `submitNonTechForm`, `bookInterview`, `gradeApplication`,
        `shortlistApplication`, `bulkShortlistGreens`) is now a real
        `apiFetch` call made directly from the page/component that needs it.
      - Login (`frontend/app/login/page.tsx`): added a real password field
        (the backend now checks one) calling `POST /api/auth/login`; the two
        mock bypass buttons became three real demo-account shortcuts
        (Student / Tech Manager / Non-Tech Manager) that log in for real
        using the seeded accounts and the documented shared demo password.
      - Every student page (societies list/detail, slots, profile,
        `OnboardingQuiz`, `NonTechFormModal`, `BookInterviewModal`) and
        manager page (My Society, Grading, Profile, `AnswersModal`) now
        fetches/mutates through the real routes instead of `mockData`.
        `OnboardingQuiz` still computes its "archetype" label client-side for
        flavor, but now calls `POST /api/calculate-compatibility` for the
        actual recommended-society list (real MLE-service scores). A
        manager's own society is now derived via
        `societies.find(s => s.managerId === currentUser.id)` instead of a
        `user.societyId` field that doesn't exist in the real schema. The
        My Society page's non-functional local-state "Open/Closed" slot
        toggle (never did anything real) was removed in favor of showing
        each slot's actual Available/Booked status.
      - `NonTechFormModal`'s fake file-picker became a real "Portfolio URL"
        text field (there's no file-upload backend; `applications.portfolio_url`
        is a URL column, not a filename).
      - **New Track A assessment page**:
        `frontend/app/student/societies/[id]/assessment/page.tsx`. There was
        no real MCQ-answering UI anywhere before this (the old "Take
        Proctored Assessment" button was a `setTimeout` + random score
        stub) -- this is a real question-answering UI built from scratch,
        fetching real questions from `/api/test-questions` and submitting to
        `/api/test-submit`. Real anti-cheat tracking: a
        `document.visibilitychange` listener increments a live
        `tabSwitchCount` and shows a dismissing warning banner every time the
        tab is switched away from; a `window.blur`/`focus` pair accumulates
        `focusLossDuration` in whole seconds. Both counts are submitted with
        the assessment and stored in `test_submissions`.

      BUG FOUND AND FIXED while browser-testing (pre-existing, exposed now
      that the onboarding quiz does a real network round-trip instead of
      finishing synchronously): `frontend/app/student/layout.tsx` derived
      `showQuiz` directly from `!personaResult`, which unmounted the
      `OnboardingQuiz` modal the instant `savePersonaResult` ran -- before
      its own "result" screen (archetype + recommended societies) ever
      painted. Fixed by making `showQuiz` a one-time latch (opens once when
      a student has no persona result yet, stays open regardless of
      `personaResult` changes mid-flow, closes only on the modal's own
      explicit `onClose`) -- same documented
      one-time-effect-setState exception already used in `lib/store.tsx`'s
      hydration effect.

      VERIFIED for real in the browser (both servers actually running):
      logged in via all 3 demo shortcuts; retook the onboarding quiz and
      confirmed the result screen now stays open and shows real
      MLE-computed recommendations (The Storyteller / 67%, The Builder /
      71% on an earlier run, with MARS/OWASP/CCS as real top-3 societies);
      opened the real Track A assessment page for CCS and confirmed real
      questions load from `/api/test-questions`; confirmed the anti-cheat
      counters are wired correctly by dispatching real
      `visibilitychange`/`blur`/`focus` DOM events (the embedded browser
      pane's own tab-switching doesn't toggle `document.hidden`, so this was
      the reliable way to prove the listeners fire) -- saw the warning
      banner appear and "1 switches" / "6s away" update live; submitted the
      assessment and confirmed the society page flipped to "Assessed" with
      a real computed score (13/100); logged in as the Tech Manager and
      confirmed the Grading page's real `/api/grades?type=TECH` data
      included that exact submission, shortlisted it, and saw the status
      update live; confirmed the Non-Tech grading view and `AnswersModal`
      show real form answers and a real portfolio URL (one planted by the
      earlier backend `verify-api.mjs` run, proving persistence end to end);
      confirmed the My Society page shows correct derived-manager data (CCS,
      4 applicants, 3 shortlisted, 1 interview) and real per-slot
      Available/Booked status including "Booked (yours)" for the slot
      booked during backend verification. `npx tsc --noEmit`, `npm run
      lint`, and `npm run build` all pass clean. Both servers were stopped
      after verification.
- [x] Build `frontend/lib/db.ts` (lazy-initialized `pg.Pool`, singleton across
      Next.js dev hot-reloads, SSL on for Neon/Supabase) and 8 Next.js App
      Router API routes under `frontend/app/api/`, all using parameterized
      SQL (`$1`, `$2`, ...), matching the user's requested endpoint list:
      - `POST /api/auth/login` -- validates `@thapar.edu` format, looks up
        `users` by email, `bcrypt.compare`s the password, returns
        `{ user, role }` (password_hash stripped) or 401/400.
      - `GET /api/societies`, `PATCH /api/societies/[id]` -- the PATCH
        requires a `requestingUserId` in the body matching that society's
        `manager_id` (403 otherwise); there's no session/auth layer yet
        (the login screen is still frontend-mock), so this is a deliberate,
        documented stand-in, not real auth.
      - `POST /api/calculate-compatibility` -- upserts the student's
        `feature_vector` into a new `student_profiles` table, calls
        `MLE_SERVICE_URL/mle-engine` (default `http://localhost:8000`) once
        per society, upserts each result into a new `compatibility_scores`
        table, returns all 8 scores sorted descending.
      - `GET /api/slots`, `POST /api/slots/book` -- booking runs inside a
        transaction with `UPDATE ... WHERE application_id IS NULL RETURNING
        *`; 0 rows updated means the slot was already taken, which returns
        409 instead of silently double-booking.
      - `POST /api/test-submit` -- auto-grades against a new hardcoded
        8-question bank (`frontend/lib/mcqBank.ts`, no question bank existed
        anywhere in the repo before this), saves the score plus
        `tab_switch_count` / `focus_loss_duration` / raw `answers`, marks the
        application `Assessed`.
      - `POST /api/applications/portfolio` -- saves a Track B portfolio URL
        (rejects non-URLs with 400).
      - `GET /api/grades` (`?type=TECH|NON_TECH`), `POST /api/grades` (body
        `action`: `shortlist` | `rubric` | `bulkShortlistGreen`) -- tech
        shortlisting by score, non-tech RED/YELLOW/GREEN rubric grading plus
        bulk-shortlist-the-greens.
      - `GET /api/events`, `POST /api/events/register` -- register is
        idempotent (`ON CONFLICT DO NOTHING`, returns `alreadyRegistered:
        true` on a repeat instead of erroring).

      SCHEMA CHANGES: mapping these routes onto `db/schema.sql` surfaced 3
      real gaps, added via `db/migrations/001_api_support.sql` (and mirrored
      into `db/schema.sql` for fresh setups): `test_submissions` gained
      `tab_switch_count`, `focus_loss_duration`, and `answers` (none of this
      existed before); `applications` gained `portfolio_url` (distinct from
      `form_answers`, which is the recruitment form's own questions); and
      two new tables, `student_profiles` and `compatibility_scores`, since
      nothing previously persisted a student's quiz vector or the MLE
      service's output.

      Installed `pg` + `bcryptjs` (+ their `@types/*`) into `frontend/`.

      VERIFIED for real: ran `db/migrations/001_api_support.sql` against the
      actual live cloud Postgres database (confirmed via
      `information_schema` that all 3 new columns and both new tables exist
      post-migration). Started `npm --prefix frontend run dev` and
      `uvicorn main:app --port 8000` (from `mle-service/.venv`) for real,
      then ran a from-scratch verification script
      (`frontend/scripts/verify-api.mjs`, plain `fetch`, no new deps)
      exercising all 8 routes against real seed data end-to-end: login
      (valid + wrong-password), societies GET + PATCH (as the real manager,
      and 403 as a non-manager), calculate-compatibility (8 scores back,
      sorted descending), grades GET for both tracks, test-submit (partial
      score computed correctly from a real question set), portfolio save
      (valid + 400 on a bad URL), grades POST for all 3 actions, slots GET
      + book (confirmed a second booking attempt on the same slot got a
      real 409, not just assumed), and events GET + register (confirmed the
      second registration attempt returned `alreadyRegistered: true`
      instead of erroring). Actual output: **20 passed, 0 failed** -- see
      the printed PASS lines above this summary in the session transcript;
      no numbers here are invented. `npx tsc --noEmit`, `npm run lint`, and
      `npm run build` all pass clean (the build initially failed because
      `lib/db.ts` connected to Postgres eagerly at module-import time, which
      broke Next's route-config collection step with no `DATABASE_URL`
      present; fixed by only creating the real `pg.Pool` on first actual
      `query`/`connect` call). Both servers were stopped after verification.

      NOTE: `frontend/.env.local` (gitignored) must contain `DATABASE_URL`
      and `MLE_SERVICE_URL` for any of this to run -- see "How to run and
      test" below.
- [x] Build `mle-service/main.py` (FastAPI) with `POST /mle-engine`.
      Models a society's `ideal_persona` as the mean of an 8-dimensional
      Gaussian (diagonal covariance, sigma=0.25 by default, overridable per
      request) and scores a student's `feature_vector` by its Gaussian
      likelihood relative to the peak likelihood (an exact match), via
      `scipy.stats.multivariate_normal`. Returns `compatibility_score`
      (0-100%), `mahalanobis_distance`, and `per_dimension_deviation` for
      debugging. Validates both vectors share the same 8 interest-tag keys
      (coding, hardware, design, writing, speaking, acting, impact,
      startups) and returns 400 on mismatch. Also added `GET /health`.
      Added `mle-service/requirements.txt` (fastapi, uvicorn[standard],
      numpy, scipy, pydantic).
      VERIFIED by actually installing into a fresh `.venv` and running
      `uvicorn main:app --port 8000`: `/health` returned `{"status":"ok"}`;
      `/mle-engine` returned 100.0% for an identical feature_vector/
      ideal_persona pair, 52.73% for a moderately-drifted vector, 0.0% for
      a strongly mismatched vector, and HTTP 400 for mismatched keys.
      `/docs` (Swagger UI) loaded with HTTP 200. All numbers above are from
      those actual runs, not invented. Test server was stopped afterward.
- [x] Add `db/schema.sql` and `db/seed.sql` (PostgreSQL, BCNF-normalized).
      Schema: `users`, `societies`, `applications`, `test_submissions`,
      `rubric_grades`, `slot_bookings`, `events`, `event_registrations`.
      Key normalization choices: an application's TECH/NON_TECH type is
      derived from `societies.type` via join (not duplicated), and a
      TECH score / NON_TECH grade each live in their own table instead of
      nullable columns on `applications`. `societies.ideal_persona` is a
      JSONB interest-weight vector (keys matching the onboarding quiz's
      8 interest tags) for the future MLE compatibility service.
      Seed data: 8 societies (CCS, MARS, GDG, OWASP, TNT, MUDRA, SUR, FAPS —
      replacing mockData.ts's 6 fictional ones, picked from a longer list the
      user gave of real TIET chapters), 13 demo users sharing one bcrypt-hashed
      dev password, ~12 applications with matching test_submissions/
      rubric_grades, 6 open audition slots, and 8 upcoming events.
      NOTE: the 8 societies' taglines/descriptions and ideal_persona weights
      are placeholder best-guesses from the acronyms alone, not verified
      against TIET's actual charters -- said so directly in seed.sql's header
      and flagged to the user. NOTE: no local Postgres was available to
      actually execute these files (and CLAUDE.md disallows Docker), so they
      are hand-reviewed for syntax/FK/constraint correctness but not yet run
      against a real database -- that verification is still needed.
- [x] Fix two pre-existing `react-hooks/set-state-in-effect` lint errors found after the
      restructure. In `lib/store.tsx`, the one-time localStorage hydration on mount is a
      documented exception (localStorage isn't available during SSR), so it's marked with
      a targeted `eslint-disable-next-line` and a comment explaining why. In
      `app/student/layout.tsx`, `showQuiz` was redundant state kept in sync via an effect;
      it's now computed directly from `ready`/`currentUser`/`personaResult`/`dismissedQuiz`
      during render, removing the effect entirely. Verified `npm run lint`, `tsc --noEmit`,
      and `next build` all pass clean, and manually re-tested the onboarding quiz
      (shows on first student login, dismiss keeps it closed) in the browser.
- [x] Restructure repo into `frontend/`, `backend/`, `mle-service/`, `db/` per CLAUDE.md.
      Initialized git, moved the Next.js app into `frontend/` with `git mv` (history
      preserved), added placeholder READMEs for `backend/`, `mle-service/`, `db/`
      (no code yet — each is a separate future task), and updated `.gitignore` and
      `.claude/launch.json` for the new paths. No application code was changed.
- [x] Define project requirements and architecture.
- [x] Set up Claude context files.
- [x] Initialize Next.js project and install Tailwind/Lucide.
- [x] Create `lib/mockData.ts` with comprehensive fake data.
- [x] Build `/login` screen with routing bypasses.
- [x] Build Student Layout with Bottom Nav.
- [x] Implement Student Tabs (Societies, Feed, Slots, Profile).
- [x] Build Manager Layout with Bottom Nav.
- [x] Implement Manager Tabs (My Society, Feed, Grading, Profile).
- [x] Polish UI (Dark mode, padding, mobile responsiveness).

## How to run and test the API routes
1. Make sure `frontend/.env.local` exists with:
   ```
   DATABASE_URL=<your Neon/Supabase connection string>
   MLE_SERVICE_URL=http://localhost:8000
   ```
2. In one terminal: `mle-service/.venv/Scripts/activate` then `uvicorn main:app --port 8000` (from inside `mle-service/`).
3. In another terminal: `npm --prefix frontend run dev` (serves on `http://localhost:3000`).
4. In a third terminal: `node frontend/scripts/verify-api.mjs` -- hits all 8 routes with real seed data and prints PASS/FAIL per check.
   If you've already run it once, some checks (slot booking, event registration) will show different results on a second run since they mutate real data -- that's expected, not a bug.

## Notes
- Verified end-to-end in-browser: login (email + bypasses), onboarding quiz + persona match,
  tech assessment flow, non-tech form + upload, interview slot booking, campus calendar,
  manager grading (Tech table + Non-Tech Excel-style grading with RED/YELLOW/GREEN + bulk
  shortlist), and My Society slot management.
- `npx tsc --noEmit`, `npm run lint`, and `npm run build` all pass clean.
- State persists to `localStorage` (`socmag_state_v1`) so a page refresh doesn't lose demo
  progress; clear it (or use an incognito window) to reset to the pristine seed data before
  the lab demo.