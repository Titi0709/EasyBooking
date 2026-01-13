const express = require("express");
const { ObjectId } = require("mongodb");
const { getDB } = require("../db");
const { authMiddleware } = require("../middleware/auth");
const { validateReservation } = require("../validators/reservation.validators");

const router = express.Router();

// créer une réservation
router.post("/", authMiddleware, async (req, res) => {
    try {
        const errors = validateReservation(req.body);
        if (errors.length) return res.status(400).json({ errors });

        const db = getDB();
        const reservations = db.collection("reservations");
        const rooms = db.collection("rooms");

        const roomId = new ObjectId(req.body.roomId);
        const start = new Date(req.body.start);
        const end = new Date(req.body.end);

        const room = await rooms.findOne({ _id: roomId });
        if (!room) return res.status(404).json({ error: "Salle introuvable" });

        // blocage chevauchement: overlap si start < existing.end ET end > existing.start
        const conflict = await reservations.findOne({
            roomId: roomId,
            start: { $lt: end },
            end: { $gt: start }
        });

        if (conflict) {
            return res.status(409).json({ error: "Salle déjà réservée sur ce créneau" });
        }

        const doc = {
            userId: new ObjectId(req.user.userId),
            roomId,
            start,
            end,
            createdAt: new Date()
        };

        const result = await reservations.insertOne(doc);
        const inserted = await reservations.findOne({ _id: result.insertedId });

        return res.status(201).json({
            id: inserted._id.toString(),
            roomId: inserted.roomId.toString(),
            start: inserted.start,
            end: inserted.end
        });
    } catch {
        return res.status(500).json({ error: "Erreur serveur" });
    }
});

// mes réservations
router.get("/me", authMiddleware, async (req, res) => {
    try {
        const db = getDB();
        const reservations = db.collection("reservations");
        const rooms = db.collection("rooms");

        const userId = new ObjectId(req.user.userId);

        const docs = await reservations.find({ userId }).sort({ start: -1 }).toArray();

        // join simple
        const roomIds = [...new Set(docs.map(d => d.roomId.toString()))].map(id => new ObjectId(id));
        const roomsList = await rooms.find({ _id: { $in: roomIds } }).toArray();
        const roomMap = new Map(roomsList.map(r => [r._id.toString(), r]));

        return res.json(docs.map(d => ({
            id: d._id.toString(),
            room: {
                id: d.roomId.toString(),
                name: roomMap.get(d.roomId.toString())?.name || "Salle",
                capacity: roomMap.get(d.roomId.toString())?.capacity ?? null,
                location: roomMap.get(d.roomId.toString())?.location || ""
            },
            start: d.start,
            end: d.end,
            createdAt: d.createdAt
        })));
    } catch {
        return res.status(500).json({ error: "Erreur serveur" });
    }
});

module.exports = router;
