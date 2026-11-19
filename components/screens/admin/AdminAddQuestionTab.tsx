'use client';

import { useTranslations } from "@/stores/languageStore";

type Props = {
  isDark: boolean;
  onAddQuestion: (e: React.FormEvent<HTMLFormElement>) => void;
  newQ: any;
  setNewQ: (q: any) => void;
};

export default function AdminAddQuestionTab({ isDark, onAddQuestion, newQ, setNewQ }: Props) {
    const t = useTranslations('components_screens_admin_AdminAddQuestionTab');
  const input = `p-3 rounded-lg border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300'}`;

  return (
    <div className={`p-6 lg:p-8 rounded-3xl shadow-sm border mt-6 animate-fade-in ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
      <h3 className={`text-lg font-black mb-6 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{t('add_new_question_db_insert')}</h3>
      <form onSubmit={onAddQuestion} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <input type="text" placeholder={t('category_e_g_anatomy')} required value={newQ.Theme_Category} onChange={e => setNewQ({ ...newQ, Theme_Category: e.target.value })} className={input} />
          <select value={newQ.Difficulty} onChange={e => setNewQ({ ...newQ, Difficulty: Number(e.target.value) })} className={input}>
            <option value={1}>{t('easy')}</option><option value={2}>{t('medium')}</option><option value={3}>{t('hard')}</option>
          </select>
        </div>
        <textarea placeholder={t('question_text')} required value={newQ.Question_Text} onChange={e => setNewQ({ ...newQ, Question_Text: e.target.value })} className={`w-full p-3 rounded-lg border h-24 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300'}`} />
        <div className="grid grid-cols-2 gap-4">
          {['A', 'B', 'C', 'D'].map(l => (
            <input key={l} type="text" placeholder={`Option ${l}`} required={l === 'A'} value={newQ[`Option_${l}`] || ''} onChange={e => setNewQ({ ...newQ, [`Option_${l}`]: e.target.value })} className={input} />
          ))}
        </div>
        <select value={newQ.Correct_Answer} onChange={e => setNewQ({ ...newQ, Correct_Answer: e.target.value })} className={`w-full p-3 rounded-lg border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300'}`}>
          {['A', 'B', 'C', 'D', 'E'].map(l => <option key={l} value={l}>Correct: {l}</option>)}
        </select>
        <textarea placeholder={t('explanation')} required value={newQ.Explanation} onChange={e => setNewQ({ ...newQ, Explanation: e.target.value })} className={`w-full p-3 rounded-lg border h-24 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300'}`} />
        <button type="submit" className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition-colors">{t('save_to_database')}</button>
      </form>
    </div>
  );
}