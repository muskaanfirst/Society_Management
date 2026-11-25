"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { PersonaResult, User } from "./types";

const STORAGE_KEY = "socmag_state_v1";

interface PersistedState {
  currentUser: User | null;
  personaResult: PersonaResult | null;
}

function defaultState(): PersistedState {
  return { currentUser: null, personaResult: null };
}

interface AppContextValue {
  currentUser: User | null;
  personaResult: PersonaResult | null;
  ready: boolean;
  login: (user: User) => void;
  logout: () => void;
  savePersonaResult: (result: PersonaResult) => void;
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
        // localStorage doesn't exist during SSR, so it can only be read after
        // mount; this one-time setState swaps the SSR'd default state for the
        // persisted one and is the documented exception to this rule.
        // eslint-disable-next-line react-hooks/set-state-in-effect
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

  const value: AppContextValue = {
    currentUser: state.currentUser,
    personaResult: state.personaResult,
    ready,

    login: (user) => setState((s) => ({ ...s, currentUser: user })),

    logout: () => setState(defaultState),

    savePersonaResult: (result) =>
      setState((s) => ({ ...s, personaResult: result })),
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
