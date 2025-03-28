import moduleAlias from 'module-alias';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Add aliases
moduleAlias.addAliases({
  '@shared': path.resolve(__dirname, '../../shared')
});

console.log('Module aliases registered successfully');