import React, { useMemo, useState } from 'react';
import type { TPLast7DaysPickerProps } from '../types';
import '../../styles/tp-core-extended.css';

const WEEKDAYS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
const WEEKDAYS_ZH = ['日', '一', '二', '三', '四', '五', '六'] as const;

function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Horizontal 7-day rolling calendar strip matching Figma `Picker / Last 7 Days 过去7天`.
 */
export const TPLast7DaysPicker: React.FC<TPLast7DaysPickerProps> = ({
  value,
  defaultValue,
  referenceDate,
  markedDates = [],
  locale = 'en',
  onChange,
  className = '',
  style,
}) => {
  const anchor = useMemo(
    () => referenceDate ?? defaultValue ?? value ?? new Date(2026, 10, 23),
    [referenceDate, defaultValue, value],
  );
  const isControlled = value !== undefined;
  const [internalDate, setInternalDate] = useState<Date>(() => defaultValue ?? anchor);
  const selectedDate = isControlled ? value : internalDate;
  const selectedKey = toDateKey(selectedDate);

  const days = useMemo(() => {
    const out: Date[] = [];
    for (let offset = 6; offset >= 0; offset--) {
      out.push(new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate() - offset));
    }
    return out;
  }, [anchor]);

  const weekdays = locale === 'zh' ? WEEKDAYS_ZH : WEEKDAYS_EN;
  const markedSet = useMemo(() => new Set(markedDates), [markedDates]);

  const handleSelect = (day: Date) => {
    if (!isControlled) {
      setInternalDate(day);
    }
    onChange?.(day);
  };

  return (
    <div
      className={`tp-last7-picker ${className}`.trim()}
      role="listbox"
      aria-label="Last 7 Days"
      style={style}
    >
      {days.map((day) => {
        const key = toDateKey(day);
        const isSelected = key === selectedKey;
        const hasMark = markedSet.has(key);
        return (
          <button
            key={key}
            type="button"
            role="option"
            aria-selected={isSelected}
            aria-label={key}
            className={`tp-last7-day ${isSelected ? 'tp-last7-day--selected' : ''}`.trim()}
            onClick={() => handleSelect(day)}
          >
            <span className="tp-last7-weekday">{weekdays[day.getDay()]}</span>
            <span className="tp-last7-num">{day.getDate()}</span>
            <span
              className={`tp-last7-dot ${hasMark ? 'tp-last7-dot--visible' : ''}`.trim()}
              aria-hidden="true"
            />
          </button>
        );
      })}
    </div>
  );
};
