const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const TMP_DIR = '/tmp/viraltok';
if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });

// مقاطع تجريبية من Pexels (مفتوحة المصدر)
const DEMO_CLIPS = [
  { id: 1, url: 'https://www.pexels.com/video/854100/', width: 1920, height: 1080, duration: 15, localPath: null },
  { id: 2, url: 'https://www.pexels.com/video/856963/', width: 1920, height: 1080, duration: 12, localPath: null },
  { id: 3, url: 'https://www.pexels.com/video/857173/', width: 1920, height: 1080, duration: 10, localPath: null },
];

async function fetchVideoClips({ keywords = [], count = 5 }) {
  if (!process.env.PEXELS_API_KEY) {
    console.log('  ⚠️  Pexels غير متوفر — استخدام مقاطع تجريبية');
    await sleep(600);

    // إنشاء مقاطع ملوّنة تجريبية بـ FFmpeg
    const clips = [];
    const colors = ['0x1a1a2e', '0x16213e', '0x0f3460', '0x533483', '0xe94560'];
    for (let i = 0; i < Math.min(count, 3); i++) {
      const clipPath = await generateColorClip(colors[i % colors.length], 8);
      clips.push({ id: i + 1, duration: 8, localPath: clipPath, downloaded: true });
    }
    return { clips, total: clips.length };
  }

  // Pexels API حقيقي
  const query = keywords.slice(0, 3).join(' ');
  const response = await axios.get('https://api.pexels.com/videos/search', {
    headers: { Authorization: process.env.PEXELS_API_KEY },
    params: { query, per_page: count, orientation: 'portrait' }
  });

  const clips = await Promise.all(
    response.data.videos.slice(0, count).map(async (vid) => {
      const file = vid.video_files.find(f => f.quality === 'hd' || f.quality === 'sd');
      const localPath = await downloadClip(file.link);
      return { id: vid.id, duration: vid.duration, localPath, downloaded: true };
    })
  );

  return { clips, total: clips.length };
}

async function downloadClip(url) {
  const outputPath = path.join(TMP_DIR, `clip_${uuidv4()}.mp4`);
  const response = await axios.get(url, { responseType: 'stream' });
  const writer = fs.createWriteStream(outputPath);
  response.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on('finish', () => resolve(outputPath));
    writer.on('error', reject);
  });
}

// إنشاء مقطع ملوّن تجريبي
function generateColorClip(color, seconds) {
  const outputPath = path.join(TMP_DIR, `clip_${uuidv4()}.mp4`);
  return new Promise((resolve, reject) => {
    const ffmpeg = require('fluent-ffmpeg');
    ffmpeg()
      .input(`color=c=${color}:size=1080x1920:rate=30`)
      .inputFormat('lavfi')
      .duration(seconds)
      .videoCodec('libx264')
      .outputOptions(['-preset ultrafast', '-pix_fmt yuv420p'])
      .output(outputPath)
      .on('end', () => resolve(outputPath))
      .on('error', reject)
      .run();
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

module.exports = { fetchVideoClips };
