# CLAUDE.md - Instrucciones del Proyecto

## Resumen del Proyecto
**Fibrarce** - Sitio web para empresa de productos de fibra de vidrio (estanques, piscinas, fosas septicas) ubicada en Chile.
Sitio publicado como SPA estatica sin backend. Todo el contenido se renderiza del lado del cliente.

## Stack Tecnologico
- **HTML5 + ES Modules** - Arquitectura modular con JavaScript vanilla
- **Tailwind CSS v3** via CDN con configuracion personalizada (inline en `index.html`)
- **JavaScript Vanilla** - Sin frameworks, sin bundler, sin npm. Usa ES Modules nativos del navegador
- **Google Fonts** - Familia tipografica Inter (pesos 300-800)
- **Material Symbols Outlined** - Libreria de iconos de Google

## Dependencias Externas (CDN)
| Recurso | Fuente | Uso |
|---------|--------|-----|
| Tailwind CSS | `cdn.tailwindcss.com` | Framework CSS utilitario |
| Google Fonts (Inter) | `fonts.googleapis.com` | Tipografia |
| Material Symbols | `fonts.googleapis.com` | Iconos |

No hay `package.json`, `node_modules`, ni proceso de build. Todo se carga directamente desde CDN.

## Arquitectura

### Estructura de Archivos
```
/home/user/pagweb/
├── index.html                    # HTML principal - header, footer, Tailwind config, imports
├── index.backup.html             # Backup del archivo original (antes de modularizar)
├── index (6).html                # Version legacy anterior
├── css/
│   └── styles.css                # Estilos CSS personalizados (animaciones, validacion, tooltips)
├── js/
│   ├── main.js                   # Punto de entrada - render(), init(), subscribe
│   ├── data/
│   │   └── products.js           # Array de 12 productos con specs completas
│   ├── state/
│   │   ├── store.js              # Estado global centralizado + localStorage persistence
│   │   └── actions.js            # Acciones del carrito, filtros, navegacion de galeria
│   ├── utils/
│   │   ├── dom.js                # showToast, showConfirm, validateField, updateCartBadge
│   │   ├── theme.js              # toggleTheme, applyTheme (dark/light mode)
│   │   └── helpers.js            # sortProducts, getFilteredProducts, specTooltips
│   ├── router/
│   │   └── router.js             # showView, updateActiveNav, scrollToSection
│   └── components/
│       ├── ProductCard.js         # Tarjeta reutilizable (retorna HTML string)
│       └── pages/
│           ├── HomePage.js        # Hero, servicios, productos destacados, FAQ, contacto
│           ├── CatalogPage.js     # Catalogo con busqueda, filtros, ordenamiento
│           ├── ProductPage.js     # Detalle de producto con galeria y tabs
│           └── QuotePage.js       # Carrito de cotizacion + formulario de contacto
├── CLAUDE.md                     # Este archivo
├── MERGE_SKILL.md                # Documento guia de fusion entre sesiones
└── presupuesto-desarrollo-web-v3.docx  # Documento de presupuesto
```

### Patron SPA (Single Page Application)
El sitio usa un patron SPA con una funcion `render()` en `main.js` que redibuja `#main-content` segun `state.currentView`:

| Vista | Funcion | Descripcion |
|-------|---------|-------------|
| `home` | `renderHome()` | Hero, servicios, productos destacados, FAQ, contacto |
| `catalogo` | `renderCatalogo()` | Catalogo con busqueda, filtros y ordenamiento |
| `producto` | `renderProducto()` | Detalle con galeria, tabs (specs/descripcion/envio) |
| `cotizacion` | `renderCotizacion()` | Carrito + formulario de solicitud de cotizacion |

### Flujo de Renderizado
1. `main.js` importa todos los modulos al cargar
2. `init()` se ejecuta en `DOMContentLoaded`
3. `init()` aplica tema, renderiza, actualiza badge/nav, suscribe `render()` a cambios de estado
4. Cualquier cambio de estado via `notify()` → re-ejecuta `render()` → re-crea todo `#main-content`

### Estado Centralizado (store.js)
```javascript
export const state = {
    // Carrito - persiste en localStorage ('fibrarce_cart')
    cart: [],

    // Navegacion
    currentView: 'home',
    currentProductId: null,

    // Filtros y busqueda
    currentCategory: 'todos',
    searchQuery: '',
    currentSort: 'default',

    // Estado de UI (producto)
    selectedImageIndex: 0,
    activeTab: 'specs',
    lastRemovedItem: null,

    // Productos vistos - persiste en localStorage ('fibrarce_recent')
    recentlyViewed: [],

    // Tema - persiste en localStorage ('fibrarce_theme')
    isDarkMode: true
};
```

**Claves de localStorage:**
| Clave | Contenido | Formato |
|-------|-----------|---------|
| `fibrarce_cart` | Productos en el carrito | JSON array |
| `fibrarce_recent` | IDs de productos vistos (max 4) | JSON array |
| `fibrarce_theme` | Preferencia de tema | `'dark'` o `'light'` |

### Modulos y Funciones Exportadas

#### `js/main.js` - Punto de Entrada
| Funcion | Global | Descripcion |
|---------|--------|-------------|
| `render()` | `window.render` | Renderiza vista actual en `#main-content` |
| `init()` | No | Inicializa app: tema, render, badge, nav, subscriptions |

#### `js/state/store.js` - Estado
| Export | Descripcion |
|--------|-------------|
| `state` | Objeto de estado global |
| `subscribe(callback)` | Registra listener. Retorna funcion de unsuscribe |
| `notify()` | Ejecuta todos los subscribers |
| `setState(updates)` | Object.assign + notify |
| `saveCart()` | Persiste `state.cart` en localStorage |
| `saveRecentlyViewed()` | Persiste `state.recentlyViewed` en localStorage |
| `saveTheme()` | Persiste tema en localStorage |

#### `js/state/actions.js` - Acciones
| Funcion | Global | Descripcion |
|---------|--------|-------------|
| `addToCart(productId)` | Si | Agrega producto. Toast con opcion deshacer |
| `removeFromCart(productId, skipConfirm)` | Si | Elimina con confirmacion modal. Toast con undo |
| `updateQuantity(productId, delta)` | Si | Cambia cantidad (+1/-1, minimo 1) |
| `clearCart()` | Si | Vacia carrito completo |
| `setCategory(category)` | Si | Filtra por: `todos`, `estanques`, `piscinas`, `fosas` |
| `setSearch(query)` | Si | Busqueda. Restaura foco con `requestAnimationFrame` |
| `setSort(sort)` | Si | Ordena: `default`, `name-asc`, `name-desc`, `available` |
| `addToRecentlyViewed(productId)` | No | Guarda en historial (max 4 items) |
| `setActiveTab(tab)` | Si | Cambia tab: `specs`, `description`, `shipping` |
| `selectImage(index)` | Si | Cambia imagen en galeria de producto |

#### `js/utils/dom.js` - Utilidades DOM
| Funcion | Global | Descripcion |
|---------|--------|-------------|
| `showToast(message, undoCallback)` | Si | Notificacion 4s con boton deshacer opcional |
| `showConfirm(message, onConfirm)` | Si | Dialog modal con Cancelar/Eliminar |
| `validateField(input)` | Si | Valida email/tel/required. Retorna boolean |
| `updateCartBadge()` | No | Actualiza contador en `#cart-badge` |

#### `js/utils/theme.js` - Tema
| Funcion | Global | Descripcion |
|---------|--------|-------------|
| `toggleTheme()` | Si | Alterna dark/light, guarda en localStorage |
| `applyTheme()` | No | Aplica estado actual al DOM (`dark` class en `<html>`) |

#### `js/utils/helpers.js` - Auxiliares
| Export | Descripcion |
|--------|-------------|
| `sortProducts(products)` | Ordena array por nombre o disponibilidad |
| `getFilteredProducts(products)` | Aplica categoria + busqueda + sort en cadena |
| `specTooltips` | Objeto con textos de tooltip para specs de productos |

#### `js/router/router.js` - Navegacion
| Funcion | Global | Descripcion |
|---------|--------|-------------|
| `showView(view, productId)` | Si | Navega a vista, resetea UI, scroll top |
| `updateActiveNav()` | No | Actualiza clase `nav-active` en links |
| `scrollToSection(sectionId)` | Si | Navega a home y hace scroll suave a seccion |

#### `js/components/ProductCard.js` - Componente
| Funcion | Descripcion |
|---------|-------------|
| `renderProductCard(product)` | Retorna HTML string de tarjeta de producto |

#### `js/components/pages/*.js` - Paginas
| Funcion | Descripcion |
|---------|-------------|
| `renderHome()` | Pagina principal completa (7 secciones) |
| `renderCatalogo()` | Catalogo con filtros, busqueda, productos vistos |
| `renderProducto()` | Detalle con galeria, tabs, breadcrumb |
| `renderCotizacion()` | Carrito + formulario. `handleQuoteSubmit()` (global) |

## Problemas Conocidos y Soluciones

### Input de Busqueda Pierde Foco
**Problema**: El input pierde el foco despues de cada tecla porque `render()` recrea el DOM completo.
**Solucion**: `setSearch()` en `actions.js` restaura el foco con `requestAnimationFrame()` despues del render, y posiciona el cursor al final con `setSelectionRange()`.

### Funciones Globales para onclick
**Problema**: ES Modules no exponen funciones globalmente, pero los onclick en HTML necesitan acceso global.
**Solucion**: Cada modulo expone sus funciones con `window.functionName = functionName` al final del archivo.

### Dependencias Circulares
**Problema**: `actions.js` importa de `dom.js`, y componentes importan de ambos.
**Solucion**: `removeFromCart()` usa `import()` dinamico para `showConfirm` evitando la dependencia circular.

### Re-render Completo del DOM
**Limitacion conocida**: Cada cambio de estado re-renderiza todo `#main-content` via `innerHTML`. No hay DOM diffing.
**Impacto**: Funcional para el tamano actual (12 productos), pero no escalaria a cientos de productos.

## Guias de Codigo

### Contenido en Espanol
Todo el texto visible al usuario esta en espanol (Chile). Los comentarios del codigo estan en ingles. Mantener esta consistencia.

### Patron de Componentes
Todos los componentes son **funciones puras** que retornan strings HTML via template literals:
```javascript
export function renderComponente() {
    return `<div class="...">contenido</div>`;
}
```
No se usa `document.createElement()` en componentes. Solo en utilidades DOM (`showToast`, `showConfirm`).

### Exposicion Global
Toda funcion que se usa en atributos `onclick` del HTML debe exponerse globalmente:
```javascript
window.miFuncion = miFuncion;
```
Esto se hace al final de cada modulo que define funciones usadas en templates HTML.

### Clases CSS y Tailwind
- Usar clases utilitarias de Tailwind exclusivamente
- Colores personalizados definidos inline en `index.html` dentro de `tailwind.config`:
  - `primary` (#0d6efd) - Botones y acentos
  - `primary-dark` (#0b5ed7) - Hover de botones
  - `surface` (#1a2332) - Fondo de tarjetas (oscuro)
  - `surface-light` (#243447) - Superficie elevada
  - `bg-dark` (#0f172a) - Fondo principal oscuro
  - `bg-light` (#f8fafc) - Fondo modo claro
  - `surface-white` (#ffffff) - Superficies modo claro
- Modo oscuro usa clase `dark` en `<html>` y prefijo `dark:` en Tailwind
- Estilos custom en `css/styles.css`: `.nav-active`, `.input-error`, `.input-success`, `.tooltip`, `.confirm-overlay`, `.loading-spinner`

### Convencion de Commits
```
tipo: descripcion corta en espanol

Explicacion mas larga si es necesario.

https://claude.ai/code/session_ID
```
Tipos validos: `feat`, `fix`, `docs`, `refactor`, `style`

## Datos de Productos
12 productos definidos en `js/data/products.js`, organizados en 3 categorias:

| Categoria | Productos | IDs |
|-----------|-----------|-----|
| `estanques` | 6 | EST-10000-V, EST-5000-H, EST-5000-V, EST-10000-H, EST-20000-V, EST-15000-S |
| `piscinas` | 3 | PIS-6X3-R, PIS-8X4-O, PIS-4X2-C |
| `fosas` | 3 | FOS-2500, FOS-3200, FOS-5000 |

### Estructura de un Producto
```javascript
{
  id: "EST-10000-V",           // SKU unico
  nombre: "Estanque Vertical 10.000L",
  categoria: "estanques",       // estanques | piscinas | fosas
  descripcion: "Descripcion corta para tarjeta",
  descripcionLarga: "Descripcion completa para detalle",
  estado: "En Stock",           // En Stock | Disponible | A pedido
  estadoColor: "green",         // green | amber (para badge visual)
  resenas: 24,                  // Numero de resenas (solo visual)
  imagen: "URL_principal",
  imagenes: ["URL1", "URL2", "URL3"],  // Galeria (3 imagenes)
  specs: {                      // Varia segun categoria
    capacidad, altura, diametro, espesor, material,  // estanques
    largo, ancho, profundidad, dimensiones            // piscinas/fosas
  },
  caracteristicas: [            // 3 items con icono Material Symbols
    { icon: "verified", title: "Titulo", desc: "Descripcion" }
  ]
}
```

## Estructura del HTML Principal (index.html)

### Secciones Estaticas
- **Header fijo**: Logo, navegacion (4 links), toggle tema, badge carrito, menu movil
- **Footer**: Logo, links rapidos, categorias, contacto, redes sociales, copyright
- **WhatsApp flotante**: Boton fijo inferior derecho

### Contenido Dinamico
- `<main id="main-content">` - Unico contenedor dinamico, reemplazado por `render()`

### Meta y SEO
- Open Graph tags (og:title, og:description, og:image, og:url)
- Keywords meta tag
- URL canonica: `https://fibrarce.cl`

## Desarrollo Local

### Como Ejecutar
No requiere build ni servidor especial. Abrir con cualquier servidor HTTP local:
```bash
# Opcion 1: Python
python3 -m http.server 8000

# Opcion 2: Node (si esta instalado)
npx serve .

# Opcion 3: VS Code Live Server extension
```
**Nota**: ES Modules requieren un servidor HTTP. Abrir `index.html` directamente con `file://` no funciona por restricciones CORS.

### Flujo de Trabajo
1. Editar archivos JS/HTML/CSS directamente
2. Refrescar navegador para ver cambios
3. Sin hot-reload ni watch mode (no hay build process)

## Lista de Verificacion
Al hacer cambios, verificar:
- [ ] Toggle de tema oscuro/claro funciona
- [ ] Busqueda filtra productos correctamente (y mantiene el foco del input)
- [ ] Filtro por categoria funciona (todos, estanques, piscinas, fosas)
- [ ] Ordenamiento funciona (nombre A-Z, Z-A, disponibilidad)
- [ ] Agregar/quitar del carrito funciona (con toast y undo)
- [ ] Cantidad en carrito se actualiza correctamente
- [ ] Vista de detalle del producto carga correctamente (galeria, tabs)
- [ ] Formulario de cotizacion valida campos (email, telefono, requeridos)
- [ ] Layout responsive en movil (menu hamburguesa funcional)
- [ ] Boton flotante de WhatsApp visible en todas las vistas
- [ ] localStorage persiste carrito, productos vistos y tema entre recargas
- [ ] Navegacion SPA funciona (home, catalogo, producto, cotizacion)
- [ ] Badge del carrito muestra cantidad correcta

## Patrones de Arquitectura

### Publish-Subscribe
`store.js` implementa un patrón pub-sub con `Set` de callbacks:
- `subscribe(callback)` agrega listener, retorna funcion de unsubscribe
- `notify()` ejecuta todos los listeners
- `main.js` suscribe `render()` en init, asi cada cambio de estado re-renderiza

### Flujo de Datos Unidireccional
```
Evento usuario (onclick) → Action (actions.js) → Modifica state → notify() → render()
```

### Composicion de Componentes
Las paginas componen componentes menores:
- `HomePage` usa `renderProductCard()` para mostrar 4 productos destacados
- `CatalogPage` usa `renderProductCard()` para la grilla completa
- `ProductPage` usa `renderTabContent()` interno para contenido de tabs

## Migracion a Astro (EN PROGRESO)

El proyecto esta siendo migrado a Astro. La nueva version se encuentra en `fibrarce-astro/`.

### Estado de la Migracion

| Fase | Descripcion | Estado |
|------|-------------|--------|
| 0 | Inicializar proyecto Astro + Tailwind + CSS | ✅ Completada |
| 1 | Content Collection (12 productos) | ✅ Completada |
| 2 | Stores (cart, theme, ui) | ✅ Completada |
| 3 | Layout y componentes estaticos | ✅ Completada |
| 4 | Paginas (index, catalogo, producto, cotizacion, 404) | ✅ Completada |
| 5 | Islas Preact (interactividad) | ✅ Completada |
| 6 | Utilidades (helpers, validation, constants) | ✅ Completada |
| 7 | SEO, accesibilidad y Heuristicas de Nielsen | ✅ Completada |
| 8 | Verificacion funcional y build | ✅ Completada |
| 9 | SEO completo + optimizacion para IA | ✅ Completada |
| 10 | Preparacion para publicacion (favicon, manifest, legal) | ✅ Completada |
| 11 | Estandares de industria (analytics, PWA, accesibilidad) | ✅ Completada |
| 12 | Anti-spam (Turnstile + Web3Forms) | ✅ Completada |

### Estandares de Industria (Fase 11)

El proyecto ahora cumple con estandares de industria 2025-2026:

| Elemento | Implementacion |
|----------|----------------|
| Plausible Analytics | Analytics privacy-friendly sin cookies |
| Cookie Consent | Banner GDPR con opciones Aceptar/Solo esenciales |
| Service Worker | Cache offline con network-first strategy |
| PWA Icons | favicon.svg + icon-192.svg + icon-512.svg |
| Pagina de exito | /cotizacion-enviada con flujo post-formulario |
| prefers-reduced-motion | Soporte para usuarios con sensibilidad a movimiento |
| Focus Trap | ConfirmDialog con focus trap WCAG 2.1 compliant |
| Install Prompt | Banner PWA con beforeinstallprompt API |
| Sitemap mejorado | lastmod, changefreq, priority en todas las URLs |

**Archivos nuevos:**
- `src/components/CookieConsent.astro` - Banner de consentimiento
- `src/components/InstallPrompt.astro` - Prompt de instalacion PWA
- `public/sw.js` - Service worker para offline
- `public/icon-192.svg`, `public/icon-512.svg` - Iconos PWA
- `src/pages/cotizacion-enviada.astro` - Pagina de exito

**localStorage keys:**
| Clave | Contenido |
|-------|-----------|
| `fibrarce_cookie_consent` | `'accepted'` o `'essential'` |
| `fibrarce_install_dismissed` | Timestamp de cuando se cerro el prompt |

### Anti-Spam (Fase 12)

Proteccion anti-spam con cuadruple capa de seguridad:

| Elemento | Implementacion |
|----------|----------------|
| Cloudflare Turnstile | Widget CAPTCHA invisible/managed |
| Web3Forms | Servicio de envio de emails (250/mes gratis) |
| Honeypot Field | Campo oculto para detectar bots |
| Rate Limiting | Limite de envios por IP (Web3Forms) |
| Email Obfuscation | Emails codificados en base64, decodificados client-side |
| Time Validation | Rechaza envios en menos de 3 segundos |

**Ofuscacion de Emails:**
- Email `ventas@fibrarce.cl` codificado como `dmVudGFzQGZpYnJhcmNlLmNs`
- HTML muestra `[email protegido]` inicialmente
- JavaScript decodifica con `atob()` y crea enlace mailto al cargar
- Protege contra bots que cosechan emails del HTML

**Validacion de Tiempo:**
- Formularios registran `Date.now()` al cargar
- Envios en menos de 3 segundos son rechazados con toast
- Protege contra bots que envian formularios instantaneamente

**Configuracion requerida antes de produccion:**
1. Obtener Access Key en https://web3forms.com
2. Obtener Site Key de Turnstile en https://dash.cloudflare.com/turnstile
3. Actualizar `src/utils/constants.ts` con las claves reales

**Archivos modificados:**
- `src/utils/constants.ts` - Agregar WEB3FORMS y TURNSTILE
- `src/layouts/BaseLayout.astro` - Script de Turnstile
- `src/pages/cotizacion.astro` - Formulario con Turnstile + Web3Forms + time validation
- `src/components/ContactSection.astro` - Formulario con Turnstile + Web3Forms + email ofuscado + time validation
- `src/components/Footer.astro` - Email ofuscado con script de deofuscacion

### SEO y Optimizacion para IA (Fase 9)

El proyecto implementa SEO completo optimizado para buscadores e inteligencias artificiales:

| Elemento | Implementacion |
|----------|----------------|
| Twitter Cards | twitter:card, twitter:title, twitter:description, twitter:image |
| robots.txt | Allow all crawlers + AI bots (GPTBot, Claude-Web, Perplexity) |
| Organization JSON-LD | Schema.org con contacto y redes sociales |
| WebSite JSON-LD | SearchAction para busqueda en catalogo |
| BreadcrumbList JSON-LD | Navegacion en catalogo y productos |
| ItemList JSON-LD | Lista de 12 productos en catalogo |
| FAQPage JSON-LD | 10 preguntas frecuentes para AI search |
| Product JSON-LD | 12 productos con offers y ratings |

**Preguntas FAQ optimizadas para IA:**
- "Como instalar una piscina de fibra de vidrio?"
- "Que es mejor: piscina de fibra de vidrio o de hormigon?"
- "Como funciona una fosa septica de fibra de vidrio?"
- "Que capacidad de estanque necesito para mi casa?"

### Heuristicas de Nielsen (10/10)

El proyecto implementa las 10 heuristicas de usabilidad de Nielsen:

| # | Heuristica | Implementacion | Puntuacion |
|---|-----------|----------------|------------|
| 1 | Visibilidad del estado | Loading states, badges reactivos, aria-busy | 10/10 |
| 2 | Coincidencia mundo real | Lenguaje en espanol chileno, iconos intuitivos | 10/10 |
| 3 | Control y libertad | Undo en toasts, confirmacion antes de eliminar | 10/10 |
| 4 | Consistencia | Labels visibles, estilos uniformes | 10/10 |
| 5 | Prevencion errores | Placeholders con formato, tooltips de ayuda | 10/10 |
| 6 | Reconocimiento | Breadcrumbs, nav-active visible (3px, bold) | 10/10 |
| 7 | Flexibilidad | Atajos teclado (Alt+B buscar, Alt+E enviar) | 10/10 |
| 8 | Diseno minimalista | UI limpia, sin elementos innecesarios | 10/10 |
| 9 | Recuperacion errores | Mensajes inline especificos, scroll a error | 10/10 |
| 10 | Documentacion | FAQ con "Como cotizar", tooltips contextuales | 10/10 |

**Archivos clave modificados:**
- `validation.ts`: validateFormWithErrors(), setupFormValidation()
- `global.css`: .form-error, .skip-link, focus-visible
- `BaseLayout.astro`: Skip link accesibilidad
- `producto/[id].astro`: JSON-LD structured data
- `catalogo.astro`: Breadcrumb, accesskey="b"
- `cotizacion.astro`: ARIA labels, accesskey="e"
- `ContactSection.astro`: Labels visibles, loading color
- `FAQ.astro`: Pregunta "Como solicito una cotizacion?"

### Verificacion Fase 8 (Completada)

| Item | Resultado | Detalle |
|------|-----------|---------|
| `astro dev` | ✅ | Server inicia en localhost:4321 |
| `astro build` | ✅ | 16 paginas en 4.78s |
| Paginas producto | ✅ | 12 de 12 generadas |
| Sitemap | ✅ | 15 URLs indexadas |
| JSON-LD SEO | ✅ | 12 productos con structured data |
| Skip link | ✅ | Presente en todas las paginas |
| Accesskey | ✅ | Alt+B (buscar), Alt+E (enviar) |
| Breadcrumb | ✅ | Presente en catalogo |
| ARIA labels | ✅ | 5+ por pagina |
| JS total | ✅ | 86KB (gzip ~25KB) |

### Estructura del Proyecto Astro

```
fibrarce-astro/
├── astro.config.mjs          # output: static, site: fibrarce.cl
├── tailwind.config.mjs       # Colores custom + darkMode: class
├── tsconfig.json             # TypeScript strict + path aliases
├── package.json              # Dependencias Astro + Preact + nanostores
├── src/
│   ├── content/
│   │   ├── config.ts         # Schema Zod para productos
│   │   └── products/         # 12 archivos JSON (uno por producto)
│   ├── layouts/
│   │   └── BaseLayout.astro  # <head>, slot, script anti-FOUC
│   ├── components/
│   │   ├── Header.astro          # Navegacion con theme toggle y cart badge
│   │   ├── Footer.astro          # Footer con links y redes sociales
│   │   ├── WhatsAppButton.astro  # Boton flotante WhatsApp
│   │   ├── ProductCard.astro     # Tarjeta de producto reutilizable
│   │   ├── HeroSection.astro     # Hero principal
│   │   ├── CompaniesBar.astro    # Logos de empresas
│   │   ├── ServicesSection.astro # Servicios
│   │   ├── WhyUsSection.astro    # Por que elegirnos
│   │   ├── FAQ.astro             # Preguntas frecuentes
│   │   ├── ContactSection.astro  # Seccion de contacto
│   │   └── islands/              # Islas Preact para UI global
│   │       ├── ToastContainer.tsx   # Notificaciones toast con undo
│   │       └── ConfirmDialog.tsx    # Dialogo de confirmacion modal
│   ├── stores/
│   │   ├── cart.ts           # nanostores persistent
│   │   ├── theme.ts
│   │   └── ui.ts             # toasts + recentlyViewed
│   ├── utils/
│   │   ├── helpers.ts
│   │   ├── validation.ts
│   │   └── constants.ts
│   ├── styles/
│   │   └── global.css        # @tailwind + CSS custom migrado
│   └── pages/
│       ├── index.astro
│       ├── catalogo.astro
│       ├── cotizacion.astro
│       ├── 404.astro
│       └── producto/
│           └── [id].astro
└── public/
    └── images/
```

### Desarrollo del Proyecto Astro

```bash
cd fibrarce-astro

# Desarrollo
npm run dev

# Build
npm run build

# Preview del build
npm run preview
```

### Mapeo de Tecnologias

| Vanilla JS (actual) | Astro (nuevo) |
|---------------------|---------------|
| SPA con render() | MPA con file-based routing |
| Estado global (store.js) | nanostores con persistencia |
| Template literals HTML | Componentes .astro |
| onclick globales | Islas Preact con client:* |
| Tailwind CDN | Tailwind integrado en build |
| Sin SEO (JS-only) | HTML pre-renderizado |

### Plan Detallado

Ver `/root/.claude/plans/quiet-skipping-cherny.md` para el plan completo de migracion con 700+ lineas de detalle.
