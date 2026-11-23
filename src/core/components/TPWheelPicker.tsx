import React, { useEffect, useRef } from 'react';
import type { TPWheelPickerColumn, TPWheelPickerProps } from '../types';
import '../../styles/tp-core-lists-inputs.css';

interface WheelColumnViewProps {
  column: TPWheelPickerColumn;
  itemHeight: number;
  visibleItems: 3 | 5;
  onChange: (key: string, value: string) => void;
}

const WheelColumnView: React.FC<WheelColumnViewProps> = ({
  column,
  itemHeight,
  visibleItems,
  onChange,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const selectedIndex = Math.max(
    0,
    column.options.findIndex((opt) => opt.value === column.value),
  );
  const spacerHeight = Math.floor(visibleItems / 2) * itemHeight;

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const targetTop = selectedIndex * itemHeight;
    if (typeof el.scrollTo === 'function') {
      el.scrollTo({ top: targetTop, behavior: 'smooth' });
    } else {
      el.scrollTop = targetTop;
    }
  }, [selectedIndex, itemHeight]);

  const stepBy = (delta: number) => {
    const nextIndex = Math.min(
      column.options.length - 1,
      Math.max(0, selectedIndex + delta),
    );
    const nextOption = column.options[nextIndex];
    if (nextOption && nextOption.value !== column.value) {
      onChange(column.key, nextOption.value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      stepBy(-1);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      stepBy(1);
    } else if (e.key === 'Home' && column.options.length > 0) {
      e.preventDefault();
      onChange(column.key, column.options[0].value);
    } else if (e.key === 'End' && column.options.length > 0) {
      e.preventDefault();
      onChange(column.key, column.options[column.options.length - 1].value);
    }
  };

  return (
    <div className="tp-wheel-column-wrap">
      <button
        type="button"
        className="tp-wheel-step tp-wheel-step--up"
        aria-label={`Previous ${column.key}`}
        disabled={selectedIndex <= 0}
        onClick={() => stepBy(-1)}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path
            d="M3 7.5L6 4.5L9 7.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <div
        ref={scrollRef}
        role="listbox"
        aria-label={column.key}
        tabIndex={0}
        className="tp-wheel-column"
        style={{ height: visibleItems * itemHeight }}
        onKeyDown={handleKeyDown}
      >
        <div className="tp-wheel-spacer" style={{ height: spacerHeight }} />
        {column.options.map((opt) => {
          const isSelected = opt.value === column.value;
          return (
            <button
              key={opt.value}
              type="button"
              role="option"
              aria-selected={isSelected}
              className={`tp-wheel-item ${isSelected ? 'tp-wheel-item--selected' : ''}`.trim()}
              style={{ height: itemHeight }}
              onClick={() => {
                if (opt.value !== column.value) {
                  onChange(column.key, opt.value);
                }
              }}
            >
              {opt.label}
            </button>
          );
        })}
        <div className="tp-wheel-spacer" style={{ height: spacerHeight }} />
      </div>

      <button
        type="button"
        className="tp-wheel-step tp-wheel-step--down"
        aria-label={`Next ${column.key}`}
        disabled={selectedIndex >= column.options.length - 1}
        onClick={() => stepBy(1)}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path
            d="M3 4.5L6 7.5L9 4.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
};

/**
 * Multi-column scrollable/clickable wheel picker with centered highlight band and keyboard/step controls.
 */
export const TPWheelPicker: React.FC<TPWheelPickerProps> = ({
  columns,
  onChange,
  itemHeight = 40,
  visibleItems = 5,
  className = '',
  style,
}) => {
  const centerTop = Math.floor(visibleItems / 2) * itemHeight;

  return (
    <div
      className={`tp-wheel-picker ${className}`.trim()}
      style={{ height: visibleItems * itemHeight, ...style }}
    >
      <div
        className="tp-wheel-highlight"
        style={{ top: centerTop, height: itemHeight }}
        aria-hidden="true"
      />
      <div className="tp-wheel-columns">
        {columns.map((col) => (
          <WheelColumnView
            key={col.key}
            column={col}
            itemHeight={itemHeight}
            visibleItems={visibleItems}
            onChange={onChange}
          />
        ))}
      </div>
    </div>
  );
};
