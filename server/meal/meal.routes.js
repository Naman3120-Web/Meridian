const express = require("express");
const router = express.Router();
const prisma = require("../shared/db");
const { requireAuth } = require("../shared/middleware");

router.post("/map", requireAuth, async (req, res) => {
  try {
    const { ingredients } = req.body; // Array of ingredient names e.g. ["chicken", "rice", "spice"]
    let storeId = req.user.storeId;
    if (!storeId || storeId === "null") {
      const demoStore = await prisma.store.findFirst();
      storeId = demoStore ? demoStore.id : null;
    }

    // We will do a simple fuzzy match server-side,
    // or exact match against master_products.
    // In a real scenario you would have a more robust vector-based search.

    const allProducts = await prisma.product.findMany({
      where: { store_id: storeId },
      include: { master_product: true },
    });

    const mapped = [];

    for (const ingred of ingredients) {
      const term = ingred.toLowerCase();
      // Find the best match
      const match = allProducts.find(
        (p) =>
          p.master_product.name.toLowerCase().includes(term) ||
          p.master_product.hindi_names.toLowerCase().includes(term),
      );

      if (match) {
        mapped.push({
          ingredient: ingred,
          found: true,
          product: match,
        });
      } else {
        mapped.push({
          ingredient: ingred,
          found: false,
          product: null,
        });
      }
    }

    res.json(mapped);
  } catch (error) {
    console.error("Error mapping meal:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
