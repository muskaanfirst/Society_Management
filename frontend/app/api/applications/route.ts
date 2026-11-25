import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(request: Request) {
  const studentId = new URL(request.url).searchParams.get("studentId");
  if (!studentId) {
    return NextResponse.json({ error: "studentId query param is required." }, { status: 400 });
  }

  const result = await pool.query(
    `SELECT a.id, a.society_id, a.status, a.form_answers, a.portfolio_url, a.submitted_at, ts.score
     FROM applications a
     LEFT JOIN test_submissions ts ON ts.application_id = a.id
     WHERE a.student_id = $1
     ORDER BY a.submitted_at DESC`,
    [studentId]
  );

  const applications = result.rows.map((row) => ({
    id: row.id,
    societyId: row.society_id,
    status: row.status,
    formAnswers: row.form_answers ?? undefined,
    portfolioUrl: row.portfolio_url ?? undefined,
    submittedAt: row.submitted_at,
    score: row.score ?? undefined,
  }));

  return NextResponse.json({ applications });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const studentId = typeof body?.studentId === "string" ? body.studentId : "";
  const societyId = typeof body?.societyId === "string" ? body.societyId : "";
  const formAnswers = Array.isArray(body?.formAnswers) ? body.formAnswers : null;
  const portfolioUrl = typeof body?.portfolioUrl === "string" ? body.portfolioUrl : null;

  if (!studentId || !societyId) {
    return NextResponse.json({ error: "studentId and societyId are required." }, { status: 400 });
  }

  // Upsert: a brand-new row starts Pending; revisiting this (e.g. reopening the
  // assessment page) must NOT reset an already-Assessed/Shortlisted application
  // back to Pending, and must not blank out a previously-saved form/portfolio value.
  const result = await pool.query(
    `INSERT INTO applications (student_id, society_id, status, form_answers, portfolio_url, submitted_at)
     VALUES ($1, $2, 'Pending', $3, $4, now())
     ON CONFLICT (student_id, society_id) DO UPDATE SET
       form_answers  = COALESCE($3, applications.form_answers),
       portfolio_url = COALESCE($4, applications.portfolio_url)
     RETURNING id, society_id, status, form_answers, portfolio_url, submitted_at`,
    [studentId, societyId, formAnswers ? JSON.stringify(formAnswers) : null, portfolioUrl]
  );

  const row = result.rows[0];
  return NextResponse.json({
    application: {
      id: row.id,
      societyId: row.society_id,
      status: row.status,
      formAnswers: row.form_answers ?? undefined,
      portfolioUrl: row.portfolio_url ?? undefined,
      submittedAt: row.submitted_at,
    },
  });
}
