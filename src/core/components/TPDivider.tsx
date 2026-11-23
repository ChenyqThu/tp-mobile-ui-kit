import React from 'react';
import type { TPDividerProps } from '../types';
import '../../styles/tp-core-extended.css';

/**
 * Hairline separator supporting inset alignment, optional centered label, and spacing presets.
 */
export const TPDivider: React.FC<TPDividerProps> = ({
  inset = false,
  label,
  spacing = 'md',
  className = '',
  style,
}) => {
  return (
    <div
      role="separator"
      className={`tp-divider tp-divider--space-${spacing} ${inset ? 'tp-divider--inset' : ''} ${
        label !== undefined ? 'tp-divider--with-label' : ''
      } ${className}`.trim()}
      style={style}
    >
      <span className="tp-divider-line" />
      {label !== undefined && <span className="tp-divider-label">{label}</span>}
      {label !== undefined && <span className="tp-divider-line" />}
    </div>
  );
};
