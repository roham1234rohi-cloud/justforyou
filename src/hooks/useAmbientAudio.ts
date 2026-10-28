import { useCallback, useEffect, useRef, useState } from 'react';
import { siteConfig } from '../data/siteConfig';

/**
 * نقطهٔ اتصالِ موسیقی (اختیاری). هیچ‌وقت خودکار پخش نمی‌شود.
 * اگر siteConfig.audio.src مقدار داشته باشد، در منوی تنظیمات یک دکمهٔ پخش/توقف ظاهر می‌شود.
 */
export function useAmbientAudio() {
  const src = siteConfig.audio.src;
  const ref = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    return () => {
      ref.current?.pause();
      ref.current = null;
    };
  }, []);

  const toggle = useCallback(() => {
    if (!src) return;
    if (!ref.current) {
      const a = new Audio(src);
      a.loop = true;
      a.volume = 0.5;
      ref.current = a;
    }
    const a = ref.current;
    if (a.paused) {
      a.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    } else {
      a.pause();
      setPlaying(false);
    }
  }, [src]);

  return { available: Boolean(src), playing, toggle };
}
