import React from 'react';
import type { TPSkeletonProps } from '../types';
import '../../styles/tp-core-extended.css';

/**
 * Shimmer placeholder supporting text line stacks, rect, circle, and dashboard card geometries.
 */
export const TPSkeleton: React.FC<TPSkeletonProps> = ({
  variant = 'text',
  width,
  height,
  lines = 3,
  animated = true,
  className = '',
  style,
}) => {
  const animClass = animated ? 'tp-skeleton-item--animated' : '';

  if (variant === 'card') {
    return (
      <div className={`tp-skeleton-card ${className}`.trim()} aria-busy="true" style={style}>
        <div className={`tp-skeleton-item ${animClass}`.trim()} style={{ width: '48%', height: 18 }} />
        <div className={`tp-skeleton-item ${animClass}`.trim()} style={{ width: '100%', height: 64, borderRadius: 10 }} />
        <div className={`tp-skeleton-item ${animClass}`.trim()} style={{ width: '76%', height: 12 }} />
      </div>
    );
  }

  if (variant === 'circle') {
    const dim = width ?? height ?? 40;
    return (
      <span
        aria-busy="true"
        className={`tp-skeleton-item tp-skeleton-item--circle ${animClass} ${className}`.trim()}
        style={{ width: dim, height: dim, ...style }}
      />
    );
  }

  if (variant === 'rect') {
    return (
      <div
        aria-busy="true"
        className={`tp-skeleton-item ${animClass} ${className}`.trim()}
        style={{ width: width ?? '100%', height: height ?? 80, ...style }}
      />
    );
  }

  return (
    <div className={`tp-skeleton-text-group ${className}`.trim()} aria-busy="true" style={style}>
      {Array.from({ length: Math.max(1, lines) }).map((_, i) => (
        <div
          key={i}
          className={`tp-skeleton-item ${animClass}`.trim()}
          style={{
            width: i === lines - 1 && lines > 1 ? '68%' : width ?? '100%',
            height: height ?? 13,
          }}
        />
      ))}
    </div>
  );
};
