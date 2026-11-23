import React, { useMemo, useState } from 'react';
import type { TPTimePickerProps, TPWheelPickerColumn } from '../types';
import { TPWheelPicker } from './TPWheelPicker';
import '../../styles/tp-core-lists-inputs.css';

interface TimeValue {
  hour: number;
  minute: number;
  period?: 'AM' | 'PM';
}

function normalizeTimeValue(raw: TimeValue, use12Hour: boolean): TimeValue {
  let hour = raw.hour;
  let period: 'AM' | 'PM' | undefined = raw.period;

  if (use12Hour) {
    if (!period) {
      period = hour >= 12 ? 'PM' : 'AM';
    }
    if (hour === 0) hour = 12;
    else if (hour > 12) hour = hour - 12;
    return { hour: Math.min(12, Math.max(1, hour)), minute: Math.min(59, Math.max(0, raw.minute)), period };
  }

  return {
    hour: Math.min(23, Math.max(0, hour)),
    minute: Math.min(59, Math.max(0, raw.minute)),
  };
}

/**
 * Mobile time wheel picker supporting 24-hour and 12-hour (AM/PM) modes plus custom minute steps.
 */
export const TPTimePicker: React.FC<TPTimePickerProps> = ({
  value,
  use12Hour = false,
  minuteStep = 1,
  onChange,
  className = '',
  style,
}) => {
  const [internalValue, setInternalValue] = useState<TimeValue>(() =>
    normalizeTimeValue({ hour: use12Hour ? 9 : 9, minute: 0, period: 'AM' }, use12Hour),
  );

  const isControlled = value !== undefined;
  const activeValue = normalizeTimeValue(isControlled ? value : internalValue, use12Hour);
  const step = Math.max(1, minuteStep);

  const minuteOptions = useMemo(() => {
    const list: { value: string; label: string }[] = [];
    for (let m = 0; m < 60; m += step) {
      list.push({ value: String(m), label: String(m).padStart(2, '0') });
    }
    return list;
  }, [step]);

  const closestMinute = useMemo(() => {
    let best = Number(minuteOptions[0]?.value ?? 0);
    let minDiff = Math.abs(activeValue.minute - best);
    for (const opt of minuteOptions) {
      const m = Number(opt.value);
      const diff = Math.abs(activeValue.minute - m);
      if (diff < minDiff) {
        best = m;
        minDiff = diff;
      }
    }
    return best;
  }, [activeValue.minute, minuteOptions]);

  const columns = useMemo<TPWheelPickerColumn[]>(() => {
    const hourOptions = use12Hour
      ? Array.from({ length: 12 }, (_, idx) => {
          const h = idx + 1;
          return { value: String(h), label: String(h).padStart(2, '0') };
        })
      : Array.from({ length: 24 }, (_, h) => ({
          value: String(h),
          label: String(h).padStart(2, '0'),
        }));

    const cols: TPWheelPickerColumn[] = [
      { key: 'hour', options: hourOptions, value: String(activeValue.hour) },
      { key: 'minute', options: minuteOptions, value: String(closestMinute) },
    ];

    if (use12Hour) {
      cols.push({
        key: 'period',
        options: [
          { value: 'AM', label: 'AM' },
          { value: 'PM', label: 'PM' },
        ],
        value: activeValue.period ?? 'AM',
      });
    }

    return cols;
  }, [use12Hour, activeValue.hour, activeValue.period, minuteOptions, closestMinute]);

  const handleColumnChange = (key: string, nextVal: string) => {
    const next: TimeValue = {
      hour: activeValue.hour,
      minute: closestMinute,
      ...(use12Hour ? { period: activeValue.period ?? 'AM' } : {}),
    };

    if (key === 'hour') next.hour = Number(nextVal);
    else if (key === 'minute') next.minute = Number(nextVal);
    else if (key === 'period' && (nextVal === 'AM' || nextVal === 'PM')) next.period = nextVal;

    if (!isControlled) {
      setInternalValue(next);
    }
    onChange?.(next);
  };

  return (
    <div className={`tp-time-picker ${className}`.trim()} style={style}>
      <TPWheelPicker columns={columns} onChange={handleColumnChange} />
    </div>
  );
};
