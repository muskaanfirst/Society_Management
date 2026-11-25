# SocMag — Claude Code Instructions

## Project
SocMag: campus society discovery, dual-track recruitment (Track A technical, Track B cultural), audition slot booking, and event feed for TIET Patiala. See docs/SRS_Project_SocMag.pdf and project-proposal/main.tex.

## Architecture (target)
- frontend/  Next.js (App Router) + Tailwind + Chart.js + Framer Motion
- backend/   Node.js + Express REST API, PostgreSQL via `pg`, JWT auth (httpOnly cookie), bcrypt
- mle-service/ Python 3.11 + FastAPI + NumPy/SciPy, MLE compatibility scoring
- db/        schema.sql, seed.sql, migrations
- docker-compose.yml runs postgres, backend, mle-service

## Rules
- The user is a beginner. Explain every step in plain language. Never change more than one feature per task.
- Always propose a plan and wait for approval before editing files.
- Never invent performance numbers. Only report numbers produced by a script we actually ran.
- Never put secrets (passwords, JWT secret, API keys) in code. Use .env files and keep .env in .gitignore.
- All SQL must use parameterised queries ($1, $2). Never build SQL by string concatenation.
- After each task: update PROGRESS.md, list changed files, tell me how to run and test it.
- Write tests for backend logic and the MLE maths.

## Workflow
Read PLAN.md and PROGRESS.md before coding. Update PROGRESS.md when a task is done.
