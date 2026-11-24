import React, { useMemo, useState } from 'react';
import type { TPSegmentOption } from '../../core/types';
import { TPHeader } from '../../core/components/TPHeader';
import { TPSegment } from '../../core/components/TPSegment';
import { TPListCard } from '../../core/components/TPListCard';
import { TPListItem } from '../../core/components/TPListItem';
import { TPSectionHeader } from '../../core/components/TPSectionHeader';
import { TPButton } from '../../core/components/TPButton';
import { TPSwitch } from '../../core/components/TPSwitch';
import { TPBottomSheet } from '../../core/components/TPBottomSheet';
import { TPIcon, TPMotion, type TPIconName } from '../../assets-lib';
import { OmadaStandardInput } from '../components/OmadaStandardInput';
import { OmadaPortPanelBlock } from '../blocks/OmadaPortPanelBlock';
import {
  DEFAULT_OMADA_DEVICES,
  OmadaDeviceThumb,
  type OmadaDeviceRecord,
} from '../blocks/OmadaDeviceListBlock';
import '../../styles/tp-omada.css';

export interface OmadaDeviceDetailPageProps {
  device?: OmadaDeviceRecord;
  onBack?: () => void;
  onSaveConfig?: (updated: OmadaDeviceRecord) => void;
  className?: string;
  style?: React.CSSProperties;
}

type DetailTab = 'overview' | 'ports' | 'config';

const DETAIL_TABS: readonly TPSegmentOption[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'ports', label: 'Ports' },
  { key: 'config', label: 'Config' },
];

interface PortSpec {
  id: string;
  label: string;
  icon: TPIconName;
  link: string;
  poe: string;
  vlan: string;
  rx: string;
  tx: string;
}

function getPortsForDevice(device: OmadaDeviceRecord): readonly PortSpec[] {
  if (device.type === 'ap') {
    return [
      { id: 'eth1', label: 'ETH1 (2.5G)', icon: 'port-poe', link: '2500M Full', poe: '12.4 W (802.3at)', vlan: 'VLAN 1, 10', rx: '4.12 GB', tx: '1.88 GB' },
      { id: 'eth2', label: 'ETH2', icon: 'port-lan', link: 'Link Down', poe: 'Disabled', vlan: 'VLAN 1', rx: '0 B', tx: '0 B' },
    ];
  }
  return [
    { id: 'sfp1', label: 'SFP1', icon: 'port-sfp2', link: 'Link Down', poe: 'N/A', vlan: 'WAN1', rx: '0 B', tx: '0 B' },
    { id: 'sfp2', label: 'SFP2', icon: 'port-sfp2', link: 'Link Down', poe: 'N/A', vlan: 'WAN2', rx: '0 B', tx: '0 B' },
    { id: 'wan3', label: 'WAN3', icon: 'port-wan', link: '1000M Full', poe: 'N/A', vlan: 'ISP WAN3', rx: '18.6 GB', tx: '6.4 GB' },
    { id: 'lan4', label: 'WAN/LAN4', icon: 'port-lan', link: '1000M Full', poe: 'N/A', vlan: 'LAN', rx: '2.1 GB', tx: '1.9 GB' },
    { id: 'lan5', label: 'LAN5', icon: 'port-poe', link: '1000M Full', poe: '12.4 W', vlan: 'Trunk (1,10)', rx: '1.8 GB', tx: '4.1 GB' },
    { id: 'lan6', label: 'LAN6', icon: 'port-poe', link: '1000M Full', poe: '11.8 W', vlan: 'Trunk (1,10)', rx: '1.2 GB', tx: '2.7 GB' },
    { id: 'lan7', label: 'LAN7', icon: 'port-lan', link: 'Link Down', poe: '0 W', vlan: 'VLAN 1', rx: '0 B', tx: '0 B' },
    { id: 'lan8', label: 'LAN8', icon: 'port-lan', link: 'Link Down', poe: '0 W', vlan: 'VLAN 1', rx: '0 B', tx: '0 B' },
  ];
}

/**
 * Full Device Detail screen supporting Overview (with `update-network` Firmware Upgrade sheet),
 * interactive Ports grid (playing `port-card-expand` PAG motion), and Config (`OmadaStandardInput` IP/MAC/Port).
 */
export const OmadaDeviceDetailPage: React.FC<OmadaDeviceDetailPageProps> = ({
  device = DEFAULT_OMADA_DEVICES[1],
  onBack,
  onSaveConfig,
  className = '',
  style,
}) => {
  const [tab, setTab] = useState<DetailTab>('overview');
  const ports = useMemo(() => getPortsForDevice(device), [device]);
  const [selectedPortId, setSelectedPortId] = useState<string>(ports[0]?.id ?? 'eth1');

  const [alias, setAlias] = useState(device.name ?? device.mac);
  const [staticIp, setStaticIp] = useState(device.ip);
  const [mgmtMac, setMgmtMac] = useState(device.mac);
  const [mgmtPort, setMgmtPort] = useState('443');
  const [ledEnabled, setLedEnabled] = useState(true);
  const [savedNotice, setSavedNotice] = useState(false);

  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [upgraded, setUpgraded] = useState(false);

  const activePort = ports.find((p) => p.id === selectedPortId) ?? ports[0];

  const handleSave = () => {
    setSavedNotice(true);
    onSaveConfig?.({
      ...device,
      name: alias,
      ip: staticIp,
      mac: mgmtMac,
    });
  };

  return (
    <div
      className={`tp-omada-screen ${className}`.trim()}
      data-testid="omada-device-detail-page"
      style={style}
    >
      <div className="tp-omada-header-wrap">
        <TPHeader
          variant="floating"
          title={alias}
          subtitle={`${device.model} • ${device.ip}`}
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
          right={
            <button
              type="button"
              className="tp-header-icon-btn"
              aria-label="Upgrade firmware"
              onClick={() => {
                setUpgraded(false);
                setUpgradeOpen(true);
              }}
            >
              <TPIcon name="nav-refresh" size={19} />
            </button>
          }
        />

        <div className="tp-omada-header-subbar">
          <TPSegment
            variant="underline"
            fullWidth
            options={DETAIL_TABS}
            value={tab}
            onChange={(k) => setTab(k as DetailTab)}
          />
        </div>
      </div>

      <div className="tp-omada-scroll">
        <div className="tp-omada-body tp-omada-body--with-subbar">
          {tab === 'overview' && (
            <>
              <section className="tp-omada-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <OmadaDeviceThumb type={device.type} size={48} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 16, fontWeight: 600 }}>{device.model}</div>
                    <div style={{ fontSize: 13, color: 'var(--tp-text-secondary)', marginTop: 2 }}>
                      MAC: {device.mac}
                    </div>
                  </div>
                  <span className="tp-omada-status-line tp-omada-status-line--good">
                    Connected
                  </span>
                </div>

                {device.upgradeAvailable && (
                  <div style={{ marginTop: 14 }}>
                    <TPButton
                      variant="primary"
                      size="md"
                      block
                      onClick={() => {
                        setUpgraded(false);
                        setUpgradeOpen(true);
                      }}
                    >
                      {`Upgrade Firmware (${device.firmwareVersion ?? 'v1.2.0'} → ${device.targetVersion ?? 'v1.3.2'})`}
                    </TPButton>
                  </div>
                )}
              </section>

              <TPSectionHeader title="Device Telemetry" />
              <TPListCard divided>
                <TPListItem title="IP Address" value={staticIp} />
                <TPListItem title="Health" value={device.healthLabel} />
                <TPListItem
                  title="Firmware Version"
                  value={upgraded ? (device.targetVersion ?? 'v1.3.2') : (device.firmwareVersion ?? 'v6.3.0.63')}
                />
                <TPListItem title="Uptime" value={device.uptime ?? '14d 11h 09m'} />
                <TPListItem title="CPU Utilization" value={`${device.cpuPct ?? 5}%`} />
                <TPListItem title="Memory Utilization" value={`${device.memoryPct ?? 39}%`} />
              </TPListCard>
            </>
          )}

          {tab === 'ports' &&
            (device.type === 'ap' ? (
              <>
                <TPSectionHeader title="Select a Port to Inspect" />
                <section className="tp-omada-card">
                  <div className="tp-omada-port-grid">
                    {ports.map((port) => {
                      const active = port.id === activePort.id;
                      return (
                        <button
                          key={port.id}
                          type="button"
                          className={`tp-omada-port-tile ${active ? 'tp-omada-port-tile--active' : ''}`.trim()}
                          onClick={() => setSelectedPortId(port.id)}
                        >
                          <TPIcon name={port.icon} size={20} />
                          <span style={{ fontWeight: 500 }}>{port.label}</span>
                          <span style={{ fontSize: 10, color: 'var(--tp-text-secondary)' }}>
                            {port.link === 'Link Down' ? 'Down' : 'Up'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </section>

                {activePort && (
                  <section className="tp-omada-card" aria-label="Selected Port Details">
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
                          width={76}
                          height={76}
                          playing
                        />
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 16, fontWeight: 600 }}>{activePort.label}</div>
                        <div style={{ fontSize: 13, color: 'var(--tp-color-green)', marginTop: 2 }}>
                          {activePort.link}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--tp-text-secondary)', marginTop: 2 }}>
                          {activePort.vlan} • PoE: {activePort.poe}
                        </div>
                      </div>
                    </div>
                    <TPListCard divided>
                      <TPListItem title="Rx Bytes" value={activePort.rx} />
                      <TPListItem title="Tx Bytes" value={activePort.tx} />
                    </TPListCard>
                  </section>
                )}
              </>
            ) : (
              <OmadaPortPanelBlock showHeader={false} deviceModel={device.model} />
            ))}

          {tab === 'config' && (
            <>
              <TPSectionHeader title="Static IP & Management" />
              <TPListCard divided>
                <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <OmadaStandardInput
                    type="text"
                    label="Device Name"
                    value={alias}
                    onChange={setAlias}
                  />
                  <OmadaStandardInput
                    type="ip"
                    label="Static IP Address"
                    value={staticIp}
                    onChange={setStaticIp}
                  />
                  <OmadaStandardInput
                    type="mac"
                    label="Management MAC"
                    value={mgmtMac}
                    onChange={setMgmtMac}
                  />
                  <OmadaStandardInput
                    type="port"
                    label="Management Port"
                    value={mgmtPort}
                    onChange={setMgmtPort}
                  />
                </div>
                <TPListItem
                  title="Device LED"
                  subtitle={ledEnabled ? 'Status LED On' : 'Status LED Off'}
                  trailing={
                    <TPSwitch checked={ledEnabled} onChange={setLedEnabled} ariaLabel="Device LED" />
                  }
                />
              </TPListCard>

              <TPButton variant="primary" block onClick={handleSave}>
                Save Configuration
              </TPButton>

              {savedNotice && (
                <div
                  style={{
                    padding: '10px 12px',
                    borderRadius: 8,
                    background: 'var(--tp-focus-10)',
                    color: 'var(--tp-focus)',
                    fontSize: 13,
                    textAlign: 'center',
                  }}
                >
                  Saved configuration for {alias} ({staticIp})
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <TPBottomSheet
        open={upgradeOpen}
        title={upgraded ? 'Firmware Up to Date' : `Upgrade ${device.model}`}
        subtitle={`${device.firmwareVersion ?? 'v1.2.0'} → ${device.targetVersion ?? 'v1.3.2'}`}
        onClose={() => setUpgradeOpen(false)}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 14,
            padding: '8px 0 12px',
          }}
        >
          <TPMotion name="update-network" width={112} height={112} playing={!upgraded} />
          <div style={{ fontSize: 14, textAlign: 'center', color: 'var(--tp-text-secondary-alt)' }}>
            {upgraded
              ? `${device.model} (${device.mac}) is now running ${device.targetVersion ?? 'v1.3.2'}.`
              : `Downloading and verifying signed firmware image for ${device.mac}…`}
          </div>
          {!upgraded ? (
            <TPButton variant="primary" block onClick={() => setUpgraded(true)}>
              Apply Firmware Update
            </TPButton>
          ) : (
            <TPButton variant="secondary" block onClick={() => setUpgradeOpen(false)}>
              Done
            </TPButton>
          )}
        </div>
      </TPBottomSheet>
    </div>
  );
};
