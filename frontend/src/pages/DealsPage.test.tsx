import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DealsPage from './DealsPage';
import { BrowserRouter as Router } from 'react-router-dom'; // Needed if component uses Link/Navigate

// Mock the gqlClient to avoid actual network requests
vi.mock('../lib/graphqlClient', () => ({
  gqlClient: {
    request: vi.fn(),
  },
}));

// Mock Chakra UI components used directly or indirectly if needed
// Example: Mocking useToast if it causes issues in test environment
vi.mock('@chakra-ui/react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@chakra-ui/react')>();
  return {
    ...actual,
    useToast: () => vi.fn(), // Simple mock for useToast
  };
});

describe('DealsPage', () => {
  it('renders the main heading', async () => {
    // Mock the initial fetch response (empty array)
    const mockClient = await import('../lib/graphqlClient');
    (mockClient.gqlClient.request as ReturnType<typeof vi.fn>).mockResolvedValue({ deals: [] });

    render(
      <Router>
        <DealsPage />
      </Router>
    );

    // Wait for the loading state to resolve (even with mocked data)
    // Check for the heading using a regex to be case-insensitive
    const heading = await screen.findByRole('heading', {
      name: /deals management/i,
      level: 2, // Specify h2 if appropriate
    });

    expect(heading).toBeInTheDocument();

    // Optionally, check that loading spinner is gone
    expect(screen.queryByText(/loading deals.../i)).not.toBeInTheDocument();
  });

  it('shows loading state initially', async () => {
    // Don't resolve the promise immediately
    const mockClient = vi.mocked( (await import('../lib/graphqlClient')).gqlClient );
    mockClient.request.mockReturnValue(new Promise(() => {})); // Keep promise pending

    render(
      <Router>
        <DealsPage />
      </Router>
    );

    // Check for loading text
    expect(screen.getByText(/loading deals.../i)).toBeInTheDocument();

    // Check that the table is not yet rendered (or check for absence of specific table elements)
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('shows error state on fetch failure', async () => {
    const errorMessage = 'Network Error: Failed to fetch';
    // Mock the request to reject with an error
    const mockClient = await import('../lib/graphqlClient');
    (mockClient.gqlClient.request as ReturnType<typeof vi.fn>).mockRejectedValue(
      { response: { errors: [{ message: errorMessage }] } } // Simulate GraphQL error structure
    );

    render(
      <Router>
        <DealsPage />
      </Router>
    );

    // Wait for the error alert to appear, as this is the final state
    const alert = await screen.findByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent(errorMessage);
    expect(alert).toHaveTextContent(/error loading deals:/i);

    // After confirming the error state, check that loading spinner is gone and table is not shown
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument(); // Check for Spinner role
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('renders the table with deals data', async () => {
    const mockDeals = [
      {
        id: 'deal-1',
        name: 'Test Deal 1',
        stage: 'Prospecting',
        amount: 5000,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        person_id: 'person-1',
        person: { id: 'person-1', first_name: 'John', last_name: 'Doe', email: 'john@example.com' },
      },
      {
        id: 'deal-2',
        name: 'Test Deal 2',
        stage: 'Closed Won',
        amount: 15000,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        person_id: 'person-2',
        person: { id: 'person-2', first_name: 'Jane', last_name: 'Smith', email: 'jane@example.com' },
      },
    ];

    // Mock the fetch response
    const mockClient = await import('../lib/graphqlClient');
    (mockClient.gqlClient.request as ReturnType<typeof vi.fn>).mockResolvedValue({ deals: mockDeals });

    render(
      <Router>
        <DealsPage />
      </Router>
    );

    // Wait for loading to finish and check for table elements
    expect(await screen.findByRole('table')).toBeInTheDocument();

    // Check for specific data from mock deals
    expect(screen.getByText('Test Deal 1')).toBeInTheDocument();
    expect(screen.getByText('Doe, John')).toBeInTheDocument(); // Formatted name
    expect(screen.getByText('Prospecting')).toBeInTheDocument();
    expect(screen.getByText('$5,000.00')).toBeInTheDocument(); // Formatted currency

    expect(screen.getByText('Test Deal 2')).toBeInTheDocument();
    expect(screen.getByText('Smith, Jane')).toBeInTheDocument();
    expect(screen.getByText('Closed Won')).toBeInTheDocument();
    expect(screen.getByText('$15,000.00')).toBeInTheDocument();

    // Check that loading and error states are not present
    expect(screen.queryByText(/loading deals.../i)).not.toBeInTheDocument();
    expect(screen.queryByText(/error loading deals:/i)).not.toBeInTheDocument();
  });

  // Add more tests later for table rendering etc.
}); 