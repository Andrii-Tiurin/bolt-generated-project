import React from 'react';

export default function LoadingScreen({ message = 'Daten werden geladen …' }) {
  return (
    <div className="loading-screen" role="status" aria-live="polite">
      <div className="loading-indicator"></div>
      <p>{message}</p>
    </div>
  );
}
