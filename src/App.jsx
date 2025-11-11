import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import EventDetailPage from './pages/EventDetailPage';
import MyRegistrations from './pages/MyRegistrations';
import UserProfile from './pages/UserProfile';
import NotFound from './pages/NotFound';
import "./App.css";

/**
 * App Component - Root component dengan routing dan authentication
 */
function App() {

  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          
          {/* Protected routes - hanya user yang sudah login */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Dynamic Route - Event Detail Page */}
          <Route 
            path="/event/:id" 
            element={
              <ProtectedRoute>
                <EventDetailPage />
              </ProtectedRoute>
            } 
          />
          
          {/* My Registrations Page */}
          <Route 
            path="/my-registrations" 
            element={
              <ProtectedRoute>
                <MyRegistrations />
              </ProtectedRoute>
            } 
          />
          
          {/* User Profile Page */}
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            } 
          />
          
          {/* Admin only routes - hanya admin yang bisa akses */}
          <Route 
            path="/admin" 
            element={
              <AdminRoute>
                <AdminPanel />
              </AdminRoute>
            } 
          />
          
          {/* 404 Not Found */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  </ThemeProvider>
  );
}

export default App;
