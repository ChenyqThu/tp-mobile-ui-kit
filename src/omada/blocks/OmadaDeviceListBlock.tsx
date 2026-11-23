import React from 'react';
import type { TPTabBarItem } from '../../core/types';
import { TPListCard } from '../../core/components/TPListCard';
import { TPListItem } from '../../core/components/TPListItem';
import { TPEmptyState } from '../../core/components/TPEmptyState';
import { TPSectionHeader } from '../../core/components/TPSectionHeader';
import { TPIcon } from '../../assets-lib';
import '../../styles/tp-omada.css';

export type OmadaSiteTabKey = 'dashboard' | 'insights' | 'devices' | 'clients' | 'settings';

export const OMADA_SITE_TABS: readonly TPTabBarItem[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: 'tabbar-dashboard-off',
    activeIcon: 'tabbar-dashboard-on',
  },
  {
    key: 'insights',
    label: 'Insights',
    icon: 'tabbar-statistics-off',
    activeIcon: 'tabbar-statistics-on',
  },
  {
    key: 'devices',
    label: 'Devices',
    icon: 'tabbar-device-off',
    activeIcon: 'tabbar-device-on',
  },
  {
    key: 'clients',
    label: 'Clients',
    icon: 'tabbar-client-off',
    activeIcon: 'tabbar-client-on',
  },
  {
    key: 'settings',
    label: 'Settings',
    icon: 'tabbar-settings-off',
    activeIcon: 'tabbar-settings-on',
  },
];

export type OmadaDeviceType = 'gateway' | 'switch' | 'ap';
export type OmadaDeviceStatus = 'connected' | 'disconnected' | 'pending';

export interface OmadaDeviceRecord {
  id: string;
  mac: string;
  name?: string;
  model: string;
  type: OmadaDeviceType;
  status: OmadaDeviceStatus;
  ip: string;
  healthLabel: string;
  healthTone?: 'good' | 'warn' | 'alert';
  upgradeAvailable?: boolean;
  firmwareVersion?: string;
  targetVersion?: string;
  uptime?: string;
  cpuPct?: number;
  memoryPct?: number;
}

export const DEFAULT_OMADA_DEVICES: readonly OmadaDeviceRecord[] = [
  {
    id: 'dev-gw-1',
    mac: '8C-86-DD-A6-A7-5F',
    name: '8C-86-DD-A6-A7-5F',
    model: 'ER7212PC',
    type: 'gateway',
    status: 'connected',
    ip: '192.168.0.1',
    healthLabel: 'Good-10',
    healthTone: 'good',
    upgradeAvailable: false,
    firmwareVersion: 'v6.3.0.63',
    uptime: '18d 04h 22m',
    cpuPct: 3,
    memoryPct: 31,
  },
  {
    id: 'dev-ap-1',
    mac: '3C-78-95-F0-45-F1',
    name: '3C-78-95-F0-45-F1',
    model: 'EAP723',
    type: 'ap',
    status: 'connected',
    ip: '192.168.0.2',
    healthLabel: 'Good-10',
    healthTone: 'good',
    upgradeAvailable: true,
    firmwareVersion: 'v1.2.0',
    targetVersion: 'v1.3.2',
    uptime: '14d 11h 09m',
    cpuPct: 6,
    memoryPct: 42,
  },
  {
    id: 'dev-ap-2',
    mac: '3C-78-95-F0-46-0C',
    name: '3C-78-95-F0-46-0C',
    model: 'EAP723',
    type: 'ap',
    status: 'connected',
    ip: '192.168.0.3',
    healthLabel: 'Good-10',
    healthTone: 'good',
    upgradeAvailable: true,
    firmwareVersion: 'v1.2.0',
    targetVersion: 'v1.3.2',
    uptime: '14d 11h 04m',
    cpuPct: 5,
    memoryPct: 39,
  },
];

export const OmadaDeviceThumb: React.FC<{ type: OmadaDeviceType; size?: number }> = ({
  type,
  size = 38,
}) => {
  if (type === 'ap') {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: size,
          height: size,
          color: '#EBEBF0',
        }}
      >
        <TPIcon name="client-ap" size={size} color="#EBEBF0" />
      </span>
    );
  }
  return <TPIcon name="client-switch" size={size} />;
};

export interface OmadaDeviceListBlockProps {
  devices?: readonly OmadaDeviceRecord[];
  grouped?: boolean;
  onSelectDevice?: (device: OmadaDeviceRecord) => void;
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
  style?: React.CSSProperties;
}

const STATUS_LABEL_MAP: Record<OmadaDeviceStatus, string> = {
  connected: 'Connected',
  disconnected: 'Disconnected',
  pending: 'Pending',
};

const GROUP_TITLE_MAP: Record<OmadaDeviceType, string> = {
  gateway: 'Gateway',
  switch: 'Switches',
  ap: 'Access Points',
};

/**
 * Reusable Omada v5.3+ Device List block matching real-device `SiteDevices.png` row geometry.
 */
export const OmadaDeviceListBlock: React.FC<OmadaDeviceListBlockProps> = ({
  devices = DEFAULT_OMADA_DEVICES,
  grouped = false,
  onSelectDevice,
  emptyTitle = 'No Devices Found',
  emptyDescription = 'Try adjusting your search query or status filter.',
  className = '',
  style,
}) => {
  if (devices.length === 0) {
    return (
      <TPEmptyState
        illustration="no-devices"
        title={emptyTitle}
        description={emptyDescription}
        compact
        className={className}
        style={style}
      />
    );
  }

  const renderDeviceRow = (device: OmadaDeviceRecord) => {
    const statusClass =
      device.status === 'connected'
        ? 'tp-omada-status-line--good'
        : device.status === 'pending'
          ? 'tp-omada-status-line--warn'
          : 'tp-omada-status-line--alert';

    const dotClass =
      device.healthTone === 'alert'
        ? 'tp-omada-dot--alert'
        : device.healthTone === 'warn'
          ? 'tp-omada-dot--warn'
          : '';

    return (
      <TPListItem
        key={device.id}
        leading={<OmadaDeviceThumb type={device.type} size={38} />}
        title={
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span>{device.mac}</span>
            {device.upgradeAvailable && (
              <span
                className="tp-omada-upgrade-badge"
                title="Firmware upgrade available"
                aria-label="Firmware upgrade available"
              >
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path
                    d="M6 9.5V2.5M6 2.5L2.75 5.75M6 2.5L9.25 5.75"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            )}
          </span>
        }
        subtitle={device.model}
        trailing={
          <div className="tp-omada-row-metrics">
            <span className={`tp-omada-status-line ${statusClass}`}>
              {STATUS_LABEL_MAP[device.status]}
            </span>
            <span>{device.ip}</span>
            <span className="tp-omada-health-dot-row">
              <span className={`tp-omada-dot ${dotClass}`.trim()} aria-hidden="true" />
              <span>{device.healthLabel}</span>
            </span>
          </div>
        }
        onClick={onSelectDevice ? () => onSelectDevice(device) : undefined}
      />
    );
  };

  if (!grouped) {
    return (
      <TPListCard divided className={className} style={style}>
        {devices.map(renderDeviceRow)}
      </TPListCard>
    );
  }

  const order: OmadaDeviceType[] = ['gateway', 'switch', 'ap'];
  return (
    <div className={className} style={{ display: 'flex', flexDirection: 'column', gap: 12, ...style }}>
      {order.map((type) => {
        const subset = devices.filter((d) => d.type === type);
        if (subset.length === 0) return null;
        return (
          <div key={type}>
            <TPSectionHeader title={GROUP_TITLE_MAP[type]} count={subset.length} />
            <TPListCard divided>{subset.map(renderDeviceRow)}</TPListCard>
          </div>
        );
      })}
    </div>
  );
};
