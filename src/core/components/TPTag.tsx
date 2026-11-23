import React from 'react';
import type { TPTagProps } from '../types';
import '../../styles/tp-core-lists-inputs.css';

/**
 * Pill chip/tag supporting selected filter state, semantic tones, and optional close button.
 */
export const TPTag: React.FC<TPTagProps> = ({
  children,
  tone,
  selected,
  size = 'md',
  closable = false,
  onClose,
  onClick,
  className = '',
  style,
}) => {
  const resolvedTone = tone ?? (selected ? 'focus' : 'neutral');
  const selectionClass =
    selected === true
      ? 'tp-tag--selected'
      : selected === false
        ? 'tp-tag--unselected'
        : '';

  const classes = [
    'tp-tag',
    `tp-tag--${size}`,
    `tp-tag--tone-${resolvedTone}`,
    selectionClass,
    onClick ? 'tp-tag--clickable' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const closeButton = closable ? (
    <button
      type="button"
      className="tp-tag-close"
      aria-label="Remove tag"
      onClick={(e) => {
        e.stopPropagation();
        onClose?.();
      }}
    >
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
        <path
          d="M2.2 2.2L7.8 7.8M7.8 2.2L2.2 7.8"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </button>
  ) : null;

  if (onClick && !closable) {
    return (
      <button
        type="button"
        className={classes}
        style={style}
        aria-pressed={selected !== undefined ? selected : undefined}
        onClick={onClick}
      >
        <span>{children}</span>
      </button>
    );
  }

  return (
    <span
      className={classes}
      style={style}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-pressed={onClick && selected !== undefined ? selected : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.target !== e.currentTarget) return;
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      <span>{children}</span>
      {closeButton}
    </span>
  );
};
