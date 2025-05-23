'use client';

import React, { useState, useEffect } from 'react';
import { MovieList, ApiResponse } from '@/types';

interface CreateEditMovieListFormProps {
  list?: MovieList;
  onSave: (savedList: MovieList) => void;
  onCancel: () => void;
}

const CreateEditMovieListForm: React.FC<CreateEditMovieListFormProps> = ({ list, onSave, onCancel }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (list) {
      setName(list.name);
      setDescription(list.description || '');
    } else {
      setName('');
      setDescription('');
    }
  }, [list]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!name.trim()) {
      setError('List name is required.');
      setIsLoading(false);
      return;
    }

    const payload = {
      name,
      description,
    };

    const endpoint = list ? `/api/movie-lists/${list.id}` : '/api/movie-lists';
    const method = list ? 'PUT' : 'POST';

    try {
      const response = await fetch(endpoint, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result: ApiResponse<MovieList> = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || `Failed to ${list ? 'update' : 'create'} list`);
      }

      if (result.data) {
        onSave(result.data);
      } else {
        // Should not happen if success is true and no error
        throw new Error('No data returned from server');
      }
      
    } catch (err: any) {
      console.error(`Error ${list ? 'updating' : 'creating'} movie list:`, err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-gray-800 p-6 rounded-lg shadow-xl max-w-lg mx-auto">
      <h2 className="text-2xl font-semibold text-white mb-6">
        {list ? 'Edit Movie List' : 'Create New Movie List'}
      </h2>
      
      {error && (
        <div className="bg-red-700 text-white p-3 rounded-md mb-4">
          <p>Error: {error}</p>
        </div>
      )}

      <div>
        <label htmlFor="list-name" className="block text-sm font-medium text-gray-300 mb-1">
          List Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="list-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 bg-gray-700 border border-[var(--border-dark)] rounded-md text-white focus:ring-[var(--primary-blue)] focus:border-[var(--primary-blue)] shadow-sm"
          required
          disabled={isLoading}
        />
      </div>

      <div>
        <label htmlFor="list-description" className="block text-sm font-medium text-gray-300 mb-1">
          Description
        </label>
        <textarea
          id="list-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="w-full px-4 py-2 bg-gray-700 border border-[var(--border-dark)] rounded-md text-white focus:ring-[var(--primary-blue)] focus:border-[var(--primary-blue)] shadow-sm"
          disabled={isLoading}
        />
      </div>

      <div className="flex justify-end space-x-4 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-600 hover:bg-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-gray-500 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-white bg-[var(--primary-blue)] hover:bg-[var(--primary-hover)] rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-[var(--primary-blue)] disabled:opacity-50"
        >
          {isLoading ? (list ? 'Updating...' : 'Creating...') : (list ? 'Save Changes' : 'Create List')}
        </button>
      </div>
    </form>
  );
};

export default CreateEditMovieListForm;
