import axios from 'axios';
import useAuthStore from '../store/useAuthStore';

const apiClient = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL || 'https://health-analytics-backend.onrender.com'}/api/v1`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to include the auth token and manage Content-Type for FormData
apiClient.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // If data is FormData, do not use the default application/json header
        // This forces the browser to set Content-Type to multipart/form-data with the correct boundary
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor for global error handling
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.error('Session expired. Please log in again.');
            useAuthStore.getState().logout();
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default apiClient;
