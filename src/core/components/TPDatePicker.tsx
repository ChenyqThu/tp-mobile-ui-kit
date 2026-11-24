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

function formatDateIso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parseDateIso(raw: string | undefined, fallback: Date): Date {
  if (!raw) return fallback;
  const match = raw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (!match) return fallback;
  const parsed = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isNaN(parsed.getTime()) ? fallback : parsed;
}

/**
 * Mobile date wheel picker with Year / Month / Day columns, leap-year clamping, single & range modes, and header actions.
 */
export const TPDatePicker: React.FC<TPDatePickerProps> = ({
  mode = 'single',
  value,
  defaultValue,
  rangeValue,
  defaultRangeValue,
  minYear = 1990,
  maxYear = 2040,
  onChange,
  onConfirm,
  onRangeChange,
  onRangeConfirm,
  onCancel,
  title,
  className = '',
  style,
}) => {
  const isRange = mode === 'range';
  const [internalDate, setInternalDate] = useState<Date>(
    () => defaultValue ?? new Date(2026, 0, 1),
  );
  const [internalRange, setInternalRange] = useState<[string, string]>(() => [
    defaultRangeValue?.[0] ?? '2026-01-01',
    defaultRangeValue?.[1] ?? '2026-01-07',
  ]);
  const [activeEdge, setActiveEdge] = useState<'start' | 'end'>('start');

  const activeRange: [string, string] = rangeValue
    ? [rangeValue[0], rangeValue[1]]
    : internalRange;

  const isControlled = isRange ? rangeValue !== undefined : value !== undefined;
  const activeDate = isRange
    ? parseDateIso(activeEdge === 'start' ? activeRange[0] : activeRange[1], new Date(2026, 0, 1))
    : isControlled && value
      ? value
      : internalDate;

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

    if (isRange) {
      const nextIso = formatDateIso(nextDate);
      const nextPair: [string, string] =
        activeEdge === 'start'
          ? [nextIso, activeRange[1] < nextIso ? nextIso : activeRange[1]]
          : [activeRange[0] > nextIso ? nextIso : activeRange[0], nextIso];
      if (!rangeValue) {
        setInternalRange(nextPair);
      }
      onRangeChange?.(nextPair);
      return;
    }

    if (!isControlled) {
      setInternalDate(nextDate);
    }
    onChange?.(nextDate);
  };

  const hasHeader = title !== undefined || onCancel !== undefined || onConfirm !== undefined || onRangeConfirm !== undefined;

  return (
    <div className={`tp-date-picker ${className}`.trim()} data-mode={mode} style={style}>
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
          {onConfirm || onRangeConfirm ? (
            <button
              type="button"
              className="tp-date-picker-btn tp-date-picker-btn--confirm"
              onClick={() => {
                if (isRange) {
                  onRangeConfirm?.(activeRange);
                } else {
                  onConfirm?.(new Date(currentYear, currentMonth - 1, currentDay));
                }
              }}
            >
              Confirm
            </button>
          ) : (
            <span />
          )}
        </div>
      )}

      {isRange && (
        <div className="tp-date-picker-range-tabs" role="tablist" aria-label="Date range bounds">
          <button
            type="button"
            role="tab"
            aria-selected={activeEdge === 'start'}
            className={`tp-date-picker-range-tab ${activeEdge === 'start' ? 'tp-date-picker-range-tab--active' : ''}`.trim()}
            onClick={() => setActiveEdge('start')}
          >
            <span className="tp-date-picker-range-label">Start</span>
            <span className="tp-date-picker-range-val">{activeRange[0]}</span>
          </button>
          <span className="tp-date-picker-range-sep" aria-hidden="true">→</span>
          <button
            type="button"
            role="tab"
            aria-selected={activeEdge === 'end'}
            className={`tp-date-picker-range-tab ${activeEdge === 'end' ? 'tp-date-picker-range-tab--active' : ''}`.trim()}
            onClick={() => setActiveEdge('end')}
          >
            <span className="tp-date-picker-range-label">End</span>
            <span className="tp-date-picker-range-val">{activeRange[1]}</span>
          </button>
        </div>
      )}

      <TPWheelPicker columns={columns} onChange={handleColumnChange} />
    </div>
  );
};
