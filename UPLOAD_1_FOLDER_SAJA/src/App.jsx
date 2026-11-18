import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { sfx } from './lib/soundEffects';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { MobileNav } from './components/layout/MobileNav';
import { PetCatCompanion } from './components/ai/PetCatCompanion';
import { BrandLogo } from './components/ui/BrandLogo';
import { IntroSplash } from './components/auth/IntroSplash';

import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Jobs from './pages/Jobs';
import JobDetail from './pages/JobDetail';
import PrepStudio from './pages/PrepStudio';
import Applications from './pages/Applications';
import InternPortal from './pages/InternPortal';
import Profile from './pages/Profile';

class PageErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidUpdate(prevProps) {
    if (prevProps.pathname !== this.props.pathname && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 my-8 rounded-3xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-white/15 text-center max-w-lg mx-auto space-y-4 shadow-xl">
          <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white">
            Halaman sedang dimuat ulang
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Klik tombol di bawah untuk menyegarkan tampilan halaman ini.
          </p>
          <button
            type="button"
            onClick={() => {
              this.setState({ hasError: false });
              window.location.reload();
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-gradient text-white text-xs font-bold shadow-md"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Muat Ulang Halaman</span>
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function AuroraBackgroundCanvas() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 aurora-canvas transition-colors duration-300">
      {/* Subtle Modern Dot Matrix Overlay */}
      <div
        className="absolute inset-0 opacity-[0.22] dark:opacity-[0.14]"
        style={{
          backgroundImage:
            'radial-gradient(rgba(99, 102, 241, 0.28) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />
    </div>
  );
}

function ProtectedShell() {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center gap-4">
        <BrandLogo size="lg" animated />
        <p className="text-sm font-display font-bold text-slate-700 dark:text-slate-200">
          Memuat MagangHub...
        </p>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/masuk" replace />;
  }

  return (
    <div className="relative z-10 min-h-screen flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 px-4 sm:px-6 pt-3 pb-24 lg:pb-10 max-w-7xl w-full mx-auto">
          <PageErrorBoundary pathname={location.pathname}>
            <Outlet />
          </PageErrorBoundary>
        </main>
      </div>
      <MobileNav />
      <PetCatCompanion />
    </div>
  );
}

function AppRoutes() {
  const { session } = useAuth();

  return (
    <div className="relative z-10 min-h-screen">
      <Routes>
        <Route
          path="/masuk"
          element={session ? <Navigate to="/" replace /> : <Auth />}
        />
        <Route
          path="/daftar"
          element={session ? <Navigate to="/" replace /> : <Auth />}
        />
        <Route element={<ProtectedShell />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/lowongan" element={<Jobs />} />
          <Route path="/lowongan/:id" element={<JobDetail />} />
          <Route path="/persiapan" element={<PrepStudio />} />
          <Route path="/lamaran" element={<Applications />} />
          <Route path="/portal-magang" element={<InternPortal />} />
          <Route path="/profil" element={<Profile />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default function App() {
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    const onGlobalPointerDown = () => sfx.unlockAudio();
    const onGlobalClick = (e) => sfx.handleGlobalInteraction(e);
    const onGlobalKeyDown = (e) => sfx.handleGlobalKeyDown(e);
    const onReplayIntro = () => setShowIntro(true);
    document.addEventListener('pointerdown', onGlobalPointerDown, true);
    document.addEventListener('click', onGlobalClick, true);
    document.addEventListener('keydown', onGlobalKeyDown, true);
    window.addEventListener('mh-replay-intro', onReplayIntro);
    return () => {
      document.removeEventListener('pointerdown', onGlobalPointerDown, true);
      document.removeEventListener('click', onGlobalClick, true);
      document.removeEventListener('keydown', onGlobalKeyDown, true);
      window.removeEventListener('mh-replay-intro', onReplayIntro);
    };
  }, []);

  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <AppProvider>
            <BrowserRouter>
              {showIntro && (
                <IntroSplash onFinish={() => setShowIntro(false)} />
              )}
              <AuroraBackgroundCanvas />
              <AppRoutes />
            </BrowserRouter>
          </AppProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
