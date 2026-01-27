/**
 * ElectroMedicion - Schema de Producto
 * Schema para validación de productos.
 *
 * Este archivo sirve como referencia para crear el schema de
 * Astro Content Collections. Copiar la versión Zod a src/content/config.ts
 */

// Schema en formato simple (para validación manual)
const productSchema = {
  sku: {
    type: 'string',
    required: true,
    pattern: /^[A-Z]{3}-\d{3}$/,
    description: 'Código único del producto (ej: MUL-001)'
  },
  title: {
    type: 'string',
    required: true,
    minLength: 5,
    maxLength: 100,
    description: 'Nombre del producto'
  },
  category: {
    type: 'enum',
    values: [
      'Multimetros',
      'Pinzas',
      'Telurometros',
      'Megohmetros',
      'Analizadores',
      'Detectores'
    ],
    required: true,
    description: 'Categoría del producto'
  },
  categorySlug: {
    type: 'string',
    required: true,
    pattern: /^[a-z]+$/,
    description: 'Slug de la categoría para URLs'
  },
  description: {
    type: 'string',
    required: true,
    minLength: 20,
    maxLength: 500,
    description: 'Descripción corta del producto'
  },
  features: {
    type: 'array',
    items: 'string',
    required: true,
    minItems: 1,
    maxItems: 10,
    description: 'Lista de características/beneficios'
  },
  specs: {
    type: 'record',
    required: true,
    description: 'Especificaciones técnicas (clave: valor)'
  },
  inStock: {
    type: 'boolean',
    default: true,
    description: 'Disponibilidad en stock'
  },
  badge: {
    type: 'string',
    nullable: true,
    enum: ['Popular', 'Bestseller', 'Nuevo', 'Pro', null],
    description: 'Badge opcional para destacar'
  }
};

// Validador simple
function validateProduct(product) {
  const errors = [];

  // SKU
  if (!product.sku) {
    errors.push('SKU es requerido');
  } else if (!/^[A-Z]{3}-\d{3}$/.test(product.sku)) {
    errors.push('SKU debe tener formato XXX-000');
  }

  // Title
  if (!product.title || product.title.length < 5) {
    errors.push('Título debe tener al menos 5 caracteres');
  }

  // Category
  const validCategories = ['Multimetros', 'Pinzas', 'Telurometros', 'Megohmetros', 'Analizadores', 'Detectores'];
  if (!validCategories.includes(product.category)) {
    errors.push('Categoría inválida');
  }

  // Features
  if (!Array.isArray(product.features) || product.features.length === 0) {
    errors.push('Debe tener al menos una característica');
  }

  // Specs
  if (!product.specs || typeof product.specs !== 'object') {
    errors.push('Especificaciones son requeridas');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * =============================================================
 * PARA ASTRO CONTENT COLLECTIONS
 * Copiar el siguiente código a: src/content/config.ts
 * =============================================================
 */

/*
import { z, defineCollection } from 'astro:content';

const productsCollection = defineCollection({
  type: 'data', // JSON files
  schema: z.object({
    sku: z.string().regex(/^[A-Z]{3}-\d{3}$/, 'SKU debe tener formato XXX-000'),
    title: z.string().min(5).max(100),
    category: z.enum([
      'Multimetros',
      'Pinzas',
      'Telurometros',
      'Megohmetros',
      'Analizadores',
      'Detectores'
    ]),
    categorySlug: z.string().regex(/^[a-z]+$/),
    description: z.string().min(20).max(500),
    features: z.array(z.string()).min(1).max(10),
    specs: z.record(z.string()),
    inStock: z.boolean().default(true),
    badge: z.string().nullable().optional(),
  }),
});

export const collections = {
  products: productsCollection,
};
*/

// Exportar para uso en Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    productSchema,
    validateProduct
  };
}
