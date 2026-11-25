import type {
  Application,
  CampusEvent,
  InterviewSlot,
  Society,
  User,
} from "./types";

export const users: User[] = [
  {
    id: "u-student-1",
    name: "Aarav Mehta",
    email: "aarav.mehta@thapar.edu",
    role: "student",
    rollNo: "102203045",
    avatarColor: "mint",
  },
  {
    id: "u-manager-tech",
    name: "Riya Kapoor",
    email: "riya.kapoor@thapar.edu",
    role: "manager",
    societyId: "soc-codecell",
    avatarColor: "coral",
  },
  {
    id: "u-manager-nontech",
    name: "Devansh Sethi",
    email: "devansh.sethi@thapar.edu",
    role: "manager",
    societyId: "soc-enactus",
    avatarColor: "amber",
  },
];

export const societies: Society[] = [
  {
    id: "soc-codecell",
    name: "CodeCell",
    tagline: "Build. Ship. Repeat.",
    description:
      "Thapar's competitive programming & software development society. We run hackathons, DSA bootcamps, and ship real products for campus.",
    type: "TECH",
    icon: "Code",
    memberCount: 142,
    managerId: "u-manager-tech",
    accent: "mint",
  },
  {
    id: "soc-robotics",
    name: "Robotics Society",
    tagline: "Where circuits meet ambition.",
    description:
      "Design and build autonomous bots, compete at national robotics championships, and get hands-on with embedded systems.",
    type: "TECH",
    icon: "Cpu",
    memberCount: 88,
    managerId: "u-manager-tech",
    accent: "mint",
  },
  {
    id: "soc-enactus",
    name: "Enactus Thapar",
    tagline: "Entrepreneurial action for social good.",
    description:
      "We design and run social enterprises tackling real-world problems — from sustainable packaging to rural fintech.",
    type: "NON_TECH",
    icon: "Sprout",
    memberCount: 65,
    managerId: "u-manager-nontech",
    accent: "coral",
  },
  {
    id: "soc-litsoc",
    name: "Literary Society",
    tagline: "Words that move people.",
    description:
      "Debate, spoken word, creative writing and publishing. Home to Thapar's annual literary fest.",
    type: "NON_TECH",
    icon: "BookOpen",
    memberCount: 54,
    managerId: "u-manager-nontech",
    accent: "amber",
  },
  {
    id: "soc-dramatics",
    name: "Dramatics Club",
    tagline: "All the campus is a stage.",
    description:
      "Theatre, street plays, and stage production. We stage 4 major productions a year including the annual Thespian Night.",
    type: "NON_TECH",
    icon: "Drama",
    memberCount: 47,
    managerId: "u-manager-nontech",
    accent: "coral",
  },
  {
    id: "soc-designwing",
    name: "Design Wing",
    tagline: "Pixel-perfect, always.",
    description:
      "UI/UX, branding, and motion design for every fest and society on campus. We're the reason posters don't look like Comic Sans.",
    type: "TECH",
    icon: "Palette",
    memberCount: 39,
    managerId: "u-manager-tech",
    accent: "mint",
  },
];

export const events: CampusEvent[] = [
  {
    id: "ev-1",
    societyId: "soc-codecell",
    title: "CodeCell Recruitment Info Session",
    date: "2026-09-11",
    time: "5:00 PM",
    venue: "LT-1, Academic Block",
    description:
      "Meet the core team, learn about the proctored assessment format, and get your questions answered before applying.",
  },
  {
    id: "ev-2",
    societyId: "soc-robotics",
    title: "Robotics Society Open Workshop",
    date: "2026-09-13",
    time: "3:30 PM",
    venue: "Robotics Lab, Mechanical Block",
    description: "Hands-on Arduino workshop, open to all interested recruits.",
  },
  {
    id: "ev-3",
    societyId: "soc-enactus",
    title: "Enactus Idea Pitch Night",
    date: "2026-09-12",
    time: "6:00 PM",
    venue: "Seminar Hall, Block C",
    description:
      "Current members pitch ongoing social enterprise projects. Great chance to see the society in action.",
  },
  {
    id: "ev-4",
    societyId: "soc-litsoc",
    title: "Open Mic & Recruitment Mixer",
    date: "2026-09-14",
    time: "7:00 PM",
    venue: "Amphitheatre",
    description: "Spoken word, poetry, and an informal chat with the Lit Soc panel.",
  },
  {
    id: "ev-5",
    societyId: "soc-dramatics",
    title: "Dramatics Club Auditions",
    date: "2026-09-15",
    time: "4:00 PM",
    venue: "Auditorium Green Room",
    description: "Cold-read auditions for the winter production. Walk-ins welcome.",
  },
  {
    id: "ev-6",
    societyId: "soc-designwing",
    title: "Design Wing Portfolio Review",
    date: "2026-09-16",
    time: "2:00 PM",
    venue: "Design Studio, Block A",
    description: "Bring a laptop or printed portfolio for a quick 1:1 review with the leads.",
  },
];

export const applications: Application[] = [
  {
    id: "app-1",
    studentId: "u-student-1",
    studentName: "Aarav Mehta",
    studentRollNo: "102203045",
    societyId: "soc-robotics",
    type: "TECH",
    status: "Assessed",
    submittedAt: "2026-09-05",
    score: 82,
  },
  {
    id: "app-2",
    studentId: "u-student-1",
    studentName: "Aarav Mehta",
    studentRollNo: "102203045",
    societyId: "soc-litsoc",
    type: "NON_TECH",
    status: "Shortlisted",
    submittedAt: "2026-09-04",
    grade: "GREEN",
    formAnswers: [
      { question: "Why do you want to join Literary Society?", answer: "I've been writing spoken word poetry for 3 years and want a stage to perform and grow." },
      { question: "Share a writing sample or past work.", answer: "Link: personal blog - 'Monsoon Diaries' series." },
    ],
  },
  // Seed applicants for the manager grading tables (Tech: CodeCell / Robotics / Design Wing)
  { id: "app-3", studentId: "seed-1", studentName: "Simran Chawla", studentRollNo: "102203012", societyId: "soc-codecell", type: "TECH", status: "Assessed", submittedAt: "2026-09-03", score: 91 },
  { id: "app-4", studentId: "seed-2", studentName: "Karan Bhatia", studentRollNo: "102203078", societyId: "soc-codecell", type: "TECH", status: "Assessed", submittedAt: "2026-09-03", score: 64 },
  { id: "app-5", studentId: "seed-3", studentName: "Ananya Iyer", studentRollNo: "102203099", societyId: "soc-codecell", type: "TECH", status: "Shortlisted", submittedAt: "2026-09-02", score: 88 },
  { id: "app-6", studentId: "seed-4", studentName: "Yash Malhotra", studentRollNo: "102203123", societyId: "soc-codecell", type: "TECH", status: "Assessed", submittedAt: "2026-09-04", score: 47 },
  { id: "app-7", studentId: "seed-5", studentName: "Priya Nair", studentRollNo: "102203056", societyId: "soc-robotics", type: "TECH", status: "Assessed", submittedAt: "2026-09-03", score: 73 },
  { id: "app-8", studentId: "seed-6", studentName: "Rohan Gupta", studentRollNo: "102203031", societyId: "soc-designwing", type: "TECH", status: "Assessed", submittedAt: "2026-09-05", score: 79 },
  // Seed applicants for the manager grading tables (Non-Tech: Enactus / Lit Soc / Dramatics)
  {
    id: "app-9", studentId: "seed-7", studentName: "Meher Grover", studentRollNo: "102203067", societyId: "soc-enactus", type: "NON_TECH", status: "Pending", submittedAt: "2026-09-04", grade: null,
    formAnswers: [
      { question: "Why do you want to join Enactus?", answer: "I ran a small campus recycling drive last year and want to scale similar ideas with a team." },
      { question: "Describe a problem you'd want Enactus to tackle.", answer: "Food wastage in the campus mess halls." },
    ],
  },
  {
    id: "app-10", studentId: "seed-8", studentName: "Ishaan Verma", studentRollNo: "102203088", societyId: "soc-enactus", type: "NON_TECH", status: "Pending", submittedAt: "2026-09-05", grade: null,
    formAnswers: [
      { question: "Why do you want to join Enactus?", answer: "Interested in social entrepreneurship as a career, want practical exposure." },
      { question: "Describe a problem you'd want Enactus to tackle.", answer: "Access to affordable menstrual hygiene products in nearby villages." },
    ],
  },
  {
    id: "app-11", studentId: "seed-9", studentName: "Tanvi Rao", studentRollNo: "102203109", societyId: "soc-dramatics", type: "NON_TECH", status: "Pending", submittedAt: "2026-09-03", grade: null,
    formAnswers: [
      { question: "Past acting/theatre experience?", answer: "Lead role in school production of 'A Midsummer Night's Dream'." },
      { question: "Why Dramatics Club?", answer: "Want to keep performing and try direction too." },
    ],
  },
  {
    id: "app-12", studentId: "seed-10", studentName: "Arjun Sinha", studentRollNo: "102203114", societyId: "soc-litsoc", type: "NON_TECH", status: "Pending", submittedAt: "2026-09-02", grade: null,
    formAnswers: [
      { question: "Why do you want to join Literary Society?", answer: "I write short fiction and want feedback from a community of writers." },
      { question: "Share a writing sample or past work.", answer: "Attached: 'The Last Local' — a short story, 1200 words." },
    ],
  },
];

export const interviewSlots: InterviewSlot[] = [];
