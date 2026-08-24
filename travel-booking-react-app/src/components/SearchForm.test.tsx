import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import bookingReducer from '../features/booking/bookingSlice';
import { SearchForm } from './SearchForm';


/**
 * Component Tests for SearchForm
 *
 * Verifies that user interactions correctly update local state and ultimately
 * dispatch the expected action to the Redux store upon submission.
 */
describe('SearchForm Component', () => {
  // Helper function to render the component within a Redux Provider
  const renderWithRedux = () => {
    const store = configureStore({
      reducer: { booking: bookingReducer }
    });

    // Spy on the store's dispatch method
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    render(
      <Provider store={store}>
        <SearchForm />
      </Provider>
    );

    return { store, dispatchSpy };
  };

  it('renders all form inputs correctly', () => {
    renderWithRedux();

    expect(screen.getByLabelText(/from/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/to/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/date/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
  });

  it('allows user to input data and dispatches correct action on submit', async () => {
    const { dispatchSpy } = renderWithRedux();
    const user = userEvent.setup();

    // Find elements
    const originInput = screen.getByLabelText(/from/i);
    const destinationInput = screen.getByLabelText(/to/i);
    const dateInput = screen.getByLabelText(/date/i);
    const submitBtn = screen.getByRole('button', { name: /search/i });

    // Simulate user typing
    await user.type(originInput, 'Seattle');
    await user.type(destinationInput, 'Tokyo');

    // Simulate setting date (often easier with fireEvent for date inputs)
    fireEvent.change(dateInput, { target: { value: '2025-01-01' } });

    // Submit form
    await user.click(submitBtn);

    // Verify Redux dispatch was called with correct payload
    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'booking/setSearchCriteria',
        payload: {
          origin: 'Seattle',
          destination: 'Tokyo',
          date: '2025-01-01',
          passengers: 1 // Default value
        }
      })
    );
  });
});
