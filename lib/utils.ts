// lib/utils.ts

export const getCorrectLetter = (ans: string | null | undefined): string => {
  if (!ans) return 'A';
  const str = String(ans).trim().toUpperCase();
  const match = str.match(/\b([A-E])\b/);
  if (match) return match[1];
  const lastChar = str.slice(-1);
  if (['A', 'B', 'C', 'D', 'E'].includes(lastChar)) return lastChar;
  return str.charAt(0);
};

export const getToastStyle = (type: string | undefined, isDark: boolean): string => {
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
    if (char === '"' && text[i + 1] === '"') {
      cell += '"';
      i++;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      row.push(cell.trim());
      cell = '';
    } else if (char === '\n' && !inQuotes) {
      row.push(cell.trim());
      result.push(row);
      row = [];
      cell = '';
    } else {
      cell += char;
    }
  }
  if (cell || row.length) {
    row.push(cell.trim());
    result.push(row);
  }
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
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });

    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) return [];

    const worksheet = workbook.Sheets[firstSheetName];
    const rows: any[][] = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: '',
      blankrows: false,
      raw: false,
    });

    if (rows.length > 5000) {
      throw new Error(`الملف فيه ${rows.length} صف — الحد الأقصى 5000 صف لكل ملف`);
    }

    return rows.map(row =>
      row.map(cell => (cell === null || cell === undefined ? '' : String(cell).trim()))
    );
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