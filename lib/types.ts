// lib/types.ts

export type OverviewStats = {
  totalQuestions: number;
  newThisWeek: number;
  byDifficulty: { easy: number; medium: number; hard: number };
  topCategories: { name: string; count: number }[];
  missingExplanation: number;
  totalUsers: number;
  activeUsers7d: number;
};