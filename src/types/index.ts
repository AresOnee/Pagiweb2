/**
 * Type definitions for Gel Chile.
 * Will be refined in Phase 2 when Content Collections schema is set up.
 */

export interface Product {
  sku: string;
  title: string;
  category: string;
  categorySlug: string;
  description: string;
  features: string[];
  specs: Record<string, string>;
  image: string;
  inStock: boolean;
  badge: string | null;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  count: number;
}
