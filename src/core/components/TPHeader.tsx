import React, { useRef } from 'react';
import { useTPTheme } from '../../theme/TPThemeProvider';
import type { TPHeaderProps } from '../types';
import { TPLiquidGlassBackdrop } from './TPLiquidGlassBackdrop';
import '../../styles/tp-core-nav-controls.css';

const FloatingGlassWell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const wellRef = useRef<HTMLDivElement>(null);
  return (
    <div ref={wellRef} className="tp-header-well">
      <TPLiquidGlassBackdrop
        hostRef={wellRef}
        shape="pill"
        tint="clear"
        bezelWidth={12}
        refraction={1.05}
        dispersion={0.9}
        blur={2}
      />
      {children}
    </div>
  );
};

export const TPHeader: React.FC<TPHeaderProps> = ({
  title,
  subtitle,
  variant = 'standard',
  os,
  adaptiveOS = true,
  left,
  right,
  showBack = false,
  onBack,
  titleDropdown = false,
  onTitleClick,
  rightBadge,
  translucent = false,
  loading = false,
  tabs,
  activeTab,
  onTabChange,
  className = '',
  style,
}) => {
  const { os: themeOS } = useTPTheme();
  const resolvedOS = os ?? themeOS;
  const effectiveVariant =
    adaptiveOS && resolvedOS === 'android' && variant === 'floating' ? 'standard' : variant;
  const isFloating = effectiveVariant === 'floating';
  const isLarge = effectiveVariant === 'large';
  const hasTabs = (effectiveVariant === 'tabs' || Boolean(tabs?.length)) && Boolean(tabs?.length);

  const hasLeftContent = showBack || (left !== undefined && left !== null);
  const hasBadge =
    rightBadge !== undefined &&
    rightBadge !== null &&
    rightBadge !== '' &&
    (typeof rightBadge !== 'number' || rightBadge > 0);
  const hasRightContent = (right !== undefined && right !== null) || hasBadge;

  const backButton = showBack ? (
    <button
      type="button"
      className="tp-header-icon-btn"
      aria-label="Back"
      onClick={onBack}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M15.5 19L8.5 12L15.5 5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  ) : null;

  const leftNodes = (
    <>
      {backButton}
      {left}
    </>
  );

  const titleContent = (
    <>
      {title !== undefined && title !== null && (
        <span className="tp-header-title">{title}</span>
      )}
      {loading && (
        <span className="tp-header-loading" aria-label="Loading" role="status" />
      )}
      {titleDropdown && (
        <span className="tp-header-chevron" aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path
              d="M4 6L8 10L12 6"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      )}
    </>
  );

  const rootClass = [
    'tp-header',
    `tp-header--${effectiveVariant}`,
    translucent && !isFloating ? 'tp-header--translucent' : '',
    hasTabs ? 'tp-header--with-tabs' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <header
      className={rootClass}
      data-variant={effectiveVariant}
      data-os={resolvedOS}
      style={style}
    >
      <div className="tp-header-bar">
        <div className="tp-header-left">
          {hasLeftContent ? (
            isFloating ? (
              <FloatingGlassWell>{leftNodes}</FloatingGlassWell>
            ) : (
              leftNodes
            )
          ) : null}
        </div>

        <div className="tp-header-center">
          {!isLarge && ((title !== undefined && title !== null) || titleDropdown || loading) ? (
            onTitleClick || titleDropdown ? (
              <button
                type="button"
                className="tp-header-title-btn"
                onClick={onTitleClick}
              >
                {titleContent}
              </button>
            ) : (
              <div className="tp-header-title-wrap">{titleContent}</div>
            )
          ) : null}
          {!isLarge && subtitle !== undefined && subtitle !== null && (
            <div className="tp-header-subtitle">{subtitle}</div>
          )}
        </div>

        <div className="tp-header-right">
          {hasRightContent ? (
            <div className="tp-header-right-slot">
              {isFloating ? (
                <FloatingGlassWell>{right}</FloatingGlassWell>
              ) : (
                right
              )}
              {hasBadge && <span className="tp-header-badge">{rightBadge}</span>}
            </div>
          ) : null}
        </div>
      </div>

      {isLarge && (title !== undefined || subtitle !== undefined) && (
        <div className="tp-header-large-row">
          <div className="tp-header-large-title-wrap">
            <h1 className="tp-header-large-title">{title}</h1>
            {loading && (
              <span className="tp-header-loading" aria-label="Loading" role="status" />
            )}
          </div>
          {subtitle !== undefined && subtitle !== null && (
            <div className="tp-header-large-subtitle">{subtitle}</div>
          )}
        </div>
      )}

      {hasTabs && tabs && (
        <div className="tp-header-tabs" role="tablist">
          {tabs.map((tab) => {
            const isActive = tab.key === activeTab;
            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`tp-header-tab ${isActive ? 'tp-header-tab--active' : ''}`.trim()}
                onClick={() => onTabChange?.(tab.key)}
              >
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge !== null && tab.badge !== '' && (
                  <span className="tp-header-tab-badge">{tab.badge}</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
