import React, { useEffect } from 'react';
import { TPTag } from '../../core/components/TPTag';
import { TPIcon, type TPIconName } from '../../assets-lib';
import '../../styles/tp-omada.css';

export interface OmadaSidebarNavItem {
  key: string;
  label: React.ReactNode;
  icon?: TPIconName;
  badge?: number | string;
}

export interface OmadaSidebarDrawerProps {
  open: boolean;
  onClose: () => void;
  controllerName?: string;
  siteName?: string;
  userRole?: string;
  activeKey?: string;
  items?: readonly OmadaSidebarNavItem[];
  footerItems?: readonly OmadaSidebarNavItem[];
  onSelectItem?: (key: string) => void;
  onSwitchSite?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

const DEFAULT_SIDEBAR_ITEMS: readonly OmadaSidebarNavItem[] = [
  { key: 'sites', label: 'Switch Site', icon: 'cloud-standard' },
  { key: 'lan-settings', label: 'Wired LAN / VLAN', icon: 'port-list' },
  { key: 'port-detail', label: 'Port Inspector', icon: 'topology' },
  { key: 'voucher-preview', label: 'Hotspot Vouchers', icon: 'keys' },
];

const DEFAULT_FOOTER_ITEMS: readonly OmadaSidebarNavItem[] = [
  { key: 'accessibility', label: 'Accessibility & Display', icon: 'bulb' },
  { key: 'privacy', label: 'Privacy & Telemetry', icon: 'nav-info' },
];

/**
 * Slide-over controller navigation drawer triggered from the top bar menu/avatar button.
 */
export const OmadaSidebarDrawer: React.FC<OmadaSidebarDrawerProps> = ({
  open,
  onClose,
  controllerName = 'Omada Cloud Controller',
  siteName = 'HQ Campus — Bldg 2',
  userRole = 'Main Administrator',
  activeKey,
  items = DEFAULT_SIDEBAR_ITEMS,
  footerItems = DEFAULT_FOOTER_ITEMS,
  onSelectItem,
  onSwitchSite,
  className = '',
  style,
}) => {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="tp-omada-drawer-overlay"
      data-testid="omada-sidebar-drawer"
      onClick={onClose}
    >
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Omada Navigation Drawer"
        className={`tp-omada-drawer ${className}`.trim()}
        style={style}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="tp-omada-drawer-head">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="tp-omada-drawer-avatar" aria-hidden="true">
              <TPIcon name="client-controller" size={28} />
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="tp-omada-drawer-title">{controllerName}</div>
              <div className="tp-omada-drawer-sub">{userRole}</div>
            </div>
          </div>

          <button
            type="button"
            className="tp-omada-drawer-site-pill"
            onClick={() => {
              onSwitchSite?.();
              onClose();
            }}
          >
            <TPIcon name="cloud-standard" size={16} />
            <span style={{ flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {siteName}
            </span>
            <TPTag size="xs" tone="focus">Active</TPTag>
          </button>
        </div>

        <nav className="tp-omada-drawer-nav" aria-label="Workspace Tools">
          {items.map((item) => {
            const isActive = item.key === activeKey;
            return (
              <button
                key={item.key}
                type="button"
                className={`tp-omada-drawer-item ${isActive ? 'tp-omada-drawer-item--active' : ''}`.trim()}
                onClick={() => {
                  onSelectItem?.(item.key);
                  onClose();
                }}
              >
                {item.icon && <TPIcon name={item.icon} size={20} />}
                <span className="tp-omada-drawer-item-label">{item.label}</span>
                {item.badge !== undefined && (
                  <TPTag size="xs" tone="alert">{item.badge}</TPTag>
                )}
              </button>
            );
          })}
        </nav>

        {footerItems.length > 0 && (
          <div className="tp-omada-drawer-footer">
            {footerItems.map((item) => (
              <button
                key={item.key}
                type="button"
                className={`tp-omada-drawer-item ${item.key === activeKey ? 'tp-omada-drawer-item--active' : ''}`.trim()}
                onClick={() => {
                  onSelectItem?.(item.key);
                  onClose();
                }}
              >
                {item.icon && <TPIcon name={item.icon} size={18} />}
                <span className="tp-omada-drawer-item-label">{item.label}</span>
              </button>
            ))}
          </div>
        )}
      </aside>
    </div>
  );
};
