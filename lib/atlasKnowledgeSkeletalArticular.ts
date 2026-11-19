/**
 * Atlas Knowledge Base — Batch 3: Skeletal & Articular (original wording, concise)
 * File: lib/atlasKnowledgeSkeletalArticular.ts
 * Verify against your textbooks before publishing.
 */

export interface BoneJointEntry {
  id: string;
  system: "skeletal" | "articular";
  group: string;
  name_en: string;
  name_ar: string;
  features: string;     // key anatomy
  relations: string;    // articulations / attachments / neurovascular relations
  clinical: string;
}

export const SKELETAL_KNOWLEDGE: BoneJointEntry[] = [
  // ───────── Overview ─────────
  { id: "skeleton_overview", system: "skeletal", group: "Overview", name_en: "Human skeleton overview", name_ar: "نظرة عامة على الهيكل العظمي",
    features: "206 bones in adults: 80 axial (skull, vertebrae, ribs, sternum, hyoid, ossicles) and 126 appendicular",
    relations: "Long bones: diaphysis, metaphysis, epiphysis; growth at the physis (epiphyseal plate)",
    clinical: "Salter–Harris classification (I–V) grades physeal fractures; type II is the commonest. Children fractures near growth plates can cause limb length discrepancy." },

  // ───────── Skull ─────────
  { id: "skull_bones_sutures", system: "skeletal", group: "Skull", name_en: "Skull bones & sutures", name_ar: "عظام الجمجمة والدروز",
    features: "Cranium: frontal, 2 parietal, 2 temporal, occipital, sphenoid, ethmoid. Sutures: coronal, sagittal, lambdoid, squamous",
    relations: "Pterion: junction of frontal, parietal, sphenoid (greater wing), temporal — overlies anterior division of middle meningeal artery",
    clinical: "Temple trauma at pterion → epidural haematoma (lucid interval, biconvex lens on CT). Craniosynostosis = premature suture fusion." },
  { id: "fontanelles", system: "skeletal", group: "Skull", name_en: "Fontanelles", name_ar: "اليافوخ",
    features: "Anterior (diamond, at bregma) and posterior (triangular, at lambda) membranous gaps in infant skull",
    relations: "Posterior closes by ~2–3 months; anterior by ~18–24 months",
    clinical: "Bulging anterior fontanelle: raised ICP/meningitis; sunken: dehydration." },
  { id: "skull_base_foramina", system: "skeletal", group: "Skull", name_en: "Foramina of the skull base", name_ar: "ثقوب قاعدة الجمجمة",
    features: "Cribriform plate (CN I); optic canal (CN II, ophthalmic artery); superior orbital fissure (CN III, IV, V1, VI, ophthalmic veins); foramen rotundum (V2); foramen ovale (V3, accessory meningeal artery); foramen spinosum (middle meningeal artery); carotid canal (ICA); internal acoustic meatus (CN VII, VIII); jugular foramen (CN IX, X, XI, IJV origin); hypoglossal canal (XII); foramen magnum (medulla, vertebral arteries, spinal root of XI)",
    relations: "Anterior fossa: frontal lobes; middle fossa: temporal lobes and pituitary; posterior fossa: cerebellum and brainstem",
    clinical: "Basilar skull fracture signs: raccoon eyes, Battle sign, CSF otorrhoea/rhinorrhoea, cranial nerve palsies." },
  { id: "orbit", system: "skeletal", group: "Skull", name_en: "Orbit", name_ar: "الحجاج (الحجاج العظمي)",
    features: "Seven bones: frontal, zygomatic, maxilla, sphenoid, ethmoid, lacrimal, palatine. Floor is thinnest at the infraorbital canal; medial wall (lamina papyracea) is paper-thin",
    relations: "Optic canal at apex with ophthalmic artery; superior and inferior orbital fissures",
    clinical: "Blowout fracture: floor gives way → inferior rectus entrapment, diplopia on upgaze, infraorbital numbness." },
  { id: "mandible_facial_bones", system: "skeletal", group: "Skull", name_en: "Mandible & facial bones", name_ar: "الفك السفلي وعظام الوجه",
    features: "Mandible: body, ramus, angle, condyle, coronoid process, mental foramen; inferior alveolar nerve enters mandibular foramen",
    relations: "Maxilla (hard palate, maxillary sinus), zygomatic, nasal, lacrimal, palatine, vomer, inferior nasal conchae",
    clinical: "Mandible fractures often occur at two sites (e.g. body and contralateral condyle). Inferior alveolar nerve block at mandibular foramen." },

  // ───────── Vertebral column ─────────
  { id: "vertebral_column", system: "skeletal", group: "Vertebral column", name_en: "Vertebral column", name_ar: "العمود الفقري",
    features: "33 vertebrae: 7 cervical, 12 thoracic, 5 lumbar, 5 sacral (fused), 4 coccygeal. Primary curves (thoracic, sacral) kyphotic; secondary (cervical, lumbar) lordotic",
    relations: "Landmark levels: C6 cricoid, T4/5 sternal angle, L1 transpyloric plane, L4 iliac crest/aortic bifurcation",
    clinical: "Scoliosis (lateral curve with rotation); hyperkyphosis in osteoporosis." },
  { id: "cervical_vertebrae", system: "skeletal", group: "Vertebral column", name_en: "Cervical vertebrae (atlas, axis, C7)", name_ar: "الفقرات العنقية",
    features: "Typical: transverse foramina, bifid spines (C3–C5). Atlas (C1): no body or spinous process. Axis (C2): dens (odontoid process). C7 'vertebra prominens'",
    relations: "Transverse ligament of atlas holds dens against anterior arch; vertebral artery passes through C6–C1 foramina then over the atlas posterior arch",
    clinical: "Jefferson fracture: burst fracture of atlas. Hangman's fracture: C2 pars interarticularis. Dens fracture types I–III; whiplash affects ligaments." },
  { id: "thoracic_lumbar_vertebrae", system: "skeletal", group: "Vertebral column", name_en: "Thoracic & lumbar vertebrae", name_ar: "الفقرات الصدرية والقطنية",
    features: "Thoracic: costal facets, long downward spines. Lumbar: largest bodies, no costal facets, short stout spines, facet joints oriented sagittally",
    relations: "Pars interarticularis connects superior and inferior articular processes",
    clinical: "Spondylolysis (pars defect) → spondylolisthesis (forward slip, commonly L5 on S1). Lumbar compression fractures common in osteoporosis." },
  { id: "intervertebral_disc", system: "skeletal", group: "Vertebral column", name_en: "Intervertebral disc", name_ar: "القرص بين الفقري",
    features: "Nucleus pulposus (gel core) surrounded by annulus fibrosus; no disc between C1–C2; ~25% of column length",
    relations: "Posterior longitudinal ligament is thin laterally, so herniation is usually posterolateral",
    clinical: "L4/L5 herniation compresses the traversing L5 root; L5/S1 compresses S1 root. Central herniation → cauda equina syndrome." },
  { id: "sacrum_coccyx", system: "skeletal", group: "Vertebral column", name_en: "Sacrum & coccyx", name_ar: "العجز وعصعص",
    features: "Five fused vertebrae with 4 pairs of sacral foramina; sacral promontory; sacral hiatus with cornua at S4–S5",
    relations: "Articulates with L5 (lumbosacral joint) and ilium (sacroiliac joint); coccyx gives attachment to levator ani and gluteus maximus",
    clinical: "Caudal epidural anaesthesia through the sacral hiatus. Coccydynia after falls or childbirth." },

  // ───────── Thorax ─────────
  { id: "sternum", system: "skeletal", group: "Thorax", name_en: "Sternum", name_ar: "عظم القص",
    features: "Manubrium, body, xiphoid process; jugular notch at T2/T3; sternal angle (manubriosternal joint) at T4/T5",
    relations: "Sternal angle marks 2nd costal cartilage, tracheal bifurcation, aortic arch start/end and azygos arch entry",
    clinical: "Sternum is a site for bone marrow aspiration; median sternotomy for cardiac surgery." },
  { id: "ribs", system: "skeletal", group: "Thorax", name_en: "Ribs & costal cartilages", name_ar: "الأضلاع",
    features: "12 pairs: 1–7 true, 8–10 false, 11–12 floating. Typical ribs 3–9; atypical 1, 2, 10–12. Costal groove houses neurovascular bundle",
    relations: "1st rib: scalene tubercle separates subclavian vein (anterior) from artery and brachial plexus (posterior)",
    clinical: "Cervical rib → thoracic outlet syndrome. Ribs 4–9 are most commonly fractured; flail chest from multiple fractures of consecutive ribs." },

  // ───────── Upper limb ─────────
  { id: "clavicle_scapula", system: "skeletal", group: "Upper limb", name_en: "Clavicle & scapula", name_ar: "الترقوة واللوح",
    features: "Clavicle: S-shaped, only bony strut between trunk and arm. Scapula: spine, acromion, coracoid, glenoid, suprascapular notch, superior/inferior angles",
    relations: "Scapula lies over ribs 2–7; coracoclavicular ligaments (trapezoid, conoid) stabilise AC joint",
    clinical: "Clavicle fractures at junction of middle and lateral thirds (medial fragment pulled up by SCM). Scapular fractures imply high-energy trauma." },
  { id: "humerus", system: "skeletal", group: "Upper limb", name_en: "Humerus", name_ar: "العضد",
    features: "Head, anatomical neck, surgical neck, greater/lesser tubercles, deltoid tuberosity, radial groove, medial/lateral epicondyles, capitulum, trochlea",
    relations: "Axillary nerve at surgical neck; radial nerve in spiral groove; ulnar nerve behind medial epicondyle",
    clinical: "Surgical neck fracture → axillary nerve; midshaft → radial nerve (wrist drop); supracondylar (children) → brachial artery and anterior interosseous nerve." },
  { id: "radius_ulna", system: "skeletal", group: "Upper limb", name_en: "Radius & ulna", name_ar: "الكعبرة والزند",
    features: "Radius: head, radial tuberosity, styloid process, Lister's tubercle. Ulna: olecranon, coronoid process, trochlear notch, styloid process",
    relations: "Interosseous membrane links them; radius pivots over ulna during pronation",
    clinical: "Colles fracture (distal radius, dorsal displacement, 'dinner fork'). Monteggia: ulna fracture + radial head dislocation; Galeazzi: radius fracture + distal radioulnar dislocation." },
  { id: "carpal_bones", system: "skeletal", group: "Upper limb", name_en: "Carpal bones", name_ar: "عظام الرسغ",
    features: "Proximal row (lateral → medial): scaphoid, lunate, triquetrum, pisiform. Distal row: trapezium, trapezoid, capitate, hamate (hook)",
    relations: "Scaphoid forms floor of anatomical snuffbox; flexor retinaculum attaches to scaphoid tubercle, trapezium, pisiform, hook of hamate",
    clinical: "Scaphoid fracture (commonest carpal): snuffbox tenderness, risk of avascular necrosis of proximal pole (retrograde blood supply). Lunate dislocation → median nerve compression. Hook of hamate fracture → ulnar nerve injury." },
  { id: "hand_bones", system: "skeletal", group: "Upper limb", name_en: "Metacarpals & phalanges", name_ar: "السلاميات وأمشاط اليد",
    features: "5 metacarpals; 14 phalanges (thumb has 2, others 3)",
    relations: "Thumb carpometacarpal joint is a saddle joint permitting opposition",
    clinical: "Boxer's fracture: 5th metacarpal neck. Bennett fracture: base of 1st metacarpal intra-articular." },

  // ───────── Lower limb ─────────
  { id: "pelvis", system: "skeletal", group: "Lower limb", name_en: "Hip bone & pelvis", name_ar: "عظم الحوض",
    features: "Ilium, ischium, pubis fuse at acetabulum (Y-shaped triradiate cartilage). Features: ASIS, AIIS, ischial spine/tuberosity, pubic symphysis, greater/lesser sciatic notches",
    relations: "Pelvic ring with sacrum; female inlet rounder, wider subpubic angle (>80°) vs male (<70°)",
    clinical: "Pelvic ring fractures usually break at two sites; may cause haemorrhage from internal iliac branches and bladder/urethral injury." },
  { id: "femur", system: "skeletal", group: "Lower limb", name_en: "Femur", name_ar: "عظم الفخذ",
    features: "Head (fovea), neck (angle ~125°), greater/lesser trochanters, linea aspera, adductor tubercle, medial/lateral condyles",
    relations: "Head supplied mainly by retinacular branches of medial circumflex femoral artery; small contribution from artery of ligamentum teres",
    clinical: "Intracapsular neck fracture risks avascular necrosis; limb shortened and externally rotated. Intertrochanteric fractures are extracapsular." },
  { id: "patella_tibia_fibula", system: "skeletal", group: "Lower limb", name_en: "Patella, tibia & fibula", name_ar: "الرضفة والظنبوب والشظية",
    features: "Patella: largest sesamoid bone. Tibia: tibial plateau, tuberosity, medial malleolus, Gerdy's tubercle. Fibula: head, neck, lateral malleolus",
    relations: "Common fibular nerve wraps around fibular neck; tibia is subcutaneous on its anteromedial surface",
    clinical: "Tibial shaft fractures risk compartment syndrome and open injury. Fibular neck fracture → foot drop. Osgood–Schlatter at tibial tuberosity in adolescents." },
  { id: "tarsals_foot", system: "skeletal", group: "Lower limb", name_en: "Tarsals, metatarsals & arches", name_ar: "عظام القدم",
    features: "Talus, calcaneus, navicular, cuboid, 3 cuneiforms; 5 metatarsals; 14 phalanges. Medial longitudinal arch highest",
    relations: "Sustentaculum tali supports talus; plantar aponeurosis and spring ligament maintain arches",
    clinical: "Calcaneus most commonly fractured tarsal (fall from height; check lumbar spine). Jones fracture at 5th metatarsal base; March fracture (stress) in 2nd metatarsal." },
];

export const ARTICULAR_KNOWLEDGE: BoneJointEntry[] = [
  { id: "joint_classification", system: "articular", group: "Overview", name_en: "Classification of joints", name_ar: "تصنيف المفاصل",
    features: "Fibrous (sutures, syndesmoses, gomphoses), cartilaginous (primary synchondroses, secondary symphyses), synovial (plane, hinge, pivot, condyloid, saddle, ball-and-socket)",
    relations: "Synovial joint: articular hyaline cartilage, capsule, synovial membrane, synovial fluid, ligaments, bursae",
    clinical: "Osteoarthritis: cartilage degeneration; rheumatoid arthritis: synovial inflammation; septic arthritis is an emergency." },
  { id: "tmj", system: "articular", group: "Head & neck", name_en: "Temporomandibular joint", name_ar: "المفصل الصدغي الفكي",
    features: "Condyle of mandible and mandibular fossa/articular tubercle of temporal bone, separated by fibrocartilaginous disc",
    relations: "Lateral pterygoid protrudes and opens jaw; masseter, temporalis, medial pterygoid close it; innervation by auriculotemporal nerve",
    clinical: "Dislocation is anterior (jaw locked open) — reduction by pushing mandible down and back. TMJ dysfunction: clicking, pain." },
  { id: "atlantoaxial", system: "articular", group: "Head & neck", name_en: "Atlanto-occipital & atlantoaxial joints", name_ar: "المفصلان الفقري القذالي والمحوري",
    features: "Atlanto-occipital: nodding 'yes' (condyloid). Atlantoaxial: rotation 'no' (pivot around dens) with transverse ligament and alar ligaments",
    relations: "Tectorial membrane continues posterior longitudinal ligament to clivus",
    clinical: "Transverse ligament rupture (rheumatoid arthritis, trauma) → cord compression. Down syndrome has atlantoaxial instability." },
  { id: "shoulder_joint", system: "articular", group: "Upper limb", name_en: "Glenohumeral joint", name_ar: "المفصل الكتفي العضدي",
    features: "Ball-and-socket; shallow glenoid deepened by labrum; most mobile, least stable. Stabilised by rotator cuff (SITS), glenohumeral ligaments and long head of biceps",
    relations: "Inferior capsule is weakest; axillary nerve lies close inferiorly",
    clinical: "Anterior-inferior dislocation (~95%): Bankart lesion, Hill–Sachs defect, axillary nerve risk. Adhesive capsulitis (frozen shoulder)." },
  { id: "ac_sc_joints", system: "articular", group: "Upper limb", name_en: "Acromioclavicular & sternoclavicular joints", name_ar: "المفصلان الأخرمي الترقوي والقصي الترقوي",
    features: "AC: plane joint stabilised by coracoclavicular ligaments. SC: saddle-type with articular disc — only bony attachment of upper limb to axial skeleton",
    relations: "Coracoclavicular ligaments (trapezoid lateral, conoid medial)",
    clinical: "AC separation after fall onto shoulder (Rockwood classification). Posterior SC dislocation can compress great vessels and trachea." },
  { id: "elbow_joint", system: "articular", group: "Upper limb", name_en: "Elbow joint", name_ar: "مفصل المرفق",
    features: "Hinge (humeroulnar, humeroradial) plus pivot (proximal radioulnar). Stabilised by medial (ulnar) collateral, lateral collateral and annular ligaments",
    relations: "Ulnar nerve behind medial epicondyle; median nerve and brachial artery in cubital fossa",
    clinical: "Nursemaid's elbow: radial head subluxation under annular ligament in toddlers pulled by the hand. Fat pad sign on X-ray suggests effusion." },
  { id: "wrist_joint", system: "articular", group: "Upper limb", name_en: "Wrist (radiocarpal) joint", name_ar: "مفصل الرسغ",
    features: "Condyloid: distal radius and articular disc with scaphoid, lunate, triquetrum; ulna excluded by TFCC",
    relations: "Flexor retinaculum forms carpal tunnel roof; extensor retinaculum divides 6 dorsal compartments",
    clinical: "Carpal tunnel: 9 tendons + median nerve. De Quervain tenosynovitis: APL and EPB in the first dorsal compartment." },
  { id: "hip_joint", system: "articular", group: "Lower limb", name_en: "Hip joint", name_ar: "مفصل الورك",
    features: "Ball-and-socket; deep acetabulum with labrum; iliofemoral ligament (Y-ligament) is strongest, prevents hyperextension; pubofemoral and ischiofemoral reinforce capsule",
    relations: "Sciatic nerve posterior to joint; femoral vessels anterior",
    clinical: "Posterior dislocation (dashboard injury): leg shortened, adducted, internally rotated, risk to sciatic nerve. Developmental dysplasia of hip: Ortolani and Barlow tests." },
  { id: "knee_joint", system: "articular", group: "Lower limb", name_en: "Knee joint", name_ar: "مفصل الركبة",
    features: "Modified hinge (tibiofemoral) + patellofemoral. ACL (taut in extension) prevents anterior tibial translation; PCL prevents posterior translation; MCL (attached to medial meniscus) and LCL resist valgus/varus",
    relations: "Menisci deepen the plateau (medial C-shaped, less mobile). Popliteus unlocks the knee; bursae: prepatellar, infrapatellar, suprapatellar",
    clinical: "ACL tear: Lachman and anterior drawer tests, pivoting injury with 'pop'. Classic unhappy triad: ACL, MCL, medial meniscus. PCL injury in dashboard impact. 'Housemaid's knee' = prepatellar bursitis." },
  { id: "ankle_joint", system: "articular", group: "Lower limb", name_en: "Ankle joint", name_ar: "مفصل الكاحل",
    features: "Hinge between tibia/fibula mortise and talus; dorsiflexion locks it (talus wider anteriorly). Medial deltoid ligament (strong); lateral: ATFL, CFL, PTFL (weaker)",
    relations: "Distal tibiofibular syndesmosis holds the mortise; tendons pass behind malleoli",
    clinical: "Inversion sprain damages ATFL first. High ankle sprain = syndesmosis. Weber classification for malleolar fractures." },
  { id: "subtalar_foot_joints", system: "articular", group: "Lower limb", name_en: "Subtalar & midtarsal joints", name_ar: "المفصل تحت الكاحلي وعظام منتصف القدم",
    features: "Subtalar (talocalcaneal): inversion/eversion; talocalcaneonavicular and calcaneocuboid form midtarsal joint",
    relations: "Spring (plantar calcaneonavicular) ligament supports talar head",
    clinical: "Talar neck fracture risks avascular necrosis of talar body. Pes planus (flat foot) with tibialis posterior dysfunction." },
  { id: "vertebral_joints", system: "articular", group: "Axial", name_en: "Zygapophyseal & intervertebral joints, ligaments", name_ar: "مفاصل وأربطة الفقرات",
    features: "Facet joints (synovial) guide movement. Anterior longitudinal ligament resists hyperextension; posterior longitudinal resists hyperflexion; ligamentum flavum (elastic), interspinous and supraspinous ligaments",
    relations: "Ligamentum nuchae continues supraspinous ligament in neck",
    clinical: "Lumbar puncture passes skin → supraspinous → interspinous → ligamentum flavum → epidural space → dura → subarachnoid space." },
  { id: "sacroiliac_symphysis", system: "articular", group: "Axial", name_en: "Sacroiliac joint & pubic symphysis", name_ar: "المفصل العجزي الحرقفي والارتفاق العاني",
    features: "SI joint: synovial and fibrous, very strong posterior ligaments, limited motion. Pubic symphysis: secondary cartilaginous joint with fibrocartilage disc",
    relations: "Sacrotuberous and sacrospinous ligaments convert sciatic notches into foramina",
    clinical: "Sacroiliitis in ankylosing spondylitis; symphysis widens in pregnancy (relaxin) and may cause pain." },
];

export const SKELETAL_ARTICULAR_ALL: BoneJointEntry[] = [...SKELETAL_KNOWLEDGE, ...ARTICULAR_KNOWLEDGE];
