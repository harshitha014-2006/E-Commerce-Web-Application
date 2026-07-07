import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Register = () => {
  const { register, error: authError } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await register(name, email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed. Try a different email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container container py-16">
      <div className="auth-card card max-w-md mx-auto">
        <div className="auth-header text-center">
          <div className="auth-icon-circle">
            <UserPlus size={24} />
          </div>
          <h1>Create Account</h1>
          <p className="subtitle">Sign up to start shopping on AeroShop</p>
        </div>

        {(error || authError) && (
          <div className="error-alert-box card my-4">
            {error || authError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form mt-6">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <div className="input-with-icon">
              <User size={16} className="input-field-icon" />
              <input
                type="text"
                id="name"
                required
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group mt-4">
            <label htmlFor="email">Email Address</label>
            <div className="input-with-icon">
              <Mail size={16} className="input-field-icon" />
              <input
                type="email"
                id="email"
                required
                placeholder="jane@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group mt-4">
            <label htmlFor="password">Password</label>
            <div className="input-with-icon">
              <Lock size={16} className="input-field-icon" />
              <input
                type="password"
                id="password"
                required
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`btn-primary w-full btn-large mt-6 ${loading ? 'disabled' : ''}`}
          >
            {loading ? (
              <>
                <Loader2 className="spinner" size={18} />
                <span>Creating account...</span>
              </>
            ) : (
              <span>Sign Up</span>
            )}
          </button>
        </form>

        <div className="auth-footer text-center mt-6">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="auth-footer-link">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
export default Register;
