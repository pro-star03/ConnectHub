import { useState, useEffect } from 'react';
import api from '../../services/api';

const AdminReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await api.get('/admin/reports');
      setReports(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id, currentStatus) => {
    const newStatus = currentStatus === 'resolved' ? 'reviewed' : 'resolved';
    try {
      await api.put(`/admin/reports/${id}/resolve`, { status: newStatus });
      setReports(reports.map(r => r._id === id ? { ...r, status: newStatus } : r));
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating report status');
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Delete this reported post?')) return;
    try {
      await api.delete(`/admin/posts/${postId}`);
      alert('Post deleted.');
    } catch (err) {
      alert(err.response?.data?.message || 'Error');
    }
  };

  const handleBlockUser = async (userId) => {
    if (!window.confirm('Block this reported user?')) return;
    try {
      await api.put(`/admin/users/${userId}/block`);
      alert('User blocked.');
    } catch (err) {
      alert(err.response?.data?.message || 'Error');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Manage Reports</h2>
      
      <div className="card bg-base-100 shadow-sm border border-base-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Reporter</th>
                <th>Target</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="text-center p-8"><span className="loading loading-spinner"></span></td></tr>
              ) : reports.length === 0 ? (
                <tr><td colSpan="6" className="text-center p-8 text-base-content/50">No reports found</td></tr>
              ) : (
                reports.map(report => (
                  <tr key={report._id}>
                    <td>
                      <div className="font-bold">{report.reportedBy?.name || 'Unknown'}</div>
                      <div className="text-xs opacity-50">@{report.reportedBy?.username || 'unknown'}</div>
                    </td>
                    <td>
                      {report.reportedUser ? (
                        <div>
                          <span className="badge badge-sm mr-2">User</span>
                          <span className="font-semibold">{report.reportedUser.username}</span>
                        </div>
                      ) : report.reportedPost ? (
                        <div>
                          <span className="badge badge-sm badge-neutral mr-2">Post</span>
                          <span className="text-xs truncate max-w-[100px] inline-block align-bottom">{report.reportedPost.content}</span>
                        </div>
                      ) : (
                        <span className="opacity-50">Unknown</span>
                      )}
                    </td>
                    <td>{report.reason}</td>
                    <td>
                      <span className={`badge ${report.status === 'resolved' ? 'badge-success' : 'badge-warning'}`}>
                        {report.status || 'pending'}
                      </span>
                    </td>
                    <td className="text-sm">{new Date(report.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="flex gap-2 flex-wrap">
                        {report.reportedPost && (
                          <button onClick={() => handleDeletePost(report.reportedPost._id)} className="btn btn-xs btn-error btn-outline">Delete Post</button>
                        )}
                        {report.reportedUser && (
                          <button onClick={() => handleBlockUser(report.reportedUser._id)} className="btn btn-xs btn-error btn-outline">Block User</button>
                        )}
                        <button onClick={() => handleResolve(report._id, report.status)} className={`btn btn-xs ${report.status === 'resolved' ? 'btn-warning' : 'btn-success'} btn-outline`}>
                          {report.status === 'resolved' ? 'Mark Reviewed' : 'Mark Resolved'}
                        </button>
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
