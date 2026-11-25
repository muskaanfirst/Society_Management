import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";

const THAPAR_EMAIL = /^[A-Za-z0-9._%+-]+@thapar\.edu$/;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!THAPAR_EMAIL.test(email)) {
    return NextResponse.json(
      { error: "Please use a valid @thapar.edu email address." },
      { status: 400 }
    );
  }
  if (!password) {
    return NextResponse.json({ error: "Password is required." }, { status: 400 });
  }

  const result = await pool.query(
    `SELECT id, full_name, email, password_hash, role, roll_no, avatar_color
     FROM users WHERE email = $1`,
    [email]
  );
  const user = result.rows[0];
  if (!user) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const passwordMatches = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatches) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.full_name,
      email: user.email,
      role: user.role,
      rollNo: user.roll_no ?? undefined,
      avatarColor: user.avatar_color,
    },
    role: user.role,
  });
}
