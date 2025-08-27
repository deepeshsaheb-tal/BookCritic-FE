import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import * as serviceWorkerRegistration from './serviceWorkerRegistration.ts';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider } from './context/auth-context.tsx';
import { prefetchInitialData } from './utils/query-prefetching.ts';
import { initPerformanceMonitoring } from './utils/performance-monitoring.ts';

// Create a client with optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 60 * 1000, // 1 minute
      cacheTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Prefetch initial data
prefetchInitialData(queryClient).catch(console.error);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <App />
        </AuthProvider>
        {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);

// Register service worker for offline capabilities and faster loading
serviceWorkerRegistration.register({
  onUpdate: (registration) => {
    // Show a notification to the user that there's a new version available
    const updateApp = window.confirm('New version available! Update now?');
    if (updateApp && registration && registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  },
  onSuccess: () => {
    console.log('App is now available offline!');
  }
});

// Initialize performance monitoring
initPerformanceMonitoring();
