const express = require('express');
const router = express.Router();
const { generateScript }  = require('../services/scriptService');
const { generateVoice }   = require('../services/voiceService');
const { fetchVideoClips } = require('../services/videoService');
const { renderVideo }     = require('../services/renderService');
const { viralScore }      = require('../utils/viralScore');

/**
 * POST /api/generate-full-video  ← الـ endpoint الرئيسي
 * Body: { idea, language, voice, videoType }
 * فكرة واحدة → فيديو تيك توك كامل
 */
router.post('/', async (req, res) => {
  const { idea, language = 'ar', voice = 'ar-gulf-male', videoType = 'educational' } = req.body;

  if (!idea?.trim()) return res.status(400).json({ error: 'الفكرة مطلوبة' });

  console.log(`\n🚀 بدء التوليد: "${idea}"`);

  try {
    // 1️⃣ السكريبت
    console.log('1️⃣  توليد السكريبت...');
    const scriptData = await generateScript({ idea, language, videoType });

    // 2️⃣ الصوت + المقاطع بالتوازي
    console.log('2️⃣  توليد الصوت + جلب المقاطع...');
    const [voiceData, clipsData] = await Promise.all([
      generateVoice({ text: scriptData.script, voiceId: voice }),
      fetchVideoClips({ keywords: scriptData.keywords, count: 5 })
    ]);

    // 3️⃣ التصيير
    console.log('3️⃣  تصيير الفيديو بـ FFmpeg...');
    const renderData = await renderVideo({
      clips:     clipsData.clips,
      audioPath: voiceData.audioPath,
      script:    scriptData.script,
      language
    });

    // 4️⃣ الاستجابة النهائية
    const score = viralScore({ script: scriptData.script, language });
    console.log(`✅ اكتمل! Viral Score: ${score}/100\n`);

    res.json({
      success:    true,
      videoUrl:   renderData.videoUrl,
      videoPath:  renderData.videoPath,
      script:     scriptData.script,
      caption:    scriptData.caption,
      hashtags:   scriptData.hashtags,
      viralScore: score,
      duration:   renderData.duration,
      language,
      voice
    });

  } catch (err) {
    console.error('❌ خطأ في التوليد:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
