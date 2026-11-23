import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { TPToastProps, TPToastType } from '../types';
import '../../styles/tp-core-overlays.css';

const ToastTypeIcon: React.FC<{ type: TPToastType }> = ({ type }) => {
  switch (type) {
    case 'info':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.6" />
          <rect x="11.2" y="7.8" width="1.6" height="1.6" rx="0.4" fill="currentColor" />
          <rect x="11.2" y="10.8" width="1.6" height="5.8" rx="0.4" fill="currentColor" />
        </svg>
      );
    case 'success':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.6" />
          <path
            d="M8 12.2L10.8 15L16 9.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'warning':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.6" />
          <rect x="11.2" y="7.5" width="1.6" height="5.8" rx="0.4" fill="currentColor" />
          <rect x="11.2" y="14.8" width="1.6" height="1.6" rx="0.4" fill="currentColor" />
        </svg>
      );
    case 'error':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.6" />
          <path
            d="M9 9L15 15M15 9L9 15"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      );
    case 'loading':
      return (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          className="tp-toast-spinner"
          aria-hidden="true"
        >
          <circle
            cx="12"
            cy="12"
            r="9"
            stroke="currentColor"
            strokeOpacity="0.28"
            strokeWidth="2.2"
          />
          <path
            d="M12 3A9 9 0 0 1 21 12"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </svg>
      );
    default:
      return null;
  }
};

export const TPToast: React.FC<TPToastProps> = ({
  open = true,
  type = 'default',
  message,
  duration,
  position = 'center',
  onClose,
  className = '',
  style,
}) => {
  const effectiveDuration = duration ?? (type === 'loading' ? 0 : 2500);

  useEffect(() => {
    if (!open || !onClose || effectiveDuration <= 0) return;
    const timer = setTimeout(() => {
      onClose();
    }, effectiveDuration);
    return () => clearTimeout(timer);
  }, [open, effectiveDuration, onClose]);

  if (!open) return null;

  const icon = <ToastTypeIcon type={type} />;

  return (
    <div className={`tp-toast-container tp-toast-container--${position}`}>
      <div
        role={type === 'error' ? 'alert' : 'status'}
        aria-live={type === 'error' ? 'assertive' : 'polite'}
        data-type={type}
        className={`tp-toast tp-toast--${type} ${className}`.trim()}
        style={style}
      >
        {type !== 'default' && <span className="tp-toast-icon">{icon}</span>}
        <span className="tp-toast-message">{message}</span>
      </div>
    </div>
  );
};

export type TPToastOptions = Omit<TPToastProps, 'open'>;

export interface TPToastContextValue {
  show: (opts: TPToastOptions | string) => void;
  dismiss: () => void;
}

const DEFAULT_TOAST_CONTEXT: TPToastContextValue = {
  show: () => {},
  dismiss: () => {},
};

const TPToastContext = createContext<TPToastContextValue>(DEFAULT_TOAST_CONTEXT);

interface ToastState extends TPToastOptions {
  open: boolean;
}

export const TPToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const dismiss = useCallback(() => {
    clearTimer();
    setToast((prev) => (prev ? { ...prev, open: false } : null));
  }, [clearTimer]);

  const show = useCallback(
    (optsOrMsg: TPToastOptions | string) => {
      clearTimer();
      const opts: TPToastOptions =
        typeof optsOrMsg === 'string' ? { message: optsOrMsg } : optsOrMsg;
      const type: TPToastType = opts.type ?? 'default';
      const duration = opts.duration ?? (type === 'loading' ? 0 : 2500);

      setToast({ ...opts, type, open: true });

      if (duration > 0) {
        timerRef.current = setTimeout(() => {
          timerRef.current = null;
          setToast((prev) => (prev ? { ...prev, open: false } : null));
          opts.onClose?.();
        }, duration);
      }
    },
    [clearTimer],
  );

  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  const value = useMemo<TPToastContextValue>(
    () => ({ show, dismiss }),
    [show, dismiss],
  );

  return (
    <TPToastContext.Provider value={value}>
      {children}
      {toast && (
        <TPToast
          open={toast.open}
          type={toast.type}
          message={toast.message}
          duration={0}
          position={toast.position}
          className={toast.className}
          style={toast.style}
        />
      )}
    </TPToastContext.Provider>
  );
};

export function useTPToast(): TPToastContextValue {
  return useContext(TPToastContext);
}
