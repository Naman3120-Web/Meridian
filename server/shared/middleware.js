const jwt = require('jsonwebtoken');

// This is our "Bouncer" function. It guards our sensitive routes.
const requireAuth = (req, res, next) => {
  // 1. Check if the user brought their "ID card" (the Authorization header)
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  // 2. Extract the token itself (remove the "Bearer " part)
  const token = authHeader.split(' ')[1];

  try {
    // 3. Verify the token using our secret master key
    // If a hacker forged it, this will throw an error immediately
    const decodedPayload = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Attach the user's data (like their customer ID and store ID) to the request
    // so the next functions know exactly who is asking for data!
    req.user = decodedPayload;

    // 5. Let them in! (move to the actual route handler)
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
  }
};

module.exports = { requireAuth };
