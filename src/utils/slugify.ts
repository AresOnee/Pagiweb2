/**
 * Converts a product title to a URL-friendly slug.
 * Handles Spanish accents, special characters, and common symbols.
 *
 * Examples:
 *   "Electrodo Electromagnético Hunter Energy HE-45" → "electrodo-electromagnetico-hunter-energy-he-45"
 *   "Moldes de Grafito B — Bus de Cobre"             → "moldes-de-grafito-b-bus-de-cobre"
 *   "Barra Toma Tierra Copperweld 1/2""              → "barra-toma-tierra-copperweld-1-2"
 */
export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/½/g, '1-2')
    .replace(/¼/g, '1-4')
    .replace(/¾/g, '3-4')
    .replace(/°/g, '')
    .replace(/["'""'']/g, '')
    .replace(/[—–]/g, '-')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '');
}
