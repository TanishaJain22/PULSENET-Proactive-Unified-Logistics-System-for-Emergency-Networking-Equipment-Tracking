const express = require('express');
const router = express.Router();
const { fetchRoute } = require('../services/routingService');

// GET /api/routes/driving/:startLng,:startLat;:endLng,:endLat
router.get('/driving/:coords', async (req, res) => {
  const data = await fetchRoute(req.params.coords);
  res.json(data);
});

module.exports = router;
