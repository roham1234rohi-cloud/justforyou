import { useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export type Mood = 'intro' | 'gate' | 'home' | 'chapter';

interface MoonPose {
  x: string;
  y: string;
  scale: number;
  opacity: number;
}

const POSES: Record<Mood, MoonPose> = {
  intro: { x: '16vw', y: '-27vh', scale: 1, opacity: 1 },
  gate: { x: '0vw', y: '-30vh', scale: 0.62, opacity: 0.9 },
  home: { x: '0vw', y: '-17vh', scale: 1.08, opacity: 0.95 },
  chapter: { x: '30vw', y: '-36vh', scale: 0.5, opacity: 0.55 },
};

interface Star {
  x: number;
  y: number;
  r: number;
  a: number;
  s: number;
  p: number;
  pink: boolean;
}

/** آسمان شب: ستاره‌ها (canvas سبک) + ماه (CSS) + دانهٔ فیلم. فقط transform/opacity انیمیت می‌شود. */
export default function Sky({ mood }: { mood: Mood }) {
  const reduce = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    let stars: Star[] = [];
    let raf = 0;
    let last = 0;

    const build = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = w < 700 ? 52 : 96;
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() < 0.1 ? 1.3 : Math.random() * 0.7 + 0.35,
        a: Math.random() * 0.5 + 0.25,
        s: Math.random() * 0.7 + 0.25,
        p: Math.random() * Math.PI * 2,
        pink: Math.random() < 0.12,
      }));
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      for (const st of stars) {
        const tw = reduce ? 1 : 0.72 + 0.28 * Math.sin((t / 1000) * st.s + st.p);
        ctx.globalAlpha = st.a * tw;
        ctx.fillStyle = st.pink ? '#D89AAE' : '#F5F0EC';
        ctx.beginPath();
        ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);
      if (t - last < 45) return; // حدود ۲۲ فریم بر ثانیه کافی است
      last = t;
      draw(t);
    };

    const start = () => {
      cancelAnimationFrame(raf);
      if (!reduce && !document.hidden) raf = requestAnimationFrame(loop);
    };

    build();
    draw(0);
    start();

    let lastW = window.innerWidth;
    let lastH = window.innerHeight;
    const onResize = () => {
      // نوار آدرس موبایل ارتفاع را کم‌وزیاد می‌کند؛ فقط تغییرهای واقعی را بازسازی کن
      if (window.innerWidth === lastW && Math.abs(window.innerHeight - lastH) < 140) return;
      lastW = window.innerWidth;
      lastH = window.innerHeight;
      build();
      draw(performance.now());
    };
    const onVisibility = () => start();

    window.addEventListener('resize', onResize);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [reduce]);

  const pose = POSES[mood];

  return (
    <div className="sky" aria-hidden="true" dir="ltr">
      <div className="sky__gradient" />
      <canvas ref={canvasRef} className="sky__stars" />
      <motion.div
        className="sky__anchor"
        initial={{ opacity: 0, x: pose.x, y: pose.y, scale: pose.scale }}
        animate={{ opacity: pose.opacity, x: pose.x, y: pose.y, scale: pose.scale }}
        transition={{ duration: reduce ? 0 : 2.6, ease: [0.22, 0.61, 0.36, 1] }}
      >
        <div className="sky__halo" />
        <div className="moon" />
      </motion.div>
      <div className="sky__veil" style={{ opacity: mood === 'chapter' ? 1 : 0 }} />
      <div className="sky__vignette" />
      <div className="sky__grain" />
    </div>
  );
}
