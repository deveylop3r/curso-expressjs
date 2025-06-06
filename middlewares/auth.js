const JWT = require("jsonwebtoken");

function authenticateToken(req, res, next) {
  //const token = req.headers.authorization?.split(' ')[1];
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  JWT.verify(token, process.env.JWT_SECRET, (error, user) => {
    if (error) return res.status(403).json({ error: "Invalid token" });

    req.user = user;
    next();
  });
}

module.exports = authenticateToken;
