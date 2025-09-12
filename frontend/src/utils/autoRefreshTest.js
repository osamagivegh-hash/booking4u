// Auto-Refresh Test Utility
// This script helps test and monitor the auto-refresh fixes

class AutoRefreshTest {
  constructor() {
    this.startTime = Date.now();
    this.reloadCount = 0;
    this.lastReloadTime = null;
    this.intervals = new Set();
    this.timeouts = new Set();
    this.isMonitoring = false;
    
    this.setupMonitoring();
  }

  setupMonitoring() {
    // Monitor page reloads
    window.addEventListener('beforeunload', () => {
      this.reloadCount++;
      this.lastReloadTime = Date.now();
      console.log('🚨 PAGE RELOAD DETECTED:', {
        count: this.reloadCount,
        time: new Date().toISOString(),
        elapsed: Date.now() - this.startTime
      });
    });

    // Monitor intervals
    const originalSetInterval = window.setInterval;
    window.setInterval = (callback, delay, ...args) => {
      const id = originalSetInterval(callback, delay, ...args);
      this.intervals.add({ id, delay, callback: callback.toString().substring(0, 50) });
      
      console.log('⏰ Interval created:', {
        id,
        delay,
        callback: callback.toString().substring(0, 50),
        totalIntervals: this.intervals.size
      });
      
      return id;
    };

    // Monitor timeouts
    const originalSetTimeout = window.setTimeout;
    window.setTimeout = (callback, delay, ...args) => {
      const id = originalSetTimeout(callback, delay, ...args);
      
      // Only track long timeouts or those that might cause reloads
      if (delay > 1000 || callback.toString().includes('reload') || callback.toString().includes('location')) {
        this.timeouts.add({ id, delay, callback: callback.toString().substring(0, 50) });
        
        console.log('⏱️ Timeout created (potential reload trigger):', {
          id,
          delay,
          callback: callback.toString().substring(0, 50),
          totalTimeouts: this.timeouts.size
        });
      }
      
      return id;
    };

    this.isMonitoring = true;
    console.log('🔍 Auto-refresh monitoring started');
  }

  getStatus() {
    const now = Date.now();
    const elapsed = now - this.startTime;
    
    return {
      monitoring: this.isMonitoring,
      startTime: this.startTime,
      elapsed: elapsed,
      reloadCount: this.reloadCount,
      lastReloadTime: this.lastReloadTime,
      intervals: Array.from(this.intervals),
      timeouts: Array.from(this.timeouts),
      status: this.reloadCount === 0 ? '✅ No reloads detected' : `⚠️ ${this.reloadCount} reload(s) detected`
    };
  }

  logStatus() {
    const status = this.getStatus();
    console.log('📊 Auto-Refresh Test Status:', status);
    return status;
  }

  // Test function to verify no auto-refresh
  runTest(duration = 60000) { // 1 minute default
    console.log(`🧪 Starting auto-refresh test for ${duration/1000} seconds...`);
    
    const testInterval = setInterval(() => {
      const status = this.getStatus();
      console.log(`⏱️ Test progress: ${Math.round((Date.now() - this.startTime) / 1000)}s elapsed, ${status.reloadCount} reloads`);
    }, 10000); // Log every 10 seconds
    
    setTimeout(() => {
      clearInterval(testInterval);
      const finalStatus = this.getStatus();
      
      console.log('🏁 Auto-refresh test completed:', finalStatus);
      
      if (finalStatus.reloadCount === 0) {
        console.log('✅ SUCCESS: No auto-refresh detected during test period');
      } else {
        console.log('❌ FAILURE: Auto-refresh detected during test period');
      }
      
      return finalStatus;
    }, duration);
  }

  // Check for potential reload triggers
  checkForTriggers() {
    const triggers = [];
    
    // Check for intervals that might cause issues
    this.intervals.forEach(interval => {
      if (interval.delay < 60000) { // Less than 1 minute
        triggers.push({
          type: 'interval',
          delay: interval.delay,
          description: 'Frequent interval that might cause issues'
        });
      }
    });
    
    // Check for timeouts that might cause issues
    this.timeouts.forEach(timeout => {
      if (timeout.delay > 10000) { // More than 10 seconds
        triggers.push({
          type: 'timeout',
          delay: timeout.delay,
          description: 'Long timeout that might cause issues'
        });
      }
    });
    
    return triggers;
  }

  // Generate test report
  generateReport() {
    const status = this.getStatus();
    const triggers = this.checkForTriggers();
    
    const report = {
      timestamp: new Date().toISOString(),
      testDuration: status.elapsed,
      reloadCount: status.reloadCount,
      status: status.reloadCount === 0 ? 'PASS' : 'FAIL',
      intervals: status.intervals.length,
      timeouts: status.timeouts.length,
      potentialTriggers: triggers,
      recommendations: []
    };
    
    if (status.reloadCount > 0) {
      report.recommendations.push('Investigate reload triggers in debug logs');
    }
    
    if (triggers.length > 0) {
      report.recommendations.push('Review frequent intervals and long timeouts');
    }
    
    if (status.intervals.length > 5) {
      report.recommendations.push('Consider reducing number of active intervals');
    }
    
    console.log('📋 Auto-Refresh Test Report:', report);
    return report;
  }
}

// Create global instance
window.autoRefreshTest = new AutoRefreshTest();

// Export for use in components
export default window.autoRefreshTest;
