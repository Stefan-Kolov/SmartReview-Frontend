import { useState } from 'react';
import { reviewService } from '../services/reviewService';
import './SubmitReview.css';

function SubmitReview({ onSubmitSuccess }) {
  const [repoUrl, setRepoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await reviewService.submitReview(repoUrl);
      setRepoUrl('');
      onSubmitSuccess(result);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="submit-review">
      <h1>SmartReview - AI Code Analysis</h1>
      <p className="submit-subtitle">Paste your repository link below and let AI scan for bugs, security leaks, and architecture issues.</p>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <input
            type="text"
            placeholder="Enter repository URL"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            disabled={loading}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Analyzing...' : 'Review Code'}
          </button>
        </div>
        {error && <div className="error">{error}</div>}
        {loading && (
          <div className="loading-message">
            This may take a few minutes. The AI is analyzing your repository...
          </div>
        )}
      </form>
    </div>
  );
}

export default SubmitReview;
