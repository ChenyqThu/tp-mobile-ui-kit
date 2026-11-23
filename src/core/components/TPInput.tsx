import React, { useId, useRef, useState } from 'react';
import type { TPInputProps } from '../types';
import '../../styles/tp-core-lists-inputs.css';

/**
 * Form input supporting labels, controlled/uncontrolled value, clearable button,
 * password visibility toggle, helper/error text, prefix/suffix, and multiline mode.
 */
export const TPInput: React.FC<TPInputProps> = ({
  variant = 'standard',
  label,
  value,
  defaultValue = '',
  onChange,
  clearable = false,
  password = false,
  multiline = false,
  rows = 3,
  error,
  helperText,
  prefix,
  suffix,
  containerClassName = '',
  className = '',
  style,
  id,
  type = 'text',
  disabled = false,
  readOnly = false,
  onFocus,
  onBlur,
  ...rest
}) => {
  const autoId = useId();
  const inputId = id ?? `tp-input-${autoId}`;
  const messageId = `${inputId}-message`;
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [internalValue, setInternalValue] = useState<string>(defaultValue);
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;
  const hasMessage = Boolean(error || helperText);

  const updateValue = (next: string) => {
    if (!isControlled) {
      setInternalValue(next);
    }
    onChange?.(next);
  };

  const handleClear = () => {
    updateValue('');
    if (multiline) {
      textareaRef.current?.focus();
    } else {
      inputRef.current?.focus();
    }
  };

  const showClearBtn = clearable && currentValue.length > 0 && !disabled && !readOnly;
  const showPasswordToggle = password && !multiline;
  const resolvedType = password ? (showPassword ? 'text' : 'password') : type;

  const fieldClasses = [
    'tp-input-field',
    `tp-input-field--${variant}`,
    containerClassName,
  ]
    .filter(Boolean)
    .join(' ');

  const boxClasses = [
    'tp-input-box',
    `tp-input-box--variant-${variant}`,
    multiline ? 'tp-input-box--multiline' : '',
    focused ? 'tp-input-box--focused' : '',
    error ? 'tp-input-box--error' : '',
    disabled ? 'tp-input-box--disabled' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={fieldClasses} data-variant={variant}>
      {variant !== 'borderless' && label !== undefined && label !== null && (
        <label htmlFor={inputId} className="tp-input-label">
          {label}
        </label>
      )}

      <div className={boxClasses}>
        {prefix !== undefined && prefix !== null && (
          <span className="tp-input-prefix">{prefix}</span>
        )}

        {multiline ? (
          <textarea
            ref={textareaRef}
            id={inputId}
            name={rest.name}
            rows={rows}
            placeholder={rest.placeholder}
            maxLength={rest.maxLength}
            autoFocus={rest.autoFocus}
            autoComplete={rest.autoComplete}
            required={rest.required}
            disabled={disabled}
            readOnly={readOnly}
            value={currentValue}
            aria-label={rest['aria-label']}
            aria-invalid={error ? true : undefined}
            aria-describedby={hasMessage ? messageId : rest['aria-describedby']}
            className={`tp-input-textarea ${className}`.trim()}
            style={style}
            onChange={(e) => updateValue(e.target.value)}
            onFocus={(e) => {
              setFocused(true);
              onFocus?.(e as unknown as React.FocusEvent<HTMLInputElement>);
            }}
            onBlur={(e) => {
              setFocused(false);
              onBlur?.(e as unknown as React.FocusEvent<HTMLInputElement>);
            }}
          />
        ) : (
          <input
            {...rest}
            ref={inputRef}
            id={inputId}
            type={resolvedType}
            disabled={disabled}
            readOnly={readOnly}
            value={currentValue}
            aria-invalid={error ? true : undefined}
            aria-describedby={hasMessage ? messageId : rest['aria-describedby']}
            className={`tp-input-control ${className}`.trim()}
            style={style}
            onChange={(e) => updateValue(e.target.value)}
            onFocus={(e) => {
              setFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              onBlur?.(e);
            }}
          />
        )}

        {showClearBtn && (
          <button
            type="button"
            className="tp-input-action-btn"
            aria-label="Clear input"
            onClick={handleClear}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <circle cx="7" cy="7" r="6" fill="currentColor" fillOpacity="0.2" />
              <path
                d="M4.8 4.8L9.2 9.2M9.2 4.8L4.8 9.2"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
          </button>
        )}

        {showPasswordToggle && (
          <button
            type="button"
            className="tp-input-action-btn"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? (
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path
                  d="M2.5 10C4.2 6.8 6.9 5 10 5C13.1 5 15.8 6.8 17.5 10C15.8 13.2 13.1 15 10 15C6.9 15 4.2 13.2 2.5 10Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path
                  d="M3 3L17 17M8.3 8.4A2.5 2.5 0 0 0 11.6 11.7M5.7 6.3C4.3 7.3 3.2 8.5 2.5 10C4.2 13.2 6.9 15 10 15C11.4 15 12.7 14.6 13.8 13.9M9.5 5C9.7 5 9.8 5 10 5C13.1 5 15.8 6.8 17.5 10C16.9 11.1 16.2 12.1 15.3 12.9"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </button>
        )}

        {suffix !== undefined && suffix !== null && (
          <span className="tp-input-suffix">{suffix}</span>
        )}
      </div>

      {error ? (
        <div id={messageId} className="tp-input-error" role="alert">
          {error}
        </div>
      ) : helperText ? (
        <div id={messageId} className="tp-input-helper">
          {helperText}
        </div>
      ) : null}
    </div>
  );
};
