import React from 'react';
import SafetyBanner from './SafetyBanner';

const ResponseDisplay = ({ response, isLoading }) => {
  if (isLoading) {
    return (
      <div className="response-loading">
        <div className="spinner"></div>
        <p>Consulting yoga knowledge base...</p>
      </div>
    );
  }

  if (!response) return null;

  return (
    <div className="response-display">
      <SafetyBanner warning={response.safety?.warning} />
      
      <div className="answer-section">
        <h3>Ì∑ò‚Äç‚ôÄÔ∏è Answer:</h3>
        <div className="answer-content">
          {response.answer}
        </div>
      </div>

      {response.sources && response.sources.length > 0 && (
        <div className="source-list">
          <h3>Ì≥ö Sources Used:</h3>
          <div className="sources-container">
            {response.sources.map((source, index) => (
              <div key={source.id || index} className="source-card">
                <div className="source-header">
                  <span className="source-number">Source {index + 1}</span>
                  <span className="relevance">Relevance: {source.relevance}</span>
                </div>
                <h4>{source.title}</h4>
                <p className="preview">{source.preview}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
export default ResponseDisplay;
