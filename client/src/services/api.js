import axios from 'axios';

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor — attach token if available
API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('ecobite_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor — handle common errors
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            // Token expired or invalid
            if (error.response.status === 401) {
                localStorage.removeItem('ecobite_token');
                // Optionally redirect to login
            }
        }
        return Promise.reject(error);
    }
);

export default API;
