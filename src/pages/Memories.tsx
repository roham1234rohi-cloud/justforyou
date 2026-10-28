import { useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { approvedMessages } from '../data/approvedMessages';
import { emptyMemories } from '../data/letters';
import { siteConfig } from '../data/siteConfig';
import type { ApprovedMessage, MessageCategory } from '../data/types';
import { faNumber, formatArchiveDate, formatArchiveTime, normalizeFa } from '../lib/persian';

type Filter = 'all' | MessageCategory;

const FILTERS: Array<{ id: Filter; label: string }> = [
  { id: 'all', label: 'همه' },
  { id: 'humor', label: 'شوخی' },
  { id: 'memories', label: 'خاطره‌های مشترک' },
  { id: 'meaningful', label: 'حرف‌های ماندگار' },
];

interface Moment {
  id: string;
  title: string;
  category: MessageCategory;
  messages: ApprovedMessage[];
}

function groupMoments(list: ApprovedMessage[]): Moment[] {
  const map = new Map<string, Moment>();
  for (const m of list) {
    let g = map.get(m.excerptId);
    if (!g) {
      g = { id: m.excerptId, title: m.excerptTitle, category: m.category, messages: [] };
      map.set(m.excerptId, g);
    }
    g.messages.push(m);
  }
  return Array.from(map.values());
}

function senderName(s: ApprovedMessage['sender']): string {
  return s === 'raham' ? siteConfig.creator : siteConfig.recipient;
}

export default function Memories() {
  const reduce = useReducedMotion();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const moments = useMemo(() => groupMoments(approvedMessages), []);

  const visible = useMemo(() => {
    const q = normalizeFa(query);
    return moments.filter((g) => {
      if (filter !== 'all' && g.category !== filter) return false;
      if (!q) return true;
      return g.messages.some((m) => normalizeFa(m.text).includes(q)) || normalizeFa(g.title).includes(q);
    });
  }, [moments, query, filter]);

  if (moments.length === 0) {
    return (
      <div className="empty">
        <h2 className="empty__title">{emptyMemories.title}</h2>
        <p className="empty__text">{emptyMemories.text}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="archive__controls">
        <div className="archive__search" role="search">
          <label className="sr-only" htmlFor="archive-q">
            جستجو بین حرف‌ها
          </label>
          <Search className="lead" size={18} strokeWidth={1.5} aria-hidden="true" />
          <input
            id="archive-q"
            type="search"
            dir="rtl"
            lang="fa"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="جستجو بین حرف‌ها"
            autoComplete="off"
            enterKeyHint="search"
          />
          {query && (
            <button type="button" className="clear" onClick={() => setQuery('')} aria-label="پاک کردن جستجو">
              <X size={16} strokeWidth={1.5} />
            </button>
          )}
        </div>
        <div className="chips" role="group" aria-label="دسته‌بندی">
          {FILTERS.map((f) => (
            <button key={f.id} type="button" className="chip" aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>
              {f.label}
            </button>
          ))}
        </div>
        <p className="archive__count" aria-live="polite">
          {faNumber(visible.length)} قطعه
        </p>
      </div>

      {visible.length === 0 ? (
        <div className="empty">
          <p className="empty__text">چیزی پیدا نشد. یه کلمهٔ دیگه امتحان کن.</p>
        </div>
      ) : (
        <AnimatePresence mode="popLayout" initial={false}>
          {visible.map((g) => (
            <motion.section
              className="moment"
              key={g.id}
              aria-label={g.title}
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 0.61, 0.36, 1] }}
            >
              <div className="moment__head">
                <h2 className="moment__title">{g.title}</h2>
                <span className="moment__date">{formatArchiveDate(g.messages[0].date)}</span>
              </div>
              <div className="thread">
                {g.messages.map((m, i) => {
                  const prev = g.messages[i - 1];
                  const showWho = !prev || prev.sender !== m.sender || Boolean(m.gapBefore);
                  return (
                    <ThreadItem key={m.id} m={m} showWho={showWho} showGap={Boolean(m.gapBefore) && i > 0} />
                  );
                })}
              </div>
            </motion.section>
          ))}
        </AnimatePresence>
      )}
    </div>
  );
}

function ThreadItem({ m, showWho, showGap }: { m: ApprovedMessage; showWho: boolean; showGap: boolean }) {
  return (
    <>
      {showGap && (
        <span className="gap" aria-hidden="true">
          ···
        </span>
      )}
      {showWho && <span className={`who who--${m.sender}`}>{senderName(m.sender)}</span>}
      <div className={`bubble bubble--${m.sender}`}>
        <p className="bubble__text" dir="auto">
          {m.text}
        </p>
        <span className="bubble__time">
          {formatArchiveDate(m.date)} · {formatArchiveTime(m.time)}
        </span>
      </div>
    </>
  );
}
