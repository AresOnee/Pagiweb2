## Tarea: Fase 7 — Páginas Astro

**Branch:** Crear desde `main` (que tiene Fases 0-6 mergeadas)
**Repo:** `AresOnee/Pagiweb2`

Migración del sitio Gel Chile (sistemas de puesta a tierra). Fases 0-6 completadas. Tu tarea es crear las 5 páginas del sitio en `src/pages/`.

**IMPORTANTE:** Esta fase conecta TODO lo anterior — componentes estáticos (Fase 5) + islands interactivos (Fase 6) + Content Collections (Fase 2) + stores (Fase 4). Lee los componentes existentes antes de implementar.

---

### Estado actual en `main`

**Componentes Astro disponibles (Fase 5) — importar desde estos:**
- `src/layouts/MainLayout.astro` — Layout base con Header, Footer, CSS, anti-flash script
- `src/components/HeroSection.astro` — Hero del home
- `src/components/CategoryCard.astro` — Props: `id, name, description, count`
- `src/components/ProductCard.astro` — Props: `sku, title, category, categorySlug, description, image, badge, inStock`
- `src/components/Breadcrumb.astro` — Props: `items: {label, href?}[]`

**Islands Preact disponibles (Fase 6) — importar con client: directives:**
- `src/components/islands/Toast.tsx` — `client:load` — Montar en MainLayout o en cada página
- `src/components/islands/DarkModeToggle.tsx` — `client:load` — Montar en MainLayout o en cada página
- `src/components/islands/CartCount.tsx` — `client:load` — Para Header (ya tiene slot)
- `src/components/islands/AddToQuoteBtn.tsx` — `client:visible` — Props: `sku, title, category, image`
- `src/components/islands/ProductFilter.tsx` — `client:load` — Props: `products: Product[], categories: Category[]`
- `src/components/islands/MobileMenu.tsx` — `client:load` — Sin props (headless, manipula DOM)
- `src/components/islands/ProductModal.tsx` — `client:load` — Sin props (lee de $selectedProduct store)
- `src/components/islands/QuoteItems.tsx` — `client:load` — Sin props (lee de $cart store)
- `src/components/islands/QuoteForm.tsx` — `client:load` — Sin props (lee de $cart store)

**Content Collections (Fase 2):**
```typescript
import { getCollection } from 'astro:content';
const allProducts = await getCollection('products');
// Cada producto: { id, data: { sku, title, category, categorySlug, description, features, specs, image, inStock, badge } }
```

**Categorías:**
```typescript
import categoriesData from '../data/categories.json';
// Array: [{ id, name, description, count }]
```

**Tipos (src/types/index.ts):**
```typescript
type Product = { sku, title, category, categorySlug, description, features: string[], specs: Record<string,string>, image: string|null, inStock: boolean, badge: string|null }
type Category = { id: string, name: string, description: string, count: number }
```

---

### Archivos a crear/modificar (5 páginas + 1 modificación a MainLayout)

#### 0. Modificar `src/layouts/MainLayout.astro`

Agregar los islands globales que deben estar en TODAS las páginas:

```astro
---
import Toast from '../components/islands/Toast.tsx';
import DarkModeToggle from '../components/islands/DarkModeToggle.tsx';
import MobileMenu from '../components/islands/MobileMenu.tsx';
---
<!-- Antes del cierre de </body> -->
<Toast client:load />
<DarkModeToggle client:load />
<MobileMenu client:load />
```

Esto asegura que toast, dark mode toggle y mobile menu funcionen en todas las páginas.

#### 1. `src/pages/index.astro` — Home (REEMPLAZAR el placeholder actual)

**Referencia HTML:** `index.html`

Debe incluir:
- Usar `MainLayout` con title "Gel Chile — Sistemas de Puesta a Tierra y Protección Eléctrica"
- `<HeroSection />`
- Sección de categorías: grid de `<CategoryCard />` con datos de `categories.json`
- Sección de productos destacados: mostrar ~6 productos con badge o los primeros 6 de la colección, usando `<ProductCard />`
- Sección CTA final: invitar a cotizar con link a `/cotizacion`
- Usar `data-aos` attributes para animaciones de scroll si lo deseas

#### 2. `src/pages/productos/index.astro` — Catálogo de productos

**Referencia HTML:** `productos.html`

Debe incluir:
- `MainLayout` con title "Productos — Gel Chile"
- `<Breadcrumb items={[{label: 'Inicio', href: '/'}, {label: 'Productos'}]} />`
- Cargar TODOS los productos con `getCollection('products')`
- Cargar categorías de `categories.json`
- Pasar datos al island `<ProductFilter />`:

```astro
---
import ProductFilter from '../../components/islands/ProductFilter.tsx';
import ProductModal from '../../components/islands/ProductModal.tsx';

const allProducts = await getCollection('products');
const products = allProducts.map(p => p.data);
---

<ProductFilter client:load products={products} categories={categoriesData} />
<ProductModal client:load />
```

**IMPORTANTE:** ProductFilter necesita recibir los datos como props porque es un island (client-side). Serializar los datos del producto como props. El island ProductModal debe montarse en esta página para que funcione el modal al clickear cards.

#### 3. `src/pages/productos/[slug].astro` — Página individual de producto

**NUEVA** — No existe en el sitio actual. Genera una página estática por producto.

```astro
---
import { getCollection } from 'astro:content';

export async function getStaticPaths() {
  const products = await getCollection('products');
  return products.map(product => ({
    params: { slug: product.data.sku.toLowerCase() },
    props: { product: product.data },
  }));
}

const { product } = Astro.props;
---
```

Debe incluir:
- `MainLayout` con title `{product.title} — Gel Chile`
- `<Breadcrumb items={[{label:'Inicio', href:'/'}, {label:'Productos', href:'/productos'}, {label: product.title}]} />`
- Layout de 2 columnas:
  - Izquierda: imagen del producto (o placeholder SVG)
  - Derecha: título, SKU, categoría, descripción, badge, stock status
- Botón `<AddToQuoteBtn />` con `client:visible`
- Sección de especificaciones técnicas (tabla key/value de `product.specs`)
- Sección de características (lista de `product.features`)
- Link "Volver al catálogo" → `/productos`
- CSS scoped en `<style>` para el layout de la página

#### 4. `src/pages/nosotros.astro` — Información de la empresa

**Referencia HTML:** `nosotros.html`

Debe incluir:
- `MainLayout` con title "Nosotros — Gel Chile"
- `<Breadcrumb />`
- Sección "Sobre Gel Chile" — texto sobre la empresa (sistemas de puesta a tierra y protección eléctrica)
- Datos de contacto importados de `siteConfig`:
  - Email: ventas@gelchile.cl
  - Teléfonos: 3 números
  - Oficina y bodega
- Sección de valores/compromiso de la empresa
- CTA a cotización
- CSS scoped

NOTA: El cliente no ha enviado texto específico de "historia" o "misión". Usar texto genérico profesional que se pueda reemplazar después.

#### 5. `src/pages/cotizacion.astro` — Carrito de cotización

**Referencia HTML:** `cotizacion.html`

Debe incluir:
- `MainLayout` con title "Cotización — Gel Chile"
- `<Breadcrumb />`
- Layout de 2 columnas (en desktop):
  - Izquierda (más ancha): `<QuoteItems client:load />`
  - Derecha: `<QuoteForm client:load />`
- Islands se montan con `client:load` para que funcionen inmediatamente
- CSS scoped para el layout de 2 columnas + responsive (1 columna en mobile)

---

### Notas técnicas

**Content Collections en Astro 5:**
```typescript
// En getStaticPaths o en frontmatter:
import { getCollection } from 'astro:content';
const products = await getCollection('products');
// products[0].data.sku, products[0].data.title, etc.
```

**Islands con props serializadas:**
Los islands Preact reciben props vía serialización. Solo pasar datos JSON-serializables (no funciones, no clases). Los datos de productos son objetos planos — se pueden pasar directamente.

**Rutas:**
- `/` → `src/pages/index.astro`
- `/productos` → `src/pages/productos/index.astro`
- `/productos/ele-001` → `src/pages/productos/[slug].astro` (21 páginas generadas)
- `/nosotros` → `src/pages/nosotros.astro`
- `/cotizacion` → `src/pages/cotizacion.astro`

Total: 25 páginas HTML estáticas (4 fijas + 21 dinámicas de producto)

---

### Verificación

1. `npm run build` debe generar 25+ páginas HTML sin errores
2. Las rutas deben coincidir con los nav links del Header (`/`, `/nosotros`, `/productos`, `/cotizacion`)
3. Las páginas de producto individuales deben generarse en `/productos/{sku-lowercase}`
4. Los islands deben montarse correctamente con las directivas client:
5. Content Collections debe cargar los 21 productos

### Commit y Push

```
git add src/pages/ src/layouts/MainLayout.astro
git commit -m "feat: Add all pages - home, products, product detail, about, quote (Phase 7)"
git push -u origin <tu-branch>
```

---

### REGLAS IMPORTANTES

1. **DETENTE después de la Fase 7.** No continues con la Fase 8. Avísame que terminaste.
2. **Solo modificar `MainLayout.astro`** para agregar Toast, DarkModeToggle y MobileMenu globales. NO modificar otros componentes existentes (.astro, .tsx, .css, .ts).
3. **Reemplazar** `src/pages/index.astro` (el placeholder de verificación de Fase 2).
4. **Lee los componentes de Fase 5 y 6** antes de implementar para entender qué props esperan.
5. **Todo el contenido** debe ser de Gel Chile (puesta a tierra), NO de ElectroMedición.
6. Si encuentras el plan file en `/root/.claude/plans/cozy-mapping-quiche.md`, marca la Fase 7 como completada.
7. **Lee `nosotros.html`** del sitio demo como referencia de estructura, pero reemplaza todo el contenido por Gel Chile.
