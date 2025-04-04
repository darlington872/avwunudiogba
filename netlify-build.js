import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create netlify functions directory if it doesn't exist
const functionsDir = path.join(__dirname, 'netlify', 'functions');
if (!fs.existsSync(functionsDir)) {
  fs.mkdirSync(functionsDir, { recursive: true });
}

// Create a package.json for the functions
const packageJson = {
  "name": "ethervox-sms-functions",
  "version": "1.0.0",
  "description": "Netlify functions for Ethervox SMS",
  "main": "api.js",
  "type": "module",
  "dependencies": {
    "@neondatabase/serverless": "^0.9.0",
    "dotenv": "^16.4.5",
    "express": "^4.18.3",
    "express-session": "^1.18.0",
    "serverless-http": "^3.2.0",
    "pg": "^8.11.3",
    "connect-pg-simple": "^9.0.1",
    "passport": "^0.7.0",
    "passport-local": "^1.0.0",
    "drizzle-orm": "^0.29.5",
    "nanoid": "^5.0.6",
    "cors": "^2.8.5",
    "zod": "^3.22.4",
    "tsconfig-paths": "^4.2.0",
    "module-alias": "^2.2.3",
    "memorystore": "^1.6.7"
  }
};

fs.writeFileSync(
  path.join(functionsDir, 'package.json'),
  JSON.stringify(packageJson, null, 2)
);

// Copy the setup-aliases.js file to the functions directory
const setupAliasesPath = path.join(__dirname, 'netlify', 'setup-aliases.js');
const destSetupAliasesPath = path.join(functionsDir, 'setup-aliases.js');
if (fs.existsSync(setupAliasesPath)) {
  fs.copyFileSync(setupAliasesPath, destSetupAliasesPath);
  console.log('Module alias setup file copied successfully');
}

console.log('Netlify build setup completed successfully.');