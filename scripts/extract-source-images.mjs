#!/usr/bin/env node
/**
 * Extract source images from DOCX/PPTX files and copy loose PNG/JPEG sources
 * to a staging directory for re-optimization at higher quality.
 *
 * Usage: node scripts/extract-source-images.mjs
 * Output: _image-staging/ directory with extracted images organized by source
 */
import { readdir, stat, mkdir, copyFile, writeFile } from 'node:fs/promises';
import { join, extname, basename } from 'node:path';
import AdmZip from 'adm-zip';

const ROOT = process.cwd();
const PRODUCTOS_DIR = join(ROOT, 'Productos');
const STAGING_DIR = join(ROOT, '_image-staging');
const VALID_IMG_EXT = new Set(['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.tiff']);

async function ensureDir(dir) {
  await mkdir(dir, { recursive: true });
}

/**
 * Extract images from a DOCX file (DOCX = ZIP with images in word/media/)
 */
async function extractDocxImages(docxPath, outputDir) {
  await ensureDir(outputDir);
  const images = [];

  try {
    const zip = new AdmZip(docxPath);
    const entries = zip.getEntries();

    const mediaEntries = entries.filter(entry => {
      const name = entry.entryName;
      return name.startsWith('word/media/') &&
        !name.toLowerCase().endsWith('.emf') &&
        VALID_IMG_EXT.has(extname(name).toLowerCase());
    });

    if (mediaEntries.length === 0) return images;

    for (const entry of mediaEntries) {
      const imgName = basename(entry.entryName);
      try {
        zip.extractEntryTo(entry, outputDir, false, true);
        const extractedPath = join(outputDir, imgName);
        const stats = await stat(extractedPath);
        images.push({
          filename: imgName,
          path: extractedPath,
          size: stats.size,
          source: basename(docxPath),
        });
      } catch (err) {
        console.warn(`  Warning: Could not extract ${entry.entryName} from ${basename(docxPath)}`);
      }
    }
  } catch (err) {
    console.error(`  Error processing ${basename(docxPath)}: ${err.message}`);
  }

  return images;
}

/**
 * Extract images from a PPTX file (PPTX = ZIP with images in ppt/media/)
 */
async function extractPptxImages(pptxPath, outputDir) {
  await ensureDir(outputDir);
  const images = [];

  try {
    const zip = new AdmZip(pptxPath);
    const entries = zip.getEntries();

    const mediaEntries = entries.filter(entry => {
      const name = entry.entryName;
      return name.startsWith('ppt/media/') &&
        VALID_IMG_EXT.has(extname(name).toLowerCase());
    });

    for (const entry of mediaEntries) {
      const imgName = basename(entry.entryName);
      try {
        zip.extractEntryTo(entry, outputDir, false, true);
        const extractedPath = join(outputDir, imgName);
        const stats = await stat(extractedPath);
        images.push({
          filename: imgName,
          path: extractedPath,
          size: stats.size,
          source: basename(pptxPath),
        });
      } catch (err) {
        // skip
      }
    }
  } catch (err) {
    console.error(`  Error processing ${basename(pptxPath)}: ${err.message}`);
  }

  return images;
}

/**
 * Recursively find all files with a given extension in a directory
 */
async function findFilesByExt(dir, ext) {
  const results = [];
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...await findFilesByExt(fullPath, ext));
    } else if (entry.name.toLowerCase().endsWith(ext) && !entry.name.startsWith('~$')) {
      results.push(fullPath);
    }
  }

  return results;
}

/**
 * Copy loose image files (PNG, JPEG) from source directories
 */
async function copyLooseImages(srcDir, outputDir, label) {
  await ensureDir(outputDir);
  const images = [];

  try {
    const files = await readdir(srcDir);
    for (const file of files) {
      const ext = extname(file).toLowerCase();
      if (!VALID_IMG_EXT.has(ext)) continue;

      const srcPath = join(srcDir, file);
      const destPath = join(outputDir, file);
      await copyFile(srcPath, destPath);
      const stats = await stat(srcPath);

      images.push({
        filename: file,
        path: destPath,
        size: stats.size,
        source: label,
      });
    }
  } catch (err) {
    console.error(`  Error copying from ${srcDir}: ${err.message}`);
  }

  return images;
}

async function main() {
  console.log('=== GelChile Source Image Extraction ===\n');

  // Clean staging directory
  await ensureDir(STAGING_DIR);

  const allImages = [];

  // === Phase 1: Extract from DOCX files ===
  console.log('Phase 1: Extracting images from DOCX files...\n');

  const docxFiles = await findFilesByExt(PRODUCTOS_DIR, '.docx');
  console.log(`  Found ${docxFiles.length} DOCX files\n`);

  for (const docxPath of docxFiles) {
    const docxName = basename(docxPath, '.docx');
    const outputDir = join(STAGING_DIR, 'docx', docxName.replace(/[^\w\s-]/g, '').trim());

    console.log(`  Processing: ${basename(docxPath)}`);
    const images = await extractDocxImages(docxPath, outputDir);
    console.log(`    → Extracted ${images.length} images`);
    allImages.push(...images);
  }

  // === Phase 2: Copy moldes PNG screenshots ===
  console.log('\nPhase 2: Copying moldes PNG screenshots...\n');

  const moldesDir = join(PRODUCTOS_DIR, 'moldes');
  const moldesOutputDir = join(STAGING_DIR, 'moldes');
  const moldesImages = await copyLooseImages(moldesDir, moldesOutputDir, 'moldes-screenshots');
  console.log(`  → Copied ${moldesImages.length} PNG screenshots`);
  allImages.push(...moldesImages);

  // === Phase 3: Copy service JPEG photos ===
  console.log('\nPhase 3: Copying service JPEG photos...\n');

  const serviceDir = join(PRODUCTOS_DIR, 'Servicio Malla de fleje');
  const serviceOutputDir = join(STAGING_DIR, 'servicios');
  const serviceImages = await copyLooseImages(serviceDir, serviceOutputDir, 'servicio-malla');
  console.log(`  → Copied ${serviceImages.length} JPEG photos`);
  allImages.push(...serviceImages);

  // === Phase 4: Extract from PPTX files ===
  console.log('\nPhase 4: Extracting from PPTX files...\n');

  const pptxFiles = await findFilesByExt(PRODUCTOS_DIR, '.pptx');
  console.log(`  Found ${pptxFiles.length} PPTX files\n`);

  for (const pptxPath of pptxFiles) {
    const pptxName = basename(pptxPath, '.pptx');
    const outputDir = join(STAGING_DIR, 'pptx', pptxName.replace(/[^\w\s-]/g, '').trim());

    console.log(`  Processing: ${basename(pptxPath)}`);
    const images = await extractPptxImages(pptxPath, outputDir);
    console.log(`    → Extracted ${images.length} images`);
    allImages.push(...images);
  }

  // === Summary ===
  console.log('\n=== Extraction Summary ===');
  console.log(`Total images extracted: ${allImages.length}`);
  console.log(`\nBy source:`);

  const bySource = {};
  for (const img of allImages) {
    bySource[img.source] = (bySource[img.source] || 0) + 1;
  }
  for (const [source, count] of Object.entries(bySource).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${source}: ${count} images`);
  }

  const totalSize = allImages.reduce((sum, img) => sum + img.size, 0);
  console.log(`\nTotal size: ${(totalSize / 1024 / 1024).toFixed(1)} MB`);
  console.log(`\nAll images saved to: ${STAGING_DIR}/`);

  // Save manifest
  const manifest = allImages.map(img => ({
    filename: img.filename,
    path: img.path.replace(ROOT, '.').replace(/\\/g, '/'),
    size: img.size,
    source: img.source,
  }));

  await writeFile(
    join(STAGING_DIR, 'manifest.json'),
    JSON.stringify(manifest, null, 2)
  );
  console.log(`\nManifest saved to: _image-staging/manifest.json`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
