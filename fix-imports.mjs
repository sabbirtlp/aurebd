import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const directory = path.join(__dirname, 'src');

const replacements = {
  '@/components/Navbar': '@/components/layout/Navbar',
  '@/components/Footer': '@/components/layout/Footer',
  '@/components/MobileMenu': '@/components/layout/MobileMenu',
  '@/components/HeaderSearch': '@/components/layout/HeaderSearch',
  '@/components/CartSidebar': '@/features/cart/CartSidebar',
  '@/components/ProductCard': '@/features/products/ProductCard',
  '@/components/Hero': '@/components/shared/Hero',
  '@/components/TestimonialSlider': '@/components/shared/TestimonialSlider',
  '@/components/Newsletter': '@/components/shared/Newsletter',
  '@/actions/product': '@/services/product.service',
  '@/store/useHasHydrated': '@/hooks/useHasHydrated'
};

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      processDirectory(filePath);
    } else if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
      let content = fs.readFileSync(filePath, 'utf8');
      let modified = false;
      
      for (const [key, value] of Object.entries(replacements)) {
        // Need to replace the import correctly
        const regex = new RegExp(`['"\`]${key}['"\`]`, 'g');
        if (regex.test(content)) {
          content = content.replace(regex, `'${value}'`);
          modified = true;
        }
      }
      
      if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${filePath}`);
      }
    }
  }
}

processDirectory(directory);
