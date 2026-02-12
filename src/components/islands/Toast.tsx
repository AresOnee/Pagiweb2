import { useStore } from '@nanostores/preact';
import { useState, useEffect, useRef } from 'preact/hooks';
import { $toasts, dismissToast } from '../../stores/toast';
import type { ToastMessage } from '../../stores/toast';
import { siteConfig } from '../../data/site-config';
import styles from './Toast.module.css';

/** Individual toast with slide-in animation and auto-dismiss. */
function ToastItem({ toast }: { toast: ToastMessage }) {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<number | null>(null);

  // Longer duration for toasts with actions (5s vs 3s)
  const duration = toast.action ? 5000 : siteConfig.ui.toastDuration;

  useEffect(() => {
    // Slide-in animation on next frame
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setVisible(true));
    });

    // Auto-dismiss after duration
    timerRef.current = window.setTimeout(() => {
      setVisible(false);
      // Wait for CSS transition to complete before removing
      setTimeout(() => dismissToast(toast.id), 300);
    }, duration);

    return () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current);
    };
  }, [toast.id, duration]);

  const handleClose = () => {
    if (timerRef.current !== null) clearTimeout(timerRef.current);
    setVisible(false);
    setTimeout(() => dismissToast(toast.id), 300);
  };

  const handleAction = () => {
    if (toast.action?.onClick) {
      toast.action.onClick();
    }
    handleClose();
  };

  const typeClass = toast.type === 'success'
    ? styles['toast-success']
    : toast.type === 'error'
      ? styles['toast-error']
      : styles['toast-info'];

  return (
    <div class={`${styles.toast} ${typeClass} ${visible ? styles.show : ''}`}>
      <span class={styles['toast-icon']}>
        {toast.type === 'success' && (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24" aria-hidden="true">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        )}
        {toast.type === 'error' && (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        )}
        {toast.type === 'info' && (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        )}
      </span>
      <span class={styles['toast-message']}>{toast.message}</span>
      {toast.action && (
        <button class={styles['toast-action']} onClick={handleAction}>
          {toast.action.label}
        </button>
      )}
      <button class={styles['toast-close']} onClick={handleClose} aria-label="Cerrar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18" aria-hidden="true">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}

/** Toast container — renders all active toasts. Mount with client:load. */
export default function Toast() {
  const toasts = useStore($toasts);

  if (toasts.length === 0) return null;

  return (
    <div class={styles['toast-container']} role="status" aria-live="polite">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
