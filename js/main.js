/**
 * ElectroMedición - JavaScript Principal
 * Funcionalidades: Carrito, Filtros, Menú Móvil, Animaciones, Validación
 */

// ============================================
// 1. CONFIGURACIÓN GLOBAL
// ============================================
const CONFIG = {
  storageKey: 'electromedicion_cart',
  animationThreshold: 0.1,
  toastDuration: 3000,
  counterDuration: 2000
};

// ============================================
// 2. UTILIDADES
// ============================================
const Utils = {
  // Debounce para optimizar eventos
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

  // Throttle para scroll
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

  // Formatear número con separadores
  formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  },

  // Generar ID único
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
};

// ============================================
// 3. PAGE LOADER
// ============================================
const PageLoader = {
  loader: null,

  init() {
    this.loader = document.querySelector('.page-loader');
    if (this.loader) {
      window.addEventListener('load', () => this.hide());
      // Fallback: ocultar después de 3 segundos
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
// 4. HEADER SCROLL EFFECT
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
// 5. MENÚ MÓVIL
// ============================================
const MobileMenu = {
  menuBtn: null,
  menu: null,
  isOpen: false,

  init() {
    this.menuBtn = document.querySelector('.mobile-menu-btn');
    this.menu = document.querySelector('.mobile-menu');

    if (this.menuBtn) {
      this.menuBtn.addEventListener('click', () => this.toggle());

      // Cerrar al hacer click en un link
      document.querySelectorAll('.mobile-menu .nav-link').forEach(link => {
        link.addEventListener('click', () => this.close());
      });

      // Cerrar al hacer click fuera
      document.addEventListener('click', (e) => {
        if (this.isOpen && !this.menu.contains(e.target) && !this.menuBtn.contains(e.target)) {
          this.close();
        }
      });

      // Cerrar con ESC
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
// 6. CARRITO DE COTIZACIÓN
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
    // Botones de agregar a cotización
    document.querySelectorAll('.btn-add-quote').forEach(btn => {
      btn.addEventListener('click', (e) => {
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
    Toast.show('Producto agregado a la cotización', 'success');
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

  clearAll() {
    this.items = [];
    this.saveToStorage();
    this.updateUI();
    this.renderQuoteItems();
    Toast.show('Cotización limpiada', 'info');
  },

  getTotal() {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  },

  updateUI() {
    if (this.countElement) {
      const total = this.getTotal();
      this.countElement.textContent = total;

      // Animación de bump
      this.countElement.classList.remove('bump');
      void this.countElement.offsetWidth; // Trigger reflow
      this.countElement.classList.add('bump');

      // Mostrar/ocultar contador
      this.countElement.style.display = total > 0 ? 'flex' : 'none';
    }

    // Actualizar botones de productos
    document.querySelectorAll('.product-card').forEach(card => {
      const sku = card.querySelector('.product-sku')?.textContent?.replace('SKU: ', '');
      const btn = card.querySelector('.btn-add-quote');
      const inCart = this.items.some(item => item.sku === sku);

      if (btn) {
        btn.classList.toggle('added', inCart);
        btn.innerHTML = inCart
          ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg> Agregado'
          : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg> Cotizar';
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
    const container = document.querySelector('.quote-items-list');
    const emptyState = document.querySelector('.quote-empty');
    const clearBtn = document.querySelector('.clear-all-btn');

    if (!container) return;

    if (this.items.length === 0) {
      container.innerHTML = '';
      if (emptyState) emptyState.style.display = 'block';
      if (clearBtn) clearBtn.style.display = 'none';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';
    if (clearBtn) clearBtn.style.display = 'block';

    container.innerHTML = this.items.map(item => `
      <div class="quote-item" data-sku="${item.sku}">
        <div class="quote-item-image">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <path d="M9 12h6M12 9v6"/>
          </svg>
        </div>
        <div class="quote-item-info">
          <div class="quote-item-title">${item.title}</div>
          <div class="quote-item-sku">SKU: ${item.sku}</div>
        </div>
        <div class="quote-item-quantity">
          <button class="qty-btn qty-decrease" data-sku="${item.sku}">−</button>
          <span class="qty-value">${item.quantity}</span>
          <button class="qty-btn qty-increase" data-sku="${item.sku}">+</button>
        </div>
        <button class="remove-item-btn" data-sku="${item.sku}" aria-label="Eliminar producto">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>
    `).join('');

    // Bind events for quantity buttons
    container.querySelectorAll('.qty-decrease').forEach(btn => {
      btn.addEventListener('click', () => this.updateQuantity(btn.dataset.sku, -1));
    });

    container.querySelectorAll('.qty-increase').forEach(btn => {
      btn.addEventListener('click', () => this.updateQuantity(btn.dataset.sku, 1));
    });

    container.querySelectorAll('.remove-item-btn').forEach(btn => {
      btn.addEventListener('click', () => this.removeItem(btn.dataset.sku));
    });
  }
};

// ============================================
// 7. FILTRO DE PRODUCTOS
// ============================================
const ProductFilter = {
  buttons: null,
  products: null,
  currentFilter: 'todos',

  init() {
    this.buttons = document.querySelectorAll('.filter-btn');
    this.products = document.querySelectorAll('.product-card');

    if (this.buttons.length === 0) return;

    // Leer filtro de URL
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

    // Actualizar botones activos
    this.buttons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.filter === filter);
    });

    // Filtrar productos con animación
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
// 8. VALIDACIÓN DE FORMULARIOS
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
        message: 'Ingresa un email válido'
      },
      telefono: {
        element: this.form.querySelector('#telefono'),
        validate: (value) => /^[\d\s+()-]{8,}$/.test(value),
        message: 'Ingresa un teléfono válido'
      }
    };

    this.bindEvents();
  },

  bindEvents() {
    // Validación en tiempo real
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

    // Submit
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
      const errorElement = group.querySelector('.form-error');
      if (errorElement) {
        errorElement.textContent = field.message;
      }
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
      Toast.show('Agrega productos a tu cotización', 'error');
      return;
    }

    // Recopilar datos
    const formData = new FormData(this.form);
    const data = {
      ...Object.fromEntries(formData),
      productos: Cart.items,
      fecha: new Date().toISOString()
    };

    // Simular envío
    this.showLoading(true);

    setTimeout(() => {
      this.showLoading(false);
      console.log('Cotización enviada:', data);
      Toast.show('¡Cotización enviada con éxito! Te contactaremos pronto.', 'success');

      // Limpiar
      this.form.reset();
      Cart.clearAll();
    }, 2000);
  },

  showLoading(loading) {
    const submitBtn = this.form.querySelector('.form-submit');
    if (submitBtn) {
      submitBtn.disabled = loading;
      submitBtn.innerHTML = loading
        ? '<span class="loader-spinner" style="width:20px;height:20px;border-width:2px;"></span> Enviando...'
        : 'Enviar Cotización';
    }
  }
};

// ============================================
// 9. ANIMACIONES DE SCROLL (AOS-like)
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
            // Opcional: dejar de observar después de animar
            // this.observer.unobserve(entry.target);
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
// 10. CONTADOR ANIMADO
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

      // Easing function (ease-out)
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
// 11. TOAST NOTIFICATIONS
// ============================================
const Toast = {
  container: null,

  init() {
    // Crear contenedor si no existe
    this.container = document.querySelector('.toast-container');
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'toast-container';
      document.body.appendChild(this.container);
    }
  },

  show(message, type = 'info') {
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

    // Trigger animation
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    // Auto close
    const autoClose = setTimeout(() => this.close(toast), CONFIG.toastDuration);

    // Manual close
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
// 12. SMOOTH SCROLL
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

// ============================================
// 13. ACTIVE NAV LINK
// ============================================
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
// 14. LAZY LOADING IMAGES
// ============================================
const LazyImages = {
  init() {
    if ('loading' in HTMLImageElement.prototype) {
      // Browser supports native lazy loading
      document.querySelectorAll('img[data-src]').forEach(img => {
        img.src = img.dataset.src;
        img.loading = 'lazy';
      });
    } else {
      // Fallback with Intersection Observer
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
// 15. INICIALIZACIÓN
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  // Core
  PageLoader.init();
  HeaderScroll.init();
  MobileMenu.init();
  ActiveNavLink.init();
  SmoothScroll.init();

  // Features
  Cart.init();
  ProductFilter.init();
  FormValidator.init();
  Toast.init();

  // Animations
  ScrollAnimations.init();
  AnimatedCounter.init();
  LazyImages.init();

  // Renderizar items del carrito si estamos en la página de cotización
  if (window.location.pathname.includes('cotizacion')) {
    Cart.renderQuoteItems();

    // Bind clear all button
    const clearBtn = document.querySelector('.clear-all-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => Cart.clearAll());
    }
  }

  console.log('🔌 ElectroMedición initialized successfully!');
});

// ============================================
// 16. EXPORTS (para uso modular si es necesario)
// ============================================
window.ElectroMedicion = {
  Cart,
  Toast,
  Utils
};
