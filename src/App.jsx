import { useState } from 'react';
import SubmitReview from './pages/SubmitReview';
import ReviewList from './pages/ReviewList';
import ReviewDetail from './pages/ReviewDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import './App.css';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
    const [authView, setAuthView] = useState('login');
    const [currentView, setCurrentView] = useState('submit');
    const [selectedReviewId, setSelectedReviewId] = useState(null);

    const handleLoginSuccess = () => {
        setIsAuthenticated(true);
        setCurrentView('submit');
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        setIsAuthenticated(false);
        setAuthView('login');
    };

    const handleSubmitSuccess = () => {
        setCurrentView('list');
    };

    const handleSelectReview = (id) => {
        setSelectedReviewId(id);
        setCurrentView('detail');
    };

    const handleBackToList = () => {
        setCurrentView('list');
        setSelectedReviewId(null);
    };

    if (!isAuthenticated) {
        return (
            <div className="app">
                {authView === 'login' ? (
                    <Login
                        onLoginSuccess={handleLoginSuccess}
                        onNavigateToRegister={() => setAuthView('register')}
                    />
                ) : (
                    <Register
                        onRegisterSuccess={handleLoginSuccess}
                        onNavigateToLogin={() => setAuthView('login')}
                    />
                )}
            </div>
        );
    }

    return (
        <div className="app">
            <nav className="navbar">
                <div className="nav-content">
                    <div className="nav-brand">SmartReview</div>
                    <div className="nav-links">
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
                        <button
                            onClick={handleLogout}
                            className="logout-btn"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </nav>

            <main className="main-content">
                {currentView === 'submit' && (
                    <SubmitReview onSubmitSuccess={handleSubmitSuccess} />
                )}

                {currentView === 'list' && (
                    <ReviewList onSelectReview={handleSelectReview} />
                )}

                {currentView === 'detail' && selectedReviewId && (
                    <ReviewDetail reviewId={selectedReviewId} onBack={handleBackToList} />
                )}
            </main>
        </div>
    );
}

export default App;