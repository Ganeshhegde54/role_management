import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Eye, EyeOff, Lock, User, AlertCircle, ArrowRight } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionExpired = searchParams.get('expired') === 'true';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid username or password';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickLogin = (demoUsername, demoPassword) => {
    setUsername(demoUsername);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Dynamic backdrop glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white font-bold text-2xl shadow-xl shadow-brand-500/20 border border-white/10">
            <Shield className="w-7 h-7" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-3xl font-extrabold text-white tracking-tight">
          Role & Permission Management
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          Sign in to access your role-based control panel
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="glass-panel py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-slate-800">
          {sessionExpired && (
            <div className="mb-6 p-3.5 rounded-xl border border-amber-500/30 bg-amber-950/30 text-amber-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
              Session expired. Please sign in again.
            </div>
          )}

          {error && (
            <div className="mb-6 p-3.5 rounded-xl border border-red-500/30 bg-red-950/30 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Username or Email
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin or admin@example.com"
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-10 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 focus:ring-offset-slate-950 transition-all disabled:opacity-50"
              >
                {submitting ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Demo Credentials */}
          <div className="mt-6 pt-6 border-t border-slate-800/80">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Quick Dev Accounts:
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin', 'adminpassword')}
                className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-lg text-xs font-medium text-brand-300 text-center transition-colors"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('manager', 'managerpassword')}
                className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-lg text-xs font-medium text-amber-300 text-center transition-colors"
              >
                Manager
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('user', 'userpassword')}
                className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-lg text-xs font-medium text-emerald-300 text-center transition-colors"
              >
                User
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-400">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-brand-400 hover:text-brand-300">
                Register Now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
