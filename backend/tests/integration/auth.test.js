const request = require("supertest");
const app = require("../../server");
const { connectDB, getDB } = require("../../src/db");

describe("Tests d'intégration - AUTH", () => {
    beforeAll(async () => {
        await connectDB();
    });

    beforeEach(async () => {
        const db = getDB();
        await db.collection("users").deleteMany({});
    });

    test("I-01 POST /api/auth/register -> 201 + token + user", async () => {
        const payload = {
            name: "Thibault",
            email: `t${Date.now()}@test.com`,
            password: "123456"
        };

        const res = await request(app).post("/api/auth/register").send(payload);

        expect(res.statusCode).toBe(201);
        expect(res.body.token).toBeTruthy();
        expect(res.body.user).toBeTruthy();
        expect(res.body.user.email).toBe(payload.email.toLowerCase());
    });

    test("I-02 POST /api/auth/register email déjà utilisé -> 409", async () => {
        const email = `dup${Date.now()}@test.com`;

        await request(app).post("/api/auth/register").send({
            name: "User1",
            email,
            password: "123456"
        });

        const res2 = await request(app).post("/api/auth/register").send({
            name: "User2",
            email,
            password: "123456"
        });

        expect(res2.statusCode).toBe(409);
        expect(res2.body.error).toBeTruthy();
    });

    test("I-03 POST /api/auth/login mauvais mdp -> 401", async () => {
        const email = `login${Date.now()}@test.com`;

        await request(app).post("/api/auth/register").send({
            name: "User",
            email,
            password: "123456"
        });

        const res = await request(app).post("/api/auth/login").send({
            email,
            password: "wrongpass"
        });

        expect(res.statusCode).toBe(401);
        expect(res.body.error).toBeTruthy();
    });

    test("I-04 POST /api/auth/login OK -> 200 + token", async () => {
        const email = `ok${Date.now()}@test.com`;

        await request(app).post("/api/auth/register").send({
            name: "User",
            email,
            password: "123456"
        });

        const res = await request(app).post("/api/auth/login").send({
            email,
            password: "123456"
        });

        expect(res.statusCode).toBe(200);
        expect(res.body.token).toBeTruthy();
        expect(res.body.user.email).toBe(email.toLowerCase());
    });
});
