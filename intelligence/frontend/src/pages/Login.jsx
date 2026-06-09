import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Lock, Mail, AlertCircle } from 'lucide-react';
import GlassCard from '../components/GlassCard';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionExpired = searchParams.get('expired') === 'true';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Spheres */}
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-primary-600/10 rounded-full blur-[80px] -z-10"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-cyan-600/10 rounded-full blur-[80px] -z-10"></div>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 to-cyan-500 flex items-center justify-center font-extrabold text-white shadow-lg shadow-primary-500/20">V</div>
            <span className="font-bold text-2xl tracking-wider text-white">VidyaMitra</span>
          </Link>
          <p className="text-slate-400 mt-2 text-sm">Sign in to resume your career acceleration</p>
        </div>

        <GlassCard hoverEffect={false}>
          {sessionExpired && (
            <div className="p-3 mb-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center gap-2 text-xs">
              <AlertCircle size={16} />
              <span>Session expired. Please sign in again.</span>
            </div>
          )}

          {error && (
            <div className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-2 text-xs">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="glass-input w-full pl-10 pr-4 py-3 rounded-xl text-sm"
                  placeholder="name@company.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <Lock size={16} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="glass-input w-full pl-10 pr-10 py-3 rounded-xl text-sm"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember me & Forgot Password */}
            <div className="flex items-center justify-between text-xs text-slate-400">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-white/10 bg-white/5 text-primary-600 focus:ring-primary-500 focus:ring-offset-dark-900"
                />
                <span>Remember me</span>
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-primary-600 to-cyan-500 hover:from-primary-500 hover:to-cyan-400 shadow-lg shadow-primary-500/20 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
              ) : (
                <span>Login</span>
              )}
            </button>
          </form>
        </GlassCard>

        {/* Register Redirect */}
        <p className="text-center text-slate-400 text-xs mt-6">
          New to VidyaMitra?{' '}
          <Link to="/register" className="text-primary-400 hover:underline font-semibold">
            Create an Account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
