import React from 'react';
import type { TPButtonProps } from '../types';
import '../../styles/tp-core-nav-controls.css';

export const TPButton: React.FC<TPButtonProps> = ({
  variant = 'primary',
  size = 'lg',
  block = false,
  loading = false,
  htmlType = 'button',
  icon,
  disabled = false,
  className = '',
  children,
  ...rest
}) => {
  const rootClass = [
    'tp-btn',
    `tp-btn--${variant}`,
    `tp-btn--${size}`,
    block ? 'tp-btn--block' : '',
    loading ? 'tp-btn--loading' : '',
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
    >
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
