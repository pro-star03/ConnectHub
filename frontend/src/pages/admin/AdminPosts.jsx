import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPosts } from '../../services/postService';
import { togglePinPost, adminDeletePost } from '../../services/adminService';
import { 
  Search, 
  Trash2, 
  ExternalLink, 
  Heart, 
  MessageSquare, 
  Image as ImageIcon, 
  Pin, 
  BarChart2, 
  BadgeCheck 
} from 'lucide-react';

const AdminPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 10;

  const fetchPosts = async () => {
    try {
      const res = await getPosts();
      setPosts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleTogglePin = async (post) => {
    try {
      await togglePinPost(post._id);
      setPosts(prev => prev.map(p => p._id === post._id ? { ...p, isPinned: !p.isPinned } : p));
    } catch (err) {
      alert(err.response?.data?.message || 'Error toggling pin status');
    }
  };

  const handleDeletePost = async (id) => {
    if (!window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) return;
    try {
      await adminDeletePost(id);
      setPosts(prev => prev.filter(p => p._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting post');
    }
  };

  const filteredPosts = posts.filter(post => {
    const content = (post.content || '').toLowerCase();
    const authorName = (post.user?.name || '').toLowerCase();
    const authorUsername = (post.user?.username || '').toLowerCase();
    const query = search.toLowerCase();
    const matchesSearch = content.includes(query) || authorName.includes(query) || authorUsername.includes(query);

    let matchesType = true;
    if (typeFilter === 'pinned') matchesType = post.isPinned;
    if (typeFilter === 'media') matchesType = !!post.image;
    if (typeFilter === 'poll') matchesType = !!(post.poll?.question || (post.poll?.options && post.poll.options.length > 0));

    return matchesSearch && matchesType;
  });

  const indexOfLast = currentPage * postsPerPage;
  const indexOfFirst = indexOfLast - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold">Content Moderation & Posts</h2>
          <p className="text-sm opacity-70 mt-1">Review community posts, pin system announcements, and moderate policy violations.</p>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto flex-wrap">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-base-content/40" />
            <input 
              type="text" 
              placeholder="Search posts or authors..." 
              className="input input-bordered w-full pl-10 text-sm"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            />
          </div>

          <select
            className="select select-bordered text-sm"
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
          >
            <option value="all">All Content</option>
            <option value="pinned">Pinned Only</option>
            <option value="poll">Polls Only</option>
            <option value="media">With Media</option>
          </select>
        </div>
      </div>
      
      <div className="card bg-base-100 shadow-sm border border-base-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr className="bg-base-200/50">
                <th>Author</th>
                <th>Content & Details</th>
                <th>Media / Features</th>
                <th>Engagement</th>
                <th>Posted</th>
                <th className="text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="text-center p-12"><span className="loading loading-spinner text-primary"></span></td></tr>
              ) : currentPosts.length === 0 ? (
                <tr><td colSpan="6" className="text-center p-12 text-base-content/50">No posts matched your criteria</td></tr>
              ) : (
                currentPosts.map(post => {
                  const hasPoll = post.poll?.question || (post.poll?.options && post.poll.options.length > 0);

                  return (
                    <tr key={post._id} className="hover:bg-base-200/30 transition-colors">
                      {/* Author */}
                      <td>
                        <div className="flex items-center space-x-3">
                          <div className="avatar">
                            <div className="mask mask-squircle w-9 h-9 bg-base-300">
                              {post.user?.profilePicture ? (
                                <img src={post.user.profilePicture} alt="Avatar" />
                              ) : (
                                <span className="flex items-center justify-center w-full h-full font-bold">
                                  {post.user?.name?.charAt(0) || 'U'}
                                </span>
                              )}
                            </div>
                          </div>
                          <div>
                            <div className="font-bold text-sm flex items-center gap-1">
                              {post.user?.name || 'Unknown'}
                              {post.user?.isVerified && (
                                <BadgeCheck className="w-3.5 h-3.5 text-primary fill-primary/20" />
                              )}
                            </div>
                            <div className="text-xs opacity-50">@{post.user?.username || 'unknown'}</div>
                          </div>
                        </div>
                      </td>

                      {/* Content */}
                      <td className="max-w-xs">
                        <div className="flex items-center gap-2 mb-1">
                          {post.isPinned && (
                            <span className="badge badge-primary badge-xs gap-1 font-semibold">
                              <Pin className="w-2.5 h-2.5" /> Pinned
                            </span>
                          )}
                          {hasPoll && (
                            <span className="badge badge-accent badge-xs gap-1 font-semibold">
                              <BarChart2 className="w-2.5 h-2.5" /> Community Poll
                            </span>
                          )}
                        </div>
                        <div className="truncate text-sm" title={post.content}>
                          {post.content || <span className="opacity-50 italic">No text</span>}
                        </div>
                      </td>

                      {/* Media */}
                      <td>
                        {post.image ? (
                          <a href={post.image} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-xs gap-1 text-primary">
                            <ImageIcon className="w-3.5 h-3.5" /> Image
                          </a>
                        ) : (
                          <span className="opacity-40 text-xs">Text only</span>
                        )}
                      </td>

                      {/* Engagement */}
                      <td className="text-sm">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1 text-xs opacity-75">
                            <Heart className="w-3.5 h-3.5 text-error" /> {post.likes?.length || 0}
                          </span>
                          <span className="flex items-center gap-1 text-xs opacity-75">
                            <MessageSquare className="w-3.5 h-3.5 text-info" /> {post.comments?.length || 0}
                          </span>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="text-xs text-base-content/70">{new Date(post.createdAt).toLocaleDateString()}</td>

                      {/* Actions */}
                      <td>
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Toggle Pin */}
                          <button
                            type="button"
                            className={`btn btn-xs gap-1 ${post.isPinned ? 'btn-primary' : 'btn-outline'}`}
                            onClick={() => handleTogglePin(post)}
                            title={post.isPinned ? "Unpin post" : "Pin post to top of feed"}
                          >
                            <Pin className="w-3 h-3" />
                            {post.isPinned ? 'Pinned' : 'Pin'}
                          </button>

                          <Link to={`/post/${post._id}`} target="_blank" className="btn btn-xs btn-outline gap-1">
                            <ExternalLink className="w-3 h-3" /> View
                          </Link>

                          <button 
                            className="btn btn-xs btn-error btn-outline gap-1"
                            onClick={() => handleDeletePost(post._id)}
                          >
                            <Trash2 className="w-3 h-3" /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center p-4 border-t border-base-200">
            <div className="join">
              <button 
                className="join-item btn btn-sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                «
              </button>
              <button className="join-item btn btn-sm pointer-events-none">
                Page {currentPage} of {totalPages}
              </button>
              <button 
                className="join-item btn btn-sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                »
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPosts;
