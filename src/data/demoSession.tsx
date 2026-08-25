/**
 * Demo session (design.md sec. 7.5 / 10.5) — replaces real auth in the demo.
 * Stores the active demo role in localStorage under `shs-role`.
 * `null` = visitor (not "logged in").
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Role } from './types';

const STORAGE_KEY = 'shs-role';

/** Fictional demo persona shown in the navbar for each role. */
export const demoPersonas: Record<Role, { name: string; org?: string }> = {
  athlete: { name: 'Erick Semedo', org: 'Atlético Achada' },
  guardian: { name: 'Lúcia Semedo' },
  club: { name: 'Atlético Achada' },
  scout: { name: 'Carlos Moniz', org: 'Horizonte Scouting' },
  coach: { name: 'Paulo Andrade', org: 'Atlético Achada' },
  organizer: { name: 'ADEP — Inter Liceu' },
  federation: { name: 'Federação Insular (demo)' },
  intlClub: { name: 'CD Lusitano do Vale (demo)' },
  sponsor: { name: 'Marca Parceira A' },
  admin: { name: 'Admin SportHubCV' },
};

/** Where each role lands when selected. */
export function roleDashboardPath(role: Role): string {
  switch (role) {
    case 'athlete':
      return '/dashboard/athlete';
    case 'scout':
      return '/dashboard/scout';
    case 'club':
      return '/dashboard/club';
    case 'organizer':
      return '/dashboard/organizer';
    case 'sponsor':
      return '/dashboard/sponsor';
    case 'admin':
      return '/admin';
    default:
      return '/discover';
  }
}

interface DemoSessionValue {
  role: Role | null;
  setRole: (r: Role | null) => void;
  isLoggedIn: boolean;
  persona: { name: string; org?: string } | null;
}

const DemoSessionContext = createContext<DemoSessionValue | null>(null);

function initialRole(): Role | null {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && stored in demoPersonas) return stored as Role;
  } catch {
    /* ignore */
  }
  return null;
}

export function DemoSessionProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role | null>(initialRole);

  useEffect(() => {
    try {
      if (role) window.localStorage.setItem(STORAGE_KEY, role);
      else window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, [role]);

  const setRole = useCallback((r: Role | null) => setRoleState(r), []);

  const value = useMemo<DemoSessionValue>(
    () => ({
      role,
      setRole,
      isLoggedIn: role !== null,
      persona: role ? demoPersonas[role] : null,
    }),
    [role, setRole],
  );

  return <DemoSessionContext.Provider value={value}>{children}</DemoSessionContext.Provider>;
}

export function useDemoSession(): DemoSessionValue {
  const ctx = useContext(DemoSessionContext);
  if (!ctx) throw new Error('useDemoSession must be used inside <DemoSessionProvider>');
  return ctx;
}
