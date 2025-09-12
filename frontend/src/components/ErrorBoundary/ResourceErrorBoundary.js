import React, { Component } from 'react';
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

class ResourceErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error details
    console.error('Resource Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Log to debug logger if available
    if (window.debugLogger) {
      window.debugLogger.log('ERROR_BOUNDARY', 'Resource error caught', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString()
      });
    }
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  handleReload = () => {
    // Use a gentle reload that preserves some state
    if (window.statePreservation) {
      window.statePreservation.saveScrollPosition();
      window.statePreservation.saveAllFormStates();
    }
    
    // Use location.reload with a small delay to allow state saving
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  handleReset = () => {
    // Reset error boundary state without reloading
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    });
  };

  render() {
    if (this.state.hasError) {
      const { retryCount } = this.state;
      const maxRetries = 3;

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
            <ExclamationTriangleIcon className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              خطأ في تحميل المورد
            </h1>
            
            <p className="text-gray-600 mb-6">
              حدث خطأ أثناء تحميل أحد الموارد. يمكنك المحاولة مرة أخرى أو إعادة تحميل الصفحة.
            </p>
            
            <div className="space-y-4">
              {retryCount < maxRetries && (
                <button
                  onClick={this.handleRetry}
                  className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <ArrowPathIcon className="h-4 w-4 mr-2" />
                  المحاولة مرة أخرى ({retryCount + 1}/{maxRetries})
                </button>
              )}
              
              <button
                onClick={this.handleReset}
                className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <ArrowPathIcon className="h-4 w-4 mr-2" />
                إعادة تعيين (بدون إعادة تحميل)
              </button>
              
              <button
                onClick={this.handleReload}
                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <ArrowPathIcon className="h-4 w-4 mr-2" />
                إعادة تحميل الصفحة
              </button>
            </div>
            
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-6 text-left">
                <summary className="text-sm text-gray-500 cursor-pointer">
                  تفاصيل الخطأ (للمطورين)
                </summary>
                <pre className="mt-2 text-xs text-gray-400 bg-gray-100 p-2 rounded overflow-auto">
                  {this.state.error && this.state.error.toString()}
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ResourceErrorBoundary;
