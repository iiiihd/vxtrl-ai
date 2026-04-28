const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const TMP_DIR = '/tmp/viraltok';
const OUT_DIR = '/home/claude/viraltok/public/videos';
[TMP_DIR, OUT_DIR].forEach(d => { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); });

async function renderVideo({ clips, audioPath, script = '', language = 'ar' }) {
  const jobId = uuidv4().slice(0, 8);
  const outputFilename = `viraltok_${jobId}.mp4`;
  const outputPath = path.join(OUT_DIR, outputFilename);
  const listPath = path.join(TMP_DIR, `list_${jobId}.txt`);

  const validClips = clips.filter(c => c.localPath && fs.existsSync(c.localPath));
  if (!validClips.length) throw new Error('لا توجد مقاطع فيديو');

  fs.writeFileSync(listPath, validClips.map(c => `file '${c.localPath}'`).join('\n'));

  const hasAudio = audioPath && fs.existsSync(audioPath);
  const totalDuration = validClips.reduce((s, c) => s + (c.duration || 8), 0);

  const args = [
    '-f', 'concat', '-safe', '0',
    '-i', listPath,
  ];

  if (hasAudio) { args.push('-i', audioPath); }

  args.push(
    '-filter_complex',
    '[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1[v]',
    '-map', '[v]',
  );

  if (hasAudio) { args.push('-map', '1:a'); }

  args.push(
    '-c:v', 'libx264', '-preset', 'fast', '-crf', '23',
    '-c:a', 'aac', '-b:a', '128k',
    '-shortest', '-r', '30', '-y',
    outputPath
  );

  await new Promise((resolve, reject) => {
    console.log('  🎬 FFmpeg rendering...');
    const proc = spawn('ffmpeg', args, { stdio: ['ignore', 'pipe', 'pipe'] });
    proc.stderr.on('data', d => {
      const s = d.toString();
      if (s.includes('frame=')) process.stdout.write('\r  ⚙️  ' + s.trim().substring(0, 60));
    });
    proc.on('close', code => {
      process.stdout.write('\n');
      if (code === 0) resolve();
      else reject(new Error(`FFmpeg خرج بكود ${code}`));
    });
  });

  // تنظيف
  try {
    fs.unlinkSync(listPath);
    validClips.forEach(c => fs.existsSync(c.localPath) && fs.unlinkSync(c.localPath));
    if (hasAudio && fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
  } catch(e) {}

  const stats = fs.statSync(outputPath);
  return {
    videoPath: outputPath,
    videoUrl: `/videos/${outputFilename}`,
    filename: outputFilename,
    duration: Math.min(totalDuration, 60),
    fileSizeMB: (stats.size / 1024 / 1024).toFixed(1),
    resolution: '1080x1920',
    format: 'MP4 H.264'
  };
}

module.exports = { renderVideo };
