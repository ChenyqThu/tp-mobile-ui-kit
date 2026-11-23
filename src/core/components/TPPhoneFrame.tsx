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
  overlayTop,
  overlayBottom,
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

  const hasStatusBar = statusBar !== undefined && statusBar !== null;
  const hasBottomBar = bottomBar !== undefined && bottomBar !== null;
  const isDockedTabBar =
    React.isValidElement(bottomBar) &&
    (bottomBar.props as { variant?: string } | null)?.variant === 'docked';

  const isOverlayTop = Boolean(overlayTop && hasStatusBar);
  const isOverlayBottom =
    overlayBottom !== undefined ? overlayBottom : Boolean(hasBottomBar && !isDockedTabBar);

  const topInsetPx = isOverlayTop ? (preset.isIOS ? '54px' : '36px') : '0px';

  const frameClass = [
    'tp-phone-frame',
    `tp-phone-frame--${resolvedDevice}`,
    showFrame ? 'tp-phone-frame--framed' : 'tp-phone-frame--frameless',
    isOverlayTop ? 'tp-phone-frame--overlay-top' : '',
    isOverlayBottom ? 'tp-phone-frame--overlay-bottom' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={frameClass}
      data-device={resolvedDevice}
      data-show-frame={String(showFrame)}
      data-overlay-top={String(isOverlayTop)}
      data-overlay-bottom={String(isOverlayBottom)}
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
        style={
          {
            width: `${resolvedWidth}px`,
            height: `${resolvedHeight}px`,
            '--tp-phone-top-inset': topInsetPx,
          } as React.CSSProperties
        }
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

        {hasStatusBar && (
          <div
            className={`tp-phone-statusbar ${isOverlayTop ? 'tp-phone-statusbar--overlay' : ''}`.trim()}
          >
            {statusBar}
          </div>
        )}

        <div className="tp-phone-stage">
          <div className="tp-phone-body">{children}</div>
          {floatingAction !== undefined && floatingAction !== null && (
            <div
              className={`tp-phone-floating-action ${
                isOverlayBottom ? 'tp-phone-floating-action--above-overlay' : ''
              }`.trim()}
            >
              {floatingAction}
            </div>
          )}
        </div>

        {hasBottomBar || displayHomeIndicator ? (
          <div
            className={`tp-phone-bottom ${isOverlayBottom ? 'tp-phone-bottom--overlay' : ''}`.trim()}
          >
            {hasBottomBar && <div className="tp-phone-bottombar">{bottomBar}</div>}
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
