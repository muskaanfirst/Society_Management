-- SocMag demo seed data (PostgreSQL)
--
-- Run after schema.sql, e.g.:
--   psql "$DATABASE_URL" -f db/schema.sql
--   psql "$DATABASE_URL" -f db/seed.sql
--
-- DEMO PASSWORD: every seeded user shares the password  DemoPass#2026
-- The password_hash values below are a real bcrypt hash of that string
-- (generated once with bcryptjs, not hand-typed). This is throwaway dev/demo
-- data, not a real secret -- never reuse it for an actual account.
--
-- PLACEHOLDER CONTENT: the 8 societies' taglines/descriptions/ideal_persona
-- weights are Claude's best-guess placeholders based on the acronym alone
-- (CCS, MARS, TNT, MUDRA, SUR, FAPS) or general knowledge of the org's
-- global program (GDG, OWASP). None of this has been verified against
-- TIET's actual society charters -- replace with the real copy before using
-- this for anything beyond local development.

BEGIN;

-- ============================================================================
-- users
-- ============================================================================
INSERT INTO users (id, full_name, email, password_hash, role, roll_no, avatar_color) VALUES
  ('u-student-1',      'Aarav Mehta',    'aarav.mehta@thapar.edu',    '$2b$10$SKJXK0NFXQQPqwbABUEUXeP1VL86Y1zN9JDPPD6cL2P2NVFGZaHqC', 'student', '102203045', 'mint'),
  ('u-manager-tech',   'Riya Kapoor',    'riya.kapoor@thapar.edu',    '$2b$10$SKJXK0NFXQQPqwbABUEUXeP1VL86Y1zN9JDPPD6cL2P2NVFGZaHqC', 'manager', NULL,        'coral'),
  ('u-manager-nontech','Devansh Sethi',  'devansh.sethi@thapar.edu',  '$2b$10$SKJXK0NFXQQPqwbABUEUXeP1VL86Y1zN9JDPPD6cL2P2NVFGZaHqC', 'manager', NULL,        'amber'),
  ('seed-1',  'Simran Chawla',  'simran.chawla@thapar.edu',  '$2b$10$SKJXK0NFXQQPqwbABUEUXeP1VL86Y1zN9JDPPD6cL2P2NVFGZaHqC', 'student', '102203012', 'mint'),
  ('seed-2',  'Karan Bhatia',   'karan.bhatia@thapar.edu',   '$2b$10$SKJXK0NFXQQPqwbABUEUXeP1VL86Y1zN9JDPPD6cL2P2NVFGZaHqC', 'student', '102203078', 'coral'),
  ('seed-3',  'Ananya Iyer',    'ananya.iyer@thapar.edu',    '$2b$10$SKJXK0NFXQQPqwbABUEUXeP1VL86Y1zN9JDPPD6cL2P2NVFGZaHqC', 'student', '102203099', 'amber'),
  ('seed-4',  'Yash Malhotra',  'yash.malhotra@thapar.edu',  '$2b$10$SKJXK0NFXQQPqwbABUEUXeP1VL86Y1zN9JDPPD6cL2P2NVFGZaHqC', 'student', '102203123', 'mint'),
  ('seed-5',  'Priya Nair',     'priya.nair@thapar.edu',     '$2b$10$SKJXK0NFXQQPqwbABUEUXeP1VL86Y1zN9JDPPD6cL2P2NVFGZaHqC', 'student', '102203056', 'coral'),
  ('seed-6',  'Rohan Gupta',    'rohan.gupta@thapar.edu',    '$2b$10$SKJXK0NFXQQPqwbABUEUXeP1VL86Y1zN9JDPPD6cL2P2NVFGZaHqC', 'student', '102203031', 'amber'),
  ('seed-7',  'Meher Grover',   'meher.grover@thapar.edu',   '$2b$10$SKJXK0NFXQQPqwbABUEUXeP1VL86Y1zN9JDPPD6cL2P2NVFGZaHqC', 'student', '102203067', 'mint'),
  ('seed-8',  'Ishaan Verma',   'ishaan.verma@thapar.edu',   '$2b$10$SKJXK0NFXQQPqwbABUEUXeP1VL86Y1zN9JDPPD6cL2P2NVFGZaHqC', 'student', '102203088', 'coral'),
  ('seed-9',  'Tanvi Rao',      'tanvi.rao@thapar.edu',      '$2b$10$SKJXK0NFXQQPqwbABUEUXeP1VL86Y1zN9JDPPD6cL2P2NVFGZaHqC', 'student', '102203109', 'amber'),
  ('seed-10', 'Arjun Sinha',    'arjun.sinha@thapar.edu',    '$2b$10$SKJXK0NFXQQPqwbABUEUXeP1VL86Y1zN9JDPPD6cL2P2NVFGZaHqC', 'student', '102203114', 'mint');

-- ============================================================================
-- societies (4 TECH, 4 NON_TECH)
-- ideal_persona keys match the onboarding quiz's interest ids: coding,
-- hardware, design, writing, speaking, acting, impact, startups.
-- ============================================================================
INSERT INTO societies (id, name, tagline, description, type, icon, accent, member_count, manager_id, ideal_persona) VALUES
  ('soc-ccs', 'CCS',
    'DSA, contests, and late-night debugging.',
    'Competitive Coding Society -- Thapar''s competitive-programming community. Weekly contests, DSA bootcamps, and a team at ICPC regionals.',
    'TECH', 'Terminal', 'mint', 130, 'u-manager-tech',
    '{"coding":0.97,"hardware":0.20,"design":0.10,"writing":0.10,"speaking":0.15,"acting":0.05,"impact":0.10,"startups":0.25}'::jsonb),

  ('soc-mars', 'MARS',
    'Building what doesn''t exist yet.',
    'Thapar''s robotics and autonomous-systems team -- designs and builds competition robots and fields a rover team at national events.',
    'TECH', 'Rocket', 'coral', 70, 'u-manager-tech',
    '{"coding":0.55,"hardware":0.95,"design":0.25,"writing":0.10,"speaking":0.15,"acting":0.05,"impact":0.20,"startups":0.30}'::jsonb),

  ('soc-gdg', 'GDG',
    'Google Developer Group, Thapar chapter.',
    'Part of Google''s global GDG program -- runs web, cloud, and ML workshops and study jams open to all years.',
    'TECH', 'Globe', 'amber', 115, 'u-manager-tech',
    '{"coding":0.85,"hardware":0.25,"design":0.35,"writing":0.25,"speaking":0.40,"acting":0.05,"impact":0.20,"startups":0.45}'::jsonb),

  ('soc-owasp', 'OWASP',
    'Think like an attacker.',
    'OWASP Student Chapter -- application and web security: CTFs, bug-bounty study groups, and talks on real-world vulnerabilities.',
    'TECH', 'ShieldCheck', 'mint', 48, 'u-manager-tech',
    '{"coding":0.80,"hardware":0.30,"design":0.10,"writing":0.20,"speaking":0.25,"acting":0.05,"impact":0.30,"startups":0.15}'::jsonb),

  ('soc-tnt', 'TNT',
    'Street theatre with something to say.',
    'Thapar''s nukkad-natak (street theatre) troupe -- stages socially-driven plays on and off campus.',
    'NON_TECH', 'Drama', 'coral', 52, 'u-manager-nontech',
    '{"coding":0.05,"hardware":0.05,"design":0.25,"writing":0.35,"speaking":0.50,"acting":0.95,"impact":0.40,"startups":0.10}'::jsonb),

  ('soc-mudra', 'MUDRA',
    'Every gesture tells a story.',
    'Thapar''s dance society -- classical and contemporary choreography, with a major production each fest season.',
    'NON_TECH', 'PersonStanding', 'amber', 58, 'u-manager-nontech',
    '{"coding":0.05,"hardware":0.05,"design":0.20,"writing":0.10,"speaking":0.20,"acting":0.90,"impact":0.15,"startups":0.05}'::jsonb),

  ('soc-sur', 'SUR',
    'Find your note.',
    'Thapar''s music society -- vocal and instrumental, from acoustic sets to the annual battle of bands.',
    'NON_TECH', 'Music', 'mint', 61, 'u-manager-nontech',
    '{"coding":0.05,"hardware":0.10,"design":0.15,"writing":0.25,"speaking":0.30,"acting":0.60,"impact":0.15,"startups":0.10}'::jsonb),

  ('soc-faps', 'FAPS',
    'Framing campus, one shot at a time.',
    'Fine Arts & Photography Society -- exhibitions, campus photo-walks, and event coverage for every fest.',
    'NON_TECH', 'Camera', 'coral', 44, 'u-manager-nontech',
    '{"coding":0.10,"hardware":0.20,"design":0.90,"writing":0.20,"speaking":0.15,"acting":0.20,"impact":0.15,"startups":0.20}'::jsonb);

-- ============================================================================
-- applications
-- TECH applications get a test_submissions row; NON_TECH applications carry
-- form_answers and (if graded) a rubric_grades row.
-- ============================================================================
INSERT INTO applications (student_id, society_id, status, form_answers, submitted_at) VALUES
  -- TECH
  ('u-student-1', 'soc-mars',  'Shortlisted', NULL, '2026-09-05'),
  ('seed-1',      'soc-ccs',   'Shortlisted', NULL, '2026-09-03'),
  ('seed-2',      'soc-ccs',   'Assessed',    NULL, '2026-09-03'),
  ('seed-3',      'soc-ccs',   'Shortlisted', NULL, '2026-09-02'),
  ('seed-4',      'soc-gdg',   'Assessed',    NULL, '2026-09-04'),
  ('seed-5',      'soc-mars',  'Assessed',    NULL, '2026-09-03'),
  ('seed-6',      'soc-owasp', 'Shortlisted', NULL, '2026-09-05'),

  -- NON_TECH
  ('u-student-1', 'soc-sur',   'Shortlisted',
    '[{"question":"Why do you want to join SUR?","answer":"I''ve been playing guitar and singing for three years and want a stage to perform and grow."},
      {"question":"Share a performance or recording.","answer":"Link: SoundCloud -- ''Monsoon Sessions'' acoustic cover set."}]'::jsonb,
    '2026-09-04'),
  ('seed-7', 'soc-tnt', 'Pending',
    '[{"question":"Why do you want to join TNT?","answer":"I organised a campus nukkad natak on recycling last year and want to keep making street theatre that says something."},
      {"question":"Describe an issue you''d want to stage a play about.","answer":"Food wastage in the campus mess halls."}]'::jsonb,
    '2026-09-04'),
  ('seed-8', 'soc-tnt', 'Pending',
    '[{"question":"Why do you want to join TNT?","answer":"Interested in socially-driven performance as a way to start conversations on campus."},
      {"question":"Describe an issue you''d want to stage a play about.","answer":"Access to affordable hygiene products in nearby villages."}]'::jsonb,
    '2026-09-05'),
  ('seed-9', 'soc-mudra', 'Pending',
    '[{"question":"Past dance experience?","answer":"Eight years of Bharatanatyam training, plus a lead piece in the school''s annual day production."},
      {"question":"Why MUDRA?","answer":"Want to keep training classically while exploring contemporary choreography too."}]'::jsonb,
    '2026-09-03'),
  ('seed-10', 'soc-faps', 'Pending',
    '[{"question":"Why do you want to join FAPS?","answer":"I shoot street photography on weekends and want feedback from a community that takes it seriously."},
      {"question":"Share a sample of your work.","answer":"Attached: ''The Last Local'' -- a street-photography series, 12 frames."}]'::jsonb,
    '2026-09-02');

-- ============================================================================
-- test_submissions (TECH applications only)
-- Shortlist threshold mirrors the frontend's rule: score >= 75 -> Shortlisted.
-- ============================================================================
INSERT INTO test_submissions (application_id, score, submitted_at) VALUES
  ((SELECT id FROM applications WHERE student_id = 'u-student-1' AND society_id = 'soc-mars'),  82, '2026-09-05'),
  ((SELECT id FROM applications WHERE student_id = 'seed-1'      AND society_id = 'soc-ccs'),   91, '2026-09-03'),
  ((SELECT id FROM applications WHERE student_id = 'seed-2'      AND society_id = 'soc-ccs'),   64, '2026-09-03'),
  ((SELECT id FROM applications WHERE student_id = 'seed-3'      AND society_id = 'soc-ccs'),   88, '2026-09-02'),
  ((SELECT id FROM applications WHERE student_id = 'seed-4'      AND society_id = 'soc-gdg'),   47, '2026-09-04'),
  ((SELECT id FROM applications WHERE student_id = 'seed-5'      AND society_id = 'soc-mars'),  73, '2026-09-03'),
  ((SELECT id FROM applications WHERE student_id = 'seed-6'      AND society_id = 'soc-owasp'), 79, '2026-09-05');

-- ============================================================================
-- rubric_grades (only the NON_TECH applications a manager has already graded)
-- ============================================================================
INSERT INTO rubric_grades (application_id, grade, graded_by, graded_at) VALUES
  ((SELECT id FROM applications WHERE student_id = 'u-student-1' AND society_id = 'soc-sur'), 'GREEN', 'u-manager-nontech', '2026-09-06');

-- ============================================================================
-- slot_bookings -- available in-person audition slots (none booked yet)
-- ============================================================================
INSERT INTO slot_bookings (slot_date, slot_time, venue) VALUES
  ('2026-09-17', '10:00', 'Interview Room 1, SLS Block'),
  ('2026-09-17', '11:30', 'Interview Room 1, SLS Block'),
  ('2026-09-18', '14:00', 'Interview Room 2, SLS Block'),
  ('2026-09-18', '15:30', 'Interview Room 2, SLS Block'),
  ('2026-09-19', '10:00', 'Society Office, Block C'),
  ('2026-09-19', '16:00', 'Society Office, Block C');

-- ============================================================================
-- events -- one upcoming recruitment event per society
-- ============================================================================
INSERT INTO events (society_id, title, event_date, event_time, venue, description) VALUES
  ('soc-ccs',   'CCS Recruitment Info Session',  '2026-09-10', '17:00', 'LT-1, Academic Block',
    'Meet the core team, learn the contest format, and get your questions answered before applying.'),
  ('soc-mars',  'MARS Open Workshop: Intro to ROS', '2026-09-11', '15:30', 'Robotics Lab, Mechanical Block',
    'Hands-on workshop open to anyone interested in recruiting season.'),
  ('soc-gdg',   'GDG DevFest Info Session', '2026-09-12', '17:30', 'LT-3, Academic Block',
    'Intro to the web, cloud, and ML tracks, and how GDG recruitment works this year.'),
  ('soc-owasp', 'OWASP Capture the Flag Night', '2026-09-13', '19:00', 'Computer Centre, Block B',
    'Beginner-friendly CTF -- no prior security experience needed to join in.'),
  ('soc-tnt',   'TNT Street Play Auditions', '2026-09-14', '16:00', 'Amphitheatre',
    'Cold-read auditions for the next street play. Walk-ins welcome.'),
  ('soc-mudra', 'MUDRA Open Dance Workshop', '2026-09-15', '18:00', 'Dance Studio, Student Activity Centre',
    'Open session, no prior experience required -- come try it out.'),
  ('soc-sur',   'SUR Open Mic & Jam Night', '2026-09-16', '19:00', 'Amphitheatre',
    'Informal jam session and a chance to meet the panel before auditions.'),
  ('soc-faps',  'FAPS Portfolio Review', '2026-09-17', '14:00', 'Design Studio, Block A',
    'Bring a laptop or printed portfolio for a quick 1:1 review with the leads.');

-- ============================================================================
-- event_registrations
-- ============================================================================
INSERT INTO event_registrations (event_id, student_id) VALUES
  ((SELECT id FROM events WHERE society_id = 'soc-mars'  AND title = 'MARS Open Workshop: Intro to ROS'), 'u-student-1'),
  ((SELECT id FROM events WHERE society_id = 'soc-sur'   AND title = 'SUR Open Mic & Jam Night'),         'u-student-1'),
  ((SELECT id FROM events WHERE society_id = 'soc-ccs'   AND title = 'CCS Recruitment Info Session'),     'seed-1'),
  ((SELECT id FROM events WHERE society_id = 'soc-tnt'   AND title = 'TNT Street Play Auditions'),        'seed-7'),
  ((SELECT id FROM events WHERE society_id = 'soc-mudra' AND title = 'MUDRA Open Dance Workshop'),        'seed-9');

COMMIT;
