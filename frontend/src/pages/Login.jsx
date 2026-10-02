import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Hexagon } from 'lucide-react';

const Login = () => {
  const { loginUser } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await loginUser(formData.email, formData.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-base-200">
      {/* Left side - Image/Branding (Hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 bg-primary items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary opacity-90"></div>
        <div className="relative z-10 text-primary-content p-12 max-w-lg">
          <Hexagon size={64} className="mb-6" />
          <h1 className="text-5xl font-bold mb-4 leading-tight">Welcome back to your community.</h1>
          <p className="text-xl opacity-80">Connect, share, and engage with the people who matter most to you on ConnectHub.</p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-6 bg-base-100">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <div className="flex justify-center items-center gap-2 mb-4 lg:hidden">
              <Hexagon className="text-primary" size={32} />
              <span className="text-3xl font-bold text-primary tracking-tight">ConnectHub</span>
            </div>
            <h2 className="text-3xl font-bold mb-2">Log In</h2>
            <p className="text-base-content/60">Enter your credentials to access your account</p>
          </div>
          
          {error && (
            <div className="alert alert-error text-sm mb-6 shadow-sm">
              <span>{error}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Email Address</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-base-content/50">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  className="input input-bordered w-full pl-12 h-12 bg-base-200 focus:bg-base-100 transition-colors"
                  placeholder="you@example.com"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>
            
            <div className="form-control">
              <div className="flex justify-between items-center">
                <label className="label">
                  <span className="label-text font-semibold">Password</span>
                </label>
                <a href="#" className="text-xs text-primary hover:underline font-medium">Forgot password?</a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-base-content/50">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input input-bordered w-full pl-12 pr-12 h-12 bg-base-200 focus:bg-base-100 transition-colors"
                  placeholder="••••••••"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-base-content/50 hover:text-primary transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            <div className="form-control mt-8">
              <button 
                type="submit" 
                className="btn btn-primary w-full h-12 text-lg"
                disabled={loading}
              >
                {loading ? <span className="loading loading-spinner"></span> : 'Log In'}
              </button>
            </div>
          </form>
          
          <div className="divider mt-8 mb-8 text-base-content/40">OR</div>
          
          <p className="text-center">
            Don't have an account?{' '}
            <Link to="/register" className="link link-primary font-bold hover:no-underline ml-1">
              Sign up
            </Link>
          </p>

          <div className="text-center mt-6">
            <Link to="/admin/login" className="text-xs text-base-content/50 hover:text-primary transition-colors">
              Admin Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;