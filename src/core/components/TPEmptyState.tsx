import React from 'react';
import { TPIllustration } from '../../assets-lib';
import type { TPEmptyStateProps } from '../types';
import '../../styles/tp-core-lists-inputs.css';

/**
 * Empty state layout integrating theme-aware TPIllustration or custom icon plus optional CTA button.
 */
export const TPEmptyState: React.FC<TPEmptyStateProps> = ({
  illustration,
  theme,
  icon,
  title,
  description,
  actionText,
  onAction,
  compact = false,
  size,
  className = '',
  style,
}) => {
  const isCompact = size ? size === 'compact' : compact;
  const classes = [
    'tp-empty-state',
    isCompact ? 'tp-empty-state--compact' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} data-size={isCompact ? 'compact' : 'full'} style={style}>
      {illustration ? (
        <div className="tp-empty-state-media">
          <TPIllustration name={illustration} theme={theme} width={isCompact ? 180 : 240} />
        </div>
      ) : icon ? (
        <div className="tp-empty-state-icon">{icon}</div>
      ) : null}

      <div className="tp-empty-state-title">{title}</div>

      {description !== undefined && description !== null && (
        <div className="tp-empty-state-description">{description}</div>
      )}

      {actionText && (
        <button
          type="button"
          className="tp-empty-state-action"
          onClick={onAction}
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
