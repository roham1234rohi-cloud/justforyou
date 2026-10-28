// استفاده: npm run approve            (فایل review/approvals.json را می‌خواند)
//          npm run approve -- مسیر/فایل.json
import fs from 'node:fs';
import path from 'node:path';
import { approvedFile, buildApproved, candidatesFile, readDataArray, renderApprovedTs, root } from './lib.mjs';

const arg = process.argv[2];
const file = arg ? path.resolve(process.cwd(), arg) : path.join(root, 'review/approvals.json');

if (!fs.existsSync(file)) {
  console.error(`✖ فایل تأییدیه پیدا نشد: ${file}\n  اول review/review.html را باز کن، پیام‌ها را تأیید/ردّ کن و فایل approvals.json را دانلود کن.`);
  process.exit(1);
}

let data;
try {
  data = JSON.parse(fs.readFileSync(file, 'utf8'));
} catch {
  console.error('✖ فایل approvals.json معتبر نیست.');
  process.exit(1);
}
if (!data || !Array.isArray(data.approved) || !data.approved.every((x) => typeof x === 'string')) {
  console.error('✖ ساختار فایل باید مثل {"approved": ["m71056", ...]} باشد.');
  process.exit(1);
}

const candidates = readDataArray(candidatesFile);
const known = new Set(candidates.flatMap((c) => c.messages.map((m) => m.id)));
const unknown = data.approved.filter((id) => !known.has(id));
if (unknown.length) {
  console.error('✖ این شناسه‌ها در فهرست کاندیدها نیستند و نادیده گرفته نمی‌شوند:\n  ' + unknown.join(', '));
  process.exit(1);
}

const list = buildApproved(candidates, data.approved);
fs.writeFileSync(approvedFile, renderApprovedTs(list), 'utf8');
console.log(`✔ ${list.length} پیامِ تأییدشده در src/data/approvedMessages.ts نوشته شد.`);
