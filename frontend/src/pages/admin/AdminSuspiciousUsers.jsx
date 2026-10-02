import { useState, useEffect } from 'react';
import api from '../../services/api';

const AdminSuspiciousUsers = () => {
  const [suspiciousUsers, setSuspiciousUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSuspiciousUsers();
  }, []);

  const fetchSuspiciousUsers = async () => {
    try {
      // In a real application, there would be a specific endpoint.
      // For this college project, we can fetch all users and all reports,
      // then calculate users with multiple reports.
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
        .map(user => ({ ...user, reportCount: reportCounts[user._id] }))
        .sort((a, b) => b.reportCount - a.reportCount);

      setSuspiciousUsers(suspicious);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBlockUser = async (id, isCurrentlyBlocked) => {
    if (!window.confirm(`Are you sure you want to ${isCurrentlyBlocked ? 'unblock' : 'block'} this user?`)) return;
    try {
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
        <p className="text-sm opacity-70 mt-1">Users flagged due to multiple reports.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center p-8"><span className="loading loading-spinner text-primary"></span></div>
        ) : suspiciousUsers.length === 0 ? (
          <div className="col-span-full text-center p-8 text-base-content/50">No suspicious users found. Good job!</div>
        ) : (
          suspiciousUsers.map(user => (
            <div key={user._id} className="card bg-base-100 shadow-sm border border-error/30">
              <div className="card-body">
                <div className="flex items-center gap-4 mb-2">
                  <div className="avatar">
                    <div className="w-12 h-12 rounded-full bg-base-300">
                      {user.profilePicture ? <img src={user.profilePicture} alt="Avatar" /> : <span className="flex items-center justify-center w-full h-full text-xl">{user.name.charAt(0)}</span>}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{user.name}</h3>
                    <p className="text-xs opacity-60">@{user.username}</p>
                  </div>
                </div>
                
                <div className="alert alert-warning py-2 mb-2">
                  <span className="font-bold">{user.reportCount}</span> reports against this user
                </div>
                
                <div className="text-sm opacity-70 mb-4">
                  Status: {user.isActive ? 'Active' : 'Blocked'}
                </div>

                <div className="card-actions justify-end mt-auto">
                  <a href={`/profile/${user._id}`} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-ghost">View</a>
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
