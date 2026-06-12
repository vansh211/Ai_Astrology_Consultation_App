import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, AlertCircle } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      return setError('Please enter both email and password');
    }
    setError('');
    setSubmitting(true);
    const result = await login(email, password);
    setSubmitting(false);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full astro-card p-8 sm:p-10">
        <div className="text-center mb-8">
          <span className="text-[10px] font-semibold tracking-[0.25em] text-astro-muted uppercase">Tumhara Pandit</span>
          <h2 className="mt-4 font-serif text-3xl font-semibold text-astro-dark">Welcome Back</h2>
          <p className="mt-2 text-sm text-astro-muted">Sign in to check your consultations</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm mb-4">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-xs font-medium text-astro-muted mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-astro-muted" strokeWidth={1.5} />
              <input
                id="email" type="email" autoComplete="email" required
                value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full astro-input-dark pl-11 pr-4 py-2.5 text-sm"
                placeholder="name@example.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-medium text-astro-muted mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-astro-muted" strokeWidth={1.5} />
              <input
                id="password" type="password" autoComplete="current-password" required
                value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full astro-input-dark pl-11 pr-4 py-2.5 text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button type="submit" disabled={submitting} className="w-full astro-btn-primary py-3 text-sm disabled:opacity-50">
            {submitting ? 'Connecting...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-astro-muted mt-6">
          New to Tumhara Pandit?{' '}
          <Link to="/register" className="text-astro-dark font-semibold hover:underline">Create an Account</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
