/**
 * Flight Entity Interface
 *
 * Represents the structure of a flight record coming from our "backend".
 */
export interface Flight {
  id: string;
  airline: string;
  flightNumber: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
}

/**
 * Mock Flight Data
 */
const MOCK_FLIGHTS: Flight[] = [
  { id: '1', airline: 'Oceanic Airlines', flightNumber: 'OA815', departureTime: '08:00 AM', arrivalTime: '11:00 AM', price: 250 },
  { id: '2', airline: 'Global Air', flightNumber: 'GA404', departureTime: '01:00 PM', arrivalTime: '04:30 PM', price: 320 },
  { id: '3', airline: 'Velocity Jet', flightNumber: 'VJ777', departureTime: '06:00 PM', arrivalTime: '09:15 PM', price: 180 },
];

/**
 * Mock API Client
 *
 * Simulates a network request to fetch flight data.
 * Includes support for AbortController signals to allow TanStack Query
 * to cancel requests if a component unmounts or criteria change quickly.
 */
export const fetchFlights = async (
  _origin: string,
  _destination: string,
  _date: string,
  signal?: AbortSignal
): Promise<Flight[]> => {
  // Simulate network latency
  return new Promise((resolve, reject) => {
    // Set up a timeout for the mock response
    const timeoutId = setTimeout(() => {
      // In a real app, we would filter based on origin, destination, date here
      resolve(MOCK_FLIGHTS);
    }, 1500);

    // If the request is cancelled via the AbortSignal, we clear the timeout and reject
    if (signal) {
      signal.addEventListener('abort', () => {
        clearTimeout(timeoutId);
        reject(new DOMException('Request aborted', 'AbortError'));
      });
    }
  });
};
