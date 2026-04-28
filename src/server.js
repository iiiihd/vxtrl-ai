require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// ─── Routes ───────────────────────────────────────────
app.use('/api/generate-script',     require('./routes/script'));
app.use('/api/generate-voice',      require('./routes/voice'));
app.use('/api/get-videos',          require('./routes/videos'));
app.use('/api/render-video',        require('./routes/render'));
app.use('/api/generate-full-video', require('./routes/full'));

// ─── Health check ─────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'ViralTok AI',
    version: '1.0.0',
    apis: {
      openai:     !!process.env.OPENAI_API_KEY,
      elevenlabs: !!process.env.ELEVENLABS_API_KEY,
      pexels:     !!process.env.PEXELS_API_KEY,
    }
  });
});

// ─── Frontend (SPA fallback) ───────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n✅ ViralTok AI يعمل على: http://localhost:${PORT}\n`);
});
