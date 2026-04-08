const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../shared/db');
const { requireAuth } = require('../shared/middleware');

// ─── REGISTER A NEW CUSTOMER ──────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { store_id, name, phone, email, password } = req.body;

    // 1. Check if email or phone already exists
    const existingCustomer = await prisma.customer.findFirst({
      where: { OR: [{ email }, { phone }] }
    });
    if (existingCustomer) {
      return res.status(400).json({ error: 'Email or phone already in use' });
    }

    // 2. Hash the password (salts it 10 times making it extremely secure)
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // 3. Save the new customer in the database via Prisma
    const customer = await prisma.customer.create({
      data: {
        store_id, // For this demo, they belong to the specific store
        name,
        phone,
        email,
        password_hash,
        // step_length_meters defaults to 0.75 in the Prisma schema
      }
    });

    // 4. Create their JWT ID card
    const token = jwt.sign(
      { customerId: customer.id, storeId: customer.store_id },
      process.env.JWT_SECRET,
      { expiresIn: '30d' } // Keep them logged in for 30 days
    );

    // 5. Send back success and the token!
    res.status(201).json({
      message: 'Registration successful',
      token,
      customer: { id: customer.id, name: customer.name, step_length: customer.step_length_meters }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── LOGIN EXISTING CUSTOMER ──────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find the customer by email
    const customer = await prisma.customer.findUnique({ where: { email } });
    if (!customer) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // 2. Compare the typed password with the hashed password from the DB
    const isMatch = await bcrypt.compare(password, customer.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // 3. Generate a new token
    const token = jwt.sign(
      { customerId: customer.id, storeId: customer.store_id },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      message: 'Login successful',
      token,
      customer: { id: customer.id, name: customer.name, step_length: customer.step_length_meters }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── STEP CALIBRATION (Protected Route) ───────────────────────────
// This updates the customer's personal stride length (default 0.75m)
// Notice we pass `requireAuth` here. Only logged-in users with valid tokens can do this!
router.post('/calibrate', requireAuth, async (req, res) => {
  try {
    const { step_length_meters } = req.body;
    const customerId = req.user.customerId; // We get this safely from the JWT "Bouncer"

    const updatedCustomer = await prisma.customer.update({
      where: { id: customerId },
      data: { step_length_meters }
    });

    res.json({ 
      message: 'Step length calibrated successfully', 
      step_length_meters: updatedCustomer.step_length_meters 
    });
  } catch (error) {
    console.error('Calibration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
