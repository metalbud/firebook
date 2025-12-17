const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).json({ error: "No token provided." });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Invalid token format." });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, userData) => {
    if (err) {
      return res.status(403).json({ error: "Failed to authenticate token." });
    }
    req.user = userData;
    next();
  });
}

function authorizeRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ error: "Forbidden: insufficient permissions." });
    }
    next();
  };
}

module.exports = {
  authenticateToken,
  authorizeRole,
};
