import React from 'react';
import type { TPProgressProps } from '../types';
import '../../styles/tp-core-extended.css';

/**
 * Linear bar and circular SVG progress indicator driven by semantic `--tp-*` colors.
 */
export const TPProgress: React.FC<TPProgressProps> = ({
  variant = 'linear',
  percent,
  tone = 'focus',
  size = 64,
  strokeWidth = 6,
  showValue = true,
  label,
  className = '',
  style,
}) => {
  const clamped = Math.max(0, Math.min(100, Math.round(percent)));

  if (variant === 'circular') {
    const radius = Math.max(8, (size - strokeWidth) / 2);
    const circumference = 2 * Math.PI * radius;
    const dashOffset = circumference * (1 - clamped / 100);
    return (
      <div
        className={`tp-progress tp-progress--circular tp-progress--tone-${tone} ${className}`.trim()}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        style={style}
      >
        <div className="tp-progress-ring-wrap" style={{ width: size, height: size }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="var(--tp-divider)"
              strokeWidth={strokeWidth}
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              className="tp-progress-ring-stroke"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          </svg>
          {showValue && <span className="tp-progress-ring-val">{clamped}%</span>}
        </div>
        {label !== undefined && <div className="tp-progress-label">{label}</div>}
      </div>
    );
  }

  return (
    <div
      className={`tp-progress tp-progress--linear tp-progress--tone-${tone} ${className}`.trim()}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      style={style}
    >
      {(label !== undefined || showValue) && (
        <div className="tp-progress-head">
          <span className="tp-progress-label">{label}</span>
          {showValue && <span className="tp-progress-pct">{clamped}%</span>}
        </div>
      )}
      <div className="tp-progress-track">
        <div className="tp-progress-fill" style={{ width: `${clamped}%` }} />
      </div>
    </div>
  );
};
