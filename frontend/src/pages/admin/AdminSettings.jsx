import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import { Clock, Sun, Moon } from 'lucide-react';

const AdminSettings = () => {
  const { user } = useContext(AuthContext);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [lastLogin, setLastLogin] = useState(null);
  const [registrationEnabled, setRegistrationEnabled] = useState(true);
  const [settingsError, setSettingsError] = useState('');
  const [adminTheme, setAdminTheme] = useState(() => localStorage.getItem('adminTheme') || 'dark');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/admin/settings');
      if (res.data) {
        setRegistrationEnabled(res.data.registrationEnabled !== false);
        setLastLogin(res.data.lastLogin);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleTheme = () => {
    const nextTheme = adminTheme === 'dark' ? 'light' : 'dark';
    setAdminTheme(nextTheme);
    localStorage.setItem('adminTheme', nextTheme);
    window.dispatchEvent(new Event('adminThemeChanged'));
  };

  const handleToggleRegistration = async () => {
    const newValue = !registrationEnabled;
    setSettingsError('');
    try {
      await api.put('/admin/settings', { registrationEnabled: newValue });
      setRegistrationEnabled(newValue);
    } catch (err) {
      setSettingsError(err.response?.data?.message || 'Error updating registration setting');
    }
  };

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
          <h3 className="card-title text-xl mb-4">Login Activity</h3>
          <div className="bg-base-200 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-primary" />
              <div>
                <p className="font-semibold text-sm">Most Recent Admin Login</p>
                <p className="text-xs opacity-70">Timestamp of latest successful admin session</p>
              </div>
            </div>
            <div className="text-right">
              <span className="font-mono font-medium text-sm">
                {lastLogin ? new Date(lastLogin).toLocaleString() : 'No previous login recorded'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body">
          <h3 className="card-title text-xl mb-4">Theme & Appearance</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm">Dashboard Theme</p>
              <p className="text-xs opacity-70">Toggle between light and dark modes across admin pages</p>
            </div>
            <button 
              type="button"
              onClick={handleToggleTheme}
              className="btn btn-outline btn-sm gap-2"
            >
              {adminTheme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              {adminTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            </button>
          </div>
        </div>
      </div>

      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body">
          <h3 className="card-title text-xl mb-4">User Registration Setting</h3>
          {settingsError && <div className="alert alert-error shadow-sm mb-4">{settingsError}</div>}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-sm">Allow New Registrations</p>
                <span className={`badge badge-sm ${registrationEnabled ? 'badge-success' : 'badge-error'}`}>
                  {registrationEnabled ? 'ON' : 'OFF'}
                </span>
              </div>
              <p className="text-xs opacity-70 mt-1">
                {registrationEnabled 
                  ? 'New users are allowed to sign up for ConnectHub accounts' 
                  : 'New registrations are disabled. Existing users can still log in'}
              </p>
            </div>
            <input 
              type="checkbox" 
              className="toggle toggle-primary"
              checked={registrationEnabled}
              onChange={handleToggleRegistration}
            />
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
