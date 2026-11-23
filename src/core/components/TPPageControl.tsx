import React from 'react';
import type { TPPageControlProps } from '../types';
import '../../styles/tp-core-nav-controls.css';

export const TPPageControl: React.FC<TPPageControlProps> = ({
  total,
  current,
  onChange,
  className = '',
  style,
}) => {
  if (total <= 0) return null;

  const rootClass = ['tp-page-control', className].filter(Boolean).join(' ');

  return (
    <div
      className={rootClass}
      role="navigation"
      aria-label="Page indicator"
      style={style}
    >
      {Array.from({ length: total }, (_, index) => {
        const isActive = index === current;
        const dotClass = [
          'tp-page-control-dot',
          isActive ? 'tp-page-control-dot--active' : '',
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
              aria-current={isActive ? 'page' : undefined}
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
            aria-current={isActive ? 'page' : undefined}
          />
        );
      })}
    </div>
  );
};
