import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import AppShell from './components/AppShell';
import ChecklistPage from './pages/ChecklistPage';
import ToolsPage from './pages/ToolsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import StoryHubPage from './pages/story/StoryHubPage';
import ReframePage from './pages/story/ReframePage';
import LedgerPage from './pages/story/LedgerPage';
import PillarsPage from './pages/story/PillarsPage';
import './story.css';
import { initGlobalButtonSounds } from './utils/audio';

const PageTransition = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.3 }}
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
          <Route path="/" element={<Navigate to="/checklist" replace />} />
          <Route path="/checklist" element={<PageTransition><ChecklistPage /></PageTransition>} />
          <Route path="/tools" element={<PageTransition><ToolsPage /></PageTransition>} />
          <Route path="/analytics" element={<PageTransition><AnalyticsPage /></PageTransition>} />
          <Route path="/story" element={<PageTransition><StoryHubPage /></PageTransition>} />
          <Route path="/story/reframe" element={<PageTransition><ReframePage /></PageTransition>} />
          <Route path="/story/ledger" element={<PageTransition><LedgerPage /></PageTransition>} />
          <Route path="/story/pillars" element={<PageTransition><PillarsPage /></PageTransition>} />
          <Route path="*" element={<Navigate to="/checklist" replace />} />
        </Routes>
      </AnimatePresence>
    </AppShell>
  );
}
