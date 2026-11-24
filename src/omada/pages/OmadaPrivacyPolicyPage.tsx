import React, { useState } from 'react';
import { TPFixedButtonBar } from '../../core/components/TPFixedButtonBar';
import { TPHeader } from '../../core/components/TPHeader';
import { TPListCard } from '../../core/components/TPListCard';
import { TPListItem } from '../../core/components/TPListItem';
import { TPSectionHeader } from '../../core/components/TPSectionHeader';
import { TPSwitch } from '../../core/components/TPSwitch';
import { TPText } from '../../core/components/TPText';
import { TPIcon } from '../../assets-lib';
import '../../styles/tp-omada.css';

export interface OmadaPrivacyPolicyPageProps {
  analyticsEnabled?: boolean;
  onAnalyticsChange?: (enabled: boolean) => void;
  onAccept?: (consent: { analyticsEnabled: boolean }) => void;
  onDecline?: () => void;
  onBack?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Legacy-Omada Privacy Policy & Telemetry Consent page with structured sections,
 * diagnostics opt-in switch, and `TPFixedButtonBar` consent actions.
 */
export const OmadaPrivacyPolicyPage: React.FC<OmadaPrivacyPolicyPageProps> = ({
  analyticsEnabled: controlledAnalytics,
  onAnalyticsChange,
  onAccept,
  onDecline,
  onBack,
  className = '',
  style,
}) => {
  const [internalAnalytics, setInternalAnalytics] = useState(true);
  const activeAnalytics = controlledAnalytics ?? internalAnalytics;

  const toggleAnalytics = (next: boolean) => {
    if (controlledAnalytics === undefined) {
      setInternalAnalytics(next);
    }
    onAnalyticsChange?.(next);
  };

  return (
    <div
      className={`tp-omada-screen ${className}`.trim()}
      data-testid="omada-privacy-policy-page"
      style={style}
    >
      <div className="tp-omada-header-wrap">
        <TPHeader
          variant="standard"
          title="Privacy & Terms"
          subtitle="TP-Link Omada Cloud"
          left={
            onBack && (
              <button
                type="button"
                className="tp-header-icon-btn"
                aria-label="Back"
                onClick={onBack}
              >
                <TPIcon name="nav-back" size={20} />
              </button>
            )
          }
        />
      </div>

      <div className="tp-omada-scroll">
        <div className="tp-omada-body">
          <section className="tp-omada-card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <TPText variant="title3" as="h2" weight="semibold">
              Privacy Commitment
            </TPText>
            <TPText variant="subhead" tone="secondary">
              Omada manages your gateways, switches, and access points over TLS-encrypted channels.
              Site credentials and client MAC tables are scoped strictly to your controller workspace.
            </TPText>
          </section>

          <TPSectionHeader title="Data & Diagnostics Controls" />
          <TPListCard divided>
            <TPListItem
              title="Share Crash & Performance Diagnostics"
              subtitle="Helps improve AP roaming telemetry without storing personal traffic"
              trailing={
                <TPSwitch
                  checked={activeAnalytics}
                  onChange={toggleAnalytics}
                  ariaLabel="Share Crash & Performance Diagnostics"
                />
              }
            />
            <TPListItem
              title="TP-Link Privacy Policy"
              value="Updated 2026"
              arrow
            />
            <TPListItem
              title="User Experience Improvement Program"
              value={activeAnalytics ? 'Enrolled' : 'Opted out'}
              arrow
            />
          </TPListCard>
        </div>
      </div>

      <TPFixedButtonBar
        layout="dual-horizontal"
        primaryText="Agree & Continue"
        onPrimaryClick={() => onAccept?.({ analyticsEnabled: activeAnalytics })}
        secondaryText="Decline"
        secondaryVariant="secondary"
        onSecondaryClick={onDecline ?? onBack}
        note="You can change diagnostics preferences anytime under Site Settings."
      />
    </div>
  );
};
