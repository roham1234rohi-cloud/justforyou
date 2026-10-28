import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  float?: boolean;
  onClose?: () => void;
  closeLabel?: string;
}

/** کارت کوچک برای یادداشت‌های پنهان. */
export default function NoteCard({ children, float, onClose, closeLabel = 'بستن' }: Props) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={float ? 'note note--float' : 'note'}
      role="status"
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
      transition={{ duration: 0.8, ease: [0.22, 0.61, 0.36, 1] }}
    >
      {children}
      {onClose && (
        <button type="button" className="note__close" onClick={onClose}>
          {closeLabel}
        </button>
      )}
    </motion.div>
  );
}
