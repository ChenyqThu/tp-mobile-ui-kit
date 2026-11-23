import React, { useEffect, useId } from 'react';
import type { TPPopupProps } from '../types';
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

export const TPPopup: React.FC<TPPopupProps> = ({
  open,
  placement = 'center',
  title,
  closable = true,
  maskClosable = true,
  onClose,
  footer,
  className = '',
  style,
  children,
}) => {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && (maskClosable || closable)) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, maskClosable, closable, onClose]);

  if (!open) return null;

  const showHeader = title !== undefined || closable;

  return (
    <div
      className={`tp-overlay tp-popup-backdrop--${placement}`}
      onClick={() => {
        if (maskClosable) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        data-placement={placement}
        className={`tp-popup tp-popup--${placement} ${className}`.trim()}
        style={style}
        onClick={(e) => e.stopPropagation()}
      >
        {showHeader && (
          <div className="tp-popup-header">
            {title !== undefined ? (
              <div id={titleId} className="tp-popup-title">
                {title}
              </div>
            ) : (
              <span />
            )}
            {closable && (
              <button
                type="button"
                className="tp-popup-close"
                aria-label="Close"
                onClick={onClose}
              >
                <CloseIcon />
              </button>
            )}
          </div>
        )}

        <div className="tp-popup-body">{children}</div>

        {footer !== undefined && <div className="tp-popup-footer">{footer}</div>}
      </div>
    </div>
  );
};
