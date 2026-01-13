const jwt = require("jsonwebtoken");

const JWT_SECRET = "dev_secret_change_me";

function authMiddleware(req, res, next) {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) return res.status(401).json({ error: "Non authentifié" });

    try {
        const payload = jwt.verify(token, JWT_SECRET);
        req.user = payload; // { userId, email }
        next();
    } catch {
        return res.status(401).json({ error: "Token invalide" });
    }
}

module.exports = { authMiddleware, JWT_SECRET };
