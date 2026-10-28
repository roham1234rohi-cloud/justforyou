/** یکسان‌سازی متن فارسی برای مقایسهٔ رمز و جستجو. */
export function normalizeFa(input: string): string {
  return input
    .normalize('NFKC')
    .replace(/[\u064A\u0649\u06CC]/g, 'ی')
    .replace(/[\u0643\u06A9]/g, 'ک')
    .replace(/[\u06C0\u0629]/g, 'ه')
    .replace(/[\u0640\u200c\u200d\u200e\u200f\u064B-\u065F\u0670]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

const MONTHS_FA = [
  'ژانویه', 'فوریه', 'مارس', 'آوریل', 'مه', 'ژوئن',
  'ژوئیه', 'اوت', 'سپتامبر', 'اکتبر', 'نوامبر', 'دسامبر',
];

export function faNumber(n: number): string {
  try {
    return n.toLocaleString('fa-IR');
  } catch {
    return String(n);
  }
}

function faDigits(s: string): string {
  return s.replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]);
}

/** «2026/10/22» (میلادی) → «۲۲ اکتبر ۲۰۲۶». */
export function formatArchiveDate(date: string): string {
  const m = /^(\d{4})\/(\d{2})\/(\d{2})$/.exec(date);
  if (!m) return date;
  const month = MONTHS_FA[Number(m[2]) - 1];
  if (!month) return date;
  return faDigits(`${Number(m[3])} ${month} ${m[1]}`);
}

/** «01:45:12» → «۰۱:۴۵». */
export function formatArchiveTime(time: string): string {
  const m = /^(\d{2}):(\d{2})/.exec(time);
  return m ? faDigits(`${m[1]}:${m[2]}`) : time;
}
