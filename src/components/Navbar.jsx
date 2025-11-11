import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaCalendarAlt, FaUser, FaSignOutAlt, FaHome, FaUserShield, FaClipboardList, FaMoon, FaSun, FaWifi } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

/**
 * Navbar - Komponen navigasi untuk aplikasi
 */
function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isOnline = useOnlineStatus();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    if (window.confirm('Apakah Anda yakin ingin logout?')) {
      logout();
      navigate('/login');
    }
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <FaCalendarAlt className="navbar-logo-icon" />
          <span>Event Kampus</span>
        </Link>

        <ul className="navbar-menu">
          <li className="navbar-item">
            <Link to="/" className={`navbar-link ${isActive('/')}`}>
              <FaHome className="navbar-icon" />
              <span>Dashboard</span>
            </Link>
          </li>

          {!isAdmin && (
            <li className="navbar-item">
              <Link to="/my-registrations" className={`navbar-link ${isActive('/my-registrations')}`}>
                <FaClipboardList className="navbar-icon" />
                <span>Event Saya</span>
              </Link>
            </li>
          )}

          {isAdmin && (
            <li className="navbar-item">
              <Link to="/admin" className={`navbar-link ${isActive('/admin')}`}>
                <FaUserShield className="navbar-icon" />
                <span>Admin Panel</span>
              </Link>
            </li>
          )}

          <li className="navbar-item navbar-user">
            <Link to="/profile" className="navbar-user-info">
              <FaUser className="navbar-icon" />
              <div className="navbar-user-details">
                <span className="navbar-user-name">{user?.nama}</span>
                <span className="navbar-user-role">{user?.role === 'admin' ? 'Administrator' : 'User'}</span>
              </div>
            </Link>
          </li>

          <li className="navbar-item">
            <div className="nav-actions">
              <div className={`status-indicator ${isOnline ? 'online' : 'offline'}`}>
                <FaWifi className="status-icon" />
                <span className="status-text">{isOnline ? 'Online' : 'Offline'}</span>
              </div>
              <button 
                onClick={toggleTheme} 
                className={`theme-toggle ${theme}`}
                title={theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                aria-label="Toggle theme"
              >
                <div className="theme-toggle-slider">
                  {theme === 'light' ? <FaSun /> : <FaMoon />}
                </div>
              </button>
            </div>
          </li>

          <li className="navbar-item">
            <button onClick={handleLogout} className="navbar-logout">
              <FaSignOutAlt className="navbar-icon" />
              <span>Logout</span>
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
