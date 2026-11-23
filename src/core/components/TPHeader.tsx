import React from 'react';
import type { TPHeaderProps } from '../types';
import '../../styles/tp-core-nav-controls.css';

export const TPHeader: React.FC<TPHeaderProps> = ({
  title,
  subtitle,
  variant = 'standard',
  left,
  right,
  showBack = false,
  onBack,
  titleDropdown = false,
  onTitleClick,
  rightBadge,
  translucent = false,
  className = '',
  style,
}) => {
  const isFloating = variant === 'floating';
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
    `tp-header--${variant}`,
    translucent ? 'tp-header--translucent' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <header className={rootClass} data-variant={variant} style={style}>
      <div className="tp-header-left">
        {hasLeftContent ? (
          isFloating ? (
            <div className="tp-header-well">{leftNodes}</div>
          ) : (
            leftNodes
          )
        ) : null}
      </div>

      <div className="tp-header-center">
        {(title !== undefined && title !== null) || titleDropdown ? (
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
        {subtitle !== undefined && subtitle !== null && (
          <div className="tp-header-subtitle">{subtitle}</div>
        )}
      </div>

      <div className="tp-header-right">
        {hasRightContent ? (
          <div className="tp-header-right-slot">
            {isFloating ? (
              <div className="tp-header-well">{right}</div>
            ) : (
              right
            )}
            {hasBadge && <span className="tp-header-badge">{rightBadge}</span>}
          </div>
        ) : null}
      </div>
    </header>
  );
};
