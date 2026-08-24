import { configureStore } from '@reduxjs/toolkit';
import bookingReducer from '../features/booking/bookingSlice';

/**
 * Redux Store Configuration
 *
 * We use Redux Toolkit for clean client state management.
 * In a real application, Redux would manage UI state, auth state,
 * or complex multi-step form data.
 * Server state (like fetched flight data) is managed by TanStack Query.
 */
export const store = configureStore({
  reducer: {
    booking: bookingReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
