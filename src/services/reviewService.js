import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/reviews';

export const reviewService = {
    submitReview: async (repoUrl) => {
        const response = await axios.post(API_BASE_URL, { repoUrl });
        return response.data;
    },

    getAllReviews: async () => {
        const response = await axios.get(API_BASE_URL);
        return response.data;
    },

    getReviewById: async (id) => {
        const response = await axios.get(`${API_BASE_URL}/${id}`);
        return response.data;
    }
};
