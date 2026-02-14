/**
 * Category-specific SVG placeholders for products without images.
 * Returns an SVG string appropriate for each product category.
 */

const placeholders: Record<string, string> = {
  'electrodos-electromagneticos': `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="20" y="10" width="80" height="100" rx="8" fill="#f1f5f9" stroke="#cbd5e1"/>
    <rect x="55" y="18" width="10" height="70" rx="3" fill="#e2e8f0" stroke="#94a3b8"/>
    <circle cx="60" cy="25" r="6" fill="#dbeafe" stroke="#60a5fa"/>
    <path d="M45 95h30" stroke="#94a3b8" stroke-width="2" stroke-linecap="round"/>
    <path d="M50 100h20" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round"/>
  </svg>`,
  'electrodos-grafito': `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="20" y="10" width="80" height="100" rx="8" fill="#f1f5f9" stroke="#cbd5e1"/>
    <rect x="52" y="20" width="16" height="65" rx="4" fill="#374151" stroke="#6b7280"/>
    <circle cx="60" cy="28" r="5" fill="#4b5563" stroke="#9ca3af"/>
    <path d="M45 92h30" stroke="#94a3b8" stroke-width="2" stroke-linecap="round"/>
    <path d="M50 98h20" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round"/>
  </svg>`,
  'barras-quimicas': `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="20" y="10" width="80" height="100" rx="8" fill="#f1f5f9" stroke="#cbd5e1"/>
    <rect x="40" y="25" width="40" height="12" rx="6" fill="#e2e8f0" stroke="#94a3b8"/>
    <rect x="40" y="45" width="40" height="12" rx="6" fill="#dbeafe" stroke="#60a5fa"/>
    <rect x="40" y="65" width="40" height="12" rx="6" fill="#e2e8f0" stroke="#94a3b8"/>
    <path d="M45 90h30" stroke="#94a3b8" stroke-width="2" stroke-linecap="round"/>
  </svg>`,
  'aditivos': `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="20" y="10" width="80" height="100" rx="8" fill="#f1f5f9" stroke="#cbd5e1"/>
    <path d="M50 30h20v10l10 25v20H40V65l10-25V30z" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1.5"/>
    <ellipse cx="60" cy="80" rx="15" ry="5" fill="#dbeafe" stroke="#60a5fa"/>
    <path d="M45 95h30" stroke="#94a3b8" stroke-width="2" stroke-linecap="round"/>
  </svg>`,
  'pararrayos': `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="20" y="10" width="80" height="100" rx="8" fill="#f1f5f9" stroke="#cbd5e1"/>
    <path d="M65 25L50 58h12L48 95l30-38H64L78 25H65z" fill="#fbbf24" stroke="#f59e0b" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M45 100h30" stroke="#94a3b8" stroke-width="2" stroke-linecap="round"/>
  </svg>`,
  'soldadura-exotermica': `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="20" y="10" width="80" height="100" rx="8" fill="#f1f5f9" stroke="#cbd5e1"/>
    <circle cx="60" cy="55" r="18" fill="#fef3c7" stroke="#f59e0b" stroke-width="1.5"/>
    <path d="M55 45l5 10 5-10" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M50 55l10 8 10-8" stroke="#f97316" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M45 85h30" stroke="#94a3b8" stroke-width="2" stroke-linecap="round"/>
  </svg>`,
  'moldes-grafito': `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="20" y="10" width="80" height="100" rx="8" fill="#f1f5f9" stroke="#cbd5e1"/>
    <rect x="35" y="30" width="50" height="45" rx="4" fill="#374151" stroke="#6b7280" stroke-width="1.5"/>
    <rect x="45" y="40" width="30" height="25" rx="2" fill="#1f2937" stroke="#4b5563"/>
    <path d="M55 48v10M65 48v10" stroke="#9ca3af" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M42 88h36" stroke="#94a3b8" stroke-width="2" stroke-linecap="round"/>
  </svg>`,
  'accesorios': `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="20" y="10" width="80" height="100" rx="8" fill="#f1f5f9" stroke="#cbd5e1"/>
    <circle cx="60" cy="52" r="20" fill="none" stroke="#94a3b8" stroke-width="2"/>
    <circle cx="60" cy="52" r="8" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1.5"/>
    <path d="M60 32v-4M60 76v-4M40 52h-4M84 52h-4" stroke="#94a3b8" stroke-width="2" stroke-linecap="round"/>
    <path d="M74 38l3-3M43 69l3-3M74 66l3 3M43 35l3 3" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M45 88h30" stroke="#94a3b8" stroke-width="2" stroke-linecap="round"/>
  </svg>`,
  'servicios': `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="20" y="10" width="80" height="100" rx="8" fill="#f1f5f9" stroke="#cbd5e1"/>
    <path d="M68 35l-5 5-3-3-8 8 6 6 8-8-3-3 5-5h8v-8h-8z" fill="#dbeafe" stroke="#60a5fa" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M45 72c0-4 5-7 15-7s15 3 15 7v5H45v-5z" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1.5"/>
    <circle cx="60" cy="58" r="7" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1.5"/>
    <path d="M42 90h36" stroke="#94a3b8" stroke-width="2" stroke-linecap="round"/>
  </svg>`,
};

const defaultPlaceholder = `<svg viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="1" aria-hidden="true">
  <rect x="30" y="20" width="60" height="80" rx="8" fill="#f1f5f9" stroke="#cbd5e1"/>
  <circle cx="60" cy="50" r="15" fill="#e2e8f0" stroke="#94a3b8"/>
  <path d="M50 75h20" stroke="#94a3b8" stroke-width="2" stroke-linecap="round"/>
</svg>`;

export function getCategoryPlaceholderSvg(categorySlug: string): string {
  return placeholders[categorySlug] || defaultPlaceholder;
}
