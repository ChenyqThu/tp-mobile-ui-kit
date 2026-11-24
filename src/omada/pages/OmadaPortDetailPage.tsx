import React, { useState } from 'react';
import { TPListCard } from '../../core/components/TPListCard';
import { TPListItem } from '../../core/components/TPListItem';
import { TPSectionHeader } from '../../core/components/TPSectionHeader';
import { TPSwitch } from '../../core/components/TPSwitch';
import { TPTag } from '../../core/components/TPTag';
import { OmadaChartCard } from '../blocks/OmadaChartCard';
import {
  DEFAULT_OMADA_PORTS,
  getOmadaPortSpeedColor,
  type OmadaHardwarePort,
} from '../blocks/OmadaPortPanelBlock';
import { OmadaConfigFormPage } from './OmadaConfigFormPage';
import '../../styles/tp-omada.css';

const PORT_LINK_MODES = ['Auto', '2.5G Full', '1G Full', '100M Full', 'Disabled'] as const;
const PORT_PROFILES = ['LAN (1)', 'Trunk (1,10)', 'IoT (VLAN 20)', 'ISP WAN3'] as const;

export interface OmadaPortDetailPageProps {
  port?: OmadaHardwarePort;
  deviceModel?: string;
  onSave?: (updated: OmadaHardwarePort) => void;
  onBack?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Dedicated Switch/Gateway Port Detail & Edit screen with status badges, speed/duplex selector,
 * PoE output switch, VLAN profile picker, and Rx/Tx traffic spark chart.
 */
export const OmadaPortDetailPage: React.FC<OmadaPortDetailPageProps> = ({
  port: initialPort = DEFAULT_OMADA_PORTS[4],
  deviceModel = 'ER7212PC',
  onSave,
  onBack,
  className = '',
  style,
}) => {
  const [port, setPort] = useState<OmadaHardwarePort>(initialPort);
  const [linkMode, setLinkMode] = useState<string>('Auto');
  const [dirty, setDirty] = useState(false);

  const patchPort = (patch: Partial<OmadaHardwarePort>) => {
    setPort((prev) => ({ ...prev, ...patch }));
    setDirty(true);
  };

  return (
    <OmadaConfigFormPage
      title={`${port.label} Settings`}
      subtitle={deviceModel}
      mode="edit"
      dirty={dirty}
      onBack={onBack}
      onSave={() => {
        onSave?.(port);
        setDirty(false);
      }}
      className={className}
      style={style}
    >
      <div data-testid="omada-port-detail-page" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <section className="tp-omada-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <div>
              <div style={{ fontSize: 17, fontWeight: 600 }}>{port.label}</div>
              <div style={{ fontSize: 13, color: getOmadaPortSpeedColor(port.speed), marginTop: 2, fontWeight: 500 }}>
                {port.speed === 'Disabled'
                  ? 'Administratively Disabled'
                  : port.speed === 'Down' || port.speed === 'Disconnected'
                    ? 'Disconnected'
                    : `Connected · ${port.speed} Full Duplex`}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              {port.badges?.map((b) => (
                <TPTag key={b} size="xs" shape="rect" tone={b === 'poe' ? 'warning' : 'focus'}>
                  {b}
                </TPTag>
              ))}
            </div>
          </div>
        </section>

        <OmadaChartCard
          title="Port Throughput"
          subtitle={`Rx ${port.rxBytes} · Tx ${port.txBytes}`}
          type="area"
          unit="Mbps"
          labels={['10m', '8m', '6m', '4m', '2m', 'Now']}
          series={[
            { key: 'rx', label: 'Rx', color: '#00A870', values: [42, 68, 55, 84, 72, 96] },
            { key: 'tx', label: 'Tx', color: '#0069CB', values: [18, 24, 21, 35, 29, 38] },
          ]}
        />

        <TPSectionHeader title="Physical Configuration" />
        <TPListCard divided>
          <TPListItem
            layout="form-field"
            title="Native / Port Profile"
            value={port.vlanProfile}
          />
          {port.poeCapable && (
            <TPListItem
              title="PoE Output"
              subtitle={port.poeEnabled ? `${port.poeWatts ?? 0} W active` : 'Off'}
              trailing={
                <TPSwitch
                  checked={Boolean(port.poeEnabled)}
                  onChange={(checked) => {
                    patchPort({
                      poeEnabled: checked,
                      poeWatts: checked ? port.poeWatts || 11.5 : 0,
                    });
                  }}
                  ariaLabel="Toggle PoE output"
                />
              }
            />
          )}
        </TPListCard>

        <section className="tp-omada-card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <span className="tp-omada-std-input-label">Link Speed & Duplex</span>
          <div className="tp-omada-chip-group">
            {PORT_LINK_MODES.map((m) => (
              <TPTag
                key={m}
                size="sm"
                selected={linkMode === m}
                tone={m === 'Disabled' ? 'alert' : 'focus'}
                onClick={() => {
                  setLinkMode(m);
                  patchPort({
                    speed:
                      m === 'Disabled'
                        ? 'Disabled'
                        : m === '2.5G Full'
                          ? '2.5G'
                          : m === '1G Full'
                            ? '1G'
                            : m === '100M Full'
                              ? '10/100M'
                              : port.speed === 'Disabled'
                                ? '2.5G'
                                : port.speed,
                  });
                }}
              >
                {m}
              </TPTag>
            ))}
          </div>

          <span className="tp-omada-std-input-label" style={{ marginTop: 4 }}>
            Port Profile
          </span>
          <div className="tp-omada-chip-group">
            {PORT_PROFILES.map((profile) => (
              <TPTag
                key={profile}
                size="sm"
                selected={port.vlanProfile === profile}
                onClick={() => patchPort({ vlanProfile: profile })}
              >
                {profile}
              </TPTag>
            ))}
          </div>
        </section>
      </div>
    </OmadaConfigFormPage>
  );
};
