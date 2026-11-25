"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  applications as seedApplications,
  interviewSlots as seedInterviewSlots,
  users,
} from "./mockData";
import type {
  Application,
  ApplicationStatus,
  Grade,
  InterviewSlot,
  PersonaResult,
  Role,
  User,
} from "./types";

const STORAGE_KEY = "socmag_state_v1";

interface PersistedState {
  currentUserId: string | null;
  applications: Application[];
  interviewSlots: InterviewSlot[];
  personaResults: Record<string, PersonaResult>;
}

function defaultState(): PersistedState {
  return {
    currentUserId: null,
    applications: seedApplications,
    interviewSlots: seedInterviewSlots,
    personaResults: {},
  };
}

interface AppContextValue {
  currentUser: User | null;
  applications: Application[];
  interviewSlots: InterviewSlot[];
  personaResult: PersonaResult | null;
  ready: boolean;
  loginAs: (role: Role) => User;
  logout: () => void;
  submitTechAssessment: (societyId: string) => Application;
  submitNonTechForm: (
    societyId: string,
    answers: { question: string; answer: string }[]
  ) => Application;
  bookInterview: (
    applicationId: string,
    slot: { date: string; time: string; venue: string }
  ) => void;
  gradeApplication: (applicationId: string, grade: Grade) => void;
  shortlistApplication: (applicationId: string) => void;
  bulkShortlistGreens: (societyId: string) => void;
  saveQuizResult: (result: PersonaResult) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistedState>(defaultState);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as PersistedState;
        setState(parsed);
      }
    } catch {
      // ignore corrupt storage, fall back to defaults
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, ready]);

  const currentUser = useMemo(
    () => users.find((u) => u.id === state.currentUserId) ?? null,
    [state.currentUserId]
  );

  const value: AppContextValue = {
    currentUser,
    applications: state.applications,
    interviewSlots: state.interviewSlots,
    personaResult: currentUser ? state.personaResults[currentUser.id] ?? null : null,
    ready,

    loginAs: (role) => {
      const user = users.find((u) => u.role === role)!;
      setState((s) => ({ ...s, currentUserId: user.id }));
      return user;
    },

    logout: () => setState((s) => ({ ...s, currentUserId: null })),

    submitTechAssessment: (societyId) => {
      const score = Math.floor(Math.random() * 36) + 60; // 60-95
      const status: ApplicationStatus = score >= 75 ? "Shortlisted" : "Assessed";
      let created!: Application;
      setState((s) => {
        const existingIdx = s.applications.findIndex(
          (a) => a.studentId === currentUser?.id && a.societyId === societyId
        );
        const base: Application = {
          id: existingIdx >= 0 ? s.applications[existingIdx].id : `app-${crypto.randomUUID()}`,
          studentId: currentUser?.id ?? "",
          studentName: currentUser?.name ?? "",
          studentRollNo: currentUser?.rollNo ?? "",
          societyId,
          type: "TECH",
          status,
          submittedAt: new Date().toISOString().slice(0, 10),
          score,
        };
        created = base;
        const nextApps =
          existingIdx >= 0
            ? s.applications.map((a, i) => (i === existingIdx ? base : a))
            : [...s.applications, base];
        return { ...s, applications: nextApps };
      });
      return created;
    },

    submitNonTechForm: (societyId, answers) => {
      let created!: Application;
      setState((s) => {
        const existingIdx = s.applications.findIndex(
          (a) => a.studentId === currentUser?.id && a.societyId === societyId
        );
        const base: Application = {
          id: existingIdx >= 0 ? s.applications[existingIdx].id : `app-${crypto.randomUUID()}`,
          studentId: currentUser?.id ?? "",
          studentName: currentUser?.name ?? "",
          studentRollNo: currentUser?.rollNo ?? "",
          societyId,
          type: "NON_TECH",
          status: "Pending",
          submittedAt: new Date().toISOString().slice(0, 10),
          formAnswers: answers,
          grade: null,
        };
        created = base;
        const nextApps =
          existingIdx >= 0
            ? s.applications.map((a, i) => (i === existingIdx ? base : a))
            : [...s.applications, base];
        return { ...s, applications: nextApps };
      });
      return created;
    },

    bookInterview: (applicationId, slot) => {
      setState((s) => {
        const app = s.applications.find((a) => a.id === applicationId);
        if (!app) return s;
        const newSlot: InterviewSlot = {
          id: `slot-${crypto.randomUUID()}`,
          applicationId,
          studentId: app.studentId,
          societyId: app.societyId,
          ...slot,
        };
        return {
          ...s,
          interviewSlots: [...s.interviewSlots, newSlot],
          applications: s.applications.map((a) =>
            a.id === applicationId ? { ...a, status: "Interview_Booked" as ApplicationStatus } : a
          ),
        };
      });
    },

    gradeApplication: (applicationId, grade) => {
      setState((s) => ({
        ...s,
        applications: s.applications.map((a) =>
          a.id === applicationId ? { ...a, grade } : a
        ),
      }));
    },

    shortlistApplication: (applicationId) => {
      setState((s) => ({
        ...s,
        applications: s.applications.map((a) =>
          a.id === applicationId ? { ...a, status: "Shortlisted" as ApplicationStatus } : a
        ),
      }));
    },

    bulkShortlistGreens: (societyId) => {
      setState((s) => ({
        ...s,
        applications: s.applications.map((a) =>
          a.societyId === societyId && a.grade === "GREEN"
            ? { ...a, status: "Shortlisted" as ApplicationStatus }
            : a
        ),
      }));
    },

    saveQuizResult: (result) => {
      if (!currentUser) return;
      setState((s) => ({
        ...s,
        personaResults: { ...s.personaResults, [currentUser.id]: result },
      }));
    },
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
