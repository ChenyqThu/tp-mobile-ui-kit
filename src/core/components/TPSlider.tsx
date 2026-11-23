import React, { useRef, useState } from 'react';
import type { TPSliderProps } from '../types';
import '../../styles/tp-core-nav-controls.css';

function clampValue(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function toPercent(value: number, min: number, max: number): number {
  if (max <= min) return 0;
  return ((clampValue(value, min, max) - min) / (max - min)) * 100;
}

function normalizeRange(
  raw: readonly [number, number] | undefined,
  min: number,
  max: number,
): [number, number] {
  const a = clampValue(raw?.[0] ?? min, min, max);
  const b = clampValue(raw?.[1] ?? max, min, max);
  return a <= b ? [a, b] : [b, a];
}

export const TPSlider: React.FC<TPSliderProps> = ({
  value,
  defaultValue,
  min = 0,
  max = 100,
  step = 1,
  marks,
  showValue = false,
  unit = '',
  disabled = false,
  range = false,
  rangeValue,
  defaultRangeValue,
  onRangeChange,
  onRangeAfterChange,
  onChange,
  onAfterChange,
  ariaLabel,
  className = '',
  style,
}) => {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<number>(() =>
    clampValue(defaultValue ?? min, min, max),
  );
  const currentValue = clampValue(isControlled ? value : internalValue, min, max);
  const latestValueRef = useRef<number>(currentValue);
  latestValueRef.current = currentValue;

  const isRangeControlled = rangeValue !== undefined;
  const [internalRange, setInternalRange] = useState<[number, number]>(() =>
    normalizeRange(
      defaultRangeValue ?? [min, Math.round(min + (max - min) * 0.6)],
      min,
      max,
    ),
  );
  const currentRange: [number, number] = normalizeRange(
    isRangeControlled ? rangeValue : internalRange,
    min,
    max,
  );
  const latestRangeRef = useRef<[number, number]>(currentRange);
  latestRangeRef.current = currentRange;

  const percent = toPercent(currentValue, min, max);
  const lowPct = toPercent(currentRange[0], min, max);
  const highPct = toPercent(currentRange[1], min, max);

  const commitValue = (nextRaw: number, fireAfterChange = false) => {
    const next = clampValue(nextRaw, min, max);
    latestValueRef.current = next;
    if (!isControlled) {
      setInternalValue(next);
    }
    onChange?.(next);
    if (fireAfterChange) {
      onAfterChange?.(next);
    }
  };

  const commitRange = (nextRaw: [number, number], fireAfterChange = false) => {
    const normalized = normalizeRange(nextRaw, min, max);
    latestRangeRef.current = normalized;
    if (!isRangeControlled) {
      setInternalRange(normalized);
    }
    onRangeChange?.(normalized);
    if (fireAfterChange) {
      onRangeAfterChange?.(normalized);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    commitValue(Number(event.target.value), false);
  };

  const handleInteractionEnd = () => {
    if (disabled) return;
    if (range) {
      onRangeAfterChange?.(latestRangeRef.current);
    } else {
      onAfterChange?.(latestValueRef.current);
    }
  };

  const hasLabels = Boolean(marks?.some((mark) => mark.label !== undefined));

  const rootClass = [
    'tp-slider',
    range ? 'tp-slider--range' : '',
    disabled ? 'tp-slider--disabled' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootClass} style={style}>
      {showValue && (
        <div className="tp-slider-header">
          <span className="tp-slider-value">
            {range
              ? `${currentRange[0]}${unit} – ${currentRange[1]}${unit}`
              : `${currentValue}${unit}`}
          </span>
        </div>
      )}

      <div className="tp-slider-control">
        <div className="tp-slider-track" aria-hidden="true">
          <div
            className="tp-slider-fill"
            style={
              range
                ? { left: `${lowPct}%`, width: `${Math.max(0, highPct - lowPct)}%` }
                : { left: 0, width: `${percent}%` }
            }
          />
          {marks && marks.length > 0 && (
            <div className="tp-slider-ticks">
              {marks.map((mark) => {
                const markPct = toPercent(mark.value, min, max);
                const isMarkActive = range
                  ? mark.value >= currentRange[0] && mark.value <= currentRange[1]
                  : mark.value <= currentValue;
                return (
                  <span
                    key={mark.value}
                    className={`tp-slider-tick ${isMarkActive ? 'tp-slider-tick--active' : ''}`.trim()}
                    style={{ left: `${markPct}%` }}
                  />
                );
              })}
            </div>
          )}
        </div>

        {range ? (
          <>
            <div
              className="tp-slider-thumb"
              style={{ left: `${lowPct}%` }}
              aria-hidden="true"
            />
            <div
              className="tp-slider-thumb tp-slider-thumb--secondary"
              style={{ left: `${highPct}%` }}
              aria-hidden="true"
            />
            <input
              type="range"
              className="tp-slider-input tp-slider-input--range"
              min={min}
              max={max}
              step={step}
              value={currentRange[0]}
              disabled={disabled}
              aria-label={ariaLabel ? `${ariaLabel} minimum` : 'Minimum value'}
              onChange={(e) => {
                if (disabled) return;
                const nextMin = Math.min(Number(e.target.value), currentRange[1]);
                commitRange([nextMin, currentRange[1]], false);
              }}
              onPointerUp={handleInteractionEnd}
              onMouseUp={handleInteractionEnd}
              onTouchEnd={handleInteractionEnd}
              onKeyUp={handleInteractionEnd}
            />
            <input
              type="range"
              className="tp-slider-input tp-slider-input--range tp-slider-input--secondary"
              min={min}
              max={max}
              step={step}
              value={currentRange[1]}
              disabled={disabled}
              aria-label={ariaLabel ? `${ariaLabel} maximum` : 'Maximum value'}
              onChange={(e) => {
                if (disabled) return;
                const nextMax = Math.max(Number(e.target.value), currentRange[0]);
                commitRange([currentRange[0], nextMax], false);
              }}
              onPointerUp={handleInteractionEnd}
              onMouseUp={handleInteractionEnd}
              onTouchEnd={handleInteractionEnd}
              onKeyUp={handleInteractionEnd}
            />
          </>
        ) : (
          <>
            <div
              className="tp-slider-thumb"
              style={{ left: `${percent}%` }}
              aria-hidden="true"
            />
            <input
              type="range"
              className="tp-slider-input"
              min={min}
              max={max}
              step={step}
              value={currentValue}
              disabled={disabled}
              aria-label={ariaLabel}
              onChange={handleInputChange}
              onPointerUp={handleInteractionEnd}
              onMouseUp={handleInteractionEnd}
              onTouchEnd={handleInteractionEnd}
              onKeyUp={handleInteractionEnd}
            />
          </>
        )}
      </div>

      {hasLabels && marks && (
        <div className="tp-slider-marks">
          {marks.map((mark) => {
            if (mark.label === undefined) return null;
            const markPct = toPercent(mark.value, min, max);
            const isSelected = range
              ? mark.value === currentRange[0] || mark.value === currentRange[1]
              : mark.value === currentValue;
            const edgeClass =
              markPct <= 2
                ? 'tp-slider-mark--start'
                : markPct >= 98
                  ? 'tp-slider-mark--end'
                  : '';

            return (
              <div
                key={mark.value}
                className={[
                  'tp-slider-mark',
                  edgeClass,
                  isSelected ? 'tp-slider-mark--active' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                style={{ left: `${markPct}%` }}
              >
                <button
                  type="button"
                  className="tp-slider-mark-btn"
                  disabled={disabled}
                  onClick={() => {
                    if (disabled) return;
                    if (range) {
                      const dLow = Math.abs(mark.value - currentRange[0]);
                      const dHigh = Math.abs(mark.value - currentRange[1]);
                      if (dLow <= dHigh) {
                        commitRange([mark.value, currentRange[1]], true);
                      } else {
                        commitRange([currentRange[0], mark.value], true);
                      }
                    } else {
                      commitValue(mark.value, true);
                    }
                  }}
                >
                  {mark.label}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
