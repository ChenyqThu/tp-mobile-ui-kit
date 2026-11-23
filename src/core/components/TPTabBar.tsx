import React from 'react';
import { hasTPIcon, TPIcon } from '../../assets-lib';
import type { TPTabBarItem, TPTabBarProps } from '../types';
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
  className = '',
  style,
}) => {
  const rootClass = ['tp-tabbar', `tp-tabbar--${variant}`, className]
    .filter(Boolean)
    .join(' ');

  return (
    <nav
      className={rootClass}
      data-variant={variant}
      aria-label="Bottom Navigation"
      style={style}
    >
      <div className="tp-tabbar-track" role="tablist">
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
    </nav>
  );
};
