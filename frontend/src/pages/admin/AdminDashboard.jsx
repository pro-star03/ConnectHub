import { useState, useEffect } from 'react';
import api from '../../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/dashboard');
      setStats(res.data);
    } catch (err) {
      setError('Failed to load dashboard stats.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center p-12"><span className="loading loading-spinner loading-lg text-primary"></span></div>;
  if (error) return <div className="alert alert-error">{error}</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Dashboard Overview</h2>
        <p className="text-base-content/70 mt-1">Welcome to the ConnectHub admin panel.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card bg-base-100 shadow-sm border border-base-200">
          <div className="card-body">
            <h3 className="card-title text-base-content/70">Total Users</h3>
            <p className="text-4xl font-black text-primary">{stats?.totalUsers || 0}</p>
          </div>
        </div>
        
        <div className="card bg-base-100 shadow-sm border border-base-200">
          <div className="card-body">
            <h3 className="card-title text-base-content/70">Active Users</h3>
            <p className="text-4xl font-black text-success">{stats?.activeUsers || 0}</p>
          </div>
        </div>
        
        <div className="card bg-base-100 shadow-sm border border-base-200">
          <div className="card-body">
            <h3 className="card-title text-base-content/70">Inactive/Blocked</h3>
            <p className="text-4xl font-black text-error">{stats?.inactiveUsers || 0}</p>
          </div>
        </div>

        <div className="card bg-base-100 shadow-sm border border-base-200">
          <div className="card-body">
            <h3 className="card-title text-base-content/70">Total Posts</h3>
            <p className="text-4xl font-black text-secondary">{stats?.totalPosts || 0}</p>
          </div>
        </div>

        <div className="card bg-base-100 shadow-sm border border-base-200">
          <div className="card-body">
            <h3 className="card-title text-base-content/70">Total Comments</h3>
            <p className="text-4xl font-black text-accent">{stats?.totalComments || 0}</p>
          </div>
        </div>

        <div className="card bg-base-100 shadow-sm border border-base-200">
          <div className="card-body">
            <h3 className="card-title text-base-content/70">Pending Reports</h3>
            <p className="text-4xl font-black text-warning">{stats?.activeReports || 0}</p>
          </div>
        </div>
      </div>
      
      {/* Empty state for recent activity for now */}
      <div className="card bg-base-100 shadow-sm border border-base-200 mt-8">
        <div className="card-body">
          <h3 className="card-title mb-4">Quick Actions</h3>
          <div className="flex gap-4 flex-wrap">
            <a href="/admin/users" className="btn btn-outline">Manage Users</a>
            <a href="/admin/reports" className="btn btn-outline">View Reports</a>
            <a href="/admin/settings" className="btn btn-outline">System Settings</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
