import React, { useEffect, useId } from 'react';
import type { TPBottomSheetProps } from '../types';
import '../../styles/tp-core-overlays.css';

const CloseIcon: React.FC = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path
      d="M4 4L12 12M12 4L4 12"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

export const TPBottomSheet: React.FC<TPBottomSheetProps> = ({
  open,
  title,
  subtitle,
  onClose,
  showCloseButton,
  showGrabber = true,
  footer,
  maxHeight = '85%',
  children,
}) => {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const hasHeading = title !== undefined || subtitle !== undefined;
  const shouldShowClose = showCloseButton ?? hasHeading;
  const showHeader = hasHeading || shouldShowClose;
  const resolvedMaxHeight = typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight;

  return (
    <div className="tp-overlay tp-bottomsheet-backdrop" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        className="tp-bottomsheet"
        style={{ maxHeight: resolvedMaxHeight }}
        onClick={(e) => e.stopPropagation()}
      >
        {showGrabber && (
          <div className="tp-bottomsheet-grabber-wrap" aria-hidden="true">
            <span className="tp-bottomsheet-grabber" />
          </div>
        )}

        {showHeader && (
          <div className="tp-bottomsheet-header">
            <div className="tp-bottomsheet-heading">
              {title !== undefined && (
                <div id={titleId} className="tp-bottomsheet-title">
                  {title}
                </div>
              )}
              {subtitle !== undefined && (
                <div className="tp-bottomsheet-subtitle">{subtitle}</div>
              )}
            </div>
            {shouldShowClose && (
              <button
                type="button"
                className="tp-bottomsheet-close"
                aria-label="Close"
                onClick={onClose}
              >
                <CloseIcon />
              </button>
            )}
          </div>
        )}

        <div className="tp-bottomsheet-body">{children}</div>

        {footer !== undefined && <div className="tp-bottomsheet-footer">{footer}</div>}
      </div>
    </div>
  );
};
