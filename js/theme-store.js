/**
 * ElectroMedicion - Theme Store
 * Store del tema (dark/light mode) con API similar a nanostores.
 * Preparado para migración a Astro.
 *
 * Uso:
 *   ThemeStore.init();
 *   ThemeStore.toggle();
 *   ThemeStore.subscribe(theme => console.log('Tema:', theme));
 */

const ThemeStore = {
  // Estado interno
  _theme: 'light',
  _listeners: new Set(),

  /**
   * Obtener tema actual
   * @returns {string} 'light' o 'dark'
   */
  get() {
    return this._theme;
  },

  /**
   * Establecer tema
   * @param {string} theme - 'light' o 'dark'
   */
  set(theme) {
    if (theme !== 'light' && theme !== 'dark') {
      console.warn('Tema inválido:', theme);
      return this;
    }

    this._theme = theme;
    this._apply();
    this._persist();
    this._notify();
    return this;
  },

  /**
   * Suscribirse a cambios de tema
   * @param {Function} callback - Función a llamar cuando cambie el tema
   * @returns {Function} Función para desuscribirse
   */
  subscribe(callback) {
    this._listeners.add(callback);
    // Llamar inmediatamente con estado actual
    callback(this._theme);
    // Retornar función de limpieza
    return () => this._listeners.delete(callback);
  },

  /**
   * Notificar a todos los suscriptores
   */
  _notify() {
    this._listeners.forEach(fn => {
      try {
        fn(this._theme);
      } catch (e) {
        console.error('Error en listener del tema:', e);
      }
    });
  },

  /**
   * Aplicar tema al DOM
   */
  _apply() {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', this._theme);
    }
  },

  /**
   * Persistir tema en localStorage
   */
  _persist() {
    try {
      const key = (typeof CONFIG !== 'undefined') ? CONFIG.themeKey : 'electromedicion_theme';
      localStorage.setItem(key, this._theme);
    } catch (e) {
      console.error('Error guardando tema:', e);
    }
  },

  /**
   * Inicializar store
   * 1. Intenta cargar desde localStorage
   * 2. Si no hay, usa preferencia del sistema
   */
  init() {
    try {
      const key = (typeof CONFIG !== 'undefined') ? CONFIG.themeKey : 'electromedicion_theme';
      const saved = localStorage.getItem(key);

      if (saved && (saved === 'light' || saved === 'dark')) {
        this._theme = saved;
      } else if (typeof window !== 'undefined') {
        // Detectar preferencia del sistema
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        this._theme = prefersDark ? 'dark' : 'light';
      }

      this._apply();
    } catch (e) {
      console.error('Error inicializando tema:', e);
      this._theme = 'light';
    }

    return this;
  },

  /**
   * Alternar entre light y dark
   */
  toggle() {
    this.set(this._theme === 'light' ? 'dark' : 'light');
    return this;
  },

  /**
   * Verificar si es modo oscuro
   * @returns {boolean}
   */
  isDark() {
    return this._theme === 'dark';
  },

  /**
   * Verificar si es modo claro
   * @returns {boolean}
   */
  isLight() {
    return this._theme === 'light';
  },

  /**
   * Escuchar cambios en preferencia del sistema
   * Útil para sincronizar si el usuario cambia configuración del OS
   */
  watchSystemPreference() {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

      const handler = (e) => {
        // Solo cambiar si no hay preferencia guardada
        const key = (typeof CONFIG !== 'undefined') ? CONFIG.themeKey : 'electromedicion_theme';
        if (!localStorage.getItem(key)) {
          this.set(e.matches ? 'dark' : 'light');
        }
      };

      // Compatibilidad con navegadores antiguos
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handler);
      } else if (mediaQuery.addListener) {
        mediaQuery.addListener(handler);
      }
    }
    return this;
  }
};

// Exportar para uso global
if (typeof window !== 'undefined') {
  window.ThemeStore = ThemeStore;
}

// Exportar para ES modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ThemeStore;
}
