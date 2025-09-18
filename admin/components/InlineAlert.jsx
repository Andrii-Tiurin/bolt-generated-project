import React from 'react';

export default function InlineAlert({ type = 'info', title, message, onClose }) {
  return (
    <div className={`inline-alert inline-alert--${type}`} role="alert">
      <div className="inline-alert__content">
        {title && <strong>{title}</strong>}
        {message && <span>{message}</span>}
      </div>
      {onClose && (
        <button type="button" className="inline-alert__close" onClick={onClose} aria-label="Hinweis schließen">
          ×
        </button>
      )}
    </div>
  );
}
