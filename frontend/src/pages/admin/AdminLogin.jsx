import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginUser, logoutUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await loginUser(email, password);
      if (data.role === 'admin' || data.isAdmin) {
        navigate('/admin/dashboard');
      } else {
        logoutUser(); // Not an admin
        setError('Access denied. You do not have admin privileges.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200" data-theme="dark">
      <div className="card w-full max-w-md bg-base-100 shadow-2xl">
        <div className="card-body">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-primary mb-2">ConnectHub</h1>
            <h2 className="text-xl font-semibold opacity-80">Admin Panel</h2>
          </div>

          {error && (
            <div className="alert alert-error shadow-lg mb-4">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Admin Email</span>
              </label>
              <input
                type="email"
                placeholder="admin@example.com"
                className="input input-bordered w-full focus:input-primary"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="form-control">
              <label className="label">
                <span className="label-text">Admin Password</span>
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="input input-bordered w-full focus:input-primary"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button 
              type="submit" 
              className={`btn btn-primary w-full mt-6 ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              Admin Login
            </button>
          </form>

          <div className="divider my-6">OR</div>

          <div className="text-center">
            <Link to="/login" className="link link-hover text-sm opacity-70">
              Back to User Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
