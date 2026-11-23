import React from 'react';
import type { TPBadgeProps } from '../types';
import '../../styles/tp-core-lists-inputs.css';

/**
 * Count or dot indicator badge, standalone or anchored to top-right of wrapped children.
 */
export const TPBadge: React.FC<TPBadgeProps> = ({
  count,
  dot = false,
  tone = 'alert',
  max = 99,
  showZero = false,
  children,
  className = '',
  style,
}) => {
  let displayContent: string | null = null;
  let visible = false;

  if (dot) {
    visible = true;
  } else if (count !== undefined && count !== null) {
    if (typeof count === 'number') {
      if (count > 0 || (count === 0 && showZero)) {
        visible = true;
        displayContent = count > max ? `${max}+` : String(count);
      }
    } else if (count !== '') {
      if (count !== '0' || showZero) {
        visible = true;
        displayContent = count;
      }
    }
  }

  const indicator = visible ? (
    <span
      className={[
        'tp-badge',
        dot ? 'tp-badge--dot' : '',
        children ? 'tp-badge--floating' : '',
        `tp-badge--tone-${tone}`,
        !children ? className : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={!children ? style : undefined}
    >
      {dot ? null : displayContent}
    </span>
  ) : null;

  if (!children) {
    return indicator;
  }

  return (
    <span className={`tp-badge-wrapper ${className}`.trim()} style={style}>
      {children}
      {indicator}
    </span>
  );
};
