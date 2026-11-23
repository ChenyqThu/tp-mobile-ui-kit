import React, { useMemo, useState } from 'react';
import type { TPMenuItem } from '../../core/types';
import { TPHeader } from '../../core/components/TPHeader';
import { TPSearchBar } from '../../core/components/TPSearchBar';
import { TPSectionHeader } from '../../core/components/TPSectionHeader';
import { TPListCard } from '../../core/components/TPListCard';
import { TPListItem } from '../../core/components/TPListItem';
import { TPMenu } from '../../core/components/TPMenu';
import { TPEmptyState } from '../../core/components/TPEmptyState';
import { TPBottomSheet } from '../../core/components/TPBottomSheet';
import { TPButton } from '../../core/components/TPButton';
import { TPIcon } from '../../assets-lib';
import { OmadaStandardInput } from '../components/OmadaStandardInput';
import '../../styles/tp-omada.css';

export type OmadaControllerKind = 'cloud' | 'software' | 'hardware';

export interface OmadaControllerItem {
  id: string;
  name: string;
  edition: string;
  version: string;
  kind: OmadaControllerKind;
  ips?: string;
  systemGroup: 'Cloud Management' | 'Local Controllers';
}

export const DEFAULT_OMADA_CONTROLLERS: readonly OmadaControllerItem[] = [
  {
    id: 'ctrl-1',
    name: '26-PD自测-CBC-MSP',
    edition: 'Omada Standard',
    version: 'v6.3.0.200',
    kind: 'cloud',
    systemGroup: 'Cloud Management',
  },
  {
    id: 'ctrl-2',
    name: '26楼-PD自测-MSP',
    edition: 'Omada Standard',
    version: 'v6.2.10.17',
    kind: 'software',
    ips: '192.168.22.11, 192.168.40.1, 192.168.174.1',
    systemGroup: 'Cloud Management',
  },
  {
    id: 'ctrl-3',
    name: '62',
    edition: 'ER7212PC',
    version: 'v6.3.0.63',
    kind: 'hardware',
    ips: '192.168.0.1, 192.168.1.203',
    systemGroup: 'Cloud Management',
  },
  {
    id: 'ctrl-4',
    name: 'Omada Controller_F84012',
    edition: 'Omada Essentials',
    version: 'v6.3.0.200',
    kind: 'cloud',
    systemGroup: 'Cloud Management',
  },
  {
    id: 'ctrl-5',
    name: 'Omada Controller_office',
    edition: 'Omada Standard',
    version: 'v6.3.0.200',
    kind: 'cloud',
    systemGroup: 'Cloud Management',
  },
];

const CloudControllerGraphic: React.FC = () => (
  <svg width="38" height="38" viewBox="0 0 40 40" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id="tpOmadaCloudBody" x1="20" y1="10" x2="20" y2="30" gradientUnits="userSpaceOnUse">
        <stop stopColor="#E4E4E7" />
        <stop offset="1" stopColor="#8E8E93" />
      </linearGradient>
    </defs>
    <path
      d="M12.5 28.5H28.5C32.09 28.5 35 25.68 35 22.2C35 18.96 32.47 16.31 29.22 15.96C28.14 11.98 24.48 9.05 20.12 9.05C14.88 9.05 10.64 13.18 10.64 18.28C10.64 18.42 10.64 18.56 10.65 18.7C7.46 19.27 5 22.02 5 25.35C5 27.1 5.95 28.5 12.5 28.5Z"
      fill="url(#tpOmadaCloudBody)"
    />
    <rect x="17" y="22" width="6" height="2" rx="1" fill="#00A870" />
  </svg>
);

const ControllerLeadingVisual: React.FC<{ kind: OmadaControllerKind }> = ({ kind }) => {
  if (kind === 'software') {
    return (
      <span style={{ color: '#8E8E93', display: 'inline-flex' }}>
        <TPIcon name="client-controller" size={38} color="#8E8E93" />
      </span>
    );
  }
  if (kind === 'hardware') {
    return (
      <span className="tp-omada-ctrl-thumb-wrap">
        <TPIcon name="client-switch" size={38} />
        <span className="tp-omada-ctrl-mini-badge" aria-hidden="true">
          <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
            <rect x="1" y="1" width="3" height="3" rx="0.6" fill="currentColor" />
            <rect x="6" y="1" width="3" height="3" rx="0.6" fill="currentColor" />
            <rect x="1" y="6" width="3" height="3" rx="0.6" fill="currentColor" />
            <rect x="6" y="6" width="3" height="3" rx="0.6" fill="currentColor" />
          </svg>
        </span>
      </span>
    );
  }
  return <CloudControllerGraphic />;
};

export interface OmadaControllerListPageProps {
  controllers?: readonly OmadaControllerItem[];
  onSelectController?: (controller: OmadaControllerItem) => void;
  onAddController?: () => void;
  onAvatarClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

type SystemFilterKey = 'all' | 'standard' | 'essentials' | 'hardware';

const SYSTEM_FILTER_OPTIONS: readonly { key: SystemFilterKey; label: string }[] = [
  { key: 'all', label: 'All Systems' },
  { key: 'standard', label: 'Omada Standard' },
  { key: 'essentials', label: 'Omada Essentials' },
  { key: 'hardware', label: 'Hardware Controllers' },
];

/**
 * 1:1 restoration of `controllerlist.png`: green `C` avatar, `All Systems` TPMenu filter, `+` add button,
 * `TPSearchBar`, `Cloud Management (5)` section header, and all 5 real Omada controllers.
 */
export const OmadaControllerListPage: React.FC<OmadaControllerListPageProps> = ({
  controllers = DEFAULT_OMADA_CONTROLLERS,
  onSelectController,
  onAddController,
  onAvatarClick,
  className = '',
  style,
}) => {
  const [search, setSearch] = useState('');
  const [systemFilter, setSystemFilter] = useState<SystemFilterKey>('all');
  const [menuOpen, setMenuOpen] = useState(false);
  const [addSheetOpen, setAddSheetOpen] = useState(false);
  const [newCtrlIp, setNewCtrlIp] = useState('192.168.0.10');

  const selectedFilterLabel =
    SYSTEM_FILTER_OPTIONS.find((opt) => opt.key === systemFilter)?.label ?? 'All Systems';

  const menuItems: TPMenuItem[] = useMemo(
    () =>
      SYSTEM_FILTER_OPTIONS.map((opt) => ({
        key: opt.key,
        label: opt.label,
        selected: systemFilter === opt.key,
      })),
    [systemFilter],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return controllers.filter((ctrl) => {
      if (systemFilter === 'standard' && ctrl.edition !== 'Omada Standard') return false;
      if (systemFilter === 'essentials' && ctrl.edition !== 'Omada Essentials') return false;
      if (systemFilter === 'hardware' && ctrl.kind !== 'hardware') return false;
      if (!q) return true;
      return (
        ctrl.name.toLowerCase().includes(q) ||
        ctrl.edition.toLowerCase().includes(q) ||
        ctrl.version.toLowerCase().includes(q) ||
        (ctrl.ips ? ctrl.ips.toLowerCase().includes(q) : false)
      );
    });
  }, [controllers, search, systemFilter]);

  const handleAddClick = () => {
    if (onAddController) {
      onAddController();
    } else {
      setAddSheetOpen(true);
    }
  };

  return (
    <div
      className={`tp-omada-screen ${className}`.trim()}
      data-testid="omada-controller-list-page"
      style={style}
    >
      <div className="tp-omada-header-wrap">
        <TPHeader
          variant="floating"
          title={selectedFilterLabel}
          titleDropdown
          onTitleClick={() => setMenuOpen((prev) => !prev)}
          left={
            <button
              type="button"
              className="tp-header-icon-btn"
              aria-label="Account profile"
              onClick={onAvatarClick}
            >
              <span className="tp-omada-avatar-c">C</span>
            </button>
          }
          right={
            <button
              type="button"
              className="tp-header-icon-btn"
              aria-label="Add controller"
              onClick={handleAddClick}
            >
              <TPIcon name="nav-add" size={20} />
            </button>
          }
        />

        <TPMenu
          open={menuOpen}
          align="center"
          items={menuItems}
          onSelect={(item) => setSystemFilter(item.key as SystemFilterKey)}
          onClose={() => setMenuOpen(false)}
        />
      </div>

      <div className="tp-omada-scroll">
        <div className="tp-omada-body">
          <TPSearchBar
            value={search}
            placeholder="Search"
            onChange={setSearch}
            onSearch={setSearch}
          />

          <TPSectionHeader title="Cloud Management" count={filtered.length} />

          {filtered.length === 0 ? (
            <TPEmptyState
              illustration="no-controllers"
              title="No Controllers Found"
              description="No matching Omada controllers found."
              compact
            />
          ) : (
            <TPListCard divided>
              {filtered.map((ctrl) => (
                <TPListItem
                  key={ctrl.id}
                  leading={<ControllerLeadingVisual kind={ctrl.kind} />}
                  title={ctrl.name}
                  subtitle={`${ctrl.edition} | ${ctrl.version}`}
                  description={ctrl.ips}
                  onClick={() => onSelectController?.(ctrl)}
                />
              ))}
            </TPListCard>
          )}
        </div>
      </div>

      <TPBottomSheet
        open={addSheetOpen}
        title="Add Controller"
        subtitle="Connect via Cloud Access or Local IP"
        onClose={() => setAddSheetOpen(false)}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <OmadaStandardInput
            type="ip"
            label="Controller IP Address"
            value={newCtrlIp}
            onChange={setNewCtrlIp}
          />
          <TPButton variant="primary" block onClick={() => setAddSheetOpen(false)}>
            Connect Controller
          </TPButton>
        </div>
      </TPBottomSheet>
    </div>
  );
};
