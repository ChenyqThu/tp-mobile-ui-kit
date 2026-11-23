import React from 'react';
import type { TPSegmentProps } from '../types';
import '../../styles/tp-core-nav-controls.css';

export const TPSegment: React.FC<TPSegmentProps> = ({
  options,
  value,
  onChange,
  variant = 'underline',
  fullWidth = true,
  className = '',
  style,
}) => {
  const rootClass = [
    'tp-segment',
    `tp-segment--${variant}`,
    fullWidth ? 'tp-segment--full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={rootClass}
      role="tablist"
      data-variant={variant}
      style={style}
    >
      {options.map((option) => {
        const isActive = option.key === value;
        const itemClass = [
          'tp-segment-item',
          isActive ? 'tp-segment-item--active' : '',
          option.disabled ? 'tp-segment-item--disabled' : '',
        ]
          .filter(Boolean)
          .join(' ');

        return (
          <button
            key={option.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            disabled={option.disabled}
            className={itemClass}
            onClick={() => {
              if (!option.disabled) {
                onChange(option.key);
              }
            }}
          >
            <span className="tp-segment-label">{option.label}</span>
            {option.badge !== undefined && option.badge !== null && option.badge !== '' && (
              <span className="tp-segment-badge">{option.badge}</span>
            )}
          </button>
        );
      })}
    </div>
  );
};
