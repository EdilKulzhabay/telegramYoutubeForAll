import axios from "axios";

const api = axios.create({
    baseURL: "api.kulzhabay.kz",
    timeout: 1000 * 30,
    headers: {
        "X-Requested-With": "XMLHttpRequest",
    },
});

export default api;