/**
 * Cross-category product recommendations.
 * Maps each category to complementary categories for "Productos Complementarios" section.
 */
export const complementaryCategories: Record<string, string[]> = {
  'electrodos-electromagneticos': ['soldadura-exotermica', 'aditivos', 'accesorios'],
  'electrodos-grafito': ['barras-quimicas', 'aditivos'],
  'barras-quimicas': ['electrodos-electromagneticos', 'aditivos'],
  'aditivos': ['electrodos-electromagneticos', 'barras-quimicas'],
  'soldadura-exotermica': ['moldes-grafito', 'accesorios'],
  'moldes-grafito': ['soldadura-exotermica', 'accesorios'],
  'accesorios': ['soldadura-exotermica', 'electrodos-electromagneticos'],
  'pararrayos': ['electrodos-electromagneticos', 'accesorios'],
  'servicios': ['electrodos-electromagneticos', 'aditivos'],
};
