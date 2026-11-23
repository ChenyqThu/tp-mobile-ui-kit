import React, { useEffect, useId } from 'react';
import { useTPTheme } from '../../theme';
import type { TPActionSheetOption, TPActionSheetProps } from '../types';
import '../../styles/tp-core-overlays.css';

const CheckIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M5 12.5L9.8 17L19 7.5"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const TPActionSheet: React.FC<TPActionSheetProps> = ({
  open,
  title,
  message,
  options,
  cancelText = 'Cancel',
  os,
  onSelect,
  onClose,
}) => {
  const theme = useTPTheme();
  const resolvedOS = os ?? theme.os;
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

  const hasRichOptions = options.some(
    (opt) => opt.icon !== undefined || opt.description !== undefined || opt.selected !== undefined,
  );

  const handleOptionClick = (option: TPActionSheetOption) => {
    if (option.disabled) return;
    onSelect(option);
    onClose();
  };

  const renderOptions = () =>
    options.map((option) => {
      const classes = [
        'tp-actionsheet-option',
        hasRichOptions ? 'tp-actionsheet-option--rich' : '',
        option.destructive ? 'tp-actionsheet-option--destructive' : '',
        option.disabled ? 'tp-actionsheet-option--disabled' : '',
        option.selected ? 'tp-actionsheet-option--selected' : '',
      ]
        .filter(Boolean)
        .join(' ');

      return (
        <button
          key={option.key}
          type="button"
          className={classes}
          disabled={option.disabled}
          aria-disabled={option.disabled || undefined}
          onClick={() => handleOptionClick(option)}
        >
          {option.icon !== undefined && (
            <span className="tp-actionsheet-option-icon">{option.icon}</span>
          )}
          <span className="tp-actionsheet-option-text">
            <span className="tp-actionsheet-option-label">{option.label}</span>
            {option.description !== undefined && (
              <span className="tp-actionsheet-option-desc">{option.description}</span>
            )}
          </span>
          {option.selected && (
            <span className="tp-actionsheet-option-check">
              <CheckIcon />
            </span>
          )}
        </button>
      );
    });

  return (
    <div
      className="tp-overlay tp-actionsheet-backdrop"
      data-tp-os={resolvedOS}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        data-os={resolvedOS}
        className={`tp-actionsheet tp-actionsheet--${resolvedOS}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="tp-actionsheet-group">
          {(title !== undefined || message !== undefined) && (
            <div className="tp-actionsheet-header">
              {title !== undefined && (
                <div id={titleId} className="tp-actionsheet-title">
                  {title}
                </div>
              )}
              {message !== undefined && <div className="tp-actionsheet-message">{message}</div>}
            </div>
          )}
          <div className="tp-actionsheet-options">{renderOptions()}</div>
        </div>

        {cancelText !== '' &&
          (resolvedOS === 'ios' ? (
            <div className="tp-actionsheet-cancel-card">
              <button type="button" className="tp-actionsheet-cancel" onClick={onClose}>
                {cancelText}
              </button>
            </div>
          ) : (
            <div className="tp-actionsheet-cancel-row">
              <button type="button" className="tp-actionsheet-cancel" onClick={onClose}>
                {cancelText}
              </button>
            </div>
          ))}
      </div>
    </div>
  );
};
