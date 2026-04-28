const express = require('express');
const router = express.Router();
const { renderVideo } = require('../services/renderService');

/**
 * POST /api/render-video
 * Body: { clips, audioPath, script, language }
 */
router.post('/', async (req, res) => {
  try {
    const { clips, audioPath, script, language = 'ar' } = req.body;
    if (!clips?.length || !audioPath) {
      return res.status(400).json({ error: 'clips و audioPath مطلوبان' });
    }

    const result = await renderVideo({ clips, audioPath, script, language });
    res.json({ success: true, ...result });

  } catch (err) {
    console.error('Render error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
