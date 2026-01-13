const express = require("express");
const cors = require("cors");
const { connectDB, getDB } = require("./src/db");

const authRoutes = require("./src/routes/auth.routes");
const roomsRoutes = require("./src/routes/rooms.routes");
const reservationsRoutes = require("./src/routes/reservations.routes");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomsRoutes);
app.use("/api/reservations", reservationsRoutes);

// seed rooms (au démarrage si vide)
async function seedRooms() {
    const db = getDB();
    const rooms = db.collection("rooms");

    const count = await rooms.countDocuments();
    if (count > 0) return;

    await rooms.insertMany([
        { name: "Salle Atlas", capacity: 6, location: "Étage 1" },
        { name: "Salle Orion", capacity: 10, location: "Étage 2" },
        { name: "Salle Zen", capacity: 4, location: "RDC" },
        { name: "Salle Titan", capacity: 20, location: "Étage 3" }
    ]);
}

async function start() {
    try {
        await connectDB();
        console.log("Connecté à MongoDB (easybooking_db)");
        await seedRooms();

        const PORT = 4000;
        app.listen(PORT, () => console.log(`API sur http://localhost:${PORT}`));
    } catch (e) {
        console.error("Erreur démarrage", e);
        process.exit(1);
    }
}

start();
