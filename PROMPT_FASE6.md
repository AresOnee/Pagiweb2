## Tarea: Fase 6 — Islands Interactivos (Preact)

**Branch:** Crear desde `main` (que ya tiene Fases 0-5 mergeadas)
**Repo:** `AresOnee/Pagiweb2`

Migración del sitio Gel Chile (sistemas de puesta a tierra) de HTML/CSS/JS vanilla a Astro + Preact + nanostores. Fases 0-5 completadas y mergeadas en `main`. Tu tarea es crear los 9 islands interactivos de Preact (.tsx).

**IMPORTANTE:** Esta es la fase más grande en código interactivo. Hay 9 islands. Lee los archivos fuente ANTES de implementar.

---

### Estado actual en `main`

Archivos existentes relevantes — NO TOCAR (solo crear nuevos .tsx):

**Stores (Fase 4) — importar desde estos:**
- `src/stores/cart.ts` — exports: `$cart`, `$cartCount`, `CartItem`, `addItem()`, `removeItem()`, `updateQuantity()`, `clearCart()`, `initCart()`
- `src/stores/theme.ts` — exports: `$theme`, `Theme`, `toggleTheme()`, `initTheme()`

**CSS Modules (Fase 3) — ya existen, importar en los .tsx:**
- `src/components/islands/DarkModeToggle.module.css`
- `src/components/islands/ProductFilter.module.css`
- `src/components/islands/ProductModal.module.css`
- `src/components/islands/QuoteForm.module.css`
- `src/components/islands/QuoteItems.module.css`
- `src/components/islands/Toast.module.css`

**Componentes Astro (Fase 5) — NO TOCAR:**
- `src/components/Header.astro` (tiene `id="cart-count-slot"` para CartCount island)
- `src/components/ProductCard.astro` (tiene `data-*` attrs en botón cotizar para AddToQuoteBtn)
- `src/layouts/MainLayout.astro`, Footer, HeroSection, CategoryCard, Breadcrumb

**Config:**
- `src/data/site-config.ts` — `siteConfig.ui.toastDuration` (3000ms)
- `src/types/index.ts` — tipos Product, Category, CategorySlug, etc.

**Paquetes instalados:** preact, @nanostores/preact, nanostores, @astrojs/preact

---

### Archivos a crear (9 islands en `src/components/islands/`)

Crear en este orden (por dependencias):

#### 1. `Toast.tsx`
**Referencia:** `js/main.js` líneas 1266-1318
**CSS Module:** `Toast.module.css` (ya existe)

Componente de notificación toast reutilizable.
- Props: `message: string`, `type?: 'success' | 'error' | 'info'`, `duration?: number` (default 3000 de siteConfig)
- Auto-desaparece después de `duration`ms
- Animación de entrada/salida
- Exportar también una función helper `showToast(message, type?)` que crea el toast programáticamente (otros islands la usarán)
- Para la función `showToast`: usar un sistema de eventos custom o un store atom simple para comunicar entre islands

#### 2. `DarkModeToggle.tsx`
**Referencia:** `js/main.js` líneas 351-422
**CSS Module:** `DarkModeToggle.module.css` (ya existe)
**Hydration:** `client:load`

Toggle de dark/light mode.
- Import `useStore` de `@nanostores/preact`
- Import `$theme`, `toggleTheme`, `initTheme` de stores
- Llamar `initTheme()` en `useEffect` al montar
- Mostrar icono sol/luna según estado
- Posición fija en esquina inferior izquierda (el CSS Module ya lo define)
- Tooltip "Modo oscuro" / "Modo claro"

#### 3. `CartCount.tsx`
**Referencia:** `js/main.js` líneas 776-788
**Hydration:** `client:load`
**NO tiene CSS Module** — es un componente inline pequeño

Badge con conteo del carrito.
- Import `useStore` de `@nanostores/preact`
- Import `$cartCount`, `initCart` de stores
- Llamar `initCart()` en `useEffect` al montar
- Mostrar número solo si count > 0
- Se renderiza dentro del `<span id="cart-count-slot">` del Header
- Styling inline o muy mínimo (badge naranja circular, ya hay CSS en Header.astro para `.cart-count`)

#### 4. `AddToQuoteBtn.tsx`
**Referencia:** `js/main.js` líneas 800-812
**Hydration:** `client:visible`
**NO tiene CSS Module** — usa clases de global.css (`.btn-add-quote`)

Botón para agregar producto al carrito de cotización.
- Props: `sku: string`, `title: string`, `category: string`, `image: string | null`
- Import `addItem` de cart store
- Al hacer click: llamar `addItem({sku, title, category, quantity: 1, image})` y mostrar toast de confirmación
- Usar `event.stopPropagation()` y `event.preventDefault()` para evitar navegar a la página del producto
- Texto: "Cotizar" con icono +

#### 5. `ProductFilter.tsx`
**Referencia:** `js/main.js` líneas 997-1063
**CSS Module:** `ProductFilter.module.css` (ya existe)
**Hydration:** `client:load`

Filtro de productos por categoría + búsqueda por texto.
- Props: `categories: { id: string; name: string; count: number }[]`, `products: ProductData[]` (recibe todos los productos como prop)
- Donde `ProductData` es: `{ sku: string; title: string; category: string; categorySlug: string; description: string; image: string | null; badge: string | null; inStock: boolean; features: string[] }`
- Estado local: `selectedCategory` (string | null), `searchText` (string)
- Filtrar productos por categoría Y por texto (buscar en title, sku, description)
- Renderizar grid de product cards (como divs internos, NO importar ProductCard.astro — recrear el HTML de la tarjeta dentro del island)
- Cada card debe tener link a `/productos/{sku.toLowerCase()}`
- Incluir botón "Cotizar" en cada card que use `addItem`

#### 6. `MobileMenu.tsx`
**Hydration:** `client:load`
**NO tiene CSS Module** — usa las clases scoped de Header.astro

Toggle del menú mobile.
- Buscar el elemento `.mobile-menu` y `.mobile-menu-btn` en el DOM
- Toggle clase `.active` en el menú
- Toggle `aria-expanded` en el botón
- Cerrar al hacer click en un link o fuera del menú
- Este island NO renderiza HTML propio — solo agrega interactividad al HTML existente del Header
- Implementar como un componente que se monta con `client:load` y manipula el DOM con `useEffect`

#### 7. `ProductModal.tsx`
**Referencia:** `js/main.js` líneas 537-742
**CSS Module:** `ProductModal.module.css` (ya existe)
**Hydration:** `client:load`

Modal de detalle del producto.
- Props: recibir la lista completa de productos como JSON
- Escuchar clicks en product cards para abrir el modal
- Tabs: "Especificaciones" y "Características"
- Tab Especificaciones: tabla key/value de `specs`
- Tab Características: lista de `features`
- Botón "Agregar a Cotización" dentro del modal (usa `addItem`)
- Botón cerrar (X) + cerrar al click en overlay + cerrar con Escape
- Transición de entrada/salida
- NOTA: Si ProductFilter.tsx ya maneja las cards internamente, ProductModal debe escuchar eventos de click tanto de las cards del island como de posibles cards estáticas

#### 8. `QuoteItems.tsx`
**Referencia:** `js/main.js` líneas 908-991
**CSS Module:** `QuoteItems.module.css` (ya existe)
**Hydration:** `client:load`

Lista de items en la página de cotización.
- Import `useStore` de `@nanostores/preact`
- Import `$cart`, `removeItem`, `updateQuantity`, `clearCart`, `initCart` de stores
- Llamar `initCart()` en `useEffect`
- Renderizar lista de CartItem con:
  - Imagen (o placeholder)
  - Título y categoría
  - Controles de cantidad (+/-)
  - Botón eliminar (X)
- Mostrar estado vacío si no hay items
- Botón "Vaciar cotización"
- Mostrar total de items

#### 9. `QuoteForm.tsx`
**Referencia:** `js/main.js` líneas 1069-1183
**CSS Module:** `QuoteForm.module.css` (ya existe)
**Hydration:** `client:load`

Formulario de cotización con Web3Forms.
- Import `useStore` de `@nanostores/preact`
- Import `$cart`, `clearCart` de stores
- Campos: nombre, empresa, email, teléfono, mensaje
- Validación en el frontend:
  - Nombre: requerido, mínimo 3 chars
  - Email: requerido, formato válido
  - Teléfono: requerido
  - Carrito no vacío
- Al enviar: construir el body con los datos del formulario + items del carrito como texto
- Por ahora simular envío (console.log + toast success) — Web3Forms se configura en Fase 9 con API key real
- Placeholder para API key: `YOUR_WEB3FORMS_API_KEY`
- Después de envío exitoso: `clearCart()` y mostrar mensaje de confirmación

---

### Cómo usar Preact con nanostores

```tsx
import { useStore } from '@nanostores/preact';
import { $cart, $cartCount, addItem } from '../../stores/cart';

export default function CartCount() {
  const count = useStore($cartCount);
  if (count === 0) return null;
  return <span class="cart-count">{count}</span>;
}
```

### Cómo importar CSS Modules en Preact

```tsx
import styles from './Toast.module.css';

export default function Toast({ message }: Props) {
  return <div class={styles.toast}>{message}</div>;
}
```

**IMPORTANTE:** En Preact se usa `class` (no `className`). Y para CSS Modules, acceder via `styles.nombreClase`.

---

### Limpieza menor

Eliminar 4 archivos residuales que quedaron del merge:
- `assets/img/products/bq-detail.png`
- `assets/img/products/bq-small.png`
- `assets/img/products/bqh-001.png`
- `assets/img/products/bqv-001.png`

Estos son duplicados viejos. Las imágenes correctas están en `public/assets/img/products/`.

---

### Verificación

1. `npm run build` debe pasar sin errores
2. Cada island debe:
   - Importar correctamente de stores y CSS Modules
   - Usar `useStore` de `@nanostores/preact` para reactividad
   - NO acceder a `window`/`document`/`localStorage` sin guards (SSR safety)
   - Llamar `initCart()` o `initTheme()` en `useEffect` (no en el render)
3. Los CSS Modules existentes deben importarse sin crear nuevos archivos CSS
4. Para islands sin CSS Module (CartCount, AddToQuoteBtn, MobileMenu), usar styling inline o clases de global.css

### Commit y Push

```
git add src/components/islands/*.tsx
git add -u  # para archivos eliminados
git commit -m "feat: Add 9 interactive Preact islands (Phase 6)"
git push -u origin <tu-branch>
```

---

### REGLAS IMPORTANTES

1. **DETENTE después de la Fase 6.** No continues con la Fase 7. Avísame que terminaste.
2. **NO modifiques** componentes .astro existentes (Header, Footer, ProductCard, etc.), ni stores, ni CSS globales, ni CSS Modules, ni content.config.ts, ni los JSON de productos.
3. **Lee los archivos fuente** `js/main.js` (especialmente las líneas indicadas para cada island) antes de implementar.
4. **Usa Preact, NO React.** Hooks se importan de `preact/hooks`. `class` en vez de `className`.
5. Si encuentras el plan file en `/root/.claude/plans/cozy-mapping-quiche.md`, marca la Fase 6 como completada.
6. **Esta es una fase grande (9 islands).** Planifica bien el orden de implementación antes de empezar a escribir código.
