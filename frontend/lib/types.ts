export type Role = "student" | "manager";

export type SocietyType = "TECH" | "NON_TECH";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  rollNo?: string;
  avatarColor: string;
}

export interface Society {
  id: string;
  name: string;
  tagline: string;
  description: string;
  type: SocietyType;
  icon: string; // lucide-react icon name
  memberCount: number;
  managerId: string;
  accent: "mint" | "coral" | "amber";
  idealPersona?: Record<string, number>;
}

export interface CampusEvent {
  id: number;
  societyId: string;
  title: string;
  date: string; // ISO yyyy-mm-dd
  time: string; // "HH:MM:SS"
  venue: string;
  description: string;
  registrationCount?: number;
}

export type ApplicationStatus =
  | "Pending"
  | "Assessed"
  | "Shortlisted"
  | "Interview_Booked"
  | "Rejected";

export type Grade = "RED" | "YELLOW" | "GREEN" | null;

export interface FormAnswer {
  question: string;
  answer: string;
}

// A student's own view of one of their applications (GET /api/applications).
export interface MyApplication {
  id: number;
  societyId: string;
  status: ApplicationStatus;
  score?: number;
  formAnswers?: FormAnswer[];
  portfolioUrl?: string;
  submittedAt: string;
}

// Manager grading views (GET /api/grades?type=TECH|NON_TECH).
export interface TechGradeRow {
  applicationId: number;
  studentName: string;
  studentRollNo: string;
  societyId: string;
  status: ApplicationStatus;
  score: number | null;
  tabSwitchCount: number | null;
  focusLossDuration: number | null;
}

export interface NonTechGradeRow {
  applicationId: number;
  studentName: string;
  studentRollNo: string;
  societyId: string;
  status: ApplicationStatus;
  formAnswers: FormAnswer[] | null;
  portfolioUrl: string | null;
  grade: Grade;
  comments: string | null;
  gradedBy: string | null;
}

export interface InterviewSlot {
  id: number;
  date: string;
  time: string;
  venue: string;
  applicationId: number | null;
  status: "available" | "booked";
}

export interface PersonaResult {
  archetype: string;
  description: string;
  topSkills: string[];
  matchScore: number;
  recommendedSocietyIds: string[];
}
