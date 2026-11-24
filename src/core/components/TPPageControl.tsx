import React from 'react';
import type { TPPageControlProps } from '../types';
import '../../styles/tp-core-nav-controls.css';

export const TPPageControl: React.FC<TPPageControlProps> = ({
  total,
  current,
  variant = 'dots',
  onChange,
  className = '',
  style,
}) => {
  if (total <= 0) return null;

  const rootClass = [
    'tp-page-control',
    `tp-page-control--${variant}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={rootClass}
      role="navigation"
      aria-label="Page indicator"
      data-variant={variant}
      style={style}
    >
      {Array.from({ length: total }, (_, index) => {
        const isActive = variant === 'process' ? index <= current : index === current;
        const isCurrent = index === current;
        const dotClass = [
          variant === 'process' ? 'tp-page-control-bar' : 'tp-page-control-dot',
          isActive
            ? variant === 'process'
              ? 'tp-page-control-bar--active'
              : 'tp-page-control-dot--active'
            : '',
          isCurrent && variant === 'process' ? 'tp-page-control-bar--current' : '',
        ]
          .filter(Boolean)
          .join(' ');

        if (onChange) {
          return (
            <button
              key={index}
              type="button"
              className={dotClass}
              aria-label={`Page ${index + 1}`}
              aria-current={isCurrent ? 'page' : undefined}
              data-active={String(isActive)}
              onClick={() => onChange(index)}
            />
          );
        }

        return (
          <span
            key={index}
            className={dotClass}
            data-active={String(isActive)}
            aria-current={isCurrent ? 'page' : undefined}
          />
        );
      })}
    </div>
  );
};
