'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { MovieList, ApiResponse } from '@/types';
import MovieListCard from './MovieListCard';
import CreateEditMovieListForm from './CreateEditMovieListForm'; // For creating/editing lists

interface UserMovieListsProps {
  userId: string;
}

const UserMovieLists: React.FC<UserMovieListsProps> = ({ userId }) => {
  const [lists, setLists] = useState<MovieList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingList, setEditingList] = useState<MovieList | undefined>(undefined);

  const fetchLists = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/movie-lists?userId=${userId}`);
      const result: ApiResponse<MovieList[]> = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to fetch movie lists');
      }
      setLists(result.data || []);
    } catch (err: any) {
      console.error('Error fetching movie lists:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchLists();
    }
  }, [userId, fetchLists]);

  const handleListCreated = (newList: MovieList) => {
    setLists(prevLists => [newList, ...prevLists]);
    setShowCreateForm(false);
    setEditingList(undefined);
  };

  const handleListUpdated = (updatedList: MovieList) => {
    setLists(prevLists => prevLists.map(l => l.id === updatedList.id ? updatedList : l));
    setShowCreateForm(false);
    setEditingList(undefined);
  };
  
  const handleEdit = (list: MovieList) => {
    setEditingList(list);
    setShowCreateForm(true); // Show the form for editing
  };

  const handleDelete = (deletedListId: string) => {
    setLists(prevLists => prevLists.filter(l => l.id !== deletedListId));
  };

  if (isLoading) {
    return <div className="text-center text-gray-400 py-8">Loading movie lists...</div>;
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-8">
        <p>Error loading movie lists: {error}</p>
        <button 
          onClick={fetchLists}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Your Movie Lists</h1>
        <button
          onClick={() => { setEditingList(undefined); setShowCreateForm(true); }}
          className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900"
        >
          Create New List
        </button>
      </div>

      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <CreateEditMovieListForm
                list={editingList}
                onSave={(savedList) => {
                    if (editingList) {
                        handleListUpdated(savedList);
                    } else {
                        handleListCreated(savedList);
                    }
                }}
                onCancel={() => { setShowCreateForm(false); setEditingList(undefined); }}
            />
        </div>
      )}

      {lists.length === 0 ? (
        <div className="text-center text-gray-500 py-10">
          <p>You haven't created any movie lists yet.</p>
          <p>Click "Create New List" to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {lists.map(list => (
            <MovieListCard 
              key={list.id} 
              list={list} 
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default UserMovieLists;
