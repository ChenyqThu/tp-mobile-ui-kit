import React from 'react';
import { TPButton } from '../../core/components/TPButton';
import { TPHeader } from '../../core/components/TPHeader';
import { TPListCard } from '../../core/components/TPListCard';
import { TPListItem } from '../../core/components/TPListItem';
import { TPSectionHeader } from '../../core/components/TPSectionHeader';
import { TPSwitch } from '../../core/components/TPSwitch';
import { TPTag } from '../../core/components/TPTag';
import { TPText } from '../../core/components/TPText';
import { useTPTheme } from '../../theme/TPThemeProvider';
import { TPIcon, TPMotion } from '../../assets-lib';
import '../../styles/tp-omada.css';

const FONT_SCALE_PRESETS = [
  { scale: 1, label: 'Default (100%)' },
  { scale: 1.2, label: 'Large (120%)' },
  { scale: 1.4, label: 'Extra Large (140%)' },
  { scale: 1.6, label: 'Accessible (160%)' },
] as const;

export interface OmadaAccessibilitySettingsPageProps {
  onBack?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Legacy-Omada Accessibility & Display Settings screen controlling WCAG 4.5:1 High Contrast
 * mode (`Title 1` Bold + underlined links + accessible Tag contrast) and dynamic Font Scale.
 */
export const OmadaAccessibilitySettingsPage: React.FC<OmadaAccessibilitySettingsPageProps> = ({
  onBack,
  className = '',
  style,
}) => {
  const { highContrast, setHighContrast, fontScale, setFontScale } = useTPTheme();

  return (
    <div
      className={`tp-omada-screen ${className}`.trim()}
      data-testid="omada-accessibility-settings-page"
      style={style}
    >
      <div className="tp-omada-header-wrap">
        <TPHeader
          variant="standard"
          title="Accessibility & Display"
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
          <TPSectionHeader title="Contrast & Legibility" />
          <TPListCard divided>
            <TPListItem
              title="High Contrast Mode"
              subtitle="WCAG 4.5:1 palette, Bold Title 1 headings & underlined links"
              trailing={
                <TPSwitch
                  checked={highContrast}
                  onChange={setHighContrast}
                  ariaLabel="High Contrast Mode"
                />
              }
            />
          </TPListCard>

          <TPSectionHeader title="Dynamic Text Scaling" />
          <section className="tp-omada-card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600 }}>Font Scale ({Math.round(fontScale * 100)}%)</div>
                <div style={{ fontSize: 12, color: 'var(--tp-text-secondary-alt)', marginTop: 2 }}>
                  Form labels stack vertically above values at 140% or above.
                </div>
              </div>
              <TPMotion name="accessibility-zoom" width={44} height={44} playing />
            </div>
            <div className="tp-omada-chip-group">
              {FONT_SCALE_PRESETS.map((preset) => (
                <TPTag
                  key={preset.scale}
                  size="sm"
                  selected={Math.abs(fontScale - preset.scale) < 0.05}
                  onClick={() => setFontScale(preset.scale)}
                >
                  {preset.label}
                </TPTag>
              ))}
            </div>
          </section>

          <TPSectionHeader title="Live Typography & Tag Preview" />
          <section className="tp-omada-card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <TPText variant="title1" as="h2">
              Site Health Overview
            </TPText>
            <TPText variant="body" tone="secondary">
              {highContrast
                ? 'High contrast active: Title 1 switches to Bold (700) and action links stay underlined.'
                : 'Normal Omada mode keeps TP-Design Light (300) Title 1 display typography.'}
            </TPText>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <TPButton variant="text" size="sm">
                View Troubleshooting Guide
              </TPButton>
              <TPText variant="subhead" tone="highlighted">
                Knowledge Base Link
              </TPText>
            </div>
            <div className="tp-omada-chip-group">
              <TPTag size="xs" shape="rect" tone="focus">Connected</TPTag>
              <TPTag size="xs" shape="rect" tone="warning">Pending</TPTag>
              <TPTag size="xs" shape="rect" tone="alert">Isolated</TPTag>
              <TPTag size="xs" shape="rect" tone="purple">6 GHz</TPTag>
              <TPTag size="xs" shape="rect" tone="indigo">Multi-Gig</TPTag>
            </div>
          </section>

          <TPListCard divided>
            <TPListItem
              layout="form-field"
              title="Gateway Firmware"
              value="ER7212PC · v6.3.0.63"
              arrow
            />
          </TPListCard>
        </div>
      </div>
    </div>
  );
};
