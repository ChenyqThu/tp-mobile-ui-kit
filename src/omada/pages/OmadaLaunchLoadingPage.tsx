import React, { useState } from 'react';
import { TPHeader } from '../../core/components/TPHeader';
import { TPPrompt } from '../../core/components/TPPrompt';
import { TPTabBar } from '../../core/components/TPTabBar';
import { TPIcon } from '../../assets-lib';
import { OMADA_SITE_TABS, type OmadaSiteTabKey } from '../blocks/OmadaDeviceListBlock';
import '../../styles/tp-omada.css';

export interface OmadaLaunchLoadingPageProps {
  siteName?: string;
  controllerName?: string;
  upgradeVersion?: string;
  activeTab?: OmadaSiteTabKey;
  onTabChange?: (tab: OmadaSiteTabKey) => void;
  onBackToGlobal?: () => void;
  onOpenLogs?: () => void;
  onUpgrade?: () => void;
  onToolkitClick?: () => void;
  showUpgradeBanner?: boolean;
  showTabBar?: boolean;
  showFloatingAction?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * 1:1 restoration of `launchloading.png`: floating glass header, blue dismissible upgrade prompt,
 * 3 animated skeleton dashboard cards, green Toolkit FAB, and floating glass TabBar.
 */
export const OmadaLaunchLoadingPage: React.FC<OmadaLaunchLoadingPageProps> = ({
  siteName = '92',
  controllerName = '62',
  upgradeVersion = 'V2.5.2',
  activeTab = 'dashboard',
  onTabChange,
  onBackToGlobal,
  onOpenLogs,
  onUpgrade,
  onToolkitClick,
  showUpgradeBanner = true,
  showTabBar = true,
  showFloatingAction = true,
  className = '',
  style,
}) => {
  const [bannerVisible, setBannerVisible] = useState(showUpgradeBanner);

  return (
    <div
      className={`tp-omada-screen ${showTabBar ? 'tp-omada-screen--standalone' : ''} ${className}`.trim()}
      data-testid="omada-launch-loading-page"
      style={style}
    >
      <div className="tp-omada-header-wrap">
        <TPHeader
          variant="floating"
          title={siteName}
          subtitle={controllerName}
          titleDropdown
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
              aria-label="Logs"
              onClick={onOpenLogs}
            >
              <TPIcon name="nav-log" size={20} />
            </button>
          }
        />
      </div>

      <div className="tp-omada-scroll">
        <div className={`tp-omada-body ${showTabBar ? 'tp-omada-body--with-tabbar' : ''}`.trim()}>
          {bannerVisible && (
            <TPPrompt
              tone="info"
              className="tp-omada-upgrade-prompt"
              title={`New version found: ${upgradeVersion}`}
              actionLabel="Upgrade Now"
              onAction={onUpgrade}
              closable
              onClose={() => setBannerVisible(false)}
            />
          )}

          {/* Skeleton Card 1: 4-tile KPI + activity lines */}
          <div className="tp-omada-skeleton-card" aria-label="Loading site summary">
            <div className="tp-omada-skeleton-block" style={{ height: 22, width: '100%' }} />
            <div className="tp-omada-skeleton-block" style={{ height: 18, width: '100%' }} />
            <div className="tp-omada-skeleton-tiles">
              <div className="tp-omada-skeleton-block" style={{ height: 62, borderRadius: 10 }} />
              <div className="tp-omada-skeleton-block" style={{ height: 62, borderRadius: 10 }} />
              <div className="tp-omada-skeleton-block" style={{ height: 62, borderRadius: 10 }} />
              <div className="tp-omada-skeleton-block" style={{ height: 62, borderRadius: 10 }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
              <div className="tp-omada-skeleton-block" style={{ height: 6, width: '100%' }} />
              <div className="tp-omada-skeleton-block" style={{ height: 6, width: '100%' }} />
              <div className="tp-omada-skeleton-block" style={{ height: 6, width: '100%' }} />
              <div className="tp-omada-skeleton-block" style={{ height: 6, width: '100%' }} />
            </div>
          </div>

          {/* Skeleton Card 2: Site Health Score geometry */}
          <div className="tp-omada-skeleton-card" aria-label="Loading site health">
            <div className="tp-omada-skeleton-block" style={{ height: 22, width: '100%' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <div className="tp-omada-skeleton-block" style={{ height: 16, width: '38%' }} />
              <div className="tp-omada-skeleton-block" style={{ height: 16, width: '38%' }} />
            </div>
            <div className="tp-omada-skeleton-block" style={{ height: 112, width: '100%', borderRadius: 8 }} />
          </div>

          {/* Skeleton Card 3: ISP / Internet chart geometry */}
          <div className="tp-omada-skeleton-card" aria-label="Loading ISP activity">
            <div className="tp-omada-skeleton-block" style={{ height: 16, width: '36%' }} />
            <div className="tp-omada-skeleton-block" style={{ height: 104, width: '100%', borderRadius: 8 }} />
          </div>
        </div>
      </div>

      {showFloatingAction && (
        <button
          type="button"
          className="tp-omada-fab tp-omada-standalone-fab"
          aria-label="Network Toolkit"
          onClick={onToolkitClick}
        >
          <TPIcon name="settings-network-tools" size={22} color="#FFFFFF" />
        </button>
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
    </div>
  );
};
