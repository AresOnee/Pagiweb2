# Módulos CSS - Referencia para Astro

Este documento mapea las secciones de `styles.css` a sus componentes Astro correspondientes.

## Estructura en Astro

```
src/styles/
├── global.css        # Variables + Reset + Base (líneas 8-260)
├── animations.css    # Keyframes (líneas 1914-1953)
└── dark-mode.css     # Overrides [data-theme="dark"] (líneas 2327-2509)
```

## CSS Global (copiar a global.css)

| Sección | Líneas en styles.css | Descripción |
|---------|---------------------|-------------|
| Variables CSS | 8-112 | `:root` con design tokens |
| Reset | 115-168 | Normalización base |
| Utilidades | 169-221 | `.container`, `.section`, `.sr-only` |
| Tipografía | 222-260 | Headings, `.text-gradient` |

## CSS Scoped por Componente

Copiar las líneas indicadas al `<style>` de cada componente Astro:

| Componente | Líneas en styles.css | Archivo Astro |
|------------|---------------------|---------------|
| Botones | 261-371 | `Button.astro <style>` |
| Header | 372-558 | `Header.astro <style>` |
| Hero | 559-726 | `HeroSection.astro <style>` |
| Categorías | 727-812 | `CategoryCard.astro <style>` |
| Productos | 813-996 | `ProductCard.astro <style>` |
| Features | 997-1059 | `FeatureCard.astro <style>` |
| CTA | 1060-1106 | `CtaSection.astro <style>` |
| Testimonios | 1107-1216 | `TestimonialCard.astro <style>` |
| About | 1217-1392 | `AboutSection.astro <style>` |
| Cotización | 1393-1704 | `QuoteForm.astro <style>` |
| Footer | 1705-1830 | `Footer.astro <style>` |
| Loader | 1831-1872 | `PageLoader.astro <style>` |
| Breadcrumb | 1873-1913 | `Breadcrumb.astro <style>` |
| Skeleton | 1954-1982 | `Skeleton.astro <style>` |
| Toast | 1983-2047 | `Toast.tsx` (CSS-in-JS o module) |
| Toggle Tema | 2510-2600 | `DarkModeToggle.tsx` |
| Modal | 2601-3439 | `ProductModal.tsx` |
| Quote Items | 3440-3740 | `QuoteItems.tsx` |

## Responsive

Las media queries (líneas 2048-2275) se distribuyen en cada componente:

```css
/* Ejemplo en ProductCard.astro */
<style>
  .product-card { /* estilos base */ }

  @media (max-width: 768px) {
    .product-card { /* ajustes mobile */ }
  }
</style>
```

## Dark Mode

Dos opciones para manejar dark mode en Astro:

### Opción 1: CSS Global (recomendada para consistencia)

```css
/* src/styles/dark-mode.css */
[data-theme="dark"] {
  --color-background: #0f172a;
  /* ... resto de overrides */
}
```

### Opción 2: Por Componente

```astro
<style>
  .product-card {
    background: var(--color-white);
  }

  :global([data-theme="dark"]) .product-card {
    background: var(--color-gray-800);
  }
</style>
```

## Animaciones (global)

Los keyframes deben estar en `global.css` o un archivo separado:

```css
/* src/styles/animations.css */
@keyframes fadeIn { ... }
@keyframes bump { ... }
@keyframes float { ... }
@keyframes spin { ... }
@keyframes skeleton-loading { ... }
@keyframes pulse { ... }
@keyframes addToCart { ... }
@keyframes checkmark { ... }
```

## Checklist de Migración

- [ ] Crear `global.css` con variables y reset
- [ ] Crear `animations.css` con keyframes
- [ ] Crear `dark-mode.css` con overrides
- [ ] Para cada componente:
  - [ ] Copiar CSS relevante
  - [ ] Agregar responsive específico
  - [ ] Verificar que variables CSS estén disponibles
- [ ] Testear dark mode en todos los componentes
- [ ] Testear responsive en todas las páginas
