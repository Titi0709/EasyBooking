import axios from "axios";

export const API_URL = "http://localhost:4000/api";

export const api = axios.create({
    baseURL: API_URL
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});
