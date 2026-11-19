'use client';

import { ReactNode } from 'react';

export function ThemeProvider({ children }: { children: ReactNode }) {
  // نمرر التطبيق كما هو بدون أي تدخل في الثيم
  return <>{children}</>;
}