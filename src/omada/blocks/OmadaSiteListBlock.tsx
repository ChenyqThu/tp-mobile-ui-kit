import React, { useMemo, useState } from 'react';
import { TPTag } from '../../core/components/TPTag';
import { TPListCard } from '../../core/components/TPListCard';
import { TPListItem } from '../../core/components/TPListItem';
import { TPSearchBar } from '../../core/components/TPSearchBar';
import { TPEmptyState } from '../../core/components/TPEmptyState';
import { TPBadge } from '../../core/components/TPBadge';
import { TPIcon } from '../../assets-lib';
import '../../styles/tp-omada.css';

export interface OmadaSiteItem {
  id: string;
  name: string;
  region?: string;
  controllerKind?: 'Cloud' | 'Local' | 'Hardware';
  devicesOnline: number;
  devicesTotal: number;
  clientsCount: number;
  alerts?: number;
  status?: 'healthy' | 'warning' | 'offline';
}

export const DEFAULT_OMADA_SITES: readonly OmadaSiteItem[] = [
  {
    id: 'site-default',
    name: 'HQ Campus — Bldg 2',
    region: 'US-West · Cloud Based',
    controllerKind: 'Cloud',
    devicesOnline: 24,
    devicesTotal: 25,
    clientsCount: 186,
    alerts: 2,
    status: 'warning',
  },
  {
    id: 'site-retail',
    name: 'Retail Flagship #04',
    region: 'San Jose · OC300',
    controllerKind: 'Hardware',
    devicesOnline: 12,
    devicesTotal: 12,
    clientsCount: 94,
    alerts: 0,
    status: 'healthy',
  },
  {
    id: 'site-warehouse',
    name: 'Warehouse Logistics',
    region: 'Austin · Local',
    controllerKind: 'Local',
    devicesOnline: 6,
    devicesTotal: 8,
    clientsCount: 41,
    alerts: 1,
    status: 'warning',
  },
];

export interface OmadaSiteListBlockProps {
  sites?: readonly OmadaSiteItem[];
  activeSiteId?: string;
  searchable?: boolean;
  onSelectSite?: (site: OmadaSiteItem) => void;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Reusable Omada site switcher & multi-site overview list with alert counts, online device ratio, and search.
 */
export const OmadaSiteListBlock: React.FC<OmadaSiteListBlockProps> = ({
  sites = DEFAULT_OMADA_SITES,
  activeSiteId = sites[0]?.id,
  searchable = true,
  onSelectSite,
  className = '',
  style,
}) => {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sites;
    return sites.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.region ?? '').toLowerCase().includes(q) ||
        (s.controllerKind ?? '').toLowerCase().includes(q),
    );
  }, [sites, query]);

  return (
    <div
      className={`tp-omada-site-list ${className}`.trim()}
      data-testid="omada-site-list-block"
      style={style}
    >
      {searchable && (
        <div style={{ marginBottom: 10 }}>
          <TPSearchBar
            value={query}
            placeholder="Search sites"
            onChange={setQuery}
          />
        </div>
      )}

      {filtered.length === 0 ? (
        <TPEmptyState
          size="compact"
          illustration="no-devices"
          title="No Sites Found"
          description="No site matches your filter criteria."
        />
      ) : (
        <TPListCard divided>
          {filtered.map((site) => {
            const isSelected = site.id === activeSiteId;
            return (
              <TPListItem
                key={site.id}
                leading={<TPIcon name="cloud-standard" size={28} />}
                title={
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <span>{site.name}</span>
                    {site.controllerKind && (
                      <TPTag
                        size="xs"
                        shape="rect"
                        tone={site.controllerKind === 'Cloud' ? 'focus' : 'neutral'}
                      >
                        {site.controllerKind}
                      </TPTag>
                    )}
                  </span>
                }
                subtitle={`${site.devicesOnline}/${site.devicesTotal} devices · ${site.clientsCount} clients`}
                description={site.region}
                trailing={
                  site.alerts && site.alerts > 0 ? (
                    <TPBadge count={site.alerts} tone="alert" />
                  ) : undefined
                }
                checked={isSelected}
                onClick={() => onSelectSite?.(site)}
              />
            );
          })}
        </TPListCard>
      )}
    </div>
  );
};
