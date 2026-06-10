import React, { useState } from 'react';
import { register } from '../services/authService';
import './Auth.css';

export default function Register({ onNavigateToLogin, onRegisterSuccess }) {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        name: '',
        surname: '',
        email: ''
    });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await register(formData.username, formData.password, formData.name, formData.surname, formData.email);
            onRegisterSuccess();
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed. Try again.');
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-container">
                <h2>Create Account</h2>
                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <input type="text" name="name" placeholder="First Name" value={formData.name} onChange={handleChange} required />
                    <input type="text" name="surname" placeholder="Last Name" value={formData.surname} onChange={handleChange} required />
                    <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} required />
                    <input type="text" name="username" placeholder="Username" value={formData.username} onChange={handleChange} required />
                    <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />

                    <button type="submit" className="auth-btn auth-btn-register">Register</button>
                </form>

                <p className="auth-footer">
                    Already have an account?
                    <button onClick={onNavigateToLogin} className="auth-switch-btn">
                        Login here
                    </button>
                </p>
            </div>
        </div>
    );
}