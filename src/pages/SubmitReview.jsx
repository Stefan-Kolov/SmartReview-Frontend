import { useState } from 'react';
import { reviewService } from '../services/reviewService';
import './SubmitReview.css';

const PROVIDERS = [
  { value: 'GROQ',      label: 'Groq',      model: 'Llama 3.3 70B',    placeholder: 'gsk_...' },
  { value: 'ANTHROPIC', label: 'Anthropic',  model: 'Claude Haiku',     placeholder: 'sk-ant-...' },
  { value: 'OPENAI',    label: 'OpenAI',     model: 'GPT-4o Mini',      placeholder: 'sk-...' },
  { value: 'GEMINI',    label: 'Google',     model: 'Gemini 1.5 Flash', placeholder: 'AIza...' },
];

function SubmitReview({ onSubmitSuccess }) {
  const [repoUrl, setRepoUrl] = useState('');
  const [provider, setProvider] = useState('GROQ');
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const selectedProvider = PROVIDERS.find(p => p.value === provider);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await reviewService.submitReview(repoUrl, provider, apiKey);
      setRepoUrl('');
      setApiKey('');
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
        <p className="submit-subtitle">
          Paste your repository link below and let AI scan for bugs, security leaks, and architecture issues.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Repository URL</label>
            <input
                type="text"
                placeholder="GitHub, GitLab or Bitbucket repository URL"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                disabled={loading}
                required
            />
          </div>

          <div className="form-group">
            <label>AI Provider</label>
            <div className="provider-grid">
              {PROVIDERS.map(p => (
                  <div
                      key={p.value}
                      className={`provider-card ${provider === p.value ? 'active' : ''}`}
                      onClick={() => !loading && setProvider(p.value)}
                  >
                    <div className="provider-name">{p.label}</div>
                    <div className="provider-model">{p.model}</div>
                  </div>
              ))}
            </div>
          </div>

          <div className="advanced-toggle" onClick={() => setShowAdvanced(prev => !prev)}>
            <span>Advanced options</span>
            <span>{showAdvanced ? '▲' : '▼'}</span>
          </div>

          {showAdvanced && (
              <div className="form-group">
                <label>
                  API Key
                  <span className="key-hint"> — leave empty to use system key</span>
                </label>
                <input
                    type="password"
                    placeholder={selectedProvider.placeholder}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    disabled={loading}
                />
              </div>
          )}

          {error && <div className="error">{error}</div>}

          {loading && (
              <div className="loading-message">
                This may take a few minutes. The AI is analyzing your repository...
              </div>
          )}

          <button type="submit" disabled={loading}>
            {loading ? 'Analyzing...' : 'Review Code'}
          </button>
        </form>
      </div>
  );
}

export default SubmitReview;