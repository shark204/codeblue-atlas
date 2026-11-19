export type ContentSection = { id: string; title: string; body: string };

const isHeading = (t: string): boolean => {
  if (!t) return false;
  if (/^[*-•]\s|^\||^>|^#/.test(t)) return false;
  if (/^\d+\.\d+(\.\d+)*\.?\s+[A-Z]/.test(t)) return true;
  // ⚠️ شيلنا "Must Remember" و "MCQ Pearls" — هيتجمعوا في Exam Pearls
  if (/^(Clinical Core|Exam Pearls|Clinical Analysis & Core Directives|Overview|Introduction)$/i.test(t)) return true;
  if (/^\d+\.\s/.test(t)) return false;
  const wordCount = t.split(/\s+/).length;
  if (wordCount < 2 || wordCount > 6) return false;
  if (t.length > 60) return false;
  if (!/^[A-Z]/.test(t)) return false;
  if (/[.!?:;,]\s*$/.test(t)) return false;
  if (t.includes(':') || t.includes(',')) return false;
  const titleCaseWords = t.split(/\s+/).filter((w) => /^[A-Z]/.test(w) || /^(and|of|the|in|to|for|a|an|on|at|&)$/i.test(w)).length;
  return titleCaseWords / wordCount >= 0.7;
};

// ✅ أي من الاتنين دول يبدأ قسم "Exam Pearls"
const EXAM_HEAD = /^(?:\*{1,2}\s*)?(mcq pearls|must remember|exam pearls)\s*(?:\*{1,2})?\s*:?\s*$/i;

const CALLOUT = /^(Must Remember|MCQ Pearls|Clinical Core|Exam Pearls)$/i;

export function splitContentByHeadings(content: string): ContentSection[] {
  if (!content?.trim()) return [];
  const raw: { title: string; lines: string[] }[] = [];
  let title = '';
  let lines: string[] = [];
  let inExamPearls = false;

  const flush = () => {
    if (lines.length || title) raw.push({ title, lines: [...lines] });
    lines = [];
  };

  for (const line of content.split('\n')) {
    const t = line.trim();

    // ✅ MCQ Pearls أو Must Remember → يبدأوا/يكملوا قسم Exam Pearls
    if (EXAM_HEAD.test(t)) {
      if (!inExamPearls) {
        flush();
        title = 'Exam Pearls';
        inExamPearls = true;
      }
      const label = t.replace(/\*+/g, '').replace(/:\s*$/, '').trim();
      lines.push(`**${label}**`, '');
      continue;
    }

    // أي heading تاني يقفل قسم Exam Pearls
    if (isHeading(t)) {
      flush();
      inExamPearls = false;
      title = t;
      continue;
    }

    lines.push(line);
  }
  flush();

  const out: ContentSection[] = [];
  for (const r of raw) {
    let body = r.lines.join('\n').trim();
    if (body.length < 5) continue;
    if (CALLOUT.test(r.title)) body = `${r.title}\n${body}`;
    out.push({ id: `h-${out.length}`, title: r.title || 'Introduction', body });
  }
  return out;
}

export function markHeadings(body: string): string {
  const out: string[] = [];
  let prevWasBlank = true;
  for (const line of body.split('\n')) {
    const t = line.trim();
    if (!t) { out.push(''); prevWasBlank = true; continue; }
    if (/^#{1,6}\s|^[*\-•+]\s|^\d+[.)]\s|^\||^>/.test(t)) { out.push(line); prevWasBlank = false; continue; }
    const wordCount = t.split(/\s+/).length;
    const looksHeading =
      prevWasBlank && t.length >= 20 && t.length <= 120 && /^[A-Z]/.test(t) && wordCount >= 3 &&
      !/\t/.test(t) && !/[.!?]\s*$/.test(t);
    out.push(looksHeading ? `### ${t}` : line);
    prevWasBlank = false;
  }
  return out.join('\n');
}