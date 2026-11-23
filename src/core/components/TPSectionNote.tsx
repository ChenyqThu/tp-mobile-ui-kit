import React from 'react';
import type { TPSectionNoteProps } from '../types';
import '../../styles/tp-core-lists-inputs.css';

/**
 * Helper/caption footer note placed beneath grouped cards or form fields.
 */
export const TPSectionNote: React.FC<TPSectionNoteProps> = ({
  children,
  tone = 'default',
  className = '',
  style,
}) => {
  const classes = [
    'tp-section-note',
    `tp-section-note--${tone}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} style={style}>
      {children}
    </div>
  );
};
