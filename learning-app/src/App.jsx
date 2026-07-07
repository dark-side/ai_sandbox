import React, { useState, useCallback, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CURRICULUM } from './data/curriculum.js';
import { useProgress } from './store/progress.js';
import TopBar from './components/TopBar.jsx';
import Sidebar from './components/Sidebar.jsx';
import WelcomeView from './components/WelcomeView.jsx';
import SectionView from './components/SectionView.jsx';

const THEMES = [
  { id: 'light', label: 'Light' },
  { id: 'dark',  label: 'Dark'  },
];

const PAGE_TRANSITION = {
  duration: 0.24,
  ease: [0.4, 0, 0.2, 1],
};

function getInitialTheme() {
  try { return localStorage.getItem('payflow-theme') || 'light'; } catch { return 'light'; }
}

async function fetchExercise(sectionId) {
  const [exRes, solRes] = await Promise.all([
    fetch(`/api/exercise/${sectionId}`),
    fetch(`/api/solution/${sectionId}`),
  ]);
  const ex  = await exRes.json();
  const sol = await solRes.json();
  return {
    readme:        ex.readme  || '',
    hintsMarkdown: ex.hints   || '',
    solutionFiles: sol.files  || [],
  };
}

export default function App() {
  const [theme, setTheme] = useState(getInitialTheme);
  const [currentId, setCurrentId] = useState(null);
  const [cache, setCache] = useState({});
  const [loading, setLoading] = useState(false);
  const [navDirection, setNavDirection] = useState(0);
  const prevIdxRef = useRef(-1);

  const progress = useProgress();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('payflow-theme', theme); } catch { /**/ }
  }, [theme]);

  useEffect(() => {
    const readHash = () => {
      const hash = window.location.hash.replace('#', '');
      const valid = CURRICULUM.some(s => s.id === hash);
      setCurrentId(valid ? hash : null);
    };
    readHash();
    window.addEventListener('hashchange', readHash);
    return () => window.removeEventListener('hashchange', readHash);
  }, []);

  useEffect(() => {
    if (!currentId || cache[currentId]) return;
    setLoading(true);
    fetchExercise(currentId)
      .then(data => setCache(prev => ({ ...prev, [currentId]: data })))
      .catch(() => setCache(prev => ({
        ...prev,
        [currentId]: { readme: '', hintsMarkdown: '', solutionFiles: [] },
      })))
      .finally(() => setLoading(false));
  }, [currentId, cache]);

  const currentIdx = currentId
    ? CURRICULUM.findIndex(s => s.id === currentId)
    : -1;

  useEffect(() => {
    if (currentIdx < 0) {
      prevIdxRef.current = -1;
      return;
    }
    if (prevIdxRef.current >= 0 && prevIdxRef.current !== currentIdx) {
      setNavDirection(currentIdx > prevIdxRef.current ? 1 : -1);
    }
    prevIdxRef.current = currentIdx;
  }, [currentIdx]);

  const navigateTo = useCallback((sectionId) => {
    if (sectionId === null) {
      window.location.hash = '';
      setCurrentId(null);
    } else {
      window.location.hash = sectionId;
      setCurrentId(sectionId);
    }
  }, []);

  const currentMeta = CURRICULUM.find(s => s.id === currentId) || null;

  const goNext = useCallback(() => {
    if (currentIdx < CURRICULUM.length - 1) navigateTo(CURRICULUM[currentIdx + 1].id);
  }, [currentIdx, navigateTo]);

  const goPrev = useCallback(() => {
    if (currentIdx > 0) navigateTo(CURRICULUM[currentIdx - 1].id);
    else navigateTo(null);
  }, [currentIdx, navigateTo]);

  const pageVariants = {
    enter: (dir) => ({
      opacity: 0,
      x: dir === 0 ? 0 : dir > 0 ? 20 : -20,
      y: dir === 0 ? 8 : 0,
    }),
    center: { opacity: 1, x: 0, y: 0 },
    exit: (dir) => ({
      opacity: 0,
      x: dir === 0 ? 0 : dir > 0 ? -20 : 20,
      y: dir === 0 ? -8 : 0,
    }),
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'hidden',
      background: 'var(--bg)',
      color: 'var(--text)',
    }}>
      <TopBar
        theme={theme}
        themes={THEMES}
        onThemeChange={setTheme}
        completedCount={progress.completedCount}
        total={CURRICULUM.length}
        onLogoClick={() => navigateTo(null)}
      />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar
          sections={CURRICULUM}
          currentId={currentId}
          completed={progress.completed}
          onSelect={navigateTo}
        />

        <main style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          <AnimatePresence mode="wait" custom={navDirection}>
            {currentId === null ? (
              <motion.div
                key="welcome"
                custom={0}
                variants={pageVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={PAGE_TRANSITION}
                style={{ height: '100%' }}
              >
                <WelcomeView
                  sections={CURRICULUM}
                  completed={progress.completed}
                  completedCount={progress.completedCount}
                  onSelect={navigateTo}
                />
              </motion.div>
            ) : (
              <motion.div
                key={currentId}
                custom={navDirection}
                variants={pageVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={PAGE_TRANSITION}
                style={{ height: '100%' }}
              >
                <SectionView
                  meta={currentMeta}
                  data={cache[currentId]}
                  loading={loading}
                  progress={progress}
                  currentIdx={currentIdx}
                  total={CURRICULUM.length}
                  onNext={goNext}
                  onPrev={goPrev}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
