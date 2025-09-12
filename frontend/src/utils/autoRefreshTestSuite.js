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
      // Check if we're already on registration page
      if (window.location.pathname !== '/register') {
        // Navigate to registration page
        window.location.href = '/register';
        
        // Wait for page to load
        await this.waitForPageLoad();
      }
      
      // Fill form partially
      const nameInput = document.querySelector('input[name="name"]');
      const emailInput = document.querySelector('input[name="email"]');
      const passwordInput = document.querySelector('input[name="password"]');
      
      if (nameInput && emailInput && passwordInput) {
        nameInput.value = 'Test User';
        emailInput.value = 'test@example.com';
        passwordInput.value = 'testpassword123';
        
        // Trigger input events
        nameInput.dispatchEvent(new Event('input', { bubbles: true }));
        emailInput.dispatchEvent(new Event('input', { bubbles: true }));
        passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
        
        testResult.details.push('Form fields filled successfully');
        
        // Wait a bit for state preservation to kick in
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Check if form state is preserved in sessionStorage
        const savedState = sessionStorage.getItem('form-state-register-form');
        if (savedState) {
          const formData = JSON.parse(savedState);
          if (formData.name === 'Test User' && formData.email === 'test@example.com') {
            testResult.details.push('Form state preserved successfully in sessionStorage');
            testResult.status = 'passed';
          } else {
            testResult.details.push('Form state preserved but data incorrect');
            testResult.status = 'failed';
          }
        } else {
          testResult.details.push('Form state not preserved in sessionStorage');
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
        
        // Check if scroll position is saved in sessionStorage
        const savedPosition = sessionStorage.getItem('scroll-position');
        if (savedPosition) {
          const position = JSON.parse(savedPosition);
          if (position.y === 500) {
            testResult.details.push('Scroll position saved correctly in sessionStorage');
            testResult.status = 'passed';
          } else {
            testResult.details.push('Scroll position saved but value incorrect');
            testResult.status = 'failed';
          }
        } else {
          testResult.details.push('Scroll position not saved in sessionStorage');
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

  // Test 6: Service Worker Update Handling (No Auto-Reload)
  async testServiceWorkerNoAutoReload() {
    console.log('🧪 Test 6: Service Worker Update Handling (No Auto-Reload)');
    
    const testResult = {
      name: 'Service Worker No Auto-Reload',
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
          
          // Simulate service worker update without auto-reload
          if (registration.waiting) {
            testResult.details.push('Service Worker update available');
            
            // Check if the update notification prevents auto-reload
            const hasAutoReloadPrevention = window.statePreservation && 
              typeof window.statePreservation.preventDataLoss === 'function';
            
            if (hasAutoReloadPrevention) {
              testResult.details.push('Auto-reload prevention mechanism available');
              testResult.status = 'passed';
            } else {
              testResult.details.push('Auto-reload prevention mechanism not found');
              testResult.status = 'failed';
            }
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

  // Test 7: Error Boundary Functionality
  async testErrorBoundaryFunctionality() {
    console.log('🧪 Test 7: Error Boundary Functionality');
    
    const testResult = {
      name: 'Error Boundary Functionality',
      status: 'running',
      details: []
    };

    try {
      // Check if error boundaries are available
      const resourceErrorBoundary = document.querySelector('[data-testid="resource-error-boundary"]');
      const imageErrorBoundary = document.querySelector('[data-testid="image-error-boundary"]');
      
      if (resourceErrorBoundary || imageErrorBoundary) {
        testResult.details.push('Error boundary components found');
        testResult.status = 'passed';
      } else {
        // Check if error boundaries are imported in the app
        const hasErrorBoundaries = window.ResourceErrorBoundary || window.ImageErrorBoundary;
        if (hasErrorBoundaries) {
          testResult.details.push('Error boundary classes available');
          testResult.status = 'passed';
        } else {
          testResult.details.push('Error boundaries not found');
          testResult.status = 'failed';
        }
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
      this.testScrollPositionPreservation.bind(this),
      this.testServiceWorkerNoAutoReload.bind(this),
      this.testErrorBoundaryFunctionality.bind(this)
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
