import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { load, save } from './storage';
import type { AppData, Profile } from './types';

interface Store {
  data: AppData;
  setData: (fn: (d: AppData) => AppData) => void;
  profile: Profile | undefined;
  updateProfile: (fn: (p: Profile) => Profile) => void;
}

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setRaw] = useState<AppData>(load);

  useEffect(() => save(data), [data]);

  const setData = useCallback((fn: (d: AppData) => AppData) => setRaw((d) => fn(d)), []);

  const updateProfile = useCallback(
    (fn: (p: Profile) => Profile) =>
      setRaw((d) => ({ ...d, profiles: d.profiles.map((p) => (p.id === d.activeProfileId ? fn(p) : p)) })),
    [],
  );

  const profile = data.profiles.find((p) => p.id === data.activeProfileId);
  const value = useMemo(() => ({ data, setData, profile, updateProfile }), [data, setData, profile, updateProfile]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const s = useContext(Ctx);
  if (!s) throw new Error('useStore outside StoreProvider');
  return s;
}
