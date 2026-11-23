import React, { useMemo, useState } from 'react';
import type { TPMenuItem, TPSegmentOption } from '../../core/types';
import { TPHeader } from '../../core/components/TPHeader';
import { TPSearchBar } from '../../core/components/TPSearchBar';
import { TPSegment } from '../../core/components/TPSegment';
import { TPTag } from '../../core/components/TPTag';
import { TPTabBar } from '../../core/components/TPTabBar';
import { TPMenu } from '../../core/components/TPMenu';
import { TPBottomSheet } from '../../core/components/TPBottomSheet';
import { TPButton } from '../../core/components/TPButton';
import { TPIcon } from '../../assets-lib';
import { OmadaStandardInput } from '../components/OmadaStandardInput';
import {
  DEFAULT_OMADA_DEVICES,
  OMADA_SITE_TABS,
  OmadaDeviceListBlock,
  type OmadaDeviceRecord,
  type OmadaDeviceType,
  type OmadaSiteTabKey,
} from '../blocks/OmadaDeviceListBlock';
import '../../styles/tp-omada.css';

export interface OmadaSiteDevicesPageProps {
  devices?: readonly OmadaDeviceRecord[];
  activeTab?: OmadaSiteTabKey;
  onTabChange?: (tab: OmadaSiteTabKey) => void;
  onSelectDevice?: (device: OmadaDeviceRecord) => void;
  showTabBar?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const DEVICE_SEGMENTS: readonly TPSegmentOption[] = [
  { key: 'list', label: 'Device List' },
  { key: 'group', label: 'Device Group' },
];

type TypeFilter = 'all' | OmadaDeviceType;
type StatusFilter = 'all' | 'connected' | 'upgrade' | 'disconnected';

/**
 * 1:1 restoration of `SiteDevices.png`: floating `Devices` header with `+ | ⋮` glass capsule,
 * live `TPSearchBar`, `Device List | Device Group` underline segment, expandable filter chips,
 * `OmadaDeviceListBlock`, and floating TabBar.
 */
export const OmadaSiteDevicesPage: React.FC<OmadaSiteDevicesPageProps> = ({
  devices = DEFAULT_OMADA_DEVICES,
  activeTab = 'devices',
  onTabChange,
  onSelectDevice,
  showTabBar = true,
  className = '',
  style,
}) => {
  const [search, setSearch] = useState('');
  const [segment, setSegment] = useState<'list' | 'group'>('list');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [chipsExpanded, setChipsExpanded] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [addSheetOpen, setAddSheetOpen] = useState(false);
  const [adoptMac, setAdoptMac] = useState('8C-86-DD-A6-A7-99');

  const moreMenuItems: TPMenuItem[] = [
    { key: 'adopt', label: 'Batch Adopt' },
    { key: 'upgrade', label: 'Batch Upgrade' },
    { key: 'refresh', label: 'Refresh Device List' },
  ];

  const filteredDevices = useMemo(() => {
    const q = search.trim().toLowerCase();
    return devices.filter((device) => {
      if (typeFilter !== 'all' && device.type !== typeFilter) return false;
      if (statusFilter === 'connected' && device.status !== 'connected') return false;
      if (statusFilter === 'disconnected' && device.status !== 'disconnected') return false;
      if (statusFilter === 'upgrade' && !device.upgradeAvailable) return false;
      if (!q) return true;
      return (
        device.mac.toLowerCase().includes(q) ||
        device.model.toLowerCase().includes(q) ||
        device.ip.toLowerCase().includes(q) ||
        device.status.toLowerCase().includes(q)
      );
    });
  }, [devices, search, typeFilter, statusFilter]);

  const statusChipLabel =
    statusFilter === 'all'
      ? 'All Status'
      : statusFilter === 'connected'
        ? 'Connected'
        : statusFilter === 'upgrade'
          ? 'Upgrade Ready'
          : 'Disconnected';

  return (
    <div
      className={`tp-omada-screen ${showTabBar ? 'tp-omada-screen--standalone' : ''} ${className}`.trim()}
      data-testid="omada-site-devices-page"
      style={style}
    >
      <div className="tp-omada-header-wrap">
        <TPHeader
          variant="floating"
          title="Devices"
          right={
            <div className="tp-omada-capsule-inner">
              <button
                type="button"
                className="tp-omada-glass-capsule-item"
                aria-label="Add device"
                onClick={() => setAddSheetOpen(true)}
              >
                <TPIcon name="nav-add" size={18} />
              </button>
              <button
                type="button"
                className="tp-omada-glass-capsule-item"
                aria-label="More device actions"
                onClick={() => setMoreMenuOpen((prev) => !prev)}
              >
                <TPIcon name="nav-more" size={18} />
              </button>
            </div>
          }
        />

        <TPMenu
          open={moreMenuOpen}
          align="right"
          items={moreMenuItems}
          onSelect={(item) => {
            if (item.key === 'upgrade') {
              setStatusFilter('upgrade');
            } else if (item.key === 'refresh') {
              setTypeFilter('all');
              setStatusFilter('all');
            }
          }}
          onClose={() => setMoreMenuOpen(false)}
        />
      </div>

      <div className="tp-omada-scroll">
        <div className={`tp-omada-body ${showTabBar ? 'tp-omada-body--with-tabbar' : ''}`.trim()}>
          <TPSearchBar
            value={search}
            placeholder="Search"
            onChange={setSearch}
            onSearch={setSearch}
          />

          <TPSegment
            variant="underline"
            fullWidth
            options={DEVICE_SEGMENTS}
            value={segment}
            onChange={(key) => setSegment(key as 'list' | 'group')}
          />

          <div className="tp-omada-chip-row">
            <div className="tp-omada-chip-group">
              <TPTag selected={typeFilter === 'all'} onClick={() => setTypeFilter('all')}>
                All
              </TPTag>
              <TPTag
                selected
                onClick={() =>
                  setStatusFilter((prev) =>
                    prev === 'all' ? 'upgrade' : prev === 'upgrade' ? 'connected' : 'all',
                  )
                }
              >
                {statusChipLabel}
              </TPTag>

              {chipsExpanded && (
                <>
                  <TPTag
                    selected={typeFilter === 'gateway'}
                    onClick={() => setTypeFilter('gateway')}
                  >
                    Gateway
                  </TPTag>
                  <TPTag
                    selected={typeFilter === 'switch'}
                    onClick={() => setTypeFilter('switch')}
                  >
                    Switch
                  </TPTag>
                  <TPTag selected={typeFilter === 'ap'} onClick={() => setTypeFilter('ap')}>
                    AP
                  </TPTag>
                </>
              )}
            </div>

            <button
              type="button"
              className="tp-omada-chip-expand-btn"
              aria-label={chipsExpanded ? 'Collapse filters' : 'Expand filters'}
              onClick={() => setChipsExpanded((prev) => !prev)}
            >
              <TPIcon
                name={chipsExpanded ? 'arrow-arrow-sm-up' : 'arrow-arrow-sm-down'}
                size={18}
              />
            </button>
          </div>

          <OmadaDeviceListBlock
            devices={filteredDevices}
            grouped={segment === 'group'}
            onSelectDevice={onSelectDevice}
          />
        </div>
      </div>

      {showTabBar && (
        <div className="tp-omada-standalone-tabbar">
          <TPTabBar
            variant="floating-pill"
            items={OMADA_SITE_TABS}
            activeKey={activeTab}
            onChange={(key) => onTabChange?.(key as OmadaSiteTabKey)}
          />
        </div>
      )}

      <TPBottomSheet
        open={addSheetOpen}
        title="Adopt Standalone Device"
        subtitle="Enter MAC address or scan QR code on hardware label"
        onClose={() => setAddSheetOpen(false)}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <OmadaStandardInput
            type="mac"
            label="Device MAC Address"
            value={adoptMac}
            onChange={setAdoptMac}
          />
          <TPButton variant="primary" block onClick={() => setAddSheetOpen(false)}>
            Discover &amp; Adopt
          </TPButton>
        </div>
      </TPBottomSheet>
    </div>
  );
};
