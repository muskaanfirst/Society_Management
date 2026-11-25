import { NextResponse } from "next/server";
import pool from "@/lib/db";

const MLE_SERVICE_URL = process.env.MLE_SERVICE_URL ?? "http://localhost:8000";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const studentId = typeof body?.studentId === "string" ? body.studentId : "";
  const featureVector = body?.featureVector;

  if (!studentId || typeof featureVector !== "object" || featureVector === null) {
    return NextResponse.json(
      { error: "studentId and featureVector are required." },
      { status: 400 }
    );
  }

  await pool.query(
    `INSERT INTO student_profiles (student_id, feature_vector, updated_at)
     VALUES ($1, $2, now())
     ON CONFLICT (student_id) DO UPDATE SET feature_vector = $2, updated_at = now()`,
    [studentId, JSON.stringify(featureVector)]
  );

  const societiesResult = await pool.query(
    `SELECT id, name, ideal_persona FROM societies`
  );

  const scores = [];
  for (const society of societiesResult.rows) {
    const mleResponse = await fetch(`${MLE_SERVICE_URL}/mle-engine`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        feature_vector: featureVector,
        ideal_persona: society.ideal_persona,
      }),
    });

    if (!mleResponse.ok) {
      const detail = await mleResponse.text().catch(() => "");
      return NextResponse.json(
        { error: `MLE service rejected society ${society.id}: ${detail}` },
        { status: 502 }
      );
    }

    const mleResult = await mleResponse.json();
    await pool.query(
      `INSERT INTO compatibility_scores
         (student_id, society_id, compatibility_score, mahalanobis_distance, computed_at)
       VALUES ($1, $2, $3, $4, now())
       ON CONFLICT (student_id, society_id)
       DO UPDATE SET compatibility_score = $3, mahalanobis_distance = $4, computed_at = now()`,
      [studentId, society.id, mleResult.compatibility_score, mleResult.mahalanobis_distance]
    );

    scores.push({
      societyId: society.id,
      societyName: society.name,
      compatibilityScore: mleResult.compatibility_score,
      mahalanobisDistance: mleResult.mahalanobis_distance,
    });
  }

  scores.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
  return NextResponse.json({ scores });
}
