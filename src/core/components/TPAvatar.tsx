import React from 'react';
import { hasTPIcon, TPIcon } from '../../assets-lib';
import type { TPAvatarProps } from '../types';
import '../../styles/tp-core-extended.css';

function computeInitials(name?: string): string {
  if (!name) return '';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

/**
 * User / account / device avatar supporting image, name initials, TPIcon, shape, and presence status dot.
 */
export const TPAvatar: React.FC<TPAvatarProps> = ({
  src,
  name,
  icon,
  size = 'md',
  status = 'none',
  shape = 'circle',
  alt,
  className = '',
  style,
}) => {
  const iconPx = size === 'sm' ? 16 : size === 'lg' ? 24 : 20;
  const initials = computeInitials(name);

  let content: React.ReactNode = initials || '?';
  if (src) {
    content = <img src={src} alt={alt ?? name ?? 'Avatar'} className="tp-avatar-img" />;
  } else if (icon !== undefined) {
    content =
      typeof icon === 'string' && hasTPIcon(icon) ? <TPIcon name={icon} size={iconPx} /> : icon;
  }

  return (
    <span
      className={`tp-avatar tp-avatar--${size} tp-avatar--${shape} ${className}`.trim()}
      data-size={size}
      data-shape={shape}
      aria-label={src ? undefined : alt ?? name}
      style={style}
    >
      {content}
      {status !== 'none' && (
        <span
          className={`tp-avatar-status tp-avatar-status--${status}`}
          aria-label={`Status: ${status}`}
        />
      )}
    </span>
  );
};
