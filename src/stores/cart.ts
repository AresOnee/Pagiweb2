/**
 * Cart (quote) store — nanostores.
 * Manages the quote/cart state with localStorage persistence.
 * Phase 4 implementation.
 */
import { atom, computed } from 'nanostores';
import { siteConfig } from '../data/site-config';

export type CartItem = {
  sku: string;
  title: string;
  category: string;
  quantity: number;
  image: string | null;
};

/** Main cart state */
export const $cart = atom<CartItem[]>([]);

/** Total quantity of all items in the cart */
export const $cartCount = computed($cart, (items) =>
  items.reduce((sum, item) => sum + item.quantity, 0)
);

/**
 * Add a product to the cart.
 * If the SKU already exists, increments its quantity.
 */
export function addItem(product: CartItem): void {
  const current = $cart.get();
  const idx = current.findIndex((item) => item.sku === product.sku);
  if (idx > -1) {
    const updated = [...current];
    updated[idx] = {
      ...updated[idx],
      quantity: updated[idx].quantity + (product.quantity || 1),
    };
    $cart.set(updated);
  } else {
    $cart.set([...current, { ...product, quantity: product.quantity || 1 }]);
  }
}

/** Remove an item from the cart by SKU. */
export function removeItem(sku: string): void {
  $cart.set($cart.get().filter((item) => item.sku !== sku));
}

/** Update the quantity of an item. Minimum is 1. */
export function updateQuantity(sku: string, quantity: number): void {
  const q = Math.max(1, quantity);
  $cart.set(
    $cart.get().map((item) =>
      item.sku === sku ? { ...item, quantity: q } : item
    )
  );
}

/** Clear all items from the cart. */
export function clearCart(): void {
  $cart.set([]);
}

/**
 * Initialize the cart from localStorage and set up auto-persistence.
 * Must be called client-side only (e.g., in a Preact island's useEffect).
 */
export function initCart(): void {
  if (typeof window === 'undefined') return;

  try {
    const stored = localStorage.getItem(siteConfig.storage.cartKey);
    if (stored) {
      $cart.set(JSON.parse(stored));
    }
  } catch (e) {
    console.error('Error loading cart:', e);
  }

  $cart.subscribe((items) => {
    try {
      localStorage.setItem(siteConfig.storage.cartKey, JSON.stringify(items));
    } catch (e) {
      console.error('Error saving cart:', e);
    }
  });
}
