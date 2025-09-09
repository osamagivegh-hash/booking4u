const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Testing frontend build process...');

try {
  // Check if we're in the right directory
  console.log('Current directory:', process.cwd());
  
  // Check if package.json exists
  if (!fs.existsSync('package.json')) {
    console.error('package.json not found!');
    process.exit(1);
  }
  
  // Check if src directory exists
  if (!fs.existsSync('src')) {
    console.error('src directory not found!');
    process.exit(1);
  }
  
  // Check if public directory exists
  if (!fs.existsSync('public')) {
    console.error('public directory not found!');
    process.exit(1);
  }
  
  // Check if index.html exists in public
  if (!fs.existsSync('public/index.html')) {
    console.error('public/index.html not found!');
    process.exit(1);
  }
  
  console.log('All required files and directories found!');
  
  // Try to run the build
  console.log('Running npm run build...');
  execSync('npm run build', { stdio: 'inherit' });
  
  // Check if build directory was created
  if (fs.existsSync('build')) {
    console.log('Build directory created successfully!');
    
    // Check if index.html exists in build
    if (fs.existsSync('build/index.html')) {
      console.log('index.html found in build directory!');
    } else {
      console.error('index.html not found in build directory!');
    }
  } else {
    console.error('Build directory was not created!');
  }
  
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}