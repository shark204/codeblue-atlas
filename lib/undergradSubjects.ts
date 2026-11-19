// lib/undergradSubjects.ts
export const SUBJECTS_BY_YEAR_SEMESTER: Record<string, Record<number, string[]>> = {
  '1': {
    1: ['Anatomy', 'Embryology', 'Physiology', 'Biochemistry', 'Histology'],
    2: ['Physiology', 'Histology', 'Anatomy', 'Pathology', 'Pharmacology'],
  },
  '2': { 1: [], 2: [] },
  '3': { 1: [], 2: [] },
  '4': { 1: [], 2: [] },
  '5': { 1: [], 2: [] },
};

export function getSubjectsFor(year: number, semester: number): string[] {
  return SUBJECTS_BY_YEAR_SEMESTER[String(year)]?.[semester] ?? [];
}