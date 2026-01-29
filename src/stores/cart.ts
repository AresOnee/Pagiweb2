/**
 * Cart (quote) store — nanostores.
 * Will be implemented in Phase 4.
 */
import { atom } from 'nanostores';

export type CartItem = {
  sku: string;
  title: string;
  quantity: number;
  image: string;
};

export const $cart = atom<CartItem[]>([]);
