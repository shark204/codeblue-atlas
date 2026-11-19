/**
 * Atlas Knowledge Base — Batch 6: Reproductive, Endocrine, Lymphatic, Integumentary (original wording, concise)
 * File: lib/atlasKnowledgeReproEndoLymphSkin.ts
 * Verify against your textbooks before publishing.
 */

export interface SystemEntry {
  id: string;
  system: "reproductive" | "endocrine" | "lymphatic" | "integumentary";
  group: string;
  name_en: string;
  name_ar: string;
  features: string;
  relations: string;
  clinical: string;
}

export const REPRODUCTIVE_KNOWLEDGE: SystemEntry[] = [
  // ───────── Male ─────────
  { id: "testis_epididymis", system: "reproductive", group: "Male", name_en: "Testis & epididymis", name_ar: "الخصية والبربخ",
    features: "Testis enclosed by tunica albuginea and tunica vaginalis; seminiferous tubules (Sertoli cells, spermatogenesis), Leydig cells (testosterone). Epididymis: head, body, tail; sperm maturation and storage",
    relations: "Testicular artery from aorta at L2; pampiniform plexus → testicular vein (right → IVC, left → left renal vein). Lymph drains to para-aortic nodes (scrotum to inguinal nodes). Cremasteric reflex: L1–L2 (genitofemoral)",
    clinical: "Torsion: sudden severe pain, high-riding testis, absent cremasteric reflex — surgical emergency within hours. Testicular tumours spread to para-aortic nodes; left varicocele ('bag of worms'); hydrocele transilluminates." },
  { id: "spermatic_cord", system: "reproductive", group: "Male", name_en: "Spermatic cord & vas deferens", name_ar: "الحبل المنوي والوعاء الناقل",
    features: "Contents: vas deferens, testicular artery, artery of vas, cremasteric artery, pampiniform plexus, genital branch of genitofemoral nerve, lymphatics, remnant of processus vaginalis. Coverings: external spermatic fascia (external oblique), cremasteric fascia (internal oblique), internal spermatic fascia (transversalis)",
    relations: "Enters via deep inguinal ring, traverses inguinal canal, exits superficial ring. Ilioinguinal nerve runs on (not in) the cord. Testis descends guided by the gubernaculum",
    clinical: "Indirect inguinal hernia travels within the cord's coverings. Vasectomy ligates the vas in the scrotum. Undescended testis (cryptorchidism) risks infertility and malignancy." },
  { id: "prostate_seminal", system: "reproductive", group: "Male", name_en: "Prostate & seminal vesicles", name_ar: "البروستاتا والحويصلات المنوية",
    features: "Prostate ~20 g, surrounds the prostatic urethra. Zones: peripheral (most cancers, palpable on DRE), transition (BPH), central, anterior fibromuscular. Seminal vesicles produce ~60% of semen (fructose); ducts join the vas to form ejaculatory ducts",
    relations: "Posterior surface is palpable per rectum; venous plexus communicates with Batson's vertebral veins. Erection: parasympathetic S2–S4; emission: sympathetic L1–L2; ejaculation: pudendal (somatic) rhythmic contraction",
    clinical: "BPH: nocturia, hesitancy (transition zone). Prostate cancer spreads to vertebrae via Batson's plexus (sclerotic metastases). Prostatectomy may injure cavernous nerves → erectile dysfunction." },
  { id: "penis", system: "reproductive", group: "Male", name_en: "Penis", name_ar: "القضيب",
    features: "Two corpora cavernosa (dorsal) and one corpus spongiosum (ventral, contains urethra, forms glans and bulb), enclosed by Buck's fascia and tunica albuginea",
    relations: "Blood: internal pudendal → deep artery (erection) and dorsal artery; dorsal vein drains to prostatic plexus; skin lymph to superficial inguinal nodes",
    clinical: "Priapism emergency; Peyronie's disease (plaque curvature); hypospadias (ventral meatus); phimosis; penile fracture (tunica albuginea rupture)." },

  // ───────── Female ─────────
  { id: "uterus", system: "reproductive", group: "Female", name_en: "Uterus & cervix", name_ar: "الرحم وعنق الرحم",
    features: "Fundus, body, isthmus, cervix; usually anteverted and anteflexed. Layers: perimetrium, myometrium, endometrium (functional + basal). Cervix: internal os, endocervical canal, external os; transformation zone",
    relations: "Broad ligament (mesometrium), round ligament (to labia majora via inguinal canal), cardinal (Mackenrodt) ligaments (main support), uterosacral ligaments. Uterine artery (internal iliac) crosses over the ureter ('water under the bridge'); anastomoses with ovarian artery",
    clinical: "Fibroids (leiomyoma) are commonest pelvic tumours. Cervical cancer arises at squamous-columnar transformation zone (HPV 16/18), screened by smear. Uterine prolapse results from weak cardinal ligaments and levator ani." },
  { id: "tubes_ovaries", system: "reproductive", group: "Female", name_en: "Uterine tubes & ovaries", name_ar: "قناتا فالوب والمبيضان",
    features: "Tube: infundibulum with fimbriae, ampulla (fertilisation; commonest ectopic site), isthmus, intramural part. Ovary: cortex (follicles), medulla; attached by mesovarium, ovarian ligament, suspensory (infundibulopelvic) ligament carrying ovarian vessels",
    relations: "Ovarian fossa contacts obturator nerve and ureter; ovarian artery from aorta (L2); right ovarian vein → IVC, left → left renal vein; lymph to para-aortic nodes",
    clinical: "Ectopic pregnancy: ampulla commonest, rupture is life-threatening; ovarian torsion twists the infundibulopelvic ligament; ovarian pain referred to medial thigh (obturator). Ovarian cancer spreads transcoelomically." },
  { id: "vagina", system: "reproductive", group: "Female", name_en: "Vagina & fornices", name_ar: "المهبل",
    features: "Muscular tube ~8–10 cm; anterior, posterior and lateral fornices (posterior is deepest); upper 3/4 from paramesonephric ducts, lower 1/4 from urogenital sinus",
    relations: "Anterior: bladder and urethra; posterior: rectouterine pouch (Douglas), rectum; lateral: ureters and uterine arteries. Blood: vaginal and uterine arteries",
    clinical: "Culdocentesis through the posterior fornix; vesicovaginal fistula after obstructed labour; Bartholin's gland cysts at the vestibule." },
  { id: "pelvic_floor_perineum", system: "reproductive", group: "Pelvis", name_en: "Pelvic floor & perineum", name_ar: "قاع الحوض والعجان",
    features: "Levator ani (puborectalis, pubococcygeus, iliococcygeus) and coccygeus form the pelvic diaphragm; perineal body is the central tendon. Perineum: urogenital triangle (anterior) and anal triangle (posterior with ischioanal fossae)",
    relations: "Nerve supply: nerve to levator ani (S3–S4) and pudendal nerve (S2–S4) in Alcock's canal; pudendal block at the ischial spine",
    clinical: "Childbirth injury weakens the floor → prolapse and stress incontinence; episiotomy cuts the perineal body; ischioanal abscess." },
];

export const ENDOCRINE_KNOWLEDGE: SystemEntry[] = [
  { id: "pituitary", system: "endocrine", group: "Endocrine glands", name_en: "Pituitary gland & hypothalamus", name_ar: "الغدة النخامية",
    features: "Sits in the sella turcica. Anterior lobe (adenohypophysis, from Rathke's pouch): GH, PRL, ACTH, TSH, FSH, LH via hypophyseal portal system. Posterior lobe (neurohypophysis): stores ADH and oxytocin made in hypothalamic nuclei",
    relations: "Optic chiasm lies above; cavernous sinuses (CN III, IV, V1, V2, VI, ICA) lateral; sphenoid sinus below",
    clinical: "Adenoma compressing chiasm → bitemporal hemianopia; transsphenoidal surgery. Sheehan's syndrome after postpartum haemorrhage; diabetes insipidus from ADH deficiency." },
  { id: "pineal", system: "endocrine", group: "Endocrine glands", name_en: "Pineal gland", name_ar: "الغدة الصنوبرية",
    features: "Posterior to third ventricle, attached to roof of diencephalon; produces melatonin (circadian rhythm); calcifies with age",
    relations: "Lies above the superior colliculi, near the great cerebral vein (of Galen)",
    clinical: "Midline calcification is a radiological marker for mass effect; pineal tumours compress the tectum causing Parinaud syndrome (impaired upgaze)." },
  { id: "thyroid", system: "endocrine", group: "Endocrine glands", name_en: "Thyroid gland", name_ar: "الغدة الدرقية",
    features: "Two lobes joined by an isthmus over tracheal rings 2–4, occasional pyramidal lobe; spans C5–T1. Follicular cells make T3/T4; parafollicular C cells make calcitonin",
    relations: "Arteries: superior thyroid (from ECA) and inferior thyroid (thyrocervical trunk), thyroidea ima occasionally; veins to IJV and brachiocephalic. Recurrent laryngeal nerve near inferior thyroid artery; external laryngeal nerve near superior thyroid artery. Moves with swallowing (pretracheal fascia)",
    clinical: "Thyroidectomy risks: RLN injury (hoarseness), external laryngeal injury (loss of voice pitch), hypocalcaemia from parathyroid damage. Thyroglossal cyst moves up on tongue protrusion; Graves disease, goitre; medullary carcinoma from C cells." },
  { id: "parathyroid", system: "endocrine", group: "Endocrine glands", name_en: "Parathyroid glands", name_ar: "الغدد جارات الدرقية",
    features: "Usually 4, on the posterior thyroid surface; chief cells secrete PTH; superior glands from 4th pharyngeal pouch, inferior from 3rd pouch (hence may descend with thymus)",
    relations: "Blood supply mainly inferior thyroid artery",
    clinical: "Primary hyperparathyroidism: 'stones, bones, groans, moans'; hypocalcaemia (tetany, Chvostek and Trousseau signs) after thyroid surgery; ectopic glands in the mediastinum." },
  { id: "adrenal", system: "endocrine", group: "Endocrine glands", name_en: "Suprarenal (adrenal) glands", name_ar: "الغدتان الكظريتان",
    features: "Right pyramidal, left crescentic; cortex: zona glomerulosa (aldosterone), fasciculata (cortisol), reticularis (androgens); medulla: chromaffin cells secreting adrenaline and noradrenaline",
    relations: "Arteries: superior (inferior phrenic), middle (aorta), inferior (renal). Veins: right short → IVC; left → left renal vein. Medulla supplied by preganglionic sympathetic fibres (T10–L1 splanchnics)",
    clinical: "Phaeochromocytoma: paroxysmal hypertension; Cushing syndrome; Addison's disease (hyperpigmentation); Conn syndrome. Right adrenal vein is short — a hazard in adrenalectomy." },
];

export const LYMPHATIC_KNOWLEDGE: SystemEntry[] = [
  { id: "lymphatic_overview", system: "lymphatic", group: "Overview", name_en: "Lymphatic system overview", name_ar: "نظرة عامة على الجهاز اللمفاوي",
    features: "Capillaries → collecting vessels (with valves) → lymph nodes → trunks → ducts. Lymph node: cortex (B-cell follicles), paracortex (T cells), medulla; many afferent, one efferent vessel",
    relations: "Right lymphatic duct drains right head/neck, right arm, right thorax; thoracic duct drains the rest, starting at the cisterna chyli (L1–L2), passing through the aortic hiatus (T12) to the left venous angle (junction of left IJV and subclavian vein)",
    clinical: "Metastatic nodes: hard, painless, fixed; Hodgkin lymphoma (Reed–Sternberg cells); chylothorax from thoracic duct injury; lymphoedema after node clearance." },
  { id: "head_neck_nodes", system: "lymphatic", group: "Nodes", name_en: "Head & neck lymph nodes", name_ar: "العقد اللمفاوية للرأس والرقبة",
    features: "Ring: occipital, retroauricular, parotid, submandibular, submental. Deep cervical chain along the IJV: jugulodigastric (tonsil), jugulo-omohyoid (tongue). Supraclavicular nodes",
    relations: "All cervical lymph finally drains to deep cervical nodes then jugular trunk",
    clinical: "Virchow's node (left supraclavicular) enlargement signals abdominal/thoracic malignancy (Troisier's sign); tongue tip cancer drains bilaterally to submental and deep nodes." },
  { id: "axillary_nodes", system: "lymphatic", group: "Nodes", name_en: "Axillary lymph nodes", name_ar: "العقد الإبطية",
    features: "Five groups: anterior (pectoral), posterior (subscapular), lateral (humeral), central, apical. Levels I–III relative to pectoralis minor (lateral, behind, medial)",
    relations: "Receive upper limb, breast and upper trunk lymph; efferents go to subclavian trunk. Long thoracic nerve lies on serratus anterior, thoracodorsal nerve along subscapular vessels",
    clinical: "Sentinel node biopsy in breast cancer; clearance risks winged scapula (long thoracic), lymphoedema, intercostobrachial numbness." },
  { id: "inguinal_pelvic_nodes", system: "lymphatic", group: "Nodes", name_en: "Inguinal, iliac & para-aortic nodes", name_ar: "العقد الأربية والحرقفية وجارات الأبهر",
    features: "Superficial inguinal: horizontal group (lower abdominal wall, buttock, perineum, penis, vulva, anal canal below pectinate line) and vertical group (great saphenous territory). Deep inguinal in femoral canal (node of Cloquet)",
    relations: "Drain to external iliac → common iliac → lumbar (para-aortic) nodes. Testis and ovary drain to para-aortic nodes, not inguinal",
    clinical: "Inguinal nodes enlarge with skin infections of leg or perineum, STIs, anal canal (below dentate line) and vulval cancer." },
  { id: "spleen", system: "lymphatic", group: "Organs", name_en: "Spleen", name_ar: "الطحال",
    features: "Largest lymphoid organ: ~1 × 3 × 5 inches, ~200 g, lies against left ribs 9–11. White pulp (immune), red pulp (filters and removes old red cells)",
    relations: "Contacts stomach, left kidney, splenic flexure, pancreatic tail (in splenorenal ligament); gastrosplenic ligament carries short gastrics. Splenic artery (tortuous branch of coeliac); splenic vein joins SMV to form portal vein",
    clinical: "Rupture after left lower rib trauma: Kehr's sign (left shoulder pain, phrenic referral). Post-splenectomy: overwhelming infection by encapsulated organisms (vaccinate: pneumococcus, meningococcus, Hib); Howell–Jolly bodies; accessory spleens in ~10–30%." },
  { id: "thymus", system: "lymphatic", group: "Organs", name_en: "Thymus", name_ar: "الغدة الزعترية",
    features: "Bilobed organ in the superior and anterior mediastinum behind the manubrium; T-cell maturation (cortex and medulla with Hassall's corpuscles); largest in childhood, involutes after puberty",
    relations: "Derives from the 3rd pharyngeal pouch endoderm; blood from internal thoracic and inferior thyroid arteries",
    clinical: "Thymoma associated with myasthenia gravis; DiGeorge syndrome (22q11 deletion): absent thymus and parathyroids → T-cell deficiency and hypocalcaemia." },
  { id: "tonsils_malt", system: "lymphatic", group: "Organs", name_en: "Tonsils & mucosa-associated lymphoid tissue", name_ar: "اللوزتان والأنسجة اللمفاوية المخاطية",
    features: "Waldeyer's ring: pharyngeal (adenoid), tubal, palatine, lingual tonsils. Palatine tonsil lies between palatoglossal and palatopharyngeal arches. Peyer's patches (ileum), appendix, bronchial MALT",
    relations: "Tonsillar artery (facial) supplies; sensation via glossopharyngeal nerve, so tonsillitis refers pain to the ear; internal carotid lies ~2.5 cm lateral",
    clinical: "Quinsy (peritonsillar abscess): trismus, deviated uvula; tonsillectomy bleeding from paratonsillar vein; adenoid hypertrophy blocks eustachian tube." },
];

export const INTEGUMENTARY_KNOWLEDGE: SystemEntry[] = [
  { id: "skin_layers", system: "integumentary", group: "Skin", name_en: "Skin layers & cells", name_ar: "طبقات الجلد",
    features: "Epidermis (keratinocytes; strata basale, spinosum, granulosum, lucidum in thick skin, corneum; melanocytes, Langerhans cells, Merkel cells); dermis (papillary, reticular); hypodermis (fat)",
    relations: "Thick skin on palms and soles; avascular epidermis nourished from dermis; Langer's lines of skin tension guide incision direction for minimal scarring",
    clinical: "Burns: superficial, partial, full thickness (painless, leathery); basal cell carcinoma (pearly, rodent ulcer), squamous cell carcinoma, melanoma (Breslow thickness prognosis); pemphigus vs pemphigoid." },
  { id: "skin_appendages", system: "integumentary", group: "Skin", name_en: "Hair, nails & skin glands", name_ar: "الشعر والأظافر والغدد الجلدية",
    features: "Hair follicle with arrector pili (sympathetic), sebaceous gland (holocrine); eccrine sweat glands (thermoregulation, sympathetic cholinergic) and apocrine glands (axilla, groin, areola); nail matrix grows the nail plate",
    relations: "Sebaceous glands absent on palms and soles; apocrine glands activate at puberty",
    clinical: "Acne from sebaceous follicle blockage; hidradenitis suppurativa (apocrine); paronychia; clubbing indicates chronic hypoxia or malignancy." },
  { id: "dermatomes", system: "integumentary", group: "Skin", name_en: "Key dermatomes & cutaneous landmarks", name_ar: "قطاعات الجلد (الدرماتوم)",
    features: "C2 occiput, C4 shoulder tip, C6 thumb, C7 middle finger, C8 little finger, T4 nipple, T7 xiphisternum, T10 umbilicus, L1 groin, L3 knee, L4 medial malleolus, L5 dorsum of foot and great toe, S1 lateral foot, S2–S4 perineum",
    relations: "Face: V1 (forehead, cornea), V2 (cheek, upper lip), V3 (jaw, lower lip, mandible)",
    clinical: "Shingles (herpes zoster) follows a dermatome and does not cross the midline; spinal level localisation of cord lesions uses sensory level." },
  { id: "breast_structure", system: "integumentary", group: "Breast", name_en: "Breast structure", name_ar: "الثدي",
    features: "Overlies ribs 2–6 on pectoralis major, serratus anterior; axillary tail (of Spence); 15–20 lobes with lactiferous ducts and sinuses opening at the nipple; Cooper's suspensory ligaments; retromammary space allows mobility",
    relations: "Nipple at T4 dermatome (4th intercostal space in men and young women); areola glands (of Montgomery)",
    clinical: "Skin dimpling and nipple retraction from Cooper's ligament involvement; peau d'orange from lymphatic obstruction; upper outer quadrant most frequent cancer site; gynaecomastia in men." },
  { id: "breast_supply_lymph", system: "integumentary", group: "Breast", name_en: "Breast vessels & lymphatics", name_ar: "أوعية الثدي ولمفاويته",
    features: "Arteries: internal thoracic (perforators), lateral thoracic, thoracoacromial, intercostal branches. Veins parallel arteries and also drain to vertebral venous plexus",
    relations: "Lymph: ~75% to axillary nodes (mainly anterior/pectoral), ~20% to parasternal (internal thoracic) nodes, remainder to opposite breast and abdominal nodes",
    clinical: "Vertebral venous (Batson) route explains bone and brain metastases; medial quadrant tumours may spread to parasternal nodes; mastectomy and axillary dissection injure long thoracic, thoracodorsal and intercostobrachial nerves." },
];

export const REPRO_ENDO_LYMPH_SKIN_ALL: SystemEntry[] = [
  ...REPRODUCTIVE_KNOWLEDGE,
  ...ENDOCRINE_KNOWLEDGE,
  ...LYMPHATIC_KNOWLEDGE,
  ...INTEGUMENTARY_KNOWLEDGE,
];
