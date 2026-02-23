import { Toaster } from '@/components/ui/sonner';
import React from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Chat from './pages/Chat';
import Login from './pages/Login';
import Signup from './pages/Signup';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, loading } = useAuth();
  if (loading) return <div className="flex h-screen items-center justify-center text-muted-foreground text-sm">Loading…</div>;
  if (!token) return <Navigate to="/login" />;
  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            }
          />
        </Routes>
        <Toaster richColors position="top-right" />
      </AuthProvider>
    </Router>
  );
}

export default App;
