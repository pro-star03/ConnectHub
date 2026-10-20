import { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { deactivateAccount, deleteAccount, updateUserProfile, submitFeedback } from '../services/userService';
import { ChevronLeft, User, Lock, Bell, LogOut, UserMinus, Trash2, MessageSquare, UserX, ChevronRight } from 'lucide-react';

const Settings = () => {
  const { user, logoutUser, updateUser, blockedUserIds } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState('Feedback');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState('');

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logoutUser();
      navigate('/login');
    }
  };

  const handleDeactivate = async () => {
    if (window.confirm('Are you sure you want to deactivate your account? You will be logged out. Your data will be kept.')) {
      setLoading(true);
      try {
        await deactivateAccount();
        logoutUser();
        navigate('/login');
      } catch (err) {
        setError(err.response?.data?.message || 'Error deactivating account');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDelete = async () => {
    if (window.confirm('WARNING: Are you sure you want to permanently delete your account? This action cannot be undone.')) {
      const confirmWord = window.prompt('Type "DELETE" to confirm account deletion:');
      if (confirmWord === 'DELETE') {
        setLoading(true);
        try {
          await deleteAccount();
          logoutUser();
          navigate('/login');
        } catch (err) {
          setError(err.response?.data?.message || 'Error deleting account');
        } finally {
          setLoading(false);
        }
      } else {
        alert('Deletion cancelled.');
      }
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!feedbackMessage.trim()) return;
    
    setFeedbackLoading(true);
    try {
      await submitFeedback({ type: feedbackType, message: feedbackMessage });
      setFeedbackSuccess('Feedback submitted successfully!');
      setFeedbackMessage('');
      setTimeout(() => {
        setIsFeedbackOpen(false);
        setFeedbackSuccess('');
      }, 2000);
    } catch (err) {
      alert(err.response?.data?.message || 'Error submitting feedback');
    } finally {
      setFeedbackLoading(false);
    }
  };

  return (
    <div className="pb-20 md:pb-4 max-w-xl mx-auto min-h-screen bg-base-100">
      <div className="sticky top-0 bg-base-100 z-10 p-4 border-b border-base-200 flex items-center gap-4 h-14">
        <button onClick={() => navigate(-1)} className="btn btn-ghost btn-circle btn-sm">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">Settings</h1>
      </div>

      <div className="p-4 flex flex-col gap-6">
        {error && <div className="alert alert-error text-sm py-2">{error}</div>}
        
        {/* Account Section */}
        <div>
          <h2 className="text-sm font-bold text-base-content/50 uppercase tracking-wider mb-2 px-2">Account</h2>
          <div className="bg-base-100 border border-base-200 rounded-2xl overflow-hidden">
            <Link to="/profile" className="flex items-center gap-3 p-4 hover:bg-base-200 transition-colors border-b border-base-200">
              <User size={20} className="text-primary" />
              <span className="font-medium flex-1">Edit Profile</span>
            </Link>
            <Link to="/change-password" className="flex items-center gap-3 p-4 hover:bg-base-200 transition-colors">
              <Lock size={20} className="text-primary" />
              <span className="font-medium flex-1">Change Password</span>
            </Link>
          </div>
        </div>

        {/* Privacy & Appearance Section */}
        <div>
          <h2 className="text-sm font-bold text-base-content/50 uppercase tracking-wider mb-2 px-2">Preferences</h2>
          <div className="bg-base-100 border border-base-200 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-base-200">
              <div className="flex items-center gap-3">
                <Bell size={20} className="text-primary" />
                <span className="font-medium">Notifications</span>
              </div>
              <input 
                type="checkbox" 
                className="toggle toggle-primary" 
                checked={user?.notificationSettings !== false}
                onChange={async (e) => {
                  const val = e.target.checked;
                  try {
                    await updateUserProfile(user._id, { notificationSettings: val });
                    updateUser({ notificationSettings: val });
                  } catch (err) {
                    console.error(err);
                  }
                }}
              />
            </div>
            
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <span className="font-medium">Theme</span>
              </div>
              <select 
                className="select select-bordered select-sm w-max"
                value={user?.themePreference || 'system'}
                onChange={async (e) => {
                  const val = e.target.value;
                  try {
                    await updateUserProfile(user._id, { themePreference: val });
                    updateUser({ themePreference: val });
                  } catch (err) {
                    console.error(err);
                  }
                }}
              >
                <option value="system">System</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
          </div>
        </div>

        {/* Privacy & Safety Section */}
        <div>
          <h2 className="text-sm font-bold text-base-content/50 uppercase tracking-wider mb-2 px-2">Privacy & Safety</h2>
          <div className="bg-base-100 border border-base-200 rounded-2xl overflow-hidden">
            <Link to="/settings/blocked" className="flex items-center gap-3 p-4 hover:bg-base-200 transition-colors">
              <UserX size={20} className="text-error" />
              <div className="flex-1">
                <span className="font-medium block">Block List</span>
                <span className="text-xs text-base-content/50">Manage blocked users</span>
              </div>
              {blockedUserIds?.size > 0 && (
                <span className="badge badge-sm badge-error badge-outline font-semibold">
                  {blockedUserIds.size}
                </span>
              )}
              <ChevronRight size={18} className="text-base-content/40" />
            </Link>
          </div>
        </div>

        {/* Support Section */}
        <div>
          <h2 className="text-sm font-bold text-base-content/50 uppercase tracking-wider mb-2 px-2">Support</h2>
          <div className="bg-base-100 border border-base-200 rounded-2xl overflow-hidden">
            <button 
              onClick={() => setIsFeedbackOpen(true)}
              className="w-full flex items-center gap-3 p-4 hover:bg-base-200 transition-colors"
            >
              <MessageSquare size={20} className="text-primary" />
              <span className="font-medium flex-1 text-left">Feedback & Complaint</span>
            </button>
          </div>
        </div>

        {/* Actions Section */}
        <div>
          <h2 className="text-sm font-bold text-base-content/50 uppercase tracking-wider mb-2 px-2">Account Actions</h2>
          <div className="bg-base-100 border border-base-200 rounded-2xl overflow-hidden">
            <button 
              onClick={handleLogout} 
              className="w-full flex items-center gap-3 p-4 hover:bg-error/10 transition-colors border-b border-base-200 text-left text-error font-medium"
            >
              <LogOut size={20} />
              <span className="flex-1">Log Out</span>
            </button>
            <button 
              onClick={handleDeactivate} 
              disabled={loading}
              className="w-full flex items-center gap-3 p-4 hover:bg-base-200 transition-colors border-b border-base-200 text-left text-warning font-medium"
            >
              <UserMinus size={20} />
              <span className="flex-1">Deactivate Account</span>
            </button>
            <button 
              onClick={handleDelete} 
              disabled={loading}
              className="w-full flex items-center gap-3 p-4 hover:bg-error/10 transition-colors text-left text-error font-medium"
            >
              <Trash2 size={20} />
              <span className="flex-1">Delete Account</span>
            </button>
          </div>
        </div>
      </div>

      {/* Feedback Modal */}
      {isFeedbackOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-base-100 w-full max-w-md rounded-2xl p-6 shadow-2xl">
            <h2 className="text-2xl font-bold mb-4">Feedback & Complaint</h2>
            {feedbackSuccess && <div className="alert alert-success mb-4 text-sm">{feedbackSuccess}</div>}
            
            <form onSubmit={handleFeedbackSubmit}>
              <div className="form-control w-full mb-4">
                <label className="label"><span className="label-text font-medium">Type</span></label>
                <select 
                  className="select select-bordered w-full"
                  value={feedbackType}
                  onChange={(e) => setFeedbackType(e.target.value)}
                >
                  <option value="Feedback">Feedback</option>
                  <option value="Complaint">Complaint</option>
                </select>
              </div>
              
              <div className="form-control w-full mb-6">
                <label className="label"><span className="label-text font-medium">Message</span></label>
                <textarea 
                  className="textarea textarea-bordered h-32 w-full resize-none"
                  placeholder="Describe your feedback or complaint here..."
                  value={feedbackMessage}
                  onChange={(e) => setFeedbackMessage(e.target.value)}
                  required
                ></textarea>
              </div>

              <div className="flex gap-3 justify-end">
                <button 
                  type="button" 
                  className="btn btn-ghost" 
                  onClick={() => setIsFeedbackOpen(false)}
                  disabled={feedbackLoading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className={`btn btn-primary ${feedbackLoading ? 'loading' : ''}`}
                  disabled={feedbackLoading || !feedbackMessage.trim()}
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
