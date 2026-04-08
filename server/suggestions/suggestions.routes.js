const express = require('express');
const router = express.Router();
const prisma = require('../shared/db');
const aprioriCache = require('../shared/apriori.cache');
const { requireAuth } = require('../shared/middleware');

router.post('/', requireAuth, async (req, res) => {
  try {
    const { current_cart_ids } = req.body;
    const storeId = req.user.storeId;

    if (!current_cart_ids || current_cart_ids.length === 0) {
      return res.json([]); // No suggestions if cart is empty
    }

    // Ensure laws are loaded
    if (!aprioriCache.rulesByStore[storeId]) {
      await aprioriCache.loadFromDb(storeId);
    }

    const suggestedIds = aprioriCache.getSuggestions(storeId, current_cart_ids, 5);
    
    // Fallback logic for demo if no rules match (helps UI validation)
    if (suggestedIds.length === 0 && current_cart_ids.length > 0) {
       // Just grab 2 random distinct products that aren't in the cart
       const otherProducts = await prisma.product.findMany({
         where: { 
           store_id: storeId,
           id: { notIn: current_cart_ids }
         },
         include: { master_product: true },
         take: 3
       });
       return res.json(otherProducts);
    }

    // Map Ids to product objects
    if (suggestedIds.length > 0) {
      const products = await prisma.product.findMany({
        where: { id: { in: suggestedIds } },
        include: { master_product: true }
      });
      return res.json(products);
    }

    res.json([]);
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin-level route to force-regen (useful for testing)
router.post('/regen', requireAuth, async (req, res) => {
   const storeId = req.user.storeId;
   await aprioriCache.generateRules(storeId);
   res.json({ message: "Rules generated" });
});

module.exports = router;
