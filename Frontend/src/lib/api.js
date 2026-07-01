import axios from 'axios';

export const BASE_URL = 'https://food-waste-reduction-xj0d.onrender.com/api';
export const IMG_BASE_URL = 'https://food-waste-reduction-xj0d.onrender.com';

const api = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});

// Attach token on every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('foodsave_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// On 401, clear stale auth so user is redirected to login
api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            localStorage.removeItem('foodsave_token');
            localStorage.removeItem('foodsave_user');
        }
        return Promise.reject(err);
    }
);

export default api;
