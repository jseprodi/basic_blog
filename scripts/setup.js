#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up your blog...\n');

// Check if .env file exists
const envPath = path.join(process.cwd(), '.env');
const envExamplePath = path.join(process.cwd(), 'env.example');

if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env file from template...');
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ .env file created successfully');
  } else {
    console.log('❌ env.example file not found');
    process.exit(1);
  }
} else {
  console.log('✅ .env file already exists');
}

// Generate NEXTAUTH_SECRET if not set
const envContent = fs.readFileSync(envPath, 'utf8');
if (!envContent.includes('NEXTAUTH_SECRET=') || envContent.includes('your-nextauth-secret-key-here')) {
  console.log('🔐 Generating NEXTAUTH_SECRET...');
  const crypto = require('crypto');
  const secret = crypto.randomBytes(32).toString('hex');
  
  const newEnvContent = envContent.replace(
    /NEXTAUTH_SECRET="your-nextauth-secret-key-here"/,
    `NEXTAUTH_SECRET="${secret}"`
  );
  
  fs.writeFileSync(envPath, newEnvContent);
  console.log('✅ NEXTAUTH_SECRET generated and set');
}

// Install dependencies
console.log('\n📦 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed');
} catch (error) {
  console.log('⚠️  Standard install failed, trying with legacy peer deps...');
  try {
    execSync('npm install --legacy-peer-deps', { stdio: 'inherit' });
    console.log('✅ Dependencies installed with legacy peer deps');
  } catch (error2) {
    console.log('❌ Failed to install dependencies');
    console.log('💡 Try running: npm install --legacy-peer-deps');
    process.exit(1);
  }
}

// Generate Prisma client
console.log('\n🗄️  Setting up database...');
try {
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma client generated');
} catch (error) {
  console.log('❌ Failed to generate Prisma client');
  process.exit(1);
}

// Run database migrations
console.log('\n🔄 Running database migrations...');
try {
  execSync('npx prisma migrate dev', { stdio: 'inherit' });
  console.log('✅ Database migrations completed');
} catch (error) {
  console.log('❌ Failed to run database migrations');
  process.exit(1);
}

// Run tests
console.log('\n🧪 Running tests...');
try {
  execSync('npm test', { stdio: 'inherit' });
  console.log('✅ All tests passed');
} catch (error) {
  console.log('⚠️  Some tests failed - check the output above');
}

console.log('\n🎉 Setup completed successfully!');
console.log('\n📋 Next steps:');
console.log('1. Edit your .env file with your actual configuration values');
console.log('2. Set up your email service (SendGrid, Mailgun, etc.)');
console.log('3. Configure Google Analytics if desired');
console.log('4. Set up Sentry for error monitoring');
console.log('5. Generate VAPID keys for push notifications');
console.log('6. Run "npm run dev" to start the development server');
console.log('\n📖 See SETUP.md for detailed configuration instructions'); 