/* eslint-disable */
// @ts-nocheck
'use client';

import { useEffect, useMemo, useState } from 'react';
import DailyCase from './DailyCase';
import Leaderboard from './Leaderboard';
import { useLanguageStore } from '@/stores/languageStore';
import { useUIStore } from '@/stores/uiStore';
import { useProgressStore } from '@/stores/progressStore';

type ExamKey = 'mrcs' | 'mrcp' | 'usmle';
type LangKey = 'ar' | 'en';

const CBX_CSS = `@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800&family=Sora:wght@700;800&display=swap');
:root{--font-default:var(--font-cairo),'Cairo',var(--font-inter),'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif !important;--font-sans:var(--font-cairo),'Cairo',var(--font-inter),'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif !important}
html:not([data-exam-font="true"]),html:not([data-exam-font="true"]) body,html:not([data-exam-font="true"]) .font-sans,html:not([data-exam-font="true"]) div,html:not([data-exam-font="true"]) span,html:not([data-exam-font="true"]) p,html:not([data-exam-font="true"]) a,html:not([data-exam-font="true"]) button,html:not([data-exam-font="true"]) input,html:not([data-exam-font="true"]) textarea,html:not([data-exam-font="true"]) select,html:not([data-exam-font="true"]) label,html:not([data-exam-font="true"]) li{font-family:var(--font-cairo),'Cairo',sans-serif;font-feature-settings:normal}
.cbx{--a:#14b8a6;--b:#3b82f6;position:relative;max-width:100%;width:100%;margin:0 auto;padding:clamp(14px,3vw,28px);border-radius:24px;color:#fff !important;background:linear-gradient(160deg,#0b2d52,#07203c) !important;border:1px solid rgba(124,196,255,.28) !important;box-shadow:0 20px 50px rgba(0,0,0,.35);line-height:1.7}
.cbx *{box-sizing:border-box}.cbx-h{display:flex;gap:14px;align-items:center}
.cbx-ic{position:relative;flex:none;width:58px;height:58px;border-radius:16px;display:grid;place-items:center;background:radial-gradient(circle at 30% 25%,rgba(45,212,191,.35),rgba(59,130,246,.22) 60%,rgba(6,34,61,.92) 100%);border:1.5px solid rgba(94,234,212,.45);box-shadow:0 10px 25px rgba(20,184,166,.28),inset 0 1px 1px rgba(255,255,255,.35)}
.cbx-ic img{width:44px;height:44px;object-fit:contain;filter:drop-shadow(0 0 8px rgba(56,189,248,.65)) drop-shadow(0 2px 10px rgba(20,184,166,.35));animation:caduceusFloat 6s ease-in-out infinite;user-select:none;pointer-events:none}
.cbx-ic-dot{position:absolute;top:-3px;inset-inline-end:-3px;width:11px;height:11px;border-radius:99px;background:#34d399;border:2px solid #082340;box-shadow:0 0 10px #34d399}
.cbx h2.cbx-title{margin:0;font-family:'Sora','Plus Jakarta Sans',var(--font-orbitron),var(--font-cairo),sans-serif !important;font-size:clamp(22px,2.6vw,28px);font-weight:800 !important;letter-spacing:-.02em !important;line-height:1.18;background:linear-gradient(95deg,#ffffff 0%,#bae6fd 50%,#5eead4 100%);-webkit-background-clip:text !important;background-clip:text !important;-webkit-text-fill-color:transparent !important;color:#fff !important;filter:drop-shadow(0 2px 12px rgba(45,212,191,.28))}
.cbx-s{opacity:.85;font-size:13.5px;font-weight:600;color:#e0f2fe !important;margin-top:2px}
.cbx-p{margin-inline-start:auto;font-size:10px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;padding:4px 10px;border-radius:99px;background:linear-gradient(90deg,#8fd0ff,#6ee7d0);color:#06223d !important}
.cbx-an{margin:18px 0;padding:16px 18px;border-radius:16px;border:1.5px solid var(--a);background:rgba(20,184,166,.14)}.cbx-an.compact{margin-bottom:0}
.cbx-an:before{content:"";display:block;width:56px;height:5px;margin-bottom:12px;border-radius:3px;background:linear-gradient(90deg,var(--a),var(--b))}
.cbx-an h3{margin:0 0 4px;font-size:19px;font-weight:800;color:#5eead4 !important}.cbx-an p{margin:0;color:#fff !important}
.cbx-act{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:10px}
.cbx a.cbx-go{display:inline-block;padding:7px 16px;border-radius:99px;color:#06223d !important;text-decoration:none;font-weight:700;background:linear-gradient(90deg,#8fd0ff,#6ee7d0)}
.cbx button.cbx-more{padding:7px 16px;border-radius:99px;border:1px solid rgba(124,196,255,.55);background:rgba(124,196,255,.2);color:#eaf6ff !important;font:inherit;font-size:14px;font-weight:700;cursor:pointer}
.cbx button.cbx-more.on{background:linear-gradient(90deg,#8fd0ff,#6ee7d0);color:#06223d !important;border-color:transparent}
.cbx h4{margin:20px 0 8px;font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;opacity:.7;color:#fff !important}
.cbx-g{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:12px}
.cbx-c{padding:14px;border-radius:16px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.2);color:#fff !important}
.cbx-c strong{color:#fff !important;font-weight:700}.cbx-c small{display:block;opacity:.8;font-size:12px;color:#fff !important}
.cbx-t{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin:8px 0;text-align:center}
.cbx-t b{display:block;font-size:24px;font-weight:800;padding:6px 0;border-radius:10px;background:rgba(0,0,0,.32);font-variant-numeric:tabular-nums;color:#fff !important}
.cbx-t span{font-size:10px;opacity:.75;color:#fff !important}
.cbx .cbx-in{width:100%;padding:8px;border-radius:10px;border:1px solid rgba(255,255,255,.3);background:rgba(0,0,0,.3) !important;color:#fff !important;color-scheme:dark !important;font:inherit;margin-top:6px}
.cbx-tb{display:flex;gap:6px;flex-wrap:wrap;margin-top:6px}
.cbx-tb button,.cbx-ch button{background:rgba(124,196,255,.2);border:1px solid rgba(124,196,255,.55);color:#eaf6ff !important;font:inherit;cursor:pointer;border-radius:99px}
.cbx-tb button{padding:8px 14px;font-size:14px}.cbx-ch button{padding:3px 11px;font-size:12px}
.cbx-tb button.on,.cbx-ch button.on{background:linear-gradient(90deg,#8fd0ff,#6ee7d0);color:#06223d !important;border-color:transparent;font-weight:700}
.cbx-pn{display:none;margin-top:12px;padding:14px 16px;border-radius:16px;background:rgba(255,255,255,.06);color:#fff !important}.cbx-pn.on{display:block}
.cbx-pn ul{margin:0;padding-inline-start:20px;list-style:disc}.cbx-pn li{display:list-item;color:#fff !important}.cbx-pn p{margin:0;color:#fff !important}
.cbx-f{margin:16px 0 0;font-size:11px;opacity:.65;color:#fff !important}
.cbx .cbx-q{width:100%;padding:9px 12px;border-radius:12px;border:1px solid rgba(255,255,255,.3);background:rgba(0,0,0,.3) !important;color:#fff !important;color-scheme:dark !important;font:inherit;margin-bottom:8px}
.cbx .cbx-q::placeholder{color:rgba(255,255,255,.6) !important}.cbx-ch{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px}
.cbx-qa details{border:1px solid rgba(255,255,255,.18);border-radius:12px;padding:7px 12px;margin:6px 0;background:rgba(255,255,255,.06);color:#fff !important}
.cbx-qa summary{cursor:pointer;font-weight:700;color:#fff !important}.cbx-qa p{margin:6px 0 2px;opacity:.92;color:#fff !important}
.cbx-br{display:grid;grid-template-columns:minmax(90px,38%) 1fr 28px;gap:8px;align-items:center;font-size:13px;margin:3px 0;color:#fff !important}
.cbx-bw{background:rgba(255,255,255,.1);border-radius:5px}.cbx-bw i{display:block;height:8px;border-radius:5px;background:linear-gradient(90deg,var(--a),var(--b))}
.cbx-pn h5{margin:14px 0 4px;font-size:14px;font-weight:700;color:#5eead4 !important}
.cbx-cl label{display:flex;gap:8px;align-items:center;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.12);color:#fff !important;cursor:pointer}
.cbx-cl label span{margin-inline-start:auto;font-variant-numeric:tabular-nums;color:#fff !important}
.cbx-cl small{display:block;opacity:.75;font-size:12px;font-weight:400;color:#fff !important}
.cbx-rt{display:flex;gap:12px;flex-wrap:wrap;margin:10px 0}.cbx-rt label{font-size:13px;color:#fff !important}
.cbx .cbx-rt input{width:90px;padding:5px;border-radius:8px;border:1px solid rgba(255,255,255,.3);background:rgba(0,0,0,.3) !important;color:#fff !important;color-scheme:dark !important}
.cbx-sum{margin-top:10px;padding:12px;border-radius:14px;background:linear-gradient(90deg,rgba(20,184,166,.35),rgba(59,130,246,.35));font-size:20px;font-weight:800;color:#fff !important}
.cbx-opl{display:inline-flex;align-items:center;gap:6px;margin:0 0 10px;font-size:13px;cursor:pointer;color:#fff !important}`;

const L_MAP = {
  ar: { loc: 'ar-EG-u-nu-latn', u: ['يوم', 'ساعة', 'دقيقة', 'ثانية'], open: 'التسجيل مفتوح الآن', soon: 'التسجيل يبدأ قريباً', opens: 'يبدأ', closes: 'يغلق', closed: 'التسجيل مغلق', exam: 'الامتحان', days: 'يوم متبقي', apply: 'سجّل الآن', pick: 'اختر موعد امتحانك', passed: 'الموعد انتهى', tabs: ['نظرة عامة', 'أجزاء المعادلة', 'المحاولات والرسوم', 'أسئلة شائعة', 'أداة حساب التكلفة'], cd: 'العدّاد التنازلي', foot: 'المعلومات حتى أكتوبر 2026. المواعيد والرسوم تتغير، فتأكد من الموقع الرسمي قبل التقديم.', fxlive: 'تحديث تلقائي بتاريخ', opt: 'عرض Part 2 Written أيضاً (اختياري)' },
  en: { loc: 'en-GB', u: ['Days', 'Hrs', 'Min', 'Sec'], open: 'Applications now open', soon: 'Applications opening soon', opens: 'Opens', closes: 'Closes', closed: 'Registration closed', exam: 'Exam', days: 'days left', apply: 'Apply today', pick: 'Pick your exam date', passed: 'Date has passed', tabs: ['Overview', 'Structure', 'Attempts & fees'], cd: 'Countdown', foot: 'Information as of October 2026. Dates and fees change; confirm on the official website before applying.', fxlive: 'Updated', opt: 'Also show Part 2 Written (optional)' },
};

const DATA: Record<ExamKey, any> = {
  mrcs: {
    ic: 'MS', link: 'https://www.rcsi.com/dublin/professional-cpd/professional-exams/surgery/mrcs-part-a',
    ar: {
      t: 'Mrcs Updates', s: 'عضوية الكليات الملكية للجراحين', p: 'جراحة', an: ['', ''],
      diets: [
        { n: 'MRCS Part A: يناير 2027', close: '2026-10-29T17:00:00Z', open: null, exam: '2027-01-13', opt: 0 },
        { n: 'MRCS Part A: أبريل 2027', close: '2027-02-26T17:00:00Z', open: null, exam: '2027-04-29', opt: 0 },
      ],
      ov: 'تُدار بالاشتراك بين الكليات الجراحية الأربع في بريطانيا وأيرلندا (ICBSE). شرط لإكمال التدريب الجراحي الأساسي هناك، ويدخلها أطباء من أكثر من 40 دولة.',
      st: [
        'Part A: ورقتان بنظام Single Best Answer (SBA) في نفس اليوم: Applied Basic Sciences (180 سؤالاً، 3 ساعات) وPrinciples of Surgery in General (120 سؤالاً، ساعتان).',
        'Part B: OSCE نحو 17 محطة (8 معرفة تطبيقية و9 مهارات تطبيقية)، لكل محطة دقيقة قراءة و9 دقائق أداء، ويلزم نجاح Part A أولاً.',
      ],
      bars: [
        ['الورقة الأولى: 180 سؤالاً', [['تشريح إقليمي (Regional Anatomy)', '100%', 63], ['فسيولوجيا', '71%', 45], ['باثولوجيا', '59%', 37], ['أجنة (Embryology)', '13%', 8], ['فارماكولوجي', '13%', 8], ['ميكروبيولوجي', '11%', 7], ['أشعة', '8%', 5], ['تشريح سطحي (Surface Anatomy)', '6%', 4], ['بيانات وتدقيق (Data & Audit)', '5%', 3]]],
        ['الورقة الثانية: 120 سؤالاً', [['حالات جراحية شائعة (Common Surgical Conditions)', '100%', 45], ['رعاية حول العملية (Perioperative)', '78%', 35], ['الرضوح (Trauma)', '67%', 30], ['جراحة الأطفال (Paediatric Surgery)', '16%', 7], ['الجوانب القانونية (Medico-legal)', '7%', 3]]],
      ],
      at: ['Part A: 6 محاولات. Part B: 4 محاولات.', 'يجب إنهاء Part B خلال 7 سنوات من نجاح Part A.', 'الدورات: يناير وأبريل وسبتمبر (تأكد من الجدول الرسمي).'],
      atSum: 'Part A نحو £790 وPart B نحو £1,335، والمجموع £2,125 × 74.09 = حوالي 157 ألف جنيه مصري بدون كورسات وكتب وبنوك أسئلة ونثريات. (الرسوم ترتفع 3% من يناير 2027.)',
      faqPh: 'ابحث في 17 سؤالاً...',
      faqCats: ['عام', 'شروط', 'مواعيد', 'المحاولات', 'مصاريف', 'Part A', 'Part B', 'مذاكرة', 'بعد النجاح'],
      faqs: [
        ['عام', 'ما معنى Intercollegiate؟', 'الامتحان مشترك بين أربع كليات ملكية: إنجلترا وغلاسكو وإدنبرة وأيرلندا، ولا فرق بينها في الامتحان، ويُقبل في أيرلندا دون امتحان مستقل.'],
        ['عام', 'هل هو امتحان في العمليات الجراحية؟', 'لا، بل في مبادئ الجراحة وأسلوب التفكير، ولا يسأل عن خطوات العمليات.'],
        ['عام', 'هل يشمل كل التخصصات الجراحية؟', 'نعم بما فيها الأنف والأذن (بتفاصيل خاصة)، عدا العيون والنساء والتوليد فلكل منهما امتحان مستقل.'],
        ['شروط', 'ما شروط التقدم؟', 'شهادة تخرج مترجمة بختم الكلية بالإنجليزية، وإثبات هوية، وحساب على موقع الكلية. لا يُشترط تدريب عملي ويمكن التقدم بعد التخرج مباشرة.'],
        ['مواعيد', 'متى تُعقد الدورات؟', 'Part A ثلاث مرات سنوياً (يناير وأبريل وسبتمبر)، وPart B في مصر غالباً مرتين سنوياً. يُغلق التسجيل قبل الامتحان بنحو ثلاثة أشهر، فراجع الجدول الرسمي.'],
        ['المحاولات', 'كم محاولة أملك؟', 'ست محاولات في Part A وأربع في Part B، وتنتهي المهلة بعد 7 سنوات من نجاحك في Part A.'],
        ['مصاريف', 'كم تكلفة الامتحان؟', 'مجموع الرسوم £2,125 تقريباً، أي نحو 157 ألف جنيه بسعر اليوم. استخدم أداة حساب التكلفة لتعديل السعر.'],
        ['Part A', 'ما الذي يركز عليه Part A؟', 'نحو نصفه تشريح مباشر، ثم فسيولوجيا وباثولوجيا. وتقل الأسئلة في ECG وABG والإحصاء والتدقيق وتتركز على معلومات محددة.'],
        ['Part B', 'كيف يكون Part B؟', 'محطات تدور في دائرة، وتُقيَّم كل محطة على أربعة محاور: المعرفة، والمهارات، والتواصل، والمهنية (اتخاذ القرار والتخطيط وسلامة المريض).'],
        ['Part B', 'ما محطات Part B؟', 'المعرفة: تشريح جراحي (3) وباثولوجيا (2) ورعاية حرجة وبيانات مكتوبة ومعلومات بصرية. المهارات: تاريخ مرضي (2) ومعلومات لمريض ولزميل (2) وفحص (3) ومهارات عامة (2).'],
        ['مذاكرة', 'ما مدة المذاكرة؟', 'ستة أشهر بتفرغ، أو تسعة أشهر دون تفرغ، مع تركيز مكثف في آخر ثلاثة أشهر، وتختلف المدة من شخص لآخر.'],
        ['مذاكرة', 'ما أفضل طريقة للمذاكرة؟', 'الحل أهم بكثير من المذاكرة؛ اقرأ كل سؤال مع تفسيره، وما ضعفت فيه فاقرأه من كتاب بدلاً من إضاعة الوقت في الكتب على حساب الحل. أو اتبع كورساً ينظم لك المادة والحل والمراجعة.'],
        ['مذاكرة', 'ما الكتب النظرية؟', 'Raftery، وApplied Basic Sciences for MRCS، وSurgical Anatomy للدكتور سامح دوس، وIntercollegiate Revision Notes for MRCS.'],
        ['مذاكرة', 'ما بنوك الأسئلة؟', 'ابدأ بـ EMRCS (4 أشهر £35 و6 أشهر £45)، ثم Pastest (نحو £84-£135)، ثم OnExamination في النهاية، ثم أسئلة السنوات السابقة. تُذاكر البنوك ولا تقيس بها نفسك. الأسعار تقريبية.'],
        ['مذاكرة', 'هل أحفظ الأسئلة؟', 'لا، فالكلية تغيّر تفاصيلها باستمرار، وتعتمد على إرشادات ATLS وNICE المحدثة، لذا اشترك في بنوك أونلاين حديثة ولا تعتمد على ملفات قديمة.'],
        ['بعد النجاح', 'ما قيمة الشهادة؟', 'تعادل دبلومة في مصر وترقّيك أخصائياً بحسب النقابة، وتُسقط الجزء الأول من الماجستير أو الزمالة المصرية. وللتخصص الدقيق يلزم تدريب في بريطانيا ثم FRCS.'],
        ['بعد النجاح', 'ما أبرز العيوب؟', 'حجم مذاكرة كبير، ونجاح Part A من المحاولة الأولى نحو 43-45%، وهو نظري لا يثبت خبرة عملية، ويصعب التدريب في المخ والقلب والتجميل ببريطانيا.'],
      ],
      calc: {
        cur: 'gbp', label: 'سعر الإسترليني (جنيه)',
        items: [
          [790, 'gbp', 1, 'Part A', 'الامتحان النظري (ورقتان بنظام SBA)', '£790'],
          [1335, 'gbp', 1, 'Part B', 'الامتحان العملي OSCE بالمحطات', '£1,335'],
          [45, 'gbp', 0, 'بنك EMRCS (6 أشهر)', 'بنك أسئلة أونلاين للتدريب، ويُنصح بالبدء به', '£45'],
          [135, 'gbp', 0, 'بنك Pastest (حتى سبتمبر)', 'بنك أسئلة ثانٍ للتخصصات الجراحية', '£135'],
        ],
      },
    },
    en: {
      t: 'Mrcs Updates', s: 'Membership of the Royal Colleges of Surgeons', p: 'Surgery', an: ['', ''],
      diets: [
        { n: 'MRCS Part A: Jan 2027', close: '2026-10-29T17:00:00Z', open: null, exam: '2027-01-13', opt: 0 },
        { n: 'MRCS Part A: Apr 2027', close: '2027-02-26T17:00:00Z', open: null, exam: '2027-04-29', opt: 0 },
      ],
      ov: 'Run jointly by the four surgical Royal Colleges of the UK and Ireland (ICBSE). Required to complete Core Surgical Training in the UK and Ireland, and sat by doctors from over 40 countries.',
      st: [
        'Part A: two single-best-answer papers on one day. Applied Basic Science (180 Q, 3 h) and Principles of Surgery in General (120 Q, 2 h).',
        'Part B: OSCE with 18 stations of 9 minutes (about 3.5 h). Part A must be passed first.',
      ],
      at: ['Part A: 6 attempts. Part B: 4 attempts.', 'Complete Part B within 7 years of passing Part A.', 'Sittings: January, April and September.'],
      atSum: 'Part A about £790, Part B about £1,335 (India centres; varies by country). Fees rise 3% from January 2027.',
    },
  },
  mrcp: {
    ic: 'MP', opt: true, link: 'https://www.thefederation.uk/examinations/part-1/how-to-apply',
    ar: {
      t: 'Mrcp Updates', s: 'عضوية الكليات الملكية للأطباء', p: 'باطنة', an: ['', ''],
      diets: [
        { n: 'MRCP Part 2 Written 2026/3', close: '2026-09-22T23:59:00Z', open: '2026-09-15T08:00:00Z', exam: '2026-11-25', opt: 1 },
        { n: 'MRCP Part 1: 2027/1', close: '2026-11-03T08:00:00Z', open: '2026-10-27T08:00:00Z', exam: '2027-01-20', opt: 0 },
        { n: 'MRCP Part 2 Written 2027/1', close: '2026-12-15T08:00:00Z', open: '2026-12-08T08:00:00Z', exam: '2027-02-24', opt: 1 },
        { n: 'MRCP Part 1: 2027/2', close: '2027-03-16T08:00:00Z', open: '2027-03-09T08:00:00Z', exam: '2027-05-26', opt: 0 },
        { n: 'MRCP Part 1: 2027/3', close: '2027-07-20T07:00:00Z', open: '2027-07-13T07:00:00Z', exam: '2027-09-29', opt: 0 },
      ],
      ov: 'دبلوم الكليات الملكية للأطباء في بريطانيا، ومطلوب للتدريب في الباطنة والتخصصات المرتبطة بها.',
      st: [
        'Part 1: 200 سؤال Best of Five في يوم واحد، على ورقتين (100 سؤال و3 ساعات لكل ورقة) بينهما استراحة ساعتين. الدرجات من 200 إلى 800 تقريباً والنجاح من 540.',
        'Part 2 Written: 200 سؤال على ورقتين، حالات متقدمة بلا علوم أساسية وإحصاء، والنجاح من 454.',
        'PACES: 5 محطات و8 مرضى لقياس المهارات الإكلينيكية.',
      ],
      bars: [
        ['Part 1: الطب الباطني', [['قلب', '93%', 14], ['أعصاب', '93%', 14], ['غدد', '93%', 14], ['كلى', '100%', 15], ['جهاز هضمي وكبد (GIT & Hepatology)', '93%', 14], ['صدر', '93%', 14], ['روماتيزم', '93%', 14], ['دم', '67%', 10], ['أورام', '33%', 5], ['أمراض معدية', '93%', 14], ['جلدية', '53%', 8], ['نفسية', '60%', 9], ['مسنين (Geriatrics)', '53%', 8], ['عيون', '27%', 4], ['رعاية تلطيفية (Palliative)', '27%', 4]]],
        ['Part 1: العلوم السريرية', [['فارماكولوجي وسموم (Pharmacology & Toxicology)', '100%', 15], ['إحصاء ووبائيات (Statistics & EBM)', '33%', 5], ['كيمياء حيوية', '27%', 4], ['فسيولوجيا', '27%', 4], ['مناعة', '27%', 4], ['وراثة', '20%', 3], ['تشريح', '20%', 3], ['بيولوجيا خلوية', '13%', 2]]],
        ['Part 2: التوزيع', [['قلب', '100%', 19], ['غدد', '100%', 19], ['كلى', '100%', 19], ['هضمي', '100%', 19], ['صدر', '100%', 19], ['أمراض معدية', '100%', 19], ['فارماكولوجي سريري', '95%', 18], ['أعصاب', '89%', 17], ['دم', '47%', 9], ['جلدية', '47%', 9], ['مسنين (Geriatrics)', '47%', 9], ['روماتيزم', '47%', 9], ['أورام', '32%', 6], ['نفسية', '16%', 3], ['رعاية تلطيفية (Palliative)', '16%', 3], ['عيون', '16%', 3]]],
      ],
      at: ['حتى 6 محاولات لكل جزء، وتُنهى الأجزاء خلال 7 سنوات.', 'Part 1 في يناير ومايو وسبتمبر، وPart 2 في مارس ويونيو وأكتوبر.', 'الدرجة المطلوبة 540 تعادل نحو 120-130 سؤالاً صحيحاً ويُحتسب النجاح على الدرجة الكلية لا على كل فرع.'],
      atSum: 'Part 1 وPart 2 بسعر £696 لكل منهما وPACES £1,358، والمجموع £2,750 × 74.09 = حوالي 204 ألف جنيه مصري بدون كورسات وكتب وبنوك أسئلة ونثريات.',
      faqPh: 'ابحث في 23 سؤالاً...',
      faqCats: ['عام', 'شروط', 'Part 1', 'Part 2', 'مواعيد', 'المحاولات', 'مصاريف', 'PACES', 'مذاكرة', 'الأيرلندي', 'بعد النجاح'],
      faqs: [
        ['عام', 'ما هو MRCP UK؟', 'عضوية الكليات الملكية للأطباء ببريطانيا من ثلاثة أجزاء: Part 1 وPart 2 نظريان، وPACES إكلينيكي.'],
        ['شروط', 'ما شروط التقدم؟', 'التقدم بعد سنة من التخرج (بعد الامتياز) مع ترجمة الشهادة وختم الكلية بالإنجليزية. ولـ PACES خبرة باطنة سنتان منها ستة أشهر طوارئ على الأقل.'],
        ['Part 1', 'كيف يكون Part 1؟', '200 سؤال في يوم واحد على ورقتين من 100 سؤال، ثلاث ساعات لكل ورقة وبينهما استراحة ساعتان، والأسئلة مباشرة تطلب معلومة، وتشمل علوماً أساسية وإحصاء.'],
        ['Part 1', 'ما درجة النجاح؟', '540 من 200-800، وتعادل عدداً متغيراً من الأسئلة يتراوح غالباً بين 120 و130 حسب صعوبة الامتحان. والنجاح على الدرجة الكلية فلا يلزم النجاح في كل فرع.'],
        ['Part 1', 'كيف تتوزع الأسئلة؟', 'نحو 16 فرعاً. الأكثر للعلوم الأساسية والفارماكولوجي والقلب والأعصاب والصدر، وتتقارب أسئلة الدم والغدد والكلى والروماتيزم والهضمي، وتقل في العيون والمسنين والتلطيفي. انظر الرسم في «أجزاء المعادلة».'],
        ['Part 2', 'ما الفرق في Part 2؟', '200 سؤال على ورقتين أيضاً، النجاح من 454، بلا علوم أساسية وإحصاء. حالات طويلة متقدمة تقيس تحديد المشكلات والأولويات والفحوصات والعلاج بحسب NICE، مع ECG وCT وMRI وECHO وأشعة.'],
        ['مواعيد', 'متى أحجز؟', 'قبل الامتحان بنحو ثلاثة أشهر، أما PACES فتحجز وتنتظر دورك. ولا تحجز إلا بعد أن تنهي PassMedicine وتتجاوز 70% في Pastest وتنجح في Past Papers.'],
        ['المحاولات', 'ماذا لو رسبت؟', 'لك 6 محاولات لكل جزء بشرط إنهاء الدبلوم خلال 7 سنوات من أول امتحان، والرسوب لا يؤثر في السيرة الذاتية.'],
        ['مصاريف', 'كم التكلفة الإجمالية؟', '£2,750 تقريباً للأجزاء الثلاثة، أي نحو 204 آلاف جنيه بسعر اليوم. استخدم أداة حساب التكلفة.'],
        ['PACES', 'كيف يكون PACES؟', 'تنفس وبطن، وتاريخ مرضي (20 دقيقة)، وقلب وأعصاب، وتواصل وأخلاقيات (20)، واستشارتان قصيرتان. يُقيّم 7 مهارات والنجاح بنحو 130 من 172 مع 60% في كل مهارة و87.5% في سلامة المريض.'],
        ['PACES', 'هل PACES متاح في مصر؟', 'المقاعد محدودة (نحو 90 سنوياً) في القصر العيني والمعادي العسكري وقد تنتظر نحو سنة. وPACES داخل بريطانيا صار لمن تدرب فيها فقط، ولذلك يفضّل كثيرون MRCP الأيرلندي.'],
        ['مذاكرة', 'ما مدة المذاكرة؟', 'Part 1 من 4 إلى 6 أشهر بتفرغ (والأفضل 8-10 أشهر دون تفرغ)، وPart 2 نحو ثلاثة أشهر لمن أتقن Part 1.'],
        ['مذاكرة', 'ما الخطة الزمنية؟', '3 أشهر PassMedicine، و3 أشهر Pastest، و3 أشهر مراجعة (إعادة Pastest وOnExamination وPast Papers). بمعدل 50 سؤالاً يومياً ثم 100-150 في آخر ثلاثة أشهر، والهدف 200 سؤال يومياً.'],
        ['مذاكرة', 'ما المصادر؟', 'Notes & Notes (الإصدار الثالث 2022 وهو الأشمل)، وStep Up to MRCP (قديم)، وKalra، وThe Only MRCP Notes، وملفات Rapid Pass. ولا يكفي PassMedicine وحده.'],
        ['مذاكرة', 'ما بنوك الأسئلة؟', 'PassMedicine (£35 لأربعة أشهر و£45 لستة)، وPastest (£85 لثلاثة أشهر)، وOnExamination للمحاكاة (£58 لـ Part 1 و£89 لـ Part 2)، مع 200 سؤال عينة في الموقع الرسمي.'],
        ['مذاكرة', 'هل أحتاج كورساً؟', 'ليس شرطاً، فالامتحان يأتي من بنوك الأسئلة. ويفيد الكورس من يحتاج التزاماً، ولا غنى عن كورس عملي لـ PACES.'],
        ['مذاكرة', 'كيف أتدرب على الحالات؟', 'اقرأ السؤال الأخير والاختيارات قبل الحالة لتوفر الوقت، واشترك أونلاين، وركز على الفروع الكبيرة، واعلم أن درجتك في الأساسيات لن تكون عالية.'],
        ['الأيرلندي', 'ما الفرق بين UK والأيرلندي؟', 'الأيرلندي يطلب ستة أشهر بعد التخرج لا 12، وPart 1 ورقة واحدة من 100 سؤال، والامتحانان أونلاين من المنزل، وأسئلته متساوية الدرجات، وPACES في السعودية والإمارات وعُمان وقطر دون انتظار، والمهلة 3 سنوات لا 7. ويقبله GMC.'],
        ['بعد النجاح', 'ماذا بعد MRCP؟', 'اختبار لغة (OET أو IELTS) ثم تسجيل GMC والعمل ثم FRCP. ويمكن التقدم لمسار MTI بعد Part 1، وهو الطريق الوحيد للتسجيل في GMC بدون PACES.'],
        ['بعد النجاح', 'ما حال الخليج؟', 'السعودية تعاملها كمعادلة للماجستير فتبدأ نائباً وبعد سنتين أخصائياً، وباقي الخليج يقبلها بعد 2-3 سنوات خبرة.'],
        ['عام', 'هل أتوسع في Davidson وHarrison؟', 'لا، فالامتحان بمصادر معروفة ومبني على إرشادات NICE البريطانية، والتوسع يضيع الوقت.'],
        ['عام', 'ما الفرق بين PLAB وMRCP؟', 'PLAB رخصة طبيب عام ثم سنتا Foundation وCore Training قبل التخصص، أما MRCP فأعمق وتتخطى به Foundation وCore بشرط سنتين خبرة موثقة في بلدك.'],
        ['عام', 'هل MRCP هو الأفضل لمن يريد السفر؟', 'إذا حسمت تخصصاً باطنياً مبكراً فهو مناسب جداً، وإلا فالمقارنة بالتخصص: MRCS للجراحة وPLAB/UKMLA للطب العام وUSMLE لأمريكا.'],
      ],
      calc: {
        cur: 'gbp', label: 'سعر الإسترليني (جنيه)',
        items: [
          [696, 'gbp', 1, 'MRCP Part 1', 'الامتحان النظري الأول (200 سؤال Best of Five)', '£696'],
          [696, 'gbp', 0, 'MRCP Part 2 Written', 'الامتحان النظري الثاني (اختياري في خطتك الحالية)', '£696'],
          [1358, 'gbp', 0, 'PACES (دولي)', 'الامتحان الإكلينيكي العملي على المرضى', '£1,358'],
          [45, 'gbp', 0, 'PassMedicine (6 أشهر)', 'بنك أسئلة أساسي وهو الأرخص', '£45'],
          [85, 'gbp', 0, 'Pastest (3 أشهر)', 'بنك أسئلة يوفر Past Papers', '£85'],
          [58, 'gbp', 0, 'OnExamination Part 1', 'اختبارات محاكاة بتوقيت للجزء الأول', '£58'],
        ],
      },
    },
    en: {
      t: 'Mrcp Updates', s: 'Membership of the Royal Colleges of Physicians', p: 'Medicine', an: ['', ''],
      diets: [
        { n: 'MRCP Part 2 Written 2026/3', close: '2026-09-22T23:59:00Z', open: '2026-09-15T08:00:00Z', exam: '2026-11-25', opt: 1 },
        { n: 'MRCP Part 1: 2027/1', close: '2026-11-03T08:00:00Z', open: '2026-10-27T08:00:00Z', exam: '2027-01-20', opt: 0 },
        { n: 'MRCP Part 2 Written 2027/1', close: '2026-12-15T08:00:00Z', open: '2026-12-08T08:00:00Z', exam: '2027-02-24', opt: 1 },
        { n: 'MRCP Part 1: 2027/2', close: '2027-03-16T08:00:00Z', open: '2027-03-09T08:00:00Z', exam: '2027-05-26', opt: 0 },
        { n: 'MRCP Part 1: 2027/3', close: '2027-07-20T07:00:00Z', open: '2027-07-13T07:00:00Z', exam: '2027-09-29', opt: 0 },
      ],
      ov: 'The diploma of the UK Royal Colleges of Physicians, required for internal medicine and related physician training in the UK.',
      st: [
        'Part 1: 200 best-of-five questions in one day, two papers of 100 questions (3 h each) with a 2-hour break. Scored 200-800; pass mark 540.',
        'Part 2 Written: 200 questions in two papers; advanced case-based questions with no basic science or statistics; pass mark 454.',
        'PACES: practical exam with 5 clinical stations.',
      ],
      at: ['Up to 6 attempts per part.', '12 months of postgraduate experience; pass Part 1 before Part 2 and PACES.', 'Written exams are in test centres since 2026.'],
      atSum: 'International: £696 per written part, £1,358 for PACES (from 2026/03). UK: £520 and £742.',
    },
  },
  usmle: {
    ic: 'US', link: 'https://www.usmle.org/apply-exams',
    ar: {
      t: 'Usmle Updates', s: 'اختبار الترخيص الطبي الأمريكي', p: 'أمريكا', diets: [],
      an: ['التسجيل مفتوح طوال العام', 'لا توجد مواعيد ثابتة: احجز موعداً في مركز Prometric (برومترك: شركة تدير مراكز اختبار حاسوبية معتمدة يؤدي فيها الطبيب الامتحان على الكمبيوتر) خلال فترة أهليتك، وقدّم قبله بـ 6-8 أسابيع.'],
      ov: 'سلسلة اختبارات الترخيص الطبي الأمريكي وبوابة الأطباء الدوليين للإقامة، ويتم التسجيل عبر ECFMG.',
      st: ['Step 1: العلوم الأساسية، ناجح/راسب. ذاكره بعقلية السكور العالي.', 'Step 2 CK: المعرفة الإكلينيكية، نحو 9 ساعات، ولها درجة وهي الأهم في الملف.', 'Step 3: داخل أمريكا فقط، وهو حجة قوية للخريج القديم.'],
      at: ['4 محاولات لكل Step وتشمل غير المكتملة.', 'Step 1 وStep 2 CK بأي ترتيب وكلاهما شرط لشهادة ECFMG.', 'منذ 12 يناير 2026 يسجل الأطباء الدوليون ويدفعون عبر بوابة FSMB الموحدة.'],
      atSum: 'Step 1 وStep 2 CK نحو $1,195 لكل منهما وStep 3 نحو $1,000، فالمجموع $3,390 × 55.38 = حوالي 188 ألف جنيه مصري قبل OET والخبرة الأمريكية والماتش والفيزا.',
      faqPh: 'ابحث في 51 سؤالاً...',
      faqCats: ['القرار', 'الجدول', 'الامتحانات', 'الدرجات', 'الخبرة', 'البحث', 'التوصيات', 'ERAS', 'البرامج', 'المقابلات', 'الماتش', 'الفيزا', 'المال'],
      faqs: [
        ['القرار', 'هل أسافر أم أبقى في مصر؟', 'قرار يحدده هدفك لا العاطفة: قس تحملك للمخاطرة، وابدأ ولا تطل الحساب، واجعل الهدف يحدد المسار لا العكس.'],
        ['القرار', 'هل تقديري الجامعي يحدد مصيري؟', 'لا، فالماتش يُقيَّم كباكدج، وضعف محور (كالتقدير) يُعوَّض بقوة غيره كالسكور والبحث.'],
        ['القرار', 'هل الجيش والتكليف فجوات؟', 'ليست فجوات إذا رتبتها في قصة متسقة، بل صار بعضها ميزة في السيرة.'],
        ['القرار', 'ما أخطر فخ في التخطيط؟', 'التأجيل. ابدأ مبكراً، واختر مساراً واحداً لعدة سنوات لا خيارين متنافسين، وخطط على مستوى السنة والأسبوع.'],
        ['الجدول', 'متى أبدأ؟', 'كلما كان أبكر كان أفضل، فنافذة الامتياز مناسبة، وبعد التخرج بسنوات تصبح Old Grad ويزيد وزن Step 3 والخبرة الأمريكية.'],
        ['الجدول', 'كم تستغرق المذاكرة؟', 'مرحلة التأسيس من 8 أشهر إلى سنة ونصف بحسب ظروفك، ثم معسكر مغلق 3-4 أشهر قبل الامتحان. المهم الاستمرارية لا السرعة.'],
        ['الامتحانات', 'كيف أغيّر عقلية المذاكرة؟', 'اترك قراءة كل شيء بالتفصيل والحفظ المقالي؛ الامتحان كله Clinical Vignettes. ركّز على الحل وUWorld وSelf-assessment لتعرف أين فجواتك.'],
        ['الامتحانات', 'هل أستهين بـ Step 1 بعد صيرورته ناجح/راسب؟', 'لا؛ الرسوب أو محاولة إضافية يضر ضرراً بالغاً، فذاكر لسكور عالٍ. التحضير الشائع من 4 إلى 6 أشهر مكثفة.'],
        ['الامتحانات', 'ما أهم امتحان في الملف؟', 'Step 2 CK باتفاق الضيوف. لا تستعجله، وقيّم نفسك بـ NBME فهي الأدق، فسكورك سيلازمك دائماً.'],
        ['الامتحانات', 'هل يلزم Step 3 قبل الماتش؟', 'ليس إلزامياً لكنه الحجة الأقوى للخريج القديم: يطمئن البرنامج أنك ستجتاز البورد، ويوفر عليك إجازة الامتحان، ويتيح مسار H-1B. وأفضل توقيته بعد Step 2 بشهر أو شهرين.'],
        ['الامتحانات', 'أين أؤدي Step 3؟', 'لا يُؤدى خارج أمريكا، فاجمعه مع Elective أو Observership هناك.'],
        ['الامتحانات', 'ما الذي يسبق Step 3 لخريج أجنبي؟', 'اختبار OET (نتيجته بعد 2-3 أسابيع) ثم طلب شهادة ECFMG (قد تتأخر من أسبوع إلى شهر ونصف)، وهي شرط التقديم.'],
        ['الامتحانات', 'هل أذاكر USMLE مع ماجستير أو MRCP؟', 'لا؛ الامتحان يتطلب تفرغاً واستمرارية، والجمع بين امتحانين كان سبباً مباشراً لسكور ضعيف لدى أحد الضيوف.'],
        ['الامتحانات', 'هل أدفع رسوم الامتحان لأجبر نفسي على المذاكرة؟', 'لا، فمن فعل ذلك دخل مضطراً وحصل على سكور ضعيف. احجز حين تجهز بحسب NBME.'],
        ['الدرجات', 'ما السكور المطلوب؟', 'لا رقم موحد. أمثلة الضيوف في CK: باطنة 263، جراحة مخ 256، طب نفسي 231. والتخصص والبرنامج يغيّران المطلوب.'],
        ['الدرجات', 'هل يغلق ضعف Step 1 الباب؟', 'لا؛ وصل ضيف إلى Mayo Clinic بسكور Step 1 ضعيف لأن بقية الملف وقصته كانت قوية.'],
        ['الخبرة', 'ما أنواع الخبرة الأمريكية؟', 'Elective/Sub-I (الأعلى قيمة وفيها لمس المريض)، وExternship بعد التخرج، وObservership (مراقبة فقط وهي الأشهر)، وPre-residency fellowship (وظيفة مدفوعة صعبة الشروط).'],
        ['الخبرة', 'لماذا هي مهمة؟', 'مدير البرنامج لا يعرف كليتك، فخطاب من طبيب إكلينيكي أمريكي يقيّم لك ما لا يقيّمه كشف الدرجات.'],
        ['الخبرة', 'ما مشكلة VSLO؟', 'عدد الجامعات المصرية المشاركة قليل (القصر العيني وعين شمس وطنطا وجامعة حديثة)، وطبيب الامتياز يُعامَل موظفاً لا طالباً فيُرفض طلبه.'],
        ['البحث', 'هل البحث ضروري؟', 'يعتمد على التخصص والبرنامج: غير مهم لباطنة المجتمعات، وغير قابل للتفاوض في تخصصات شديدة التنافس (جراحة المخ نحو 20+ منشوراً، الأورام الإشعاعية، الجلدية) وبرامج الجامعات.'],
        ['البحث', 'الكم أم الكيف؟', 'الكيف؛ 10 أبحاث جيدة مع سكورات جيدة تتفوق على 30 ضعيفة، والسكورات تسبق البحث في الأولوية.'],
        ['التوصيات', 'كم خطاب أحتاج؟', 'نحو أربعة، وهي تُقرأ فعلاً. واحد عربي بالكثير والباقي أمريكيون، من أماكن معروفة، ومن تخصصك، ومن كل مكان عملت فيه.'],
        ['التوصيات', 'ما علامات الخطر؟', 'خطاب عام موحد الصيغة، وكل الخطابات من عرب، وأربع Electives بخطاب واحد، والخطاب المدفوع.'],
        ['ERAS', 'أيهما أهم: CV أم Personal Statement؟', 'الـ CV. الخطاب 10% سيئ قد يستبعدك، و80% عادي لا يؤثر، و10% متميز يرفعك، فلا تضيّع وقتك فيه على حساب الـ CV.'],
        ['ERAS', 'كيف أبني قصة الملف؟', 'اجعل الخبرات تحكي قصة واحدة محددة؛ مثال: بلا قصة 0 مقابلة من 120 برنامجاً، وبقصة واضحة 14 مقابلة من 40 برنامجاً.'],
        ['ERAS', 'ماذا أكتب في Personal Statement؟', 'قصتك الإنسانية بأسلوب أمريكي لا التشخيص والعلاج، ولا يلزم أن تكون طبية، ويرفع التخصيص لكل برنامج فرصك.'],
        ['ERAS', 'هل أستعين بالذكاء الاصطناعي؟', 'تجنّب نصاً مولّداً بالكامل؛ فالقراء يفرقون بينه وبين صوتك الحقيقي.'],
        ['البرامج', 'كم برنامجاً أقدم؟', 'لا قاعدة: 120 بلا تخصيص أعطت صفراً، و40 مخصصة أعطت 14 مقابلة، و156 أعطت 7 مقابلات. قيّم ما تملك أولاً ثم رشّح.'],
        ['البرامج', 'ما Signals؟', 'إشارات رسمية بعدد محدود تخبر البرنامج باهتمامك، وهي حاسمة في تخصصات مثل Pathology (4 من 5 إشارات أثمرت مقابلة).'],
        ['البرامج', 'هل أقدم على كل البرامج؟', 'لا؛ ارفض البرامج التي لا ترعى فيزا، وخطط للخطوتين معاً: متوقع ألا أُطابق هذه السنة، واستعد نفسياً لأن غالباً ستُطابق.'],
        ['المقابلات', 'كيف أستعد؟', 'اعتبرها امتحاناً: الأسئلة المتكررة لا تتجاوز عشرة فاحفظ سياقها، وسجّل نفسك (أحد الضيوف سجل أكثر من 150 فيديو).'],
        ['المقابلات', 'كم تستغرق؟', 'تختلف بالتخصص: باطنة نحو ساعة، وأورام إشعاعية 6-7 ساعات، وباثولوجي حتى 9 مقابلات.'],
        ['المقابلات', 'ما أخطر خطأ؟', 'قول ما لا يناسب سياسياً أو أخلاقياً حتى لو صحيحاً، كالإجابة بأنك جئت لأجل المال، أو رواية قصة تسيء إليك على عشاء مع المقيمين.'],
        ['الماتش', 'كيف أرتب البرامج؟', 'بحسب جودة التدريب وتدرج المسؤولية، ومخرجات الخريجين، والأجواء والناس، والمدينة، وتفاصيل التأمين والرواتب وجدول المناوبات.'],
        ['الماتش', 'هل المقابلة تحدد ترتيبي في الباطنة؟', 'عملياً هي نجاح/رسوب، والترتيب يحدده الملف والعلاقات.'],
        ['الماتش', 'ما Prematch؟', 'عرض مباشر من برنامج قبل يوم الماتش تخرج به من المنظومة.'],
        ['الماتش', 'ماذا لو لم أُطابَق؟', 'SOAP: تقدم على نحو 45 برنامجاً شاغراً خلال يومين، ومن قبل العرض فقد تطابق. وأول خطوة تشريح أخطائك بصدق دون إلقاء اللوم على النظام.'],
        ['الماتش', 'هل أعود إلى مصر بعد عدم المطابقة؟', 'ينصح الدليل بعدم الرجوع إن كان لك عمل أو بحث هناك، فالرجوع يعني الخروج من اللعبة.'],
        ['الماتش', 'هل من مسار دون نيابة أمريكية؟', 'ثلاث زمالات تقبل تدريبك المصري مباشرة: الأمراض المعدية والمسنين والكلى. القيد: البورد الدقيق يتطلب بورد الباطنة أولاً.'],
        ['الفيزا', 'ما أنواع الفيزا؟', 'J-1 (للنيابة والزمالة وتلزم Waiver)، وH-1B (للنيابة وتتطلب Step 3 ولا waiver)، وB1/B2 للزيارة والمقابلات وStep 3، وF-1 للدراسة.'],
        ['الفيزا', 'J-1 أم H-1B؟', 'J-1 لمن يريد زمالة بعد النيابة، وH-1B لمن يريد جرين كارد أسرع وحرية السفر خلال التدريب.'],
        ['الفيزا', 'كيف أتخلص من شرط J-1؟', 'بالعودة إلى بلدك سنتين إلى ثلاث، أو ببرنامج Waiver بالعمل ثلاث سنوات في منطقة محرومة، ثم التقدم على الجرين كارد.'],
        ['الفيزا', 'ما وضع الزوجة؟', 'J-1 تمنحها J-2 مع تصريح عمل كامل، وH-1B تمنحها H-4 بلا تصريح عمل إلا بعد اعتماد I-140.'],
        ['المال', 'كم أحتاج بالدولار؟', 'Step 1 وStep 2 نحو $1,195 لكل منهما، وStep 3 نحو $1,000، والـ Elective من $800، وموسم الماتش $4,000-6,000، ومحامي الجرين كارد $4,000-7,000. جرّب أداة حساب التكلفة.'],
        ['المال', 'هل المال عائق حقيقي؟', 'ليس لمن حسم قراره؛ المعتاد تأخير الرحلة سنة أو سنتين وليس إلغاؤها.'],
        ['المال', 'كيف أموّل الرحلة؟', 'بالعمل في مصر قبل السفر، أو الخليج كمحطة، واختيار مدينة رخيصة للبحث، ومنح ABCDE نحو $3,000 لموسم الماتش، وبطاقات ائتمان بلا فوائد لسداد دفعات الموسم.'],
        ['المال', 'هل يُطلب كشف حساب بنكي؟', 'قد تطلبه Mayo والسفارة بنحو $29-30 ألفاً لمن يأتي لوظيفة غير مدفوعة، ولم يُطلب من آخرين، ورفض الكشف قد يعني رفض المقابلة.'],
        ['المال', 'كم راتب النيابة؟', '$50-70 ألفاً سنوياً قبل الضرائب، وصافي شهري $3,000-4,000، وإيجار $1,500-2,000؛ يكفي ولا يدخر. ويرتفع بعد النيابة إلى $200-300 ألف سنوياً كـ Attending بحسب أحد الضيوف.'],
        ['الماتش', 'ما أهم المصطلحات؟', 'ERAS نظام التقديم الموحد، وNRMP هيئة الماتش، وMSPE خطاب العميد، وSignal إشارة اهتمام، وSOAP عرض الأماكن الشاغرة، وPrelim سنة تمهيدية، وCategorical برنامج كامل، وOld grad خريج تجاوز سنوات معينة.'],
        ['المال', 'هل أترك النيابة المصرية من أجل Steps؟', 'الدليل يضع الأولوية عند التعارض للامتحانات ويعرض إطاراً للحسم، ولا إجابة واحدة تناسب الجميع.'],
        ['الامتحانات', 'ما هو Prometric؟', 'Prometric (برومترك) شركة تدير مراكز اختبار حاسوبية معتمدة حول العالم، وفيها تؤدي Step 1 وStep 2 CK على الكمبيوتر بعد حجز موعدك عبر حسابك، ويلزم إثبات هوية مطابق للاسم المسجل.'],
      ],
      calc: {
        cur: 'usd', label: 'سعر الدولار (جنيه)',
        items: [
          [1195, 'usd', 1, 'Step 1', 'امتحان العلوم الأساسية (ناجح/راسب)', '$1,195'],
          [1195, 'usd', 1, 'Step 2 CK', 'امتحان المعرفة الإكلينيكية وله درجة', '$1,195'],
          [1000, 'usd', 1, 'Step 3', 'الامتحان الأخير ويُؤدى داخل أمريكا', '$1,000'],
          [500, 'usd', 1, 'OET وشهادة ECFMG (تقدير)', 'اختبار اللغة الطبية وطلب شهادة ECFMG', '$500'],
          [800, 'usd', 0, 'Elective (VSLO) بداية من', 'فترة تدريب إكلينيكي للطالب في مستشفى أمريكي', '$800'],
          [5000, 'usd', 0, 'موسم الماتش (متوسط 4-6 آلاف)', 'رسوم ERAS والبرامج والمقابلات والسفر', '$5,000'],
          [5500, 'usd', 0, 'محامي الجرين كارد (متوسط)', 'أتعاب محامي هجرة لتقديم الجرين كارد', '$5,500'],
        ],
      },
    },
    en: {
      t: 'Usmle Updates', s: 'United States Medical Licensing Examination', p: 'USA', diets: [],
      an: ['Rolling registration all year', 'No fixed dates: book a Prometric slot within your eligibility period, and apply 6 to 8 weeks ahead.'],
      ov: 'The US medical licensing exam series and the gateway to residency for international graduates, who register through ECFMG.',
      st: ['Step 1: basic sciences, pass/fail.', 'Step 2 CK: clinical knowledge, about 9 h (roughly 318 Q), scored.', 'Step 3: can only be taken in the US.'],
      at: ['4 attempts per Step, including incomplete ones, with waiting periods between.', 'Step 1 and Step 2 CK in any order; both are needed for ECFMG certification.'],
      atSum: 'Step 1: $975 + $180 outside the US. Step 2 CK: about $1,020. ECFMG application: $160.',
    },
  },
};

function fmtDate(d: string, loc: string) {
  try { return new Date(d).toLocaleDateString(loc, { day: 'numeric', month: 'long', year: 'numeric' }); }
  catch { return d; }
}

function getTlParts(ms: number) {
  const s = Math.floor(ms / 1e3);
  return [Math.floor(s / 86400), ('0' + Math.floor((s % 86400) / 3600)).slice(-2), ('0' + Math.floor((s % 3600) / 60)).slice(-2), ('0' + (s % 60)).slice(-2)];
}

function resolveExamKey(panelId?: string, storePanel?: string): ExamKey | null {
  const r = String(panelId || '').toLowerCase();
  if (r === 'undergraduate' || r.includes('undergrad')) return null;
  if (r.includes('mrcp') || r.includes('mrcb')) return 'mrcp';
  if (r.includes('usmle')) return 'usmle';
  if (r.includes('mrcs')) {
    const fb = String(storePanel || '').toLowerCase();
    return fb.includes('mrcp') || fb.includes('mrcb') ? 'mrcp' : fb.includes('usmle') ? 'usmle' : 'mrcs';
  }
  return null;
}

export function ExamGuidePanel({ exam, panelId }: { exam: ExamKey; panelId?: string }) {
  const locale = useLanguageStore((s) => s.locale);
  const lang: LangKey = locale === 'ar' ? 'ar' : 'en';
  const base = DATA[exam];
  const cfg = base[lang];
  const L = L_MAP[lang];
  const domId = `cbx-${exam}-${lang}`;
  const storePanelId = (panelId || (exam === 'mrcp' ? 'mrcb' : exam)) as any;
  const setStoreExamDate = useProgressStore(storePanelId, (s) => s.setExamDate);

  const [now, setNow] = useState(() => Date.now());
  const [expanded, setExpanded] = useState(false);
  const [tab, setTab] = useState(0);
  const [opt2, setOpt2] = useState(false);
  const [customDate, setCustomDate] = useState('');
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('');
  const [checked, setChecked] = useState<Record<number, boolean>>(() => {
    const init: Record<number, boolean> = {};
    base.ar.calc?.items.forEach((it: any, i: number) => { init[i] = Boolean(it[2]); });
    return init;
  });
  const [usd, setUsd] = useState(55.38);
  const [gbp, setGbp] = useState(74.09);
  const [dirty, setDirty] = useState(false);
  const [fxDate, setFxDate] = useState<string | null>(null);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    try { setCustomDate(localStorage.getItem(domId) || localStorage.getItem(`cbx-${exam}-ar`) || localStorage.getItem(`cbx-${exam}-en`) || ''); }
    catch { setCustomDate(''); }
  }, [domId, exam]);

  useEffect(() => {
    setExpanded(false); setTab(0); setCat(''); setQ(''); setOpt2(false);
    const init: Record<number, boolean> = {};
    base.ar.calc?.items.forEach((it: any, i: number) => { init[i] = Boolean(it[2]); });
    setChecked(init);
  }, [exam, base]);

  useEffect(() => {
    if (!cfg.calc) return;
    const td = new Date().toISOString().slice(0, 10);
    try {
      const c = JSON.parse(localStorage.getItem('cbx-fx') || 'null');
      if (c && c.d === td && c.u > 0 && c.g > 0) {
        if (!dirty) { setUsd(+c.u.toFixed(2)); setGbp(+c.g.toFixed(2)); setFxDate(td); }
        return;
      }
    } catch {}
    fetch('https://open.er-api.com/v6/latest/USD')
      .then((x) => x.json())
      .then((j) => {
        const e = j?.rates?.EGP, g = e && j?.rates?.GBP ? e / j.rates.GBP : 0;
        if (!(e > 0 && g > 0)) return;
        try { localStorage.setItem('cbx-fx', JSON.stringify({ d: td, u: e, g })); } catch {}
        if (!dirty) { setUsd(+e.toFixed(2)); setGbp(+g.toFixed(2)); setFxDate(td); }
      })
      .catch(() => {});
  }, [cfg.calc, dirty]);

  const al = useMemo(() => cfg.diets.filter((x: any) => !x.opt || opt2), [cfg.diets, opt2]);
  const nx = useMemo(() => al.find((x: any) => new Date(x.close).getTime() > now), [al, now]);

  useEffect(() => {
    const nextExam = al.find((x: any) => new Date(x.exam).getTime() >= now);
    const targetDate = customDate || nextExam?.exam || '';
    if (targetDate && setStoreExamDate) setStoreExamDate(targetDate);
  }, [customDate, al, now, setStoreExamDate]);

  const renderTl = (ms: number) => (
    <div className="cbx-t">
      {getTlParts(ms).map((v, i) => <div key={i}><b>{v}</b><span>{L.u[i]}</span></div>)}
    </div>
  );

  const safeTab = tab < L.tabs.length ? tab : 0;
  const totalEgp = useMemo(() => {
    if (!cfg.calc) return '0';
    const rt: any = { usd: +usd || 0, gbp: +gbp || 0 };
    const s = cfg.calc.items.reduce((acc: number, it: any, i: number) => acc + (checked[i] ? it[0] * rt[it[1]] : 0), 0);
    return Math.round(s).toLocaleString('en-US');
  }, [cfg.calc, checked, usd, gbp]);

  const customMs = customDate ? new Date(customDate + 'T00:00:00').getTime() - now : null;

  return (
    <div className="cbx" id={domId} dir={lang === 'ar' ? 'rtl' : 'ltr'} lang={lang}>
      <style>{CBX_CSS}</style>
      <div className="cbx-h">
        <div className="cbx-ic">
          <img src="/caduceus.png" alt={cfg.t} draggable={false} />
          <span className="cbx-ic-dot" />
        </div>
        <div><h2 className="cbx-title">{cfg.t}</h2><div className="cbx-s">{cfg.s}</div></div>
        <span className="cbx-p">{cfg.p}</span>
      </div>

      <div className={`cbx-an ${expanded ? '' : 'compact'}`}>
        {nx ? (
          <>
            <h3>{(nx.open && new Date(nx.open).getTime() > now ? L.soon : L.open) + ' — ' + nx.n}</h3>
            <p>{(nx.open && new Date(nx.open).getTime() > now ? `${L.opens} ${fmtDate(nx.open, L.loc)} · ` : '') + `${L.closes} ${fmtDate(nx.close, L.loc)}`}</p>
          </>
        ) : (
          <><h3>{cfg.an[0]}</h3><p>{cfg.an[1]}</p></>
        )}
        <div className="cbx-act">
          <a className="cbx-go" href={base.link} target="_blank" rel="noopener noreferrer">{L.apply} ↗</a>
          <button type="button" className={`cbx-more ${expanded ? 'on' : ''}`} onClick={() => setExpanded((p) => !p)}>
            {lang === 'ar' ? (expanded ? 'إخفاء التفاصيل ▴' : 'عرض التفاصيل والعدّاد ▾') : (expanded ? 'Hide details ▴' : 'Details & countdown ▾')}
          </button>
        </div>
      </div>

      {expanded && (
        <>
          <h4>{L.cd}</h4>
          {base.opt && (
            <label className="cbx-opl">
              <input type="checkbox" className="cbx-op" checked={opt2} onChange={(e) => setOpt2(e.target.checked)} /> {L.opt}
            </label>
          )}
          <div className="cbx-g cbx-cd">
            {al.map((x: any, idx: number) => {
              const e = new Date(x.exam).getTime() - now;
              if (e < 0) return null;
              const o = x.open ? new Date(x.open).getTime() - now : -1;
              const c = new Date(x.close).getTime() - now;
              return (
                <div className="cbx-c" key={idx}>
                  <strong>{x.n}</strong>
                  {o > 0 ? <><small>{L.opens} {fmtDate(x.open, L.loc)}</small>{renderTl(o)}</> : c > 0 ? <><small>{L.closes} {fmtDate(x.close, L.loc)}</small>{renderTl(c)}</> : <small>{L.closed}</small>}
                  <small>{L.exam}: {fmtDate(x.exam, L.loc)} · {Math.ceil(e / 864e5)} {L.days}</small>
                </div>
              );
            })}
            <div className="cbx-c">
              <strong>{L.pick}</strong>
              <input
                type="date"
                className="cbx-in"
                value={customDate}
                onChange={(e) => {
                  const v = e.target.value;
                  setCustomDate(v);
                  try { localStorage.setItem(domId, v); localStorage.setItem(`cbx-${exam}-ar`, v); localStorage.setItem(`cbx-${exam}-en`, v); } catch {}
                }}
              />
              {customDate && customMs !== null && (customMs > 0 ? renderTl(customMs) : <small>{L.passed}</small>)}
            </div>
          </div>

          <div className="cbx-tb" style={{ marginTop: 20 }}>
            {L.tabs.map((lbl, k) => (
              <button key={k} type="button" className={safeTab === k ? 'on' : ''} onClick={() => setTab(k)}>{lbl}</button>
            ))}
          </div>

          <div className={`cbx-pn ${safeTab === 0 ? 'on' : ''}`}><p>{cfg.ov}</p></div>

          <div className={`cbx-pn ${safeTab === 1 ? 'on' : ''}`}>
            <ul>{cfg.st.map((s: string, i: number) => <li key={i}>{s}</li>)}</ul>
            {cfg.bars?.map(([gTitle, rows]: any, gi: number) => (
              <div key={gi}>
                <h5>{gTitle}</h5>
                {rows.map(([bLbl, bW, bCnt]: any, bi: number) => (
                  <div className="cbx-br" key={bi}><span>{bLbl}</span><div className="cbx-bw"><i style={{ width: bW }} /></div><b>{bCnt}</b></div>
                ))}
              </div>
            ))}
          </div>

          <div className={`cbx-pn ${safeTab === 2 ? 'on' : ''}`}>
            <ul>{cfg.at.map((s: string, i: number) => <li key={i}>{s}</li>)}</ul>
            <p style={{ marginTop: 8 }}><b>{cfg.atSum}</b></p>
          </div>

          {cfg.faqs && (
            <div className={`cbx-pn ${safeTab === 3 ? 'on' : ''}`}>
              <input className="cbx-q" type="search" placeholder={cfg.faqPh} value={q} onChange={(e) => setQ(e.target.value)} />
              <div className="cbx-ch">
                <button type="button" className={!cat ? 'on' : ''} onClick={() => setCat('')}>الكل</button>
                {cfg.faqCats.map((c: string) => (
                  <button key={c} type="button" className={cat === c ? 'on' : ''} onClick={() => setCat(c)}>{c}</button>
                ))}
              </div>
              <div className="cbx-qa">
                {cfg.faqs.map(([c, fq, fa]: [string, string, string], i: number) => {
                  const v = q.trim().toLowerCase();
                  if ((cat && c !== cat) || (v && !fq.toLowerCase().includes(v) && !fa.toLowerCase().includes(v))) return null;
                  return <details key={i}><summary>{fq}</summary><p>{fa}</p></details>;
                })}
              </div>
            </div>
          )}

          {cfg.calc && (
            <div className={`cbx-pn ${safeTab === 4 ? 'on' : ''}`}>
              <div className="cbx-cl">
                {cfg.calc.items.map(([v, u, , title, desc, price]: any, i: number) => (
                  <label key={i}>
                    <input type="checkbox" checked={Boolean(checked[i])} onChange={(e) => setChecked((p) => ({ ...p, [i]: e.target.checked }))} />
                    <div><b>{title}</b><small>{desc}</small></div>
                    <span>{price}</span>
                  </label>
                ))}
              </div>
              <div className="cbx-rt">
                {cfg.calc.cur === 'usd' ? (
                  <label>{cfg.calc.label}<br /><input className="cbx-ru" type="number" step="0.01" value={usd} onChange={(e) => { setDirty(true); setUsd(+e.target.value || 0); }} /></label>
                ) : (
                  <label>{cfg.calc.label}<br /><input className="cbx-rg" type="number" step="0.01" value={gbp} onChange={(e) => { setDirty(true); setGbp(+e.target.value || 0); }} /></label>
                )}
              </div>
              <div className="cbx-sum">الإجمالي: <span className="cbx-tot">{totalEgp}</span> جنيه مصري</div>
              <p className="cbx-f">
                سعر الصرف يتجدد يومياً تلقائياً عند فتح الصفحة (<span className="cbx-fx">{fxDate && !dirty ? `${L.fxlive} ${fxDate}` : 'آخر سعر بنكي معروف 25 أكتوبر 2026: إسترليني 74.09 ودولار 55.38'}</span>)، ويمكنك تعديله يدوياً. الرسوم تقديرية وبدون كورسات وكتب وسفر.
              </p>
            </div>
          )}

          <p className="cbx-f">{L.foot}</p>
        </>
      )}
    </div>
  );
}

function EngagementTopPanelContent({ panelId, isDark, session }: { panelId: string; isDark: boolean; session: any }) {
  const storePanel = useUIStore((s) => s.currentPanel);
  const examKey = resolveExamKey(panelId, storePanel);
  return (
    <div className="space-y-4 mb-6">
      {examKey ? (
        <ExamGuidePanel exam={examKey} panelId={panelId} />
      ) : (
        <DailyCase
          isDark={isDark}
          session={session}
          panelId={panelId}
          onEarnXp={async () => {
            if (!session?.user?.id) return;
            const today = new Date().toISOString().split('T')[0];
            const { error } = await (await import('../../lib/supabase')).supabase.rpc('award_xp', {
              p_reason: 'daily_case',
              p_ref_id: `${panelId}_${today}`,
            });
            if (error) console.warn('XP award failed:', error.message);
          }}
        />
      )}
    </div>
  );
}

export function renderEngagementTopPanels(panelId: string, isDark: boolean, session: any) {
  return <EngagementTopPanelContent panelId={panelId} isDark={isDark} session={session} />;
}

export function AnnouncementBanner({ siteSettings, isDark }: { siteSettings: any; isDark: boolean }) {
  if (siteSettings?.announcement_enabled === false) return null;
  const raw = siteSettings?.announcement;
  if (!raw || typeof raw !== 'string') return null;
  const text = raw.trim();
  if (text.length === 0) return null;

  const type = siteSettings?.announcement_type || 'info';
  const styles: Record<string, { box: string; dot: string; label: string; text: string; title: string }> = {
    info: { box: isDark ? 'bg-sky-950/40 border-sky-600' : 'bg-sky-50 border-sky-400', dot: 'bg-sky-500', label: isDark ? 'text-sky-400' : 'text-sky-700', text: isDark ? 'text-sky-100' : 'text-sky-900', title: 'معلومة' },
    warning: { box: isDark ? 'bg-amber-950/40 border-amber-600' : 'bg-amber-50 border-amber-400', dot: 'bg-amber-500', label: isDark ? 'text-amber-400' : 'text-amber-700', text: isDark ? 'text-amber-100' : 'text-amber-900', title: 'تنبيه هام' },
    success: { box: isDark ? 'bg-emerald-950/40 border-emerald-600' : 'bg-emerald-50 border-emerald-400', dot: 'bg-emerald-500', label: isDark ? 'text-emerald-400' : 'text-emerald-700', text: isDark ? 'text-emerald-100' : 'text-emerald-900', title: 'خبر سار' },
  };
  const s = styles[type] || styles.info;

  return (
    <div className={`p-4 mb-4 rounded-2xl border-2 flex items-start gap-3 shadow-md ${s.box}`}>
      <span className="text-2xl shrink-0">📢</span>
      <div className="flex-1">
        <p className={`text-[10px] font-black uppercase tracking-wider mb-1 flex items-center gap-2 ${s.label}`}>
          <span className={`w-2 h-2 rounded-full animate-pulse ${s.dot}`} />
          {s.title}
        </p>
        <p className={`text-sm font-bold leading-relaxed ${s.text}`}>{text}</p>
      </div>
    </div>
  );
}

export function LeaderboardPanel({ isDark, session, currentPanel }: any) {
  return <Leaderboard isDark={isDark} session={session} panelId={currentPanel} />;
}