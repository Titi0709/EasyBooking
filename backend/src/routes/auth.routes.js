const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getDB } = require("../db");
const { JWT_SECRET } = require("../middleware/auth");
const { validateRegister, validateLogin } = require("../validators/auth.validators");

const router = express.Router();

router.post("/register", async (req, res) => {
    try {
        const errors = validateRegister(req.body);
        if (errors.length) return res.status(400).json({ errors });

        const db = getDB();
        const users = db.collection("users");

        const email = req.body.email.toLowerCase().trim();
        const existing = await users.findOne({ email });
        if (existing) return res.status(409).json({ error: "Email déjà utilisé" });

        const passwordHash = await bcrypt.hash(req.body.password, 10);

        const user = {
            name: req.body.name.trim(),
            email,
            passwordHash,
            createdAt: new Date()
        };

        const result = await users.insertOne(user);

        const token = jwt.sign({ userId: result.insertedId.toString(), email }, JWT_SECRET, { expiresIn: "2h" });

        return res.status(201).json({
            token,
            user: { id: result.insertedId.toString(), name: user.name, email: user.email }
        });
    } catch {
        return res.status(500).json({ error: "Erreur serveur" });
    }
});

router.post("/login", async (req, res) => {
    try {
        const errors = validateLogin(req.body);
        if (errors.length) return res.status(400).json({ errors });

        const db = getDB();
        const users = db.collection("users");

        const email = req.body.email.toLowerCase().trim();
        const user = await users.findOne({ email });
        if (!user) return res.status(401).json({ error: "Identifiants invalides" });

        const ok = await bcrypt.compare(req.body.password, user.passwordHash);
        if (!ok) return res.status(401).json({ error: "Identifiants invalides" });

        const token = jwt.sign({ userId: user._id.toString(), email }, JWT_SECRET, { expiresIn: "2h" });

        return res.json({
            token,
            user: { id: user._id.toString(), name: user.name, email: user.email }
        });
    } catch {
        return res.status(500).json({ error: "Erreur serveur" });
    }
});

module.exports = router;
