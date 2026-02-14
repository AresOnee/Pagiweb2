/**
 * Recently Viewed products store — nanostores.
 * Tracks last visited products with localStorage persistence.
 */
import { atom } from 'nanostores';
import { siteConfig } from '../data/site-config';

export type ViewedItem = {
  sku: string;
  title: string;
  image: string | null;
  categorySlug: string;
  slug: string;
  viewedAt: number;
};

const MAX_ITEMS = 8;

/** Recently viewed products state */
export const $recentlyViewed = atom<ViewedItem[]>([]);

/**
 * Add a product to recently viewed.
 * Moves to front if already viewed. Caps at MAX_ITEMS.
 */
export function addViewed(item: Omit<ViewedItem, 'viewedAt'>): void {
  const current = $recentlyViewed.get();
  const filtered = current.filter((v) => v.sku !== item.sku);
  const updated = [{ ...item, viewedAt: Date.now() }, ...filtered].slice(0, MAX_ITEMS);
  $recentlyViewed.set(updated);
}

let _initialized = false;

/**
 * Initialize from localStorage and set up auto-persistence.
 * Must be called client-side only.
 */
export function initRecentlyViewed(): void {
  if (typeof window === 'undefined' || _initialized) return;
  _initialized = true;

  try {
    const stored = localStorage.getItem(siteConfig.storage.recentlyViewedKey);
    if (stored) {
      $recentlyViewed.set(JSON.parse(stored));
    }
  } catch (e) {
    console.error('Error loading recently viewed:', e);
  }

  $recentlyViewed.subscribe((items) => {
    try {
      localStorage.setItem(siteConfig.storage.recentlyViewedKey, JSON.stringify(items));
    } catch (e) {
      console.error('Error saving recently viewed:', e);
    }
  });
}
