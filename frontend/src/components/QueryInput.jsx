import React, { useState } from 'react';

const QueryInput = ({ onSubmit, isLoading }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSubmit(query);
      setQuery('');
    }
  };

  return (
    <div className="query-input">
      <form onSubmit={handleSubmit}>
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask anything about yoga..."
          disabled={isLoading}
          rows="3"
        />
        <button type="submit" disabled={isLoading || !query.trim()}>
          {isLoading ? 'Processing...' : 'Ask Question'}
        </button>
      </form>
    </div>
  );
};

export default QueryInput;
