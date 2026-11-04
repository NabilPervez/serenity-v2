import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import AppShell from './components/AppShell';
import ChecklistPage from './pages/ChecklistPage';
import SosPage from './pages/SosPage';
import AnalyticsPage from './pages/AnalyticsPage';
import StoryHubPage from './pages/story/StoryHubPage';
import ReframePage from './pages/story/ReframePage';
import LedgerPage from './pages/story/LedgerPage';
import PillarsPage from './pages/story/PillarsPage';
import PracticePage from './pages/present/PracticePage';
import QuickReframePage from './pages/story/QuickReframePage';
import './story.css';
import { initGlobalButtonSounds } from './utils/audio';

const PageTransition = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    className="page-transition-wrapper"
    style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
  >
    {children}
  </motion.div>
);

export default function App() {
  const location = useLocation();

  useEffect(() => {
    const cleanup = initGlobalButtonSounds();
    return cleanup;
  }, []);

  return (
    <AppShell>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Navigate to="/today" replace />} />
          <Route path="/today" element={<PageTransition><ChecklistPage /></PageTransition>} />
          <Route path="/practice" element={<PageTransition><PracticePage /></PageTransition>} />
          <Route path="/reflect" element={<PageTransition><StoryHubPage /></PageTransition>} />
          <Route path="/reflect/quick" element={<PageTransition><QuickReframePage /></PageTransition>} />
          <Route path="/reflect/reframe" element={<PageTransition><ReframePage /></PageTransition>} />
          <Route path="/reflect/ledger" element={<PageTransition><LedgerPage /></PageTransition>} />
          <Route path="/reflect/pillars" element={<PageTransition><PillarsPage /></PageTransition>} />
          <Route path="/progress" element={<PageTransition><AnalyticsPage /></PageTransition>} />
          <Route path="/sos" element={<PageTransition><SosPage /></PageTransition>} />
          {/* Old routes → new IA (2026-11-03) */}
          <Route path="/checklist" element={<Navigate to="/today" replace />} />
          <Route path="/present" element={<Navigate to="/practice" replace />} />
          <Route path="/tools" element={<Navigate to="/practice" replace />} />
          <Route path="/analytics" element={<Navigate to="/progress" replace />} />
          <Route path="/story" element={<Navigate to="/reflect" replace />} />
          <Route path="/story/:sub" element={<Navigate to="/reflect" replace />} />
          <Route path="*" element={<Navigate to="/today" replace />} />
        </Routes>
      </AnimatePresence>
    </AppShell>
  );
}
