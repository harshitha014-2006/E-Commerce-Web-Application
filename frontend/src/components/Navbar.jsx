import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, User, LogOut, ShieldAlert, Search, Store } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [searchQuery, setSearchQuery] = useState('');

  // Sync search input with URL search param
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearchQuery(params.get('search') || '');
  }, [location.search]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/');
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    navigate('/');
  };

  return (
    <header className="navbar-header">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={handleClearSearch}>
          <Store className="logo-icon" />
          <span className="logo-text">AeroShop</span>
        </Link>

        <form onSubmit={handleSearchSubmit} className="navbar-search-form">
          <div className="search-input-wrapper">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="navbar-search-input"
            />
            <button type="submit" className="search-btn" title="Search">
              <Search size={18} />
            </button>
          </div>
        </form>

        <nav className="navbar-nav">
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
            Shop
          </Link>

          <Link to="/cart" className="nav-cart-btn" title="Shopping Cart">
            <ShoppingCart size={20} />
            {itemCount > 0 && (
              <span className="cart-badge-count animate-pop">{itemCount}</span>
            )}
          </Link>

          {user ? (
            <div className="nav-user-actions">
              {user.role === 'ADMIN' && (
                <Link
                  to="/admin"
                  className={`nav-admin-link ${location.pathname.startsWith('/admin') ? 'active' : ''}`}
                  title="Admin Dashboard"
                >
                  <ShieldAlert size={18} />
                  <span className="hide-mobile">Admin</span>
                </Link>
              )}

              <Link
                to="/profile"
                className={`nav-profile-link ${location.pathname === '/profile' ? 'active' : ''}`}
                title="My Profile"
              >
                <User size={18} />
                <span className="hide-mobile">{user.name.split(' ')[0]}</span>
              </Link>

              <button onClick={logout} className="nav-logout-btn" title="Sign Out">
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div className="nav-auth-buttons">
              <Link to="/login" className="btn-login-link">
                Login
              </Link>
              <Link to="/register" className="btn-register-link">
                Register
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};
export default Navbar;
