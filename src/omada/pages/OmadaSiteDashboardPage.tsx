import React, { useMemo, useState } from 'react';
import type { TPMenuItem } from '../../core/types';
import { TPHeader } from '../../core/components/TPHeader';
import { TPTabBar } from '../../core/components/TPTabBar';
import { TPMenu } from '../../core/components/TPMenu';
import { TPBottomSheet } from '../../core/components/TPBottomSheet';
import { TPButton } from '../../core/components/TPButton';
import { TPLiquidGlass } from '../../core/components/TPLiquidGlass';
import { TPIcon, type TPIconName } from '../../assets-lib';
import {
  OMADA_SITE_TABS,
  type OmadaSiteTabKey,
} from '../blocks/OmadaDeviceListBlock';
import { OmadaTopologyBlock } from '../blocks/OmadaTopologyBlock';
import '../../styles/tp-omada.css';

export interface OmadaSiteDashboardPageProps {
  siteName?: string;
  controllerName?: string;
  unreadLogsCount?: number;
  activeTab?: OmadaSiteTabKey;
  onTabChange?: (tab: OmadaSiteTabKey) => void;
  onSiteChange?: (site: string) => void;
  onBackToGlobal?: () => void;
  onOpenLogs?: () => void;
  onOpenHealthDetail?: () => void;
  onOpenInsights?: () => void;
  onOpenDevices?: () => void;
  onOpenClients?: () => void;
  onToolkitClick?: () => void;
  showTabBar?: boolean;
  showFloatingAction?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const SITE_OPTIONS = ['92', '92-Lab', 'Branch-West', 'HQ-Core'] as const;

const TOOLKIT_ACTIONS: readonly { key: string; label: string; icon: TPIconName; summary: string }[] = [
  { key: 'speed', label: 'Speed Test', icon: 'tool-speed-test', summary: 'WAN3: 942 Mbps ↓ / 418 Mbps ↑' },
  { key: 'ping', label: 'Ping Test', icon: 'tool-ping-test', summary: '1.1.1.1 avg 3.2 ms • 0% loss' },
  { key: 'tracert', label: 'Traceroute', icon: 'tool-tracert', summary: '4 hops to edge POP (3.4 ms)' },
  { key: 'wifi-scan', label: 'Wi-Fi Scan', icon: 'tool-wi-fi-scan', summary: '5 GHz Ch 36 optimal (12% util)' },
  { key: 'roaming', label: 'Roaming Test', icon: 'tool-roaming-test', summary: '802.11k/v/r fast transition < 18 ms' },
  { key: 'iface', label: 'Port Detect', icon: 'tool-interface-detection', summary: 'ER7212PC WAN3 1000M Full' },
];

/**
 * 1:1 restoration of `siteDashboard.png`: floating site selector header (`92 ⌄ / 62`, log badge `1`),
 * 4 KPI tiles + Topology CTA, Site Health Score (`100` + 3 subcards + timeline scrubber),
 * ISP Activity (`SFP WAN/LAN1`, `WAN3`), Internet Activity dual-series chart, Toolkit FAB, and floating TabBar.
 */
export const OmadaSiteDashboardPage: React.FC<OmadaSiteDashboardPageProps> = ({
  siteName = '92',
  controllerName = '62',
  unreadLogsCount = 1,
  activeTab = 'dashboard',
  onTabChange,
  onSiteChange,
  onBackToGlobal,
  onOpenLogs,
  onOpenHealthDetail,
  onOpenInsights,
  onOpenDevices,
  onOpenClients,
  onToolkitClick,
  showTabBar = true,
  showFloatingAction = true,
  className = '',
  style,
}) => {
  const [currentSite, setCurrentSite] = useState(siteName);
  const [siteMenuOpen, setSiteMenuOpen] = useState(false);
  const [topoOpen, setTopoOpen] = useState(false);
  const [toolkitOpen, setToolkitOpen] = useState(false);
  const [activeToolSummary, setActiveToolSummary] = useState<string | null>(null);

  const siteMenuItems: TPMenuItem[] = useMemo(
    () =>
      SITE_OPTIONS.map((site) => ({
        key: site,
        label: site,
        selected: currentSite === site,
      })),
    [currentSite],
  );

  const handleToolkitTrigger = () => {
    if (onToolkitClick) {
      onToolkitClick();
    } else {
      setToolkitOpen(true);
    }
  };

  return (
    <div
      className={`tp-omada-screen ${showTabBar ? 'tp-omada-screen--standalone' : ''} ${className}`.trim()}
      data-testid="omada-site-dashboard-page"
      style={style}
    >
      <div className="tp-omada-header-wrap">
        <TPHeader
          variant="floating"
          title={currentSite}
          subtitle={controllerName}
          titleDropdown
          onTitleClick={() => setSiteMenuOpen((prev) => !prev)}
          rightBadge={unreadLogsCount > 0 ? unreadLogsCount : undefined}
          left={
            <button
              type="button"
              className="tp-header-icon-btn"
              aria-label="Back to controllers"
              onClick={onBackToGlobal}
            >
              <TPIcon name="nav-back-to-global" size={20} />
            </button>
          }
          right={
            <button
              type="button"
              className="tp-header-icon-btn"
              aria-label="Site logs"
              onClick={onOpenLogs}
            >
              <TPIcon name="nav-log" size={20} />
            </button>
          }
        />

        <TPMenu
          open={siteMenuOpen}
          align="center"
          items={siteMenuItems}
          onSelect={(item) => {
            setCurrentSite(item.key);
            onSiteChange?.(item.key);
          }}
          onClose={() => setSiteMenuOpen(false)}
        />
      </div>

      <div className="tp-omada-scroll">
        <div className={`tp-omada-body ${showTabBar ? 'tp-omada-body--with-tabbar' : ''}`.trim()}>
          {/* Card 1: 4-col KPI tiles + Topology */}
          <section className="tp-omada-card" aria-label="Site inventory summary">
            <div className="tp-omada-kpi-grid">
              <button type="button" className="tp-omada-kpi-tile" onClick={onOpenDevices}>
                <span className="tp-omada-adapt-svg">
                  <TPIcon name="dashboard-gateway" size={38} />
                </span>
                <span className="tp-omada-kpi-count">1</span>
              </button>

              <button type="button" className="tp-omada-kpi-tile" onClick={onOpenDevices}>
                <span className="tp-omada-adapt-svg">
                  <TPIcon name="dashboard-switch" size={38} />
                </span>
                <span className="tp-omada-kpi-count">0</span>
              </button>

              <button type="button" className="tp-omada-kpi-tile" onClick={onOpenDevices}>
                <span className="tp-omada-adapt-svg">
                  <TPIcon name="dashboard-ap" size={38} />
                </span>
                <span className="tp-omada-kpi-count">2</span>
              </button>

              <button type="button" className="tp-omada-kpi-tile" onClick={onOpenClients}>
                <span className="tp-omada-adapt-svg">
                  <TPIcon name="dashboard-client" size={38} />
                </span>
                <span className="tp-omada-kpi-count">4</span>
              </button>
            </div>

            <button
              type="button"
              className="tp-omada-topo-btn"
              onClick={() => setTopoOpen(true)}
            >
              <TPIcon name="btn-omada-topo" size={18} />
              <span>Topology</span>
            </button>
          </section>

          {/* Card 2: Site Health Score */}
          <section
            className="tp-omada-card tp-omada-card--interactive"
            aria-label="Site Health Score"
            role={onOpenHealthDetail ? 'button' : undefined}
            tabIndex={onOpenHealthDetail ? 0 : undefined}
            onClick={onOpenHealthDetail}
            onKeyDown={(e) => {
              if (onOpenHealthDetail && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                onOpenHealthDetail();
              }
            }}
          >
            <div className="tp-omada-card-header">
              <div>
                <h3 className="tp-omada-card-title">Site Health Score</h3>
                <div className="tp-omada-card-subtitle">Nov 23, 06:30 PM-Nov 23, 06:40 PM</div>
              </div>
              <span className="tp-omada-health-score-value">100</span>
            </div>

            <div className="tp-omada-health-subgrid">
              <div className="tp-omada-health-subcard">
                <div className="tp-omada-health-subcard-label">
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <rect x="2" y="5" width="12" height="7" rx="1.2" stroke="currentColor" strokeWidth="1.2" />
                    <path d="M5 5V3M11 5V3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                  <span>Device</span>
                </div>
                <span className="tp-omada-health-subcard-num">100</span>
              </div>

              <div className="tp-omada-health-subcard">
                <div className="tp-omada-health-subcard-label">
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path
                      d="M2.5 6.2C5.6 3.5 10.4 3.5 13.5 6.2M4.8 8.8C6.6 7.2 9.4 7.2 11.2 8.8M7.2 11.4C7.7 11 8.3 11 8.8 11.4"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span>Wi-Fi</span>
                </div>
                <span className="tp-omada-health-subcard-num">100</span>
              </div>

              <div className="tp-omada-health-subcard">
                <div className="tp-omada-health-subcard-label">
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.2" />
                    <ellipse cx="8" cy="8" rx="2.4" ry="5.5" stroke="currentColor" strokeWidth="1.1" />
                    <path d="M2.6 8H13.4" stroke="currentColor" strokeWidth="1.1" />
                  </svg>
                  <span>WAN</span>
                </div>
                <span className="tp-omada-health-subcard-num">100</span>
              </div>
            </div>

            <div className="tp-omada-health-timeline" aria-hidden="true">
              {['Device', 'Wi-Fi', 'WAN'].map((row) => (
                <div key={row} className="tp-omada-health-bar-row">
                  <span className="tp-omada-health-bar-icon">
                    <span className="tp-omada-dot" />
                  </span>
                  <div className="tp-omada-health-bar-track">
                    <div className="tp-omada-health-bar-fill" style={{ width: '94%' }} />
                  </div>
                </div>
              ))}
              <div className="tp-omada-health-scrubber-line" style={{ left: '94%' }}>
                <span className="tp-omada-health-scrubber-thumb" />
              </div>
            </div>
          </section>

          {/* Card 3: ISP Activity */}
          <section
            className="tp-omada-card tp-omada-card--interactive"
            aria-label="ISP Activity"
            onClick={onOpenInsights}
          >
            <div className="tp-omada-card-header">
              <h3 className="tp-omada-card-title">ISP Activity</h3>
              <TPIcon name="arrow-list" size={14} color="var(--tp-text-secondary)" />
            </div>

            <div className="tp-omada-isp-list">
              <div className="tp-omada-isp-row">
                <span className="tp-omada-isp-name">SFP WAN/LAN1</span>
                <span className="tp-omada-isp-rates">
                  <span className="tp-omada-rate-item">
                    <TPIcon name="upload" size={13} />
                    <span>0 bps</span>
                  </span>
                  <span className="tp-omada-rate-item">
                    <TPIcon name="download" size={13} />
                    <span>0 bps</span>
                  </span>
                </span>
              </div>

              <div className="tp-omada-isp-row">
                <span className="tp-omada-isp-name">WAN3</span>
                <span className="tp-omada-isp-rates">
                  <span className="tp-omada-rate-item">
                    <TPIcon name="upload" size={13} />
                    <span>0 bps</span>
                  </span>
                  <span className="tp-omada-rate-item">
                    <TPIcon name="download" size={13} />
                    <span>8 Kbps</span>
                  </span>
                </span>
              </div>
            </div>
          </section>

          {/* Card 4: Internet Activity */}
          <section
            className="tp-omada-card tp-omada-card--interactive"
            aria-label="Internet Activity"
            onClick={onOpenInsights}
          >
            <div className="tp-omada-card-header">
              <h3 className="tp-omada-card-title">Internet Activity</h3>
              <TPIcon name="arrow-list" size={14} color="var(--tp-text-secondary)" />
            </div>

            <div className="tp-omada-legend-col">
              <div className="tp-omada-legend-row">
                <span className="tp-omada-legend-item">
                  <svg width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden="true">
                    <path d="M1 8L4.5 3.5L7.5 7L10 2L13 8" stroke="var(--tp-omada-upload)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>Upload</span>
                </span>
                <span className="tp-omada-legend-item">
                  <svg width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden="true">
                    <path d="M1 8L4.5 3.5L7.5 7L10 2L13 8" stroke="var(--tp-omada-download)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>Download</span>
                </span>
              </div>
              <div className="tp-omada-legend-row">
                <span className="tp-omada-legend-item">
                  <span className="tp-omada-legend-dot" style={{ background: 'var(--tp-omada-upload)' }} />
                  <span>Wired Clients</span>
                </span>
                <span className="tp-omada-legend-item">
                  <span className="tp-omada-legend-dot" style={{ background: 'var(--tp-color-green)' }} />
                  <span>Wireless Clients</span>
                </span>
              </div>
            </div>

            <div style={{ marginTop: 10 }}>
              <div className="tp-omada-chart-axis-row">
                <span>24 Mbps</span>
                <span>12 Clients</span>
              </div>

              <svg
                viewBox="0 0 320 96"
                width="100%"
                height="96"
                preserveAspectRatio="none"
                aria-label="Internet traffic and client waveform chart"
                style={{ display: 'block', marginTop: 4 }}
              >
                <defs>
                  <linearGradient id="tpOmadaDlArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#E57DFA" stopOpacity="0.28" />
                    <stop offset="100%" stopColor="#E57DFA" stopOpacity="0.02" />
                  </linearGradient>
                  <linearGradient id="tpOmadaUlArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#33A0E9" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#33A0E9" stopOpacity="0.02" />
                  </linearGradient>
                </defs>

                <line x1="0" y1="10" x2="320" y2="10" stroke="var(--tp-omada-chart-grid)" strokeDasharray="3 3" />
                <line x1="0" y1="48" x2="320" y2="48" stroke="var(--tp-omada-chart-grid)" strokeDasharray="3 3" />
                <line x1="0" y1="86" x2="320" y2="86" stroke="var(--tp-omada-chart-grid)" />

                <path
                  d="M0,84 L120,84 L132,76 L142,84 L158,40 L166,78 L176,82 L188,18 L196,68 L208,34 L216,74 L228,82 L240,30 L248,68 L262,80 L278,42 L286,74 L300,82 L320,82 L320,86 L0,86 Z"
                  fill="url(#tpOmadaDlArea)"
                />
                <path
                  d="M0,84 L120,84 L132,76 L142,84 L158,40 L166,78 L176,82 L188,18 L196,68 L208,34 L216,74 L228,82 L240,30 L248,68 L262,80 L278,42 L286,74 L300,82 L320,82"
                  fill="none"
                  stroke="var(--tp-omada-download)"
                  strokeWidth="1.5"
                />

                <path
                  d="M0,85 L140,85 L154,66 L166,82 L188,52 L198,80 L214,60 L226,82 L242,58 L254,82 L280,68 L294,84 L320,84 L320,86 L0,86 Z"
                  fill="url(#tpOmadaUlArea)"
                />
                <path
                  d="M0,85 L140,85 L154,66 L166,82 L188,52 L198,80 L214,60 L226,82 L242,58 L254,82 L280,68 L294,84 L320,84"
                  fill="none"
                  stroke="var(--tp-omada-upload)"
                  strokeWidth="1.4"
                />
              </svg>
            </div>
          </section>
        </div>
      </div>

      {showFloatingAction && (
        <TPLiquidGlass
          as="button"
          shape="circle"
          tint="brand"
          interactive
          blur={1.8}
          className="tp-omada-fab tp-omada-standalone-fab"
          ariaLabel="Network Toolkit"
          onClick={handleToolkitTrigger}
        >
          <TPIcon name="settings-network-tools" size={22} color="#FFFFFF" />
        </TPLiquidGlass>
      )}

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

      {/* Interactive Topology Bottom Sheet */}
      <TPBottomSheet
        open={topoOpen}
        title={`Site ${currentSite} Topology`}
        subtitle="1 Gateway • 2 Access Points • 4 Clients"
        onClose={() => setTopoOpen(false)}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <OmadaTopologyBlock siteName={currentSite} showHeader={false} />
          <TPButton
            variant="secondary"
            block
            onClick={() => {
              setTopoOpen(false);
              onOpenDevices?.();
            }}
          >
            Inspect Devices
          </TPButton>
        </div>
      </TPBottomSheet>

      {/* Interactive Toolkit Quick Actions Sheet */}
      <TPBottomSheet
        open={toolkitOpen}
        title="Network Toolkit"
        subtitle={`Diagnostics for Site ${currentSite}`}
        onClose={() => setToolkitOpen(false)}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="tp-omada-tool-grid">
            {TOOLKIT_ACTIONS.map((tool) => (
              <button
                key={tool.key}
                type="button"
                className="tp-omada-tool-tile"
                onClick={() => setActiveToolSummary(`${tool.label}: ${tool.summary}`)}
              >
                <TPIcon name={tool.icon} size={30} />
                <span>{tool.label}</span>
              </button>
            ))}
          </div>
          {activeToolSummary && (
            <div
              style={{
                padding: '10px 12px',
                borderRadius: 8,
                background: 'var(--tp-focus-10)',
                color: 'var(--tp-focus)',
                fontSize: 13,
              }}
            >
              {activeToolSummary}
            </div>
          )}
        </div>
      </TPBottomSheet>
    </div>
  );
};
