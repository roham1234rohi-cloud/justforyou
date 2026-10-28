import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { motion, useReducedMotion, useScroll, useSpring } from 'framer-motion';
import { ArrowRight, Menu, ChevronLeft, ChevronRight } from 'lucide-react';
import { chapters } from '../data/siteConfig';
import type { ChapterId } from '../data/types';
import { useProgress } from '../hooks/useProgress';

interface Props {
  id: ChapterId;
  title: string;
  kicker?: string;
  restore: boolean;
  onBack: () => void;
  onOpenChapter: (id: ChapterId) => void;
  onOpenMenu: () => void;
  children: ReactNode;
}

/** قاب مشترک همهٔ فصل‌ها: نوار بالا، نوار پیشرفت، عنوان، و ناوبری قبلی/بعدی. */
export default function ChapterShell({ id, title, kicker, restore, onBack, onOpenChapter, onOpenMenu, children }: Props) {
  const reduce = useReducedMotion();
  const { progress, markVisited, recordReading } = useProgress();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const savedScroll = useRef(progress.scroll[id] ?? 0);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });

  const index = chapters.findIndex((c) => c.id === id);
  const prev = index > 0 ? chapters[index - 1] : undefined;
  const next = index < chapters.length - 1 ? chapters[index + 1] : undefined;

  useEffect(() => {
    markVisited(id);
    if (restore && savedScroll.current > 40) {
      const y = savedScroll.current;
      const t = window.setTimeout(() => window.scrollTo({ top: y, behavior: 'auto' }), 350);
      return () => window.clearTimeout(t);
    }
    window.scrollTo({ top: 0, behavior: 'auto' });
    headingRef.current?.focus({ preventScroll: true });
    return undefined;
  }, [id, restore, markVisited]);

  useEffect(() => {
    let t = 0;
    const onScroll = () => {
      window.clearTimeout(t);
      t = window.setTimeout(() => {
        const doc = document.documentElement;
        const max = doc.scrollHeight - window.innerHeight;
        const fraction = max > 0 ? window.scrollY / max : 1;
        recordReading(id, fraction, window.scrollY);
      }, 400);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.clearTimeout(t);
    };
  }, [id, recordReading]);

  return (
    <div className="chapter">
      {!reduce && <motion.div className="chapter__progress" style={{ scaleX }} aria-hidden="true" />}
      <div className="chapter__bar">
        <button type="button" className="icon-btn" onClick={onBack} aria-label="بازگشت به صفحهٔ اصلی">
          <ArrowRight size={20} strokeWidth={1.5} />
        </button>
        <span className="chapter__bar-title" aria-hidden="true">
          {title}
        </span>
        <button type="button" className="icon-btn" onClick={onOpenMenu} aria-label="منو">
          <Menu size={20} strokeWidth={1.5} />
        </button>
      </div>

      <main className="chapter__body">
        <header className="chapter__head">
          {kicker && <p className="chapter__kicker">{kicker}</p>}
          <h1 className="chapter__title" ref={headingRef} tabIndex={-1}>
            {title}
          </h1>
          <div className="chapter__rule" aria-hidden="true" />
        </header>
        {children}
      </main>

      <nav className="chapter__nav" aria-label="فصل‌ها">
        {prev && (
          <button type="button" className="is-prev" onClick={() => onOpenChapter(prev.id)}>
            <small>
              <ChevronRight size={12} style={{ verticalAlign: '-1px' }} /> قبلی
            </small>
            <span>{prev.title}</span>
          </button>
        )}
        {next && (
          <button type="button" className="is-next" onClick={() => onOpenChapter(next.id)}>
            <small>
              بعدی <ChevronLeft size={12} style={{ verticalAlign: '-1px' }} />
            </small>
            <span>{next.title}</span>
          </button>
        )}
      </nav>
    </div>
  );
}
