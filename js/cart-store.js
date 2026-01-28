/**
 * ElectroMedicion - Cart Store
 * Store del carrito con API similar a nanostores.
 * Preparado para migración a Astro.
 *
 * Uso:
 *   CartStore.init();
 *   CartStore.addItem({ sku: 'MUL-001', title: '...', category: '...', quantity: 1 });
 *   CartStore.subscribe(items => console.log('Carrito:', items));
 */

const CartStore = {
  // Estado interno
  _state: [],
  _listeners: new Set(),

  /**
   * Obtener estado actual del carrito
   * @returns {Array} Items del carrito
   */
  get() {
    return this._state;
  },

  /**
   * Actualizar estado y notificar a suscriptores
   * @param {Array} newState - Nuevo estado del carrito
   */
  set(newState) {
    this._state = newState;
    this._persist();
    this._notify();
  },

  /**
   * Suscribirse a cambios del carrito
   * @param {Function} callback - Función a llamar cuando cambie el carrito
   * @returns {Function} Función para desuscribirse
   */
  subscribe(callback) {
    this._listeners.add(callback);
    // Llamar inmediatamente con estado actual
    callback(this._state);
    // Retornar función de limpieza
    return () => this._listeners.delete(callback);
  },

  /**
   * Notificar a todos los suscriptores
   */
  _notify() {
    this._listeners.forEach(fn => {
      try {
        fn(this._state);
      } catch (e) {
        console.error('Error en listener del carrito:', e);
      }
    });
  },

  /**
   * Persistir estado en localStorage
   */
  _persist() {
    try {
      const key = (typeof CONFIG !== 'undefined') ? CONFIG.storageKey : 'electromedicion_cart';
      localStorage.setItem(key, JSON.stringify(this._state));
    } catch (e) {
      console.error('Error guardando carrito:', e);
    }
  },

  /**
   * Inicializar store cargando desde localStorage
   */
  init() {
    try {
      const key = (typeof CONFIG !== 'undefined') ? CONFIG.storageKey : 'electromedicion_cart';
      const stored = localStorage.getItem(key);
      this._state = stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Error cargando carrito:', e);
      this._state = [];
    }
    return this;
  },

  /**
   * Agregar item al carrito
   * @param {Object} product - Producto a agregar { sku, title, category, quantity? }
   */
  addItem(product) {
    const current = this.get();
    const existingIndex = current.findIndex(item => item.sku === product.sku);

    if (existingIndex > -1) {
      // Incrementar cantidad si ya existe
      current[existingIndex].quantity += (product.quantity || 1);
    } else {
      // Agregar nuevo item
      current.push({
        sku: product.sku,
        title: product.title,
        category: product.category,
        quantity: product.quantity || 1
      });
    }

    this.set([...current]);
    return this;
  },

  /**
   * Remover item del carrito
   * @param {string} sku - SKU del producto a remover
   */
  removeItem(sku) {
    this.set(this.get().filter(item => item.sku !== sku));
    return this;
  },

  /**
   * Actualizar cantidad de un item
   * @param {string} sku - SKU del producto
   * @param {number} quantity - Nueva cantidad (mínimo 1)
   */
  updateQuantity(sku, quantity) {
    const current = this.get();
    const item = current.find(i => i.sku === sku);
    if (item) {
      item.quantity = Math.max(1, parseInt(quantity) || 1);
      this.set([...current]);
    }
    return this;
  },

  /**
   * Incrementar cantidad de un item
   * @param {string} sku - SKU del producto
   */
  incrementQuantity(sku) {
    const item = this.get().find(i => i.sku === sku);
    if (item) {
      this.updateQuantity(sku, item.quantity + 1);
    }
    return this;
  },

  /**
   * Decrementar cantidad de un item
   * @param {string} sku - SKU del producto
   */
  decrementQuantity(sku) {
    const item = this.get().find(i => i.sku === sku);
    if (item && item.quantity > 1) {
      this.updateQuantity(sku, item.quantity - 1);
    }
    return this;
  },

  /**
   * Obtener total de items en el carrito
   * @returns {number} Total de unidades
   */
  getTotal() {
    return this.get().reduce((sum, item) => sum + item.quantity, 0);
  },

  /**
   * Obtener cantidad de un producto específico
   * @param {string} sku - SKU del producto
   * @returns {number} Cantidad en carrito (0 si no está)
   */
  getQuantity(sku) {
    const item = this.get().find(i => i.sku === sku);
    return item ? item.quantity : 0;
  },

  /**
   * Verificar si un producto está en el carrito
   * @param {string} sku - SKU del producto
   * @returns {boolean}
   */
  hasItem(sku) {
    return this.get().some(item => item.sku === sku);
  },

  /**
   * Limpiar todo el carrito
   */
  clear() {
    this.set([]);
    return this;
  },

  /**
   * Obtener items como array (para formularios)
   * @returns {Array} Items formateados para envío
   */
  toArray() {
    return this.get().map(item => ({
      sku: item.sku,
      title: item.title,
      category: item.category,
      quantity: item.quantity
    }));
  }
};

// Exportar para uso global
if (typeof window !== 'undefined') {
  window.CartStore = CartStore;
}

// Exportar para ES modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CartStore;
}
