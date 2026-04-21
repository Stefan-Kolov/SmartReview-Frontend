import { useState, useEffect } from 'react';
import { reviewService } from '../services/reviewService';
import './ReviewDetail.css';

function ReviewDetail({ reviewId, onBack }) {
    const [review, setReview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedFile, setSelectedFile] = useState(null);
    const [filters, setFilters] = useState({
        category: 'ALL',
        severity: 'ALL'
    });

    useEffect(() => {
        loadReview();
    }, [reviewId]);

    const loadReview = async () => {
        try {
            const data = await reviewService.getReviewById(reviewId);
            setReview(data);
            if (data.fileReviews && data.fileReviews.length > 0) {
                setSelectedFile(data.fileReviews[0]);
            }
        } catch (err) {
            console.error('Failed to load review:', err);
        } finally {
            setLoading(false);
        }
    };

    const getSeverityColor = (severity) => {
        const colors = {
            HIGH: '#d32f2f',
            MEDIUM: '#f57c00',
            LOW: '#1976d2'
        };
        return colors[severity] || '#666';
    };

    const getCategoryIcon = (category) => {
        const icons = {
            BUG: '🐛',
            SECURITY: '🔒',
            STYLE: '✨',
            SUGGESTION: '💡'
        };
        return icons[category] || '📝';
    };

    const filterIssues = (issues) => {
        return issues.filter(issue => {
            const categoryMatch = filters.category === 'ALL' || issue.category === filters.category;
            const severityMatch = filters.severity === 'ALL' || issue.severity === filters.severity;
            return categoryMatch && severityMatch;
        });
    };

    if (loading) {
        return <div className="loading">Loading review details...</div>;
    }

    if (!review) {
        return <div className="error">Review not found</div>;
    }

    const filteredIssues = selectedFile ? filterIssues(selectedFile.issues) : [];

    return (
        <div className="review-detail">
            <div className="detail-header">
                <button onClick={onBack} className="back-button">← Back to Reviews</button>
                <h2>{review.repoUrl}</h2>
                <div className="header-stats">
                    <div className="stat-box">
                        <div className="stat-number">{review.overallScore}/100</div>
                        <div className="stat-label">Overall Score</div>
                    </div>
                    <div className="stat-box">
                        <div className="stat-number">{review.filesReviewed}</div>
                        <div className="stat-label">Files Reviewed</div>
                    </div>
                    <div className="stat-box">
                        <div className="stat-number bug-color">{review.totalBugs}</div>
                        <div className="stat-label">Bugs</div>
                    </div>
                    <div className="stat-box">
                        <div className="stat-number security-color">{review.totalSecurityIssues}</div>
                        <div className="stat-label">Security</div>
                    </div>
                    <div className="stat-box">
                        <div className="stat-number style-color">{review.totalStyleIssues}</div>
                        <div className="stat-label">Style</div>
                    </div>
                </div>
            </div>

            <div className="detail-content">
                <div className="file-sidebar">
                    <h3>Files</h3>
                    {review.fileReviews && review.fileReviews.map((file) => (
                        <div
                            key={file.id}
                            className={`file-item ${selectedFile?.id === file.id ? 'active' : ''}`}
                            onClick={() => setSelectedFile(file)}
                        >
                            <div className="file-name">{file.filePath}</div>
                            <div className="file-score" style={{ color: file.fileScore >= 80 ? '#2e7d32' : file.fileScore >= 60 ? '#f57c00' : '#d32f2f' }}>
                                {file.fileScore}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="file-detail">
                    {selectedFile ? (
                        <>
                            <div className="file-header">
                                <h3>{selectedFile.filePath}</h3>
                                <span className="language-badge">{selectedFile.language}</span>
                            </div>

                            <div className="file-summary">{selectedFile.summary}</div>

                            <div className="filters">
                                <select
                                    value={filters.category}
                                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                                >
                                    <option value="ALL">All Categories</option>
                                    <option value="BUG">🐛 Bugs</option>
                                    <option value="SECURITY">🔒 Security</option>
                                    <option value="STYLE">✨ Style</option>
                                    <option value="SUGGESTION">💡 Suggestions</option>
                                </select>

                                <select
                                    value={filters.severity}
                                    onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
                                >
                                    <option value="ALL">All Severities</option>
                                    <option value="HIGH">High</option>
                                    <option value="MEDIUM">Medium</option>
                                    <option value="LOW">Low</option>
                                </select>
                            </div>

                            <div className="issues-list">
                                {filteredIssues.length === 0 ? (
                                    <div className="no-issues">No issues found with current filters</div>
                                ) : (
                                    filteredIssues.map((issue) => (
                                        <div key={issue.id} className="issue-card">
                                            <div className="issue-header">
                        <span className="issue-category">
                          {getCategoryIcon(issue.category)} {issue.category}
                        </span>
                                                <span
                                                    className="issue-severity"
                                                    style={{ color: getSeverityColor(issue.severity) }}
                                                >
                          {issue.severity}
                        </span>
                                                {issue.lineNumber && (
                                                    <span className="issue-line">Line {issue.lineNumber}</span>
                                                )}
                                            </div>
                                            <div className="issue-description">{issue.description}</div>
                                            {issue.suggestedFix && (
                                                <div className="issue-fix">
                                                    <strong>Suggested fix:</strong> {issue.suggestedFix}
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="no-file-selected">Select a file to view issues</div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ReviewDetail;