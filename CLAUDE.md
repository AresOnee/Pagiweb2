# Contexto del Proyecto: ElectroMedición

## Descripción General
Sitio web de catálogo para empresa de equipos de medición eléctrica en Chile. Permite a los clientes explorar productos, ver especificaciones técnicas y solicitar cotizaciones.

## Estado Actual
- **Fase:** Borrador/Demo para presentar al cliente
- **Stack actual:** HTML5, CSS3, JavaScript vanilla
- **Migración planificada:** Astro (post-aprobación del cliente)

## Estructura del Proyecto

```
Pagiweb2/
├── index.html              # Página de inicio
├── productos.html          # Catálogo de productos
├── cotizacion.html         # Carrito y formulario de cotización
├── nosotros.html           # Información de la empresa
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
│   ├── products/           # 12 archivos JSON (1 por producto)
│   │   ├── mul-001.json, mul-002.json
│   │   ├── pin-001.json, pin-002.json
│   │   ├── tel-001.json, tel-002.json
│   │   ├── meg-001.json, meg-002.json
│   │   ├── ana-001.json, ana-002.json
│   │   └── det-001.json, det-002.json
│   └── categories.json     # Categorías del catálogo
├── docs/
│   └── astro-components.md # Guía de componentes e islas
├── types/
│   └── index.ts            # Interfaces TypeScript
├── schemas/
│   └── product.schema.js   # Schema Zod para Content Collections
├── backup/
│   └── 20260127/           # Backup de archivos originales
├── PRESUPUESTO_ELECTROMEDICION.html
├── PRESENTACION_CLIENTE.html
├── BENEFICIOS_ROI.md
└── CHECKLIST_PROYECTO.md
```

## Funcionalidades Implementadas

### Sistema de Productos
- Base de datos de 12 productos en `PRODUCTS_DB` (js/main.js:18-310)
- Categorías: Multímetros, Pinzas, Telurómetros, Megóhmetros, Analizadores, Detectores
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
- `PRODUCTS_DB`: Base de datos de productos (líneas 18-310)
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
const CONFIG = {
  storageKey: 'electromedicion_cart',    // Key del carrito en localStorage
  themeKey: 'electromedicion_theme',     // Key del tema en localStorage
  animationThreshold: 0.1,               // Threshold para animaciones
  toastDuration: 3000,                   // Duración de toasts (ms)
  counterDuration: 2000                  // Duración de contadores animados
};
```

## Presupuesto del Proyecto

| Concepto | Valor |
|----------|-------|
| Desarrollo | $370.000 CLP |
| Contingencia (10%) | $37.000 CLP |
| Dominio .cl (año 1) | Incluido |
| Hosting | $0 (Netlify gratis) |
| **Costo anual (año 2+)** | $20.000 CLP |

## Plan de Migración a Astro

### Estructura Propuesta
```
src/
├── components/
│   ├── ProductCard.astro
│   ├── ProductModal.astro
│   ├── Header.astro
│   └── Footer.astro
├── layouts/
│   └── MainLayout.astro
├── pages/
│   ├── index.astro
│   ├── nosotros.astro
│   ├── cotizacion.astro
│   └── productos/
│       ├── index.astro
│       └── [sku].astro
└── content/
    └── productos/
        ├── mul-001.json
        └── ...
```

### Beneficios de Astro
- Páginas estáticas ultra rápidas
- Mejor SEO (HTML pre-renderizado)
- Generación automática de páginas por producto
- Un template = infinitos productos
- Hosting gratuito en Netlify/Vercel

## Servicios de Terceros

| Servicio | Uso | Plan |
|----------|-----|------|
| Netlify/Vercel | Hosting | Gratis |
| Web3Forms | Formularios | Gratis (250/mes) |
| Cloudflare | CDN | Gratis |
| Let's Encrypt | SSL | Gratis |
| Google Analytics | Estadísticas | Gratis |

## Cliente

- **Empresa:** ElectroMedición
- **Rubro:** Equipos de medición eléctrica
- **Tamaño:** Pequeña empresa, primera página web
- **Ubicación:** Chile
- **Productos:** Multímetros, pinzas amperimétricas, telurómetros, megóhmetros, analizadores, detectores

## Notas de Desarrollo

1. **Bug corregido:** Los productos no se mostraban en cotización porque el selector era `.quote-items-list` pero el HTML tenía `#quote-items`

2. **Modo oscuro:** Detecta preferencia del sistema y guarda elección en localStorage

3. **Modal de producto:** Se abre al hacer clic en la tarjeta, pero NO si se hace clic en el botón de cotizar

4. **Formulario:** Actualmente simula envío. Para producción, configurar Web3Forms con API key real

## Comandos Útiles

```bash
# Ver el sitio localmente
npx serve .

# Si se migra a Astro
npm create astro@latest
npm run dev
npm run build
```

## Contacto del Desarrollador

- Completar datos en `PRESUPUESTO_ELECTROMEDICION.html`
- Secciones: [Tu Nombre], +56 9 XXXX XXXX, tu@email.com

---

## Preparación para Migración a Astro

El proyecto incluye archivos preparados para facilitar la migración a Astro cuando el cliente apruebe.

### Estructura de Preparación

```
Pagiweb2/
├── data/
│   ├── products/           # 12 archivos JSON (1 por producto)
│   │   ├── mul-001.json
│   │   ├── mul-002.json
│   │   ├── pin-001.json
│   │   ├── pin-002.json
│   │   ├── tel-001.json
│   │   ├── tel-002.json
│   │   ├── meg-001.json
│   │   ├── meg-002.json
│   │   ├── ana-001.json
│   │   ├── ana-002.json
│   │   ├── det-001.json
│   │   └── det-002.json
│   └── categories.json     # Categorías del catálogo
├── js/
│   ├── config.js           # Configuración centralizada
│   ├── utils.js            # Funciones utilitarias (slugify, etc.)
│   ├── cart-store.js       # Store del carrito (API nanostores)
│   └── theme-store.js      # Store del tema (dark mode)
├── docs/
│   └── astro-components.md # Guía de componentes e islas
├── css/
│   └── modules/
│       └── README.md       # Mapeo CSS → componentes
├── types/
│   └── index.ts            # Interfaces TypeScript
├── schemas/
│   └── product.schema.js   # Schema para Content Collections
└── backup/
    └── 20260127/           # Backup de archivos originales
```

### Archivos Clave para Migración

| Archivo | Destino en Astro | Descripción |
|---------|------------------|-------------|
| `data/products/*.json` | `src/content/products/` | Content Collections |
| `data/categories.json` | `src/data/categories.json` | Datos estáticos |
| `js/cart-store.js` | `src/stores/cart.ts` | Convertir a nanostores |
| `js/theme-store.js` | `src/stores/theme.ts` | Convertir a nanostores |
| `types/index.ts` | `src/types/index.ts` | Copiar directo |
| `schemas/product.schema.js` | `src/content/config.ts` | Copiar schema Zod |

### Cómo Agregar/Quitar Productos

**Agregar un producto:**
1. Copiar un archivo existente en `data/products/`
2. Renombrar con el nuevo SKU (ej: `mul-003.json`)
3. Editar los datos del producto
4. Actualizar `count` en `data/categories.json`

**Quitar un producto:**
1. Eliminar el archivo JSON correspondiente
2. Actualizar `count` en `data/categories.json`

### Stores (API nanostores)

Los stores tienen una API compatible con nanostores:

```javascript
// Carrito
CartStore.init();
CartStore.addItem({ sku: 'MUL-001', title: '...', category: '...', quantity: 1 });
CartStore.subscribe(items => console.log(items));

// Tema
ThemeStore.init();
ThemeStore.toggle();
ThemeStore.subscribe(theme => console.log(theme));
```

### Documentación Adicional

- **Componentes Astro:** Ver `docs/astro-components.md`
- **Mapeo CSS:** Ver `css/modules/README.md`
- **Tipos TypeScript:** Ver `types/index.ts`
- **Schema de Productos:** Ver `schemas/product.schema.js`

### Notas Importantes

1. Los archivos de preparación **NO afectan** el sitio actual
2. El sitio sigue funcionando con `main.js` original
3. Los stores son solo **referencia** para cuando se migre
4. El backup está en `backup/20260127/` por si se necesita restaurar
