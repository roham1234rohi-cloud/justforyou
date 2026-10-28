import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const candidatesFile = path.join(root, 'src/data/messageCandidates.ts');
export const approvedFile = path.join(root, 'src/data/approvedMessages.ts');
export const headerFile = path.join(root, 'scripts/approved-header.txt');

const BEGIN = '/* BEGIN_DATA */';
const END = '/* END_DATA */';

/** آرایهٔ JSON بین BEGIN_DATA و END_DATA را از یک فایل .ts بیرون می‌کشد. */
export function readDataArray(file) {
  const src = fs.readFileSync(file, 'utf8');
  const a = src.indexOf(BEGIN);
  const b = src.indexOf(END);
  if (a < 0 || b < 0 || b < a) throw new Error(`نشانگرهای BEGIN_DATA/END_DATA در ${path.relative(root, file)} پیدا نشد.`);
  return JSON.parse(src.slice(a + BEGIN.length, b));
}

/**
 * از روی کاندیدها و شناسهٔ پیام‌های تأییدشده، لیست نهایی را می‌سازد.
 * متن‌ها عیناً از کاندیدها کپی می‌شوند؛ هیچ ویرایشی انجام نمی‌شود.
 */
export function buildApproved(candidates, approvedIds) {
  const ids = new Set(approvedIds);
  const out = [];
  for (const ex of candidates) {
    let pushedInExcerpt = false;
    ex.messages.forEach((m, i) => {
      if (!ids.has(m.id)) return;
      const prevApproved = i > 0 && ids.has(ex.messages[i - 1].id);
      const item = {
        id: m.id,
        sender: m.sender,
        date: m.date,
        time: m.time,
        text: m.text,
        excerptId: ex.id,
        excerptTitle: ex.title,
        category: ex.category,
      };
      if (pushedInExcerpt && !prevApproved) item.gapBefore = true;
      pushedInExcerpt = true;
      out.push(item);
    });
  }
  return out;
}

export function renderApprovedTs(list) {
  const header = fs.readFileSync(headerFile, 'utf8');
  return `${header}${JSON.stringify(list, null, 1)} ${END};\n`;
}
