import React from 'react';
import type { TPLiquidGlassProps } from '../types';
import '../../styles/tp-core-nav-controls.css';

/**
 * Apple iOS 26/27 Liquid Glass surface primitive combining translucent refractive backdrop blur,
 * a directional 135-degree specular rim highlight, and inner meniscus depth lighting.
 */
export const TPLiquidGlass: React.FC<TPLiquidGlassProps> = ({
  shape = 'pill',
  tint = 'clear',
  interactive = false,
  as = 'div',
  ariaLabel,
  disabled = false,
  onClick,
  className = '',
  style,
  children,
}) => {
  const Tag = as;
  const classes = [
    'tp-liquid-glass',
    `tp-liquid-glass--${shape}`,
    `tp-liquid-glass--tint-${tint}`,
    interactive ? 'tp-liquid-glass--interactive' : '',
    disabled ? 'tp-liquid-glass--disabled' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Tag
      type={as === 'button' ? 'button' : undefined}
      disabled={as === 'button' ? disabled : undefined}
      aria-label={ariaLabel}
      aria-disabled={as !== 'button' && disabled ? true : undefined}
      data-shape={shape}
      data-tint={tint}
      className={classes}
      style={style}
      onClick={disabled ? undefined : onClick}
    >
      {children}
    </Tag>
  );
};
