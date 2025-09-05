import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { moviesApi, Movie } from '../services/api';
import MovieCard from './MovieCard';
import './MovieList.css';

const MovieList: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { logout } = useAuth();

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const movieList = await moviesApi.getMovies();
      setMovies(movieList);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load movies');
    } finally {
      setLoading(false);
    }
  };

  const filteredMovies = movies.filter(movie =>
    movie.fileName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLogout = () => {
    logout();
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading movies...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={fetchMovies}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="movie-list-container">
      <header className="movie-header">
        <h1>My Movie Server</h1>
        <div className="header-controls">
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </header>

      <div className="search-container">
        <input
          type="text"
          placeholder="Search movies..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="movies-grid">
        {filteredMovies.length === 0 ? (
          <div className="no-movies">
            <h3>No movies found</h3>
            <p>
              {searchTerm 
                ? `No movies match "${searchTerm}"`
                : "No movies available in your library"
              }
            </p>
          </div>
        ) : (
          filteredMovies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))
        )}
      </div>
    </div>
  );
};

export default MovieList;
