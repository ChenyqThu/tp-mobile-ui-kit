import React, { useContext, useRef } from 'react';
import { hasTPIcon, TPIcon } from '../../assets-lib';
import type { TPIconButtonGroupProps, TPIconButtonProps } from '../types';
import { TPLiquidGlassBackdrop } from './TPLiquidGlassBackdrop';
import '../../styles/tp-core-extended.css';

const IconButtonGroupContext = React.createContext(false);

function renderBadge(badge: TPIconButtonProps['badge']): React.ReactNode {
  if (badge === undefined || badge === null || badge === false || badge === '' || badge === 0) {
    return null;
  }
  if (badge === true) {
    return <span className="tp-icon-btn-badge tp-icon-btn-badge--dot" aria-hidden="true" />;
  }
  const text = typeof badge === 'number' && badge > 99 ? '99+' : String(badge);
  return <span className="tp-icon-btn-badge">{text}</span>;
}

/**
 * Circular mobile icon button supporting Apple Liquid Glass, filled, tonal, and ghost variants.
 */
export const TPIconButton: React.FC<TPIconButtonProps> = ({
  icon,
  variant = 'glass',
  size = 'md',
  badge,
  disabled = false,
  ariaLabel,
  onClick,
  className = '',
  style,
}) => {
  const btnRef = useRef<HTMLButtonElement>(null);
  const inGroup = useContext(IconButtonGroupContext);
  const iconPx = size === 'sm' ? 16 : size === 'lg' ? 22 : 19;
  const resolvedIcon =
    typeof icon === 'string' && hasTPIcon(icon) ? (
      <TPIcon name={icon} size={iconPx} />
    ) : (
      icon
    );

  const classes = [
    'tp-icon-btn',
    `tp-icon-btn--${variant}`,
    `tp-icon-btn--${size}`,
    disabled ? 'tp-icon-btn--disabled' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      ref={btnRef}
      type="button"
      className={classes}
      data-variant={variant}
      data-size={size}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
      style={style}
    >
      {variant === 'glass' && !inGroup && (
        <TPLiquidGlassBackdrop
          hostRef={btnRef}
          shape="circle"
          tint="clear"
          bezelWidth={12}
          refraction={1.05}
          dispersion={0.9}
          blur={2}
        />
      )}
      <span className="tp-icon-btn-glyph">{resolvedIcon}</span>
      {renderBadge(badge)}
    </button>
  );
};

/**
 * Floating pill capsule grouping multiple TPIconButton actions with shared Liquid Glass or solid backing.
 */
export const TPIconButtonGroup: React.FC<TPIconButtonGroupProps> = ({
  variant = 'glass',
  children,
  className = '',
  style,
}) => {
  const groupRef = useRef<HTMLDivElement>(null);
  return (
    <IconButtonGroupContext.Provider value={true}>
      <div
        ref={groupRef}
        className={`tp-icon-btn-group tp-icon-btn-group--${variant} ${className}`.trim()}
        data-variant={variant}
        role="group"
        style={style}
      >
        {variant === 'glass' && (
          <TPLiquidGlassBackdrop
            hostRef={groupRef}
            shape="pill"
            tint="clear"
            bezelWidth={12}
            refraction={1.05}
            dispersion={0.9}
            blur={2}
          />
        )}
        {children}
      </div>
    </IconButtonGroupContext.Provider>
  );
};
