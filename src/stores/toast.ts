/**
 * Toast store — nanostores.
 * Cross-island communication bus for toast notifications.
 * Any island can call showToast(); Toast.tsx subscribes and renders.
 * Phase 6 implementation.
 * H3: Added action support for Undo functionality.
 */
import { atom } from 'nanostores';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
  action?: ToastAction;
}

/** Active toast messages */
export const $toasts = atom<ToastMessage[]>([]);

/** Show a toast notification. Other islands import this function.
 * @param message - Toast message text
 * @param type - Toast type: 'success' | 'error' | 'info'
 * @param action - Optional action button { label, onClick }
 */
export function showToast(message: string, type: ToastType = 'info', action?: ToastAction): void {
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2);
  $toasts.set([...$toasts.get(), { id, message, type, action }]);
}

/** Dismiss a specific toast by ID. */
export function dismissToast(id: string): void {
  $toasts.set($toasts.get().filter((t) => t.id !== id));
}
