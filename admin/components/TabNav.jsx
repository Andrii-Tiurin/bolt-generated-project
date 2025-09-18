import React from 'react';

export default function TabNav({ items, active, onChange }) {
  return (
    <div className="tab-nav" role="tablist">
      {items.map((item) => (
        <button
          key={item.value}
          role="tab"
          type="button"
          className={`tab-nav__item${active === item.value ? ' is-active' : ''}`}
          onClick={() => onChange(item.value)}
          aria-selected={active === item.value}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
