# Project Progress

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

## Notes
- Verified end-to-end in-browser: login (email + bypasses), onboarding quiz + persona match,
  tech assessment flow, non-tech form + upload, interview slot booking, campus calendar,
  manager grading (Tech table + Non-Tech Excel-style grading with RED/YELLOW/GREEN + bulk
  shortlist), and My Society slot management.
- `npx tsc --noEmit`, `npm run lint`, and `npm run build` all pass clean.
- State persists to `localStorage` (`socmag_state_v1`) so a page refresh doesn't lose demo
  progress; clear it (or use an incognito window) to reset to the pristine seed data before
  the lab demo.