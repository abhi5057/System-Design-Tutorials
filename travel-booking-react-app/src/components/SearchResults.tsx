import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { useFlights } from '../hooks/useFlights';
import { Plane, AlertCircle } from 'lucide-react';

/**
 * SearchResults Component
 *
 * Reads the current search criteria from the global Redux store, and uses
 * those criteria to fetch data via our TanStack Query hook (useFlights).
 */
export const SearchResults: React.FC = () => {
  // 1. Read Client State from Redux
  const { origin, destination, date, hasSearched } = useSelector(
    (state: RootState) => state.booking
  );

  // 2. Fetch Server State via TanStack Query
  // We only run the query if the user has actually initiated a search.
  const { data: flights, isLoading, isError, error } = useFlights(
    origin,
    destination,
    date,
    hasSearched
  );

  // If the user hasn't searched yet, show nothing or a placeholder
  if (!hasSearched) {
    return null;
  }

  // Handle Loading State
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center mt-12 space-y-4" data-testid="loading-state">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-gray-600 font-medium">Searching for flights...</p>
      </div>
    );
  }

  // Handle Error State
  if (isError) {
    return (
      <div className="bg-red-50 p-4 rounded-md flex items-start gap-3 max-w-4xl mx-auto mt-8 border border-red-200" data-testid="error-state">
        <AlertCircle className="text-red-500 mt-0.5" size={20} />
        <div>
          <h3 className="text-red-800 font-semibold">Error fetching flights</h3>
          <p className="text-red-600 text-sm">{error?.message || 'An unknown error occurred'}</p>
        </div>
      </div>
    );
  }

  // Handle Empty State
  if (!flights || flights.length === 0) {
    return (
      <div className="text-center mt-12 max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-sm border border-gray-200">
        <Plane className="mx-auto text-gray-400 mb-3" size={48} />
        <h3 className="text-xl font-semibold text-gray-800">No flights found</h3>
        <p className="text-gray-500 mt-2">Try adjusting your search criteria.</p>
      </div>
    );
  }

  // Render Data
  return (
    <div className="max-w-4xl mx-auto mt-8" data-testid="results-state">
      <h3 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">
        Available Flights: {origin} to {destination}
      </h3>

      <div className="space-y-4">
        {flights.map((flight) => (
          <div
            key={flight.id}
            className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 flex flex-col sm:flex-row justify-between items-center hover:shadow-md transition-shadow"
            data-testid={`flight-card-${flight.id}`}
          >
            <div className="flex items-center gap-4 mb-4 sm:mb-0">
              <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                <Plane size={24} />
              </div>
              <div>
                <h4 className="font-bold text-gray-800">{flight.airline}</h4>
                <p className="text-sm text-gray-500">Flight {flight.flightNumber}</p>
              </div>
            </div>

            <div className="flex flex-col text-center px-6">
              <span className="font-semibold text-gray-800">{flight.departureTime}</span>
              <span className="text-xs text-gray-400 border-t border-gray-200 pt-1 mt-1 w-24">Direct</span>
            </div>

            <div className="flex flex-col text-center px-6">
              <span className="font-semibold text-gray-800">{flight.arrivalTime}</span>
            </div>

            <div className="flex flex-col items-end mt-4 sm:mt-0 ml-auto">
              <span className="text-2xl font-bold text-blue-600">${flight.price}</span>
              <button className="mt-2 bg-blue-50 text-blue-700 hover:bg-blue-100 px-4 py-1.5 rounded text-sm font-semibold transition-colors">
                Select
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
