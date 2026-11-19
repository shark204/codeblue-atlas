'use client';
import { useEffect, useState, useId } from 'react';
import { Crown, Sparkles } from 'lucide-react';
import { supabase } from '../../lib/supabase';

type Props = {
  src: string | null;
  name: string;
  userId?: string | null;
  panelId?: string;
  size?: 'topbar' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isDark?: boolean;
  xp?: number;
  allowToggle?: boolean; // ✅ السطر المضاف لحل الخطأ
};

// ✅ 9 tiers — بالترتيب من الأضعف للأقوى (يطابق ترتيب الصور)
export const TIERS = [
  { id: 'novice',    minXP: 0,       nameEn: 'Novice',    nameAr: 'مبتدئ',    color: '#94a3b8', glow: false, frameScale: 1.38, innerRatio: 0.62 },
  { id: 'bronze',    minXP: 300,     nameEn: 'Bronze',    nameAr: 'برونزي',   color: '#b45309', glow: false, frameScale: 1.35, innerRatio: 0.65 },
  { id: 'gold',      minXP: 1000,    nameEn: 'Gold',      nameAr: 'ذهبي',     color: '#eab308', glow: true,  frameScale: 1.40, innerRatio: 0.62 },
  { id: 'ice',       minXP: 2500,    nameEn: 'Ice',       nameAr: 'ثلجي',     color: '#cbd5e1', glow: true,  frameScale: 1.37, innerRatio: 0.63 },
  { id: 'magic',     minXP: 5000,    nameEn: 'Magic',     nameAr: 'سحري',     color: '#8b5cf6', glow: true,  frameScale: 1.42, innerRatio: 0.58 },
  { id: 'platinum',  minXP: 10000,   nameEn: 'Platinum',  nameAr: 'بلاتيني',  color: '#fb7185', glow: true,  frameScale: 1.40, innerRatio: 0.58 },
  { id: 'diamond',   minXP: 25000,   nameEn: 'Diamond',   nameAr: 'ألماس',    color: '#a78bfa', glow: true,  frameScale: 1.42, innerRatio: 0.60 },
  { id: 'legendary', minXP: 50000,   nameEn: 'Legendary', nameAr: 'أسطوري',   color: '#f97316', glow: true,  frameScale: 1.45, innerRatio: 0.55 },
  { id: 'mythic',    minXP: 100000,  nameEn: 'Mythic',    nameAr: 'خرافي',    color: '#ec4899', glow: true,  frameScale: 1.45, innerRatio: 0.52 },
];

export function getTier(xp: number) {
  const safeXp = Number(xp) || 0;
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (safeXp >= TIERS[i].minXP) return TIERS[i];
  }
  return TIERS[0];
}

const SIZES = {
  topbar: { box: 34, font: 'text-xs' },  // ✅ كبّرناه
  xs:     { box: 36, font: 'text-xs'     },
  sm:     { box: 52, font: 'text-base'   },
  md:     { box: 72, font: 'text-lg'     },
  lg:     { box: 100, font: 'text-2xl'   },
  xl:     { box: 140, font: 'text-4xl'   },
};

const HEX_CLIP = 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)';

export default function AvatarFrame({
  src, name, userId, panelId = 'mrcs', size = 'md', isDark = false, xp,
}: Props) {
  const instanceId = useId();

  const [xpValue, setXpValue] = useState<number>(xp ?? 0);

  useEffect(() => {
    if (xp !== undefined && xp !== null) setXpValue(Number(xp));
  }, [xp]);

  useEffect(() => {
    if (xp !== undefined && xp !== null) return;
    if (!userId) return;

    let mounted = true;

    const fetchXp = async () => {
      try {
        const { data } = await supabase
          .from('user_xp')
          .select('xp')
          .eq('user_id', userId)
          .eq('panel_id', panelId)
          .maybeSingle();
        if (mounted) setXpValue(Number(data?.xp ?? 0));
      } catch {
        if (mounted) setXpValue(0);
      }
    };
    fetchXp();

    const channelName = `avatar_frame_xp_${userId}_${panelId}_${instanceId}`;

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_xp',
          filter: `user_id=eq.${userId}`,
        },
        (payload: any) => {
          const rowPanel = payload.new?.panel_id ?? payload.old?.panel_id;
          if (rowPanel === panelId && mounted) {
            setXpValue(Number(payload.new?.xp ?? 0));
          }
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [userId, panelId, xp, instanceId]);

  const tier = getTier(xpValue);
  const sz = SIZES[size] || SIZES.md;
  const initials = name?.charAt(0)?.toUpperCase() || '?';
  const isHighTier = ['legendary', 'mythic'].includes(tier.id);
  const frameSize = sz.box * tier.frameScale;
  const avatarSize = frameSize * tier.innerRatio;
  const frameSrc = `/frames/${tier.id}.png`;

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: frameSize, height: frameSize }}
    >
      {tier.glow && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={frameSrc} alt="" className="absolute inset-0 object-contain pointer-events-none"
          style={{ width: frameSize, height: frameSize, filter: 'blur(14px) saturate(3) brightness(1.6)', opacity: 0.9, zIndex: 1 }} />
      )}
      {tier.glow && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={frameSrc} alt="" className="absolute inset-0 object-contain pointer-events-none"
          style={{ width: frameSize, height: frameSize, filter: 'blur(5px) saturate(2.5) brightness(1.4)', zIndex: 2 }} />
      )}
      {tier.glow && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={frameSrc} alt="" className="absolute inset-0 object-contain pointer-events-none"
          style={{ width: frameSize, height: frameSize, filter: 'blur(1.5px) saturate(2) brightness(1.2)', opacity: 0.95, zIndex: 3 }} />
      )}

      <div
        className={`relative flex items-center justify-center font-black text-white ${sz.font} overflow-hidden`}
        style={{
          width: avatarSize,
          height: avatarSize,
          clipPath: HEX_CLIP,
          WebkitClipPath: HEX_CLIP,
          background: isDark ? '#0f172a' : '#f1f5f9',
          zIndex: 10,
        }}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span style={{ color: tier.color }}>{initials}</span>
        )}
      </div>

      <img src={frameSrc} alt={tier.nameEn} className="absolute inset-0 object-contain pointer-events-none"
        style={{ width: frameSize, height: frameSize, zIndex: 20 }} />

      {isHighTier && (
        <div
          className="absolute rounded-full p-1 shadow-lg"
          style={{
            background: tier.color,
            boxShadow: `0 0 10px ${tier.color}`,
            top: '2%',
            right: '2%',
            zIndex: 30,
          }}
        >
          {tier.id === 'mythic'
            ? <Sparkles size={10} className="text-white" />
            : <Crown size={10} className="text-white" />
          }
        </div>
      )}

    </div>
  );
}