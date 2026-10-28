export type ChapterId =
  | 'memories'
  | 'diary'
  | 'difficult'
  | 'happy'
  | 'nostalgic'
  | 'small'
  | 'final';

export type MessageCategory = 'humor' | 'memories' | 'meaningful';
export type SenderId = 'raham' | 'setareh';

/** یک پیام، دقیقاً همان‌طور که در فایل پشتیبان بود. */
export interface ArchiveMessage {
  id: string;
  sender: SenderId;
  date: string; // مثل 2026/10/22 (میلادی، همان‌طور که در فایل بود)
  time: string; // مثل 01:45:12
  text: string;
}

/** یک «قطعه» از گفتگو که برای بازبینی پیشنهاد شده. */
export interface CandidateExcerpt {
  id: string;
  category: MessageCategory;
  title: string;
  messages: ArchiveMessage[];
}

/** پیامِ تأییدشده؛ فقط همین نوع وارد سایت می‌شود. */
export interface ApprovedMessage extends ArchiveMessage {
  excerptId: string;
  excerptTitle: string;
  category: MessageCategory;
  /** true یعنی بین این پیام و پیامِ قبلیِ نمایش‌داده‌شده، پیام‌هایی کنار گذاشته شده‌اند. */
  gapBefore?: boolean;
}

export interface ChapterMeta {
  id: ChapterId;
  title: string;
  blurb: string;
}

export interface LetterData {
  id: ChapterId;
  title: string;
  /** خط کوچک زیر عنوان */
  kicker: string;
  paragraphs: string[];
  /** جملهٔ پایانیِ برجسته */
  closing?: string;
  /** امضا */
  signature?: string;
}

export interface DiaryEntry {
  id: string;
  title: string;
  lines: string[];
}
