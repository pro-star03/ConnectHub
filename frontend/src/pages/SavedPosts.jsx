import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getUserProfile } from '../services/userService';
import { getPostById } from '../services/postService';
import PostCard from '../components/PostCard';
import { Bookmark } from 'lucide-react';

const SavedPosts = () => {
  const { user } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSavedPosts = async () => {
      try {
        const { data: profile } = await getUserProfile(user._id);
        const savedIds = profile.savedPosts || [];
        
        // Fetch each saved post by ID using Promise.all
        if (savedIds.length > 0) {
          const postPromises = savedIds.map(id => getPostById(id));
          const results = await Promise.allSettled(postPromises);
          
          const fetchedPosts = results
            .filter(r => r.status === 'fulfilled')
            .map(r => r.value.data);
            
          setPosts(fetchedPosts.reverse());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    if (user?._id) {
      fetchSavedPosts();
    }
  }, [user]);

  const handlePostDeleted = (postId) => {
    setPosts(posts.filter(p => p._id !== postId));
  };

  return (
    <div className="pb-20 md:pb-4 pt-4 max-w-xl mx-auto min-h-screen">
      <div className="px-4 mb-4 flex items-center gap-2">
        <Bookmark className="text-primary" size={24} />
        <h1 className="text-2xl font-bold">Saved Posts</h1>
      </div>

      {loading ? (
        <div className="flex justify-center p-8"><span className="loading loading-spinner loading-lg text-primary"></span></div>
      ) : posts.length === 0 ? (
        <div className="text-center p-12 text-base-content/50">
          <p className="text-xl font-medium mb-2">No saved posts</p>
          <p>Posts you save will appear here.</p>
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
