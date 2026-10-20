import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getAdminStories, adminDeleteStory } from '../../services/adminService';
import { 
  Search, 
  Trash2, 
  Eye, 
  RefreshCw, 
  Layers, 
  Clock, 
  BadgeCheck, 
  ExternalLink, 
  X, 
  AlertCircle,
  Calendar,
  Sparkles,
  Users
} from 'lucide-react';
import { formatTimeAgo } from '../../utils/dateFormatter';

const AdminStories = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('active'); // 'active' | 'expired' | 'all'
  const [selectedStory, setSelectedStory] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchStories = useCallback(async () => {
    try {
      const res = await getAdminStories({ status: statusFilter, search });
      setStories(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    setLoading(true);
    fetchStories();
  }, [fetchStories]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchStories(),
      new Promise(r => setTimeout(r, 600))
    ]);
    setRefreshing(false);
  };

  const handleDeleteStory = async (storyId) => {
    if (!window.confirm('Are you sure you want to permanently delete this user story? This action cannot be undone.')) {
      return;
    }

    setActionLoading(true);
    try {
      await adminDeleteStory(storyId);
      setStories(prev => prev.filter(s => s._id !== storyId));
      if (selectedStory?._id === storyId) {
        setSelectedStory(null);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete story');
    } finally {
      setActionLoading(false);
    }
  };

  const getTimeRemaining = (expiresAt) => {
    const diff = new Date(expiresAt) - new Date();
    if (diff <= 0) return 'Expired';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `${hours}h ${minutes}m left`;
    return `${minutes}m left`;
  };

  // Metrics
  const now = new Date();
  const activeCount = stories.filter(s => new Date(s.expiresAt) > now).length;
  const expiredCount = stories.filter(s => new Date(s.expiresAt) <= now).length;
  const uniqueCreators = new Set(stories.map(s => s.user?._id?.toString()).filter(Boolean)).size;
  const totalViews = stories.reduce((sum, s) => sum + (s.viewsCount || 0), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-black tracking-tight">Story Moderation Desk</h2>
            <span className="badge badge-secondary font-semibold uppercase tracking-wider text-xs">Live Feed</span>
          </div>
          <p className="text-base-content/70 text-sm mt-1">
            Global oversight of every story posted across ConnectHub. Inspect media, check viewer engagement, and remove policy violations.
          </p>
        </div>

        <button 
          onClick={handleRefresh} 
          disabled={refreshing}
          className="btn btn-outline btn-sm gap-2 self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-primary' : ''}`} />
          <span>Refresh Stories</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card bg-base-100 shadow-sm border border-base-200">
          <div className="card-body p-4 flex flex-row items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-base-content/60">Active Stories</p>
              <h3 className="text-2xl font-black text-secondary mt-1">{activeCount}</h3>
              <p className="text-[11px] text-success flex items-center gap-1 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-success animate-ping"></span> Live in feed
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-sm border border-base-200">
          <div className="card-body p-4 flex flex-row items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-base-content/60">Story Creators</p>
              <h3 className="text-2xl font-black text-primary mt-1">{uniqueCreators}</h3>
              <p className="text-[11px] text-base-content/60 mt-0.5">Unique active users</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-sm border border-base-200">
          <div className="card-body p-4 flex flex-row items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-base-content/60">Total Views</p>
              <h3 className="text-2xl font-black text-info mt-1">{totalViews}</h3>
              <p className="text-[11px] text-info/80 mt-0.5">Impressions recorded</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-info/10 text-info flex items-center justify-center">
              <Eye className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-sm border border-base-200">
          <div className="card-body p-4 flex flex-row items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-base-content/60">Expired Stories</p>
              <h3 className="text-2xl font-black text-base-content/60 mt-1">{expiredCount}</h3>
              <p className="text-[11px] text-base-content/50 mt-0.5">Past 24-hour limit</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-base-200 text-base-content/60 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card bg-base-100 shadow-sm border border-base-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-base-content/40" />
            <input 
              type="text" 
              placeholder="Search by username, creator, or caption..." 
              className="input input-bordered input-sm w-full pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-base-content/60 font-semibold whitespace-nowrap">Filter Status:</span>
            <select
              className="select select-bordered select-sm text-xs font-semibold"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="active">Active Only ({activeCount})</option>
              <option value="expired">Expired Only ({expiredCount})</option>
              <option value="all">All Stories ({stories.length})</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stories Gallery */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="card bg-base-100 border border-base-200 rounded-2xl p-4 animate-pulse space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-base-300"></div>
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 w-24 bg-base-300 rounded"></div>
                  <div className="h-3 w-16 bg-base-300 rounded"></div>
                </div>
              </div>
              <div className="h-56 bg-base-300 rounded-xl"></div>
              <div className="h-8 bg-base-300 rounded-lg"></div>
            </div>
          ))}
        </div>
      ) : stories.length === 0 ? (
        <div className="card bg-base-100 border border-base-200 p-12 text-center rounded-2xl">
          <div className="w-16 h-16 rounded-full bg-secondary/10 text-secondary flex items-center justify-center mx-auto mb-4">
            <Layers size={32} />
          </div>
          <p className="text-xl font-bold mb-1">No Stories Found</p>
          <p className="text-sm text-base-content/60 max-w-sm mx-auto mb-4">
            {statusFilter === 'active' 
              ? 'There are currently no active stories posted by any users.' 
              : 'No stories match your current search query or filter.'}
          </p>
          {statusFilter !== 'all' && (
            <button 
              onClick={() => setStatusFilter('all')} 
              className="btn btn-sm btn-outline rounded-full mx-auto"
            >
              Show All Stories
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {stories.map(story => {
            const isLive = new Date(story.expiresAt) > now;
            const author = story.user || {};
            const authorName = author.name || 'Unknown User';
            const authorUsername = author.username || 'user';
            const authorAvatar = author.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=random`;

            return (
              <div 
                key={story._id} 
                className="card bg-base-100 border border-base-200 hover:border-secondary/50 shadow-sm hover:shadow-md transition-all rounded-2xl overflow-hidden flex flex-col group"
              >
                {/* Author Bar */}
                <div className="p-3.5 flex items-center justify-between border-b border-base-200/80 bg-base-100">
                  <Link 
                    to={`/profile/${author._id}`} 
                    className="flex items-center gap-2.5 overflow-hidden hover:opacity-80 transition-opacity"
                  >
                    <div className="avatar">
                      <div className="w-8 h-8 rounded-full ring-2 ring-secondary/30">
                        <img src={authorAvatar} alt={authorName} />
                      </div>
                    </div>
                    <div className="overflow-hidden">
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-xs truncate max-w-[100px]">{authorName}</span>
                        {author.isVerified && <BadgeCheck size={12} className="text-primary shrink-0" />}
                      </div>
                      <span className="text-[11px] text-base-content/60 truncate block max-w-[100px]">
                        @{authorUsername}
                      </span>
                    </div>
                  </Link>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {isLive ? (
                      <span className="badge badge-success badge-xs py-1 px-1.5 text-[9px] font-bold uppercase gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                        Live
                      </span>
                    ) : (
                      <span className="badge badge-ghost badge-xs py-1 px-1.5 text-[9px] font-semibold uppercase">
                        Expired
                      </span>
                    )}
                  </div>
                </div>

                {/* Media Preview Box */}
                <div 
                  className="relative aspect-[9/14] bg-neutral overflow-hidden cursor-pointer group/media"
                  onClick={() => setSelectedStory(story)}
                >
                  <img 
                    src={story.image} 
                    alt={story.caption || 'User Story'} 
                    className="w-full h-full object-cover group-hover/media:scale-105 transition-transform duration-300"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none"></div>

                  {/* Top Overlay Badge: Expiration timer */}
                  <div className="absolute top-2.5 left-2.5 z-10">
                    <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 border border-white/10">
                      <Clock size={11} />
                      {getTimeRemaining(story.expiresAt)}
                    </span>
                  </div>

                  {/* Top Overlay Badge: Views Count */}
                  <div className="absolute top-2.5 right-2.5 z-10">
                    <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 border border-white/10">
                      <Eye size={11} />
                      {story.viewsCount || 0}
                    </span>
                  </div>

                  {/* Hover Inspect Prompt */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/media:opacity-100 bg-black/40 transition-opacity">
                    <span className="btn btn-sm btn-secondary rounded-full shadow-lg gap-1.5 text-xs font-bold">
                      <Eye size={14} /> Full Inspect
                    </span>
                  </div>

                  {/* Caption on Bottom */}
                  {story.caption && (
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10">
                      <p className="text-white text-xs drop-shadow-md line-clamp-2 bg-black/40 backdrop-blur-sm p-1.5 rounded-lg border border-white/10">
                        {story.caption}
                      </p>
                    </div>
                  )}
                </div>

                {/* Card Footer Actions */}
                <div className="p-3 bg-base-100 flex items-center justify-between gap-2 border-t border-base-200">
                  <div className="text-[11px] text-base-content/60">
                    <span>{formatTimeAgo(story.createdAt)}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button 
                      onClick={() => setSelectedStory(story)}
                      className="btn btn-ghost btn-xs text-base-content/70 hover:text-primary gap-1"
                      title="Inspect Story"
                    >
                      <Eye size={13} />
                      <span>View</span>
                    </button>

                    <button 
                      onClick={() => handleDeleteStory(story._id)}
                      disabled={actionLoading}
                      className="btn btn-ghost btn-xs text-error hover:bg-error/10 gap-1"
                      title="Permanently Delete Story"
                    >
                      <Trash2 size={13} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Inspect Modal */}
      {selectedStory && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="relative bg-base-100 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-base-200 flex flex-col md:flex-row">
            {/* Left: Full Media Box */}
            <div className="md:w-1/2 bg-black relative flex items-center justify-center min-h-[350px]">
              <img 
                src={selectedStory.image} 
                alt="Story Full Preview" 
                className="max-h-[70vh] w-auto max-w-full object-contain"
              />
              <div className="absolute top-3 left-3 bg-black/60 text-white text-[11px] px-2.5 py-1 rounded-full backdrop-blur-md flex items-center gap-1.5 border border-white/10">
                <Clock size={12} />
                {getTimeRemaining(selectedStory.expiresAt)}
              </div>
            </div>

            {/* Right: Meta & Moderation Pane */}
            <div className="md:w-1/2 p-6 flex flex-col justify-between overflow-y-auto">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-base-200">
                  <div className="flex items-center gap-3">
                    <img 
                      src={selectedStory.user?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedStory.user?.name || 'User')}`} 
                      alt="Creator" 
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/20"
                    />
                    <div>
                      <h4 className="font-bold text-sm flex items-center gap-1">
                        {selectedStory.user?.name || 'User'}
                        {selectedStory.user?.isVerified && <BadgeCheck size={14} className="text-primary" />}
                      </h4>
                      <p className="text-xs text-base-content/60">@{selectedStory.user?.username || 'user'}</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => setSelectedStory(null)} 
                    className="btn btn-ghost btn-circle btn-sm"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Details list */}
                <div className="py-4 space-y-3">
                  {selectedStory.caption && (
                    <div className="bg-base-200/60 p-3 rounded-xl">
                      <p className="text-xs text-base-content/60 font-semibold mb-1">Caption</p>
                      <p className="text-sm font-medium">{selectedStory.caption}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-base-200/40 p-2.5 rounded-xl">
                      <span className="text-base-content/60 block">Posted</span>
                      <span className="font-bold">{new Date(selectedStory.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="bg-base-200/40 p-2.5 rounded-xl">
                      <span className="text-base-content/60 block">Expires</span>
                      <span className="font-bold">{new Date(selectedStory.expiresAt).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="bg-base-200/40 p-2.5 rounded-xl">
                    <span className="text-base-content/60 block text-xs">Status</span>
                    <span className={`badge badge-sm font-bold mt-1 ${new Date(selectedStory.expiresAt) > now ? 'badge-success' : 'badge-ghost'}`}>
                      {new Date(selectedStory.expiresAt) > now ? 'Live & Active' : 'Expired'}
                    </span>
                  </div>

                  {/* Viewers List */}
                  <div>
                    <h5 className="font-bold text-xs uppercase tracking-wider text-base-content/60 mb-2 flex items-center gap-1.5">
                      <Eye size={13} />
                      Audience Engagement ({selectedStory.viewsCount || 0} views)
                    </h5>

                    {Array.isArray(selectedStory.viewers) && selectedStory.viewers.length > 0 ? (
                      <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                        {selectedStory.viewers.map((viewer, idx) => (
                          <div key={idx} className="flex items-center gap-2 p-1.5 rounded-lg bg-base-200/40 text-xs">
                            <img 
                              src={viewer.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(viewer.name || 'User')}`} 
                              alt={viewer.name}
                              className="w-5 h-5 rounded-full object-cover" 
                            />
                            <span className="font-medium truncate flex-1">{viewer.name}</span>
                            <span className="text-base-content/50">@{viewer.username}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-base-content/50 italic bg-base-200/30 p-2 rounded-lg">
                        No viewer records yet.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Moderation Actions Footer */}
              <div className="pt-4 border-t border-base-200 flex items-center justify-between gap-3">
                <Link 
                  to={`/profile/${selectedStory.user?._id}`}
                  className="btn btn-ghost btn-sm text-xs gap-1"
                >
                  <ExternalLink size={14} />
                  <span>View Creator Profile</span>
                </Link>

                <button 
                  onClick={() => handleDeleteStory(selectedStory._id)}
                  disabled={actionLoading}
                  className="btn btn-error btn-sm text-xs font-bold gap-1.5 text-white"
                >
                  <Trash2 size={14} />
                  <span>Delete Story</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStories;
