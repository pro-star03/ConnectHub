import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPostById } from '../services/postService';
import { getComments, addComment, deleteComment, replyToComment } from '../services/commentService';
import { AuthContext } from '../context/AuthContext';
import PostCard from '../components/PostCard';
import { formatTimeAgo } from '../utils/dateFormatter';
import { Trash2, Reply, ArrowLeft } from 'lucide-react';

const PostDetails = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchPostAndComments = async () => {
      try {
        const [postRes, commentsRes] = await Promise.all([
          getPostById(id),
          getComments(id)
        ]);
        setPost(postRes.data);
        setComments(commentsRes.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPostAndComments();
  }, [id]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;

    setSubmitting(true);
    try {
      const { data } = await addComment(id, newComment.trim());
      setComments([data, ...comments]);
      setNewComment('');
      // Update post comment count locally
      if (post) {
        setPost({ ...post, comments: [...(post.comments || []), data._id] });
      }
    } catch (err) {
      console.error(err);
      alert('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (e, parentId) => {
    e.preventDefault();
    if (!replyText.trim() || submitting) return;

    setSubmitting(true);
    try {
      const { data } = await replyToComment(parentId, replyText.trim());
      setComments([...comments, data]);
      setReplyingTo(null);
      setReplyText('');
    } catch (err) {
      console.error(err);
      alert('Failed to send reply');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await deleteComment(commentId);
      setComments(comments.filter(c => c._id !== commentId && c.parentComment !== commentId));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <span className="loading loading-spinner text-primary loading-lg"></span>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="p-8 text-center">
        <p className="text-xl font-bold mb-2">Post not found</p>
        <Link to="/" className="btn btn-primary btn-sm rounded-full">Back to Home</Link>
      </div>
    );
  }

  const topLevelComments = comments.filter(c => !c.parentComment);
  const replies = comments.filter(c => c.parentComment);

  return (
    <div className="pb-20 md:pb-6 max-w-xl mx-auto min-h-screen">
      {/* Sticky Header */}
      <div className="sticky top-16 bg-base-100 z-10 p-3.5 border-b border-base-200 flex items-center gap-3 rounded-2xl mb-4 shadow-sm">
        <Link to="/" className="btn btn-ghost btn-circle btn-sm">
          <ArrowLeft size={18} />
        </Link>
        <h2 className="font-bold text-lg">Post</h2>
      </div>

      {/* Main Post Card */}
      <PostCard post={post} />

      {/* Comments Section */}
      <div className="bg-base-100 border border-base-200/90 rounded-2xl shadow-sm overflow-hidden mt-4">
        {/* Add Comment Input */}
        <div className="p-4 border-b border-base-200 bg-base-100">
          <form onSubmit={handleAddComment} className="flex gap-3 items-center">
            <div className="avatar shrink-0">
              <div className="w-9 h-9 rounded-full ring-1 ring-base-300">
                <img 
                  src={user?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=random`} 
                  alt="Avatar" 
                />
              </div>
            </div>
            <input 
              type="text" 
              className="input input-bordered input-sm flex-1 rounded-full text-sm px-4" 
              placeholder="Post your reply..." 
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <button 
              type="submit" 
              className="btn btn-primary btn-sm rounded-full px-5 font-bold" 
              disabled={!newComment.trim() || submitting}
            >
              {submitting ? <span className="loading loading-spinner loading-xs"></span> : 'Reply'}
            </button>
          </form>
        </div>

        {/* Comments List */}
        <div className="divide-y divide-base-200/70">
          {topLevelComments.length === 0 ? (
            <div className="p-10 text-center text-base-content/50 text-sm">
              <p className="font-semibold">No comments yet</p>
              <p className="text-xs mt-1">Be the first to share what you think!</p>
            </div>
          ) : (
            topLevelComments.map(comment => {
              const commenterName = comment.user?.name || 'User';
              const commenterUsername = comment.user?.username || 'user';
              const commenterAvatar = comment.user?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(commenterName)}&background=random`;
              const commenterId = comment.user?._id || comment.user;
              const isOwner = commenterId?.toString() === user?._id?.toString() || user?.isAdmin;

              return (
                <div key={comment._id} className="p-4 hover:bg-base-200/20 transition-colors">
                  <div className="flex gap-3">
                    <Link to={`/profile/${commenterId}`} className="shrink-0">
                      <img 
                        src={commenterAvatar} 
                        alt={commenterName} 
                        className="w-9 h-9 rounded-full object-cover border border-base-200" 
                      />
                    </Link>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <Link to={`/profile/${commenterId}`} className="font-bold text-sm hover:underline">
                            {commenterName}
                          </Link>
                          <span className="text-xs text-base-content/50 ml-1.5">
                            @{commenterUsername} • {formatTimeAgo(comment.createdAt)}
                          </span>
                        </div>
                        {isOwner && (
                          <button 
                            onClick={() => handleDeleteComment(comment._id)} 
                            className="text-base-content/40 hover:text-error btn btn-ghost btn-xs btn-circle"
                            title="Delete comment"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>

                      <p className="text-sm mt-1 leading-relaxed text-base-content whitespace-pre-wrap break-words">
                        {comment.text}
                      </p>
                      
                      <button 
                        className="text-xs font-semibold text-primary/80 mt-2 flex gap-1.5 items-center hover:text-primary transition-colors"
                        onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
                      >
                        <Reply size={13} /> Reply
                      </button>

                      {/* Reply Input Box */}
                      {replyingTo === comment._id && (
                        <form onSubmit={(e) => handleReply(e, comment._id)} className="mt-2.5 flex gap-2">
                          <input 
                            autoFocus
                            type="text" 
                            className="input input-bordered input-xs flex-1 rounded-full px-3 text-xs" 
                            placeholder={`Reply to @${commenterUsername}...`} 
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                          />
                          <button 
                            type="submit" 
                            className="btn btn-primary btn-xs rounded-full px-3.5" 
                            disabled={!replyText.trim() || submitting}
                          >
                            Send
                          </button>
                        </form>
                      )}

                      {/* Child Replies */}
                      <div className="mt-3 space-y-3 pl-3 sm:pl-4 border-l-2 border-base-200">
                        {replies.filter(r => r.parentComment === comment._id).map(reply => {
                          const replyName = reply.user?.name || 'User';
                          const replyUsername = reply.user?.username || 'user';
                          const replyAvatar = reply.user?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(replyName)}&background=random`;
                          const replyUserId = reply.user?._id || reply.user;
                          const isReplyOwner = replyUserId?.toString() === user?._id?.toString() || user?.isAdmin;

                          return (
                            <div key={reply._id} className="flex gap-2.5 items-start">
                              <Link to={`/profile/${replyUserId}`} className="shrink-0 mt-0.5">
                                <img 
                                  src={replyAvatar} 
                                  alt={replyName} 
                                  className="w-7 h-7 rounded-full object-cover border border-base-200" 
                                />
                              </Link>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center">
                                  <div className="text-xs">
                                    <Link to={`/profile/${replyUserId}`} className="font-bold hover:underline">
                                      {replyName}
                                    </Link>
                                    <span className="text-base-content/50 ml-1">@{replyUsername}</span>
                                  </div>
                                  {isReplyOwner && (
                                    <button 
                                      onClick={() => handleDeleteComment(reply._id)} 
                                      className="text-base-content/40 hover:text-error transition-colors"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  )}
                                </div>
                                <p className="text-xs sm:text-sm mt-0.5 text-base-content leading-relaxed whitespace-pre-wrap break-words">
                                  {reply.text}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default PostDetails;
