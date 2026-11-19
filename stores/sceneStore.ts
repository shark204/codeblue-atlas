'use client'; import { create } from "zustand";
import type { AnatomicalSystem, AnatomyManifest, GenderModel, ManifestOrgan, SceneCommand, SectionPlane } from "@/lib/schemas"; import type { BackgroundMode } from "@/features/viewer/background";
import type { AnatomicalView } from "@/features/viewer/cameraViews"; import { sameStack } from "@/features/viewer/depthStack";
import { MAX_EXPLODE, nextExplodeStop } from "@/features/viewer/explode"; import { nextBodyTone, type BodyTone } from "@/features/viewer/scan";
import { ALL_CONNECTION_SYSTEMS, collectKeywordConnections, SUPPLY_SYSTEM, type SupplyKind } from "@/features/viewer/supply"; import { startHeartRhythm } from "./heartStore";
import type { ViewPreferences } from "./viewPreferences"; export type MobileBodyRegion = "all" | "head_neck" | "trunk" | "upper_limb" | "lower_limb";
export const NON_REGIONAL_VISCERAL_SYSTEMS = new Set<AnatomicalSystem>(["respiratory", "digestive", "endocrine", "reproductive", "renal"]); export function classifyOrganBodyRegion(organ: ManifestOrgan): Exclude<MobileBodyRegion, "all"> {
const baseId = organ.organ_id.toLowerCase().replace(/^skel_art_|^skel_tendon_|^art_spine_/, ""); const text = `${baseId.replace(/_/g, " ")} ${organ.name_en} ${organ.ta2_latin}`.toLowerCase();
const pathJoined = (organ.path ?? []).join(" > "); if (/\b(foot|feet|pedis|\bpes\b|hallux|hallucis|plantar|plantaris|calcaneus|calcaneal|achilles|talus|talar|tarsal|tarsi|metatarsal|metatarsi|ankle|malleolus|malleolar|tibia|tibial|tibialis|fibula|fibular|fibularis|peroneus|peroneal|femur|femoris|femoral|profunda femoris|patella|patellar|popliteus|popliteal|genicular|crural|cruris|sural|saphenous|gluteus|gluteal|buttock|trochanter|trochanteric|sciatic|sartorius|quadriceps|vastus|articularis genus|gracilis|pectineus|semitendinosus|semimembranosus|biceps femoris|gastrocnemius|soleus|iliotibial|fascia lata|tensor fasciae latae|piriformis|gemellus|quadratus femoris|quadratus plantae|dorsalis pedis|arcuate artery)\b/.test(text)) {
return "lower_limb"; }
if (/\b(hand|manus|pollex|pollicis|thumb|palmar|\bpalm\b|thenar|hypothenar|carpal|carpi|metacarpal|wrist|forearm|antebrachial|antebrachii|elbow|cubital|cubiti|humerus|humeral|brachii|brachial|brachialis|coracobrachialis|biceps brachii|triceps|anconeus|pronator|supinator|brachioradialis|axilla|axillary|brachial plexus|musculocutaneous|median nerve|ulnar|radial|ulna|radius|radioulnar|cephalic vein|basilic vein|median cubital|median antebrachial|supratrochlear nodes|infraclavicular nodes|deltopectoral|clavicle|clavicular|scapula|scapular|acromion|acromial|acromioclavicular|coracoid|coracoclavicular|coracoacromial|coracohumeral|glenohumeral|glenoid|subacromial|subdeltoid|subscapular|subscapularis|suprascapular|supraspinatus|infraspinatus|teres major|teres minor|deltoid|subclavian|profunda brachii|deep brachial|circumflex humeral|princeps pollicis|radialis indicis)\b/.test(text) && !/\b(pectoralis major|pectoralis minor|subclavius|sternoclavicular|costoclavicular|interclavicular|sternocleidomastoid|levator scapulae|rhomboid|trapezius|latissimus dorsi|serratus anterior|omohyoid|supraclavicular nerve|dorsal scapular|transverse cervical|corona radiata)\b/.test(text)) { return "upper_limb";
} if (/\b(Cranium|Joints of skull|Laryngeal joints|Laryngeal cartilages|Auditory ossicles|Nasal cartilages|Muscles of head|Muscles of neck|Sense organs|Cranial nerves)\b/i.test(pathJoined) || pathJoined.includes("Central nervous system > Brain") || pathJoined.includes("Cervical vertebrae")) {
return "head_neck"; }
if (/\b(Bones of upper limb|Joints of upper limb|Muscles of upper limb|Tendons of upper limb|Brachial plexus)\b/i.test(pathJoined) && !/\b(medial pectoral|lateral pectoral|thoracodorsal|long thoracic|subclavius|sternoclavicular|costoclavicular|interclavicular)\b/i.test(text)) { return "upper_limb";
} if (/\b(Bones of free lower limb|Joints of free lower limb|Tendons of lower limb|Muscles of lower limb)\b/i.test(pathJoined)) {
return "lower_limb"; }
if (/\b(c[1-7]|atlas|axis|atlanto)\b/.test(text) && /\b(vertebra|disc|nucleus pulposus|spinal nerve|cervical|joint|ligament|membrane|capsule)\b/.test(text)) { return "head_neck";
} if (/\b(t[1-9]|t1[0-2]|l[1-5]|s[1-5]|thoracic vertebra|lumbar vertebra|sacrum|coccyx|sacrococcygeal)\b/.test(text)) {
return "trunk"; }
if (/\b(lower limb|free lower limb|pelvic girdle|acetabular|acetabulum|triradiate|iliofemoral|ischiofemoral|pubofemoral|zona orbicularis|hip joint|knee joint|hip bone|ilium|ischium|pubis|iliopsoas|psoas|iliacus|obturator internus|obturator externus|obturator nerve|obturator artery|obturator vein|obturator membrane|obturator canal|obturator nodes|adductor longus|adductor brevis|adductor magnus|adductor minimus|adductor canal|inguinal nodes|lacunar node|cloquet|cuneonavicular|cuneocuboid|cuneometatarsal|talocrural|intertarsal|subtalar|talocalcaneal|talonavicular|tibiotalar|tibionavicular|tibiocalcaneal|metatarsophalangeal|intermetatarsal|intersesamoid|cruciate|meniscus|menisci|meniscofemoral|meniscopatellar|popliteofibular|tibiofibular|deltoid ligament|spring ligament|calcaneofibular|talofibular|calcaneonavicular|calcaneocuboid)\b/.test(text) && !/\b(iliocostalis|iliohypogastric|ilioinguinal|iliolumbar|symphysis pubis|pubic symphysis|superior pubic|inferior pubic|interpubic|sacroiliac|sacro-iliac|sacrotuberous|sacrospinous|levator ani|ischiocavernosus|bulbospongiosus|pudendal)\b/.test(text)) { return "lower_limb";
} if (/\b(upper limb|free upper limb|pectoral girdle|conoid|trapezoid ligament|oblique cord|annular ligament|quadrate ligament|radiocarpal|ulnocarpal|radiocapitate|radioscaphocapitate|scaphocapitate|scapholunate|scaphotrapeziotrapezoidal|scaphotriquetral|lunotriquetral|capitohamate|pisohamate|pisometacarpal|pisotriquetral|trapeziotrapezoidal|trapezoideocapitate|triquetrocapitate|triquetrohamate|ulnocapitate|ulnolunate|ulnopisiform|ulnotriquetral|midcarpal|intercarpal|pisiform|triquetrum|triquetral|lunate|scaphoid|trapezium|trapezoid|capitate|hamate|metacarpophalangeal|carpometacarpal|intermetacarpal|index finger|middle finger|ring finger|little finger|digits of hand|interphalangeal.*hand|collateral artery|recurrent artery|recurrent interosseous|common interosseous|anterior interosseous|posterior interosseous|intertubercular)\b/.test(text) && !/\b(pectoralis major|pectoralis minor|subclavius|sternoclavicular|costoclavicular|interclavicular|collateral sulcus)\b/.test(text)) {
return "upper_limb"; }
if (/\b(skull|cranium|cranial|neurocranium|viscerocranium|calvaria|frontal|parietal|temporal|occipital|occipito|sphenoid|sphenoidal|ethmoid|ethmoidal|inferior nasal concha|nasal concha|lacrimal|nasal|alar cartilage|septal cartilage|vomer|maxilla|maxillary|palatine|zygomatic|zygomaticus|mandible|mandibular|temporomandibular|pterygospinous|sphenomandibular|stylomandibular|stylohyoid|hyoid|auditory|malleus|incus|stapes|tympanic|tympani|stapedius|ear|auricle|auricular|helix|antihelix|tragus|antitragus|concha|lobule of auricle|scapha|triangular fossa|fossa triangularis|cymba|intertragic|external acoustic|internal acoustic|cochlea|cochlear|vestibule|vestibular|semicircular|labyrinth|labyrinthine|eustachian|eye|eyeball|bulbus oculi|orbit|orbital|infra-orbital|infraorbital|supra-orbital|supraorbital|cornea|sclera|choroid|ciliary|iris|pupil|\blens\b|vitreous|retina|retinal|zonular|optic|ophthalmic|conjunctiva|conjunctival|palpebra|palpebral|eyelid|eyebrow|eyelash|superciliary|supercilii|tarsus|nasolacrimal|common tendinous ring|trochlea of superior oblique|superior rectus|inferior rectus|medial rectus|lateral rectus|superior oblique|inferior oblique|levator palpebrae|epicranial|occipitofrontalis|frontalis|occipitalis|temporoparietalis|procerus|nasalis|nasolabialis|depressor septi nasi|corrugator|orbicularis oculi|orbicularis oris|levator labii|levator anguli|risorius|buccinator|bucinator|buccal|depressor anguli|depressor labii|mentalis|mental|submental|platysma|masseter|temporalis|pterygoid|parotid|submandibular|sublingual|tooth|teeth|incisor|canine|premolar|molar|gingiva|periodontal|mouth|oral|oris|lip|labial|labii|cheek|chin|philtrum|palate|palatini|palatoglossus|palatopharyngeus|salpingopharyngeus|stylopharyngeus|pharynx|pharyngeal|retropharyngeal|tonsil|tonsillar|tongue|lingual|linguae|genioglossus|hyoglossus|styloglossus|larynx|laryngeal|thyroid|cricoid|arytenoid|crico-arytenoid|cricoarytenoid|corniculate|cuneiform cartilage|epiglottis|epiglottic|thyro-epiglottic|thyroepiglottic|thyrohyoid|cricothyroid|thyroarytenoid|vocal|vocalis|quadrangular membrane|conus elasticus|trachealis|parathyroid|cervical|cervicis|\bneck\b|colli|capitis|atlas|axis|atlanto|sternocleidomastoid|scalenus|scalene|longus colli|longus capitis|rectus capitis|obliquus.*capitis|suboccipital|splenius|digastric|mylohyoid|geniohyoid|sternohyoid|sternothyroid|omohyoid|brain|cerebrum|cerebral|telencephalon|diencephalon|mesencephalon|midbrain|pons|pontine|medulla oblongata|myelencephalon|brainstem|cerebellum|cerebellar|vermis|flocculus|nodulus|culmen|declive|folium|thalamus|thalamic|hypothalamus|epithalamus|subthalamus|metathalamus|habenula|geniculate|pineal|pituitary|hypophysis|adenohypophysis|neurohypophysis|basal ganglia|caudate|putamen|globus pallidus|lentiform|striatum|striate|claustrum|amygdala|amygdaloid|hippocampus|hippocampal|fornix|fimbria|dentate gyrus|subiculum|mamillary|commissure|corpus callosum|septum pellucidum|internal capsule|external capsule|extreme capsule|corona radiata|peduncle|interpeduncular|colliculus|tectum|tegmentum|substantia nigra|red nucleus|olivary|olive|pyramid of medulla|decussation|lemniscus|medial longitudinal fasciculus|reticular formation|insula|insular|operculum|cuneus|precuneus|gyrus|gyri|sulcus|sulci|fissure of brain|longitudinal fissure|transverse cerebral|calcarine|cingulate|parahippocampal|uncus|olfactory|ventricle of brain|lateral ventricle|third ventricle|fourth ventricle|cerebral aqueduct|interventricular foramen|choroid plexus|falx cerebri|falx cerebelli|tentorium cerebelli|diaphragma sellae|cavernous sinus|intercavernous sinus|petrosal sinus|sagittal sinus|straight sinus|transverse sinus|sigmoid sinus|occipital sinus|confluence of sinuses|carotid|jugular|jugulodigastric|jugulo-omohyoid|vertebral artery|vertebral vein|basilar|circle of willis|communicating artery|callosomarginal|pericallosal|frontobasal|orbitofrontal|sphenopalatine|alveolar|supratrochlear artery|supratrochlear vein|supratrochlear nerve|infratrochlear|angular artery|angular vein|nasolabial|thyrocervical|costocervical|oculomotor|trochlear nerve|trigeminal|abducens|facial nerve|chorda tympani|greater petrosal|vestibulocochlear|glossopharyngeal|vagus|accessory nerve|hypoglossal|ansa cervicalis|cervical plexus|lesser occipital|great auricular|supraclavicular nerve|greater occipital|third occipital|otic ganglion|pterygopalatine ganglion|hairs of head|eyebrow|eyelash)\b/.test(text) && !/\b(thoracis|thoracic|lumborum|lumbar|sacral|coccygeal|pectoralis|abdominis|abdominal|intercostal|subcostal|diaphragm|heart|cardiac|pulmonary|lung|bronchial|aorta|vena cava|azygos|hemiazygos|celiac|mesenteric|renal|hepatic|splenic|gastric|gastro-omental|gastroepiploic|pancreatic|duodenal|jejunal|ileal|colic|rectal|vesical|uterine|ovarian|testicular|prostatic|pudendal|iliac|femoral|popliteal|tibial|fibular|plantar|pedis|brachial|radial|ulnar|palmar|carpal|metacarpal|spinothalamic|spinocerebellar|spinotectal|vestibulospinal|reticulospinal|rubrospinal|tectospinal|corticospinal|cuneate fasciculus|gracile fasciculus|posterolateral tract|white matter of spinal cord|anterior horn of spinal cord|posterior horn of spinal cord|central canal|spinal dura|cauda equina|neck of femur|neck of radius|neck of fibula|neck of talus|neck of rib|neck of scapula|neck of humerus|head of femur|head of fibula|head of rib|head of radius|head of ulna|head of humerus|head of talus)\b/.test(text)) { return "head_neck";
} return "trunk";
} export function matchesMobileBodyRegion(organ: ManifestOrgan, region: MobileBodyRegion): boolean {
if (!region || region === "all") return true; if (NON_REGIONAL_VISCERAL_SYSTEMS.has(organ.system)) return true;
return classifyOrganBodyRegion(organ) === region; }
export interface PathologyOverlay { pathology: string;
severity: number; }
export interface CrossSection { plane: SectionPlane;
position: number; }
export const GHOST_STOPS = ([1, 0.28, 0.12] as const); export const XRAY_OPACITY = 0.16;
export const GLASS_OPACITY = 0.1; export const GHOST_CLICK_THROUGH = 0.5;
export interface FocusRequest { organId: string;
seq: number; }
export interface ScanRequest { organId: string;
seq: number; plane?: "axial" | "coronal";
} export type ViewpointRequest = {
kind: "fit"; seq: number;
} | { kind: "orient";
view: AnatomicalView; seq: number;
} | { kind: "dolly";
factor: number; seq: number;
} | { kind: "scan";
seq: number; };
export interface PathwayRequest { label: string;
organIds: string[]; stepSeconds: number;
loop: boolean; seq: number;
} function revealing(state: SceneViewState, organIds: string[]): Partial<SceneViewState> {
const revealed: Partial<SceneViewState> = {}; const stillHidden = state.hiddenOrganIds.filter(id => !organIds.includes(id));
if (stillHidden.length !== state.hiddenOrganIds.length) { revealed.hiddenOrganIds = stillHidden;
} return revealed;
} export interface SceneViewState {
selectedOrganIds: string[]; hiddenOrganIds: string[];
hiddenSystems: AnatomicalSystem[]; systemOpacity: Partial<Record<AnatomicalSystem, number>>;
isolatedOrganIds: string[] | null; pathologyOverlays: Record<string, PathologyOverlay>;
caseMarks: Record<string, PathologyOverlay>; crossSection: CrossSection | null;
focusRequest: FocusRequest | null; scanRequest: ScanRequest | null;
viewpoint: ViewpointRequest | null; pathway: PathwayRequest | null;
illuminated: string[]; supplyRequest: {
kind: SupplyKind; seq: number;
} | null; supplyResult: {
kind: SupplyKind; added: number;
} | null; explode: number;
bodyTone: BodyTone; fadedOrganIds: string[];
fadeOthersActive: boolean; multiSelectMode: boolean;
areaDrawMode: "none" | "select" | "deselect"; selectionUndoStack: string[][];
selectionRedoStack: string[][]; activeBreadcrumbGroup: string | null;
systemLayerLevel: Partial<Record<AnatomicalSystem, number>>; }
export const initialViewState: SceneViewState = { selectedOrganIds: [],
hiddenOrganIds: [], hiddenSystems: ["articular", "cardiovascular", "digestive", "endocrine", "integumentary", "lymphatic", "muscular", "nervous", "regional", "renal", "reproductive", "respiratory", "skeletal"],
systemOpacity: {}, isolatedOrganIds: null,
pathologyOverlays: {}, caseMarks: {},
crossSection: null, focusRequest: null,
scanRequest: null, viewpoint: null,
pathway: null, explode: 0,
bodyTone: "solid", supplyRequest: null,
supplyResult: null, illuminated: [],
fadedOrganIds: [], fadeOthersActive: false,
multiSelectMode: false, areaDrawMode: "none",
selectionUndoStack: [], selectionRedoStack: [],
activeBreadcrumbGroup: null, systemLayerLevel: {}
}; export function applySceneCommand(state: SceneViewState, command: SceneCommand): SceneViewState {
switch (command.action) { case "say":
return state; case "focus_organ":
return { ...state,
...revealing(state, [command.organ_id]), selectedOrganIds: [command.organ_id],
focusRequest: { organId: command.organ_id,
seq: (state.focusRequest?.seq ?? 0) + 1 }
}; case "set_layer_visibility":
{ const hidden = new Set(state.hiddenSystems);
if (command.visible) hidden.delete(command.system);else hidden.add(command.system); return {
...state, hiddenSystems: [...hidden].sort()
}; }
case "set_layer_opacity": {
const opacity = { ...state.systemOpacity
}; if (command.opacity >= 1) delete opacity[command.system];else opacity[command.system] = command.opacity;
return { ...state,
systemOpacity: opacity };
} case "isolate_structures":
return { ...state,
isolatedOrganIds: [...command.organ_ids] };
case "isolate_group": return state;
case "add_supply": return state;
case "isolate_region": return {
...state, isolatedOrganIds: [command.organ_id],
selectedOrganIds: [command.organ_id], focusRequest: {
organId: command.organ_id, seq: (state.focusRequest?.seq ?? 0) + 1
} };
case "apply_pathology_overlay": return {
...state, pathologyOverlays: {
...state.pathologyOverlays, [command.organ_id]: {
pathology: command.pathology, severity: command.severity
} }
}; case "clear_pathology_overlays":
return { ...state,
pathologyOverlays: {} };
case "highlight_pathway": return {
...state, pathway: {
label: command.label, organIds: [...command.organ_ids],
stepSeconds: command.step_seconds, loop: command.loop,
seq: (state.pathway?.seq ?? 0) + 1 }
}; case "clear_pathway":
return { ...state,
pathway: null };
case "illuminate_structures": {
const illuminated = [...command.organ_ids]; return {
...state, ...revealing(state, illuminated),
illuminated };
} case "set_cross_section":
return { ...state,
crossSection: { plane: command.plane,
position: command.position }
}; case "set_heart_rhythm":
return state; case "scan_at_structure":
return { ...state,
...revealing(state, [command.organ_id]), scanRequest: {
organId: command.organ_id, seq: (state.scanRequest?.seq ?? 0) + 1,
...(command.plane ? { plane: command.plane
} : {}) }
}; case "reset_view":
return { ...initialViewState,
selectedOrganIds: state.selectedOrganIds, systemOpacity: state.systemOpacity,
bodyTone: state.bodyTone };
} }
interface SceneStore extends SceneViewState { genderModel: GenderModel;
initialShowcaseActive: boolean; pendingActiveSystem: AnatomicalSystem | null;
manifest: AnatomyManifest | null; organs: Record<string, ManifestOrgan>;
hoveredOrganId: string | null; eyeTracking: boolean;
labelsVisible: boolean; hideConnective: boolean;
connectiveIds: Set<string>; background: BackgroundMode;
depthProbeVisible: boolean; depthStack: string[];
pinnedStack: string[] | null; mobileBodyRegion: MobileBodyRegion;
setManifest: (manifest: AnatomyManifest) => void; setGenderModel: (gender: GenderModel) => void;
switchReproductiveGender: (gender?: GenderModel) => void; setHovered: (organId: string | null) => void;
setDepthStack: (organIds: string[]) => void; clearDepthStack: () => void;
pinDepthStack: () => void; unpinDepthStack: () => void;
selectFromViewport: (organId: string | null, additive?: boolean) => void; dismissDepthStack: () => void;
setEyeTracking: (enabled: boolean) => void; setDepthProbeVisible: (visible: boolean) => void;
setLabelsVisible: (visible: boolean) => void; setHideConnective: (hidden: boolean) => void;
cycleBodyTone: () => void; setBackground: (mode: BackgroundMode) => void;
restoreView: (preferences: Partial<ViewPreferences>) => void; selectOrgan: (organId: string | null, additive?: boolean) => void;
selectMany: (organIds: string[]) => void; addToSelection: (organIds: string[]) => void;
clearSelection: () => void; setCaseMarks: (marks: Record<string, PathologyOverlay>) => void;
isolateSelection: () => void; hideSelection: () => void;
fadeSelection: () => void; toggleFadeOthers: () => void;
hideOthers: () => void; setMultiSelectMode: (enabled: boolean) => void;
setAreaDrawMode: (mode: "none" | "select" | "deselect") => void; removeFromSelection: (organIds: string[]) => void;
undoSelectionStep: () => void; redoSelectionStep: () => void;
selectBreadcrumbGroup: (node: string) => void; stepSystemLayer: (system: AnatomicalSystem, delta: 1 | -1) => void;
toggleOrganHidden: (organId: string) => void; toggleOrgansHidden: (organIds: string[]) => void;
toggleConnectionKind: (organId: string, kind: "nervous" | "cardiovascular" | "lymphatic") => void; setMobileBodyRegion: (region: MobileBodyRegion) => void;
unhideAll: () => void; undoHistory: {
hiddenOrganIds: string[]; isolatedOrganIds: string[] | null;
selectedOrganIds: string[]; hiddenSystems: AnatomicalSystem[];
}[]; undoLastStep: () => void;
studyOrganWithConnections: (organId: string) => void; focusBadge: {
organId: string; index: number;
} | null; applyCommand: (command: SceneCommand) => void;
focusOnOrgan: (organId: string) => void; focusReference: (organId: string, index: number) => void;
toggleSystem: (system: AnatomicalSystem) => void; toggleNervousBodyContext: () => void;
soloSystem: (system: AnatomicalSystem) => void; cycleSystemOpacity: (system: AnatomicalSystem) => void;
xraySystem: (system: AnatomicalSystem) => void; clearGhosting: () => void;
glassBody: () => void; fitView: () => void;
orientView: (view: AnatomicalView) => void; scanView: () => void;
dollyView: (factor: number) => void; setExplode: (factor: number) => void;
cycleExplode: () => void; showAllSystems: () => void;
hideAllSystems: () => void; clearPathway: () => void;
clearIsolation: () => void; dropFromIsolation: (organId: string) => void;
requestSupply: (kind: SupplyKind) => void; resolveSupply: (organIds: string[]) => void;
cancelSupply: () => void; studyOrgan: (organId: string, additive?: boolean) => void;
studyRegion: (organId: string) => void; studyGroup: (node: string) => void;
resetView: () => void; }
export const useSceneStore = create<SceneStore>()((set, get) => ({ ...initialViewState,
genderModel: "male", initialShowcaseActive: true,
pendingActiveSystem: null, manifest: null,
organs: {}, hoveredOrganId: null,
depthStack: [], pinnedStack: null,
eyeTracking: false, depthProbeVisible: false,
labelsVisible: false, hideConnective: true,
connectiveIds: new Set<string>(), focusBadge: null,
background: "light", undoHistory: [],
mobileBodyRegion: "all", setManifest: manifest => set(state => {
const allSystems = manifest.systems.map(entry => entry.system); const connSet = new Set(manifest.organs.filter(organ => organ.organ_id.startsWith("skel_tendon_") || organ.path?.[0] === "Tendons" || organ.path?.[0] === "Tendons, Sheaths & Retinacula").map(organ => organ.organ_id));
const organsMap = Object.fromEntries(manifest.organs.map(organ => [organ.organ_id, organ])); if (state.initialShowcaseActive && !state.pendingActiveSystem && state.genderModel === "male") {
return { manifest,
pendingActiveSystem: null, organs: organsMap,
connectiveIds: connSet, hiddenSystems: [...allSystems].sort(),
systemOpacity: {}, hideConnective: true,
isolatedOrganIds: null, selectedOrganIds: [],
pinnedStack: null, mobileBodyRegion: "all"
}; }
const currentVisible = allSystems.filter(s => !state.hiddenSystems.includes(s)); const fallbackActive: AnatomicalSystem = currentVisible.find(s => s !== "skeletal" && s !== "muscular") ?? (state.genderModel === "female" ? "reproductive" : "muscular");
const targetSys: AnatomicalSystem = state.pendingActiveSystem ?? fallbackActive; const needsOuterBody = targetSys === "nervous" || targetSys === "lymphatic" || targetSys === "cardiovascular" || targetSys === "respiratory" || targetSys === "digestive" || targetSys === "renal" || targetSys === "reproductive" || targetSys === "endocrine";
const isSkeletalTarget = targetSys === "skeletal" || targetSys === "articular"; return {
manifest, initialShowcaseActive: false,
pendingActiveSystem: null, organs: organsMap,
connectiveIds: connSet, hiddenSystems: allSystems.filter(entry => entry !== targetSys && !(isSkeletalTarget && (entry === "skeletal" || entry === "articular")) && !(needsOuterBody && (entry === "skeletal" || entry === "muscular"))).sort(),
systemOpacity: needsOuterBody ? { skeletal: 0.18,
muscular: 0.14 } : {},
hideConnective: !isSkeletalTarget, isolatedOrganIds: null,
selectedOrganIds: [], pinnedStack: null,
mobileBodyRegion: state.mobileBodyRegion ?? "all", viewpoint: {
kind: "fit", seq: (state.viewpoint?.seq ?? 0) + 1
} };
}), setGenderModel: gender => set(state => {
const all = state.manifest?.systems.map(entry => entry.system) ?? ["articular", "cardiovascular", "digestive", "endocrine", "integumentary", "lymphatic", "muscular", "nervous", "regional", "renal", "reproductive", "respiratory", "skeletal"]; const nextTarget: AnatomicalSystem = !state.hiddenSystems.includes("reproductive") || gender === "female" ? "reproductive" : "skeletal";
const needsOuter = nextTarget === "reproductive"; return {
...initialViewState, initialShowcaseActive: false,
genderModel: gender, pendingActiveSystem: nextTarget,
hiddenSystems: all.filter(entry => entry !== nextTarget && !(nextTarget === "skeletal" && entry === "articular") && !(nextTarget === "reproductive" && entry === "renal") && !(needsOuter && (entry === "skeletal" || entry === "muscular"))).sort(), systemOpacity: needsOuter ? {
skeletal: 0.18, muscular: 0.14
} : {}, hideConnective: nextTarget !== "skeletal",
hoveredOrganId: null, depthStack: [],
pinnedStack: null, mobileBodyRegion: NON_REGIONAL_VISCERAL_SYSTEMS.has(nextTarget) ? "all" : state.mobileBodyRegion,
viewpoint: { kind: "fit",
seq: (state.viewpoint?.seq ?? 0) + 1 }
}; }),
switchReproductiveGender: targetGender => set(state => { const nextGender: GenderModel = targetGender ?? (state.genderModel === "male" ? "female" : "male");
const all = state.manifest?.systems.map(entry => entry.system) ?? ["articular", "cardiovascular", "digestive", "endocrine", "integumentary", "lymphatic", "muscular", "nervous", "regional", "renal", "reproductive", "respiratory", "skeletal"]; const keepEndocrine = !state.hiddenSystems.includes("endocrine") && state.hiddenSystems.includes("reproductive");
const targetSys: AnatomicalSystem = keepEndocrine ? "endocrine" : "reproductive"; return {
...initialViewState, initialShowcaseActive: false,
genderModel: nextGender, pendingActiveSystem: targetSys,
hiddenSystems: all.filter(entry => entry !== targetSys && !(targetSys === "reproductive" && entry === "renal") && entry !== "skeletal" && entry !== "muscular").sort(), systemOpacity: {
skeletal: 0.18, muscular: 0.14
}, hideConnective: true,
isolatedOrganIds: null, selectedOrganIds: [],
hoveredOrganId: null, depthStack: [],
pinnedStack: null, mobileBodyRegion: "all",
viewpoint: { kind: "fit",
seq: (state.viewpoint?.seq ?? 0) + 1 }
}; }),
setHovered: organId => set({ hoveredOrganId: organId
}), setDepthStack: organIds => set(state => sameStack(state.depthStack, organIds) ? state : {
depthStack: organIds }),
clearDepthStack: () => set(state => state.depthStack.length === 0 ? state : { depthStack: []
}), pinDepthStack: () => set(state => state.depthStack.length > 0 ? {
pinnedStack: state.depthStack } : state),
unpinDepthStack: () => set(state => state.pinnedStack === null ? state : { pinnedStack: null
}), dismissDepthStack: () => set({
depthStack: [], pinnedStack: null
}), selectFromViewport: (organId, additive = false) => {
get().selectOrgan(organId, additive); if (organId !== null) get().pinDepthStack();
}, setEyeTracking: enabled => set({
eyeTracking: enabled }),
setDepthProbeVisible: visible => set({ depthProbeVisible: visible
}), setLabelsVisible: visible => set({
labelsVisible: visible }),
setHideConnective: hidden => set(state => { const all = state.manifest?.systems.map(entry => entry.system) ?? ["articular", "cardiovascular", "digestive", "endocrine", "integumentary", "lymphatic", "muscular", "nervous", "regional", "renal", "reproductive", "respiratory", "skeletal"];
if (!hidden) { const regionIds = state.mobileBodyRegion !== "all" ? [...state.connectiveIds].filter(id => {
const o = state.organs[id]; return o ? matchesMobileBodyRegion(o, state.mobileBodyRegion) : true;
}) : null; return {
hideConnective: false, hiddenSystems: [...all].sort(),
isolatedOrganIds: null, selectedOrganIds: [],
pinnedStack: null };
} return {
hideConnective: true, selectedOrganIds: [],
pinnedStack: null };
}), cycleBodyTone: () => set(state => ({
bodyTone: nextBodyTone(state.bodyTone) })),
setBackground: mode => set({ background: mode
}), restoreView: preferences => set(state => ({
hiddenSystems: state.hiddenSystems, systemOpacity: preferences.systemOpacity ?? state.systemOpacity,
eyeTracking: preferences.eyeTracking ?? state.eyeTracking, depthProbeVisible: preferences.depthProbeVisible ?? state.depthProbeVisible,
labelsVisible: preferences.labelsVisible ?? state.labelsVisible, hideConnective: state.hiddenSystems.includes("skeletal"),
background: preferences.background ?? state.background })),
selectOrgan: (organId, additive = false) => set(state => { if (state.isolatedOrganIds !== null && state.isolatedOrganIds.length > 0) {
if (organId === null || !state.isolatedOrganIds.includes(organId)) { return state;
} }
if (organId === null) { if (state.multiSelectMode) return state;
return { selectedOrganIds: [],
activeBreadcrumbGroup: null, fadeOthersActive: false
}; }
const effAdditive = additive || state.multiSelectMode; if (!effAdditive) {
if (state.selectedOrganIds.length === 1 && state.selectedOrganIds[0] === organId && state.activeBreadcrumbGroup === null) { return state;
} const nextHistory = state.selectedOrganIds.length > 0 ? [...state.undoHistory.slice(-24), {
hiddenOrganIds: state.hiddenOrganIds, isolatedOrganIds: state.isolatedOrganIds,
selectedOrganIds: state.selectedOrganIds, hiddenSystems: state.hiddenSystems
}] : state.undoHistory; return {
undoHistory: nextHistory, selectedOrganIds: [organId],
activeBreadcrumbGroup: null };
} const nextSel = state.selectedOrganIds.includes(organId) ? state.selectedOrganIds.filter(id => id !== organId) : [...state.selectedOrganIds, organId];
return { selectionUndoStack: [...state.selectionUndoStack.slice(-24), state.selectedOrganIds],
selectionRedoStack: [], selectedOrganIds: nextSel,
activeBreadcrumbGroup: null };
}), selectMany: organIds => set(state => ({
selectionUndoStack: [...state.selectionUndoStack.slice(-24), state.selectedOrganIds], selectionRedoStack: [],
selectedOrganIds: organIds.filter(id => id in state.organs), activeBreadcrumbGroup: null
})), addToSelection: organIds => set(state => {
const merged = new Set(state.selectedOrganIds); for (const id of organIds) {
if (id in state.organs) merged.add(id); }
return { selectionUndoStack: [...state.selectionUndoStack.slice(-24), state.selectedOrganIds],
selectionRedoStack: [], selectedOrganIds: [...merged]
}; }),
removeFromSelection: organIds => set(state => { const drop = new Set(organIds);
return { selectionUndoStack: [...state.selectionUndoStack.slice(-24), state.selectedOrganIds],
selectionRedoStack: [], selectedOrganIds: state.selectedOrganIds.filter(id => !drop.has(id))
}; }),
undoSelectionStep: () => set(state => { if (state.selectionUndoStack.length === 0) return state;
const prev = state.selectionUndoStack[state.selectionUndoStack.length - 1]!; return {
selectionUndoStack: state.selectionUndoStack.slice(0, -1), selectionRedoStack: [...state.selectionRedoStack.slice(-24), state.selectedOrganIds],
selectedOrganIds: prev };
}), redoSelectionStep: () => set(state => {
if (state.selectionRedoStack.length === 0) return state; const next = state.selectionRedoStack[state.selectionRedoStack.length - 1]!;
return { selectionRedoStack: state.selectionRedoStack.slice(0, -1),
selectionUndoStack: [...state.selectionUndoStack.slice(-24), state.selectedOrganIds], selectedOrganIds: next
}; }),
setMultiSelectMode: enabled => set(state => ({ multiSelectMode: enabled,
areaDrawMode: "none", selectionUndoStack: enabled ? [state.selectedOrganIds] : [],
selectionRedoStack: [] })),
setAreaDrawMode: mode => set({ areaDrawMode: mode
}), fadeSelection: () => set(state => {
if (state.selectedOrganIds.length === 0) return state; const allAlreadyFaded = state.selectedOrganIds.every(id => state.fadedOrganIds.includes(id));
const nextFaded = allAlreadyFaded ? state.fadedOrganIds.filter(id => !state.selectedOrganIds.includes(id)) : [...new Set([...state.fadedOrganIds, ...state.selectedOrganIds])]; return {
fadedOrganIds: nextFaded };
}), toggleFadeOthers: () => set(state => ({
fadeOthersActive: !state.fadeOthersActive })),
hideOthers: () => set(state => { if (state.selectedOrganIds.length === 0) return state;
const alreadyHiddenOthers = state.isolatedOrganIds !== null && state.isolatedOrganIds.length === state.selectedOrganIds.length && state.selectedOrganIds.every(id => state.isolatedOrganIds!.includes(id)); if (alreadyHiddenOthers) {
return { isolatedOrganIds: null
}; }
return { undoHistory: [...state.undoHistory.slice(-24), {
hiddenOrganIds: state.hiddenOrganIds, isolatedOrganIds: state.isolatedOrganIds,
selectedOrganIds: state.selectedOrganIds, hiddenSystems: state.hiddenSystems
}], isolatedOrganIds: [...state.selectedOrganIds]
}; }),
selectBreadcrumbGroup: node => set(state => { const sysMap: Record<string, AnatomicalSystem> = {
"skeletal system": "skeletal", "skeleton system": "skeletal",
"articular system": "articular", "connective tissue": "articular",
"muscular system": "muscular", "muscle system": "muscular",
"cardiovascular system": "cardiovascular", "arterial system": "cardiovascular",
"venous system": "cardiovascular", "lymphatic system": "lymphatic",
"nervous system": "nervous", "respiratory system": "respiratory",
"digestive system": "digestive", "endocrine system": "endocrine",
"urogenital system": "reproductive", "reproductive system": "reproductive",
"renal system": "renal", "integumentary system": "integumentary",
"regional anatomy": "regional" };
const lowNode = node.toLowerCase().trim(); const matchedSys = sysMap[lowNode] ?? (node as AnatomicalSystem);
let members: string[] = []; if (["skeletal", "articular", "muscular", "cardiovascular", "lymphatic", "nervous", "respiratory", "digestive", "endocrine", "reproductive", "renal", "integumentary", "regional"].includes(matchedSys)) {
members = Object.values(state.organs).filter(o => o.system === matchedSys && !state.hiddenOrganIds.includes(o.organ_id)).map(o => o.organ_id); } else {
members = regionMembersByNode(state.organs, node).filter(id => !state.hiddenOrganIds.includes(id)); }
if (members.length === 0) return state; return {
undoHistory: [...state.undoHistory.slice(-24), { hiddenOrganIds: state.hiddenOrganIds,
isolatedOrganIds: state.isolatedOrganIds, selectedOrganIds: state.selectedOrganIds,
hiddenSystems: state.hiddenSystems }],
selectedOrganIds: members, activeBreadcrumbGroup: node
}; }),
stepSystemLayer: (system, delta) => set(state => { const all = state.manifest?.systems.map(entry => entry.system) ?? ["articular", "cardiovascular", "digestive", "endocrine", "integumentary", "lymphatic", "muscular", "nervous", "regional", "renal", "reproductive", "respiratory", "skeletal"];
if (system === "skeletal") { const isSkelSolid = !state.hiddenSystems.includes("skeletal") && (state.systemOpacity.skeletal ?? 1) >= 0.5;
const currentSkelLevel = !isSkelSolid ? 0 : !state.hideConnective || !state.hiddenSystems.includes("articular") ? 2 : 1; const nextSkelLevel = Math.max(0, Math.min(2, currentSkelLevel + delta));
if (nextSkelLevel === 0) { const nextHidden = [...new Set([...state.hiddenSystems, "skeletal", ("articular" as AnatomicalSystem)])].sort();
return { hiddenSystems: nextHidden,
hideConnective: true, systemLayerLevel: {
...state.systemLayerLevel, skeletal: 0
} };
} const nextOpacity = {
...state.systemOpacity };
delete nextOpacity.skeletal; if (nextSkelLevel === 1) {
const baseHidden = state.initialShowcaseActive ? all.filter(s => s !== "skeletal") : state.hiddenSystems.filter(s => s !== "skeletal"); return {
initialShowcaseActive: false, hiddenSystems: [...new Set([...baseHidden, ("articular" as AnatomicalSystem)])].sort(),
hideConnective: true, systemOpacity: nextOpacity,
systemLayerLevel: { ...state.systemLayerLevel,
skeletal: 1 }
}; }
const baseHidden = state.initialShowcaseActive ? all.filter(s => s !== "skeletal" && s !== "articular") : state.hiddenSystems.filter(s => s !== "skeletal" && s !== "articular"); return {
initialShowcaseActive: false, hiddenSystems: baseHidden.sort(),
hideConnective: false, systemOpacity: nextOpacity,
systemLayerLevel: { ...state.systemLayerLevel,
skeletal: 2 }
}; }
const maxL = system === "muscular" ? 5 : 1; const isHidden = state.hiddenSystems.includes(system) || (state.systemOpacity[system] ?? 1) < 0.5;
const currentLevel = isHidden ? 0 : state.systemLayerLevel[system] ?? maxL; const nextLevel = Math.max(0, Math.min(maxL, currentLevel + delta));
if (nextLevel === 0) { return {
hiddenSystems: [...new Set([...state.hiddenSystems, system])].sort(), systemLayerLevel: {
...state.systemLayerLevel, [system]: 0
} };
} const nextOpacity = {
...state.systemOpacity };
delete nextOpacity[system]; const nextHidden = state.hiddenSystems.filter(s => s !== system);
const finalHidden = state.initialShowcaseActive ? all.filter(s => s !== system && s !== "skeletal").sort() : nextHidden; return {
initialShowcaseActive: false, hiddenSystems: finalHidden,
systemOpacity: nextOpacity, systemLayerLevel: {
...state.systemLayerLevel, [system]: nextLevel
} };
}), clearSelection: () => set({
selectedOrganIds: [], pinnedStack: null,
activeBreadcrumbGroup: null, fadeOthersActive: false,
multiSelectMode: false, areaDrawMode: "none"
}), setCaseMarks: marks => set({
caseMarks: marks }),
isolateSelection: () => set(state => state.selectedOrganIds.length === 0 ? state : { undoHistory: [...state.undoHistory.slice(-24), {
hiddenOrganIds: state.hiddenOrganIds, isolatedOrganIds: state.isolatedOrganIds,
selectedOrganIds: state.selectedOrganIds, hiddenSystems: state.hiddenSystems
}], isolatedOrganIds: [...state.selectedOrganIds]
}), hideSelection: () => set(state => {
if (state.selectedOrganIds.length === 0) return state; const hidden = new Set([...state.hiddenOrganIds, ...state.selectedOrganIds]);
let autoSelectDeepId: string | null = null; if (state.selectedOrganIds.includes("sternocostal_head_of_pectoralis_major_muscle_l") || state.selectedOrganIds.includes("clavicular_head_of_pectoralis_major_muscle_l")) {
hidden.add("sternocostal_head_of_pectoralis_major_muscle_l"); hidden.add("clavicular_head_of_pectoralis_major_muscle_l");
if (!hidden.has("pectoralis_minor_muscle_l") && state.organs["pectoralis_minor_muscle_l"]) { autoSelectDeepId = "pectoralis_minor_muscle_l";
} }
if (state.selectedOrganIds.includes("sternocostal_head_of_pectoralis_major_muscle_r") || state.selectedOrganIds.includes("clavicular_head_of_pectoralis_major_muscle_r")) { hidden.add("sternocostal_head_of_pectoralis_major_muscle_r");
hidden.add("clavicular_head_of_pectoralis_major_muscle_r"); if (!hidden.has("pectoralis_minor_muscle_r") && state.organs["pectoralis_minor_muscle_r"]) {
autoSelectDeepId = "pectoralis_minor_muscle_r"; }
} return {
undoHistory: [...state.undoHistory.slice(-24), { hiddenOrganIds: state.hiddenOrganIds,
isolatedOrganIds: state.isolatedOrganIds, selectedOrganIds: state.selectedOrganIds,
hiddenSystems: state.hiddenSystems }],
hiddenOrganIds: [...hidden], selectedOrganIds: autoSelectDeepId ? [autoSelectDeepId] : state.selectedOrganIds
}; }),
toggleOrganHidden: organId => set(state => { const organ = state.organs[organId];
const isCurrentlyHidden = state.hiddenOrganIds.includes(organId) || (organ ? state.hiddenSystems.includes(organ.system) : false) || state.isolatedOrganIds !== null && !state.isolatedOrganIds.includes(organId); if (isCurrentlyHidden) {
const nextHiddenOrgans = state.hiddenOrganIds.filter(id => id !== organId); const nextHiddenSystems = organ ? state.hiddenSystems.filter(s => s !== organ.system) : state.hiddenSystems;
return { hiddenOrganIds: nextHiddenOrgans,
hiddenSystems: nextHiddenSystems };
} else { return {
hiddenOrganIds: [...new Set([...state.hiddenOrganIds, organId])] };
} }),
toggleOrgansHidden: organIds => set(state => { const validIds = organIds.filter(id => Boolean(state.organs[id]));
if (validIds.length === 0) return state; const allVisible = validIds.every(id => {
const o = state.organs[id]!; return !state.hiddenOrganIds.includes(id) && !state.hiddenSystems.includes(o.system) && (state.isolatedOrganIds === null || state.isolatedOrganIds.includes(id));
}); if (allVisible) {
return { hiddenOrganIds: [...new Set([...state.hiddenOrganIds, ...validIds])]
}; } else {
const systemsToEnable = new Set<AnatomicalSystem>(); for (const id of validIds) {
const o = state.organs[id]; if (o) systemsToEnable.add(o.system);
} return {
hiddenOrganIds: state.hiddenOrganIds.filter(id => !validIds.includes(id)), hiddenSystems: state.hiddenSystems.filter(s => !systemsToEnable.has(s))
}; }
}), toggleConnectionKind: (organId, kind) => set(state => {
const target = state.organs[organId]; if (!target) return state;
const regionIds = regionMembers(state.organs, organId); const allKeywordIds = collectKeywordConnections(target, state.organs);
const kindKeywordIds = allKeywordIds.filter(id => state.organs[id]?.system === kind); const isSystemVisible = !state.hiddenSystems.includes(kind);
const hasKindInIsolation = state.isolatedOrganIds !== null && state.isolatedOrganIds.some(id => id !== organId && state.organs[id]?.system === kind); const isKindCurrentlyActive = isSystemVisible && (state.isolatedOrganIds === null ? target.system !== kind : hasKindInIsolation);
if (isKindCurrentlyActive) { const nextHiddenSystems = target.system === kind ? state.hiddenSystems : [...new Set([...state.hiddenSystems, kind])].sort();
const nextIsolated = state.isolatedOrganIds !== null ? state.isolatedOrganIds.filter(id => id === organId || state.organs[id]?.system !== kind) : null; return {
hiddenSystems: nextHiddenSystems, isolatedOrganIds: nextIsolated && nextIsolated.length > 0 ? nextIsolated : null
}; } else {
const baseSet = state.isolatedOrganIds !== null ? state.isolatedOrganIds : [organId, ...regionIds]; const combined = [...new Set([...baseSet, ...kindKeywordIds])];
const needSpatialSupply = kindKeywordIds.length === 0; const supplyKindMap: Record<"nervous" | "cardiovascular" | "lymphatic", SupplyKind> = {
nervous: "neural", cardiovascular: "vascular",
lymphatic: "lymphatic" };
const systemsToReveal = new Set<AnatomicalSystem>([target.system, kind]); return {
hiddenSystems: state.hiddenSystems.filter(s => !systemsToReveal.has(s)), hiddenOrganIds: state.hiddenOrganIds.filter(id => !combined.includes(id)),
selectedOrganIds: [organId], supplyRequest: needSpatialSupply ? {
kind: supplyKindMap[kind], seq: (state.supplyRequest?.seq ?? 0) + 1
} : null };
} }),
setMobileBodyRegion: region => set(state => { const all = state.manifest?.systems.map(entry => entry.system) ?? ["articular", "cardiovascular", "digestive", "endocrine", "integumentary", "lymphatic", "muscular", "nervous", "regional", "renal", "reproductive", "respiratory", "skeletal"];
const noActiveSystem = state.initialShowcaseActive || state.hiddenSystems.length >= all.length && state.hideConnective; const nextHiddenSystems = noActiveSystem ? all.filter(s => s !== "skeletal" && s !== "articular" && s !== "muscular").sort() : state.hiddenSystems;
const nextHideConnective = noActiveSystem ? false : state.hideConnective; const nextSystemOpacity = noActiveSystem ? {} : state.systemOpacity;
if (region === "all") { return {
initialShowcaseActive: false, hiddenSystems: nextHiddenSystems,
hideConnective: nextHideConnective, systemOpacity: nextSystemOpacity,
mobileBodyRegion: "all", isolatedOrganIds: null,
selectedOrganIds: [], viewpoint: {
kind: "fit", seq: (state.viewpoint?.seq ?? 0) + 1
} };
} const matchedIds: string[] = [];
for (const organ of Object.values(state.organs)) { const isConnectiveOrgan = state.connectiveIds.has(organ.organ_id);
const sysVisible = isConnectiveOrgan ? !nextHideConnective || !nextHiddenSystems.includes("skeletal") && (nextSystemOpacity.skeletal ?? 1) >= 0.5 : !nextHiddenSystems.includes(organ.system); if (!sysVisible) continue;
if (matchesMobileBodyRegion(organ, region)) { matchedIds.push(organ.organ_id);
} }
return { initialShowcaseActive: false,
hiddenSystems: nextHiddenSystems, hideConnective: nextHideConnective,
systemOpacity: nextSystemOpacity, mobileBodyRegion: region,
isolatedOrganIds: null, selectedOrganIds: [],
viewpoint: { kind: "fit",
seq: (state.viewpoint?.seq ?? 0) + 1 }
}; }),
unhideAll: () => set({ hiddenOrganIds: [],
fadedOrganIds: [], fadeOthersActive: false
}), undoLastStep: () => set(state => {
if (state.undoHistory.length > 0) { const last = state.undoHistory[state.undoHistory.length - 1]!;
return { undoHistory: state.undoHistory.slice(0, -1),
hiddenOrganIds: last.hiddenOrganIds, isolatedOrganIds: last.isolatedOrganIds,
selectedOrganIds: last.selectedOrganIds, hiddenSystems: last.hiddenSystems
}; }
if (state.hiddenOrganIds.length > 0) { const restoredId = state.hiddenOrganIds[state.hiddenOrganIds.length - 1]!;
return { hiddenOrganIds: state.hiddenOrganIds.slice(0, -1),
selectedOrganIds: [restoredId] };
} if (state.selectedOrganIds.length > 0) {
return { selectedOrganIds: []
}; }
if (state.isolatedOrganIds !== null) { const allSys = state.manifest ? state.manifest.systems.map(entry => entry.system).sort() : (["articular", "cardiovascular", "digestive", "endocrine", "integumentary", "lymphatic", "muscular", "nervous", "regional", "renal", "reproductive", "respiratory", "skeletal"] as AnatomicalSystem[]);
return { hiddenSystems: allSys,
hideConnective: true, isolatedOrganIds: null,
selectedOrganIds: [], mobileBodyRegion: "all"
}; }
return state; }),
studyOrganWithConnections: organId => set(state => { const target = state.organs[organId];
if (!target) return state; const regionIds = regionMembers(state.organs, organId);
const keywordIds = collectKeywordConnections(target, state.organs); const combined = [...new Set([organId, ...regionIds, ...keywordIds])];
const needSpatialFallback = combined.length <= 2; const systemsToEnable = new Set<AnatomicalSystem>([target.system]);
for (const id of combined) { const org = state.organs[id];
if (org) systemsToEnable.add(org.system); }
if (needSpatialFallback) { systemsToEnable.add("cardiovascular");
systemsToEnable.add("nervous"); systemsToEnable.add("lymphatic");
} const nextHiddenSystems = state.hiddenSystems.filter(sys => !systemsToEnable.has(sys));
return { undoHistory: [...state.undoHistory.slice(-24), {
hiddenOrganIds: state.hiddenOrganIds, isolatedOrganIds: state.isolatedOrganIds,
selectedOrganIds: state.selectedOrganIds, hiddenSystems: state.hiddenSystems
}], hiddenSystems: nextHiddenSystems,
hiddenOrganIds: state.hiddenOrganIds.filter(id => !combined.includes(id)), isolatedOrganIds: combined,
selectedOrganIds: [organId], focusRequest: {
organId, seq: (state.focusRequest?.seq ?? 0) + 1
}, supplyRequest: needSpatialFallback ? {
kind: "all", seq: (state.supplyRequest?.seq ?? 0) + 1
} : null, supplyResult: null
}; }),
focusOnOrgan: organId => set(state => ({ ...applySceneCommand(state, {
action: "focus_organ", organ_id: organId
}) })),
focusReference: (organId, index) => set(state => ({ ...applySceneCommand(state, {
action: "focus_organ", organ_id: organId
}), focusBadge: {
organId, index
} })),
applyCommand: command => set(state => { if (command.action === "isolate_group") {
return isolateGroupIn(state, command.group) ?? state; }
if (command.action === "add_supply") { return supplyRequestIn(state, command.kind);
} if (command.action === "set_heart_rhythm") {
startHeartRhythm(command.rhythm, command.sound ?? null); const hiddenSystems = state.hiddenSystems.filter(system => system !== "cardiovascular");
return hiddenSystems.length === state.hiddenSystems.length ? state : { hiddenSystems
}; }
return applySceneCommand(state, command); }),
toggleSystem: system => set(state => { const all = state.manifest?.systems.map(entry => entry.system) ?? ["articular", "cardiovascular", "digestive", "endocrine", "integumentary", "lymphatic", "muscular", "nervous", "regional", "renal", "reproductive", "respiratory", "skeletal"];
const isPrimaryVisible = !state.hiddenSystems.includes(system) && (state.systemOpacity[system] ?? 1) >= 0.5; if (isPrimaryVisible) {
const toHide = new Set<AnatomicalSystem>([...state.hiddenSystems, system, ...(system === "skeletal" ? (["articular"] as AnatomicalSystem[]) : [])]); const anyOtherPrimary = all.some(s => !toHide.has(s) && (state.systemOpacity[s] ?? 1) >= 0.5);
if (!anyOtherPrimary) { return {
initialShowcaseActive: true, hiddenSystems: [...all].sort(),
hideConnective: true, systemOpacity: {},
isolatedOrganIds: null, selectedOrganIds: [],
pinnedStack: null };
} return {
hiddenSystems: [...toHide].sort(), hideConnective: system === "skeletal" ? true : state.hideConnective,
isolatedOrganIds: null, selectedOrganIds: [],
pinnedStack: null };
} const isUrogenital = system === "reproductive" || system === "renal";
const isNervous = system === "nervous" || system === "lymphatic" || system === "cardiovascular" || system === "respiratory" || system === "digestive" || system === "renal" || system === "reproductive" || system === "endocrine"; const isSkeletal = system === "skeletal" || system === "articular";
if (state.genderModel === "female" && system !== "reproductive") { return {
...initialViewState, initialShowcaseActive: false,
genderModel: "male", pendingActiveSystem: system,
hiddenSystems: all.filter(entry => entry !== system && !(isUrogenital && (entry === "reproductive" || entry === "renal")) && !(isSkeletal && (entry === "skeletal" || entry === "articular")) && !(isNervous && (entry === "skeletal" || entry === "muscular"))).sort(), systemOpacity: isNervous ? {
skeletal: 0.18, muscular: 0.14
} : {}, hideConnective: !isSkeletal,
hoveredOrganId: null, depthStack: [],
pinnedStack: null, mobileBodyRegion: NON_REGIONAL_VISCERAL_SYSTEMS.has(nextTarget) ? "all" : state.mobileBodyRegion
}; }
const nextRegion = NON_REGIONAL_VISCERAL_SYSTEMS.has(system) ? "all" : state.mobileBodyRegion; let regionIsolated: string[] | null = null;
if (nextRegion !== "all") { const matched = Object.values(state.organs).filter(o => (o.system === system || isUrogenital && (o.system === "reproductive" || o.system === "renal") || isSkeletal && (o.system === "skeletal" || o.system === "articular" || state.connectiveIds.has(o.organ_id)) || isNervous && (o.system === "skeletal" || o.system === "muscular")) && matchesMobileBodyRegion(o, nextRegion)).map(o => o.organ_id);
if (matched.length > 0) regionIsolated = matched; }
return { initialShowcaseActive: false,
pendingActiveSystem: null, hiddenSystems: all.filter(entry => entry !== system && !(isUrogenital && (entry === "reproductive" || entry === "renal")) && !(isSkeletal && (entry === "skeletal" || entry === "articular")) && !(isNervous && (entry === "skeletal" || entry === "muscular"))).sort(),
systemOpacity: isNervous ? { skeletal: 0.18,
muscular: 0.14 } : {},
hideConnective: !isSkeletal, mobileBodyRegion: nextRegion,
isolatedOrganIds: null, selectedOrganIds: [],
pinnedStack: null, viewpoint: {
kind: "fit", seq: (state.viewpoint?.seq ?? 0) + 1
} };
}), soloSystem: system => set(state => {
const all = state.manifest?.systems.map(entry => entry.system) ?? ["articular", "cardiovascular", "digestive", "endocrine", "integumentary", "lymphatic", "muscular", "nervous", "regional", "renal", "reproductive", "respiratory", "skeletal"]; const isUrogenital = system === "reproductive" || system === "renal";
const isNervous = system === "nervous" || system === "lymphatic" || system === "cardiovascular" || system === "respiratory" || system === "digestive" || system === "renal" || system === "reproductive" || system === "endocrine"; const isSkeletal = system === "skeletal" || system === "articular";
if (state.genderModel === "female" && system !== "reproductive") { return {
...initialViewState, initialShowcaseActive: false,
genderModel: "male", pendingActiveSystem: system,
hiddenSystems: all.filter(entry => entry !== system && !(isUrogenital && (entry === "reproductive" || entry === "renal")) && !(isSkeletal && (entry === "skeletal" || entry === "articular")) && !(isNervous && (entry === "skeletal" || entry === "muscular"))).sort(), systemOpacity: isNervous ? {
skeletal: 0.18, muscular: 0.14
} : {}, hideConnective: !isSkeletal,
hoveredOrganId: null, depthStack: [],
pinnedStack: null, mobileBodyRegion: NON_REGIONAL_VISCERAL_SYSTEMS.has(nextTarget) ? "all" : state.mobileBodyRegion
}; }
const nextRegion = NON_REGIONAL_VISCERAL_SYSTEMS.has(system) ? "all" : state.mobileBodyRegion; let regionIsolated: string[] | null = null;
if (nextRegion !== "all") { const matched = Object.values(state.organs).filter(o => (o.system === system || isUrogenital && (o.system === "reproductive" || o.system === "renal") || isSkeletal && (o.system === "skeletal" || o.system === "articular" || state.connectiveIds.has(o.organ_id)) || isNervous && (o.system === "skeletal" || o.system === "muscular")) && matchesMobileBodyRegion(o, nextRegion)).map(o => o.organ_id);
if (matched.length > 0) regionIsolated = matched; }
return { initialShowcaseActive: false,
pendingActiveSystem: null, hiddenSystems: all.filter(entry => entry !== system && !(isUrogenital && (entry === "reproductive" || entry === "renal")) && !(isSkeletal && (entry === "skeletal" || entry === "articular")) && !(isNervous && (entry === "skeletal" || entry === "muscular"))).sort(),
systemOpacity: isNervous ? { skeletal: 0.18,
muscular: 0.14 } : {},
hideConnective: !isSkeletal, mobileBodyRegion: nextRegion,
isolatedOrganIds: null, selectedOrganIds: [],
pinnedStack: null, viewpoint: {
kind: "fit", seq: (state.viewpoint?.seq ?? 0) + 1
} };
}), cycleSystemOpacity: system => set(state => {
const next = { ...state.systemOpacity
}; const current = next[system] ?? 1;
const stop = GHOST_STOPS.findIndex(value => Math.abs(value - current) < 0.01); const chosen = GHOST_STOPS[(stop + 1) % GHOST_STOPS.length]!;
if (chosen >= 1) delete next[system];else next[system] = chosen; return {
systemOpacity: next };
}), xraySystem: system => set(state => {
const all = state.manifest?.systems.map(entry => entry.system) ?? []; const alreadyXray = state.systemOpacity[system] === undefined && all.every(entry => entry === system || state.systemOpacity[entry] !== undefined);
if (alreadyXray || all.length === 0) return { systemOpacity: {}
}; const ghosted: Partial<Record<AnatomicalSystem, number>> = {};
for (const entry of all) { if (entry !== system) ghosted[entry] = XRAY_OPACITY;
} return {
systemOpacity: ghosted };
}), toggleNervousBodyContext: () => set(state => {
const hasBodyContext = !state.hiddenSystems.includes("skeletal") || !state.hiddenSystems.includes("muscular"); if (hasBodyContext) {
const nextHidden = new Set<AnatomicalSystem>([...state.hiddenSystems, "skeletal", "muscular"]); const activeCtxSys = (["nervous", "lymphatic", "cardiovascular", "respiratory", "digestive", "renal", "reproductive", "endocrine"] as AnatomicalSystem[]).find(s => !state.hiddenSystems.includes(s)) ?? "nervous";
nextHidden.delete(activeCtxSys); const nextHiddenArr = [...nextHidden].sort();
const nextOpacity = { ...state.systemOpacity
}; delete nextOpacity.skeletal;
delete nextOpacity.muscular; let nextIsolated = state.isolatedOrganIds;
if (state.mobileBodyRegion !== "all") { const matched = Object.values(state.organs).filter(o => !nextHiddenArr.includes(o.system) && matchesMobileBodyRegion(o, state.mobileBodyRegion)).map(o => o.organ_id);
nextIsolated = state.isolatedOrganIds; }
return { hiddenSystems: nextHiddenArr,
systemOpacity: nextOpacity, isolatedOrganIds: nextIsolated
}; } else {
const activeCtxSys = (["nervous", "lymphatic", "cardiovascular", "respiratory", "digestive", "renal", "reproductive", "endocrine"] as AnatomicalSystem[]).find(s => !state.hiddenSystems.includes(s)) ?? "nervous"; const nextHiddenArr: AnatomicalSystem[] = state.hiddenSystems.filter(s => s !== "skeletal" && s !== "muscular" && s !== activeCtxSys);
let nextIsolated = state.isolatedOrganIds; if (state.mobileBodyRegion !== "all") {
const matched = Object.values(state.organs).filter(o => !nextHiddenArr.includes(o.system) && matchesMobileBodyRegion(o, state.mobileBodyRegion)).map(o => o.organ_id); nextIsolated = state.isolatedOrganIds;
} return {
hiddenSystems: nextHiddenArr, systemOpacity: {
...state.systemOpacity, skeletal: 0.18,
muscular: 0.14 },
isolatedOrganIds: nextIsolated };
} }),
clearGhosting: () => set({ systemOpacity: {}
}), glassBody: () => set(state => {
const all = state.manifest?.systems.map(entry => entry.system) ?? []; const alreadyGlass = all.length > 0 && all.every(entry => state.systemOpacity[entry] === GLASS_OPACITY);
if (alreadyGlass) return { systemOpacity: {}
}; const glass: Partial<Record<AnatomicalSystem, number>> = {};
for (const entry of all) glass[entry] = GLASS_OPACITY; return {
systemOpacity: glass };
}), setExplode: factor => set(state => {
const nextExplode = Number.isFinite(factor) ? Math.min(Math.max(factor, 0), MAX_EXPLODE) : 0; if (nextExplode > 0 && state.isolatedOrganIds !== null && state.isolatedOrganIds.length <= 1) {
if (state.mobileBodyRegion !== "all") { const matched: string[] = [];
for (const organ of Object.values(state.organs)) { if (state.hiddenSystems.includes(organ.system)) continue;
if (matchesMobileBodyRegion(organ, state.mobileBodyRegion)) { matched.push(organ.organ_id);
} }
return { explode: nextExplode,
isolatedOrganIds: matched.length >= 2 ? matched : null };
} return {
explode: nextExplode, isolatedOrganIds: null
}; }
return { explode: nextExplode
}; }),
cycleExplode: () => set(state => { const nextExplode = nextExplodeStop(state.explode);
if (nextExplode > 0 && state.isolatedOrganIds !== null && state.isolatedOrganIds.length <= 1) { if (state.mobileBodyRegion !== "all") {
const matched: string[] = []; for (const organ of Object.values(state.organs)) {
if (state.hiddenSystems.includes(organ.system)) continue; if (matchesMobileBodyRegion(organ, state.mobileBodyRegion)) {
matched.push(organ.organ_id); }
} return {
explode: nextExplode, isolatedOrganIds: matched.length >= 2 ? matched : null
}; }
return { explode: nextExplode,
isolatedOrganIds: null };
} return {
explode: nextExplode };
}), fitView: () => set(state => ({
viewpoint: { kind: "fit",
seq: (state.viewpoint?.seq ?? 0) + 1 }
})), orientView: view => set(state => ({
viewpoint: { kind: "orient",
view, seq: (state.viewpoint?.seq ?? 0) + 1
} })),
scanView: () => set(state => ({ viewpoint: {
kind: "scan", seq: (state.viewpoint?.seq ?? 0) + 1
} })),
dollyView: factor => set(state => ({ viewpoint: {
kind: "dolly", factor,
seq: (state.viewpoint?.seq ?? 0) + 1 }
})), clearPathway: () => set({
pathway: null }),
showAllSystems: () => set({ initialShowcaseActive: false,
hiddenSystems: [], hideConnective: false,
isolatedOrganIds: null, selectedOrganIds: [],
pinnedStack: null, hiddenOrganIds: [],
systemOpacity: {}, mobileBodyRegion: "all"
}), hideAllSystems: () => set(state => ({
initialShowcaseActive: true, hiddenSystems: state.manifest ? state.manifest.systems.map(entry => entry.system).sort() : ["articular", "cardiovascular", "digestive", "endocrine", "integumentary", "lymphatic", "muscular", "nervous", "regional", "renal", "reproductive", "respiratory", "skeletal"],
hideConnective: true, isolatedOrganIds: null,
selectedOrganIds: [], hiddenOrganIds: [],
systemOpacity: {}, explode: 0,
crossSection: null, mobileBodyRegion: "all"
})), studyRegion: organId => set(state => {
if (state.isolatedOrganIds !== null && state.isolatedOrganIds.length > 0 && !state.isolatedOrganIds.includes(organId)) { return state;
} return {
...applySceneCommand(state, { action: "focus_organ",
organ_id: organId })
}; }),
studyGroup: node => set(state => isolateGroupIn(state, node) ?? state), clearIsolation: () => set({
isolatedOrganIds: null, hiddenOrganIds: [],
supplyRequest: null, supplyResult: null,
mobileBodyRegion: "all" }),
requestSupply: kind => set(state => supplyRequestIn(state, kind)), resolveSupply: organIds => set(state => {
const kind = state.supplyRequest?.kind; if (!kind || state.isolatedOrganIds === null) {
return { supplyRequest: null
}; }
const merged = new Set(state.isolatedOrganIds); for (const id of organIds) merged.add(id);
return { isolatedOrganIds: [...merged],
supplyRequest: null, supplyResult: {
kind, added: merged.size - state.isolatedOrganIds.length
} };
}), cancelSupply: () => set({
supplyRequest: null }),
dropFromIsolation: organId => set(state => { if (state.isolatedOrganIds === null) return state;
const next = state.isolatedOrganIds.filter(id => id !== organId); return {
isolatedOrganIds: next.length === 0 ? null : next };
}), studyOrgan: organId => set(state => {
if (state.isolatedOrganIds !== null && state.isolatedOrganIds.length > 0 && !state.isolatedOrganIds.includes(organId)) { return state;
} return {
...applySceneCommand(state, { action: "focus_organ",
organ_id: organId })
}; }),
resetView: () => set(state => ({ ...applySceneCommand(state, {
action: "reset_view" }),
systemOpacity: {}, bodyTone: "solid",
mobileBodyRegion: "all" }))
})); export type VisibilityState = Pick<SceneStore, "hiddenSystems" | "isolatedOrganIds" | "hiddenOrganIds" | "hideConnective" | "connectiveIds"> & {
systemOpacity?: Partial<Record<AnatomicalSystem, number>>; systemLayerLevel?: Partial<Record<AnatomicalSystem, number>>;
selectedOrganIds?: string[]; mobileBodyRegion?: MobileBodyRegion;
}; const SURROUNDING_UNIMPORTANT_MEMBRANES = new Set<string>(["greater_omentum", "lesser_omentum", "mesocolon", "meso_appendix", "free_taenia", "mesocolic_taenia", "omental_taenia", "pleura", "spinal_dura", "falx_cerebri", "tentorium_cerebelli_l", "tentorium_cerebelli_r", "mucosa_of_nasal_cavity", "gingiva", "soft_palate", "uvula_of_palate", "broad_ligament_of_uterus", "vesico_uterine_pouch", "mesosalpinx_l", "mesosalpinx_r", "mesovarium_l", "mesovarium_r", "anterior_surface_of_uterus", "posterior_surface_of_uterus", "abdominal_ostium_of_uterine_tube", "cardinal_ligament_l", "cardinal_ligament_r", "uterosacral_ligament_l", "uterosacral_ligament_r"]);
export function muscleLayerDepth(organ: ManifestOrgan): number { const hay = `${organ.organ_id} ${organ.name_en} ${organ.ta2_latin}`.toLowerCase();
if (/\b(rotatores|multifidus|interspinales|intertransversarii|suboccipital|rectus_capitis|obliquus_capitis|transversus_abdominis|transversus_thoracis|innermost_intercostal|subcostal|diaphragm|pelvic_diaphragm|levator_ani|coccygeus|iliacus|psoas|quadratus_lumborum|subscapularis|vastus_intermedius|articularis|popliteus|pronator_quadratus|supinator|interossei|lumbrical|opponens|adductor_pollicis|adductor_brevis|piriformis|obturator|gemellus|quadratus_femoris|tibialis_posterior|flexor_digitorum_profundus|flexor_pollicis_longus)\b/.test(hay)) { return 1;
} if (/\b(semispinalis|longissimus|iliocostalis|spinalis|splenius|scalenus|longus_colli|longus_capitis|internal_intercostal|internal_abdominal_oblique|pectoralis_minor|subclavius|rhomboid|supraspinatus|infraspinatus|teres_minor|coracobrachialis|brachialis|anconeus|gluteus_minimus|pectineus|adductor_magnus|soleus|flexor_hallucis_longus|extensor_indicis|abductor_pollicis_longus|extensor_pollicis_brevis)\b/.test(hay)) {
return 2; }
if (/\b(external_intercostal|rectus_abdominis|pyramidalis|serratus_anterior|serratus_posterior|levator_scapulae|teres_major|gluteus_medius|adductor_longus|gracilis|semimembranosus|short_head_of_biceps|flexor_digitorum_superficialis|pronator_teres|extensor_carpi_radialis_brevis|peroneus_brevis|fibularis_brevis|extensor_hallucis_longus|plantaris)\b/.test(hay)) { return 3;
} if (/\b(biceps_brachii|triceps_brachii|brachioradialis|flexor_carpi|extensor_digitorum|extensor_carpi|rectus_femoris|vastus_lateralis|vastus_medialis|biceps_femoris|semitendinosus|tibialis_anterior|extensor_digitorum_longus|fibularis_longus|peroneus_longus|omohyoid|sternohyoid|sternothyroid|thyrohyoid|masseter|temporalis|buccinator)\b/.test(hay)) {
return 4; }
return 5; }
export function isOrganVisible(state: VisibilityState, organ: ManifestOrgan): boolean { if (state.hiddenOrganIds.includes(organ.organ_id)) return false;
if (state.isolatedOrganIds !== null && state.isolatedOrganIds.length > 0) { return state.isolatedOrganIds.includes(organ.organ_id);
} if (SURROUNDING_UNIMPORTANT_MEMBRANES.has(organ.organ_id)) return false;
if (organ.system === "skeletal" && state.systemOpacity && (state.systemOpacity.skeletal ?? 1) < 0.5 && organ.organ_id.startsWith("skel_")) { return false;
} if (state.connectiveIds.has(organ.organ_id)) {
const skelSolidVisible = !state.hiddenSystems.includes("skeletal") && (state.systemOpacity?.skeletal ?? 1) >= 0.5; if (state.hideConnective && !skelSolidVisible) return false;
} else { if (state.hiddenSystems.includes(organ.system)) return false;
} if (state.isolatedOrganIds !== null && !state.isolatedOrganIds.includes(organ.organ_id)) {
return false; }
if (state.mobileBodyRegion && state.mobileBodyRegion !== "all" && !NON_REGIONAL_VISCERAL_SYSTEMS.has(organ.system) && !state.selectedOrganIds?.includes(organ.organ_id)) { const anyVisceralActive = !state.hiddenSystems.includes("respiratory") || !state.hiddenSystems.includes("digestive") || !state.hiddenSystems.includes("endocrine") || !state.hiddenSystems.includes("reproductive") || !state.hiddenSystems.includes("renal");
const anySystemicPrimaryActive = !state.hiddenSystems.includes("skeletal") && (state.systemOpacity?.skeletal ?? 1) >= 0.5 || !state.hiddenSystems.includes("articular") || !state.hiddenSystems.includes("muscular") && (state.systemOpacity?.muscular ?? 1) >= 0.5 || !state.hiddenSystems.includes("nervous") || !state.hiddenSystems.includes("cardiovascular") || !state.hiddenSystems.includes("lymphatic"); if (!(anyVisceralActive && !anySystemicPrimaryActive)) {
if (!matchesMobileBodyRegion(organ, state.mobileBodyRegion)) { return false;
} }
} if (organ.system === "muscular" && (state.systemOpacity?.muscular ?? 1) >= 0.5 && state.isolatedOrganIds === null && !state.selectedOrganIds?.includes(organ.organ_id)) {
const muscLevel = state.systemLayerLevel?.muscular ?? 5; if (muscLevel < 5 && muscleLayerDepth(organ) > muscLevel) {
return false; }
} return true;
} export function organOpacity(state: Pick<SceneViewState, "systemOpacity"> & {
fadedOrganIds?: string[]; fadeOthersActive?: boolean;
selectedOrganIds?: string[]; }, organ: ManifestOrgan): number {
if (state.fadedOrganIds && state.fadedOrganIds.includes(organ.organ_id)) { return 0.22;
} if (state.fadeOthersActive && state.selectedOrganIds && state.selectedOrganIds.length > 0 && !state.selectedOrganIds.includes(organ.organ_id)) {
return 0.18; }
return state.systemOpacity[organ.system] ?? 1; }
export function regionMembers(organs: Record<string, ManifestOrgan>, organId: string): string[] { const root = organs[organId];
if (!root) return [organId]; const members = new Set<string>([organId, ...regionMembersByNode(organs, root.node)]);
return [...members]; }
export function regionMembersByNode(organs: Record<string, ManifestOrgan>, node: string): string[] { const members: string[] = [];
for (const organ of Object.values(organs)) { if (organ.path.includes(node) || organ.node === node) members.push(organ.organ_id);
} return members;
} export function groupNames(organs: ManifestOrgan[]): string[] {
const counts = new Map<string, number>(); for (const organ of organs) {
for (const node of organ.path) counts.set(node, (counts.get(node) ?? 0) + 1); }
return [...counts].filter(([, count]) => count > 1).map(([node]) => node).sort(); }
export function supplyRequestIn<T extends SceneViewState>(state: T, kind: SupplyKind): T | Partial<SceneViewState> { if (state.isolatedOrganIds === null) return state;
const systemsToReveal: readonly AnatomicalSystem[] = kind === "all" ? ALL_CONNECTION_SYSTEMS : [SUPPLY_SYSTEM[kind]]; return {
hiddenSystems: state.hiddenSystems.filter(entry => !systemsToReveal.includes(entry)), supplyRequest: {
kind, seq: (state.supplyRequest?.seq ?? 0) + 1
}, supplyResult: null
}; }
export function isolateGroupIn(state: SceneViewState & { organs: Record<string, ManifestOrgan>;
}, node: string): Partial<SceneViewState> | null { const members = regionMembersByNode(state.organs, node);
if (members.length === 0) return null; const firstOrgan = state.organs[members[0]!];
const targetSys = firstOrgan?.system; const allSys: AnatomicalSystem[] = ["articular", "cardiovascular", "digestive", "endocrine", "integumentary", "lymphatic", "muscular", "nervous", "regional", "renal", "reproductive", "respiratory", "skeletal"];
const keepNervousBody = targetSys === "nervous" && (!state.hiddenSystems.includes("skeletal") || !state.hiddenSystems.includes("muscular")); return {
...state, initialShowcaseActive: false,
selectedOrganIds: [], focusRequest: null,
systemOpacity: keepNervousBody ? state.systemOpacity : {}, hideConnective: true,
hiddenSystems: targetSys ? allSys.filter(s => s !== targetSys && !(keepNervousBody && (s === "skeletal" || s === "muscular"))) : state.hiddenSystems, isolatedOrganIds: keepNervousBody ? [...new Set([...members, ...Object.values(state.organs).filter(o => o.system === "skeletal" || o.system === "muscular").map(o => o.organ_id)])] : members,
viewpoint: { kind: "fit",
seq: (state.viewpoint?.seq ?? 0) + 1 }
}; }
const SIDE = /\s\((left|right)\)$/i; export function organSide(organ: Pick<ManifestOrgan, "name_en">): "left" | "right" | null {
const match = SIDE.exec(organ.name_en); return match ? (match[1]!.toLowerCase() as "left" | "right") : null;
} export function organLabel(organ: ManifestOrgan): string {
const primary = organ.name_en?.trim() || organ.ta2_latin?.trim() || organ.organ_id.replace(/_/g, " "); const latin = organ.ta2_latin?.trim() && organ.ta2_latin.trim().toLowerCase() !== primary.toLowerCase() ? organ.ta2_latin.trim() : null;
return [primary, latin, organ.qualifier].filter(Boolean).join(" · "); }
export function organSubtitle(organ: ManifestOrgan): string { return organ.name_en;
}
