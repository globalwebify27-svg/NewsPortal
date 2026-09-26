const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const targetDirs = [
  path.join(__dirname, '../public'),
  path.join(__dirname, '../public/uploads')
];

async function optimizeImages() {
  let totalSaved = 0;
  let totalOriginal = 0;
  let totalNew = 0;
  let count = 0;

  for (const dir of targetDirs) {
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (!stat.isFile()) continue;

      const ext = path.extname(file).toLowerCase();
      if (!['.png', '.jpg', '.jpeg', '.webp'].includes(ext)) continue;

      const originalSize = stat.size;
      totalOriginal += originalSize;

      try {
        const inputBuffer = fs.readFileSync(fullPath);
        let sharpInstance = sharp(inputBuffer);
        const metadata = await sharpInstance.metadata();

        let outputBuffer;
        if (ext === '.png') {
          outputBuffer = await sharpInstance
            .png({ quality: 80, compressionLevel: 9, palette: true })
            .toBuffer();
        } else if (ext === '.jpg' || ext === '.jpeg') {
          outputBuffer = await sharpInstance
            .jpeg({ quality: 78, mozjpeg: true })
            .toBuffer();
        } else if (ext === '.webp') {
          outputBuffer = await sharpInstance
            .webp({ quality: 78, effort: 6 })
            .toBuffer();
        }

        if (outputBuffer && outputBuffer.length < originalSize) {
          fs.writeFileSync(fullPath, outputBuffer);
          const saved = originalSize - outputBuffer.length;
          totalSaved += saved;
          totalNew += outputBuffer.length;
          count++;
          console.log(`✓ Optimized ${file}: ${(originalSize / 1024).toFixed(1)} KB -> ${(outputBuffer.length / 1024).toFixed(1)} KB (-${((saved / originalSize) * 100).toFixed(1)}%)`);
        } else {
          totalNew += originalSize;
          console.log(`- Skipped ${file}: Already optimal (${(originalSize / 1024).toFixed(1)} KB)`);
        }
      } catch (err) {
        console.error(`✗ Error optimizing ${file}:`, err.message);
        totalNew += originalSize;
      }
    }
  }

  console.log(`\n================================`);
  console.log(`Summary:`);
  console.log(`Optimized ${count} images`);
  console.log(`Original total: ${(totalOriginal / 1024 / 1024).toFixed(2)} MB`);
  console.log(`New total: ${(totalNew / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Total saved: ${(totalSaved / 1024 / 1024).toFixed(2)} MB (-${((totalSaved / totalOriginal) * 100).toFixed(1)}%)`);
  console.log(`================================\n`);
}

optimizeImages();
