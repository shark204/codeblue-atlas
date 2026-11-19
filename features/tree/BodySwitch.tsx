'use client';

import { useSceneStore } from "@/stores/sceneStore";
import type { GenderModel } from "@/lib/schemas";
import { useAtlasLocale } from "@/lib/atlasI18n";

export function BodySwitch() {
  const { isAr, at } = useAtlasLocale();
  const genderModel = useSceneStore((s) => s.genderModel);
  const setGenderModel = useSceneStore((s) => s.setGenderModel);
  const manifest = useSceneStore((s) => s.manifest);

  const count = manifest?.organs.length ?? 0;

  return (
    <section>
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
        {at("المجسم التشريحي · Body Model", "Body")}
      </h2>
      <div
        role="radiogroup"
        aria-label={at("اختيار المجسم التشريحي", "Anatomical model")}
        className="flex gap-1 rounded border border-slate-800 bg-slate-950/60 p-1"
      >
        <BodyButton
          value="male"
          active={genderModel === "male"}
          onPick={setGenderModel}
          label={at("Male · ذكر", "Male")}
          detail={at("جسم كامل · Whole body", "Whole body")}
          titleText={
            genderModel === "male"
              ? at("معروض حالياً: أطلس الجسم الكامل (Male)", "Showing the male atlas")
              : at(
                  "التبديل إلى أطلس الجسم الكامل (Male) — سيتم إلغاء التحديد الحالي",
                  "Switch to the male atlas — this clears the current selection",
                )
          }
        />
        <BodyButton
          value="female"
          active={genderModel === "female"}
          onPick={setGenderModel}
          label={at("Female · أنثى", "Female")}
          detail={at("الجذع والحوض · Trunk", "Trunk only")}
          titleText={
            genderModel === "female"
              ? at("معروض حالياً: أطلس الجذع والحوض للأنثى (Female)", "Showing the female atlas")
              : at(
                  "التبديل إلى أطلس الجذع والحوض للأنثى (Female) — سيتم إلغاء التحديد الحالي",
                  "Switch to the female atlas — this clears the current selection",
                )
          }
        />
      </div>

      {genderModel === "female" && (
        <div
          dir={isAr ? "rtl" : "ltr"}
          className="mt-1.5 space-y-1.5 text-[10px] leading-relaxed text-slate-400"
        >
          {isAr ? (
            <>
              <p>
                يشمل العمود الفقري وأعضاء البطن والحوض والجهاز التناسلي والثدي
                {count > 0 ? ` (${count} تركيباً تشريحياً مفصلاً)` : ""} من المرجع القياسي{" "}
                <strong className="text-slate-300">NIH Human Reference Atlas</strong>. لدراسة
                الرأس أو القفص الصدري أو الأطراف والعضلات الهضمية/الهيكلية الكاملة، انتقل إلى{" "}
                <strong className="text-sky-300">Male · جسم كامل</strong>.
              </p>
              <p>
                يركز هذا المجسم على <strong className="text-slate-300">الأحشاء الدقيقة (Viscera)</strong>{" "}
                بتفصيل فائق (مثل تقسيم الكلية إلى Cortex وMedullary pyramids وCalyces، وتفاصيل فصوص الثدي
                والأربطة الحوضية)، ولا يتضمن الجمجمة أو القفص الصدري أو العضلات الهيكلية.
              </p>
              <p className="border-t border-slate-800 pt-1.5">
                <strong className="text-amber-300">ملاحظة امتحانية هامة (Anatomical Variants):</strong>{" "}
                هذا المجسم مأخوذ من مقاطع حقيقية لسيدة تبلغ 59 عاماً في وضع الاستلقاء (Supine)، ويظهر فيه
                اختلافان تشريحيان حقيقيان يجب الانتباه لهما قبل الامتحان:
              </p>
              <ul className="mr-3 list-disc space-y-1 marker:text-slate-500">
                <li>
                  <strong className="text-slate-300">وجود 6 فقرات قطنية (L1–L6)</strong> بدلاً من 5 — وهو
                  تباين تشريحي طبيعي يظهر في نحو 5% من البشر.
                </li>
                <li>
                  <strong className="text-slate-300">مستوى الكليتين منخفض نسبياً (L1–L5)</strong> والكلية
                  اليسرى أطول بـ 2.7 سم من اليمنى؛ لكن في امتحانات الجراحة والتشريح اعتمد المستوى القياسي{" "}
                  <em className="text-sky-300">T12–L3</em>.
                </li>
              </ul>
            </>
          ) : (
            <>
              <p>
                Spine, abdominal organs, pelvis and breast
                {count > 0 ? ` — ${count} structures` : ""}, from the NIH Human Reference
                Atlas. Not a whole female body: no open dataset provides one. For the head,
                thorax or limbs, switch back to the male atlas.
              </p>
              <p>
                There is <strong className="text-slate-400">no skull, ribcage or
                musculature</strong> here — the source models organs, not a skeleton. What
                is present is complete; what is absent is absent from the data.
              </p>
              <p className="border-t border-slate-800 pt-1.5">
                <strong className="text-slate-400">This is one woman, not the average.</strong>{" "}
                The male atlas draws you the diagram; this one shows you a person, and she
                differs from the textbook in two ways worth knowing before an exam:
              </p>
              <ul className="ml-3 list-disc space-y-1 marker:text-slate-600">
                <li>
                  <strong className="text-slate-400">Six lumbar vertebrae</strong>, not
                  five — a real variant, in roughly one person in twenty.
                </li>
                <li>
                  <strong className="text-slate-400">The kidneys sit low</strong>, spanning
                  L1–L5 where the classical description is T12–L3, and the left is 2.7 cm
                  longer than the right. Learn <em>T12–L3</em> for the exam.
                </li>
              </ul>
            </>
          )}
        </div>
      )}
    </section>
  );
}

function BodyButton({
  value,
  active,
  onPick,
  label,
  detail,
  titleText,
}: {
  value: GenderModel;
  active: boolean;
  onPick: (value: GenderModel) => void;
  label: string;
  detail: string;
  titleText: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={() => onPick(value)}
      title={titleText}
      className={`flex flex-1 flex-col items-center rounded px-2 py-1 transition ${
        active
          ? "bg-sky-600/20 text-sky-200 ring-1 ring-inset ring-sky-700/60"
          : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
      }`}
    >
      <span className="text-xs font-medium">{label}</span>
      <span className="text-[9px] uppercase tracking-wide opacity-70">{detail}</span>
    </button>
  );
}
