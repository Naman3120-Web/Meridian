require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Middleware ─────────────────────────────────────────────
// Parse JSON request bodies (when frontend sends data)
app.use(express.json());

// Allow cross-origin requests from the frontend
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));

// ─── API Routes ─────────────────────────────────────────────
// Each feature has its own router module — clean separation
app.use('/api/auth', require('./auth/auth.routes'));
app.use('/api/products', require('./products/products.routes'));
app.use('/api/list', require('./list/list.routes'));
app.use('/api/navigation', require('./navigation/navigation.routes'));
app.use('/api/suggestions', require('./suggestions/suggestions.routes'));
app.use('/api/meal', require('./meal/meal.routes'));


// ─── Health Check ───────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get("/", (req, res) => {
  res.send("hello homepage");
});

// ─── Error Handler ──────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

// ─── Start Server ───────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 AI Store server running on http://localhost:${PORT}`);
});
