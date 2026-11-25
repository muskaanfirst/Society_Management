// Exercises all 8 API routes against real seed data on a running dev server.
// Usage: node scripts/verify-api.mjs   (requires `npm run dev` + mle-service's
// `uvicorn main:app --port 8000` already running)
const BASE = "http://localhost:3000/api";
let passed = 0;
let failed = 0;

function check(label, condition, details) {
  if (condition) {
    console.log(`PASS  ${label}`);
    passed += 1;
  } else {
    console.log(`FAIL  ${label}  ${details ? JSON.stringify(details) : ""}`);
    failed += 1;
  }
}

async function call(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => null);
  return { status: res.status, json };
}

async function main() {
  // 1. auth/login
  const goodLogin = await call("POST", "/auth/login", {
    email: "seed-1@thapar.edu".replace("seed-1", "simran.chawla"),
    password: "DemoPass#2026",
  });
  check("POST /auth/login valid creds -> 200 + role", goodLogin.status === 200 && goodLogin.json?.role === "student", goodLogin);

  const badLogin = await call("POST", "/auth/login", {
    email: "simran.chawla@thapar.edu",
    password: "wrong-password",
  });
  check("POST /auth/login wrong password -> 401", badLogin.status === 401, badLogin);

  // 2. societies GET + PATCH
  const societies = await call("GET", "/societies");
  check("GET /societies -> 200 + 8 societies", societies.status === 200 && societies.json?.societies?.length === 8, societies);

  const ccs = societies.json.societies.find((s) => s.id === "soc-ccs");
  const patchOk = await call("PATCH", "/societies/soc-ccs", {
    requestingUserId: ccs.managerId,
    memberCount: ccs.memberCount + 1,
  });
  check(
    "PATCH /societies/soc-ccs by real manager -> 200 + incremented count",
    patchOk.status === 200 && patchOk.json?.society?.memberCount === ccs.memberCount + 1,
    patchOk
  );

  const patchForbidden = await call("PATCH", "/societies/soc-ccs", {
    requestingUserId: "u-student-1",
    memberCount: 999,
  });
  check("PATCH /societies/soc-ccs by non-manager -> 403", patchForbidden.status === 403, patchForbidden);

  // 3. calculate-compatibility
  const compat = await call("POST", "/calculate-compatibility", {
    studentId: "u-student-1",
    featureVector: {
      coding: 0.9, hardware: 0.2, design: 0.1, writing: 0.1,
      speaking: 0.15, acting: 0.05, impact: 0.1, startups: 0.2,
    },
  });
  check(
    "POST /calculate-compatibility -> 200 + 8 scores, sorted desc",
    compat.status === 200 &&
      compat.json?.scores?.length === 8 &&
      compat.json.scores[0].compatibilityScore >= compat.json.scores[7].compatibilityScore,
    compat
  );

  // 4. grades GET (also gives us real application ids to exercise other routes with)
  const techGrades = await call("GET", "/grades?type=TECH");
  const nonTechGrades = await call("GET", "/grades?type=NON_TECH");
  check("GET /grades?type=TECH -> 200 + rows", techGrades.status === 200 && Array.isArray(techGrades.json?.rows), techGrades);
  check("GET /grades?type=NON_TECH -> 200 + rows", nonTechGrades.status === 200 && Array.isArray(nonTechGrades.json?.rows), nonTechGrades);

  const techAppId = techGrades.json.rows[0]?.applicationId;
  const nonTechApp = nonTechGrades.json.rows.find((r) => r.applicationId);
  const nonTechAppId = nonTechApp?.applicationId;

  // 5. test-submit (against the TECH application)
  const submit = await call("POST", "/test-submit", {
    applicationId: techAppId,
    answers: [
      { questionId: "q1", selectedIndex: 1 },
      { questionId: "q2", selectedIndex: 2 },
      { questionId: "q3", selectedIndex: 0 }, // wrong on purpose
    ],
    tabSwitchCount: 2,
    focusLossDuration: 5,
  });
  check(
    "POST /test-submit -> 200 + partial score computed",
    submit.status === 200 && submit.json?.score === Math.round((2 / 8) * 100),
    submit
  );

  // 6. applications/portfolio (against the NON_TECH application)
  const portfolio = await call("POST", "/applications/portfolio", {
    applicationId: nonTechAppId,
    portfolioUrl: "https://example.com/portfolio/demo",
  });
  check(
    "POST /applications/portfolio -> 200 + url saved",
    portfolio.status === 200 && portfolio.json?.application?.portfolioUrl === "https://example.com/portfolio/demo",
    portfolio
  );

  const badPortfolio = await call("POST", "/applications/portfolio", {
    applicationId: nonTechAppId,
    portfolioUrl: "not-a-url",
  });
  check("POST /applications/portfolio invalid URL -> 400", badPortfolio.status === 400, badPortfolio);

  // 7. grades POST (rubric -> bulkShortlistGreen -> shortlist)
  const rubric = await call("POST", "/grades", {
    action: "rubric",
    applicationId: nonTechAppId,
    grade: "GREEN",
    gradedBy: "u-manager-nontech",
    comments: "Strong portfolio.",
  });
  check("POST /grades action=rubric -> 200 + GREEN saved", rubric.status === 200 && rubric.json?.rubricGrade?.grade === "GREEN", rubric);

  const bulk = await call("POST", "/grades", { action: "bulkShortlistGreen", societyId: nonTechApp.societyId });
  check(
    "POST /grades action=bulkShortlistGreen -> includes our application",
    bulk.status === 200 && bulk.json?.shortlistedApplicationIds?.includes(nonTechAppId),
    bulk
  );

  const shortlist = await call("POST", "/grades", { action: "shortlist", applicationId: techAppId });
  check("POST /grades action=shortlist -> 200 + Shortlisted", shortlist.status === 200 && shortlist.json?.application?.status === "Shortlisted", shortlist);

  // 8. slots GET + book (double-booking prevention)
  const availableSlots = await call("GET", "/slots?status=available");
  check("GET /slots?status=available -> 200 + has slots", availableSlots.status === 200 && availableSlots.json?.slots?.length > 0, availableSlots);

  const targetSlot = availableSlots.json.slots[0];
  const firstBook = await call("POST", "/slots/book", { slotId: targetSlot.id, applicationId: techAppId });
  check("POST /slots/book first attempt -> 200 + booked", firstBook.status === 200 && firstBook.json?.slot?.status === "booked", firstBook);

  const secondBook = await call("POST", "/slots/book", { slotId: targetSlot.id, applicationId: nonTechAppId });
  check("POST /slots/book same slot again -> 409 (no double booking)", secondBook.status === 409, secondBook);

  // 9. events GET + register (idempotent)
  const events = await call("GET", "/events");
  check("GET /events -> 200 + has events", events.status === 200 && events.json?.events?.length > 0, events);

  const eventId = events.json.events[0].id;
  const firstRegister = await call("POST", "/events/register", { eventId, studentId: "u-student-1" });
  check("POST /events/register first time -> registered", firstRegister.status === 200 && firstRegister.json?.alreadyRegistered === false, firstRegister);

  const secondRegister = await call("POST", "/events/register", { eventId, studentId: "u-student-1" });
  check("POST /events/register same student again -> alreadyRegistered:true", secondRegister.status === 200 && secondRegister.json?.alreadyRegistered === true, secondRegister);

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("Verification script crashed:", err);
  process.exit(1);
});
