import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { MCQ_BANK } from "@/lib/mcqBank";

interface SubmittedAnswer {
  questionId: string;
  selectedIndex: number;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const applicationId = Number(body?.applicationId);
  const answers: SubmittedAnswer[] = Array.isArray(body?.answers) ? body.answers : [];
  const tabSwitchCount = Number.isInteger(body?.tabSwitchCount) ? body.tabSwitchCount : 0;
  const focusLossDuration = Number.isInteger(body?.focusLossDuration) ? body.focusLossDuration : 0;

  if (!Number.isInteger(applicationId)) {
    return NextResponse.json({ error: "applicationId is required." }, { status: 400 });
  }

  let correctCount = 0;
  for (const question of MCQ_BANK) {
    const submitted = answers.find((a) => a.questionId === question.id);
    if (submitted && submitted.selectedIndex === question.correctIndex) {
      correctCount += 1;
    }
  }
  const score = Math.round((correctCount / MCQ_BANK.length) * 100);

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await client.query(
      `INSERT INTO test_submissions
         (application_id, score, tab_switch_count, focus_loss_duration, answers, submitted_at)
       VALUES ($1, $2, $3, $4, $5, now())
       ON CONFLICT (application_id) DO UPDATE SET
         score = $2, tab_switch_count = $3, focus_loss_duration = $4, answers = $5, submitted_at = now()`,
      [applicationId, score, tabSwitchCount, focusLossDuration, JSON.stringify(answers)]
    );

    await client.query(
      `UPDATE applications SET status = 'Assessed' WHERE id = $1`,
      [applicationId]
    );

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }

  return NextResponse.json({
    applicationId,
    score,
    correctCount,
    totalQuestions: MCQ_BANK.length,
    tabSwitchCount,
    focusLossDuration,
  });
}
