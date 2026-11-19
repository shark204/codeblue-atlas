// components/ui/BackButton.tsx
'use client';

import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  onClick: () => void;
  label?: string;
}

export function BackButton({ onClick, label = 'Back' }: BackButtonProps) {
  return (
    <div className="mb-4">
      <button
        onClick={onClick}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 backdrop-blur-md shadow-sm w-fit"
      >
        <ArrowLeft size={16} />
        {label}
      </button>
    </div>
  );
}