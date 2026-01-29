# Contexto del Proyecto: Gel Chile

## Descripción General
Sitio web de catálogo para **Gel Chile**, empresa chilena especializada en **sistemas de puesta a tierra y protección eléctrica**. Permite a los clientes explorar productos, ver especificaciones técnicas y solicitar cotizaciones.

## Estado Actual
- **Fase:** Migración a Astro en curso — Fases 0, 1, 2 y 3 completadas, pendiente Fase 4
- **Stack actual:** HTML5, CSS3, JavaScript vanilla (sitio demo funcional)
- **Stack objetivo:** Astro + Preact + nanostores
- **Datos de productos:** 21 productos reales de Gel Chile (JSON) — reemplazan los 12 demo antiguos
- **Cliente aprobó presupuesto:** $370.000 CLP (reunión 3_2)

## Datos de la Empresa

| Dato | Valor |
|------|-------|
| **Empresa** | Gel Chile |
| **Rubro** | Sistemas de puesta a tierra y protección eléctrica |
| **Email ventas** | ventas@gelchile.cl |
| **Email contacto** | kvasquezb@gelchile.cl |
| **Teléfonos** | +56 9 9949 6909 / +56 9 9825 0271 / +56 9 5098 7979 |
| **Oficina** | Los Diamantes N°0360, Maipú, RM |
| **Bodega** | Camino Lo Ermita Parcela-21, Calera de Tango |
| **Dominio** | gelchile.cl (acceso nic.cl confirmado) |

## Estructura del Proyecto

```
Pagiweb2/
├── index.html              # Página de inicio (demo, pendiente migración)
├── productos.html          # Catálogo de productos (demo)
├── cotizacion.html         # Carrito y formulario de cotización (demo)
├── nosotros.html           # Información de la empresa (demo)
├── css/
│   ├── styles.css          # Sistema de diseño completo (~3800 líneas)
│   └── modules/
│       └── README.md       # Mapeo CSS → componentes Astro
├── js/
│   ├── main.js             # Funcionalidades principales (~1400 líneas)
│   ├── config.js           # Configuración centralizada
│   ├── utils.js            # Funciones utilitarias
│   ├── cart-store.js       # Store del carrito (API nanostores)
│   └── theme-store.js      # Store del tema (dark mode)
├── data/
│   ├── products/           # 21 archivos JSON (productos reales Gel Chile)
│   │   ├── ele-001.json a ele-008.json  # 8 electrodos electromagnéticos HE
│   │   ├── egr-001.json                 # 1 electrodo de grafito
│   │   ├── bqh-001.json, bqv-001.json   # 2 barras químicas (H y V)
│   │   ├── adi-001.json, adi-002.json   # 2 aditivos (Power Gem, Power Gel)
│   │   ├── par-001.json a par-003.json  # 3 pararrayos y protección
│   │   ├── cam-001.json                 # 1 camarilla PVC
│   │   ├── tab-001.json, tab-002.json   # 2 tableros eléctricos TIBOX
│   │   └── srv-001.json, srv-002.json   # 2 servicios
│   └── categories.json     # 7 categorías reales
├── assets/
│   └── img/
│       ├── gelchile-logo.png             # Logo Gel Chile (extraído de DOCX)
│       ├── gelchile-electrodo-grafito.png # Imagen producto (extraída de DOCX)
│       └── products/                      # 55 imágenes de productos extraídas
│           ├── electrode-he-*.png         # Fotos electrodos HE (producto + detalle)
│           ├── hunter-energy-*.png        # Branding, specs, certificaciones HE
│           ├── adi-*.png                  # Fotos aditivos
│           ├── par-*.png, mas-*.png       # Pararrayos, masilla
│           ├── chi-*.jpeg/gif             # Chispero
│           ├── cam-001.png, tab-*.png     # Camarilla, tableros
│           ├── ele-001.png               # Electrodo grafito
│           └── srv-malla-*.jpeg           # Fotos servicio malla de fleje
├── Productos/              # Documentos originales del cliente (DOCX/PDF/XLSX)
│   ├── ELECTRDOS ELECTROMAGNETICOS HUNTER ENERGY HE/
│   ├── BARRAS QUIMICAS HORIZONTALES Y VERTICALES/
│   ├── ADITIVO POWER GEM Y GE/
│   ├── PARARRAYO/
│   ├── Servicio Malla de fleje/
│   └── grabaciones/        # Transcripciones de reuniones con el cliente
├── docs/
│   └── astro-components.md # Guía de componentes e islas
├── types/
│   └── index.ts            # Interfaces TypeScript (pendiente actualización)
├── schemas/
│   └── product.schema.js   # Schema Zod (pendiente actualización categorías)
├── backup/
│   └── 20260127/           # Backup de archivos originales
├── src/                     # ★ PROYECTO ASTRO (Fase 1+)
│   ├── content.config.ts    # Content Collections + Zod schema (Fase 2)
│   ├── components/
│   │   ├── islands/         # Preact interactive islands (Fase 6)
│   │   │   ├── DarkModeToggle.module.css  # CSS Module (Fase 3)
│   │   │   ├── Toast.module.css           # CSS Module (Fase 3)
│   │   │   ├── ProductModal.module.css    # CSS Module (Fase 3)
│   │   │   ├── QuoteItems.module.css      # CSS Module (Fase 3)
│   │   │   ├── QuoteForm.module.css       # CSS Module (Fase 3)
│   │   │   └── ProductFilter.module.css   # CSS Module (Fase 3)
│   │   └── ui/              # Astro UI components (Fase 5)
│   ├── content/
│   │   └── products/        # 21 JSON validados por Zod schema
│   ├── data/
│   │   ├── categories.json  # 7 categorías
│   │   └── site-config.ts   # Configuración centralizada Gel Chile
│   ├── layouts/             # MainLayout.astro (Fase 5)
│   ├── pages/
│   │   ├── index.astro      # Verificación Content Collections (temporal)
│   │   └── productos/       # Catálogo y detalle (Fase 7)
│   ├── stores/
│   │   ├── cart.ts          # Store carrito (nanostores, Fase 4)
│   │   └── theme.ts         # Store tema (nanostores, Fase 4)
│   ├── styles/              # CSS global (Fase 3)
│   │   ├── global.css       # Variables + Reset + Utilidades + Botones
│   │   ├── dark-mode.css    # [data-theme="dark"] overrides
│   │   └── animations.css   # 8 keyframes + AOS + skeleton + preferences
│   └── types/
│       └── index.ts         # Interfaces TypeScript (CategorySlug, Product, etc.)
├── public/
│   └── assets/img/
│       ├── gelchile-logo.png
│       ├── gelchile-electrodo-grafito.png
│       └── products/        # 57 imágenes de productos (54 originales + 3 barras químicas)
├── astro.config.mjs         # Astro + Preact config
├── tsconfig.json            # TypeScript strict (Astro preset)
├── package.json             # gelchile-web (Astro + Preact + nanostores)
├── PRESUPUESTO_ELECTROMEDICION.html
├── PRESENTACION_CLIENTE.html
├── BENEFICIOS_ROI.md
└── CHECKLIST_PROYECTO.md
```

## Productos Reales (21 productos)

### Categorías y productos

| Categoría | Slug | Productos | SKUs |
|-----------|------|-----------|------|
| Electrodos Electromagnéticos | `electrodos-electromagneticos` | 8 electrodos Hunter Energy | ELE-001 a ELE-008 (HE-45, 70, 100, 200, 400, 700, 1500, 2500) |
| Electrodos de Grafito | `electrodos-grafito` | 1 electrodo grafito | EGR-001 (EG-GELCHILE, 250mm x 1000mm, 12kg) |
| Barras Químicas | `barras-quimicas` | 2 barras (horizontal/vertical) | BQH-001, BQV-001 (cobre ASTM C1100, 2" x 3000mm) |
| Aditivos | `aditivos` | 2 aditivos | ADI-001 (Power Gem 11,36kg), ADI-002 (Power Gel) |
| Pararrayos y Protección | `pararrayos` | 3 productos | PAR-001 (Franklin tridente), PAR-002 (masilla), PAR-003 (chispero) |
| Accesorios | `accesorios` | 3 productos | CAM-001 (camarilla PVC), TAB-001/002 (tableros TIBOX IP65) |
| Servicios | `servicios` | 2 servicios | SRV-001 (medición), SRV-002 (instalación malla de fleje) |

### Estructura JSON por producto
```json
{
  "sku": "ELE-001",
  "title": "Electrodo Electromagnético Hunter Energy HE-45",
  "category": "Electrodos Electromagnéticos",
  "categorySlug": "electrodos-electromagneticos",
  "description": "...",
  "features": ["Cobre electrolítico de alta conductividad", ...],
  "specs": { "Modelo": "HE-45k", "Capacidad": "45 Amperios", ... },
  "image": "/assets/img/products/electrode-he-45-product.png",
  "inStock": true,
  "badge": null
}
```

**SKU pattern:** `[A-Z]{2,3}-\d{3}` (ELE-, EGR-, BQH-, BQV-, ADI-, PAR-, CAM-, TAB-, SRV-)

**Campos nuevos vs schema original:** `image` (ruta a foto extraída del DOCX). Campo `datasheet` planificado pero no implementado aún.

## Funcionalidades Implementadas (sitio demo actual)

### Sistema de Productos
- Base de datos hardcodeada en `PRODUCTS_DB` (js/main.js:18-310) — **DESACTUALIZADA, usa datos demo**
- Los datos reales están en `data/products/*.json` (21 archivos)
- Filtros por categoría
- Modal de detalle con tabs (especificaciones/características)

### Sistema de Cotización
- Carrito persistente en localStorage
- Selector de cantidades
- Formulario con validación
- Renderizado en `cotizacion.html` usando `#quote-items`

### UI/UX
- Modo oscuro con toggle (esquina inferior izquierda)
- Diseño responsive (mobile-first)
- Animaciones de scroll (data-aos)
- Toasts de notificación
- Loader de página

## Archivos Clave

### CSS (css/styles.css)
- Variables CSS (design tokens): líneas 8-112
- Componentes de botón: líneas 263-369
- Cards de producto: líneas 858-994
- Modal de producto: líneas 2424-2700
- Modo oscuro: líneas 2325-2420
- Toggle de tema: líneas 2422-2500

### JavaScript (js/main.js)
- `PRODUCTS_DB`: Base de datos de productos (líneas 18-310) — DEMO, será reemplazada
- `DarkMode`: Control de tema (líneas 351-422)
- `ProductModal`: Modal de detalle (líneas 537-742)
- `Cart`: Sistema de cotización (líneas 747-991)
- `ProductFilter`: Filtros de categoría (líneas 997-1063)
- `FormValidator`: Validación de formulario (líneas 1069-1183)

## Selectores Importantes

```javascript
// Cotización
'#quote-items'      // Contenedor de items del carrito
'#empty-cart'       // Estado vacío
'#quote-form'       // Formulario de cotización
'.quote-form'       // Clase del formulario
'.submit-quote-btn' // Botón de envío

// Productos
'.product-card'     // Tarjeta de producto
'.product-sku'      // SKU del producto
'.btn-add-quote'    // Botón agregar a cotización
'.filter-btn'       // Botones de filtro

// UI
'.cart-count'       // Contador del carrito
'.theme-toggle'     // Botón modo oscuro
'.toast-container'  // Contenedor de notificaciones
```

## Configuración Global

```javascript
// ACTUAL (demo) — será reemplazado en migración
const CONFIG = {
  storageKey: 'electromedicion_cart',    // → gelchile_cart
  themeKey: 'electromedicion_theme',     // → gelchile_theme
  animationThreshold: 0.1,
  toastDuration: 3000,
  counterDuration: 2000
};
```

## Presupuesto del Proyecto

| Concepto | Valor |
|----------|-------|
| Desarrollo base | $370.000 CLP |
| Dominio .cl (año 1) | Incluido |
| Hosting | $0 (Cloudflare Pages gratis) |
| SSL | $0 (automático Cloudflare) |
| Pago | 50% inicio + 50% al entregar |

## Plan de Migración a Astro

Plan completo en: `/root/.claude/plans/cheerful-twirling-spring.md`

### Estado de las Fases

| Fase | Nombre | Estado |
|------|--------|--------|
| **Fase 0** | Extracción de datos del cliente | ✅ COMPLETADA |
| **Fase 1** | Inicialización proyecto Astro | ✅ COMPLETADA |
| **Fase 2** | Content Collections y Schema | ✅ COMPLETADA |
| **Fase 3** | CSS (global + scoped) | ✅ COMPLETADA |
| Fase 4 | Stores (nanostores) | Pendiente |
| Fase 5 | Componentes estáticos (Astro) | Pendiente |
| Fase 6 | Islands interactivos (Preact) | Pendiente |
| Fase 7 | Páginas | Pendiente |
| Fase 8 | Branding Gel Chile | Pendiente |
| Fase 9 | Verificación y deploy | Pendiente |
| Fase 10 | Extras opcionales (post-lanzamiento) | Futuro |

### Fase 0 — Lo que se hizo

1. Lectura y análisis de todos los documentos DOCX/PDF del cliente en `Productos/`
2. Extracción de texto técnico (specs, features, dimensiones, normativas)
3. Extracción de 55 imágenes de producto desde los DOCX a `assets/img/products/`
4. Creación de 21 archivos JSON con datos reales en `data/products/`
5. Actualización de `data/categories.json` con 7 categorías reales
6. Eliminación de los 12 archivos JSON demo antiguos (multímetros, pinzas, etc.)
7. Extracción de logo Gel Chile a `assets/img/gelchile-logo.png`
8. Descubrimiento de datos de contacto reales en documentos

### Fase 1 — Lo que se hizo

1. Instalación de Astro v5.17.1 (`astro` como devDependency)
2. Instalación de `@astrojs/preact` + `preact` para islands architecture
3. Instalación de `nanostores` + `@nanostores/preact` para state management
4. Configuración de `astro.config.mjs` con integración Preact y site URL
5. Configuración de `tsconfig.json` con preset strict de Astro
6. Creación de estructura completa `src/` (components, islands, ui, content, data, layouts, pages, stores, styles, types)
7. Creación de `public/assets/img/products/` con 54 imágenes de producto + logo
8. Copia de 21 JSON de productos a `src/content/products/`
9. Copia de `categories.json` a `src/data/`
10. Creación de `src/data/site-config.ts` (configuración centralizada Gel Chile)
11. Scaffolding de stores (`cart.ts`, `theme.ts`) y tipos (`types/index.ts`)
12. Creación de `.gitignore` para Astro (dist/, .astro/, node_modules/)
13. Página placeholder `src/pages/index.astro`
14. Build verificado exitosamente

### Fase 2 — Lo que se hizo

1. Extracción de imágenes barras químicas del PDF (PyMuPDF) → bqh-001.png, bqv-001.png, bq-diagram.png
2. Corrección de image paths en bqh-001.json y bqv-001.json (apuntaban a par-001.png)
3. Creación de `src/content.config.ts` con Zod schema + glob loader
4. Definición de enums estrictos: 7 categorySlugs, 7 categoryNames, 3 badgeValues
5. Validación de campos: sku regex, title, description, features[], specs record, image nullable, badge nullable
6. Actualización de `src/types/index.ts` con CategorySlug, CategoryName, BadgeValue union types
7. Fix de `image: string` → `string | null` (SRV-001 tiene image null)
8. Página de verificación `src/pages/index.astro` con getCollection() mostrando 21 productos en 7 categorías
9. Build exitoso: 0 errores Zod, 21 productos validados, sin warning de auto-generating collections

### Fase 3 — Lo que se hizo

1. Creación de `src/styles/global.css` — Variables CSS (:root), reset, utilidades, tipografía, botones (líneas 8-369 de styles.css)
2. Creación de `src/styles/dark-mode.css` — Overrides [data-theme="dark"] para todos los componentes (líneas 2329-2507)
3. Creación de `src/styles/animations.css` — 8 @keyframes recolectados de todo el archivo + AOS + skeleton + prefers-reduced-motion + print
4. Creación de 6 CSS Modules para islands Preact en `src/components/islands/`:
   - `ProductModal.module.css` (líneas 2601-3438) — Modal completo con tabs, specs, features, responsive, dark mode
   - `DarkModeToggle.module.css` (líneas 2510-2598) — Toggle fijo con tooltip y dark mode
   - `Toast.module.css` (líneas 1983-2047) — Notificaciones toast con variantes
   - `QuoteItems.module.css` (líneas 3440-3738) — Lista items cotización con qty controls
   - `QuoteForm.module.css` (líneas 1393-1704) — Formulario cotización completo
   - `ProductFilter.module.css` — Filtros categoría + grid productos + responsive
5. CSS Modules usan `:global([data-theme="dark"])` para dark mode scoped
6. Importación de 3 CSS globales en `src/pages/index.astro`
7. Build verificado: CSS bundled 12KB, 0 errores
8. CSS scoped de componentes Astro documentado (se integrará en Fase 5)

### Estructura Astro Propuesta
```
src/
├── components/
│   ├── Header.astro, Footer.astro, HeroSection.astro
│   ├── ProductCard.astro, CategoryCard.astro, FeatureCard.astro
│   ├── islands/   # Preact (~3KB vs React ~40KB)
│   │   ├── CartCount.tsx, AddToQuoteBtn.tsx
│   │   ├── ProductFilter.tsx (búsqueda + filtro categoría)
│   │   ├── ProductModal.tsx, QuoteItems.tsx, QuoteForm.tsx
│   │   ├── DarkModeToggle.tsx, MobileMenu.tsx, Toast.tsx
│   └── ui/  Button.astro, Badge.astro, Breadcrumb.astro
├── content/products/*.json    # Content Collections (desde data/products/)
├── data/categories.json, site-config.ts
├── layouts/MainLayout.astro
├── pages/
│   ├── index.astro, nosotros.astro, cotizacion.astro
│   └── productos/index.astro, [slug].astro  # Página individual por producto
├── stores/cart.ts, theme.ts   # nanostores
├── styles/global.css, animations.css, dark-mode.css
└── types/index.ts
```

## Servicios de Terceros

| Servicio | Uso | Plan | Estado |
|----------|-----|------|--------|
| Cloudflare Pages | Hosting + CDN + SSL | Gratis | Pendiente crear cuenta |
| Web3Forms | Formulario cotización | Gratis (250/mes) | Pendiente API key |
| GitHub | Repositorio | Gratis | ✅ AresOnee/Pagiweb2 |
| nic.cl | Dominio gelchile.cl | Pagado | ✅ Acceso confirmado |

### NO incluido de momento (postergado por el cliente):
- Google Analytics, botón flotante WhatsApp, Google Maps
- Galería de imágenes, FAQ, Blog, Testimonios (extras con costo adicional)

## Cómo Agregar/Quitar Productos

**Agregar un producto (proyecto Astro):**
1. Crear archivo JSON en `src/content/products/` con el SKU correspondiente (ej: `cab-001.json`)
2. Seguir el schema Zod en `src/content.config.ts` (campos requeridos: sku, title, category, categorySlug, description, features, specs, image, inStock, badge)
3. Si es categoría nueva: agregar a los arrays `categorySlugs` y `categoryNames` en `src/content.config.ts`
4. Agregar imagen a `public/assets/img/products/`
5. Actualizar `count` en `src/data/categories.json`
6. Ejecutar `npm run build` para validar el JSON contra el schema

**Quitar un producto:**
1. Eliminar el archivo JSON de `src/content/products/`
2. Actualizar `count` en `src/data/categories.json`

## Notas de Desarrollo

1. **Bug corregido:** Los productos no se mostraban en cotización porque el selector era `.quote-items-list` pero el HTML tenía `#quote-items`
2. **Modo oscuro:** Detecta preferencia del sistema y guarda elección en localStorage
3. **Modal de producto:** Se abre al hacer clic en la tarjeta, pero NO si se hace clic en el botón de cotizar
4. **Formulario:** Actualmente simula envío. Para producción, configurar Web3Forms con API key → ventas@gelchile.cl
5. **Imágenes extraídas:** HE-1500 y HE-2500 comparten la misma foto de producto. Algunos DOCX son image-only (camarilla, tableros) sin texto extraíble
6. **HE-150:** Mencionado en reunión 3_4 pero no existe DOCX con ficha técnica — solo aparece en tabla de dimensiones XLSX. No se creó JSON
7. **Productos faltantes (~25-30):** El cliente mencionó ~50 productos. Faltan cables, cargas exotérmicas, moldes de grafito, conectores. Se agregarán cuando el cliente envíe los datos

## Documentación Adicional

- **Plan de migración completo:** `/root/.claude/plans/cheerful-twirling-spring.md`
- **Content Collections schema:** `src/content.config.ts` (Zod, Fase 2)
- **Tipos TypeScript (Astro):** `src/types/index.ts` (CategorySlug, Product, Category)
- **Componentes Astro:** `docs/astro-components.md`
- **Mapeo CSS:** `css/modules/README.md`
- **Schema legacy (demo):** `schemas/product.schema.js` (categorías demo, no usado por Astro)
- **Tipos legacy (demo):** `types/index.ts` (categorías demo, no usado por Astro)

## Comandos Útiles

```bash
# Ver el sitio demo actual localmente (HTML/CSS/JS vanilla)
npx serve .

# Proyecto Astro (ya inicializado en Fase 1)
npm run dev       # Servidor de desarrollo Astro
npm run build     # Build estático a dist/
npm run preview   # Preview del build
npx astro sync    # Regenerar tipos de Content Collections
```
