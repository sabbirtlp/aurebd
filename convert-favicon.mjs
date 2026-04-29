import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// Find the most recent large PNG in tempmediaStorage (the user's uploaded icon)
const mediaDir = path.join(
  process.env.USERPROFILE || '',
  '.gemini/antigravity/brain/8f623ca0-0f76-407a-a67a-e9cc8bb43b98/.tempmediaStorage'
);

const files = fs.readdirSync(mediaDir)
  .filter(f => f.endsWith('.png'))
  .map(f => ({
    name: f,
    size: fs.statSync(path.join(mediaDir, f)).size,
    time: fs.statSync(path.join(mediaDir, f)).mtimeMs
  }))
  // The user's icon is 1024x1024, so it should be one of the larger files
  .filter(f => f.size > 50000)
  .sort((a, b) => b.time - a.time);

console.log('Found large PNGs:', files.slice(0, 5).map(f => `${f.name} (${f.size} bytes)`));

if (files.length === 0) {
  console.error('No suitable image found');
  process.exit(1);
}

const sourceFile = path.join(mediaDir, files[0].name);
console.log('Using:', sourceFile);

// Generate multiple sizes for favicon
const outputDir = path.join(process.cwd(), 'src/app');

// Create icon.png (32x32 for favicon)
await sharp(sourceFile)
  .resize(32, 32)
  .png()
  .toFile(path.join(outputDir, 'favicon.ico.png'));

// Create apple-icon.png (180x180)
await sharp(sourceFile)
  .resize(180, 180)
  .png()
  .toFile(path.join(outputDir, 'apple-icon.png'));

// Create icon.png (192x192 for PWA)
await sharp(sourceFile)
  .resize(192, 192)
  .png()
  .toFile(path.join(outputDir, 'icon.png'));

console.log('✅ Favicon files generated!');
