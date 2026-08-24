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
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    const dateStr = futureDate.toISOString().split('T')[0];

    fireEvent.change(dateInput, { target: { value: dateStr } });

    // Submit form
    await user.click(submitBtn);

    // Verify Redux dispatch was called with correct payload
    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'booking/setSearchCriteria',
        payload: {
          origin: 'Seattle',
          destination: 'Tokyo',
          date: dateStr,
          passengers: 1 // Default value
        }
      })
    );
  });

  it('prevents submission and displays error when origin and destination are the same', async () => {
    const { dispatchSpy } = renderWithRedux();
    const user = userEvent.setup();

    const originInput = screen.getByLabelText(/from/i);
    const destinationInput = screen.getByLabelText(/to/i);
    const dateInput = screen.getByLabelText(/date/i);
    const submitBtn = screen.getByRole('button', { name: /search/i });

    await user.type(originInput, 'Tokyo');
    await user.type(destinationInput, 'Tokyo');

    // Use a future date to isolate the validation error
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    const dateStr = futureDate.toISOString().split('T')[0];
    fireEvent.change(dateInput, { target: { value: dateStr } });

    // Bypass built-in HTML5 validation handling by triggering the synthetic submit event manually on the form
    const form = submitBtn.closest('form') as HTMLFormElement;
    fireEvent.submit(form);

    // Verify error message is displayed
    const errorMsg = await screen.findByText(/origin and destination cannot be the same/i);
    expect(errorMsg).toBeInTheDocument();
    // Verify Redux dispatch was NOT called
    expect(dispatchSpy).not.toHaveBeenCalled();
  });

  it('prevents submission and displays error when date is in the past', async () => {
    const { dispatchSpy } = renderWithRedux();
    const user = userEvent.setup();

    const originInput = screen.getByLabelText(/from/i);
    const destinationInput = screen.getByLabelText(/to/i);
    const dateInput = screen.getByLabelText(/date/i);
    const submitBtn = screen.getByRole('button', { name: /search/i });

    await user.type(originInput, 'Seattle');
    await user.type(destinationInput, 'Tokyo');

    // Set a past date
    fireEvent.change(dateInput, { target: { value: '1999-01-01' } });

    const form = submitBtn.closest('form') as HTMLFormElement;
    fireEvent.submit(form);

    // Verify error message is displayed
    const errorMsg = await screen.findByText(/travel date cannot be in the past/i);
    expect(errorMsg).toBeInTheDocument();
    // Verify Redux dispatch was NOT called
    expect(dispatchSpy).not.toHaveBeenCalled();
  });
});
