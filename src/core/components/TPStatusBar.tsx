import React from 'react';
import { useTPTheme } from '../../theme';
import type { TPStatusBarProps } from '../types';
import '../../styles/tp-core-nav-controls.css';

const BAR_HEIGHTS = [4, 6, 8, 10] as const;

export const TPStatusBar: React.FC<TPStatusBarProps> = ({
  time = '10:51',
  os,
  carrier,
  signalStrength = 4,
  wifiStrength = 3,
  battery = 100,
  muted = false,
  locationActive = false,
  transparent = false,
  className = '',
  style,
}) => {
  const theme = useTPTheme();
  const resolvedOS = os ?? theme.os;
  const clampedBattery = Math.max(0, Math.min(100, Math.round(battery)));
  const isLowBattery = clampedBattery <= 20;
  const batteryFillWidth = (clampedBattery / 100) * 18;

  const rootClass = [
    'tp-statusbar',
    `tp-statusbar--${resolvedOS}`,
    transparent ? 'tp-statusbar--transparent' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={rootClass}
      data-os={resolvedOS}
      data-signal={signalStrength}
      data-wifi={wifiStrength}
      data-battery={clampedBattery}
      style={style}
    >
      <div className="tp-statusbar-left">
        <span className="tp-statusbar-time">{time}</span>
        {carrier && <span className="tp-statusbar-carrier">{carrier}</span>}
        {locationActive && (
          <span className="tp-statusbar-meta-icon" aria-label="Location active">
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path
                d="M10.8 1.2L1.3 5.2L5.5 6.5L6.8 10.7L10.8 1.2Z"
                fill="currentColor"
              />
            </svg>
          </span>
        )}
        {muted && (
          <span className="tp-statusbar-meta-icon" aria-label="Muted">
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path
                d="M9.6 8.3V5.8C9.6 4.2 8.5 3 7 3C6.4 3 5.9 3.2 5.5 3.5M4.4 5.8V8.3L3.2 9.8H10.1M6 11.1C6.2 11.6 6.6 11.8 7 11.8C7.4 11.8 7.8 11.6 8 11.1M2.2 2.2L11.8 11.8"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        )}
      </div>

      <div className="tp-statusbar-right">
        <span
          className="tp-statusbar-signal"
          aria-label={`Cellular signal ${signalStrength} of 4`}
        >
          <svg width="18" height="12" viewBox="0 0 18 12" fill="none" aria-hidden="true">
            {BAR_HEIGHTS.map((height, idx) => {
              const barIndex = idx + 1;
              const active = barIndex <= signalStrength;
              const x = idx * 4.5;
              const upperH = resolvedOS === 'ios' ? Math.max(2, height - 2) : height;
              const upperY = resolvedOS === 'ios' ? 9 - upperH : 11 - upperH;
              return (
                <g key={barIndex} opacity={active ? 1 : 0.28}>
                  <rect x={x} y={upperY} width="3" height={upperH} rx="1" fill="currentColor" />
                  {resolvedOS === 'ios' && (
                    <rect x={x} y="10" width="3" height="1.6" rx="0.8" fill="currentColor" />
                  )}
                </g>
              );
            })}
          </svg>
        </span>

        <span
          className="tp-statusbar-wifi"
          aria-label={`Wi-Fi signal ${wifiStrength} of 3`}
        >
          <svg width="16" height="12" viewBox="0 0 16 12" fill="none" aria-hidden="true">
            <path
              d="M1.4 3.8C5.1 0.6 10.9 0.6 14.6 3.8"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity={wifiStrength >= 3 ? 1 : 0.28}
            />
            <path
              d="M3.7 6.3C6.1 4.2 9.9 4.2 12.3 6.3"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity={wifiStrength >= 2 ? 1 : 0.28}
            />
            <path
              d="M6.1 8.8C7.2 7.8 8.8 7.8 9.9 8.8"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity={wifiStrength >= 1 ? 1 : 0.28}
            />
            <circle cx="8" cy="10.7" r="1.1" fill="currentColor" />
          </svg>
        </span>

        <span className="tp-statusbar-battery" aria-label={`Battery ${clampedBattery}%`}>
          {resolvedOS === 'android' && (
            <span className="tp-statusbar-battery-text">{clampedBattery}%</span>
          )}
          <svg width="26" height="12" viewBox="0 0 26 12" fill="none" aria-hidden="true">
            <rect
              x="0.75"
              y="0.75"
              width="21.5"
              height="10.5"
              rx="2.8"
              stroke="currentColor"
              strokeOpacity="0.45"
              strokeWidth="1.2"
            />
            <rect
              x="2.2"
              y="2.2"
              width={Math.max(0, batteryFillWidth)}
              height="7.6"
              rx="1.6"
              fill={isLowBattery ? 'var(--tp-color-alert, #EE385C)' : 'currentColor'}
            />
            <path
              d="M23.5 4.2V7.8C24.3 7.5 24.8 6.8 24.8 6C24.8 5.2 24.3 4.5 23.5 4.2Z"
              fill="currentColor"
              fillOpacity="0.5"
            />
          </svg>
        </span>
      </div>
    </div>
  );
};
