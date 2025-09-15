import React from 'react';

// COMPLETELY DISABLED: ApiErrorBoundary - No API status checking to prevent backend components
// This component is completely disabled to prevent any backend status from showing on the homepage
const ApiErrorBoundary = ({ children }) => {
  // COMPLETELY DISABLED: No API status checking, no state, no effects, no API calls
  // This prevents any backend-related components from showing on the homepage
  console.log('🛡️ ApiErrorBoundary: COMPLETELY DISABLED - No API status checking to prevent backend components on homepage');
  
  // Always render children without any API status checking or display
  return children;
};

export default ApiErrorBoundary;
