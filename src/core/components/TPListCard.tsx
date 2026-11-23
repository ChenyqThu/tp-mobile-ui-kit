import React from 'react';
import type { TPListCardProps } from '../types';
import '../../styles/tp-core-lists-inputs.css';

/**
 * Grouped card container for mobile list rows and settings sections.
 */
export const TPListCard: React.FC<TPListCardProps> = ({
  title,
  extra,
  radius = 'theme',
  padding = 'none',
  divided = false,
  className = '',
  style,
  children,
}) => {
  const classes = [
    'tp-list-card',
    `tp-list-card--radius-${radius}`,
    `tp-list-card--pad-${padding}`,
    divided ? 'tp-list-card--divided' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} style={style}>
      {(title !== undefined || extra !== undefined) && (
        <div className="tp-list-card-header">
          <div className="tp-list-card-title">{title}</div>
          {extra !== undefined && <div className="tp-list-card-extra">{extra}</div>}
        </div>
      )}
      <div className="tp-list-card-body">{children}</div>
    </div>
  );
};
