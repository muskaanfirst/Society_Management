-- SocMag database schema (PostgreSQL)
--
-- Design notes for whoever reads this later:
--
-- * Normalization: an application's TECH/NON_TECH "type" is NOT stored on the
--   applications table. It's fully determined by which society you applied
--   to (societies.type), so storing it again on every application would be
--   redundant data that could drift out of sync. Look it up with a JOIN.
-- * Likewise, a TECH assessment score and a NON_TECH grade each live in
--   their own table (test_submissions / rubric_grades) instead of as nullable
--   columns on applications. A non-tech application simply has no row in
--   test_submissions -- there's no "N/A" value to store.
-- * users/societies use short readable text ids (e.g. 'soc-ccs') because
--   they're fixed reference data seeded once. applications/test_submissions/
--   rubric_grades/slot_bookings/events/event_registrations use BIGSERIAL
--   because the running app creates these rows dynamically.
-- * Enum-like columns (role, status, grade, ...) use TEXT + CHECK instead of
--   a native Postgres ENUM type, because adding a new allowed value later is
--   a simple ALTER TABLE ... DROP/ADD CONSTRAINT, with no special enum rules
--   to learn.

-- ============================================================================
-- users
-- One row per person who can log in: students and society managers.
-- ============================================================================
CREATE TABLE users (
  id            TEXT PRIMARY KEY,
  full_name     TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE
                  CHECK (email ~* '^[A-Za-z0-9._%+-]+@thapar\.edu$'),
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL CHECK (role IN ('student', 'manager')),
  -- Only students have a roll number; only students may have one.
  roll_no       TEXT UNIQUE,
  CONSTRAINT roll_no_matches_role CHECK (
    (role = 'student' AND roll_no IS NOT NULL) OR
    (role = 'manager' AND roll_no IS NULL)
  ),
  avatar_color  TEXT NOT NULL DEFAULT 'mint',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- societies
-- The 8 campus societies students can discover and apply to.
-- ============================================================================
CREATE TABLE societies (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL UNIQUE,
  tagline       TEXT NOT NULL,
  description   TEXT NOT NULL,
  type          TEXT NOT NULL CHECK (type IN ('TECH', 'NON_TECH')),
  icon          TEXT NOT NULL, -- lucide-react icon name, e.g. 'Terminal'
  accent        TEXT NOT NULL DEFAULT 'mint' CHECK (accent IN ('mint', 'coral', 'amber')),
  member_count  INTEGER NOT NULL DEFAULT 0 CHECK (member_count >= 0),
  manager_id    TEXT NOT NULL REFERENCES users(id),
  -- Interest-weight vector (0-1 per tag) the MLE service compares a
  -- student's quiz answers against to produce a compatibility score.
  -- Keys match the onboarding quiz's interest ids: coding, hardware,
  -- design, writing, speaking, acting, impact, startups.
  ideal_persona JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_societies_manager_id ON societies(manager_id);

-- ============================================================================
-- applications
-- A student's application to one society. One application per (student,
-- society) pair -- re-applying just updates the existing row.
-- ============================================================================
CREATE TABLE applications (
  id            BIGSERIAL PRIMARY KEY,
  student_id    TEXT NOT NULL REFERENCES users(id),
  society_id    TEXT NOT NULL REFERENCES societies(id),
  status        TEXT NOT NULL DEFAULT 'Pending'
                  CHECK (status IN ('Pending', 'Assessed', 'Shortlisted', 'Interview_Booked', 'Rejected')),
  -- NON_TECH applications only: an array of {"question": ..., "answer": ...}
  -- objects from the recruitment form. NULL for TECH applications.
  form_answers  JSONB,
  -- NON_TECH applications only: a link to a portfolio/work sample. Distinct from
  -- form_answers (the recruitment form's own questions).
  portfolio_url TEXT,
  submitted_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (student_id, society_id)
);

CREATE INDEX idx_applications_student_id ON applications(student_id);
CREATE INDEX idx_applications_society_id ON applications(society_id);

-- ============================================================================
-- test_submissions
-- TECH track only: the result of a student's proctored assessment.
-- No row = the student hasn't taken the assessment yet.
-- ============================================================================
CREATE TABLE test_submissions (
  id                   BIGSERIAL PRIMARY KEY,
  application_id       BIGINT NOT NULL UNIQUE REFERENCES applications(id) ON DELETE CASCADE,
  score                INTEGER NOT NULL CHECK (score BETWEEN 0 AND 100),
  -- Proctoring signals captured during the assessment.
  tab_switch_count     INTEGER NOT NULL DEFAULT 0,
  focus_loss_duration  INTEGER NOT NULL DEFAULT 0, -- seconds
  -- Raw submitted MCQ answers, e.g. [{"questionId": "q1", "selectedIndex": 2}, ...].
  answers              JSONB,
  submitted_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- rubric_grades
-- NON_TECH track only: a manager's RED/YELLOW/GREEN call on an application.
-- No row = not graded yet (shows as "Pending" in the grading table).
-- ============================================================================
CREATE TABLE rubric_grades (
  id             BIGSERIAL PRIMARY KEY,
  application_id BIGINT NOT NULL UNIQUE REFERENCES applications(id) ON DELETE CASCADE,
  grade          TEXT NOT NULL CHECK (grade IN ('RED', 'YELLOW', 'GREEN')),
  graded_by      TEXT NOT NULL REFERENCES users(id),
  comments       TEXT,
  graded_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_rubric_grades_graded_by ON rubric_grades(graded_by);

-- ============================================================================
-- slot_bookings
-- In-person audition/interview slots. A slot is "available" while
-- application_id is NULL, and becomes booked (and un-bookable by anyone
-- else) the moment an application claims it.
-- ============================================================================
CREATE TABLE slot_bookings (
  id             BIGSERIAL PRIMARY KEY,
  slot_date      DATE NOT NULL,
  slot_time      TIME NOT NULL,
  venue          TEXT NOT NULL,
  application_id BIGINT UNIQUE REFERENCES applications(id) ON DELETE SET NULL,
  booked_at      TIMESTAMPTZ,
  UNIQUE (slot_date, slot_time, venue),
  CONSTRAINT booked_at_matches_application CHECK (
    (application_id IS NULL AND booked_at IS NULL) OR
    (application_id IS NOT NULL AND booked_at IS NOT NULL)
  )
);

-- ============================================================================
-- events
-- Campus feed: recruitment info sessions, workshops, auditions, etc.
-- ============================================================================
CREATE TABLE events (
  id           BIGSERIAL PRIMARY KEY,
  society_id   TEXT NOT NULL REFERENCES societies(id),
  title        TEXT NOT NULL,
  event_date   DATE NOT NULL,
  event_time   TIME NOT NULL,
  venue        TEXT NOT NULL,
  description  TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_events_society_id ON events(society_id);

-- ============================================================================
-- event_registrations
-- Which students have RSVP'd to which campus feed events.
-- ============================================================================
CREATE TABLE event_registrations (
  id             BIGSERIAL PRIMARY KEY,
  event_id       BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  student_id     TEXT NOT NULL REFERENCES users(id),
  registered_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (event_id, student_id)
);

CREATE INDEX idx_event_registrations_student_id ON event_registrations(student_id);

-- ============================================================================
-- student_profiles
-- A student's onboarding-quiz interest-weight vector (same 8 keys as
-- societies.ideal_persona). One row per student; retaking the quiz overwrites it.
-- ============================================================================
CREATE TABLE student_profiles (
  student_id     TEXT PRIMARY KEY REFERENCES users(id),
  feature_vector JSONB NOT NULL,
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- compatibility_scores
-- Cached MLE-service output (compatibility_score, mahalanobis_distance) per
-- (student, society) pair, so it doesn't need recomputing on every page load.
-- ============================================================================
CREATE TABLE compatibility_scores (
  student_id           TEXT NOT NULL REFERENCES users(id),
  society_id           TEXT NOT NULL REFERENCES societies(id),
  compatibility_score  NUMERIC NOT NULL,
  mahalanobis_distance NUMERIC NOT NULL,
  computed_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (student_id, society_id)
);
