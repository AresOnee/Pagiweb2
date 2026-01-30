/**
 * UI store — nanostores.
 * Cross-island state for product modal.
 * ProductFilter writes (card click), ProductModal reads.
 * Phase 6 implementation.
 */
import { atom } from 'nanostores';
import type { Product } from '../types';

/** Currently selected product for the modal. null = modal closed. */
export const $selectedProduct = atom<Product | null>(null);

/** Open the product modal with the given product. */
export function openProductModal(product: Product): void {
  $selectedProduct.set(product);
}

/** Close the product modal. */
export function closeProductModal(): void {
  $selectedProduct.set(null);
}
