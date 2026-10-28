import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Sky from './components/Sky';
import type { Mood } from './components/Sky';
import ChapterShell from './components/ChapterShell';
import SettingsSheet from './components/SettingsSheet';
import Intro from './pages/Intro';
import Resume from './pages/Resume';
import Gate from './pages/Gate';
import Home from './pages/Home';
import Memories from './pages/Memories';
import Diary from './pages/Diary';
import Small from './pages/Small';
import LetterPage, { isLetterKey, letterMeta } from './pages/LetterPage';
import { chapters } from './data/siteConfig';
import type { ChapterId } from './data/types';
import { useProgress } from './hooks/useProgress';
import { routeKey, useHashRoute } from './hooks/useHashRoute';
import type { Route } from './hooks/useHashRoute';

type Stage = 'resume' | 'intro' | 'gate' | 'main';

const HOME: Route = { kind: 'home' };

function chapterMeta(id: ChapterId): { title: string; kicker?: string } {
  if (isLetterKey(id)) return letterMeta(id);
  const c = chapters.find((x) => x.id === id);
  return { title: c ? c.title : '', kicker: c ? c.blurb : undefined };
}

function ChapterBody({ id }: { id: ChapterId }) {
  if (isLetterKey(id)) return <LetterPage letterKey={id} />;
  if (id === 'memories') return <Memories />;
  if (id === 'diary') return <Diary />;
  return <Small />;
}

export default function App() {
  const { progress, markStarted, setUnlocked, setLastView, restartExperience, resetAll } = useProgress();
  const [stage, setStage] = useState<Stage>(() => (progress.started || progress.unlocked ? 'resume' : 'intro'));
  const [route, navigate] = useHashRoute();
  const [menuOpen, setMenuOpen] = useState(false);
  const [restoreId, setRestoreId] = useState<ChapterId | null>(null);

  useEffect(() => {
    document.title = 'Just For You';
  }, []);

  // ذخیرهٔ آخرین صفحه‌ای که دیده شده
  useEffect(() => {
    if (stage === 'main') setLastView(routeKey(route));
  }, [stage, route, setLastView]);

  // با عوض‌شدن فصل، حالت «بازیابی اسکرول» تمام می‌شود
  useEffect(() => {
    if (restoreId && !(route.kind === 'chapter' && route.id === restoreId)) setRestoreId(null);
  }, [route, restoreId]);

  useEffect(() => {
    if (stage === 'main' && route.kind === 'home') window.scrollTo({ top: 0, behavior: 'auto' });
  }, [stage, route]);

  const mood: Mood =
    stage === 'main' ? (route.kind === 'home' ? 'home' : 'chapter') : stage === 'gate' ? 'gate' : 'intro';

  const handleContinue = useCallback(() => {
    if (!progress.unlocked) {
      setStage('gate');
      return;
    }
    const last = progress.lastView;
    const target = chapters.find((c) => c.id === last);
    if (target) {
      setRestoreId(target.id);
      navigate({ kind: 'chapter', id: target.id });
    } else {
      navigate(HOME);
    }
    setStage('main');
  }, [progress.unlocked, progress.lastView, navigate]);

  const handleRestart = useCallback(() => {
    restartExperience();
    navigate(HOME);
    setStage('intro');
  }, [restartExperience, navigate]);

  const handleEnter = useCallback(() => {
    markStarted();
    setStage('gate');
  }, [markStarted]);

  const handleUnlock = useCallback(() => {
    setUnlocked(true);
    navigate(HOME);
    setStage('main');
  }, [setUnlocked, navigate]);

  const handleReset = useCallback(() => {
    resetAll();
    setMenuOpen(false);
    setRestoreId(null);
    navigate(HOME);
    setStage('intro');
  }, [resetAll, navigate]);

  const openChapter = useCallback(
    (id: ChapterId) => {
      setMenuOpen(false);
      navigate({ kind: 'chapter', id });
    },
    [navigate],
  );

  const goHome = useCallback(() => {
    setMenuOpen(false);
    navigate(HOME);
  }, [navigate]);

  const openMenu = useCallback(() => setMenuOpen(true), []);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  return (
    <>
      <Sky mood={mood} />
      <div className="stage">
        <AnimatePresence mode="wait">
          {stage === 'resume' && <Resume key="resume" onContinue={handleContinue} onRestart={handleRestart} />}
          {stage === 'intro' && <Intro key="intro" onEnter={handleEnter} />}
          {stage === 'gate' && <Gate key="gate" onUnlock={handleUnlock} />}
          {stage === 'main' && (
            <motion.div key="main" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }}>
              <AnimatePresence mode="wait" initial={false}>
                {route.kind === 'home' ? (
                  <Home key="home" onOpenChapter={openChapter} onOpenMenu={openMenu} />
                ) : (
                  <motion.div
                    key={route.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.7, ease: [0.22, 0.61, 0.36, 1] }}
                  >
                    <ChapterShell
                      id={route.id}
                      title={chapterMeta(route.id).title}
                      kicker={chapterMeta(route.id).kicker}
                      restore={restoreId === route.id}
                      onBack={goHome}
                      onOpenChapter={openChapter}
                      onOpenMenu={openMenu}
                    >
                      <ChapterBody id={route.id} />
                    </ChapterShell>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {menuOpen && stage === 'main' && (
          <SettingsSheet
            key="sheet"
            currentId={route.kind === 'chapter' ? route.id : null}
            onClose={closeMenu}
            onGoHome={goHome}
            onOpenChapter={openChapter}
            onReset={handleReset}
          />
        )}
      </AnimatePresence>
    </>
  );
}
