import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:4001/api', // Hardcoded for now to match backend port
    headers: { 'Content-Type': 'application/json' },
});

// Attach access token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access');
    if (token && config.headers) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor: if 401 try refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If 401 and not already retrying
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refresh = localStorage.getItem('refresh');
                if (!refresh) throw new Error('No refresh token available');

                const res = await axios.post('http://localhost:4001/api/auth/refresh', { refresh });

                const { access } = res.data;
                localStorage.setItem('access', access);

                originalRequest.headers['Authorization'] = `Bearer ${access}`;
                return api(originalRequest);
            } catch (e) {
                // Refresh failed - clean up and redirect
                localStorage.removeItem('access');
                localStorage.removeItem('refresh');
                window.location.href = '/login';
                return Promise.reject(e);
            }
        }
        return Promise.reject(error);
    }
);

export default api;
