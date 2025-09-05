import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { moviesApi, streamApi, Movie } from '../services/api';
import axios from 'axios';
import './MoviePlayer.css';

interface CodecAnalysis {
  needsAudioTranscoding: boolean;
  needsVideoTranscoding: boolean;
  audioCodecs: string[];
  videoCodecs: string[];
}

const MoviePlayer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const fetchCodecAnalysis = useCallback(async (movieId: number): Promise<CodecAnalysis | null> => {
    try {
      const response = await axios.get(`http://localhost:5000/api/transcode/analyze/${movieId}`);
      const analysis = response.data;
      console.log('🔍 Codec Analysis:', analysis);
      return analysis;
    } catch (error) {
      console.error('Failed to get codec analysis:', error);
      return null;
    }
  }, []);

  const setupSmartStreaming = useCallback(async (movie: Movie) => {
    if (!videoRef.current) return;
    
    const videoElement = videoRef.current;
    
    // First, get codec analysis to determine streaming method
    try {
      const analysis = await fetchCodecAnalysis(movie.id);
      
      // Choose streaming URL based on codec requirements
      let streamUrl: string;
      if (analysis && (analysis.needsAudioTranscoding || analysis.needsVideoTranscoding)) {
        console.log('🔄 Using transcoding due to codec requirements:', {
          audio: analysis.audioCodecs,
          video: analysis.videoCodecs,
          needsAudio: analysis.needsAudioTranscoding,
          needsVideo: analysis.needsVideoTranscoding
        });
        streamUrl = streamApi.getTranscodeUrl(movie.id);
      } else {
        console.log('✅ Using direct streaming - codecs are web compatible');
        streamUrl = streamApi.getStreamUrl(movie.id);
      }
      
      // Set up the video
      videoElement.src = streamUrl;
      videoElement.controls = true;
      videoElement.volume = 0.8;
      videoElement.preload = 'metadata';
      
      // Handle errors - fallback to transcoding if direct streaming fails
      videoElement.onerror = () => {
        if (streamUrl === streamApi.getStreamUrl(movie.id)) {
          console.log('⚠️ Direct streaming failed, falling back to transcoding');
          videoElement.src = streamApi.getTranscodeUrl(movie.id);
        }
      };
      
    } catch (error) {
      console.error('Failed to setup streaming:', error);
      // Default fallback to direct streaming
      videoElement.src = streamApi.getStreamUrl(movie.id);
      videoElement.controls = true;
      videoElement.volume = 0.8;
    }
  }, [fetchCodecAnalysis]);

  useEffect(() => {
    if (id) {
      fetchMovieDetails(parseInt(id));
    }
  }, [id]);

  useEffect(() => {
    if (movie && videoRef.current) {
      setupSmartStreaming(movie);
    }
  }, [movie, setupSmartStreaming]);

  const fetchMovieDetails = async (movieId: number) => {
    try {
      setLoading(true);
      const movies = await moviesApi.getMovies();
      const selectedMovie = movies.find(m => m.id === movieId);
      
      if (!selectedMovie) {
        setError('Movie not found');
        return;
      }
      
      setMovie(selectedMovie);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load movie');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/movies');
  };

  const openInVLC = () => {
    if (!movie) return;
    
    const streamUrl = streamApi.getStreamUrl(movie.id);
    const dialogMessage = 
      `🎬 Open "${formatFileName(movie.fileName)}" in VLC Player\n\n` +
      `Stream URL: ${streamUrl}\n\n` +
      `Click OK to copy URL to clipboard`;
    
    if (window.confirm(dialogMessage)) {
      // Copy to clipboard
      navigator.clipboard.writeText(streamUrl).catch(() => {
        alert(`Copy this URL to VLC:\n${streamUrl}`);
      });
    }
  };

  const formatFileName = (filename: string): string => {
    return filename
      .replace(/\.[^/.]+$/, '')
      .replace(/[._]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <div className="player-loading">
        <div className="loading-spinner">Loading movie...</div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="player-error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={handleBack}>Back to Movies</button>
      </div>
    );
  }

  return (
    <div className="movie-player-container">
      <div className="player-header">
        <button onClick={handleBack} className="back-button">
          ← Back to Movies
        </button>
        <h2>{formatFileName(movie.fileName)}</h2>
        
        <div className="player-options">
          <button onClick={openInVLC} className="vlc-button">
            🎬 Open in VLC (Perfect Quality & Audio)
          </button>
        </div>
      </div>

      <div className="video-container">
        <div className="playback-info">
          <p><strong>Web Player:</strong> Direct streaming (may have audio issues with some formats)</p>
          <p><strong>VLC Player:</strong> Guaranteed perfect quality and audio for all formats</p>
        </div>
        
        <video
          ref={videoRef}
          width="100%"
          height="500"
          style={{ backgroundColor: '#000', maxWidth: '100%' }}
        >
          <p>Your browser doesn't support HTML5 video.</p>
        </video>
      </div>

      <div className="movie-details">
        <h3>Movie Information</h3>
        <p><strong>File Name:</strong> {movie.fileName}</p>
        <p><strong>Stream URL:</strong> <a href={streamApi.getStreamUrl(movie.id)} target="_blank" rel="noopener noreferrer">{streamApi.getStreamUrl(movie.id)}</a></p>
      </div>
    </div>
  );
};

export default MoviePlayer;