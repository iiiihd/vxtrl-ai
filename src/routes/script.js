const express = require('express');
const router = express.Router();
const { generateScript } = require('../services/scriptService');

/**
 * POST /api/generate-script
 * Body: { idea, language, videoType }
 */
router.post('/', async (req, res) => {
  try {
    const { idea, language = 'ar', videoType = 'educational' } = req.body;
    if (!idea?.trim()) return res.status(400).json({ error: 'idea مطلوبة' });

    const result = await generateScript({ idea, language, videoType });
    res.json({ success: true, ...result });

  } catch (err) {
    console.error('Script error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
