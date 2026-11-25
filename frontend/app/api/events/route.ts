import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  const result = await pool.query(
    `SELECT e.id, e.society_id, e.title, e.event_date, e.event_time, e.venue, e.description,
            COUNT(er.id) AS registration_count
     FROM events e
     LEFT JOIN event_registrations er ON er.event_id = e.id
     GROUP BY e.id
     ORDER BY e.event_date, e.event_time`
  );

  const events = result.rows.map((row) => ({
    id: row.id,
    societyId: row.society_id,
    title: row.title,
    date: row.event_date,
    time: row.event_time,
    venue: row.venue,
    description: row.description,
    registrationCount: Number(row.registration_count),
  }));

  return NextResponse.json({ events });
}
