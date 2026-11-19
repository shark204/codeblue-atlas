'use client';

import type { AiProvider, FiledMode, Language, UserProfile } from "./schemas";

/**
 * Web-native Study Journal & Persistence Engine for Code Blue 3D Anatomy Atlas.
 *
 * Replaces the Tauri desktop SQLite backend (`study_db.rs`) with a complete,
 * zero-dependency browser persistence layer stored in `localStorage` under
 * `anatria3d.journal.v1`, plus native browser JSON export/import and PNG
 * viewport capture download.
 */

export interface SessionSummary {
  id: string;
  kind: FiledMode;
  title: string;
  profile: UserProfile;
  language: Language;
  score: number | null;
  verdict: string | null;
  message_count: number;
  structure_count: number;
  case_id: string | null;
  visit_no: number | null;
  created_at: number;
  updated_at: number;
}

export interface StoredMessage {
  role: "user" | "assistant";
  content: string;
  created_at: number;
  model: string | null;
  input_tokens: number | null;
  output_tokens: number | null;
  cache_read_tokens: number | null;
  commands?: string;
}

export interface SessionDetail {
  session: SessionSummary;
  messages: StoredMessage[];
  structures: string[];
}

export interface StudyNote {
  id: number;
  organ_id: string | null;
  organ_label: string | null;
  session_id: string | null;
  body: string;
  created_at: number;
  updated_at: number;
}

export interface StudyStats {
  sessions: number;
  cases: number;
  graded_cases: number;
  notes: number;
  average_score: number | null;
}

export interface TurnInput {
  session_id: string;
  kind: FiledMode;
  title: string;
  profile: UserProfile;
  language: Language;
  question: string;
  answer: string;
  organ_ids: string[];
  model?: string | null;
  input_tokens?: number | null;
  output_tokens?: number | null;
  cache_read_tokens?: number | null;
  commands?: string | null;
  case_id?: string | null;
}

export interface NoteInput {
  organ_id: string | null;
  organ_label: string | null;
  session_id: string | null;
  body: string;
}

export type CaseSex = "male" | "female";

export interface CaseFile {
  id: string;
  title: string;
  sex: CaseSex;
  age_years: number | null;
  height_cm: number | null;
  weight_kg: number | null;
  findings: string;
  sealed_at: number;
  revealed_at: number | null;
  profile: UserProfile;
  language: Language;
  created_at: number;
  updated_at: number;
  visit_count: number;
}

export interface CaseInput {
  id: string;
  title: string;
  sex: CaseSex;
  age_years?: number | null;
  height_cm?: number | null;
  weight_kg?: number | null;
  findings: string;
  ground_truth: string;
  profile: UserProfile;
  language: Language;
}

export interface CaseVisit {
  session_id: string;
  visit_no: number;
  score: number | null;
  verdict: string | null;
  structures: string[];
  created_at: number;
}

export interface CaseSymptom {
  id: number;
  organ_id: string;
  organ_label: string | null;
  symptom: string;
  severity: number | null;
  session_id: string | null;
  created_at: number;
}

export interface SymptomInput {
  case_id: string;
  session_id?: string | null;
  organ_id: string;
  organ_label?: string | null;
  symptom: string;
  severity?: number | null;
}

export interface CaseFinding {
  id: number;
  visit_no: number;
  body: string;
  created_at: number;
}

export interface FindingInput {
  case_id: string;
  body: string;
}

export interface CaseDigest {
  case: CaseFile;
  ground_truth: string;
  visits: CaseVisit[];
  symptoms: CaseSymptom[];
  record_updates: CaseFinding[];
}

export const MAX_SEVERITY = 10;
export const MAX_VISITS = 20;

export interface StudyCoverage {
  organ_id: string;
  touches: number;
}

export interface UsageInput {
  session_id: string | null;
  provider: AiProvider;
  model: string;
  input_tokens: number;
  output_tokens: number;
  cache_read_tokens: number;
}

export interface UsageBucket {
  day: string;
  provider: AiProvider;
  model: string;
  input_tokens: number;
  output_tokens: number;
  cache_read_tokens: number;
  turns: number;
}

export interface ImportSummary {
  sessions_added: number;
  sessions_updated: number;
  notes_added: number;
  notes_updated: number;
  cases_added: number;
  skipped: number;
}

// ---------------------------------------------------------------------------
// Internal Journal Store Structure in localStorage
// ---------------------------------------------------------------------------

interface StoredCaseRecord extends CaseFile {
  ground_truth: string;
}

interface StoredSymptomRecord extends CaseSymptom {
  case_id: string;
}

interface StoredFindingRecord extends CaseFinding {
  case_id: string;
}

interface StoredUsageRow extends UsageInput {
  day: string;
  created_at: number;
}

interface JournalDatabase {
  version: number;
  nextNoteId: number;
  nextSymptomId: number;
  nextFindingId: number;
  sessions: Record<string, SessionDetail>;
  notes: StudyNote[];
  cases: Record<string, StoredCaseRecord>;
  symptoms: StoredSymptomRecord[];
  findings: StoredFindingRecord[];
  usage: StoredUsageRow[];
}

const DB_KEY = "anatria3d.journal.v1";

function createStarterDb(): JournalDatabase {
  const now = Date.now();
  const starterCaseId = "case-mrcs-appendicitis-01";
  const starterSessionId = "session-mrcs-heart-01";
  return {
    version: 1,
    nextNoteId: 2,
    nextSymptomId: 2,
    nextFindingId: 2,
    sessions: {
      [starterSessionId]: {
        session: {
          id: starterSessionId,
          kind: "tutor",
          title: "Coronary arterial supply & Left Ventricle (MRCS High-Yield)",
          profile: "student",
          language: "en",
          score: null,
          verdict: null,
          message_count: 2,
          structure_count: 2,
          case_id: null,
          visit_no: null,
          created_at: now - 3600_000,
          updated_at: now - 3600_000,
        },
        messages: [
          {
            role: "user",
            content: "Explain the blood supply and surgical relations of the left ventricle.",
            created_at: now - 3600_000,
            model: null,
            input_tokens: null,
            output_tokens: null,
            cache_read_tokens: null,
          },
          {
            role: "assistant",
            content:
              "### Left Ventricle (*Ventriculus sinister*) [[left_ventricle]]\n\n" +
              "The **left ventricle** [[left_ventricle]] forms the apex and diaphragmatic surface of the heart, pumping oxygenated blood into the **ascending aorta** [[ascending_aorta]] across the aortic valve.\n\n" +
              "- **Arterial Supply**: Primarily supplied by the **anterior interventricular branch (LAD)** of the left coronary artery (anterior two-thirds of the septum and anterior wall) and the **circumflex artery** (lateral wall), while the posterior interventricular branch (PDA) supplies the inferior wall.\n" +
              "- **MRCS Clinical Correlation**: Anterior myocardial infarction (LAD occlusion) risks left ventricular apical thrombus, papillary muscle rupture, and interventricular septal perforation.",
            created_at: now - 3590_000,
            model: "codeblue-anatomy-engine",
            input_tokens: 320,
            output_tokens: 185,
            cache_read_tokens: 0,
            commands: JSON.stringify([
              { action: "focus_organ", organ_id: "left_ventricle" },
            ]),
          },
        ],
        structures: ["left_ventricle", "ascending_aorta"],
      },
    },
    notes: [
      {
        id: 1,
        organ_id: "left_ventricle",
        organ_label: "Ventriculus sinister",
        session_id: starterSessionId,
        body: "MRCS Note: Left ventricular wall is 3x thicker than right ventricle (8–12 mm vs 3–4 mm). Apex beat lies in the 5th left intercostal space, mid-clavicular line.",
        created_at: now - 3500_000,
        updated_at: now - 3500_000,
      },
    ],
    cases: {
      [starterCaseId]: {
        id: starterCaseId,
        title: "24yo M — Migratory umbilical to RIF pain",
        sex: "male",
        age_years: 24,
        height_cm: 178,
        weight_kg: 74,
        findings:
          "24-year-old man presenting with 18-hour history of central colicky periumbilical pain that localized to the right iliac fossa (McBurney's point). T 38.1°C, HR 96 bpm, localized rebound tenderness & Rovsing's sign positive, WBC 15.4 × 10⁹/L.",
        ground_truth:
          "Acute appendicitis (vermiform appendix). Early visceral pain is referred via T10 sympathetic afferents to the periumbilical dermatome; once transmural inflammation irritates the parietal peritoneum in the right iliac fossa, somatic pain localizes sharply to McBurney's point (one-third of the distance from right ASIS to umbilicus).",
        sealed_at: now - 7200_000,
        revealed_at: null,
        profile: "student",
        language: "en",
        created_at: now - 7200_000,
        updated_at: now - 7200_000,
        visit_count: 0,
      },
    },
    symptoms: [],
    findings: [],
    usage: [],
  };
}

let memoryDb: JournalDatabase | null = null;

function readDb(): JournalDatabase {
  if (typeof window === "undefined") {
    if (!memoryDb) memoryDb = createStarterDb();
    return memoryDb;
  }
  try {
    const raw = window.localStorage.getItem(DB_KEY);
    if (!raw) {
      const fresh = createStarterDb();
      window.localStorage.setItem(DB_KEY, JSON.stringify(fresh));
      memoryDb = fresh;
      return fresh;
    }
    const parsed = JSON.parse(raw) as JournalDatabase;
    if (parsed && typeof parsed === "object" && parsed.sessions && parsed.cases) {
      memoryDb = parsed;
      return parsed;
    }
  } catch {
    // Fallback
  }
  if (!memoryDb) memoryDb = createStarterDb();
  return memoryDb;
}

function writeDb(db: JournalDatabase): void {
  memoryDb = db;
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DB_KEY, JSON.stringify(db));
  } catch (err) {
    console.warn("[studyDb] Could not persist journal to localStorage:", err);
  }
}

function localDayString(epochMs: number): string {
  const d = new Date(epochMs);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// ---------------------------------------------------------------------------
// Sessions
// ---------------------------------------------------------------------------

export async function saveStudyTurn(turn: TurnInput): Promise<void> {
  const db = readDb();
  const now = Date.now();
  let detail = db.sessions[turn.session_id];

  if (!detail) {
    let visitNo: number | null = null;
    let caseId: string | null = null;
    if (turn.case_id && db.cases[turn.case_id]) {
      caseId = turn.case_id;
      const kase = db.cases[caseId]!;
      visitNo = kase.visit_count + 1;
      kase.visit_count = visitNo;
      kase.updated_at = now;
    }

    detail = {
      session: {
        id: turn.session_id,
        kind: turn.kind,
        title: turn.title.slice(0, 140),
        profile: turn.profile,
        language: turn.language,
        score: null,
        verdict: null,
        message_count: 0,
        structure_count: 0,
        case_id: caseId,
        visit_no: visitNo,
        created_at: now,
        updated_at: now,
      },
      messages: [],
      structures: [],
    };
    db.sessions[turn.session_id] = detail;
  }

  detail.messages.push({
    role: "user",
    content: turn.question,
    created_at: now - 1,
    model: null,
    input_tokens: null,
    output_tokens: null,
    cache_read_tokens: null,
  });

  const assistantMsg: StoredMessage = {
    role: "assistant",
    content: turn.answer,
    created_at: now,
    model: turn.model ?? null,
    input_tokens: turn.input_tokens ?? null,
    output_tokens: turn.output_tokens ?? null,
    cache_read_tokens: turn.cache_read_tokens ?? null,
  };
  if (turn.commands) {
    assistantMsg.commands = turn.commands;
  }
  detail.messages.push(assistantMsg);

  const mergedStructures = new Set([...detail.structures, ...turn.organ_ids]);
  detail.structures = [...mergedStructures];
  detail.session.message_count = detail.messages.length;
  detail.session.structure_count = detail.structures.length;
  detail.session.updated_at = now;

  writeDb(db);
}

export async function recordCaseResult(
  sessionId: string,
  score: number,
  verdict: string,
): Promise<void> {
  const db = readDb();
  const detail = db.sessions[sessionId];
  if (!detail) return;
  detail.session.score = Math.max(0, Math.min(100, Math.round(score)));
  detail.session.verdict = verdict;
  detail.session.updated_at = Date.now();
  writeDb(db);
}

export async function listStudySessions(
  query: string | null,
  organId: string | null,
  caseId: string | null,
  limit = 100,
): Promise<SessionSummary[]> {
  const db = readDb();
  const q = query?.trim().toLowerCase() ?? "";
  const results = Object.values(db.sessions)
    .filter((detail) => {
      if (organId && !detail.structures.includes(organId)) return false;
      if (caseId && detail.session.case_id !== caseId) return false;
      if (q) {
        const inTitle = detail.session.title.toLowerCase().includes(q);
        const inMsgs = detail.messages.some((m) => m.content.toLowerCase().includes(q));
        if (!inTitle && !inMsgs) return false;
      }
      return true;
    })
    .map((d) => ({ ...d.session }))
    .sort((a, b) => b.updated_at - a.updated_at);

  return results.slice(0, limit);
}

export async function getStudySession(sessionId: string): Promise<SessionDetail | null> {
  const db = readDb();
  const detail = db.sessions[sessionId];
  if (!detail) return null;
  return JSON.parse(JSON.stringify(detail)) as SessionDetail;
}

export async function renameStudySession(sessionId: string, title: string): Promise<void> {
  const db = readDb();
  const detail = db.sessions[sessionId];
  if (!detail) return;
  detail.session.title = title.trim() || detail.session.title;
  detail.session.updated_at = Date.now();
  writeDb(db);
}

export async function deleteStudySession(sessionId: string): Promise<void> {
  const db = readDb();
  delete db.sessions[sessionId];
  writeDb(db);
}

// ---------------------------------------------------------------------------
// Case files
// ---------------------------------------------------------------------------

export async function addCaseSymptom(symptom: SymptomInput): Promise<CaseSymptom> {
  const db = readDb();
  const now = Date.now();
  const record: StoredSymptomRecord = {
    id: db.nextSymptomId++,
    case_id: symptom.case_id,
    session_id: symptom.session_id ?? null,
    organ_id: symptom.organ_id,
    organ_label: symptom.organ_label ?? null,
    symptom: symptom.symptom,
    severity:
      typeof symptom.severity === "number"
        ? Math.max(0, Math.min(MAX_SEVERITY, Math.round(symptom.severity)))
        : null,
    created_at: now,
  };
  db.symptoms.push(record);
  if (db.cases[symptom.case_id]) {
    db.cases[symptom.case_id]!.updated_at = now;
  }
  writeDb(db);
  const { case_id: _cid, ...clean } = record;
  return clean;
}

export async function caseSymptoms(caseId: string): Promise<CaseSymptom[]> {
  const db = readDb();
  return db.symptoms
    .filter((s) => s.case_id === caseId)
    .sort((a, b) => a.created_at - b.created_at)
    .map(({ case_id: _cid, ...clean }) => clean);
}

export async function deleteCaseSymptom(id: number): Promise<void> {
  const db = readDb();
  db.symptoms = db.symptoms.filter((s) => s.id !== id);
  writeDb(db);
}

export async function addCaseFinding(finding: FindingInput): Promise<CaseFinding> {
  const db = readDb();
  const now = Date.now();
  const kase = db.cases[finding.case_id];
  const visitNo = kase ? kase.visit_count : 0;
  const record: StoredFindingRecord = {
    id: db.nextFindingId++,
    case_id: finding.case_id,
    visit_no: visitNo,
    body: finding.body,
    created_at: now,
  };
  db.findings.push(record);
  if (kase) kase.updated_at = now;
  writeDb(db);
  const { case_id: _cid, ...clean } = record;
  return clean;
}

export async function caseFindings(caseId: string): Promise<CaseFinding[]> {
  const db = readDb();
  return db.findings
    .filter((f) => f.case_id === caseId)
    .sort((a, b) => a.created_at - b.created_at)
    .map(({ case_id: _cid, ...clean }) => clean);
}

export async function deleteCaseFinding(id: number): Promise<void> {
  const db = readDb();
  db.findings = db.findings.filter((f) => f.id !== id);
  writeDb(db);
}

export async function createCase(kase: CaseInput): Promise<CaseFile> {
  const db = readDb();
  const now = Date.now();
  const record: StoredCaseRecord = {
    id: kase.id,
    title: kase.title,
    sex: kase.sex,
    age_years: kase.age_years ?? null,
    height_cm: kase.height_cm ?? null,
    weight_kg: kase.weight_kg ?? null,
    findings: kase.findings,
    ground_truth: kase.ground_truth,
    sealed_at: now,
    revealed_at: null,
    profile: kase.profile,
    language: kase.language,
    created_at: now,
    updated_at: now,
    visit_count: 0,
  };
  db.cases[kase.id] = record;
  writeDb(db);
  const { ground_truth: _gt, ...publicCase } = record;
  return publicCase;
}

export async function listCases(): Promise<CaseFile[]> {
  const db = readDb();
  return Object.values(db.cases)
    .sort((a, b) => b.updated_at - a.updated_at)
    .map(({ ground_truth: _gt, ...publicCase }) => publicCase);
}

export async function revealCaseAnswer(caseId: string): Promise<string | null> {
  const db = readDb();
  const record = db.cases[caseId];
  if (!record) return null;
  if (!record.revealed_at) {
    record.revealed_at = Date.now();
    record.updated_at = Date.now();
    writeDb(db);
  }
  return record.ground_truth;
}

export async function caseDigest(caseId: string): Promise<CaseDigest | null> {
  const db = readDb();
  const record = db.cases[caseId];
  if (!record) return null;
  const { ground_truth, ...publicCase } = record;

  const visits: CaseVisit[] = Object.values(db.sessions)
    .filter((d) => d.session.case_id === caseId && d.session.visit_no !== null)
    .sort((a, b) => (a.session.visit_no ?? 0) - (b.session.visit_no ?? 0))
    .map((d) => ({
      session_id: d.session.id,
      visit_no: d.session.visit_no ?? 1,
      score: d.session.score,
      verdict: d.session.verdict,
      structures: [...d.structures],
      created_at: d.session.created_at,
    }));

  const symptoms = await caseSymptoms(caseId);
  const record_updates = await caseFindings(caseId);

  return {
    case: publicCase,
    ground_truth,
    visits,
    symptoms,
    record_updates,
  };
}

export async function deleteCase(caseId: string): Promise<void> {
  const db = readDb();
  delete db.cases[caseId];
  db.symptoms = db.symptoms.filter((s) => s.case_id !== caseId);
  db.findings = db.findings.filter((f) => f.case_id !== caseId);
  for (const detail of Object.values(db.sessions)) {
    if (detail.session.case_id === caseId) {
      detail.session.case_id = null;
      detail.session.visit_no = null;
    }
  }
  writeDb(db);
}

// ---------------------------------------------------------------------------
// Notes
// ---------------------------------------------------------------------------

export async function createNote(note: NoteInput): Promise<StudyNote> {
  const db = readDb();
  const now = Date.now();
  const record: StudyNote = {
    id: db.nextNoteId++,
    organ_id: note.organ_id,
    organ_label: note.organ_label,
    session_id: note.session_id,
    body: note.body,
    created_at: now,
    updated_at: now,
  };
  db.notes.unshift(record);
  writeDb(db);
  return { ...record };
}

export async function updateNote(id: number, body: string): Promise<void> {
  const db = readDb();
  const found = db.notes.find((n) => n.id === id);
  if (!found) return;
  found.body = body;
  found.updated_at = Date.now();
  writeDb(db);
}

export async function deleteNote(id: number): Promise<void> {
  const db = readDb();
  db.notes = db.notes.filter((n) => n.id !== id);
  writeDb(db);
}

export async function listNotes(
  organId: string | null,
  query: string | null,
  limit = 200,
): Promise<StudyNote[]> {
  const db = readDb();
  const q = query?.trim().toLowerCase() ?? "";
  return db.notes
    .filter((n) => {
      if (organId && n.organ_id !== organId) return false;
      if (q) {
        const inBody = n.body.toLowerCase().includes(q);
        const inLabel = (n.organ_label ?? "").toLowerCase().includes(q);
        if (!inBody && !inLabel) return false;
      }
      return true;
    })
    .sort((a, b) => b.updated_at - a.updated_at)
    .slice(0, limit);
}

// ---------------------------------------------------------------------------
// Progress & Coverage
// ---------------------------------------------------------------------------

export async function studyStats(): Promise<StudyStats> {
  const db = readDb();
  const allSessions = Object.values(db.sessions).map((d) => d.session);
  const tutorSessions = allSessions.filter((s) => s.kind === "tutor").length;
  const caseSessions = allSessions.filter((s) => s.kind === "case");
  const graded = caseSessions.filter((s) => typeof s.score === "number");
  const avg =
    graded.length > 0
      ? graded.reduce((acc, s) => acc + (s.score ?? 0), 0) / graded.length
      : null;

  return {
    sessions: tutorSessions,
    cases: caseSessions.length,
    graded_cases: graded.length,
    notes: db.notes.length,
    average_score: avg,
  };
}

export async function studyCoverage(): Promise<StudyCoverage[]> {
  const db = readDb();
  const counts = new Map<string, number>();

  for (const detail of Object.values(db.sessions)) {
    for (const organId of detail.structures) {
      counts.set(organId, (counts.get(organId) ?? 0) + 1);
    }
  }
  for (const note of db.notes) {
    if (note.organ_id) {
      counts.set(note.organ_id, (counts.get(note.organ_id) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .filter(([, touches]) => touches > 0)
    .map(([organ_id, touches]) => ({ organ_id, touches }));
}

// ---------------------------------------------------------------------------
// Consumption
// ---------------------------------------------------------------------------

export async function recordTokenUsage(usage: UsageInput): Promise<void> {
  const db = readDb();
  const now = Date.now();
  db.usage.push({
    ...usage,
    day: localDayString(now),
    created_at: now,
  });
  writeDb(db);
}

export async function tokenUsage(days: number): Promise<UsageBucket[]> {
  const db = readDb();
  const cutoff = Date.now() - Math.max(1, days) * 86_400_000;
  const grouped = new Map<string, UsageBucket>();

  for (const row of db.usage) {
    if (row.created_at < cutoff) continue;
    const key = `${row.day}::${row.provider}::${row.model}`;
    const existing = grouped.get(key);
    if (existing) {
      existing.input_tokens += row.input_tokens;
      existing.output_tokens += row.output_tokens;
      existing.cache_read_tokens += row.cache_read_tokens;
      existing.turns += 1;
    } else {
      grouped.set(key, {
        day: row.day,
        provider: row.provider,
        model: row.model,
        input_tokens: row.input_tokens,
        output_tokens: row.output_tokens,
        cache_read_tokens: row.cache_read_tokens,
        turns: 1,
      });
    }
  }

  return [...grouped.values()].sort((a, b) => b.day.localeCompare(a.day));
}

// ---------------------------------------------------------------------------
// Export / Import / View Capture
// ---------------------------------------------------------------------------

export async function exportJournal(): Promise<string | null> {
  if (typeof window === "undefined" || typeof document === "undefined") return null;
  try {
    const db = readDb();
    const filename = `codeblue-atlas-journal-${localDayString(Date.now())}.json`;
    const blob = new Blob([JSON.stringify(db, null, 2)], {
      type: "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    return filename;
  } catch {
    return null;
  }
}

export async function importJournal(): Promise<ImportSummary | null> {
  if (typeof window === "undefined" || typeof document === "undefined") return null;
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,application/json";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) {
        resolve(null);
        return;
      }
      try {
        const text = await file.text();
        const incoming = JSON.parse(text) as Partial<JournalDatabase>;
        const db = readDb();
        const summary: ImportSummary = {
          sessions_added: 0,
          sessions_updated: 0,
          notes_added: 0,
          notes_updated: 0,
          cases_added: 0,
          skipped: 0,
        };

        if (incoming.sessions && typeof incoming.sessions === "object") {
          for (const [id, detail] of Object.entries(incoming.sessions)) {
            const current = db.sessions[id];
            if (!current) {
              db.sessions[id] = detail;
              summary.sessions_added += 1;
            } else if (detail.session.updated_at > current.session.updated_at) {
              db.sessions[id] = detail;
              summary.sessions_updated += 1;
            } else {
              summary.skipped += 1;
            }
          }
        }

        if (incoming.cases && typeof incoming.cases === "object") {
          for (const [id, kase] of Object.entries(incoming.cases)) {
            if (!db.cases[id]) {
              db.cases[id] = kase;
              summary.cases_added += 1;
            } else {
              summary.skipped += 1;
            }
          }
        }

        if (Array.isArray(incoming.notes)) {
          for (const note of incoming.notes) {
            const existing = db.notes.find(
              (n) => n.organ_id === note.organ_id && n.created_at === note.created_at,
            );
            if (!existing) {
              db.notes.push({ ...note, id: db.nextNoteId++ });
              summary.notes_added += 1;
            } else if (note.updated_at > existing.updated_at) {
              existing.body = note.body;
              existing.updated_at = note.updated_at;
              summary.notes_updated += 1;
            } else {
              summary.skipped += 1;
            }
          }
        }

        writeDb(db);
        resolve(summary);
      } catch {
        resolve(null);
      }
    };
    input.click();
  });
}

export async function saveViewImage(
  pngBase64: string,
  fileName?: string,
): Promise<string | null> {
  if (typeof window === "undefined" || typeof document === "undefined") return null;
  try {
    const safeName =
      (fileName?.replace(/[^a-zA-Z0-9._-]/g, "_") || "codeblue-atlas-view") +
      (fileName?.endsWith(".png") ? "" : ".png");
    const dataUrl = pngBase64.startsWith("data:")
      ? pngBase64
      : `data:image/png;base64,${pngBase64}`;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = safeName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return safeName;
  } catch {
    return null;
  }
}
