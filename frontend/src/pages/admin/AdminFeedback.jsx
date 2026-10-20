import { useState, useEffect } from 'react';
import api from '../../services/api';

const AdminFeedback = () => {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFeedback = async () => {
    try {
      const res = await api.get('/admin/feedback');
      setFeedback(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  const handleResolve = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Resolved' ? 'Reviewed' : 'Resolved';
    try {
      await api.put(`/admin/feedback/${id}/resolve`, { status: newStatus });
      setFeedback(feedback.map(f => f._id === id ? { ...f, status: newStatus } : f));
    } catch (err) {
      alert(err.response?.data?.message || 'Error resolving feedback');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">User Feedback</h2>
      
      <div className="card bg-base-100 shadow-sm border border-base-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>User</th>
                <th>Feedback Type</th>
                <th>Message</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="text-center p-8"><span className="loading loading-spinner"></span></td></tr>
              ) : feedback.length === 0 ? (
                <tr><td colSpan="6" className="text-center p-8 text-base-content/50">No feedback submitted</td></tr>
              ) : (
                feedback.map(item => (
                  <tr key={item._id}>
                    <td>
                      <div className="font-bold">{item.user?.name || 'Unknown'}</div>
                      <div className="text-xs opacity-50">@{item.user?.username || 'unknown'}</div>
                    </td>
                    <td><span className="badge badge-outline">{item.type || 'General'}</span></td>
                    <td className="max-w-md whitespace-normal">{item.message}</td>
                    <td className="text-sm whitespace-nowrap">{new Date(item.createdAt).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge ${item.status === 'Resolved' ? 'badge-success' : item.status === 'Reviewed' ? 'badge-warning' : 'badge-error'}`}>
                        {item.status || 'Pending'}
                      </span>
                    </td>
                    <td>
                      <button 
                        className={`btn btn-xs ${item.status === 'Resolved' ? 'btn-warning' : 'btn-success'} btn-outline`}
                        onClick={() => handleResolve(item._id, item.status)}
                      >
                        {item.status === 'Resolved' ? 'Mark Reviewed' : 'Mark Resolved'}
                      </button>
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

export default AdminFeedback;
