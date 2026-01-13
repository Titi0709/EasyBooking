const { MongoClient } = require("mongodb");

const MONGODB_URI = "mongodb://localhost:27017";
const DB_NAME = "easybooking_db";

let db;
let client;

async function connectDB() {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db(DB_NAME);


    await db.collection("users").createIndex({ email: 1 }, { unique: true });
    await db.collection("reservations").createIndex({ userId: 1, start: 1 });
    await db.collection("reservations").createIndex({ roomId: 1, start: 1 });

    return db;
}

function getDB() {
    if (!db) throw new Error("DB non connectée");
    return db;
}

module.exports = { connectDB, getDB };
