// بعد از build اجرا می‌شود: مطمئن می‌شود هیچ پیامِ تأییدنشده‌ای در خروجی نیست.
import fs from 'node:fs';
import path from 'node:path';
import { approvedFile, candidatesFile, readDataArray, root } from './lib.mjs';

const dist = path.join(root, 'dist');
if (!fs.existsSync(dist)) {
  console.error('✖ پوشهٔ dist وجود ندارد.');
  process.exit(1);
}

function walk(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else acc.push(p);
  }
  return acc;
}

const files = walk(dist);
const problems = [];
for (const f of files) {
  if (/review|approvals|candidate/i.test(path.basename(f))) problems.push(`فایل مشکوک در خروجی: ${path.relative(root, f)}`);
}

const corpus = files
  .filter((f) => /\.(js|css|html|json|svg|txt|map)$/i.test(f))
  .map((f) => fs.readFileSync(f, 'utf8'))
  .join('\n');

const approvedIds = new Set(readDataArray(approvedFile).map((m) => m.id));
const escapeU = (s) => JSON.stringify(s).slice(1, -1).replace(/[\u0080-\uffff]/g, (c) => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0'));

let checked = 0;
for (const ex of readDataArray(candidatesFile)) {
  for (const m of ex.messages) {
    if (approvedIds.has(m.id)) continue;
    // خطوط کوتاه با متن عادیِ سایت اشتباه گرفته می‌شوند؛ فقط متن‌های به‌اندازهٔ کافی متمایز را بررسی کن
    for (const line of m.text.split('\n')) {
      const t = line.trim();
      if (t.length < 14) continue;
      checked++;
      if (corpus.includes(t) || corpus.includes(escapeU(t))) {
        problems.push(`پیامِ تأییدنشدهٔ ${m.id} در خروجی پیدا شد: «${t.slice(0, 30)}…»`);
      }
    }
  }
}

if (problems.length) {
  console.error('\n✖ بررسی خروجی ناموفق بود:\n' + problems.map((p) => '  - ' + p).join('\n') + '\n');
  process.exit(1);
}
console.log(`✔ خروجی (dist) تمیز است — ${checked} خطِ تأییدنشده بررسی شد و در خروجی نبود. پیام‌های تأییدشده: ${approvedIds.size}`);
