import React from 'react';
import type { TPFixedToastProps } from '../types';
import '../../styles/tp-core-extended.css';

const FixedToastStatusIcon: React.FC<{ status: NonNullable<TPFixedToastProps['status']> }> = ({
  status,
}) => {
  switch (status) {
    case 'success':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.7" />
          <path
            d="M8.2 12.2L10.8 14.8L15.8 9.4"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'warning':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.7" />
          <rect x="11.2" y="7.2" width="1.6" height="5.8" rx="0.4" fill="currentColor" />
          <rect x="11.2" y="14.6" width="1.6" height="1.7" rx="0.4" fill="currentColor" />
        </svg>
      );
    case 'danger':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.7" />
          <path
            d="M9 9L15 15M15 9L9 15"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      );
    case 'info':
    case 'default':
    default:
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.7" />
          <rect x="11.2" y="7.6" width="1.6" height="1.6" rx="0.4" fill="currentColor" />
          <rect x="11.2" y="10.8" width="1.6" height="5.6" rx="0.4" fill="currentColor" />
        </svg>
      );
  }
};

/**
 * Persistent inline/sticky notification bar matching Figma `Toast / Fixed Toast`.
 */
export const TPFixedToast: React.FC<TPFixedToastProps> = ({
  status = 'default',
  action = 'none',
  actionLabel = 'Details',
  onAction,
  onClose,
  message,
  className = '',
  style,
}) => {
  return (
    <div
      role={status === 'danger' ? 'alert' : 'status'}
      data-status={status}
      data-action={action}
      className={`tp-fixed-toast tp-fixed-toast--${status} ${className}`.trim()}
      style={style}
    >
      <span className="tp-fixed-toast-icon">
        <FixedToastStatusIcon status={status} />
      </span>

      <div className="tp-fixed-toast-message">{message}</div>

      {action === 'button' && (
        <button type="button" className="tp-fixed-toast-btn" onClick={onAction}>
          {actionLabel}
        </button>
      )}

      {action === 'go-to' && (
        <button
          type="button"
          className="tp-fixed-toast-icon-action"
          aria-label={actionLabel || 'Go to'}
          onClick={onAction}
        >
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M6 3.5L10.5 8L6 12.5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}

      {action === 'close' && (
        <button
          type="button"
          className="tp-fixed-toast-icon-action"
          aria-label="Close"
          onClick={onClose}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M3.5 3.5L12.5 12.5M12.5 3.5L3.5 12.5"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}
    </div>
  );
};
