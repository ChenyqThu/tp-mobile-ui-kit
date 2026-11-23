import React, { useState } from 'react';
import type { TPMonthPickerProps, TPMonthPickerValue } from '../types';
import '../../styles/tp-core-extended.css';

const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;
const MONTHS_ZH = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'] as const;

/**
 * Year navigation + 12-month grid selector matching Figma `Picker / Month Picker 选择月份`.
 */
export const TPMonthPicker: React.FC<TPMonthPickerProps> = ({
  value,
  defaultValue = { year: 2026, month: 11 },
  minYear = 2020,
  maxYear = 2032,
  locale = 'en',
  onChange,
  className = '',
  style,
}) => {
  const isControlled = value !== undefined;
  const [internalVal, setInternalVal] = useState<TPMonthPickerValue>(defaultValue);
  const selected = isControlled ? value : internalVal;
  const [displayYear, setDisplayYear] = useState<number>(selected.year);

  const monthLabels = locale === 'zh' ? MONTHS_ZH : MONTHS_EN;

  const selectMonth = (monthNum: number) => {
    const next: TPMonthPickerValue = { year: displayYear, month: monthNum };
    if (!isControlled) {
      setInternalVal(next);
    }
    onChange?.(next);
  };

  return (
    <div className={`tp-month-picker ${className}`.trim()} style={style}>
      <div className="tp-month-picker-header">
        <button
          type="button"
          className="tp-month-picker-nav"
          aria-label="Previous year"
          disabled={displayYear <= minYear}
          onClick={() => setDisplayYear((y) => Math.max(minYear, y - 1))}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M10 3.5L5.5 8L10 12.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span className="tp-month-picker-year">
          {locale === 'zh' ? `${displayYear}年` : displayYear}
        </span>
        <button
          type="button"
          className="tp-month-picker-nav"
          aria-label="Next year"
          disabled={displayYear >= maxYear}
          onClick={() => setDisplayYear((y) => Math.min(maxYear, y + 1))}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M6 3.5L10.5 8L6 12.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <div className="tp-month-picker-grid" role="listbox" aria-label="Month">
        {monthLabels.map((label, idx) => {
          const monthNum = idx + 1;
          const isSelected = selected.year === displayYear && selected.month === monthNum;
          return (
            <button
              key={monthNum}
              type="button"
              role="option"
              aria-selected={isSelected}
              className={`tp-month-picker-cell ${
                isSelected ? 'tp-month-picker-cell--selected' : ''
              }`.trim()}
              onClick={() => selectMonth(monthNum)}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
