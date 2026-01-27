/**
 * ElectroMedicion - Configuración Global
 * Este archivo contiene la configuración centralizada del proyecto.
 * Preparado para migración a Astro.
 */

const CONFIG = {
  // Storage keys para localStorage
  storageKey: 'electromedicion_cart',
  themeKey: 'electromedicion_theme',

  // Configuración de animaciones
  animationThreshold: 0.1,

  // Configuración de UI
  toastDuration: 3000,
  counterDuration: 2000,

  // Rutas de datos (para carga dinámica)
  productsPath: './data/products/',
  categoriesPath: './data/categories.json',

  // API endpoints (para futuro uso)
  apiEndpoint: null,
  formEndpoint: null // Web3Forms endpoint
};

// Exportar para uso global (compatibilidad con HTML vanilla)
if (typeof window !== 'undefined') {
  window.CONFIG = CONFIG;
}

// Exportar para ES modules (Astro)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}
