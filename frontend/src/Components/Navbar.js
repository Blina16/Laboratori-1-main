import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [role, setRole] = useState(localStorage.getItem('role'));
  const [loggedIn, setLoggedIn] = useState(localStorage.getItem('loggedIn') === 'true');
  const navigate = useNavigate();
  const location = useLocation();

  const toggleMenu = () => setIsOpen(!isOpen);

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
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/" className="logo">
          <span className="logo-mark">T4K</span>
          <span className="logo-text">
            <span className="logo-strong">Tutor</span>
            <span className="logo-accent">4Kids</span>
          </span>
        </Link>
      </div>

      <div className={`nav-links ${isOpen ? 'open' : ''}`}>
        <Link to="/" className="nav-link" onClick={() => setIsOpen(false)}>Home</Link>
        <Link to="/find-tutors" className="nav-link" onClick={() => setIsOpen(false)}>Find tutors</Link>
        <Link to="/for-business" className="nav-link" onClick={() => setIsOpen(false)}>For business</Link>
        <Link to="/become-tutor" className="nav-link" onClick={() => setIsOpen(false)}>Become a tutor</Link>
        {loggedIn ? (
          <>
            {role === 'admin' && (
              <Link to="/admin" className="nav-link" onClick={() => setIsOpen(false)}>Admin</Link>
            )}
            {role === 'student' && (
              <Link to="/student" className="nav-link" onClick={() => setIsOpen(false)}>Student</Link>
            )}
            {role === 'tutor' && (
              <Link to="/tutor" className="nav-link" onClick={() => setIsOpen(false)}>Tutor</Link>
            )}
            <button className="login-btn" onClick={() => { setIsOpen(false); handleLogout(); }}>Logout</button>
          </>
        ) : (
          <Link to="/login" className="login-btn" onClick={() => setIsOpen(false)}>Log In</Link>
        )}

        {/* ✅ Link directly to backend */}
        <a href="http://localhost:5000/" className="nav-link" target="_blank" rel="noopener noreferrer"></a>
      </div>

      <div className="hamburger" onClick={toggleMenu}>
        <div className={`bar ${isOpen ? 'open' : ''}`}></div>
        <div className={`bar ${isOpen ? 'open' : ''}`}></div>
        <div className={`bar ${isOpen ? 'open' : ''}`}></div>
      </div>
    </nav>
  );
}

export default Navbar;
