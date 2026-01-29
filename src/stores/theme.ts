/**
 * Theme store — nanostores.
 * Manages dark/light mode with localStorage persistence and DOM updates.
 * Phase 4 implementation.
 */
import { atom } from 'nanostores';
import { siteConfig } from '../data/site-config';

export type Theme = 'light' | 'dark';

/** Current theme state */
export const $theme = atom<Theme>('light');

/** Apply theme to the DOM by setting data-theme attribute on <html>. */
function applyTheme(theme: Theme): void {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', theme);
  }
}

/** Toggle between light and dark themes. */
export function toggleTheme(): void {
  const next = $theme.get() === 'light' ? 'dark' : 'light';
  $theme.set(next);
}

/**
 * Initialize the theme store.
 * Priority: 1) localStorage saved value, 2) system preference, 3) default 'light'.
 * Sets up auto-persistence and DOM application on every change.
 * Must be called client-side only (e.g., in a Preact island's useEffect).
 */
export function initTheme(): void {
  if (typeof window === 'undefined') return;

  try {
    const saved = localStorage.getItem(siteConfig.storage.themeKey);
    if (saved === 'light' || saved === 'dark') {
      $theme.set(saved);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      $theme.set(prefersDark ? 'dark' : 'light');
    }
  } catch (e) {
    console.error('Error loading theme:', e);
  }

  $theme.subscribe((theme) => {
    applyTheme(theme);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(siteConfig.storage.themeKey, theme);
      } catch (e) {
        console.error('Error saving theme:', e);
      }
    }
  });
}
