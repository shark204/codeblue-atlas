import type { ContentSection } from './types';

export function normalizeTitle(s: string): string {
  return s
    .toLowerCase()
    .replace(/^\d+(\.\d+)*\.?\s*/, '')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]/g, '');
}

export function toSlug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function markHeadings(body: string): string {
  const lines = body.split('\n');
  const out: string[] = [];
  let prevWasBlank = true;

  for (const line of lines) {
    const t = line.trim();
    if (!t) { out.push(''); prevWasBlank = true; continue; }

    if (/^#{1,6}\s|^[*\-•+]\s|^\d+[.)]\s|^\||^>/.test(t)) {
      out.push(line); prevWasBlank = false; continue;
    }

    const wordCount = t.split(/\s+/).length;
    const looksHeading =
      prevWasBlank && t.length >= 20 && t.length <= 120 &&
      /^[A-Z]/.test(t) && wordCount >= 3 &&
      !/\t/.test(t) && !/[.!?]\s*$/.test(t);

    out.push(looksHeading ? `### ${t}` : line);
    prevWasBlank = false;
  }
  return out.join('\n');
}

export function splitContentByHeadings(content: string): ContentSection[] {
  if (!content?.trim()) return [];
  const lines = content.split('\n');
  const raw: { title: string; bodyLines: string[] }[] = [];
  let currentTitle = '';
  let currentBodyLines: string[] = [];

  const isHeading = (t: string): boolean => {
    if (!t) return false;
    if (/^[*-•]\s|^\||^>|^#/.test(t)) return false;
    if (/^\d+\.\d+(\.\d+)*\.?\s+[A-Z]/.test(t)) return true;
    if (/^(Must Remember|MCQ Pearls|Clinical Core|Exam Pearls|Clinical Analysis & Core Directives|Overview|Introduction)$/i.test(t)) return true;
    if (/^\d+\.\s/.test(t)) return false;
    const wordCount = t.split(/\s+/).length;
    if (wordCount < 2 || wordCount > 6) return false;
    if (t.length > 60) return false;
    if (!/^[A-Z]/.test(t)) return false;
    if (/[.!?:;,]\s*$/.test(t)) return false;
    if (t.includes(':') || t.includes(',')) return false;
    const titleCaseWords = t.split(/\s+/).filter(w =>
      /^[A-Z]/.test(w) || /^(and|of|the|in|to|for|a|an|on|at|&)$/i.test(w)
    ).length;
    if (titleCaseWords / wordCount < 0.7) return false;
    return true;
  };

  for (const line of lines) {
    const t = line.trim();
    if (isHeading(t)) {
      if (currentBodyLines.length > 0 || currentTitle) {
        raw.push({ title: currentTitle, bodyLines: currentBodyLines });
      }
      currentTitle = t;
      currentBodyLines = [];
    } else {
      currentBodyLines.push(line);
    }
  }
  if (currentBodyLines.length > 0 || currentTitle) {
    raw.push({ title: currentTitle, bodyLines: currentBodyLines });
  }

  const sections: ContentSection[] = [];
  for (const r of raw) {
    const title = r.title || 'Introduction';
    const body = r.bodyLines.join('\n').trim();
    if (body.length < 5) continue;
    sections.push({ id: `h-${sections.length}`, title, body });
  }
  return sections;
}