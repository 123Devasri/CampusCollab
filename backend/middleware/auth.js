const jwt = require("jsonwebtoken");

// Middleware to verify JWT token and attach user to req.user
const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authorization token missing or invalid. Please login."
      });
    }

    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET || "campuscollab_secret_key_2026_jwt_token";

    const decoded = jwt.verify(token, secret);

    // Attach user payload: { id, email, role }
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role || "user"
    };

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Session expired or invalid token. Please log in again."
    });
  }
};

// Admin authorization guard
const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      message: "Access forbidden. Admin privileges required."
    });
  }
  next();
};

module.exports = {
  authenticate,
  adminOnly
};
