import React, { useMemo, useState } from 'react';
import { TPIconButton } from '../../core/components/TPIconButton';
import { TPListCard } from '../../core/components/TPListCard';
import { TPListItem } from '../../core/components/TPListItem';
import { TPSearchBar } from '../../core/components/TPSearchBar';
import { TPTag } from '../../core/components/TPTag';
import { TPEmptyState } from '../../core/components/TPEmptyState';
import { TPIcon, type TPIconName } from '../../assets-lib';
import type { OmadaClientLinkType, OmadaClientStatus } from '../pages/OmadaSiteClientsPage';
import '../../styles/tp-omada.css';

export interface OmadaClientListItem {
  id: string;
  name: string;
  ip: string;
  mac: string;
  networkName: string;
  status: OmadaClientStatus;
  linkType: OmadaClientLinkType;
  band?: '2.4G' | '5G' | '6G' | 'LAN';
  rssiDbm?: number;
  downRate?: string;
  upRate?: string;
  iconName?: TPIconName;
}

export const DEFAULT_OMADA_CLIENT_LIST: readonly OmadaClientListItem[] = [
  {
    id: 'cli-l1',
    name: "Lucien's MacBook Pro",
    ip: '192.168.0.13',
    mac: '38-F9-D3-41-2C-8E',
    networkName: 'Omada-Corp-5G',
    status: 'online',
    linkType: 'wireless',
    band: '6G',
    rssiDbm: -42,
    downRate: '412 Mbps',
    upRate: '188 Mbps',
    iconName: 'client-macbook',
  },
  {
    id: 'cli-l2',
    name: 'Conference Room iPad',
    ip: '192.168.0.19',
    mac: 'BC-9A-78-11-3D-F0',
    networkName: 'Omada-Guest',
    status: 'online',
    linkType: 'wireless',
    band: '5G',
    rssiDbm: -58,
    downRate: '86 Mbps',
    upRate: '24 Mbps',
    iconName: 'client-pad',
  },
  {
    id: 'cli-l3',
    name: 'Front Desk Workstation',
    ip: '192.168.0.28',
    mac: '74-DA-88-40-1A-92',
    networkName: 'LAN · Port 4',
    status: 'online',
    linkType: 'wired',
    band: 'LAN',
    downRate: '940 Mbps',
    upRate: '910 Mbps',
    iconName: 'client-imac',
  },
  {
    id: 'cli-l4',
    name: 'Unknown IoT Camera',
    ip: '192.168.20.44',
    mac: '00-1C-B3-22-91-7C',
    networkName: 'IoT-VLAN20',
    status: 'blocked',
    linkType: 'wireless',
    band: '2.4G',
    rssiDbm: -74,
    downRate: '0 bps',
    upRate: '0 bps',
    iconName: 'client-ipc',
  },
];

export type OmadaClientFilterKey = 'all' | 'wireless' | 'wired' | 'blocked';

export interface OmadaClientListBlockProps {
  clients?: readonly OmadaClientListItem[];
  searchable?: boolean;
  filterable?: boolean;
  onSelectClient?: (client: OmadaClientListItem) => void;
  onToggleBlock?: (client: OmadaClientListItem) => void;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Reusable Omada Client List block featuring dark-adaptive client icons, Wi-Fi band tags,
 * RSSI signal strength, live Rx/Tx rates, filter chips, and quick block/unblock action.
 */
export const OmadaClientListBlock: React.FC<OmadaClientListBlockProps> = ({
  clients = DEFAULT_OMADA_CLIENT_LIST,
  searchable = true,
  filterable = true,
  onSelectClient,
  onToggleBlock,
  className = '',
  style,
}) => {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<OmadaClientFilterKey>('all');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return clients.filter((c) => {
      if (filter === 'wireless' && c.linkType !== 'wireless') return false;
      if (filter === 'wired' && c.linkType !== 'wired') return false;
      if (filter === 'blocked' && c.status !== 'blocked') return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.ip.toLowerCase().includes(q) ||
        c.mac.toLowerCase().includes(q) ||
        c.networkName.toLowerCase().includes(q)
      );
    });
  }, [clients, query, filter]);

  return (
    <div
      className={`tp-omada-client-list ${className}`.trim()}
      data-testid="omada-client-list-block"
      style={style}
    >
      {searchable && (
        <div style={{ marginBottom: 8 }}>
          <TPSearchBar value={query} placeholder="Search clients, IP, or MAC" onChange={setQuery} />
        </div>
      )}

      {filterable && (
        <div className="tp-omada-chip-group" style={{ marginBottom: 10 }}>
          {(['all', 'wireless', 'wired', 'blocked'] as const).map((key) => (
            <TPTag
              key={key}
              size="sm"
              selected={filter === key}
              tone={key === 'blocked' ? 'alert' : 'focus'}
              onClick={() => setFilter(key)}
            >
              {key === 'all'
                ? `All (${clients.length})`
                : key === 'wireless'
                  ? 'Wireless'
                  : key === 'wired'
                    ? 'Wired'
                    : 'Blocked'}
            </TPTag>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <TPEmptyState
          size="compact"
          illustration="no-clients"
          title="No Matching Clients"
          description="No connected or blocked client matches the current filter."
        />
      ) : (
        <TPListCard divided>
          {filtered.map((client) => {
            const bandLabel = client.band ?? (client.linkType === 'wired' ? 'LAN' : '5G');
            const bandTone =
              client.status === 'blocked'
                ? 'alert'
                : bandLabel === '6G'
                  ? 'purple'
                  : bandLabel === '5G'
                    ? 'info'
                    : bandLabel === '2.4G'
                      ? 'warning'
                      : 'success';

            return (
              <TPListItem
                key={client.id}
                leading={<TPIcon name={client.iconName ?? 'client-other'} size={36} />}
                title={
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <span>{client.name}</span>
                    <TPTag size="xs" shape="rect" tone={bandTone}>
                      {client.status === 'blocked' ? 'Blocked' : bandLabel}
                    </TPTag>
                  </span>
                }
                subtitle={`${client.ip} · ${client.networkName}`}
                description={
                  client.downRate || client.upRate
                    ? `↓ ${client.downRate ?? '0 bps'} · ↑ ${client.upRate ?? '0 bps'}${
                        client.rssiDbm !== undefined ? ` · ${client.rssiDbm} dBm` : ''
                      }`
                    : client.mac
                }
                trailing={
                  onToggleBlock ? (
                    <TPIconButton
                      size="sm"
                      variant="ghost"
                      ariaLabel={client.status === 'blocked' ? `Unblock ${client.name}` : `Block ${client.name}`}
                      icon={
                        <TPIcon
                          name={client.status === 'blocked' ? 'swipe-unblock' : 'swipe-block'}
                          size={18}
                        />
                      }
                      onClick={() => onToggleBlock(client)}
                    />
                  ) : undefined
                }
                arrow={!onToggleBlock}
                onClick={onSelectClient ? () => onSelectClient(client) : undefined}
              />
            );
          })}
        </TPListCard>
      )}
    </div>
  );
};
