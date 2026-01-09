import React, { useState } from 'react';
import SafetyBanner from './components/SafetyBanner';
import './App.css';

function App() {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [queryHistory, setQueryHistory] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      const data = await res.json();
      setResponse(data);
      
      // Add to history
      setQueryHistory(prev => [
        { query, timestamp: new Date(), response: data.data },
        ...prev.slice(0, 4)
      ]);
    } catch (error) {
      console.error('Error:', error);
      setResponse({ error: 'Failed to connect to server. Make sure backend is running on port 5000.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="header">
        <h1>🧘 Ask Me Anything About Yoga</h1>
        <p className="subtitle">Wellness RAG System with Safety-First Design</p>
      </header>

      <main className="main-content">
        <div className="query-section">
          <form onSubmit={handleSubmit} className="query-form">
            <textarea 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask anything about yoga... (e.g., 'benefits of yoga', 'how to do downward dog', 'pregnancy yoga')"
              rows="3"
              disabled={loading}
            />
            <button type="submit" disabled={loading || !query.trim()}>
              {loading ? 'Processing...' : 'Ask Question'}
            </button>
          </form>
          
          <div className="example-queries">
            <p>Try these examples:</p>
            <div className="example-buttons">
              <button onClick={() => setQuery("What are benefits of yoga?")}>
                Benefits of yoga
              </button>
              <button onClick={() => setQuery("How to do downward dog?")}>
                Downward dog pose
              </button>
              <button onClick={() => setQuery("I am pregnant, can I do yoga?")}>
                Pregnancy safety
              </button>
              <button onClick={() => setQuery("What is child's pose?")}>
                Child's pose
              </button>
            </div>
          </div>
        </div>

        {loading && (
          <div className="loading">
            <div className="spinner"></div>
            <p>Consulting yoga knowledge base...</p>
          </div>
        )}

        {response?.error && (
          <div className="error">
            ❌ {response.error}
          </div>
        )}

        {response?.data && (
          <div className="response-section">
            <SafetyBanner warning={response.data.safety.warning} />
            
            <div className="answer-card">
              <h2>🧘‍♀️ Answer</h2>
              <div className="answer-content">
                {response.data.answer}
              </div>
            </div>

            {response.data.sources && response.data.sources.length > 0 && (
              <div className="sources-card">
                <h2>📚 Sources Used</h2>
                <div className="sources-grid">
                  {response.data.sources.map((src, idx) => (
                    <div key={idx} className="source-item">
                      <div className="source-header">
                        <span className="source-id">Source {idx + 1}</span>
                        <span className="relevance-badge">Relevance: {src.relevance}</span>
                      </div>
                      <h3>{src.title}</h3>
                      <p className="source-preview">{src.preview}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="metadata">
              <div className="meta-item">
                <span className="label">Query ID:</span>
                <span className="value">{response.queryId}</span>
              </div>
              <div className="meta-item">
                <span className="label">Safety Status:</span>
                <span className={`value ${response.data.safety.isUnsafe ? 'unsafe' : 'safe'}`}>
                  {response.data.safety.isUnsafe ? '⚠️ Requires Caution' : '✅ Generally Safe'}
                </span>
              </div>
              <div className="meta-item">
                <span className="label">Timestamp:</span>
                <span className="value">
                  {new Date(response.timestamp).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}

        {queryHistory.length > 0 && (
          <div className="history-section">
            <h2>📝 Recent Queries</h2>
            <div className="history-list">
              {queryHistory.map((item, idx) => (
                <div key={idx} className="history-item">
                  <div className="history-query">{item.query}</div>
                  <div className="history-meta">
                    <span className="history-time">
                      {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className={`history-safety ${item.response?.safety?.isUnsafe ? 'unsafe' : 'safe'}`}>
                      {item.response?.safety?.isUnsafe ? '⚠️' : '✅'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="footer">
        <p><strong>Wellness RAG System</strong> | Backend: <span className="status-online">Online ✅</span> | Safety Checks: Active</p>
        <p className="disclaimer">⚠️ This is a demo system. Always consult certified yoga therapists or doctors for medical advice.</p>
      </footer>
    </div>
  );
}

export default App;