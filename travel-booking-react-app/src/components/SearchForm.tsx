import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Search } from 'lucide-react';
import { setSearchCriteria } from '../features/booking/bookingSlice';

/**
 * SearchForm Component
 *
 * Handles user input for travel criteria. It maintains local state for the form
 * while the user is typing, and only dispatches to the global Redux store when
 * the form is submitted. This prevents excessive re-renders and Redux updates.
 */
export const SearchForm: React.FC = () => {
  const dispatch = useDispatch();

  // Local state for the form inputs
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [passengers] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Dispatch the finalized search criteria to the global Redux store
    dispatch(
      setSearchCriteria({
        origin,
        destination,
        date,
        passengers,
      })
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-4xl mx-auto mt-8 border border-gray-200">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Find Your Flight</h2>

      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
        {/* Origin Field */}
        <div className="flex-1">
          <label htmlFor="origin" className="block text-sm font-medium text-gray-700 mb-1">From</label>
          <input
            id="origin"
            type="text"
            required
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            placeholder="City or Airport"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-800"
          />
        </div>

        {/* Destination Field */}
        <div className="flex-1">
          <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-1">To</label>
          <input
            id="destination"
            type="text"
            required
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="City or Airport"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-800"
          />
        </div>

        {/* Date Field */}
        <div className="flex-1">
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input
            id="date"
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-800"
          />
        </div>

        {/* Submit Button */}
        <div className="flex items-end">
          <button
            type="submit"
            className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center gap-2 transition-colors"
          >
            <Search size={20} />
            Search
          </button>
        </div>
      </form>
    </div>
  );
};
