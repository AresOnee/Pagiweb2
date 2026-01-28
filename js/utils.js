/**
 * ElectroMedicion - Utilidades
 * Funciones puras sin dependencias del DOM.
 * Preparado para migración a Astro.
 */

const Utils = {
  /**
   * Debounce - Retrasa la ejecución hasta que pase un tiempo sin llamadas
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  /**
   * Throttle - Limita la frecuencia de ejecución
   */
  throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  /**
   * Formatear número con separador de miles (punto para Chile)
   */
  formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  },

  /**
   * Generar ID único
   */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },

  /**
   * Convertir texto a slug (para URLs)
   * Ej: "Multímetros Digitales" → "multimetros-digitales"
   */
  slugify(text) {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
      .replace(/[^a-z0-9]+/g, '-')     // Reemplazar no-alfanuméricos con guión
      .replace(/(^-|-$)/g, '');        // Quitar guiones al inicio/final
  },

  /**
   * Obtener producto por SKU de un objeto de productos
   */
  getProductBySku(products, sku) {
    if (Array.isArray(products)) {
      return products.find(p => p.sku === sku) || null;
    }
    return products[sku] || null;
  },

  /**
   * Filtrar productos por categoría
   */
  filterByCategory(products, category) {
    const productArray = Array.isArray(products) ? products : Object.values(products);
    if (!category || category === 'todos') {
      return productArray;
    }
    return productArray.filter(p =>
      Utils.slugify(p.category) === category || p.categorySlug === category
    );
  },

  /**
   * Cargar productos desde archivos JSON
   * @returns {Promise<Object>} Productos indexados por SKU
   */
  async loadProducts() {
    try {
      const categoriesResponse = await fetch('./data/categories.json');
      const categories = await categoriesResponse.json();

      const products = {};

      // Cargar cada producto basado en las categorías
      const skuPrefixes = {
        'multimetros': ['MUL-001', 'MUL-002'],
        'pinzas': ['PIN-001', 'PIN-002'],
        'telurometros': ['TEL-001', 'TEL-002'],
        'megohmetros': ['MEG-001', 'MEG-002'],
        'analizadores': ['ANA-001', 'ANA-002'],
        'detectores': ['DET-001', 'DET-002']
      };

      for (const [category, skus] of Object.entries(skuPrefixes)) {
        for (const sku of skus) {
          try {
            const response = await fetch(`./data/products/${sku.toLowerCase()}.json`);
            const product = await response.json();
            products[sku] = product;
          } catch (e) {
            console.warn(`No se pudo cargar producto: ${sku}`);
          }
        }
      }

      return products;
    } catch (e) {
      console.error('Error cargando productos:', e);
      return {};
    }
  },

  /**
   * Cargar categorías desde JSON
   */
  async loadCategories() {
    try {
      const response = await fetch('./data/categories.json');
      return await response.json();
    } catch (e) {
      console.error('Error cargando categorías:', e);
      return [];
    }
  }
};

// Exportar para uso global
if (typeof window !== 'undefined') {
  window.Utils = Utils;
}

// Exportar para ES modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Utils;
}
