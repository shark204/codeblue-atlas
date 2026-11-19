'use client';
import { cloneElement, useEffect, useId, useRef, useState, type ReactElement } from 'react';
import { createPortal } from 'react-dom';

type Props = {
  text: string;
  side?: 'right' | 'top' | 'bottom';
  children: ReactElement<any>;
};

/**
 * Tooltip بيظهر لما الماوس (أو الـ focus بالكيبورد) يجي على العنصر.
 * بيتعرض في document.body عشان الـ overflow والـ backdrop-filter بتاع الشريط الجانبي مايقصوش.
 * الاستخدام: <Tip text="شرح"><button>…</button></Tip>   (الابن لازم يكون عنصر DOM واحد)
 */
export default function Tip({ text, side = 'top', children }: Props) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const id = useId();

  const show = (el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    const clampX = (x: number) => Math.min(Math.max(x, 130), window.innerWidth - 130);
    if (side === 'right') setPos({ x: r.right + 10, y: r.top + r.height / 2 });
    else if (side === 'bottom') setPos({ x: clampX(r.left + r.width / 2), y: r.bottom + 10 });
    else setPos({ x: clampX(r.left + r.width / 2), y: r.top - 10 });
  };

  const on = (e: any) => {
    const el = e.currentTarget as HTMLElement;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => show(el), 220);
    children.props.onMouseEnter?.(e);
  };
  const off = (e: any) => {
    clearTimeout(timer.current);
    setPos(null);
    children.props.onMouseLeave?.(e);
  };

  // يختفي لو حصل scroll أو Escape
  useEffect(() => {
    if (!pos) return;
    const hide = () => setPos(null);
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') hide(); };
    window.addEventListener('scroll', hide, true);
    window.addEventListener('keydown', esc);
    return () => { window.removeEventListener('scroll', hide, true); window.removeEventListener('keydown', esc); };
  }, [pos]);

  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <>
      {cloneElement(children, {
        onMouseEnter: on,
        onMouseLeave: off,
        onFocus: (e: any) => { on(e); children.props.onFocus?.(e); },
        onBlur: (e: any) => { off(e); children.props.onBlur?.(e); },
        'aria-describedby': pos ? id : children.props['aria-describedby'],
      })}
      {pos && typeof document !== 'undefined' &&
        createPortal(
          <div id={id} role="tooltip" className={`sr-tooltip ${side}`} style={{ left: pos.x, top: pos.y }}>{text}</div>,
          document.body,
        )}
    </>
  );
}
