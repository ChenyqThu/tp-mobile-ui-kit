import React, { useMemo, useState } from 'react';
import type { TPDatePickerProps, TPWheelPickerColumn } from '../types';
import { TPWheelPicker } from './TPWheelPicker';
import '../../styles/tp-core-lists-inputs.css';

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function clampYear(year: number, minYear: number, maxYear: number): number {
  return Math.min(maxYear, Math.max(minYear, year));
}

/**
 * Mobile date wheel picker with Year / Month / Day columns, leap-year clamping, and header actions.
 */
export const TPDatePicker: React.FC<TPDatePickerProps> = ({
  value,
  defaultValue,
  minYear = 1990,
  maxYear = 2040,
  onChange,
  onConfirm,
  onCancel,
  title,
  className = '',
  style,
}) => {
  const [internalDate, setInternalDate] = useState<Date>(
    () => defaultValue ?? new Date(2026, 0, 1),
  );

  const isControlled = value !== undefined;
  const activeDate = isControlled ? value : internalDate;

  const currentYear = clampYear(activeDate.getFullYear(), minYear, maxYear);
  const currentMonth = activeDate.getMonth() + 1;
  const maxDays = getDaysInMonth(currentYear, currentMonth);
  const currentDay = Math.min(maxDays, activeDate.getDate());

  const columns = useMemo<TPWheelPickerColumn[]>(() => {
    const years: { value: string; label: string }[] = [];
    for (let y = minYear; y <= maxYear; y++) {
      years.push({ value: String(y), label: String(y) });
    }

    const months = Array.from({ length: 12 }, (_, idx) => {
      const m = idx + 1;
      return { value: String(m), label: String(m).padStart(2, '0') };
    });

    const days = Array.from({ length: maxDays }, (_, idx) => {
      const d = idx + 1;
      return { value: String(d), label: String(d).padStart(2, '0') };
    });

    return [
      { key: 'year', options: years, value: String(currentYear) },
      { key: 'month', options: months, value: String(currentMonth) },
      { key: 'day', options: days, value: String(currentDay) },
    ];
  }, [minYear, maxYear, maxDays, currentYear, currentMonth, currentDay]);

  const handleColumnChange = (key: string, nextVal: string) => {
    const parsed = Number(nextVal);
    if (Number.isNaN(parsed)) return;

    let nextYear = currentYear;
    let nextMonth = currentMonth;
    let nextDay = currentDay;

    if (key === 'year') nextYear = clampYear(parsed, minYear, maxYear);
    if (key === 'month') nextMonth = parsed;
    if (key === 'day') nextDay = parsed;

    const clampedDay = Math.min(nextDay, getDaysInMonth(nextYear, nextMonth));
    const nextDate = new Date(nextYear, nextMonth - 1, clampedDay);

    if (!isControlled) {
      setInternalDate(nextDate);
    }
    onChange?.(nextDate);
  };

  const hasHeader = title !== undefined || onCancel !== undefined || onConfirm !== undefined;

  return (
    <div className={`tp-date-picker ${className}`.trim()} style={style}>
      {hasHeader && (
        <div className="tp-date-picker-header">
          {onCancel ? (
            <button type="button" className="tp-date-picker-btn" onClick={onCancel}>
              Cancel
            </button>
          ) : (
            <span />
          )}
          {title !== undefined && <div className="tp-date-picker-title">{title}</div>}
          {onConfirm ? (
            <button
              type="button"
              className="tp-date-picker-btn tp-date-picker-btn--confirm"
              onClick={() => onConfirm(new Date(currentYear, currentMonth - 1, currentDay))}
            >
              Confirm
            </button>
          ) : (
            <span />
          )}
        </div>
      )}

      <TPWheelPicker columns={columns} onChange={handleColumnChange} />
    </div>
  );
};
