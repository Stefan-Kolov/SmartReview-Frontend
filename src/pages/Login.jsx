import React, { useState } from 'react';
import { login } from '../services/authService';
import './Auth.css';

export default function Login({ onLoginSuccess, onNavigateToRegister }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await login(username, password);
            onLoginSuccess();
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-container">
                <h2>Welcome Back</h2>
                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit" className="auth-btn">Sign In</button>
                </form>

                <p className="auth-footer">
                    Don't have an account?
                    <button onClick={onNavigateToRegister} className="auth-switch-btn">
                        Register here
                    </button>
                </p>
            </div>
        </div>
    );
}