import { useState, useEffect } from 'react';
import { reviewService } from '../services/reviewService';
import './ReviewList.css';

function ReviewList({ onSelectReview }) {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadReviews();
    }, []);

    const loadReviews = async () => {
        try {
            const data = await reviewService.getAllReviews();
            setReviews(data);
        } catch (err) {
            console.error('Failed to load reviews:', err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            COMPLETED: { className: 'status-completed', label: 'Completed' },
            FAILED: { className: 'status-failed', label: 'Failed' },
            IN_PROGRESS: { className: 'status-progress', label: 'In Progress' },
            PENDING: { className: 'status-pending', label: 'Pending' }
        };
        return badges[status] || badges.PENDING;
    };

    const getScoreClass = (score) => {
        if (score >= 80) return 'score-good';
        if (score >= 60) return 'score-ok';
        return 'score-poor';
    };

    if (loading) {
        return <div className="loading">Loading reviews...</div>;
    }

    if (reviews.length === 0) {
        return (
            <div className="empty-state">
                <p>No reviews yet. Submit a repository to get started!</p>
            </div>
        );
    }

    return (
        <div className="review-list">
            <h2>Recent Reviews</h2>
            <div className="reviews-grid">
                {reviews.map((review) => {
                    const badge = getStatusBadge(review.status);
                    return (
                        <div
                            key={review.id}
                            className="review-card"
                            onClick={() => review.status === 'COMPLETED' && onSelectReview(review.id)}
                            style={{ cursor: review.status === 'COMPLETED' ? 'pointer' : 'default' }}
                        >
                            <div className="review-header">
                <span className={`status-badge ${badge.className}`}>
                  {badge.label}
                </span>
                                <span className="review-date">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
                            </div>

                            <div className="repo-url">{review.repoUrl}</div>

                            {review.status === 'COMPLETED' && (
                                <>
                                    <div className={`score-display ${getScoreClass(review.overallScore)}`}>
                                        Score: {review.overallScore}/100
                                    </div>
                                    <div className="stats-row">
                                        <div className="stat">
                                            <span className="stat-label">Files:</span>
                                            <span className="stat-value">{review.filesReviewed}</span>
                                        </div>
                                        <div className="stat">
                                            <span className="stat-label">Bugs:</span>
                                            <span className="stat-value bug">{review.totalBugs}</span>
                                        </div>
                                        <div className="stat">
                                            <span className="stat-label">Security:</span>
                                            <span className="stat-value security">{review.totalSecurityIssues}</span>
                                        </div>
                                        <div className="stat">
                                            <span className="stat-label">Style:</span>
                                            <span className="stat-value style">{review.totalStyleIssues}</span>
                                        </div>
                                    </div>
                                </>
                            )}

                            {review.status === 'FAILED' && (
                                <div className="error-message">{review.errorMessage}</div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default ReviewList;