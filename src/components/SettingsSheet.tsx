import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { X, Volume2, VolumeX } from 'lucide-react';
import { chapters } from '../data/siteConfig';
import { siteConfig } from '../data/siteConfig';
import type { ChapterId } from '../data/types';
import { useAmbientAudio } from '../hooks/useAmbientAudio';
import { useProgress } from '../hooks/useProgress';

interface Props {
  currentId: ChapterId | null;
  onClose: () => void;
  onGoHome: () => void;
  onOpenChapter: (id: ChapterId) => void;
  onReset: () => void;
}

export default function SettingsSheet({ currentId, onClose, onGoHome, onOpenChapter, onReset }: Props) {
  const reduce = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const [confirming, setConfirming] = useState(false);
  const audio = useAmbientAudio();
  const { progress } = useProgress();

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !panelRef.current) return;
      const f = panelRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), a[href]');
      if (f.length === 0) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      opener?.focus?.();
    };
  }, [onClose]);

  return (
    <>
      <motion.div
        className="sheet__backdrop"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      />
      <motion.div
        className="sheet"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="منو"
        tabIndex={-1}
        initial={reduce ? { opacity: 0 } : { y: '100%' }}
        animate={reduce ? { opacity: 1 } : { y: 0 }}
        exit={reduce ? { opacity: 0 } : { y: '100%' }}
        transition={{ duration: 0.5, ease: [0.22, 0.61, 0.36, 1] }}
      >
        <div className="sheet__head">
          <span className="sheet__title">فصل‌ها</span>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="بستن منو">
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        <ul className="sheet__list">
          <li>
            <button type="button" className="sheet__link" onClick={onGoHome} aria-current={currentId === null ? 'page' : undefined}>
              صفحهٔ اصلی
            </button>
          </li>
          {chapters.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                className="sheet__link"
                onClick={() => onOpenChapter(c.id)}
                aria-current={currentId === c.id ? 'page' : undefined}
              >
                {c.title}
                {progress.visited.includes(c.id) && <span className="sr-only"> (خوانده‌شده)</span>}
              </button>
            </li>
          ))}
        </ul>

        {audio.available && (
          <div className="sheet__section" style={{ marginBottom: '1rem' }}>
            <button type="button" className="btn" onClick={audio.toggle} aria-pressed={audio.playing}>
              {audio.playing ? <VolumeX size={18} strokeWidth={1.5} /> : <Volume2 size={18} strokeWidth={1.5} />}
              {siteConfig.audio.label}
            </button>
          </div>
        )}

        <div className="sheet__section">
          {!confirming ? (
            <>
              <button type="button" className="btn btn--ghost" onClick={() => setConfirming(true)}>
                پاک کردن حافظهٔ این مرورگر
              </button>
              <p className="sheet__text">
                پیشرفت و یادداشت‌های پیداشده فقط روی همین دستگاه ذخیره شده‌اند و جایی فرستاده نمی‌شوند.
              </p>
            </>
          ) : (
            <>
              <p className="sheet__text">همهٔ پیشرفت و یادداشت‌های پیداشده پاک می‌شود و از اول شروع می‌کنی. مطمئنی؟</p>
              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                <button type="button" className="btn sheet__danger" onClick={onReset}>
                  بله، پاک کن
                </button>
                <button type="button" className="btn btn--ghost" onClick={() => setConfirming(false)}>
                  نه، بمونه
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </>
  );
}
