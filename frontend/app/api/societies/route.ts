import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  const result = await pool.query(
    `SELECT id, name, tagline, description, type, icon, accent,
            member_count, manager_id, ideal_persona
     FROM societies ORDER BY name`
  );

  const societies = result.rows.map((row) => ({
    id: row.id,
    name: row.name,
    tagline: row.tagline,
    description: row.description,
    type: row.type,
    icon: row.icon,
    accent: row.accent,
    memberCount: row.member_count,
    managerId: row.manager_id,
    idealPersona: row.ideal_persona,
  }));

  return NextResponse.json({ societies });
}
