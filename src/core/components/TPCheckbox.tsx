import React, { useId, useState } from 'react';
import type { TPCheckboxGroupProps, TPCheckboxProps } from '../types';
import '../../styles/tp-core-extended.css';

/**
 * TP-Design theme-adaptive checkbox with optional indeterminate state, label, and description.
 */
export const TPCheckbox: React.FC<TPCheckboxProps> = ({
  checked,
  defaultChecked = false,
  indeterminate = false,
  disabled = false,
  label,
  description,
  onChange,
  ariaLabel,
  className = '',
  style,
}) => {
  const inputId = useId();
  const isControlled = checked !== undefined;
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const isChecked = isControlled ? checked : internalChecked;

  const handleToggle = () => {
    if (disabled) return;
    const next = !isChecked;
    if (!isControlled) {
      setInternalChecked(next);
    }
    onChange?.(next);
  };

  const classes = [
    'tp-check-row',
    isChecked ? 'tp-check-row--checked' : '',
    indeterminate ? 'tp-check-row--indeterminate' : '',
    disabled ? 'tp-check-row--disabled' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <label htmlFor={inputId} className={classes} style={style}>
      <input
        id={inputId}
        type="checkbox"
        className="tp-check-native"
        checked={isChecked}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-checked={indeterminate ? 'mixed' : isChecked}
        onChange={handleToggle}
      />
      <span
        className={`tp-checkbox-box ${
          isChecked || indeterminate ? 'tp-checkbox-box--active' : ''
        }`.trim()}
        aria-hidden="true"
      >
        {indeterminate ? (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2.5 6H9.5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
          </svg>
        ) : isChecked ? (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M2.5 6.2L5 8.7L9.5 3.6"
              stroke="currentColor"
              strokeWidth="1.9"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : null}
      </span>
      {(label !== undefined || description !== undefined) && (
        <span className="tp-check-texts">
          {label !== undefined && <span className="tp-check-label">{label}</span>}
          {description !== undefined && <span className="tp-check-desc">{description}</span>}
        </span>
      )}
    </label>
  );
};

/**
 * Vertical or horizontal group of TPCheckbox options.
 */
export const TPCheckboxGroup: React.FC<TPCheckboxGroupProps> = ({
  options,
  value,
  defaultValue = [],
  onChange,
  direction = 'vertical',
  disabled = false,
  className = '',
  style,
}) => {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<string[]>([...defaultValue]);
  const selected = isControlled ? value : internalValue;

  const toggleOption = (optValue: string, nextChecked: boolean) => {
    const next = nextChecked
      ? selected.includes(optValue)
        ? [...selected]
        : [...selected, optValue]
      : selected.filter((v) => v !== optValue);
    if (!isControlled) {
      setInternalValue(next);
    }
    onChange?.(next);
  };

  return (
    <div
      role="group"
      className={`tp-choice-group tp-choice-group--${direction} ${className}`.trim()}
      style={style}
    >
      {options.map((opt) => (
        <TPCheckbox
          key={opt.value}
          label={opt.label}
          description={opt.description}
          disabled={disabled || opt.disabled}
          checked={selected.includes(opt.value)}
          onChange={(nextChecked) => toggleOption(opt.value, nextChecked)}
        />
      ))}
    </div>
  );
};
