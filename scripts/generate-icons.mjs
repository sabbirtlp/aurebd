import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

const sourceFile = 'C:/Users/Abu Talha/.gemini/antigravity/brain/8f623ca0-0f76-407a-a67a-e9cc8bb43b98/media__1777492653114.png';
const outputDir = 'g:/AureaBD/src/app';

async function generateIcons() {
  try {
    // Generate icon.png (32x32)
    await sharp(sourceFile)
      .resize(32, 32)
      .toFile(path.join(outputDir, 'icon.png'));

    // Generate apple-icon.png (180x180)
    await sharp(sourceFile)
      .resize(180, 180)
      .toFile(path.join(outputDir, 'apple-icon.png'));

    // For favicon.ico, we'll just copy the 32x32 png but name it .ico if we want to be traditional,
    // but Next.js will use icon.png if present.
    // Let's actually try to overwrite the favicon.ico if we can, 
    // but since sharp doesn't support ICO, we'll just use icon.png which is better for modern web.
    
    console.log('Icons generated successfully in src/app');
  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

generateIcons();
