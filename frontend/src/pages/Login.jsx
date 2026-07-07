import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Mail, Lock, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Login = () => {
  const { login, error: authError } = useAuth();
  const navigate = useNavigate();


  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container container py-16">
      <div className="auth-card card max-w-md mx-auto">
        <div className="auth-header text-center">
          <div className="auth-icon-circle">
            <LogIn size={24} />
          </div>
          <h1>Welcome Back</h1>
          <p className="subtitle">Sign in to your AeroShop account</p>
        </div>

        {(error || authError) && (
          <div className="error-alert-box card my-4">
            {error || authError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form mt-6">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-with-icon">
              <Mail size={16} className="input-field-icon" />
              <input
                type="email"
                id="email"
                required
                placeholder="you@example.com"
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
                placeholder="••••••••"
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
                <span>Logging in...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        <div className="auth-footer text-center mt-6">
          <p>
            Don't have an account?{' '}
            <Link to="/register" className="auth-footer-link">
              Create an account
            </Link>
          </p>
        </div>

        <div className="auth-demo-accounts card mt-6">
          <h4>💡 Quick Demo Logins:</h4>
          <p className="mt-1">
            <strong>Customer:</strong> user@example.com / user123
          </p>
          <p>
            <strong>Admin:</strong> admin@example.com / admin123
          </p>
        </div>
      </div>
    </div>
  );
};
export default Login;
