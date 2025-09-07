#!/usr/bin/env node

/**
 * MongoDB Migration Script: Local to Atlas
 * Migrates all collections and data from local MongoDB to MongoDB Atlas
 * 
 * Usage: node migrate-to-atlas.js
 * 
 * Prerequisites:
 * npm install mongodb
 */

const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

// Configuration
const LOCAL_MONGODB_URI = 'mongodb://localhost:27017/booking4u';
const ATLAS_MONGODB_URI = 'mongodb+srv://osamagivegh:990099@cluster0.npzs81o.mongodb.net/booking4u?retryWrites=true&w=majority&appName=Cluster0';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function logProgress(message) {
  log(`🔄 ${message}`, 'cyan');
}

class MongoDBMigrator {
  constructor() {
    this.localClient = null;
    this.atlasClient = null;
    this.localDb = null;
    this.atlasDb = null;
    this.migrationStats = {
      collections: 0,
      documents: 0,
      errors: 0,
      startTime: null,
      endTime: null
    };
  }

  async connect() {
    try {
      logProgress('Connecting to local MongoDB...');
      this.localClient = new MongoClient(LOCAL_MONGODB_URI);
      await this.localClient.connect();
      this.localDb = this.localClient.db('booking4U');
      logSuccess('Connected to local MongoDB');

      logProgress('Connecting to MongoDB Atlas...');
      this.atlasClient = new MongoClient(ATLAS_MONGODB_URI);
      await this.atlasClient.connect();
      this.atlasDb = this.atlasClient.db('booking4u');
      logSuccess('Connected to MongoDB Atlas');

      // Test connections
      await this.localDb.admin().ping();
      await this.atlasDb.admin().ping();
      logSuccess('Both database connections verified');

    } catch (error) {
      logError(`Connection failed: ${error.message}`);
      throw error;
    }
  }

  async getCollections() {
    try {
      const collections = await this.localDb.listCollections().toArray();
      const collectionNames = collections.map(col => col.name);
      
      logInfo(`Found ${collectionNames.length} collections: ${collectionNames.join(', ')}`);
      return collectionNames;
    } catch (error) {
      logError(`Failed to get collections: ${error.message}`);
      throw error;
    }
  }

  async migrateCollection(collectionName) {
    try {
      logProgress(`Migrating collection: ${collectionName}`);
      
      const localCollection = this.localDb.collection(collectionName);
      const atlasCollection = this.atlasDb.collection(collectionName);
      
      // Get all documents from local collection
      const documents = await localCollection.find({}).toArray();
      
      if (documents.length === 0) {
        logWarning(`Collection ${collectionName} is empty, skipping...`);
        return { documents: 0, errors: 0 };
      }

      logInfo(`Found ${documents.length} documents in ${collectionName}`);

      // Clear existing data in Atlas collection (overwrite)
      await atlasCollection.deleteMany({});
      logInfo(`Cleared existing data in Atlas collection: ${collectionName}`);

      // Insert documents in batches for better performance
      const batchSize = 100;
      let insertedCount = 0;
      let errorCount = 0;

      for (let i = 0; i < documents.length; i += batchSize) {
        const batch = documents.slice(i, i + batchSize);
        
        try {
          const result = await atlasCollection.insertMany(batch, { ordered: false });
          insertedCount += result.insertedCount;
          logProgress(`Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(documents.length / batchSize)} for ${collectionName}`);
        } catch (error) {
          if (error.writeErrors) {
            errorCount += error.writeErrors.length;
            logWarning(`Some documents failed to insert in ${collectionName}: ${error.writeErrors.length} errors`);
          } else {
            errorCount++;
            logError(`Batch insert failed for ${collectionName}: ${error.message}`);
          }
        }
      }

      logSuccess(`Collection ${collectionName} migrated: ${insertedCount} documents inserted, ${errorCount} errors`);
      return { documents: insertedCount, errors: errorCount };

    } catch (error) {
      logError(`Failed to migrate collection ${collectionName}: ${error.message}`);
      return { documents: 0, errors: 1 };
    }
  }

  async createIndexes(collectionName) {
    try {
      const localCollection = this.localDb.collection(collectionName);
      const atlasCollection = this.atlasDb.collection(collectionName);
      
      // Get indexes from local collection
      const indexes = await localCollection.listIndexes().toArray();
      
      // Skip the default _id index
      const customIndexes = indexes.filter(index => index.name !== '_id_');
      
      if (customIndexes.length === 0) {
        logInfo(`No custom indexes found for ${collectionName}`);
        return;
      }

      logProgress(`Creating ${customIndexes.length} indexes for ${collectionName}`);
      
      for (const index of customIndexes) {
        try {
          // Remove the _id field from index specification
          const indexSpec = { ...index.key };
          delete indexSpec._id;
          
          await atlasCollection.createIndex(indexSpec, {
            name: index.name,
            unique: index.unique || false,
            sparse: index.sparse || false,
            background: true
          });
          
          logSuccess(`Created index ${index.name} for ${collectionName}`);
        } catch (error) {
          logWarning(`Failed to create index ${index.name} for ${collectionName}: ${error.message}`);
        }
      }
    } catch (error) {
      logWarning(`Failed to create indexes for ${collectionName}: ${error.message}`);
    }
  }

  async verifyMigration() {
    try {
      logProgress('Verifying migration...');
      
      const localCollections = await this.getCollections();
      let totalLocalDocs = 0;
      let totalAtlasDocs = 0;
      
      for (const collectionName of localCollections) {
        const localCount = await this.localDb.collection(collectionName).countDocuments();
        const atlasCount = await this.atlasDb.collection(collectionName).countDocuments();
        
        totalLocalDocs += localCount;
        totalAtlasDocs += atlasCount;
        
        if (localCount === atlasCount) {
          logSuccess(`${collectionName}: ${localCount} documents (verified)`);
        } else {
          logWarning(`${collectionName}: Local=${localCount}, Atlas=${atlasCount} (mismatch)`);
        }
      }
      
      logInfo(`Total documents - Local: ${totalLocalDocs}, Atlas: ${totalAtlasDocs}`);
      
      if (totalLocalDocs === totalAtlasDocs) {
        logSuccess('Migration verification successful!');
        return true;
      } else {
        logWarning('Migration verification found discrepancies');
        return false;
      }
    } catch (error) {
      logError(`Verification failed: ${error.message}`);
      return false;
    }
  }

  async generateMigrationReport() {
    const duration = this.migrationStats.endTime - this.migrationStats.startTime;
    const durationMinutes = Math.round(duration / 1000 / 60 * 100) / 100;
    
    const report = {
      timestamp: new Date().toISOString(),
      duration: `${durationMinutes} minutes`,
      collections: this.migrationStats.collections,
      documents: this.migrationStats.documents,
      errors: this.migrationStats.errors,
      success: this.migrationStats.errors === 0
    };
    
    // Save report to file
    const reportPath = path.join(__dirname, 'migration-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    logInfo(`Migration report saved to: ${reportPath}`);
    
    // Display summary
    log('\n' + '='.repeat(50), 'bright');
    log('MIGRATION SUMMARY', 'bright');
    log('='.repeat(50), 'bright');
    log(`Duration: ${durationMinutes} minutes`, 'cyan');
    log(`Collections migrated: ${this.migrationStats.collections}`, 'cyan');
    log(`Documents migrated: ${this.migrationStats.documents}`, 'cyan');
    log(`Errors: ${this.migrationStats.errors}`, this.migrationStats.errors > 0 ? 'yellow' : 'green');
    log(`Status: ${report.success ? 'SUCCESS' : 'COMPLETED WITH ERRORS'}`, report.success ? 'green' : 'yellow');
    log('='.repeat(50), 'bright');
  }

  async migrate() {
    try {
      this.migrationStats.startTime = Date.now();
      
      log('\n' + '='.repeat(60), 'bright');
      log('MONGODB MIGRATION: LOCAL TO ATLAS', 'bright');
      log('='.repeat(60), 'bright');
      
      // Connect to both databases
      await this.connect();
      
      // Get all collections
      const collections = await this.getCollections();
      
      if (collections.length === 0) {
        logWarning('No collections found in local database');
        return;
      }
      
      // Migrate each collection
      for (const collectionName of collections) {
        const result = await this.migrateCollection(collectionName);
        this.migrationStats.collections++;
        this.migrationStats.documents += result.documents;
        this.migrationStats.errors += result.errors;
        
        // Create indexes for the collection
        await this.createIndexes(collectionName);
      }
      
      // Verify migration
      await this.verifyMigration();
      
      this.migrationStats.endTime = Date.now();
      await this.generateMigrationReport();
      
    } catch (error) {
      logError(`Migration failed: ${error.message}`);
      throw error;
    } finally {
      await this.disconnect();
    }
  }

  async disconnect() {
    try {
      if (this.localClient) {
        await this.localClient.close();
        logInfo('Disconnected from local MongoDB');
      }
      if (this.atlasClient) {
        await this.atlasClient.close();
        logInfo('Disconnected from MongoDB Atlas');
      }
    } catch (error) {
      logError(`Error during disconnect: ${error.message}`);
    }
  }
}

// Main execution
async function main() {
  // Check if MongoDB driver is installed
  try {
    require('mongodb');
  } catch (error) {
    logError('MongoDB driver not found. Please install it first:');
    log('npm install mongodb', 'yellow');
    process.exit(1);
  }
  
  // Validate environment
  if (ATLAS_MONGODB_URI.includes('<db_password>')) {
    logError('Please replace <db_password> in ATLAS_MONGODB_URI with your actual password');
    process.exit(1);
  }
  
  const migrator = new MongoDBMigrator();
  
  try {
    await migrator.migrate();
    logSuccess('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    logError(`Migration failed: ${error.message}`);
    process.exit(1);
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  logWarning('Migration interrupted by user');
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  logError(`Unhandled rejection: ${error.message}`);
  process.exit(1);
});

// Run the migration
if (require.main === module) {
  main();
}

module.exports = MongoDBMigrator;
