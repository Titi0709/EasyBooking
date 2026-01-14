const request = require("supertest");
const app = require("../../server");
const { connectDB, getDB } = require("../../src/db");
const { ObjectId } = require("mongodb");

async function createUserAndToken() {
    const email = `resa${Date.now()}@test.com`;

    await request(app).post("/api/auth/register").send({
        name: "ResaUser",
        email,
        password: "123456"
    });

    const login = await request(app).post("/api/auth/login").send({
        email,
        password: "123456"
    });

    return login.body.token;
}

describe("Tests d'intégration - RESERVATIONS", () => {
    beforeAll(async () => {
        await connectDB();
    });

    beforeEach(async () => {
        const db = getDB();
        await db.collection("users").deleteMany({});
        await db.collection("reservations").deleteMany({});
        await db.collection("rooms").deleteMany({});

        await db.collection("rooms").insertMany([
            { name: "Salle Atlas", capacity: 6, location: "Étage 1" }
        ]);
    });

    test("I-07 POST /api/reservations sans token -> 401", async () => {
        const res = await request(app).post("/api/reservations").send({
            roomId: "507f1f77bcf86cd799439011",
            start: new Date().toISOString(),
            end: new Date(Date.now() + 3600000).toISOString()
        });

        expect(res.statusCode).toBe(401);
    });

    test("I-08 POST /api/reservations room inexistante -> 404", async () => {
        const token = await createUserAndToken();

        const res = await request(app)
            .post("/api/reservations")
            .set("Authorization", `Bearer ${token}`)
            .send({
                roomId: new ObjectId().toString(),
                start: new Date().toISOString(),
                end: new Date(Date.now() + 3600000).toISOString()
            });

        expect(res.statusCode).toBe(404);
        expect(res.body.error).toBeTruthy();
    });

    test("I-09 POST /api/reservations OK -> 201", async () => {
        const token = await createUserAndToken();

        const rooms = await request(app)
            .get("/api/rooms")
            .set("Authorization", `Bearer ${token}`);

        const roomId = rooms.body[0].id;

        const res = await request(app)
            .post("/api/reservations")
            .set("Authorization", `Bearer ${token}`)
            .send({
                roomId,
                start: new Date().toISOString(),
                end: new Date(Date.now() + 3600000).toISOString()
            });

        expect(res.statusCode).toBe(201);
        expect(res.body.roomId).toBe(roomId);
    });

    test("I-10 POST /api/reservations conflit overlap -> 409", async () => {
        const token = await createUserAndToken();

        const rooms = await request(app)
            .get("/api/rooms")
            .set("Authorization", `Bearer ${token}`);

        const roomId = rooms.body[0].id;

        const start = new Date().toISOString();
        const end = new Date(Date.now() + 3600000).toISOString();

        // 1ère réservation OK
        await request(app)
            .post("/api/reservations")
            .set("Authorization", `Bearer ${token}`)
            .send({ roomId, start, end });

        // 2ème réservation sur même créneau -> conflit
        const res2 = await request(app)
            .post("/api/reservations")
            .set("Authorization", `Bearer ${token}`)
            .send({ roomId, start, end });

        expect(res2.statusCode).toBe(409);
        expect(res2.body.error).toBeTruthy();
    });

    test("I-11 GET /api/reservations/me -> 200 + contient la réservation", async () => {
        const token = await createUserAndToken();

        const rooms = await request(app)
            .get("/api/rooms")
            .set("Authorization", `Bearer ${token}`);

        const roomId = rooms.body[0].id;

        await request(app)
            .post("/api/reservations")
            .set("Authorization", `Bearer ${token}`)
            .send({
                roomId,
                start: new Date().toISOString(),
                end: new Date(Date.now() + 3600000).toISOString()
            });

        const me = await request(app)
            .get("/api/reservations/me")
            .set("Authorization", `Bearer ${token}`);

        expect(me.statusCode).toBe(200);
        expect(Array.isArray(me.body)).toBe(true);
        expect(me.body.length).toBeGreaterThanOrEqual(1);
        expect(me.body[0].room).toBeTruthy();
        expect(me.body[0].start).toBeTruthy();
        expect(me.body[0].end).toBeTruthy();
    });
});
