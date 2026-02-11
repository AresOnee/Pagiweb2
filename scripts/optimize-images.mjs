#!/usr/bin/env node
/**
 * Image optimization script for GelChile product images.
 * Resizes to max 800px width and converts to WebP format.
 * Also updates product JSON files to reference .webp extensions.
 */
import sharp from 'sharp';
import { readdir, stat, readFile, writeFile, unlink } from 'node:fs/promises';
import { join, extname, basename } from 'node:path';

const PRODUCTS_IMG_DIR = join(process.cwd(), 'public/assets/img/products');
const PRODUCTS_JSON_DIR = join(process.cwd(), 'src/content/products');
const MAX_WIDTH = 800;
const WEBP_QUALITY = 80;
const VALID_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg']);

async function optimizeImages() {
  console.log('=== GelChile Image Optimization ===\n');

  const files = await readdir(PRODUCTS_IMG_DIR);
  const imageFiles = files.filter(f => VALID_EXTENSIONS.has(extname(f).toLowerCase()));

  console.log(`Found ${imageFiles.length} images to optimize in ${PRODUCTS_IMG_DIR}\n`);

  let totalOriginal = 0;
  let totalOptimized = 0;
  let processed = 0;
  let skipped = 0;

  for (const file of imageFiles) {
    const inputPath = join(PRODUCTS_IMG_DIR, file);
    const ext = extname(file);
    const nameWithoutExt = basename(file, ext);
    const outputPath = join(PRODUCTS_IMG_DIR, `${nameWithoutExt}.webp`);

    try {
      const originalStat = await stat(inputPath);
      const originalSize = originalStat.size;
      totalOriginal += originalSize;

      const image = sharp(inputPath);
      const metadata = await image.metadata();

      let pipeline = image;

      // Only resize if wider than MAX_WIDTH
      if (metadata.width && metadata.width > MAX_WIDTH) {
        pipeline = pipeline.resize(MAX_WIDTH, null, {
          withoutEnlargement: true,
          fit: 'inside',
        });
      }

      // Convert to WebP
      const outputBuffer = await pipeline
        .webp({ quality: WEBP_QUALITY })
        .toBuffer();

      await writeFile(outputPath, outputBuffer);
      totalOptimized += outputBuffer.length;

      const savings = ((1 - outputBuffer.length / originalSize) * 100).toFixed(1);
      const origMB = (originalSize / 1024 / 1024).toFixed(2);
      const optKB = (outputBuffer.length / 1024).toFixed(1);
      console.log(`  ${file} (${origMB}MB) → ${nameWithoutExt}.webp (${optKB}KB) [${savings}% smaller]`);

      // Remove original if output is different file
      if (outputPath !== inputPath) {
        await unlink(inputPath);
      }

      processed++;
    } catch (err) {
      console.error(`  ERROR processing ${file}: ${err.message}`);
      skipped++;
    }
  }

  console.log(`\n--- Image Results ---`);
  console.log(`Processed: ${processed} | Skipped: ${skipped}`);
  console.log(`Original total: ${(totalOriginal / 1024 / 1024).toFixed(1)}MB`);
  console.log(`Optimized total: ${(totalOptimized / 1024 / 1024).toFixed(1)}MB`);
  console.log(`Savings: ${((1 - totalOptimized / totalOriginal) * 100).toFixed(1)}%\n`);

  // Phase 2: Update JSON references
  await updateJsonReferences();
}

async function updateJsonReferences() {
  console.log('=== Updating Product JSON References ===\n');

  const files = await readdir(PRODUCTS_JSON_DIR);
  const jsonFiles = files.filter(f => f.endsWith('.json'));
  let updated = 0;

  for (const file of jsonFiles) {
    const filePath = join(PRODUCTS_JSON_DIR, file);
    const content = await readFile(filePath, 'utf-8');
    let data = JSON.parse(content);
    let changed = false;

    // Update main image
    if (data.image && typeof data.image === 'string') {
      const newPath = replaceExtToWebp(data.image);
      if (newPath !== data.image) {
        data.image = newPath;
        changed = true;
      }
    }

    // Update images array
    if (Array.isArray(data.images)) {
      data.images = data.images.map(img => {
        const newPath = replaceExtToWebp(img);
        if (newPath !== img) {
          changed = true;
          return newPath;
        }
        return img;
      });
    }

    if (changed) {
      await writeFile(filePath, JSON.stringify(data, null, 2) + '\n');
      updated++;
    }
  }

  console.log(`Updated ${updated}/${jsonFiles.length} JSON files\n`);
}

function replaceExtToWebp(path) {
  return path.replace(/\.(png|jpg|jpeg)$/i, '.webp');
}

optimizeImages().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
