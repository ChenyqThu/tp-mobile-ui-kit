import React from 'react';
import type { TPListButtonProps } from '../types';
import '../../styles/tp-core-lists-inputs.css';

/**
 * Full-width action button styled as a grouped list row.
 */
export const TPListButton: React.FC<TPListButtonProps> = ({
  children,
  tone = 'focus',
  align = 'center',
  disabled = false,
  onClick,
  className = '',
  style,
}) => {
  const classes = [
    'tp-list-button',
    `tp-list-button--tone-${tone}`,
    `tp-list-button--align-${align}`,
    disabled ? 'tp-list-button--disabled' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      className={classes}
      style={style}
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
    >
      {children}
    </button>
  );
};
