// ═══════════════════════════════════════════════════════════════
// Live Challenges — Types
// ═══════════════════════════════════════════════════════════════

export type ChallengeStatus =
  | 'pending'      // challenger created, waiting for opponent
  | 'ready_wait'   // opponent accepted, both need to ready up
  | 'live'         // both ready, playing
  | 'completed'    // done
  | 'declined'
  | 'cancelled'
  | 'expired'
  | 'forfeited';

export type ChallengeRules = {
  count: number;                 // 3..50
  category: string;              // 'all' or Theme_Category
  mode: 'adaptive' | 'shuffle' | 'default';
  timePerQ: number;              // 0 = no timer, else seconds
};

export type ChallengeScore = {
  correct: number;
  total: number;
  time_ms: number;
};

export type RoomChallenge = {
  id: string;
  room_id: string;
  challenger_id: string;
  opponent_id: string;
  status: ChallengeStatus;
  rules: ChallengeRules;
  question_ids: number[];
  seed: string;
  challenger_ready: boolean;
  opponent_ready: boolean;
  challenger_score: ChallengeScore | null;
  opponent_score: ChallengeScore | null;
  winner_id: string | null;
  accept_deadline: string;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
};

export type RoomCrown = {
  room_id: string;
  holder_id: string;
  consecutive_wins: number;
  total_wins: number;
  total_challenges: number;
  crowned_at: string;
  updated_at: string;
};

export type WeeklyStats = {
  user_id: string;
  week_key: string;
  challenges: number;
  wins: number;
  losses: number;
  ties: number;
  total_correct: number;
  total_questions: number;
  total_time_ms: number;
};

export type ChallengeAnswer = {
  id: number;
  challenge_id: string;
  user_id: string;
  question_id: number;
  choice: string | null;
  is_correct: boolean | null;
  answered_at: string;
  time_ms: number;
};