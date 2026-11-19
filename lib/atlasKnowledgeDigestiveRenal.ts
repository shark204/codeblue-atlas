/**
 * Atlas Knowledge Base — Batch 5: Digestive & Renal/Urinary (original wording, concise)
 * File: lib/atlasKnowledgeDigestiveRenal.ts
 * Verify against your textbooks before publishing.
 */

export interface GutRenalEntry {
  id: string;
  system: "digestive" | "renal";
  group: string;
  name_en: string;
  name_ar: string;
  features: string;
  relations: string;
  clinical: string;
}

export const DIGESTIVE_KNOWLEDGE: GutRenalEntry[] = [
  { id: "tongue_salivary", system: "digestive", group: "Upper GI", name_en: "Tongue & salivary glands", name_ar: "اللسان والغدد اللعابية",
    features: "Tongue: intrinsic muscles (shape) and 4 extrinsic (genioglossus protrudes, hyoglossus depresses, styloglossus retracts, palatoglossus elevates). Parotid duct (Stensen) opens opposite upper 2nd molar; submandibular duct (Wharton) beside lingual frenulum; sublingual glands open by multiple ducts",
    relations: "Sensation: anterior 2/3 lingual (V3), taste chorda tympani (VII); posterior 1/3 both by IX; motor: XII (palatoglossus: X). Facial nerve branches lie within parotid; lingual nerve wraps under submandibular duct",
    clinical: "Submandibular stones are commonest (alkaline, viscous saliva); pain and swelling at meals. Parotid mumps: pain on chewing; parotid surgery risks facial nerve." },
  { id: "oesophagus", system: "digestive", group: "Upper GI", name_en: "Oesophagus", name_ar: "المريء",
    features: "~25 cm from C6 (cricoid) to cardia at T11; passes diaphragm at T10. Upper third striated, lower third smooth muscle. Constrictions: cricopharyngeus (~15 cm from incisors), aortic arch/left main bronchus (~25 cm), diaphragmatic hiatus (~40 cm)",
    relations: "Posterior to left atrium; right of descending aorta in the lower thorax. Venous drainage: upper → azygos; lower → left gastric (portosystemic anastomosis)",
    clinical: "Varices in portal hypertension; Barrett's metaplasia (squamous → columnar) after chronic reflux; achalasia (failure of LOS relaxation, bird-beak on barium); sliding hiatus hernia commonest. Squamous cancer upper/middle, adenocarcinoma lower." },
  { id: "peritoneum_omenta", system: "digestive", group: "Peritoneum", name_en: "Peritoneum, omenta & lesser sac", name_ar: "الصفاق والثرب والكيس الثرب",
    features: "Greater omentum hangs from greater curvature ('abdominal policeman'); lesser omentum (hepatogastric + hepatoduodenal ligaments). Lesser sac (omental bursa) communicates through the epiploic foramen of Winslow, which lies behind the free edge of the hepatoduodenal ligament",
    relations: "Retroperitoneal organs ('SAD PUCKER'): Suprarenals, Aorta/IVC, Duodenum (2nd–4th), Pancreas (except tail), Ureters, Colon (ascending, descending), Kidneys, Esophagus, Rectum",
    clinical: "Peritonitis: guarding, rebound. Fluid collects in the hepatorenal pouch (Morison's) when supine and the rectouterine/rectovesical pouch. Pringle manoeuvre compresses the portal triad at the foramen." },
  { id: "stomach", system: "digestive", group: "Upper GI", name_en: "Stomach", name_ar: "المعدة",
    features: "Cardia, fundus, body, pyloric antrum and canal; lesser and greater curvatures; incisura angularis. Rugae; parietal cells (HCl, intrinsic factor), chief cells (pepsinogen), G cells (gastrin) in antrum",
    relations: "Arteries: left & right gastric (lesser curvature), left & right gastroepiploic (greater), short gastrics from splenic. Vagal anterior (left) and posterior (right) trunks. Bed: pancreas, left kidney, spleen, transverse mesocolon",
    clinical: "Posterior duodenal ulcer erodes gastroduodenal artery (haemorrhage); gastric ulcer on lesser curvature may erode left gastric. Referred pain epigastric (T5–T9 foregut). Vagotomy reduces acid secretion; H. pylori causes most ulcers." },
  { id: "duodenum", system: "digestive", group: "Small intestine", name_en: "Duodenum", name_ar: "الاثنا عشر",
    features: "~25 cm, C-shaped around pancreatic head: D1 (superior; mobile cap), D2 (descending; major papilla with bile and pancreatic ducts), D3 (horizontal; crosses between SMA and aorta), D4 (ascending to duodenojejunal flexure at L2, suspended by ligament of Treitz)",
    relations: "Foregut–midgut junction at the major papilla (L2). Blood: superior pancreaticoduodenal (from gastroduodenal) and inferior (from SMA)",
    clinical: "SMA syndrome (D3 compression); duodenal atresia 'double bubble' (Down syndrome); Brunner's glands secrete alkaline mucus. Pancreatic head tumour obstructs CBD and duodenum." },
  { id: "jejunum_ileum", system: "digestive", group: "Small intestine", name_en: "Jejunum & ileum", name_ar: "الصائم واللفائفي",
    features: "Jejunum: thicker wall, prominent plicae circulares, long straight vasa recta, few arcades, little mesenteric fat. Ileum: Peyer's patches, more arcades and short vasa recta, more fat; absorbs B12 and bile salts",
    relations: "Mesentery root runs from duodenojejunal flexure (L2) to right sacroiliac joint; supplied by SMA branches and drained by SMV",
    clinical: "Meckel's diverticulum (rule of 2s: 2% population, 2 feet from ileocaecal valve, 2 inches long) may contain gastric tissue and bleed. Crohn's disease: terminal ileum, skip lesions, transmural. Volvulus around the SMA axis." },
  { id: "caecum_appendix", system: "digestive", group: "Large intestine", name_en: "Caecum & appendix", name_ar: "الأعور والزائدة الدودية",
    features: "Caecum: blind pouch with ileocaecal valve; appendix arises at convergence of the 3 taeniae coli (retrocaecal commonest position); mesoappendix carries the appendicular artery (from ileocolic)",
    relations: "McBurney's point: one-third from ASIS to umbilicus; visceral pain begins periumbilical (T10) then migrates to right iliac fossa (parietal peritoneum)",
    clinical: "Appendicitis: migratory pain, Rovsing's, psoas sign (retrocaecal), obturator sign (pelvic). Perforation risk rises after 24–48 h; appendicular artery is an end artery." },
  { id: "colon", system: "digestive", group: "Large intestine", name_en: "Colon", name_ar: "القولون",
    features: "Ascending, transverse, descending, sigmoid; taeniae coli, haustra, appendices epiploicae distinguish it from small bowel. Hepatic and splenic flexures; descending colon retroperitoneal; transverse and sigmoid intraperitoneal",
    relations: "Marginal artery of Drummond links SMA and IMA territories; watershed at splenic flexure. Midgut ends at distal two-thirds of transverse colon; hindgut then continues",
    clinical: "Ischaemic colitis in watershed areas; sigmoid volvulus (coffee-bean sign); diverticulosis commonly sigmoid; colorectal cancer: right-sided → anaemia, left-sided → obstruction and change in bowel habit." },
  { id: "rectum_anal_canal", system: "digestive", group: "Large intestine", name_en: "Rectum & anal canal", name_ar: "المستقيم وقناة الشرج",
    features: "Rectum begins at S3, 3 lateral curves with transverse folds (valves of Houston), no taeniae. Anal canal ~4 cm; pectinate line: above = endoderm, visceral innervation, internal haemorrhoids, drains to internal iliac nodes; below = ectoderm, pudendal (somatic) pain, external haemorrhoids, superficial inguinal nodes",
    relations: "Internal sphincter (smooth, involuntary), external sphincter (skeletal, inferior rectal nerve S4), puborectalis forms anorectal angle",
    clinical: "Internal haemorrhoids are painless bleeding; anal fissures usually posterior midline, painful (below pectinate line). Rectal examination palpates prostate/cervix. Supralevator vs ischioanal abscess." },
  { id: "liver", system: "digestive", group: "Liver & biliary", name_en: "Liver", name_ar: "الكبد",
    features: "Largest gland (~1.5 kg); right, left, caudate and quadrate lobes; Couinaud's 8 functional segments around hepatic and portal pedicles. Bare area contacts diaphragm; falciform ligament contains ligamentum teres; coronary and triangular ligaments",
    relations: "Dual blood supply: portal vein (~75%) and hepatic artery proper (~25%); hepatic veins drain into IVC. Porta hepatis: portal vein, hepatic artery, bile ducts, nerves, lymphatics. Spans right 5th intercostal space to right costal margin",
    clinical: "Cirrhosis → portal hypertension, ascites, varices, encephalopathy. Segmental resection follows Couinaud anatomy; right hepatectomy removes segments 5–8. Hepatic biopsy in the midaxillary line (right 8th–9th ICS)." },
  { id: "gallbladder_biliary", system: "digestive", group: "Liver & biliary", name_en: "Gallbladder & biliary tree", name_ar: "المرارة والقنوات الصفراوية",
    features: "Gallbladder: fundus, body, neck (Hartmann's pouch), cystic duct with spiral valve; stores ~50 mL bile. Right and left hepatic ducts → common hepatic duct + cystic duct → common bile duct (CBD) → joins main pancreatic duct at the ampulla (sphincter of Oddi)",
    relations: "Calot's triangle: cystic duct, common hepatic duct, liver edge; contains cystic artery (usually from right hepatic). CBD passes behind duodenum D1 and through pancreatic head",
    clinical: "Cholecystitis: Murphy's sign; gallstone ileus. Charcot's triad (fever, jaundice, RUQ pain) in cholangitis. Courvoisier's law: painless palpable gallbladder + jaundice suggests malignancy. Biliary colic refers to right scapula (phrenic/T7–T9). Cystic artery ligation during cholecystectomy." },
  { id: "pancreas", system: "digestive", group: "Liver & biliary", name_en: "Pancreas", name_ar: "البنكرياس",
    features: "Head (with uncinate process), neck, body, tail; retroperitoneal except tail (in splenorenal ligament). Main duct (Wirsung) joins CBD at ampulla; accessory duct (Santorini). Exocrine acini and endocrine islets (β insulin, α glucagon, δ somatostatin)",
    relations: "SMV and splenic vein unite behind the neck to form the portal vein; head in duodenal C-loop; aorta, SMA, left renal vein behind. Blood: gastroduodenal/superior and inferior pancreaticoduodenal arteries, splenic branches",
    clinical: "Head carcinoma → painless obstructive jaundice; pancreatitis pain radiates to back (relieved leaning forward); gallstones and alcohol are leading causes. Annular pancreas causes duodenal obstruction; Whipple procedure for head tumours." },
  { id: "gut_embryology_supply", system: "digestive", group: "Overview", name_en: "Foregut, midgut, hindgut supply", name_ar: "الأمعاء الأمامية والوسطى والخلفية",
    features: "Foregut (coeliac trunk, T12): oesophagus to D2, liver, gallbladder, pancreas, spleen. Midgut (SMA, L1): D2 to distal 2/3 transverse colon. Hindgut (IMA, L3): distal 1/3 transverse colon to upper anal canal",
    relations: "Autonomic: greater, lesser, least splanchnic nerves (T5–T12) to coeliac, superior mesenteric, aorticorenal ganglia; vagus parasympathetic to splenic flexure, pelvic splanchnics (S2–S4) beyond",
    clinical: "Referred pain: foregut epigastric, midgut periumbilical, hindgut suprapubic. Midgut malrotation → volvulus in neonates (bilious vomiting)." },
];

export const RENAL_KNOWLEDGE: GutRenalEntry[] = [
  { id: "kidney_position_relations", system: "renal", group: "Kidney", name_en: "Kidneys: position, coverings & relations", name_ar: "موضع الكليتين وعلاقاتهما",
    features: "Retroperitoneal at T12–L3; right 1–2 cm lower (liver). Hilum at L1–L2 (transpyloric plane). Layers: renal capsule, perirenal fat, renal (Gerota's) fascia, pararenal fat",
    relations: "Anterior right: liver, duodenum, hepatic flexure; left: stomach, spleen, pancreatic tail, splenic flexure. Posterior: diaphragm, psoas, quadratus lumborum, transversus abdominis; subcostal, iliohypogastric, ilioinguinal nerves; 12th rib and pleura at upper pole",
    clinical: "Renal biopsy through the posterior approach at the lower pole; loin-to-groin colic; perinephric abscess limited by Gerota's fascia; kidneys move ~3 cm with respiration." },
  { id: "kidney_internal_structure", system: "renal", group: "Kidney", name_en: "Kidney internal structure", name_ar: "التركيب الداخلي للكلية",
    features: "Cortex and medulla (8–18 pyramids); renal columns of Bertin; papillae drain into minor calyces → major calyces → renal pelvis → ureter",
    relations: "Nephron: renal corpuscle (glomerulus + Bowman's capsule), proximal tubule, loop of Henle, distal tubule, collecting duct; ~1 million nephrons per kidney; juxtaglomerular apparatus regulates renin",
    clinical: "Papillary necrosis (diabetes, NSAIDs, sickle cell). Polycystic kidney disease: bilateral cysts, berry aneurysms. Normal GFR ~125 mL/min." },
  { id: "renal_vasculature", system: "renal", group: "Kidney", name_en: "Renal vessels", name_ar: "أوعية الكلية",
    features: "Renal arteries arise from the aorta at L1–L2 (right passes behind IVC); five segmental end arteries (apical, upper, middle, lower, posterior) → interlobar → arcuate → interlobular. Left renal vein is longer, crosses in front of the aorta below SMA and receives left gonadal and suprarenal veins",
    relations: "Hilum from anterior to posterior: vein, artery, pelvis (VAP). Accessory renal arteries in ~25–30%",
    clinical: "Renal artery stenosis causes secondary hypertension; nutcracker syndrome (left renal vein squeezed between SMA and aorta); segmental infarcts since no collateral supply. Left testicular varicocele due to left gonadal vein draining into the left renal vein." },
  { id: "kidney_anomalies", system: "renal", group: "Kidney", name_en: "Common renal anomalies", name_ar: "الشذوذات الكلوية الشائعة",
    features: "Horseshoe kidney (fused lower poles), ectopic pelvic kidney, duplex ureter, renal agenesis, polycystic kidney",
    relations: "Horseshoe kidney's isthmus is held under the inferior mesenteric artery during ascent",
    clinical: "Horseshoe kidney is associated with Turner syndrome; predisposes to stones and infection. Bilateral agenesis causes oligohydramnios and Potter sequence." },
  { id: "ureter", system: "renal", group: "Ureter", name_en: "Ureter", name_ar: "الحالب",
    features: "~25 cm; abdominal part on psoas, crosses pelvic brim at the bifurcation of common iliac artery; pelvic part to bladder. Three narrowings: pelviureteric junction, pelvic brim, vesicoureteric junction",
    relations: "Gonadal vessels cross it anteriorly; 'water under the bridge': passes under uterine artery (female) and vas deferens (male). Blood from renal, gonadal, common iliac, internal iliac and vesical arteries",
    clinical: "Stones lodge at the narrowings: colic from loin to groin. Ureteric injury is a major risk in hysterectomy (uterine artery ligation). Referred to T11–L2 dermatomes." },
  { id: "bladder", system: "renal", group: "Lower urinary tract", name_en: "Urinary bladder", name_ar: "المثانة البولية",
    features: "Apex, body, fundus (base), neck; trigone is smooth-walled between two ureteric orifices and the internal urethral orifice; detrusor muscle; capacity ~400–600 mL; urothelium (transitional epithelium)",
    relations: "Empty bladder lies behind pubic symphysis (pelvic organ); in children and when distended rises into the abdomen. Peritoneum covers only the superior surface",
    clinical: "Suprapubic catheter or aspiration through the extraperitoneal space above the pubis. Intraperitoneal rupture (blow to a full bladder) vs extraperitoneal rupture (pelvic fracture). Urothelial carcinoma: painless haematuria, schistosomiasis → squamous." },
  { id: "micturition_innervation", system: "renal", group: "Lower urinary tract", name_en: "Bladder innervation & micturition", name_ar: "التحكم العصبي بالتبول",
    features: "Parasympathetic S2–S4 (pelvic splanchnic nerves) contract detrusor and relax internal sphincter; sympathetic T11–L2 relax detrusor and contract the bladder neck; pudendal nerve (S2–S4) controls external urethral sphincter (voluntary)",
    relations: "Storage via sympathetic and pudendal; voiding via pontine micturition centre and sacral parasympathetic",
    clinical: "Spinal cord injury above sacral level → automatic bladder; cauda equina injury → flaccid overflow. 'Sympathetic = store, parasympathetic = pee'." },
  { id: "urethra", system: "renal", group: "Lower urinary tract", name_en: "Male & female urethra", name_ar: "الإحليل",
    features: "Male ~20 cm: prostatic, membranous (narrowest, passes through urogenital diaphragm) and spongy parts (bulbar, penile); external meatus is the narrowest point. Female ~4 cm ending anterior to vagina",
    relations: "Prostatic urethra has the urethral crest and prostatic utricle with ejaculatory ducts opening; bulbourethral glands in the deep perineal pouch",
    clinical: "Straddle injury ruptures the bulbar urethra: blood at meatus, extravasation into the superficial perineal pouch (butterfly bruising). Pelvic fracture ruptures the membranous urethra: high-riding prostate. Short female urethra explains frequent UTIs." },
];

export const DIGESTIVE_RENAL_ALL: GutRenalEntry[] = [...DIGESTIVE_KNOWLEDGE, ...RENAL_KNOWLEDGE];
