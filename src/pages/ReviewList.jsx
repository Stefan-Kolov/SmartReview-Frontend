import { useState, useEffect } from 'react';
import { reviewService } from '../services/reviewService';
import './ReviewList.css';

function ReviewList({ onSelectReview }) {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);

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
            COMPLETED:   { className: 'status-completed', label: 'Completed' },
            FAILED:      { className: 'status-failed',    label: 'Failed' },
            IN_PROGRESS: { className: 'status-progress',  label: 'In Progress' },
            PENDING:     { className: 'status-pending',   label: 'Pending' }
        };
        return badges[status] || badges.PENDING;
    };

    const getScoreClass = (score) => {
        if (score >= 80) return 'score-good';
        if (score >= 60) return 'score-ok';
        return 'score-poor';
    };

    const handleDelete = async (id) => {
        try {
            await reviewService.deleteReview(id);
            setReviews(prev => prev.filter(r => r.id !== id));
            setDeleteConfirmId(null);
        } catch (err) {
            console.error('Failed to delete review:', err);
        }
    };

    if (loading) return <div className="loading">Loading reviews...</div>;

    if (reviews.length === 0) {
        return (
            <div className="empty-state">
                <p>No reviews yet. Submit a repository to get started!</p>
            </div>
        );
    }

    return (
        <div className="review-list">
            {deleteConfirmId && (
                <div className="modal-overlay" onClick={() => setDeleteConfirmId(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h3>Delete Review</h3>
                        <p>Are you sure you want to delete this review? This action cannot be undone.</p>
                        <div className="modal-actions">
                            <button className="modal-cancel" onClick={() => setDeleteConfirmId(null)}>
                                Cancel
                            </button>
                            <button className="modal-confirm" onClick={() => handleDelete(deleteConfirmId)}>
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
                                    {new Date(review.createdAt).toLocaleDateString('en-GB', {
                                        day: '2-digit', month: '2-digit', year: 'numeric'
                                    })} — {new Date(review.createdAt).toLocaleTimeString('en-GB', {
                                    hour: '2-digit', minute: '2-digit'
                                })}
                                </span>
                                <button
                                    className="delete-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setDeleteConfirmId(review.id);
                                    }}
                                    title="Delete review"
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                         stroke="currentColor" strokeWidth="2">
                                        <polyline points="3 6 5 6 21 6"/>
                                        <path d="M19 6l-1 14H6L5 6"/>
                                        <path d="M10 11v6M14 11v6"/>
                                        <path d="M9 6V4h6v2"/>
                                    </svg>
                                </button>
                            </div>

                            <div className="repo-url">
                                {review.repoUrl.split('/').slice(-2).join('/')}
                            </div>

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
                                <div className="error-message">
                                    Review failed. Please check your API key and try again.
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default ReviewList;