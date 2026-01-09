import React from 'react';

const SafetyBanner = ({ warning }) => {
  if (!warning) return null;

  return (
    <div className="safety-banner" style={{
      background: '#ffebee',
      borderLeft: '4px solid #d32f2f',
      padding: '15px',
      margin: '15px 0',
      borderRadius: '4px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ fontSize: '20px', marginRight: '10px' }}>⚠️</span>
        <h3 style={{ margin: 0, color: '#d32f2f' }}>{warning.title}</h3>
      </div>
      <p style={{ margin: '5px 0', color: '#555' }}>{warning.message}</p>
      {warning.suggestion && (
        <p style={{ margin: '5px 0', color: '#666', fontStyle: 'italic' }}>
          {warning.suggestion}
        </p>
      )}
    </div>
  );
};

export default SafetyBanner;