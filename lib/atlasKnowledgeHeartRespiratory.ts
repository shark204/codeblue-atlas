/**
 * Atlas Knowledge Base — Batch 4: Heart, Mediastinum & Respiratory (original wording, concise)
 * File: lib/atlasKnowledgeHeartRespiratory.ts
 * Verify against your textbooks before publishing.
 */

export interface VisceraEntry {
  id: string;
  system: "cardiovascular" | "respiratory";
  group: string;
  name_en: string;
  name_ar: string;
  features: string;
  relations: string;
  clinical: string;
}

export const HEART_KNOWLEDGE: VisceraEntry[] = [
  { id: "mediastinum", system: "cardiovascular", group: "Mediastinum", name_en: "Mediastinum divisions", name_ar: "المنصف",
    features: "Superior (above plane through sternal angle and T4/T5): thymus, great vessels, trachea, oesophagus, thoracic duct. Inferior: anterior (fat, thymic remnants), middle (heart, pericardium, phrenic nerves), posterior (descending aorta, oesophagus, azygos, thoracic duct, vagus nerves, sympathetic chain)",
    relations: "Bounded by sternum anteriorly, thoracic vertebrae posteriorly, mediastinal pleura laterally",
    clinical: "Anterior mediastinal masses: the four T's (thymoma, teratoma, thyroid, 'terrible' lymphoma). Widened mediastinum on X-ray suggests aortic injury." },
  { id: "pericardium", system: "cardiovascular", group: "Heart", name_en: "Pericardium", name_ar: "التامور",
    features: "Fibrous pericardium (tough outer sac) and serous pericardium (parietal and visceral layers; visceral = epicardium). Transverse sinus lies behind aorta and pulmonary trunk; oblique sinus behind left atrium",
    relations: "Supplied by phrenic nerve (pain referred to shoulder tip); blood from pericardiophrenic arteries",
    clinical: "Cardiac tamponade: Beck's triad (hypotension, distended neck veins, muffled heart sounds). Pericardiocentesis via left xiphisternal angle. Surgeons clamp great vessels through the transverse sinus." },
  { id: "heart_surface", system: "cardiovascular", group: "Heart", name_en: "Heart: position & surfaces", name_ar: "موضع القلب وأسطحه",
    features: "Apex points left, forward, down: beat felt in 5th left intercostal space at midclavicular line. Right border = right atrium; inferior = right ventricle (and apex LV); left border = left ventricle; base (posterior) = mostly left atrium",
    relations: "Sternocostal surface mostly right ventricle; diaphragmatic surface mostly left ventricle",
    clinical: "Displaced apex beat indicates cardiomegaly; stab wounds near the sternum most often injure the right ventricle." },
  { id: "right_atrium", system: "cardiovascular", group: "Heart", name_en: "Right atrium", name_ar: "الأذين الأيمن",
    features: "Smooth sinus venarum (from sinus venosus) and rough pectinate muscles separated by crista terminalis; fossa ovalis (remnant of foramen ovale); openings of SVC, IVC (Eustachian valve) and coronary sinus",
    relations: "SA node lies at SVC–right atrium junction along crista terminalis; AV node in the triangle of Koch",
    clinical: "Atrial septal defect (ostium secundum commonest); persistent foramen ovale predisposes to paradoxical embolism. Atrial flutter involves the cavotricuspid isthmus." },
  { id: "right_ventricle", system: "cardiovascular", group: "Heart", name_en: "Right ventricle", name_ar: "البطين الأيمن",
    features: "Trabeculae carneae; 3 papillary muscles (anterior, posterior, septal) with chordae tendineae; moderator band (septomarginal trabecula) carries right bundle branch; smooth infundibulum (conus arteriosus) leads to pulmonary valve",
    relations: "Separated from right atrium by tricuspid valve; thinner wall (low-pressure pulmonary circuit)",
    clinical: "RV infarction: hypotension with clear lungs and raised JVP (right-sided MI from proximal RCA); tetralogy of Fallot includes RV hypertrophy and pulmonary stenosis." },
  { id: "left_atrium", system: "cardiovascular", group: "Heart", name_en: "Left atrium", name_ar: "الأذين الأيسر",
    features: "Forms most of the base; receives four pulmonary veins; smooth walls except the auricle (pectinate muscles)",
    relations: "Lies directly in front of oesophagus, descending aorta and vertebral column",
    clinical: "Left atrial enlargement (mitral stenosis) may compress oesophagus (dysphagia) or left recurrent laryngeal nerve (hoarseness, Ortner syndrome). Thrombus forms in the left auricle in atrial fibrillation." },
  { id: "left_ventricle", system: "cardiovascular", group: "Heart", name_en: "Left ventricle", name_ar: "البطين الأيسر",
    features: "Wall ~3× thicker than right; 2 papillary muscles (anterolateral, posteromedial); smooth aortic vestibule below aortic valve; forms the apex",
    relations: "Interventricular septum bulges into RV; muscular part thick, membranous part thin near aortic valve",
    clinical: "Hypertrophy in hypertension and aortic stenosis. VSD: membranous septum is the commonest site. Papillary rupture after MI causes acute mitral regurgitation." },
  { id: "heart_valves", system: "cardiovascular", group: "Heart", name_en: "Cardiac valves", name_ar: "الصمامات القلبية",
    features: "Tricuspid (3 cusps, right AV), mitral/bicuspid (2 cusps, left AV), pulmonary and aortic semilunar valves (3 cusps each). Fibrous skeleton separates atria from ventricles",
    relations: "Auscultation: aortic 2nd right ICS; pulmonary 2nd left ICS; tricuspid left lower sternal border; mitral at apex (5th ICS midclavicular)",
    clinical: "Mitral valve prolapse; rheumatic heart disease commonly affects mitral; aortic stenosis triad: angina, syncope, dyspnoea. Endocarditis in IV drug users commonly affects the tricuspid." },
  { id: "conduction_system", system: "cardiovascular", group: "Heart", name_en: "Cardiac conduction system", name_ar: "الجهاز الناقل للقلب",
    features: "SA node (~60–100 bpm) → AV node (delay) → bundle of His → right and left bundle branches (left splits into anterior and posterior fascicles) → Purkinje fibres",
    relations: "SA node artery arises from RCA in ~60%, circumflex in ~40%; AV node supplied by AV nodal artery (RCA in right-dominant, ~80–90%)",
    clinical: "Inferior MI often causes AV block; left bundle branch block can be new-onset in acute MI. Pacemaker implantation through the subclavian or cephalic vein to the right ventricle." },
  { id: "coronary_circulation", system: "cardiovascular", group: "Heart", name_en: "Coronary arteries & cardiac veins", name_ar: "الدورة التاجية",
    features: "Left main → LAD (anterior interventricular) and circumflex; RCA → right marginal and PDA (right dominance ~70%). Veins: great cardiac vein (with LAD), middle cardiac vein (with PDA), small cardiac vein → coronary sinus → right atrium",
    relations: "Coronary flow occurs mainly in diastole; anterior cardiac veins drain directly into right atrium",
    clinical: "LAD occlusion → anterior MI; circumflex → lateral; RCA → inferior. CABG often uses great saphenous vein or internal thoracic artery." },
  { id: "cardiac_innervation", system: "cardiovascular", group: "Heart", name_en: "Cardiac innervation & pain", name_ar: "التعصيب القلبي",
    features: "Sympathetic from T1–T4 (cervical and thoracic cardiac nerves) increases rate and force; parasympathetic via vagus slows heart through the cardiac plexus",
    relations: "Visceral afferent pain fibres travel with sympathetics to T1–T4",
    clinical: "Angina refers to chest, left arm and jaw (T1–T4 dermatomes)." },
  { id: "fetal_circulation", system: "cardiovascular", group: "Development", name_en: "Fetal circulation & remnants", name_ar: "الدورة الجنينية وبقاياها",
    features: "Foramen ovale → fossa ovalis; ductus arteriosus → ligamentum arteriosum; ductus venosus → ligamentum venosum; umbilical vein → ligamentum teres hepatis; umbilical arteries → medial umbilical ligaments",
    relations: "Oxygenated blood from placenta via umbilical vein; shunts bypass lungs and liver",
    clinical: "Patent ductus arteriosus: continuous 'machinery' murmur, treated with indomethacin; maintained by prostaglandins. Coarctation of aorta near ligamentum arteriosum: rib notching, radiofemoral delay." },
  { id: "tetralogy_fallot", system: "cardiovascular", group: "Development", name_en: "Common congenital heart defects", name_ar: "عيوب القلب الخلقية الشائعة",
    features: "VSD (commonest), ASD, PDA, tetralogy of Fallot (VSD, pulmonary stenosis, overriding aorta, RV hypertrophy), transposition of great arteries, coarctation",
    relations: "Tetralogy arises from anterior displacement of the infundibular septum",
    clinical: "Tet spells: squatting increases systemic resistance; boot-shaped heart on X-ray." },
  { id: "great_vessels_thorax", system: "cardiovascular", group: "Great vessels", name_en: "Aortic arch & pulmonary trunk", name_ar: "قوس الأبهر والجذع الرئوي",
    features: "Arch gives brachiocephalic trunk, left common carotid, left subclavian; pulmonary trunk divides into right and left pulmonary arteries at T5–T6",
    relations: "Left recurrent laryngeal nerve hooks under the arch beside ligamentum arteriosum; thoracic duct ascends behind the arch",
    clinical: "Aortic arch aneurysm may cause hoarseness and tracheal tug; Marfan syndrome → root dilatation." },
];

export const RESPIRATORY_KNOWLEDGE: VisceraEntry[] = [
  { id: "nose_sinuses", system: "respiratory", group: "Upper airway", name_en: "Nose & paranasal sinuses", name_ar: "الأنف والجيوب الأنفية",
    features: "Maxillary, frontal, ethmoidal, sphenoid sinuses. Maxillary sinus drains into middle meatus high on its medial wall (poor drainage). Nasolacrimal duct opens in inferior meatus",
    relations: "Kiesselbach's plexus on anterior septum (Little's area) supplied by anterior ethmoidal, sphenopalatine, greater palatine, superior labial and ethmoidal branches",
    clinical: "Epistaxis most often from Little's area; posterior bleeds from Woodruff's plexus. Maxillary sinus infection may mimic toothache (upper molar roots lie near the floor)." },
  { id: "pharynx", system: "respiratory", group: "Upper airway", name_en: "Pharynx", name_ar: "البلعوم",
    features: "Nasopharynx, oropharynx, laryngopharynx; 3 constrictors, stylopharyngeus, palatopharyngeus, salpingopharyngeus; Waldeyer's ring of lymphoid tissue (adenoids, tubal, palatine, lingual tonsils)",
    relations: "Pharyngeal plexus from CN IX and X; all muscles supplied by vagus (via plexus) except stylopharyngeus (CN IX)",
    clinical: "Adenoid hypertrophy: mouth breathing, otitis media. Pharyngeal pouch (Zenker's) arises between thyropharyngeus and cricopharyngeus (Killian's dehiscence)." },
  { id: "larynx", system: "respiratory", group: "Upper airway", name_en: "Larynx", name_ar: "الحنجرة",
    features: "Cartilages: thyroid, cricoid, epiglottis (unpaired); arytenoid, corniculate, cuneiform (paired). Vocal folds define the glottis. Posterior cricoarytenoid is the only abductor of the cords",
    relations: "All intrinsic muscles by recurrent laryngeal nerve except cricothyroid (external branch of superior laryngeal). Sensation above cords: internal laryngeal; below: recurrent laryngeal",
    clinical: "Emergency airway via cricothyroid membrane (cricothyrotomy). Bilateral RLN injury (thyroidectomy) → stridor; unilateral → hoarseness. Children's airway narrowest at cricoid (classic teaching)." },
  { id: "trachea", system: "respiratory", group: "Lower airway", name_en: "Trachea", name_ar: "القصبة الهوائية",
    features: "10–12 cm, C6 to T4/T5 (carina), 16–20 C-shaped hyaline cartilage rings with trachealis muscle posteriorly; ciliated pseudostratified epithelium",
    relations: "Oesophagus lies posterior; arch of aorta and left brachiocephalic vein cross anteriorly; thyroid isthmus overlies rings 2–4",
    clinical: "Tracheostomy through rings 2–4 (avoiding the isthmus); carina is the most sensitive cough zone." },
  { id: "bronchi", system: "respiratory", group: "Lower airway", name_en: "Main bronchi", name_ar: "الشعبتان الرئيسيتان",
    features: "Right bronchus: wider, shorter (~2.5 cm), more vertical; left: narrower, longer (~5 cm), passes under aortic arch",
    relations: "Right gives upper lobar bronchus before the hilum (eparterial bronchus)",
    clinical: "Aspirated foreign bodies usually enter the right main bronchus (right lower lobe, posterior segment when supine, superior segment of lower lobe)." },
  { id: "bronchial_tree", system: "respiratory", group: "Lower airway", name_en: "Bronchial tree & alveoli", name_ar: "الشجرة القصبية والحويصلات",
    features: "Main → lobar (3 right, 2 left) → segmental (10 right, ~8–10 left) → bronchioles → terminal → respiratory bronchioles → alveolar ducts → alveoli (~300 million). Type I pneumocytes for gas exchange; type II produce surfactant",
    relations: "Bronchopulmonary segments are surgically resectable units with their own segmental bronchus and artery; veins run intersegmentally",
    clinical: "Neonatal respiratory distress syndrome from surfactant deficiency; asthma narrows bronchioles via smooth muscle constriction." },
  { id: "lungs", system: "respiratory", group: "Lungs & pleura", name_en: "Lungs", name_ar: "الرئتان",
    features: "Right: 3 lobes (oblique and horizontal fissures). Left: 2 lobes (oblique fissure only), lingula and cardiac notch. Apex projects ~2.5 cm above medial clavicle",
    relations: "Hilum arrangement: pulmonary artery anterior to bronchus on right, superior on left (RALS); pulmonary veins are anterior and inferior",
    clinical: "Pancoast tumour at the apex: Horner syndrome and C8–T1 pain via brachial plexus involvement. Right middle lobe syndrome from nodal compression." },
  { id: "pleura", system: "respiratory", group: "Lungs & pleura", name_en: "Pleura & pleural recesses", name_ar: "غشاء الجنب",
    features: "Visceral pleura covers lung; parietal pleura: costal, diaphragmatic, mediastinal, cervical. Costodiaphragmatic recess is the lowest. Pleural reflection lines: 8th rib midclavicular, 10th midaxillary, 12th paravertebral; lung edge 2 ribs higher (6, 8, 10)",
    relations: "Parietal pleura: somatic pain from intercostal and phrenic nerves; visceral pleura: autonomic only (insensitive)",
    clinical: "Pneumothorax; tension pneumothorax needs immediate decompression (2nd ICS midclavicular or 5th ICS anterior axillary). Chest drain in the 'safe triangle' above the rib to avoid the neurovascular bundle." },
  { id: "pulmonary_vessels", system: "respiratory", group: "Lungs & pleura", name_en: "Pulmonary & bronchial circulation", name_ar: "الدورة الرئوية والقصبية",
    features: "Pulmonary arteries carry deoxygenated blood; 4 pulmonary veins return oxygenated blood. Bronchial arteries (from aorta/intercostals) nourish airways and pleura",
    relations: "Lymph drains to bronchopulmonary (hilar) then tracheobronchial and paratracheal nodes; right lung lymph can cross to left side nodes",
    clinical: "Pulmonary embolism: occludes pulmonary arteries (usually from leg DVT); hypoxic vasoconstriction in lung. Bronchial artery haemorrhage in massive haemoptysis." },
  { id: "respiratory_muscles", system: "respiratory", group: "Mechanics", name_en: "Muscles & mechanics of breathing", name_ar: "عضلات التنفس وميكانيكا الشهيق والزفير",
    features: "Quiet inspiration: diaphragm and external intercostals ('pump-handle' and 'bucket-handle' motions). Accessory: SCM, scalenes, pectorals. Expiration is passive (elastic recoil); forced expiration uses abdominal and internal intercostal muscles",
    relations: "Diaphragm openings: IVC T8, oesophagus T10, aortic hiatus T12",
    clinical: "Phrenic nerve palsy raises the hemidiaphragm; intercostal nerve blocks for rib fractures; hiccups from irritation of the phrenic nerve." },
  { id: "lung_volumes", system: "respiratory", group: "Mechanics", name_en: "Lung volumes (adult values)", name_ar: "الحجوم الرئوية",
    features: "Tidal volume ~500 mL; inspiratory reserve ~3 L; expiratory reserve ~1.2 L; residual ~1.2 L; vital capacity ~4.8 L; total lung capacity ~6 L",
    relations: "FRC (ERV + RV) is the volume at end of quiet expiration, where chest wall outward and lung inward recoil balance",
    clinical: "Obstructive disease (COPD, asthma): low FEV1/FVC ratio, raised RV. Restrictive disease (fibrosis): low volumes, preserved ratio." },
];

export const HEART_RESPIRATORY_ALL: VisceraEntry[] = [...HEART_KNOWLEDGE, ...RESPIRATORY_KNOWLEDGE];
