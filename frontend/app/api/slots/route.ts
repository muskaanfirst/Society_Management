import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(request: Request) {
  const status = new URL(request.url).searchParams.get("status");

  const whereClause = status === "available" ? "WHERE application_id IS NULL" : "";
  const result = await pool.query(
    `SELECT id, slot_date, slot_time, venue, application_id, booked_at
     FROM slot_bookings ${whereClause}
     ORDER BY slot_date, slot_time`
  );

  const slots = result.rows.map((row) => ({
    id: row.id,
    date: row.slot_date,
    time: row.slot_time,
    venue: row.venue,
    applicationId: row.application_id,
    bookedAt: row.booked_at,
    status: row.application_id ? "booked" : "available",
  }));

  return NextResponse.json({ slots });
}
