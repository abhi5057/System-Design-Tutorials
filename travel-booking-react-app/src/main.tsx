import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { store } from './store';
import './index.css';
import App from './App.tsx';

/**
 * Global QueryClient instance for TanStack Query
 *
 * We configure the default options for queries here.
 * For example, we could set staleTime to avoid unnecessary refetches.
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false, // Prevents unnecessary refetches on focus
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Redux Provider for Client State */}
    <Provider store={store}>
      {/* TanStack Query Provider for Server State */}
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </Provider>
  </StrictMode>
);
