-- Migration 001: additions needed by the Next.js API routes in frontend/app/api/.
-- Run this once against the existing database (it already has schema.sql + seed.sql applied).
-- Safe to re-run: guarded with IF NOT EXISTS / column-exists checks where Postgres supports it.

-- test_submissions: proctoring signals + raw submitted answers were not in the original
-- schema. No row exists yet without these, so NOT NULL + DEFAULT backfills safely.
ALTER TABLE test_submissions
  ADD COLUMN IF NOT EXISTS tab_switch_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS focus_loss_duration INTEGER NOT NULL DEFAULT 0, -- seconds
  ADD COLUMN IF NOT EXISTS answers JSONB; -- raw submitted [{questionId, selectedIndex}, ...]

-- applications: Track B portfolio URL is distinct from form_answers (the form questions).
ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS portfolio_url TEXT;

-- student_profiles: a student's onboarding-quiz interest-weight vector, same 8 keys as
-- societies.ideal_persona. One row per student; recomputing the quiz overwrites it.
CREATE TABLE IF NOT EXISTS student_profiles (
  student_id     TEXT PRIMARY KEY REFERENCES users(id),
  feature_vector JSONB NOT NULL,
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- compatibility_scores: the MLE service's output per (student, society) pair, cached so
-- the Societies tab doesn't have to recompute against mle-service on every page load.
CREATE TABLE IF NOT EXISTS compatibility_scores (
  student_id           TEXT NOT NULL REFERENCES users(id),
  society_id           TEXT NOT NULL REFERENCES societies(id),
  compatibility_score  NUMERIC NOT NULL,
  mahalanobis_distance NUMERIC NOT NULL,
  computed_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (student_id, society_id)
);
