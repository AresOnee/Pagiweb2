/**
 * UI store — nanostores.
 * Cross-island UI state.
 */
import { atom } from 'nanostores';

/** Active variant group/model code emitted by VariantSelector */
export const $activeVariantGroup = atom<string>('');
