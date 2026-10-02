import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Heart, MessageCircle, MoreHorizontal, Bookmark, AlertTriangle, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatTimeAgo } from '../utils/dateFormatter';
import { likePost, unlikePost, toggleSavePost, deletePost } from '../services/postService';
import { followUser, unfollowUser } from '../services/userService';
import { reportPost } from '../services/reportService';
import { sendMessage, getConversations } from '../services/messageService';
import { Send } from 'lucide-react';

const PostCard = ({ post, onPostDeleted }) => {
  const { user, followingIds, addFollowing, removeFollowing } = useContext(AuthContext);
  const [isLiked, setIsLiked] = useState(post.likes?.includes(user?._id));
  const [likesCount, setLikesCount] = useState(post.likes?.length || 0);
  
  const [followLoading, setFollowLoading] = useState(false);
  const isOwner = post.user?._id === user?._id || post.user === user?._id;
  const targetUserId = typeof post.user === 'object' ? post.user?._id : post.user;
  const isFollowing = followingIds?.has(targetUserId);
  
  // Note: in a real app, isSaved would come from backend response
  // Here we fallback to local state toggle
  const [isSaved, setIsSaved] = useState(false); 
  
  const [loading, setLoading] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportLoading, setReportLoading] = useState(false);
  const [shareUsers, setShareUsers] = useState([]);
  const [shareLoading, setShareLoading] = useState(false);
  const [sharingTo, setSharingTo] = useState(null);

  const openShareModal = async () => {
    document.getElementById(`share_modal_${post._id}`).showModal();
    setShareLoading(true);
    try {
      const { data } = await getConversations();
      setShareUsers(data.map(c => c.user));
    } catch (err) {
      console.error(err);
    } finally {
      setShareLoading(false);
    }
  };

  const handleShare = async (userId) => {
    setSharingTo(userId);
    try {
      await sendMessage(userId, `Check out this post: ${window.location.origin}/post/${post._id}`);
      alert('Post shared successfully!');
      document.getElementById(`share_modal_${post._id}`).close();
    } catch (err) {
      console.error(err);
      alert('Failed to share post');
    } finally {
      setSharingTo(null);
    }
  };

  const handleLike = async () => {
    if (loading) return;
    setLoading(true);
    // Optimistic UI update
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    
    try {
      if (isLiked) {
        await unlikePost(post._id);
      } else {
        await likePost(post._id);
      }
    } catch (err) {
      console.error(err);
      // Revert if failed
      setIsLiked(isLiked);
      setLikesCount(prev => isLiked ? prev + 1 : prev - 1);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await toggleSavePost(post._id);
      setIsSaved(!isSaved);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await deletePost(post._id);
        if (onPostDeleted) onPostDeleted(post._id);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleReport = async (e) => {
    e.preventDefault();
    if (!reportReason) return;
    setReportLoading(true);
    try {
      await reportPost(post._id, reportReason, 'Reported via PostCard UI');
      document.getElementById(`report_modal_${post._id}`).close();
      setReportReason('');
      alert('Report submitted successfully.');
    } catch (err) {
      console.error(err);
      alert('Failed to submit report.');
    } finally {
      setReportLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!targetUserId || followLoading) return;
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await unfollowUser(targetUserId);
        if (removeFollowing) removeFollowing(targetUserId);
      } else {
        await followUser(targetUserId);
        if (addFollowing) addFollowing(targetUserId);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update follow status');
    } finally {
      setFollowLoading(false);
    }
  };

  return (
    <div className="card bg-base-100 border-b border-base-200 rounded-none sm:rounded-2xl sm:border sm:mb-6 hover:border-base-300 transition-colors duration-200">
      <div className="card-body p-4 sm:p-5">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex gap-3 items-center flex-1 min-w-0 pr-2">
            <Link to={`/profile/${post.user?._id}`} className="avatar">
              {post.user?.profilePicture ? (
                <div className="w-11 h-11 rounded-full">
                  <img src={post.user.profilePicture} alt="Profile" className="object-cover" />
                </div>
              ) : (
                <div className="bg-neutral text-neutral-content rounded-full w-11 h-11 flex items-center justify-center">
                  <span className="text-lg font-bold">{post.user?.name?.charAt(0).toUpperCase()}</span>
                </div>
              )}
            </Link>
            <div>
              <Link to={`/profile/${post.user?._id}`} className="font-bold hover:underline text-[15px]">
                {post.user?.name}
              </Link>
              <div className="text-xs text-base-content/60 flex items-center gap-1">
                <span>@{post.user?.username}</span>
                <span>•</span>
                <span>{formatTimeAgo(post.createdAt)}</span>
              </div>
            </div>
            {!isOwner && targetUserId && (
              <div className="ml-1 sm:ml-2 shrink-0">
                <button 
                  onClick={handleFollowToggle}
                  disabled={followLoading}
                  className={`btn btn-xs sm:btn-sm rounded-full px-3 sm:px-4 ${isFollowing ? 'btn-outline text-base-content/70 border-base-content/20 hover:border-base-content/40 hover:bg-base-200' : 'btn-primary'}`}
                >
                  {followLoading ? <span className="loading loading-spinner loading-xs"></span> : (isFollowing ? 'Following' : 'Follow')}
                </button>
              </div>
            )}
          </div>
          
          <div className="dropdown dropdown-end shrink-0">
            <label tabIndex={0} className="btn btn-ghost btn-sm btn-circle">
              <MoreHorizontal size={18} />
            </label>
            <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52 border border-base-200">
              {isOwner ? (
                <li><button onClick={handleDelete} className="text-error hover:bg-error/10"><Trash2 size={16} /> Delete Post</button></li>
              ) : (
                <li><button onClick={() => document.getElementById(`report_modal_${post._id}`).showModal()} className="hover:bg-warning/10"><AlertTriangle size={16} /> Report Post</button></li>
              )}
            </ul>
          </div>
        </div>

        {/* Content */}
        <div className="mt-3 text-[15px] leading-relaxed text-base-content break-words whitespace-pre-wrap">
          {post.content}
        </div>
        
        {post.image && (
          <figure className="mt-3 rounded-xl overflow-hidden border border-base-200 bg-base-200/20">
            <img src={post.image} alt="Post content" className="w-full object-cover max-h-[500px]" loading="lazy" />
          </figure>
        )}

        {/* Actions */}
        <div className="flex justify-between items-center mt-4 pt-3 border-t border-base-200">
          <div className="flex gap-4">
            <button 
              onClick={handleLike} 
              className={`flex items-center gap-2 group transition-colors ${isLiked ? 'text-error' : 'text-base-content/70 hover:text-error'}`}
            >
              <div className="p-2 rounded-full group-hover:bg-error/10 transition-colors">
                <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
              </div>
              <span className={isLiked ? "font-medium" : ""}>{likesCount}</span>
            </button>
            
            <Link to={`/post/${post._id}`} className="flex items-center gap-2 group text-base-content/70 hover:text-primary transition-colors">
              <div className="p-2 rounded-full group-hover:bg-primary/10 transition-colors">
                <MessageCircle size={20} />
              </div>
              <span>{post.comments?.length || 0}</span>
            </Link>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={openShareModal}
              className="flex items-center gap-2 group text-base-content/70 hover:text-primary transition-colors"
              title="Share Post"
            >
              <div className="p-2 rounded-full group-hover:bg-primary/10 transition-colors">
                <Send size={20} />
              </div>
            </button>
            <button 
              onClick={handleSave} 
              className={`flex items-center gap-2 group transition-colors ${isSaved ? 'text-primary' : 'text-base-content/70 hover:text-primary'}`}
            >
              <div className="p-2 rounded-full group-hover:bg-primary/10 transition-colors">
                <Bookmark size={20} fill={isSaved ? "currentColor" : "none"} />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {!isOwner && (
        <dialog id={`report_modal_${post._id}`} className="modal">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Report Post</h3>
            <form onSubmit={handleReport}>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Why are you reporting this post?</span>
                </label>
                <select 
                  className="select select-bordered w-full" 
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  required
                >
                  <option value="" disabled>Select a reason...</option>
                  <option value="spam">It's spam</option>
                  <option value="harassment">Harassment or bullying</option>
                  <option value="inappropriate">Inappropriate content</option>
                  <option value="violence">Violence or threat</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="modal-action">
                <button type="button" className="btn btn-ghost" onClick={() => {
                  document.getElementById(`report_modal_${post._id}`).close();
                  setReportReason('');
                }}>Cancel</button>
                <button type="submit" className="btn btn-error" disabled={!reportReason || reportLoading}>
                  {reportLoading ? <span className="loading loading-spinner"></span> : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button>close</button>
          </form>
        </dialog>
      )}

      {/* Share Modal */}
      <dialog id={`share_modal_${post._id}`} className="modal modal-bottom sm:modal-middle">
        <div className="modal-box p-0 overflow-hidden flex flex-col max-h-[80vh]">
          <div className="p-4 border-b border-base-200">
            <h3 className="font-bold text-lg">Share with</h3>
          </div>
          <div className="p-4 overflow-y-auto flex-1">
            {shareLoading ? (
              <div className="flex justify-center py-8"><span className="loading loading-spinner"></span></div>
            ) : shareUsers.length === 0 ? (
              <div className="text-center py-8 text-base-content/50">No recent conversations to share with.</div>
            ) : (
              <div className="flex flex-col gap-2">
                {shareUsers.map(u => (
                  <div key={u._id} className="flex items-center justify-between p-2 hover:bg-base-200 rounded-xl transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="avatar">
                        <div className="w-10 h-10 rounded-full bg-neutral text-neutral-content flex items-center justify-center">
                          {u.profilePicture ? (
                            <img src={u.profilePicture} alt={u.name} className="object-cover" />
                          ) : (
                            <span className="font-bold">{u.name.charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="font-bold text-sm leading-tight">{u.name}</p>
                        <p className="text-xs text-base-content/60">@{u.username}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleShare(u._id)} 
                      disabled={sharingTo === u._id}
                      className="btn btn-sm btn-primary rounded-full px-6"
                    >
                      {sharingTo === u._id ? <span className="loading loading-spinner loading-xs"></span> : 'Send'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="p-4 border-t border-base-200 bg-base-100 flex gap-2">
            <button className="btn btn-outline flex-1 rounded-full" onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/post/${post._id}`);
              alert('Link copied to clipboard!');
            }}>
              Copy Link
            </button>
            <form method="dialog" className="flex-1 flex">
              <button className="btn flex-1 rounded-full">Close</button>
            </form>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </div>
  );
};

export default PostCard;
