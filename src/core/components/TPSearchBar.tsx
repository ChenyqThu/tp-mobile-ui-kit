import React, { useRef, useState } from 'react';
import type { TPSearchBarProps } from '../types';
import '../../styles/tp-core-lists-inputs.css';

/**
 * Mobile pill search bar with magnifying glass icon, clear button, and optional Cancel action.
 */
export const TPSearchBar: React.FC<TPSearchBarProps> = ({
  value,
  defaultValue = '',
  placeholder = 'Search',
  onChange,
  onSearch,
  onCancel,
  showCancel = false,
  autoFocus = false,
  shape = 'auto',
  className = '',
  style,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [internalValue, setInternalValue] = useState(defaultValue);

  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  const updateValue = (next: string) => {
    if (!isControlled) {
      setInternalValue(next);
    }
    onChange?.(next);
  };

  const handleClear = () => {
    updateValue('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSearch?.(currentValue);
    }
  };

  return (
    <div
      className={`tp-search-bar tp-search-bar--shape-${shape} ${className}`.trim()}
      data-shape={shape}
      style={style}
    >
      <div className="tp-search-field">
        <span className="tp-search-icon" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="4.8" stroke="currentColor" strokeWidth="1.6" />
            <path
              d="M10.6 10.6L14 14"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </span>

        <input
          ref={inputRef}
          type="search"
          className="tp-search-input"
          value={currentValue}
          placeholder={placeholder}
          aria-label={placeholder}
          autoFocus={autoFocus}
          onChange={(e) => updateValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        {currentValue.length > 0 && (
          <button
            type="button"
            className="tp-search-clear"
            aria-label="Clear search"
            onClick={handleClear}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
              <path
                d="M2.5 2.5L7.5 7.5M7.5 2.5L2.5 7.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        )}
      </div>

      {showCancel && (
        <button type="button" className="tp-search-cancel" onClick={onCancel}>
          Cancel
        </button>
      )}
    </div>
  );
};
