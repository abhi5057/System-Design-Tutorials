import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { SearchResults } from './SearchResults';
import { useFlights } from '../hooks/useFlights';


// We mock the custom hook directly. This allows us to test the component's
// rendering logic independently of the TanStack Query caching/fetching logic.
vi.mock('../hooks/useFlights');

describe('SearchResults Component', () => {
  // Setup a mock Redux store
  const setupStore = (hasSearched: boolean = true) => configureStore({
    reducer: {
      booking: (state = { origin: 'SFO', destination: 'LAX', date: '2024-12-01', passengers: 1, hasSearched }, _action) => state
    }
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing if user has not searched yet', () => {
    const store = setupStore(false); // hasSearched = false

    // Mock the hook return value
    vi.mocked(useFlights).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    const { container } = render(
      <Provider store={store}>
        <SearchResults />
      </Provider>
    );

    expect(container.firstChild).toBeNull();
  });

  it('displays loading state correctly', () => {
    const store = setupStore(true);

    vi.mocked(useFlights).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    } as any);

    render(
      <Provider store={store}>
        <SearchResults />
      </Provider>
    );

    expect(screen.getByTestId('loading-state')).toBeInTheDocument();
    expect(screen.getByText(/searching for flights/i)).toBeInTheDocument();
  });

  it('displays error state correctly', () => {
    const store = setupStore(true);
    const errorMessage = 'Failed to fetch flights';

    vi.mocked(useFlights).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error(errorMessage),
    } as any);

    render(
      <Provider store={store}>
        <SearchResults />
      </Provider>
    );

    expect(screen.getByTestId('error-state')).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('renders flight data correctly', () => {
    const store = setupStore(true);
    const mockFlights = [
      { id: '1', airline: 'Oceanic', flightNumber: '815', departureTime: '08:00', arrivalTime: '12:00', price: 500 }
    ];

    vi.mocked(useFlights).mockReturnValue({
      data: mockFlights,
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    render(
      <Provider store={store}>
        <SearchResults />
      </Provider>
    );

    expect(screen.getByTestId('results-state')).toBeInTheDocument();
    expect(screen.getByText(/Available Flights: SFO to LAX/i)).toBeInTheDocument();
    expect(screen.getByText('Oceanic')).toBeInTheDocument();
    expect(screen.getByText('$500')).toBeInTheDocument();
  });
});
