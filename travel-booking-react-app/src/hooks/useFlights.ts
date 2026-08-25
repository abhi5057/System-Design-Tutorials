import { useQuery } from '@tanstack/react-query';
import { fetchFlights, type Flight } from '../api/mockApi';

/**
 * Custom Hook: useFlights
 *
 * Encapsulates the TanStack Query logic for fetching flights.
 * This separates the data fetching logic from the UI components.
 *
 * @param origin - The starting location
 * @param destination - The target location
 * @param date - The travel date
 * @param enabled - Boolean to control whether the query should run (e.g., wait for user to hit search)
 */
export const useFlights = (
  origin: string,
  destination: string,
  date: string,
  enabled: boolean
) => {
  return useQuery<Flight[], Error>({
    // The queryKey uniquely identifies this specific request.
    // If any dependency (origin, destination, date) changes, TanStack will re-fetch.
    queryKey: ['flights', origin, destination, date],

    // The queryFn is passed an object that includes the AbortSignal for cancellation.
    queryFn: async ({ signal }) => {
      // We pass the signal down to our mock API
      return fetchFlights(origin, destination, date, signal);
    },

    // Only run this query if the component tells us it's enabled (e.g., after initial search)
    enabled: enabled && origin.length > 0 && destination.length > 0,

    // In a real production app, we might retry failing network requests
    retry: false,
  });
};
