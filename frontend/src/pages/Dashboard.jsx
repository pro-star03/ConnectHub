import { useState, useEffect } from 'react';
import { getDashboardStats, getUsers, getReports, blockUser, unblockUser, adminDeletePost, getFeedback, resolveFeedback, getActivity } from '../services/adminService';
import { Users, Activity, AlertTriangle, ShieldCheck, CheckCircle, Ban, Trash2, MessageSquare, FileText, List } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [activity, setActivity] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [statsRes, usersRes, reportsRes, feedbackRes, activityRes] = await Promise.all([
          getDashboardStats(),
          getUsers(),
          getReports(),
          getFeedback(),
          getActivity()
        ]);
        setStats(statsRes.data);
        setUsers(usersRes.data);
        setReports(reportsRes.data);
        setFeedback(feedbackRes.data);
        setActivity(activityRes.data);
      } catch (err) {
        console.error('Admin API error', err);
        setStats(statsRes?.data || { totalUsers: 0, activeUsers: 0, inactiveUsers: 0, totalPosts: 0, totalComments: 0, activeReports: 0 });
        setUsers(usersRes?.data || []);
        setReports(reportsRes?.data || []);
        setFeedback(feedbackRes?.data || []);
        setActivity(activityRes?.data || []);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  const handleBlockToggle = async (userId, isBlocked) => {
    try {
      if (isBlocked) {
        await unblockUser(userId);
      } else {
        await blockUser(userId);
      }
      setUsers(users.map(u => u._id === userId ? { ...u, isBlocked: !isBlocked } : u));
    } catch (err) {
      console.error(err);
      alert('Action failed. Backend endpoint might not exist.');
    }
  };

  const handleDeletePost = async (postId, reportId) => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await adminDeletePost(postId);
      setReports(reports.map(r => r._id === reportId ? { ...r, status: 'resolved' } : r));
      alert('Post deleted and report resolved');
    } catch (err) {
      console.error(err);
      alert('Action failed. Backend endpoint might not exist.');
    }
  };

  const handleResolveFeedback = async (id) => {
    try {
      await resolveFeedback(id);
      setFeedback(feedback.map(f => f._id === id ? { ...f, status: 'resolved' } : f));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="flex justify-center p-12"><span className="loading loading-spinner text-primary loading-lg"></span></div>;

  return (
    <div className="p-6 max-w-5xl mx-auto min-h-screen">
      <div className="flex items-center gap-3 mb-8">
        <ShieldCheck size={32} className="text-primary" />
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </div>

      <div className="tabs tabs-boxed mb-6 bg-base-200">
        <a className={`tab ${activeTab === 'overview' ? 'tab-active' : ''}`} onClick={() => setActiveTab('overview')}>Overview</a>
        <a className={`tab ${activeTab === 'users' ? 'tab-active' : ''}`} onClick={() => setActiveTab('users')}>User Management</a>
        <a className={`tab ${activeTab === 'moderation' ? 'tab-active' : ''}`} onClick={() => setActiveTab('moderation')}>Content Moderation</a>
        <a className={`tab ${activeTab === 'feedback' ? 'tab-active' : ''}`} onClick={() => setActiveTab('feedback')}>Feedback</a>
        <a className={`tab ${activeTab === 'activity' ? 'tab-active' : ''}`} onClick={() => setActiveTab('activity')}>Admin Activity</a>
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="stat bg-base-100 shadow rounded-box border border-base-200">
            <div className="stat-figure text-primary"><Users size={32} /></div>
            <div className="stat-title">Total Users</div>
            <div className="stat-value">{stats?.totalUsers || 0}</div>
          </div>
          <div className="stat bg-base-100 shadow rounded-box border border-base-200">
            <div className="stat-figure text-success"><Activity size={32} /></div>
            <div className="stat-title">Active Users</div>
            <div className="stat-value text-success">{stats?.activeUsers || 0}</div>
          </div>
          <div className="stat bg-base-100 shadow rounded-box border border-base-200">
            <div className="stat-figure text-error"><Ban size={32} /></div>
            <div className="stat-title">Inactive Users</div>
            <div className="stat-value text-error">{stats?.inactiveUsers || 0}</div>
          </div>
          <div className="stat bg-base-100 shadow rounded-box border border-base-200">
            <div className="stat-figure text-info"><FileText size={32} /></div>
            <div className="stat-title">Total Posts</div>
            <div className="stat-value text-info">{stats?.totalPosts || 0}</div>
          </div>
          <div className="stat bg-base-100 shadow rounded-box border border-base-200">
            <div className="stat-figure text-secondary"><MessageSquare size={32} /></div>
            <div className="stat-title">Total Comments</div>
            <div className="stat-value text-secondary">{stats?.totalComments || 0}</div>
          </div>
          <div className="stat bg-base-100 shadow rounded-box border border-base-200">
            <div className="stat-figure text-warning"><AlertTriangle size={32} /></div>
            <div className="stat-title">Reports</div>
            <div className="stat-value text-warning">{stats?.activeReports || 0}</div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-base-100 shadow-sm rounded-box border border-base-200 overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Joined</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td colSpan="5" className="text-center p-4">No users found (or backend endpoint missing)</td></tr>
              ) : (
                users.map(u => (
                  <tr key={u._id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="avatar placeholder">
                          <div className="bg-neutral text-neutral-content rounded-full w-8"><span className="text-xs">{u.name?.charAt(0)}</span></div>
                        </div>
                        <div>
                          <div className="font-bold">{u.name}</div>
                          <div className="text-sm opacity-50">@{u.username}</div>
                        </div>
                      </div>
                    </td>
                    <td>{u.email}</td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td>
                      {u.isBlocked ? (
                        <div className="badge badge-error gap-1"><Ban size={12}/> Blocked</div>
                      ) : (
                        <div className="badge badge-success gap-1">Active</div>
                      )}
                    </td>
                    <td>
                      <button 
                        onClick={() => handleBlockToggle(u._id, u.isBlocked)}
                        className={`btn btn-xs ${u.isBlocked ? 'btn-success' : 'btn-error'}`}
                      >
                        {u.isBlocked ? 'Unblock' : 'Block'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'moderation' && (
        <div className="bg-base-100 shadow-sm rounded-box border border-base-200">
          {reports.length === 0 ? (
            <div className="p-8 text-center text-base-content/50">
              <CheckCircle size={48} className="mx-auto text-success mb-2 opacity-50" />
              <p>No pending reports. All good!</p>
            </div>
          ) : (
            <div className="divide-y divide-base-200">
              {reports.map(report => (
                <div key={report._id} className="p-4 flex flex-col md:flex-row justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="badge badge-warning">Reported Content</span>
                      <span className="text-sm text-base-content/60">by {report.reportedBy?.name || 'Unknown'}</span>
                    </div>
                    <p className="font-semibold">{report.reason}</p>
                    <div className="mt-2 p-3 bg-base-200 rounded-lg text-sm">
                      {/* Assuming report contains post snippet */}
                      Post content: "{report.post?.content || 'Content hidden/deleted'}"
                    </div>
                  </div>
                  <div className="flex gap-2 self-start md:self-center">
                    <button onClick={() => handleDeletePost(report.post?._id, report._id)} className="btn btn-error btn-sm gap-2">
                      <Trash2 size={16} /> Delete Post
                    </button>
                    <button className="btn btn-ghost btn-sm">Dismiss</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'feedback' && (
        <div className="bg-base-100 shadow-sm rounded-box border border-base-200 p-4">
          {feedback.length === 0 ? (
            <div className="text-center p-8 text-base-content/50">
              <CheckCircle size={48} className="mx-auto text-success mb-2 opacity-50" />
              <p>No feedback received yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Message</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {feedback.map(item => (
                    <tr key={item._id}>
                      <td>{item.user?.name || 'Anonymous'}</td>
                      <td className="max-w-xs truncate" title={item.message}>{item.message}</td>
                      <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                      <td>
                        {item.status === 'resolved' ? (
                          <div className="badge badge-success gap-1">Resolved</div>
                        ) : (
                          <div className="badge badge-warning gap-1">Unresolved</div>
                        )}
                      </td>
                      <td>
                        {item.status !== 'resolved' && (
                          <button onClick={() => handleResolveFeedback(item._id)} className="btn btn-xs btn-outline btn-success">Mark Resolved</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      {activeTab === 'activity' && (
        <div className="bg-base-100 shadow-sm rounded-box border border-base-200 p-4">
          <div className="flex items-center gap-2 mb-4">
            <List size={20} className="text-primary" />
            <h2 className="font-bold text-lg">Recent System Activity</h2>
          </div>
          {activity.length === 0 ? (
            <div className="text-center p-8 text-base-content/50">
              <p>No activity logged yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Action</th>
                    <th>Details</th>
                    <th>Performed By</th>
                  </tr>
                </thead>
                <tbody>
                  {activity.map(item => (
                    <tr key={item._id}>
                      <td>{new Date(item.createdAt).toLocaleString()}</td>
                      <td>
                        <span className="badge badge-neutral">{item.action}</span>
                      </td>
                      <td>{item.details}</td>
                      <td>{item.performedBy?.name || 'System'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;