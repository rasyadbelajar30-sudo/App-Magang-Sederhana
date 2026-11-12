import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from './AuthContext';

const AppContext = createContext({
  user: null,
  readiness: { score: 0, breakdown: [] },
  level: { lvl: 1, name: 'Pendatang Baru', min: 0, next_min: 150, progress_pct: 0 },
  docs: [],
  applications: [],
  sims: [],
  loading: false,
  refresh: async () => {},
  updateUserState: () => {},
});

export function AppProvider({ children }) {
  const { session } = useAuth();
  const [user, setUser] = useState(null);
  const [readiness, setReadiness] = useState({ score: 0, breakdown: [] });
  const [level, setLevel] = useState({
    lvl: 1,
    name: 'Pendatang Baru',
    min: 0,
    next_min: 150,
    progress_pct: 0,
  });
  const [docs, setDocs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [sims, setSims] = useState([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!session) {
      setUser(null);
      setDocs([]);
      setApplications([]);
      setSims([]);
      return;
    }

    setLoading(true);
    try {
      const [userRes, docsRes, appsRes, simsRes] = await Promise.all([
        api.get('/user'),
        api.get('/documents'),
        api.get('/applications'),
        api.get('/prep'),
      ]);

      if (userRes?.user) setUser(userRes.user);
      if (userRes?.readiness) setReadiness(userRes.readiness);
      if (userRes?.level) setLevel(userRes.level);
      if (Array.isArray(docsRes)) setDocs(docsRes);
      if (Array.isArray(appsRes)) setApplications(appsRes);
      if (Array.isArray(simsRes)) setSims(simsRes);
    } catch (err) {
      console.error('[AppContext refresh error]', err);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const updateUserState = useCallback((payload = {}) => {
    if (payload.user) setUser(payload.user);
    if (payload.readiness) setReadiness(payload.readiness);
    if (payload.level) setLevel(payload.level);
    if (payload.xp?.level) setLevel(payload.xp.level);
  }, []);

  const hasAcceptedInternship = applications.some((a) => a.status === 'ACCEPTED_ONBOARDING');
  const activeApplicationsCount = applications.filter((a) => a.status !== 'REJECTED').length;

  return (
    <AppContext.Provider
      value={{
        user,
        readiness,
        level,
        docs,
        applications,
        sims,
        loading,
        hasAcceptedInternship,
        activeApplicationsCount,
        refresh,
        updateUserState,
        setDocs,
        setApplications,
        setSims,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
