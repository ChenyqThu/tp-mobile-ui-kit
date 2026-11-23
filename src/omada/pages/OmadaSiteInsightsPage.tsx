import React, { useMemo, useState } from 'react';
import type { TPMenuItem, TPSegmentOption } from '../../core/types';
import { TPHeader } from '../../core/components/TPHeader';
import { TPSegment } from '../../core/components/TPSegment';
import { TPTabBar } from '../../core/components/TPTabBar';
import { TPMenu } from '../../core/components/TPMenu';
import { TPIcon } from '../../assets-lib';
import { OMADA_SITE_TABS, type OmadaSiteTabKey } from '../blocks/OmadaDeviceListBlock';
import '../../styles/tp-omada.css';

export type OmadaInsightsTabKey = 'wired' | 'wireless' | 'client' | 'apps';

export interface OmadaSiteInsightsPageProps {
  activeTab?: OmadaSiteTabKey;
  onTabChange?: (tab: OmadaSiteTabKey) => void;
  showTabBar?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const INSIGHTS_SEGMENTS: readonly TPSegmentOption[] = [
  { key: 'wired', label: 'Wired' },
  { key: 'wireless', label: 'Wireless' },
  { key: 'client', label: 'Client' },
  { key: 'apps', label: 'Apps' },
];

const RANGE_OPTIONS = [
  { key: '24h', label: 'Last 24 Hours', start: 'Nov 22, 06:55 PM', end: 'Nov 23, 06:45 PM' },
  { key: '7d', label: 'Last 7 Days', start: 'Nov 16, 06:55 PM', end: 'Nov 23, 06:45 PM' },
  { key: '30d', label: 'Last 30 Days', start: 'Oct 24, 06:55 PM', end: 'Nov 23, 06:45 PM' },
] as const;

const WAN_PORTS = ['WAN3', 'SFP WAN/LAN1', 'All WANs'] as const;

const HISTOGRAM_HEIGHTS = [
  3, 4, 3, 5, 3, 4, 6, 4, 3, 4, 3, 4, 3, 5, 4, 3, 4, 3, 4, 6, 8, 5, 11, 14, 18, 12, 22, 26,
  34, 48, 28, 18, 22, 16, 20, 14, 18, 24, 15, 20, 16, 26, 30, 19, 14, 12, 16, 11, 8, 6,
];

/**
 * 1:1 restoration of `SiteInsights.png`: floating `Insights` header with calendar range button,
 * 4 underline tabs (`Wired`, `Wireless`, `Client`, `Apps`), `ISP Load` dual-axis histogram + latency pulse,
 * `WAN Health Trend`, `Gateway Utilization`, and `Switch Health Trend`.
 */
export const OmadaSiteInsightsPage: React.FC<OmadaSiteInsightsPageProps> = ({
  activeTab = 'insights',
  onTabChange,
  showTabBar = true,
  className = '',
  style,
}) => {
  const [segment, setSegment] = useState<OmadaInsightsTabKey>('wired');
  const [wanPort, setWanPort] = useState<(typeof WAN_PORTS)[number]>('WAN3');
  const [wanMenuOpen, setWanMenuOpen] = useState(false);
  const [dateRangeKey, setDateRangeKey] = useState<'24h' | '7d' | '30d'>('24h');
  const [calendarMenuOpen, setCalendarMenuOpen] = useState(false);

  const activeRange = RANGE_OPTIONS.find((r) => r.key === dateRangeKey) ?? RANGE_OPTIONS[0];

  const calendarMenuItems: TPMenuItem[] = useMemo(
    () =>
      RANGE_OPTIONS.map((r) => ({
        key: r.key,
        label: r.label,
        selected: r.key === dateRangeKey,
      })),
    [dateRangeKey],
  );

  const wanMenuItems: TPMenuItem[] = useMemo(
    () =>
      WAN_PORTS.map((port) => ({
        key: port,
        label: port,
        selected: port === wanPort,
      })),
    [wanPort],
  );

  return (
    <div
      className={`tp-omada-screen ${showTabBar ? 'tp-omada-screen--standalone' : ''} ${className}`.trim()}
      data-testid="omada-site-insights-page"
      style={style}
    >
      <div className="tp-omada-header-wrap">
        <TPHeader
          variant="floating"
          title="Insights"
          right={
            <button
              type="button"
              className="tp-header-icon-btn"
              aria-label="Select date range"
              onClick={() => setCalendarMenuOpen((prev) => !prev)}
            >
              <TPIcon name="nav-calendar" size={19} />
            </button>
          }
        />

        <TPMenu
          open={calendarMenuOpen}
          align="right"
          items={calendarMenuItems}
          onSelect={(item) => setDateRangeKey(item.key as '24h' | '7d' | '30d')}
          onClose={() => setCalendarMenuOpen(false)}
        />
      </div>

      <TPSegment
        variant="underline"
        fullWidth
        options={INSIGHTS_SEGMENTS}
        value={segment}
        onChange={(key) => setSegment(key as OmadaInsightsTabKey)}
      />

      <div className="tp-omada-scroll">
        <div className={`tp-omada-body ${showTabBar ? 'tp-omada-body--with-tabbar' : ''}`.trim()}>
          {segment === 'wired' && (
            <>
              {/* Card 1: ISP Load */}
              <section className="tp-omada-card" aria-label="ISP Load">
                <div className="tp-omada-card-header" style={{ position: 'relative' }}>
                  <h3 className="tp-omada-card-title">ISP Load</h3>
                  <button
                    type="button"
                    onClick={() => setWanMenuOpen((prev) => !prev)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      border: 'none',
                      background: 'transparent',
                      color: 'var(--tp-color-green)',
                      fontSize: 13,
                      fontWeight: 500,
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    <span>{wanPort}</span>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                      <path
                        d="M3 4.5L6 7.5L9 4.5"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>

                  <TPMenu
                    open={wanMenuOpen}
                    align="right"
                    items={wanMenuItems}
                    onSelect={(item) => setWanPort(item.key as (typeof WAN_PORTS)[number])}
                    onClose={() => setWanMenuOpen(false)}
                  />
                </div>

                <div className="tp-omada-legend-col" style={{ marginTop: 8 }}>
                  <div className="tp-omada-legend-row">
                    <span className="tp-omada-legend-item">
                      <span className="tp-omada-legend-dot" style={{ background: 'var(--tp-color-green)' }} />
                      <span>Throughput</span>
                    </span>
                    <span className="tp-omada-legend-item">
                      <svg width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden="true">
                        <path d="M1 8L4.5 3.5L7.5 7L10 2L13 8" stroke="#4D94FF" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span>Latency</span>
                    </span>
                  </div>
                </div>

                <div style={{ marginTop: 8 }}>
                  <div className="tp-omada-chart-axis-row">
                    <span>20 Mbps</span>
                    <span>4 msec</span>
                  </div>

                  <div style={{ position: 'relative', marginTop: 4 }}>
                    <svg
                      viewBox="0 0 320 110"
                      width="100%"
                      height="110"
                      preserveAspectRatio="none"
                      aria-label="ISP Load Throughput and Latency chart"
                      style={{ display: 'block' }}
                    >
                      <line x1="0" y1="12" x2="320" y2="12" stroke="var(--tp-omada-chart-grid)" strokeDasharray="3 3" />
                      <line x1="0" y1="58" x2="320" y2="58" stroke="var(--tp-omada-chart-grid)" strokeDasharray="3 3" />
                      <line x1="0" y1="104" x2="320" y2="104" stroke="var(--tp-omada-chart-grid)" />

                      {/* Green throughput bars */}
                      {HISTOGRAM_HEIGHTS.map((h, i) => {
                        const x = 14 + i * 5.8;
                        const scaled = wanPort === 'SFP WAN/LAN1' ? Math.max(2, h * 0.25) : h * 1.45;
                        return (
                          <rect
                            key={i}
                            x={x}
                            y={104 - scaled}
                            width="2.4"
                            height={scaled}
                            fill="#00A870"
                            fillOpacity="0.45"
                          />
                        );
                      })}

                      {/* Latency blue pulse waveform */}
                      <polyline
                        fill="none"
                        stroke="#4D94FF"
                        strokeWidth="1.35"
                        points="0,34 10,34 12,56 16,34 28,34 31,12 34,34 42,34 45,56 48,34 54,10 58,34 72,34 75,56 79,34 86,56 90,34 104,34 107,56 111,34 114,56 118,34 134,34 137,56 141,34 148,56 152,34 174,34 177,56 181,34 196,34 200,56 204,34 208,56 212,34 224,34 227,56 231,34 246,34 249,56 253,34 266,34 269,56 273,34 286,34 289,56 293,34 320,34"
                      />
                    </svg>

                    <div
                      style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        top: 40,
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: 11,
                        color: 'var(--tp-text-secondary)',
                        pointerEvents: 'none',
                      }}
                    >
                      <span>10</span>
                      <span>2</span>
                    </div>
                  </div>

                  <div className="tp-omada-chart-axis-row" style={{ marginTop: 2 }}>
                    <span>0</span>
                    <span>0</span>
                  </div>
                  <div className="tp-omada-chart-axis-row" style={{ marginTop: 4 }}>
                    <span>{activeRange.start}</span>
                    <span>{activeRange.end}</span>
                  </div>
                </div>
              </section>

              {/* Card 2: WAN Health Trend */}
              <section className="tp-omada-card" aria-label="WAN Health Trend">
                <div className="tp-omada-card-header">
                  <h3 className="tp-omada-card-title">WAN Health Trend</h3>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--tp-text-secondary)' }}>
                    <span>1</span>
                    <span
                      style={{
                        display: 'inline-block',
                        width: 44,
                        height: 5,
                        borderRadius: 999,
                        background: 'linear-gradient(90deg, #00A870 0%, #FF8C27 62%, #EE385C 100%)',
                      }}
                    />
                    <span>10</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14 }}>
                  <span style={{ fontSize: 12, color: 'var(--tp-text-secondary)', width: 38 }}>WAN3</span>
                  <div
                    style={{
                      flex: 1,
                      height: 6,
                      borderRadius: 999,
                      background: 'var(--tp-color-green)',
                    }}
                  />
                </div>
                <div className="tp-omada-chart-axis-row" style={{ marginTop: 6, paddingLeft: 48 }}>
                  <span>Nov 22, 07:00 PM</span>
                  <span>Nov 23, 06:40 PM</span>
                </div>
              </section>

              {/* Card 3: Gateway Utilization */}
              <section className="tp-omada-card" aria-label="Gateway Utilization">
                <div className="tp-omada-card-header">
                  <h3 className="tp-omada-card-title">Gateway Utilization</h3>
                </div>
                <div className="tp-omada-legend-row" style={{ marginTop: 6 }}>
                  <span className="tp-omada-legend-item">
                    <svg width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden="true">
                      <path d="M1 8L4.5 3.5L7.5 7L10 2L13 8" stroke="var(--tp-color-green)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>CPU</span>
                  </span>
                  <span className="tp-omada-legend-item">
                    <svg width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden="true">
                      <path d="M1 8L4.5 3.5L7.5 7L10 2L13 8" stroke="#4D94FF" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>Memory</span>
                  </span>
                </div>

                <div style={{ marginTop: 6 }}>
                  <div className="tp-omada-chart-axis-row">
                    <span>100%</span>
                    <span />
                  </div>
                  <div style={{ position: 'relative' }}>
                    <svg
                      viewBox="0 0 320 90"
                      width="100%"
                      height="90"
                      preserveAspectRatio="none"
                      aria-label="Gateway CPU and Memory utilization chart"
                      style={{ display: 'block' }}
                    >
                      <line x1="0" y1="8" x2="320" y2="8" stroke="var(--tp-omada-chart-grid)" strokeDasharray="3 3" />
                      <line x1="0" y1="44" x2="320" y2="44" stroke="var(--tp-omada-chart-grid)" strokeDasharray="3 3" />
                      <line x1="0" y1="82" x2="320" y2="82" stroke="var(--tp-omada-chart-grid)" />

                      {/* Memory blue flat-with-ripple */}
                      <polyline
                        fill="none"
                        stroke="#4D94FF"
                        strokeWidth="1.5"
                        points="0,58 84,58 88,54 92,58 100,55 104,58 112,55 116,58 124,55 128,58 320,58"
                      />
                      {/* CPU green low baseline with tiny spikes */}
                      <polyline
                        fill="none"
                        stroke="#00A870"
                        strokeWidth="1.4"
                        points="0,81 56,81 60,76 63,81 68,74 71,81 200,81 204,76 208,81 264,81 268,75 272,81 320,81"
                      />
                    </svg>
                    <span
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: 32,
                        fontSize: 11,
                        color: 'var(--tp-text-secondary)',
                      }}
                    >
                      50%
                    </span>
                  </div>
                  <div className="tp-omada-chart-axis-row">
                    <span>0%</span>
                    <span />
                  </div>
                  <div className="tp-omada-chart-axis-row" style={{ marginTop: 4 }}>
                    <span>{activeRange.start}</span>
                    <span>{activeRange.end}</span>
                  </div>
                </div>
              </section>

              {/* Card 4: Switch Health Trend preview */}
              <section className="tp-omada-card" aria-label="Switch Health Trend">
                <div className="tp-omada-card-header">
                  <h3 className="tp-omada-card-title">Switch Health Trend</h3>
                </div>
                <div className="tp-omada-legend-row" style={{ marginTop: 8 }}>
                  <span className="tp-omada-legend-item">
                    <span className="tp-omada-legend-dot" style={{ background: 'var(--tp-color-green)' }} />
                    <span>Good</span>
                  </span>
                  <span className="tp-omada-legend-item">
                    <span className="tp-omada-legend-dot" style={{ background: 'var(--tp-color-yellow)' }} />
                    <span>Fair</span>
                  </span>
                  <span className="tp-omada-legend-item">
                    <span className="tp-omada-legend-dot" style={{ background: 'var(--tp-color-alert)' }} />
                    <span>Poor</span>
                  </span>
                  <span className="tp-omada-legend-item">
                    <span className="tp-omada-legend-dot" style={{ background: 'var(--tp-text-disabled)' }} />
                    <span>No Data</span>
                  </span>
                </div>
              </section>
            </>
          )}

          {segment === 'wireless' && (
            <section className="tp-omada-card">
              <h3 className="tp-omada-card-title">Wi-Fi Channel Utilization</h3>
              <div className="tp-omada-card-subtitle">EAP723 (2 APs active across 2.4 / 5 / 6 GHz)</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 14 }}>
                {[
                  { band: '2.4 GHz (Ch 6)', util: 28, color: 'var(--tp-color-yellow)' },
                  { band: '5 GHz (Ch 36)', util: 14, color: 'var(--tp-color-green)' },
                  { band: '6 GHz (Ch 37)', util: 6, color: 'var(--tp-color-green)' },
                ].map((item) => (
                  <div key={item.band} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    <div className="tp-omada-chart-axis-row">
                      <span>{item.band}</span>
                      <span>{item.util}%</span>
                    </div>
                    <div className="tp-omada-health-bar-track" style={{ height: 7 }}>
                      <div
                        style={{
                          width: `${item.util}%`,
                          height: '100%',
                          background: item.color,
                          borderRadius: 999,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {segment === 'client' && (
            <section className="tp-omada-card">
              <h3 className="tp-omada-card-title">Top Clients by Traffic</h3>
              <div className="tp-omada-card-subtitle">Active clients during {activeRange.label}</div>
              <div className="tp-omada-isp-list">
                {[
                  { name: 'Mac (192.168.0.13)', traffic: '1.84 GB' },
                  { name: 'appleiPad (192.168.0.8)', traffic: '642 MB' },
                  { name: '92-Sarabande (192.168.0.12)', traffic: '118 MB' },
                  { name: 'ChimePro-19 (192.168.0.11)', traffic: '24 MB' },
                ].map((row) => (
                  <div key={row.name} className="tp-omada-isp-row">
                    <span>{row.name}</span>
                    <span style={{ color: 'var(--tp-color-green)', fontWeight: 500 }}>{row.traffic}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {segment === 'apps' && (
            <section className="tp-omada-card">
              <h3 className="tp-omada-card-title">Application Traffic</h3>
              <div className="tp-omada-card-subtitle">DPI protocol classification</div>
              <div className="tp-omada-isp-list">
                {[
                  { app: 'HTTPS / TLS', share: '54%' },
                  { app: 'Video Streaming', share: '24%' },
                  { app: 'Cloud Backup', share: '14%' },
                  { app: 'DNS / NTP', share: '8%' },
                ].map((row) => (
                  <div key={row.app} className="tp-omada-isp-row">
                    <span>{row.app}</span>
                    <span style={{ color: 'var(--tp-text-secondary)' }}>{row.share}</span>
                  </div>
                ))}
              </div>
            </section>
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
    </div>
  );
};
