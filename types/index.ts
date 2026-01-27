/**
 * ElectroMedicion - Tipos TypeScript
 * Definiciones de tipos para el proyecto.
 * Usables en Astro con TypeScript habilitado.
 */

/**
 * Producto del catálogo
 */
export interface Product {
  /** Código único del producto (ej: "MUL-001") */
  sku: string;

  /** Nombre del producto */
  title: string;

  /** Categoría del producto */
  category: 'Multimetros' | 'Pinzas' | 'Telurometros' | 'Megohmetros' | 'Analizadores' | 'Detectores';

  /** Slug de la categoría para URLs */
  categorySlug: string;

  /** Descripción corta del producto */
  description: string;

  /** Lista de características/beneficios */
  features: string[];

  /** Especificaciones técnicas (clave: valor) */
  specs: Record<string, string>;

  /** Disponibilidad en stock */
  inStock: boolean;

  /** Badge opcional (ej: "Popular", "Nuevo", "Pro") */
  badge: string | null;
}

/**
 * Categoría de productos
 */
export interface Category {
  /** ID único de la categoría (slug) */
  id: string;

  /** Nombre para mostrar */
  name: string;

  /** Descripción breve */
  description: string;

  /** Cantidad de productos en esta categoría */
  count: number;
}

/**
 * Item en el carrito de cotización
 */
export interface CartItem {
  /** SKU del producto */
  sku: string;

  /** Nombre del producto (para mostrar sin buscar) */
  title: string;

  /** Categoría del producto */
  category: string;

  /** Cantidad solicitada */
  quantity: number;
}

/**
 * Testimonio de cliente
 */
export interface Testimonial {
  /** Texto del testimonio */
  content: string;

  /** Nombre del autor */
  author: string;

  /** Cargo/rol del autor */
  role: string;

  /** Empresa del autor */
  company: string;

  /** Iniciales para el avatar */
  initials: string;

  /** Calificación (1-5 estrellas) */
  rating: number;
}

/**
 * Item de breadcrumb
 */
export interface BreadcrumbItem {
  /** Texto a mostrar */
  label: string;

  /** URL del enlace (opcional, si no hay es el activo) */
  href?: string;

  /** Si es el item activo/actual */
  active?: boolean;
}

/**
 * Datos del formulario de cotización
 */
export interface QuoteFormData {
  /** Nombre completo */
  name: string;

  /** Correo electrónico */
  email: string;

  /** Teléfono de contacto */
  phone: string;

  /** Nombre de la empresa */
  company: string;

  /** RUT de la empresa (opcional) */
  rut?: string;

  /** Mensaje adicional */
  message?: string;

  /** Items del carrito */
  items: CartItem[];
}

/**
 * Configuración del sitio
 */
export interface SiteConfig {
  /** Nombre del sitio */
  name: string;

  /** Descripción para SEO */
  description: string;

  /** URL base del sitio */
  url: string;

  /** Información de contacto */
  contact: {
    email: string;
    phone: string;
    address: string;
  };

  /** Redes sociales */
  social: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    whatsapp?: string;
  };
}

/**
 * Props comunes para layouts
 */
export interface LayoutProps {
  /** Título de la página */
  title: string;

  /** Descripción para SEO */
  description?: string;

  /** Página activa para navegación */
  activePage?: 'inicio' | 'productos' | 'cotizacion' | 'nosotros';

  /** Si mostrar breadcrumb */
  showBreadcrumb?: boolean;

  /** Items del breadcrumb */
  breadcrumb?: BreadcrumbItem[];
}
