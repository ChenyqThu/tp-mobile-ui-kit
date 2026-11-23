import React, { useRef, useState } from 'react';
import type { TPSwipeRowProps } from '../types';
import '../../styles/tp-core-extended.css';

/**
 * Mobile swipeable list row exposing trailing actions (`neutral`, `focus`, `warning`, `alert`).
 * Supports pointer horizontal drag gestures as well as accessible click/controlled `open`.
 */
export const TPSwipeRow: React.FC<TPSwipeRowProps> = ({
  actions,
  open,
  defaultOpen = false,
  onOpenChange,
  disabled = false,
  children,
  className = '',
  style,
}) => {
  const isControlled = open !== undefined;
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isOpen = isControlled ? open : internalOpen;

  const actionsWidth = Math.max(72, actions.length * 76);
  const [dragOffset, setDragOffset] = useState<number | null>(null);
  const startXRef = useRef<number | null>(null);

  const setOpenState = (next: boolean) => {
    if (!isControlled) {
      setInternalOpen(next);
    }
    onOpenChange?.(next);
  };

  const translateX = dragOffset !== null ? dragOffset : isOpen ? -actionsWidth : 0;

  return (
    <div
      className={`tp-swipe-row ${isOpen ? 'tp-swipe-row--open' : ''} ${
        disabled ? 'tp-swipe-row--disabled' : ''
      } ${className}`.trim()}
      data-open={String(isOpen)}
      style={style}
    >
      <div
        className="tp-swipe-actions"
        style={{ width: `${actionsWidth}px` }}
        aria-hidden={!isOpen}
      >
        {actions.map((action) => (
          <button
            key={action.key}
            type="button"
            disabled={disabled}
            tabIndex={isOpen ? 0 : -1}
            className={`tp-swipe-action tp-swipe-action--${action.tone ?? 'neutral'}`}
            onClick={() => {
              if (disabled) return;
              action.onClick?.();
              setOpenState(false);
            }}
          >
            {action.label}
          </button>
        ))}
      </div>

      <div
        className="tp-swipe-content"
        style={{ transform: `translateX(${translateX}px)` }}
        onPointerDown={(e) => {
          if (disabled) return;
          startXRef.current = e.clientX;
        }}
        onPointerMove={(e) => {
          if (disabled || startXRef.current === null) return;
          const base = isOpen ? -actionsWidth : 0;
          const delta = e.clientX - startXRef.current;
          if (Math.abs(delta) > 6) {
            const clamped = Math.max(-actionsWidth, Math.min(0, base + delta));
            setDragOffset(clamped);
          }
        }}
        onPointerUp={(e) => {
          if (disabled || startXRef.current === null) return;
          const delta = e.clientX - startXRef.current;
          startXRef.current = null;
          setDragOffset(null);
          if (delta < -28) {
            setOpenState(true);
          } else if (delta > 24) {
            setOpenState(false);
          }
        }}
        onPointerCancel={() => {
          startXRef.current = null;
          setDragOffset(null);
        }}
      >
        {children}
      </div>
    </div>
  );
};
