import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { getAdminSettings, updateAdminSettings } from '../../services/adminService';
import api from '../../services/api';
import { 
  Clock, 
  Sun, 
  Moon, 
  ShieldCheck, 
  Megaphone, 
  Save 
} from 'lucide-react';

const ROOT_ADMIN_EMAIL = 'alok@gmail.com';

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
  const [announcementText, setAnnouncementText] = useState('');
  const [announcementActive, setAnnouncementActive] = useState(false);
  const [savingBanner, setSavingBanner] = useState(false);
  const [bannerSuccess, setBannerSuccess] = useState(false);
  const [settingsError, setSettingsError] = useState('');
  const [adminTheme, setAdminTheme] = useState(() => localStorage.getItem('adminTheme') || 'dark');

  const isRoot = user?.email === ROOT_ADMIN_EMAIL;

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await getAdminSettings();
      if (res.data) {
        setRegistrationEnabled(res.data.registrationEnabled !== false);
        setLastLogin(res.data.lastLogin);
        if (res.data.announcementBanner) {
          setAnnouncementText(res.data.announcementBanner.text || '');
          setAnnouncementActive(!!res.data.announcementBanner.active);
        }
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
      await updateAdminSettings({ registrationEnabled: newValue });
      setRegistrationEnabled(newValue);
    } catch (err) {
      setSettingsError(err.response?.data?.message || 'Error updating registration setting');
    }
  };

  const handleSaveBanner = async (e) => {
    e.preventDefault();
    setSavingBanner(true);
    setBannerSuccess(false);
    try {
      await updateAdminSettings({
        announcementBanner: {
          text: announcementText.trim(),
          active: announcementActive
        }
      });
      setBannerSuccess(true);
      setTimeout(() => setBannerSuccess(false), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update announcement');
    } finally {
      setSavingBanner(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (isRoot) {
      return setError('Root administrator password is fixed to 1234567890 by system configuration.');
    }

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
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold">Platform Configuration</h2>
        <p className="text-sm opacity-70 mt-1">Platform policies, global announcements, and administrator credentials.</p>
      </div>

      {/* Fixed Root Administrator Card */}
      <div className="card bg-base-100 shadow-sm border border-primary/30">
        <div className="card-body p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-bold text-lg flex items-center gap-2">
                  Fixed Root Administrator
                  <span className="badge badge-primary badge-sm font-mono">Protected</span>
                </h3>
                <p className="text-xs text-base-content/60">Configured in <code className="font-mono bg-base-200 px-1 py-0.5 rounded">backend/src/config/adminConfig.js</code></p>
              </div>
            </div>
            <span className="badge badge-success badge-outline text-xs">Active & Verified</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 bg-base-200/50 p-4 rounded-xl text-sm font-mono">
            <div>
              <span className="text-xs text-base-content/50 block font-sans">Root Admin Email:</span>
              <span className="font-bold text-primary">alok@gmail.com</span>
            </div>
            <div>
              <span className="text-xs text-base-content/50 block font-sans">Fixed Master Password:</span>
              <span className="font-bold text-primary tracking-widest">1234567890</span>
            </div>
          </div>
          <p className="text-xs text-base-content/50 mt-2">
            The root administrator credentials are automatically synchronized and protected against unauthorized modification or deletion.
          </p>
        </div>
      </div>

      {/* Global Community Announcement Banner */}
      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-warning" />
              <h3 className="card-title text-lg">Global Community Announcement</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs opacity-70">Broadcast:</span>
              <input 
                type="checkbox" 
                className="toggle toggle-warning toggle-sm"
                checked={announcementActive}
                onChange={(e) => setAnnouncementActive(e.target.checked)}
              />
            </div>
          </div>
          <p className="text-xs opacity-70 mb-4">
            Broadcast an announcement banner across the top of the entire ConnectHub application.
          </p>

          {bannerSuccess && (
            <div className="alert alert-success text-xs py-2 mb-3">
              Announcement banner settings saved successfully!
            </div>
          )}

          <form onSubmit={handleSaveBanner} className="space-y-3">
            <textarea
              className="textarea textarea-bordered w-full text-sm"
              rows={2}
              placeholder="e.g. 📢 ConnectHub v2.0 is live! Try out interactive polls, multi-reactions, and verified creator profiles!"
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
            />
            <div className="flex justify-end">
              <button 
                type="submit" 
                disabled={savingBanner}
                className="btn btn-sm btn-primary gap-1"
              >
                <Save className="w-3.5 h-3.5" />
                {savingBanner ? 'Saving...' : 'Save Announcement'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* User Registration Toggle */}
      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body p-6">
          <h3 className="card-title text-lg mb-2">Platform Access Control</h3>
          {settingsError && <div className="alert alert-error shadow-sm mb-4 text-xs">{settingsError}</div>}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-sm">Allow New Community Registrations</p>
                <span className={`badge badge-sm ${registrationEnabled ? 'badge-success' : 'badge-error'}`}>
                  {registrationEnabled ? 'ENABLED' : 'DISABLED'}
                </span>
              </div>
              <p className="text-xs opacity-70 mt-1">
                {registrationEnabled 
                  ? 'New visitors can sign up for ConnectHub accounts freely.' 
                  : 'Registrations are locked. Only existing members and administrators can log in.'}
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

      {/* Theme & Session Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card bg-base-100 shadow-sm border border-base-200">
          <div className="card-body p-6 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-sm mb-1">Admin Panel Theme</h3>
              <p className="text-xs opacity-60">Switch theme between Dark Mode and Light Mode.</p>
            </div>
            <button 
              type="button"
              onClick={handleToggleTheme}
              className="btn btn-outline btn-sm gap-2 mt-4 self-start"
            >
              {adminTheme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              {adminTheme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            </button>
          </div>
        </div>

        <div className="card bg-base-100 shadow-sm border border-base-200">
          <div className="card-body p-6 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-sm mb-1">Last Admin Session</h3>
              <p className="text-xs opacity-60">Timestamp of your most recent administrative login.</p>
            </div>
            <div className="mt-4 flex items-center gap-2 font-mono text-xs opacity-80 bg-base-200 p-2.5 rounded-lg">
              <Clock className="w-4 h-4 text-primary shrink-0" />
              <span>{lastLogin ? new Date(lastLogin).toLocaleString() : 'Current active session'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password (Only for non-root admins) */}
      {!isRoot && (
        <div className="card bg-base-100 shadow-sm border border-base-200">
          <div className="card-body p-6">
            <h3 className="card-title text-lg mb-4">Change Administrator Password</h3>
            
            {message && <div className="alert alert-success shadow-sm mb-4 text-xs">{message}</div>}
            {error && <div className="alert alert-error shadow-sm mb-4 text-xs">{error}</div>}
            
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-xs">Current Password</span>
                </label>
                <input
                  type="password"
                  className="input input-bordered input-sm"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text text-xs">New Password</span>
                  </label>
                  <input
                    type="password"
                    className="input input-bordered input-sm"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text text-xs">Confirm New Password</span>
                  </label>
                  <input
                    type="password"
                    className="input input-bordered input-sm"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end mt-2">
                <button 
                  type="submit" 
                  className="btn btn-sm btn-primary"
                  disabled={loading}
                >
                  {loading && <span className="loading loading-spinner loading-xs"></span>}
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSettings;
