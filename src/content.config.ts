/**
 * Gel Chile — Content Collections Configuration
 * Astro 5 Content Layer API with Zod validation.
 *
 * Validates all 21 product JSON files in src/content/products/.
 * Replaces the old schemas/product.schema.js (demo data).
 */
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * The 7 product category slugs used for URL routing.
 * Update this tuple when adding a new category.
 */
const categorySlugs = [
  'electrodos-electromagneticos',
  'electrodos-grafito',
  'barras-quimicas',
  'aditivos',
  'pararrayos',
  'accesorios',
  'servicios',
] as const;

/**
 * The 7 display names for product categories.
 * Must stay in sync with categorySlugs.
 */
const categoryNames = [
  'Electrodos Electromagnéticos',
  'Electrodos de Grafito',
  'Barras Químicas',
  'Aditivos',
  'Pararrayos y Protección',
  'Accesorios',
  'Servicios',
] as const;

/**
 * Allowed badge values for product highlights.
 */
const badgeValues = ['Popular', 'Pro', 'Servicio'] as const;

const products = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/products' }),
  schema: z.object({
    sku: z
      .string()
      .regex(/^[A-Z]{2,3}-\d{3}$/, 'SKU must match pattern XX(X)-000'),
    title: z.string().min(5).max(100),
    category: z.enum(categoryNames),
    categorySlug: z.enum(categorySlugs),
    description: z.string().min(20).max(500),
    features: z.array(z.string().min(1)).min(1).max(20),
    specs: z.record(z.string(), z.string()),
    image: z.string().startsWith('/').nullable(),
    images: z.array(z.string().startsWith('/')).optional(),
    inStock: z.boolean().default(true),
    badge: z.enum(badgeValues).nullable(),
    variants: z.array(z.object({
      id: z.string(),
      label: z.string(),
    })).optional(),
  }),
});

export const collections = { products };
