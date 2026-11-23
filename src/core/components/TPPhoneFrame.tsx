import React from 'react';
import { useTPTheme, type TPScreenSize } from '../../theme';
import type { TPPhoneFrameProps } from '../types';
import '../../styles/tp-core-nav-controls.css';

interface DevicePreset {
  width: number;
  height: number;
  isIOS: boolean;
}

const DEVICE_PRESETS: Record<NonNullable<TPPhoneFrameProps['device']>, DevicePreset> = {
  iphone16pro: { width: 393, height: 852, isIOS: true },
  iphone14: { width: 375, height: 812, isIOS: true },
  android: { width: 360, height: 800, isIOS: false },
  compact: { width: 360, height: 720, isIOS: false },
};

function resolveDevice(
  device: TPPhoneFrameProps['device'],
  screenSize: TPScreenSize,
): NonNullable<TPPhoneFrameProps['device']> {
  if (device) return device;
  return screenSize === 'base' ? 'iphone14' : 'iphone16pro';
}

export const TPPhoneFrame: React.FC<TPPhoneFrameProps> = ({
  device,
  width,
  height,
  screenSize,
  showFrame = true,
  showDynamicIsland,
  showHomeIndicator,
  statusBar,
  bottomBar,
  floatingAction,
  className = '',
  style,
  children,
}) => {
  const theme = useTPTheme();
  const resolvedScreenSize = screenSize ?? theme.screenSize;
  const resolvedDevice = resolveDevice(device, resolvedScreenSize);
  const preset = DEVICE_PRESETS[resolvedDevice];
  const resolvedWidth = width ?? preset.width;
  const resolvedHeight = height ?? preset.height;

  const displayDynamicIsland = showDynamicIsland ?? (showFrame && preset.isIOS);
  const displayHomeIndicator = showHomeIndicator ?? showFrame;

  const frameClass = [
    'tp-phone-frame',
    `tp-phone-frame--${resolvedDevice}`,
    showFrame ? 'tp-phone-frame--framed' : 'tp-phone-frame--frameless',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={frameClass}
      data-device={resolvedDevice}
      data-show-frame={String(showFrame)}
      data-tp-screen={resolvedScreenSize}
      data-width={resolvedWidth}
      data-height={resolvedHeight}
      style={{
        ...(!showFrame ? { width: `${resolvedWidth}px`, height: `${resolvedHeight}px` } : undefined),
        ...style,
      }}
    >
      <div
        className="tp-phone-screen"
        style={{ width: `${resolvedWidth}px`, height: `${resolvedHeight}px` }}
      >
        {displayDynamicIsland && (
          <div
            className="tp-phone-dynamic-island"
            data-testid="tp-phone-dynamic-island"
            aria-hidden="true"
          >
            <span className="tp-phone-dynamic-island-lens" />
          </div>
        )}

        {statusBar !== undefined && statusBar !== null && (
          <div className="tp-phone-statusbar">{statusBar}</div>
        )}

        <div className="tp-phone-stage">
          <div className="tp-phone-body">{children}</div>
          {floatingAction !== undefined && floatingAction !== null && (
            <div className="tp-phone-floating-action">{floatingAction}</div>
          )}
        </div>

        {(bottomBar !== undefined && bottomBar !== null) || displayHomeIndicator ? (
          <div className="tp-phone-bottom">
            {bottomBar !== undefined && bottomBar !== null && (
              <div className="tp-phone-bottombar">{bottomBar}</div>
            )}
            {displayHomeIndicator && (
              <div
                className="tp-phone-home-indicator"
                data-testid="tp-phone-home-indicator"
                aria-hidden="true"
              >
                <span className="tp-phone-home-indicator-pill" />
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};
