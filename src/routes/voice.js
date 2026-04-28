const express = require('express');
const router = express.Router();
const { generateVoice } = require('../services/voiceService');

/**
 * POST /api/generate-voice
 * Body: { script, voice }
 */
router.post('/', async (req, res) => {
  try {
    const { script, voice = 'ar-gulf-male' } = req.body;
    if (!script?.trim()) return res.status(400).json({ error: 'script مطلوب' });

    const result = await generateVoice({ text: script, voiceId: voice });
    res.json({ success: true, ...result });

  } catch (err) {
    console.error('Voice error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
