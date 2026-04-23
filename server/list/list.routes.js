const express = require("express");
const router = express.Router();
const prisma = require("../shared/db");
const { requireAuth } = require("../shared/middleware");

// ─── GET ALL LISTS FOR CUSTOMER ──────────────────────────────────
router.get("/", requireAuth, async (req, res) => {
  try {
    const lists = await prisma.savedList.findMany({
      where: { customer_id: req.user.customerId },
      orderBy: { created_at: "desc" },
    });
    res.json(lists);
  } catch (error) {
    console.error("Error fetching lists:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── GET SINGLE LIST ─────────────────────────────────────────────
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const list = await prisma.savedList.findFirst({
      where: { id: req.params.id, customer_id: req.user.customerId },
    });
    if (!list) return res.status(404).json({ error: "List not found" });
    res.json(list);
  } catch (error) {
    console.error("Error fetching list:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── SAVE A NEW LIST ─────────────────────────────────────────────
router.post("/", requireAuth, async (req, res) => {
  try {
    const { name, list_json } = req.body;
    let store_id = req.user.storeId;

    if (!store_id || store_id === "null") {
      const demoStore = await prisma.store.findFirst();
      store_id = demoStore ? demoStore.id : null;
    }

    const newList = await prisma.savedList.create({
      data: {
        customer_id: req.user.customerId,
        store_id,
        name: name || "My Shopping List",
        list_json: JSON.stringify(list_json),
      },
    });

    res.status(201).json(newList);
  } catch (error) {
    console.error("Error saving list:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── SAVE UNRECOGNIZED TERMS ─────────────────────────────────────
router.post("/unrecognized", requireAuth, async (req, res) => {
  try {
    const { raw_term } = req.body;

    const term = await prisma.unrecognizedTerm.create({
      data: {
        customer_id: req.user.customerId,
        raw_term,
      },
    });

    res.status(201).json(term);
  } catch (error) {
    console.error("Error saving unrecognized term:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
