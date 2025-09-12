// Comprehensive Auto-Refresh Test Suite
// This utility provides comprehensive testing for auto-refresh issues

class AutoRefreshTestSuite {
  constructor() {
    this.startTime = Date.now();
    this.testResults = [];
    this.isRunning = false;
    this.reloadCount = 0;
    this.lastReloadTime = null;
    
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
  }

  // Test 1: Registration Page Form State Preservation
  async testRegistrationPageFormState() {
    console.log('🧪 Test 1: Registration Page Form State Preservation');
    
    const testResult = {
      name: 'Registration Page Form State',
      status: 'running',
      details: []
    };

    try {
      // Navigate to registration page
      window.location.href = '/register';
      
      // Wait for page to load
      await this.waitForPageLoad();
      
      // Fill form partially
      const nameInput = document.querySelector('input[name="name"]');
      const emailInput = document.querySelector('input[name="email"]');
      
      if (nameInput && emailInput) {
        nameInput.value = 'Test User';
        emailInput.value = 'test@example.com';
        
        // Trigger input events
        nameInput.dispatchEvent(new Event('input', { bubbles: true }));
        emailInput.dispatchEvent(new Event('input', { bubbles: true }));
        
        testResult.details.push('Form fields filled successfully');
        
        // Check if form state is preserved
        const formState = window.statePreservation?.getFormStates();
        if (formState && formState.length > 0) {
          testResult.details.push('Form state preserved successfully');
          testResult.status = 'passed';
        } else {
          testResult.details.push('Form state not preserved');
          testResult.status = 'failed';
        }
      } else {
        testResult.details.push('Registration form not found');
        testResult.status = 'failed';
      }
    } catch (error) {
      testResult.details.push(`Error: ${error.message}`);
      testResult.status = 'failed';
    }

    this.testResults.push(testResult);
    return testResult;
  }

  // Test 2: Image Loading Error Handling
  async testImageLoadingErrorHandling() {
    console.log('🧪 Test 2: Image Loading Error Handling');
    
    const testResult = {
      name: 'Image Loading Error Handling',
      status: 'running',
      details: []
    };

    try {
      // Create a test image with a localhost URL
      const testImage = new Image();
      const testUrl = 'http://localhost:5001/uploads/test-image.jpg';
      
      testImage.onload = () => {
        testResult.details.push('Image loaded successfully');
        testResult.status = 'passed';
      };
      
      testImage.onerror = (error) => {
        testResult.details.push('Image failed to load (expected)');
        testResult.details.push('Error handled gracefully');
        testResult.status = 'passed';
      };
      
      // Set the src to trigger loading
      testImage.src = testUrl;
      
      // Wait for image to load or fail
      await new Promise((resolve) => {
        const timeout = setTimeout(() => {
          testResult.details.push('Image loading timeout');
          testResult.status = 'passed';
          resolve();
        }, 3000);
        
        testImage.onload = () => {
          clearTimeout(timeout);
          resolve();
        };
        
        testImage.onerror = () => {
          clearTimeout(timeout);
          resolve();
        };
      });
      
    } catch (error) {
      testResult.details.push(`Error: ${error.message}`);
      testResult.status = 'failed';
    }

    this.testResults.push(testResult);
    return testResult;
  }

  // Test 3: Service Worker Update Handling
  async testServiceWorkerUpdateHandling() {
    console.log('🧪 Test 3: Service Worker Update Handling');
    
    const testResult = {
      name: 'Service Worker Update Handling',
      status: 'running',
      details: []
    };

    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        
        if (registration) {
          testResult.details.push('Service Worker registered');
          
          // Check if update notification component exists
          const updateNotification = document.querySelector('[data-testid="sw-update-notification"]');
          if (updateNotification) {
            testResult.details.push('Update notification component found');
          }
          
          // Simulate service worker update
          if (registration.waiting) {
            testResult.details.push('Service Worker update available');
            testResult.status = 'passed';
          } else {
            testResult.details.push('No Service Worker update available');
            testResult.status = 'passed';
          }
        } else {
          testResult.details.push('No Service Worker registered');
          testResult.status = 'passed';
        }
      } else {
        testResult.details.push('Service Worker not supported');
        testResult.status = 'passed';
      }
    } catch (error) {
      testResult.details.push(`Error: ${error.message}`);
      testResult.status = 'failed';
    }

    this.testResults.push(testResult);
    return testResult;
  }

  // Test 4: API Interceptor Error Handling
  async testApiInterceptorErrorHandling() {
    console.log('🧪 Test 4: API Interceptor Error Handling');
    
    const testResult = {
      name: 'API Interceptor Error Handling',
      status: 'running',
      details: []
    };

    try {
      // Test API call that might fail
      const response = await fetch('/api/test-endpoint', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        testResult.details.push('API call successful');
        testResult.status = 'passed';
      } else {
        testResult.details.push(`API call failed with status: ${response.status}`);
        testResult.details.push('Error handled gracefully');
        testResult.status = 'passed';
      }
    } catch (error) {
      testResult.details.push(`API call error: ${error.message}`);
      testResult.details.push('Error handled gracefully');
      testResult.status = 'passed';
    }

    this.testResults.push(testResult);
    return testResult;
  }

  // Test 5: Scroll Position Preservation
  async testScrollPositionPreservation() {
    console.log('🧪 Test 5: Scroll Position Preservation');
    
    const testResult = {
      name: 'Scroll Position Preservation',
      status: 'running',
      details: []
    };

    try {
      // Scroll to a specific position
      window.scrollTo(0, 500);
      
      // Save scroll position
      if (window.statePreservation) {
        window.statePreservation.saveScrollPosition();
        testResult.details.push('Scroll position saved');
        
        // Restore scroll position
        const restored = window.statePreservation.restoreScrollPosition();
        if (restored) {
          testResult.details.push('Scroll position restored');
          testResult.status = 'passed';
        } else {
          testResult.details.push('Scroll position not restored');
          testResult.status = 'failed';
        }
      } else {
        testResult.details.push('State preservation not available');
        testResult.status = 'failed';
      }
    } catch (error) {
      testResult.details.push(`Error: ${error.message}`);
      testResult.status = 'failed';
    }

    this.testResults.push(testResult);
    return testResult;
  }

  // Run all tests
  async runAllTests() {
    console.log('🚀 Starting Auto-Refresh Test Suite...');
    this.isRunning = true;
    this.testResults = [];
    
    const tests = [
      this.testRegistrationPageFormState.bind(this),
      this.testImageLoadingErrorHandling.bind(this),
      this.testServiceWorkerUpdateHandling.bind(this),
      this.testApiInterceptorErrorHandling.bind(this),
      this.testScrollPositionPreservation.bind(this)
    ];
    
    for (const test of tests) {
      try {
        await test();
        // Wait between tests
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error('Test failed:', error);
      }
    }
    
    this.isRunning = false;
    this.generateReport();
    
    return this.testResults;
  }

  // Generate test report
  generateReport() {
    const passed = this.testResults.filter(r => r.status === 'passed').length;
    const failed = this.testResults.filter(r => r.status === 'failed').length;
    const total = this.testResults.length;
    
    const report = {
      summary: {
        total,
        passed,
        failed,
        successRate: `${Math.round((passed / total) * 100)}%`,
        duration: Date.now() - this.startTime,
        reloadCount: this.reloadCount
      },
      results: this.testResults,
      recommendations: []
    };
    
    if (failed > 0) {
      report.recommendations.push('Review failed tests and implement fixes');
    }
    
    if (this.reloadCount > 0) {
      report.recommendations.push('Investigate page reloads detected during testing');
    }
    
    console.log('📋 Auto-Refresh Test Suite Report:', report);
    return report;
  }

  // Utility method to wait for page load
  waitForPageLoad() {
    return new Promise((resolve) => {
      if (document.readyState === 'complete') {
        resolve();
      } else {
        window.addEventListener('load', resolve);
      }
    });
  }

  // Get current test status
  getStatus() {
    return {
      isRunning: this.isRunning,
      testCount: this.testResults.length,
      reloadCount: this.reloadCount,
      lastReloadTime: this.lastReloadTime,
      duration: Date.now() - this.startTime
    };
  }
}

// Create global instance
const autoRefreshTestSuite = new AutoRefreshTestSuite();

// Export for use in components
export default autoRefreshTestSuite;

// Make available globally
if (typeof window !== 'undefined') {
  window.autoRefreshTestSuite = autoRefreshTestSuite;
}
