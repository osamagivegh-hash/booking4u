import React from 'react';

// COMPLETELY DISABLED: ApiDebugger - No API calls to prevent auto-refresh and backend status display
const ApiDebugger = () => {
  // COMPLETELY DISABLED: No API debugging, no API calls, no status display
  console.log('🛡️ ApiDebugger: COMPLETELY DISABLED - No API calls to prevent auto-refresh and backend status display');
  
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">🔧 API Debugger - DISABLED</h2>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-2 text-yellow-800">API Debugger Disabled</h3>
        <p className="text-yellow-700">
          API debugging has been completely disabled to prevent auto-refresh and backend status display on the homepage.
        </p>
        <p className="text-yellow-700 mt-2">
          This prevents any API calls that could cause the 30-second auto-refresh issue.
        </p>
      </div>
    </div>
  );
};

export default ApiDebugger;