import React, { useMemo, useState } from 'react';
import { TPHeader } from '../../core/components/TPHeader';
import { TPListCard } from '../../core/components/TPListCard';
import { TPListItem } from '../../core/components/TPListItem';
import { TPSectionHeader } from '../../core/components/TPSectionHeader';
import { TPTag } from '../../core/components/TPTag';
import { TPButton } from '../../core/components/TPButton';
import { TPEmptyState } from '../../core/components/TPEmptyState';
import { TPIcon, type TPIconName } from '../../assets-lib';
import '../../styles/tp-omada.css';

export type OmadaIncidentCategory = 'alert' | 'device' | 'client' | 'operation';
export type OmadaIncidentSeverity = 'warning' | 'error' | 'info';

export interface OmadaIncidentItem {
  id: string;
  category: OmadaIncidentCategory;
  severity: OmadaIncidentSeverity;
  title: string;
  description: string;
  timestamp: string;
  unread?: boolean;
}

export const DEFAULT_OMADA_INCIDENTS: readonly OmadaIncidentItem[] = [
  {
    id: 'log-1',
    category: 'alert',
    severity: 'warning',
    title: 'Firmware Update Available (v1.3.2)',
    description: 'EAP723 (3C-78-95-F0-45-F1, 3C-78-95-F0-46-0C) pending upgrade.',
    timestamp: '10:42 AM',
    unread: true,
  },
  {
    id: 'log-2',
    category: 'device',
    severity: 'info',
    title: 'ER7212PC WAN3 Link Up',
    description: '192.168.0.1 negotiated 1000 Mbps Full Duplex on WAN3.',
    timestamp: '09:18 AM',
    unread: false,
  },
  {
    id: 'log-3',
    category: 'client',
    severity: 'info',
    title: 'Client Roamed to 3C-78-95-F0-45-F1',
    description: '92-Sarabande (192.168.0.12) connected to Sara Banday (-28 dBm).',
    timestamp: '08:51 AM',
    unread: false,
  },
  {
    id: 'log-4',
    category: 'operation',
    severity: 'info',
    title: 'Site Health Score Evaluated',
    description: 'Site 92 scored 100 across Device, Wi-Fi, and WAN checks.',
    timestamp: 'Yesterday',
    unread: false,
  },
];

export interface OmadaIncidentsBlockProps {
  incidents?: readonly OmadaIncidentItem[];
  showHeader?: boolean;
  onBack?: () => void;
  onUnreadCountChange?: (count: number) => void;
  className?: string;
  style?: React.CSSProperties;
}

const CATEGORY_ICON: Record<OmadaIncidentCategory, TPIconName> = {
  alert: 'status-warning-solid',
  device: 'log-device',
  client: 'log-clients',
  operation: 'log-operation',
};

const FILTERS: readonly { key: 'all' | OmadaIncidentCategory; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'alert', label: 'Alerts' },
  { key: 'device', label: 'Device' },
  { key: 'client', label: 'Client' },
  { key: 'operation', label: 'Operation' },
];

/**
 * Reusable Omada v5.3+ Logs / Alerts & Events block with severity filtering and Mark All Read.
 */
export const OmadaIncidentsBlock: React.FC<OmadaIncidentsBlockProps> = ({
  incidents: initialIncidents = DEFAULT_OMADA_INCIDENTS,
  showHeader = true,
  onBack,
  onUnreadCountChange,
  className = '',
  style,
}) => {
  const [items, setItems] = useState<OmadaIncidentItem[]>([...initialIncidents]);
  const [filter, setFilter] = useState<'all' | OmadaIncidentCategory>('all');

  const unreadCount = useMemo(() => items.filter((item) => item.unread).length, [items]);
  const filtered = useMemo(
    () => (filter === 'all' ? items : items.filter((item) => item.category === filter)),
    [items, filter],
  );

  const handleMarkAllRead = () => {
    setItems((prev) => prev.map((item) => ({ ...item, unread: false })));
    onUnreadCountChange?.(0);
  };

  return (
    <div className={`tp-omada-screen ${className}`.trim()} style={style}>
      {showHeader && (
        <TPHeader
          variant="floating"
          title="Logs"
          subtitle="Alerts & Site Events"
          left={
            onBack ? (
              <button
                type="button"
                className="tp-omada-glass-btn"
                onClick={onBack}
                aria-label="Back"
              >
                <TPIcon name="nav-back" size={20} />
              </button>
            ) : undefined
          }
          right={
            unreadCount > 0 ? (
              <TPButton variant="text" size="sm" onClick={handleMarkAllRead}>
                Mark All Read
              </TPButton>
            ) : undefined
          }
        />
      )}

      <div className="tp-omada-scroll">
        <div className="tp-omada-body">
          <div className="tp-omada-chip-group">
            {FILTERS.map((f) => (
              <TPTag key={f.key} selected={filter === f.key} onClick={() => setFilter(f.key)}>
                {f.label}
              </TPTag>
            ))}
          </div>

          <TPSectionHeader
            title="Event Timeline"
            count={filtered.length}
            action={
              unreadCount > 0 ? (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--tp-focus)',
                    fontSize: 13,
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  Mark All Read ({unreadCount})
                </button>
              ) : undefined
            }
          />

          {filtered.length === 0 ? (
            <TPEmptyState
              illustration="no-data"
              title="No Events"
              description="No logs match the selected category."
              compact
            />
          ) : (
            <TPListCard divided>
              {filtered.map((item) => (
                <TPListItem
                  key={item.id}
                  leading={
                    <TPIcon
                      name={
                        item.severity === 'error'
                          ? 'status-error-solid'
                          : CATEGORY_ICON[item.category]
                      }
                      size={22}
                    />
                  }
                  title={
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <span>{item.title}</span>
                      {item.unread && <span className="tp-omada-dot tp-omada-dot--alert" />}
                    </span>
                  }
                  subtitle={item.description}
                  value={item.timestamp}
                  onClick={() => {
                    if (!item.unread) return;
                    setItems((prev) => {
                      const next = prev.map((entry) =>
                        entry.id === item.id ? { ...entry, unread: false } : entry,
                      );
                      onUnreadCountChange?.(next.filter((entry) => entry.unread).length);
                      return next;
                    });
                  }}
                />
              ))}
            </TPListCard>
          )}
        </div>
      </div>
    </div>
  );
};
