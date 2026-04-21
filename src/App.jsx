import { useState } from 'react';
import SubmitReview from './pages/SubmitReview';
import ReviewList from './pages/ReviewList';
import ReviewDetail from './pages/ReviewDetail';
import './App.css';

function App() {
    const [currentView, setCurrentView] = useState('submit'); // 'submit' | 'list' | 'detail'
    const [selectedReviewId, setSelectedReviewId] = useState(null);

    const handleSubmitSuccess = (result) => {
        alert(`Review started! Job ID: ${result.id}\nThis may take a few minutes.`);
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