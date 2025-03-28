import moduleAlias from 'module-alias';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Get current directory in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Find shared directory by looking in a few common locations
let sharedPath = '';
const possiblePaths = [
  path.resolve(__dirname, '../../shared'),
  path.resolve(__dirname, '../shared'),
  path.resolve(__dirname, '/var/task/shared')
];

for (const p of possiblePaths) {
  if (fs.existsSync(p)) {
    sharedPath = p;
    break;
  }
}

if (!sharedPath) {
  console.warn('Warning: Could not find shared directory for module aliases');
  sharedPath = path.resolve(__dirname, '../../shared'); // Fallback to default
}

// Add aliases
moduleAlias.addAliases({
  '@shared': sharedPath
});

console.log('Module aliases registered successfully with shared path:', sharedPath);