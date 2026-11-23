import React from 'react';
import type { TPTextProps } from '../types';
import '../../styles/tp-core-lists-inputs.css';

const DEFAULT_TAG_MAP: Record<NonNullable<TPTextProps['variant']>, NonNullable<TPTextProps['as']>> = {
  title1: 'h1',
  title2: 'h2',
  title3: 'h3',
  title4: 'h4',
  body: 'span',
  subhead: 'span',
  caption: 'span',
  footnote: 'span',
};

/**
 * Token-driven typography primitive aligned with TP-Design brand font weights and semantic tones.
 */
export const TPText: React.FC<TPTextProps> = ({
  variant = 'body',
  tone = 'primary',
  as,
  weight,
  className = '',
  style,
  children,
}) => {
  const Tag = as ?? DEFAULT_TAG_MAP[variant];
  const classes = [
    'tp-text',
    `tp-text--${variant}`,
    `tp-text--tone-${tone}`,
    weight ? `tp-text--weight-${weight}` : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Tag className={classes} style={style}>
      {children}
    </Tag>
  );
};
