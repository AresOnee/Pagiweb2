#!/usr/bin/env node
/**
 * Copy extracted source images to public/assets/img/products/ with correct names.
 * These will then be re-optimized by optimize-images.mjs at quality 100.
 *
 * Usage: node scripts/copy-mapped-images.mjs
 */
import { copyFile, stat, mkdir } from 'node:fs/promises';
import { join, extname } from 'node:path';

const ROOT = process.cwd();
const STAGING = join(ROOT, '_image-staging');
const FOTOS = join(ROOT, 'Productos', 'Fotos GelChile');
const PRODUCTS_DIR = join(ROOT, 'public', 'assets', 'img', 'products');

/**
 * Mapping: [baseDir, source path relative to baseDir, target filename in products dir]
 */
const MAPPINGS = [
  // === Electrode Products (from DOCX image1=product photo, image2=detail) ===
  // HE-45 (ELE-001)
  [STAGING, 'docx/ELECTRODO ELECTROMAGNETICO HE 45  HE/image1.png', 'electrode-he-45-product.png'],
  [STAGING, 'docx/ELECTRODO ELECTROMAGNETICO HE 45  HE/image2.png', 'electrode-he-45-detail.png'],
  // HE-70 (ELE-002)
  [STAGING, 'docx/ELECTRODO ELECTROMAGNETICO HE 70  HE/image1.png', 'electrode-he-70-product.png'],
  [STAGING, 'docx/ELECTRODO ELECTROMAGNETICO HE 70  HE/image2.png', 'electrode-he-70-detail.png'],
  // HE-100 (ELE-003)
  [STAGING, 'docx/ELECTRODO ELECTROMAGNETICO HE 100  HE/image1.png', 'electrode-he-100-product.png'],
  [STAGING, 'docx/ELECTRODO ELECTROMAGNETICO HE 100  HE/image2.png', 'electrode-he-100-detail.png'],
  // HE-400 (ELE-005)
  [STAGING, 'docx/ELECTRODO ELECTROMAGNETICO HE-400  HE 2025/image1.png', 'electrode-he-400-product.png'],
  [STAGING, 'docx/ELECTRODO ELECTROMAGNETICO HE-400  HE 2025/image2.png', 'electrode-he-400-detail.png'],
  // HE-700 (ELE-006)
  [STAGING, 'docx/ELECTRODO ELECTROMAGNETICO HE-700  HE/image1.png', 'electrode-he-700-product.png'],
  [STAGING, 'docx/ELECTRODO ELECTROMAGNETICO HE-700  HE/image2.png', 'electrode-he-700-detail.png'],
  // HE-1500 (ELE-007)
  [STAGING, 'docx/ELECTRODO ELECTROMAGNETICO HE 1500  HE/image1.png', 'electrode-he-1500-product.png'],
  [STAGING, 'docx/ELECTRODO ELECTROMAGNETICO HE 1500  HE/image2.png', 'electrode-he-1500-detail.png'],
  // HE-2500 (ELE-008)
  [STAGING, 'docx/ELECTRODO ELECTROMAGNETICO HE 2500  HE/image1.png', 'electrode-he-2500-product.png'],
  [STAGING, 'docx/ELECTRODO ELECTROMAGNETICO HE 2500  HE/image2.png', 'electrode-he-2500-detail.png'],

  // === Electrodo de Grafito (EGR-001) ===
  [STAGING, 'docx/ELECTRODO DE GRAFITO EG-GELCHIEL/image2.png', 'ele-001.png'],

  // === Tableros (TAB-001, TAB-002) ===
  [STAGING, 'docx/FICHA TECNICA TABLERO ELECTRICO 300X200X150/image1.png', 'tab-001.png'],
  [STAGING, 'docx/FICHA TECNICA TABLERO ELECTRICO 400X300X200/image1.png', 'tab-002.png'],

  // === Camarilla PVC (CAM-001) — DOCX source ===
  [STAGING, 'docx/FICHA TECNICA CAMARILLA DE REGISTRO PVC NARANJA/image1.png', 'cam-002.png'],

  // === Pararrayo (PAR-001) ===
  [STAGING, 'docx/FICHA TECNICA PARARRAYO TIPO FRANKLIN/image1.png', 'par-001.png'],

  // === Aditivos ===
  [STAGING, 'docx/FICHA TECNICA POWER GEM/image1.png', 'adi-008.png'],
  [STAGING, 'docx/FICHA TECNICA POWER GEM Y GEL/image1.png', 'adi-001.png'],

  // === Masilla (PAR-002) — DOCX source ===
  [STAGING, 'docx/FICHA TECNICA MASILLA/image2.png', 'mas-002.png'],
  [STAGING, 'docx/FICHA TECNICA MASILLA/image1.png', 'mas-001.png'],

  // === Chispero (PAR-003) — DOCX source ===
  [STAGING, 'docx/CERTIFICADO DE CALIDAD CHISPERO/image1.jpeg', 'chi-001.jpeg'],

  // === Servicios (SRV-002) ===
  [STAGING, 'servicios/WhatsApp Image 2026-01-28 at 20.35.43.jpeg', 'srv-malla-01.jpeg'],
  [STAGING, 'servicios/WhatsApp Image 2026-01-28 at 20.38.38.jpeg', 'srv-malla-02.jpeg'],
  [STAGING, 'servicios/WhatsApp Image 2026-01-28 at 20.38.38 (1).jpeg', 'srv-malla-03.jpeg'],
  [STAGING, 'servicios/WhatsApp Image 2026-01-28 at 20.38.39.jpeg', 'srv-malla-04.jpeg'],

  // === Hunter Energy shared images ===
  [STAGING, 'docx/ELECTRODO ELECTROMAGNETICO HE 45  HE/image9.png', 'hunter-energy-branding.png'],
  [STAGING, 'docx/ELECTRODO ELECTROMAGNETICO HE 45  HE/image7.png', 'hunter-energy-certification-standard.png'],
  [STAGING, 'docx/ELECTRODO ELECTROMAGNETICO HE 45  HE/image8.png', 'hunter-energy-dimensions-standard.png'],
  [STAGING, 'docx/ELECTRODO ELECTROMAGNETICO HE 45  HE/image5.png', 'hunter-energy-specs-standard.png'],
  [STAGING, 'docx/ELECTRODO ELECTROMAGNETICO HE 45  HE/image6.png', 'hunter-energy-icon.png'],
  [STAGING, 'docx/ELECTRODO ELECTROMAGNETICO HE 45  HE/image3.png', 'hunter-energy-logo.png'],
  [STAGING, 'docx/ELECTRODO ELECTROMAGNETICO HE-400  HE 2025/image7.png', 'hunter-energy-certification-he-400.png'],
  [STAGING, 'docx/ELECTRODO ELECTROMAGNETICO HE-400  HE 2025/image5.png', 'hunter-energy-specs-he-400.png'],
  [STAGING, 'docx/ELECTRODO ELECTROMAGNETICO HE-400  HE 2025/image8.png', 'hunter-energy-dimensions-he-400.png'],
  [STAGING, 'docx/ELECTRODO ELECTROMAGNETICO HE-700  HE/image7.png', 'hunter-energy-specs-he-700.png'],
  [STAGING, 'docx/ELECTRODO ELECTROMAGNETICO HE-700  HE/image5.png', 'hunter-energy-dimensions-he-700.png'],

  // =====================================================
  // === NEW: Fotos GelChile (professional photos) ===
  // =====================================================

  // --- Electrodos Solo (EES) ---
  [FOTOS, 'electrodo 100.JPG', 'ees-001.JPG'],
  [FOTOS, 'electrodo 200.JPG', 'ees-002.JPG'],
  [FOTOS, 'electrodo 400.JPG', 'ees-003.JPG'],
  [FOTOS, 'electrodo 700.JPG', 'ees-004.JPG'],
  [FOTOS, 'electrodo punta conica.JPG', 'ees-005.JPG'],

  // --- Packs (ELE-005, ELE-006) ---
  [FOTOS, 'pack electrodo 400.JPG', 'ele-005-pack.JPG'],
  [FOTOS, 'pack electrodo 700.JPG', 'ele-006-pack.JPG'],

  // --- Cargas Exotérmicas ESTWELD (CEX) ---
  [FOTOS, 'caja carga 45.jpg', 'cex-001.jpg'],
  [FOTOS, 'caja carga 45 - 2.JPG', 'cex-001-alt.JPG'],
  [FOTOS, 'caja carga 65.JPG', 'cex-002.JPG'],
  [FOTOS, 'caja carga 65  -2.JPG', 'cex-002-alt.JPG'],
  [FOTOS, 'carga 65.png', 'cex-002-alt2.png'],
  [FOTOS, 'carga 65- 2.jpg', 'cex-002-alt3.jpg'],
  [FOTOS, 'caja carga 90.JPG', 'cex-003.JPG'],
  [FOTOS, 'carga 90.jpg', 'cex-003-alt.jpg'],
  [FOTOS, 'caja carga 115.JPG', 'cex-004.JPG'],
  [FOTOS, 'caja carga 150.JPG', 'cex-005.JPG'],
  [FOTOS, 'caja carga 200.JPG', 'cex-006.JPG'],
  [FOTOS, 'caja carga 250.JPG', 'cex-007.JPG'],

  // --- Camarilla (CAM-001) ---
  [FOTOS, 'camarilla 1.JPG', 'cam-001.JPG'],
  [FOTOS, 'camarilla 2.JPG', 'cam-001-alt.JPG'],

  // --- Chispero (PAR-003) ---
  [FOTOS, 'chispero.JPG', 'chi-004.JPG'],

  // --- Masilla (PAR-002) ---
  [FOTOS, 'masilla.JPG', 'mas-003.JPG'],
  [FOTOS, 'IMG_2494.png', 'mas-004.png'],

  // --- Molde genérico ---
  [FOTOS, 'molde.jpg', 'mol-generic.jpg'],
];

async function main() {
  console.log('=== Copy Mapped Source Images ===\n');

  let copied = 0;
  let skipped = 0;
  let errors = 0;

  for (const [baseDir, srcRel, destName] of MAPPINGS) {
    const srcPath = join(baseDir, srcRel);
    const destPath = join(PRODUCTS_DIR, destName);

    try {
      // Check if source exists
      await stat(srcPath);

      // Remove existing WebP with same base name (will be replaced by optimize-images)
      const baseName = destName.replace(extname(destName), '');
      const existingWebp = join(PRODUCTS_DIR, baseName + '.webp');

      try {
        await stat(existingWebp);
        // WebP exists, it will be kept alongside the new source file
        // optimize-images will process the new PNG/JPG and replace the WebP
      } catch {
        // No existing WebP, that's fine
      }

      await copyFile(srcPath, destPath);
      const stats = await stat(destPath);
      console.log(`  ✓ ${destName} (${(stats.size / 1024).toFixed(0)} KB)`);
      copied++;
    } catch (err) {
      if (err.code === 'ENOENT') {
        console.log(`  ✗ SKIP: ${srcRel} (source not found)`);
        skipped++;
      } else {
        console.log(`  ✗ ERROR: ${destName}: ${err.message}`);
        errors++;
      }
    }
  }

  console.log(`\n=== Summary ===`);
  console.log(`Copied: ${copied} images`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Errors: ${errors}`);
  console.log(`\nNext step: run 'npm run optimize-images' to convert to WebP at quality 85`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
