'use client';
import {
  Brain, BookOpen, Target, Sparkles, Wind, BookMarked,
  PenLine, Flame, Zap, Dumbbell, Rocket, Coffee, CupSoda, Footprints,
  type LucideIcon,
} from 'lucide-react';

export const VIBE_ICONS: Record<string, LucideIcon> = {
  brain: Brain,
  bookOpen: BookOpen,
  target: Target,
  sparkles: Sparkles,
  wind: Wind,
  bookMarked: BookMarked,
  penLine: PenLine,
  flame: Flame,
  zap: Zap,
  dumbbell: Dumbbell,
  rocket: Rocket,
  coffee: Coffee,
  cupSoda: CupSoda,
  footprints: Footprints,
};

export const VIBE_KEYS = Object.keys(VIBE_ICONS);

export function isVibeIconKey(value: string): boolean {
  return !!VIBE_ICONS[value];
}

export function VibeIcon({
  name,
  size = 20,
  className = '',
  strokeWidth = 1.9,
}: {
  name: string;
  size?: number;
  className?: string;
  strokeWidth?: number;
}) {
  const Icon = VIBE_ICONS[name];
  if (Icon) return <Icon size={size} className={className} strokeWidth={strokeWidth} />;
  // Fallback: emoji (للتوافق مع البيانات القديمة)
  return <span className={className} style={{ fontSize: size * 0.9, lineHeight: 1 }}>{name}</span>;
}