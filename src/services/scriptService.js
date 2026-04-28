const OpenAI = require('openai');

// يشتغل بدون API key — يرجع بيانات تجريبية
let client;
try {
  if (process.env.OPENAI_API_KEY) {
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
} catch (e) {}

const PROMPTS = {
  ar: `أنت خبير محتوى تيك توك خليجي. اكتب سكريبت فيروسي باللهجة الخليجية العامية.

القواعد الإلزامية:
- خطّاف قوي في أول 3 ثواني (مثل: "تدري وش صار؟" أو "والله مو طبيعي" أو "هذا غيّر حياتي")
- نبرة عاطفية، حماسية، مباشرة، خليجية بحتة
- بين 150-300 كلمة
- ختام بـ CTA واضح (شارك، احفظ، فولو)
- لا تستخدم الفصحى أبداً

أرجع JSON فقط بهذا الشكل:
{
  "script": "نص السكريبت كامل",
  "caption": "كابشن قصير للتيك توك",
  "hashtags": ["#هاشتاق1", "#هاشتاق2"],
  "keywords": ["كلمة1", "كلمة2"]
}`,

  en: `You are a TikTok viral content expert. Write a high-retention script.

Rules:
- Hook in first 3 seconds (POV, Stop scrolling, Nobody talks about this...)
- TikTok-native conversational tone, energetic, direct
- 150-300 words
- Clear CTA at end (save, share, follow)

Return JSON only:
{
  "script": "full script text",
  "caption": "short TikTok caption",
  "hashtags": ["#tag1", "#tag2"],
  "keywords": ["word1", "word2"]
}`
};

// بيانات تجريبية لما مافي API key
const MOCK_DATA = {
  ar: (idea) => ({
    script: `تدري وش صار؟ 🔥\n\nاليوم اكتشفت شي عن "${idea}" غيّر طريقة تفكيري كلياً.\n\nأول شي — والله ما كنت أصدق إنه يشتغل، بس جربته وطلع مو طبيعي.\n\nثاني شي — وفّر علي ساعات طويلة كنت أضيعها يومياً.\n\nوثالث شي — وهو الأهم — قدرت أحقق نتائج ما توقعتها بحياتي.\n\nالموضوع بسيط جداً، بس ما أحد يتكلم عنه.\n\nاحفظ هذا الفيديو لأنك بتحتاجه، وشارك مع أصحابك اللي تبيهم يستفيدون. 💪`,
    caption: `${idea} — معلومة غيّرت حياتي! 🔥`,
    hashtags: ['#تيك_توك', '#خليجي', '#ذكاء_اصطناعي', '#محتوى', '#فيروسي', '#2025', '#تقنية', '#نجاح'],
    keywords: [idea.split(' ')[0], 'technology', 'viral', 'tips']
  }),
  en: (idea) => ({
    script: `Stop scrolling. 🛑\n\nI need to tell you something about "${idea}" that nobody is talking about.\n\nFirst — I didn't believe it would work. But I tried it and the results were insane.\n\nSecond — It saved me hours every single day.\n\nThird — and this is the part that actually matters — it completely changed my results.\n\nThe crazy thing? It's actually simple. Most people just don't know about it.\n\nSave this video because you WILL need it. And share it with someone who needs to see this. 👇`,
    caption: `${idea} — the secret nobody talks about 🔥`,
    hashtags: ['#TikTok', '#Viral', '#AI', '#Tech2025', '#LifeHack', '#Growth', '#Trending', '#FYP'],
    keywords: [idea.split(' ')[0], 'viral', 'tips', 'technology']
  })
};

async function generateScript({ idea, language = 'ar', videoType = 'educational' }) {
  // وضع تجريبي بدون API key
  if (!client) {
    console.log('  ⚠️  OpenAI غير متوفر — استخدام بيانات تجريبية');
    await sleep(800); // محاكاة التأخير
    const mock = MOCK_DATA[language] || MOCK_DATA.ar;
    return mock(idea);
  }

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: PROMPTS[language] || PROMPTS.ar },
      { role: 'user',   content: `الفكرة: "${idea}" | النوع: ${videoType}` }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.85,
    max_tokens: 1000
  });

  const data = JSON.parse(response.choices[0].message.content);
  if (!data.script) throw new Error('OpenAI لم يرجع script');
  return data;
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

module.exports = { generateScript };
