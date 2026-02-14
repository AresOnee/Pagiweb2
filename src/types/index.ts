/**
 * Type definitions for Gel Chile — derived from content.config.ts Zod schema.
 *
 * These types are used in components and pages that consume product data.
 * The canonical source of truth is the Zod schema in src/content.config.ts.
 * After running `astro sync`, Astro also generates CollectionEntry<'products'>
 * which can be used as an alternative.
 */

/** Product category slug — used in URLs and filtering */
export type CategorySlug =
  | 'electrodos-electromagneticos'
  | 'electrodos-grafito'
  | 'barras-quimicas'
  | 'aditivos'
  | 'pararrayos'
  | 'soldadura-exotermica'
  | 'moldes-grafito'
  | 'accesorios'
  | 'servicios';

/** Product category display name */
export type CategoryName =
  | 'Electrodos Electromagnéticos'
  | 'Electrodos de Grafito'
  | 'Barras Químicas'
  | 'Aditivos'
  | 'Pararrayos y Protección'
  | 'Soldadura Exotérmica'
  | 'Moldes de Grafito'
  | 'Accesorios'
  | 'Servicios';

/** Product badge values */
export type BadgeValue = 'Popular' | 'Pro' | 'Servicio';

/** Product data shape — matches content.config.ts schema */
export interface Product {
  sku: string;
  title: string;
  category: CategoryName;
  categorySlug: CategorySlug;
  description: string;
  features: string[];
  specs: Record<string, string>;
  image: string | null;
  images?: string[];
  inStock: boolean;
  badge: BadgeValue | null;
  subcategories?: string[];
  variants?: Array<{ id: string; label: string; group?: string }>;
}

/** Slim product data for catalog grid (excludes features, images, variants) */
export type ProductSlim = Pick<Product,
  'sku' | 'title' | 'category' | 'categorySlug' | 'description' | 'image' | 'badge' | 'inStock' | 'subcategories'
> & {
  hasVariants: boolean;
};

/** Category metadata from categories.json */
export interface Category {
  id: CategorySlug;
  name: CategoryName;
  description: string;
  count: number;
}
