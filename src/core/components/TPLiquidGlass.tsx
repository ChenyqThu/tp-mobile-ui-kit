import React, { useRef } from 'react';
import type { TPLiquidGlassProps } from '../types';
import { TPLiquidGlassBackdrop } from './TPLiquidGlassBackdrop';
import '../../styles/tp-core-nav-controls.css';

/**
 * Apple iOS 26/27 Liquid Glass surface primitive combining SDF Snell-law optical backdrop
 * refraction (with subtle RGB dispersion in Chromium), directional 135-degree specular rim
 * highlights, and inner meniscus depth lighting.
 */
export const TPLiquidGlass: React.FC<TPLiquidGlassProps> = ({
  shape = 'pill',
  tint = 'clear',
  interactive = false,
  refraction = 1,
  dispersion = 1,
  blur = 2,
  optical = true,
  as = 'div',
  ariaLabel,
  disabled = false,
  onClick,
  className = '',
  style,
  children,
}) => {
  const hostRef = useRef<HTMLElement | null>(null);

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

  return React.createElement(
    as,
    {
      ref: hostRef,
      type: as === 'button' ? 'button' : undefined,
      disabled: as === 'button' ? disabled : undefined,
      'aria-label': ariaLabel,
      'aria-disabled': as !== 'button' && disabled ? true : undefined,
      'data-shape': shape,
      'data-tint': tint,
      className: classes,
      style,
      onClick: disabled ? undefined : onClick,
    },
    <TPLiquidGlassBackdrop
      hostRef={hostRef}
      shape={shape}
      tint={tint}
      refraction={refraction}
      dispersion={dispersion}
      blur={blur}
      optical={optical}
    />,
    <span className="tp-liquid-glass-content">{children}</span>,
  );
};
