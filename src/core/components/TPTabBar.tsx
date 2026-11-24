import React, { useRef } from 'react';
import { hasTPIcon, TPIcon } from '../../assets-lib';
import type { TPTabBarItem, TPTabBarProps } from '../types';
import { TPLiquidGlassBackdrop } from './TPLiquidGlassBackdrop';
import '../../styles/tp-core-nav-controls.css';

function renderTabIcon(item: TPTabBarItem, isActive: boolean): React.ReactNode {
  const iconSource = isActive && item.activeIcon !== undefined ? item.activeIcon : item.icon;
  if (typeof iconSource === 'string') {
    if (hasTPIcon(iconSource)) {
      return <TPIcon name={iconSource} size={22} />;
    }
    return (
      <span className="tp-tabbar-icon-fallback" aria-hidden="true">
        {iconSource}
      </span>
    );
  }
  return iconSource;
}

function renderTabBadge(badge: TPTabBarItem['badge']): React.ReactNode {
  if (badge === undefined || badge === null || badge === false) {
    return null;
  }
  if (badge === true) {
    return <span className="tp-tabbar-badge tp-tabbar-badge--dot" aria-label="Notification" />;
  }
  if (typeof badge === 'number') {
    if (badge <= 0) return null;
    const display = badge > 99 ? '99+' : String(badge);
    return <span className="tp-tabbar-badge">{display}</span>;
  }
  if (badge === '') return null;
  return <span className="tp-tabbar-badge">{badge}</span>;
}

export const TPTabBar: React.FC<TPTabBarProps> = ({
  items,
  activeKey,
  onChange,
  variant = 'floating-pill',
  extraAction,
  className = '',
  style,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const hasExtra = extraAction !== undefined && extraAction !== null && variant === 'floating-pill';
  const activeIndex = items.findIndex((item) => item.key === activeKey);
  const rootClass = [
    'tp-tabbar',
    `tp-tabbar--${variant}`,
    hasExtra ? 'tp-tabbar--has-extra' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const lensStyle: React.CSSProperties | undefined =
    variant === 'floating-pill' && activeIndex >= 0 && items.length > 0
      ? {
          width: `calc((100% - 8px - ${(items.length - 1) * 4}px) / ${items.length})`,
          transform: `translateX(calc(${activeIndex} * (100% + 4px)))`,
        }
      : undefined;

  return (
    <nav
      className={rootClass}
      data-variant={variant}
      aria-label="Bottom Navigation"
      style={style}
    >
      <div ref={trackRef} className="tp-tabbar-track" role="tablist">
        {variant === 'floating-pill' && (
          <TPLiquidGlassBackdrop
            hostRef={trackRef}
            shape="pill"
            tint="clear"
            bezelWidth={16}
            refraction={1.35}
            dispersion={1.15}
            blur={2.2}
          />
        )}
        {lensStyle && (
          <span
            className="tp-tabbar-active-lens"
            aria-hidden="true"
            data-active-index={activeIndex}
            style={lensStyle}
          />
        )}
        {items.map((item) => {
          const isActive = item.key === activeKey;
          return (
            <button
              key={item.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`tp-tabbar-item ${isActive ? 'tp-tabbar-item--active' : ''}`.trim()}
              onClick={() => onChange(item.key)}
            >
              <span className="tp-tabbar-icon-wrap">
                <span className="tp-tabbar-icon">{renderTabIcon(item, isActive)}</span>
                {renderTabBadge(item.badge)}
              </span>
              <span className="tp-tabbar-label">{item.label}</span>
            </button>
          );
        })}
      </div>

      {hasExtra && <div className="tp-tabbar-extra">{extraAction}</div>}
    </nav>
  );
};
