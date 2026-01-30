# Fase 9: Verificación, Deploy Prep y Cleanup — Proyecto Gel Chile (Astro)

## Contexto

Estás trabajando en el proyecto **Gel Chile** (sistemas de puesta a tierra y protección eléctrica). Es un sitio web Astro + Preact + nanostores. Las fases 0-8 están completadas y mergeadas en `main`. También se aplicaron fixes de dark mode comprehensivo y secciones adicionales (contacto, AOS, "Por Qué Elegirnos").

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
- Dark mode comprehensivo con paleta hardcoded (NO usa CSS variables en overrides)
- SEO: og:image, Twitter Cards, JSON-LD LocalBusiness, canonical URL, favicon SVG branded
- CartCount island montado en Header
- Build exitoso generando 25 páginas HTML

## Tareas de esta fase

### Tarea 1: Web3Forms — Formulario real (ALTA prioridad)

**Problema:** `src/components/islands/QuoteForm.tsx` (línea 94) tiene un placeholder:
```typescript
access_key: 'YOUR_WEB3FORMS_API_KEY',
```
Y el envío es un `setTimeout` simulado (líneas 108-109):
```typescript
await new Promise((resolve) => setTimeout(resolve, 2000));
console.log('Cotización enviada:', payload);
```

**Solución:** Reemplazar la simulación con un fetch real a Web3Forms:

```typescript
const response = await fetch('https://api.web3forms.com/submit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload),
});
const result = await response.json();
if (!result.success) throw new Error(result.message || 'Error al enviar');
```

**Importante:** Mantener un fallback para cuando la API key sea `'YOUR_WEB3FORMS_API_KEY'` (placeholder). Si detecta el placeholder, simular el envío como está ahora y mostrar un console.warn indicando que se debe configurar la API key real. Esto permite que el sitio funcione en desarrollo sin API key.

**Archivo a modificar:** `src/components/islands/QuoteForm.tsx` (líneas 92-123)

### Tarea 2: Página 404 (ALTA prioridad)

**Problema:** No existe una página 404 personalizada. Astro muestra una genérica.

**Solución:** Crear `src/pages/404.astro` con:
1. Usar `MainLayout` como layout
2. Diseño centrado con:
   - Número "404" grande estilizado
   - Título: "Página no encontrada"
   - Descripción: "La página que buscas no existe o fue movida."
   - Botón "Volver al Inicio" → `/`
   - Botón "Ver Productos" → `/productos`
3. CSS scoped con dark mode (usar paleta hardcoded: `#0f172a`, `#1e293b`, `#e2e8f0`, etc.)
4. Responsive

**Archivo a crear:** `src/pages/404.astro`

### Tarea 3: robots.txt (MEDIA prioridad)

**Solución:** Crear `public/robots.txt`:

```
User-agent: *
Allow: /

Sitemap: https://gelchile.cl/sitemap-index.xml
```

**Archivo a crear:** `public/robots.txt`

### Tarea 4: Sitemap automático (MEDIA prioridad)

**Solución:**
1. Instalar: `npm install @astrojs/sitemap`
2. Agregar a `astro.config.mjs`:

```javascript
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://gelchile.cl',
  integrations: [preact(), sitemap()],
});
```

3. Verificar que `npm run build` genera `dist/sitemap-index.xml` y `dist/sitemap-0.xml`

**Archivos a modificar:** `astro.config.mjs`, `package.json` (automático con npm install)

### Tarea 5: Cleanup de archivos legacy (MEDIA prioridad)

**Problema:** El repo tiene 89 archivos legacy del sitio demo vanilla (HTML/CSS/JS) que ya fueron migrados a Astro. Estos archivos:
- Confunden a nuevos desarrolladores
- Aumentan el tamaño del repo innecesariamente
- Contienen datos demo de "ElectroMedición" (nombre anterior)

**Solución:** Eliminar TODO lo siguiente con `git rm -r`:

**Archivos raíz (9 archivos):**
```
index.html
productos.html
cotizacion.html
nosotros.html
PRESENTACION_CLIENTE.html
PRESUPUESTO_ELECTROMEDICION.html
BENEFICIOS_ROI.md
CHECKLIST_PROYECTO.md
PROMPT_FASE8.md
```

**Directorios completos (7 directorios):**
```
js/                  # 5 archivos: main.js, config.js, utils.js, cart-store.js, theme-store.js
css/                 # 2 archivos: styles.css, modules/README.md
data/                # 22 archivos: categories.json + 21 products/*.json (copias en src/)
types/               # 1 archivo: index.ts (copia en src/types/)
schemas/             # 1 archivo: product.schema.js (reemplazado por src/content.config.ts)
backup/              # 9 archivos: backup del 20260127
docs/                # 1 archivo: astro-components.md (ya integrado en código)
```

**Directorio de documentos del cliente (39 archivos):**
```
Productos/           # DOCX, PDF, XLSX, PPTX, imágenes WhatsApp, grabaciones
```

**⚠️ NO eliminar:**
- `CLAUDE.md` (raíz) — documentación activa del proyecto
- `PROMPT_FASE9.md` (raíz) — este prompt (eliminar después de ejecutar)
- `src/` — todo el proyecto Astro
- `public/` — assets del build
- `astro.config.mjs`, `package.json`, `tsconfig.json`, `.gitignore`
- `node_modules/`, `dist/`, `.astro/` (ya en .gitignore)

**Verificación:** Después de eliminar, ejecutar `npm run build` para confirmar que nada se rompió (el proyecto Astro no depende de ningún archivo legacy).

### Tarea 6: Audit de accesibilidad (BAJA prioridad)

Revisar rápidamente estos puntos en los componentes existentes:

1. **Imágenes:** Verificar que todas las `<img>` tienen `alt` descriptivo. En `ProductCard.astro` y `productos/[slug].astro` el alt debe ser el título del producto.
2. **Formulario:** Verificar que todos los `<input>` en `QuoteForm.tsx` tienen `<label>` asociado (ya usan labels, solo confirmar).
3. **Skip link:** Ya existe en `MainLayout.astro` (`<a href="#main-content" class="skip-link">`). Confirmar que funciona.
4. **Focus visible:** Verificar que los `nav-link` en Header tienen `:focus-visible` styles (ya existen).
5. **Lang:** Confirmar `<html lang="es">` en MainLayout.

Solo reportar problemas encontrados. No es necesario reescribir componentes enteros.

### Tarea 7: Build final y verificación (ALTA prioridad)

Ejecutar `npm run build` y verificar:

1. **0 errores** de compilación
2. **26+ páginas generadas:**
   - 4 páginas fijas: index, productos/index, nosotros, cotizacion
   - 21 páginas de producto: productos/[sku] para cada producto
   - 1 página 404
3. **Sitemap generado:** `dist/sitemap-index.xml` existe
4. **robots.txt copiado:** `dist/robots.txt` existe
5. **Sin warnings nuevos** (los existentes de Astro son aceptables)

### Tarea 8: Actualizar CLAUDE.md (BAJA prioridad)

Actualizar la sección "Estado de las Fases" en `CLAUDE.md` para marcar Fase 9 como completada. Agregar una sección "Fase 9 — Lo que se hizo" similar a las fases anteriores, listando:
- Web3Forms integrado (con fallback para placeholder key)
- Página 404 creada
- robots.txt y sitemap configurados
- 89 archivos legacy eliminados
- Accesibilidad verificada
- Build final exitoso con N páginas

También limpiar las referencias a archivos que ya no existen (js/, css/, data/, etc.) en la sección "Estructura del Proyecto".

**Archivo:** `CLAUDE.md`

## Reglas técnicas

1. **Preact, NO React:** En archivos `.tsx` usa `class` (no `className`), hooks de `preact/hooks`, `useStore` de `@nanostores/preact`
2. **SVG en .astro:** Usa kebab-case (`stroke-width`, `stroke-linecap`) — es HTML estándar
3. **SVG en .tsx:** Usa camelCase (`strokeWidth`, `strokeLinecap`) — es JSX/Preact
4. **CSS scoped en .astro:** Dark mode con `:global([data-theme="dark"])` dentro de `<style>`
5. **CSS Modules en .tsx:** Dark mode con `:global([data-theme="dark"])` dentro del module
6. **Dark mode palette (hardcoded, NUNCA usar CSS variables en dark overrides):**
   - `#0f172a` — page/section bg
   - `#1e293b` — card/surface bg
   - `#334155` — borders, hover states
   - `#475569` — input borders
   - `#94a3b8` — muted/description text
   - `#cbd5e1` — body text
   - `#e2e8f0` — heading/title text
   - `#ffffff` — white text
7. **SSR guards:** `typeof window !== 'undefined'` antes de acceder a `window`/`document`/`localStorage`
8. **Imágenes:** Ruta `/assets/img/products/...` (carpeta `public/`)
9. **NO crear archivos en `assets/img/`** (carpeta legacy eliminada). Solo usar `public/assets/img/`

## Archivos a crear/modificar/eliminar (resumen)

| Archivo | Acción | Tarea |
|---------|--------|-------|
| `src/components/islands/QuoteForm.tsx` | Modificar | Web3Forms real |
| `src/pages/404.astro` | Crear | Página 404 |
| `public/robots.txt` | Crear | robots.txt |
| `astro.config.mjs` | Modificar | +sitemap integration |
| `package.json` | Modificar | +@astrojs/sitemap (npm install) |
| `CLAUDE.md` | Modificar | Actualizar estado Fase 9 |
| 9 archivos raíz legacy | Eliminar (git rm) | Cleanup |
| 7 directorios legacy | Eliminar (git rm -r) | Cleanup |
| `Productos/` (39 archivos) | Eliminar (git rm -r) | Cleanup |

## Datos de configuración necesarios

```typescript
// src/data/site-config.ts (ya existe, NO modificar)
export const siteConfig = {
  name: 'Gel Chile',
  url: 'https://gelchile.cl',
  contact: {
    email: 'ventas@gelchile.cl',
    phones: ['+56 9 9949 6909', '+56 9 9825 0271', '+56 9 5098 7979'],
    office: 'Los Diamantes N°0360, Maipú, RM',
  },
  storage: {
    cartKey: 'gelchile_cart',
    themeKey: 'gelchile_theme',
  },
};
```

## Plan file

El plan maestro del proyecto está en `/root/.claude/plans/cozy-mapping-quiche.md`. Si no lo encuentras, no te preocupes — toda la información necesaria está en este prompt.

## Entrega

1. Crea tu branch desde `main` (nombre con prefijo `claude/`)
2. Haz commit(s) descriptivos para cada grupo de cambios
3. Push al remote
4. Verifica que `npm run build` pasa sin errores y genera 26+ páginas
5. Reporta el conteo final de páginas generadas y el bundle size
