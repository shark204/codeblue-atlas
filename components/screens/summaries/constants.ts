import { Brain, Pill, Scissors } from 'lucide-react';

export const BOARD_EXAMS = [
  {
    slug: 'USMLE Step 1',
    name: 'USMLE Step 1',
    icon: Brain,
    color: 'from-indigo-500/20 to-purple-500/10 text-indigo-400 border-indigo-500/30',
    badge: 'US Medical',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=600&q=80',
  },
  {
    slug: 'MRCP Part A',
    name: 'MRCP Part A',
    icon: Pill,
    color: 'from-blue-500/20 to-sky-500/10 text-blue-400 border-blue-500/30',
    badge: 'Medical',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80',
  },
  {
    slug: 'MRCS Part A',
    name: 'MRCS Part A',
    icon: Scissors,
    color: 'from-slate-400/20 to-slate-600/10 text-slate-300 border-slate-500/30',
    badge: 'Surgical',
    image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=600&q=80',
  },
];