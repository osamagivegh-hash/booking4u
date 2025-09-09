#!/usr/bin/env node

/**
 * Environment Configuration Validation Script
 * Validates that the backend environment is correctly configured for production
 */

const config = require('./config');

function validateEnvironment() {
  console.log('🔍 Validating Booking4U Backend Environment Configuration...\n');
  
  const issues = [];
  const warnings = [];
  
  // Check NODE_ENV
  if (config.server.nodeEnv !== 'production') {
    warnings.push(`NODE_ENV is set to '${config.server.nodeEnv}' instead of 'production'`);
  } else {
    console.log('✅ NODE_ENV: production');
  }
  
  // Check CORS_ORIGIN
  const expectedCorsOrigin = 'https://booking4u-1.onrender.com';
  if (config.server.corsOrigin !== expectedCorsOrigin) {
    issues.push(`CORS_ORIGIN is '${config.server.corsOrigin}' but should be '${expectedCorsOrigin}'`);
  } else {
    console.log('✅ CORS_ORIGIN: https://booking4u-1.onrender.com');
  }
  
  // Check MongoDB URI
  if (!config.database.uri.includes('mongodb+srv://')) {
    issues.push('MongoDB URI should use Atlas connection string (mongodb+srv://)');
  } else if (!config.database.uri.includes('osamagivegh:990099@cluster0.npzs81o.mongodb.net')) {
    issues.push('MongoDB URI does not contain expected Atlas credentials');
  } else {
    console.log('✅ MongoDB URI: Atlas connection configured');
  }
  
  // Check JWT configuration
  if (config.jwt.secret === 'your-super-secret-jwt-key-change-this-in-production') {
    warnings.push('JWT_SECRET is using default value - should be changed in production');
  } else {
    console.log('✅ JWT_SECRET: Custom value configured');
  }
  
  if (config.jwt.expiresIn !== '24h') {
    warnings.push(`JWT_EXPIRE is '${config.jwt.expiresIn}' - consider using '24h' for production`);
  } else {
    console.log('✅ JWT_EXPIRE: 24h');
  }
  
  // Check database connection settings
  if (config.database.options.maxPoolSize < 20) {
    warnings.push(`DB_MAX_POOL_SIZE is ${config.database.options.maxPoolSize} - consider using 20 for production`);
  } else {
    console.log('✅ DB_MAX_POOL_SIZE: Optimized for production');
  }
  
  // Check rate limiting
  if (config.rateLimit.max > 100) {
    warnings.push(`Rate limit is ${config.rateLimit.max} - consider using 50 for production`);
  } else {
    console.log('✅ Rate limiting: Configured for production');
  }
  
  // Display results
  console.log('\n📊 Validation Results:');
  
  if (issues.length === 0 && warnings.length === 0) {
    console.log('🎉 All environment settings are correctly configured!');
    return true;
  }
  
  if (issues.length > 0) {
    console.log('\n❌ Critical Issues Found:');
    issues.forEach((issue, index) => {
      console.log(`   ${index + 1}. ${issue}`);
    });
  }
  
  if (warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    warnings.forEach((warning, index) => {
      console.log(`   ${index + 1}. ${warning}`);
    });
  }
  
  console.log('\n📋 Environment Summary:');
  console.log(`   NODE_ENV: ${config.server.nodeEnv}`);
  console.log(`   CORS_ORIGIN: ${config.server.corsOrigin}`);
  console.log(`   MongoDB URI: ${config.database.uri.substring(0, 50)}...`);
  console.log(`   JWT Expire: ${config.jwt.expiresIn}`);
  console.log(`   DB Pool Size: ${config.database.options.maxPoolSize}`);
  console.log(`   Rate Limit: ${config.rateLimit.max} requests per ${config.rateLimit.windowMs / 1000 / 60} minutes`);
  
  return issues.length === 0;
}

// Run validation if this script is executed directly
if (require.main === module) {
  try {
    const isValid = validateEnvironment();
    process.exit(isValid ? 0 : 1);
  } catch (error) {
    console.error('❌ Error validating environment:', error.message);
    process.exit(1);
  }
}

module.exports = { validateEnvironment };
