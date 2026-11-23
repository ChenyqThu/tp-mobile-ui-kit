import React, { useMemo, useState } from 'react';
import { TPHeader } from '../../core/components/TPHeader';
import { TPSearchBar } from '../../core/components/TPSearchBar';
import { TPListCard } from '../../core/components/TPListCard';
import { TPListItem } from '../../core/components/TPListItem';
import { TPEmptyState } from '../../core/components/TPEmptyState';
import { TPTabBar } from '../../core/components/TPTabBar';
import { TPBottomSheet } from '../../core/components/TPBottomSheet';
import { TPIcon, type TPIconName } from '../../assets-lib';
import { OMADA_SITE_TABS, type OmadaSiteTabKey } from '../blocks/OmadaDeviceListBlock';
import { OmadaWirelessNetworkBlock } from '../blocks/OmadaWirelessNetworkBlock';
import { OmadaScheduleBlock } from '../blocks/OmadaScheduleBlock';
import { OmadaFirmwareUpdateBlock } from '../blocks/OmadaFirmwareUpdateBlock';
import '../../styles/tp-omada.css';

export type OmadaSettingRowKey =
  | 'internet'
  | 'lan'
  | 'wireless'
  | 'vpn'
  | 'security'
  | 'transmission'
  | 'authentication'
  | 'ddns'
  | 'profiles'
  | 'site'
  | 'schedule'
  | 'firmware'
  | 'logs';

interface SettingGroupItem {
  key: OmadaSettingRowKey;
  label: string;
  icon: TPIconName;
  hasCount?: boolean;
}

const SETTING_GROUPS: readonly (readonly SettingGroupItem[])[] = [
  [
    { key: 'internet', label: 'Internet Settings', icon: 'settings-internet-settings' },
    { key: 'lan', label: 'LAN Settings', icon: 'settings-lan-settings' },
    { key: 'wireless', label: 'Wireless Networks', icon: 'settings-wireless-settings' },
  ],
  [
    { key: 'vpn', label: 'VPN', icon: 'settings-vpn' },
    { key: 'security', label: 'Network Security', icon: 'settings-network-security' },
    { key: 'transmission', label: 'Transmission', icon: 'settings-transmission' },
    { key: 'authentication', label: 'Authentication', icon: 'settings-authentication' },
    { key: 'ddns', label: 'Dynamic DNS', icon: 'settings-ddns' },
  ],
  [
    { key: 'profiles', label: 'Profiles', icon: 'settings-groups' },
    { key: 'site', label: 'Site Settings', icon: 'settings-site-settings' },
    { key: 'schedule', label: 'Schedules', icon: 'nav-calendar' },
    { key: 'firmware', label: 'Firmware Updates', icon: 'nav-refresh' },
  ],
  [{ key: 'logs', label: 'Logs', icon: 'settings-log', hasCount: true }],
];

export interface OmadaSiteSettingsPageProps {
  logsCount?: number;
  activeTab?: OmadaSiteTabKey;
  onTabChange?: (tab: OmadaSiteTabKey) => void;
  onOpenWirelessNetworks?: () => void;
  onOpenSchedule?: () => void;
  onOpenFirmware?: () => void;
  onOpenLogs?: () => void;
  onSelectSetting?: (key: OmadaSettingRowKey) => void;
  showTabBar?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * 1:1 restoration of `SiteSettings.png`: centered `Settings` header, live `TPSearchBar`,
 * 4 grouped `TPListCard`s with exact Omada `settings-*` icons, and drill-downs to Wireless Networks, Schedules, Firmware Updates & Logs.
 */
export const OmadaSiteSettingsPage: React.FC<OmadaSiteSettingsPageProps> = ({
  logsCount = 1,
  activeTab = 'settings',
  onTabChange,
  onOpenWirelessNetworks,
  onOpenSchedule,
  onOpenFirmware,
  onOpenLogs,
  onSelectSetting,
  showTabBar = true,
  className = '',
  style,
}) => {
  const [search, setSearch] = useState('');
  const [wirelessSheetOpen, setWirelessSheetOpen] = useState(false);
  const [scheduleSheetOpen, setScheduleSheetOpen] = useState(false);
  const [firmwareSheetOpen, setFirmwareSheetOpen] = useState(false);
  const [infoSetting, setInfoSetting] = useState<SettingGroupItem | null>(null);

  const visibleGroups = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return SETTING_GROUPS;
    return SETTING_GROUPS.map((group) =>
      group.filter((item) => item.label.toLowerCase().includes(q)),
    ).filter((group) => group.length > 0);
  }, [search]);

  const handleRowClick = (item: SettingGroupItem) => {
    onSelectSetting?.(item.key);
    if (item.key === 'wireless') {
      if (onOpenWirelessNetworks) {
        onOpenWirelessNetworks();
      } else {
        setWirelessSheetOpen(true);
      }
      return;
    }
    if (item.key === 'schedule') {
      if (onOpenSchedule) {
        onOpenSchedule();
      } else {
        setScheduleSheetOpen(true);
      }
      return;
    }
    if (item.key === 'firmware') {
      if (onOpenFirmware) {
        onOpenFirmware();
      } else {
        setFirmwareSheetOpen(true);
      }
      return;
    }
    if (item.key === 'logs') {
      if (onOpenLogs) {
        onOpenLogs();
        return;
      }
    }
    setInfoSetting(item);
  };

  return (
    <div
      className={`tp-omada-screen ${showTabBar ? 'tp-omada-screen--standalone' : ''} ${className}`.trim()}
      data-testid="omada-site-settings-page"
      style={style}
    >
      <div className="tp-omada-header-wrap">
        <TPHeader variant="floating" title="Settings" />
      </div>

      <div className="tp-omada-scroll">
        <div className={`tp-omada-body ${showTabBar ? 'tp-omada-body--with-tabbar' : ''}`.trim()}>
          <TPSearchBar
            value={search}
            placeholder="Search"
            onChange={setSearch}
            onSearch={setSearch}
          />

          {visibleGroups.length === 0 ? (
            <TPEmptyState
              illustration="no-search"
              title="No Matching Settings"
              description={`No setting rows matched "${search}".`}
              compact
            />
          ) : (
            visibleGroups.map((group, idx) => (
              <TPListCard key={idx} divided>
                {group.map((item) => (
                  <TPListItem
                    key={item.key}
                    leading={
                      <span style={{ color: 'var(--tp-text-primary)', display: 'inline-flex' }}>
                        <TPIcon name={item.icon} size={22} />
                      </span>
                    }
                    title={item.label}
                    value={item.hasCount && logsCount > 0 ? logsCount : undefined}
                    arrow
                    onClick={() => handleRowClick(item)}
                  />
                ))}
              </TPListCard>
            ))
          )}
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
        open={wirelessSheetOpen}
        title="Wireless Networks"
        subtitle="Configure SSID & ACL"
        onClose={() => setWirelessSheetOpen(false)}
      >
        <OmadaWirelessNetworkBlock showHeader={false} />
      </TPBottomSheet>

      <TPBottomSheet
        open={scheduleSheetOpen}
        title="Schedules"
        subtitle="WLAN • PoE • Reboot Policies"
        onClose={() => setScheduleSheetOpen(false)}
      >
        <OmadaScheduleBlock showHeader={false} />
      </TPBottomSheet>

      <TPBottomSheet
        open={firmwareSheetOpen}
        title="Firmware Updates"
        subtitle="Site 92 • v1.3.2 Release"
        onClose={() => setFirmwareSheetOpen(false)}
      >
        <OmadaFirmwareUpdateBlock showHeader={false} />
      </TPBottomSheet>

      <TPBottomSheet
        open={Boolean(infoSetting)}
        title={infoSetting?.label}
        subtitle="Site 92 • Controller 62"
        onClose={() => setInfoSetting(null)}
      >
        {infoSetting && (
          <TPListCard divided>
            <TPListItem title="Profile Status" value="Synced" />
            <TPListItem title="Target Gateway" value="ER7212PC (192.168.0.1)" />
            <TPListItem title="Managed APs" value="2 × EAP723" />
          </TPListCard>
        )}
      </TPBottomSheet>
    </div>
  );
};
