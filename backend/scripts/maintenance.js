#!/usr/bin/env node

/**
 * Maintenance Scripts for Booking4U Backend
 * Provides utilities for system maintenance and cleanup
 */

const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');
const config = require('../config');
const { logInfo, logWarn, logError } = require('../utils/logger');

class MaintenanceService {
  constructor() {
    this.isConnected = false;
  }

  /**
   * Connect to MongoDB
   */
  async connect() {
    try {
      await mongoose.connect(config.database.uri, config.database.options);
      this.isConnected = true;
      logInfo('Connected to MongoDB for maintenance');
    } catch (error) {
      logError('Failed to connect to MongoDB', error);
      throw error;
    }
  }

  /**
   * Disconnect from MongoDB
   */
  async disconnect() {
    if (this.isConnected) {
      await mongoose.connection.close();
      this.isConnected = false;
      logInfo('Disconnected from MongoDB');
    }
  }

  /**
   * Clean up old logs
   */
  async cleanupLogs() {
    try {
      const logsDir = path.dirname(config.logging.file);
      const files = await fs.readdir(logsDir);
      
      let cleanedCount = 0;
      const now = Date.now();
      const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days

      for (const file of files) {
        if (file.endsWith('.log')) {
          const filePath = path.join(logsDir, file);
          const stats = await fs.stat(filePath);
          
          if (now - stats.mtime.getTime() > maxAge) {
            await fs.unlink(filePath);
            cleanedCount++;
            logInfo(`Cleaned up old log file: ${file}`);
          }
        }
      }

      logInfo(`Log cleanup completed. Removed ${cleanedCount} old log files`);
      return cleanedCount;
    } catch (error) {
      logError('Log cleanup failed', error);
      throw error;
    }
  }

  /**
   * Clean up old bookings
   */
  async cleanupOldBookings() {
    try {
      const Booking = require('../models/Booking');
      
      // Remove bookings older than 1 year
      const cutoffDate = new Date();
      cutoffDate.setFullYear(cutoffDate.getFullYear() - 1);
      
      const result = await Booking.deleteMany({
        date: { $lt: cutoffDate },
        status: { $in: ['completed', 'cancelled'] }
      });

      logInfo(`Cleaned up ${result.deletedCount} old bookings`);
      return result.deletedCount;
    } catch (error) {
      logError('Booking cleanup failed', error);
      throw error;
    }
  }

  /**
   * Clean up inactive users
   */
  async cleanupInactiveUsers() {
    try {
      const User = require('../models/User');
      
      // Find users inactive for more than 2 years
      const cutoffDate = new Date();
      cutoffDate.setFullYear(cutoffDate.getFullYear() - 2);
      
      const inactiveUsers = await User.find({
        lastLoginAt: { $lt: cutoffDate },
        isActive: true
      });

      // Deactivate users instead of deleting
      for (const user of inactiveUsers) {
        user.isActive = false;
        user.deactivatedAt = new Date();
        await user.save();
      }

      logInfo(`Deactivated ${inactiveUsers.length} inactive users`);
      return inactiveUsers.length;
    } catch (error) {
      logError('User cleanup failed', error);
      throw error;
    }
  }

  /**
   * Optimize database indexes
   */
  async optimizeIndexes() {
    try {
      const collections = ['users', 'businesses', 'services', 'bookings'];
      
      for (const collectionName of collections) {
        const collection = mongoose.connection.collection(collectionName);
        await collection.reIndex();
        logInfo(`Reindexed collection: ${collectionName}`);
      }

      logInfo('Database optimization completed');
    } catch (error) {
      logError('Database optimization failed', error);
      throw error;
    }
  }

  /**
   * Generate system health report
   */
  async generateHealthReport() {
    try {
      const report = {
        timestamp: new Date().toISOString(),
        system: {
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          nodeVersion: process.version,
          platform: process.platform
        },
        database: {
          status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
          collections: Object.keys(mongoose.connection.collections)
        },
        collections: {}
      };

      // Get collection statistics
      const collections = ['users', 'businesses', 'services', 'bookings'];
      for (const collectionName of collections) {
        try {
          const collection = mongoose.connection.collection(collectionName);
          const count = await collection.countDocuments();
          const stats = await collection.stats();
          
          report.collections[collectionName] = {
            count,
            size: stats.size,
            avgObjSize: stats.avgObjSize,
            indexes: stats.nindexes
          };
        } catch (error) {
          report.collections[collectionName] = { error: error.message };
        }
      }

      // Save report to file
      const reportPath = path.join(__dirname, '../logs/health-report.json');
      await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
      
      logInfo('Health report generated successfully');
      return report;
    } catch (error) {
      logError('Health report generation failed', error);
      throw error;
    }
  }

  /**
   * Run full maintenance
   */
  async runFullMaintenance() {
    try {
      logInfo('Starting full system maintenance...');
      
      await this.connect();
      
      const results = {
        logs: await this.cleanupLogs(),
        bookings: await this.cleanupOldBookings(),
        users: await this.cleanupInactiveUsers(),
        optimization: await this.optimizeIndexes(),
        healthReport: await this.generateHealthReport()
      };

      logInfo('Full maintenance completed successfully', results);
      return results;
    } catch (error) {
      logError('Full maintenance failed', error);
      throw error;
    } finally {
      await this.disconnect();
    }
  }
}

// CLI interface
if (require.main === module) {
  const maintenance = new MaintenanceService();
  const command = process.argv[2];

  const commands = {
    'logs': () => maintenance.cleanupLogs(),
    'bookings': () => maintenance.cleanupOldBookings(),
    'users': () => maintenance.cleanupInactiveUsers(),
    'optimize': () => maintenance.optimizeIndexes(),
    'health': () => maintenance.generateHealthReport(),
    'full': () => maintenance.runFullMaintenance()
  };

  if (commands[command]) {
    commands[command]()
      .then(() => {
        console.log(`✅ ${command} maintenance completed successfully`);
        process.exit(0);
      })
      .catch((error) => {
        console.error(`❌ ${command} maintenance failed:`, error.message);
        process.exit(1);
      });
  } else {
    console.log('Usage: node maintenance.js <command>');
    console.log('Commands:');
    console.log('  logs     - Clean up old log files');
    console.log('  bookings - Clean up old bookings');
    console.log('  users    - Deactivate inactive users');
    console.log('  optimize - Optimize database indexes');
    console.log('  health   - Generate health report');
    console.log('  full     - Run all maintenance tasks');
    process.exit(1);
  }
}

module.exports = MaintenanceService;
