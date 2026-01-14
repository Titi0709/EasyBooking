import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
    vus: 10,
    duration: "30s",
    thresholds: {
        http_req_failed: ["rate<0.01"],
        http_req_duration: ["p(95)<500"],
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
    const res = http.get(`${BASE_URL}/api/rooms`, {
        headers: { Authorization: `Bearer ${data.token}` },
    });

    check(res, {
        "GET /rooms status 200": (r) => r.status === 200,
        "rooms is array": (r) => Array.isArray(r.json()),
    });

    sleep(1);
}
