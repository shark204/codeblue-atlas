/**
 * Code Blue 3D Anatomy Atlas — Scientific Content & Medical Nomenclature Registry
 * File: `lib/atlasScientificContent.ts`
 */

import type { AnatomicalSystem } from "./schemas";

export type PanelId =
  | AnatomicalSystem
  | "tendons"
  | "heart_sounds"
  | "breath_sounds"
  | "scanner";

export type PanelCategory =
  | "Systemic Anatomy"
  | "Regional Anatomy"
  | "Sounds & Imaging";

export interface AtlasPanelScientificEntry {
  id: PanelId;
  category: PanelCategory;
  category_ar: string;
  title: string;
  title_ar: string;
  latin_name: string;
  subtitle: string;
  description_ar: string;
  system?: AnatomicalSystem;
  organ_count_male: number;
  accent: string;
  model_url?: string;
  diagram_url?: string;
  video_url?: string;
  secondary_video_urls?: { label: string; label_ar: string; url: string }[];
  camera_position?: [number, number, number];
  high_yield_landmarks: string[];
}

export const SYSTEMIC_PANELS_CONTENT: AtlasPanelScientificEntry[] = [
  {
    id: "muscular",
    diagram_url: "https://commons.wikimedia.org/wiki/Special:FilePath/1105_Anterior_and_Posterior_Views_of_Muscles.jpg?width=640",
    system: "muscular",
    category: "Systemic Anatomy",
    category_ar: "التشريح الجهازي العام",
    title: "Muscular",
    title_ar: "الجهاز العضلي وميكانيكا الحركة",
    latin_name: "Systema musculare",
    subtitle: "Striated & Skeletal Muscles (#E8A09A Pastel Clay)",
    description_ar: "العضلات الهيكلية والمخططة بطراز Human Atlas المرسوم بلون السلمون الوردي الناعم (#E8A09A) مع المنشأ والمرتكز والأكشن والتغذية العصبية والدموية.",
    organ_count_male: 1110,
    accent: "#E8A09A",
    model_url: "/anatomy/muscular_male.glb",
    camera_position: [0, 0.25, 2.5],
    high_yield_landmarks: [
      "Rotator cuff muscles (SITS: Supraspinatus, Infraspinatus, Teres minor, Subscapularis)",
      "Anterior abdominal wall muscles (Rectus abdominis, External & Internal oblique, Transversus abdominis)",
      "Quadriceps femoris & Hamstring group",
      "Thenar & Hypothenar intrinsic hand muscles (Median vs Ulnar nerve innervation)",
    ],
  },
  {
    id: "nervous",
    diagram_url: "https://upload.wikimedia.org/wikipedia/commons/b/b2/TE-Nervous_system_diagram.svg",
    system: "nervous",
    category: "Systemic Anatomy",
    category_ar: "التشريح الجهازي العام",
    title: "Nervous",
    title_ar: "الجهاز العصبي المركزي والطرفي",
    latin_name: "Systema nervosum",
    subtitle: "Brain, Spinal Cord & Peripheral Nerves",
    description_ar: "المخ وقشرة نصفي الكرتين المخيتين، المخيخ، جذع المخ، الحبل الشوكي، والأعصاب القحفية (CN I–XII) والضفائر العصبية الطرفية.",
    organ_count_male: 382,
    accent: "#f43f5e",
    model_url: "/anatomy/nervous_male.glb",
    camera_position: [0, 0.3, 2.4],
    high_yield_landmarks: [
      "Circle of Willis arterial circle (Anterior & Posterior communicating arteries)",
      "Brachial plexus cords and branches (Musculocutaneous, Axillary, Radial, Median, Ulnar)",
      "Cranial nerves courses (CN III, IV, V1, V2, VI through superior orbital fissure / cavernous sinus)",
      "Sciatic nerve exit via greater sciatic foramen below piriformis muscle",
    ],
  },
  {
    id: "lymphatic",
    diagram_url: "https://upload.wikimedia.org/wikipedia/commons/b/b3/TE-Lymphatic_system_diagram.svg",
    system: "lymphatic",
    category: "Systemic Anatomy",
    category_ar: "التشريح الجهازي العام",
    title: "Lymphatic",
    title_ar: "الجهاز اللمفاوي والعقد اللمفاوية البارزة والقناة الصدرية",
    latin_name: "Systema lymphoideum",
    subtitle: "Prominent Spherical Lymph Nodes & Thoracic Duct",
    description_ar: "العقد اللمفاوية الإقليمية كدوائر ثلاثية الأبعاد بارزة وواضحة مع القناة الصدرية وصهريج الكيلوس والجذوع اللمفاوية والطحال.",
    organ_count_male: 166,
    accent: "#22c55e",
    model_url: "/anatomy/lymphatic_male.glb",
    camera_position: [0, 0.25, 2.3],
    high_yield_landmarks: [
      "Thoracic duct (Ductus thoracicus) termination at left venous angle (junction of IJV and subclavian vein)",
      "Axillary lymph nodes levels (I, II, III relative to Pectoralis minor muscle)",
      "Virchow's node (Troisier sign in left supraclavicular fossa indicating gastric/abdominal malignancy)",
      "Superficial vs deep inguinal lymph nodes draining lower extremity and perineum",
    ],
  },
  {
    id: "skeletal",
    diagram_url: "https://upload.wikimedia.org/wikipedia/commons/c/ca/Human_skeleton_front_en.svg",
    system: "skeletal",
    category: "Systemic Anatomy",
    category_ar: "التشريح الجهازي العام",
    title: "Skeletal, Articular & Tendons",
    title_ar: "الهيكل العظمي والمفاصل والغضاريف والأوتار",
    latin_name: "Systema skeletale, articulare et tendineum",
    subtitle: "Bones (#EFE6D8) · Cartilage & Joints (#38bdf8) · Tendons (#F3E3D3)",
    description_ar: "الهيكل العظمي والمفاصل والغضاريف والأوتار: العظام باللون العاجي (#EFE6D8)، والمفاصل والغضاريف باللون السماوي (#38bdf8)، والأوتار واللفافات بلون الكريم الفاتح (#F3E3D3).",
    organ_count_male: 758,
    accent: "#38bdf8",
    model_url: "/anatomy/skeletal_male.glb",
    camera_position: [0, 0.2, 2.5],
    high_yield_landmarks: [
      "Bones in Ivory (#EFE6D8), Articular Cartilages & Joint Capsules in Cyan (#38bdf8), Tendons & Fascia in Pale Cream (#F3E3D3)",
      "Pterion surgical landmark & vertebral levels: C6 (cricoid), T4 (sternal angle), L1 (transpyloric), L4 (iliac crest)",
      "Knee joint: Quadriceps & Patellar tendons + ACL, PCL, MCL, LCL & Menisci",
      "Upper & lower limb tendons: Rotator cuff, Biceps/Triceps, Flexor/Extensor retinacula & Achilles tendon",
    ],
  },
];

export const REGIONAL_PANELS_CONTENT: AtlasPanelScientificEntry[] = [
  {
    id: "cardiovascular",
    diagram_url: "https://commons.wikimedia.org/wiki/Special:FilePath/Diagram_of_the_human_heart_(cropped).svg?width=640",
    system: "cardiovascular",
    category: "Regional Anatomy",
    category_ar: "التشريح الإقليمي والأحشاء",
    title: "Heart & Cardiovascular",
    title_ar: "القلب والشرايين والأوردة (في مجسم)",
    latin_name: "Systema cardiovasculare · Cor",
    subtitle: "Heart Chambers, Valves, Coronary & Systemic Vessels in 3D Body",
    description_ar: "حجرات القلب الأربع، الصمامات القلبية، الشرايين التاجية، وقوس الأورطي، والجذع الرئوي، والأوردة الجوفاء داخل المجسم التفاعلي.",
    organ_count_male: 676,
    accent: "#e11d48",
    model_url: "/anatomy/cardiovascular_male.glb",
    camera_position: [0, 0.35, 1.35],
    high_yield_landmarks: [
      "Left Anterior Descending artery (LAD) supplies apex and anterior 2/3 of interventricular septum",
      "Right Coronary Artery (RCA) supplies SA node (60%) and AV node (90%)",
      "Aortic valve auscultation site: 2nd right intercostal space at parasternal border",
      "Fibrous pericardium reflections: Transverse sinus (posterior to aorta/pulmonary trunk) & Oblique sinus",
    ],
  },
  {
    id: "respiratory",
    diagram_url: "https://commons.wikimedia.org/wiki/Special:FilePath/Respiratory_system_complete_en.svg?width=640",
    system: "respiratory",
    category: "Regional Anatomy",
    category_ar: "التشريح الإقليمي والأحشاء",
    title: "Chest & Respiratory",
    title_ar: "الصدر والرئتان والشعب الهوائية (في مجسم)",
    latin_name: "Systema respiratorium · Thorax",
    subtitle: "Trachea, Bronchial Tree, Pleura & Lungs in 3D Body",
    description_ar: "الحنجرة، والقصبة الهوائية، وتفرع الجذعين الهوائيين الرئيسيين، وفصوص الرئتين الخمسة، وغشاء الجنب داخل المجسم التفاعلي.",
    organ_count_male: 52,
    accent: "#06b6d4",
    model_url: "/anatomy/respiratory_male.glb",
    camera_position: [0, 0.35, 1.35],
    high_yield_landmarks: [
      "Right vs Left main bronchus: Right is wider, shorter (2.5 cm), and more vertical (aspiration site)",
      "Bronchopulmonary segments: 10 on right (3 RUL, 2 RML, 5 RLL), 8–10 on left",
      "Costodiaphragmatic recess: Deepest pleural space at midaxillary line (ribs 8–10)",
      "Lung hilum anterior-to-posterior order: Vein -> Artery -> Bronchus (VAB)",
    ],
  },
  {
    id: "digestive",
    diagram_url: "https://upload.wikimedia.org/wikipedia/commons/c/c5/Digestive_system_diagram_en.svg",
    system: "digestive",
    category: "Regional Anatomy",
    category_ar: "التشريح الإقليمي والأحشاء",
    title: "Digestive System",
    title_ar: "الجهاز الهضمي والكبد والقناة الصفراوية (في مجسم)",
    latin_name: "Systema digestorium",
    subtitle: "Stomach, Liver, Biliary Tree, Pancreas & Intestines in 3D Body",
    description_ar: "المريء، والمعدة، والكبد وقطاعات كوينو الثمانية، والمرارة والقنوات الصفراوية، والبنكرياس، والاثنا عشر، والأمعاء الدقيقة والغليظة داخل المجسم.",
    organ_count_male: 49,
    accent: "#ea580c",
    model_url: "/anatomy/digestive_male.glb",
    camera_position: [0, 0.12, 1.35],
    high_yield_landmarks: [
      "Couinaud liver segmentation (8 functional segments with independent portal pedicles)",
      "Portal triad in free edge of lesser omentum: Hepatic artery proper, Common bile duct, Portal vein",
      "Pringle maneuver: Temporary clamping of hepatoduodenal ligament controls hepatic inflow bleeding",
      "Coeliac trunk (T12) branches: Left gastric, Splenic, and Common hepatic arteries",
    ],
  },
  {
    id: "renal",
    diagram_url: "https://upload.wikimedia.org/wikipedia/commons/3/30/Urinary_system.svg",
    system: "renal",
    category: "Regional Anatomy",
    category_ar: "التشريح الإقليمي والأحشاء",
    title: "Renal & Urinary",
    title_ar: "الكليتان والحالبان والمثانة البولية (في مجسم)",
    latin_name: "Systema urinarium",
    subtitle: "Kidneys, Ureters & Urinary Bladder in 3D Body",
    description_ar: "الكليتان وقشرتهما والأهرامات الكلوية ونظام الكؤوس، والحالبان ومناطق التضيق الثلاث، والمثانة البولية ومثلثها داخل المجسم.",
    organ_count_male: 25,
    accent: "#d97706",
    model_url: "/anatomy/renal_male.glb",
    camera_position: [0, 0.05, 1.25],
    high_yield_landmarks: [
      "Normal vertebral kidney level: T12–L3 (Right kidney sits 1–2 cm lower due to liver bulk)",
      "3 sites of ureteric calculus impaction: UPJ (pelviureteric), pelvic brim (iliac vessels), UVJ (vesicoureteric)",
      "Water under the bridge relationship: Ureter passes inferior to Uterine artery (female) / Vas deferens (male)",
      "Renal hilum anterior-to-posterior order: Renal Vein -> Renal Artery -> Renal Pelvis (VAP)",
    ],
  },
  {
    id: "reproductive",
    diagram_url: "https://upload.wikimedia.org/wikipedia/commons/a/ab/Female_reproductive_system.svg",
    system: "reproductive",
    category: "Regional Anatomy",
    category_ar: "التشريح الإقليمي والأحشاء",
    title: "Reproductive System",
    title_ar: "الجهاز التناسلي والحوض الذكري والأنثوي (في مجسم)",
    latin_name: "Systemata genitalia",
    subtitle: "Uterus, Ovaries, Testes & Pelvic Organs in 3D Body",
    description_ar: "أعضاء الحوض التناسلية الذكرية والأنثوية، تشمل الرحم، قناتي فالوب والمبيضين، والبروستاتا والخصيتين والوعاء الناقل والحويصلات المنوية داخل المجسم.",
    organ_count_male: 18,
    accent: "#db2777",
    model_url: "/anatomy/reproductive_male.glb",
    camera_position: [0, -0.12, 1.05],
    high_yield_landmarks: [
      "Pouch of Douglas (Rectouterine pouch): Deepest peritoneal space in female pelvis (culdocentesis site)",
      "Broad ligament subdivisions: Mesometrium (uterus), Mesovarium (ovary), Mesosalpinx (fallopian tube)",
      "Ovarian vessels course within the Suspensory (infundibulopelvic) ligament of the ovary",
      "Prostatic venous plexus drains into Batson's valveless vertebral venous plexus (osteoblastic spinal metastasis route)",
    ],
  },
  {
    id: "endocrine",
    diagram_url: "https://commons.wikimedia.org/wiki/Special:FilePath/Endocrine_English.svg?width=640",
    system: "endocrine",
    category: "Regional Anatomy",
    category_ar: "التشريح الإقليمي والأحشاء",
    title: "Endocrine System",
    title_ar: "جهاز الغدد الصماء المتكامل في مجسم (16 غدة)",
    latin_name: "Systema endocrinum (Glandulae endocrinae)",
    subtitle: "Hypothalamus, Pituitary, Pineal, Thyroid, Parathyroids, Thymus, Adrenals, Pancreas & Gonads in 3D Body",
    description_ar: "منظومة الغدد الصماء الكاملة داخل مجسم الجسم الثلاثي الأبعاد: تحت المهاد، الغدة النخامية، الصنوبرية، الدرقية، جارات الدرقية، الزعترية، الكظريتان، البنكرياس، والغدد التناسلية.",
    organ_count_male: 30,
    accent: "#c084fc",
    model_url: "/anatomy/endocrine_male.glb",
    camera_position: [0, 0.42, 1.2],
    high_yield_landmarks: [
      "Recurrent laryngeal nerve runs intimately with Inferior thyroid artery (ligate branches close to capsule)",
      "External branch of superior laryngeal nerve accompanies Superior thyroid artery (ligate close to superior pole)",
      "Asymmetric adrenal venous drainage: Right adrenal vein drains directly into IVC; Left drains into Left renal vein",
      "Parathyroid embryology: Superior glands from 4th pharyngeal pouch; Inferior glands from 3rd pouch with thymus",
    ],
  },
];

export const SOUNDS_AND_IMAGING_CONTENT: AtlasPanelScientificEntry[] = [
  {
    id: "heart_sounds",
    diagram_url: "https://commons.wikimedia.org/wiki/Special:FilePath/SinusRhythmLabels.svg?width=640",
    category: "Sounds & Imaging",
    category_ar: "الأصوات والتصوير المقطعي",
    title: "Heart Sounds",
    title_ar: "أصوات القلب والتسمع الصمامي وتخطيط ECG",
    latin_name: "Auscultatio cordis et Electrocardiogramma",
    subtitle: "S1 / S2 Auscultation, Murmurs & ECG Strip",
    description_ar: "محاكاة صوتية وفيزيولوجية لنبضات القلب وأصوات انغلاق الصمامات S1 و S2 والنفخات القلبية، متزامنة مع شريط تخطيط كهربائية القلب (P-QRS-T).",
    organ_count_male: 34,
    accent: "#f43f5e",
    model_url: "/anatomy/cardiovascular_male.glb",
    camera_position: [0, 0.38, 1.35],
    high_yield_landmarks: [
      "S1 (lub): Closure of Mitral and Tricuspid valves at onset of ventricular systole",
      "S2 (dub): Closure of Aortic and Pulmonary valves at onset of ventricular diastole",
      "Physiological splitting of S2 on deep inspiration",
      "4 classical valve auscultation zones: Aortic, Pulmonary, Tricuspid, Mitral",
    ],
  },
  {
    id: "breath_sounds",
    diagram_url: "https://commons.wikimedia.org/wiki/Special:FilePath/Lungvolumes.svg?width=640",
    category: "Sounds & Imaging",
    category_ar: "الأصوات والتصوير المقطعي",
    title: "Breath Sounds",
    title_ar: "أصوات التنفس وحركة الحجاب الحاجز",
    latin_name: "Auscultatio pulmonum et Motus respiratorius",
    subtitle: "Lung Ventilation & Diaphragmatic Excursion",
    description_ar: "محاكاة حركة تمدد الرئتين والقفص الصدري وهبوط الحجاب الحاجز في الشهيق والزفير مع أصوات الحويصلات والشعب الهوائية الطبيعية والمرضية.",
    organ_count_male: 52,
    accent: "#14b8a6",
    model_url: "/anatomy/respiratory_male.glb",
    camera_position: [0, 0.35, 1.65],
    high_yield_landmarks: [
      "Normal vesicular breath sounds: Soft, low-pitched, heard over most lung fields",
      "Bronchial breath sounds: Loud, high-pitched, abnormal over peripheral parenchyma",
      "Diaphragm motor innervation: Phrenic nerve (C3, C4, C5)",
      "Diaphragmatic apertures: Caval opening (T8), Esophageal hiatus (T10), Aortic hiatus (T12)",
    ],
  },
  {
    id: "scanner",
    diagram_url: "https://commons.wikimedia.org/wiki/Special:FilePath/CT_of_a_normal_brain,_axial_14.png?width=640",
    video_url: "https://upload.wikimedia.org/wikipedia/commons/b/b5/A4CTTS_(CardioNetworks_ECHOpedia).webm",
    category: "Sounds & Imaging",
    category_ar: "الأصوات والتصوير المقطعي",
    title: "Scanner",
    title_ar: "الماسح المقطعي (Cross-Section & Ultrasound Scanner)",
    latin_name: "Tomographia et Ultrasonographia Anatomica",
    subtitle: "Axial & Coronal Cross-Sections · Vertebral Levels C1–S5",
    description_ar: "مسح مقطعي تفاعلي للجسم عبر المستويات المحورية مع قاعدة بيانات الأشعة والذكاء التشخيصي المستقل.",
    organ_count_male: 3188,
    accent: "#06b6d4",
    model_url: "/anatomy/skeletal_male.glb",
    camera_position: [0, 0.25, 2.35],
    high_yield_landmarks: [
      "Transpyloric plane of Addison (L1)",
      "Sternal angle of Louis (T4/T5 intervertebral disc)",
      "Standard axial CT viewing convention: Looking from the patient's feet upwards",
      "Caval opening level (T8), Esophageal level (T10), Aortic bifurcation level (L4)",
    ],
  },
];

export const ALL_ATLAS_PANELS_SCIENTIFIC_CONTENT: AtlasPanelScientificEntry[] = [
  ...SYSTEMIC_PANELS_CONTENT,
  ...REGIONAL_PANELS_CONTENT,
  ...SOUNDS_AND_IMAGING_CONTENT,
];

const SKELETAL_ENTRY = SYSTEMIC_PANELS_CONTENT.find((e) => e.id === "skeletal")!;
const MUSCULAR_ENTRY = SYSTEMIC_PANELS_CONTENT.find((e) => e.id === "muscular")!;

export const ATLAS_PANELS_MAP: Record<PanelId, AtlasPanelScientificEntry> = {
  ...(Object.fromEntries(
    ALL_ATLAS_PANELS_SCIENTIFIC_CONTENT.map((entry) => [entry.id, entry]),
  ) as Record<PanelId, AtlasPanelScientificEntry>),
    tendons: SKELETAL_ENTRY,
  regional: MUSCULAR_ENTRY,
  integumentary: MUSCULAR_ENTRY,
};
