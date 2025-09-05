import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Movie } from '../services/api';
import './MovieCard.css';

interface MovieCardProps {
  movie: Movie;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie }) => {
  const navigate = useNavigate();

  const handlePlay = () => {
    navigate(`/player/${movie.id}`);
  };

  const getFileExtension = (filename: string): string => {
    return filename.split('.').pop()?.toUpperCase() || '';
  };

  const formatFileName = (filename: string): string => {
    // Remove file extension and replace dots/underscores with spaces
    return filename
      .replace(/\.[^/.]+$/, '')
      .replace(/[._]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="movie-card">
      <div className="movie-poster">
        <div className="movie-poster-background">
          <div className="movie-title-overlay">
            {formatFileName(movie.fileName)}
          </div>
        </div>
        <div className="movie-format-badge">
          {getFileExtension(movie.fileName)}
        </div>
        <div className="play-overlay" onClick={handlePlay}>
          <div className="play-button">
            <svg width="60" height="60" viewBox="0 0 60 60">
              <circle cx="30" cy="30" r="25" fill="rgba(255,255,255,0.9)" />
              <polygon points="22,18 22,42 42,30" fill="#333" />
            </svg>
          </div>
        </div>
      </div>
      <div className="movie-info">
        <h3 className="movie-title">{formatFileName(movie.fileName)}</h3>
        <p className="movie-filename">{movie.fileName}</p>
        <button onClick={handlePlay} className="play-button-text">
          Play Movie
        </button>
      </div>
    </div>
  );
};

export default MovieCard;
