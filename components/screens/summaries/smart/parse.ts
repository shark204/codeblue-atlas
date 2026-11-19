// Smart content parser.

export type TreeItem = { text: string; depth: number };

export type SmartNode =
  | { kind: 'md'; text: string }
  | { kind: 'tree'; items: TreeItem[] }
  | { kind: 'table'; header: string[]; rows: string[][] }
  | { kind: 'pre'; text: string }                                  // ← NEW
  | { kind: 'flow'; steps: string[]; label?: string }
  | { kind: 'inline'; parts: { t: 'text' | 'math'; v: string }[]; bullet: boolean }
  | { kind: 'math'; tex: string }
  | { kind: 'callout'; variant: 'core' | 'pearls' | 'remember'; title: string; body: string; children: SmartNode[] };

// ───────────────────────── LaTeX → readable text ─────────────────────────

const GREEK: Record<string, string> = {
  alpha: 'α', beta: 'β', gamma: 'γ', delta: 'δ', epsilon: 'ε', kappa: 'κ', lambda: 'λ',
  mu: 'μ', pi: 'π', sigma: 'σ', tau: 'τ', omega: 'ω', Delta: 'Δ', Omega: 'Ω',
};
const SYMBOLS: Record<string, string> = {
  times: '×', approx: '≈', leq: '≤', geq: '≥', le: '≤', ge: '≥', neq: '≠', pm: '±',
  uparrow: '↑', downarrow: '↓', rightarrow: '→', leftarrow: '←', to: '→',
  Rightarrow: '⇒', leftrightarrow: '↔', degree: '°', cdot: '·', mu: 'μ',
};
const SUP: Record<string, string> = {
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
  '+': '⁺', '-': '⁻',
};
const SUB: Record<string, string> = {
  '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
  '+': '₊', '-': '₋',
};

function mapChars(s: string, table: Record<string, string>): string | null {
  let out = '';
  for (const ch of s) {
    if (!table[ch]) return null;
    out += table[ch];
  }
  return out;
}

function matchBrace(s: string, open: number): number {
  let depth = 0;
  for (let i = open; i < s.length; i++) {
    if (s[i] === '{') depth++;
    else if (s[i] === '}') {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

export function cleanLatex(input: string): string {
  let s = input;

  s = s.replace(/\\(?:text|mathrm|textbf|mathbf|textit)\{([^{}]*)\}/g, '$1');

  for (let guard = 0; guard < 10; guard++) {
    const at = s.indexOf('\\frac{');
    if (at === -1) break;
    const aOpen = at + 5;
    const aClose = matchBrace(s, aOpen);
    if (aClose === -1 || s[aClose + 1] !== '{') break;
    const bClose = matchBrace(s, aClose + 1);
    if (bClose === -1) break;
    const a = s.slice(aOpen + 1, aClose);
    const b = s.slice(aClose + 2, bClose);
    s = s.slice(0, at) + `(${cleanLatex(a)}) ÷ (${cleanLatex(b)})` + s.slice(bClose + 1);
  }

  s = s.replace(/\\%/g, '%').replace(/\\&/g, '&').replace(/\\_/g, '_').replace(/\\\$/g, '$');
  s = s.replace(/\\([a-zA-Z]+)/g, (m, name) => GREEK[name] ?? SYMBOLS[name] ?? m);

  s = s.replace(/\^\{?([0-9+\-]+)\}?/g, (m, g) => mapChars(g, SUP) ?? m);
  s = s.replace(/_\{?([0-9+\-]+)\}?/g, (m, g) => mapChars(g, SUB) ?? m);

  s = s.replace(/(\d)--(\d)/g, '$1–$2');

  s = s.replace(/\\[ ,;!]/g, ' ');
  return s;
}

export function splitInlineMath(line: string): { t: 'text' | 'math'; v: string }[] | null {
  const at = line.indexOf('\\frac{');
  if (at === -1) return null;
  const aClose = matchBrace(line, at + 5);
  if (aClose === -1 || line[aClose + 1] !== '{') return null;
  const bClose = matchBrace(line, aClose + 1);
  if (bClose === -1) return null;

  let start = at;
  const before = line.slice(0, at);
  const prefix = before.match(/(?:\\text\{[^}]*\}|[A-Za-z]+)\s*=\s*$/);
  if (prefix) start = at - prefix[0].length;

  const parts: { t: 'text' | 'math'; v: string }[] = [];
  const pre = line.slice(0, start);
  const post = line.slice(bClose + 1).replace(/^\)/, '');
  if (pre.trim()) parts.push({ t: 'text', v: cleanLatex(pre) });
  parts.push({ t: 'math', v: line.slice(start, bClose + 1).trim() });
  if (post.trim()) parts.push({ t: 'text', v: cleanLatex(post) });
  return parts;
}

// ───────────────────────── Detectors ─────────────────────────

const TREE_LINE = /^[\s│|]*[├└┣┗+`]\s*[─━\-—–]{1,}\s*\S/;
const TREE_PARSE = /^([\s│|]*)[├└┣┗+`]\s*[─━\-—–]{1,}\s*(.*)$/;

// 🆕 ASCII border:  +----+----+   or   +====+====+
const ASCII_BORDER = /^\s*\+[-=+]{3,}\+\s*$/;

function parseTree(lines: string[]): TreeItem[] {
  const items: TreeItem[] = [];
  const stack: number[] = [];
  for (const raw of lines) {
    const m = raw.match(TREE_PARSE);
    if (!m) continue;
    const width = m[1].replace(/[│|]/g, ' ').replace(/\t/g, '    ').length;
    while (stack.length && stack[stack.length - 1] > width) stack.pop();
    if (!stack.length || stack[stack.length - 1] < width) stack.push(width);
    items.push({ text: cleanLatex(m[2].trim()), depth: stack.length - 1 });
  }
  return items;
}

const ARROW_SPLIT = /\s*(?:→|⟶|⇒|-->|->|=>)\s*/;

function isFlowLine(t: string): boolean {
  if (t.length < 12 || t.length > 260) return false;
  if (/^[#>|*\-•]\s/.test(t) && !/→|⟶|⇒/.test(t)) return false;
  const parts = t.split(ARROW_SPLIT).filter(Boolean);
  return parts.length >= 3 && parts.every((p) => p.length <= 70);
}

/** Split a table row into cells. Returns [] for ASCII border lines. */
function splitTableRow(line: string): string[] {
  if (ASCII_BORDER.test(line)) return [];                 // 🆕 skip borders
  if (line.includes('\t')) return line.split('\t').map((c) => c.trim());
  if (/^\s*\|.*\|\s*$/.test(line)) {
    return line.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
  }
  return line.split(/\s{3,}/).map((c) => c.trim());
}

function isSeparatorRow(cells: string[]): boolean {
  if (cells.length === 0) return true;                    // border line
  return cells.every((c) => /^:?-{2,}:?$/.test(c));
}

function looksTabular(line: string): boolean {
  if (ASCII_BORDER.test(line)) return true;               // 🆕 +---+---+
  if (/^\s*\|.*\|\s*$/.test(line)) return true;           // | a | b |
  if ((line.match(/\t/g) || []).length >= 2) return true; // tabs
  return false;
}

// ───────────────────────── Main entry ─────────────────────────

const CALLOUT_HEAD =
  /^\s*(?:#{1,6}\s*|\*{1,2}\s*)?(clinical core|mcq pearls|exam pearls|must remember)\s*(?:\*{1,2})?\s*:?\s*(?:\*{1,2})?\s*$/i;

function calloutVariant(name: string): 'core' | 'pearls' | 'remember' {
  const n = name.toLowerCase();
  if (n.includes('pearls')) return 'pearls';
  if (n.includes('remember')) return 'remember';
  return 'core';
}

const BULLET_LINE = /^\s*(?:[-*•+]|\d+[.)])\s+/;

function splitCallouts(text: string): SmartNode[] {
  const lines = text.split('\n');
  const out: SmartNode[] = [];
  let buf: string[] = [];
  let cur: { variant: 'core' | 'pearls' | 'remember'; title: string; body: string[] } | null = null;
  let prevBlank = false;

  const flushPlain = () => {
    if (buf.join('').trim()) out.push({ kind: 'md', text: buf.join('\n') });
    buf = [];
  };
  const flushCallout = () => {
    if (cur && cur.body.join('').trim()) {
      const body = cur.body.join('\n');
      out.push({
        kind: 'callout',
        variant: cur.variant,
        title: cur.title,
        body,
        children: cur.variant === 'core' ? parseSmart(body, { skipCallouts: true }) : [],
      });
    }
    cur = null;
  };

  for (const line of lines) {
    const m = line.match(CALLOUT_HEAD);
    if (m) {
      flushPlain();
      flushCallout();
      cur = { variant: calloutVariant(m[1]), title: m[1].replace(/\b\w/g, (c) => c.toUpperCase()), body: [] };
      prevBlank = false;
      continue;
    }
    const inline = line.match(/^\s*(?:[*\-•]\s*)?(must remember|mcq pearls)\s*:\s*(\S.*)$/i);
    if (inline && !cur) {
      flushPlain();
      out.push({
        kind: 'callout',
        variant: calloutVariant(inline[1]),
        title: inline[1].replace(/\b\w/g, (c) => c.toUpperCase()),
        body: `- ${inline[2]}`,
        children: [],
      });
      continue;
    }

    if (cur && cur.variant !== 'core' && line.trim() && prevBlank && !BULLET_LINE.test(line) && cur.body.some((l) => l.trim())) {
      flushCallout();
    }

    (cur ? cur.body : buf).push(line);
    prevBlank = !line.trim();
  }
  flushPlain();
  flushCallout();
  return out;
}

function splitStructures(text: string): SmartNode[] {
  const lines = text.split('\n');
  const out: SmartNode[] = [];
  let md: string[] = [];
  const flushMd = () => {
    if (md.join('').trim()) out.push({ kind: 'md', text: md.join('\n') });
    md = [];
  };

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    if (/^\s*(\$\$|\\\[)/.test(line)) {
      const closer = line.trim().startsWith('$$') ? '$$' : '\\]';
      const opener = line.trim().startsWith('$$') ? '$$' : '\\[';
      let body = line.trim().slice(opener.length);
      let j = i;
      if (body.includes(closer)) {
        body = body.slice(0, body.indexOf(closer));
      } else {
        const acc = [body];
        j = i + 1;
        while (j < lines.length && !lines[j].includes(closer)) acc.push(lines[j++]);
        if (j < lines.length) acc.push(lines[j].slice(0, lines[j].indexOf(closer)));
        body = acc.join('\n');
      }
      flushMd();
      out.push({ kind: 'math', tex: body.trim() });
      i = j + 1;
      continue;
    }

    if (TREE_LINE.test(line) && !ASCII_BORDER.test(line)) {
      let j = i;
      const treeLines: string[] = [];
      while (j < lines.length && (TREE_LINE.test(lines[j]) || (!lines[j].trim() && TREE_LINE.test(lines[j + 1] || '')))) {
        if (lines[j].trim()) treeLines.push(lines[j]);
        j++;
      }
      const items = parseTree(treeLines);
      if (items.length >= 2) {
        flushMd();
        out.push({ kind: 'tree', items });
        i = j;
        continue;
      }
    }

    // ═══ Tables & ASCII diagrams ═══
    if (looksTabular(line)) {
      let j = i;
      const rows: string[][] = [];
      let hasBorder = false;
      while (j < lines.length && looksTabular(lines[j])) {
        if (ASCII_BORDER.test(lines[j])) hasBorder = true;
        const cells = splitTableRow(lines[j]);
        if (!isSeparatorRow(cells) && cells.length > 0) rows.push(cells);
        j++;
      }

      const width = rows.length > 0 ? Math.max(...rows.map((r) => r.length)) : 0;

      // ✅ real table: 2+ columns
      if (rows.length >= 2 && width >= 2) {
        flushMd();
        out.push({
          kind: 'table',
          header: rows[0]
            .slice(0, width)
            .concat(Array(Math.max(0, width - rows[0].length)).fill(''))
            .map(cleanLatex),
          rows: rows.slice(1).map((r) => {
            const fixed = r.slice(0, width);
            while (fixed.length < width) fixed.push('');
            return fixed.map(cleanLatex);
          }),
        });
        i = j;
        continue;
      }

      // ✅ single-column ASCII box → render as monospace diagram
      if (hasBorder && rows.length >= 1) {
        flushMd();
        out.push({ kind: 'pre', text: lines.slice(i, j).join('\n') });
        i = j;
        continue;
      }
    }

    if (isFlowLine(line.trim())) {
      flushMd();
      const steps = line.trim().split(ARROW_SPLIT).filter(Boolean).map(cleanLatex);
      let label: string | undefined;
      const lm = steps[0].match(/^([^:]{2,30}):\s*(.+)$/);
      if (lm) { label = lm[1]; steps[0] = lm[2]; }
      out.push({ kind: 'flow', steps, label });
      i++;
      continue;
    }

    if (/\\frac\{/.test(line)) {
      const bullet = BULLET_LINE.test(line);
      const parts = splitInlineMath(line.replace(BULLET_LINE, ''));
      if (parts) {
        flushMd();
        if (parts.length === 1 && parts[0].t === 'math') out.push({ kind: 'math', tex: parts[0].v });
        else out.push({ kind: 'inline', parts, bullet });
        i++;
        continue;
      }
    }

    md.push(line);
    i++;
  }
  flushMd();
  return out;
}

export function parseSmart(text: string, opts: { skipCallouts?: boolean } = {}): SmartNode[] {
  if (!text?.trim()) return [];
  const top = opts.skipCallouts ? [{ kind: 'md', text } as SmartNode] : splitCallouts(text);
  const out: SmartNode[] = [];
  for (const node of top) {
    if (node.kind === 'md') {
      for (const n of splitStructures(node.text)) {
        out.push(n.kind === 'md' ? { kind: 'md', text: cleanLatex(n.text) } : n);
      }
    } else {
      out.push(node);
    }
  }
  return out;
}

// ───────────────────────── Pearl → recall card ─────────────────────────

const CLOZE_SPLIT =
  /^(.{8,}?)\s(\bis\b|\bare\b|\bsuggests\b|\bindicates\b|\bpoints to\b|\bpresents with\b|\bis characterized by\b|\bis diagnosed by\b|\bis treated with\b|\bis the\b|=|→|:)\s+(.{3,})$/i;

export function toRecallCard(pearl: string): { prompt: string; answer: string } | null {
  const clean = pearl.replace(/\*\*/g, '').trim();
  const m = clean.match(CLOZE_SPLIT);
  if (!m) return null;
  const prompt = `${m[1]} ${m[2]}`;
  const answer = m[3];
  if (answer.length > 180) return null;
  return { prompt, answer };
}

export function bulletsOf(body: string): string[] {
  const items: string[] = [];
  for (const line of body.split('\n')) {
    const m = line.match(/^\s*(?:[-*•+]|\d+[.)])\s+(.*)$/);
    if (m) items.push(m[1].trim());
    else if (line.trim() && items.length) items[items.length - 1] += ' ' + line.trim();
    else if (line.trim()) items.push(line.trim());
  }
  return items.map(cleanLatex);
}