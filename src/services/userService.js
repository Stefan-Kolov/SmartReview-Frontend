import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/users';

const userApi = axios.create({
    baseURL: API_BASE_URL
});

userApi.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const userService = {
    getProfile: async () => {
        const response = await userApi.get('/me');
        return response.data;
    },

    updateProfile: async (data) => {
        const response = await userApi.put('/me', data);
        return response.data;
    },

    changePassword: async (data) => {
        await userApi.put('/me/password', data);
    }
};