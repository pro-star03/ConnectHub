import { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';

const AdminSettings = () => {
  const { user, updateUser } = useContext(AuthContext);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (newPassword !== confirmPassword) {
      return setError('New passwords do not match');
    }

    if (newPassword.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    setLoading(true);
    try {
      await api.put('/users/change-password', {
        currentPassword,
        newPassword
      });
      setMessage('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold">Admin Settings</h2>
      
      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body">
          <h3 className="card-title text-xl mb-4">Profile Information</h3>
          
          <div className="flex items-center gap-6 mb-6">
            <div className="avatar">
              <div className="w-24 rounded-full bg-base-300">
                {user?.profilePicture ? <img src={user.profilePicture} alt="Avatar" /> : <span className="flex items-center justify-center w-full h-full text-3xl">{user?.name?.charAt(0)}</span>}
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold">{user?.name}</div>
              <div className="opacity-70">@{user?.username}</div>
              <div className="badge badge-primary mt-2">Admin privileges active</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body">
          <h3 className="card-title text-xl mb-4">Change Password</h3>
          
          {message && <div className="alert alert-success shadow-sm mb-4">{message}</div>}
          {error && <div className="alert alert-error shadow-sm mb-4">{error}</div>}
          
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Current Password</span>
              </label>
              <input
                type="password"
                className="input input-bordered"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            
            <div className="form-control">
              <label className="label">
                <span className="label-text">New Password</span>
              </label>
              <input
                type="password"
                className="input input-bordered"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Confirm New Password</span>
              </label>
              <input
                type="password"
                className="input input-bordered"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <div className="mt-6 flex justify-end">
              <button 
                type="submit" 
                className={`btn btn-primary ${loading ? 'loading' : ''}`}
                disabled={loading}
              >
                Update Password
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
