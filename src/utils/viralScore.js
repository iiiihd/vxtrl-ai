const AR_HOOKS = ['تدري', 'والله', 'مو طبيعي', 'خلّي', 'صار', 'غيّر', 'اكتشفت', 'سر'];
const EN_HOOKS = ['stop scrolling', 'pov:', 'nobody talks', 'i can\'t believe', 'this changed', 'wait'];
const CTA = ['شارك', 'احفظ', 'فولو', 'save', 'share', 'follow', 'comment', 'like'];

function viralScore({ script, language = 'ar' }) {
  let score = 50;
  const lower = script.toLowerCase();
  const hooks = language === 'ar' ? AR_HOOKS : EN_HOOKS;
  const first = script.substring(0, 100).toLowerCase();

  score += hooks.filter(h => first.includes(h)).length * 8;   // خطّاف قوي
  score += CTA.filter(w => lower.includes(w)).length * 4;      // دعوة للتفاعل
  if (script.length >= 150 && script.length <= 400) score += 10; // طول مثالي
  if (script.includes('؟') || script.includes('?')) score += 5; // أسئلة
  if (script.includes('🔥') || script.includes('💪')) score += 3; // إيموجي

  score += Math.floor(Math.random() * 8) - 4; // تباين طبيعي
  return Math.max(45, Math.min(98, score));
}

module.exports = { viralScore };
