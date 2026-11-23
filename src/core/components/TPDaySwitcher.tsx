import React, { useState } from 'react';
import type { TPDayKey, TPDaySwitcherProps } from '../types';
import '../../styles/tp-core-lists-inputs.css';

const DAYS_META: readonly {
  key: TPDayKey;
  en: string;
  zh: string;
  enTitle: string;
  zhTitle: string;
}[] = [
  { key: 'sun', en: 'S', zh: '日', enTitle: 'Sunday', zhTitle: '周日' },
  { key: 'mon', en: 'M', zh: '一', enTitle: 'Monday', zhTitle: '周一' },
  { key: 'tue', en: 'T', zh: '二', enTitle: 'Tuesday', zhTitle: '周二' },
  { key: 'wed', en: 'W', zh: '三', enTitle: 'Wednesday', zhTitle: '周三' },
  { key: 'thu', en: 'T', zh: '四', enTitle: 'Thursday', zhTitle: '周四' },
  { key: 'fri', en: 'F', zh: '五', enTitle: 'Friday', zhTitle: '周五' },
  { key: 'sat', en: 'S', zh: '六', enTitle: 'Saturday', zhTitle: '周六' },
];

/**
 * 7-day circular/pill toggle strip supporting English and Chinese weekday labels.
 */
export const TPDaySwitcher: React.FC<TPDaySwitcherProps> = ({
  value,
  defaultValue = [],
  onChange,
  disabled = false,
  locale = 'en',
  className = '',
  style,
}) => {
  const [internalDays, setInternalDays] = useState<readonly TPDayKey[]>(defaultValue);
  const isControlled = value !== undefined;
  const activeDays = isControlled ? value : internalDays;

  const toggleDay = (dayKey: TPDayKey) => {
    if (disabled) return;
    const nextSet = new Set(activeDays);
    if (nextSet.has(dayKey)) {
      nextSet.delete(dayKey);
    } else {
      nextSet.add(dayKey);
    }
    const ordered = DAYS_META.map((d) => d.key).filter((k) => nextSet.has(k));
    if (!isControlled) {
      setInternalDays(ordered);
    }
    onChange?.(ordered);
  };

  const classes = [
    'tp-day-switcher',
    disabled ? 'tp-day-switcher--disabled' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} style={style} role="group" aria-label="Days of week">
      {DAYS_META.map((day) => {
        const isSelected = activeDays.includes(day.key);
        const label = locale === 'zh' ? day.zh : day.en;
        const title = locale === 'zh' ? day.zhTitle : day.enTitle;
        return (
          <button
            key={day.key}
            type="button"
            data-day={day.key}
            title={title}
            disabled={disabled}
            aria-pressed={isSelected}
            className={`tp-day-switcher-btn ${isSelected ? 'tp-day-switcher-btn--selected' : ''}`.trim()}
            onClick={() => toggleDay(day.key)}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
};
