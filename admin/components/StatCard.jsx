import React from 'react';

export default function StatCard({ title, value, icon, trend }) {
  return (
    <div className="stat-card">
      <div className="stat-card__icon" aria-hidden="true">
        {icon}
      </div>
      <div className="stat-card__content">
        <span className="stat-card__label">{title}</span>
        <span className="stat-card__value">{value}</span>
        {trend && <span className={`stat-card__trend stat-card__trend--${trend.type || 'neutral'}`}>{trend.label}</span>}
      </div>
    </div>
  );
}
