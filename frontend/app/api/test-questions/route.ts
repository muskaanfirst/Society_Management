import { NextResponse } from "next/server";
import { MCQ_BANK } from "@/lib/mcqBank";

// correctIndex never leaves the server -- this is the only safe way for a
// client page to get the question list without shipping the answer key.
export async function GET() {
  const questions = MCQ_BANK.map(({ id, question, options }) => ({ id, question, options }));
  return NextResponse.json({ questions });
}
