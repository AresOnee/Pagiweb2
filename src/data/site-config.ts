/**
 * Configuración centralizada del sitio Gel Chile.
 * Reemplaza el CONFIG de js/config.js para el stack Astro.
 */
export const siteConfig = {
  name: 'Gel Chile',
  description: 'Sistemas de Puesta a Tierra y Protección Eléctrica',
  url: 'https://gelchile.cl',
  contact: {
    email: 'ventas@gelchile.cl',
    emailContacto: 'kvasquezb@gelchile.cl',
    phones: ['+56 9 9949 6909', '+56 9 9825 0271', '+56 9 5098 7979'],
    office: 'Los Diamantes N°0360, Maipú, RM',
    warehouse: 'Camino Lo Ermita Parcela-21, Calera de Tango',
  },
  storage: {
    cartKey: 'gelchile_cart',
    themeKey: 'gelchile_theme',
  },
  ui: {
    toastDuration: 3000,
    animationThreshold: 0.1,
  },
} as const;
