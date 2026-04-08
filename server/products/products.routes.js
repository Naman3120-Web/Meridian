const express = require('express');
const router = express.Router();
const prisma = require('../shared/db');

// ─── GET STORE CATALOGUE ──────────────────────────────────────────
// This route is called by the React app when it opens. 
// It downloads the ENTIRE list of products for a specific store.
router.get('/', async (req, res) => {
  try {
    // The frontend will ask like this: /api/products?store_id=123
    const { store_id } = req.query;

    if (!store_id) {
      return res.status(400).json({ error: 'Please provide a store_id query parameter' });
    }

    // Tell Prisma to find all physical products in this store
    const products = await prisma.product.findMany({
      where: { store_id },
      // "include" works like a SQL JOIN. It pulls in data from related tables
      include: {
        master_product: true, // Pulls the standard name (e.g. "Milk") and Hindi aliases
        inventory: true       // Pulls how many are left in stock
      }
    });

    res.json(products);
  } catch (error) {
    console.error('Failed to fetch products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
