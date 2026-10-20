import { useState, useEffect, useCallback, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getPosts } from '../services/postService';
import PostCard from '../components/PostCard';
import Stories from '../components/Stories';
import CreatePostBox from '../components/CreatePostBox';
import { Sparkles, Users, Flame, PlusSquare, Image as ImageIcon, BarChart2, Smile, X } from 'lucide-react';

const Home = () => {
  const { user } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('for-you'); // 'for-you' | 'following' | 'trending'
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [error, setError] = useState('');

  const fetchPosts = useCallback(async (tab = activeTab) => {
    try {
      setError('');
      const params = {};
      if (tab === 'following') params.feed = 'following';
      if (tab === 'trending') params.feed = 'trending';

      const { data } = await getPosts(params);
      setPosts(data || []);
      return data;
    } catch (err) {
      console.error(err);
      setError('Failed to load posts. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    setLoading(true);
    fetchPosts(activeTab);
  }, [activeTab, fetchPosts]);

  const handlePostCreated = (newPost) => {
    setPosts(prev => [newPost, ...prev]);
  };

  const handlePostDeleted = (postId) => {
    setPosts(prev => prev.filter(p => p._id !== postId));
  };

  return (
    <div className="pb-20 md:pb-6 max-w-xl mx-auto min-h-screen">
      {/* Stories Bar */}
      <Stories />

      {/* Feed Tabs */}
      <div className="sticky top-16 z-20 glass-nav border-b border-base-200/80 px-2 flex justify-between items-center my-2 rounded-2xl">
        <div className="flex gap-1 py-1 flex-1">
          <button
            onClick={() => setActiveTab('for-you')}
            className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'for-you' 
                ? 'bg-primary text-primary-content shadow-sm' 
                : 'text-base-content/60 hover:text-base-content hover:bg-base-200/50'
            }`}
          >
            <Sparkles size={16} /> For You
          </button>

          <button
            onClick={() => setActiveTab('following')}
            className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'following' 
                ? 'bg-primary text-primary-content shadow-sm' 
                : 'text-base-content/60 hover:text-base-content hover:bg-base-200/50'
            }`}
          >
            <Users size={16} /> Following
          </button>

          <button
            onClick={() => setActiveTab('trending')}
            className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'trending' 
                ? 'bg-primary text-primary-content shadow-sm' 
                : 'text-base-content/60 hover:text-base-content hover:bg-base-200/50'
            }`}
          >
            <Flame size={16} /> Trending
          </button>
        </div>
      </div>

      {/* Create Post Prompt / Trigger Bar */}
      <div 
        onClick={() => setIsCreateOpen(true)}
        className="card bg-base-100 border border-base-200/80 p-3 sm:p-4 mb-4 rounded-2xl shadow-sm hover:shadow-md hover:border-primary/40 transition-all cursor-pointer group"
      >
        <div className="flex items-center gap-3">
          <div className="avatar">
            <div className="w-10 h-10 rounded-full ring-2 ring-primary/20 group-hover:ring-primary transition-all">
              <img 
                src={user?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=random`} 
                alt={user?.name || 'User'} 
                className="object-cover"
              />
            </div>
          </div>

          <div className="flex-1 bg-base-200/60 group-hover:bg-base-200/90 rounded-full py-2.5 px-4 text-xs sm:text-sm text-base-content/60 transition-colors">
            What's on your mind, {user?.name ? user.name.split(' ')[0] : 'there'}?
          </div>

          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsCreateOpen(true);
            }}
            className="btn btn-primary btn-sm rounded-xl gap-1.5 font-bold shadow-sm"
          >
            <PlusSquare size={16} />
            <span className="hidden sm:inline">Create Post</span>
          </button>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center justify-around border-t border-base-200/60 pt-2.5 mt-3 text-xs font-semibold text-base-content/70">
          <button 
            type="button" 
            onClick={(e) => { e.stopPropagation(); setIsCreateOpen(true); }}
            className="flex items-center gap-1.5 py-1 px-3 rounded-xl hover:bg-base-200 transition-colors"
          >
            <ImageIcon size={16} className="text-success" />
            <span>Photo / Media</span>
          </button>

          <button 
            type="button" 
            onClick={(e) => { e.stopPropagation(); setIsCreateOpen(true); }}
            className="flex items-center gap-1.5 py-1 px-3 rounded-xl hover:bg-base-200 transition-colors"
          >
            <BarChart2 size={16} className="text-primary" />
            <span>Poll</span>
          </button>

          <button 
            type="button" 
            onClick={(e) => { e.stopPropagation(); setIsCreateOpen(true); }}
            className="flex items-center gap-1.5 py-1 px-3 rounded-xl hover:bg-base-200 transition-colors"
          >
            <Smile size={16} className="text-warning" />
            <span>Feeling / Activity</span>
          </button>
        </div>
      </div>

      {/* Create Post Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-base-100 rounded-3xl shadow-2xl border border-base-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-base-200">
              <h3 className="font-bold text-lg flex items-center gap-2 text-base-content">
                <PlusSquare className="text-primary" size={20} />
                Create Post
              </h3>
              <button 
                onClick={() => setIsCreateOpen(false)}
                className="btn btn-ghost btn-circle btn-sm text-base-content/70 hover:text-base-content"
                title="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 sm:p-5">
              <CreatePostBox 
                isModal={true}
                autoFocus={true}
                onPostCreated={(newPost) => {
                  handlePostCreated(newPost);
                  setIsCreateOpen(false);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Feed Stream */}
      <div className="pt-1">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="card bg-base-100 p-5 border border-base-200/80 rounded-2xl animate-pulse space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-base-300"></div>
                  <div className="space-y-1.5 flex-1">
                    <div className="h-4 w-32 bg-base-300 rounded"></div>
                    <div className="h-3 w-20 bg-base-300 rounded"></div>
                  </div>
                </div>
                <div className="h-12 bg-base-300 rounded-xl"></div>
                <div className="h-48 bg-base-300 rounded-xl"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="alert alert-error mx-2 mt-4 shadow-sm rounded-2xl">
            <span>{error}</span>
            <button className="btn btn-sm rounded-xl" onClick={() => fetchPosts(activeTab)}>Retry</button>
          </div>
        ) : posts.length === 0 ? (
          <div className="card bg-base-100 border border-base-200 p-12 text-center rounded-2xl">
            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
              {activeTab === 'following' ? <Users size={32} /> : activeTab === 'trending' ? <Flame size={32} /> : <Sparkles size={32} />}
            </div>
            <p className="text-xl font-bold mb-1">
              {activeTab === 'following' 
                ? 'No posts from people you follow' 
                : activeTab === 'trending' 
                ? 'No trending posts yet' 
                : 'No posts yet'}
            </p>
            <p className="text-sm text-base-content/60 max-w-sm mx-auto mb-4">
              {activeTab === 'following' 
                ? 'Follow other creators to see their updates right here, or create a post yourself!' 
                : 'Be the first to share an interesting thought, photo, or poll with the community!'}
            </p>
            <button 
              onClick={() => setActiveTab('for-you')}
              className="btn btn-outline btn-sm rounded-full mx-auto"
            >
              Explore All Posts
            </button>
          </div>
        ) : (
          <div className="flex flex-col">
            {posts.map(post => (
              <PostCard 
                key={post._id} 
                post={post} 
                onPostDeleted={handlePostDeleted}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;