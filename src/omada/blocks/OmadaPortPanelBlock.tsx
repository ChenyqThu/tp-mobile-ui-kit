import React, { useState } from 'react';
import { TPHeader } from '../../core/components/TPHeader';
import { TPListCard } from '../../core/components/TPListCard';
import { TPListItem } from '../../core/components/TPListItem';
import { TPSectionHeader } from '../../core/components/TPSectionHeader';
import { TPSwitch } from '../../core/components/TPSwitch';
import { TPTag } from '../../core/components/TPTag';
import { TPIcon, TPMotion } from '../../assets-lib';
import '../../styles/tp-omada.css';

export type OmadaPortMedia = 'rj45' | 'sfp';
export type OmadaPortSpeed = '2.5G' | '1000M' | '100M' | 'Down';

export interface OmadaHardwarePort {
  id: string;
  label: string;
  media: OmadaPortMedia;
  speed: OmadaPortSpeed;
  poeCapable?: boolean;
  poeEnabled?: boolean;
  poeWatts?: number;
  vlanProfile: string;
  rxBytes: string;
  txBytes: string;
}

export const DEFAULT_OMADA_PORTS: readonly OmadaHardwarePort[] = [
  { id: 'sfp1', label: 'SFP1', media: 'sfp', speed: 'Down', vlanProfile: 'WAN1', rxBytes: '0 B', txBytes: '0 B' },
  { id: 'sfp2', label: 'SFP2', media: 'sfp', speed: 'Down', vlanProfile: 'WAN2', rxBytes: '0 B', txBytes: '0 B' },
  { id: 'wan3', label: 'WAN3', media: 'rj45', speed: '1000M', vlanProfile: 'ISP WAN3', rxBytes: '18.6 GB', txBytes: '6.4 GB' },
  { id: 'lan4', label: 'LAN4', media: 'rj45', speed: '1000M', vlanProfile: 'LAN (1)', rxBytes: '2.1 GB', txBytes: '1.9 GB' },
  {
    id: 'lan5',
    label: 'LAN5',
    media: 'rj45',
    speed: '2.5G',
    poeCapable: true,
    poeEnabled: true,
    poeWatts: 12.4,
    vlanProfile: 'Trunk (1,10)',
    rxBytes: '1.8 GB',
    txBytes: '4.1 GB',
  },
  {
    id: 'lan6',
    label: 'LAN6',
    media: 'rj45',
    speed: '2.5G',
    poeCapable: true,
    poeEnabled: true,
    poeWatts: 11.8,
    vlanProfile: 'Trunk (1,10)',
    rxBytes: '1.2 GB',
    txBytes: '2.7 GB',
  },
  {
    id: 'lan7',
    label: 'LAN7',
    media: 'rj45',
    speed: 'Down',
    poeCapable: true,
    poeEnabled: false,
    poeWatts: 0,
    vlanProfile: 'LAN (1)',
    rxBytes: '0 B',
    txBytes: '0 B',
  },
  {
    id: 'lan8',
    label: 'LAN8',
    media: 'rj45',
    speed: '100M',
    poeCapable: true,
    poeEnabled: true,
    poeWatts: 4.2,
    vlanProfile: 'IoT (VLAN 20)',
    rxBytes: '410 MB',
    txBytes: '128 MB',
  },
];

const VLAN_PROFILES = ['LAN (1)', 'Trunk (1,10)', 'IoT (VLAN 20)', 'ISP WAN3'] as const;

export interface OmadaPortPanelBlockProps {
  deviceModel?: string;
  ports?: readonly OmadaHardwarePort[];
  showHeader?: boolean;
  onBack?: () => void;
  onPortUpdate?: (updated: OmadaHardwarePort) => void;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Reusable Omada v5.3+ hardware port panel (`SMBNET-4185` / `SMBNET-4057`) showing RJ45 & SFP+
 * physical faceplate indicators, PoE wattage badges, VLAN assignment, and interactive inspection.
 */
export const OmadaPortPanelBlock: React.FC<OmadaPortPanelBlockProps> = ({
  deviceModel = 'ER7212PC',
  ports: initialPorts = DEFAULT_OMADA_PORTS,
  showHeader = false,
  onBack,
  onPortUpdate,
  className = '',
  style,
}) => {
  const [ports, setPorts] = useState<OmadaHardwarePort[]>(() => initialPorts.map((p) => ({ ...p })));
  const [selectedId, setSelectedId] = useState<string>(initialPorts[4]?.id ?? initialPorts[0]?.id ?? 'wan3');

  const activePort = ports.find((p) => p.id === selectedId) ?? ports[0];

  const updatePort = (patch: Partial<OmadaHardwarePort>) => {
    if (!activePort) return;
    const updated: OmadaHardwarePort = { ...activePort, ...patch };
    setPorts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    onPortUpdate?.(updated);
  };

  const totalPoeWatts = ports.reduce((acc, p) => acc + (p.poeEnabled ? (p.poeWatts ?? 0) : 0), 0);

  return (
    <div
      className={showHeader ? `tp-omada-screen ${className}`.trim() : className}
      data-testid="omada-port-panel-block"
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
            action={<span style={{ fontSize: 12 }}>{totalPoeWatts.toFixed(1)} W PoE</span>}
          />

          <section className="tp-omada-chassis" aria-label={`${deviceModel} physical port matrix`}>
            <div className="tp-omada-chassis-grid">
              {ports.map((port) => {
                const isSelected = port.id === activePort?.id;
                const statusTone =
                  port.speed === 'Down' ? 'down' : port.speed === '100M' ? 'warn' : 'up';
                return (
                  <button
                    key={port.id}
                    type="button"
                    aria-pressed={isSelected}
                    className={`tp-omada-chassis-port ${
                      isSelected ? 'tp-omada-chassis-port--selected' : ''
                    }`.trim()}
                    onClick={() => setSelectedId(port.id)}
                  >
                    <span className={`tp-omada-port-led tp-omada-port-led--${statusTone}`} />
                    <TPIcon
                      name={port.media === 'sfp' ? 'port-sfp2' : port.poeEnabled ? 'port-poe' : 'port-lan'}
                      size={20}
                    />
                    <span className="tp-omada-port-name">{port.label}</span>
                    <span className="tp-omada-port-speed">{port.speed}</span>
                    {port.poeEnabled && port.poeWatts !== undefined && (
                      <span className="tp-omada-port-poe">⚡ {port.poeWatts}W</span>
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          {activePort && (
            <section className="tp-omada-card" aria-label="Selected Port Configuration">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                <TPMotion
                  key={activePort.id}
                  name="port-card-expand"
                  width={68}
                  height={68}
                  playing
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 16, fontWeight: 600 }}>{activePort.label}</div>
                  <div style={{ fontSize: 13, color: 'var(--tp-color-green)', marginTop: 2 }}>
                    Link: {activePort.speed === 'Down' ? 'Link Down' : `${activePort.speed} Full Duplex`}
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
    </div>
  );
};
