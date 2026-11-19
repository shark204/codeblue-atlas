// lib/helpers.ts

// ============ الأنواع ============
export type Question = {
  id: number;
  Theme_Category: string;
  Question_Text: string;
  Option_A: string | null;
  Option_B: string | null;
  Option_C: string | null;
  Option_D: string | null;
  Option_E: string | null;
  Correct_Answer: string;
  Explanation: string;
  source_file: string | null;
  Difficulty: number;
};

export type ScreenType =
  | 'landing' | 'dashboard' | 'session_view' | 'exam_intro' | 'exam'
  | 'analytics' | 'settings' | 'review_gallery' | 'admin'
  | 'study_room' | 'study_room_live' | 'flashcards' | 'notebook'
  | 'undergraduate' | 'features' | 'badges' | 'courses'
  | 'bookmarks' | 'leaderboard' | 'atlas';

// ============ الدوال ============
export const getCorrectLetter = (ans: string | null | undefined): string => {
  if (!ans) return 'A';
  const str = String(ans).trim().toUpperCase();
  const match = str.match(/\b([A-E])\b/);
  if (match) return match[1];
  const lastChar = str.slice(-1);
  if (['A','B','C','D','E'].includes(lastChar)) return lastChar;
  return str.charAt(0);
};

export const getToastStyle = (type: string | undefined, isDark: boolean) => {
  if (type === 'success') return isDark
    ? 'bg-emerald-950/90 text-emerald-200 border-emerald-800'
    : 'bg-emerald-50 text-emerald-800 border-emerald-200';
  if (type === 'error') return isDark
    ? 'bg-rose-950/90 text-rose-200 border-rose-800'
    : 'bg-rose-50 text-rose-800 border-rose-200';
  return isDark
    ? 'bg-blue-950/90 text-blue-200 border-blue-800'
    : 'bg-blue-50 text-blue-800 border-blue-200';
};

export const parseCSV = (text: string): string[][] => {
  const result: string[][] = [];
  let row: string[] = [];
  let inQuotes = false;
  let cell = '';
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"' && text[i+1] === '"') { cell += '"'; i++; }
    else if (char === '"') { inQuotes = !inQuotes; }
    else if (char === ',' && !inQuotes) { row.push(cell.trim()); cell = ''; }
    else if (char === '\n' && !inQuotes) { row.push(cell.trim()); result.push(row); row = []; cell = ''; }
    else { cell += char; }
  }
  if (cell || row.length) { row.push(cell.trim()); result.push(row); }
  return result;
};

export const readFileAsRows = async (file: File): Promise<string[][]> => {
  const ext = file.name.toLowerCase().split('.').pop() || '';
  if (ext === 'csv') {
    const text = await file.text();
    const clean = text.charCodeAt(0) === 0xFEFF ? text.slice(1) : text;
    return parseCSV(clean);
  }
  if (ext === 'xlsx' || ext === 'xls') {
    const XLSX = await import('xlsx');
    const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows: any[][] = XLSX.utils.sheet_to_json(sheet, {
      header: 1, defval: '', blankrows: false, raw: false,
    });
    if (rows.length > 5000) {
      throw new Error(`الملف فيه ${rows.length} صف — الحد الأقصى 5000`);
    }
    return rows.map(r => r.map(c => c == null ? '' : String(c).trim()));
  }
  throw new Error(`Unsupported file type: ${ext}`);
};

export const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const motivationalQuotes = [
  "Fantastic job, Doctor! Consistency is the true key to passing your exams.",
  "Brilliant performance! Every question you conquer brings you closer to your goals.",
  "Outstanding effort! Mastery is made through relentless practice just like this.",
  "Keep up the exceptional work! Your dedication to medical excellence is inspiring."
];