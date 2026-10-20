import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import { 
  Heart, 
  MessageCircle, 
  MoreHorizontal, 
  Bookmark, 
  AlertTriangle, 
  Trash2, 
  Send, 
  BarChart2, 
  Check, 
  Share2,
  BadgeCheck,
  Pin,
  UserX
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatTimeAgo } from '../utils/dateFormatter';
import { likePost, unlikePost, toggleSavePost, deletePost, votePoll } from '../services/postService';
import { followUser, unfollowUser, blockUser } from '../services/userService';
import { reportPost } from '../services/reportService';
import { sendMessage, getConversations } from '../services/messageService';

const PostCard = ({ post, onPostDeleted }) => {
  const { user, followingIds, addFollowing, removeFollowing, addBlockedId } = useContext(AuthContext);
  const { isUserOnline } = useContext(SocketContext);

  const userIdStr = user?._id?.toString();
  const authorIdStr = (typeof post.user === 'object' ? post.user?._id : post.user)?.toString();
  const isOwner = authorIdStr === userIdStr || user?.isAdmin;
  const isAuthorOnline = isUserOnline(authorIdStr);

  const initialLiked = (post.likes || []).some(id => (typeof id === 'object' ? id._id : id)?.toString() === userIdStr);
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [likesCount, setLikesCount] = useState(post.likes?.length || 0);

  // Poll state
  const [poll, setPoll] = useState(post.poll);
  const [voting, setVoting] = useState(false);

  const initialSaved = (user?.savedPosts || []).some(id => (typeof id === 'object' ? id._id : id)?.toString() === post._id?.toString()) ||
    (post.savedBy || []).some(id => (typeof id === 'object' ? id._id : id)?.toString() === userIdStr);
  const [isSaved, setIsSaved] = useState(initialSaved);

  const isFollowing = followingIds?.has(authorIdStr);
  const [followLoading, setFollowLoading] = useState(false);
  const [loading, setLoading] = useState(false);



  // Report & Share
  const [reportReason, setReportReason] = useState('');
  const [reportLoading, setReportLoading] = useState(false);
  const [shareUsers, setShareUsers] = useState([]);
  const [shareLoading, setShareLoading] = useState(false);
  const [sharingTo, setSharingTo] = useState(null);

  const openShareModal = async () => {
    const modal = document.getElementById(`share_modal_${post._id}`);
    if (modal) modal.showModal();
    setShareLoading(true);
    try {
      const { data } = await getConversations();
      setShareUsers(data.map(c => c.user).filter(Boolean));
    } catch (err) {
      console.error(err);
    } finally {
      setShareLoading(false);
    }
  };

  const handleShare = async (targetId) => {
    setSharingTo(targetId);
    try {
      await sendMessage(targetId, `Check out this post on ConnectHub: ${window.location.origin}/post/${post._id}`);
      const modal = document.getElementById(`share_modal_${post._id}`);
      if (modal) modal.close();
      alert('Post shared in direct message!');
    } catch (err) {
      console.error(err);
      alert('Failed to share post');
    } finally {
      setSharingTo(null);
    }
  };

  const handleLikeToggle = async () => {
    if (loading) return;
    setLoading(true);

    const nextLiked = !isLiked;
    setIsLiked(nextLiked);
    setLikesCount(prev => nextLiked ? prev + 1 : Math.max(0, prev - 1));

    try {
      if (isLiked) {
        await unlikePost(post._id);
      } else {
        await likePost(post._id);
      }
    } catch (err) {
      console.error(err);
      setIsLiked(isLiked);
      setLikesCount(prev => isLiked ? prev + 1 : Math.max(0, prev - 1));
    } finally {
      setLoading(false);
    }
  };

  const handlePollVote = async (optionIndex) => {
    if (voting) return;
    setVoting(true);
    try {
      const { data } = await votePoll(post._id, optionIndex);
      setPoll(data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit vote');
    } finally {
      setVoting(false);
    }
  };

  const handleSave = async () => {
    try {
      const nextSaved = !isSaved;
      setIsSaved(nextSaved);
      await toggleSavePost(post._id);
    } catch (err) {
      console.error(err);
      setIsSaved(isSaved);
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
      await reportPost(post._id, reportReason, 'Reported via ConnectHub Feed UI');
      const modal = document.getElementById(`report_modal_${post._id}`);
      if (modal) modal.close();
      setReportReason('');
      alert('Report submitted to admins. Thank you for keeping ConnectHub safe.');
    } catch (err) {
      console.error(err);
      alert('Failed to submit report.');
    } finally {
      setReportLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!authorIdStr || followLoading) return;
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await unfollowUser(authorIdStr);
        removeFollowing(authorIdStr);
      } else {
        await followUser(authorIdStr);
        addFollowing(authorIdStr);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleBlockAuthor = async () => {
    if (!authorIdStr) return;
    const confirmBlock = window.confirm(`Block @${authorUsername}? You will no longer see posts or receive messages from this user.`);
    if (!confirmBlock) return;

    try {
      await blockUser(authorIdStr);
      addBlockedId(authorIdStr);
      if (onPostDeleted) {
        onPostDeleted(post._id);
      }
      alert(`@${authorUsername} has been blocked.`);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to block user');
    }
  };

  // Clickable hashtags & mentions formatter
  const renderFormattedContent = (text) => {
    if (!text) return null;
    const tokens = text.split(/(\s+)/);
    return tokens.map((token, index) => {
      if (token.startsWith('#') && token.length > 1) {
        return (
          <Link
            key={index}
            to={`/search?q=${encodeURIComponent(token)}`}
            className="text-primary font-bold hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {token}
          </Link>
        );
      }
      if (token.startsWith('@') && token.length > 1) {
        return (
          <Link
            key={index}
            to={`/search?q=${encodeURIComponent(token.slice(1))}`}
            className="text-secondary font-bold hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {token}
          </Link>
        );
      }
      return token;
    });
  };

  // Poll calculations
  const totalVotes = poll?.options ? poll.options.reduce((acc, opt) => acc + (opt.votes?.length || 0), 0) : 0;
  const userVotedOptionIndex = poll?.options 
    ? poll.options.findIndex(opt => (opt.votes || []).some(v => (typeof v === 'object' ? v._id : v)?.toString() === userIdStr))
    : -1;
  const hasVoted = userVotedOptionIndex !== -1;

  const authorName = post.user?.name || 'ConnectHub User';
  const authorUsername = post.user?.username || 'user';
  const authorAvatar = post.user?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=random`;

  return (
    <article className="card bg-base-100 border border-base-200/90 rounded-2xl mb-4 sm:mb-6 shadow-sm hover:border-base-300 transition-all">
      <div className="card-body p-4 sm:p-5">
        {/* Pinned by Admin Banner */}
        {post.isPinned && (
          <div className="flex items-center gap-1.5 text-xs font-bold text-primary mb-2 bg-primary/10 px-3 py-1 rounded-lg w-fit">
            <Pin className="w-3.5 h-3.5" /> Pinned Announcement
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex gap-3 items-center flex-1 min-w-0 pr-2">
            <Link to={`/profile/${authorIdStr}`} className="relative shrink-0 group">
              <div className="w-11 h-11 rounded-full overflow-hidden ring-2 ring-base-200 group-hover:ring-primary transition-all">
                <img src={authorAvatar} alt={authorName} className="w-full h-full object-cover" />
              </div>
              {isAuthorOnline && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-base-100 online-pulse"></span>
              )}
            </Link>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <Link to={`/profile/${authorIdStr}`} className="font-bold hover:underline text-[15px] truncate flex items-center gap-1">
                  <span>{authorName}</span>
                  {post.user?.isVerified && (
                    <BadgeCheck className="w-4 h-4 text-primary fill-primary/20 shrink-0" title="Verified Creator" />
                  )}
                </Link>
                {post.user?.headline && (
                  <span className="text-xs text-base-content/50 truncate hidden sm:inline">
                    • {post.user.headline}
                  </span>
                )}
              </div>
              <div className="text-xs text-base-content/60 flex items-center gap-1">
                <span>@{authorUsername}</span>
                <span>•</span>
                <span>{formatTimeAgo(post.createdAt)}</span>
              </div>
            </div>

            {/* Follow/Unfollow Button for other users */}
            {!isOwner && authorIdStr && (
              <button 
                onClick={handleFollowToggle}
                disabled={followLoading}
                className={`btn btn-xs rounded-full px-3.5 transition-all ${
                  isFollowing 
                    ? 'btn-outline text-base-content/70 border-base-200 hover:border-error hover:text-error' 
                    : 'btn-primary'
                }`}
              >
                {followLoading ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : isFollowing ? (
                  'Following'
                ) : (
                  'Follow'
                )}
              </button>
            )}
          </div>
          
          {/* Options Dropdown */}
          <div className="dropdown dropdown-end shrink-0">
            <label tabIndex={0} className="btn btn-ghost btn-sm btn-circle text-base-content/60 hover:text-base-content">
              <MoreHorizontal size={18} />
            </label>
            <ul tabIndex={0} className="dropdown-content z-20 menu p-2 shadow-2xl bg-base-100 rounded-2xl w-48 border border-base-200">
              {isOwner ? (
                <li>
                  <button onClick={handleDelete} className="text-error hover:bg-error/10">
                    <Trash2 size={16} /> Delete Post
                  </button>
                </li>
              ) : (
                <>
                  <li>
                    <button 
                      onClick={() => document.getElementById(`report_modal_${post._id}`)?.showModal()} 
                      className="hover:bg-warning/10 text-warning"
                    >
                      <AlertTriangle size={16} /> Report Post
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={handleBlockAuthor} 
                      className="hover:bg-error/10 text-error"
                    >
                      <UserX size={16} /> Block @{authorUsername}
                    </button>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>

        {/* Content Body */}
        <div className="mt-3 text-[15px] leading-relaxed text-base-content break-words whitespace-pre-wrap">
          {renderFormattedContent(post.content)}
        </div>
        
        {/* Post Image */}
        {post.image && (
          <figure className="mt-3 rounded-2xl overflow-hidden border border-base-200 bg-base-200/20 max-h-[500px]">
            <img 
              src={post.image} 
              alt="Post visual" 
              className="w-full object-cover max-h-[500px] hover:scale-[1.01] transition-transform duration-300" 
              loading="lazy" 
            />
          </figure>
        )}

        {/* Interactive Poll */}
        {poll && poll.question && (
          <div className="mt-3.5 p-4 bg-base-200/50 rounded-2xl border border-base-200">
            <p className="font-bold text-sm mb-3 flex items-center gap-2 text-base-content">
              <BarChart2 size={17} className="text-primary" /> {poll.question}
            </p>
            <div className="space-y-2">
              {poll.options.map((opt, idx) => {
                const count = opt.votes?.length || 0;
                const percentage = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                const isSelected = hasVoted && userVotedOptionIndex === idx;

                return (
                  <div key={idx} className="relative">
                    <button
                      type="button"
                      disabled={hasVoted || voting}
                      onClick={() => handlePollVote(idx)}
                      className={`w-full relative overflow-hidden text-left p-3 rounded-xl border text-sm font-semibold transition-all ${
                        isSelected 
                          ? 'border-primary bg-primary/10 text-primary' 
                          : 'border-base-200 hover:border-primary/50 bg-base-100'
                      }`}
                    >
                      {/* Vote Progress Fill */}
                      {hasVoted && (
                        <div 
                          className={`absolute top-0 bottom-0 left-0 transition-all duration-500 opacity-20 ${isSelected ? 'bg-primary' : 'bg-base-content'}`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      )}
                      
                      <div className="relative z-10 flex justify-between items-center">
                        <span className="flex items-center gap-2">
                          {isSelected && <Check size={16} className="text-primary" />}
                          {opt.text}
                        </span>
                        {hasVoted && (
                          <span className="text-xs font-bold text-base-content/70">
                            {percentage}% ({count})
                          </span>
                        )}
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="mt-2.5 flex justify-between items-center text-xs text-base-content/50">
              <span>{totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}</span>
              {hasVoted ? (
                <span className="text-success font-medium flex items-center gap-1">
                  <Check size={13} /> Voted
                </span>
              ) : (
                <span>Click an option to vote</span>
              )}
            </div>
          </div>
        )}

        {/* Action Bar */}
        <div className="flex justify-between items-center mt-4 pt-3 border-t border-base-200 relative">
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Like Button */}
            <button 
              onClick={handleLikeToggle} 
              className={`btn btn-ghost btn-sm rounded-full gap-2 transition-all ${
                isLiked ? 'text-error font-bold' : 'text-base-content/70 hover:text-error'
              }`}
              title={isLiked ? "Unlike" : "Like"}
            >
              <Heart size={19} fill={isLiked ? "currentColor" : "none"} />
              <span>{likesCount}</span>
            </button>
            
            {/* Comment Button */}
            <Link 
              to={`/post/${post._id}`} 
              className="btn btn-ghost btn-sm rounded-full gap-2 text-base-content/70 hover:text-primary transition-all"
            >
              <MessageCircle size={19} />
              <span>{post.comments?.length || 0}</span>
            </Link>
          </div>
          
          <div className="flex items-center gap-1">
            {/* Share to Direct Message */}
            <button 
              onClick={openShareModal}
              className="btn btn-ghost btn-sm btn-circle text-base-content/70 hover:text-primary"
              title="Share to Message"
            >
              <Send size={18} />
            </button>

            {/* Save Bookmark */}
            <button 
              onClick={handleSave} 
              className={`btn btn-ghost btn-sm btn-circle transition-all ${
                isSaved ? 'text-primary' : 'text-base-content/70 hover:text-primary'
              }`}
              title={isSaved ? "Saved" : "Save Post"}
            >
              <Bookmark size={19} fill={isSaved ? "currentColor" : "none"} />
            </button>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      <dialog id={`share_modal_${post._id}`} className="modal modal-bottom sm:modal-middle">
        <div className="modal-box rounded-3xl">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Share2 size={20} className="text-primary" /> Send in Direct Message
          </h3>

          <div className="space-y-3 max-h-80 overflow-y-auto">
            {shareLoading ? (
              <div className="flex justify-center p-6"><span className="loading loading-spinner text-primary"></span></div>
            ) : shareUsers.length === 0 ? (
              <p className="text-center text-sm text-base-content/50 py-6">
                No recent conversations found. Go to Messages to start a chat!
              </p>
            ) : (
              shareUsers.map(u => (
                <div key={u._id} className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-base-200/60 transition-colors">
                  <div className="flex items-center gap-3">
                    <img 
                      src={u.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=random`} 
                      alt={u.name}
                      className="w-10 h-10 rounded-full object-cover border border-base-200" 
                    />
                    <div>
                      <p className="font-bold text-sm">{u.name}</p>
                      <p className="text-xs text-base-content/60">@{u.username}</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleShare(u._id)}
                    disabled={sharingTo === u._id}
                    className="btn btn-primary btn-sm rounded-full px-4"
                  >
                    {sharingTo === u._id ? <span className="loading loading-spinner loading-xs"></span> : 'Send'}
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="modal-action">
            <form method="dialog">
              <button className="btn btn-sm btn-ghost rounded-full">Close</button>
            </form>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop"><button>close</button></form>
      </dialog>

      {/* Report Modal */}
      {!isOwner && (
        <dialog id={`report_modal_${post._id}`} className="modal modal-bottom sm:modal-middle">
          <div className="modal-box rounded-3xl">
            <h3 className="font-bold text-lg text-warning flex items-center gap-2">
              <AlertTriangle size={20} /> Report Post
            </h3>
            <p className="text-sm text-base-content/70 mt-2">
              Please choose a reason why this post violates community guidelines:
            </p>
            
            <form onSubmit={handleReport} className="mt-4 space-y-3">
              <div className="form-control">
                <select 
                  className="select select-bordered w-full rounded-xl"
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  required
                >
                  <option value="" disabled>Select a reason...</option>
                  <option value="Spam or misleading">Spam or misleading</option>
                  <option value="Harassment or hate speech">Harassment or hate speech</option>
                  <option value="Inappropriate content">Inappropriate content</option>
                  <option value="False information">False information</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="modal-action">
                <button 
                  type="button" 
                  className="btn btn-sm btn-ghost rounded-full"
                  onClick={() => document.getElementById(`report_modal_${post._id}`)?.close()}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-sm btn-warning rounded-full px-5"
                  disabled={reportLoading || !reportReason}
                >
                  {reportLoading ? <span className="loading loading-spinner loading-xs"></span> : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
          <form method="dialog" className="modal-backdrop"><button>close</button></form>
        </dialog>
      )}
    </article>
  );
};

export default PostCard;
