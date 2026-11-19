import { supabase } from '../../../lib/supabase';
import type { Category } from './data';

type Args = {
  courseCategories: Category[];
  showToast?: (msg: string, type: 'success' | 'error' | 'info') => void;
  setLoading: (b: boolean) => void;
  setPickedCategory: (c: Category | null) => void;
  setLesson: (l: any) => void;
  setView: (v: any) => void;
};

export async function handleTopicClick(
  topicName: string,
  subjectName: string | undefined,
  args: Args
) {
  const { courseCategories, showToast, setLoading, setPickedCategory, setLesson, setView } = args;
  setLoading(true);
  try {
    let targetDiseaseSlug = '';
    let targetCategorySlug = '';
    const topic = topicName.toLowerCase();
    const subject = subjectName?.toLowerCase() || '';

    // ═══ Pharmacology ═══
    if (subject.includes('pharmacology')) {
      if (topic === 'general') targetDiseaseSlug = 'pharma-general-principles';
      else if (topic === 'ans') targetDiseaseSlug = 'pharma-autonomic-nervous-system';
      else if (topic === 'eye') targetDiseaseSlug = 'pharma-ocular-pharmacology';
      else if (topic === 'sk ms relaxant') targetDiseaseSlug = 'pharma-skeletal-muscle-relaxants';
      else if (topic === 'autacoids') targetDiseaseSlug = 'pharma-autacoids-and-migraine';
      else if (topic === 'diuretics') targetDiseaseSlug = 'pharma-diuretics';
      else if (topic === 'cvs') targetDiseaseSlug = 'pharma-cvs-and-renal-pharmacology';
      else if (topic === 'anti anginal drugs') targetDiseaseSlug = 'pharma-anti-anginal-drugs';
      else if (topic === 'blood') targetDiseaseSlug = 'pharma-blood-and-dyslipidemia';
      else if (topic === 'git') targetDiseaseSlug = 'pharma-git';
      else if (topic === 'respiratory') targetDiseaseSlug = 'pharma-respiratory';
      else { showToast?.(`Content for "${topicName}" is not available yet.`, 'info'); setLoading(false); return; }
    }
    // ═══ Pathology ═══
    else if (subject.includes('pathology') || subject.includes('patho')) {
      if (topic === 'cell injury') targetCategorySlug = 'patho-cell-injury';
      else if (topic === 'accumulation') targetCategorySlug = 'patho-intracellular-accumulation';
      else if (topic === 'inflammation') targetCategorySlug = 'patho-inflammation';
      else if (topic === 'repair') targetCategorySlug = 'patho-healing-and-repair';
      else if (topic === 'neoplasia') targetCategorySlug = 'patho-neoplasia-basics';
      else if (topic === 'circulatory') targetCategorySlug = 'patho-congestion-edema';
      else if (topic === 'tuberculosis') targetCategorySlug = 'patho-tuberculosis';
      else if (topic === 'infections') targetCategorySlug = 'patho-syphilis-leprosy';
      else if (topic === 'bacterial') targetCategorySlug = 'patho-syphilis-leprosy';
      else if (topic === 'viral - fungal') targetCategorySlug = 'patho-viral-infections';
      else if (topic === 'parasitic') targetCategorySlug = 'patho-parasitic-infections';
      else if (topic === 'bilharziasis') targetCategorySlug = 'patho-parasitic-infections';
      else if (topic === 'cvs') targetCategorySlug = 'patho-cvs';
      else { showToast?.(`Content for "${topicName}" is not available yet.`, 'info'); setLoading(false); return; }
    }
    // ═══ Histology ═══
    else if (topic === 'blood') {
      if (subject.includes('histology')) targetCategorySlug = 'histology-blood';
      else if (subject.includes('physiology')) targetCategorySlug = 'physio-blood-detailed';
      else targetCategorySlug = 'histology-blood';
    }
    else if (topic === 'git') {
      if (subject.includes('anatomy')) targetCategorySlug = 'anatomy-git-mega-extended';
      else if (subject.includes('histology')) targetCategorySlug = 'histo-git-detailed';
      else if (subject.includes('physiology')) targetCategorySlug = 'physio-git-mega';
      else targetCategorySlug = 'anatomy-git-mega-extended';
    }
    else if (topic === 'git metabolism') { targetCategorySlug = 'biochem-git-metabolism'; }
    else if (topic === 'renal') {
      if (subject.includes('histology')) targetCategorySlug = 'histo-renal-detailed';
      else if (subject.includes('physiology')) targetCategorySlug = 'physio-renal-mega';
      else targetCategorySlug = 'histo-renal-detailed';
    }
    else if (topic === 'cardio') {
      if (subject.includes('histology')) targetCategorySlug = 'histo-cardiovascular';
      else if (subject.includes('physiology')) targetCategorySlug = 'physio-cardio';
      else targetCategorySlug = 'physio-cardio';
    }
    else if (topic === 'vascular') { targetCategorySlug = 'physio-vascular'; }
    else if (topic === 'endocrine') {
      if (subject.includes('anatomy')) targetCategorySlug = 'anatomy-endocrine';
      else if (subject.includes('physiology')) targetCategorySlug = 'physio-endocrine';
      else targetCategorySlug = 'histo-endocrine';
    }
    else if (topic === 'male gen.' || topic === 'male gen' || topic === 'male genital') { targetCategorySlug = 'histo-male-genital'; }
    else if (topic === 'female gen.' || topic === 'female gen' || topic === 'female genital') { targetCategorySlug = 'histo-female-genital'; }
    else if (topic === 'respiratory') {
      if (subject.includes('histology')) targetCategorySlug = 'histo-respiratory';
      else if (subject.includes('physiology')) targetCategorySlug = 'physio-respiratory';
      else targetCategorySlug = 'physio-respiratory';
    }
    else if (topic === 'lymphatic') { targetCategorySlug = 'histo-lymphatic'; }
    else if (topic === 'cytogenetics') { targetCategorySlug = 'histo-cytogenetics'; }
    else if (topic === 'early patient encounter (family medicine)' || topic === 'early patient encounter') { targetCategorySlug = 'family-medicine-epe'; }
    else if (topic === 'patient encounter (family medicine)' || topic === 'patient encounter') { targetCategorySlug = 'family-medicine-epe-230'; }
    else if (topic === 'cartilage') { targetCategorySlug = 'histo-cartilage-detailed'; }
    else if (topic === 'upper limb') targetCategorySlug = 'upper-limb-anatomy';
    else if (topic === 'general embryology') targetCategorySlug = 'general-embryology';
    else if (topic === 'basis') targetCategorySlug = 'human-anatomy';

    // ═══ Path 1: Disease ═══
    if (targetDiseaseSlug) {
      const { data: disease } = await supabase.from('course_diseases').select('*').eq('slug', targetDiseaseSlug).maybeSingle();
      if (disease) {
        const { data: cat } = await supabase.from('course_categories').select('*').eq('id', disease.category_id).maybeSingle();
        if (cat) setPickedCategory(cat);
        setLesson(disease);
        setView('reader');
        setLoading(false);
        return;
      }
      showToast?.(`Content for "${topicName}" is not available yet.`, 'info');
      setLoading(false);
      return;
    }

    // ═══ Path 2: Category ═══
    let matchedCategory: Category | null = null;
    if (targetCategorySlug) matchedCategory = courseCategories.find(c => c.slug === targetCategorySlug) || null;

    if (!matchedCategory) {
      const t = topicName.toLowerCase();
      matchedCategory =
        courseCategories.find(c => c.name_en.toLowerCase() === t) ||
        courseCategories.find(c => c.name_en.toLowerCase().startsWith(t) || c.name_en.toLowerCase().endsWith(t)) ||
        null;
    }

    if (matchedCategory) {
      setPickedCategory(matchedCategory);
      setLesson(null);
      setView('lessons');
      setLoading(false);
      return;
    }

    // ═══ Path 3: Fallback ═══
    const { data } = await supabase.from('course_diseases').select('*').ilike('name_en', topicName).maybeSingle();
    if (data) { setLesson(data); setView('reader'); }
    else showToast?.(`Content for "${topicName}" is not available yet.`, 'info');
  } catch (err) {
    console.error(err);
    showToast?.('Error loading content', 'error');
  } finally {
    setLoading(false);
  }
}