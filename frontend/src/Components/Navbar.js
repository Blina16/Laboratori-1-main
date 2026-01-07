import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [role, setRole] = useState(localStorage.getItem('role'));
  const [loggedIn, setLoggedIn] = useState(localStorage.getItem('loggedIn') === 'true');
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const navigate = useNavigate();
  const location = useLocation();

  const toggleMenu = () => setIsOpen(!isOpen);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', JSON.stringify(newDarkMode));
    // Dispatch storage event for other components
    window.dispatchEvent(new Event('storage'));
  };

  // Sync dark mode with localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('darkMode');
      if (saved) {
        setDarkMode(JSON.parse(saved));
      }
    };

    // Listen for storage changes
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    // Refresh auth state on route change
    setRole(localStorage.getItem('role'));
    setLoggedIn(localStorage.getItem('loggedIn') === 'true');
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('role');
    setLoggedIn(false);
    setRole(null);
    navigate('/login');
  };

  return (
    <nav className="navbar" style={{
      background: darkMode ? '#1f2937' : '#ffffff',
      borderBottom: darkMode ? '1px solid #374151' : '1px solid #e5e7eb',
      color: darkMode ? '#f9fafb' : '#111827',
      transition: 'all 0.3s ease'
    }}>
      <div className="nav-left">
        <Link to="/" className="logo">
          <span className="logo-mark">T4K</span>
          <span className="logo-text">
            <span className="logo-strong">Tutor</span>
            <span className="logo-accent">4Kids</span>
          </span>
        </Link>
      </div>

      <div className={`nav-links ${isOpen ? 'open' : ''}`} style={{
        background: darkMode ? '#1f2937' : '#ffffff',
        transition: 'all 0.3s ease'
      }}>
        <Link to="/" className="nav-link" onClick={() => setIsOpen(false)} style={{
          color: darkMode ? '#f9fafb' : '#111827',
          transition: 'all 0.3s ease'
        }}>Home</Link>
        <Link to="/find-tutors" className="nav-link" onClick={() => setIsOpen(false)} style={{
          color: darkMode ? '#f9fafb' : '#111827',
          transition: 'all 0.3s ease'
        }}>Find tutors</Link>
        <Link to="/for-business" className="nav-link" onClick={() => setIsOpen(false)} style={{
          color: darkMode ? '#f9fafb' : '#111827',
          transition: 'all 0.3s ease'
        }}>For business</Link>
        <Link to="/become-tutor" className="nav-link" onClick={() => setIsOpen(false)} style={{
          color: darkMode ? '#f9fafb' : '#111827',
          transition: 'all 0.3s ease'
        }}>Become a tutor</Link>
        {loggedIn ? (
          <>
            {role === 'admin' && (
              <Link to="/admin" className="nav-link" onClick={() => setIsOpen(false)} style={{
                color: darkMode ? '#f9fafb' : '#111827',
                transition: 'all 0.3s ease'
              }}>Admin</Link>
            )}
            {role === 'student' && (
              <Link to="/student" className="nav-link" onClick={() => setIsOpen(false)} style={{
                color: darkMode ? '#f9fafb' : '#111827',
                transition: 'all 0.3s ease'
              }}>Student</Link>
            )}
            {role === 'tutor' && (
              <Link to="/tutor" className="nav-link" onClick={() => setIsOpen(false)} style={{
                color: darkMode ? '#f9fafb' : '#111827',
                transition: 'all 0.3s ease'
              }}>Tutor</Link>
            )}
            <button className="login-btn" onClick={() => { setIsOpen(false); handleLogout(); }} style={{
              background: darkMode ? '#dc2626' : '#3b82f6',
              color: '#ffffff',
              border: 'none',
              transition: 'all 0.3s ease'
            }}>Logout</button>
          </>
        ) : (
          <Link to="/login" className="login-btn" onClick={() => setIsOpen(false)} style={{
            background: darkMode ? '#059669' : '#3b82f6',
            color: '#ffffff',
            border: 'none',
            transition: 'all 0.3s ease'
          }}>Log in</Link>
        )}

        {/* ✅ Link directly to backend */}
        <a href="http://localhost:5000/" className="nav-link" target="_blank" rel="noopener noreferrer"></a>
      </div>

      <div className="nav-right" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          style={{
            padding: '8px 12px',
            borderRadius: '6px',
            border: darkMode ? '1px solid #4b5563' : '1px solid #d1d5db',
            background: darkMode ? '#374151' : '#f9fafb',
            color: darkMode ? '#f9fafb' : '#1f2937',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.3s ease'
          }}
        >
          {darkMode ? '☀️' : '🌙'}
        </button>

        <div className="hamburger" onClick={toggleMenu}>
          <div className={`bar ${isOpen ? 'open' : ''}`} style={{
            background: darkMode ? '#f9fafb' : '#111827',
            transition: 'all 0.3s ease'
          }}></div>
          <div className={`bar ${isOpen ? 'open' : ''}`} style={{
            background: darkMode ? '#f9fafb' : '#111827',
            transition: 'all 0.3s ease'
          }}></div>
          <div className={`bar ${isOpen ? 'open' : ''}`} style={{
            background: darkMode ? '#f9fafb' : '#111827',
            transition: 'all 0.3s ease'
          }}></div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
