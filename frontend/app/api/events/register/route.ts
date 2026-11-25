import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const eventId = Number(body?.eventId);
  const studentId = typeof body?.studentId === "string" ? body.studentId : "";

  if (!Number.isInteger(eventId) || !studentId) {
    return NextResponse.json({ error: "eventId and studentId are required." }, { status: 400 });
  }

  const result = await pool.query(
    `INSERT INTO event_registrations (event_id, student_id, registered_at)
     VALUES ($1, $2, now())
     ON CONFLICT (event_id, student_id) DO NOTHING
     RETURNING id, event_id, student_id, registered_at`,
    [eventId, studentId]
  );

  if (result.rowCount === 0) {
    return NextResponse.json({ alreadyRegistered: true, eventId, studentId });
  }

  const row = result.rows[0];
  return NextResponse.json({
    alreadyRegistered: false,
    registration: {
      id: row.id,
      eventId: row.event_id,
      studentId: row.student_id,
      registeredAt: row.registered_at,
    },
  });
}
