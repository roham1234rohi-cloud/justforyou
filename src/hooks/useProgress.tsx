import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { clearProgress, emptyProgress, loadProgress, saveProgress } from '../lib/storage';
import type { Progress } from '../lib/storage';

interface ProgressApi {
  progress: Progress;
  markStarted: () => void;
  setUnlocked: (v: boolean) => void;
  markVisited: (id: string) => void;
  discover: (id: string) => void;
  recordReading: (id: string, fraction: number, scrollY: number) => void;
  setDiaryPage: (n: number) => void;
  setLastView: (v: string) => void;
  restartExperience: () => void;
  resetAll: () => void;
}

const Ctx = createContext<ProgressApi | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<Progress>(() => loadProgress());
  const first = useRef(true);

  // ذخیرهٔ تأخیری تا اسکرول سبک بماند
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const t = window.setTimeout(() => saveProgress(progress), 250);
    return () => window.clearTimeout(t);
  }, [progress]);

  const markStarted = useCallback(() => setProgress((p) => (p.started ? p : { ...p, started: true })), []);
  const setUnlocked = useCallback((v: boolean) => setProgress((p) => (p.unlocked === v ? p : { ...p, unlocked: v })), []);
  const markVisited = useCallback(
    (id: string) => setProgress((p) => (p.visited.includes(id) ? p : { ...p, visited: [...p.visited, id] })),
    [],
  );
  const discover = useCallback(
    (id: string) => setProgress((p) => (p.discovered.includes(id) ? p : { ...p, discovered: [...p.discovered, id] })),
    [],
  );
  const recordReading = useCallback((id: string, fraction: number, scrollY: number) => {
    setProgress((p) => {
      const prev = p.read[id] ?? 0;
      const next = Math.max(prev, Math.min(1, Math.max(0, fraction)));
      return { ...p, read: { ...p.read, [id]: next }, scroll: { ...p.scroll, [id]: Math.max(0, Math.round(scrollY)) } };
    });
  }, []);
  const setDiaryPage = useCallback((n: number) => setProgress((p) => (p.diaryPage === n ? p : { ...p, diaryPage: n })), []);
  const setLastView = useCallback((v: string) => setProgress((p) => (p.lastView === v ? p : { ...p, lastView: v })), []);

  // «از اول شروع کنیم»: مقدمه و رمز دوباره، ولی یادداشت‌های پیداشده و فصل‌های دیده‌شده می‌مانند
  const restartExperience = useCallback(
    () => setProgress((p) => ({ ...p, started: false, unlocked: false, lastView: 'home' })),
    [],
  );

  const resetAll = useCallback(() => {
    clearProgress();
    setProgress({ ...emptyProgress });
  }, []);

  const value = useMemo<ProgressApi>(
    () => ({
      progress,
      markStarted,
      setUnlocked,
      markVisited,
      discover,
      recordReading,
      setDiaryPage,
      setLastView,
      restartExperience,
      resetAll,
    }),
    [progress, markStarted, setUnlocked, markVisited, discover, recordReading, setDiaryPage, setLastView, restartExperience, resetAll],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useProgress(): ProgressApi {
  const v = useContext(Ctx);
  if (!v) throw new Error('useProgress must be used inside ProgressProvider');
  return v;
}
