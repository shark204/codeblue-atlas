'use client';
import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

type Props = {
  isDark: boolean;
  value: string; // YYYY-MM-DD
  onChange: (date: string) => void;
};

const MONTHS_AR = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
const DAYS_AR = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];

export default function SimpleDatePicker({ isDark, value, onChange }: Props) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const initial = value ? new Date(value) : today;
  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());
  const [isOpen, setIsOpen] = useState(false);

  // ✅ refs للـ auto-scroll
  const wrapperRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // ✅ scroll للـ picker لما يتفتح
  useEffect(() => {
    if (!isOpen) return;
    // استنى الرندر ثم اسكرول
    const t = setTimeout(() => {
      wrapperRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }, 50);
    return () => clearTimeout(t);
  }, [isOpen]);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  const selectedDate = value ? new Date(value) : null;
  if (selectedDate) selectedDate.setHours(0, 0, 0, 0);

  const isSelected = (day: number) =>
    selectedDate &&
    selectedDate.getFullYear() === viewYear &&
    selectedDate.getMonth() === viewMonth &&
    selectedDate.getDate() === day;

  const isToday = (day: number) =>
    today.getFullYear() === viewYear &&
    today.getMonth() === viewMonth &&
    today.getDate() === day;

  // ✅ منع التواريخ الماضية
  const isPast = (day: number) => {
    const d = new Date(viewYear, viewMonth, day);
    d.setHours(0, 0, 0, 0);
    return d < today;
  };

  // ✅ منع الشهور الماضية
  const isPastMonth = () => {
    const currentView = new Date(viewYear, viewMonth, 1);
    const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    return currentView < currentMonth;
  };

  const handleSelect = (day: number) => {
    if (isPast(day)) return;
    const month = String(viewMonth + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    onChange(`${viewYear}-${month}-${d}`);
  };

  const prevMonth = () => {
    if (isPastMonth()) return;
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
  };

  const formatDisplay = () => {
    if (!value) return 'اختار تاريخ الامتحان';
    const d = new Date(value);
    return `${d.getDate()} ${MONTHS_AR[d.getMonth()]} ${d.getFullYear()}`;
  };

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const pastMonth = isPastMonth();

  return (
    <div className="relative scroll-mt-24" ref={wrapperRef}>
      {/* زرار العرض */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full p-3 rounded-xl text-sm border flex items-center justify-between transition-all ${
          isDark
            ? 'bg-slate-800 border-slate-700 text-white hover:border-sky-600'
            : 'bg-slate-50 border-slate-200 text-slate-900 hover:border-sky-400'
        }`}
      >
        <Calendar size={16} className={isDark ? 'text-sky-400' : 'text-sky-600'} />
        <span className={`flex-1 text-center font-bold ${value ? '' : 'opacity-50'}`}>
          {formatDisplay()}
        </span>
        <ChevronDownIcon isDark={isDark} isOpen={isOpen} />
      </button>

      {/* لوحة التقويم — بتفتح لتحت */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          <div
            ref={panelRef}
            className={`relative z-50 mt-2 w-full p-4 rounded-2xl border shadow-2xl ${
              isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
            }`}
            dir="rtl"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={nextMonth}
                className={`p-2 rounded-lg ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600'}`}
              >
                <ChevronRight size={16} />
              </button>
              <div className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {MONTHS_AR[viewMonth]} {viewYear}
              </div>
              <button
                type="button"
                onClick={prevMonth}
                disabled={pastMonth}
                className={`p-2 rounded-lg transition-all ${
                  pastMonth
                    ? 'opacity-30 cursor-not-allowed'
                    : (isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600')
                }`}
              >
                <ChevronLeft size={16} />
              </button>
            </div>

            {/* Days header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {DAYS_AR.map(d => (
                <div key={d} className={`text-center text-[10px] font-black py-1 ${
                  isDark ? 'text-slate-500' : 'text-slate-400'
                }`}>
                  {d}
                </div>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-1">
              {cells.map((day, idx) => {
                if (day === null) return <div key={`empty-${idx}`} />;
                const sel = isSelected(day);
                const tod = isToday(day);
                const past = isPast(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleSelect(day)}
                    disabled={past}
                    className={`aspect-square rounded-lg text-xs font-bold transition-all ${
                      past
                        ? (isDark ? 'text-slate-700 cursor-not-allowed' : 'text-slate-300 cursor-not-allowed')
                        : sel
                          ? 'bg-sky-600 text-white shadow-md scale-105'
                          : tod
                            ? (isDark ? 'bg-sky-950/60 text-sky-400 border border-sky-800' : 'bg-sky-50 text-sky-700 border border-sky-300')
                            : (isDark ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-700')
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-700/30">
              <p className={`text-[10px] font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                ⚠️ التواريخ الماضية غير متاحة
              </p>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className={`text-[10px] font-bold px-3 py-1.5 rounded-lg ${
                  isDark ? 'bg-sky-600 text-white hover:bg-sky-500' : 'bg-sky-500 text-white hover:bg-sky-600'
                }`}
              >
                تم
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function ChevronDownIcon({ isDark, isOpen }: { isDark: boolean; isOpen: boolean }) {
  return (
    <svg
      width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
      className={`transition-transform ${isOpen ? 'rotate-180' : ''} ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}