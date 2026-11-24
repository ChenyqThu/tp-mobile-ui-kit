import React, { useState } from 'react';
import type { TPListItemProps, TPSwitchProps } from '../types';
import '../../styles/tp-core-lists-inputs.css';

interface InlineListSwitchProps extends TPSwitchProps {
  fallbackLabel?: string;
}

const InlineListSwitch: React.FC<InlineListSwitchProps> = ({
  checked,
  defaultChecked = false,
  onChange,
  disabled = false,
  loading = false,
  ariaLabel,
  className = '',
  style,
  fallbackLabel,
}) => {
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const isControlled = checked !== undefined;
  const isChecked = isControlled ? checked : internalChecked;
  const isDisabled = disabled || loading;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (isDisabled) return;
    const next = !isChecked;
    if (!isControlled) {
      setInternalChecked(next);
    }
    onChange?.(next);
  };

  const classes = [
    'tp-switch',
    isChecked ? 'tp-switch--checked' : '',
    isDisabled ? 'tp-switch--disabled' : '',
    loading ? 'tp-switch--loading' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isChecked}
      aria-label={ariaLabel ?? fallbackLabel ?? 'Toggle'}
      disabled={isDisabled}
      className={classes}
      style={style}
      onClick={handleClick}
    >
      <span className="tp-switch-thumb">
        {loading ? <span className="tp-switch-spinner" aria-hidden="true" /> : null}
      </span>
    </button>
  );
};

/**
 * Standard mobile list row supporting leading media, multi-line titles, value/badge/switch/arrow trailing slots.
 */
export const TPListItem: React.FC<TPListItemProps> = ({
  title,
  subtitle,
  description,
  value,
  leading,
  trailing,
  badge,
  arrow = false,
  checked,
  switchProps,
  danger = false,
  disabled = false,
  layout = 'default',
  error,
  onClick,
  className = '',
  style,
}) => {
  const isFormField = layout === 'form-field';
  const isClickable = Boolean(onClick) && !disabled;
  const hasTrailingGroup =
    (!isFormField && value !== undefined && value !== null) ||
    (badge !== undefined && badge !== null) ||
    (trailing !== undefined && trailing !== null) ||
    Boolean(checked) ||
    Boolean(switchProps) ||
    arrow;

  const handleClick = () => {
    if (disabled || !onClick) return;
    onClick();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!isClickable) return;
    if (e.target !== e.currentTarget) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  };

  const classes = [
    'tp-list-item',
    isFormField ? 'tp-list-item--form-field' : '',
    error ? 'tp-list-item--error' : '',
    isClickable ? 'tp-list-item--clickable' : '',
    danger ? 'tp-list-item--danger' : '',
    disabled ? 'tp-list-item--disabled' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={classes}
      style={style}
      role={onClick ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      aria-disabled={disabled || undefined}
      data-layout={layout}
      data-checked={checked !== undefined ? String(Boolean(checked)) : undefined}
      onClick={onClick ? handleClick : undefined}
      onKeyDown={onClick ? handleKeyDown : undefined}
    >
      {leading !== undefined && leading !== null && (
        <div className="tp-list-item-leading">{leading}</div>
      )}

      <div className="tp-list-item-content">
        {isFormField ? (
          <>
            <div className="tp-list-item-form-label">{title}</div>
            {value !== undefined && value !== null && (
              <div className="tp-list-item-form-value">{value}</div>
            )}
            {subtitle !== undefined && subtitle !== null && (
              <div className="tp-list-item-subtitle">{subtitle}</div>
            )}
            {description !== undefined && description !== null && (
              <div className="tp-list-item-description">{description}</div>
            )}
            {error !== undefined && error !== null && error !== '' && (
              <div className="tp-list-item-error" role="alert">
                {error}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="tp-list-item-title">{title}</div>
            {subtitle !== undefined && subtitle !== null && (
              <div className="tp-list-item-subtitle">{subtitle}</div>
            )}
            {description !== undefined && description !== null && (
              <div className="tp-list-item-description">{description}</div>
            )}
            {error !== undefined && error !== null && error !== '' && (
              <div className="tp-list-item-error" role="alert">
                {error}
              </div>
            )}
          </>
        )}
      </div>

      {hasTrailingGroup && (
        <div className="tp-list-item-trailing-group">
          {!isFormField && value !== undefined && value !== null && (
            <div className="tp-list-item-value">{value}</div>
          )}
          {badge !== undefined && badge !== null && (
            <span className="tp-list-item-badge">{badge}</span>
          )}
          {trailing !== undefined && trailing !== null && (
            <div className="tp-list-item-trailing">{trailing}</div>
          )}
          {checked && (
            <span className="tp-list-item-check" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path
                  d="M4 9.2L7.4 12.6L14 5.5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          )}
          {switchProps && (
            <InlineListSwitch
              {...switchProps}
              disabled={disabled || switchProps.disabled}
              fallbackLabel={typeof title === 'string' ? title : undefined}
            />
          )}
          {arrow && (
            <span className="tp-list-item-arrow" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M6 3.5L10.5 8L6 12.5"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          )}
        </div>
      )}
    </div>
  );
};
