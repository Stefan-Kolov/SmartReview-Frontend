import { useState, useEffect } from 'react';
import { reviewService } from '../services/reviewService';
import './ReviewDetail.css';

function ReviewDetail({ reviewId, onBack }) {
    const [review, setReview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedFile, setSelectedFile] = useState(null);
    const [showCode, setShowCode] = useState(false);
    const [filters, setFilters] = useState({
        category: 'ALL',
        severity: 'ALL'
    });

    useEffect(() => {
        loadReview();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reviewId]);

    useEffect(() => {
        setShowCode(false);
    }, [selectedFile]);

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

    const allIssueLines = selectedFile
        ? new Set(selectedFile.issues.filter(i => i.lineNumber).map(i => i.lineNumber))
        : new Set();

    const getProviderLabel = (provider) => {
        const labels = {
            GROQ:      '⚡ Groq — Llama 3.3 70B',
            ANTHROPIC: '🧠 Anthropic — Claude Haiku',
            OPENAI:    '🤖 OpenAI — GPT-4o Mini',
            GEMINI:    '✨ Google — Gemini 1.5 Flash'
        };
        return labels[provider] || provider;
    };

    return (
        <div className="review-detail">
            <div className="detail-header">
                <div className="header-top">
                    <button onClick={onBack} className="back-button">← Back to Reviews</button>
                    {review.provider && (
                        <span className="provider-badge">
                                {getProviderLabel(review.provider)}
                            </span>
                    )}
                </div>
                <div className="header-title">
                    <h2>{review.repoUrl.split('/').slice(-2).join('/')}</h2>
                </div>
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
                    {review.durationSeconds && (
                        <div className="stat-box">
                            <div className="stat-number">
                                {review.durationSeconds >= 60
                                    ? `${Math.floor(review.durationSeconds / 60)}m ${review.durationSeconds % 60}s`
                                    : `${review.durationSeconds}s`}
                            </div>
                            <div className="stat-label">Duration</div>
                        </div>
                    )}
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
                            <div className="file-name">{file.filePath.split(/[/\\]/).pop()}</div>
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
                                <h3>{selectedFile.filePath.split(/[/\\]/).pop()}</h3>
                                <span className="language-badge">{selectedFile.language}</span>
                                {allIssueLines.size > 0 && selectedFile.content && (
                                    <button
                                        className="show-code-btn"
                                        onClick={() => setShowCode(prev => !prev)}
                                    >
                                        {showCode ? 'Hide Code' : 'Show Code'}
                                    </button>
                                )}
                            </div>

                            <div className="file-summary">{selectedFile.summary}</div>

                            {showCode && selectedFile.content && (
                                <CodeViewer
                                    content={selectedFile.content}
                                    issues={selectedFile.issues}
                                    getCategoryIcon={getCategoryIcon}
                                />
                            )}

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

function CodeViewer({ content, issues, getCategoryIcon }) {
    const lines = content.split('\n');

    const lineIssueMap = {};
    issues.forEach(issue => {
        if (issue.lineNumber) {
            if (!lineIssueMap[issue.lineNumber]) lineIssueMap[issue.lineNumber] = [];
            lineIssueMap[issue.lineNumber].push(issue);
        }
    });

    const getLineStyle = (lineNum) => {
        const lineIssues = lineIssueMap[lineNum] || [];
        if (lineIssues.some(i => i.severity === 'HIGH'))   return { background: 'rgba(211,47,47,0.15)', borderLeft: '3px solid #d32f2f' };
        if (lineIssues.some(i => i.severity === 'MEDIUM')) return { background: 'rgba(245,124,0,0.12)', borderLeft: '3px solid #f57c00' };
        if (lineIssues.length > 0)                         return { background: 'rgba(25,118,210,0.10)', borderLeft: '3px solid #1976d2' };
        return { borderLeft: '3px solid transparent' };
    };

    const getHintStyle = (lineIssues) => {
        if (lineIssues.some(i => i.severity === 'HIGH'))   return { background: 'rgba(211,47,47,0.25)', borderLeft: '3px solid #d32f2f', color: '#ff8a80' };
        if (lineIssues.some(i => i.severity === 'MEDIUM')) return { background: 'rgba(245,124,0,0.20)', borderLeft: '3px solid #f57c00', color: '#ffcc80' };
        return { background: 'rgba(25,118,210,0.18)', borderLeft: '3px solid #1976d2', color: '#82b1ff' };
    };

    return (
        <div className="code-viewer">
            <pre>
                {lines.map((line, index) => {
                    const lineNum = index + 1;
                    const lineIssues = lineIssueMap[lineNum] || [];

                    return (
                        <div key={lineNum}>
                            <div className="code-line" style={getLineStyle(lineNum)}>
                                <span className="line-number">{lineNum}</span>
                                <span className="line-content">{line || ' '}</span>
                            </div>
                            {lineIssues.map((issue, i) => (
                                <div key={i} className="line-annotation" style={getHintStyle(lineIssues)}>
                                    <span className="annotation-icon">{getCategoryIcon(issue.category)}</span>
                                    <span className="annotation-badge">{issue.severity}</span>
                                    <span className="annotation-text">{issue.description}</span>
                                </div>
                            ))}
                        </div>
                    );
                })}
            </pre>
        </div>
    );
}

export default ReviewDetail;