'use client';

import { useTranslations } from "@/stores/languageStore";

type Props = {
  theme: 'light' | 'dark';
  size?: number;
  animated?: boolean;
  speed?: number;
};

export default function CaduceusLogo({
  theme,
  size = 60,
  animated = true,
  speed = 3,
}: Props) {
    const t = useTranslations('components_ui_CaduceusLogo');
  // ✅ كبّر بنسبة 20%
  const finalSize = Math.round(size * 1.2);

  // ✅ swing 360°= مرة واحدة (تمايل يمين وشمال) → speed*2 ثانية
  const swingDuration = speed * 2;

  // ✅ float مستمر → نفس المدة
  const floatDuration = speed * 2;

  return (
    <div
      className="relative"
      style={{
        width: finalSize,
        height: finalSize,
        // ✅ تمايل يمين وشمال — مرة واحدة بس (forwards = يوقف عند الحالة النهائية)
        animation: animated
          ? `caduceusSwing ${swingDuration}s ease-in-out 1 forwards`
          : 'none',
      }}
    >
      {/* ═══ Glow effect خلف الصورة ═══ */}
      {animated && (
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: theme === 'light'
              ? 'radial-gradient(circle, rgba(201,169,97,0.35) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(56,189,248,0.45) 0%, transparent 70%)',
            filter: 'blur(10px)',
            transform: 'scale(1.2)',
            animation: `caduceusGlow ${floatDuration}s ease-in-out infinite`,
          }}
        />
      )}

      {/* ═══ الصورة — بنفس float المستمر ═══ */}
      <img
        src="/caduceus.png"
        alt={t('caduceus')}
        width={finalSize}
        height={finalSize}
        style={{
          position: 'relative',
          zIndex: 1,
          width: finalSize,
          height: finalSize,
          objectFit: 'contain',
          // ✅ float مستمر (فوق-تحت) — مستقل عن الـ swing
          animation: animated
            ? `caduceusFloat ${floatDuration}s ease-in-out infinite`
            : 'none',
          filter: theme === 'light'
            ? 'drop-shadow(0 0 6px rgba(201,169,97,0.5))'
            : 'drop-shadow(0 0 8px rgba(56,189,248,0.6)) drop-shadow(0 0 16px rgba(250,204,21,0.3))',
          userSelect: 'none',
          pointerEvents: 'none',
        }}
        draggable={false}
      />
    </div>
  );
}