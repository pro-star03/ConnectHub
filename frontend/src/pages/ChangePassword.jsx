import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { changePassword } from '../services/userService';
import { AuthContext } from '../context/AuthContext';
import { ChevronLeft } from 'lucide-react';

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const navigate = useNavigate();
  const { logoutUser } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      return setError('New passwords do not match');
    }

    if (newPassword.length < 6) {
      return setError('New password must be at least 6 characters');
    }

    setLoading(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setSuccess('Password changed successfully. Please log in again.');
      setTimeout(() => {
        logoutUser();
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error changing password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-20 md:pb-4 max-w-xl mx-auto min-h-screen bg-base-100">
      <div className="sticky top-0 bg-base-100 z-10 p-4 border-b border-base-200 flex items-center gap-4 h-14">
        <button onClick={() => navigate(-1)} className="btn btn-ghost btn-circle btn-sm">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">Change Password</h1>
      </div>

      <div className="p-4">
        {error && <div className="alert alert-error text-sm py-2 mb-4">{error}</div>}
        {success && <div className="alert alert-success text-sm py-2 mb-4">{success}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Current Password</span>
            </label>
            <input 
              type="password" 
              className="input input-bordered w-full rounded-xl"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">New Password</span>
            </label>
            <input 
              type="password" 
              className="input input-bordered w-full rounded-xl"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Confirm New Password</span>
            </label>
            <input 
              type="password" 
              className="input input-bordered w-full rounded-xl"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary w-full mt-4 rounded-xl"
            disabled={loading}
          >
            {loading ? <span className="loading loading-spinner"></span> : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
