import React, { useState } from 'react';
import type { TPTabBarItem } from '../../core/types';
import { TPBottomSheet } from '../../core/components/TPBottomSheet';
import { TPButton } from '../../core/components/TPButton';
import { TPListCard } from '../../core/components/TPListCard';
import { TPListItem } from '../../core/components/TPListItem';
import { TPEmptyState } from '../../core/components/TPEmptyState';
import { TPSectionHeader } from '../../core/components/TPSectionHeader';
import { TPTag } from '../../core/components/TPTag';
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
export type OmadaDeviceStatus =
  | 'connected'
  | 'disconnected'
  | 'pending'
  | 'adopting'
  | 'isolated'
  | 'heartbeat-missed'
  | 'online'
  | 'offline'
  | 'updating'
  | 'warning';

export type OmadaDeviceSecondaryMetric =
  | 'ip'
  | 'mac'
  | 'uptime'
  | 'clients'
  | 'cpu-mem'
  | 'traffic'
  | 'firmware';

export type OmadaDeviceThumbSize = 'sm' | 'md' | 'lg';

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
  clientsCount?: number;
  trafficRate?: string;
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
    clientsCount: 4,
    trafficRate: '142 Mbps',
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
    clientsCount: 28,
    trafficRate: '84 Mbps',
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
    clientsCount: 19,
    trafficRate: '56 Mbps',
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
  return <TPIcon name={type === 'gateway' ? 'client-gateway' : 'client-switch'} size={size} />;
};

export interface OmadaDeviceListBlockProps {
  devices?: readonly OmadaDeviceRecord[];
  grouped?: boolean;
  secondaryMetric?: OmadaDeviceSecondaryMetric;
  onSecondaryMetricChange?: (metric: OmadaDeviceSecondaryMetric) => void;
  thumbSize?: OmadaDeviceThumbSize;
  onThumbSizeChange?: (size: OmadaDeviceThumbSize) => void;
  showDisplayOptions?: boolean;
  selectable?: 'none' | 'single' | 'multi';
  selectedIds?: readonly string[];
  onSelectionChange?: (selectedIds: string[]) => void;
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
  adopting: 'Adopting',
  isolated: 'Isolated',
  'heartbeat-missed': 'Heartbeat Missed',
  online: 'Connected',
  offline: 'Disconnected',
  updating: 'Updating',
  warning: 'Warning',
};

const GROUP_TITLE_MAP: Record<OmadaDeviceType, string> = {
  gateway: 'Gateway',
  switch: 'Switches',
  ap: 'Access Points',
};

const THUMB_PIXEL_SIZE: Record<OmadaDeviceThumbSize, number> = {
  sm: 30,
  md: 38,
  lg: 46,
};

const SECONDARY_METRIC_OPTIONS: readonly { key: OmadaDeviceSecondaryMetric; label: string }[] = [
  { key: 'ip', label: 'IP Address' },
  { key: 'mac', label: 'MAC Address' },
  { key: 'uptime', label: 'Uptime' },
  { key: 'clients', label: 'Connected Clients' },
  { key: 'cpu-mem', label: 'CPU / Memory' },
  { key: 'traffic', label: 'Traffic Rate' },
  { key: 'firmware', label: 'Firmware Version' },
];

function formatDeviceSecondaryMetric(
  device: OmadaDeviceRecord,
  metric: OmadaDeviceSecondaryMetric,
): string {
  switch (metric) {
    case 'mac':
      return device.mac;
    case 'uptime':
      return device.uptime ?? '0m';
    case 'clients':
      return `${device.clientsCount ?? 0} clients`;
    case 'cpu-mem':
      return `CPU ${device.cpuPct ?? 0}% · MEM ${device.memoryPct ?? 0}%`;
    case 'traffic':
      return device.trafficRate ?? '0 Mbps';
    case 'firmware':
      return device.firmwareVersion ?? 'v1.0.0';
    case 'ip':
    default:
      return device.ip;
  }
}

/**
 * Reusable Omada v5.3+ Device List block matching real-device `SiteDevices.png` row geometry,
 * extended with 6+ device statuses, 7 selectable secondary metrics, Display Options sheet, and row selection.
 */
export const OmadaDeviceListBlock: React.FC<OmadaDeviceListBlockProps> = ({
  devices = DEFAULT_OMADA_DEVICES,
  grouped = false,
  secondaryMetric: controlledMetric,
  onSecondaryMetricChange,
  thumbSize: controlledThumbSize,
  onThumbSizeChange,
  showDisplayOptions = false,
  selectable = 'none',
  selectedIds: controlledSelectedIds,
  onSelectionChange,
  onSelectDevice,
  emptyTitle = 'No Devices Found',
  emptyDescription = 'Try adjusting your search query or status filter.',
  className = '',
  style,
}) => {
  const [internalMetric, setInternalMetric] = useState<OmadaDeviceSecondaryMetric>('ip');
  const [internalThumbSize, setInternalThumbSize] = useState<OmadaDeviceThumbSize>('md');
  const [internalSelected, setInternalSelected] = useState<string[]>([]);
  const [optionsOpen, setOptionsOpen] = useState(false);

  const activeMetric = controlledMetric ?? internalMetric;
  const activeThumbSize = controlledThumbSize ?? internalThumbSize;
  const activeSelectedIds = controlledSelectedIds ?? internalSelected;

  const updateMetric = (metric: OmadaDeviceSecondaryMetric) => {
    if (!controlledMetric) setInternalMetric(metric);
    onSecondaryMetricChange?.(metric);
  };

  const updateThumbSize = (size: OmadaDeviceThumbSize) => {
    if (!controlledThumbSize) setInternalThumbSize(size);
    onThumbSizeChange?.(size);
  };

  const handleRowAction = (device: OmadaDeviceRecord) => {
    if (selectable !== 'none') {
      const exists = activeSelectedIds.includes(device.id);
      let next: string[];
      if (selectable === 'single') {
        next = exists ? [] : [device.id];
      } else {
        next = exists
          ? activeSelectedIds.filter((id) => id !== device.id)
          : [...activeSelectedIds, device.id];
      }
      if (!controlledSelectedIds) setInternalSelected(next);
      onSelectionChange?.(next);
    }
    onSelectDevice?.(device);
  };

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
      device.status === 'connected' || device.status === 'online'
        ? 'tp-omada-status-line--good'
        : device.status === 'pending' ||
            device.status === 'adopting' ||
            device.status === 'updating' ||
            device.status === 'heartbeat-missed' ||
            device.status === 'warning'
          ? 'tp-omada-status-line--warn'
          : 'tp-omada-status-line--alert';

    const dotClass =
      device.healthTone === 'alert'
        ? 'tp-omada-dot--alert'
        : device.healthTone === 'warn'
          ? 'tp-omada-dot--warn'
          : '';

    const isSelected = selectable !== 'none' && activeSelectedIds.includes(device.id);

    return (
      <TPListItem
        key={device.id}
        leading={<OmadaDeviceThumb type={device.type} size={THUMB_PIXEL_SIZE[activeThumbSize]} />}
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
            <span>{formatDeviceSecondaryMetric(device, activeMetric)}</span>
            <span className="tp-omada-health-dot-row">
              <span className={`tp-omada-dot ${dotClass}`.trim()} aria-hidden="true" />
              <span>{device.healthLabel}</span>
            </span>
          </div>
        }
        checked={selectable !== 'none' ? isSelected : undefined}
        onClick={
          onSelectDevice || selectable !== 'none' ? () => handleRowAction(device) : undefined
        }
      />
    );
  };

  const optionsBar = showDisplayOptions ? (
    <div className="tp-omada-device-toolbar">
      <TPTag size="xs" tone="neutral">
        Metric: {SECONDARY_METRIC_OPTIONS.find((m) => m.key === activeMetric)?.label ?? activeMetric}
      </TPTag>
      <TPButton
        variant="text"
        size="sm"
        onClick={() => setOptionsOpen(true)}
      >
        Display Options
      </TPButton>
    </div>
  ) : null;

  const displaySheet = (
    <TPBottomSheet
      open={optionsOpen}
      title="Display Options"
      subtitle="Choose secondary metric and device thumbnail size"
      onClose={() => setOptionsOpen(false)}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <div className="tp-omada-std-input-label" style={{ marginBottom: 6 }}>
            Thumbnail Size
          </div>
          <div className="tp-omada-chip-group">
            {(['sm', 'md', 'lg'] as const).map((sz) => (
              <TPTag
                key={sz}
                size="sm"
                selected={activeThumbSize === sz}
                onClick={() => updateThumbSize(sz)}
              >
                {sz.toUpperCase()} ({THUMB_PIXEL_SIZE[sz]}px)
              </TPTag>
            ))}
          </div>
        </div>

        <div>
          <div className="tp-omada-std-input-label" style={{ marginBottom: 6 }}>
            Secondary Metric
          </div>
          <TPListCard divided>
            {SECONDARY_METRIC_OPTIONS.map((opt) => (
              <TPListItem
                key={opt.key}
                title={opt.label}
                checked={activeMetric === opt.key}
                onClick={() => updateMetric(opt.key)}
              />
            ))}
          </TPListCard>
        </div>
      </div>
    </TPBottomSheet>
  );

  if (!grouped) {
    return (
      <div className={className} style={style}>
        {optionsBar}
        <TPListCard divided>{devices.map(renderDeviceRow)}</TPListCard>
        {displaySheet}
      </div>
    );
  }

  const order: OmadaDeviceType[] = ['gateway', 'switch', 'ap'];
  return (
    <div className={className} style={{ display: 'flex', flexDirection: 'column', gap: 12, ...style }}>
      {optionsBar}
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
      {displaySheet}
    </div>
  );
};
