import { useState, useEffect, useCallback } from 'react';
import { getPosts } from '../services/postService';
import PostCard from '../components/PostCard';
import Stories from '../components/Stories';
import CreatePostBox from '../components/CreatePostBox';
import { Sparkles, Users, Flame, RefreshCw } from 'lucide-react';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('for-you'); // 'for-you' | 'following' | 'trending'
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchPosts = useCallback(async (tab = activeTab) => {
    try {
      setError('');
      const params = {};
      if (tab === 'following') params.feed = 'following';
      if (tab === 'trending') params.feed = 'trending';

      const { data } = await getPosts(params);
      setPosts(data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load posts. Please try again later.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab]);

  useEffect(() => {
    setLoading(true);
    fetchPosts(activeTab);
  }, [activeTab, fetchPosts]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPosts(activeTab);
  };

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

        <button 
          onClick={handleRefresh}
          className={`btn btn-ghost btn-circle btn-sm text-base-content/60 hover:text-primary ${refreshing ? 'animate-spin text-primary' : ''}`}
          title="Refresh Feed"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Inline Post Creator */}
      <CreatePostBox onPostCreated={handlePostCreated} />

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