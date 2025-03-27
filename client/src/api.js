import axios from "axios";

const api = axios.create({
    baseURL: "https://api.kulzhabay.kz",
    // baseURL: "http://localhost:5033",
    timeout: 1000 * 30,
    headers: {
        "X-Requested-With": "XMLHttpRequest",
    },
});

export default api;