import React, { Component } from 'react';
import { PhotoIcon, ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

class ImageErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      retryCount: 0,
      fallbackSrc: props.fallbackSrc || '/default-service-image.svg'
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error details
    console.error('Image Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error
    });

    // Log to debug logger if available
    if (window.debugLogger) {
      window.debugLogger.log('IMAGE_ERROR_BOUNDARY', 'Image error caught', {
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
      retryCount: prevState.retryCount + 1
    }));
  };

  handleImageError = (e) => {
    console.log('Image failed to load:', e.target.src);
    
    // Try fallback image
    if (e.target.src !== this.state.fallbackSrc) {
      e.target.src = this.state.fallbackSrc;
      e.target.onerror = null; // Prevent infinite loop
    } else {
      // If fallback also fails, show error state
      this.setState({ hasError: true });
    }
  };

  render() {
    if (this.state.hasError) {
      const { retryCount } = this.state;
      const maxRetries = 3;

      return (
        <div className="flex flex-col items-center justify-center p-4 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 min-h-[200px]">
          <PhotoIcon className="h-12 w-12 text-gray-400 mb-2" />
          
          <h3 className="text-sm font-medium text-gray-900 mb-1">
            فشل في تحميل الصورة
          </h3>
          
          <p className="text-xs text-gray-500 mb-4 text-center">
            حدث خطأ أثناء تحميل الصورة. يمكنك المحاولة مرة أخرى.
          </p>
          
          <div className="flex space-x-2 rtl:space-x-reverse">
            {retryCount < maxRetries && (
              <button
                onClick={this.handleRetry}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <ArrowPathIcon className="h-3 w-3 mr-1" />
                إعادة المحاولة ({retryCount + 1}/{maxRetries})
              </button>
            )}
            
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PhotoIcon className="h-3 w-3 mr-1" />
              عرض الصورة الافتراضية
            </button>
          </div>
          
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="mt-4 text-left w-full">
              <summary className="text-xs text-gray-500 cursor-pointer">
                تفاصيل الخطأ (للمطورين)
              </summary>
              <pre className="mt-2 text-xs text-gray-400 bg-gray-200 p-2 rounded overflow-auto">
                {this.state.error.toString()}
              </pre>
            </details>
          )}
        </div>
      );
    }

    // Render children with error handling
    return React.Children.map(this.props.children, child => {
      if (React.isValidElement(child) && child.type === 'img') {
        return React.cloneElement(child, {
          onError: this.handleImageError,
          ...child.props
        });
      }
      return child;
    });
  }
}

export default ImageErrorBoundary;
