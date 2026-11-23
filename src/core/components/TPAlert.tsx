import React, { useEffect, useId, useState } from 'react';
import { useTPTheme } from '../../theme';
import type { TPAlertAction, TPAlertProps } from '../types';
import '../../styles/tp-core-overlays.css';

export const TPAlert: React.FC<TPAlertProps> = ({
  open,
  title,
  message,
  actions,
  os,
  inputPlaceholder,
  defaultInputValue = '',
  onClose,
  children,
}) => {
  const theme = useTPTheme();
  const resolvedOS = os ?? theme.os;
  const titleId = useId();
  const messageId = useId();
  const [inputValue, setInputValue] = useState<string>(defaultInputValue);

  useEffect(() => {
    if (open) {
      setInputValue(defaultInputValue);
    }
  }, [open, defaultInputValue]);

  useEffect(() => {
    if (!open || !onClose) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const hasInput = inputPlaceholder !== undefined;

  const handleActionClick = (action: TPAlertAction) => {
    if (hasInput) {
      action.onClick?.(inputValue);
    } else {
      action.onClick?.();
    }
    onClose?.();
  };

  const layoutClass =
    resolvedOS === 'ios'
      ? actions.length === 2
        ? 'tp-alert-actions--row'
        : 'tp-alert-actions--col'
      : '';

  return (
    <div
      className="tp-overlay tp-alert-backdrop"
      data-tp-os={resolvedOS}
      onClick={() => onClose?.()}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={message ? messageId : undefined}
        data-os={resolvedOS}
        className={`tp-alert tp-alert--${resolvedOS}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="tp-alert-content">
          {title !== undefined && (
            <div id={titleId} className="tp-alert-title">
              {title}
            </div>
          )}
          {message !== undefined && (
            <div id={messageId} className="tp-alert-message">
              {message}
            </div>
          )}
          {children !== undefined && <div className="tp-alert-body">{children}</div>}
          {hasInput && (
            <div className="tp-alert-input-wrap">
              <input
                type="text"
                className="tp-alert-input"
                placeholder={inputPlaceholder}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                autoFocus
              />
            </div>
          )}
        </div>

        <div className={`tp-alert-actions tp-alert-actions--${resolvedOS} ${layoutClass}`.trim()}>
          {actions.map((action, index) => {
            const role = action.role ?? 'default';
            return (
              <button
                key={`${action.label}-${index}`}
                type="button"
                data-role={role}
                className={`tp-alert-action tp-alert-action--${role}`}
                onClick={() => handleActionClick(action)}
              >
                {action.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
