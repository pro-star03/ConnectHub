import { useState, useEffect } from 'react';
import { 
  getReports, 
  resolveReport, 
  dismissReport, 
  adminDeletePost, 
  blockUser 
} from '../../services/adminService';
import { 
  CheckCircle, 
  XCircle, 
  Trash2, 
  UserX, 
  Filter,
  AlertTriangle 
} from 'lucide-react';

const AdminReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchReports = async () => {
    try {
      const res = await getReports();
      setReports(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleResolve = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'resolved' ? 'reviewed' : 'resolved';
    try {
      await resolveReport(id, nextStatus);
      setReports(prev => prev.map(r => r._id === id ? { ...r, status: nextStatus } : r));
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating report status');
    }
  };

  const handleDismiss = async (id) => {
    try {
      await dismissReport(id);
      setReports(prev => prev.map(r => r._id === id ? { ...r, status: 'dismissed' } : r));
    } catch (err) {
      alert(err.response?.data?.message || 'Error dismissing report');
    }
  };

  const handleDeletePost = async (postId, reportId) => {
    if (!window.confirm('Permanently delete this reported post from the platform?')) return;
    try {
      await adminDeletePost(postId);
      if (reportId) {
        await resolveReport(reportId, 'resolved');
      }
      fetchReports();
      alert('Post deleted and report resolved.');
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting post');
    }
  };

  const handleBlockUser = async (userId, reportId) => {
    if (!window.confirm('Block this reported user account?')) return;
    try {
      await blockUser(userId);
      if (reportId) {
        await resolveReport(reportId, 'resolved');
      }
      fetchReports();
      alert('User blocked and report resolved.');
    } catch (err) {
      alert(err.response?.data?.message || 'Error blocking user');
    }
  };

  const filteredReports = reports.filter(r => {
    if (filter === 'pending') return r.status === 'pending' || !r.status;
    if (filter === 'resolved') return r.status === 'resolved' || r.status === 'reviewed';
    if (filter === 'dismissed') return r.status === 'dismissed';
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            Safety & Incident Reports
          </h2>
          <p className="text-sm opacity-70 mt-1">Review flagged community content, enforce guidelines, and protect platform safety.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-base-content/40" />
          <select 
            className="select select-bordered text-sm"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Reports ({reports.length})</option>
            <option value="pending">Pending Review</option>
            <option value="resolved">Resolved / Reviewed</option>
            <option value="dismissed">Dismissed</option>
          </select>
        </div>
      </div>
      
      <div className="card bg-base-100 shadow-sm border border-base-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr className="bg-base-200/50">
                <th>Reporter</th>
                <th>Violation Target</th>
                <th>Reason & Notes</th>
                <th>Status</th>
                <th>Filed Date</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="text-center p-12"><span className="loading loading-spinner text-primary"></span></td></tr>
              ) : filteredReports.length === 0 ? (
                <tr><td colSpan="6" className="text-center p-12 text-base-content/50">No reports in this category.</td></tr>
              ) : (
                filteredReports.map(report => (
                  <tr key={report._id} className="hover:bg-base-200/30 transition-colors">
                    {/* Reporter */}
                    <td>
                      <div className="font-bold text-sm">{report.reportedBy?.name || 'Anonymous User'}</div>
                      <div className="text-xs opacity-50">@{report.reportedBy?.username || 'user'}</div>
                    </td>

                    {/* Reported Target */}
                    <td>
                      {report.reportedUser ? (
                        <div>
                          <span className="badge badge-error badge-outline badge-xs mr-1.5 font-semibold">User Account</span>
                          <span className="font-semibold text-sm">@{report.reportedUser.username}</span>
                          <div className="text-xs opacity-60 mt-0.5">{report.reportedUser.name}</div>
                        </div>
                      ) : report.reportedPost ? (
                        <div>
                          <span className="badge badge-neutral badge-xs mr-1.5 font-semibold">Post Content</span>
                          <div className="text-xs truncate max-w-xs mt-1 text-base-content/80 font-mono">
                            "{report.reportedPost.content}"
                          </div>
                        </div>
                      ) : (
                        <span className="opacity-50 text-xs">Target unavailable (deleted)</span>
                      )}
                    </td>

                    {/* Reason */}
                    <td className="max-w-xs">
                      <div className="font-medium text-sm text-warning flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        {report.reason || 'Guidelines Violation'}
                      </div>
                      {report.notes && (
                        <div className="text-xs opacity-60 mt-1 italic">"{report.notes}"</div>
                      )}
                    </td>

                    {/* Status */}
                    <td>
                      <span className={`badge badge-sm font-semibold ${
                        report.status === 'resolved' ? 'badge-success' :
                        report.status === 'dismissed' ? 'badge-ghost' :
                        report.status === 'reviewed' ? 'badge-info' : 'badge-warning'
                      }`}>
                        {report.status || 'pending'}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="text-xs text-base-content/70">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </td>

                    {/* Actions */}
                    <td>
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        {report.reportedPost && (
                          <button 
                            type="button"
                            onClick={() => handleDeletePost(report.reportedPost._id, report._id)} 
                            className="btn btn-xs btn-error btn-outline gap-1"
                            title="Delete Post"
                          >
                            <Trash2 className="w-3 h-3" /> Delete
                          </button>
                        )}

                        {report.reportedUser && (
                          <button 
                            type="button"
                            onClick={() => handleBlockUser(report.reportedUser._id, report._id)} 
                            className="btn btn-xs btn-error btn-outline gap-1"
                            title="Block User"
                          >
                            <UserX className="w-3 h-3" /> Block
                          </button>
                        )}

                        <button 
                          type="button"
                          onClick={() => handleResolve(report._id, report.status)} 
                          className={`btn btn-xs ${report.status === 'resolved' ? 'btn-info btn-outline' : 'btn-success'} gap-1`}
                        >
                          <CheckCircle className="w-3 h-3" />
                          {report.status === 'resolved' ? 'Mark Reviewed' : 'Resolve'}
                        </button>

                        {report.status !== 'dismissed' && (
                          <button 
                            type="button"
                            onClick={() => handleDismiss(report._id)} 
                            className="btn btn-xs btn-ghost text-base-content/60 hover:text-error"
                            title="Dismiss Report"
                          >
                            <XCircle className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;
