import React from 'react';
import { TPHeader } from '../../core/components/TPHeader';
import { TPListCard } from '../../core/components/TPListCard';
import { TPListItem } from '../../core/components/TPListItem';
import { TPSectionHeader } from '../../core/components/TPSectionHeader';
import { TPIcon } from '../../assets-lib';
import '../../styles/tp-omada.css';

export interface OmadaHealthDetailPageProps {
  siteName?: string;
  score?: number;
  deviceScore?: number;
  wifiScore?: number;
  wanScore?: number;
  onBack?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Drill-down Site Health Score detail screen with radial score gauge, subsystem metrics,
 * and 24-hour historical health chart.
 */
export const OmadaHealthDetailPage: React.FC<OmadaHealthDetailPageProps> = ({
  siteName = '92',
  score = 100,
  deviceScore = 100,
  wifiScore = 100,
  wanScore = 100,
  onBack,
  className = '',
  style,
}) => {
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, score));
  const strokeDashoffset = circumference * (1 - clamped / 100);

  return (
    <div
      className={`tp-omada-screen ${className}`.trim()}
      data-testid="omada-health-detail-page"
      style={style}
    >
      <div className="tp-omada-header-wrap">
        <TPHeader
          variant="floating"
          title="Site Health Score"
          subtitle={`Site ${siteName}`}
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

      <div className="tp-omada-scroll">
        <div className="tp-omada-body">
          {/* Gauge Card */}
          <section className="tp-omada-card">
            <div className="tp-omada-gauge-wrap">
              <svg width="124" height="124" viewBox="0 0 120 120" aria-label={`Health score ${clamped}`}>
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  fill="none"
                  stroke="var(--tp-divider)"
                  strokeWidth="9"
                />
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  fill="none"
                  stroke="var(--tp-color-green)"
                  strokeWidth="9"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  transform="rotate(-90 60 60)"
                />
                <text
                  x="60"
                  y="58"
                  textAnchor="middle"
                  fill="var(--tp-color-green)"
                  fontSize="28"
                  fontWeight="600"
                >
                  {clamped}
                </text>
                <text
                  x="60"
                  y="78"
                  textAnchor="middle"
                  fill="var(--tp-text-secondary)"
                  fontSize="12"
                >
                  Good
                </text>
              </svg>
              <div style={{ fontSize: 12, color: 'var(--tp-text-secondary)' }}>
                Nov 23, 06:30 PM - Nov 23, 06:40 PM
              </div>
            </div>

            <div className="tp-omada-health-subgrid">
              <div className="tp-omada-health-subcard">
                <div className="tp-omada-health-subcard-label">Device</div>
                <span className="tp-omada-health-subcard-num">{deviceScore}</span>
              </div>
              <div className="tp-omada-health-subcard">
                <div className="tp-omada-health-subcard-label">Wi-Fi</div>
                <span className="tp-omada-health-subcard-num">{wifiScore}</span>
              </div>
              <div className="tp-omada-health-subcard">
                <div className="tp-omada-health-subcard-label">WAN</div>
                <span className="tp-omada-health-subcard-num">{wanScore}</span>
              </div>
            </div>
          </section>

          {/* Historical Chart Card */}
          <section className="tp-omada-card">
            <div className="tp-omada-card-header">
              <h3 className="tp-omada-card-title">24-Hour Health Trend</h3>
              <span style={{ fontSize: 12, color: 'var(--tp-color-green)' }}>100 Avg</span>
            </div>
            <svg
              viewBox="0 0 320 80"
              width="100%"
              height="80"
              preserveAspectRatio="none"
              style={{ display: 'block', marginTop: 10 }}
              aria-label="24-hour site health score chart"
            >
              <line x1="0" y1="10" x2="320" y2="10" stroke="var(--tp-omada-chart-grid)" strokeDasharray="3 3" />
              <line x1="0" y1="42" x2="320" y2="42" stroke="var(--tp-omada-chart-grid)" strokeDasharray="3 3" />
              <line x1="0" y1="74" x2="320" y2="74" stroke="var(--tp-omada-chart-grid)" />
              <path
                d="M0,12 L110,12 L120,15 L132,12 L240,12 L252,14 L264,12 L320,12"
                fill="none"
                stroke="var(--tp-color-green)"
                strokeWidth="2.2"
              />
            </svg>
            <div className="tp-omada-chart-axis-row" style={{ marginTop: 4 }}>
              <span>Nov 22, 06:40 PM</span>
              <span>Nov 23, 06:40 PM</span>
            </div>
          </section>

          <TPSectionHeader title="Diagnostic Checks" />
          <TPListCard divided>
            <TPListItem
              leading={<TPIcon name="status-success-solid" size={20} />}
              title="Gateway & AP Availability"
              subtitle="1 ER7212PC and 2 EAP723 online"
              value="100%"
            />
            <TPListItem
              leading={<TPIcon name="status-success-solid" size={20} />}
              title="Wi-Fi Interference & Retry Rate"
              subtitle="5 GHz / 6 GHz channels clear"
              value="98%"
            />
            <TPListItem
              leading={<TPIcon name="status-success-solid" size={20} />}
              title="WAN3 Latency & Packet Loss"
              subtitle="Ping 3 ms • 0.0% packet loss"
              value="100%"
            />
          </TPListCard>
        </div>
      </div>
    </div>
  );
};
