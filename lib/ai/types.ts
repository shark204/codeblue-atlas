export type SourceDoc = {
  id: string;
  title: string;
  author?: string;
  category?: string;
  snippet?: string;
  similarity?: number;
};

export type AIExplanation = {
  id: number;
  question_id: number;
  content: string;
  source_doc_ids: string[];
  is_approved: boolean;
  created_at: string;
};

export type AIStatus = 'idle' | 'searching' | 'generating' | 'ready' | 'error';