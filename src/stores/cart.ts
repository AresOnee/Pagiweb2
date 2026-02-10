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
  variant?: string;
};

/** Match cart item by SKU + variant (composite key). */
function matchItem(item: CartItem, sku: string, variant?: string): boolean {
  return item.sku === sku && (item.variant || '') === (variant || '');
}

/** Main cart state */
export const $cart = atom<CartItem[]>([]);

/** Total quantity of all items in the cart */
export const $cartCount = computed($cart, (items) =>
  items.reduce((sum, item) => sum + item.quantity, 0)
);

/**
 * Add a product to the cart.
 * If the SKU+variant already exists, increments its quantity.
 */
export function addItem(product: CartItem): void {
  const current = $cart.get();
  const idx = current.findIndex((item) => matchItem(item, product.sku, product.variant));
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

/** Remove an item from the cart by SKU+variant. Returns the removed item for undo. */
export function removeItem(sku: string, variant?: string): CartItem | null {
  const current = $cart.get();
  const item = current.find((i) => matchItem(i, sku, variant)) || null;
  $cart.set(current.filter((i) => !matchItem(i, sku, variant)));
  return item;
}

/** Restore a previously removed item (for Undo functionality). H3. */
export function restoreItem(item: CartItem): void {
  const current = $cart.get();
  // If item already exists, update quantity; otherwise add
  const idx = current.findIndex((i) => matchItem(i, item.sku, item.variant));
  if (idx > -1) {
    const updated = [...current];
    updated[idx] = { ...updated[idx], quantity: updated[idx].quantity + item.quantity };
    $cart.set(updated);
  } else {
    $cart.set([...current, item]);
  }
}

/** Update the quantity of an item. Minimum is 1. */
export function updateQuantity(sku: string, quantity: number, variant?: string): void {
  const q = Math.max(1, quantity);
  $cart.set(
    $cart.get().map((item) =>
      matchItem(item, sku, variant) ? { ...item, quantity: q } : item
    )
  );
}

/** Clear all items from the cart. Returns previous items for undo. H3. */
export function clearCart(): CartItem[] {
  const previous = $cart.get();
  $cart.set([]);
  return previous;
}

/** Restore entire cart state (for Undo after clear). H3. */
export function restoreCart(items: CartItem[]): void {
  $cart.set(items);
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
