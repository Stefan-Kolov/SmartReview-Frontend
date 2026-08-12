import api from './api';

export const reviewService = {
    submitReview: async (repoUrl, provider, apiKey) => {
        const response = await api.post('/api/reviews', {
            repoUrl, provider, apiKey: apiKey || null
        });
        return response.data;
    },

    getAllReviews: async () => {
        const response = await api.get('/api/reviews');
        return response.data;
    },

    getReviewById: async (id) => {
        const response = await api.get(`/api/reviews/${id}`);
        return response.data;
    },

    deleteReview: async (id) => {
        await api.delete(`/api/reviews/${id}`);
    }
};