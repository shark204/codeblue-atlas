// lib/adminUtils.ts
import { ADMIN_EMAIL } from './constants';

// دالة لإرجاع اسم الجدول بناءً على البانل المختار
export function getPanelTable(panelId: string): string {
  switch (panelId) {
    case 'undergraduate':
      return 'undergraduate_questions';
    case 'mrcs':
    case 'mrcb':
      return 'questions';
    default:
      // افتراضيًا نرجع جدول questions
      return 'questions';
  }
}

// دالة للتحقق مما إذا كان البانل هو undergraduate
export function isUndergraduatePanel(panelId: string): boolean {
  return panelId === 'undergraduate';
}

// دالة للتحقق مما إذا كان البانل هو mrcs
export function isMrcsPanel(panelId: string): boolean {
  return panelId === 'mrcs' || panelId === 'mrcb';
}

// دالة لتوحيد شكل السؤال القادم من قاعدة البيانات
// (تقوم بتحويل الحقول الصغيرة إلى كبيرة لتوحيد التعامل معها)
export function normalizeQuestionRow(q: any): any {
  if (!q) return q;
  
  // إذا كان السؤال قادمًا من جدول undergraduate_questions
  if (q.question_text !== undefined) {
    return {
      id: q.id,
      Theme_Category: q.theme_category || q.subject || 'General',
      Question_Text: q.question_text,
      Option_A: q.option_a,
      Option_B: q.option_b,
      Option_C: q.option_c,
      Option_D: q.option_d,
      Option_E: q.option_e,
      Correct_Answer: q.correct_answer,
      Explanation: q.explanation,
      source_file: q.source_file,
      Difficulty: q.difficulty || 1,
      // أي حقول أخرى قد تحتاجها
      ...q, // ندمج الحقول الأصلية أيضًا
    };
  }
  
  // إذا كان السؤال قادمًا من جدول questions (MRCS)
  return q;
}