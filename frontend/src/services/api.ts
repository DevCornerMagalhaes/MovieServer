import axios from 'axios';

// Smart API URL detection for different environments
const getApiBaseUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    // In production (Docker), use relative URLs that will be proxied
    return '/api';
  } else {
    // In development, connect directly to backend
    return 'http://localhost:5000/api';
  }
};

const API_BASE_URL = getApiBaseUrl();

export interface LoginRequest {
  username: string;
  password: string;
}

export interface Movie {
  id: number;
  fileName: string;
  filePath: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Auth API
export const authApi = {
  login: async (credentials: LoginRequest): Promise<ApiResponse<{ token: string }>> => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  }
};

// Movies API
export const moviesApi = {
  getMovies: async (): Promise<Movie[]> => {
    const response = await apiClient.get('/movies');
    return response.data;
  }
};

// Stream API
export const streamApi = {
  getStreamUrl: (movieId: number): string => {
    return `${API_BASE_URL}/stream/${movieId}`;     // Direct stream (works for MP4)
  },
  getTranscodeUrl: (movieId: number): string => {
    return `${API_BASE_URL}/transcode/${movieId}`;  // Smart transcoding service (for MKV with audio issues)
  }
};

// Events API (RabbitMQ)
export const eventsApi = {
  sendEvent: async (message: string): Promise<void> => {
    await apiClient.post('/events/send', { message });
  }
};

export default apiClient;
