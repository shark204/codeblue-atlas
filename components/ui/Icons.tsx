'use client';
import {
  Star, Brain, Stethoscope, GraduationCap, Video, Users,
  HeartPulse, Target, BarChart3, Image as ImageIcon,
  Timer, Smartphone, Copy, RotateCcw,
} from 'lucide-react';

export const StarIcon = ({ size = 16 }: { size?: number }) => <Star size={size} fill="currentColor" />;
export const IconBrain = ({ size = 24 }: { size?: number }) => <Brain size={size} />;
export const IconStethoscope = ({ size = 24 }: { size?: number }) => <Stethoscope size={size} />;
export const IconGraduation = ({ size = 24 }: { size?: number }) => <GraduationCap size={size} />;
export const IconVideo = ({ size = 24 }: { size?: number }) => <Video size={size} />;
export const IconUsers = ({ size = 24 }: { size?: number }) => <Users size={size} />;
export const IconHeartbeat = ({ size = 24 }: { size?: number }) => <HeartPulse size={size} />;
export const IconTarget = ({ size = 24 }: { size?: number }) => <Target size={size} />;
export const IconChart = ({ size = 24 }: { size?: number }) => <BarChart3 size={size} />;
export const IconGallery = ({ size = 24 }: { size?: number }) => <ImageIcon size={size} />;
export const IconTimer = ({ size = 24 }: { size?: number }) => <Timer size={size} />;
export const IconMobile = ({ size = 24 }: { size?: number }) => <Smartphone size={size} />;
export const IconCopy = ({ size = 14 }: { size?: number }) => <Copy size={size} />;
export const IconRestart = ({ size = 18 }: { size?: number }) => <RotateCcw size={size} />;