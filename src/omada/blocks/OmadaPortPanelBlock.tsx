import React, { useState } from 'react';
import { TPIconButton } from '../../core/components/TPIconButton';
import { TPHeader } from '../../core/components/TPHeader';
import { TPLegendSheet } from '../../core/components/TPInfoSheet';
import { TPListCard } from '../../core/components/TPListCard';
import { TPListItem } from '../../core/components/TPListItem';
import { TPSectionHeader } from '../../core/components/TPSectionHeader';
import { TPSwitch } from '../../core/components/TPSwitch';
import { TPTag } from '../../core/components/TPTag';
import type { TPLegendItem } from '../../core/types';
import { TPIcon, type TPIconName, TPMotion } from '../../assets-lib';
import '../../styles/tp-omada.css';

export type OmadaPortMedia = 'rj45' | 'sfp';

export type OmadaPortSpeed =
  | '10/100M'
  | '1G'
  | '2.5G'
  | '5G'
  | '10G'
  | '25G'
  | '40G'
  | '100G'
  | 'Disabled'
  | 'Disconnected'
  | '100M'
  | '1000M'
  | 'Down';

export type OmadaPortBadgeType =
  | 'wan'
  | 'poe'
  | 'poe-bt'
  | 'sfp'
  | 'sfp-plus'
  | 'uplink'
  | 'lag'
  | 'mirror'
  | 'mirroring'
  | 'stp-blocking'
  | 'stp-discard'
  | 'loop'
  | 'blocked'
  | 'disabled'
  | 'disconnected'
  | 'stack'
  | 'console';

export interface OmadaHardwarePort {
  id: string;
  label: string;
  portNumber?: number;
  media: OmadaPortMedia;
  speed: OmadaPortSpeed;
  poeCapable?: boolean;
  poeEnabled?: boolean;
  poeWatts?: number;
  badges?: readonly OmadaPortBadgeType[];
  lagGroup?: string;
  vlanProfile: string;
  rxBytes: string;
  txBytes: string;
}

const PORT_SPEED_COLORS: Record<OmadaPortSpeed, string> = {
  '10/100M': 'var(--tp-port-100m, #F9B200)',
  '100M': 'var(--tp-port-100m, #F9B200)',
  '1G': 'var(--tp-port-1g, #95CC00)',
  '1000M': 'var(--tp-port-1g, #95CC00)',
  '2.5G': 'var(--tp-port-2-5g, #00D076)',
  '5G': 'var(--tp-port-5g, #00A870)',
  '10G': 'var(--tp-port-10g, #00C9D4)',
  '25G': 'var(--tp-port-25g, #009CFE)',
  '40G': 'var(--tp-port-40g, #4C73FF)',
  '100G': 'var(--tp-port-100g, #D562FF)',
  Disabled: 'var(--tp-port-disabled, #777777)',
  Disconnected: 'var(--tp-port-disconnected, rgba(153, 153, 153, 0.32))',
  Down: 'var(--tp-port-disconnected, rgba(153, 153, 153, 0.32))',
};

export function getOmadaPortSpeedColor(speed: OmadaPortSpeed): string {
  return PORT_SPEED_COLORS[speed] ?? 'var(--tp-port-disconnected)';
}

const PORT_BADGE_ICON_MAP: Record<OmadaPortBadgeType, TPIconName> = {
  wan: 'port-wan',
  poe: 'port-poe',
  'poe-bt': 'port-poe',
  sfp: 'port-sfp2',
  'sfp-plus': 'port-sfp2',
  uplink: 'port-uplink',
  lag: 'port-lag',
  mirror: 'port-mirror',
  mirroring: 'port-mirroring',
  'stp-blocking': 'port-stp-blocking',
  'stp-discard': 'stp-discard',
  loop: 'port-loop',
  blocked: 'port-port-blocking',
  disabled: 'port-port-disable',
  disconnected: 'port-port-disable',
  stack: 'port-stack',
  console: 'port-port',
};

export function getOmadaPortBadgeIcon(badge: OmadaPortBadgeType): TPIconName {
  return PORT_BADGE_ICON_MAP[badge] ?? 'port-port';
}

export const DEFAULT_OMADA_PORTS: readonly OmadaHardwarePort[] = [
  { id: 'sfp1', label: 'SFP1', portNumber: 9, media: 'sfp', speed: '10G', badges: ['sfp-plus', 'uplink'], vlanProfile: 'WAN1', rxBytes: '18.2 GB', txBytes: '6.1 GB' },
  { id: 'sfp2', label: 'SFP2', portNumber: 10, media: 'sfp', speed: 'Down', badges: ['sfp', 'disconnected'], vlanProfile: 'WAN2', rxBytes: '0 B', txBytes: '0 B' },
  { id: 'wan3', label: 'WAN3', portNumber: 1, media: 'rj45', speed: '1000M', badges: ['wan'], vlanProfile: 'ISP WAN3', rxBytes: '18.6 GB', txBytes: '6.4 GB' },
  { id: 'lan4', label: 'LAN4', portNumber: 2, media: 'rj45', speed: '1000M', badges: ['lag'], lagGroup: 'LAG1', vlanProfile: 'LAN (1)', rxBytes: '2.1 GB', txBytes: '1.9 GB' },
  {
    id: 'lan5',
    label: 'LAN5',
    portNumber: 3,
    media: 'rj45',
    speed: '2.5G',
    poeCapable: true,
    poeEnabled: true,
    poeWatts: 12.4,
    badges: ['poe', 'uplink'],
    vlanProfile: 'Trunk (1,10)',
    rxBytes: '1.8 GB',
    txBytes: '4.1 GB',
  },
  {
    id: 'lan6',
    label: 'LAN6',
    portNumber: 4,
    media: 'rj45',
    speed: '2.5G',
    poeCapable: true,
    poeEnabled: true,
    poeWatts: 11.8,
    badges: ['poe'],
    vlanProfile: 'Trunk (1,10)',
    rxBytes: '1.2 GB',
    txBytes: '2.7 GB',
  },
  {
    id: 'lan7',
    label: 'LAN7',
    portNumber: 5,
    media: 'rj45',
    speed: 'Down',
    poeCapable: true,
    poeEnabled: false,
    poeWatts: 0,
    badges: ['stp-discard'],
    vlanProfile: 'LAN (1)',
    rxBytes: '0 B',
    txBytes: '0 B',
  },
  {
    id: 'lan8',
    label: 'LAN8',
    portNumber: 6,
    media: 'rj45',
    speed: '100M',
    poeCapable: true,
    poeEnabled: true,
    poeWatts: 4.2,
    badges: ['poe', 'mirror'],
    vlanProfile: 'IoT (VLAN 20)',
    rxBytes: '410 MB',
    txBytes: '128 MB',
  },
];

const VLAN_PROFILES = ['LAN (1)', 'Trunk (1,10)', 'IoT (VLAN 20)', 'ISP WAN3'] as const;

const PORT_LEGEND_ITEMS: readonly TPLegendItem[] = [
  { key: '10/100M', label: '10/100 Mbps', color: 'var(--tp-port-100m, #F9B200)' },
  { key: '1G', label: '1 Gbps', color: 'var(--tp-port-1g, #95CC00)' },
  { key: '2.5G', label: '2.5 Gbps', color: 'var(--tp-port-2-5g, #00D076)' },
  { key: '5G', label: '5 Gbps', color: 'var(--tp-port-5g, #00A870)' },
  { key: '10G', label: '10 Gbps', color: 'var(--tp-port-10g, #00C9D4)' },
  { key: '25G', label: '25 Gbps', color: 'var(--tp-port-25g, #009CFE)' },
  { key: '40G', label: '40 Gbps', color: 'var(--tp-port-40g, #4C73FF)' },
  { key: '100G', label: '100 Gbps', color: 'var(--tp-port-100g, #D562FF)' },
  { key: 'Disabled', label: 'Disabled', color: 'var(--tp-port-disabled, #777777)' },
  { key: 'Disconnected', label: 'Disconnected', color: 'var(--tp-port-disconnected)' },
  { key: 'poe', label: 'PoE Supplying', icon: <TPIcon name="port-poe" size={18} /> },
  { key: 'uplink', label: 'Uplink', icon: <TPIcon name="port-uplink" size={18} /> },
  { key: 'lag', label: 'LAG Member', icon: <TPIcon name="port-lag" size={18} /> },
  { key: 'stp-discard', label: 'STP Discarding', icon: <TPIcon name="stp-discard" size={18} /> },
];

export interface OmadaPortLegendSheetProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
}

/**
 * Standardized Omada Port Panel speed color & badge icon legend sheet (`TPLegendSheet`).
 */
export const OmadaPortLegendSheet: React.FC<OmadaPortLegendSheetProps> = ({
  open,
  onClose,
  title = 'Port Color & Status Legend',
}) => (
  <TPLegendSheet
    open={open}
    title={title}
    subtitle="10 Omada speed grades and physical port badges"
    items={PORT_LEGEND_ITEMS}
    columns={2}
    onClose={onClose}
  />
);

export interface OmadaPortPanelBlockProps {
  deviceModel?: string;
  ports?: readonly OmadaHardwarePort[];
  layout?: 'single-row' | 'dual-row';
  showHeader?: boolean;
  showLegendButton?: boolean;
  onBack?: () => void;
  onPortUpdate?: (updated: OmadaHardwarePort) => void;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Reusable Omada v5.3+ hardware port panel (`SMBNET-4185` / `SMBNET-4057`) supporting 10 Omada speed
 * colors, 17 port badge types, single-row & dual-row switch faceplates, legend sheet, PoE & VLAN controls.
 */
export const OmadaPortPanelBlock: React.FC<OmadaPortPanelBlockProps> = ({
  deviceModel = 'ER7212PC',
  ports: initialPorts = DEFAULT_OMADA_PORTS,
  layout = 'single-row',
  showHeader = false,
  showLegendButton = true,
  onBack,
  onPortUpdate,
  className = '',
  style,
}) => {
  const [ports, setPorts] = useState<OmadaHardwarePort[]>(() => initialPorts.map((p) => ({ ...p })));
  const [selectedId, setSelectedId] = useState<string>(initialPorts[4]?.id ?? initialPorts[0]?.id ?? 'wan3');
  const [legendOpen, setLegendOpen] = useState(false);

  const activePort = ports.find((p) => p.id === selectedId) ?? ports[0];

  const updatePort = (patch: Partial<OmadaHardwarePort>) => {
    if (!activePort) return;
    const updated: OmadaHardwarePort = { ...activePort, ...patch };
    setPorts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    onPortUpdate?.(updated);
  };

  const totalPoeWatts = ports.reduce((acc, p) => acc + (p.poeEnabled ? (p.poeWatts ?? 0) : 0), 0);

  const rj45Ports = ports.filter((p) => p.media !== 'sfp');
  const sfpPorts = ports.filter((p) => p.media === 'sfp');
  const topRowPorts = layout === 'dual-row' ? rj45Ports.filter((_, idx) => idx % 2 === 0) : ports;
  const bottomRowPorts = layout === 'dual-row' ? rj45Ports.filter((_, idx) => idx % 2 === 1) : [];

  const renderPortTile = (port: OmadaHardwarePort) => {
    const isSelected = port.id === activePort?.id;
    const ledColor = getOmadaPortSpeedColor(port.speed);
    const isDown = port.speed === 'Down' || port.speed === 'Disconnected' || port.speed === 'Disabled';
    const primaryBadge = port.badges?.[0];
    const mainIconName =
      port.media === 'sfp' ? 'port-sfp2' : port.poeEnabled ? 'port-poe' : 'port-lan';

    return (
      <button
        key={port.id}
        type="button"
        aria-pressed={isSelected}
        data-port-id={port.id}
        data-port-speed={port.speed}
        className={`tp-omada-chassis-port ${
          isSelected ? 'tp-omada-chassis-port--selected' : ''
        } ${isDown ? 'tp-omada-chassis-port--down' : ''}`.trim()}
        onClick={() => setSelectedId(port.id)}
      >
        <span
          className="tp-omada-port-led"
          style={{ backgroundColor: ledColor }}
          aria-hidden="true"
        />
        <span className="tp-omada-port-speed-bar" style={{ backgroundColor: ledColor }} aria-hidden="true" />
        <TPIcon name={mainIconName} size={20} />
        <span className="tp-omada-port-name">{port.label}</span>
        <span className="tp-omada-port-speed">{port.speed}</span>
        {primaryBadge && (
          <span className="tp-omada-port-badge-row" title={primaryBadge}>
            <TPIcon name={getOmadaPortBadgeIcon(primaryBadge)} size={12} />
            {port.badges && port.badges.length > 1 && (
              <span className="tp-omada-port-badge-more">+{port.badges.length - 1}</span>
            )}
          </span>
        )}
        {port.poeEnabled && port.poeWatts !== undefined && (
          <span className="tp-omada-port-poe">⚡ {port.poeWatts}W</span>
        )}
      </button>
    );
  };

  return (
    <div
      className={showHeader ? `tp-omada-screen ${className}`.trim() : className}
      data-testid="omada-port-panel-block"
      data-layout={layout}
      style={style}
    >
      {showHeader && (
        <div className="tp-omada-header-wrap">
          <TPHeader
            variant="floating"
            title={`${deviceModel} Ports`}
            subtitle={`PoE Budget ${totalPoeWatts.toFixed(1)} W / 110 W`}
            left={
              onBack ? (
                <button
                  type="button"
                  className="tp-header-icon-btn"
                  aria-label="Back"
                  onClick={onBack}
                >
                  <TPIcon name="nav-back" size={20} />
                </button>
              ) : undefined
            }
          />
        </div>
      )}

      <div className={showHeader ? 'tp-omada-scroll' : undefined}>
        <div
          className={showHeader ? 'tp-omada-body' : undefined}
          style={!showHeader ? { display: 'flex', flexDirection: 'column', gap: 12 } : undefined}
        >
          <TPSectionHeader
            title={`${deviceModel} Port Faceplate`}
            action={
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12 }}>{totalPoeWatts.toFixed(1)} W PoE</span>
                {showLegendButton && (
                  <TPIconButton
                    variant="tonal"
                    size="sm"
                    icon={<TPIcon name="nav-info" size={14} />}
                    ariaLabel="Port Legend"
                    onClick={() => setLegendOpen(true)}
                  />
                )}
              </div>
            }
          />

          <section className="tp-omada-chassis" aria-label={`${deviceModel} physical port matrix`}>
            {layout === 'dual-row' ? (
              <div className="tp-omada-chassis-dual">
                <div className="tp-omada-chassis-rj45-rows">
                  <div className="tp-omada-chassis-row">
                    {topRowPorts.map(renderPortTile)}
                  </div>
                  <div className="tp-omada-chassis-row">
                    {bottomRowPorts.map(renderPortTile)}
                  </div>
                </div>
                {sfpPorts.length > 0 && (
                  <div className="tp-omada-chassis-sfp-col" aria-label="SFP uplink ports">
                    {sfpPorts.map(renderPortTile)}
                  </div>
                )}
              </div>
            ) : (
              <div className="tp-omada-chassis-grid">
                {ports.map(renderPortTile)}
              </div>
            )}
          </section>

          {activePort && (
            <section className="tp-omada-card" aria-label="Selected Port Configuration">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                <span
                  style={{
                    display: 'inline-flex',
                    borderRadius: 10,
                    overflow: 'hidden',
                    background: '#F5F7FA',
                    flexShrink: 0,
                  }}
                >
                  <TPMotion
                    key={activePort.id}
                    name="port-card-expand"
                    width={68}
                    height={68}
                    playing
                  />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 16, fontWeight: 600 }}>{activePort.label}</span>
                    {activePort.lagGroup && (
                      <TPTag size="xs" shape="rect" tone="info">
                        {activePort.lagGroup}
                      </TPTag>
                    )}
                    {activePort.badges?.map((badge) => (
                      <TPTag key={badge} size="xs" shape="rect" tone="neutral">
                        {badge}
                      </TPTag>
                    ))}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color:
                        activePort.speed === 'Down' ||
                        activePort.speed === 'Disconnected' ||
                        activePort.speed === 'Disabled'
                          ? 'var(--tp-text-secondary)'
                          : getOmadaPortSpeedColor(activePort.speed),
                      marginTop: 2,
                      fontWeight: 500,
                    }}
                  >
                    Link:{' '}
                    {activePort.speed === 'Down' || activePort.speed === 'Disconnected'
                      ? 'Link Down'
                      : activePort.speed === 'Disabled'
                        ? 'Disabled'
                        : `${activePort.speed} Full Duplex`}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--tp-text-secondary)', marginTop: 2 }}>
                    Profile: {activePort.vlanProfile}
                  </div>
                </div>
              </div>

              <TPListCard divided>
                {activePort.poeCapable && (
                  <TPListItem
                    title="PoE Power Output"
                    subtitle={
                      activePort.poeEnabled
                        ? `Supplying ${activePort.poeWatts ?? 0} W (802.3at)`
                        : 'PoE Disabled'
                    }
                    trailing={
                      <TPSwitch
                        checked={Boolean(activePort.poeEnabled)}
                        onChange={(next) =>
                          updatePort({
                            poeEnabled: next,
                            poeWatts: next ? activePort.poeWatts || 11.5 : 0,
                          })
                        }
                        ariaLabel={`Toggle PoE on ${activePort.label}`}
                      />
                    }
                  />
                )}
                <TPListItem title="Rx / Tx Counters" value={`${activePort.rxBytes} / ${activePort.txBytes}`} />
              </TPListCard>

              <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span className="tp-omada-std-input-label">Assign VLAN Profile</span>
                <div className="tp-omada-chip-group">
                  {VLAN_PROFILES.map((profile) => (
                    <TPTag
                      key={profile}
                      size="sm"
                      selected={activePort.vlanProfile === profile}
                      onClick={() => updatePort({ vlanProfile: profile })}
                    >
                      {profile}
                    </TPTag>
                  ))}
                </div>
              </div>
            </section>
          )}
        </div>
      </div>

      <OmadaPortLegendSheet open={legendOpen} onClose={() => setLegendOpen(false)} />
    </div>
  );
};
