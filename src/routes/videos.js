const express = require('express');
const router = express.Router();
const { fetchVideoClips } = require('../services/videoService');

/**
 * POST /api/get-videos
 * Body: { keywords, count }
 */
router.post('/', async (req, res) => {
  try {
    const { keywords = [], count = 5 } = req.body;
    if (!keywords.length) return res.status(400).json({ error: 'keywords مطلوبة' });

    const result = await fetchVideoClips({ keywords, count });
    res.json({ success: true, ...result });

  } catch (err) {
    console.error('Videos error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
