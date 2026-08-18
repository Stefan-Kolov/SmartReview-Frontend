import './Home.css';

function Home({ onStartReview, onRegister, isAuthenticated }) {
    return (
        <div className="home">
            <div className="home-hero">
                <div className="home-badge">AI-Powered Code Review</div>
                <h1>Review your code.<br/>Ship with confidence.</h1>
                <p>
                    SmartReview analyzes your GitHub, GitLab or Bitbucket repository
                    using state-of-the-art AI models to detect bugs, security vulnerabilities,
                    and style issues — in seconds.
                </p>
                <div className="home-cta-group">
                    <button className="home-cta" onClick={onStartReview}>
                        Start Review →
                    </button>
                    {!isAuthenticated && (
                        <button className="home-cta-secondary" onClick={onRegister}>
                            Create Account
                        </button>
                    )}
                </div>
            </div>

            <div className="home-features">
                <div className="home-feature-card">
                    <div className="feature-icon">🐛</div>
                    <h3>Bug Detection</h3>
                    <p>Finds logic errors, null pointer risks, off-by-one errors and incorrect error handling before
                        they reach production.</p>
                </div>
                <div className="home-feature-card">
                    <div className="feature-icon">🔒</div>
                    <h3>Security Analysis</h3>
                    <p>Detects SQL injection, XSS vulnerabilities, hardcoded secrets, insecure deserialization and missing auth checks.</p>
                </div>
                <div className="home-feature-card">
                    <div className="feature-icon">✨</div>
                    <h3>Style Review</h3>
                    <p>Identifies naming convention violations, code duplication, overly complex methods and missing documentation.</p>
                </div>
                <div className="home-feature-card">
                    <div className="feature-icon">💡</div>
                    <h3>Smart Suggestions</h3>
                    <p>Recommends performance improvements, modern language features and better design patterns for your codebase.</p>
                </div>
            </div>

            <div className="home-how">
                <h2>How it works</h2>
                <div className="home-steps">
                    <div className="home-step">
                        <div className="step-number">1</div>
                        <div className="step-content">
                            <h4>Paste your repository URL</h4>
                            <p>Support for GitHub, GitLab and Bitbucket public repositories.</p>
                        </div>
                    </div>
                    <div className="step-arrow">→</div>
                    <div className="home-step">
                        <div className="step-number">2</div>
                        <div className="step-content">
                            <h4>Choose your AI provider</h4>
                            <p>Pick from Groq, Anthropic, OpenAI or Google Gemini.</p>
                        </div>
                    </div>
                    <div className="step-arrow">→</div>
                    <div className="home-step">
                        <div className="step-number">3</div>
                        <div className="step-content">
                            <h4>Get detailed results</h4>
                            <p>View issues per file with highlighted code and suggested fixes.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="home-providers">
                <h2>Supported AI Providers</h2>
                <div className="providers-grid">
                    <div className="provider-pill">⚡ Groq — Llama 3.3 70B</div>
                    <div className="provider-pill">🧠 Anthropic — Claude Haiku</div>
                    <div className="provider-pill">🤖 OpenAI — GPT-4o Mini</div>
                    <div className="provider-pill">✨ Google — Gemini 1.5 Flash</div>
                </div>
            </div>
        </div>
    );
}

export default Home;