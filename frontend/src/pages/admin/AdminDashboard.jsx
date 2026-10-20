import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { 
  Users, 
  UserCheck, 
  UserX, 
  BadgeCheck,
  FileText, 
  Pin,
  MessageSquare, 
  Flag, 
  ShieldAlert, 
  Activity, 
  ArrowRight,
  Settings,
  RefreshCw,
  Server,
  Database,
  Cpu,
  Clock,
  ShieldCheck,
  Layers
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [health, setHealth] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, healthRes, actRes] = await Promise.allSettled([
        api.get('/admin/dashboard'),
        api.get('/admin/health'),
        api.get('/admin/activity')
      ]);

      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value.data);
      } else {
        setError('Failed to load dashboard stats.');
      }

      if (healthRes.status === 'fulfilled') {
        setHealth(healthRes.value.data);
      }

      if (actRes.status === 'fulfilled' && Array.isArray(actRes.value.data)) {
        setActivities(actRes.value.data.slice(0, 8));
      }
    } catch {
      setError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-20">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (error && !stats) {
    return <div className="alert alert-error shadow-lg">{error}</div>;
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-black tracking-tight">Admin Executive Suite</h2>
            <span className="badge badge-primary font-semibold uppercase tracking-wider text-xs">Live</span>
          </div>
          <p className="text-base-content/70 text-sm mt-1">Platform telemetry, safety enforcement, and root administrator management.</p>
        </div>
        <button 
          onClick={handleRefresh} 
          disabled={refreshing}
          className="btn btn-outline btn-sm gap-2 self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh Telemetry'}
        </button>
      </div>

      {/* Root Admin & System Health Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-base-100 shadow-sm border border-base-200">
          <div className="card-body p-4 flex flex-row items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-success/10 text-success flex items-center justify-center shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
              <div className="text-xs uppercase font-bold text-base-content/60">Database Status</div>
              <div className="text-sm font-bold flex items-center gap-1.5 text-success">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
                {health?.database?.status || 'Connected'} ({health?.database?.name || 'Atlas'})
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-sm border border-base-200">
          <div className="card-body p-4 flex flex-row items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-info/10 text-info flex items-center justify-center shrink-0">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs uppercase font-bold text-base-content/60">Server Uptime</div>
              <div className="text-sm font-bold text-base-content font-mono">
                {health?.server?.uptimeFormatted || 'Active'}
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-sm border border-primary/20 bg-primary/5">
          <div className="card-body p-4 flex flex-row items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
              <div className="text-xs uppercase font-bold text-primary">Fixed Root Admin</div>
              <div className="text-xs font-mono font-bold truncate">
                {stats?.fixedAdmin?.email || 'alok@gmail.com'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="card bg-base-100 shadow-sm border border-base-200 hover:border-primary/40 transition-all">
          <div className="card-body p-5 flex flex-row items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-base-content/60">Total Users</p>
              <h3 className="text-3xl font-black text-primary mt-1">{stats?.totalUsers ?? 0}</h3>
              <p className="text-xs text-base-content/60 mt-0.5">{stats?.activeUsers ?? 0} active</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Verified Creators */}
        <div className="card bg-base-100 shadow-sm border border-base-200 hover:border-info/40 transition-all">
          <div className="card-body p-5 flex flex-row items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-base-content/60">Verified Accounts</p>
              <h3 className="text-3xl font-black text-info mt-1">{stats?.verifiedUsers ?? 0}</h3>
              <p className="text-xs text-info/80 mt-0.5">Blue check badges</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-info/10 text-info flex items-center justify-center">
              <BadgeCheck className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Total Posts & Pinned */}
        <div className="card bg-base-100 shadow-sm border border-base-200 hover:border-secondary/40 transition-all">
          <div className="card-body p-5 flex flex-row items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-base-content/60">Community Posts</p>
              <h3 className="text-3xl font-black text-secondary mt-1">{stats?.totalPosts ?? 0}</h3>
              <p className="text-xs text-secondary/80 mt-0.5">{stats?.pinnedPosts ?? 0} pinned globally</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Pending Reports */}
        <div className="card bg-base-100 shadow-sm border border-base-200 hover:border-warning/40 transition-all">
          <div className="card-body p-5 flex flex-row items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-base-content/60">Pending Reports</p>
              <h3 className="text-3xl font-black text-warning mt-1">{stats?.activeReports ?? 0}</h3>
              <p className="text-xs text-warning/80 mt-0.5">Action required</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-warning/10 text-warning flex items-center justify-center">
              <Flag className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-base-100 p-4 rounded-xl border border-base-200 flex items-center justify-between">
          <div>
            <div className="text-xs text-base-content/60">Comments</div>
            <div className="text-xl font-bold mt-0.5">{stats?.totalComments ?? 0}</div>
          </div>
          <MessageSquare className="w-5 h-5 text-accent opacity-80" />
        </div>

        <div className="bg-base-100 p-4 rounded-xl border border-base-200 flex items-center justify-between">
          <div>
            <div className="text-xs text-base-content/60">Active Stories</div>
            <div className="text-xl font-bold mt-0.5">{stats?.totalStories ?? 0}</div>
          </div>
          <Layers className="w-5 h-5 text-secondary opacity-80" />
        </div>

        <div className="bg-base-100 p-4 rounded-xl border border-base-200 flex items-center justify-between">
          <div>
            <div className="text-xs text-base-content/60">Blocked Accounts</div>
            <div className="text-xl font-bold mt-0.5 text-error">{stats?.inactiveUsers ?? 0}</div>
          </div>
          <UserX className="w-5 h-5 text-error opacity-80" />
        </div>

        <div className="bg-base-100 p-4 rounded-xl border border-base-200 flex items-center justify-between">
          <div>
            <div className="text-xs text-base-content/60">Resolved Reports</div>
            <div className="text-xl font-bold mt-0.5 text-success">{stats?.resolvedReports ?? 0}</div>
          </div>
          <UserCheck className="w-5 h-5 text-success opacity-80" />
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            Moderation & Management Modules
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Link 
              to="/admin/users" 
              className="p-4 rounded-xl border border-base-200 hover:border-primary hover:bg-primary/5 transition-all flex items-center justify-between group"
            >
              <div>
                <div className="font-bold text-sm group-hover:text-primary transition-colors">Users & Badges</div>
                <div className="text-xs text-base-content/60">Verify, promote, block, delete</div>
              </div>
              <ArrowRight className="w-4 h-4 text-base-content/40 group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </Link>

            <Link 
              to="/admin/posts" 
              className="p-4 rounded-xl border border-base-200 hover:border-primary hover:bg-primary/5 transition-all flex items-center justify-between group"
            >
              <div>
                <div className="font-bold text-sm group-hover:text-primary transition-colors">Post Moderation</div>
                <div className="text-xs text-base-content/60">Pin announcements, delete posts</div>
              </div>
              <ArrowRight className="w-4 h-4 text-base-content/40 group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </Link>

            <Link 
              to="/admin/reports" 
              className="p-4 rounded-xl border border-base-200 hover:border-primary hover:bg-primary/5 transition-all flex items-center justify-between group"
            >
              <div>
                <div className="font-bold text-sm group-hover:text-primary transition-colors">Safety Desk</div>
                <div className="text-xs text-base-content/60">Review & dismiss user reports</div>
              </div>
              <ArrowRight className="w-4 h-4 text-base-content/40 group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </Link>

            <Link 
              to="/admin/settings" 
              className="p-4 rounded-xl border border-base-200 hover:border-primary hover:bg-primary/5 transition-all flex items-center justify-between group"
            >
              <div>
                <div className="font-bold text-sm group-hover:text-primary transition-colors">Platform Config</div>
                <div className="text-xs text-base-content/60">Registrations, banners, security</div>
              </div>
              <ArrowRight className="w-4 h-4 text-base-content/40 group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </Link>
          </div>
        </div>
      </div>

      {/* Real-time Audit Activity Timeline */}
      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Administrative Audit Log
            </h3>
            <span className="text-xs text-base-content/50">Recent events</span>
          </div>

          {activities.length === 0 ? (
            <div className="text-center py-8 text-base-content/60 text-sm">
              No recent administrative actions recorded.
            </div>
          ) : (
            <div className="divide-y divide-base-200">
              {activities.map((act) => (
                <div key={act._id} className="py-3 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-base-200 flex items-center justify-center shrink-0 mt-0.5">
                      <ShieldAlert className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold flex items-center flex-wrap gap-2">
                        <span className="badge badge-sm badge-neutral font-mono">{act.action}</span>
                        <span>{act.details}</span>
                      </div>
                      <div className="text-xs text-base-content/50 mt-1">
                        By {act.performedBy?.name ? `@${act.performedBy.username}` : 'System Engine'} • {new Date(act.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
