import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { diaryEntries } from '../data/letters';
import { useProgress } from '../hooks/useProgress';
import { faNumber } from '../lib/persian';

export default function Diary() {
  const reduce = useReducedMotion();
  const { progress, setDiaryPage } = useProgress();
  const total = diaryEntries.length;
  const start = Math.min(Math.max(progress.diaryPage, 0), total - 1);
  const [page, setPage] = useState(start);
  const [dir, setDir] = useState(1);

  const go = (n: number) => {
    const clamped = Math.min(Math.max(n, 0), total - 1);
    if (clamped === page) return;
    setDir(clamped > page ? 1 : -1);
    setPage(clamped);
    setDiaryPage(clamped);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return;
      // در چیدمان راست‌به‌چپ، «بعدی» سمت چپ است
      if (e.key === 'ArrowLeft') go(page + 1);
      if (e.key === 'ArrowRight') go(page - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const entry = diaryEntries[page];

  return (
    <div>
      <div aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.article
            className="diary__page"
            key={entry.id}
            initial={reduce ? false : { opacity: 0, x: dir * -26 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, x: dir * 26 }}
            transition={{ duration: 0.45, ease: [0.22, 0.61, 0.36, 1] }}
          >
            <h2 className="diary__title">{entry.title}</h2>
            {entry.lines.map((l, i) => (
              <p className="diary__p" key={i}>
                {l}
              </p>
            ))}
          </motion.article>
        </AnimatePresence>
      </div>

      <div className="diary__controls">
        <button type="button" className="icon-btn" onClick={() => go(page - 1)} disabled={page === 0} aria-label="صفحهٔ قبل" style={{ opacity: page === 0 ? 0.3 : 1 }}>
          <ChevronRight size={22} strokeWidth={1.4} />
        </button>
        <div className="diary__dots" role="group" aria-label="صفحه‌ها">
          {diaryEntries.map((e, i) => (
            <button
              key={e.id}
              type="button"
              className="diary__dot"
              aria-label={`صفحهٔ ${faNumber(i + 1)}: ${e.title}`}
              aria-current={i === page}
              onClick={() => go(i)}
            >
              <i />
            </button>
          ))}
        </div>
        <button type="button" className="icon-btn" onClick={() => go(page + 1)} disabled={page === total - 1} aria-label="صفحهٔ بعد" style={{ opacity: page === total - 1 ? 0.3 : 1 }}>
          <ChevronLeft size={22} strokeWidth={1.4} />
        </button>
      </div>
      <p className="diary__counter">
        {faNumber(page + 1)} از {faNumber(total)}
      </p>
    </div>
  );
}
