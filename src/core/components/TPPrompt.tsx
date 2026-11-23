import React from 'react';
import type { TPPromptProps } from '../types';
import '../../styles/tp-core-overlays.css';

const PromptToneIcon: React.FC<{ tone: NonNullable<TPPromptProps['tone']> }> = ({ tone }) => {
  switch (tone) {
    case 'warning':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.5" />
          <rect x="11.25" y="7.2" width="1.5" height="6" rx="0.4" fill="currentColor" />
          <rect x="11.25" y="14.8" width="1.5" height="1.6" rx="0.4" fill="currentColor" />
        </svg>
      );
    case 'alert':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M9.2 9.2L14.8 14.8M14.8 9.2L9.2 14.8"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      );
    case 'focus':
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M8.5 12.2L11 14.7L15.8 9.6"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'info':
    default:
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.4" />
          <rect x="11.2" y="8" width="1.5" height="1.5" fill="currentColor" />
          <path d="M11.2 11H12.7V16.5H11.2V11Z" fill="currentColor" />
        </svg>
      );
  }
};

const CloseIcon: React.FC = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path
      d="M3.5 3.5L12.5 12.5M12.5 3.5L3.5 12.5"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
);

export const TPPrompt: React.FC<TPPromptProps> = ({
  tone = 'info',
  title,
  actionLabel,
  onAction,
  closable,
  onClose,
  icon,
  className = '',
  style,
}) => {
  const showClose = closable ?? Boolean(onClose);

  return (
    <div
      role="region"
      data-tone={tone}
      className={`tp-prompt tp-prompt--${tone} ${className}`.trim()}
      style={style}
    >
      <span className="tp-prompt-icon">
        {icon !== undefined ? icon : <PromptToneIcon tone={tone} />}
      </span>

      <div className="tp-prompt-content">
        <div className="tp-prompt-title">{title}</div>
        {actionLabel !== undefined && (
          <button type="button" className="tp-prompt-action" onClick={onAction}>
            {actionLabel}
          </button>
        )}
      </div>

      {showClose && (
        <button
          type="button"
          className="tp-prompt-close"
          aria-label="Dismiss"
          onClick={onClose}
        >
          <CloseIcon />
        </button>
      )}
    </div>
  );
};
