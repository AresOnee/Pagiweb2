/**
 * Toast store — nanostores.
 * Cross-island communication bus for toast notifications.
 * Any island can call showToast(); Toast.tsx subscribes and renders.
 * Phase 6 implementation.
 */
import { atom } from 'nanostores';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

/** Active toast messages */
export const $toasts = atom<ToastMessage[]>([]);

/** Show a toast notification. Other islands import this function. */
export function showToast(message: string, type: ToastType = 'info'): void {
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2);
  $toasts.set([...$toasts.get(), { id, message, type }]);
}

/** Dismiss a specific toast by ID. */
export function dismissToast(id: string): void {
  $toasts.set($toasts.get().filter((t) => t.id !== id));
}
