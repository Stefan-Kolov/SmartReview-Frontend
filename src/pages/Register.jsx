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
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await register(formData.username, formData.password, formData.name, formData.surname, formData.email);
            onRegisterSuccess();
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-left">
                <div className="auth-left-content">
                    <div className="auth-brand">SmartReview</div>
                    <h2>Start reviewing code smarter.</h2>
                    <p>Create your free account and get instant AI-powered feedback on your repositories.</p>
                    <div className="auth-features">
                        <div className="auth-feature">⚡ Groq — Llama 3.3 70B</div>
                        <div className="auth-feature">🧠 Anthropic — Claude Haiku</div>
                        <div className="auth-feature">🤖 OpenAI — GPT-4o Mini</div>
                        <div className="auth-feature">✨ Google — Gemini 1.5 Flash</div>
                    </div>
                </div>
            </div>

            <div className="auth-right">
                <div className="auth-form-box">
                    <h2>Create Account</h2>
                    <p className="auth-subtitle">Fill in your details to get started</p>

                    {error && <div className="auth-error">{error}</div>}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="auth-row">
                            <div className="auth-field">
                                <label>First Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="John"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="auth-field">
                                <label>Last Name</label>
                                <input
                                    type="text"
                                    name="surname"
                                    placeholder="Doe"
                                    value={formData.surname}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                        <div className="auth-field">
                            <label>Email</label>
                            <input
                                type="email"
                                name="email"
                                placeholder="john@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="auth-field">
                            <label>Username</label>
                            <input
                                type="text"
                                name="username"
                                placeholder="johndoe"
                                value={formData.username}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="auth-field">
                            <label>Password</label>
                            <input
                                type="password"
                                name="password"
                                placeholder="Min. 6 characters"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <button type="submit" className="auth-btn" disabled={loading}>
                            {loading ? 'Creating account...' : 'Create Account →'}
                        </button>
                    </form>

                    <p className="auth-footer">
                        Already have an account?
                        <button onClick={onNavigateToLogin} className="auth-switch-btn">
                            Login here
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}