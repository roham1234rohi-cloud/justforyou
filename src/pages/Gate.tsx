import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { motion, useAnimationControls, useReducedMotion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { siteConfig } from '../data/siteConfig';
import { normalizeFa } from '../lib/persian';

export default function Gate({ onUnlock }: { onUnlock: () => void }) {
  const reduce = useReducedMotion();
  const [value, setValue] = useState('');
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState('');
  const [fails, setFails] = useState(0);
  const controls = useAnimationControls();
  const [hintShown, setHintShown] = useState(false);
  const [done, setDone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const accepted = [siteConfig.gate.password, ...siteConfig.gate.alternatives].map(normalizeFa);

  const doShake = () => {
    if (!reduce) void controls.start({ x: [0, -7, 7, -4, 4, 0], transition: { duration: 0.45 } });
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (done) return;
    const typed = normalizeFa(value);
    if (!typed) {
      setMessage(siteConfig.gate.empty);
      doShake();
      inputRef.current?.focus();
      return;
    }
    if (accepted.includes(typed)) {
      setMessage('');
      setDone(true);
      window.setTimeout(onUnlock, reduce ? 0 : 900);
      return;
    }
    const errors = siteConfig.gate.errors;
    setMessage(errors[fails % errors.length]);
    setFails((f) => f + 1);
    doShake();
    setValue('');
    inputRef.current?.focus();
  };

  return (
    <motion.section
      className="gate"
      initial={{ opacity: 0 }}
      animate={{ opacity: done ? 0.0 : 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: done ? 0.9 : 1.1 }}
      aria-label="رمز ورود"
    >
      <motion.form
        className="gate__form"
        onSubmit={submit}
        noValidate
        animate={controls}
      >
        <h1 className="gate__heading">{siteConfig.gate.heading}</h1>
        <p className="gate__helper">{siteConfig.gate.helper}</p>

        <div className="gate__field">
          <label className="sr-only" htmlFor="gate-input">
            {siteConfig.gate.placeholder}
          </label>
          <input
            id="gate-input"
            ref={inputRef}
            className="gate__input"
            type={show ? 'text' : 'password'}
            dir="rtl"
            lang="fa"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={siteConfig.gate.placeholder}
            autoComplete="off"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="go"
            autoFocus
            aria-describedby="gate-message"
          />
          <button
            type="button"
            className="gate__eye"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? 'پنهان کردن رمز' : 'نمایش رمز'}
          >
            {show ? <EyeOff size={18} strokeWidth={1.5} /> : <Eye size={18} strokeWidth={1.5} />}
          </button>
        </div>

        <p className="gate__message" id="gate-message" role="status" aria-live="polite">
          {message}
        </p>

        <div className="gate__actions">
          <button type="submit" className="btn btn--primary" disabled={done}>
            {siteConfig.gate.submit}
          </button>
          {fails >= 3 && !hintShown && (
            <button type="button" className="btn btn--ghost" onClick={() => setHintShown(true)}>
              {siteConfig.gate.hintButton}
            </button>
          )}
          {hintShown && <p className="gate__hint">{siteConfig.gate.hint}</p>}
        </div>
      </motion.form>
    </motion.section>
  );
}
