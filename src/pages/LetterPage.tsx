import type { ChapterId } from '../data/types';
import { letters } from '../data/letters';
import Reveal from '../components/Reveal';

export type LetterKey = 'difficult' | 'happy' | 'nostalgic' | 'final';

export function isLetterKey(id: ChapterId): id is LetterKey {
  return id === 'difficult' || id === 'happy' || id === 'nostalgic' || id === 'final';
}

export function letterMeta(key: LetterKey) {
  const l = letters[key];
  return { title: l.title, kicker: l.kicker };
}

export default function LetterPage({ letterKey }: { letterKey: LetterKey }) {
  const letter = letters[letterKey];
  return (
    <article>
      {letter.paragraphs.map((p, i) => (
        <Reveal key={i}>
          <p className="letter__p">{p}</p>
        </Reveal>
      ))}
      {letter.closing && (
        <Reveal delay={0.15}>
          <p className="letter__closing">{letter.closing}</p>
        </Reveal>
      )}
      {letter.signature && (
        <Reveal delay={0.3}>
          <p className="letter__sign">— {letter.signature}</p>
        </Reveal>
      )}
    </article>
  );
}
