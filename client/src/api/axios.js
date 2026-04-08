import axios from 'axios';
import { API_URL } from '../config';

const API = axios.create({
    baseURL: API_URL,
});

// Add a request interceptor to include JWT token and fix path resolution
API.interceptors.request.use((config) => {
    // If baseURL is used and url starts with /, strip the / so it appends correctly to the path
    if (config.baseURL && config.url && config.url.startsWith('/')) {
        config.url = config.url.substring(1);
    }

    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Add a response interceptor to handle 401 errors globally
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Unauthorized - Clear user data and token
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Redirect to login or reload to clear app state
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default API;
