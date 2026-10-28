import { siteConfig } from '../data/siteConfig';

export interface Progress {
  v: 1;
  /** حداقل یک بار مقدمه دیده شده */
  started: boolean;
  /** رمز درست وارد شده */
  unlocked: boolean;
  visited: string[];
  discovered: string[];
  /** بیشینهٔ بخشِ خواندن‌شده (۰ تا ۱) برای هر فصل */
  read: Record<string, number>;
  /** آخرین موقعیت اسکرول هر فصل */
  scroll: Record<string, number>;
  diaryPage: number;
  lastView: string;
}

export const emptyProgress: Progress = {
  v: 1,
  started: false,
  unlocked: false,
  visited: [],
  discovered: [],
  read: {},
  scroll: {},
  diaryPage: 0,
  lastView: 'home',
};

function strArray(x: unknown): string[] {
  return Array.isArray(x) ? x.filter((i): i is string => typeof i === 'string').slice(0, 64) : [];
}

function numMap(x: unknown): Record<string, number> {
  const out: Record<string, number> = {};
  if (x && typeof x === 'object') {
    for (const [k, v] of Object.entries(x as Record<string, unknown>)) {
      if (typeof v === 'number' && Number.isFinite(v) && v >= 0) out[k.slice(0, 40)] = v;
    }
  }
  return out;
}

/** هر داده‌ای را به یک Progress معتبر تبدیل می‌کند (داده‌های خراب نادیده گرفته می‌شوند). */
export function sanitizeProgress(data: unknown): Progress {
  if (!data || typeof data !== 'object') return { ...emptyProgress };
  const d = data as Record<string, unknown>;
  const page = typeof d.diaryPage === 'number' && Number.isFinite(d.diaryPage) ? Math.max(0, Math.floor(d.diaryPage)) : 0;
  return {
    v: 1,
    started: d.started === true,
    unlocked: d.unlocked === true,
    visited: strArray(d.visited),
    discovered: strArray(d.discovered),
    read: numMap(d.read),
    scroll: numMap(d.scroll),
    diaryPage: page,
    lastView: typeof d.lastView === 'string' ? d.lastView.slice(0, 40) : 'home',
  };
}

export function loadProgress(): Progress {
  try {
    const raw = window.localStorage.getItem(siteConfig.storageKey);
    if (!raw) return { ...emptyProgress };
    return sanitizeProgress(JSON.parse(raw));
  } catch {
    return { ...emptyProgress };
  }
}

export function saveProgress(p: Progress): void {
  try {
    window.localStorage.setItem(siteConfig.storageKey, JSON.stringify(p));
  } catch {
    /* حافظه پر است یا غیرفعال؛ سایت بدون ذخیره هم کار می‌کند */
  }
}

export function clearProgress(): void {
  try {
    window.localStorage.removeItem(siteConfig.storageKey);
  } catch {
    /* ignore */
  }
}
