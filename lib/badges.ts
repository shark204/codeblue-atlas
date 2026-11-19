// lib/badges.ts
// ═══════════════════════════════════════════════════════
// كتالوج البادجات — 68 بادج
// ⚠️ نفس الـ stat_key لازم يقراه الـ SQL في check_and_unlock_badges
// ═══════════════════════════════════════════════════════

export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'diamond';
export type BadgeCategory =
  | 'questions' | 'correct' | 'accuracy' | 'combo' | 'streak'
  | 'mock' | 'redemption' | 'notebook' | 'smart_review'
  | 'daily_case' | 'daily_goal' | 'study_room' | 'explorer'
  | 'levels' | 'leaderboard' | 'time' | 'setup' | 'secret';

export interface BadgeDef {
  id: string;
  category: BadgeCategory;
  tier: BadgeTier;
  target: number;
  stat_key: string;
  icon: string;
  xp_reward: number;
  name_ar: string;
  name_en: string;
  desc_ar: string;
  desc_en: string;
  secret?: boolean;
}

export const BADGE_DEFS: BadgeDef[] = [
  // ═══════════ Questions Solved (9) = 13,000 ═══════════
  { id: 'first_question',     category: 'questions', tier: 'bronze',  target: 1,    stat_key: 'questions_solved', icon: 'BookOpen',      xp_reward: 300,  name_ar: 'البداية',        name_en: 'First Step',      desc_ar: 'حل أول سؤال',        desc_en: 'Solve your first question' },
  { id: 'questions_10',       category: 'questions', tier: 'bronze',  target: 10,   stat_key: 'questions_solved', icon: 'BookOpen',      xp_reward: 500,  name_ar: '10 أسئلة',       name_en: '10 Questions',    desc_ar: 'حل 10 أسئلة',        desc_en: 'Solve 10 questions' },
  { id: 'questions_50',       category: 'questions', tier: 'bronze',  target: 50,   stat_key: 'questions_solved', icon: 'BookOpen',      xp_reward: 800,  name_ar: '50 سؤال',        name_en: '50 Questions',    desc_ar: 'حل 50 سؤال',         desc_en: 'Solve 50 questions' },
  { id: 'questions_100',      category: 'questions', tier: 'silver',  target: 100,  stat_key: 'questions_solved', icon: 'BookMarked',    xp_reward: 1000, name_ar: '100 سؤال',       name_en: '100 Questions',   desc_ar: 'حل 100 سؤال',        desc_en: 'Solve 100 questions' },
  { id: 'questions_250',      category: 'questions', tier: 'silver',  target: 250,  stat_key: 'questions_solved', icon: 'BookMarked',    xp_reward: 1300, name_ar: '250 سؤال',       name_en: '250 Questions',   desc_ar: 'حل 250 سؤال',        desc_en: 'Solve 250 questions' },
  { id: 'questions_500',      category: 'questions', tier: 'gold',    target: 500,  stat_key: 'questions_solved', icon: 'Library',       xp_reward: 1600, name_ar: '500 سؤال',       name_en: '500 Questions',   desc_ar: 'حل 500 سؤال',        desc_en: 'Solve 500 questions' },
  { id: 'questions_1000',     category: 'questions', tier: 'gold',    target: 1000, stat_key: 'questions_solved', icon: 'Library',       xp_reward: 1900, name_ar: '1000 سؤال',      name_en: '1K Questions',    desc_ar: 'حل 1000 سؤال',       desc_en: 'Solve 1,000 questions' },
  { id: 'questions_2500',     category: 'questions', tier: 'diamond', target: 2500, stat_key: 'questions_solved', icon: 'Library',       xp_reward: 2400, name_ar: '2500 سؤال',      name_en: '2.5K Questions',  desc_ar: 'حل 2500 سؤال',       desc_en: 'Solve 2,500 questions' },
  { id: 'questions_5000',     category: 'questions', tier: 'diamond', target: 5000, stat_key: 'questions_solved', icon: 'Library',       xp_reward: 3200, name_ar: '5000 سؤال',      name_en: '5K Questions',    desc_ar: 'حل 5000 سؤال',       desc_en: 'Solve 5,000 questions' },

  // ═══════════ Correct Answers (5) = 6,000 ═══════════
  { id: 'first_correct',      category: 'correct',   tier: 'bronze',  target: 1,    stat_key: 'questions_correct', icon: 'CheckCircle',  xp_reward: 300,  name_ar: 'أول صح',          name_en: 'First Correct',   desc_ar: 'إجابة صحيحة أولى',   desc_en: 'First correct answer' },
  { id: 'correct_25',         category: 'correct',   tier: 'bronze',  target: 25,   stat_key: 'questions_correct', icon: 'CheckCircle',  xp_reward: 600,  name_ar: '25 صح',           name_en: '25 Correct',      desc_ar: '25 إجابة صحيحة',     desc_en: '25 correct answers' },
  { id: 'correct_100',        category: 'correct',   tier: 'silver',  target: 100,  stat_key: 'questions_correct', icon: 'CheckCheck',   xp_reward: 1000, name_ar: '100 صح',          name_en: '100 Correct',     desc_ar: '100 إجابة صحيحة',    desc_en: '100 correct answers' },
  { id: 'correct_500',        category: 'correct',   tier: 'gold',    target: 500,  stat_key: 'questions_correct', icon: 'CheckCheck',   xp_reward: 1600, name_ar: '500 صح',          name_en: '500 Correct',     desc_ar: '500 إجابة صحيحة',    desc_en: '500 correct answers' },
  { id: 'correct_1000',       category: 'correct',   tier: 'diamond', target: 1000, stat_key: 'questions_correct', icon: 'Award',        xp_reward: 2500, name_ar: '1000 صح',         name_en: '1K Correct',      desc_ar: '1000 إجابة صحيحة',   desc_en: '1,000 correct answers' },

  // ═══════════ Accuracy (3) = 4,500 ═══════════
  { id: 'accuracy_70',        category: 'accuracy',  tier: 'silver',  target: 70,   stat_key: 'accuracy_100',      icon: 'Target',       xp_reward: 800,  name_ar: 'دقة 70%',         name_en: 'Sharp Shooter',   desc_ar: '70% دقة بعد 100 سؤال', desc_en: '70% accuracy after 100' },
  { id: 'accuracy_80',        category: 'accuracy',  tier: 'gold',    target: 80,   stat_key: 'accuracy_200',      icon: 'Target',       xp_reward: 1400, name_ar: 'دقة 80%',         name_en: 'Precision',       desc_ar: '80% دقة بعد 200 سؤال', desc_en: '80% accuracy after 200' },
  { id: 'accuracy_90',        category: 'accuracy',  tier: 'diamond', target: 90,   stat_key: 'accuracy_300',      icon: 'Crosshair',    xp_reward: 2300, name_ar: 'دقة 90%',         name_en: 'Sniper',          desc_ar: '90% دقة بعد 300 سؤال', desc_en: '90% accuracy after 300' },

  // ═══════════ Combo (4) = 3,500 ═══════════
  { id: 'combo_5',            category: 'combo',     tier: 'bronze',  target: 5,    stat_key: 'combo_max',         icon: 'Zap',          xp_reward: 350,  name_ar: '5 متتالية',      name_en: 'Hot Streak',      desc_ar: '5 صح ورا بعض',       desc_en: '5 correct in a row' },
  { id: 'combo_10',           category: 'combo',     tier: 'silver',  target: 10,   stat_key: 'combo_max',         icon: 'Zap',          xp_reward: 550,  name_ar: '10 متتالية',     name_en: 'On Fire',         desc_ar: '10 صح ورا بعض',      desc_en: '10 correct in a row' },
  { id: 'combo_25',           category: 'combo',     tier: 'gold',    target: 25,   stat_key: 'combo_max',         icon: 'Flame',        xp_reward: 1000, name_ar: '25 متتالية',     name_en: 'Unstoppable',     desc_ar: '25 صح ورا بعض',      desc_en: '25 correct in a row' },
  { id: 'combo_50',           category: 'combo',     tier: 'diamond', target: 50,   stat_key: 'combo_max',         icon: 'Flame',        xp_reward: 1600, name_ar: '50 متتالية',     name_en: 'Godlike',         desc_ar: '50 صح ورا بعض',      desc_en: '50 correct in a row' },

  // ═══════════ Streak (7) = 12,500 ═══════════
  { id: 'streak_3',           category: 'streak',    tier: 'bronze',  target: 3,    stat_key: 'streak',            icon: 'Calendar',     xp_reward: 400,  name_ar: '3 أيام',         name_en: '3-Day Streak',    desc_ar: '3 أيام متتالية',      desc_en: '3-day streak' },
  { id: 'streak_7',           category: 'streak',    tier: 'bronze',  target: 7,    stat_key: 'streak',            icon: 'Calendar',     xp_reward: 650,  name_ar: 'أسبوع كامل',      name_en: 'Week Warrior',    desc_ar: '7 أيام متتالية',      desc_en: '7-day streak' },
  { id: 'streak_14',          category: 'streak',    tier: 'silver',  target: 14,   stat_key: 'streak',            icon: 'CalendarDays', xp_reward: 950,  name_ar: 'أسبوعين',         name_en: 'Two Weeks',       desc_ar: '14 يوم متتالي',      desc_en: '14-day streak' },
  { id: 'streak_30',          category: 'streak',    tier: 'gold',    target: 30,   stat_key: 'streak',            icon: 'CalendarDays', xp_reward: 1400, name_ar: 'شهر كامل',       name_en: 'Monthly Master',  desc_ar: '30 يوم متتالي',      desc_en: '30-day streak' },
  { id: 'streak_60',          category: 'streak',    tier: 'gold',    target: 60,   stat_key: 'streak',            icon: 'CalendarDays', xp_reward: 1800, name_ar: 'شهرين',          name_en: 'Two Months',      desc_ar: '60 يوم متتالي',      desc_en: '60-day streak' },
  { id: 'streak_100',         category: 'streak',    tier: 'diamond', target: 100,  stat_key: 'streak',            icon: 'CalendarDays', xp_reward: 2500, name_ar: '100 يوم',        name_en: 'Centurion',       desc_ar: '100 يوم متتالي',     desc_en: '100-day streak' },
  { id: 'streak_365',         category: 'streak',    tier: 'diamond', target: 365,  stat_key: 'streak',            icon: 'Trophy',       xp_reward: 4800, name_ar: 'سنة كاملة',      name_en: 'Year of Dedication', desc_ar: 'سنة كاملة متتالية', desc_en: '365-day streak' },

  // ═══════════ Mock Exam (5) = 5,800 ═══════════
  { id: 'mock_first',         category: 'mock',      tier: 'bronze',  target: 1,    stat_key: 'mock_exams',        icon: 'FileText',     xp_reward: 250,  name_ar: 'أول امتحان',     name_en: 'First Mock',      desc_ar: 'خلصت أول امتحان',    desc_en: 'Complete first mock' },
  { id: 'mock_5',             category: 'mock',      tier: 'silver',  target: 5,    stat_key: 'mock_exams',        icon: 'FileText',     xp_reward: 500,  name_ar: '5 امتحانات',     name_en: 'Mock Veteran',    desc_ar: '5 امتحانات كاملة',   desc_en: '5 mock exams' },
  { id: 'mock_70',            category: 'mock',      tier: 'silver',  target: 70,   stat_key: 'mock_score_max',    icon: 'Target',       xp_reward: 800,  name_ar: '70%+ في امتحان', name_en: 'Above Average',   desc_ar: '70% أو أكتر',        desc_en: 'Score 70%+' },
  { id: 'mock_85',            category: 'mock',      tier: 'gold',    target: 85,   stat_key: 'mock_score_max',    icon: 'Target',       xp_reward: 1500, name_ar: '85%+ في امتحان', name_en: 'Excellent',       desc_ar: '85% أو أكتر',        desc_en: 'Score 85%+' },
  { id: 'mock_100',           category: 'mock',      tier: 'diamond', target: 100,  stat_key: 'mock_score_max',    icon: 'Crown',        xp_reward: 2750, name_ar: 'العلامة الكاملة', name_en: 'Perfect Score',   desc_ar: '100% في امتحان',     desc_en: 'Perfect mock exam' },

  // ═══════════ Redemption (3) = 3,000 ═══════════
  { id: 'redemption_10',      category: 'redemption', tier: 'bronze', target: 10,   stat_key: 'corrected_count',   icon: 'RotateCcw',    xp_reward: 400,  name_ar: '10 تصحيحات',     name_en: 'Corrector',       desc_ar: 'صحّح 10 أسئلة غلط',   desc_en: 'Correct 10 wrong answers' },
  { id: 'redemption_50',      category: 'redemption', tier: 'silver', target: 50,   stat_key: 'corrected_count',   icon: 'RotateCcw',    xp_reward: 900,  name_ar: '50 تصحيح',       name_en: 'Redeemer',        desc_ar: 'صحّح 50 سؤال غلط',    desc_en: 'Correct 50 wrong answers' },
  { id: 'redemption_clear',   category: 'redemption', tier: 'gold',   target: 20,   stat_key: 'incorrect_cleared', icon: 'Shield',       xp_reward: 1700, name_ar: 'صفر أخطاء',      name_en: 'Clean Slate',     desc_ar: 'صفّرت الـ Incorrect', desc_en: 'Clear incorrect list' },

  // ═══════════ Notebook (3) = 1,500 ═══════════
  { id: 'notebook_1',         category: 'notebook',  tier: 'bronze',  target: 1,    stat_key: 'notes_count',       icon: 'BookOpen',     xp_reward: 200,  name_ar: 'أول ملاحظة',     name_en: 'First Note',      desc_ar: 'أول ملاحظة',         desc_en: 'First note saved' },
  { id: 'notebook_10',        category: 'notebook',  tier: 'silver',  target: 10,   stat_key: 'notes_count',       icon: 'StickyNote',   xp_reward: 500,  name_ar: '10 ملاحظات',     name_en: 'Note Taker',      desc_ar: '10 ملاحظات',         desc_en: '10 notes saved' },
  { id: 'notebook_50',        category: 'notebook',  tier: 'gold',    target: 50,   stat_key: 'notes_count',       icon: 'StickyNote',   xp_reward: 800,  name_ar: '50 ملاحظة',      name_en: 'Scholar',         desc_ar: '50 ملاحظة',          desc_en: '50 notes saved' },

  // ═══════════ Smart Review (3) = 2,500 ═══════════
  { id: 'smart_review_10',    category: 'smart_review', tier: 'bronze', target: 10, stat_key: 'smart_review_count', icon: 'Brain',       xp_reward: 400,  name_ar: '10 مراجعات',     name_en: 'Reviewer',        desc_ar: '10 مراجعات ذكية',    desc_en: '10 smart reviews' },
  { id: 'smart_review_100',   category: 'smart_review', tier: 'silver', target: 100, stat_key: 'smart_review_count', icon: 'Brain',      xp_reward: 800,  name_ar: '100 مراجعة',     name_en: 'Memory Master',   desc_ar: '100 مراجعة ذكية',    desc_en: '100 smart reviews' },
  { id: 'smart_review_grad',  category: 'smart_review', tier: 'gold',   target: 1,  stat_key: 'smart_review_graduated', icon: 'GraduationCap', xp_reward: 1300, name_ar: 'خرج من الدورة', name_en: 'Graduate',        desc_ar: 'سؤال خرج من دورة SR', desc_en: 'Question graduated from SR' },

  // ═══════════ Daily Case (3) = 1,500 ═══════════
  { id: 'daily_case_1',       category: 'daily_case', tier: 'bronze', target: 1,    stat_key: 'daily_case_count',  icon: 'Sparkles',     xp_reward: 200,  name_ar: 'أول Daily Case', name_en: 'Daily Starter',   desc_ar: 'أول حالة يومية',     desc_en: 'First daily case' },
  { id: 'daily_case_7',       category: 'daily_case', tier: 'silver', target: 7,    stat_key: 'daily_case_count',  icon: 'Sparkles',     xp_reward: 500,  name_ar: '7 حالات',        name_en: 'Weekly Case',     desc_ar: '7 حالات يومية',      desc_en: '7 daily cases' },
  { id: 'daily_case_30',      category: 'daily_case', tier: 'gold',   target: 30,   stat_key: 'daily_case_count',  icon: 'Sparkles',     xp_reward: 800,  name_ar: '30 حالة',        name_en: 'Monthly Case',    desc_ar: '30 حالة يومية',      desc_en: '30 daily cases' },

  // ═══════════ Daily Goal (3) = 1,500 ═══════════
  { id: 'daily_goal_1',       category: 'daily_goal', tier: 'bronze', target: 1,    stat_key: 'goal_hit_count',    icon: 'Target',       xp_reward: 200,  name_ar: 'هدف أول يوم',    name_en: 'Goal Hitter',     desc_ar: 'حقق هدف يوم',        desc_en: 'Hit daily goal once' },
  { id: 'daily_goal_7',       category: 'daily_goal', tier: 'silver', target: 7,    stat_key: 'goal_hit_count',    icon: 'Target',       xp_reward: 500,  name_ar: '7 أهداف',        name_en: 'Week Champion',   desc_ar: '7 أهداف يومية',      desc_en: 'Hit goal 7 times' },
  { id: 'daily_goal_30',      category: 'daily_goal', tier: 'gold',   target: 30,   stat_key: 'goal_hit_count',    icon: 'Trophy',       xp_reward: 800,  name_ar: 'شهر أهداف',      name_en: 'Monthly Champion', desc_ar: '30 هدف يومي',       desc_en: 'Hit goal 30 times' },

  // ═══════════ Study Room (4) = 3,500 ═══════════
  { id: 'study_room_first',   category: 'study_room', tier: 'bronze', target: 1,    stat_key: 'study_room_rooms',  icon: 'Users',        xp_reward: 200,  name_ar: 'أول غرفة',       name_en: 'Room Founder',    desc_ar: 'أنشأت أول غرفة',     desc_en: 'Created first room' },
  { id: 'study_room_1h',      category: 'study_room', tier: 'bronze', target: 3600, stat_key: 'study_room_seconds', icon: 'Clock',       xp_reward: 450,  name_ar: 'ساعة مذاكرة',    name_en: 'One Hour Club',   desc_ar: 'ساعة في Study Room', desc_en: '1 hour in Study Room' },
  { id: 'study_room_10h',     category: 'study_room', tier: 'silver', target: 36000, stat_key: 'study_room_seconds', icon: 'Clock',      xp_reward: 1000, name_ar: '10 ساعات',       name_en: '10-Hour Club',    desc_ar: '10 ساعات مذاكرة',    desc_en: '10 hours in Study Room' },
  { id: 'study_room_50h',     category: 'study_room', tier: 'gold',   target: 180000, stat_key: 'study_room_seconds', icon: 'Clock',     xp_reward: 1850, name_ar: '50 ساعة',        name_en: '50-Hour Club',    desc_ar: '50 ساعة مذاكرة',     desc_en: '50 hours in Study Room' },

  // ═══════════ Explorer (3) = 8,000 ═══════════
  { id: 'explorer_5cat',      category: 'explorer',  tier: 'bronze',  target: 5,    stat_key: 'categories_count',  icon: 'Compass',      xp_reward: 1500, name_ar: '5 تصنيفات',      name_en: 'Explorer',        desc_ar: 'حل في 5 تصنيفات',    desc_en: 'Solved in 5 categories' },
  { id: 'explorer_10cat',     category: 'explorer',  tier: 'silver',  target: 10,   stat_key: 'categories_count',  icon: 'Compass',      xp_reward: 2700, name_ar: '10 تصنيفات',     name_en: 'Voyager',         desc_ar: 'حل في 10 تصنيفات',   desc_en: 'Solved in 10 categories' },
  { id: 'explorer_allcat',    category: 'explorer',  tier: 'gold',    target: 100,  stat_key: 'categories_pct',    icon: 'Globe',        xp_reward: 3800, name_ar: 'كل التصنيفات',   name_en: 'Completionist',   desc_ar: 'حل في كل التصنيفات', desc_en: 'All categories covered' },

  // ═══════════ Levels (3) = 8,000 ═══════════
  { id: 'level_5',            category: 'levels',    tier: 'bronze',  target: 5,    stat_key: 'level',             icon: 'TrendingUp',   xp_reward: 1500, name_ar: 'المستوى 5',      name_en: 'Level 5',         desc_ar: 'وصلت للمستوى 5',     desc_en: 'Reached level 5' },
  { id: 'level_10',           category: 'levels',    tier: 'silver',  target: 10,   stat_key: 'level',             icon: 'TrendingUp',   xp_reward: 2700, name_ar: 'المستوى 10',     name_en: 'Level 10',        desc_ar: 'وصلت للمستوى 10',    desc_en: 'Reached level 10' },
  { id: 'level_25',           category: 'levels',    tier: 'gold',    target: 25,   stat_key: 'level',             icon: 'Rocket',       xp_reward: 3800, name_ar: 'المستوى 25',     name_en: 'Level 25',        desc_ar: 'وصلت للمستوى 25',    desc_en: 'Reached level 25' },

  // ═══════════ Leaderboard (2) = 10,500 ═══════════
  { id: 'leaderboard_top10',  category: 'leaderboard', tier: 'silver', target: 10,  stat_key: 'leaderboard_rank',  icon: 'Trophy',       xp_reward: 3500, name_ar: 'Top 10',         name_en: 'Top 10',          desc_ar: 'دخلت Top 10 أسبوعيًا', desc_en: 'Top 10 weekly' },
  { id: 'leaderboard_1',      category: 'leaderboard', tier: 'gold',   target: 1,   stat_key: 'leaderboard_rank',  icon: 'Crown',        xp_reward: 7000, name_ar: 'المركز الأول',   name_en: 'Champion',        desc_ar: 'المركز الأول',       desc_en: 'Weekly #1' },

  // ═══════════ Time (2) = 400 ═══════════
  { id: 'early_bird',         category: 'time',      tier: 'bronze',  target: 1,    stat_key: 'early_bird_count',  icon: 'Sunrise',      xp_reward: 200,  name_ar: 'طائر الصباح',    name_en: 'Early Bird',      desc_ar: 'ذاكرت قبل 7 صباحًا', desc_en: 'Study before 7 AM' },
  { id: 'night_owl',          category: 'time',      tier: 'bronze',  target: 1,    stat_key: 'night_owl_count',   icon: 'Moon',         xp_reward: 200,  name_ar: 'بومة الليل',     name_en: 'Night Owl',       desc_ar: 'ذاكرت بعد 12 منتصف الليل', desc_en: 'Study after midnight' },

  // ═══════════ Setup (2) = 300 ═══════════
  { id: 'setup_exam_date',    category: 'setup',     tier: 'bronze',  target: 1,    stat_key: 'has_exam_date',     icon: 'Calendar',     xp_reward: 200,  name_ar: 'محدد تاريخ',     name_en: 'Planner',         desc_ar: 'حددت تاريخ الامتحان', desc_en: 'Exam date set' },
  { id: 'setup_notifications', category: 'setup',    tier: 'bronze',  target: 1,    stat_key: 'notifications_on',  icon: 'Bell',         xp_reward: 100,  name_ar: 'مفعّل الإشعارات', name_en: 'Notifier',        desc_ar: 'فعّلت الإشعارات',    desc_en: 'Notifications enabled' },

  // ═══════════ Secret (4) = 4,000 ═══════════
  { id: 'secret_1',           category: 'secret',    tier: 'gold',    target: 21,   stat_key: 'streak',            icon: 'Calendar',     xp_reward: 900,  name_ar: '؟؟؟',            name_en: '???',             desc_ar: '؟؟؟',                desc_en: '???', secret: true },
  { id: 'secret_2',           category: 'secret',    tier: 'gold',    target: 25,   stat_key: 'notes_count',       icon: 'StickyNote',   xp_reward: 900,  name_ar: '؟؟؟',            name_en: '???',             desc_ar: '؟؟؟',                desc_en: '???', secret: true },
  { id: 'secret_3',           category: 'secret',    tier: 'diamond', target: 100,  stat_key: 'corrected_count',   icon: 'RotateCcw',    xp_reward: 1100, name_ar: '؟؟؟',            name_en: '???',             desc_ar: '؟؟؟',                desc_en: '???', secret: true },
  { id: 'secret_4',           category: 'secret',    tier: 'diamond', target: 20,   stat_key: 'level',             icon: 'TrendingUp',   xp_reward: 1100, name_ar: '؟؟؟',            name_en: '???',             desc_ar: '؟؟؟',                desc_en: '???', secret: true },
];

// ═══════════ Helper Functions ═══════════

export const TIER_COLORS: Record<BadgeTier, { bg: string; border: string; text: string; glow: string }> = {
  bronze:  { bg: 'bg-amber-950/40',   border: 'border-amber-700',   text: 'text-amber-400',   glow: 'shadow-amber-900/50' },
  silver:  { bg: 'bg-slate-800/40',   border: 'border-slate-500',   text: 'text-slate-300',   glow: 'shadow-slate-700/50' },
  gold:    { bg: 'bg-yellow-950/40',  border: 'border-yellow-600',  text: 'text-yellow-400',  glow: 'shadow-yellow-900/50' },
  diamond: { bg: 'bg-cyan-950/40',    border: 'border-cyan-500',    text: 'text-cyan-300',    glow: 'shadow-cyan-900/50' },
};

export function getBadgeById(id: string): BadgeDef | undefined {
  return BADGE_DEFS.find(b => b.id === id);
}

export function getProgress(badge: BadgeDef, stats: Record<string, number>): number {
  const value = stats[badge.stat_key] ?? 0;
  return Math.min(value, badge.target);
}

export function getProgressPct(badge: BadgeDef, stats: Record<string, number>): number {
  const value = stats[badge.stat_key] ?? 0;
  if (badge.target <= 0) return 0;
  return Math.min(100, Math.round((value / badge.target) * 100));
}