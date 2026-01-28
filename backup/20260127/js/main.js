/**
 * ElectroMedicion - JavaScript Principal
 * Funcionalidades: Carrito, Filtros, Menu Movil, Animaciones, Validacion, Modal, Dark Mode
 */

// ============================================
// 1. CONFIGURACION GLOBAL
// ============================================
const CONFIG = {
  storageKey: 'electromedicion_cart',
  themeKey: 'electromedicion_theme',
  animationThreshold: 0.1,
  toastDuration: 3000,
  counterDuration: 2000
};

// Base de datos de productos (para detalles)
const PRODUCTS_DB = {
  'MUL-001': {
    sku: 'MUL-001',
    title: 'Multimetro Digital Profesional TRMS',
    category: 'Multimetros',
    description: 'Multimetro digital True RMS con rango automatico, ideal para mediciones precisas en terreno. Pantalla LCD retroiluminada de alta visibilidad.',
    features: [
      'True RMS para mediciones precisas',
      'Rango automatico',
      'Categoria de seguridad CAT III 1000V',
      'Pantalla LCD retroiluminada',
      'Retencion de datos (HOLD)',
      'Medicion de temperatura incluida'
    ],
    specs: {
      'Voltaje DC': '0.1mV - 1000V',
      'Voltaje AC': '0.1mV - 750V',
      'Corriente DC': '0.1uA - 10A',
      'Corriente AC': '0.1uA - 10A',
      'Resistencia': '0.1ohm - 60Mohm',
      'Capacitancia': '1pF - 60mF',
      'Frecuencia': '0.01Hz - 60MHz',
      'Peso': '350g',
      'Dimensiones': '175 x 85 x 45 mm'
    },
    inStock: true,
    badge: 'Popular'
  },
  'MUL-002': {
    sku: 'MUL-002',
    title: 'Multimetro Compacto de Bolsillo',
    category: 'Multimetros',
    description: 'Multimetro portatil ideal para trabajos rapidos. Diseno compacto y resistente para llevar a cualquier lugar.',
    features: [
      'Diseno ultra compacto',
      'Carcasa resistente a golpes',
      'Apagado automatico',
      'Indicador de bateria baja',
      'Facil de usar'
    ],
    specs: {
      'Voltaje DC': '200mV - 600V',
      'Voltaje AC': '200V - 600V',
      'Corriente DC': '200uA - 10A',
      'Resistencia': '200ohm - 20Mohm',
      'Peso': '150g',
      'Dimensiones': '130 x 70 x 25 mm'
    },
    inStock: true,
    badge: null
  },
  'PIN-001': {
    sku: 'PIN-001',
    title: 'Pinza Amperimetrica AC/DC 1000A',
    category: 'Pinzas',
    description: 'Pinza de alta precision para corriente alterna y continua hasta 1000A. Ideal para instalaciones industriales.',
    features: [
      'Medicion AC/DC hasta 1000A',
      'Apertura de mordaza 42mm',
      'Funcion de pico (Peak Hold)',
      'True RMS',
      'Retroiluminacion automatica',
      'Categoria CAT III 1000V'
    ],
    specs: {
      'Corriente AC': '0.1A - 1000A',
      'Corriente DC': '0.1A - 1000A',
      'Voltaje AC': '0.1V - 750V',
      'Voltaje DC': '0.1V - 1000V',
      'Resistencia': '0.1ohm - 60Mohm',
      'Apertura mordaza': '42mm',
      'Peso': '420g'
    },
    inStock: true,
    badge: 'Bestseller'
  },
  'PIN-002': {
    sku: 'PIN-002',
    title: 'Pinza Flexible 3000A',
    category: 'Pinzas',
    description: 'Pinza con sensor flexible para mediciones en espacios reducidos. Ideal para cables gruesos y barras.',
    features: [
      'Sensor flexible de 24 pulgadas',
      'Medicion hasta 3000A AC',
      'Ideal para espacios reducidos',
      'Compatible con cables gruesos',
      'Salida analogica para registro'
    ],
    specs: {
      'Corriente AC': '10A - 3000A',
      'Frecuencia': '40Hz - 1kHz',
      'Longitud sensor': '610mm (24")',
      'Diametro minimo': '7mm',
      'Diametro maximo': '178mm',
      'Peso': '280g'
    },
    inStock: true,
    badge: null
  },
  'TEL-001': {
    sku: 'TEL-001',
    title: 'Telurometro Digital 4 Polos',
    category: 'Telurometros',
    description: 'Medidor de resistencia de tierra con metodo de 4 polos para maxima precision. Cumple normas internacionales.',
    features: [
      'Metodo de 4 polos (Wenner)',
      'Metodo de 3 polos',
      'Metodo de 2 polos',
      'Medicion de resistividad',
      'Memoria para 500 registros',
      'Interfaz USB para PC'
    ],
    specs: {
      'Rango tierra': '0.01ohm - 30kohm',
      'Rango resistividad': '0.01ohm·m - 9999kohm·m',
      'Precision': '±2%',
      'Frecuencia de prueba': '94Hz, 105Hz, 111Hz, 128Hz',
      'Memoria': '500 registros',
      'Peso': '680g'
    },
    inStock: true,
    badge: 'Nuevo'
  },
  'TEL-002': {
    sku: 'TEL-002',
    title: 'Telurometro de Pinza',
    category: 'Telurometros',
    description: 'Medicion de tierra sin necesidad de desconectar. Ideal para sistemas en servicio y mediciones rapidas.',
    features: [
      'Medicion sin desconexion',
      'Medicion de corriente de fuga',
      'Apertura de pinza 32mm',
      'Alarma configurable',
      'Memoria de datos'
    ],
    specs: {
      'Rango tierra': '0.01ohm - 1500ohm',
      'Rango corriente': '0.2mA - 30A',
      'Apertura pinza': '32mm',
      'Frecuencia': '1kHz',
      'Memoria': '100 registros',
      'Peso': '580g'
    },
    inStock: true,
    badge: null
  },
  'MEG-001': {
    sku: 'MEG-001',
    title: 'Megohmetro 5kV Digital',
    category: 'Megohmetros',
    description: 'Medidor de aislacion hasta 5000V para cables, motores y transformadores. Uso profesional e industrial.',
    features: [
      'Tensiones de prueba: 500V, 1kV, 2.5kV, 5kV',
      'Indice de polarizacion (PI)',
      'Relacion de absorcion (DAR)',
      'Prueba de rampa de voltaje',
      'Descarga automatica',
      'Memoria USB'
    ],
    specs: {
      'Tensiones': '500V, 1kV, 2.5kV, 5kV',
      'Rango aislacion': '100kohm - 15Tohm',
      'Corriente de cortocircuito': '2mA max',
      'PI y DAR': 'Automatico',
      'Memoria': '1000 registros',
      'Peso': '1.8kg'
    },
    inStock: true,
    badge: null
  },
  'MEG-002': {
    sku: 'MEG-002',
    title: 'Megohmetro 10kV Profesional',
    category: 'Megohmetros',
    description: 'Equipo de alta tension para pruebas de aislacion en subestaciones y equipos de alta potencia.',
    features: [
      'Tensiones hasta 10kV',
      'Pantalla grafica color',
      'Pruebas automaticas programables',
      'Software de analisis incluido',
      'Bateria de larga duracion',
      'Certificado de calibracion'
    ],
    specs: {
      'Tensiones': '500V, 1kV, 2.5kV, 5kV, 10kV',
      'Rango aislacion': '100kohm - 35Tohm',
      'Precision': '±5%',
      'Pantalla': '5.7" color TFT',
      'Bateria': '8 horas continuas',
      'Peso': '3.2kg'
    },
    inStock: true,
    badge: 'Pro'
  },
  'ANA-001': {
    sku: 'ANA-001',
    title: 'Analizador de Redes Trifasico',
    category: 'Analizadores',
    description: 'Analizador de calidad de energia para redes trifasicas. Mide armonicos, potencia y calidad de energia.',
    features: [
      'Analisis trifasico completo',
      'Medicion de armonicos hasta 50',
      'Registro de eventos',
      'Analisis de flicker',
      'Conexion WiFi y Bluetooth',
      'Software de analisis profesional'
    ],
    specs: {
      'Voltaje': '1V - 1000V RMS',
      'Corriente': '1mA - 6000A (con pinzas)',
      'Frecuencia': '45Hz - 65Hz',
      'Armonicos': 'Hasta orden 50',
      'Clase de precision': 'A segun IEC 61000-4-30',
      'Peso': '2.1kg'
    },
    inStock: true,
    badge: null
  },
  'ANA-002': {
    sku: 'ANA-002',
    title: 'Osciloscopio Portatil 100MHz',
    category: 'Analizadores',
    description: 'Osciloscopio de mano con 2 canales, 100MHz. Ideal para diagnostico en terreno y mantenimiento.',
    features: [
      '2 canales analogicos',
      'Ancho de banda 100MHz',
      'Muestreo 1GS/s',
      'Pantalla color 5.7"',
      'Bateria integrada',
      'Multimetro integrado'
    ],
    specs: {
      'Canales': '2 analogicos',
      'Ancho de banda': '100MHz',
      'Muestreo': '1GS/s',
      'Memoria': '40Mpts',
      'Pantalla': '5.7" TFT color',
      'Bateria': '6 horas',
      'Peso': '1.5kg'
    },
    inStock: true,
    badge: 'Nuevo'
  },
  'DET-001': {
    sku: 'DET-001',
    title: 'Detector de Voltaje Sin Contacto',
    category: 'Detectores',
    description: 'Detector de tension con indicador LED y sonoro. Detecta 12V hasta 1000V AC de forma segura.',
    features: [
      'Deteccion sin contacto',
      'Rango 12V - 1000V AC',
      'Indicador LED y sonoro',
      'Linterna integrada',
      'Clip de bolsillo',
      'Categoria CAT IV 1000V'
    ],
    specs: {
      'Rango': '12V - 1000V AC',
      'Frecuencia': '50/60Hz',
      'Indicacion': 'LED rojo + sonido',
      'Linterna': 'LED blanco',
      'Bateria': '2 x AAA',
      'Peso': '50g'
    },
    inStock: true,
    badge: null
  },
  'DET-002': {
    sku: 'DET-002',
    title: 'Localizador de Cables y Tuberias',
    category: 'Detectores',
    description: 'Detecta cables electricos, tuberias metalicas y estructuras ocultas en paredes y pisos.',
    features: [
      'Deteccion de cables electricos',
      'Deteccion de metales',
      'Deteccion de madera',
      'Pantalla LCD con indicador',
      'Calibracion automatica',
      'Profundidad hasta 120mm'
    ],
    specs: {
      'Cables electricos': 'Hasta 60mm',
      'Metales ferrosos': 'Hasta 120mm',
      'Metales no ferrosos': 'Hasta 80mm',
      'Madera': 'Hasta 38mm',
      'Pantalla': 'LCD retroiluminada',
      'Bateria': '9V',
      'Peso': '210g'
    },
    inStock: true,
    badge: null
  }
};

// ============================================
// 2. UTILIDADES
// ============================================
const Utils = {
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

  formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  },

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
};

// ============================================
// 3. DARK MODE
// ============================================
const DarkMode = {
  toggle: null,
  isDark: false,

  init() {
    // Cargar preferencia guardada
    const savedTheme = localStorage.getItem(CONFIG.themeKey);
    if (savedTheme) {
      this.isDark = savedTheme === 'dark';
    } else {
      // Detectar preferencia del sistema
      this.isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    this.applyTheme();
    this.createToggle();
    this.bindEvents();
  },

  createToggle() {
    // Crear boton de toggle
    const toggle = document.createElement('button');
    toggle.className = 'theme-toggle';
    toggle.setAttribute('aria-label', 'Cambiar tema');
    toggle.innerHTML = `
      <svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="5"/>
        <line x1="12" y1="1" x2="12" y2="3"/>
        <line x1="12" y1="21" x2="12" y2="23"/>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
        <line x1="1" y1="12" x2="3" y2="12"/>
        <line x1="21" y1="12" x2="23" y2="12"/>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
      </svg>
      <svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
      </svg>
    `;
    document.body.appendChild(toggle);
    this.toggle = toggle;
  },

  bindEvents() {
    if (this.toggle) {
      this.toggle.addEventListener('click', () => this.toggleTheme());
    }

    // Escuchar cambios en preferencia del sistema
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem(CONFIG.themeKey)) {
        this.isDark = e.matches;
        this.applyTheme();
      }
    });
  },

  toggleTheme() {
    this.isDark = !this.isDark;
    this.applyTheme();
    localStorage.setItem(CONFIG.themeKey, this.isDark ? 'dark' : 'light');
    Toast.show(this.isDark ? 'Modo oscuro activado' : 'Modo claro activado', 'info');
  },

  applyTheme() {
    document.documentElement.setAttribute('data-theme', this.isDark ? 'dark' : 'light');
    if (this.toggle) {
      this.toggle.classList.toggle('dark', this.isDark);
    }
  }
};

// ============================================
// 4. PAGE LOADER
// ============================================
const PageLoader = {
  loader: null,

  init() {
    this.loader = document.querySelector('.page-loader');
    if (this.loader) {
      window.addEventListener('load', () => this.hide());
      setTimeout(() => this.hide(), 3000);
    }
  },

  hide() {
    if (this.loader) {
      this.loader.classList.add('hidden');
      setTimeout(() => {
        this.loader.style.display = 'none';
      }, 300);
    }
  },

  show() {
    if (this.loader) {
      this.loader.style.display = 'flex';
      this.loader.classList.remove('hidden');
    }
  }
};

// ============================================
// 5. HEADER SCROLL EFFECT
// ============================================
const HeaderScroll = {
  header: null,
  lastScroll: 0,

  init() {
    this.header = document.querySelector('.header');
    if (this.header) {
      window.addEventListener('scroll', Utils.throttle(() => this.onScroll(), 100));
    }
  },

  onScroll() {
    const currentScroll = window.pageYOffset;
    if (currentScroll > 50) {
      this.header.classList.add('scrolled');
    } else {
      this.header.classList.remove('scrolled');
    }
    this.lastScroll = currentScroll;
  }
};

// ============================================
// 6. MENU MOVIL
// ============================================
const MobileMenu = {
  menuBtn: null,
  menu: null,
  isOpen: false,

  init() {
    this.menuBtn = document.querySelector('.mobile-menu-btn');
    this.menu = document.querySelector('.mobile-menu');

    if (this.menuBtn && this.menu) {
      this.menuBtn.addEventListener('click', () => this.toggle());

      document.querySelectorAll('.mobile-menu .nav-link').forEach(link => {
        link.addEventListener('click', () => this.close());
      });

      document.addEventListener('click', (e) => {
        if (this.isOpen && !this.menu.contains(e.target) && !this.menuBtn.contains(e.target)) {
          this.close();
        }
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen) {
          this.close();
        }
      });
    }
  },

  toggle() {
    this.isOpen ? this.close() : this.open();
  },

  open() {
    this.isOpen = true;
    this.menuBtn.classList.add('active');
    this.menu.classList.add('active');
    document.body.style.overflow = 'hidden';
    this.menuBtn.setAttribute('aria-expanded', 'true');
  },

  close() {
    this.isOpen = false;
    this.menuBtn.classList.remove('active');
    this.menu.classList.remove('active');
    document.body.style.overflow = '';
    this.menuBtn.setAttribute('aria-expanded', 'false');
  }
};

// ============================================
// 7. MODAL DE PRODUCTO
// ============================================
const ProductModal = {
  modal: null,
  isOpen: false,

  init() {
    this.createModal();
    this.bindEvents();
  },

  createModal() {
    const modal = document.createElement('div');
    modal.className = 'product-modal';
    modal.innerHTML = `
      <div class="product-modal-overlay"></div>
      <div class="product-modal-content">
        <button class="product-modal-close" aria-label="Cerrar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
        <div class="product-modal-body"></div>
      </div>
    `;
    document.body.appendChild(modal);
    this.modal = modal;
  },

  bindEvents() {
    // Cerrar modal
    this.modal.querySelector('.product-modal-overlay').addEventListener('click', () => this.close());
    this.modal.querySelector('.product-modal-close').addEventListener('click', () => this.close());

    // Escuchar ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });

    // Click en productos para abrir modal
    document.addEventListener('click', (e) => {
      const card = e.target.closest('.product-card');
      const isButton = e.target.closest('.btn-add-quote') || e.target.closest('.quantity-controls');

      if (card && !isButton) {
        const sku = card.querySelector('.product-sku')?.textContent?.replace('SKU: ', '');
        if (sku) {
          this.open(sku);
        }
      }
    });
  },

  open(sku) {
    const product = PRODUCTS_DB[sku];
    if (!product) return;

    const body = this.modal.querySelector('.product-modal-body');
    const cartItem = Cart.items.find(item => item.sku === sku);
    const quantity = cartItem ? cartItem.quantity : 1;

    body.innerHTML = `
      <div class="product-modal-grid">
        <div class="product-modal-image">
          ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
          <div class="product-modal-image-main">
            <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" stroke-width="1">
              <rect x="40" y="20" width="120" height="160" rx="12" fill="var(--color-gray-100)" stroke="var(--color-gray-300)"/>
              <rect x="55" y="35" width="90" height="50" rx="6" fill="var(--color-gray-200)" stroke="var(--color-gray-400)"/>
              <circle cx="100" cy="130" r="30" fill="var(--color-gray-50)" stroke="var(--color-gray-400)"/>
              <circle cx="100" cy="130" r="5" fill="var(--color-primary)"/>
              <line x1="100" y1="130" x2="120" y2="110" stroke="var(--color-primary)" stroke-width="3"/>
            </svg>
          </div>
          <div class="product-modal-stock ${product.inStock ? 'in-stock' : 'out-stock'}">
            <span class="stock-dot"></span>
            ${product.inStock ? 'En Stock' : 'Sin Stock'}
          </div>
        </div>

        <div class="product-modal-info">
          <span class="product-category">${product.category}</span>
          <h2 class="product-modal-title">${product.title}</h2>
          <p class="product-modal-sku">SKU: ${product.sku}</p>

          <p class="product-modal-description">${product.description}</p>

          <div class="product-modal-actions">
            <div class="quantity-selector">
              <label>Cantidad:</label>
              <div class="quantity-controls">
                <button class="qty-btn" data-action="decrease">-</button>
                <input type="number" class="qty-input" value="${quantity}" min="1" max="99">
                <button class="qty-btn" data-action="increase">+</button>
              </div>
            </div>

            <button class="btn btn-primary btn-lg btn-add-modal" data-sku="${product.sku}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              ${cartItem ? 'Actualizar Cotizacion' : 'Agregar a Cotizacion'}
            </button>

            ${cartItem ? `
              <a href="cotizacion.html" class="btn btn-secondary btn-lg">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                </svg>
                Ver Cotizacion
              </a>
            ` : ''}
          </div>
        </div>
      </div>

      <div class="product-modal-tabs">
        <button class="tab-btn active" data-tab="specs">Especificaciones Tecnicas</button>
        <button class="tab-btn" data-tab="features">Caracteristicas</button>
      </div>

      <div class="product-modal-tab-content">
        <div class="tab-panel active" data-panel="specs">
          <div class="specs-grid">
            ${Object.entries(product.specs).map(([key, value]) => `
              <div class="spec-item">
                <span class="spec-label">${key}</span>
                <span class="spec-value">${value}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="tab-panel" data-panel="features">
          <ul class="features-list">
            ${product.features.map(feature => `
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                ${feature}
              </li>
            `).join('')}
          </ul>
        </div>
      </div>
    `;

    // Bind eventos del modal
    this.bindModalEvents(sku);

    this.modal.classList.add('active');
    this.isOpen = true;
    document.body.style.overflow = 'hidden';
  },

  bindModalEvents(sku) {
    const body = this.modal.querySelector('.product-modal-body');
    const qtyInput = body.querySelector('.qty-input');

    // Controles de cantidad
    body.querySelectorAll('.qty-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        let value = parseInt(qtyInput.value) || 1;
        if (action === 'increase') value++;
        if (action === 'decrease' && value > 1) value--;
        qtyInput.value = value;
      });
    });

    // Agregar a cotizacion
    body.querySelector('.btn-add-modal').addEventListener('click', () => {
      const quantity = parseInt(qtyInput.value) || 1;
      const product = PRODUCTS_DB[sku];

      Cart.addItemWithQuantity({
        id: Utils.generateId(),
        sku: product.sku,
        title: product.title,
        category: product.category,
        quantity: quantity
      });

      this.close();
    });

    // Tabs
    body.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        body.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        body.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        body.querySelector(`[data-panel="${btn.dataset.tab}"]`).classList.add('active');
      });
    });
  },

  close() {
    this.modal.classList.remove('active');
    this.isOpen = false;
    document.body.style.overflow = '';
  }
};

// ============================================
// 8. CARRITO DE COTIZACION
// ============================================
const Cart = {
  items: [],
  countElement: null,

  init() {
    this.countElement = document.querySelector('.cart-count');
    this.loadFromStorage();
    this.updateUI();
    this.bindEvents();
  },

  loadFromStorage() {
    try {
      const stored = localStorage.getItem(CONFIG.storageKey);
      this.items = stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Error loading cart:', e);
      this.items = [];
    }
  },

  saveToStorage() {
    try {
      localStorage.setItem(CONFIG.storageKey, JSON.stringify(this.items));
    } catch (e) {
      console.error('Error saving cart:', e);
    }
  },

  bindEvents() {
    document.querySelectorAll('.btn-add-quote').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const card = e.target.closest('.product-card');
        if (card) {
          const product = this.getProductFromCard(card);
          this.addItem(product);
          this.animateButton(btn);
        }
      });
    });
  },

  getProductFromCard(card) {
    return {
      id: card.dataset.productId || Utils.generateId(),
      sku: card.querySelector('.product-sku')?.textContent?.replace('SKU: ', '') || '',
      title: card.querySelector('.product-title')?.textContent || '',
      category: card.querySelector('.product-category')?.textContent || '',
      quantity: 1
    };
  },

  addItem(product) {
    const existingIndex = this.items.findIndex(item => item.sku === product.sku);

    if (existingIndex > -1) {
      this.items[existingIndex].quantity += 1;
    } else {
      this.items.push(product);
    }

    this.saveToStorage();
    this.updateUI();
    Toast.show('Producto agregado a la cotizacion', 'success');
  },

  addItemWithQuantity(product) {
    const existingIndex = this.items.findIndex(item => item.sku === product.sku);

    if (existingIndex > -1) {
      this.items[existingIndex].quantity = product.quantity;
    } else {
      this.items.push(product);
    }

    this.saveToStorage();
    this.updateUI();
    Toast.show(`${product.quantity} unidad(es) agregada(s) a la cotizacion`, 'success');
  },

  removeItem(sku) {
    this.items = this.items.filter(item => item.sku !== sku);
    this.saveToStorage();
    this.updateUI();
    this.renderQuoteItems();
    Toast.show('Producto eliminado', 'info');
  },

  updateQuantity(sku, delta) {
    const item = this.items.find(item => item.sku === sku);
    if (item) {
      item.quantity = Math.max(1, item.quantity + delta);
      this.saveToStorage();
      this.updateUI();
      this.renderQuoteItems();
    }
  },

  setQuantity(sku, quantity) {
    const item = this.items.find(item => item.sku === sku);
    if (item) {
      item.quantity = Math.max(1, parseInt(quantity) || 1);
      this.saveToStorage();
      this.updateUI();
    }
  },

  clearAll() {
    this.items = [];
    this.saveToStorage();
    this.updateUI();
    this.renderQuoteItems();
    Toast.show('Cotizacion limpiada', 'info');
  },

  getTotal() {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  },

  updateUI() {
    // Actualizar todos los contadores
    document.querySelectorAll('.cart-count').forEach(el => {
      const total = this.getTotal();
      el.textContent = total;
      el.classList.remove('bump');
      void el.offsetWidth;
      el.classList.add('bump');
      el.style.display = total > 0 ? 'flex' : 'none';
    });

    // Actualizar botones de productos
    document.querySelectorAll('.product-card').forEach(card => {
      const sku = card.querySelector('.product-sku')?.textContent?.replace('SKU: ', '');
      const btn = card.querySelector('.btn-add-quote');
      const cartItem = this.items.find(item => item.sku === sku);

      if (btn) {
        btn.classList.toggle('added', !!cartItem);
        if (cartItem) {
          btn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>
            Agregado (${cartItem.quantity})
          `;
        } else {
          btn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
            Cotizar
          `;
        }
      }
    });
  },

  animateButton(btn) {
    btn.style.transform = 'scale(0.95)';
    setTimeout(() => {
      btn.style.transform = '';
    }, 150);
  },

  renderQuoteItems() {
    const container = document.querySelector('#quote-items');
    const emptyState = document.querySelector('#empty-cart');
    const formContainer = document.querySelector('#quote-form');

    if (!container) return;

    if (this.items.length === 0) {
      container.innerHTML = '';
      if (emptyState) emptyState.style.display = 'block';
      if (formContainer) formContainer.style.display = 'none';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';
    if (formContainer) formContainer.style.display = 'block';

    container.innerHTML = `
      <div class="quote-items-header">
        <h3>Productos seleccionados (${this.items.length})</h3>
        <button class="clear-all-btn" type="button">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
          </svg>
          Limpiar todo
        </button>
      </div>
      <div class="quote-items-list">
        ${this.items.map(item => {
          const product = PRODUCTS_DB[item.sku] || {};
          return `
            <div class="quote-item" data-sku="${item.sku}">
              <div class="quote-item-image">
                <svg viewBox="0 0 60 60" fill="none" stroke="currentColor" stroke-width="1">
                  <rect x="15" y="8" width="30" height="44" rx="4" fill="var(--color-gray-100)" stroke="var(--color-gray-300)"/>
                  <rect x="20" y="14" width="20" height="12" rx="2" fill="var(--color-gray-200)"/>
                  <circle cx="30" cy="40" r="8" fill="var(--color-gray-50)" stroke="var(--color-gray-300)"/>
                </svg>
              </div>
              <div class="quote-item-info">
                <div class="quote-item-title">${item.title}</div>
                <div class="quote-item-meta">
                  <span class="quote-item-sku">SKU: ${item.sku}</span>
                  <span class="quote-item-category">${item.category}</span>
                </div>
              </div>
              <div class="quote-item-quantity">
                <button class="qty-btn qty-decrease" data-sku="${item.sku}" type="button">-</button>
                <input type="number" class="qty-input" value="${item.quantity}" min="1" max="99" data-sku="${item.sku}">
                <button class="qty-btn qty-increase" data-sku="${item.sku}" type="button">+</button>
              </div>
              <button class="remove-item-btn" data-sku="${item.sku}" type="button" aria-label="Eliminar producto">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
          `;
        }).join('')}
      </div>
      <div class="quote-items-footer">
        <span>Total de productos: <strong>${this.getTotal()} unidades</strong></span>
      </div>
    `;

    // Bind eventos
    container.querySelector('.clear-all-btn')?.addEventListener('click', () => this.clearAll());

    container.querySelectorAll('.qty-decrease').forEach(btn => {
      btn.addEventListener('click', () => this.updateQuantity(btn.dataset.sku, -1));
    });

    container.querySelectorAll('.qty-increase').forEach(btn => {
      btn.addEventListener('click', () => this.updateQuantity(btn.dataset.sku, 1));
    });

    container.querySelectorAll('.qty-input').forEach(input => {
      input.addEventListener('change', (e) => this.setQuantity(input.dataset.sku, e.target.value));
    });

    container.querySelectorAll('.remove-item-btn').forEach(btn => {
      btn.addEventListener('click', () => this.removeItem(btn.dataset.sku));
    });
  }
};

// ============================================
// 9. FILTRO DE PRODUCTOS
// ============================================
const ProductFilter = {
  buttons: null,
  products: null,
  currentFilter: 'todos',

  init() {
    this.buttons = document.querySelectorAll('.filter-btn');
    this.products = document.querySelectorAll('.product-card');

    if (this.buttons.length === 0) return;

    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('cat');
    if (categoryParam) {
      this.currentFilter = categoryParam;
    }

    this.bindEvents();
    this.applyFilter(this.currentFilter);
  },

  bindEvents() {
    this.buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const filter = btn.dataset.filter;
        this.applyFilter(filter);
        this.updateURL(filter);
      });
    });
  },

  applyFilter(filter) {
    this.currentFilter = filter;

    this.buttons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.filter === filter);
    });

    this.products.forEach(product => {
      const category = product.dataset.category;
      const shouldShow = filter === 'todos' || category === filter;

      if (shouldShow) {
        product.style.display = '';
        setTimeout(() => {
          product.style.opacity = '1';
          product.style.transform = '';
        }, 50);
      } else {
        product.style.opacity = '0';
        product.style.transform = 'scale(0.8)';
        setTimeout(() => {
          product.style.display = 'none';
        }, 300);
      }
    });
  },

  updateURL(filter) {
    const url = new URL(window.location);
    if (filter === 'todos') {
      url.searchParams.delete('cat');
    } else {
      url.searchParams.set('cat', filter);
    }
    window.history.replaceState({}, '', url);
  }
};

// ============================================
// 10. VALIDACION DE FORMULARIOS
// ============================================
const FormValidator = {
  form: null,
  fields: {},

  init() {
    this.form = document.querySelector('.quote-form');
    if (!this.form) return;

    this.fields = {
      nombre: {
        element: this.form.querySelector('#nombre'),
        validate: (value) => value.trim().length >= 2,
        message: 'Ingresa tu nombre completo'
      },
      email: {
        element: this.form.querySelector('#email'),
        validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        message: 'Ingresa un email valido'
      },
      telefono: {
        element: this.form.querySelector('#telefono'),
        validate: (value) => /^[\d\s+()-]{8,}$/.test(value),
        message: 'Ingresa un telefono valido'
      }
    };

    this.bindEvents();
  },

  bindEvents() {
    Object.values(this.fields).forEach(field => {
      if (field.element) {
        field.element.addEventListener('blur', () => this.validateField(field));
        field.element.addEventListener('input', () => {
          if (field.element.classList.contains('error')) {
            this.validateField(field);
          }
        });
      }
    });

    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
  },

  validateField(field) {
    const value = field.element.value;
    const isValid = field.validate(value);
    const group = field.element.closest('.form-group');

    field.element.classList.toggle('error', !isValid);
    field.element.classList.toggle('success', isValid && value.length > 0);

    if (group) {
      group.classList.toggle('has-error', !isValid);
    }

    return isValid;
  },

  validateAll() {
    let isValid = true;
    Object.values(this.fields).forEach(field => {
      if (field.element && !this.validateField(field)) {
        isValid = false;
      }
    });
    return isValid;
  },

  handleSubmit(e) {
    e.preventDefault();

    if (!this.validateAll()) {
      Toast.show('Por favor completa los campos requeridos', 'error');
      return;
    }

    if (Cart.items.length === 0) {
      Toast.show('Agrega productos a tu cotizacion', 'error');
      return;
    }

    const formData = new FormData(this.form);
    const data = {
      ...Object.fromEntries(formData),
      productos: Cart.items,
      fecha: new Date().toISOString()
    };

    this.showLoading(true);

    setTimeout(() => {
      this.showLoading(false);
      console.log('Cotizacion enviada:', data);
      Toast.show('Cotizacion enviada con exito! Te contactaremos pronto.', 'success');

      this.form.reset();
      Cart.clearAll();
    }, 2000);
  },

  showLoading(loading) {
    const submitBtn = this.form.querySelector('.submit-quote-btn');
    if (submitBtn) {
      submitBtn.disabled = loading;
      submitBtn.innerHTML = loading
        ? '<span class="loader-spinner" style="width:20px;height:20px;border-width:2px;"></span> Enviando...'
        : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
          Enviar Solicitud de Cotizacion`;
    }
  }
};

// ============================================
// 11. ANIMACIONES DE SCROLL
// ============================================
const ScrollAnimations = {
  elements: null,
  observer: null,

  init() {
    this.elements = document.querySelectorAll('[data-aos]');
    if (this.elements.length === 0) return;

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('aos-animate');
          }
        });
      },
      {
        threshold: CONFIG.animationThreshold,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    this.elements.forEach(el => this.observer.observe(el));
  }
};

// ============================================
// 12. CONTADOR ANIMADO
// ============================================
const AnimatedCounter = {
  counters: null,
  observer: null,

  init() {
    this.counters = document.querySelectorAll('[data-counter]');
    if (this.counters.length === 0) return;

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !entry.target.dataset.counted) {
            this.animateCounter(entry.target);
            entry.target.dataset.counted = 'true';
          }
        });
      },
      { threshold: 0.5 }
    );

    this.counters.forEach(counter => this.observer.observe(counter));
  },

  animateCounter(element) {
    const target = parseInt(element.dataset.counter, 10);
    const suffix = element.dataset.suffix || '';
    const duration = CONFIG.counterDuration;
    const startTime = performance.now();

    const updateCounter = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(target * easeOut);

      element.textContent = Utils.formatNumber(current) + suffix;

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      }
    };

    requestAnimationFrame(updateCounter);
  }
};

// ============================================
// 13. TOAST NOTIFICATIONS
// ============================================
const Toast = {
  container: null,

  init() {
    this.container = document.querySelector('.toast-container');
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'toast-container';
      document.body.appendChild(this.container);
    }
  },

  show(message, type = 'info') {
    if (!this.container) this.init();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const icons = {
      success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>',
      error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>',
      info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>'
    };

    toast.innerHTML = `
      <span class="toast-icon">${icons[type] || icons.info}</span>
      <span class="toast-message">${message}</span>
      <button class="toast-close" aria-label="Cerrar">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>
    `;

    this.container.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    const autoClose = setTimeout(() => this.close(toast), CONFIG.toastDuration);

    toast.querySelector('.toast-close').addEventListener('click', () => {
      clearTimeout(autoClose);
      this.close(toast);
    });
  },

  close(toast) {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }
};

// ============================================
// 14. SMOOTH SCROLL & NAV
// ============================================
const SmoothScroll = {
  init() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const targetId = anchor.getAttribute('href');
        if (targetId === '#') return;

        const target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
          const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;

          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      });
    });
  }
};

const ActiveNavLink = {
  init() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    document.querySelectorAll('.nav-link').forEach(link => {
      const href = link.getAttribute('href');
      if (href === currentPage || (currentPage === '' && href === 'index.html')) {
        link.classList.add('active');
      }
    });
  }
};

// ============================================
// 15. LAZY LOADING
// ============================================
const LazyImages = {
  init() {
    if ('loading' in HTMLImageElement.prototype) {
      document.querySelectorAll('img[data-src]').forEach(img => {
        img.src = img.dataset.src;
        img.loading = 'lazy';
      });
    } else {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            observer.unobserve(img);
          }
        });
      });

      document.querySelectorAll('img[data-src]').forEach(img => {
        observer.observe(img);
      });
    }
  }
};

// ============================================
// 16. INICIALIZACION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  // Core
  DarkMode.init();
  PageLoader.init();
  HeaderScroll.init();
  MobileMenu.init();
  ActiveNavLink.init();
  SmoothScroll.init();
  Toast.init();

  // Features
  Cart.init();
  ProductFilter.init();
  FormValidator.init();
  ProductModal.init();

  // Animations
  ScrollAnimations.init();
  AnimatedCounter.init();
  LazyImages.init();

  // Renderizar items del carrito si estamos en la pagina de cotizacion
  if (window.location.pathname.includes('cotizacion')) {
    Cart.renderQuoteItems();
  }

  console.log('ElectroMedicion initialized successfully!');
});

// ============================================
// 17. EXPORTS
// ============================================
window.ElectroMedicion = {
  Cart,
  Toast,
  Utils,
  DarkMode,
  ProductModal
};
