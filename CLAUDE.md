# SocMag — Claude Code Instructions

## Project
SocMag: campus society discovery, dual-track recruitment (Track A technical, Track B cultural), audition slot booking, and event feed for TIET Patiala.

## Architecture (Current Repo)
- `frontend/`        Existing Next.js (App Router) + Tailwind + Chart.js frontend AND Node.js REST API routes (`frontend/app/api/...`) using PostgreSQL via `pg`.
- `mle-service/`     Python 3.11 + FastAPI + NumPy/SciPy for MLE compatibility scoring (runs on http://localhost:8000).
- `db/`              `schema.sql` (BCNF) and `seed.sql` executed on cloud PostgreSQL (Neon/Supabase via `DATABASE_URL` in `frontend/.env.local`).
- `backend/`         Unused placeholder stub—do NOT build a separate Express server here; keep all Node.js REST API routes inside `frontend/app/api/`.

## Rules
- The user is a beginner. Explain every step in plain language.
- Always propose a plan (`/plan`) and wait for approval before editing files.
- Do NOT move or restructure existing Next.js files out of `frontend/`.
- Do NOT use Docker. Run Next.js (`npm --prefix frontend run dev`) and FastAPI (`uvicorn main:app --port 8000`) directly in the terminal.
- Never invent performance numbers. Only report numbers from actual runs.
- Never put secrets (DB URLs, JWT secrets, passwords) in code. Use `frontend/.env.local` and keep `.env*` in `.gitignore`.
- All SQL must use parameterised queries (`$1`, `$2`). Never build SQL by string concatenation.
- Prioritize a working end-to-end demo first; write a quick verification script for the MLE math and core APIs once they work.
- After each task: update `PROGRESS.md`, list changed files, and tell me how to run and test it.

## Workflow
Read `PLAN.md` and `PROGRESS.md` before coding. Update `PROGRESS.md` when a task is done.