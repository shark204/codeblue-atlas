export type SummariesProps = {
  isDark: boolean;
  onBack: () => void;
  showToast?: (msg: string, type: 'success' | 'error' | 'info') => void;
  userName?: string;
  userEmail?: string;
  userAvatarUrl?: string | null;
  cycleTheme?: () => void;
  onLogout?: () => void;
};

export type SummariesView =
  | 'subjects'
  | 'lessons'
  | 'reader'
  | 'summaries-topic'
  | 'summaries-reader'
  | 'module-lessons'
  | 'study-reader';

export type ContentSection = { id: string; title: string; body: string };