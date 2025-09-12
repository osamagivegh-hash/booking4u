import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import './index.css';
import App from './App';

// Performance optimization - Keep console logs for debugging
// Note: Console logs are kept enabled to help with debugging auto-refresh issues
// if (process.env.NODE_ENV === 'production') {
//   // Disable console logs in production
//   console.log = () => {};
//   console.warn = () => {};
//   console.error = () => {};
// }

// Create a client with performance optimizations
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 10 * 60 * 1000, // 10 minutes (increased from 5 minutes)
      gcTime: 30 * 60 * 1000, // 30 minutes (increased from 10 minutes)
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchInterval: false, // Disable automatic refetching
      refetchIntervalInBackground: false, // Disable background refetching
    },
  },
});
// API_BASE_URL is now handled by apiConfig.js

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <App />
        <Toaster
          position="top-center"
          reverseOrder={false}
          gutter={8}
          containerClassName=""
          containerStyle={{}}
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#22c55e',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);

