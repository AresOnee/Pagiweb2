## Tarea: Fase 5 — Componentes Estáticos Astro

**Branch:** `claude/migrate-gel-chile-astro-UpH9c`
**Repo:** `AresOnee/Pagiweb2`

Migración del sitio Gel Chile (sistemas de puesta a tierra) de HTML/CSS/JS vanilla a Astro + Preact + nanostores. Fases 0-4 completadas en esta branch. Tu tarea es crear los componentes estáticos de Astro (.astro) que se renderizan en el servidor — son 7 componentes.

### Estado actual del branch

Archivos existentes en src/ — NINGUNO debe modificarse, solo CREAR nuevos:

- `src/components/islands/` — 6 CSS Modules (Fase 3) — NO TOCAR
- `src/content/products/` — 21 JSON — NO TOCAR
- `src/content.config.ts` — Zod schema — NO TOCAR
- `src/data/categories.json` — 7 categorías — NO TOCAR
- `src/data/site-config.ts` — Config Gel Chile — NO TOCAR (importar datos de aquí)
- `src/pages/index.astro` — Placeholder verificación — NO TOCAR (se reemplaza en Fase 7)
- `src/stores/cart.ts` — nanostores cart — NO TOCAR
- `src/stores/theme.ts` — nanostores theme — NO TOCAR
- `src/styles/global.css` — Variables, reset, botones — NO TOCAR
- `src/styles/dark-mode.css` — [data-theme="dark"] — NO TOCAR
- `src/styles/animations.css` — @keyframes + AOS — NO TOCAR
- `src/types/index.ts` — TypeScript types — NO TOCAR

Paquetes instalados: astro ^5.17.1, @astrojs/preact, preact, nanostores, @nanostores/preact

---

### Archivos a crear (7 componentes)

#### 1. `src/layouts/MainLayout.astro`

Layout principal. Todas las páginas lo usarán.

**Props:** `title: string`, `description?: string`

Debe incluir:
- `<!DOCTYPE html>`, `<html lang="es">`, `<head>`, `<body>`
- Imports CSS: `global.css`, `dark-mode.css`, `animations.css`
- Google Fonts: Inter (400, 500, 600, 700, 800)
- Meta tags: charset, viewport, description, Open Graph básico
- Favicon (usar el SVG inline que está en `index.html` línea 21 como placeholder)
- Inline script anti-flash dark mode en `<head>` — IMPORTANTE para evitar flash blanco:

```html
<script is:inline>
  (function() {
    var t = localStorage.getItem('gelchile_theme') ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', t);
  })();
</script>
```

- Skip link: `<a href="#main-content" class="skip-link">Saltar al contenido principal</a>`
- `<Header currentPath={Astro.url.pathname} />`
- `<main id="main-content"><slot /></main>`
- `<Footer />`

#### 2. `src/components/Header.astro`

Header fijo con navegación.

**Referencia HTML:** `index.html` líneas 40-76
**Referencia CSS:** `css/styles.css` líneas 372-558

**Props:** `currentPath: string` (para marcar nav-link activo)

Debe incluir:
- Logo: `<img src="/assets/img/gelchile-logo.png" alt="Gel Chile" />` + texto "Gel Chile" (NO el SVG de rayo de ElectroMedición)
- Nav links: Inicio (`/`), Nosotros (`/nosotros`), Productos (`/productos`), Cotización (`/cotizacion`)
- Link activo con clase `active` basado en `currentPath`
- Botón carrito: link a `/cotizacion` con SVG bolsa + texto "Cotizar" + `<span class="cart-count" id="cart-count-slot"></span>` (placeholder para island Fase 6)
- Botón hamburguesa mobile (solo HTML/CSS, la lógica interactiva viene en Fase 6)
- **CSS scoped** en `<style>` — extraer de `css/styles.css` líneas 372-558 (header, logo, nav, responsive)

#### 3. `src/components/Footer.astro`

Footer con datos de contacto.

**Referencia CSS:** `css/styles.css` líneas 1705-1830

Debe incluir:
- Import `siteConfig` de `../data/site-config`
- Logo Gel Chile + descripción: "Sistemas de Puesta a Tierra y Protección Eléctrica"
- Datos de contacto desde `siteConfig.contact`:
  - Email: ventas@gelchile.cl
  - 3 teléfonos
  - Oficina: Los Diamantes N°0360, Maipú, RM
  - Bodega: Camino Lo Ermita Parcela-21, Calera de Tango
- Links navegación (mismos que header)
- Copyright: © {new Date().getFullYear()} Gel Chile
- **CSS scoped** en `<style>` — extraer de `css/styles.css` líneas 1705-1830

#### 4. `src/components/ProductCard.astro`

Tarjeta de producto para catálogo.

**Referencia CSS:** `css/styles.css` líneas 813-996

**Props:**

```
sku: string
title: string
category: string
categorySlug: string
description: string
image: string | null
badge: string | null
inStock: boolean
```

Debe incluir:
- Link a página individual: `/productos/${sku.toLowerCase()}`
- Imagen producto (con placeholder SVG si `image` es null)
- Badge si existe (Popular, Pro, Servicio)
- Título, categoría, descripción truncada (~80 chars con CSS line-clamp)
- Botón placeholder: `<button class="btn-add-quote" data-sku={sku} data-title={title} data-category={category} data-image={image}>Cotizar</button>` (se reemplaza con island en Fase 6)
- **CSS scoped** en `<style>` — extraer de `css/styles.css` líneas 813-996

#### 5. `src/components/HeroSection.astro`

Hero de la página inicio.

**Referencia HTML:** `index.html` líneas 98-160
**Referencia CSS:** `css/styles.css` líneas 559-726

Contenido Gel Chile (NO ElectroMedición):
- Badge: "Sistemas de Puesta a Tierra"
- Título: "Soluciones Profesionales en **Puesta a Tierra** y Protección Eléctrica"
- Descripción corta de Gel Chile
- CTAs: "Ver Productos" (`/productos`) + "Solicitar Cotización" (`/cotizacion`)
- Decoraciones de fondo (hero-decoration divs)
- **CSS scoped** en `<style>` — extraer de `css/styles.css` líneas 559-726

#### 6. `src/components/CategoryCard.astro`

Tarjeta de categoría para home.

**Referencia CSS:** `css/styles.css` líneas 727-812

**Props:**

```
id: string        // categorySlug
name: string
description: string
count: number
```

Debe incluir:
- Link a `/productos?categoria={id}`
- Nombre, descripción, count de productos
- Icono SVG genérico
- **CSS scoped** en `<style>` — extraer de `css/styles.css` líneas 727-812

#### 7. `src/components/Breadcrumb.astro`

Breadcrumb de navegación.

**Referencia CSS:** `css/styles.css` líneas 1873-1913

**Props:** `items: { label: string; href?: string }[]`

**CSS scoped** en `<style>` — extraer de `css/styles.css` líneas 1873-1913

---

### Reglas de CSS

- Cada componente usa `<style>` scoped de Astro (NO archivos CSS separados)
- Extraer CSS de `css/styles.css` usando las líneas indicadas como referencia
- Las variables CSS (var(--color-primary) etc.) ya están disponibles via global.css
- Incluir media queries responsive dentro del `<style>` de cada componente
- Dark mode overrides: usar `[data-theme="dark"]` selector dentro del `<style>` scoped
- NO crear archivos .css separados para estos componentes

### Imports en componentes

En MainLayout.astro:

```
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';
import '../styles/global.css';
import '../styles/dark-mode.css';
import '../styles/animations.css';
```

En Header.astro y Footer.astro:

```
import { siteConfig } from '../data/site-config';
```

---

### Verificación

1. `npm run build` debe pasar sin errores
2. Los componentes NO deben importar stores ni usar JavaScript interactivo — son 100% estáticos
3. No debe haber errores de TypeScript
4. El CSS scoped no debe conflictar con los CSS Modules de islands

### Commit y Push

```
git add src/layouts/ src/components/Header.astro src/components/Footer.astro src/components/ProductCard.astro src/components/HeroSection.astro src/components/CategoryCard.astro src/components/Breadcrumb.astro
git commit -m "feat: Add static Astro components - layout, header, footer, cards (Phase 5)"
git push -u origin claude/migrate-gel-chile-astro-UpH9c
```

---

### REGLAS IMPORTANTES

1. **DETENTE después de la Fase 5.** No continues con la Fase 6. Avísame que terminaste.
2. **NO modifiques** ningún archivo existente en src/ — solo CREA archivos nuevos.
3. **Lee css/styles.css** y los HTML (index.html, nosotros.html, productos.html, cotizacion.html) como referencia antes de implementar.
4. **Todo el contenido** debe ser de Gel Chile (puesta a tierra), NO de ElectroMedición (medición eléctrica).
5. Si encuentras el plan file en `/root/.claude/plans/cozy-mapping-quiche.md`, marca la Fase 5 como completada. Si no lo encuentras, no te preocupes.
6. **Esta es la fase más grande.** Lee primero TODOS los archivos de referencia, planifica, y luego implementa componente por componente.
