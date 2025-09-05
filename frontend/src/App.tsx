import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import MovieList from './components/MovieList';
import MoviePlayer from './components/MoviePlayer';
import './App.css';

// Protected Route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

// Public Route component (redirects to movies if already authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/movies" /> : <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } 
            />
            <Route 
              path="/movies" 
              element={
                <ProtectedRoute>
                  <MovieList />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/player/:id" 
              element={
                <ProtectedRoute>
                  <MoviePlayer />
                </ProtectedRoute>
              } 
            />
            <Route path="/" element={<Navigate to="/movies" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
