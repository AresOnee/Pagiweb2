# Componentes Astro - Arquitectura de Islas

Este documento describe cómo migrar los componentes de ElectroMedición a Astro.

## Componentes ESTÁTICOS (sin JavaScript del cliente)

Estos componentes se renderizan en el servidor y no necesitan hidratación.

| Componente | Props | Notas |
|------------|-------|-------|
| Header.astro | activePage: string | Nav estático, cart-count es isla separada |
| Footer.astro | - | Puro HTML |
| HeroSection.astro | title, subtitle, cta | SVG decorativos incluidos |
| ProductCard.astro | product: Product | Botón cotizar es isla separada |
| FeatureCard.astro | icon, title, description | |
| TestimonialCard.astro | testimonial: Testimonial | |
| CategoryCard.astro | category: Category | |
| Breadcrumb.astro | items: BreadcrumbItem[] | |
| Button.astro | variant, size, href | |
| Badge.astro | text, variant | |

## Componentes ISLA (necesitan `client:*`)

Estos componentes requieren JavaScript del cliente para interactividad.

| Componente | Directiva | Razón |
|------------|-----------|-------|
| CartCount.tsx | `client:load` | Actualiza con CartStore |
| AddToQuoteBtn.tsx | `client:visible` | Agrega al carrito |
| ProductModal.tsx | `client:load` | Modal interactivo con tabs |
| ProductFilter.tsx | `client:load` | Filtros de categoría |
| QuoteItems.tsx | `client:visible` | Lista del carrito editable |
| QuoteForm.tsx | `client:load` | Validación + envío |
| DarkModeToggle.tsx | `client:load` | Toggle + localStorage |
| MobileMenu.tsx | `client:load` | Menú hamburguesa |
| Toast.tsx | `client:load` | Notificaciones |

## Directivas de Astro

- `client:load` - Cargar JS inmediatamente (para elementos visibles arriba del fold)
- `client:visible` - Cargar JS cuando el elemento entre en viewport
- `client:idle` - Cargar JS cuando el navegador esté idle
- `client:media` - Cargar JS según media query

## Flujo de Datos con nanostores

```
CartStore (src/stores/cart.ts)
    ↓
┌───────────────────────────────────────┐
│  import { $cart } from '../stores'    │
│  const cart = useStore($cart)         │
└───────────────────────────────────────┘
    ↓
CartCount ←── subscribe ──→ AddToQuoteBtn
    ↓                            ↓
QuoteItems ←── subscribe ──→ ProductModal
```

## Migración de main.js a Islas

| Módulo actual (main.js) | Líneas | Isla Astro |
|-------------------------|--------|------------|
| Cart | 747-991 | CartCount + QuoteItems |
| ProductModal | 537-742 | ProductModal.tsx |
| DarkMode | 351-422 | DarkModeToggle.tsx |
| ProductFilter | 997-1063 | ProductFilter.tsx |
| FormValidator | 1069-1183 | QuoteForm.tsx |
| Toast | 424-535 | Toast.tsx |
| MobileMenu | 1215-1260 | MobileMenu.tsx |

## Estructura de Carpetas Propuesta

```
src/
├── components/
│   ├── Header.astro
│   ├── Footer.astro
│   ├── ProductCard.astro
│   ├── islands/
│   │   ├── CartCount.tsx
│   │   ├── AddToQuoteBtn.tsx
│   │   ├── ProductModal.tsx
│   │   ├── ProductFilter.tsx
│   │   ├── QuoteItems.tsx
│   │   ├── QuoteForm.tsx
│   │   ├── DarkModeToggle.tsx
│   │   ├── MobileMenu.tsx
│   │   └── Toast.tsx
│   └── ui/
│       ├── Button.astro
│       ├── Badge.astro
│       └── Breadcrumb.astro
├── layouts/
│   └── MainLayout.astro
├── pages/
│   ├── index.astro
│   ├── productos/
│   │   ├── index.astro
│   │   └── [sku].astro
│   ├── cotizacion.astro
│   └── nosotros.astro
├── content/
│   └── products/
│       ├── mul-001.json
│       └── ... (copiar de data/products/)
├── stores/
│   ├── cart.ts
│   └── theme.ts
└── styles/
    └── global.css
```

## Ejemplo: ProductCard.astro

```astro
---
import type { Product } from '../types';
import AddToQuoteBtn from './islands/AddToQuoteBtn.tsx';
import Badge from './ui/Badge.astro';

interface Props {
  product: Product;
}

const { product } = Astro.props;
---

<div class="product-card" data-category={product.categorySlug}>
  <div class="product-image">
    {product.badge && <Badge text={product.badge} />}
    <!-- SVG del producto -->
  </div>
  <div class="product-content">
    <span class="product-category">{product.category}</span>
    <h3 class="product-title">{product.title}</h3>
    <p class="product-description">{product.description}</p>
    <span class="product-sku">SKU: {product.sku}</span>
  </div>
  <div class="product-footer">
    <AddToQuoteBtn client:visible product={product} />
  </div>
</div>

<style>
  /* Estilos scoped - copiar de css/styles.css líneas 813-996 */
</style>
```

## Pasos de Migración

1. `npm create astro@latest electromedicion-astro`
2. Copiar `data/products/*.json` → `src/content/products/`
3. Copiar `data/categories.json` → `src/data/`
4. Crear `src/content/config.ts` (copiar de schemas/product.schema.js)
5. Instalar `nanostores` y `@nanostores/react`
6. Crear stores basados en `js/cart-store.js` y `js/theme-store.js`
7. Crear componentes Astro basados en los HTMLs
8. Crear islas React/Preact para interactividad
9. Copiar CSS relevante a cada componente
10. Configurar Netlify/Vercel para deploy
