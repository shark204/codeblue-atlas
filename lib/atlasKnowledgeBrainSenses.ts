/**
 * Atlas Knowledge Base — Batch 7: Brain (detailed) & Special Senses (original wording, concise)
 * File: lib/atlasKnowledgeBrainSenses.ts
 * Verify against your textbooks before publishing.
 */

export interface NeuroEntry {
  id: string;
  system: "nervous";
  group: string;
  name_en: string;
  name_ar: string;
  features: string;
  relations: string;
  clinical: string;
}

export const BRAIN_KNOWLEDGE: NeuroEntry[] = [
  { id: "meninges", system: "nervous", group: "Coverings & CSF", name_en: "Meninges & dural folds", name_ar: "السحايا",
    features: "Dura mater (outer periosteal and inner meningeal layers; forms falx cerebri, tentorium cerebelli, falx cerebelli, diaphragma sellae), arachnoid mater, pia mater. Spaces: epidural (potential), subdural, subarachnoid (CSF, vessels)",
    relations: "Dura is supplied by middle meningeal artery (from maxillary) and innervated by trigeminal branches; bridging veins cross the subdural space; arachnoid granulations drain CSF into dural sinuses",
    clinical: "Epidural haematoma: arterial, lens-shaped, lucid interval. Subdural: venous, crescent-shaped, elderly and alcoholics. Subarachnoid haemorrhage: thunderclap headache, ruptured berry aneurysm. Meningitis: neck stiffness, Kernig's and Brudzinski's signs." },
  { id: "ventricles_csf", system: "nervous", group: "Coverings & CSF", name_en: "Ventricular system & CSF", name_ar: "البطينات المخية والسائل الدماغي الشوكي",
    features: "Lateral ventricles (frontal horn, body, atrium, occipital and temporal horns) → interventricular foramen (Monro) → third ventricle → cerebral aqueduct (Sylvius) → fourth ventricle → foramina of Luschka (lateral) and Magendie (median) → subarachnoid space. CSF ~150 mL, made ~500 mL/day by choroid plexus",
    relations: "Caudate nucleus bulges in the lateral ventricle floor; thalamus forms the lateral wall of the third ventricle; fourth ventricle sits between pons/medulla and cerebellum",
    clinical: "Obstructive hydrocephalus (aqueduct stenosis, tumour) vs communicating (impaired absorption, post-SAH or meningitis); normal pressure hydrocephalus triad: gait apraxia, dementia, incontinence. Lumbar puncture CSF analysis." },
  { id: "cerebral_cortex_lobes", system: "nervous", group: "Cerebrum", name_en: "Cerebral cortex: lobes & functional areas", name_ar: "قشرة المخ والفصوص",
    features: "Frontal: precentral gyrus (primary motor, area 4), prefrontal (executive, personality), Broca's area (44/45, expressive speech). Parietal: postcentral gyrus (somatosensory), association. Temporal: auditory cortex (41/42), Wernicke's area (22, comprehension), hippocampus. Occipital: visual cortex (17, around calcarine sulcus). Insula in the lateral sulcus",
    relations: "Landmarks: central sulcus, lateral (Sylvian) fissure, parieto-occipital sulcus, calcarine sulcus. Motor homunculus: legs medial (ACA), face and hand lateral (MCA)",
    clinical: "Dominant-hemisphere MCA stroke: aphasia (Broca's non-fluent, Wernicke's fluent but meaningless). Non-dominant parietal lesion: hemispatial neglect. Frontal lobe damage (Phineas Gage): disinhibition. Gerstmann syndrome." },
  { id: "basal_ganglia", system: "nervous", group: "Cerebrum", name_en: "Basal ganglia", name_ar: "العقد القاعدية",
    features: "Caudate and putamen (striatum), globus pallidus (internus and externus), subthalamic nucleus, substantia nigra (pars compacta: dopamine). Putamen + globus pallidus = lentiform nucleus",
    relations: "Lie lateral to the internal capsule and thalamus; modulate motor cortex via thalamus through direct (facilitating) and indirect (inhibiting) pathways",
    clinical: "Parkinson's disease: substantia nigra degeneration → resting tremor, rigidity, bradykinesia. Huntington's: caudate atrophy, chorea (CAG repeat). Hemiballismus: contralateral subthalamic lesion. Wilson's disease affects lentiform nucleus." },
  { id: "thalamus_hypothalamus", system: "nervous", group: "Diencephalon", name_en: "Thalamus & hypothalamus", name_ar: "المهاد وما تحت المهاد",
    features: "Thalamic nuclei: VPL (body sensation), VPM (face), LGN (vision), MGN (hearing), VL/VA (motor), anterior (limbic), pulvinar. Hypothalamus: anterior (heat loss), posterior (heat conservation), lateral (hunger), ventromedial (satiety), supraoptic and paraventricular (ADH, oxytocin), suprachiasmatic (circadian rhythm)",
    relations: "Thalamus forms the lateral wall of the third ventricle; hypothalamus lies below it, connected to the pituitary via infundibulum",
    clinical: "Thalamic stroke: contralateral sensory loss and thalamic pain syndrome. Hypothalamic lesions: temperature instability, diabetes insipidus. Wernicke–Korsakoff: mammillary bodies and medial thalamus." },
  { id: "internal_capsule", system: "nervous", group: "Cerebrum", name_en: "Internal capsule", name_ar: "المحفظة الباطنة",
    features: "Anterior limb (frontopontine, thalamic fibres), genu (corticobulbar), posterior limb (corticospinal, sensory thalamocortical fibres), retrolenticular and sublenticular parts (optic and auditory radiations)",
    relations: "Between caudate/thalamus medially and lentiform nucleus laterally; supplied by lenticulostriate branches of MCA and anterior choroidal artery",
    clinical: "Lacunar stroke in the posterior limb: pure motor hemiparesis (face, arm, leg) contralateral; hypertension damages lenticulostriate arteries." },
  { id: "limbic_system", system: "nervous", group: "Cerebrum", name_en: "Limbic system", name_ar: "الجهاز الحوفي",
    features: "Hippocampus, amygdala, fornix, mammillary bodies, anterior thalamic nuclei, cingulate gyrus, parahippocampal gyrus. Papez circuit: hippocampus → fornix → mammillary bodies → anterior thalamus → cingulate → hippocampus",
    relations: "Hippocampus lies in the medial temporal lobe floor of the temporal horn; amygdala at its anterior end",
    clinical: "Alzheimer's disease starts in the hippocampus (short-term memory loss); bilateral amygdala damage (Klüver–Bucy); temporal lobe epilepsy with aura and automatisms." },
  { id: "brainstem", system: "nervous", group: "Brainstem", name_en: "Brainstem (midbrain, pons, medulla)", name_ar: "جذع المخ",
    features: "Midbrain: cerebral peduncles, substantia nigra, red nucleus, colliculi (superior: visual reflexes; inferior: auditory), CN III and IV. Pons: CN V–VIII region, pontine nuclei. Medulla: pyramids (corticospinal decussation), olives, CN IX–XII, cardiorespiratory centres",
    relations: "Reticular formation regulates arousal; CN VI, VII, VIII emerge at pontomedullary junction",
    clinical: "Weber syndrome (midbrain): ipsilateral CN III palsy with contralateral hemiparesis. Lateral medullary (Wallenberg, PICA): ipsilateral face pain/temperature loss, contralateral body loss, Horner, dysphagia, ataxia. Locked-in syndrome from ventral pontine infarct." },
  { id: "cerebellum", system: "nervous", group: "Brainstem", name_en: "Cerebellum", name_ar: "المخيخ",
    features: "Vermis and hemispheres; flocculonodular lobe (vestibular), anterior (spinocerebellar), posterior (cerebrocerebellar). Deep nuclei (lateral to medial): dentate, emboliform, globose, fastigial. Peduncles: superior (mainly output), middle (pontine input), inferior (spinal and vestibular input)",
    relations: "Lies in posterior cranial fossa below tentorium; roof of fourth ventricle; outputs relay via thalamus; effects are ipsilateral",
    clinical: "Hemisphere lesion: ipsilateral intention tremor, dysdiadochokinesia, past-pointing, nystagmus (DANISH). Vermis lesion: truncal ataxia (alcohol, medulloblastoma in children). Tonsillar herniation compresses medulla." },
  { id: "spinal_tracts", system: "nervous", group: "Spinal cord", name_en: "Spinal cord tracts", name_ar: "مسالك الحبل الشوكي",
    features: "Dorsal columns: fine touch, vibration, proprioception (ascend ipsilaterally, cross in medulla). Spinothalamic: pain and temperature (cross at anterior white commissure within 1–2 levels). Corticospinal: voluntary movement (~85–90% cross at medullary pyramids)",
    relations: "Anterior spinal artery supplies anterior 2/3; paired posterior spinal arteries supply the dorsal columns. Artery of Adamkiewicz (T9–L2, usually left) is the great radicular artery",
    clinical: "Brown-Séquard hemisection: ipsilateral weakness and dorsal column loss, contralateral pain/temperature loss. Anterior spinal artery infarct spares dorsal columns. Syringomyelia: cape-like loss of pain and temperature. Aortic surgery may infarct cord via Adamkiewicz." },
  { id: "circle_of_willis", system: "nervous", group: "Vasculature", name_en: "Cerebral arteries & circle of Willis", name_ar: "شرايين المخ ودائرة ويليس",
    features: "Circle: anterior communicating, ACAs, ICAs, posterior communicating, PCAs, basilar tip. Territories: ACA (medial frontal/parietal: leg), MCA (lateral hemisphere: face/arm, speech areas), PCA (occipital, medial temporal)",
    relations: "Vertebral arteries join to form the basilar (branches: AICA, labyrinthine, pontine, SCA); PICA arises from the vertebral artery",
    clinical: "Berry aneurysms: anterior communicating commonest; posterior communicating aneurysm compresses CN III. ACA stroke: contralateral leg weakness; MCA: face/arm weakness and aphasia; PCA: homonymous hemianopia with macular sparing. Basilar occlusion is catastrophic." },
  { id: "visual_pathway", system: "nervous", group: "Special senses", name_en: "Visual pathway & pupillary reflex", name_ar: "المسار البصري والانعكاس الحدقي",
    features: "Retina → optic nerve → chiasm (nasal fibres cross) → optic tract → lateral geniculate → optic radiations (Meyer's loop through temporal lobe carries upper visual field; parietal fibres carry lower field) → V1 (calcarine). Light reflex: optic nerve → pretectal nuclei → both Edinger–Westphal nuclei → CN III → ciliary ganglion → sphincter pupillae",
    relations: "Pituitary lies below the chiasm; Meyer's loop passes in the anterior temporal lobe",
    clinical: "Optic nerve lesion: ipsilateral blindness; chiasmal: bitemporal hemianopia; tract/radiation/cortex: contralateral homonymous hemianopia. Temporal lesion: 'pie in the sky' quadrantanopia; parietal: 'pie on the floor'. Relative afferent pupillary defect on swinging-light test." },
];

export const SENSES_KNOWLEDGE: NeuroEntry[] = [
  { id: "eye_structure", system: "nervous", group: "Special senses", name_en: "Eyeball", name_ar: "كرة العين",
    features: "Layers: fibrous (sclera, cornea), vascular uvea (choroid, ciliary body, iris), neural (retina: rods for dim light, cones for colour, fovea centralis in macula, optic disc as blind spot). Aqueous humour: produced by ciliary body → posterior chamber → pupil → anterior chamber → trabecular meshwork → canal of Schlemm. Lens and vitreous body",
    relations: "Ciliary muscle (parasympathetic CN III) relaxes zonules → lens rounds for near vision (accommodation). Sympathetic dilates pupil",
    clinical: "Acute angle-closure glaucoma: painful red eye, fixed mid-dilated pupil, emergency. Open-angle glaucoma: raised IOP, cupped disc. Cataract (lens opacity); retinal detachment (flashes, floaters, curtain); macular degeneration." },
  { id: "extraocular_muscles", system: "nervous", group: "Special senses", name_en: "Extraocular muscles & eyelids", name_ar: "عضلات العين والجفون",
    features: "LR6 SO4: lateral rectus (abducens), superior oblique (trochlear); all others (superior, inferior, medial recti, inferior oblique) and levator palpebrae by oculomotor. Superior oblique depresses an adducted eye; inferior oblique elevates it. Müller's muscle (sympathetic) assists lid elevation",
    relations: "Orbicularis oculi (VII) closes lids; tarsal glands (Meibomian) in the lid",
    clinical: "CN III palsy: down and out; CN IV: vertical diplopia on down-gaze; CN VI: medial squint. Chalazion (Meibomian), stye (hordeolum); Horner syndrome causes partial ptosis (Müller) with miosis." },
  { id: "lacrimal_system", system: "nervous", group: "Special senses", name_en: "Lacrimal apparatus", name_ar: "الجهاز الدمعي",
    features: "Lacrimal gland (superolateral orbit) → tears across cornea → puncta → canaliculi → lacrimal sac → nasolacrimal duct → inferior meatus of the nose",
    relations: "Gland supplied by facial nerve parasympathetic (greater petrosal → pterygopalatine ganglion) and lacrimal nerve (V1)",
    clinical: "Dacryocystitis (blocked duct, common in infants); dry eye in Sjögren's syndrome; facial nerve lesion proximal to greater petrosal branch reduces tearing." },
  { id: "retinal_vessels", system: "nervous", group: "Special senses", name_en: "Retinal blood supply", name_ar: "التروية الدموية للشبكية",
    features: "Ophthalmic artery (from ICA) → central retinal artery (end artery, inner retina) and ciliary arteries (choroid, outer retina); central retinal vein drains to cavernous sinus",
    relations: "Fundoscopy visualises vessels directly",
    clinical: "Central retinal artery occlusion: sudden painless vision loss, cherry-red macula; retinal vein occlusion: 'blood and thunder'; diabetic and hypertensive retinopathy; papilloedema indicates raised ICP." },
  { id: "external_ear", system: "nervous", group: "Special senses", name_en: "External ear & tympanic membrane", name_ar: "الأذن الخارجية",
    features: "Auricle (elastic cartilage), external acoustic meatus (~2.5 cm; outer cartilaginous, inner bony), tympanic membrane (pars tensa, pars flaccida, umbo, cone of light)",
    relations: "Sensory supply: great auricular, auriculotemporal, auricular branch of vagus (Arnold's nerve), facial and glossopharyngeal contributions",
    clinical: "Stimulating the external canal can provoke cough via the vagus. Otitis externa (swimmer's ear); perforated drum from trauma or infection; cauliflower ear from haematoma." },
  { id: "middle_ear", system: "nervous", group: "Special senses", name_en: "Middle ear", name_ar: "الأذن الوسطى",
    features: "Ossicles: malleus, incus, stapes (footplate in oval window). Stapedius (VII) and tensor tympani (V3) dampen loud sounds. Eustachian tube links to nasopharynx; mastoid air cells communicate via aditus. Chorda tympani passes across the tympanic cavity",
    relations: "Roof (tegmen tympani) borders middle cranial fossa; medial wall has promontory (cochlea), oval and round windows; facial nerve runs in its canal in the medial wall",
    clinical: "Acute otitis media in children (short horizontal tube); complications: mastoiditis, facial palsy, meningitis, brain abscess. Cholesteatoma erodes ossicles. Otosclerosis fixes the stapes (conductive hearing loss). Stapedius paralysis → hyperacusis." },
  { id: "inner_ear", system: "nervous", group: "Special senses", name_en: "Inner ear: cochlea & vestibular system", name_ar: "الأذن الداخلية",
    features: "Bony labyrinth (perilymph) and membranous labyrinth (endolymph). Cochlea: scala vestibuli, scala media (organ of Corti), scala tympani; high frequencies at the base. Vestibule: utricle and saccule (linear acceleration); three semicircular canals with ampullae (rotation)",
    relations: "Hearing pathway: cochlear nerve → cochlear nuclei → superior olivary (bilateral) → lateral lemniscus → inferior colliculus → MGN → auditory cortex (bilateral, so central unilateral lesions rarely cause deafness)",
    clinical: "Sensorineural hearing loss (presbycusis, noise, ototoxic drugs). Rinne: air > bone normally; Weber lateralises to the affected side in conductive loss. Ménière's (vertigo, tinnitus, low-frequency loss); BPPV (otoliths in posterior canal, Dix–Hallpike)." },
];

export const BRAIN_SENSES_ALL: NeuroEntry[] = [...BRAIN_KNOWLEDGE, ...SENSES_KNOWLEDGE];
