import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/reviews';

const reviewApi = axios.create({
    baseURL: API_BASE_URL
});

reviewApi.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export const reviewService = {
    submitReview: async (repoUrl) => {
        const response = await reviewApi.post('', { repoUrl });
        return response.data;
    },

    getAllReviews: async () => {
        const response = await reviewApi.get('');
        return response.data;
    },

    getReviewById: async (id) => {

        const response = await reviewApi.get(`/${id}`);
        return response.data;
    }
};