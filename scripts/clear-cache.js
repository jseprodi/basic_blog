const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧹 Clearing Next.js cache and restarting...\n');

try {
  // Clear Next.js cache
  console.log('1. Clearing .next directory...');
  if (fs.existsSync('.next')) {
    fs.rmSync('.next', { recursive: true, force: true });
    console.log('   ✅ .next directory cleared');
  }

  // Clear node_modules/.cache if it exists
  console.log('2. Clearing node_modules cache...');
  const cachePath = path.join('node_modules', '.cache');
  if (fs.existsSync(cachePath)) {
    fs.rmSync(cachePath, { recursive: true, force: true });
    console.log('   ✅ node_modules cache cleared');
  }

  // Clear browser cache instructions
  console.log('\n3. Browser cache instructions:');
  console.log('   📱 Mobile: Clear browser data or use incognito mode');
  console.log('   💻 Desktop: Press Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)');
  console.log('   🔄 Or open Developer Tools → Application → Storage → Clear storage');

  console.log('\n4. Restarting development server...');
  console.log('   Run: npm run dev');
  
  console.log('\n✨ Cache cleared! Please restart your development server manually.');
  console.log('   This helps resolve authentication and session issues.');

} catch (error) {
  console.error('❌ Error clearing cache:', error.message);
  process.exit(1);
} 