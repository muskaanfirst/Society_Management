import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const applicationId = Number(body?.applicationId);
  const portfolioUrl = typeof body?.portfolioUrl === "string" ? body.portfolioUrl.trim() : "";

  if (!Number.isInteger(applicationId) || !portfolioUrl) {
    return NextResponse.json(
      { error: "applicationId and portfolioUrl are required." },
      { status: 400 }
    );
  }

  try {
    new URL(portfolioUrl);
  } catch {
    return NextResponse.json({ error: "portfolioUrl must be a valid URL." }, { status: 400 });
  }

  const result = await pool.query(
    `UPDATE applications SET portfolio_url = $1 WHERE id = $2
     RETURNING id, student_id, society_id, status, portfolio_url`,
    [portfolioUrl, applicationId]
  );

  const row = result.rows[0];
  if (!row) {
    return NextResponse.json({ error: "Application not found." }, { status: 404 });
  }

  return NextResponse.json({
    application: {
      id: row.id,
      studentId: row.student_id,
      societyId: row.society_id,
      status: row.status,
      portfolioUrl: row.portfolio_url,
    },
  });
}
