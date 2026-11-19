'use client'; import type { AnatomicalSystem, AnatomyManifest, GenderModel, ManifestOrgan } from "./schemas";
export type { AnatomicalSystem, AnatomyManifest, GenderModel, ManifestOrgan } from "./schemas"; const MESH_BASE = "/anatomy/";
const MANIFEST_URL: Record<GenderModel, string> = { male: "/anatomy/manifest.json",
female: "/anatomy/manifest_female.json" };
const EXTRA_MALE_ORGANS: ManifestOrgan[] = [{ "organ_id": "ventricular_myocardium_wall",
"ta2_latin": "Myocardium ventriculare", "name_en": "Ventricular myocardium (heart wall)",
"system": "cardiovascular", "mesh_file": "cardiovascular_male.glb",
"node": "????????", "path": ["Heart", "Myocardium"]
}, { "organ_id": "vermiform_appendix_malt",
"ta2_latin": "Appendix vermiformis (MALT)", "name_en": "Vermiform appendix (gut-associated lymphoid tissue)",
"system": "lymphatic", "mesh_file": "digestive_male.glb",
"node": "Vermiform appendix", "path": ["Lymphoid organs", "MALT & Appendix"]
}, { "organ_id": "lymph_vessel_basilic_vein_l",
"ta2_latin": "Vas lymphaticum (Vena basilica)", "name_en": "Lymphatic collecting trunk along Basilic vein (left)",
"system": "lymphatic", "mesh_file": "cardiovascular_male.glb",
"node": "Basilic vein.l", "path": ["Lymphatic vessels & trunks", "Superficial & deep lymphatic trunks"]
}, { "organ_id": "lymph_vessel_basilic_vein_r",
"ta2_latin": "Vas lymphaticum (Vena basilica)", "name_en": "Lymphatic collecting trunk along Basilic vein (right)",
"system": "lymphatic", "mesh_file": "cardiovascular_male.glb",
"node": "Basilic vein.r", "path": ["Lymphatic vessels & trunks", "Superficial & deep lymphatic trunks"]
}, { "organ_id": "lymph_vessel_cephalic_vein_l",
"ta2_latin": "Vas lymphaticum (Vena cephalica)", "name_en": "Lymphatic collecting trunk along Cephalic vein (left)",
"system": "lymphatic", "mesh_file": "cardiovascular_male.glb",
"node": "Cephalic vein.l", "path": ["Lymphatic vessels & trunks", "Superficial & deep lymphatic trunks"]
}, { "organ_id": "lymph_vessel_cephalic_vein_r",
"ta2_latin": "Vas lymphaticum (Vena cephalica)", "name_en": "Lymphatic collecting trunk along Cephalic vein (right)",
"system": "lymphatic", "mesh_file": "cardiovascular_male.glb",
"node": "Cephalic vein.r", "path": ["Lymphatic vessels & trunks", "Superficial & deep lymphatic trunks"]
}, { "organ_id": "lymph_vessel_femoral_vein_l",
"ta2_latin": "Vas lymphaticum (Vena femoralis)", "name_en": "Lymphatic collecting trunk along Femoral vein (left)",
"system": "lymphatic", "mesh_file": "cardiovascular_male.glb",
"node": "Femoral vein.l", "path": ["Lymphatic vessels & trunks", "Superficial & deep lymphatic trunks"]
}, { "organ_id": "lymph_vessel_femoral_vein_r",
"ta2_latin": "Vas lymphaticum (Vena femoralis)", "name_en": "Lymphatic collecting trunk along Femoral vein (right)",
"system": "lymphatic", "mesh_file": "cardiovascular_male.glb",
"node": "Femoral vein.r", "path": ["Lymphatic vessels & trunks", "Superficial & deep lymphatic trunks"]
}, { "organ_id": "lymph_vessel_common_iliac_vein_l",
"ta2_latin": "Vas lymphaticum (Vena iliaca communis)", "name_en": "Lymphatic collecting trunk along Common iliac vein (left)",
"system": "lymphatic", "mesh_file": "cardiovascular_male.glb",
"node": "Common iliac vein.l", "path": ["Lymphatic vessels & trunks", "Superficial & deep lymphatic trunks"]
}, { "organ_id": "lymph_vessel_common_iliac_vein_r",
"ta2_latin": "Vas lymphaticum (Vena iliaca communis)", "name_en": "Lymphatic collecting trunk along Common iliac vein (right)",
"system": "lymphatic", "mesh_file": "cardiovascular_male.glb",
"node": "Common iliac vein.r", "path": ["Lymphatic vessels & trunks", "Superficial & deep lymphatic trunks"]
}, { "organ_id": "lymph_vessel_external_iliac_vein_l",
"ta2_latin": "Vas lymphaticum (Vena iliaca externa)", "name_en": "Lymphatic collecting trunk along External iliac vein (left)",
"system": "lymphatic", "mesh_file": "cardiovascular_male.glb",
"node": "External iliac vein.l", "path": ["Lymphatic vessels & trunks", "Superficial & deep lymphatic trunks"]
}, { "organ_id": "lymph_vessel_external_iliac_vein_r",
"ta2_latin": "Vas lymphaticum (Vena iliaca externa)", "name_en": "Lymphatic collecting trunk along External iliac vein (right)",
"system": "lymphatic", "mesh_file": "cardiovascular_male.glb",
"node": "External iliac vein.r", "path": ["Lymphatic vessels & trunks", "Superficial & deep lymphatic trunks"]
}, { "organ_id": "lymph_vessel_internal_iliac_vein_l",
"ta2_latin": "Vas lymphaticum (Vena iliaca interna)", "name_en": "Lymphatic collecting trunk along Internal iliac vein (left)",
"system": "lymphatic", "mesh_file": "cardiovascular_male.glb",
"node": "Internal iliac vein.l", "path": ["Lymphatic vessels & trunks", "Superficial & deep lymphatic trunks"]
}, { "organ_id": "lymph_vessel_internal_iliac_vein_r",
"ta2_latin": "Vas lymphaticum (Vena iliaca interna)", "name_en": "Lymphatic collecting trunk along Internal iliac vein (right)",
"system": "lymphatic", "mesh_file": "cardiovascular_male.glb",
"node": "Internal iliac vein.r", "path": ["Lymphatic vessels & trunks", "Superficial & deep lymphatic trunks"]
}, { "organ_id": "lymph_vessel_iliolumbar_vein_l",
"ta2_latin": "Vas lymphaticum (Vena iliolumbalis)", "name_en": "Lymphatic collecting trunk along Iliolumbar vein (left)",
"system": "lymphatic", "mesh_file": "cardiovascular_male.glb",
"node": "Iliolumbar vein.l", "path": ["Lymphatic vessels & trunks", "Superficial & deep lymphatic trunks"]
}, { "organ_id": "lymph_vessel_iliolumbar_vein_r",
"ta2_latin": "Vas lymphaticum (Vena iliolumbalis)", "name_en": "Lymphatic collecting trunk along Iliolumbar vein (right)",
"system": "lymphatic", "mesh_file": "cardiovascular_male.glb",
"node": "Iliolumbar vein.r", "path": ["Lymphatic vessels & trunks", "Superficial & deep lymphatic trunks"]
}, { "organ_id": "lymph_vessel_right_superior_intercostal_vein",
"ta2_latin": "Vas lymphaticum (Vena intercostalis superior dextra)", "name_en": "Lymphatic collecting trunk along Right superior intercostal vein",
"system": "lymphatic", "mesh_file": "cardiovascular_male.glb",
"node": "Right superior intercostal vein", "path": ["Lymphatic vessels & trunks", "Superficial & deep lymphatic trunks"]
}, { "organ_id": "lymph_vessel_left_superior_intercostal_vein",
"ta2_latin": "Vas lymphaticum (Vena intercostalis superior sinistra)", "name_en": "Lymphatic collecting trunk along Left superior intercostal vein",
"system": "lymphatic", "mesh_file": "cardiovascular_male.glb",
"node": "Left superior intercostal vein", "path": ["Lymphatic vessels & trunks", "Superficial & deep lymphatic trunks"]
}, { "organ_id": "lymph_vessel_right_ascending_lumbar_vein",
"ta2_latin": "Vas lymphaticum (Vena lumbalis ascendens dextra)", "name_en": "Lymphatic collecting trunk along Right ascending lumbar vein",
"system": "lymphatic", "mesh_file": "cardiovascular_male.glb",
"node": "Right ascending lumbar vein", "path": ["Lymphatic vessels & trunks", "Superficial & deep lymphatic trunks"]
}, { "organ_id": "lymph_vessel_left_ascending_lumbar_vein",
"ta2_latin": "Vas lymphaticum (Vena lumbalis ascendens sinistra)", "name_en": "Lymphatic collecting trunk along Left ascending lumbar vein",
"system": "lymphatic", "mesh_file": "cardiovascular_male.glb",
"node": "Left ascending lumbar vein", "path": ["Lymphatic vessels & trunks", "Superficial & deep lymphatic trunks"]
}, { "organ_id": "lymph_vessel_median_antebrachial_vein_l",
"ta2_latin": "Vas lymphaticum (Vena mediana antebrachii)", "name_en": "Lymphatic collecting trunk along Median antebrachial vein (left)",
"system": "lymphatic", "mesh_file": "cardiovascular_male.glb",
"node": "Median antebrachial vein.l", "path": ["Lymphatic vessels & trunks", "Superficial & deep lymphatic trunks"]
}, { "organ_id": "lymph_vessel_median_antebrachial_vein_r",
"ta2_latin": "Vas lymphaticum (Vena mediana antebrachii)", "name_en": "Lymphatic collecting trunk along Median antebrachial vein (right)",
"system": "lymphatic", "mesh_file": "cardiovascular_male.glb",
"node": "Median antebrachial vein.r", "path": ["Lymphatic vessels & trunks", "Superficial & deep lymphatic trunks"]
}, { "organ_id": "lymph_vessel_median_cubital_vein_l",
"ta2_latin": "Vas lymphaticum (Vena mediana cubiti)", "name_en": "Lymphatic collecting trunk along Median cubital vein (left)",
"system": "lymphatic", "mesh_file": "cardiovascular_male.glb",
"node": "Median cubital vein.l", "path": ["Lymphatic vessels & trunks", "Superficial & deep lymphatic trunks"]
}, { "organ_id": "lymph_vessel_median_cubital_vein_r",
"ta2_latin": "Vas lymphaticum (Vena mediana cubiti)", "name_en": "Lymphatic collecting trunk along Median cubital vein (right)",
"system": "lymphatic", "mesh_file": "cardiovascular_male.glb",
"node": "Median cubital vein.r", "path": ["Lymphatic vessels & trunks", "Superficial & deep lymphatic trunks"]
}, { "organ_id": "lymph_vessel_popliteal_vein_l",
"ta2_latin": "Vas lymphaticum (Vena poplitea)", "name_en": "Lymphatic collecting trunk along Popliteal vein (left)",
"system": "lymphatic", "mesh_file": "cardiovascular_male.glb",
"node": "Popliteal vein.l", "path": ["Lymphatic vessels & trunks", "Superficial & deep lymphatic trunks"]
}, { "organ_id": "lymph_vessel_popliteal_vein_r",
"ta2_latin": "Vas lymphaticum (Vena poplitea)", "name_en": "Lymphatic collecting trunk along Popliteal vein (right)",
"system": "lymphatic", "mesh_file": "cardiovascular_male.glb",
"node": "Popliteal vein.r", "path": ["Lymphatic vessels & trunks", "Superficial & deep lymphatic trunks"]
}, { "organ_id": "lymph_vessel_deep_femoral_vein_l",
"ta2_latin": "Vas lymphaticum (Vena profunda femoris)", "name_en": "Lymphatic collecting trunk along Deep femoral vein (left)",
"system": "lymphatic", "mesh_file": "cardiovascular_male.glb",
"node": "Deep femoral vein.l", "path": ["Lymphatic vessels & trunks", "Superficial & deep lymphatic trunks"]
}, { "organ_id": "lymph_vessel_deep_femoral_vein_r",
"ta2_latin": "Vas lymphaticum (Vena profunda femoris)", "name_en": "Lymphatic collecting trunk along Deep femoral vein (right)",
"system": "lymphatic", "mesh_file": "cardiovascular_male.glb",
"node": "Deep femoral vein.r", "path": ["Lymphatic vessels & trunks", "Superficial & deep lymphatic trunks"]
}, { "organ_id": "lymph_vessel_great_saphenous_vein_l",
"ta2_latin": "Vas lymphaticum (Vena saphena magna)", "name_en": "Lymphatic collecting trunk along Great saphenous vein (left)",
"system": "lymphatic", "mesh_file": "cardiovascular_male.glb",
"node": "Great saphenous vein.l", "path": ["Lymphatic vessels & trunks", "Superficial & deep lymphatic trunks"]
}, { "organ_id": "lymph_vessel_great_saphenous_vein_r",
"ta2_latin": "Vas lymphaticum (Vena saphena magna)", "name_en": "Lymphatic collecting trunk along Great saphenous vein (right)",
"system": "lymphatic", "mesh_file": "cardiovascular_male.glb",
"node": "Great saphenous vein.r", "path": ["Lymphatic vessels & trunks", "Superficial & deep lymphatic trunks"]
}, { "organ_id": "lymph_vessel_small_saphenous_vein_l",
"ta2_latin": "Vas lymphaticum (Vena saphena parva)", "name_en": "Lymphatic collecting trunk along Small saphenous vein (left)",
"system": "lymphatic", "mesh_file": "cardiovascular_male.glb",
"node": "Small saphenous vein.l", "path": ["Lymphatic vessels & trunks", "Superficial & deep lymphatic trunks"]
}, { "organ_id": "lymph_vessel_small_saphenous_vein_r",
"ta2_latin": "Vas lymphaticum (Vena saphena parva)", "name_en": "Lymphatic collecting trunk along Small saphenous vein (right)",
"system": "lymphatic", "mesh_file": "cardiovascular_male.glb",
"node": "Small saphenous vein.r", "path": ["Lymphatic vessels & trunks", "Superficial & deep lymphatic trunks"]
}, { "organ_id": "lymph_vessel_brachial_veins_l",
"ta2_latin": "Vas lymphaticum (Venae brachiales)", "name_en": "Lymphatic collecting trunk along Brachial veins (left)",
"system": "lymphatic", "mesh_file": "cardiovascular_male.glb",
"node": "Brachial veins.l", "path": ["Lymphatic vessels & trunks", "Superficial & deep lymphatic trunks"]
}, { "organ_id": "lymph_vessel_brachial_veins_r",
"ta2_latin": "Vas lymphaticum (Venae brachiales)", "name_en": "Lymphatic collecting trunk along Brachial veins (right)",
"system": "lymphatic", "mesh_file": "cardiovascular_male.glb",
"node": "Brachial veins.r", "path": ["Lymphatic vessels & trunks", "Superficial & deep lymphatic trunks"]
}, { "organ_id": "lymph_vessel_lateral_circumflex_femoral_veins_l",
"ta2_latin": "Vas lymphaticum (Venae circumflexae laterales femoris)", "name_en": "Lymphatic collecting trunk along Lateral circumflex femoral veins (left)",
"system": "lymphatic", "mesh_file": "cardiovascular_male.glb",
"node": "Lateral circumflex femoral veins.l", "path": ["Lymphatic vessels & trunks", "Superficial & deep lymphatic trunks"]
}, { "organ_id": "lymph_vessel_lateral_circumflex_femoral_veins_r",
"ta2_latin": "Vas lymphaticum (Venae circumflexae laterales femoris)", "name_en": "Lymphatic collecting trunk along Lateral circumflex femoral veins (right)",
"system": "lymphatic", "mesh_file": "cardiovascular_male.glb",
"node": "Lateral circumflex femoral veins.r", "path": ["Lymphatic vessels & trunks", "Superficial & deep lymphatic trunks"]
}, { "organ_id": "lymph_vessel_medial_circumflex_femoral_veins_l",
"ta2_latin": "Vas lymphaticum (Venae circumflexae mediales femoris)", "name_en": "Lymphatic collecting trunk along Medial circumflex femoral veins (left)",
"system": "lymphatic", "mesh_file": "cardiovascular_male.glb",
"node": "Medial circumflex femoral veins.l", "path": ["Lymphatic vessels & trunks", "Superficial & deep lymphatic trunks"]
}, { "organ_id": "lymph_vessel_medial_circumflex_femoral_veins_r",
"ta2_latin": "Vas lymphaticum (Venae circumflexae mediales femoris)", "name_en": "Lymphatic collecting trunk along Medial circumflex femoral veins (right)",
"system": "lymphatic", "mesh_file": "cardiovascular_male.glb",
"node": "Medial circumflex femoral veins.r", "path": ["Lymphatic vessels & trunks", "Superficial & deep lymphatic trunks"]
}, { "organ_id": "lymph_vessel_dorsal_digital_veins_of_hand_l",
"ta2_latin": "Vas lymphaticum (Venae digitales dorsales manus)", "name_en": "Lymphatic collecting trunk along Dorsal digital veins of hand (left)",
"system": "lymphatic", "mesh_file": "cardiovascular_male.glb",
"node": "Dorsal digital veins of hand.l", "path": ["Lymphatic vessels & trunks", "Superficial & deep lymphatic trunks"]
}, { "organ_id": "lymph_vessel_dorsal_digital_veins_of_hand_r",
"ta2_latin": "Vas lymphaticum (Venae digitales dorsales manus)", "name_en": "Lymphatic collecting trunk along Dorsal digital veins of hand (right)",
"system": "lymphatic", "mesh_file": "cardiovascular_male.glb",
"node": "Dorsal digital veins of hand.r", "path": ["Lymphatic vessels & trunks", "Superficial & deep lymphatic trunks"]
}, { "organ_id": "lymph_vessel_dorsal_digital_veins_of_foot_l",
"ta2_latin": "Vas lymphaticum (Venae digitales dorsales pedis)", "name_en": "Lymphatic collecting trunk along Dorsal digital veins of foot (left)",
"system": "lymphatic", "mesh_file": "cardiovascular_male.glb",
"node": "Dorsal digital veins of foot.l", "path": ["Lymphatic vessels & trunks", "Superficial & deep lymphatic trunks"]
}, { "organ_id": "lymph_vessel_dorsal_digital_veins_of_foot_r",
"ta2_latin": "Vas lymphaticum (Venae digitales dorsales pedis)", "name_en": "Lymphatic collecting trunk along Dorsal digital veins of foot (right)",
"system": "lymphatic", "mesh_file": "cardiovascular_male.glb",
"node": "Dorsal digital veins of foot.r", "path": ["Lymphatic vessels & trunks", "Superficial & deep lymphatic trunks"]
}, { "organ_id": "lymph_vessel_palmar_digital_veins_l",
"ta2_latin": "Vas lymphaticum (Venae digitales palmares)", "name_en": "Lymphatic collecting trunk along Palmar digital veins (left)",
"system": "lymphatic", "mesh_file": "cardiovascular_male.glb",
"node": "Palmar digital veins.l", "path": ["Lymphatic vessels & trunks", "Superficial & deep lymphatic trunks"]
}, { "organ_id": "lymph_vessel_palmar_digital_veins_r",
"ta2_latin": "Vas lymphaticum (Venae digitales palmares)", "name_en": "Lymphatic collecting trunk along Palmar digital veins (right)",
"system": "lymphatic", "mesh_file": "cardiovascular_male.glb",
"node": "Palmar digital veins.r", "path": ["Lymphatic vessels & trunks", "Superficial & deep lymphatic trunks"]
}, { "organ_id": "lymph_vessel_plantar_digital_veins_l",
"ta2_latin": "Vas lymphaticum (Venae digitales plantares)", "name_en": "Lymphatic collecting trunk along Plantar digital veins (left)",
"system": "lymphatic", "mesh_file": "cardiovascular_male.glb",
"node": "Plantar digital veins.l", "path": ["Lymphatic vessels & trunks", "Superficial & deep lymphatic trunks"]
}, { "organ_id": "lymph_vessel_plantar_digital_veins_r",
"ta2_latin": "Vas lymphaticum (Venae digitales plantares)", "name_en": "Lymphatic collecting trunk along Plantar digital veins (right)",
"system": "lymphatic", "mesh_file": "cardiovascular_male.glb",
"node": "Plantar digital veins.r", "path": ["Lymphatic vessels & trunks", "Superficial & deep lymphatic trunks"]
}, { "organ_id": "lymph_vessel_fibular_veins_l",
"ta2_latin": "Vas lymphaticum (Venae fibulares)", "name_en": "Lymphatic collecting trunk along Fibular veins (left)",
"system": "lymphatic", "mesh_file": "cardiovascular_male.glb",
"node": "Fibular veins.l", "path": ["Lymphatic vessels & trunks", "Superficial & deep lymphatic trunks"]
}, { "organ_id": "lymph_vessel_fibular_veins_r",
"ta2_latin": "Vas lymphaticum (Venae fibulares)", "name_en": "Lymphatic collecting trunk along Fibular veins (right)",
"system": "lymphatic", "mesh_file": "cardiovascular_male.glb",
"node": "Fibular veins.r", "path": ["Lymphatic vessels & trunks", "Superficial & deep lymphatic trunks"]
}, { "organ_id": "opponens_digiti_minimi_of_foot_l",
"ta2_latin": "Musculus opponens digiti minimi pedis", "name_en": "Opponens digiti minimi muscle of foot (left)",
"system": "muscular", "mesh_file": "nervous_male.glb",
"node": "(Opponens digiti minimi muscle of foot).l", "path": ["Muscular system of lower limb", "Muscles of foot"]
}, { "organ_id": "opponens_digiti_minimi_of_foot_r",
"ta2_latin": "Musculus opponens digiti minimi pedis", "name_en": "Opponens digiti minimi muscle of foot (right)",
"system": "muscular", "mesh_file": "nervous_male.glb",
"node": "(Opponens digiti minimi muscle of foot).r", "path": ["Muscular system of lower limb", "Muscles of foot"]
}, { "organ_id": "endocrine_hypothalamus",
"ta2_latin": "Hypothalamus", "name_en": "Hypothalamus",
"system": "endocrine", "mesh_file": "endocrine_male.glb",
"node": "Adenohypophysis", "path": ["Major endocrine glands", "Hypothalamus & Pituitary"]
}, { "organ_id": "endocrine_thymus_right_lobe",
"ta2_latin": "Lobus dexter thymi", "name_en": "Thymus \u2014 Right lobe",
"system": "endocrine", "mesh_file": "lymphatic_male.glb",
"node": "Right lobe of thymus", "path": ["Major endocrine glands", "Thymus"]
}, { "organ_id": "endocrine_thymus_left_lobe",
"ta2_latin": "Lobus sinister thymi", "name_en": "Thymus \u2014 Left lobe",
"system": "endocrine", "mesh_file": "lymphatic_male.glb",
"node": "Left lobe of thymus", "path": ["Major endocrine glands", "Thymus"]
}, { "organ_id": "endocrine_pancreas",
"ta2_latin": "Pancreas (Insulae pancreaticae)", "name_en": "Pancreas (Islets of Langerhans)",
"system": "endocrine", "mesh_file": "digestive_male.glb",
"node": "Pancreas", "path": ["Major endocrine glands", "Pancreas"]
}, { "organ_id": "endocrine_pancreatic_duct",
"ta2_latin": "Ductus pancreaticus", "name_en": "Main pancreatic duct",
"system": "endocrine", "mesh_file": "digestive_male.glb",
"node": "Pancreatic duct", "path": ["Major endocrine glands", "Pancreas"]
}, { "organ_id": "endocrine_testis_r",
"ta2_latin": "Testis dexter", "name_en": "Right testis (Endocrine gonad)",
"system": "endocrine", "mesh_file": "reproductive_male.glb",
"node": "Testis.r", "path": ["Major endocrine glands", "Gonads (Testes)"]
}, { "organ_id": "endocrine_testis_l",
"ta2_latin": "Testis sinister", "name_en": "Left testis (Endocrine gonad)",
"system": "endocrine", "mesh_file": "reproductive_male.glb",
"node": "Testis.l", "path": ["Major endocrine glands", "Gonads (Testes)"]
}, { "organ_id": "skel_tendon_distal_quadriceps_l",
"ta2_latin": "Tendo musculi quadricipitis femoris (sinister)", "name_en": "Quadriceps femoris tendon (left)",
"system": "muscular", "mesh_file": "muscular_male.glb",
"node": "Rectus femoris muscle.l", "path": ["Tendons, Sheaths & Retinacula", "Tendons of lower limb"]
}, { "organ_id": "skel_tendon_distal_quadriceps_r",
"ta2_latin": "Tendo musculi quadricipitis femoris (dexter)", "name_en": "Quadriceps femoris tendon (right)",
"system": "muscular", "mesh_file": "muscular_male.glb",
"node": "Rectus femoris muscle.r", "path": ["Tendons, Sheaths & Retinacula", "Tendons of lower limb"]
}, { "organ_id": "skel_tendon_distal_patellar_l",
"ta2_latin": "Ligamentum patellae (sinistrum)", "name_en": "Patellar ligament / tendon (left)",
"system": "muscular", "mesh_file": "muscular_male.glb",
"node": "Rectus femoris muscle.l", "path": ["Tendons, Sheaths & Retinacula", "Tendons of lower limb"]
}, { "organ_id": "skel_tendon_distal_patellar_r",
"ta2_latin": "Ligamentum patellae (dextrum)", "name_en": "Patellar ligament / tendon (right)",
"system": "muscular", "mesh_file": "muscular_male.glb",
"node": "Rectus femoris muscle.r", "path": ["Tendons, Sheaths & Retinacula", "Tendons of lower limb"]
}, { "organ_id": "skel_tendon_distal_biceps_l",
"ta2_latin": "Tendo distalis musculi bicipitis brachii (sinister)", "name_en": "Distal biceps brachii tendon (left)",
"system": "muscular", "mesh_file": "muscular_male.glb",
"node": "Short head of biceps brachii.l", "path": ["Tendons, Sheaths & Retinacula", "Tendons of upper limb"]
}, { "organ_id": "skel_tendon_distal_biceps_r",
"ta2_latin": "Tendo distalis musculi bicipitis brachii (dexter)", "name_en": "Distal biceps brachii tendon (right)",
"system": "muscular", "mesh_file": "muscular_male.glb",
"node": "Short head of biceps brachii.r", "path": ["Tendons, Sheaths & Retinacula", "Tendons of upper limb"]
}, { "organ_id": "skel_tendon_distal_triceps_l",
"ta2_latin": "Tendo musculi tricipitis brachii (sinister)", "name_en": "Triceps brachii olecranon tendon (left)",
"system": "muscular", "mesh_file": "muscular_male.glb",
"node": "Long head of triceps brachii.l", "path": ["Tendons, Sheaths & Retinacula", "Tendons of upper limb"]
}, { "organ_id": "skel_tendon_distal_triceps_r",
"ta2_latin": "Tendo musculi tricipitis brachii (dexter)", "name_en": "Triceps brachii olecranon tendon (right)",
"system": "muscular", "mesh_file": "muscular_male.glb",
"node": "Long head of triceps brachii.r", "path": ["Tendons, Sheaths & Retinacula", "Tendons of upper limb"]
}, { "organ_id": "skel_tendon_distal_fds_l",
"ta2_latin": "Tendines musculi flexoris digitorum superficialis (sinistri)", "name_en": "Flexor digitorum superficialis tendons of wrist & hand (left)",
"system": "muscular", "mesh_file": "muscular_male.glb",
"node": "Humero-ulnar head of flexor digitorum superficialis.l", "path": ["Tendons, Sheaths & Retinacula", "Tendons of upper limb"]
}, { "organ_id": "skel_tendon_distal_fds_r",
"ta2_latin": "Tendines musculi flexoris digitorum superficialis (dextri)", "name_en": "Flexor digitorum superficialis tendons of wrist & hand (right)",
"system": "muscular", "mesh_file": "muscular_male.glb",
"node": "Humero-ulnar head of flexor digitorum superficialis.r", "path": ["Tendons, Sheaths & Retinacula", "Tendons of upper limb"]
}, { "organ_id": "skel_tendon_distal_fdp_l",
"ta2_latin": "Tendines musculi flexoris digitorum profundi (sinistri)", "name_en": "Flexor digitorum profundus tendons of wrist & hand (left)",
"system": "muscular", "mesh_file": "muscular_male.glb",
"node": "Flexor digitorum profundus.l", "path": ["Tendons, Sheaths & Retinacula", "Tendons of upper limb"]
}, { "organ_id": "skel_tendon_distal_fdp_r",
"ta2_latin": "Tendines musculi flexoris digitorum profundi (dextri)", "name_en": "Flexor digitorum profundus tendons of wrist & hand (right)",
"system": "muscular", "mesh_file": "muscular_male.glb",
"node": "Flexor digitorum profundus.r", "path": ["Tendons, Sheaths & Retinacula", "Tendons of upper limb"]
}, { "organ_id": "skel_tendon_distal_fpl_l",
"ta2_latin": "Tendo musculi flexoris pollicis longi (sinister)", "name_en": "Flexor pollicis longus tendon (left)",
"system": "muscular", "mesh_file": "muscular_male.glb",
"node": "Flexor pollicis longus.l", "path": ["Tendons, Sheaths & Retinacula", "Tendons of upper limb"]
}, { "organ_id": "skel_tendon_distal_fpl_r",
"ta2_latin": "Tendo musculi flexoris pollicis longi (dexter)", "name_en": "Flexor pollicis longus tendon (right)",
"system": "muscular", "mesh_file": "muscular_male.glb",
"node": "Flexor pollicis longus.r", "path": ["Tendons, Sheaths & Retinacula", "Tendons of upper limb"]
}, { "organ_id": "skel_tendon_distal_ed_l",
"ta2_latin": "Tendines musculi extensoris digitorum (sinistri)", "name_en": "Extensor digitorum tendons of wrist & hand (left)",
"system": "muscular", "mesh_file": "muscular_male.glb",
"node": "Extensor digitorum.l", "path": ["Tendons, Sheaths & Retinacula", "Tendons of upper limb"]
}, { "organ_id": "skel_tendon_distal_ed_r",
"ta2_latin": "Tendines musculi extensoris digitorum (dextri)", "name_en": "Extensor digitorum tendons of wrist & hand (right)",
"system": "muscular", "mesh_file": "muscular_male.glb",
"node": "Extensor digitorum.r", "path": ["Tendons, Sheaths & Retinacula", "Tendons of upper limb"]
}, { "organ_id": "skel_tendon_distal_ta_l",
"ta2_latin": "Tendo musculi tibialis anterioris (sinister)", "name_en": "Tibialis anterior ankle tendon (left)",
"system": "muscular", "mesh_file": "muscular_male.glb",
"node": "Tibialis anterior muscle.l", "path": ["Tendons, Sheaths & Retinacula", "Tendons of lower limb"]
}, { "organ_id": "skel_tendon_distal_ta_r",
"ta2_latin": "Tendo musculi tibialis anterioris (dexter)", "name_en": "Tibialis anterior ankle tendon (right)",
"system": "muscular", "mesh_file": "muscular_male.glb",
"node": "Tibialis anterior muscle.r", "path": ["Tendons, Sheaths & Retinacula", "Tendons of lower limb"]
}, { "organ_id": "skel_tendon_distal_ehl_l",
"ta2_latin": "Tendo musculi extensoris hallucis longi (sinister)", "name_en": "Extensor hallucis longus tendon (left)",
"system": "muscular", "mesh_file": "muscular_male.glb",
"node": "Extensor hallucis longus.l", "path": ["Tendons, Sheaths & Retinacula", "Tendons of lower limb"]
}, { "organ_id": "skel_tendon_distal_ehl_r",
"ta2_latin": "Tendo musculi extensoris hallucis longi (dexter)", "name_en": "Extensor hallucis longus tendon (right)",
"system": "muscular", "mesh_file": "muscular_male.glb",
"node": "Extensor hallucis longus.r", "path": ["Tendons, Sheaths & Retinacula", "Tendons of lower limb"]
}, { "organ_id": "skel_tendon_distal_fdl_l",
"ta2_latin": "Tendines musculi flexoris digitorum longi (sinistri)", "name_en": "Flexor digitorum longus tendons of ankle & foot (left)",
"system": "muscular", "mesh_file": "muscular_male.glb",
"node": "Flexor digitorum longus.l", "path": ["Tendons, Sheaths & Retinacula", "Tendons of lower limb"]
}, { "organ_id": "skel_tendon_distal_fdl_r",
"ta2_latin": "Tendines musculi flexoris digitorum longi (dextri)", "name_en": "Flexor digitorum longus tendons of ankle & foot (right)",
"system": "muscular", "mesh_file": "muscular_male.glb",
"node": "Flexor digitorum longus.r", "path": ["Tendons, Sheaths & Retinacula", "Tendons of lower limb"]
}, { "organ_id": "skel_tendon_distal_fhl_l",
"ta2_latin": "Tendo musculi flexoris hallucis longi (sinister)", "name_en": "Flexor hallucis longus tendon (left)",
"system": "muscular", "mesh_file": "muscular_male.glb",
"node": "Flexor hallucis longus.l", "path": ["Tendons, Sheaths & Retinacula", "Tendons of lower limb"]
}, { "organ_id": "skel_tendon_distal_fhl_r",
"ta2_latin": "Tendo musculi flexoris hallucis longi (dexter)", "name_en": "Flexor hallucis longus tendon (right)",
"system": "muscular", "mesh_file": "muscular_male.glb",
"node": "Flexor hallucis longus.r", "path": ["Tendons, Sheaths & Retinacula", "Tendons of lower limb"]
}, { "organ_id": "nervous_pineal_gland",
"ta2_latin": "Glandula pinealis (Corpus pineale)", "name_en": "Pineal gland (Epithalamus)",
"system": "nervous", "mesh_file": "endocrine_male.glb",
"node": "Pineal gland", "path": ["Central nervous system", "Brain", "Diencephalon", "Epithalamus & Hypophysis"]
}, { "organ_id": "nervous_adenohypophysis",
"ta2_latin": "Adenohypophysis (Lobus anterior)", "name_en": "Pituitary gland \u2014 Anterior lobe (Adenohypophysis)",
"system": "nervous", "mesh_file": "endocrine_male.glb",
"node": "Adenohypophysis", "path": ["Central nervous system", "Brain", "Diencephalon", "Epithalamus & Hypophysis"]
}, { "organ_id": "nervous_neurohypophysis",
"ta2_latin": "Neurohypophysis (Lobus posterior)", "name_en": "Pituitary gland \u2014 Posterior lobe (Neurohypophysis)",
"system": "nervous", "mesh_file": "endocrine_male.glb",
"node": "Neurohypophysis", "path": ["Central nervous system", "Brain", "Diencephalon", "Epithalamus & Hypophysis"]
}]; export const TENDON_REGEX = /\b(aponeurosis|iliotibial|inguinal ligament|patellar ligament|calcaneal|achilles|tendo|tendon|tendons|tendinis|retinaculum|sheath|sheaths|vincula|chiasm)\b/i;
function normalizeSkeletalOrgan(organ: ManifestOrgan): ManifestOrgan { const oid = organ.organ_id;
const nameLow = `${organ.name_en} ${organ.ta2_latin}`.toLowerCase(); const p0 = organ.path?.[0] ?? "";
let nextPath = organ.path ? [...organ.path] : []; if (nextPath.join(" > ") === "Cranium > Bones of cranium > Maxilla > Right maxilla") {
const isLeft = /\b(left|_l$)\b/i.test(`${organ.name_en} ${oid}`); nextPath = ["Cranium", "Viscerocranium (Facial skeleton)", isLeft ? "Left maxilla & upper teeth" : "Right maxilla & upper teeth"];
} else if (nextPath.join(" > ") === "Extracranial bones of head > Mandible") { nextPath = ["Cranium", "Viscerocranium (Facial skeleton)", "Mandible & lower teeth"];
} else if (p0 === "Skeletal system") { nextPath = ["Cranium", "Neurocranium (Cranial vault & base)", "Ethmoidal labyrinth & air cells"];
} else if (p0 === "Axial skeleton" && nextPath.length === 1) { if (/\b(malleus|incus|stapes)\b/i.test(nameLow)) {
nextPath = ["Cranium", "Auditory ossicles (Middle ear)"]; } else if (/\b(alar cartilage|nasal septal cartilage|lateral process of nasal)\b/i.test(nameLow)) {
nextPath = ["Cranium", "Nasal cartilages"]; } else if (/\b(thyroid cartilage|cricoid cartilage|arytenoid cartilage|corniculate cartilage)\b/i.test(nameLow)) {
nextPath = ["Axial skeleton", "Laryngeal cartilages"]; } else if (/\b(sacrum|coccyx)\b/i.test(nameLow)) {
nextPath = ["Vertebral column", "Bones of vertebral column", "Sacrum & Coccyx"]; } else if (/\b(frontal|parietal|occipital|temporal|sphenoid|ethmoid)\b/i.test(nameLow)) {
nextPath = ["Cranium", "Neurocranium (Cranial vault & base)"]; } else {
nextPath = ["Cranium", "Viscerocranium (Facial skeleton)"]; }
} else if (p0 === "Appendicular skeleton" && nextPath.length === 1) { if (/\b(hip bone|ilium|ischium|pubis)\b/i.test(nameLow)) {
nextPath = ["Bones of lower limb", "Bones of pelvic girdle"]; } else if (/\b(humerus|radius|ulna)\b/i.test(nameLow)) {
nextPath = ["Bones of upper limb", "Bones of free upper limb", "Arm & Forearm (Humerus, Radius, Ulna)"]; } else if (/\b(scaphoid|lunate|triquetr|pisiform|trapezium|trapezoid|capitate|hamate)\b/i.test(nameLow)) {
nextPath = ["Bones of upper limb", "Bones of free upper limb", "Carpal bones (Wrist)"]; } else if (/\bmetacarpal\b/i.test(nameLow)) {
nextPath = ["Bones of upper limb", "Bones of free upper limb", "Metacarpal bones (Hand)"]; } else if (/\bphalanx\b/i.test(nameLow)) {
nextPath = ["Bones of upper limb", "Bones of free upper limb", "Phalanges of hand (Fingers)"]; }
} else if (nextPath.join(" > ") === "Bones of lower limb > Bones of free lower limb") { if (/\b(femur|patella|tibia|fibula)\b/i.test(nameLow)) {
nextPath = ["Bones of lower limb", "Bones of free lower limb", "Thigh & Leg (Femur, Patella, Tibia, Fibula)"]; } else if (/\b(talus|calcaneus|navicular|cuboid|cuneiform)\b/i.test(nameLow)) {
nextPath = ["Bones of lower limb", "Bones of free lower limb", "Tarsal bones (Ankle & Hindfoot)"]; } else if (/\bmetatarsal\b/i.test(nameLow)) {
nextPath = ["Bones of lower limb", "Bones of free lower limb", "Metatarsal bones (Foot)"]; } else if (/\b(phalanx|sesamoid)\b/i.test(nameLow)) {
nextPath = ["Bones of lower limb", "Bones of free lower limb", "Phalanges of foot (Toes)"]; }
} else if (p0 === "Vertebral column" && nextPath.length === 1) { if (/\b(intervertebral disc|nucleus pulposus|sacrococcygeal symphysis)\b/i.test(nameLow)) {
nextPath = ["Vertebral column", "Intervertebral discs & Nucleus pulposus (C2–S1)"]; } else {
nextPath = ["Vertebral column", "Vertebral & Costovertebral ligaments"]; }
} return {
...organ, path: nextPath
}; }
function normalizeArticularOrgan(organ: ManifestOrgan): ManifestOrgan { let nextPath = organ.path ? [...organ.path] : ["Joints"];
const nameLow = `${organ.name_en} ${organ.ta2_latin}`.toLowerCase(); if (/\bmedial meniscus\b/i.test(nameLow) && nextPath[nextPath.length - 1] === "Lateral meniscus") {
nextPath = [...nextPath.slice(0, -1), "Medial meniscus"]; } else if (nextPath.length === 1 && nextPath[0] === "Joints") {
nextPath = ["Joints", "Synovial capsules & folds"]; }
return { ...organ,
path: nextPath };
} function normalizeNervousOrgan(organ: ManifestOrgan): ManifestOrgan {
let nextName = organ.name_en; let nextPath = organ.path ? [...organ.path] : ["Central nervous system"];
const oid = organ.organ_id; const nameLow = `${organ.name_en} ${organ.ta2_latin}`.toLowerCase();
const pathJoined = nextPath.join(" > "); if (oid === "cochlear_nerve") {
nextName = "Cochlear nerve (right)"; } else if (oid === "common_plantar_digital_branches_of_medial_plantar_nerve") {
nextName = "Common plantar digital branches of medial plantar nerve (right)"; } else if (oid === "central_canal_2") {
nextName = "Central canal of spinal cord (inferior segment)"; }
if (pathJoined === "Peripheral nervous system > Nerves") { if (/\btrochlear nerve\b/i.test(nameLow)) {
nextPath = ["Peripheral nervous system", "Cranial nerves", "Trochlear nerve (IV)"]; } else if (/\babducens nerve\b/i.test(nameLow)) {
nextPath = ["Peripheral nervous system", "Cranial nerves", "Abducens nerve (VI)"]; } else if (/\bpudendal nerve\b/i.test(nameLow)) {
nextPath = ["Peripheral nervous system", "Spinal nerves", "Lumbosacral plexus", "Sacral plexus", "Pudendal nerve (S2–S4)"]; } else {
nextPath = ["Peripheral nervous system", "Spinal nerves", "Lumbosacral plexus", "Sacral plexus"]; }
} if (pathJoined === "Peripheral nervous system > Cranial nerves > Trigeminal nerve (V)") {
if (/\bophthalmic\b/i.test(nameLow)) { nextPath = ["Peripheral nervous system", "Cranial nerves", "Trigeminal nerve (V)", "Ophthalmic nerve (V1)"];
} else if (/\bmaxillary\b/i.test(nameLow)) { nextPath = ["Peripheral nervous system", "Cranial nerves", "Trigeminal nerve (V)", "Maxillary nerve (V2)"];
} else if (/\b(mandibular|alveolar|lingual|buccal|mental|mylohyoid)\b/i.test(nameLow)) { nextPath = ["Peripheral nervous system", "Cranial nerves", "Trigeminal nerve (V)", "Mandibular nerve (V3)"];
} }
if (pathJoined.includes("Femoral nerve > Saphenous nerve")) { if (/\b(medial sural|sural nerve)\b/i.test(nameLow)) {
nextPath = ["Peripheral nervous system", "Spinal nerves", "Lumbosacral plexus", "Sacral plexus", "Sciatic nerve", "Tibial nerve", "Sural nerve & cutaneous branches"]; } else if (/\bsural communicating\b/i.test(nameLow)) {
nextPath = ["Peripheral nervous system", "Spinal nerves", "Lumbosacral plexus", "Sacral plexus", "Sciatic nerve", "Common fibular nerve"]; }
} if (pathJoined === "Peripheral nervous system > Spinal nerves > Lumbosacral plexus > Sacral plexus > Sciatic nerve" && /\b(superior gluteal|piriformis)\b/i.test(nameLow)) {
nextPath = ["Peripheral nervous system", "Spinal nerves", "Lumbosacral plexus", "Sacral plexus"]; }
if (/\bmedial pectoral nerve\b/i.test(nameLow)) { nextPath = ["Peripheral nervous system", "Spinal nerves", "Brachial plexus", "Branches of medial cord of brachial plexus", "Medial pectoral nerve"];
} if (pathJoined.startsWith("Peripheral nervous system > Spinal nerves > Lumbar nerves")) {
nextPath = ["Peripheral nervous system", "Spinal nerves", "Lumbosacral plexus", "Lumbar plexus", "Iliohypogastric & Ilio-inguinal nerves (L1)"]; } else if (pathJoined === "Peripheral nervous system" && /\bspinal ganglion\b/i.test(nameLow)) {
nextPath = ["Peripheral nervous system", "Spinal nerves", "Dorsal root ganglia (Spinal ganglia)"]; }
if (nextPath[1] === "Automatic division of peripheral nervous system") { nextPath = ["Peripheral nervous system", "Autonomic nervous system (ANS)", "Sympathetic nervous system (Thoracolumbar outflow)", "Sympathetic trunk & ganglia"];
} if (pathJoined === "Central nervous system > Brain > Cerebrum > Telencephalon > Cortical gyri and sulci") {
if (/\b(cingulate|parahippocampal)\b/i.test(nameLow)) { nextPath = ["Central nervous system", "Brain", "Cerebrum", "Telencephalon", "Limbic lobe (Cingulate & Parahippocampal)"];
} else if (/\binsula\b/i.test(nameLow)) { nextPath = ["Central nervous system", "Brain", "Cerebrum", "Telencephalon", "Insular lobe (Insula)"];
} else if (/\b(occipital|lunate)\b/i.test(nameLow) && !/\boccipitotemporal\b/i.test(nameLow)) { nextPath = ["Central nervous system", "Brain", "Cerebrum", "Telencephalon", "Occipital lobe"];
} else if (/\b(temporal|occipitotemporal|lateral sulcus)\b/i.test(nameLow)) { nextPath = ["Central nervous system", "Brain", "Cerebrum", "Telencephalon", "Temporal lobe"];
} else if (/\b(jensen|paracentral)\b/i.test(nameLow)) { nextPath = ["Central nervous system", "Brain", "Cerebrum", "Telencephalon", "Parietal lobe"];
} else { nextPath = ["Central nervous system", "Brain", "Cerebrum", "Telencephalon", "Frontal lobe"];
} } else if (pathJoined === "Central nervous system > Brain > Cerebrum > Telencephalon") {
if (/\b(caudate|putamen|globus pallidus|lentiform)\b/i.test(nameLow)) { nextPath = ["Central nervous system", "Brain", "Cerebrum", "Basal ganglia (Corpus striatum)"];
} else if (/\b(hippocamp|amygdal|fornix|stria terminalis|septal)\b/i.test(nameLow)) { nextPath = ["Central nervous system", "Brain", "Cerebrum", "Limbic system (Hippocampus, Amygdala & Fornix)"];
} else { nextPath = ["Central nervous system", "Brain", "Cerebrum", "Commissural tracts (Corpus callosum & Commissures)"];
} }
if (pathJoined === "Central nervous system > Spinal cord") { if (/\b(horn|nucleus|intermediate substance|reticular process|central canal)\b/i.test(nameLow)) {
nextPath = ["Central nervous system", "Spinal cord", "Grey matter horns, nuclei & central canal"]; } else if (/\b(gracile|cuneate|spinothalamic|spinocerebellar|spinotectal|posterolateral)\b/i.test(nameLow)) {
nextPath = ["Central nervous system", "Spinal cord", "Ascending sensory tracts (Dorsal columns & Spinothalamic)"]; } else if (/\b(corticospinal|rubrospinal|reticulospinal|vestibulospinal|tectospinal|fasciculus proprius|white matter)\b/i.test(nameLow)) {
nextPath = ["Central nervous system", "Spinal cord", "Descending motor & propriospinal tracts"]; } else {
nextPath = ["Central nervous system", "Spinal cord", "Spinal nerve roots & Cauda equina"]; }
} nextPath = nextPath.map(seg => seg === "Eye*" ? "Eye & Lacrimal apparatus" : seg === "Eyeball" ? "Eye & Lacrimal apparatus" : seg === "Lacrimal canliculus" ? "Lacrimal canaliculus" : seg);
if (pathJoined === "Sense organs > Eyeball") { nextPath = ["Sense organs", "Eye & Lacrimal apparatus", "Eyeball (Bulbus oculi)"];
} else if (pathJoined === "Sense organs") { nextPath = ["Sense organs", "Ear", "Middle ear & Auditory tube"];
} return {
...organ, name_en: nextName,
path: nextPath };
} function normalizeCardiovascularOrgan(organ: ManifestOrgan): ManifestOrgan {
const idLow = organ.organ_id.toLowerCase(); const nameLow = `${organ.organ_id} ${organ.name_en} ${organ.ta2_latin}`.toLowerCase();
const sideMatch = organ.name_en.match(/\((left|right)\)\s*$/i); const sideSuffix = sideMatch ? ` (${sideMatch[1].toLowerCase()})` : "";
let name_en = organ.name_en; let ta2_latin = organ.ta2_latin;
if (/^deep_brachial_artery_(l|r)$/i.test(idLow)) { name_en = `Profunda brachii (Deep brachial) artery${sideSuffix}`;
ta2_latin = "Arteria profunda brachii"; } else if (/^radial_collateral_artery_(l|r)$/i.test(idLow)) {
name_en = `Radial collateral artery${sideSuffix}`; ta2_latin = "Arteria collateralis radialis";
} else if (/^middle_collateral_artery_(l|r)$/i.test(idLow)) { name_en = `Middle collateral artery${sideSuffix}`;
ta2_latin = "Arteria collateralis media"; } else if (/^recurrent_interosseous_artery_(l|r)$/i.test(idLow)) {
name_en = `Posterior interosseous recurrent artery${sideSuffix}`; ta2_latin = "Arteria interossea recurrens";
} else if (/^ulnar_recurrent_artery_(l|r)$/i.test(idLow)) { name_en = `Ulnar recurrent artery${sideSuffix}`;
} else if (/^superior_ulnar_collateral_artery_(l|r)$/i.test(idLow)) { name_en = `Superior ulnar collateral artery${sideSuffix}`;
} else if (/^inferior_ulnar_collateral_artery_(l|r)$/i.test(idLow)) { name_en = `Inferior ulnar collateral artery${sideSuffix}`;
} else if (/^posterior_circumflex_humeral_artery_(l|r)$/i.test(idLow)) { name_en = `Posterior circumflex humeral artery${sideSuffix}`;
} else if (/^anterior_circumflex_humeral_artery_(l|r)$/i.test(idLow)) { name_en = `Anterior circumflex humeral artery${sideSuffix}`;
} else if (/^deep_femoral_artery_(l|r)$/i.test(idLow)) { name_en = `Profunda femoris (Deep femoral) artery${sideSuffix}`;
ta2_latin = "Arteria profunda femoris"; }
const p0 = organ.path?.[0] ?? ""; if (p0 === "Heart" || /\b(atrium|ventricle|auricle|myocard|endocard|epicard|pericard|valve|cusp|chordae|papillary|septum|trabecul|conus_arteriosus|sinuatrial|atrioventricular|coronary|cardiac_vein|marginal_branch|interventricular)\b/i.test(nameLow)) {
if (/\b(coronary|cardiac_vein|interventricular_branch|marginal_branch|circumflex_branch_of_left_coronary|conus_branch|sinuatrial_nodal)\b/i.test(nameLow)) { return {
...organ, name_en,
ta2_latin, path: ["Heart", "Cardiac vessels", "Coronary Arteries & Cardiac Veins"]
}; }
return { ...organ,
name_en, ta2_latin,
path: ["Heart", "Heart Chambers, Valves & Conduction System"] };
} const isVein = p0 === "Systemic veins" || p0 === "Portal venous system" || /\b(vein|vena|venae|sinus|azygos|hemiazygos|saphenous|cephalic|basilic|jugular|cava)\b/i.test(nameLow);
if (!isVein) { if (/\b(subclavian|axillary|brachial|profunda_brachii|deep_brachial|circumflex_humeral|thoraco_acromial|thoracoacromial|lateral_thoracic|subscapular|suprascapular|circumflex_scapular|thoracodorsal|internal_thoracic)\b/i.test(nameLow)) {
return { ...organ,
name_en, ta2_latin,
path: ["Systemic arteries", "Upper Limb — Subclavian, Axillary, Brachial & Profunda brachii"] };
} if (/\b(radial|ulnar|interosseous|collateral_artery|recurrent_artery|recurrent_interosseous|palmar_arch|carpal_branch|metacarpal_artery|digital_artery_of_hand|princeps_pollicis|radialis_indicis)\b/i.test(nameLow)) {
return { ...organ,
name_en, ta2_latin,
path: ["Systemic arteries", "Upper Limb — Elbow Anastomosis, Radial, Ulnar & Hand Arches"] };
} if (/\b(carotid|vertebral_artery|basilar|cerebral_artery|communicating_artery|cerebellar_artery|ophthalmic|maxillary|facial_artery|lingual_artery|occipital_artery|superficial_temporal|meningeal|thyroid_artery|pharyngeal|choroidal|striate|frontobasal|prefrontal|pericallosal|callosomarginal|angular_gyrus|central_sulcus)\b/i.test(nameLow)) {
return { ...organ,
name_en, ta2_latin,
path: ["Systemic arteries", "Head, Neck, Carotid & Circle of Willis Arteries"] };
} if (/\b(celiac|coeliac|gastric|splenic_artery|hepatic_artery|gastroduodenal|gastroomental|gastroepiploic|pancreaticoduodenal|cystic_artery|mesenteric|jejunal|ileal|ileocolic|appendicular|colic|sigmoid_arter|rectal_arter|renal_artery|suprarenal_artery|testicular_artery|ovarian_artery)\b/i.test(nameLow)) {
return { ...organ,
name_en, ta2_latin,
path: ["Systemic arteries", "Abdominal — Celiac Trunk, SMA, IMA, Renal & Visceral Arteries"] };
} if (/\b(iliac|femoral|profunda_femoris|perforating_femoral|popliteal|genicular|tibial|fibular|peroneal|dorsalis_pedis|arcuate_artery|plantar|metatarsal|gluteal|pudendal|obturator_artery|vesical|uterine|vaginal|umbilical|epigastric|circumflex_iliac)\b/i.test(nameLow)) {
return { ...organ,
name_en, ta2_latin,
path: ["Systemic arteries", "Pelvis & Lower Limb — Iliac, Femoral, Profunda femoris, Popliteal & Tibial"] };
} return {
...organ, name_en,
ta2_latin, path: ["Systemic arteries", "Aorta, Pulmonary Trunk & Thoracic Segmental Arteries"]
}; }
if (/\b(portal|splenic_vein|mesenteric_vein|gastric_vein|cystic_vein|paraumbilical)\b/i.test(nameLow)) { return {
...organ, name_en,
ta2_latin, path: ["Systemic & Portal veins", "Hepatic Portal Venous System"]
}; }
if (/\b(sagittal_sinus|transverse_sinus|sigmoid_sinus|cavernous_sinus|petrosal_sinus|straight_sinus|occipital_sinus|confluence_of_sinuses|cerebral_vein|jugular|facial_vein|retromandibular|ophthalmic_vein|maxillary_vein|thyroid_vein|vertebral_vein)\b/i.test(nameLow)) { return {
...organ, name_en,
ta2_latin, path: ["Systemic & Portal veins", "Head, Neck, Jugular Veins & Dural Venous Sinuses"]
}; }
if (/\b(subclavian_vein|axillary_vein|brachial_vein|cephalic|basilic|median_cubital|median_antebrachial|radial_vein|ulnar_vein|circumflex_humeral_vein|subscapular_vein|thoracodorsal_vein|lateral_thoracic_vein|palmar_venous|dorsal_venous_network_of_hand)\b/i.test(nameLow)) { return {
...organ, name_en,
ta2_latin, path: ["Systemic & Portal veins", "Upper Limb — Cephalic, Basilic, Axillary & Deep Veins"]
}; }
if (/\b(iliac_vein|femoral_vein|saphenous|popliteal_vein|tibial_vein|fibular_vein|perforating_vein|gluteal_vein|pudendal_vein|obturator_vein|dorsal_venous_arch_of_foot|plantar_venous)\b/i.test(nameLow)) { return {
...organ, name_en,
ta2_latin, path: ["Systemic & Portal veins", "Pelvis & Lower Limb — Saphenous, Femoral, Popliteal & Iliac Veins"]
}; }
return { ...organ,
name_en, ta2_latin,
path: ["Systemic & Portal veins", "Venae Cavae (SVC / IVC), Azygos & Visceral Veins"] };
} function normalizeMuscularOrgan(organ: ManifestOrgan): ManifestOrgan {
const idLow = organ.organ_id.toLowerCase(); const sideMatch = organ.name_en.match(/\((left|right)\)\s*$/i);
const sideSuffix = sideMatch ? ` (${sideMatch[1].toLowerCase()})` : ""; if (/^long_head_of_triceps_brachii_(l|r)$/i.test(idLow)) {
organ = { ...organ,
name_en: `Triceps brachii — Long head${sideSuffix}` };
} else if (/^lateral_head_of_triceps_brachii_(l|r)$/i.test(idLow)) { organ = {
...organ, name_en: `Triceps brachii — Lateral head${sideSuffix}`
}; } else if (/^medial_head_of_triceps_brachii_(l|r)$/i.test(idLow)) {
organ = { ...organ,
name_en: `Triceps brachii — Medial head${sideSuffix}` };
} else if (/^long_head_of_biceps_brachii_(l|r)$/i.test(idLow)) { organ = {
...organ, name_en: `Biceps brachii — Long head${sideSuffix}`
}; } else if (/^short_head_of_biceps_brachii_(l|r)$/i.test(idLow)) {
organ = { ...organ,
name_en: `Biceps brachii — Short head${sideSuffix}` };
} else if (/^clavicular_part_of_deltoid_(l|r)$/i.test(idLow)) { organ = {
...organ, name_en: `Deltoid — Clavicular part${sideSuffix}`
}; } else if (/^acromial_part_of_deltoid_(l|r)$/i.test(idLow)) {
organ = { ...organ,
name_en: `Deltoid — Acromial part${sideSuffix}` };
} else if (/^spinal_part_of_deltoid_(l|r)$/i.test(idLow)) { organ = {
...organ, name_en: `Deltoid — Spinal part${sideSuffix}`
}; } else if (/^clavicular_head_of_pectoralis_major_muscle_(l|r)$/i.test(idLow)) {
organ = { ...organ,
name_en: `Pectoralis major — Clavicular head${sideSuffix}` };
} else if (/^sternocostal_head_of_pectoralis_major_muscle_(l|r)$/i.test(idLow)) { organ = {
...organ, name_en: `Pectoralis major — Sternocostal head${sideSuffix}`
}; } else if (/^abdominal_part_of_pectoralis_major_muscle_(l|r)$/i.test(idLow)) {
organ = { ...organ,
name_en: `Pectoralis major — Abdominal part${sideSuffix}` };
} else if (/^long_head_of_biceps_femoris_muscle_(l|r)$/i.test(idLow)) { organ = {
...organ, name_en: `Biceps femoris — Long head (Tibial division of Sciatic)${sideSuffix}`
}; } else if (/^short_head_of_biceps_femoris_muscle_(l|r)$/i.test(idLow)) {
organ = { ...organ,
name_en: `Biceps femoris — Short head (Common fibular division of Sciatic)${sideSuffix}` };
} else if (/^medial_head_of_gastrocnemius_(l|r)$/i.test(idLow)) { organ = {
...organ, name_en: `Gastrocnemius — Medial head${sideSuffix}`
}; } else if (/^lateral_head_of_gastrocnemius_(l|r)$/i.test(idLow)) {
organ = { ...organ,
name_en: `Gastrocnemius — Lateral head${sideSuffix}` };
} const nameLow = `${organ.organ_id} ${organ.name_en} ${organ.ta2_latin}`.toLowerCase();
const p0 = organ.path?.[0] ?? ""; if (p0 === "Muscles of head" || p0 === "Muscles of eye" || p0 === "Muscles of tongue" || p0 === "Muscles of soft palate and fauces" || p0 === "Pharyngeal muscles" || p0 === "Laryngeal muscles" || /\b(masseter|temporalis|pterygoid|orbicularis|zygomaticus|risorius|buccinator|mentalis|depressor_anguli|depressor_labii|levator_labii|levator_anguli|nasalis|procerus|corrugator|depressor_supercilii|occipitofrontalis|temporoparietalis|auricularis|stapedius|tensor_tympani|rectus_muscle|oblique_muscle|levator_palpebrae|genioglossus|hyoglossus|styloglossus|constrictor|stylopharyngeus|palatopharyngeus|salpingopharyngeus|palatoglossus|veli_palatini|uvulae|cricothyroid|cricoarytenoid|thyroarytenoid|arytenoid|thyroepiglottic|vocalis)\b/i.test(nameLow)) {
if (/\b(superior_rectus|inferior_rectus|medial_rectus|lateral_rectus|superior_oblique|inferior_oblique|levator_palpebrae|orbitalis)\b/i.test(nameLow)) { return {
...organ, path: ["Muscles of head & face", "Extraocular & orbital muscles (CN III, IV, VI)"]
}; }
if (/\b(masseter|temporalis|medial_pterygoid|lateral_pterygoid)\b/i.test(nameLow)) { return {
...organ, path: ["Muscles of head & face", "Muscles of mastication (Mandibular CN V3)"]
}; }
if (/\b(genioglossus|hyoglossus|styloglossus|palatoglossus|intrinsic_muscles_of_tongue|longitudinal_muscle_of_tongue|transverse_muscle_of_tongue|vertical_muscle_of_tongue)\b/i.test(nameLow)) { return {
...organ, path: ["Muscles of head & face", "Tongue muscles — Extrinsic & Intrinsic (CN XII)"]
}; }
if (/\b(constrictor|stylopharyngeus|palatopharyngeus|salpingopharyngeus|veli_palatini|uvulae)\b/i.test(nameLow)) { return {
...organ, path: ["Muscles of head & face", "Pharyngeal & soft palate muscles (CN IX, X, V3)"]
}; }
if (/\b(cricothyroid|cricoarytenoid|thyroarytenoid|arytenoid|thyroepiglottic|vocalis|trachealis)\b/i.test(nameLow)) { return {
...organ, path: ["Muscles of neck", "Laryngeal intrinsic & trachealis muscles (CN X)"]
}; }
return { ...organ,
path: ["Muscles of head & face", "Facial expression & auricular muscles (CN VII)"] };
} if (p0 === "Muscles of neck" || /\b(sternocleidomastoid|platysma|digastric|stylohyoid|mylohyoid|geniohyoid|sternohyoid|sternothyroid|thyrohyoid|omohyoid|scalenus|scalene|longus_colli|longus_capitis|rectus_capitis|obliquus_capitis)\b/i.test(nameLow)) {
if (/\b(sternocleidomastoid|platysma)\b/i.test(nameLow)) { return {
...organ, path: ["Muscles of neck", "Superficial cervical & Sternocleidomastoid branches"]
}; }
if (/\b(digastric|stylohyoid|mylohyoid|geniohyoid)\b/i.test(nameLow)) { return {
...organ, path: ["Muscles of neck", "Suprahyoid muscles (Digastric, Mylohyoid, Stylohyoid, Geniohyoid)"]
}; }
if (/\b(sternohyoid|sternothyroid|thyrohyoid|omohyoid)\b/i.test(nameLow)) { return {
...organ, path: ["Muscles of neck", "Infrahyoid strap muscles (Ansa cervicalis C1–C3)"]
}; }
if (/\b(rectus_capitis_posterior|obliquus_capitis)\b/i.test(nameLow)) { return {
...organ, path: ["Muscles of neck", "Suboccipital triangle muscles (Suboccipital nerve C1)"]
}; }
return { ...organ,
path: ["Muscles of neck", "Scalene & Prevertebral deep neck muscles (C1–C8)"] };
} if (/\b(pectoralis_major|pectoralis_minor|subclavius|serratus_anterior|intercostal|subcostal|transversus_thoracis|levatores_costarum|diaphragm)\b/i.test(nameLow)) {
if (/\b(pectoralis_major|pectoralis_minor|subclavius|serratus_anterior)\b/i.test(nameLow)) { return {
...organ, path: ["Thoracic & pectoral muscles", "Pectoralis major, Pectoralis minor, Subclavius & Serratus anterior"]
}; }
return { ...organ,
path: ["Thoracic & pectoral muscles", "Diaphragm & Intercostal respiratory muscles"] };
} if (p0 === "Muscles of back" || /\b(trapezius|latissimus_dorsi|rhomboid|levator_scapulae|serratus_posterior|splenius|erector_spinae|iliocostalis|longissimus|spinalis|semispinalis|multifidus|rotatores|interspinales|intertransversarii)\b/i.test(nameLow)) {
if (/\b(trapezius|latissimus_dorsi|rhomboid|levator_scapulae|serratus_posterior)\b/i.test(nameLow)) { return {
...organ, path: ["Muscles of back & spine", "Superficial extrinsic back (Trapezius, Latissimus dorsi, Rhomboids, Levator scapulae)"]
}; }
if (/\b(splenius|erector_spinae|iliocostalis|longissimus|spinalis)\b/i.test(nameLow)) { return {
...organ, path: ["Muscles of back & spine", "Splenius & Erector spinae columns (Iliocostalis, Longissimus, Spinalis)"]
}; }
return { ...organ,
path: ["Muscles of back & spine", "Deep Transversospinales & segmental back (Semispinalis, Multifidus, Rotatores)"] };
} if (p0 === "Abdominal muscles" || p0 === "Muscles of pelvis" || p0 === "Muscles of perineum" || /\b(rectus_abdominis|external_abdominal_oblique|internal_abdominal_oblique|transversus_abdominis|pyramidalis|cremaster|quadratus_lumborum|levator_ani|pubococcygeus|puborectalis|iliococcygeus|coccygeus|ischiocavernosus|bulbospongiosus|perineal|sphincter|urethrae)\b/i.test(nameLow)) {
if (/\b(rectus_abdominis|external_abdominal_oblique|internal_abdominal_oblique|transversus_abdominis|pyramidalis|cremaster|quadratus_lumborum)\b/i.test(nameLow)) { return {
...organ, path: ["Abdominal & pelvic muscles", "Anterolateral abdominal wall & Quadratus lumborum"]
}; }
return { ...organ,
path: ["Abdominal & pelvic muscles", "Pelvic diaphragm (Levator ani) & Perineal muscles"] };
} if (p0 === "Muscles of upper limb" || /\b(deltoid|supraspinatus|infraspinatus|teres_minor|teres_major|subscapularis|biceps_brachii|brachialis|coracobrachialis|triceps_brachii|anconeus|pronator|flexor_carpi|palmaris|flexor_digitorum_superficialis|flexor_digitorum_profundus|flexor_pollicis|brachioradialis|extensor_carpi|extensor_digitorum|extensor_digiti|extensor_indicis|extensor_pollicis|supinator|abductor_pollicis|opponens_pollicis|adductor_pollicis|abductor_digiti_minimi|flexor_digiti_minimi|opponens_digiti_minimi|lumbrical|palmar_interosseous|dorsal_interosseous_of_hand)\b/i.test(nameLow)) {
if (/\b(deltoid|supraspinatus|infraspinatus|teres_minor|teres_major|subscapularis)\b/i.test(nameLow)) { return {
...organ, path: ["Muscles of upper limb", "Shoulder, Deltoid parts & Rotator cuff (SITS)"]
}; }
if (/\b(biceps_brachii|brachialis|coracobrachialis|triceps_brachii|anconeus)\b/i.test(nameLow)) { return {
...organ, path: ["Muscles of upper limb", "Arm — Biceps heads, Brachialis, Coracobrachialis & Triceps heads"]
}; }
if (/\b(pronator|flexor_carpi|palmaris_longus|flexor_digitorum_superficialis|flexor_digitorum_profundus|flexor_pollicis_longus)\b/i.test(nameLow)) { return {
...organ, path: ["Muscles of upper limb", "Forearm Anterior Flexor-Pronator Compartment (Superficial & Deep)"]
}; }
if (/\b(brachioradialis|extensor_carpi|extensor_digitorum|extensor_digiti_minimi|extensor_indicis|supinator|abductor_pollicis_longus|extensor_pollicis)\b/i.test(nameLow)) { return {
...organ, path: ["Muscles of upper limb", "Forearm Posterior Extensor-Supinator Compartment"]
}; }
return { ...organ,
path: ["Muscles of upper limb", "Intrinsic muscles of hand (Thenar, Hypothenar, Lumbricals & Interossei)"] };
} if (p0 === "Muscles of lower limb" || /\b(iliopsoas|psoas|iliacus|gluteus|tensor_fasciae_latae|piriformis|obturator|gemellus|quadratus_femoris|sartorius|rectus_femoris|vastus|articularis_genus|pectineus|adductor|gracilis|biceps_femoris|semitendinosus|semimembranosus|tibialis|extensor_hallucis|extensor_digitorum_longus|fibularis|peroneus|gastrocnemius|soleus|plantaris|popliteus|flexor_hallucis|flexor_digitorum_longus|extensor_digitorum_brevis|abductor_hallucis|flexor_digitorum_brevis|quadratus_plantae|adductor_hallucis|plantar_interosseous|dorsal_interosseous)\b/i.test(nameLow)) {
if (/\b(iliopsoas|psoas|iliacus|gluteus|tensor_fasciae_latae|piriformis|obturator|gemellus|quadratus_femoris)\b/i.test(nameLow)) { return {
...organ, path: ["Muscles of lower limb", "Iliopsoas, Gluteal region & Deep external hip rotators"]
}; }
if (/\b(sartorius|rectus_femoris|vastus_lateralis|vastus_medialis|vastus_intermedius|articularis_genus)\b/i.test(nameLow)) { return {
...organ, path: ["Muscles of lower limb", "Thigh Anterior — Sartorius & Quadriceps femoris (4 heads)"]
}; }
if (/\b(pectineus|adductor_longus|adductor_brevis|adductor_magnus|adductor_minimus|gracilis)\b/i.test(nameLow)) { return {
...organ, path: ["Muscles of lower limb", "Thigh Medial — Adductor compartment & Gracilis"]
}; }
if (/\b(biceps_femoris|semitendinosus|semimembranosus)\b/i.test(nameLow)) { return {
...organ, path: ["Muscles of lower limb", "Thigh Posterior — Hamstrings (Biceps femoris heads, Semitendinosus, Semimembranosus)"]
}; }
if (/\b(tibialis_anterior|extensor_hallucis_longus|extensor_digitorum_longus|fibularis_tertius|fibularis_longus|fibularis_brevis|peroneus)\b/i.test(nameLow)) { return {
...organ, path: ["Muscles of lower limb", "Leg Anterior & Lateral (Fibular) Compartments"]
}; }
if (/\b(gastrocnemius|soleus|plantaris|popliteus|tibialis_posterior|flexor_hallucis_longus|flexor_digitorum_longus)\b/i.test(nameLow)) { return {
...organ, path: ["Muscles of lower limb", "Leg Posterior — Triceps surae (Gastrocnemius & Soleus) & Deep Flexors"]
}; }
return { ...organ,
path: ["Muscles of lower limb", "Intrinsic muscles of foot (Dorsal & 4 Plantar Layers)"] };
} return organ;
} function enrichMaleManifest(raw: AnatomyManifest): AnatomyManifest {
const existingIds = new Set<string>(); const organs: ManifestOrgan[] = [];
const NON_MUSCLE_SLEEVE_REGEX = /\b(fascia|bursa|bursae|sheath|sheaths|retinaculum|septum|iliopectineal arch|palmar aponeurosis|plantar aponeurosis|epicranial aponeurosis|linea alba|inguinal ligament)\b/i; for (const organ of raw.organs) {
if (organ.system === "muscular") { const p0 = organ.path?.[0] ?? "";
if (p0 === "Muscular insertions" || p0 === "Bursae" || p0 === "Fascia" || p0 === "Superficial muscles" || p0 === "Tendon sheaths") { continue;
} if (NON_MUSCLE_SLEEVE_REGEX.test(organ.name_en) && !/tensor fasciae latae/i.test(organ.name_en)) {
continue; }
} let updatedOrgan = organ;
if (organ.system === "skeletal") { updatedOrgan = normalizeSkeletalOrgan(organ);
} else if (organ.system === "articular") { updatedOrgan = normalizeArticularOrgan(organ);
} else if (organ.system === "nervous") { updatedOrgan = normalizeNervousOrgan(organ);
} else if (organ.system === "muscular") { updatedOrgan = normalizeMuscularOrgan(organ);
} else if (organ.system === "cardiovascular") { updatedOrgan = normalizeCardiovascularOrgan(organ);
} else if (organ.system === "endocrine") { if (organ.organ_id === "adenohypophysis") {
updatedOrgan = { ...organ,
name_en: "Pituitary gland — Anterior lobe (Adenohypophysis)" };
} else if (organ.organ_id === "neurohypophysis") { updatedOrgan = {
...organ, name_en: "Pituitary gland — Posterior lobe (Neurohypophysis)"
}; } else if (organ.organ_id === "suprarenal_gland_l") {
updatedOrgan = { ...organ,
name_en: "Adrenal (Suprarenal) gland (left)" };
} else if (organ.organ_id === "suprarenal_gland_r") { updatedOrgan = {
...organ, name_en: "Adrenal (Suprarenal) gland (right)"
}; }
} organs.push(updatedOrgan);
existingIds.add(updatedOrgan.organ_id); }
for (const extra of EXTRA_MALE_ORGANS) { if (!existingIds.has(extra.organ_id)) {
organs.push(extra); existingIds.add(extra.organ_id);
} }
for (const organ of raw.organs) { if (organ.system === "skeletal" && (organ.path?.[0] ?? "") === "Vertebral column" && organ.path?.length === 1) {
const artSpineId = `art_spine_${organ.organ_id}`; if (!existingIds.has(artSpineId)) {
const nameLow = `${organ.name_en} ${organ.ta2_latin}`.toLowerCase(); const subGroup = /\bintervertebral disc\b/i.test(nameLow) ? "Intervertebral discs (C2–S1)" : /\bnucleus pulposus\b/i.test(nameLow) ? "Nucleus pulposus (C2–S1)" : "Vertebral & Costovertebral ligaments";
organs.push({ ...organ,
organ_id: artSpineId, system: "articular",
mesh_file: "articular_male.glb", path: ["Joints of vertebral column", subGroup]
}); existingIds.add(artSpineId);
} }
} const SKELETAL_TENDON_REGEX = /\b(tendo|tendon|tendons|tendinis|retinaculum|sheath|sheaths|palmar aponeurosis|plantar aponeurosis|epicranial aponeurosis|patellar ligament|inguinal ligament|iliotibial tract|calcaneal|linea alba|common tendinous ring)\b/i;
const EXCLUDE_BURSA_FASCIA_REGEX = /\b(bursa|bursae|antebrachial fascia|brachial fascia|crural fascia|deltoid fascia|investing|fascia lata|masseteric fascia|pectoral fascia|popliteal fascia|temporal fascia|thoracolumbar fascia|iliopsoas fascia|piriformis fascia)\b/i; const EXCLUDE_OUTER_CAPSULE_REGEX = /\b(articular capsule|articular capsules|capsula articularis|capsulae articulares|fat pad|corpus adiposum|synovial fold|frenula)\b/i;
for (const organ of raw.organs) { const fullName = `${organ.ta2_latin} ${organ.name_en}`;
const p0 = organ.path?.[0] ?? ""; if (organ.system === "articular" && !EXCLUDE_OUTER_CAPSULE_REGEX.test(fullName)) {
const skelId = `skel_art_${organ.organ_id}`; if (!existingIds.has(skelId)) {
const normArt = normalizeArticularOrgan(organ); const isCartilageOrDisc = /\b(cartilago|cartilage|cartilagines|meniscus|discus|disc|labrum|symphysis|synchondrosis)\b/i.test(fullName);
organs.push({ ...normArt,
organ_id: skelId, system: "skeletal",
path: [isCartilageOrDisc ? "Cartilages, Discs, Menisci & Labra" : "Joint Ligaments & Membranes", ...(normArt.path || [])] });
existingIds.add(skelId); }
} else if (organ.system === "muscular" && p0 !== "Muscular insertions" && p0 !== "Bursae" && (p0 === "Tendon sheaths" || SKELETAL_TENDON_REGEX.test(fullName)) && !EXCLUDE_BURSA_FASCIA_REGEX.test(fullName)) { const skelTendonId = `skel_tendon_${organ.organ_id}`;
if (!existingIds.has(skelTendonId)) { const subCat = p0 === "Tendon sheaths" ? "Synovial tendon sheaths" : /\bretinaculum\b/i.test(fullName) ? "Retinacula of wrist, ankle & knee" : /\b(aponeurosis|iliotibial|inguinal ligament|linea alba)\b/i.test(fullName) ? "Aponeuroses & collagenous tracts" : "Tendons";
organs.push({ ...organ,
organ_id: skelTendonId, system: "skeletal",
path: ["Tendons, Sheaths & Retinacula", subCat] });
existingIds.add(skelTendonId); }
} }
const counts = new Map<string, number>(); for (const o of organs) {
counts.set(o.system, (counts.get(o.system) ?? 0) + 1); }
const systems = raw.systems.map(s => ({ ...s,
organ_count: counts.get(s.system) ?? s.organ_count }));
return { ...raw,
systems, organs
}; }
const PANCREAS_EXCLUDE_REGEX = /\b(pancreas|pancreatic|hepatopancreatic|ampulla of vater|sphincter of ampulla)\b/i; function isPancreasOrgan(o: ManifestOrgan): boolean {
return PANCREAS_EXCLUDE_REGEX.test(o.organ_id) || PANCREAS_EXCLUDE_REGEX.test(o.name_en) || PANCREAS_EXCLUDE_REGEX.test(o.ta2_latin); }
function enrichFemaleManifest(rawFemale: AnatomyManifest, rawMale?: AnatomyManifest | null): AnatomyManifest { const existingIds = new Set<string>();
const organs: ManifestOrgan[] = []; for (const o of rawFemale.organs) {
if (isPancreasOrgan(o)) continue; if (o.system === "reproductive" || o.system === "integumentary" || o.system === "cardiovascular" && /uterine|pudendal|iliac|ovarian/i.test(o.organ_id)) {
organs.push(o); existingIds.add(o.organ_id);
} }
if (rawMale) { const maleEnriched = enrichMaleManifest(rawMale);
for (const o of maleEnriched.organs) { if (o.system === "reproductive") continue;
if (o.organ_id === "endocrine_testis_l" || o.organ_id === "endocrine_testis_r") continue; if (isPancreasOrgan(o)) continue;
if (!existingIds.has(o.organ_id)) { organs.push(o);
existingIds.add(o.organ_id); }
} } else {
for (const o of rawFemale.organs) { if (isPancreasOrgan(o)) continue;
if (!existingIds.has(o.organ_id)) { organs.push(o);
existingIds.add(o.organ_id); }
} }
for (const o of rawFemale.organs) { if (o.system === "reproductive" && /^ovary_(l|r)$/i.test(o.organ_id)) {
const endoId = `endo_${o.organ_id}`; if (!existingIds.has(endoId)) {
organs.push({ ...o,
organ_id: endoId, system: "endocrine",
path: ["Major endocrine glands", "Gonads (Ovaries)"] });
existingIds.add(endoId); }
} if ((o.system === "integumentary" || o.system === "reproductive") && /(mammary|breast)/i.test(`${o.organ_id} ${o.name_en}`)) {
const endoId = `endo_mammary_${o.organ_id}`; if (!existingIds.has(endoId)) {
organs.push({ ...o,
organ_id: endoId, name_en: /left|_l\b/i.test(`${o.organ_id} ${o.name_en}`) ? "Mammary gland (left)" : /right|_r\b/i.test(`${o.organ_id} ${o.name_en}`) ? "Mammary gland (right)" : o.name_en,
system: "endocrine", path: ["Major endocrine glands", "Mammary glands (Breast)"]
}); existingIds.add(endoId);
} }
} const counts = new Map<string, number>();
for (const o of organs) { counts.set(o.system, (counts.get(o.system) ?? 0) + 1);
} const baseSystems = rawMale ? rawMale.systems : rawFemale.systems;
const seenSystems = new Set<string>(); const systems = baseSystems.map(s => {
seenSystems.add(s.system); return {
...s, organ_count: counts.get(s.system) ?? 0
}; });
for (const [sys, cnt] of counts.entries()) { if (!seenSystems.has(sys)) {
systems.push({ system: (sys as AnatomyManifest["systems"][number]["system"]),
organ_count: cnt, load_on_start: sys === "skeletal" || sys === "reproductive"
}); }
} return {
...rawFemale, systems,
organs };
} const manifestCache = new Map<GenderModel, AnatomyManifest>();
const inflightCache = new Map<GenderModel, Promise<AnatomyManifest>>(); export async function loadManifest(gender: GenderModel, _signal?: AbortSignal): Promise<AnatomyManifest> {
const cached = manifestCache.get(gender); if (cached) return cached;
const existing = inflightCache.get(gender); if (existing) return existing;
const promise = (async () => { const fetchOpts = {
cache: ("force-cache" as const) };
if (gender === "female") { const [femaleRes, maleRes] = await Promise.all([fetch(MANIFEST_URL.female, fetchOpts), fetch(MANIFEST_URL.male, fetchOpts).catch(() => null)]);
if (!femaleRes.ok) { throw new Error(`Could not load the anatomy manifest (HTTP ${femaleRes.status}).`);
} const rawFemale = (await femaleRes.json() as AnatomyManifest);
const rawMale = maleRes && maleRes.ok ? (await maleRes.json() as AnatomyManifest) : null; if (!rawFemale || !Array.isArray(rawFemale.organs) || !Array.isArray(rawFemale.systems)) {
throw new Error("The anatomy manifest is malformed."); }
const data = enrichFemaleManifest(rawFemale, rawMale); manifestCache.set("female", data);
return data; }
const response = await fetch(MANIFEST_URL.male, fetchOpts); if (!response.ok) {
throw new Error(`Could not load the anatomy manifest (HTTP ${response.status}).`); }
const rawData = (await response.json() as AnatomyManifest); if (!rawData || !Array.isArray(rawData.organs) || !Array.isArray(rawData.systems)) {
throw new Error("The anatomy manifest is malformed."); }
const data = enrichMaleManifest(rawData); manifestCache.set("male", data);
return data; })();
inflightCache.set(gender, promise); try {
return await promise; } finally {
inflightCache.delete(gender); }
} if (typeof window !== "undefined") {
void loadManifest("male").catch(() => {}); void loadManifest("female").catch(() => {});
} export function meshUrl(file: string): string {
return MESH_BASE + file; }
export function meshFilesForSystems(manifest: AnatomyManifest, systems: ReadonlySet<string>): string[] { return [...new Set(manifest.organs.filter(organ => systems.has(organ.system)).map(organ => organ.mesh_file))].sort();
} export function organsInFile(manifest: AnatomyManifest, file: string): ManifestOrgan[] {
return manifest.organs.filter(organ => organ.mesh_file === file); }
