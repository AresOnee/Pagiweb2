/**
 * Theme store — nanostores.
 * Will be implemented in Phase 4.
 */
import { atom } from 'nanostores';

export type Theme = 'light' | 'dark';

export const $theme = atom<Theme>('light');
