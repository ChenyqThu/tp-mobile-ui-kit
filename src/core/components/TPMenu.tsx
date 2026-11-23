import React, { useEffect, useRef } from 'react';
import type { TPMenuItem, TPMenuProps } from '../types';
import '../../styles/tp-core-overlays.css';

const CheckIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M5 12.5L9.8 17L19 7.5"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const TPMenu: React.FC<TPMenuProps> = ({
  open,
  items,
  onSelect,
  onClose,
  align = 'left',
  className = '',
  style,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    let closedOnMouseDown = false;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    const handleMouseDown = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (menuRef.current && target && !menuRef.current.contains(target)) {
        closedOnMouseDown = true;
        onClose();
      }
    };

    const handleClick = (event: MouseEvent) => {
      if (closedOnMouseDown) {
        closedOnMouseDown = false;
        return;
      }
      const target = event.target as Node | null;
      if (menuRef.current && target && !menuRef.current.contains(target)) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('click', handleClick);
    };
  }, [open, onClose]);

  if (!open) return null;

  const handleItemClick = (item: TPMenuItem) => {
    if (item.disabled) return;
    onSelect(item);
    onClose();
  };

  return (
    <div
      ref={menuRef}
      role="menu"
      data-align={align}
      className={`tp-menu tp-menu--align-${align} ${className}`.trim()}
      style={style}
      onClick={(e) => e.stopPropagation()}
    >
      {items.map((item) => {
        const classes = [
          'tp-menu-item',
          item.selected ? 'tp-menu-item--selected' : '',
          item.danger ? 'tp-menu-item--danger' : '',
          item.disabled ? 'tp-menu-item--disabled' : '',
        ]
          .filter(Boolean)
          .join(' ');

        return (
          <React.Fragment key={item.key}>
            {item.dividerBefore && <div className="tp-menu-divider" role="separator" />}
            <button
              type="button"
              role="menuitem"
              data-selected={item.selected ? 'true' : undefined}
              className={classes}
              disabled={item.disabled}
              aria-disabled={item.disabled || undefined}
              onClick={() => handleItemClick(item)}
            >
              {item.icon !== undefined && (
                <span className="tp-menu-item-icon">{item.icon}</span>
              )}
              <span className="tp-menu-item-label">{item.label}</span>
              {item.selected && (
                <span className="tp-menu-item-check" aria-label="selected">
                  <CheckIcon />
                </span>
              )}
            </button>
          </React.Fragment>
        );
      })}
    </div>
  );
};
