import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import MovieListDetail from './MovieListDetail';
import { MovieList, MovieListItem, Movie } from '@/types'; // Ensure types are correct

// Mock next/link
jest.mock('next/link', () => ({ children, href }: any) => <a href={href}>{children}</a>);

const mockListId = 'listDetail1';
const mockMovie: Movie = {
  id: 'movie1',
  title: 'Inception',
  year: 2010,
  poster: 'https://example.com/poster.jpg',
  rating: 5,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
const mockListItem: MovieListItem = { id: 'item1', movieId: 'movie1', movieListId: mockListId, addedAt: new Date().toISOString(), movie: mockMovie };
const mockMovieList: MovieList = {
  id: mockListId,
  name: 'Sci-Fi Wonders',
  description: 'A collection of amazing sci-fi movies.',
  userId: 'user123',
  movies: [mockListItem],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('MovieListDetail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
  });

  it('fetches and displays movie list details including movies', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockMovieList }),
    });

    render(<MovieListDetail listId={mockListId} />);

    expect(screen.getByText(/Loading movie list details.../i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: mockMovieList.name })).toBeInTheDocument();
    });
    expect(screen.getByText(mockMovieList.description!)).toBeInTheDocument();
    expect(screen.getByText(mockMovie.title)).toBeInTheDocument(); // Movie title
    expect(screen.getByAltText(`Poster for ${mockMovie.title}`)).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith(`/api/movie-lists/${mockListId}`);
  });

  it('displays an error message if fetching list details fails', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ success: false, error: 'Failed to fetch details' }),
    });

    render(<MovieListDetail listId={mockListId} />);
    expect(await screen.findByText(/Error loading movie list: Failed to fetch details/i)).toBeInTheDocument();
  });

  it('displays a "not found" message if list data is null', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: null }),
    });
    render(<MovieListDetail listId={mockListId} />);
    expect(await screen.findByText(/Movie list not found./i)).toBeInTheDocument();
  });

  it('handles removing a movie from the list', async () => {
    // Initial fetch for list details
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockMovieList }),
    });
    
    // Mock for the DELETE request
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, message: 'Movie item removed successfully' }),
    });

    // Mock for refetching list details after deletion
    const listWithoutMovie = { ...mockMovieList, movies: [] };
    (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: listWithoutMovie }),
    });

    window.confirm = jest.fn(() => true); // Mock window.confirm

    render(<MovieListDetail listId={mockListId} />);

    // Wait for the list to load
    await waitFor(() => expect(screen.getByText(mockMovie.title)).toBeInTheDocument());

    // Find and click the remove button for the movie item
    const removeButton = screen.getByRole('button', { name: /Remove from List/i });
    fireEvent.click(removeButton);

    expect(window.confirm).toHaveBeenCalledWith(`Are you sure you want to remove "${mockMovie.title}" from this list?`);
    
    // Check if the DELETE API was called
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(`/api/movie-lists/${mockListId}/movies/${mockListItem.id}`, {
        method: 'DELETE',
      });
    });
    
    // Check if alert was called (or a proper notification system in a real app)
    // window.alert = jest.fn(); // Mock alert if you want to check its call
    // await waitFor(() => expect(window.alert).toHaveBeenCalledWith(`"${mockMovie.title}" removed from list.`));

    // Check if list details are refetched and UI updates (movie is gone)
    await waitFor(() => {
        expect(screen.queryByText(mockMovie.title)).not.toBeInTheDocument();
        expect(screen.getByText(/This list is empty./i)).toBeInTheDocument(); // Assuming the list becomes empty
    });
  });
  
  it('calls placeholder for "Edit List" button click', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockMovieList }),
    });
    window.alert = jest.fn(); // Mock alert

    render(<MovieListDetail listId={mockListId} />);
    await waitFor(() => expect(screen.getByRole('heading', { name: mockMovieList.name })).toBeInTheDocument());
    
    const editButton = screen.getByTitle(/Edit list details/i);
    fireEvent.click(editButton);
    expect(window.alert).toHaveBeenCalledWith(`Placeholder: Edit details for list "${mockMovieList.name}"`);
  });

  it('calls placeholder for "Add Movie to List" button click', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockMovieList }),
    });
    window.alert = jest.fn(); // Mock alert

    render(<MovieListDetail listId={mockListId} />);
    await waitFor(() => expect(screen.getByRole('heading', { name: mockMovieList.name })).toBeInTheDocument());
    
    const addButton = screen.getByTitle(/Add movie to list/i);
    fireEvent.click(addButton);
    expect(window.alert).toHaveBeenCalledWith('Placeholder: Open modal to add movie to list.');
  });

});
