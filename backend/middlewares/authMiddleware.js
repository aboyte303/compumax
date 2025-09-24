const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "secreto_super_seguro";

function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(403).json({ message: "Token requerido" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Token inválido o expirado" });
    req.user = user;
    next();
  });
}

module.exports = { verifyToken };
