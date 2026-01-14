const request = require("supertest");
const app = require("../../server");
const { connectDB, getDB } = require("../../src/db");

async function loginAndGetToken() {
    const email = `rooms${Date.now()}@test.com`;

    await request(app).post("/api/auth/register").send({
        name: "RoomsUser",
        email,
        password: "123456"
    });

    const res = await request(app).post("/api/auth/login").send({
        email,
        password: "123456"
    });

    return res.body.token;
}

describe("Tests d'intégration - ROOMS", () => {
    beforeAll(async () => {
        await connectDB();
    });

    beforeEach(async () => {
        const db = getDB();

        await db.collection("users").deleteMany({});
        await db.collection("rooms").deleteMany({});

        await db.collection("rooms").insertMany([
            { name: "Salle A", capacity: 6, location: "Étage 1" },
            { name: "Salle B", capacity: 10, location: "Étage 2" }
        ]);
    });

    test("I-05 GET /api/rooms sans token -> 401", async () => {
        const res = await request(app).get("/api/rooms");
        expect(res.statusCode).toBe(401);
    });

    test("I-06 GET /api/rooms avec token -> 200 + liste", async () => {
        const token = await loginAndGetToken();

        const res = await request(app)
            .get("/api/rooms")
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThanOrEqual(2);
        expect(res.body[0].name).toBeTruthy();
    });
});
