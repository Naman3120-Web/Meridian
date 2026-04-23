const jwt = require("jsonwebtoken");
const prisma = require("./db");

// This is our "Bouncer" function. It guards our sensitive routes.
const requireAuth = async (req, res, next) => {
  // 1. Check if the user brought their "ID card" (the Authorization header)
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ error: "Unauthorized: No token provided", needLogout: true });
  }

  // 2. Extract the token itself (remove the "Bearer " part)
  const token = authHeader.split(" ")[1];

  try {
    // 3. Verify the token using our secret master key
    // If a hacker forged it, this will throw an error immediately
    const decodedPayload = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Attach the user's data (like their customer ID and store ID) to the request
    // so the next functions know exactly who is asking for data!
    req.user = decodedPayload;

    // VERY IMPORTANT FIX: Render wipes dev.db on free tier deploy.
    // We must verify the customer inside the token still actually exists in the database.
    const customerExists = await prisma.customer.findUnique({
      where: { id: req.user.customerId },
    });

    if (!customerExists) {
      // The token is valid but the wipe deleted the database entry!
      // Force the frontend to log them out automatically
      return res
        .status(401)
        .json({
          error: "Session expired (Database Wiped). Please log in again.",
          needLogout: true,
        });
    }

    // 5. Let them in! (move to the actual route handler)
    next();
  } catch (err) {
    return res
      .status(401)
      .json({
        error: "Unauthorized: Invalid or expired token",
        needLogout: true,
      });
  }
};

module.exports = { requireAuth };
