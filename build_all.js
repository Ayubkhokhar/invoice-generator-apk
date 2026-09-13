const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('=== Starting Full Build, Sync, and Asset Packaging ===');

// 1. Run Icon & Splash Generation
require('./create_icons.js');

// 2. Sync app/ to android/app/src/main/assets/public
const appDir = path.join(__dirname, 'app');
const androidAssetsPublic = path.join(__dirname, 'android', 'app', 'src', 'main', 'assets', 'public');

function copyDirRecursive(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

copyDirRecursive(appDir, androidAssetsPublic);
console.log('✅ Synced app/ to android/app/src/main/assets/public/');

// 3. Sync to root for GitHub Pages
copyDirRecursive(appDir, __dirname);
console.log('✅ Synced app/ to root directory for GitHub Pages');

// 4. Generate single-file offline bundles
require('./bundle_single_file.js');

console.log('✅ Full asset sync and bundling complete!');
