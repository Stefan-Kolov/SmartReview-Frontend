import { useState, useEffect, useMemo } from 'react';
import { reviewService } from '../services/reviewService';
import './ReviewList.css';

const PROVIDER_META = {
    GROQ:      { label: 'Groq',      icon: '⚡' },
    ANTHROPIC: { label: 'Anthropic', icon: '🧠' },
    OPENAI:    { label: 'OpenAI',    icon: '🤖' },
    GEMINI:    { label: 'Google',    icon: '✨' }
};

function ReviewList({ onSelectReview }) {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);
    const [providerFilter, setProviderFilter] = useState('ALL');
    const [sortBy, setSortBy] = useState('NEWEST');

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

    const availableProviders = Object.keys(PROVIDER_META);

    const visibleReviews = useMemo(() => {
        let result = providerFilter === 'ALL'
            ? [...reviews]
            : reviews.filter(r => r.provider === providerFilter);

        result.sort((a, b) => {
            switch (sortBy) {
                case 'OLDEST':
                    return new Date(a.createdAt) - new Date(b.createdAt);
                case 'SCORE_HIGH':
                    return (b.overallScore ?? -1) - (a.overallScore ?? -1);
                case 'SCORE_LOW':
                    return (a.overallScore ?? 999) - (b.overallScore ?? 999);
                case 'NEWEST':
                default:
                    return new Date(b.createdAt) - new Date(a.createdAt);
            }
        });

        return result;
    }, [reviews, providerFilter, sortBy]);

    if (loading) return (
        <div className="review-list">
            <div className="loading">Loading your reviews...</div>
        </div>
    );

    if (reviews.length === 0) {
        return (
            <div className="empty-state">
                <div className="empty-icon">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M9 17H7A5 5 0 0 1 7 7h2"/>
                        <path d="M15 7h2a5 5 0 1 1 0 10h-2"/>
                        <line x1="8" y1="12" x2="16" y2="12"/>
                    </svg>
                </div>
                <h3>No reviews yet</h3>
                <p>Submit a repository URL to get your first AI-powered code review.</p>
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

            <div className="list-header-row">
                <h2>Recent Reviews</h2>

                <div className="list-toolbar">
                    <div className="provider-filter-pills">
                        <button
                            className={`filter-pill ${providerFilter === 'ALL' ? 'active' : ''}`}
                            onClick={() => setProviderFilter('ALL')}
                        >
                            All
                        </button>
                        {availableProviders.map((p) => {
                            const meta = PROVIDER_META[p] || { label: p, icon: '' };
                            const count = reviews.filter(r => r.provider === p).length;
                            const disabled = count === 0;
                            return (
                                <button
                                    key={p}
                                    className={`filter-pill ${providerFilter === p ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
                                    onClick={() => !disabled && setProviderFilter(p)}
                                    disabled={disabled}
                                    title={disabled ? 'No reviews with this provider yet' : undefined}
                                >
                                    {meta.icon} {meta.label}
                                </button>
                            );
                        })}
                    </div>

                    <select
                        className="sort-select"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value="NEWEST">Newest first</option>
                        <option value="OLDEST">Oldest first</option>
                        <option value="SCORE_HIGH">Score: High to low</option>
                        <option value="SCORE_LOW">Score: Low to high</option>
                    </select>
                </div>
            </div>

            {visibleReviews.length === 0 ? (
                <div className="empty-state">
                    <h3>No reviews match this filter</h3>
                    <p>Try a different provider or clear the filter.</p>
                </div>
            ) : (
                <div className="reviews-grid">
                    {visibleReviews.map((review) => {
                        const badge = getStatusBadge(review.status);
                        const providerMeta = PROVIDER_META[review.provider];
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
                                        <div className="score-row">
                                            <div className={`score-display ${getScoreClass(review.overallScore)}`}>
                                                Score: {review.overallScore}/100
                                            </div>
                                            {providerMeta && (
                                                <span className="provider-chip">
                                                    {providerMeta.icon} {providerMeta.label}
                                                </span>
                                            )}
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
            )}
        </div>
    );
}

export default ReviewList;