import React from 'react';
import type { TPSectionHeaderProps } from '../types';
import '../../styles/tp-core-lists-inputs.css';

/**
 * Muted section header placed above grouped list cards.
 */
export const TPSectionHeader: React.FC<TPSectionHeaderProps> = ({
  title,
  count,
  action,
  className = '',
  style,
}) => {
  const classes = ['tp-section-header', className].filter(Boolean).join(' ');

  return (
    <div className={classes} style={style}>
      <div className="tp-section-header-left">
        <span className="tp-section-header-title">{title}</span>
        {count !== undefined && count !== null && (
          <span className="tp-section-header-count"> ({count})</span>
        )}
      </div>
      {action !== undefined && action !== null && (
        <div className="tp-section-header-action">{action}</div>
      )}
    </div>
  );
};
