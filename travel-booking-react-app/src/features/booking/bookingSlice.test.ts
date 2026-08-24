import { describe, it, expect } from 'vitest';
import reducer, { setSearchCriteria, resetSearch, type BookingState } from './bookingSlice';

/**
 * Unit Tests for bookingSlice Reducer
 *
 * Testing Redux reducers is straightforward because they are pure functions.
 * We pass an initial state and an action, and assert on the new state.
 */
describe('bookingSlice', () => {
  const initialState: BookingState = {
    origin: '',
    destination: '',
    date: '',
    passengers: 1,
    hasSearched: false,
  };

  it('should return the initial state when passed an empty action', () => {
    // We pass undefined as the state to trigger the default parameter logic in the reducer
    expect(reducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle setSearchCriteria', () => {
    const action = setSearchCriteria({
      origin: 'JFK',
      destination: 'LHR',
      date: '2024-12-01',
      passengers: 2,
    });

    const expectedState: BookingState = {
      origin: 'JFK',
      destination: 'LHR',
      date: '2024-12-01',
      passengers: 2,
      hasSearched: true, // This should automatically be set to true by the reducer
    };

    expect(reducer(initialState, action)).toEqual(expectedState);
  });

  it('should handle resetSearch', () => {
    const dirtyState: BookingState = {
      origin: 'SFO',
      destination: 'NRT',
      date: '2024-10-15',
      passengers: 1,
      hasSearched: true,
    };

    expect(reducer(dirtyState, resetSearch())).toEqual(initialState);
  });
});
