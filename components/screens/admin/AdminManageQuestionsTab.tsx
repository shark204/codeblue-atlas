'use client';
import { useAdminStore } from '../../../stores/adminStore';
import { useTranslations } from "@/stores/languageStore";

type Props = {
  isDark: boolean;
  onUpdateQuestion: (e: React.FormEvent<HTMLFormElement>) => void;
  onDeleteQuestion: (id: number) => void;
  editingQuestion: any;
  setEditingQuestion: (q: any) => void;
};

export default function AdminManageQuestionsTab({ isDark, onUpdateQuestion, onDeleteQuestion, editingQuestion, setEditingQuestion }: Props) {
    const t = useTranslations('components_screens_admin_AdminManageQuestionsTab');
  const adminQuestions = useAdminStore(s => s.adminQuestions);
  const adminTotalCount = useAdminStore(s => s.adminTotalCount);
  const adminQuestionsSearch = useAdminStore(s => s.adminQuestionsSearch);
  const setAdminQuestionsSearch = useAdminStore(s => s.setAdminQuestionsSearch);
  const adminPage = useAdminStore(s => s.adminPage);
  const setAdminPage = useAdminStore(s => s.setAdminPage);

  const perPage = 20;
  const totalPages = Math.ceil(adminTotalCount / perPage) || 1;
  const input = `p-3 rounded-lg border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300'}`;

  if (editingQuestion) {
    return (
      <div className={`p-6 lg:p-8 rounded-3xl shadow-sm border mt-6 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="flex justify-between items-center mb-6">
          <h3 className={`text-lg font-black ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{t('edit_question')}</h3>
          <button onClick={() => setEditingQuestion(null)} className="text-sm font-bold text-slate-500 hover:text-rose-500">{t('cancel')}</button>
        </div>
        <form onSubmit={onUpdateQuestion} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input type="text" placeholder={t('category')} required value={editingQuestion.Theme_Category} onChange={e => setEditingQuestion({ ...editingQuestion, Theme_Category: e.target.value })} className={input} />
            <select value={editingQuestion.Difficulty} onChange={e => setEditingQuestion({ ...editingQuestion, Difficulty: Number(e.target.value) })} className={input}>
              <option value={1}>{t('easy')}</option><option value={2}>{t('medium')}</option><option value={3}>{t('hard')}</option>
            </select>
          </div>
          <textarea placeholder={t('question_text')} required value={editingQuestion.Question_Text} onChange={e => setEditingQuestion({ ...editingQuestion, Question_Text: e.target.value })} className={`w-full p-3 rounded-lg border h-24 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300'}`} />
          <div className="grid grid-cols-2 gap-4">
            {['A', 'B', 'C', 'D'].map(l => (
              <input key={l} type="text" placeholder={`Option ${l}`} required={l === 'A'} value={editingQuestion[`Option_${l}`] || ''} onChange={e => setEditingQuestion({ ...editingQuestion, [`Option_${l}`]: e.target.value })} className={input} />
            ))}
          </div>
          <select value={editingQuestion.Correct_Answer} onChange={e => setEditingQuestion({ ...editingQuestion, Correct_Answer: e.target.value })} className={`w-full p-3 rounded-lg border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300'}`}>
            {['A', 'B', 'C', 'D', 'E'].map(l => <option key={l} value={l}>Correct: {l}</option>)}
          </select>
          <textarea placeholder={t('explanation')} required value={editingQuestion.Explanation} onChange={e => setEditingQuestion({ ...editingQuestion, Explanation: e.target.value })} className={`w-full p-3 rounded-lg border h-24 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300'}`} />
          <button type="submit" className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg">{t('update_question')}</button>
        </form>
      </div>
    );
  }

  return (
    <div className={`p-6 lg:p-8 rounded-3xl shadow-sm border mt-6 animate-fade-in flex flex-col min-h-[400px] ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
        <h3 className={`text-lg font-black ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Questions Bank ({adminTotalCount})</h3>
        <input type="text" placeholder={t('search_questions')} value={adminQuestionsSearch} onChange={e => setAdminQuestionsSearch(e.target.value)} className={`p-2 rounded-lg border text-sm w-full sm:w-64 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300'}`} />
      </div>
      <div className="space-y-4 flex-1">
        {adminQuestions.map(q => (
          <div key={q.id} className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold text-sky-500 bg-sky-500/10 px-2 py-0.5 rounded-full mb-1 inline-block">{q.Theme_Category}</span>
              <p className="text-sm font-semibold truncate">{q.Question_Text}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => setEditingQuestion(q)} className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg hover:bg-sky-500 hover:text-white transition-colors">{t('edit')}</button>
              <button onClick={() => onDeleteQuestion(q.id)} className="px-3 py-1.5 bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 text-xs font-bold rounded-lg hover:bg-rose-500 hover:text-white transition-colors">{t('delete')}</button>
            </div>
          </div>
        ))}
        {adminQuestions.length === 0 && <p className="text-center text-sm opacity-50 py-4">{t('no_questions_found')}</p>}
      </div>

      {totalPages > 1 && (
        <div className={`flex justify-between items-center mt-6 pt-4 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          <button disabled={adminPage === 1} onClick={() => setAdminPage(adminPage - 1)} className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-30 rounded-lg text-xs font-bold">{t('prev')}</button>
          <span className="text-xs font-bold text-slate-500">Page {adminPage} of {totalPages}</span>
          <button disabled={adminPage === totalPages} onClick={() => setAdminPage(adminPage + 1)} className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-30 rounded-lg text-xs font-bold">{t('next')}</button>
        </div>
      )}
    </div>
  );
}