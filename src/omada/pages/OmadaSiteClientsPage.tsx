import React, { useMemo, useState } from 'react';
import type { TPMenuItem, TPSegmentOption } from '../../core/types';
import { TPHeader } from '../../core/components/TPHeader';
import { TPSearchBar } from '../../core/components/TPSearchBar';
import { TPSegment } from '../../core/components/TPSegment';
import { TPTag } from '../../core/components/TPTag';
import { TPListCard } from '../../core/components/TPListCard';
import { TPListItem } from '../../core/components/TPListItem';
import { TPEmptyState } from '../../core/components/TPEmptyState';
import { TPTabBar } from '../../core/components/TPTabBar';
import { TPMenu } from '../../core/components/TPMenu';
import { TPBottomSheet } from '../../core/components/TPBottomSheet';
import { TPButton } from '../../core/components/TPButton';
import { TPIcon, type TPIconName } from '../../assets-lib';
import { OMADA_SITE_TABS, type OmadaSiteTabKey } from '../blocks/OmadaDeviceListBlock';
import '../../styles/tp-omada.css';

export type OmadaClientStatus = 'online' | 'offline' | 'blocked';
export type OmadaClientLinkType = 'wired' | 'wireless';

export interface OmadaClientRecord {
  id: string;
  name: string;
  ip: string;
  mac: string;
  rssiDbm?: number;
  networkName: string;
  status: OmadaClientStatus;
  linkType: OmadaClientLinkType;
  iconName?: TPIconName;
  customThumb?: 'thermostat';
}

export const DEFAULT_OMADA_CLIENTS: readonly OmadaClientRecord[] = [
  {
    id: 'cli-1',
    name: '92-Sarabande',
    ip: '192.168.0.12',
    mac: 'A4-83-E7-92-10-44',
    rssiDbm: -28,
    networkName: 'Sara Banday',
    status: 'online',
    linkType: 'wireless',
    customThumb: 'thermostat',
  },
  {
    id: 'cli-2',
    name: 'ChimePro-19',
    ip: '192.168.0.11',
    mac: '5C-AA-FD-19-82-0B',
    rssiDbm: -46,
    networkName: 'Sara Banday',
    status: 'online',
    linkType: 'wireless',
    iconName: 'client-other',
  },
  {
    id: 'cli-3',
    name: 'Mac',
    ip: '192.168.0.13',
    mac: '38-F9-D3-41-2C-8E',
    rssiDbm: -73,
    networkName: 'Omada',
    status: 'online',
    linkType: 'wireless',
    iconName: 'client-macbook',
  },
  {
    id: 'cli-4',
    name: 'appleiPad',
    ip: '192.168.0.8',
    mac: 'F0-98-9D-77-1B-C4',
    rssiDbm: -74,
    networkName: 'Omada',
    status: 'online',
    linkType: 'wireless',
    iconName: 'client-pad',
  },
];

const ThermostatThumb: React.FC = () => (
  <svg width="38" height="38" viewBox="0 0 40 40" fill="none" aria-hidden="true">
    <rect x="6" y="6" width="28" height="28" rx="6" fill="#E5E5EA" />
    <rect x="12" y="11" width="16" height="12" rx="2" fill="#D1D1D6" stroke="#AEAEB2" strokeWidth="1" />
    <text
      x="20"
      y="19"
      textAnchor="middle"
      fill="#3A3A3C"
      fontSize="6"
      fontWeight="600"
      fontFamily="sans-serif"
    >
      24.0
    </text>
  </svg>
);

export interface OmadaSiteClientsPageProps {
  clients?: readonly OmadaClientRecord[];
  activeTab?: OmadaSiteTabKey;
  onTabChange?: (tab: OmadaSiteTabKey) => void;
  onSelectClient?: (client: OmadaClientRecord) => void;
  showTabBar?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const CLIENT_SEGMENTS: readonly TPSegmentOption[] = [
  { key: 'online', label: 'Online' },
  { key: 'offline', label: 'Offline' },
  { key: 'blocked', label: 'Blocked' },
  { key: 'all', label: 'All' },
];

/**
 * 1:1 restoration of `SiteClients.png`: floating `Clients` header with `Filter | ⋮` glass capsule,
 * live `TPSearchBar`, `Online | Offline | Blocked | All` underline segment, `All | Wired | Wireless` chips,
 * and all 4 real clients with color-coded dBm RSSI metrics.
 */
export const OmadaSiteClientsPage: React.FC<OmadaSiteClientsPageProps> = ({
  clients: initialClients = DEFAULT_OMADA_CLIENTS,
  activeTab = 'clients',
  onTabChange,
  onSelectClient,
  showTabBar = true,
  className = '',
  style,
}) => {
  const [clientItems, setClientItems] = useState<OmadaClientRecord[]>([...initialClients]);
  const [search, setSearch] = useState('');
  const [statusSegment, setStatusSegment] = useState<'online' | 'offline' | 'blocked' | 'all'>('online');
  const [linkFilter, setLinkFilter] = useState<'all' | 'wired' | 'wireless'>('all');
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<OmadaClientRecord | null>(null);

  const moreMenuItems: TPMenuItem[] = [
    { key: 'sort-signal', label: 'Sort by Signal Strength' },
    { key: 'reset-filters', label: 'Reset Filters' },
  ];

  const filteredClients = useMemo(() => {
    const q = search.trim().toLowerCase();
    return clientItems.filter((client) => {
      if (statusSegment !== 'all' && client.status !== statusSegment) return false;
      if (linkFilter !== 'all' && client.linkType !== linkFilter) return false;
      if (!q) return true;
      return (
        client.name.toLowerCase().includes(q) ||
        client.ip.toLowerCase().includes(q) ||
        client.networkName.toLowerCase().includes(q) ||
        client.mac.toLowerCase().includes(q)
      );
    });
  }, [clientItems, search, statusSegment, linkFilter]);

  const handleToggleBlock = (target: OmadaClientRecord) => {
    const nextStatus: OmadaClientStatus = target.status === 'blocked' ? 'online' : 'blocked';
    setClientItems((prev) =>
      prev.map((c) => (c.id === target.id ? { ...c, status: nextStatus } : c)),
    );
    setSelectedClient(null);
  };

  return (
    <div
      className={`tp-omada-screen ${showTabBar ? 'tp-omada-screen--standalone' : ''} ${className}`.trim()}
      data-testid="omada-site-clients-page"
      style={style}
    >
      <div className="tp-omada-header-wrap">
        <TPHeader
          variant="floating"
          title="Clients"
          right={
            <div className="tp-omada-capsule-inner">
              <button
                type="button"
                className="tp-omada-glass-capsule-item"
                aria-label="Filter clients"
                onClick={() =>
                  setLinkFilter((prev) =>
                    prev === 'all' ? 'wireless' : prev === 'wireless' ? 'wired' : 'all',
                  )
                }
              >
                <TPIcon name="filter" size={18} />
              </button>
              <button
                type="button"
                className="tp-omada-glass-capsule-item"
                aria-label="More client options"
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
            if (item.key === 'sort-signal') {
              setClientItems((prev) =>
                [...prev].sort((a, b) => (b.rssiDbm ?? -99) - (a.rssiDbm ?? -99)),
              );
            } else {
              setLinkFilter('all');
              setStatusSegment('online');
              setSearch('');
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
            options={CLIENT_SEGMENTS}
            value={statusSegment}
            onChange={(key) =>
              setStatusSegment(key as 'online' | 'offline' | 'blocked' | 'all')
            }
          />

          <div className="tp-omada-chip-group">
            <TPTag selected={linkFilter === 'all'} onClick={() => setLinkFilter('all')}>
              All
            </TPTag>
            <TPTag selected={linkFilter === 'wired'} onClick={() => setLinkFilter('wired')}>
              Wired
            </TPTag>
            <TPTag selected={linkFilter === 'wireless'} onClick={() => setLinkFilter('wireless')}>
              Wireless
            </TPTag>
          </div>

          {filteredClients.length === 0 ? (
            <TPEmptyState
              illustration="no-clients"
              title={
                statusSegment === 'blocked'
                  ? 'No Blocked Clients'
                  : statusSegment === 'offline'
                    ? 'No Offline Clients'
                    : 'No Matching Clients'
              }
              description="Connected wired and wireless clients will appear here."
              compact
            />
          ) : (
            <TPListCard divided>
              {filteredClients.map((client) => {
                const isWeak = (client.rssiDbm ?? -40) <= -68;
                const signalColor = isWeak
                  ? 'var(--tp-color-yellow)'
                  : 'var(--tp-color-green)';

                return (
                  <TPListItem
                    key={client.id}
                    leading={
                      client.customThumb === 'thermostat' ? (
                        <ThermostatThumb />
                      ) : client.iconName ? (
                        <TPIcon name={client.iconName} size={38} />
                      ) : (
                        <TPIcon name="client-other" size={38} />
                      )
                    }
                    title={client.name}
                    subtitle={client.ip}
                    trailing={
                      <div className="tp-omada-row-metrics">
                        <span
                          className="tp-omada-status-line"
                          style={{ color: signalColor }}
                        >
                          {client.rssiDbm !== undefined ? `${client.rssiDbm} dBm` : client.status}
                        </span>
                        <span>{client.networkName}</span>
                      </div>
                    }
                    onClick={() => {
                      onSelectClient?.(client);
                      setSelectedClient(client);
                    }}
                  />
                );
              })}
            </TPListCard>
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
        open={Boolean(selectedClient)}
        title={selectedClient?.name}
        subtitle={selectedClient ? `${selectedClient.ip} • ${selectedClient.mac}` : undefined}
        onClose={() => setSelectedClient(null)}
      >
        {selectedClient && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <TPListCard divided>
              <TPListItem title="Network / SSID" value={selectedClient.networkName} />
              <TPListItem
                title="Signal Strength"
                value={
                  selectedClient.rssiDbm !== undefined
                    ? `${selectedClient.rssiDbm} dBm`
                    : 'Wired'
                }
              />
              <TPListItem title="Status" value={selectedClient.status} />
            </TPListCard>
            <TPButton
              variant={selectedClient.status === 'blocked' ? 'primary' : 'alert'}
              block
              onClick={() => handleToggleBlock(selectedClient)}
            >
              {selectedClient.status === 'blocked' ? 'Unblock Client' : 'Block Client'}
            </TPButton>
          </div>
        )}
      </TPBottomSheet>
    </div>
  );
};
