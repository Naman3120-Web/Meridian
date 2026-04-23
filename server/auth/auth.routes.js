const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../shared/db");
const { requireAuth } = require("../shared/middleware");

// ─── REGISTER A NEW CUSTOMER ──────────────────────────────────────
router.post("/register", async (req, res) => {
  try {
    const { store_id, name, phone, email, password } = req.body;

    // ✨ NEW: 1. Ensure store_id was provided in the request body
    if (!store_id) {
      return res
        .status(400)
        .json({ error: "store_id is required to register a customer." });
    }

    // ✨ NEW: 2. Verify the store actually exists in the database
    const storeExists = await prisma.store.findUnique({
      where: { id: store_id },
    });
    if (!storeExists) {
      return res.status(400).json({
        error: `Invalid store_id: No store found with ID '${store_id}'. Please create a store first.`,
      });
    }

    // 3. Check if email or phone already exists
    const existingCustomer = await prisma.customer.findFirst({
      where: { OR: [{ email }, { phone }] },
    });
    if (existingCustomer) {
      return res.status(400).json({ error: "Email or phone already in use" });
    }

    // 4. Hash the password (salts it 10 times making it extremely secure)
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // 5. Save the new customer in the database via Prisma
    const customer = await prisma.customer.create({
      data: {
        store_id, // We now know this is a 100% valid, existing store ID
        name,
        phone,
        email,
        password_hash,
      },
    });

    // 6. Create their JWT ID card
    const token = jwt.sign(
      { customerId: customer.id, storeId: customer.store_id },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }, // Keep them logged in for 30 days
    );

    // 7. Send back success and the token!
    res.status(201).json({
      message: "Registration successful",
      token,
      customer: {
        id: customer.id,
        name: customer.name,
        step_length: customer.step_length_meters,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── LOGIN EXISTING CUSTOMER ──────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find the customer by email
    const customer = await prisma.customer.findUnique({ where: { email } });
    if (!customer) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // 2. Compare the typed password with the hashed password from the DB
    const isMatch = await bcrypt.compare(password, customer.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // 3. Generate a new token
    const token = jwt.sign(
      { customerId: customer.id, storeId: customer.store_id },
      process.env.JWT_SECRET,
      { expiresIn: "30d" },
    );

    res.json({
      message: "Login successful",
      token,
      customer: {
        id: customer.id,
        name: customer.name,
        step_length: customer.step_length_meters,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── STEP CALIBRATION (Protected Route) ───────────────────────────
router.post("/calibrate", requireAuth, async (req, res) => {
  try {
    const { step_length_meters } = req.body;
    const customerId = req.user.customerId;

    const updatedCustomer = await prisma.customer.update({
      where: { id: customerId },
      data: { step_length_meters },
    });

    res.json({
      message: "Step length calibrated successfully",
      step_length_meters: updatedCustomer.step_length_meters,
    });
  } catch (error) {
    console.error("Calibration error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
