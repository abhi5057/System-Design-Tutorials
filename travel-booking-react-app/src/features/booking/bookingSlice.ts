import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

/**
 * Interface representing the client state for a travel booking search.
 * We use Redux to manage this state globally so it can be accessed
 * by both the SearchForm (to update it) and SearchResults (to read it).
 */
export interface BookingState {
  origin: string;
  destination: string;
  date: string;
  passengers: number;
  hasSearched: boolean; // Tracks if a search has been initiated
}

const initialState: BookingState = {
  origin: '',
  destination: '',
  date: '',
  passengers: 1,
  hasSearched: false,
};

/**
 * Booking Slice
 *
 * Manages the search criteria for finding flights/hotels.
 * This is client state, representing the user's intent, before
 * we fetch the actual server state (the search results).
 */
export const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    // Updates the search criteria
    setSearchCriteria: (
      state,
      action: PayloadAction<Omit<BookingState, 'hasSearched'>>
    ) => {
      state.origin = action.payload.origin;
      state.destination = action.payload.destination;
      state.date = action.payload.date;
      state.passengers = action.payload.passengers;
      state.hasSearched = true;
    },
    // Resets the search form to initial state
    resetSearch: () => initialState,
  },
});

export const { setSearchCriteria, resetSearch } = bookingSlice.actions;

export default bookingSlice.reducer;
