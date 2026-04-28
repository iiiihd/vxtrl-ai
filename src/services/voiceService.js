const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const TMP_DIR = '/tmp/viraltok';
if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });

// Voice IDs في ElevenLabs — استبدلها بـ IDs حقيقية
const VOICE_IDS = {
  'ar-gulf-male':   process.env.VOICE_AR_MALE   || 'pNInz6obpgDQGcFmaJgB', // Adam
  'ar-gulf-female': process.env.VOICE_AR_FEMALE || 'EXAVITQu4vr4xnSDxMaL', // Bella
  'en-viral-male':  process.env.VOICE_EN_MALE   || 'VR6AewLTigWG4xSOukaG', // Arnold
  'en-viral-female':process.env.VOICE_EN_FEMALE || 'ThT5KcBeYPX3keUQqHPh', // Dorothy
};

async function generateVoice({ text, voiceId = 'ar-gulf-male' }) {
  const outputPath = path.join(TMP_DIR, `audio_${uuidv4()}.mp3`);

  // وضع تجريبي بدون API key
  if (!process.env.ELEVENLABS_API_KEY) {
    console.log('  ⚠️  ElevenLabs غير متوفر — إنشاء صوت صامت تجريبي');
    await generateSilentAudio(outputPath, 30);
    return {
      audioPath: outputPath,
      audioUrl: `/tmp/audio_demo.mp3`,
      duration: 30,
      voice: voiceId
    };
  }

  const elevenlabsId = VOICE_IDS[voiceId] || VOICE_IDS['ar-gulf-male'];

  const response = await axios.post(
    `https://api.elevenlabs.io/v1/text-to-speech/${elevenlabsId}`,
    {
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.55,
        similarity_boost: 0.80,
        style: 0.65,
        use_speaker_boost: true
      }
    },
    {
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY,
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json'
      },
      responseType: 'arraybuffer'
    }
  );

  fs.writeFileSync(outputPath, response.data);

  return {
    audioPath: outputPath,
    audioUrl: `/audio/${path.basename(outputPath)}`,
    duration: Math.ceil(text.length / 15), // تقدير مدة القراءة
    voice: voiceId
  };
}

// إنشاء ملف صوت صامت للاختبار
function generateSilentAudio(outputPath, seconds) {
  return new Promise((resolve, reject) => {
    const ffmpeg = require('fluent-ffmpeg');
    ffmpeg()
      .input('anullsrc=r=44100:cl=mono')
      .inputFormat('lavfi')
      .duration(seconds)
      .audioCodec('libmp3lame')
      .output(outputPath)
      .on('end', resolve)
      .on('error', reject)
      .run();
  });
}

module.exports = { generateVoice };
