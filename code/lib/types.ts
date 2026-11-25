export type Role = "student" | "manager";

export type SocietyType = "TECH" | "NON_TECH";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  rollNo?: string;
  societyId?: string; // for managers: the society they run
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
}

export interface CampusEvent {
  id: string;
  societyId: string;
  title: string;
  date: string; // ISO yyyy-mm-dd
  time: string;
  venue: string;
  description: string;
}

export type ApplicationStatus =
  | "Pending"
  | "Assessed"
  | "Shortlisted"
  | "Interview_Booked"
  | "Rejected";

export type Grade = "RED" | "YELLOW" | "GREEN" | null;

export interface Application {
  id: string;
  studentId: string; // real User id, or a synthetic seed id for demo applicants
  studentName: string;
  studentRollNo: string;
  societyId: string;
  type: SocietyType;
  status: ApplicationStatus;
  submittedAt: string;
  score?: number; // tech: automated assessment score (0-100)
  formAnswers?: { question: string; answer: string }[]; // non-tech
  grade?: Grade; // non-tech manager grading
}

export interface InterviewSlot {
  id: string;
  applicationId: string;
  studentId: string;
  societyId: string;
  date: string;
  time: string;
  venue: string;
}

export interface PersonaResult {
  archetype: string;
  description: string;
  topSkills: string[];
  matchScore: number;
  recommendedSocietyIds: string[];
}
