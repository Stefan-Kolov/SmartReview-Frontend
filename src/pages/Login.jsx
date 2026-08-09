import React, { useState } from 'react';
import { login } from '../services/authService';
import './Auth.css';

export default function Login({ onLoginSuccess, onNavigateToRegister }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(username, password);
            onLoginSuccess();
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-left">
                <div className="auth-left-content">
                    <div className="auth-brand">SmartReview</div>
                    <h2>AI-Powered Code Review</h2>
                    <p>Analyze your repositories for bugs, security vulnerabilities and style issues — in seconds.</p>
                    <div className="auth-features">
                        <div className="auth-feature">🐛 Bug Detection</div>
                        <div className="auth-feature">🔒 Security Analysis</div>
                        <div className="auth-feature">✨ Style Review</div>
                        <div className="auth-feature">💡 Smart Suggestions</div>
                    </div>
                </div>
            </div>

            <div className="auth-right">
                <div className="auth-form-box">
                    <h2>Welcome Back</h2>
                    <p className="auth-subtitle">Sign in to your account to continue</p>

                    {error && <div className="auth-error">{error}</div>}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="auth-field">
                            <label>Username</label>
                            <input
                                type="text"
                                placeholder="Enter your username"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                required
                            />
                        </div>
                        <div className="auth-field">
                            <label>Password</label>
                            <input
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="auth-btn" disabled={loading}>
                            {loading ? 'Signing in...' : 'Sign In →'}
                        </button>
                    </form>

                    <p className="auth-footer">
                        Don't have an account?
                        <button onClick={onNavigateToRegister} className="auth-switch-btn">
                            Register here
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}