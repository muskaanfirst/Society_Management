import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const slotId = Number(body?.slotId);
  const applicationId = Number(body?.applicationId);

  if (!Number.isInteger(slotId) || !Number.isInteger(applicationId)) {
    return NextResponse.json(
      { error: "slotId and applicationId are required." },
      { status: 400 }
    );
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Atomic claim: only succeeds if the slot is still unbooked. Two concurrent
    // requests for the same slot can't both win this UPDATE.
    const slotResult = await client.query(
      `UPDATE slot_bookings
       SET application_id = $1, booked_at = now()
       WHERE id = $2 AND application_id IS NULL
       RETURNING id, slot_date, slot_time, venue, booked_at`,
      [applicationId, slotId]
    );

    if (slotResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { error: "That slot is already booked." },
        { status: 409 }
      );
    }

    await client.query(
      `UPDATE applications SET status = 'Interview_Booked' WHERE id = $1`,
      [applicationId]
    );

    await client.query("COMMIT");

    const row = slotResult.rows[0];
    return NextResponse.json({
      slot: {
        id: row.id,
        date: row.slot_date,
        time: row.slot_time,
        venue: row.venue,
        bookedAt: row.booked_at,
        applicationId,
        status: "booked",
      },
    });
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
