// بررسی می‌کند فقط پیام‌های تأییدشده و دقیقاً کپیِ کاندیدها در سایت هستند.
import fs from 'node:fs';
import path from 'node:path';
import { approvedFile, candidatesFile, readDataArray, root } from './lib.mjs';

const errors = [];
const fail = (msg) => errors.push(msg);

const candidates = readDataArray(candidatesFile);
const approved = readDataArray(approvedFile);

const SENDERS = new Set(['raham', 'setareh']);
const CATS = new Set(['humor', 'memories', 'meaningful']);
const byId = new Map();

for (const ex of candidates) {
  if (!CATS.has(ex.category)) fail(`کاندید ${ex.id}: دستهٔ نامعتبر`);
  for (const m of ex.messages) {
    if (byId.has(m.id)) fail(`شناسهٔ تکراری در کاندیدها: ${m.id}`);
    byId.set(m.id, { m, ex });
    if (!SENDERS.has(m.sender)) fail(`${m.id}: فرستندهٔ نامعتبر`);
    if (!/^\d{4}\/\d{2}\/\d{2}$/.test(m.date)) fail(`${m.id}: قالب تاریخ نامعتبر`);
    if (!/^\d{2}:\d{2}:\d{2}$/.test(m.time)) fail(`${m.id}: قالب ساعت نامعتبر`);
    if (typeof m.text !== 'string' || m.text.trim() === '') fail(`${m.id}: متن خالی`);
    if (/^\[(رسانه|استیکر|گیف|ویس|عکس|موزیک|ویدیو)/.test(m.text)) fail(`${m.id}: جایگزینِ رسانه نباید کاندید شود`);
  }
}

const seen = new Set();
for (const a of approved) {
  if (seen.has(a.id)) fail(`پیامِ تأییدشدهٔ تکراری: ${a.id}`);
  seen.add(a.id);
  const ref = byId.get(a.id);
  if (!ref) {
    fail(`پیامِ تأییدشدهٔ ${a.id} در فهرست کاندیدها نیست (اضافه‌کردنِ دستی ممنوع است).`);
    continue;
  }
  for (const k of ['sender', 'date', 'time', 'text']) {
    if (a[k] !== ref.m[k]) fail(`${a.id}: فیلد «${k}» با متن اصلی یکی نیست.`);
  }
  if (a.excerptId !== ref.ex.id || a.category !== ref.ex.category) fail(`${a.id}: قطعه/دسته با کاندید نمی‌خواند.`);
}

// هیچ‌جای برنامه نباید فهرست کاندیدها را import کند
function walk(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else acc.push(p);
  }
  return acc;
}
for (const f of walk(path.join(root, 'src'))) {
  if (f === candidatesFile) continue;
  if (!/\.(ts|tsx|js|jsx|css)$/.test(f)) continue;
  if (fs.readFileSync(f, 'utf8').includes('messageCandidates')) {
    fail(`${path.relative(root, f)} به messageCandidates اشاره می‌کند؛ کاندیدها نباید وارد برنامه شوند.`);
  }
}
const pub = path.join(root, 'public');
if (fs.existsSync(pub)) {
  for (const f of walk(pub)) {
    if (/review|candidate|approvals/i.test(path.basename(f))) fail(`فایل ${path.relative(root, f)} در public/ است و منتشر می‌شود.`);
  }
}

if (errors.length) {
  console.error('\n✖ بررسی داده‌ها ناموفق بود:\n' + errors.map((e) => '  - ' + e).join('\n') + '\n');
  process.exit(1);
}
console.log(`✔ داده‌ها درست‌اند — کاندید: ${byId.size} پیام در ${candidates.length} قطعه | تأییدشده: ${approved.length}`);
