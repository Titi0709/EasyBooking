const express = require("express");
const { getDB } = require("../db");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();

// protected (comme ça tout passe via login)
router.get("/", authMiddleware, async (req, res) => {
    try {
        const db = getDB();
        const rooms = await db.collection("rooms").find({}).sort({ name: 1 }).toArray();
        res.json(rooms.map(r => ({
            id: r._id.toString(),
            name: r.name,
            capacity: r.capacity,
            location: r.location || ""
        })));
    } catch {
        res.status(500).json({ error: "Erreur serveur" });
    }
});

module.exports = router;
