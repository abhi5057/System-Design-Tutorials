import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useFlights } from './useFlights';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import * as mockApi from '../api/mockApi';

// Mock the API module so we don't make actual network/timeout calls during tests
vi.mock('../api/mockApi', () => ({
  fetchFlights: vi.fn(),
}));

/**
 * Unit Tests for useFlights Custom Hook
 *
 * We use renderHook from React Testing Library to test custom hooks in isolation.
 * We must wrap the hook in a QueryClientProvider because useQuery requires it.
 */
describe('useFlights Hook', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    // Create a new QueryClient for each test to prevent state bleeding
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false, // Disable retries for faster test failures
        },
      },
    });
    vi.clearAllMocks();
  });

  // Wrapper component to provide the React Query context
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should not fetch if enabled is false', () => {
    const { result } = renderHook(
      () => useFlights('JFK', 'LHR', '2024-12-01', false),
      { wrapper }
    );

    // The status should be 'pending' but fetchStatus should be 'idle' because it's disabled
    expect(result.current.isPending).toBe(true);
    expect(result.current.fetchStatus).toBe('idle');
    expect(mockApi.fetchFlights).not.toHaveBeenCalled();
  });

  it('should fetch and return flights when successful', async () => {
    const mockData = [
      { id: '1', airline: 'TestAir', flightNumber: 'TA1', departureTime: '10:00', arrivalTime: '12:00', price: 100 }
    ];

    // Setup the mock implementation to resolve successfully
    vi.mocked(mockApi.fetchFlights).mockResolvedValueOnce(mockData);

    const { result } = renderHook(
      () => useFlights('JFK', 'LHR', '2024-12-01', true),
      { wrapper }
    );

    // Wait for the hook to finish loading
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockData);
    expect(mockApi.fetchFlights).toHaveBeenCalledTimes(1);
    expect(mockApi.fetchFlights).toHaveBeenCalledWith('JFK', 'LHR', '2024-12-01', expect.any(AbortSignal));
  });

  it('should handle errors gracefully', async () => {
    const errorMsg = 'Network Error';
    vi.mocked(mockApi.fetchFlights).mockRejectedValueOnce(new Error(errorMsg));

    const { result } = renderHook(
      () => useFlights('JFK', 'LHR', '2024-12-01', true),
      { wrapper }
    );

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error?.message).toBe(errorMsg);
  });
});
