'use client';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useUIStore } from '../../stores/uiStore';
import { getToastStyle } from '../../lib/helpers';

export default function Toast() {
  const toast = useUIStore(s => s.toast);
  const theme = useUIStore(s => s.theme);
  const [mounted, setMounted] = useState(false);

  // ✅ منع مشاكل الـ Hydration
  useEffect(() => setMounted(true), []);

  if (!toast || !mounted) return null;

  // ═══ فلترة الرسائل المزعجة ═══
  const msg = String(toast.msg || '').trim().toLowerCase();
  const HIDDEN_MESSAGES = ['no session', 'no auth', 'session missing'];
  if (HIDDEN_MESSAGES.includes(msg)) return null;

  const isDark = theme === 'dark';

  // ✅ استخدمنا createPortal عشان الإشعار يطلع بره أي حاجة ويظهر فوق التوب بار
  return createPortal(
    <div
      className={`fixed top-4 end-4 sm:top-6 sm:end-6 z-[9999] px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border text-xs sm:text-sm animate-fade-in backdrop-blur-xl ${getToastStyle(toast.type, isDark)}`}
      style={{
        boxShadow: '0 20px 40px -10px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.05) inset',
      }}
    >
      {/* Colored dot */}
      <span className={`w-2 h-2 rounded-full shrink-0 animate-pulse ${
        toast.type === 'success'
          ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]'
          : toast.type === 'error'
            ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.7)]'
            : 'bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.7)]'
      }`} />
      <span className="font-bold">{toast.msg}</span>
    </div>,
    document.body // 👈 دي اللي هتخليه فوق التوب بار
  );
}