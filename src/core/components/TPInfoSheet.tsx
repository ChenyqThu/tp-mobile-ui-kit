import React from 'react';
import type { TPInfoSheetProps, TPLegendSheetProps } from '../types';
import { TPBottomSheet } from './TPBottomSheet';
import { TPButton } from './TPButton';
import '../../styles/tp-core-overlays.css';

/**
 * Informational bottom-sheet dialog presenting explanatory copy or bullet points above a confirmation CTA.
 */
export const TPInfoSheet: React.FC<TPInfoSheetProps> = ({
  open,
  title,
  subtitle,
  description,
  bullets,
  confirmText = 'Got it',
  onConfirm,
  onClose,
  children,
  className = '',
  style,
}) => {
  return (
    <TPBottomSheet
      open={open}
      title={title}
      subtitle={subtitle}
      onClose={onClose}
      footer={
        <TPButton
          variant="primary"
          size="lg"
          block
          onClick={() => {
            onConfirm?.();
            onClose();
          }}
        >
          {confirmText}
        </TPButton>
      }
    >
      <div className={`tp-info-sheet ${className}`.trim()} style={style}>
        {description !== undefined && description !== null && (
          <p className="tp-info-sheet-desc">{description}</p>
        )}
        {bullets && bullets.length > 0 && (
          <ul className="tp-info-sheet-bullets">
            {bullets.map((bullet, idx) => (
              <li key={idx} className="tp-info-sheet-bullet">
                <span className="tp-info-sheet-dot" aria-hidden="true" />
                <span className="tp-info-sheet-bullet-text">{bullet}</span>
              </li>
            ))}
          </ul>
        )}
        {children}
      </div>
    </TPBottomSheet>
  );
};

/**
 * Bottom-sheet key/legend sheet displaying color swatches, icons, and badge explanations.
 */
export const TPLegendSheet: React.FC<TPLegendSheetProps> = ({
  open,
  title = 'Legend',
  subtitle,
  items,
  columns = 1,
  onClose,
  footer,
  className = '',
  style,
}) => {
  return (
    <TPBottomSheet
      open={open}
      title={title}
      subtitle={subtitle}
      onClose={onClose}
      footer={footer}
    >
      <div
        className={`tp-legend-sheet tp-legend-sheet--cols-${columns} ${className}`.trim()}
        data-columns={columns}
        style={style}
      >
        {items.map((item) => (
          <div key={item.key} className="tp-legend-sheet-item">
            <div className="tp-legend-sheet-marker" aria-hidden="true">
              {item.icon ? (
                item.icon
              ) : item.badge ? (
                item.badge
              ) : (
                <span
                  className="tp-legend-sheet-swatch"
                  style={item.color ? { backgroundColor: item.color } : undefined}
                />
              )}
            </div>
            <div className="tp-legend-sheet-content">
              <div className="tp-legend-sheet-label">{item.label}</div>
              {item.description !== undefined && item.description !== null && (
                <div className="tp-legend-sheet-desc">{item.description}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </TPBottomSheet>
  );
};
