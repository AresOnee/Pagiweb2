# Fase 8: Branding Final, SEO y CartCount — Proyecto Gel Chile (Astro)

## Contexto

Estás trabajando en el proyecto **Gel Chile** (sistemas de puesta a tierra y protección eléctrica). Es un sitio web Astro + Preact + nanostores. Las fases 0-7 están completadas y mergeadas en `main`.

**Stack:** Astro 5 + Preact + nanostores + CSS Modules
**Repo:** `AresOnee/Pagiweb2`
**Branch base:** `main` (DEBES hacer `git pull origin main` primero)

## Estado actual del proyecto

Lo que YA está implementado (no tocar a menos que se indique):
- 21 productos JSON validados por Zod en `src/content/products/`
- 7 categorías en `src/data/categories.json`
- `src/data/site-config.ts` con config completa Gel Chile
- 7 componentes estáticos Astro (Header, Footer, HeroSection, ProductCard, CategoryCard, Breadcrumb, MainLayout)
- 9 islands Preact (Toast, DarkModeToggle, CartCount, AddToQuoteBtn, ProductFilter, MobileMenu, ProductModal, QuoteItems, QuoteForm)
- 4 stores (cart.ts, theme.ts, toast.ts, ui.ts)
- 5 páginas (index, productos/index, productos/[slug], nosotros, cotizacion)
- 3 CSS globales + 6 CSS Modules
- Build exitoso generando 25 páginas HTML

## Tareas de esta fase

### Tarea 1: Montar CartCount island en Header (ALTA prioridad)

**Problema:** `src/components/islands/CartCount.tsx` existe (31 líneas, usa `useStore($cartCount)`) pero NO está montado en el Header. El Header tiene un placeholder:

```html
<span class="cart-count" id="cart-count-slot" style="display: none;">0</span>
```

**Solución:** Modificar `src/components/Header.astro` para:
1. Importar `CartCount` desde `../islands/CartCount.tsx`
2. Reemplazar el `<span>` placeholder con `<CartCount client:load />`
3. Asegurarse de que el CSS del badge funcione (ya existe en Header.astro scoped styles como `.cart-count`)
4. Verificar que el CartCount se actualiza reactivamente cuando se agrega un producto al carrito

**Archivo a modificar:** `src/components/Header.astro`

### Tarea 2: Favicon branded (ALTA prioridad)

**Problema:** `src/layouts/MainLayout.astro` usa un favicon inline SVG genérico (rectángulo azul/dorado). No representa a Gel Chile.

**Solución:**
1. Crear `public/favicon.svg` — un SVG minimalista que represente a Gel Chile. Usa los colores del brand:
   - Primario: `#0052CC` (azul eléctrico)
   - Secundario: `#FFD700` (dorado)
   - Puede ser las letras "GC" estilizadas, un rayo simplificado, o una abstracción del logo
2. Actualizar el `<link rel="icon">` en `MainLayout.astro` para apuntar a `/favicon.svg`
3. Opcionalmente agregar `<link rel="apple-touch-icon" href="/apple-touch-icon.png" />` si se genera PNG

**Archivos:** `public/favicon.svg` (nuevo), `src/layouts/MainLayout.astro` (modificar)

### Tarea 3: Open Graph Image (MEDIA prioridad)

**Problema:** Las meta tags Open Graph existen (`og:title`, `og:description`, etc.) pero falta `og:image`. Sin esta tag, al compartir el sitio en redes sociales no se muestra imagen preview.

**Solución:** Agregar en `MainLayout.astro`, dentro del `<head>`:

```html
<meta property="og:image" content={`${Astro.site}assets/img/gelchile-logo.png`} />
<meta property="og:image:alt" content="Gel Chile - Sistemas de Puesta a Tierra" />
<meta property="og:image:width" content="800" />
<meta property="og:image:height" content="600" />
```

Nota: Usa el logo existente `gelchile-logo.png` como imagen OG. No es ideal (lo ideal es 1200x630px) pero funciona y está disponible.

**Archivo:** `src/layouts/MainLayout.astro`

### Tarea 4: Twitter Card meta tags (MEDIA prioridad)

**Solución:** Agregar en `MainLayout.astro`, dentro del `<head>`, después de las OG tags:

```html
<meta name="twitter:card" content="summary" />
<meta name="twitter:title" content={title} />
<meta name="twitter:description" content={description} />
<meta name="twitter:image" content={`${Astro.site}assets/img/gelchile-logo.png`} />
```

**Archivo:** `src/layouts/MainLayout.astro`

### Tarea 5: JSON-LD Structured Data (BAJA prioridad)

Agregar un script `type="application/ld+json"` en MainLayout.astro con datos de LocalBusiness:

```html
<script type="application/ld+json" set:html={JSON.stringify({
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Gel Chile",
  "description": "Sistemas de Puesta a Tierra y Protección Eléctrica",
  "url": "https://gelchile.cl",
  "telephone": "+56999496909",
  "email": "ventas@gelchile.cl",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Los Diamantes N°0360",
    "addressLocality": "Maipú",
    "addressRegion": "RM",
    "addressCountry": "CL"
  }
})} />
```

Usar `siteConfig` importado para los valores dinámicos. En Astro, usar `set:html` para inyectar JSON sin escape.

**Archivo:** `src/layouts/MainLayout.astro`

### Tarea 6: Limpiar comentarios legacy en CSS (BAJA prioridad)

En `src/components/islands/ProductModal.module.css` hay comentarios como:
- `/* Modal header (legacy) */`
- `/* Legacy modal footer */`

Reemplazar "legacy" por algo descriptivo o eliminar el marcador "(legacy)".

**Archivo:** `src/components/islands/ProductModal.module.css`

### Tarea 7: Verificar build

Ejecutar `npm run build` y confirmar:
- 0 errores
- 25 páginas generadas (4 fijas + 21 producto)
- Sin warnings nuevos

## Reglas técnicas

1. **Preact, NO React:** En archivos `.tsx` usa `class` (no `className`), hooks de `preact/hooks`, `useStore` de `@nanostores/preact`
2. **SVG en .astro:** Usa kebab-case (`stroke-width`, `stroke-linecap`) — es HTML estándar
3. **SVG en .tsx:** Usa camelCase (`strokeWidth`, `strokeLinecap`) — es JSX/Preact
4. **CSS scoped en .astro:** Dark mode con `:global([data-theme="dark"])` dentro de `<style>`
5. **CSS Modules en .tsx:** Dark mode con `:global([data-theme="dark"])` dentro del module
6. **SSR guards:** `typeof window !== 'undefined'` antes de acceder a `window`/`document`/`localStorage`
7. **Imágenes:** Ruta `/assets/img/products/...` (carpeta `public/`)
8. **NO crear archivos en `assets/img/`** (carpeta legacy eliminada). Solo usar `public/assets/img/`

## Archivos a modificar (resumen)

| Archivo | Acción | Tarea |
|---------|--------|-------|
| `src/components/Header.astro` | Modificar | CartCount island |
| `src/layouts/MainLayout.astro` | Modificar | Favicon, og:image, Twitter cards, JSON-LD |
| `public/favicon.svg` | Crear | Favicon branded |
| `src/components/islands/ProductModal.module.css` | Modificar | Limpiar comments |

## Plan file

El plan maestro del proyecto está en `/root/.claude/plans/cozy-mapping-quiche.md`. Si no lo encuentras, no te preocupes — toda la información necesaria está en este prompt.

## Entrega

1. Crea tu branch desde `main` (nombre con prefijo `claude/`)
2. Haz commit(s) descriptivos
3. Push al remote
4. Verifica que `npm run build` pasa sin errores
