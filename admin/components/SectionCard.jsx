import React from 'react';

export default function SectionCard({ title, description, actions, children, footer }) {
  return (
    <section className="section-card">
      <header className="section-card__header">
        <div>
          <h2>{title}</h2>
          {description && <p className="section-card__description">{description}</p>}
        </div>
        {actions && <div className="section-card__actions">{actions}</div>}
      </header>
      <div className="section-card__body">{children}</div>
      {footer && <footer className="section-card__footer">{footer}</footer>}
    </section>
  );
}
