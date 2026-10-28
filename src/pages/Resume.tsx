import { motion } from 'framer-motion';
import { siteConfig } from '../data/siteConfig';

interface Props {
  onContinue: () => void;
  onRestart: () => void;
}

export default function Resume({ onContinue, onRestart }: Props) {
  return (
    <motion.section
      className="resume"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.9 }}
      aria-label="ادامه یا شروع دوباره"
    >
      <div>
        <h1 className="resume__title">{siteConfig.title}</h1>
        <p className="resume__text">قبلاً اینجا بودی.</p>
        <div className="resume__actions">
          <button type="button" className="btn btn--primary" onClick={onContinue} autoFocus>
            ادامه بدیم
          </button>
          <button type="button" className="btn btn--ghost" onClick={onRestart}>
            از اول شروع کنیم
          </button>
        </div>
      </div>
    </motion.section>
  );
}
