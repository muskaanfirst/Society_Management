import { NextResponse } from "next/server";
import pool from "@/lib/db";

// Fields a manager may edit on their own society. Keyed by the JSON body key;
// mapped to the real column name so the SQL never embeds a client-controlled
// column name.
const EDITABLE_FIELDS: Record<string, string> = {
  tagline: "tagline",
  description: "description",
  memberCount: "member_count",
  idealPersona: "ideal_persona",
  icon: "icon",
  accent: "accent",
};

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const requestingUserId = typeof body?.requestingUserId === "string" ? body.requestingUserId : "";

  if (!requestingUserId) {
    return NextResponse.json({ error: "requestingUserId is required." }, { status: 400 });
  }

  const societyResult = await pool.query(
    `SELECT manager_id FROM societies WHERE id = $1`,
    [id]
  );
  const society = societyResult.rows[0];
  if (!society) {
    return NextResponse.json({ error: "Society not found." }, { status: 404 });
  }
  if (society.manager_id !== requestingUserId) {
    return NextResponse.json(
      { error: "Only that society's manager can edit it." },
      { status: 403 }
    );
  }

  const setClauses: string[] = [];
  const values: unknown[] = [];
  for (const [bodyKey, column] of Object.entries(EDITABLE_FIELDS)) {
    if (body[bodyKey] === undefined) continue;
    values.push(bodyKey === "idealPersona" ? JSON.stringify(body[bodyKey]) : body[bodyKey]);
    setClauses.push(`${column} = $${values.length}`);
  }

  if (setClauses.length === 0) {
    return NextResponse.json({ error: "No editable fields provided." }, { status: 400 });
  }

  values.push(id);
  const result = await pool.query(
    `UPDATE societies SET ${setClauses.join(", ")} WHERE id = $${values.length}
     RETURNING id, name, tagline, description, type, icon, accent, member_count, manager_id, ideal_persona`,
    values
  );

  const row = result.rows[0];
  return NextResponse.json({
    society: {
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
    },
  });
}
