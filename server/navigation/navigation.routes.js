const express = require('express');
const router = express.Router();
const prisma = require('../shared/db');
const { requireAuth } = require('../shared/middleware');

router.get('/map', requireAuth, async (req, res) => {
  try {
    const storeId = req.user.storeId;

    const storeMap = await prisma.storeMap.findFirst({
      where: { store_id: storeId }
    });

    if (!storeMap) {
      // Return a demo fallback if map not seeded properly
      return res.json({
        walkable_paths_json: JSON.stringify([
          { x: 50, y: 50 }, { x: 50, y: 200 }, { x: 150, y: 200 }, { x: 250, y: 200 }
        ]),
        map_json: "{}"
      });
    }

    res.json({
      map_json: storeMap.map_json,
      aisle_coordinates_json: storeMap.aisle_coordinates_json,
      walkable_paths_json: storeMap.walkable_paths_json
    });
  } catch (error) {
    console.error('Error fetching map:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
