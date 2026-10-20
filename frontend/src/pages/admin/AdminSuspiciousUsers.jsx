import { useState, useEffect } from 'react';
import api from '../../services/api';

const DEMO_SUSPICIOUS_RECORD = {
  _id: 'demo_user123_record',
  name: 'Demo Account',
  username: 'demo_user123',
  email: 'demo@example.com',
  isDemo: true,
  reason: 'Multiple accounts created within a short time (demo scenario)',
  reviewStatus: 'Under Review',
  isActive: true,
  reportCount: 0
};

const AdminSuspiciousUsers = () => {
  const [suspiciousUsers, setSuspiciousUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSuspiciousUsers = async () => {
    try {
      const [usersRes, reportsRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/reports')
      ]);

      const users = usersRes.data;
      const reports = reportsRes.data;

      const reportCounts = {};
      reports.forEach(report => {
        if (report.reportedUser) {
          const id = report.reportedUser._id || report.reportedUser;
          reportCounts[id] = (reportCounts[id] || 0) + 1;
        }
      });

      const suspicious = users
        .filter(user => reportCounts[user._id] > 0)
        .map(user => ({
          ...user,
          reportCount: reportCounts[user._id],
          reason: `${reportCounts[user._id]} report(s) submitted by users`,
          reviewStatus: user.isActive ? 'Under Review' : 'Action Taken (Blocked)'
        }))
        .sort((a, b) => b.reportCount - a.reportCount);

      setSuspiciousUsers([DEMO_SUSPICIOUS_RECORD, ...suspicious]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuspiciousUsers();
  }, []);

  const handleBlockUser = async (id, isCurrentlyBlocked) => {
    if (!window.confirm(`Are you sure you want to ${isCurrentlyBlocked ? 'unblock' : 'block'} this user?`)) return;
    try {
      if (id === DEMO_SUSPICIOUS_RECORD._id) {
        setSuspiciousUsers(prev => prev.map(u => u._id === id ? { 
          ...u, 
          isActive: isCurrentlyBlocked, 
          reviewStatus: isCurrentlyBlocked ? 'Under Review' : 'Action Taken (Blocked)' 
        } : u));
        return;
      }
      if (isCurrentlyBlocked) {
        await api.put(`/admin/users/${id}/unblock`);
      } else {
        await api.put(`/admin/users/${id}/block`);
      }
      fetchSuspiciousUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating user');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Suspicious Users</h2>
        <p className="text-sm opacity-70 mt-1">Users flagged due to suspicious behavior or multiple reports.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center p-8"><span className="loading loading-spinner text-primary"></span></div>
        ) : suspiciousUsers.length === 0 ? (
          <div className="col-span-full text-center p-8 text-base-content/50">No suspicious users found.</div>
        ) : (
          suspiciousUsers.map(user => (
            <div key={user._id} className={`card bg-base-100 shadow-sm border ${user.isDemo ? 'border-warning/60' : 'border-error/30'}`}>
              <div className="card-body">
                <div className="flex items-center justify-between mb-2">
                  {user.isDemo ? (
                    <span className="badge badge-warning text-xs font-semibold">Demo Record</span>
                  ) : (
                    <span className="badge badge-error badge-outline text-xs">Flagged User</span>
                  )}
                  <span className={`badge ${user.reviewStatus === 'Under Review' ? 'badge-warning badge-outline' : 'badge-ghost'} text-xs font-medium`}>
                    {user.reviewStatus || (user.isActive ? 'Under Review' : 'Action Taken')}
                  </span>
                </div>

                <div className="flex items-center gap-4 mb-2">
                  <div className="avatar">
                    <div className="w-12 h-12 rounded-full bg-base-300">
                      {user.profilePicture ? <img src={user.profilePicture} alt="Avatar" /> : <span className="flex items-center justify-center w-full h-full text-xl">{user.name?.charAt(0) || 'U'}</span>}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{user.name}</h3>
                    <p className="text-xs opacity-60">@{user.username}</p>
                    <p className="text-xs opacity-60">{user.email}</p>
                  </div>
                </div>
                
                <div className="bg-base-200 rounded-lg p-3 text-xs space-y-1 mb-2">
                  <div className="font-semibold text-base-content/70">Suspicious Reason:</div>
                  <div className="text-warning font-medium">
                    {user.reason || `${user.reportCount} reports against this user`}
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs opacity-70 mb-4">
                  <span>Review Status: <strong className="text-base-content">{user.reviewStatus || 'Under Review'}</strong></span>
                  <span>Status: <strong>{user.isActive ? 'Active' : 'Blocked'}</strong></span>
                </div>

                <div className="card-actions justify-end mt-auto">
                  {!user.isDemo && (
                    <a href={`/profile/${user._id}`} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-ghost">View</a>
                  )}
                  <button 
                    className={`btn btn-sm ${user.isActive ? 'btn-error' : 'btn-success'}`}
                    onClick={() => handleBlockUser(user._id, !user.isActive)}
                  >
                    {user.isActive ? 'Block User' : 'Unblock User'}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminSuspiciousUsers;
