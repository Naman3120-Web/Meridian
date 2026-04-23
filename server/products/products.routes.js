const express = require("express");
const router = express.Router();
const prisma = require("../shared/db");

// ─── GET STORE CATALOGUE ──────────────────────────────────────────
// This route is called by the React app when it opens.
// It downloads the ENTIRE list of products for a specific store.
router.get("/", async (req, res) => {
  try {
    // The frontend will ask like this: /api/products?store_id=123
    let { store_id } = req.query;

    if (!store_id || store_id === "null" || store_id === "undefined") {
      // Fallback: If no store_id is provided, just grab the first store from the database
      const demoStore = await prisma.store.findFirst();
      if (demoStore) {
        store_id = demoStore.id;
      } else {
        return res
          .status(400)
          .json({ error: "No stores available in database" });
      }
    }

    // Tell Prisma to find all physical products in this store
    const products = await prisma.product.findMany({
      where: { store_id },
      // "include" works like a SQL JOIN. It pulls in data from related tables
      include: {
        master_product: true, // Pulls the standard name (e.g. "Milk") and Hindi aliases
        inventory: true, // Pulls how many are left in stock
      },
    });

    res.json(products);
  } catch (error) {
    console.error("Failed to fetch products:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
