import { useState, useEffect } from 'react';
import { getPosts } from '../services/postService';
import PostCard from '../components/PostCard';
import Stories from '../components/Stories';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPosts = async () => {
    try {
      const { data } = await getPosts();
      setPosts(data);
    } catch (err) {
      setError('Failed to load posts. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]);
  };

  const handlePostDeleted = (postId) => {
    setPosts(posts.filter(p => p._id !== postId));
  };

  return (
    <div className="pb-20 md:pb-4 max-w-xl mx-auto border-x border-base-200 min-h-screen">
      <Stories />
      <div className="pt-2">
      
      {loading ? (
        <div className="flex justify-center p-8">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : error ? (
        <div className="alert alert-error mx-4 sm:mx-0 mt-4 shadow-sm">
          <span>{error}</span>
          <button className="btn btn-sm" onClick={fetchPosts}>Retry</button>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center p-12 text-base-content/50">
          <p className="text-xl font-medium mb-2">No posts yet</p>
          <p>Follow some users to see their posts here!</p>
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