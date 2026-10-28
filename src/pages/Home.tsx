import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ChevronLeft, Menu } from 'lucide-react';
import { chapters, siteConfig } from '../data/siteConfig';
import { discoveries } from '../data/letters';
import type { ChapterId } from '../data/types';
import { useProgress } from '../hooks/useProgress';
import NoteCard from '../components/NoteCard';

interface Props {
  onOpenChapter: (id: ChapterId) => void;
  onOpenMenu: () => void;
}

const NODES: Array<[number, number]> = [
  [70, 150],
  [140, 205],
  [215, 170],
  [300, 240],
  [335, 345],
  [262, 430],
  [160, 500],
];

const TRIO: Array<[number, number]> = [
  [300, 82],
  [330, 62],
  [346, 100],
];

export default function Home({ onOpenChapter, onOpenMenu }: Props) {
  const reduce = useReducedMotion();
  const { progress, discover } = useProgress();
  const [noteOpen, setNoteOpen] = useState(false);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, -50]);
  const heroOpacity = useTransform(scrollY, [0, 420], [1, 0.15]);

  const found = progress.discovered.includes(discoveries.homeStar.id);

  const openStar = () => {
    discover(discoveries.homeStar.id);
    setNoteOpen(true);
  };

  const path = NODES.map((n) => n.join(',')).join(' ');

  return (
    <motion.div
      className="home"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.4, ease: [0.22, 0.61, 0.36, 1] }}
    >
      <svg className="home__lines" viewBox="0 0 400 800" preserveAspectRatio="xMidYMid slice" aria-hidden={false}>
        <polyline points={path} fill="none" stroke="#B7B5C0" strokeOpacity="0.16" strokeWidth="0.7" />
        <line x1="215" y1="170" x2="262" y2="95" stroke="#B7B5C0" strokeOpacity="0.1" strokeWidth="0.7" />
        {NODES.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 1.8 : 1.2} fill="#F5F0EC" fillOpacity="0.45" />
        ))}
        <polyline points={TRIO.map((n) => n.join(',')).join(' ')} fill="none" stroke="#D89AAE" strokeOpacity="0.28" strokeWidth="0.7" />
        {TRIO.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={i === 1 ? 2 : 1.2} fill="#D89AAE" fillOpacity={i === 1 ? 0.8 : 0.45} />
        ))}
        {/* ستارهٔ پنهان: یکی از سه ستارهٔ صورتی */}
        <g
          className="star-hit"
          role="button"
          tabIndex={0}
          aria-label={discoveries.homeStar.ariaLabel}
          onClick={openStar}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              openStar();
            }
          }}
        >
          <circle cx={TRIO[1][0]} cy={TRIO[1][1]} r="20" fill="transparent" />
        </g>
      </svg>

      <div className="home__topbar">
        <span />
        <button type="button" className="icon-btn" onClick={onOpenMenu} aria-label="منو">
          <Menu size={20} strokeWidth={1.5} />
        </button>
      </div>

      <motion.header className="home__hero" style={reduce ? undefined : { y: heroY, opacity: heroOpacity }}>
        <p className="home__for">برای {siteConfig.recipient}</p>
        <h1 className="home__title">{siteConfig.title}</h1>
        <p className="home__subtitle">{siteConfig.subtitle}</p>
        <div className="home__scrollcue" aria-hidden="true" />
      </motion.header>

      <nav aria-label="فصل‌ها">
        <ul className="index">
          {chapters.map((c, i) => {
            const visited = progress.visited.includes(c.id);
            return (
              <motion.li
                className="index__item"
                key={c.id}
                initial={reduce ? false : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '0px 0px -8% 0px' }}
                transition={{ duration: 0.9, delay: Math.min(i, 3) * 0.05, ease: [0.22, 0.61, 0.36, 1] }}
              >
                <button type="button" className="index__link" onClick={() => onOpenChapter(c.id)}>
                  <span className={visited ? 'index__mark index__mark--visited' : 'index__mark'} aria-hidden="true" />
                  <span className="index__text">
                    <span className="index__title">{c.title}</span>
                    <span className="index__blurb">{c.blurb}</span>
                  </span>
                  {visited && <span className="sr-only">خوانده‌شده</span>}
                  <ChevronLeft className="index__chevron" size={18} strokeWidth={1.25} aria-hidden="true" />
                </button>
              </motion.li>
            );
          })}
        </ul>
      </nav>

      <AnimatePresence>
        {noteOpen && (
          <NoteCard float onClose={() => setNoteOpen(false)}>
            {discoveries.homeStar.note}
          </NoteCard>
        )}
      </AnimatePresence>
      {found && !noteOpen && <span className="sr-only">یادداشتِ ستارهٔ صفحهٔ اصلی پیدا شده است.</span>}
    </motion.div>
  );
}
