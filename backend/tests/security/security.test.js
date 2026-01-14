const request = require("supertest");
const app = require("../../server");
const { connectDB, getDB } = require("../../src/db");
const { ObjectId } = require("mongodb");

async function createUserAndToken() {
    const email = `sec${Date.now()}@test.com`;

    await request(app).post("/api/auth/register").send({
        name: "SecUser",
        email,
        password: "123456"
    });

    const login = await request(app).post("/api/auth/login").send({
        email,
        password: "123456"
    });

    return login.body.token;
}

describe("Tests sécurité - API EasyBooking", () => {
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


    test("S-01 Accès /api/rooms sans token -> 401", async () => {
        const res = await request(app).get("/api/rooms");
        expect(res.statusCode).toBe(401);
    });


    test("S-02 Accès /api/rooms avec token invalide -> 401", async () => {
        const res = await request(app)
            .get("/api/rooms")
            .set("Authorization", "Bearer invalid.token.here");
        expect(res.statusCode).toBe(401);
    });


    test("S-03 Accès /api/reservations/me sans token -> 401", async () => {
        const res = await request(app).get("/api/reservations/me");
        expect(res.statusCode).toBe(401);
    });


    test("S-04 Login avec email en objet (tentative injection) -> doit refuser (400 ou 401) et ne pas crash", async () => {
        const res = await request(app).post("/api/auth/login").send({
            email: { $gt: "" },
            password: "123456"
        });

        expect([400, 401]).toContain(res.statusCode);
    });


    test("S-05 5 tentatives login KO -> toujours 401 (pas 500)", async () => {
        const email = `bf${Date.now()}@test.com`;

        await request(app).post("/api/auth/register").send({
            name: "BF",
            email,
            password: "123456"
        });

        for (let i = 0; i < 5; i++) {
            const res = await request(app).post("/api/auth/login").send({
                email,
                password: "wrong"
            });
            expect(res.statusCode).toBe(401);
        }
    });


    test("S-06 Register avec name contenant <script> -> 201 et name renvoyé en string", async () => {
        const email = `xss${Date.now()}@test.com`;
        const payload = {
            name: `<script>alert("x")</script>`,
            email,
            password: "123456"
        };

        const res = await request(app).post("/api/auth/register").send(payload);
        expect(res.statusCode).toBe(201);
        expect(typeof res.body.user.name).toBe("string");
        expect(res.body.user.name).toContain("<script>");
    });


    test("S-07 POST /api/reservations avec start invalide -> 400", async () => {
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
                start: "invalid-date",
                end: new Date(Date.now() + 3600000).toISOString()
            });

        expect(res.statusCode).toBe(400);
        expect(res.body.errors?.length).toBeGreaterThan(0);
    });


    test("S-08 POST /api/reservations end <= start -> 400", async () => {
        const token = await createUserAndToken();
        const rooms = await request(app)
            .get("/api/rooms")
            .set("Authorization", `Bearer ${token}`);

        const roomId = rooms.body[0].id;

        const start = new Date().toISOString();
        const end = new Date(Date.now() - 3600000).toISOString();

        const res = await request(app)
            .post("/api/reservations")
            .set("Authorization", `Bearer ${token}`)
            .send({ roomId, start, end });

        expect(res.statusCode).toBe(400);
    });


    test("S-09 POST /api/reservations avec roomId inexistant -> 404", async () => {
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
    });

    //CORS présent (vu que cors() est activé)
    test("S-10 Réponse API contient un header CORS (Access-Control-Allow-Origin)", async () => {
        const res = await request(app).get("/health");
        // avec le package cors, le header peut être "*"
        expect(res.headers["access-control-allow-origin"]).toBeTruthy();
    });
});
