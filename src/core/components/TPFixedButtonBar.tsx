import React from 'react';
import type { TPFixedButtonBarProps } from '../types';
import { TPButton } from './TPButton';
import '../../styles/tp-core-nav-controls.css';

export const TPFixedButtonBar: React.FC<TPFixedButtonBarProps> = ({
  layout = 'single',
  primaryText,
  onPrimaryClick,
  primaryLoading = false,
  primaryDisabled = false,
  secondaryText,
  onSecondaryClick,
  secondaryVariant = 'secondary',
  note,
  className = '',
  style,
}) => {
  const rootClass = [
    'tp-fixed-btn-bar',
    `tp-fixed-btn-bar--${layout}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const primaryButton = (
    <TPButton
      variant="primary"
      size="lg"
      block
      loading={primaryLoading}
      disabled={primaryDisabled}
      onClick={onPrimaryClick}
    >
      {primaryText}
    </TPButton>
  );

  const secondaryButton = secondaryText ? (
    <TPButton
      variant={secondaryVariant}
      size="lg"
      block
      onClick={onSecondaryClick}
    >
      {secondaryText}
    </TPButton>
  ) : null;

  return (
    <div className={rootClass} data-layout={layout} style={style}>
      {note !== undefined && note !== null && (
        <div className="tp-fixed-btn-bar-note">{note}</div>
      )}
      <div className="tp-fixed-btn-bar-actions">
        {layout === 'dual-horizontal' ? (
          <>
            {secondaryButton}
            {primaryButton}
          </>
        ) : (
          <>
            {primaryButton}
            {layout === 'dual-vertical' ? secondaryButton : null}
          </>
        )}
      </div>
    </div>
  );
};
