import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CreateEditMovieListForm from './CreateEditMovieListForm';
import { MovieList } from '@/types'; // Ensure this type is correctly imported

// Mock fetch globally (already in jest.setup.js, but can be confirmed)
// global.fetch = jest.fn();

const mockOnSave = jest.fn();
const mockOnCancel = jest.fn();

describe('CreateEditMovieListForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear(); // Clear fetch mock history
  });

  it('renders correctly for creating a new list', () => {
    render(<CreateEditMovieListForm onSave={mockOnSave} onCancel={mockOnCancel} />);
    expect(screen.getByRole('heading', { name: /Create New Movie List/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/List Name/i)).toHaveValue('');
    expect(screen.getByLabelText(/Description/i)).toHaveValue('');
    expect(screen.getByRole('button', { name: /Create List/i })).toBeInTheDocument();
  });

  it('renders correctly for editing an existing list', () => {
    const existingList: MovieList = {
      id: 'list1',
      name: 'My Action Movies',
      description: 'All my favorite action films.',
      userId: 'user1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      movies: [],
    };
    render(<CreateEditMovieListForm list={existingList} onSave={mockOnSave} onCancel={mockOnCancel} />);
    expect(screen.getByRole('heading', { name: /Edit Movie List/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/List Name/i)).toHaveValue(existingList.name);
    expect(screen.getByLabelText(/Description/i)).toHaveValue(existingList.description!);
    expect(screen.getByRole('button', { name: /Save Changes/i })).toBeInTheDocument();
  });

  it('requires list name on submission', async () => {
    render(<CreateEditMovieListForm onSave={mockOnSave} onCancel={mockOnCancel} />);
    fireEvent.click(screen.getByRole('button', { name: /Create List/i }));
    
    expect(await screen.findByText('List name is required.')).toBeInTheDocument();
    expect(mockOnSave).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(<CreateEditMovieListForm onSave={mockOnSave} onCancel={mockOnCancel} />);
    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('submits form data and calls onSave for creating a new list', async () => {
    const newListData = { name: 'Sci-Fi Classics', description: 'Best of sci-fi' };
    const mockSavedList: MovieList = { ...newListData, id: 'list2', userId: 'user1', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), movies: [] };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockSavedList }),
    });

    render(<CreateEditMovieListForm onSave={mockOnSave} onCancel={mockOnCancel} />);
    
    fireEvent.change(screen.getByLabelText(/List Name/i), { target: { value: newListData.name } });
    fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: newListData.description } });
    fireEvent.click(screen.getByRole('button', { name: /Create List/i }));

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    expect(fetch).toHaveBeenCalledWith('/api/movie-lists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newListData),
    });
    
    await waitFor(() => expect(mockOnSave).toHaveBeenCalledWith(mockSavedList));
  });

  it('submits form data and calls onSave for editing an existing list', async () => {
    const existingList: MovieList = { id: 'list1', name: 'Old Name', description: 'Old Desc', userId: 'user1', createdAt: '', updatedAt: '', movies: [] };
    const updatedName = 'New Action Movies';
    const updatedDescription = 'Updated action films description.';
    const mockUpdatedList: MovieList = { ...existingList, name: updatedName, description: updatedDescription };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockUpdatedList }),
    });

    render(<CreateEditMovieListForm list={existingList} onSave={mockOnSave} onCancel={mockOnCancel} />);
    
    fireEvent.change(screen.getByLabelText(/List Name/i), { target: { value: updatedName } });
    fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: updatedDescription } });
    fireEvent.click(screen.getByRole('button', { name: /Save Changes/i }));

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    expect(fetch).toHaveBeenCalledWith(`/api/movie-lists/${existingList.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: updatedName, description: updatedDescription }),
    });
    await waitFor(() => expect(mockOnSave).toHaveBeenCalledWith(mockUpdatedList));
  });
  
  it('displays an error message if API call fails', async () => {
    const listName = 'Error Test List';
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ success: false, error: 'API save failed' }),
    });

    render(<CreateEditMovieListForm onSave={mockOnSave} onCancel={mockOnCancel} />);
    fireEvent.change(screen.getByLabelText(/List Name/i), { target: { value: listName } });
    fireEvent.click(screen.getByRole('button', { name: /Create List/i }));

    expect(await screen.findByText(/Error: API save failed/i)).toBeInTheDocument();
    expect(mockOnSave).not.toHaveBeenCalled();
  });
});
