import { Brain, HeartPulse, Dna, Microscope, Stethoscope, Scissors, Pill } from 'lucide-react';

export type Category   = { id: number; slug: string; name_en: string; icon: string | null; description: string | null };
export type Lesson     = { id: number; category_id: number; name_en: string; display_order: number; image_url?: string | null };
export type Section    = { id: number; disease_id: number; section_name_en: string; content: string | null; display_order: number; image_url?: string | null };
export type Subsection = { id: number; section_id: number; name_en: string; icon: string | null; display_order: number; image_url?: string | null };
export type Topic      = { id: number; subsection_id: number; name_en: string; content: string | null; display_order: number; image_url?: string | null };

export const ACADEMIC_YEARS = [
  { slug: 'First Year',  name: 'First Year',  icon: Dna,         color: 'from-cyan-500/20 to-blue-500/10 text-cyan-400 border-cyan-500/30',     badge: 'Basic Sciences', image: 'https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?auto=format&fit=crop&w=600&q=80' },
  { slug: 'Second Year', name: 'Second Year', icon: Microscope,  color: 'from-indigo-500/20 to-purple-500/10 text-indigo-400 border-indigo-500/30', badge: 'Preclinical',    image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=600&q=80' },
  { slug: 'Third Year',  name: 'Third Year',  icon: HeartPulse,  color: 'from-rose-500/20 to-pink-500/10 text-rose-400 border-rose-500/30',       badge: 'Clinical',       image: 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&w=600&q=80' },
  { slug: 'Fourth Year', name: 'Fourth Year', icon: Brain,       color: 'from-emerald-500/20 to-teal-500/10 text-emerald-400 border-emerald-500/30', badge: 'Clinical',      image: 'https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?auto=format&fit=crop&w=600&q=80' },
  { slug: 'Fifth Year',  name: 'Fifth Year',  icon: Stethoscope, color: 'from-amber-500/20 to-orange-500/10 text-amber-400 border-amber-500/30',    badge: 'Clinical',       image: 'https://images.unsplash.com/photo-1584982751601-97dcc096659c?auto=format&fit=crop&w=600&q=80' },
];

export const EXAMS = [
  { 
    slug: 'USMLE Step 1',
    name: 'USMLE Step 1', 
    icon: Pill, 
    color: 'from-indigo-500/20 to-purple-500/10 text-indigo-400 border-indigo-500/30', 
    badge: 'US Medical',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=600&q=80',
    comingSoon: false,
  },
  { 
    slug: 'MRCP Part A',        
    name: 'MRCP Part A',        
    icon: Pill,     
    color: 'from-blue-500/20 to-sky-500/10 text-blue-400 border-blue-500/30', 
    badge: 'Coming Soon',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80',
    comingSoon: true,
  },
  { 
    slug: 'MRCS Part A', 
    name: 'MRCS Part A', 
    icon: Scissors, 
    color: 'from-slate-400/20 to-slate-600/10 text-slate-300 border-slate-500/30', 
    badge: 'Coming Soon',
    image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=600&q=80',
    comingSoon: true,
  },
];

export const CURRICULUM_DATA: Record<string, Record<string, any[]>> = {
  'First Year': {
    'First Term': [
      { code: 'ISK-101', image: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&w=800&q=80', subjects: [
        { name: 'Anatomy', topics: ['Basis', 'General Embryology', 'Upper Limb'] },
        { name: 'Histology', topics: ['Cytology', 'Connective tissue', 'Epithelium', 'Blood'] }
      ]},
      { code: 'INT-102', image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=800&q=80', subjects: [
        { name: 'Biochemistry', topics: ['Chemistry of macromolecules', 'Molecular biology'] },
        { name: 'Physiology', topics: ['Blood', 'Automatic nervous system'] }
      ]},
      { code: 'BMS-103', image: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?auto=format&fit=crop&w=800&q=80', subjects: [
        { name: 'Biochemistry', topics: ['Bioenergetics', 'Metabolism (All)'] },
        { name: 'Histology', topics: ['Bone', 'Cartilage', 'Muscle', 'Skin'] },
        { name: 'Physiology', topics: ['Nerve', 'Muscle'] },
        { name: 'Anatomy', topics: ['Lower Limb'] }
      ]}
    ],
    'Second Term': [
      { code: 'CPS-104', image: 'https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?auto=format&fit=crop&w=800&q=80', subjects: [
        { name: 'Physiology', topics: ['Cardio', 'Vascular', 'Respiratory'] },
        { name: 'Histology', topics: ['Lymphatic', 'Cardiovascular', 'Respiratory', 'Cytogenetics'] },
        { name: 'Anatomy', topics: ['Thorax'] }
      ]},
      { code: 'INT-108', image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80', subjects: [
        { name: 'Pathology', topics: ['Cell injury', 'Accumulation'] },
        { name: 'Pharmacology', topics: ['Pharmacokinetics', 'Pharmacodynamics', 'Skill lab'] }
      ]},
      { code: 'EPE-130', image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80', subjects: [{ name: 'Early patient encounter (family medicine)', topics: [] }] },
    ]
  },
  'Second Year': {
    'First Term': [
      { code: 'CNS-205', image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=800&q=80', subjects: [
        { name: 'Anatomy', topics: ['Head', 'Neck', 'CNS'] },
        { name: 'Histology', topics: ['Nervous', 'CNS', 'Eye', 'Ear'] },
        { name: 'Physiology', topics: ['Sensory', 'Hearing', 'Taste', 'Motor', 'Smell', 'Vision'] }
      ]},
      { code: 'DIG-206', image: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?auto=format&fit=crop&w=800&q=80', subjects: [
        { name: 'Anatomy', topics: ['GIT'] },
        { name: 'Biochemistry', topics: ['GIT Metabolism'] },
        { name: 'Histology', topics: ['GIT', 'Renal'] },
        { name: 'Physiology', topics: ['GIT', 'Renal'] }
      ]}
    ],
    'Second Term': [
      { code: 'END-207', image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=800&q=80', subjects: [
        { name: 'Anatomy', topics: ['Endocrine'] },
        { name: 'Histology', topics: ['Endocrine', 'Male Gen.', 'Female Gen.'] },
        { name: 'Physiology', topics: ['Endocrine'] }
      ]},
      { code: 'INT-208', image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80', subjects: [
        { name: 'Pharmacology', topics: ['General', 'ANS', 'Eye', 'SK MS relaxant', 'Autacoids', 'Anti anginal drugs', 'Diuretics', 'CVS', 'Blood'] },
        { name: 'Pathology', topics: ['Cell Injury', 'Accumulation', 'Inflammation', 'Repair', 'Neoplasia', 'Circulatory', 'Tuberculosis', 'Infections', 'Bacterial', 'Viral - Fungal', 'Parasitic', 'Bilharziasis', 'Nutrition & Environmental'] }
      ]},
      { code: 'PAT-210', image: 'https://images.unsplash.com/photo-1576089172869-4f5f6f315620?auto=format&fit=crop&w=800&q=80', subjects: [
        { name: 'Pharmacology', topics: ['GIT', 'Respiratory'] },
        { name: 'Pathology', topics: ['CVS'] }
      ]},
      { code: 'PSY-213', image: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&w=800&q=80', subjects: [{ name: 'Medical psychology', topics: [] }] },
      { code: 'EPE-230', image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80', subjects: [{ name: 'Patient encounter (family medicine)', topics: [] }] },
    ]
  }
};