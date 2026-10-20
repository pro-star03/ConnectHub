import { useState, useEffect } from 'react';
import { getSavedPosts } from '../services/postService';
import PostCard from '../components/PostCard';
import { Bookmark, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const SavedPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSaved = async () => {
    try {
      setLoading(true);
      const { data } = await getSavedPosts();
      setPosts(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, []);

  const handlePostDeleted = (postId) => {
    setPosts(prev => prev.filter(p => p._id !== postId));
  };

  return (
    <div className="pb-20 md:pb-6 max-w-xl mx-auto min-h-screen">
      <div className="sticky top-16 bg-base-100 z-10 p-4 border-b border-base-200 flex items-center justify-between rounded-2xl mb-4 shadow-sm">
        <div className="flex items-center gap-2.5">
          <Bookmark className="text-primary" size={24} />
          <div>
            <h1 className="text-xl font-bold">Saved Posts</h1>
            <p className="text-xs text-base-content/60">
              {posts.length} {posts.length === 1 ? 'post' : 'posts'} bookmarked
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : posts.length === 0 ? (
        <div className="card bg-base-100 border border-base-200 p-12 text-center rounded-2xl mt-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
            <Bookmark size={28} />
          </div>
          <p className="text-xl font-bold mb-1">No saved posts yet</p>
          <p className="text-sm text-base-content/60 max-w-xs mx-auto mb-5">
            Click the bookmark icon on any post in your feed to save it for quick reading later.
          </p>
          <Link to="/" className="btn btn-primary btn-sm rounded-full mx-auto">
            Browse Feed
          </Link>
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
  );
};

export default SavedPosts;
