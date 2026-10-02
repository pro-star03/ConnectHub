import { useState, useEffect } from 'react';
import api from '../../services/api';

const AdminPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await api.get('/admin/posts');
      setPosts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (id) => {
    if (!window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) return;
    try {
      await api.delete(`/admin/posts/${id}`);
      setPosts(posts.filter(p => p._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting post');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Manage Posts</h2>
      
      <div className="card bg-base-100 shadow-sm border border-base-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Author</th>
                <th>Content</th>
                <th>Media</th>
                <th>Likes/Comments</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="text-center p-8"><span className="loading loading-spinner"></span></td></tr>
              ) : posts.length === 0 ? (
                <tr><td colSpan="6" className="text-center p-8 text-base-content/50">No posts found</td></tr>
              ) : (
                posts.map(post => (
                  <tr key={post._id}>
                    <td>
                      <div className="flex items-center space-x-3">
                        <div className="avatar">
                          <div className="mask mask-squircle w-8 h-8 bg-base-300">
                            {post.user?.profilePicture && <img src={post.user.profilePicture} alt="Avatar" />}
                          </div>
                        </div>
                        <div>
                          <div className="font-bold">{post.user?.name || 'Unknown'}</div>
                          <div className="text-xs opacity-50">@{post.user?.username || 'unknown'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="max-w-xs truncate" title={post.content}>{post.content || <span className="opacity-50 italic">No text</span>}</td>
                    <td>
                      {post.mediaUrl ? (
                        <a href={post.mediaUrl} target="_blank" rel="noopener noreferrer" className="link link-primary text-xs">View Media</a>
                      ) : (
                        <span className="opacity-50 text-xs">None</span>
                      )}
                    </td>
                    <td className="text-sm">
                      <span className="mr-3">❤️ {post.likes?.length || 0}</span>
                      <span>💬 {post.comments?.length || 0}</span>
                    </td>
                    <td className="text-sm">{new Date(post.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="flex gap-2">
                        <a href={`/post/${post._id}`} target="_blank" rel="noopener noreferrer" className="btn btn-xs btn-outline">View</a>
                        <button 
                          className="btn btn-xs btn-error btn-outline"
                          onClick={() => handleDeletePost(post._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPosts;
