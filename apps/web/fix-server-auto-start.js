/**
 * WYA!? — Post-Build Fix Script
 * 
 * Purpose: Prevent createHonoServer from auto-starting when using react-router-serve
 * 
 * This script patches the build output to check for REACT_ROUTER_SERVE_MODE
 * environment variable before starting the server.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const buildServerPath = join(__dirname, 'build/server/assets');
const indexPath = join(buildServerPath, 'index-CGuDarWN.js');

try {
  let content = readFileSync(indexPath, 'utf-8');
  
  // Replace the production server start check to include REACT_ROUTER_SERVE_MODE check
  const oldPattern = 'if (PRODUCTION) {';
  const newPattern = 'if (PRODUCTION && !process.env.REACT_ROUTER_SERVE_MODE) {';
  
  if (content.includes(oldPattern)) {
    content = content.replace(oldPattern, newPattern);
    writeFileSync(indexPath, content, 'utf-8');
    console.log('✅ Fixed server auto-start in build output');
  } else if (content.includes('if (PRODUCTION && !process.env.REACT_ROUTER_SERVE_MODE)')) {
    console.log('✅ Server auto-start already fixed');
  } else {
    console.log('⚠️  Could not find production server start pattern');
  }
} catch (error) {
  console.error('❌ Error fixing server auto-start:', error.message);
  process.exit(1);
}

