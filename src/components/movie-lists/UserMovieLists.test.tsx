import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import UserMovieLists from './UserMovieLists';
import { MovieList, ApiResponse } from '@/types';

// Mock child components
jest.mock('./MovieListCard', () => ({ list, onEdit, onDelete }: any) => (
  <div data-testid={`movie-list-card-${list.id}`}>
    <h3>{list.name}</h3>
    <button onClick={() => onEdit(list)}>Edit</button>
    <button onClick={() => onDelete(list.id)}>Delete</button>
  </div>
));

jest.mock('./CreateEditMovieListForm', () => ({ list, onSave, onCancel }: any) => (
  <div data-testid="create-edit-form">
    <button data-testid="form-save-button" onClick={() => onSave(list || { id: 'new-list', name: 'New List from Form' })}>Save Form</button>
    <button data-testid="form-cancel-button" onClick={onCancel}>Cancel Form</button>
  </div>
));

const mockUserId = 'user123';
const mockLists: MovieList[] = [
  { id: 'list1', name: 'My Favorites', userId: mockUserId, movies: [], createdAt: '', updatedAt: '' },
  { id: 'list2', name: 'Watchlist', userId: mockUserId, movies: [], createdAt: '', updatedAt: '' },
];

describe('UserMovieLists', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
  });

  it('fetches and displays user movie lists', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockLists }),
    });

    render(<UserMovieLists userId={mockUserId} />);

    expect(screen.getByText(/Loading movie lists.../i)).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('My Favorites')).toBeInTheDocument());
    expect(screen.getByText('Watchlist')).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith(`/api/movie-lists?userId=${mockUserId}`);
  });

  it('displays an error message if fetching lists fails', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ success: false, error: 'Failed to fetch' }),
    });

    render(<UserMovieLists userId={mockUserId} />);
    
    expect(await screen.findByText(/Error loading movie lists: Failed to fetch/i)).toBeInTheDocument();
  });

  it('displays a message when no lists are found', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: [] }), // Empty array
    });
    render(<UserMovieLists userId={mockUserId} />);

    expect(await screen.findByText(/You haven't created any movie lists yet./i)).toBeInTheDocument();
  });

  it('opens the create form when "Create New List" is clicked', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: [] }),
    });
    render(<UserMovieLists userId={mockUserId} />);
    await waitFor(() => expect(screen.queryByText(/Loading movie lists.../i)).not.toBeInTheDocument());


    fireEvent.click(screen.getByRole('button', { name: /Create New List/i }));
    expect(await screen.findByTestId('create-edit-form')).toBeInTheDocument();
  });

  it('closes the form when cancel is clicked in the form', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: [] }),
    });
    render(<UserMovieLists userId={mockUserId} />);
    await waitFor(() => expect(screen.queryByText(/Loading movie lists.../i)).not.toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /Create New List/i }));
    const form = await screen.findByTestId('create-edit-form');
    expect(form).toBeInTheDocument();
    
    fireEvent.click(screen.getByTestId('form-cancel-button'));
    await waitFor(() => expect(screen.queryByTestId('create-edit-form')).not.toBeInTheDocument());
  });
  
  it('handles list creation from the form', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({ // Initial fetch
      ok: true,
      json: async () => ({ success: true, data: [] }),
    });
    render(<UserMovieLists userId={mockUserId} />);
    await waitFor(() => expect(screen.queryByText(/Loading movie lists.../i)).not.toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /Create New List/i }));
    await screen.findByTestId('create-edit-form');

    // Simulate saving from the mocked form
    fireEvent.click(screen.getByTestId('form-save-button'));
    
    await waitFor(() => {
      expect(screen.queryByTestId('create-edit-form')).not.toBeInTheDocument();
      // Check if the new list (simulated by the mock form's onSave) is displayed
      // The mock form calls onSave with { id: 'new-list', name: 'New List from Form' }
      expect(screen.getByText('New List from Form')).toBeInTheDocument();
    });
  });

  it('handles list editing from MovieListCard interaction', async () => {
     (fetch as jest.Mock).mockResolvedValueOnce({ // Initial fetch
      ok: true,
      json: async () => ({ success: true, data: [mockLists[0]] }), // Provide one list
    });
    render(<UserMovieLists userId={mockUserId} />);
    
    const editButton = await screen.findByRole('button', { name: /Edit/i }); // Edit button within the mocked MovieListCard
    fireEvent.click(editButton);

    const form = await screen.findByTestId('create-edit-form');
    expect(form).toBeInTheDocument();

    // Simulate saving from the mocked form (which gets the 'list' prop)
    fireEvent.click(screen.getByTestId('form-save-button'));
    
    await waitFor(() => {
      expect(screen.queryByTestId('create-edit-form')).not.toBeInTheDocument();
      // The onSave in the component will update the list.
      // Here we just ensure the form closes. Actual data update verification is more complex with mocks.
    });
  });

  it('handles list deletion from MovieListCard interaction', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({ // Initial fetch
      ok: true,
      json: async () => ({ success: true, data: [mockLists[0], mockLists[1]] }), // Provide two lists
    });
    render(<UserMovieLists userId={mockUserId} />);
    
    const list1Card = await screen.findByTestId(`movie-list-card-${mockLists[0].id}`);
    expect(screen.getByText(mockLists[0].name)).toBeInTheDocument();
    
    const deleteButton = within(list1Card).getByRole('button', { name: /Delete/i });
    fireEvent.click(deleteButton); // This calls onDelete(listId) passed to MovieListCard mock

    await waitFor(() => {
      expect(screen.queryByText(mockLists[0].name)).not.toBeInTheDocument();
    });
    expect(screen.getByText(mockLists[1].name)).toBeInTheDocument(); // Ensure other list is still there
  });

});

// Helper to get elements from within a specific scope (like a card)
import { getQueriesForElement } from '@testing-library/dom';
const within = (element: HTMLElement) => getQueriesForElement(element);
