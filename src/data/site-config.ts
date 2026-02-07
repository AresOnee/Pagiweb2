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
  /**
   * Cloudflare Turnstile configuration for anti-spam protection.
   * Get your site key from: https://dash.cloudflare.com/turnstile
   *
   * Leave as 'YOUR_TURNSTILE_SITE_KEY' for development (auto-verifies).
   * Replace with actual key for production.
   */
  turnstile: {
    siteKey: 'YOUR_TURNSTILE_SITE_KEY',
  },
  /**
   * Web3Forms configuration for sending quote emails.
   * Get your access key from: https://web3forms.com (free: 250 emails/month)
   *
   * Leave as 'YOUR_WEB3FORMS_ACCESS_KEY' for development (simulates sending).
   * Replace with actual key for production to send emails to ventas@gelchile.cl
   */
  web3forms: {
    accessKey: 'YOUR_WEB3FORMS_ACCESS_KEY',
    endpoint: 'https://api.web3forms.com/submit',
  },
} as const;
