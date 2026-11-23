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

  const percent = toPercent(currentValue, min, max);

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

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    commitValue(Number(event.target.value), false);
  };

  const handleInteractionEnd = () => {
    if (disabled) return;
    onAfterChange?.(latestValueRef.current);
  };

  const hasLabels = Boolean(marks?.some((mark) => mark.label !== undefined));

  const rootClass = ['tp-slider', disabled ? 'tp-slider--disabled' : '', className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootClass} style={style}>
      {showValue && (
        <div className="tp-slider-header">
          <span className="tp-slider-value">
            {currentValue}
            {unit}
          </span>
        </div>
      )}

      <div className="tp-slider-control">
        <div className="tp-slider-track" aria-hidden="true">
          <div className="tp-slider-fill" style={{ width: `${percent}%` }} />
          {marks && marks.length > 0 && (
            <div className="tp-slider-ticks">
              {marks.map((mark) => {
                const markPct = toPercent(mark.value, min, max);
                const isMarkActive = mark.value <= currentValue;
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
      </div>

      {hasLabels && marks && (
        <div className="tp-slider-marks">
          {marks.map((mark) => {
            if (mark.label === undefined) return null;
            const markPct = toPercent(mark.value, min, max);
            const isSelected = mark.value === currentValue;
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
                    if (!disabled) commitValue(mark.value, true);
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
