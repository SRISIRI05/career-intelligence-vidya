import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Lock, Mail, User, AlertCircle, ShieldAlert } from 'lucide-react';
import GlassCard from '../components/GlassCard';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Password Strength State
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: 'Weak', color: 'bg-red-500' });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Evaluate Password Strength
  useEffect(() => {
    if (!password) {
      setPasswordStrength({ score: 0, label: 'Weak', color: 'bg-red-500' });
      return;
    }
    
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    let label = 'Weak';
    let color = 'bg-red-500';
    if (score === 2) {
      label = 'Medium';
      color = 'bg-amber-500';
    } else if (score >= 3) {
      label = 'Strong';
      color = 'bg-emerald-500';
    }
    
    setPasswordStrength({ score, label, color });
  }, [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (passwordStrength.score < 2) {
      setError('Password is too weak. Please add uppercase, digits, or symbols.');
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password);
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

      <div className="w-full max-w-md my-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 to-cyan-500 flex items-center justify-center font-extrabold text-white shadow-lg">V</div>
            <span className="font-bold text-2xl tracking-wider text-white">VidyaMitra</span>
          </Link>
          <p className="text-slate-400 mt-2 text-sm">Create your credentials to launch your roadmap</p>
        </div>

        <GlassCard hoverEffect={false}>
          {error && (
            <div className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-2 text-xs">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <User size={16} />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm"
                  placeholder="name@domain.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <Lock size={16} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="glass-input w-full pl-10 pr-10 py-2.5 rounded-xl text-sm"
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
              
              {/* Strength Meter Bars */}
              {password && (
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between items-center text-[10px] text-slate-400">
                    <span>Password Strength:</span>
                    <span className="font-bold uppercase">{passwordStrength.label}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 h-1">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`h-full rounded-full transition-all duration-300 ${
                          step <= passwordStrength.score ? passwordStrength.color : 'bg-white/5'
                        }`}
                      ></div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <Lock size={16} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-primary-600 to-cyan-500 hover:from-primary-500 hover:to-cyan-400 shadow-lg shadow-primary-500/25 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 mt-4"
            >
              {loading ? (
                <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
              ) : (
                <span>Register Account</span>
              )}
            </button>
          </form>
        </GlassCard>

        {/* Login Redirect */}
        <p className="text-center text-slate-400 text-xs mt-6">
          Already registered?{' '}
          <Link to="/login" className="text-primary-400 hover:underline font-semibold">
            Sign In Here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
