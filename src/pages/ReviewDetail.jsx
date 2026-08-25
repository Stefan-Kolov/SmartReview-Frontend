import { useState, useEffect } from 'react';
import { reviewService } from '../services/reviewService';
import './ReviewDetail.css';

function ReviewDetail({ reviewId, onBack }) {
    const [review, setReview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedFile, setSelectedFile] = useState(null);
    const [showCode, setShowCode] = useState(false);
    const [highlightedLine, setHighlightedLine] = useState(null);
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
        setHighlightedLine(null);
    }, [selectedFile]);

    const loadReview = async () => {
        try {
            const data = await reviewService.getReviewById(reviewId);
            const sorted = {
                ...data,
                fileReviews: [...(data.fileReviews || [])].sort((a, b) =>
                    a.filePath.split(/[/\\]/).pop().localeCompare(b.filePath.split(/[/\\]/).pop())
                )
            };

            setReview(sorted);
            if (sorted.fileReviews && sorted.fileReviews.length > 0) {
                setSelectedFile(sorted.fileReviews[0]);
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

    const jumpToLine = (lineNumber) => {
        if (!lineNumber) return;
        setShowCode(true);
        setHighlightedLine(lineNumber);
        setTimeout(() => {
            const el = document.getElementById(`code-line-${lineNumber}`);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 50);
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
                                    highlightedLine={highlightedLine}
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
                                        <div
                                            key={issue.id}
                                            className="issue-card"
                                            onClick={() => jumpToLine(issue.lineNumber)}
                                            style={{ cursor: issue.lineNumber ? 'pointer' : 'default' }}
                                        >
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

function CodeViewer({ content, issues, getCategoryIcon, highlightedLine }) {
    const lines = content.split('\n');

    const lineIssueMap = {};
    issues.forEach(issue => {
        if (issue.lineNumber) {
            if (!lineIssueMap[issue.lineNumber]) lineIssueMap[issue.lineNumber] = [];
            lineIssueMap[issue.lineNumber].push(issue);
        }
    });

    const severityRank = { HIGH: 3, MEDIUM: 2, LOW: 1 };
    const topSeverity = (lineIssues) =>
        lineIssues.reduce((max, i) => (severityRank[i.severity] > severityRank[max] ? i.severity : max), 'LOW');

    const severityColors = {
        HIGH:   { bg: 'rgba(211,47,47,0.12)',  border: '#d32f2f', text: '#ffb4ab' },
        MEDIUM: { bg: 'rgba(245,124,0,0.10)',  border: '#f57c00', text: '#ffcc80' },
        LOW:    { bg: 'rgba(25,118,210,0.09)', border: '#1976d2', text: '#90caf9' }
    };

    return (
        <div className="code-viewer">
            <pre className="code-pre">
                {lines.map((line, index) => {
                    const lineNum = index + 1;
                    const lineIssues = lineIssueMap[lineNum] || [];
                    const hasIssue = lineIssues.length > 0;
                    const sev = hasIssue ? topSeverity(lineIssues) : null;
                    const colors = sev ? severityColors[sev] : null;
                    const isActive = highlightedLine === lineNum;

                    return (
                        <div
                            key={lineNum}
                            id={`code-line-${lineNum}`}
                            className={`code-line-group ${isActive ? 'active-line' : ''}`}
                            style={
                                hasIssue
                                    ? { borderLeft: `3px solid ${colors.border}`, background: colors.bg }
                                    : { borderLeft: '3px solid transparent' }
                            }
                        >
                            <div className="code-line">
                                <span className="line-number">{lineNum}</span>
                                <span className="line-content">{line || ' '}</span>
                            </div>
                            {lineIssues.map((issue, i) => {
                                const c = severityColors[issue.severity] || severityColors.LOW;
                                return (
                                    <div key={i} className="line-annotation" style={{ color: c.text }}>
                                        <span className="annotation-icon">{getCategoryIcon(issue.category)}</span>
                                        <span className="annotation-badge" style={{ background: c.border }}>{issue.severity}</span>
                                        <span className="annotation-text">{issue.description}</span>
                                    </div>
                                );
                            })}
                        </div>
                    );
                })}
            </pre>
        </div>
    );
}

export default ReviewDetail;