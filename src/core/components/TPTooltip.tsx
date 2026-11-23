import React, { useState } from 'react';
import type { TPTooltipProps } from '../types';
import '../../styles/tp-core-extended.css';

/**
 * Callout tooltip bubble matching Figma `Prompt 提示气泡` with 6 arrow placements and optional click toggle.
 */
export const TPTooltip: React.FC<TPTooltipProps> = ({
  content,
  arrowPosition = 'bottom-left',
  contextAdaptive = true,
  open,
  defaultOpen = true,
  onOpenChange,
  children,
  className = '',
  style,
}) => {
  const isControlled = open !== undefined;
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isOpen = isControlled ? open : internalOpen;

  const toggle = () => {
    const next = !isOpen;
    if (!isControlled) {
      setInternalOpen(next);
    }
    onOpenChange?.(next);
  };

  return (
    <div
      className={`tp-tooltip-wrap ${className}`.trim()}
      data-arrow={arrowPosition}
      style={style}
    >
      {children !== undefined && (
        <span
          className="tp-tooltip-trigger"
          role="button"
          tabIndex={0}
          aria-expanded={isOpen}
          onClick={toggle}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              toggle();
            }
          }}
        >
          {children}
        </span>
      )}

      {isOpen && (
        <div
          role="tooltip"
          data-arrow={arrowPosition}
          data-adaptive={String(contextAdaptive)}
          className={`tp-tooltip-bubble tp-tooltip-bubble--${arrowPosition} ${
            contextAdaptive ? 'tp-tooltip-bubble--adaptive' : ''
          }`.trim()}
        >
          <span className="tp-tooltip-content">{content}</span>
          <span className="tp-tooltip-arrow" aria-hidden="true" />
        </div>
      )}
    </div>
  );
};
