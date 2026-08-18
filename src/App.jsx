import { useState, useEffect } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import SubmitReview from './pages/SubmitReview';
import ReviewList from './pages/ReviewList';
import ReviewDetail from './pages/ReviewDetail';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import { userService } from './services/userService';
import './App.css';

function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();
    return (
        <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
            {theme === 'dark' ? '☀️' : '🌙'}
        </button>
    );
}

function AppContent() {
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
    const [authView, setAuthView] = useState('login');
    const [currentView, setCurrentView] = useState('home');
    const [selectedReviewId, setSelectedReviewId] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        if (isAuthenticated) {
            userService.getProfile().then(setCurrentUser).catch(console.error);
        }
    }, [isAuthenticated]);

    const handleLoginSuccess = () => {
        setIsAuthenticated(true);
        setCurrentView('home');
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        setIsAuthenticated(false);
        setCurrentUser(null);
        setCurrentView('home');
    };

    const handleSubmitSuccess = (jobId) => {
        if (jobId) {
            setSelectedReviewId(jobId);
            setCurrentView('detail');
        } else {
            setCurrentView('list');
        }
    };

    const handleSelectReview = (id) => {
        setSelectedReviewId(id);
        setCurrentView('detail');
    };

    const handleBackToList = () => {
        setCurrentView('list');
        setSelectedReviewId(null);
    };

    const handleStartReview = () => {
        if (isAuthenticated) {
            setCurrentView('submit');
        } else {
            setAuthView('login');
            setCurrentView('auth');
        }
    };

    const handleRegister = () => {
        setAuthView('register');
        setCurrentView('auth');
    };

    if (currentView === 'auth') {
        return (
            <div className="app">
                {authView === 'login' ? (
                    <Login
                        onLoginSuccess={handleLoginSuccess}
                        onNavigateToRegister={() => setAuthView('register')}
                        onBack={() => setCurrentView('home')}
                    />
                ) : (
                    <Register
                        onRegisterSuccess={handleLoginSuccess}
                        onNavigateToLogin={() => setAuthView('login')}
                        onBack={() => setCurrentView('home')}
                    />
                )}
            </div>
        );
    }

    return (
        <div className="app">
            <nav className="navbar">
                <div className="nav-content">
                    <div
                        className="nav-brand"
                        onClick={() => setCurrentView('home')}
                        style={{ cursor: 'pointer' }}
                    >
                        SmartReview
                    </div>
                    <div className="nav-links">
                        {isAuthenticated ? (
                            <>
                                <button
                                    className={currentView === 'submit' ? 'active' : ''}
                                    onClick={() => setCurrentView('submit')}
                                >
                                    New Review
                                </button>
                                <button
                                    className={currentView === 'list' || currentView === 'detail' ? 'active' : ''}
                                    onClick={() => setCurrentView('list')}
                                >
                                    My Reviews
                                </button>
                                {currentUser && (
                                    <button
                                        className={`nav-user ${currentView === 'profile' ? 'active' : ''}`}
                                        onClick={() => setCurrentView('profile')}
                                    >
                                        <div className="nav-avatar">
                                            {currentUser.name?.charAt(0)}{currentUser.surname?.charAt(0)}
                                        </div>
                                        <span>{currentUser.name} {currentUser.surname}</span>
                                    </button>
                                )}
                                <ThemeToggle />
                                <button onClick={handleLogout} className="logout-btn">
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <ThemeToggle />
                                <button
                                    className="login-btn"
                                    onClick={() => {
                                        setAuthView('login');
                                        setCurrentView('auth');
                                    }}
                                >
                                    Login
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            <main className="main-content">
                {currentView === 'home' && (
                    <Home
                        onStartReview={handleStartReview}
                        onRegister={!isAuthenticated ? handleRegister : null}
                        isAuthenticated={isAuthenticated}
                    />
                )}
                {currentView === 'submit' && isAuthenticated && (
                    <SubmitReview onSubmitSuccess={handleSubmitSuccess} />
                )}
                {currentView === 'list' && isAuthenticated && (
                    <ReviewList onSelectReview={handleSelectReview} />
                )}
                {currentView === 'detail' && isAuthenticated && selectedReviewId && (
                    <ReviewDetail reviewId={selectedReviewId} onBack={handleBackToList} />
                )}
                {currentView === 'profile' && isAuthenticated && (
                    <Profile />
                )}
            </main>
        </div>
    );
}

function App() {
    return (
        <ThemeProvider>
            <AppContent />
        </ThemeProvider>
    );
}

export default App;