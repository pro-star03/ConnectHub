import { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { getPostById } from '../services/postService';
import { getComments, addComment, deleteComment, replyToComment } from '../services/commentService';
import { AuthContext } from '../context/AuthContext';
import PostCard from '../components/PostCard';
import { formatTimeAgo } from '../utils/dateFormatter';
import { Send, Trash2, Reply } from 'lucide-react';

const PostDetails = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPostAndComments = async () => {
      try {
        const [postRes, commentsRes] = await Promise.all([
          getPostById(id),
          getComments(id)
        ]);
        setPost(postRes.data);
        setComments(commentsRes.data);
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
    if (!newComment.trim()) return;
    try {
      const { data } = await addComment(id, newComment);
      // Backend doesn't return populated user on create, so we manually build it for the UI
      const newCommentObj = { ...data, user: { _id: user._id, name: user.name, username: user.username } };
      setComments([newCommentObj, ...comments]);
      setNewComment('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleReply = async (e, parentId) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    try {
      const { data } = await replyToComment(parentId, replyText);
      const newReply = { ...data, user: { _id: user._id, name: user.name, username: user.username } };
      setComments([...comments, newReply]);
      setReplyingTo(null);
      setReplyText('');
    } catch (err) {
      console.error(err);
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

  if (loading) return <div className="flex justify-center p-8"><span className="loading loading-spinner text-primary loading-lg"></span></div>;
  if (!post) return <div className="p-8 text-center">Post not found</div>;

  // Group comments and replies
  const topLevelComments = comments.filter(c => !c.parentComment);
  const replies = comments.filter(c => c.parentComment);

  return (
    <div className="pb-20 md:pb-4 max-w-xl mx-auto">
      <div className="sticky top-16 bg-base-100 z-10 p-4 border-b border-base-200">
        <h2 className="font-bold text-xl">Post</h2>
      </div>

      <PostCard post={post} />

      <div className="bg-base-100 border-x border-base-200">
        {/* Add comment box */}
        <div className="p-4 border-b border-base-200">
          <form onSubmit={handleAddComment} className="flex gap-2">
            <input 
              type="text" 
              className="input input-bordered input-sm flex-1" 
              placeholder="Post your reply..." 
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <button type="submit" className="btn btn-primary btn-sm px-4" disabled={!newComment.trim()}>Reply</button>
          </form>
        </div>

        {/* Comments List */}
        <div className="divide-y divide-base-200">
          {topLevelComments.length === 0 ? (
            <p className="p-8 text-center text-base-content/50">No comments yet. Be the first!</p>
          ) : (
            topLevelComments.map(comment => (
              <div key={comment._id} className="p-4 hover:bg-base-200/30 transition-colors">
                <div className="flex gap-3">
                  <div className="avatar placeholder">
                    <div className="bg-neutral text-neutral-content rounded-full w-8 h-8">
                      <span className="text-xs">{comment.user?.name?.charAt(0).toUpperCase()}</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-bold text-sm hover:underline cursor-pointer">{comment.user?.name}</span>
                        <span className="text-xs text-base-content/60 ml-1">@{comment.user?.username} • {formatTimeAgo(comment.createdAt)}</span>
                      </div>
                      {(comment.user?._id === user?._id || user?.isAdmin) && (
                        <button onClick={() => handleDeleteComment(comment._id)} className="text-error btn btn-ghost btn-xs btn-circle"><Trash2 size={14}/></button>
                      )}
                    </div>
                    <p className="text-sm mt-1">{comment.text}</p>
                    
                    <button 
                      className="text-xs font-semibold text-base-content/60 mt-2 flex gap-1 items-center hover:text-primary transition-colors"
                      onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
                    >
                      <Reply size={14} /> Reply
                    </button>

                    {replyingTo === comment._id && (
                      <form onSubmit={(e) => handleReply(e, comment._id)} className="mt-2 flex gap-2">
                        <input 
                          autoFocus
                          type="text" 
                          className="input input-bordered input-xs flex-1" 
                          placeholder="Write a reply..." 
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                        />
                        <button type="submit" className="btn btn-primary btn-xs" disabled={!replyText.trim()}>Send</button>
                      </form>
                    )}

                    {/* Replies */}
                    <div className="mt-3 space-y-3 pl-4 border-l-2 border-base-200">
                      {replies.filter(r => r.parentComment === comment._id).map(reply => (
                        <div key={reply._id} className="flex gap-2">
                          <div className="avatar placeholder">
                            <div className="bg-neutral text-neutral-content rounded-full w-6 h-6">
                              <span className="text-[10px]">{reply.user?.name?.charAt(0).toUpperCase()}</span>
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <div className="text-xs">
                                <span className="font-bold">{reply.user?.name}</span> <span className="text-base-content/60">@{reply.user?.username}</span>
                              </div>
                              {(reply.user?._id === user?._id || user?.isAdmin) && (
                                <button onClick={() => handleDeleteComment(reply._id)} className="text-error/70 hover:text-error transition-colors"><Trash2 size={12}/></button>
                              )}
                            </div>
                            <p className="text-sm">{reply.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PostDetails;
