import axios from 'axios';

const AUTH_URL = `${process.env.REACT_APP_API_URL}/api/auth`;

export const register = async (username, password, name, surname, email) => {
    const response = await axios.post(`${AUTH_URL}/register`, {
        username, password, name, surname, email
    });
    if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('username', response.data.username);
    }
    return response.data;
};

export const login = async (username, password) => {
    const response = await axios.post(`${AUTH_URL}/login`, { username, password });
    if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('username', response.data.username);
    }
    return response.data;
};

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
};

export const getCurrentUser = () => localStorage.getItem('username');
export const getToken = () => localStorage.getItem('token');