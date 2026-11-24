import React from 'react';
import type { TPButtonProps } from '../types';
import '../../styles/tp-core-nav-controls.css';

export const TPButton: React.FC<TPButtonProps> = ({
  variant = 'primary',
  size = 'lg',
  block = false,
  loading = false,
  progress,
  htmlType = 'button',
  icon,
  disabled = false,
  className = '',
  children,
  ...rest
}) => {
  const clampedProgress =
    typeof progress === 'number' && !Number.isNaN(progress)
      ? Math.max(0, Math.min(100, progress))
      : undefined;

  const rootClass = [
    'tp-btn',
    `tp-btn--${variant}`,
    `tp-btn--${size}`,
    block ? 'tp-btn--block' : '',
    loading ? 'tp-btn--loading' : '',
    clampedProgress !== undefined ? 'tp-btn--has-progress' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      {...rest}
      type={htmlType}
      className={rootClass}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      data-variant={variant}
      data-size={size}
      data-progress={clampedProgress !== undefined ? String(clampedProgress) : undefined}
    >
      {clampedProgress !== undefined && (
        <span
          className="tp-btn-progress"
          aria-hidden="true"
          style={{ width: `${clampedProgress}%` }}
        />
      )}
      {loading ? (
        <span className="tp-btn-spinner" aria-hidden="true" />
      ) : icon !== undefined && icon !== null ? (
        <span className="tp-btn-icon" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      {children !== undefined && children !== null && (
        <span className="tp-btn-label">{children}</span>
      )}
    </button>
  );
};
