import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { siteConfig } from '../data/siteConfig';
import { introButton, introLetter } from '../data/letters';

const EASE: [number, number, number, number] = [0.22, 0.61, 0.36, 1];

export default function Intro({ onEnter }: { onEnter: () => void }) {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<'title' | 'letter'>('title');
  const words = siteConfig.title.split(' ');

  let charIndex = 0;

  return (
    <motion.section
      className="intro"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduce ? 0 : 1.2, ease: EASE }}
      aria-label={siteConfig.title}
    >
      {phase === 'title' ? (
        <motion.div
          key="title"
          className="intro__inner"
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          <h1 className="intro__title" aria-label={siteConfig.title}>
            {words.map((word, wi) => (
              <span className="intro__word" key={wi} aria-hidden="true">
                {word.split('').map((ch, ci) => {
                  const d = 1.4 + charIndex++ * 0.07;
                  return (
                    <motion.span
                      className="intro__char"
                      key={ci}
                      initial={reduce ? false : { opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 1.3, delay: reduce ? 0 : d, ease: EASE }}
                    >
                      {ch}
                    </motion.span>
                  );
                })}
              </span>
            ))}
          </h1>

          <motion.p
            className="intro__subtitle"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.4, delay: reduce ? 0 : 3.1 }}
          >
            {siteConfig.subtitle}
          </motion.p>

          <motion.p
            className="intro__credit"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 0.85 }}
            transition={{ duration: 1.4, delay: reduce ? 0 : 3.9 }}
          >
            {siteConfig.credit}
          </motion.p>

          <motion.div
            className="intro__action"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: reduce ? 0 : 4.6 }}
          >
            <button type="button" className="btn" onClick={() => setPhase('letter')}>
              باز کردن نامه
            </button>
          </motion.div>
        </motion.div>
      ) : (
        <motion.article
          key="letter"
          className="paper"
          initial={reduce ? false : { opacity: 0, y: 48, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.5, ease: EASE }}
        >
          <div className="paper__rule" aria-hidden="true" />
          {introLetter.map((p, i) => (
            <motion.p
              key={i}
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.2, delay: reduce ? 0 : 0.9 + i * 0.75 }}
            >
              {p}
            </motion.p>
          ))}
          <motion.div
            className="paper__action"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: reduce ? 0 : 0.9 + introLetter.length * 0.75 + 0.2 }}
          >
            <button type="button" className="btn" onClick={onEnter}>
              {introButton}
            </button>
          </motion.div>
        </motion.article>
      )}
    </motion.section>
  );
}
