import { useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import { AnimatePresence } from 'framer-motion';
import { discoveries } from '../data/letters';
import { useProgress } from '../hooks/useProgress';
import NoteCard from '../components/NoteCard';
import Reveal from '../components/Reveal';

const STARS: Array<[number, number]> = [
  [30, 150],
  [92, 96],
  [160, 118],
  [214, 54],
  [276, 100],
];
const LEAD = 2;

export default function Small() {
  const { progress, discover } = useProgress();
  const has = (id: string) => progress.discovered.includes(id);

  const [openConstellation, setOpenConstellation] = useState(has(discoveries.constellation.id));
  const [openSymbol, setOpenSymbol] = useState(false);
  const [openFragment, setOpenFragment] = useState(has(discoveries.fragment.id));

  const touchConstellation = () => {
    discover(discoveries.constellation.id);
    setOpenConstellation(true);
  };
  const toggleSymbol = () => {
    if (!openSymbol) discover(discoveries.symbol.id);
    setOpenSymbol((o) => !o);
  };
  const toggleFragment = () => {
    if (!openFragment) discover(discoveries.fragment.id);
    setOpenFragment((o) => !o);
  };

  const onKey = (fn: () => void) => (e: ReactKeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fn();
    }
  };

  return (
    <div>
      <div className="small__intro">
        {discoveries.intro.map((l, i) => (
          <p key={i}>{l}</p>
        ))}
      </div>

      <Reveal className="small__block">
        <p className="small__hint">{discoveries.constellation.hint}</p>
        <svg className="constellation" viewBox="0 0 300 190" role="group" aria-label="یه صورت فلکی کوچیک">
          <polyline className="link" points={STARS.map((s) => s.join(',')).join(' ')} />
          {STARS.map(([x, y], i) => (
            <g key={i}>
              <circle className={i === LEAD ? 'node node--lead' : 'node'} cx={x} cy={y} r={i === LEAD ? 3 : 2} />
              <circle
                className="hit"
                cx={x}
                cy={y}
                r="18"
                role="button"
                tabIndex={0}
                aria-label={`ستارهٔ ${i + 1}`}
                onClick={touchConstellation}
                onKeyDown={onKey(touchConstellation)}
              />
            </g>
          ))}
        </svg>
        <AnimatePresence>{openConstellation && <NoteCard>{discoveries.constellation.note}</NoteCard>}</AnimatePresence>
      </Reveal>

      <Reveal className="small__block">
        <p className="small__hint">{discoveries.fragment.hint}</p>
        <button
          type="button"
          className="fragment"
          onClick={toggleFragment}
          aria-expanded={openFragment}
          aria-label={openFragment ? 'تکهٔ نامه (باز شده)' : 'تکهٔ نامه؛ برای دیدن بقیه‌اش لمس کن'}
        >
          <span className="fragment__before">{discoveries.fragment.before}</span>
          <span className="fragment__hidden">{discoveries.fragment.hidden}</span>
          <span className="fragment__veil" aria-hidden="true">
            لمسش کن
          </span>
        </button>
      </Reveal>

      <Reveal className="small__block">
        <div className="symbol-wrap">
          <button
            type="button"
            className="symbol"
            onClick={toggleSymbol}
            aria-expanded={openSymbol}
            aria-label={discoveries.symbol.hint}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.8 6.8 0 0 0 10.5 10.5z" />
            </svg>
          </button>
        </div>
        <AnimatePresence>{openSymbol && <NoteCard>{discoveries.symbol.note}</NoteCard>}</AnimatePresence>
      </Reveal>
    </div>
  );
}
