# Contexto del Proyecto: GelChile

## Descripcion General
Sitio web de catalogo para **GelChile**, empresa chilena con **mas de 20 anos de experiencia** especializada en **sistemas de puesta a tierra y proteccion electrica**. Permite a los clientes explorar productos, ver especificaciones tecnicas y solicitar cotizaciones.

## Estado Actual
- **Sitio Astro funcional** — Fases 0-8 completadas, build exitoso (71 paginas)
- **Pendiente:** Deploy a Cloudflare Pages (Fase 9) + configurar API keys
- **Branch de desarrollo:** `claude/gelchile-catalog-website-PB6wG`
- **Build:** `npm install && npm run build` — 0 errores, 64 productos validados por Zod
- **Lighthouse Performance:** ~91 en dev server (limitado por falta de compresion gzip en dev)

## Stack Tecnico

| Tecnologia | Uso | Version |
|------------|-----|---------|
| Astro | Framework SSG | 5.17.1 |
| Preact | Islands interactivos | 10.28.2 |
| nanostores | State management | 1.1.0 |
| @astrojs/sitemap | Sitemap XML | 3.7.0 |
| Zod | Validacion Content Collections | (incluido en Astro) |
| CSS Modules | Estilos scoped (islands) | nativo |
| Web3Forms | Formulario cotizacion | pendiente API key |
| Cloudflare Turnstile | Anti-spam | pendiente site key |

## Datos de la Empresa

| Dato | Valor |
|------|-------|
| **Empresa** | GelChile (escrito junto, sin espacio) |
| **Representante Legal** | Claudio Mitchel Ramirez Sepulveda |
| **Experiencia** | +20 anos en el rubro electrico chileno |
| **Rubro** | Sistemas de puesta a tierra y proteccion electrica |
| **Email ventas** | ventas@gelchile.cl |
| **Email contacto** | kvasquezb@gelchile.cl |
| **Telefonos** | +56 9 9949 6909 / +56 9 9825 0271 / +56 9 5098 7979 |
| **Oficina** | Av. Uno #3016, Cerrillos, Santiago |
| **Bodega** | Camino Lo Ermita Parcela-21, Calera de Tango |
| **Dominio** | gelchile.cl (acceso nic.cl confirmado) |

**IMPORTANTE:** El nombre de la empresa se escribe **"GelChile"** (una sola palabra, sin espacio).

## Arquitectura del Proyecto

```
src/
├── components/
│   ├── Header.astro              # Navegacion principal con MobileMenu island
│   ├── Footer.astro              # Pie de pagina con certificaciones y contacto
│   ├── HeroSection.astro         # Banner principal pagina inicio
│   ├── CategoryCard.astro        # Tarjeta de categoria con icono
│   ├── ProductCard.astro         # Tarjeta de producto (con dark mode + perf optimizado)
│   ├── Breadcrumb.astro          # Migas de pan
│   ├── FAQ.astro                 # Acordeon de preguntas frecuentes
│   ├── ObfuscatedEmail.astro     # Email ofuscado anti-spam
│   ├── InstallPrompt.astro       # Banner PWA de instalacion
│   └── islands/                  # 12 Preact islands (client:load/client:visible)
│       ├── ProductFilter.tsx     # Busqueda + filtro + ordenamiento + Cmd+K
│       ├── ProductModal.tsx      # Modal de detalle con lazy-loaded ImageGallery
│       ├── ImageGallery.tsx      # Galeria de imagenes con lightbox
│       ├── VariantSelector.tsx   # Selector de variantes de producto
│       ├── QuoteItems.tsx        # Lista de items en cotizacion
│       ├── QuoteForm.tsx         # Formulario cotizacion (Web3Forms + Turnstile)
│       ├── CartCount.tsx         # Contador del carrito en header
│       ├── AddToQuoteBtn.tsx     # Boton agregar a cotizacion
│       ├── DarkModeToggle.tsx    # Toggle modo oscuro
│       ├── MobileMenu.tsx        # Menu hamburguesa movil
│       ├── Toast.tsx             # Notificaciones toast
│       ├── TurnstileWidget.tsx   # Widget Cloudflare Turnstile
│       └── *.module.css          # 8 CSS Modules con dark mode
├── content/products/             # 64 archivos JSON validados por Zod
├── data/
│   ├── categories.json           # 8 categorias con slugs e iconos
│   └── site-config.ts            # Config centralizada (contacto, API keys, storage keys)
├── layouts/MainLayout.astro      # Layout principal (SEO, OG, JSON-LD, PWA, AOS)
├── pages/
│   ├── index.astro               # Pagina principal con hero y categorias
│   ├── nosotros.astro            # Sobre la empresa + fundador
│   ├── cotizacion.astro          # Carrito y formulario
│   ├── cotizacion-enviada.astro  # Pagina de exito post-envio
│   ├── faq.astro                 # 10 preguntas frecuentes
│   └── productos/
│       ├── index.astro           # Catalogo con filtros
│       └── [slug].astro          # Detalle de producto (64 paginas generadas)
├── stores/                       # nanostores con persistencia localStorage
│   ├── cart.ts                   # $cart atom, $cartCount computed, addItem/removeItem/clearCart
│   ├── theme.ts                  # $theme atom, toggleTheme, initTheme
│   ├── toast.ts                  # showToast (success/error/info)
│   └── ui.ts                     # $selectedProduct, $mobileMenuOpen
├── styles/
│   ├── global.css                # Variables CSS (:root), reset, tipografia, botones
│   ├── dark-mode.css             # [data-theme="dark"] overrides globales
│   └── animations.css            # @keyframes, AOS custom, skeleton, print
└── types/index.ts                # CategorySlug, CategoryName, Product, CartItem, etc.
```

## Productos (64 en 8 categorias)

| Categoria | Slug | Qty | SKUs |
|-----------|------|-----|------|
| Electrodos Electromagneticos | `electrodos-electromagneticos` | 13 | ELE-001–008 (HE-45 a HE-2500), EES-001–005 |
| Electrodos de Grafito | `electrodos-grafito` | 1 | EGR-001 |
| Barras Quimicas | `barras-quimicas` | 2 | BQH-001, BQV-001 |
| Aditivos | `aditivos` | 2 | ADI-001, ADI-002 |
| Pararrayos y Proteccion | `pararrayos` | 1 | PAR-001 |
| Soldadura Exotermica | `soldadura-exotermica` | 34 | CEX-001–009, PAR-002–004, HRE-001–002, MOL-001–020 |
| Accesorios | `accesorios` | 9 | CAM-001, TAB-001/002, BTT-001–003, CPP-001, PPB-001, TDC-001 |
| Servicios | `servicios` | 2 | SRV-001, SRV-002 |

### Estructura JSON por producto
```json
{
  "sku": "ELE-001",
  "title": "Electrodo Electromagnetico Hunter Energy HE-45",
  "category": "Electrodos Electromagneticos",
  "categorySlug": "electrodos-electromagneticos",
  "description": "...",
  "features": ["Cobre electrolitico de alta conductividad", "..."],
  "specs": { "Modelo": "HE-45k", "Capacidad": "45 Amperios" },
  "image": "/assets/img/products/electrode-he-45-product.png",
  "images": ["/assets/img/products/electrode-he-45-detail.png"],
  "inStock": true,
  "badge": null,
  "variants": []
}
```

**SKU pattern:** `[A-Z]{2,3}-\d{3}`
**Campos opcionales:** `images` (galeria), `variants` (selector de variantes), `badge` ("Nuevo"/"Popular"/"Promoción")

## Archivos Clave

| Archivo | Proposito |
|---------|-----------|
| `src/data/site-config.ts` | Config centralizada (API keys, contacto, storage keys) |
| `src/content.config.ts` | Zod schema + glob loader para Content Collections |
| `src/stores/cart.ts` | Carrito con persistencia localStorage |
| `src/layouts/MainLayout.astro` | Layout principal (SEO, OG tags, JSON-LD, PWA, AOS) |
| `src/components/islands/QuoteForm.tsx` | Formulario con Web3Forms + Turnstile |
| `src/components/islands/ProductFilter.tsx` | Filtros, busqueda y grid de productos |
| `src/components/islands/ProductModal.tsx` | Modal de detalle con lazy-loaded ImageGallery |

## Pendiente para Produccion (Fase 9)

1. **API key Web3Forms** → `src/data/site-config.ts` campo `web3forms.accessKey` (reemplazar `YOUR_WEB3FORMS_ACCESS_KEY`)
2. **Turnstile siteKey** → `src/data/site-config.ts` campo `turnstile.siteKey` (reemplazar `YOUR_TURNSTILE_SITE_KEY`)
3. **Deploy a Cloudflare Pages** — Conectar repo GitHub, build command: `npm run build`, output: `dist/`
4. **Configurar dominio** gelchile.cl en nic.cl apuntando a Cloudflare

## Como Agregar/Quitar Productos

**Agregar:**
1. Crear JSON en `src/content/products/{sku}.json` siguiendo el schema Zod
2. Agregar imagen a `public/assets/img/products/` (max 800px, <200KB)
3. Actualizar `count` en `src/data/categories.json`
4. Si es categoria nueva: agregar slug/name a arrays en `src/content.config.ts` y `src/types/index.ts`
5. `npm run build` para validar

**Quitar:**
1. Eliminar JSON de `src/content/products/`
2. Actualizar `count` en `src/data/categories.json`

## Notas Tecnicas

- **Dark mode:** `:global([data-theme="dark"])` en CSS Modules. Theme persiste en `localStorage` key `gelchile_theme`
- **Carrito:** Persiste en `localStorage` key `gelchile_cart`. Max 99 unidades por item
- **Performance:** ProductCard y ProductFilter usan `will-change: transform`, `contain: layout style paint`, transitions especificas (no `transition: all`)
- **Lazy-load:** ImageGallery se carga via `import()` dinamico en ProductModal (no en bundle inicial). Cache a nivel de modulo evita re-imports
- **AOS:** Implementacion custom sin libreria. `translate3d()` para GPU. 0.4s transitions
- **Imagenes:** Thumbnails max 300px, calidad 80 webp. Galeria/detail a 800px max. 215 archivos en `public/assets/img/products/`
- **Img sizing:** ProductCard y ProductFilter incluyen atributo `sizes` responsive para evitar descargas innecesarias
- **SEO:** JSON-LD LocalBusiness, Open Graph, Twitter Cards, sitemap.xml auto-generado
- **PWA:** manifest.json, service worker registration, install prompt
- **Formulario:** Web3Forms endpoint + Cloudflare Turnstile anti-spam. Envia a ventas@gelchile.cl

## Servicios de Terceros

| Servicio | Uso | Plan | Estado |
|----------|-----|------|--------|
| Cloudflare Pages | Hosting + CDN + SSL | Gratis | Pendiente deploy |
| Web3Forms | Formulario cotizacion | Gratis (250/mes) | Pendiente API key |
| Cloudflare Turnstile | Anti-spam formulario | Gratis | Pendiente site key |
| GitHub | Repositorio | Gratis | ✅ AresOnee/Pagiweb2 |
| nic.cl | Dominio gelchile.cl | Pagado | ✅ Acceso confirmado |

## Archivos Legacy (ignorar)

Los archivos en la raiz (`index.html`, `productos.html`, `cotizacion.html`, `nosotros.html`, `css/`, `js/`, `data/`) son del **demo HTML/JS vanilla original** y estan **desactualizados**. El proyecto real es el que esta en `src/` (Astro). Estos archivos legacy se pueden eliminar despues del deploy exitoso.

## Comandos

```bash
npm run dev       # Servidor de desarrollo (localhost:4321)
npm run build     # Build estatico a dist/ (71 paginas)
npm run preview   # Preview del build
npx astro sync    # Regenerar tipos de Content Collections
```
