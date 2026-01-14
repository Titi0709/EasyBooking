import http from "k6/http";
import { check, sleep } from "k6";
import { Rate } from "k6/metrics";

const functional_failed = new Rate("functional_failed");

export const options = {
    vus: 10,
    duration: "30s",
    thresholds: {
        http_req_duration: ["p(95)<500"],
        functional_failed: ["rate<0.01"], // <1% d’échecs fonctionnels
    },
};

const BASE_URL = "http://localhost:4000";

export function setup() {
    const res = http.post(
        `${BASE_URL}/api/auth/login`,
        JSON.stringify({ email: "thibault.lefay.pro@gmail.com", password: "123456" }),
        { headers: { "Content-Type": "application/json" } }
    );

    check(res, { "login status 200": (r) => r.status === 200 });
    return { token: res.json("token") };
}

export default function (data) {
    const auth = {
        headers: {
            Authorization: `Bearer ${data.token}`,
            "Content-Type": "application/json",
        },
    };

    // 1) GET rooms
    const roomsRes = http.get(`${BASE_URL}/api/rooms`, auth);
    const okRooms = check(roomsRes, { "GET /rooms 200": (r) => r.status === 200 });
    functional_failed.add(!okRooms);

    const rooms = roomsRes.json();
    if (!Array.isArray(rooms) || rooms.length === 0) {
        sleep(1);
        return;
    }

    // 2) POST reservation (on accepte 201 ou 409)
    const now = Date.now();
    const start = new Date(now + Math.floor(Math.random() * 600000)).toISOString(); // +0 à +10min
    const end = new Date(new Date(start).getTime() + 3600000).toISOString(); // +1h

    const bookRes = http.post(
        `${BASE_URL}/api/reservations`,
        JSON.stringify({ roomId: rooms[0].id, start, end }),
        auth
    );


    if (bookRes.status !== 201 && bookRes.status !== 409 && __ITER < 3) {
        console.log(`Reservation failed: status=${bookRes.status} body=${bookRes.body}`);
    }

    const okBook = check(bookRes, {
        "POST /reservations 201|409": (r) => r.status === 201 || r.status === 409,
    });
    functional_failed.add(!okBook);


    const meRes = http.get(`${BASE_URL}/api/reservations/me`, auth);
    const okMe = check(meRes, { "GET /reservations/me 200": (r) => r.status === 200 });
    functional_failed.add(!okMe);

    sleep(1);
}
