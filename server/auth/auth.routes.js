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

    // 1. Check if email or phone already exists
    const existingCustomer = await prisma.customer.findFirst({
      where: { OR: [{ email }, { phone }] },
    });
    if (existingCustomer) {
      return res.status(400).json({ error: "Email or phone already in use" });
    }

    // 2. Hash the password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // 2.5 Grab a default store if none is provided
    let final_store_id = store_id;
    if (
      !final_store_id ||
      final_store_id === "null" ||
      final_store_id === "undefined"
    ) {
      const demoStore = await prisma.store.findFirst();
      final_store_id = demoStore ? demoStore.id : null;
    }

    // 3. Save the new customer
    const customer = await prisma.customer.create({
      data: {
        store_id: final_store_id, // Assigned to our first database store!
        name,
        phone,
        email,
        password_hash,
      },
    });

    // 4. Create their JWT token
    const token = jwt.sign(
      { customerId: customer.id, storeId: customer.store_id },
      process.env.JWT_SECRET,
      { expiresIn: "30d" },
    );

    // 5. Send back success!
    res.status(201).json({
      message: "Registration successful",
      token,
      customer: {
        id: customer.id,
        name: customer.name,
        step_length: customer.step_length_meters,
        store_id: customer.store_id,
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
        store_id: customer.store_id,
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
