import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(request: Request) {
  const type = new URL(request.url).searchParams.get("type");

  if (type === "TECH") {
    const result = await pool.query(
      `SELECT a.id AS application_id, u.full_name, u.roll_no, a.status,
              ts.score, ts.tab_switch_count, ts.focus_loss_duration, a.society_id
       FROM applications a
       JOIN users u ON u.id = a.student_id
       JOIN societies s ON s.id = a.society_id
       LEFT JOIN test_submissions ts ON ts.application_id = a.id
       WHERE s.type = 'TECH'
       ORDER BY ts.score DESC NULLS LAST`
    );
    return NextResponse.json({
      type: "TECH",
      rows: result.rows.map((r) => ({
        applicationId: r.application_id,
        studentName: r.full_name,
        studentRollNo: r.roll_no,
        societyId: r.society_id,
        status: r.status,
        score: r.score,
        tabSwitchCount: r.tab_switch_count,
        focusLossDuration: r.focus_loss_duration,
      })),
    });
  }

  if (type === "NON_TECH") {
    const result = await pool.query(
      `SELECT a.id AS application_id, u.full_name, u.roll_no, a.status,
              a.form_answers, a.portfolio_url, a.society_id,
              rg.grade, rg.comments, rg.graded_by
       FROM applications a
       JOIN users u ON u.id = a.student_id
       JOIN societies s ON s.id = a.society_id
       LEFT JOIN rubric_grades rg ON rg.application_id = a.id
       WHERE s.type = 'NON_TECH'
       ORDER BY a.submitted_at`
    );
    return NextResponse.json({
      type: "NON_TECH",
      rows: result.rows.map((r) => ({
        applicationId: r.application_id,
        studentName: r.full_name,
        studentRollNo: r.roll_no,
        societyId: r.society_id,
        status: r.status,
        formAnswers: r.form_answers,
        portfolioUrl: r.portfolio_url,
        grade: r.grade ?? null,
        comments: r.comments,
        gradedBy: r.graded_by,
      })),
    });
  }

  return NextResponse.json(
    { error: "Query param 'type' must be TECH or NON_TECH." },
    { status: 400 }
  );
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const action = body?.action;

  if (action === "shortlist") {
    const applicationId = Number(body?.applicationId);
    if (!Number.isInteger(applicationId)) {
      return NextResponse.json({ error: "applicationId is required." }, { status: 400 });
    }
    const result = await pool.query(
      `UPDATE applications SET status = 'Shortlisted' WHERE id = $1 RETURNING id, status`,
      [applicationId]
    );
    if (!result.rows[0]) {
      return NextResponse.json({ error: "Application not found." }, { status: 404 });
    }
    return NextResponse.json({ application: result.rows[0] });
  }

  if (action === "rubric") {
    const applicationId = Number(body?.applicationId);
    const grade = body?.grade;
    const gradedBy = typeof body?.gradedBy === "string" ? body.gradedBy : "";
    const comments = typeof body?.comments === "string" ? body.comments : null;

    if (!Number.isInteger(applicationId) || !["RED", "YELLOW", "GREEN"].includes(grade) || !gradedBy) {
      return NextResponse.json(
        { error: "applicationId, grade (RED/YELLOW/GREEN), and gradedBy are required." },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `INSERT INTO rubric_grades (application_id, grade, graded_by, comments, graded_at)
       VALUES ($1, $2, $3, $4, now())
       ON CONFLICT (application_id) DO UPDATE SET
         grade = $2, graded_by = $3, comments = $4, graded_at = now()
       RETURNING application_id, grade, graded_by, comments`,
      [applicationId, grade, gradedBy, comments]
    );
    return NextResponse.json({ rubricGrade: result.rows[0] });
  }

  if (action === "bulkShortlistGreen") {
    const societyId = typeof body?.societyId === "string" ? body.societyId : "";
    if (!societyId) {
      return NextResponse.json({ error: "societyId is required." }, { status: 400 });
    }
    const result = await pool.query(
      `UPDATE applications SET status = 'Shortlisted'
       WHERE society_id = $1
         AND id IN (SELECT application_id FROM rubric_grades WHERE grade = 'GREEN')
       RETURNING id`,
      [societyId]
    );
    return NextResponse.json({ shortlistedApplicationIds: result.rows.map((r) => r.id) });
  }

  return NextResponse.json(
    { error: "action must be one of: shortlist, rubric, bulkShortlistGreen." },
    { status: 400 }
  );
}
