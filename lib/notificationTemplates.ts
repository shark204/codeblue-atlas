// lib/notificationTemplates.ts
export type NotifType =
  | 'daily_reminder'
  | 'daily_goal'
  | 'exam_countdown'
  | 'weekly_summary'
  | 'streak_risk'
  | 'smart_review'
  | 'weekly_wrong_review'
  | 'daily_case'
  | 'badge_unlock'
  | 'study_room'
  | 'admin_announcements'
  | 'weekly_report'
  | 'absence_reminder';

export interface TemplateVars {
  name?: string;
  daysLeft?: number;
  questionsLeft?: number;
  dailyGoal?: number;
  streak?: number;
  smartReviewCount?: number;
  badgeName?: string;
  announcement?: string;
  correctPct?: number;
  xpEarned?: number;
}

export const TEMPLATES: Record<NotifType, { title: string; bodies: string[] }> = {
  daily_reminder: {
    title: '📚 وقت المذاكرة',
    bodies: [
      'يلا نبدأ يا {name}؟ 10 دقايق بس تكفي!',
      'فاضلك {questionsLeft} سؤال النهاردة، يلا نبدأ 💪',
      'مراجعة سريعة؟ كل سؤال بيقرّبك للهدف',
    ],
  },
  daily_goal: {
    title: '🎯 هدف النهاردة',
    bodies: [
      'فاضلك {questionsLeft} سؤال بس لهدفك!',
      'قربت تخلص هدفك يا {name} — كمّل!',
      'باقي {dailyGoal} سؤال للهدف اليومي 🎯',
    ],
  },
  exam_countdown: {
    title: '⏰ عدّاد الامتحان',
    bodies: [
      'باقي {daysLeft} يوم على الامتحان! ركّز يا بطل',
      'محتاج تحل {dailyGoal} سؤال كل يوم عشان تخلص في الوقت',
      'فاضلك {questionsLeft} سؤال و{daysLeft} يوم — يلا نبدأ',
    ],
  },
  weekly_summary: {
    title: '📊 ملخص الأسبوع',
    bodies: [
      'فاضلك {questionsLeft} سؤال هذا الأسبوع',
      'خطتك للأسبوع: {dailyGoal} سؤال كل يوم',
      'شوف تقدمك: {questionsLeft} سؤال باقي',
    ],
  },
  streak_risk: {
    title: '🔥 سلسلتك في خطر',
    bodies: [
      'لسه محلتش النهاردة! سؤال واحد بس عشان تحافظ على {streak} يوم',
      'متسيبش سلسلة {streak} يوم تروح — دقيقتين بس!',
    ],
  },
  smart_review: {
    title: '🧠 مراجعة ذكية',
    bodies: [
      'عندك {smartReviewCount} سؤال مستحق للمراجعة',
      'وقت المراجعة الذكية! {smartReviewCount} سؤال مستني',
    ],
  },
  weekly_wrong_review: {
    title: '📝 مراجعة الغلط',
    bodies: [
      'يلا نراجع الأخطاء الأسبوعية',
      'وقت نراجع الأخطاء ونصلّحها 💪',
    ],
  },
  daily_case: {
    title: '✨ الحالة اليومية',
    bodies: [
      'حالة جديدة النهاردة — جاهز؟',
      'Daily Case جديدة! يلا نشوف',
    ],
  },
  badge_unlock: {
    title: '🏆 فتحت بادج جديدة',
    bodies: [
      'مبروك! فتحت بادج "{badgeName}" 🎉',
      'إنجاز جديد: {badgeName}',
    ],
  },
  study_room: {
    title: '👥 غرفة المذاكرة',
    bodies: [
      'يلا نذاكر مع الشلة',
      'غرفة مذاكرة جديدة متاحة',
    ],
  },
  admin_announcements: {
    title: '📢 إعلان',
    bodies: ['{announcement}'],
  },
  weekly_report: {
    title: '📈 تقريرك الأسبوعي',
    bodies: [
      'الأسبوع ده: {correctPct}% دقة، و{xpEarned} XP',
      'أداءك الأسبوعي: دقة {correctPct}% 🎯',
    ],
  },
  absence_reminder: {
    title: '👋 وحشتنا!',
    bodies: [
      'غبت كام يوم — يلا نرجع نذاكر',
      'افتقدناك يا {name}! سؤال واحد بس النهاردة',
    ],
  },
};

// ✅ الجديد — يختار رسالة كل متغيراتها متاحة
export function renderTemplate(
  type: NotifType,
  vars: TemplateVars
): { title: string; body: string } {
  const tmpl = TEMPLATES[type];
  if (!tmpl) return { title: 'Code Blue Bank', body: '' };

  const hasAll = (text: string) =>
    [...text.matchAll(/\{(\w+)\}/g)].every(m => {
      const v = vars[m[1] as keyof TemplateVars];
      return v !== undefined && v !== null && !(typeof v === 'number' && Number.isNaN(v));
    });

  const usable = tmpl.bodies.filter(hasAll);
  const pool = usable.length ? usable : tmpl.bodies;
  const randomBody = pool[Math.floor(Math.random() * pool.length)];

  const replaceVars = (text: string) =>
    text.replace(/\{(\w+)\}/g, (_, key) => {
      const val = vars[key as keyof TemplateVars];
      return val !== undefined && val !== null ? String(val) : '';
    });

  return { title: replaceVars(tmpl.title), body: replaceVars(randomBody).trim() };
}

export function computeProgress(vars: {
  questionsCount: number;
  scoreTotal: number;
  daysLeft: number | null;
  manualGoal?: number | null;
}): { questionsLeft: number; dailyGoal: number } {
  const questionsLeft = Math.max(0, vars.questionsCount - vars.scoreTotal);

  let dailyGoal: number;
  if (vars.manualGoal && vars.manualGoal > 0) {
    dailyGoal = vars.manualGoal;
  } else if (vars.daysLeft && vars.daysLeft > 0) {
    dailyGoal = Math.ceil(questionsLeft / vars.daysLeft);
  } else {
    dailyGoal = 0;
  }

  return { questionsLeft, dailyGoal };
}