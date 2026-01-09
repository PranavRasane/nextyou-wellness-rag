import React from 'react';

const SourceList = ({ sources }) => {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="source-list">
      <h3>í³š Sources Used:</h3>
      <div className="sources-container">
        {sources.map((source, index) => (
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
  );
};

export default SourceList;
