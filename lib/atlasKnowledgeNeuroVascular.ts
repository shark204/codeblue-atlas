/**
 * Atlas Knowledge Base — Batch 2: Nervous & Vascular (original wording, concise)
 * File: lib/atlasKnowledgeNeuroVascular.ts
 * Verify against your textbooks before publishing.
 */

export interface KnowledgeEntry {
  id: string;
  system: "nervous" | "cardiovascular";
  group: string;            // e.g. "Cranial nerves", "Brachial plexus", "Arteries"
  name_en: string;
  name_ar: string;
  origin?: string;          // *Origin (exact textbook origin)
  course: string;           // *Course & relations
  branches?: string;        // *Branches (numbered textbook branches 1..N)
  anastomoses?: string;     // *Anastomoses (e.g. Cruciate anastomosis, Anastomosis around elbow/knee)
  supply: string;           // function / structures supplied / drained
  clinical: string;
}

export const NERVOUS_KNOWLEDGE: KnowledgeEntry[] = [
  // ───────── Cranial nerves ─────────
  { id: "cn1", system: "nervous", group: "Cranial nerves", name_en: "CN I Olfactory", name_ar: "العصب الشمي",
    course: "Olfactory bulb → fibres pass through cribriform plate of ethmoid", supply: "Smell (special sensory)",
    clinical: "Anterior cranial fossa fracture can tear fibres: anosmia and CSF rhinorrhoea." },
  { id: "cn2", system: "nervous", group: "Cranial nerves", name_en: "CN II Optic", name_ar: "العصب البصري",
    course: "Retina → optic canal → optic chiasm → tract", supply: "Vision; afferent limb of pupillary light reflex",
    clinical: "Is a CNS tract (covered by meninges): papilloedema in raised ICP; bitemporal hemianopia from pituitary tumour at chiasm." },
  { id: "cn3", system: "nervous", group: "Cranial nerves", name_en: "CN III Oculomotor", name_ar: "العصب المحرك للعين",
    course: "Midbrain → between PCA and SCA → cavernous sinus → superior orbital fissure",
    supply: "Superior, inferior, medial recti, inferior oblique, levator palpebrae; parasympathetic to sphincter pupillae and ciliary muscle (via ciliary ganglion)",
    clinical: "Palsy: eye 'down and out', ptosis, dilated pupil. Posterior communicating aneurysm compresses it (pupil involved early)." },
  { id: "cn4", system: "nervous", group: "Cranial nerves", name_en: "CN IV Trochlear", name_ar: "العصب البكري",
    course: "Exits dorsally from midbrain, longest intracranial course → superior orbital fissure", supply: "Superior oblique",
    clinical: "Only cranial nerve leaving brainstem dorsally; palsy gives vertical diplopia on looking down (e.g. descending stairs)." },
  { id: "cn5", system: "nervous", group: "Cranial nerves", name_en: "CN V Trigeminal", name_ar: "العصب مثلث التوائم",
    course: "Pons → trigeminal ganglion → V1 (superior orbital fissure), V2 (foramen rotundum), V3 (foramen ovale)",
    supply: "Facial sensation; V3 motor to muscles of mastication, mylohyoid, anterior belly of digastric, tensor tympani, tensor veli palatini",
    clinical: "Trigeminal neuralgia: severe lancinating pain, often V2/V3; corneal reflex afferent is V1." },
  { id: "cn6", system: "nervous", group: "Cranial nerves", name_en: "CN VI Abducens", name_ar: "العصب المبعد",
    course: "Pontomedullary junction → long intracranial path, through cavernous sinus → superior orbital fissure", supply: "Lateral rectus",
    clinical: "Palsy: medial squint and horizontal diplopia; classic 'false localising sign' in raised ICP." },
  { id: "cn7", system: "nervous", group: "Cranial nerves", name_en: "CN VII Facial", name_ar: "العصب الوجهي",
    course: "Pons → internal acoustic meatus → facial canal → stylomastoid foramen → parotid gland",
    supply: "Muscles of facial expression, stapedius, posterior digastric; taste anterior 2/3 of tongue; lacrimal, submandibular, sublingual glands",
    clinical: "Bell's palsy (LMN): whole half of face paralysed. UMN lesion spares the forehead. Hyperacusis if stapedius branch affected." },
  { id: "cn8", system: "nervous", group: "Cranial nerves", name_en: "CN VIII Vestibulocochlear", name_ar: "العصب الدهليزي القوقعي",
    course: "Inner ear → internal acoustic meatus → cerebellopontine angle", supply: "Hearing (cochlear) and balance (vestibular)",
    clinical: "Vestibular schwannoma at cerebellopontine angle: unilateral hearing loss, tinnitus, vertigo." },
  { id: "cn9", system: "nervous", group: "Cranial nerves", name_en: "CN IX Glossopharyngeal", name_ar: "العصب اللساني البلعومي",
    course: "Medulla → jugular foramen", supply: "Taste and sensation posterior 1/3 of tongue, oropharynx; stylopharyngeus; parotid secretion (via otic ganglion); carotid sinus and body",
    clinical: "Afferent limb of gag reflex; glossopharyngeal neuralgia causes throat pain on swallowing." },
  { id: "cn10", system: "nervous", group: "Cranial nerves", name_en: "CN X Vagus", name_ar: "العصب الحائر (المبهم)",
    course: "Medulla → jugular foramen → carotid sheath → thorax → oesophageal hiatus (T10)",
    supply: "Motor to pharynx, larynx, soft palate (except tensor veli palatini); parasympathetic to heart, lungs and gut to the splenic flexure",
    clinical: "Left recurrent laryngeal loops under aortic arch (ligamentum arteriosum); injury causes hoarseness. Uvula deviates away from the lesion." },
  { id: "cn11", system: "nervous", group: "Cranial nerves", name_en: "CN XI Accessory", name_ar: "العصب الإضافي",
    course: "Spinal roots C1–C5 ascend through foramen magnum, then exit via jugular foramen", supply: "Sternocleidomastoid and trapezius",
    clinical: "Injured in posterior triangle lymph node biopsy: drooping shoulder, weak shrug." },
  { id: "cn12", system: "nervous", group: "Cranial nerves", name_en: "CN XII Hypoglossal", name_ar: "العصب تحت اللسان",
    course: "Medulla → hypoglossal canal → between internal carotid and IJV → tongue", supply: "All tongue muscles except palatoglossus (CN X)",
    clinical: "Tongue deviates toward the side of the lesion on protrusion." },

  // ───────── Spinal cord & plexuses ─────────
  { id: "spinal_cord", system: "nervous", group: "Spinal cord", name_en: "Spinal cord & meninges", name_ar: "الحبل الشوكي",
    course: "Foramen magnum → conus medullaris at L1–L2 (adults); dural sac ends S2; cauda equina below conus",
    supply: "31 pairs of spinal nerves; cervical and lumbar enlargements supply limbs",
    clinical: "Lumbar puncture at L3–L4 or L4–L5 (below cord, at iliac crest level). Cauda equina syndrome: saddle anaesthesia, retention, bilateral leg weakness." },
  { id: "cervical_plexus", system: "nervous", group: "Plexuses", name_en: "Cervical plexus (C1–C4)", name_ar: "الضفيرة العنقية",
    course: "Deep to sternocleidomastoid; cutaneous branches emerge at its posterior border (Erb's point)",
    supply: "Skin of neck and scalp (lesser occipital, great auricular, transverse cervical, supraclavicular); ansa cervicalis to strap muscles; phrenic nerve (C3–C5)",
    clinical: "Superficial cervical plexus block at Erb's point for carotid endarterectomy and neck surgery." },
  { id: "phrenic", system: "nervous", group: "Plexuses", name_en: "Phrenic nerve (C3–C5)", name_ar: "العصب الحجابي",
    course: "Anterior scalene → between subclavian vein and artery → anterior to lung root (right: lateral to SVC; left: crosses aortic arch)",
    supply: "Motor and sensory to diaphragm; sensory to pericardium and pleura",
    clinical: "'C3, 4, 5 keep the diaphragm alive'; irritation of diaphragm refers pain to shoulder tip." },
  { id: "brachial_plexus", system: "nervous", group: "Plexuses", name_en: "Brachial plexus (C5–T1)", name_ar: "الضفيرة العضدية",
    course: "Roots (between scalenes) → trunks (upper, middle, lower) → divisions → cords (lateral, medial, posterior; named relative to axillary artery) → branches",
    supply: "Shoulder girdle and entire upper limb",
    clinical: "Erb–Duchenne palsy (C5–C6): 'waiter's tip'. Klumpke palsy (C8–T1): claw hand, Horner syndrome possible." },
  { id: "axillary_nerve", system: "nervous", group: "Upper limb nerves", name_en: "Axillary nerve (C5–C6)", name_ar: "العصب الإبطي",
    course: "Posterior cord → quadrangular space → around surgical neck of humerus", supply: "Deltoid, teres minor; skin over lower deltoid",
    clinical: "Injured in shoulder dislocation or surgical-neck fracture." },
  { id: "radial_nerve", system: "nervous", group: "Upper limb nerves", name_en: "Radial nerve (C5–T1)", name_ar: "العصب الكعبري",
    course: "Posterior cord → radial groove of humerus → lateral epicondyle region → superficial (sensory) and deep/PIN (motor) branches",
    supply: "All extensors of arm and forearm; skin of posterior arm, forearm and dorsolateral hand",
    clinical: "Humeral shaft fracture: wrist drop and loss of anatomical snuffbox sensation. 'Saturday night palsy' from compression." },
  { id: "musculocutaneous_nerve", system: "nervous", group: "Upper limb nerves", name_en: "Musculocutaneous nerve (C5–C7)", name_ar: "العصب العضلي الجلدي",
    course: "Lateral cord → pierces coracobrachialis → between biceps and brachialis → lateral antebrachial cutaneous", supply: "Coracobrachialis, biceps, brachialis; lateral forearm skin",
    clinical: "Injury weakens elbow flexion and supination; loss of biceps reflex." },
  { id: "median_nerve", system: "nervous", group: "Upper limb nerves", name_en: "Median nerve (C6–T1)", name_ar: "العصب المتوسط",
    course: "Lateral and medial cords → arm (with brachial artery) → cubital fossa → between heads of pronator teres → carpal tunnel",
    supply: "Most forearm flexors, thenar muscles, lateral 2 lumbricals; skin of lateral 3½ digits palmar side",
    clinical: "Carpal tunnel syndrome: night paraesthesia, thenar wasting. High lesion: 'hand of benediction'." },
  { id: "ulnar_nerve", system: "nervous", group: "Upper limb nerves", name_en: "Ulnar nerve (C8–T1)", name_ar: "العصب الزندي",
    course: "Medial cord → behind medial epicondyle → between FCU heads → Guyon's canal", supply: "Intrinsic hand muscles (except thenar and lateral 2 lumbricals), FCU, medial half FDP; skin of medial 1½ digits",
    clinical: "'Funny bone' injury; claw hand and Froment's sign. Guyon's canal compression spares dorsal hand sensation." },
  { id: "lumbar_plexus", system: "nervous", group: "Plexuses", name_en: "Lumbar plexus (L1–L4)", name_ar: "الضفيرة القطنية",
    course: "Within psoas major; branches: iliohypogastric, ilioinguinal, genitofemoral, lateral femoral cutaneous, femoral, obturator",
    supply: "Lower abdominal wall, anterior and medial thigh",
    clinical: "Lateral femoral cutaneous entrapment under inguinal ligament: meralgia paraesthetica." },
  { id: "femoral_nerve", system: "nervous", group: "Lower limb nerves", name_en: "Femoral nerve (L2–L4)", name_ar: "العصب الفخذي",
    course: "Lateral border of psoas → under inguinal ligament lateral to femoral artery (NAVEL)", supply: "Anterior thigh muscles; skin of anterior thigh and medial leg (saphenous nerve)",
    clinical: "Loss of knee extension and patellar reflex." },
  { id: "obturator_nerve", system: "nervous", group: "Lower limb nerves", name_en: "Obturator nerve (L2–L4)", name_ar: "العصب السدادي",
    course: "Medial border of psoas → obturator canal", supply: "Adductor compartment; skin of medial thigh",
    clinical: "Pelvic surgery or hernia can injure it: weakened adduction; ovarian pain may refer to medial thigh." },
  { id: "sciatic_nerve", system: "nervous", group: "Lower limb nerves", name_en: "Sciatic nerve (L4–S3)", name_ar: "العصب الوركي",
    course: "Greater sciatic foramen below piriformis → deep to gluteus maximus → posterior thigh → splits into tibial and common fibular at popliteal fossa",
    supply: "Hamstrings and adductor magnus (hamstring part), all muscles below knee",
    clinical: "Posterior hip dislocation may injure it; safe IM injection in upper outer gluteal quadrant avoids it." },
  { id: "tibial_nerve", system: "nervous", group: "Lower limb nerves", name_en: "Tibial nerve (L4–S3)", name_ar: "العصب الظنبوبي",
    course: "Popliteal fossa → posterior compartment → behind medial malleolus (tarsal tunnel) → medial and lateral plantar nerves",
    supply: "Posterior leg muscles, sole of foot",
    clinical: "Injury: loss of plantarflexion and sole sensation; tarsal tunnel syndrome." },
  { id: "common_fibular_nerve", system: "nervous", group: "Lower limb nerves", name_en: "Common fibular nerve (L4–S2)", name_ar: "العصب الشظوي المشترك",
    course: "Popliteal fossa → winds around fibular neck → superficial and deep fibular nerves", supply: "Lateral and anterior leg compartments, dorsum of foot",
    clinical: "Most commonly injured lower limb nerve (fibular neck fracture, tight cast): foot drop with high-stepping gait." },
  { id: "pudendal_nerve", system: "nervous", group: "Lower limb nerves", name_en: "Pudendal nerve (S2–S4)", name_ar: "العصب الفرجي",
    course: "Exits greater sciatic foramen → around ischial spine → lesser sciatic foramen → pudendal (Alcock's) canal", supply: "Perineal muscles, external anal and urethral sphincters, perineal skin",
    clinical: "Pudendal block at the ischial spine in childbirth." },
  { id: "v1_ophthalmic", system: "nervous", group: "Cranial nerves", name_en: "Ophthalmic nerve (CN V1)", name_ar: "العصب العيني (الفرع الأول للعصب الخامس V1)",
    course: "Trigeminal ganglion → lateral wall of cavernous sinus → superior orbital fissure (divides into lacrimal, frontal, and nasociliary nerves)",
    supply: "General sensation to eyeball/cornea (afferent limb of corneal reflex), upper eyelid, forehead, scalp to vertex, frontal/ethmoidal/sphenoidal sinuses, and dorsum/tip of nose",
    clinical: "Herpes zoster ophthalmicus: Hutchinson's sign (vesicles on tip of nose — external nasal branch of nasociliary nerve) predicts Sight-threatening corneal involvement." },
  { id: "v2_maxillary", system: "nervous", group: "Cranial nerves", name_en: "Maxillary nerve (CN V2)", name_ar: "العصب الفكي العلوي (الفرع الثاني للعصب الخامس V2)",
    course: "Trigeminal ganglion → lower lateral wall of cavernous sinus → foramen rotundum → pterygopalatine fossa → inferior orbital fissure (as infraorbital nerve) → infraorbital foramen",
    supply: "General sensation to midface, lower eyelid, cheek, upper lip, maxillary teeth and gingiva, nasal cavity, hard & soft palate, and maxillary sinus",
    clinical: "Fracture of orbital floor ('blowout fracture') injures infraorbital nerve causing anaesthesia of cheek, upper lip, and maxillary teeth." },
  { id: "v3_mandibular", system: "nervous", group: "Cranial nerves", name_en: "Mandibular nerve (CN V3) — Inferior alveolar, Lingual & Buccal", name_ar: "العصب الفكي السفلي وفروعه (V3 — السنخي السفلي واللساني والشدقي)",
    course: "Trigeminal ganglion + motor root → foramen ovale → infratemporal fossa; divides into anterior (motor + buccal) and posterior (auriculotemporal, lingual, inferior alveolar → mental) divisions",
    supply: "Sensory to lower face, lower lip/chin (mental), anterior 2/3 tongue general sensation (lingual), mandibular teeth (inferior alveolar); Motor to muscles of mastication, mylohyoid, anterior digastric, tensor veli palatini, tensor tympani",
    clinical: "Lingual nerve lies directly against the medial aspect of the mandibular 3rd molar root (vulnerable during wisdom tooth extraction); inferior alveolar nerve block is given at the mandibular foramen (lingula)." },
  { id: "chorda_tympani", system: "nervous", group: "Cranial nerves", name_en: "Chorda tympani (Branch of Facial nerve CN VII)", name_ar: "عصب حبل الطبل (Chorda tympani)",
    course: "Branches from facial nerve (CN VII) in facial canal → crosses medial surface of tympanic membrane between malleus and incus → exits skull via petrotympanic fissure → joins lingual nerve (CN V3) in infratemporal fossa",
    supply: "Special visceral afferent (taste) to anterior two-thirds of tongue; preganglionic parasympathetic secretomotor fibres to submandibular and sublingual salivary glands (via submandibular ganglion)",
    clinical: "Middle ear surgery or tympanic membrane perforation can injure chorda tympani, causing ipsilateral loss of taste on the anterior 2/3 of the tongue and reduced submandibular salivation." },
  { id: "dorsal_scapular_nerve", system: "nervous", group: "Upper limb nerves", name_en: "Dorsal scapular nerve (C5)", name_ar: "العصب الكتفي الظهري",
    course: "Arises directly from C5 root of brachial plexus → pierces middle scalene → descends deep to levator scapulae and rhomboids along vertebral border of scapula",
    supply: "Motor to rhomboid major, rhomboid minor, and levator scapulae (retracts and elevates scapula)",
    clinical: "Injury causes lateral displacement of the vertebral border of the scapula on the affected side." },
  { id: "long_thoracic_nerve", system: "nervous", group: "Upper limb nerves", name_en: "Long thoracic nerve (C5–C7)", name_ar: "العصب الصدري الطويل (عصب بيل)",
    course: "Arises directly from C5, C6, C7 roots → descends posterior to brachial plexus and axillary vessels → runs on the superficial (lateral) surface of serratus anterior along mid-axillary line",
    supply: "Motor to serratus anterior muscle (protracts scapula and rotates glenoid cavity superiorly for overhead abduction > 90°)",
    clinical: "Vulnerable during axillary lymph node clearance or chest tube insertion; injury causes medial winging of the scapula and inability to abduct arm above 90°." },
  { id: "suprascapular_nerve", system: "nervous", group: "Upper limb nerves", name_en: "Suprascapular nerve (C5–C6)", name_ar: "العصب فوق الكتفي",
    course: "Upper trunk of brachial plexus → passes through suprascapular notch UNDER superior transverse scapular ligament ('Army over Navy') → supraspinous fossa → spinoglenoid notch → infraspinous fossa",
    supply: "Motor to supraspinatus (initiates first 15° abduction) and infraspinatus (external rotation of shoulder); sensory to glenohumeral and acromioclavicular joints",
    clinical: "Entrapment at the suprascapular notch weakens both abduction initiation and external rotation; entrapment at spinoglenoid notch (ganglion cyst) isolates infraspinatus." },
  { id: "pectoral_nerves", system: "nervous", group: "Upper limb nerves", name_en: "Lateral & Medial pectoral nerves (C5–T1)", name_ar: "العصبان الصدريان الوحشي والإنسي",
    course: "Lateral pectoral nerve (C5–C7, from lateral cord) pierces clavipectoral fascia; Medial pectoral nerve (C8–T1, from medial cord) pierces pectoralis minor to reach pectoralis major",
    supply: "Lateral pectoral supplies clavicular and sternocostal heads of pectoralis major; Medial pectoral supplies pectoralis minor and sternocostal part of pectoralis major",
    clinical: "Linked across the axillary artery by the ansa pectoralis; preserve during modified radical mastectomy to prevent pectoral atrophy." },
  { id: "subscapular_thoracodorsal_nerves", system: "nervous", group: "Upper limb nerves", name_en: "Upper/Lower Subscapular & Thoracodorsal nerves (C5–C8)", name_ar: "الأعصاب تحت الكتفية والعصب الصدري الظهري",
    course: "Branches of the posterior cord of the brachial plexus descending on the posterior axillary wall; thoracodorsal nerve accompanies subscapular/thoracodorsal vessels",
    supply: "Upper & lower subscapular supply subscapularis and teres major; Thoracodorsal nerve (C6–C8) supplies latissimus dorsi",
    clinical: "Thoracodorsal nerve must be identified and preserved along the posterior axillary wall during axillary dissection (latissimus dorsi is crucial for breast reconstruction flaps)." },
  { id: "posterior_interosseous_nerve", system: "nervous", group: "Upper limb nerves", name_en: "Deep branch of radial nerve & Posterior interosseous nerve (PIN)", name_ar: "الفرع العميق للعصب الكعبري والعصب الخلفي بين العظمين (PIN)",
    course: "Branches from radial nerve at lateral epicondyle → pierces supinator through Arcade of Frohse → winds around neck of radius → descends on posterior interosseous membrane",
    supply: "Purely motor to posterior forearm extensors (ED, EDM, ECU, supinator, APL, EPL, EPB, EI — spares brachioradialis and ECRL)",
    clinical: "Injured in proximal radial head/neck fractures or Monteggia fracture-dislocation: causes finger drop (inability to extend MCP joints) without wrist drop (ECRL intact) and NO sensory loss." },
  { id: "anterior_interosseous_nerve", system: "nervous", group: "Upper limb nerves", name_en: "Anterior interosseous nerve (AIN)", name_ar: "العصب الأمامي بين العظمين (AIN)",
    course: "Branches from median nerve just distal to pronator teres in proximal forearm → descends on anterior surface of interosseous membrane between FPL and FDP",
    supply: "Purely motor to flexor pollicis longus (FPL), lateral half of flexor digitorum profundus (index & middle DIP flexion), and pronator quadratus",
    clinical: "Kiloh–Nevin (AIN) syndrome: inability to make the 'OK' sign (loss of thumb IP and index DIP flexion) with intact sensation." },
  { id: "iliohypogastric_ilioinguinal_genitofemoral", system: "nervous", group: "Lower limb nerves", name_en: "Iliohypogastric (L1), Ilio-inguinal (L1) & Genitofemoral (L1–L2) nerves", name_ar: "العصب الحرقفي الخثلي والحرقفي الإربي والتناسلي الفخذي",
    course: "Iliohypogastric & ilio-inguinal emerge lateral to psoas across quadratus lumborum (ilio-inguinal traverses inguinal canal with spermatic cord); Genitofemoral pierces anterior surface of psoas major",
    supply: "Internal oblique & transversus abdominis; skin of suprapubic region, root of penis/mons pubis, anterior scrotum/labia majora, and upper femoral triangle; Genitofemoral supplies cremaster muscle (cremasteric reflex L1–L2)",
    clinical: "Ilio-inguinal nerve is at high risk of entrapment in mesh during open inguinal hernia repair; genitofemoral mediates the cremasteric reflex." },
  { id: "saphenous_sural_nerves", system: "nervous", group: "Lower limb nerves", name_en: "Saphenous nerve (L3–L4) & Sural nerve (S1–S2)", name_ar: "العصب الصافن والعصب الربلي (Sural)",
    course: "Saphenous nerve (terminal sensory branch of femoral nerve) traverses adductor canal and accompanies great saphenous vein anterior to medial malleolus; Sural nerve (formed by tibial + common fibular branches) accompanies small saphenous vein posterior to lateral malleolus",
    supply: "Saphenous supplies skin of medial knee (infrapatellar branch), medial leg, and medial border of foot to 1st MTP joint; Sural supplies posterolateral leg and lateral border of foot",
    clinical: "Saphenous nerve is vulnerable during great saphenous vein harvesting; Sural nerve is the gold-standard donor nerve for peripheral nerve cable grafting." },
  { id: "gluteal_nerves", system: "nervous", group: "Lower limb nerves", name_en: "Superior gluteal (L4–S1) & Inferior gluteal (L5–S2) nerves", name_ar: "العصبان الألويان العلوي والسفلي",
    course: "Superior gluteal exits pelvis via greater sciatic foramen ABOVE piriformis (runs between gluteus medius and minimus); Inferior gluteal exits BELOW piriformis superficial to sciatic nerve",
    supply: "Superior gluteal supplies gluteus medius, gluteus minimus, and tensor fasciae latae (pelvic abductors); Inferior gluteal supplies gluteus maximus (powerful hip extensor)",
    clinical: "Superior gluteal nerve injury causes a positive Trendelenburg sign (pelvis drops on the contralateral unsupported side during single-leg stance)." },
  { id: "deep_superficial_fibular_plantar", system: "nervous", group: "Lower limb nerves", name_en: "Deep fibular, Superficial fibular & Medial/Lateral plantar nerves", name_ar: "العصب الشظوي العميق والسطحي والعصبان الأخمصيان الإنسي والوحشي",
    course: "Deep fibular descends with anterior tibial artery (anterior compartment); Superficial fibular descends in lateral compartment; Medial & Lateral plantar nerves arise from tibial nerve deep to flexor retinaculum (tarsal tunnel)",
    supply: "Deep fibular: dorsiflexors (TA, EHL, EDL) + 1st dorsal webspace skin; Superficial fibular: evertors (fibularis longus/brevis) + dorsum of foot; Medial plantar (like median nerve) & Lateral plantar (like ulnar nerve) supply intrinsic foot muscles & sole",
    clinical: "Anterior compartment syndrome compresses deep fibular nerve causing loss of sensation in the 1st webspace between great and 2nd toes." },
  { id: "intercostal_nerves", system: "nervous", group: "Plexuses", name_en: "Intercostal nerves (Anterior rami of T1–T11) & Subcostal nerve (T12)", name_ar: "الأعصاب الوربية (T1–T11) والعصب تحت الضلعي (T12)",
    course: "Run in the costal groove along the inferior border of each rib between internal and innermost intercostal muscles (below vein and artery: VAN from superior to inferior)",
    supply: "Motor to intercostal, subcostal, transversus thoracis, and anterolateral abdominal wall muscles; segmental dermatomal sensation (T4 nipple, T6 xiphoid, T10 umbilicus, T12 suprapubic)",
    clinical: "Insert chest tubes and thoracentesis needles immediately ABOVE the superior border of the lower rib to avoid the neurovascular bundle (VAN) in the costal groove." },
  { id: "autonomic_nervous_system", system: "nervous", group: "Autonomic", name_en: "Autonomic nervous system", name_ar: "الجهاز العصبي الذاتي",
    course: "Sympathetic: thoracolumbar T1–L2 outflow; parasympathetic: craniosacral (CN III, VII, IX, X and S2–S4)", supply: "Smooth muscle, cardiac muscle, glands",
    clinical: "Horner syndrome (ptosis, miosis, anhidrosis) from sympathetic chain interruption, e.g. Pancoast tumour." },
];

export const VASCULAR_KNOWLEDGE: KnowledgeEntry[] = [
  // ───────── Upper Limb & Shoulder/Elbow Anastomoses (Textbook High-Yield) ─────────
  {
    id: "profunda_brachii",
    system: "cardiovascular",
    group: "Upper Limb Arteries — Arm & Spiral Groove",
    name_en: "Profunda brachii (Profundo brachii / Deep brachial) artery",
    name_ar: "الشريان العضدي العميق (Profunda / Profundo brachii Artery)",
    origin:
      "Largest & highest branch of the brachial artery, arising from its posteromedial aspect near its beginning (just inferior to the lower border of teres major).",
    course:
      "Accompanied by the radial nerve (C5–T1), it passes backwards through the lower triangular space (triangular interval — bounded by teres major above, long head of triceps medially, and humerus shaft laterally), reaching the spiral (radial) groove on the posterior aspect of the humerus where it passes obliquely between the lateral and medial heads of triceps brachii before dividing into its two terminal descending branches.",
    branches:
      "1- Muscular branches: Supply all three heads of triceps brachii (long, lateral & medial heads) • 2- Nutrient artery to humerus: Enters the nutrient canal of the humerus near the deltoid tuberosity • 3- Ascending (Deltoid) branch: Ascends between the lateral and long heads of triceps to anastomose with the descending branch of the posterior circumflex humeral artery on the back of the surgical neck of the humerus (Cruciate anastomosis) • 4- Anterior descending terminal branch (Radial collateral artery — من قدام): Pierces the lateral intermuscular septum with the radial nerve, descending in front of the lateral epicondyle (between brachialis and brachioradialis) to anastomose with the radial recurrent artery (Anastomosis around elbow) • 5- Posterior descending terminal branch (Middle collateral artery — من ورا): Descends inside the medial head of triceps to reach the back of the lateral epicondyle, anastomosing with the posterior interosseous recurrent artery (Anastomosis around elbow).",
    anastomoses:
      "• Cruciate Anastomosis (Back of Surgical Neck of Humerus): Ascending branch of Profunda brachii ↔ Descending branch of Posterior Circumflex Humeral A. • Front of Lateral Epicondyle (Elbow): 4- Ant. descending terminal (Radial collateral A.) ↔ Radial recurrent A. (from Radial A.) • Back of Lateral Epicondyle (Elbow): 5- Post. descending terminal (Middle collateral A.) ↔ Posterior interosseous recurrent A. (from Post. interosseous A.).",
    supply:
      "Posterior compartment of the arm (all 3 heads of triceps brachii), humeral diaphysis (nutrient artery), surgical neck collateral network (cruciate anastomosis), and lateral elbow arterial anastomosis.",
    clinical:
      "Mid-shaft fracture of the humerus at the spiral groove injures the Profunda brachii artery and Radial nerve simultaneously (causing hematoma + wrist drop while sparing triceps fibers arising proximal to the groove). Its 3-Ascending branch (cruciate anastomosis) maintains collateral flow if the axillary/brachial junction is ligated, and its 4-Radial collateral & 5-Middle collateral terminal branches bypass distal brachial occlusion around the elbow.",
  },
  {
    id: "radial_collateral_artery",
    system: "cardiovascular",
    group: "Upper Limb Arteries — Profunda brachii Terminal Branch (4)",
    name_en: "Radial collateral artery (4- Ant. descending terminal of Profunda brachii)",
    name_ar: "الشريان الرديف الكعبري (الفرع الأمامي النازل للشريان العضدي العميق — من قدام)",
    origin:
      "Anterior descending terminal branch (#4) of the profunda brachii (profundo brachii) artery at the lower end of the spiral groove.",
    course:
      "Pierces the lateral intermuscular septum accompanied by the radial nerve to enter the anterior compartment of the arm, descending between brachialis (medially) and brachioradialis / extensor carpi radialis longus (laterally) in front of the lateral epicondyle of the humerus.",
    branches:
      "1- Muscular twigs to brachialis, brachioradialis, and extensor carpi radialis longus • 2- Cutaneous perforators to the lateral arm (pedicle of the lateral arm free flap) • 3- Terminal anastomotic trunk in front of the lateral epicondyle.",
    anastomoses:
      "Anastomoses directly in front of the lateral epicondyle of the humerus with the Radial recurrent artery (branch of the radial artery) as part of the arterial anastomosis around the elbow joint.",
    supply:
      "Lateral intermuscular septum, brachioradialis, brachialis, radial nerve vasa nervorum, and anterior aspect of the lateral epicondyle of the elbow.",
    clinical:
      "Forms the anterior limb of the lateral elbow collateral pathway and serves as the vascular pedicle for the fasciocutaneous lateral arm flap.",
  },
  {
    id: "middle_collateral_artery",
    system: "cardiovascular",
    group: "Upper Limb Arteries — Profunda brachii Terminal Branch (5)",
    name_en: "Middle collateral artery (5- Post. descending terminal of Profunda brachii)",
    name_ar: "الشريان الرديف الأوسط (الفرع الخلفي النازل للشريان العضدي العميق — من ورا)",
    origin:
      "Larger posterior descending terminal branch (#5) of the profunda brachii (profundo brachii) artery at the distal spiral groove.",
    course:
      "Descends vertically within the substance of the medial head of triceps brachii along the posterior humerus to reach the back of the lateral epicondyle and olecranon fossa.",
    branches:
      "1- Deep muscular branches to the medial head of triceps and anconeus • 2- Articular twigs to the posterior elbow joint capsule • 3- Terminal anastomotic branch behind the lateral epicondyle.",
    anastomoses:
      "Anastomoses behind the lateral epicondyle of the humerus with the Posterior interosseous recurrent artery (recurrent interosseous A.) and the transverse posterior branch of the inferior ulnar collateral artery (rete olecrani / anastomosis around elbow).",
    supply:
      "Medial head of triceps brachii, anconeus, and posterior lateral aspect of the elbow joint.",
    clinical:
      "Crucial posterior collateral channel around the lateral epicondyle during supracondylar humeral fractures or brachial artery catheterization.",
  },
  {
    id: "brachial_artery",
    system: "cardiovascular",
    group: "Upper Limb Arteries — Arm",
    name_en: "Brachial artery",
    name_ar: "الشريان العضدي (Brachial Artery)",
    origin:
      "Direct continuation of the 3rd part of the axillary artery at the lower border of the teres major muscle.",
    course:
      "Begins on the medial side of the upper arm (medial to humerus and coracobrachialis), spirals gradually to lie anterior to the humerus between biceps brachii and brachialis (crossed anteriorly at mid-arm by the median nerve from lateral to medial), and enters the cubital fossa medial to the biceps tendon (beneath the bicipital aponeurosis) to bifurcate at the neck of the radius into the radial and ulnar arteries.",
    branches:
      "1- Profunda brachii (Profundo brachii) artery: Largest & highest posteromedial branch entering the spiral groove with the radial nerve • 2- Nutrient artery to the humerus • 3- Superior ulnar collateral artery: Accompanies the ulnar nerve piercing the medial intermuscular septum to pass behind the medial epicondyle • 4- Inferior ulnar collateral (supratrochlear) artery: Arises 5 cm above the elbow and divides into anterior and posterior branches around the medial epicondyle • 5- Muscular branches: To coracobrachialis, biceps brachii, and brachialis • 6- Terminal branches: Radial artery and Ulnar artery at the neck of the radius.",
    anastomoses:
      "Rich 4-quadrant Anastomosis Around the Elbow linking Brachial & Profunda brachii above with Radial, Ulnar & Interosseous recurrent arteries below.",
    supply:
      "Anterior and posterior compartments of the arm, elbow joint, and entire forearm and hand via radial and ulnar arteries.",
    clinical:
      "Brachial pulse is palpated in the cubital fossa medial to the biceps tendon (used for blood pressure auscultation). Supracondylar fracture of the humerus can lacerate or spasm the brachial artery, causing acute forearm ischemia and Volkmann ischemic contracture.",
  },
  {
    id: "elbow_anastomosis_collaterals",
    system: "cardiovascular",
    group: "Upper Limb Arteries — Anastomosis Around Elbow",
    name_en: "Anastomosis around the elbow (Collateral & Recurrent arteries)",
    name_ar: "المفاغرة الشريانية حول مفصل المرفق (Anastomosis Around Elbow)",
    origin:
      "Collateral descending branches from the Brachial & Profunda brachii arteries above anastomosing with ascending Recurrent branches from the Radial, Ulnar & Posterior Interosseous arteries below.",
    course:
      "Organized into 4 surgical quadrants around the Medial and Lateral Epicondyles of the humerus (Front & Back of each epicondyle).",
    branches:
      "1- Front of Lateral Epicondyle: Ant. descending branch of Profunda brachii (Radial collateral A.) ↔ Radial recurrent A. (from Radial A.) • 2- Back of Lateral Epicondyle: Post. descending branch of Profunda brachii (Middle collateral A.) ↔ Posterior interosseous recurrent A. (from Post. interosseous A.) • 3- Front of Medial Epicondyle: Anterior branch of Inferior ulnar collateral A. (from Brachial A.) ↔ Anterior ulnar recurrent A. (from Ulnar A.) • 4- Back of Medial Epicondyle: Superior ulnar collateral A. (with Ulnar N.) + Posterior branch of Inferior ulnar collateral A. ↔ Posterior ulnar recurrent A. (from Ulnar A.).",
    anastomoses:
      "Complete 4-pillar peri-articular collateral ring around the elbow allowing distal forearm perfusion if the brachial artery is occluded distal to the origin of Profunda brachii.",
    supply:
      "Elbow joint capsule, medial & lateral epicondylar origins of forearm flexors and extensors, ulnar nerve (via superior ulnar collateral), and radial nerve (via radial collateral).",
    clinical:
      "Ligation of the brachial artery distal to the origin of Profunda brachii is well tolerated because blood bypasses the elbow via the 4-epicondylar collateral anastomoses.",
  },
  {
    id: "subclavian_axillary_brachial",
    system: "cardiovascular",
    group: "Upper Limb Arteries — Subclavian & Axillary",
    name_en: "Subclavian & Axillary arteries (and Scapular / Cruciate Anastomoses)",
    name_ar: "الشريان تحت الترقوة والشريان الإبطي وفروعهما",
    origin:
      "Subclavian arises from Brachiocephalic trunk (right) or Aortic arch (left) and becomes the Axillary artery at the outer border of the 1st rib; Axillary becomes the Brachial artery at the lower border of teres major.",
    course:
      "Subclavian is divided into 3 parts by Scalenus Anterior; Axillary is divided into 3 parts by Pectoralis Minor (1st part = 1 branch, 2nd part = 2 branches, 3rd part = 3 branches).",
    branches:
      "Subclavian branches (VIT C & D): 1- Vertebral A., 2- Internal thoracic A., 3- Thyrocervical trunk (Inferior thyroid, Suprascapular, Transverse cervical), 4- Costocervical trunk, 5- Dorsal scapular A. • Axillary 1st Part: 1- Superior thoracic A. • Axillary 2nd Part: 2- Thoracoacromial A. (Clavicular, Acromial, Deltoid, Pectoral branches), 3- Lateral thoracic A. (runs with Long thoracic nerve) • Axillary 3rd Part: 4- Subscapular A. (largest branch → Circumflex scapular A. in upper triangular space & Thoracodorsal A. with thoracodorsal nerve), 5- Anterior circumflex humeral A., 6- Posterior circumflex humeral A. (passes through quadrangular space with Axillary nerve).",
    anastomoses:
      "• Scapular Anastomosis (around Scapula): Suprascapular A. + Dorsal scapular A. (from Subclavian) ↔ Circumflex scapular A. (from 3rd part of Axillary) • Cruciate Anastomosis of Surgical Neck of Humerus: Descending branch of Posterior circumflex humeral A. ↔ 3- Ascending branch of Profunda brachii + Ascending branch of Anterior circumflex humeral A. + Acromial branch of Thoracoacromial A.",
    supply:
      "Thoracic wall, mammary gland, pectoral girdle, shoulder joint, rotator cuff, and entire upper limb.",
    clinical:
      "Surgical neck fracture of the humerus jeopardizes the Posterior circumflex humeral artery and Axillary nerve in the quadrangular space.",
  },
  {
    id: "radial_ulnar_arteries",
    system: "cardiovascular",
    group: "Upper Limb Arteries — Forearm",
    name_en: "Radial, Ulnar & Interosseous arteries",
    name_ar: "الشريان الكعبري والشريان الزندي والشرايين بين العظمين",
    origin:
      "Terminal bifurcation of the brachial artery in the cubital fossa at the level of the neck of the radius.",
    course:
      "Radial artery descends laterally under brachioradialis, passes through the floor of the anatomical snuffbox (over scaphoid & trapezium), and pierces the 1st dorsal interosseous to form the deep palmar arch. Ulnar artery passes deep to pronator teres and FDS, descends with the ulnar nerve medial to FCU, crosses superficial to the flexor retinaculum in Guyon's canal, and forms the superficial palmar arch.",
    branches:
      "Radial branches: 1- Radial recurrent A. (anastomoses with Radial collateral of Profunda brachii in front of lateral epicondyle), 2- Muscular & Palmar/Dorsal carpal branches, 3- Superficial palmar branch, 4- Princeps pollicis & Radialis indicis, 5- Deep palmar arch • Ulnar branches: 1- Anterior & Posterior ulnar recurrent arteries (anastomose around medial epicondyle), 2- Common interosseous artery → Anterior interosseous A. (with AIN on interosseous membrane) & Posterior interosseous A. (gives Posterior interosseous recurrent A. behind lateral epicondyle), 3- Palmar & Dorsal carpal branches, 4- Deep palmar branch, 5- Superficial palmar arch.",
    anastomoses:
      "Proximal elbow anastomosis, anterior/posterior carpal arches at the wrist, and superficial/deep palmar arches in the hand.",
    supply:
      "Anterior flexor-pronator and posterior extensor-supinator compartments of the forearm, wrist joint, and hand.",
    clinical:
      "Perform the modified Allen test before radial arterial cannulation or CABG radial graft harvest to confirm patent collateral perfusion via the ulnar artery and palmar arches.",
  },
  {
    id: "hand_arches",
    system: "cardiovascular",
    group: "Upper Limb Arteries — Hand",
    name_en: "Superficial & Deep Palmar Arches",
    name_ar: "القوسان الشريانيان الراحيان السطحي والعميق",
    origin:
      "Superficial palmar arch is the direct continuation of the Ulnar artery (completed laterally by superficial palmar branch of Radial A.); Deep palmar arch is the direct continuation of the Radial artery (completed medially by deep branch of Ulnar A.).",
    course:
      "Superficial arch lies deep to the palmar aponeurosis at the level of the distal border of the fully extended thumb (Kaplan's cardinal line); Deep arch lies 1.5 cm proximal on the bases of the metacarpals and interossei alongside the deep branch of the ulnar nerve.",
    branches:
      "1- Three Common palmar digital arteries (from Superficial arch) → Proper palmar digital arteries • 2- Three Palmar metacarpal arteries & Perforating branches (from Deep arch) • 3- Princeps pollicis & Radialis indicis arteries (from Radial A.).",
    anastomoses:
      "Palmar metacarpal arteries from the deep arch join the common palmar digital arteries of the superficial arch and communicate with the dorsal carpal network via perforating branches.",
    supply: "Palm, thenar & hypothenar muscles, lumbricals, interossei, and digits 1–5.",
    clinical:
      "Lacerations of the palm bleed profusely from both ends of the palmar arches; Allen test verifies arch continuity.",
  },

  // ───────── Lower Limb Arteries (Femoral, Profunda femoris, Popliteal, Tibial) ─────────
  {
    id: "profunda_femoris",
    system: "cardiovascular",
    group: "Lower Limb Arteries — Thigh",
    name_en: "Profunda femoris (Profundo femoris / Deep femoral) artery",
    name_ar: "الشريان الفخذي العميق (Profunda femoris Artery)",
    origin:
      "Largest branch of the femoral artery, arising from its posterolateral aspect in the femoral triangle ~3.5–4 cm inferior to the inguinal ligament.",
    course:
      "Spirals posteromedially behind the femoral artery and vein on the floor of the femoral triangle (pectineus and adductor brevis), then descends between adductor longus (anteriorly) and adductor brevis/magnus (posteriorly), terminating as the 4th perforating artery.",
    branches:
      "1- Lateral circumflex femoral artery: Divides into Ascending (to spinous anastomosis), Transverse, and Descending (to vastus lateralis & knee anastomosis) branches • 2- Medial circumflex femoral artery: Main blood supply to the femoral head & neck (via retinacular branches); passes between iliopsoas and pectineus • 3- Three Perforating arteries (1st, 2nd, 3rd) & terminal 4th Perforating artery: Pierce adductor magnus close to the linea aspera to supply the hamstrings and vastus lateralis • 4- Muscular branches to adductor & quadriceps compartments.",
    anastomoses:
      "• Cruciate Anastomosis of the Thigh (at Lesser Trochanter): Transverse branch of Medial circumflex femoral A. (medially) + Transverse branch of Lateral circumflex femoral A. (laterally) + Inferior gluteal A. descending branch (above) + Ascending branch of 1st Perforating A. (below) • Trochanteric Anastomosis (at Greater Trochanter): Supplies the femoral head.",
    supply:
      "Femoral head and neck, hip joint, and all three muscular compartments of the thigh (anterior, medial adductor, and posterior hamstring).",
    clinical:
      "Displaced intracapsular femoral neck fracture tears the retinacular branches of the Medial circumflex femoral artery, causing avascular necrosis (AVN) of the femoral head.",
  },
  {
    id: "iliac_femoral",
    system: "cardiovascular",
    group: "Lower Limb Arteries — Iliac, Femoral, Popliteal & Tibial",
    name_en: "Iliac → Femoral → Popliteal → Tibial & Dorsalis Pedis arteries",
    name_ar: "الشرايين الحرقفية والفخذية والمأبضية والظنبوبية",
    origin:
      "External iliac artery becomes the Femoral artery behind the inguinal ligament at the mid-inguinal point (halfway between ASIS and pubic symphysis); Femoral becomes Popliteal at the adductor hiatus.",
    course:
      "Femoral artery descends through the femoral triangle (NAVEL: lateral to femoral vein, medial to femoral nerve) and adductor (Hunter's) canal, traverses the adductor hiatus in adductor magnus to become the Popliteal artery (deepest structure in the popliteal fossa), which divides at the lower border of popliteus into the Anterior and Posterior tibial arteries.",
    branches:
      "1- Superficial epigastric, Superficial circumflex iliac, Superficial & Deep external pudendal • 2- Profunda femoris (Deep femoral) artery • 3- Descending genicular artery • 4- Popliteal branches: Superior, Middle & Inferior genicular arteries + Sural arteries • 5- Anterior tibial artery → Dorsalis pedis artery (between EHL and EDL tendons) → Deep plantar artery • 6- Posterior tibial artery (gives Fibular / Peroneal artery) → runs behind medial malleolus (Tom, Dick And Very Nervous Harry) → Medial & Lateral plantar arteries.",
    anastomoses:
      "Genicular Anastomosis around the Knee (5 genicular arteries + descending branch of lateral circumflex femoral + descending genicular + anterior tibial recurrent) and Plantar Arch of the foot.",
    supply: "Pelvis, hip, thigh, knee, leg compartments, ankle, and foot.",
    clinical:
      "Femoral pulse is palpated at the mid-inguinal point for arterial cannulation; Popliteal aneurysm is the commonest peripheral arterial aneurysm; Posterior tibial pulse is felt behind the medial malleolus and Dorsalis pedis lateral to EHL tendon.",
  },

  // ───────── Systemic Trunk, Head/Neck & Visceral Arteries ─────────
  {
    id: "aorta",
    system: "cardiovascular",
    group: "Arteries — Aorta",
    name_en: "Aorta (Ascending, Arch, Thoracic & Abdominal)",
    name_ar: "الشريان الأبهر (الأورطي)",
    origin: "Arises from the left ventricle at the aortic orifice (level of 3rd left costal cartilage).",
    course:
      "Ascending aorta → Aortic arch (sternal angle T4/T5) → Descending thoracic aorta (posterior mediastinum) → Aortic hiatus of diaphragm (T12) → Abdominal aorta → Bifurcates at L4 into Right & Left Common Iliac arteries.",
    branches:
      "Ascending: 1- Right & Left Coronary arteries • Arch: 1- Brachiocephalic trunk, 2- Left Common Carotid A., 3- Left Subclavian A. • Thoracic: Bronchial, Esophageal, Mediastinal, Pericardial, Posterior intercostal (3–11), Subcostal, Superior phrenic • Abdominal: 3 Anterior unpaired visceral (Celiac T12, SMA L1, IMA L3), 3 Lateral paired visceral (Middle suprarenal, Renal L1–L2, Gonadal L2), Parietal (Inferior phrenic, 4 Lumbar), Terminal (Common iliacs L4, Median sacral).",
    anastomoses:
      "Internal thoracic–epigastric anastomosis (Winslow's pathway in aortic coarctation) and marginal artery of Drummond between SMA and IMA.",
    supply: "Entire systemic arterial circulation.",
    clinical:
      "Aortic dissection tears the intima; coarctation occurs near the ligamentum arteriosum; abdominal aortic aneurysm (AAA) rupture risk rises sharply above 5.5 cm.",
  },
  {
    id: "common_carotid",
    system: "cardiovascular",
    group: "Arteries — Head & Neck",
    name_en: "Common carotid artery & Brachiocephalic trunk",
    name_ar: "الشريان السباتي الأصلي والجذع العضدي الرأسي",
    origin: "Right arises from the brachiocephalic trunk behind the right sternoclavicular joint; Left arises directly from the aortic arch.",
    course: "Ascends within the carotid sheath (medial to IJV, anterior to vagus nerve CN X) without giving neck branches, bifurcating at the superior border of the thyroid cartilage (C4 / C3–C4 disc).",
    branches: "1- External carotid artery (supplies neck, face & scalp) • 2- Internal carotid artery (supplies brain & orbit).",
    anastomoses: "Circle of Willis intracranially and rich facial/thyroid anastomoses across the midline.",
    supply: "Head, neck, brain, and orbit.",
    clinical: "Carotid sinus (baroreceptor, CN IX) and carotid body (chemoreceptor) lie at the C4 bifurcation; carotid endarterectomy treats high-grade ICA stenosis.",
  },
  {
    id: "external_carotid",
    system: "cardiovascular",
    group: "Arteries — Head & Neck",
    name_en: "External carotid artery",
    name_ar: "الشريان السباتي الظاهر",
    origin: "Anteromedial terminal branch of the common carotid artery at the upper border of the thyroid cartilage (C4).",
    course: "Ascends through the carotid triangle, passes deep to the posterior belly of digastric and stylohyoid, and enters the substance of the parotid gland (deep to CN VII and retromandibular vein), dividing behind the neck of the mandible.",
    branches: "8 Branches (Mnemonic: Some Anatomists Like Freaking Out Poor Medical Students): 1- Superior thyroid A., 2- Ascending pharyngeal A., 3- Lingual A., 4- Facial A., 5- Occipital A., 6- Posterior auricular A., 7- Maxillary A. (gives Middle meningeal A.), 8- Superficial temporal A.",
    anastomoses: "Rich collateral anastomoses with the contralateral ECA and with the ophthalmic artery (ICA) via the angular/dorsal nasal artery.",
    supply: "Thyroid, larynx, pharynx, tongue, face, jaws, nasal cavity, dura mater, and scalp.",
    clinical: "Maxillary → middle meningeal artery passes through foramen spinosum and grooves the pterion (epidural hematoma after temporal bone fracture).",
  },
  {
    id: "internal_carotid",
    system: "cardiovascular",
    group: "Arteries — Head & Neck",
    name_en: "Internal carotid artery",
    name_ar: "الشريان السباتي الباطن",
    origin: "Posterolateral terminal branch of the common carotid artery at C4.",
    course: "Gives NO branches in the neck → ascends in carotid sheath to carotid canal in petrous temporal bone → traverses cavernous sinus alongside CN VI → pierces dural roof medial to anterior clinoid process.",
    branches: "1- Ophthalmic artery (gives Central retinal A.), 2- Posterior communicating A., 3- Anterior choroidal A., 4- Anterior cerebral A. (ACA), 5- Middle cerebral A. (MCA).",
    anastomoses: "Circle of Willis (via Anterior communicating A. and Posterior communicating A.) and orbital ECA–ICA anastomosis via Ophthalmic A.",
    supply: "Cerebral hemispheres (anterior circulation), diencephalon, pituitary, and orbit.",
    clinical: "Amaurosis fugax (transient monocular blindness / 'curtain coming down') results from carotid emboli entering the ophthalmic/central retinal artery.",
  },
  {
    id: "vertebral_artery",
    system: "cardiovascular",
    group: "Arteries — Head & Neck",
    name_en: "Vertebral & Basilar arteries",
    name_ar: "الشريان الفقري والشريان القاعدي",
    origin: "Arises from the 1st part of the subclavian artery in the root of the neck.",
    course: "Ascends through the foramina transversaria of C6–C1, winds posteriorly around the lateral mass of the atlas in the suboccipital triangle, enters the skull through the foramen magnum, and unites with its fellow at the lower border of the pons to form the Basilar artery.",
    branches: "Vertebral: 1- Anterior & Posterior spinal arteries, 2- Posterior inferior cerebellar artery (PICA) • Basilar: 3- Anterior inferior cerebellar A. (AICA), 4- Labyrinthine A., 5- Pontine arteries, 6- Superior cerebellar A. (SCA), 7- Posterior cerebral A. (PCA).",
    anastomoses: "Joins the Internal Carotid system via the Posterior communicating arteries to complete the Circle of Willis.",
    supply: "Cervical spinal cord, medulla, pons, midbrain, cerebellum, inner ear, and occipital/inferior temporal lobes.",
    clinical: "Occlusion of PICA or the intracranial vertebral artery causes Wallenberg lateral medullary syndrome (dysphagia, hoarseness, ipsilateral Horner's & ataxia, contralateral pain/temp loss).",
  },
  {
    id: "coronary_arteries",
    system: "cardiovascular",
    group: "Arteries — Heart",
    name_en: "Right & Left Coronary arteries",
    name_ar: "الشريانان التاجيان الأيمن والأيسر",
    origin: "RCA arises from the right (anterior) aortic sinus; LCA arises from the left posterior aortic sinus immediately above the aortic valve.",
    course: "Perfused primarily during ventricular diastole. RCA runs in the right atrioventricular (coronary) sulcus; LCA divides behind the pulmonary trunk into the LAD (anterior interventricular) and Circumflex (LCx) arteries.",
    branches: "RCA: 1- SA nodal branch (~60%), 2- Right marginal branch, 3- AV nodal branch (~85%), 4- Posterior interventricular (PDA — ~70% right-dominant) • LCA: 1- Left anterior descending (LAD → diagonal & septal perforators), 2- Left circumflex (LCx → obtuse marginal branches).",
    anastomoses: "Subepicardial anastomoses at the cardiac apex (between LAD and PDA) and in the coronary sulcus (between RCA and LCx), though functionally end-arteries in acute occlusion.",
    supply: "LAD supplies anterior LV/RV and anterior 2/3 of IV septum (including bundle branches); RCA supplies RA, RV, SA/AV nodes, and inferior wall/posterior 1/3 of septum.",
    clinical: "Proximal LAD occlusion ('widowmaker') causes extensive anteroseptal MI; RCA occlusion causes inferior MI with AV nodal heart block.",
  },
  {
    id: "coeliac_sma_ima",
    system: "cardiovascular",
    group: "Arteries — Abdomen",
    name_en: "Celiac trunk, Superior Mesenteric (SMA) & Inferior Mesenteric (IMA) arteries",
    name_ar: "الجذع الزلاقي والشريانان المساريقيان العلوي والسفلي",
    origin: "Unpaired anterior visceral branches of the abdominal aorta: Celiac trunk at T12, SMA at L1, and IMA at L3.",
    course: "Celiac trunk trifurcates at the upper border of the pancreas; SMA emerges behind the neck of the pancreas and crosses anterior to the uncinate process and 3rd part of the duodenum (D3); IMA descends retroperitoneally to the left of the aorta.",
    branches: "Celiac (Foregut): 1- Left gastric A., 2- Splenic A. (short gastric & left gastroepiploic), 3- Common hepatic A. (→ Proper hepatic & Gastroduodenal) • SMA (Midgut): 1- Inferior pancreaticoduodenal, 2- Jejunal & Ileal arcades, 3- Ileocolic (gives Appendicular A.), 4- Right colic, 5- Middle colic • IMA (Hindgut): 1- Left colic, 2- Sigmoid arteries, 3- Superior rectal artery.",
    anastomoses: "Pancreaticoduodenal arcades (Celiac ↔ SMA) and Marginal artery of Drummond / Arc of Riolan (Middle colic of SMA ↔ Left colic of IMA, with watershed zone at Griffiths' point at the splenic flexure).",
    supply: "Entire abdominal gastrointestinal tract from lower esophagus to upper anal canal, plus liver, gallbladder, pancreas, and spleen.",
    clinical: "Acute SMA embolism causes severe abdominal pain out of proportion to physical exam; splenic flexure (Griffiths' point) is most vulnerable in ischemic colitis.",
  },

  // ───────── Veins ─────────
  { id: "svc_ivc", system: "cardiovascular", group: "Veins", name_en: "Superior & inferior vena cava", name_ar: "الوريدان الأجوفان العلوي والسفلي",
    origin: "SVC forms behind the 1st right costal cartilage by union of Right & Left Brachiocephalic veins; IVC forms at L5 by union of Right & Left Common Iliac veins.",
    course: "SVC descends in the superior/middle mediastinum to enter the right atrium at the 3rd right costal cartilage; IVC ascends retroperitoneally on the right of the aorta, grooves the bare area of the liver, and pierces the central tendon of the diaphragm at T8.",
    branches: "SVC tributaries: Right & Left Brachiocephalic veins and Azygos vein (at T4) • IVC tributaries: Common iliac, 3rd & 4th Lumbar, Right gonadal, Renal (L2), Right suprarenal, Inferior phrenic, and 3 Hepatic veins.",
    supply: "Systemic venous return from the entire body into the right atrium.",
    clinical: "SVC obstruction (e.g. right upper lobe bronchogenic carcinoma) causes facial plethora, periorbital edema, and non-pulsatile distended neck veins (Pemberton sign)." },
  { id: "azygos_system", system: "cardiovascular", group: "Veins", name_en: "Azygos & Hemiazygos venous system", name_ar: "جهاز الوريد الفرد ونصف الفرد",
    origin: "Formed by the union of the right ascending lumbar vein and right subcostal vein at T12.",
    course: "Ascends in the posterior mediastinum to the right of the thoracic duct and aorta, then arches anteriorly over the root of the right lung at T4 (sternal angle) to drain into the posterior aspect of the SVC.",
    branches: "1- Right posterior intercostal veins (2nd–11th) • 2- Hemiazygos vein (crosses from left at T9) • 3- Accessory hemiazygos vein (crosses from left at T8) • 4- Bronchial, Esophageal & Mediastinal veins.",
    supply: "Drains the posterior thoracic and abdominal walls and mediastinal viscera; major collateral bypass between IVC and SVC.",
    clinical: "Provides life-saving collateral venous return to the heart when either the SVC or IVC is obstructed." },
  { id: "portal_system", system: "cardiovascular", group: "Veins", name_en: "Hepatic portal venous system", name_ar: "الجهاز الوريدي البابي الكبدي",
    origin: "Formed behind the neck of the pancreas at L1–L2 by the union of the Superior Mesenteric Vein (SMV) and Splenic Vein (which receives the Inferior Mesenteric Vein).",
    course: "Ascends for ~8 cm in the free edge of the lesser omentum (hepatoduodenal ligament) posterior to the bile duct (right) and proper hepatic artery (left), dividing at the porta hepatis into right and left branches.",
    branches: "Tributaries: 1- Splenic vein, 2- Superior mesenteric vein, 3- Left & Right gastric veins, 4- Cystic vein, 5- Paraumbilical veins (in ligamentum teres).",
    anastomoses: "Portosystemic Anastomoses: 1- Lower Esophagus (Left gastric ↔ Esophageal veins of Azygos → Esophageal varices), 2- Umbilicus (Paraumbilical ↔ Epigastric veins → Caput medusae), 3- Anal canal (Superior rectal ↔ Middle/Inferior rectal veins), 4- Retroperitoneal veins of Retzius.",
    supply: "Delivers nutrient-rich venous blood (~75% of hepatic blood flow) from the GI tract, spleen, pancreas, and gallbladder to the hepatic sinusoids.",
    clinical: "Portal hypertension (>12 mmHg) in liver cirrhosis dilates portosystemic anastomoses, causing life-threatening gastroesophageal variceal hemorrhage, ascites, and splenomegaly." },
  { id: "saphenous_veins", system: "cardiovascular", group: "Veins", name_en: "Great & Small Saphenous veins (and Cephalic / Basilic veins)", name_ar: "الأوردة السطحية (الصافن الكبير والصغير والرأسية والقاعدية)",
    origin: "Great saphenous arises from the medial end of the dorsal venous arch of the foot; Small saphenous arises from the lateral end.",
    course: "Great saphenous ascends 2.5 cm anterior to the medial malleolus (accompanied by the saphenous nerve), passes a hand's breadth behind the medial border of the patella, and pierces the cribriform fascia at the saphenous opening to join the femoral vein. Small saphenous ascends posterior to the lateral malleolus (with the sural nerve) to pierce the popliteal fascia into the popliteal vein.",
    branches: "Perforating veins (Cockett's, Dodd's, Boyd's) with one-way valves directing blood from superficial to deep veins; Superficial epigastric, circumflex iliac, and external pudendal tributaries at the saphenofemoral junction.",
    supply: "Superficial venous drainage of the lower and upper limbs.",
    clinical: "Valvular incompetence in perforating veins or the saphenofemoral junction causes varicose veins; the Great saphenous vein is the classic conduit for CABG and femoral-popliteal bypass (watch for saphenous nerve injury during distal harvesting)." },
  { id: "dural_venous_sinuses", system: "cardiovascular", group: "Veins", name_en: "Dural venous sinuses", name_ar: "الجيوب الوريدية للأم الجافية",
    origin: "Endothelium-lined valveless venous channels between the periosteal and meningeal layers of the dura mater.",
    course: "Superior sagittal sinus → Confluence of sinuses (internal occipital protuberance) → Transverse sinus → Sigmoid sinus → exits Jugular foramen as Internal Jugular Vein. Cavernous sinus flanks the sella turcica and drains via Superior/Inferior petrosal sinuses.",
    branches: "Cavernous sinus contents: Lateral wall (CN III, CN IV, CN V1, CN V2 from superior to inferior); Central lumen (Internal carotid artery & Abducens nerve CN VI).",
    supply: "Drains venous blood and CSF (via arachnoid granulations) from the brain, meninges, orbit, and diploë into the Internal Jugular Veins.",
    clinical: "Facial infections in the 'danger triangle of the face' can spread retrograde via valveless ophthalmic veins into the cavernous sinus, causing cavernous sinus thrombosis (presenting with CN VI palsy first, proptosis, and chemosis)." },
];

export const NEURO_VASCULAR_ALL: KnowledgeEntry[] = [...NERVOUS_KNOWLEDGE, ...VASCULAR_KNOWLEDGE];
