import { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Trash2, Eye, Send } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { deleteStory, viewStory, getStoryViewers } from '../services/storyService';
import { sendMessage } from '../services/messageService';
import { formatTimeAgo } from '../utils/dateFormatter';

const STORY_REACTIONS = ['🔥', '❤️', '👏', '😂', '😍', '🙌'];

const StoryViewer = ({ group, onClose, onDelete }) => {
  const { stories } = group;
  
  const firstUnviewed = stories.findIndex(s => !s.isViewed);
  const initialIndex = firstUnviewed === -1 ? 0 : firstUnviewed;

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [viewers, setViewers] = useState([]);
  const [showViewers, setShowViewers] = useState(false);
  const [loadingViewers, setLoadingViewers] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [replySuccess, setReplySuccess] = useState(false);
  const viewedIdsRef = useRef(new Set());

  const { user } = useContext(AuthContext);

  const currentStory = stories[currentIndex];
  const storyAuthorId = (typeof currentStory?.user === 'object' ? currentStory?.user?._id : currentStory?.user)?.toString();
  const myUserId = user?._id?.toString();
  const isOwnStory = storyAuthorId === myUserId;

  const handleNext = useCallback(() => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setProgress(0);
      setShowViewers(false);
    } else {
      onClose();
    }
  }, [currentIndex, stories.length, onClose]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setProgress(0);
      setShowViewers(false);
    }
  }, [currentIndex]);

  useEffect(() => {
    if (!currentStory) return;

    if (!currentStory.isViewed && !isOwnStory && !viewedIdsRef.current.has(currentStory._id)) {
      viewedIdsRef.current.add(currentStory._id);
      viewStory(currentStory._id).catch(console.error);
    }

    if (isPaused) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + 2; // 5s total
      });
    }, 100);

    return () => clearInterval(interval);
  }, [currentStory, isOwnStory, isPaused, handleNext]);

  const handleDelete = async () => {
    if (window.confirm('Delete this story?')) {
      try {
        await deleteStory(currentStory._id);
        onDelete();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleOpenViewers = async () => {
    setIsPaused(true);
    setShowViewers(true);
    setLoadingViewers(true);
    try {
      const { data } = await getStoryViewers(currentStory._id);
      setViewers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingViewers(false);
    }
  };

  const handleSendReply = async (textToSend) => {
    const text = textToSend || replyText;
    if (!text.trim() || !storyAuthorId) return;

    setSendingReply(true);
    try {
      await sendMessage(storyAuthorId, `Replied to your story: "${text.trim()}"`);
      setReplyText('');
      setReplySuccess(true);
      setTimeout(() => setReplySuccess(false), 2000);
    } catch (err) {
      console.error(err);
      alert('Failed to send reply');
    } finally {
      setSendingReply(false);
    }
  };

  const authorName = currentStory?.user?.name || group.user?.name || 'User';
  const authorUsername = currentStory?.user?.username || group.user?.username || 'user';
  const authorAvatar = currentStory?.user?.profilePicture || group.user?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=random`;

  return (
    <div className="fixed inset-0 bg-black/95 z-[110] flex items-center justify-center backdrop-blur-sm select-none">
      {/* Progress Bars */}
      <div className="absolute top-3 left-0 right-0 px-4 flex gap-1.5 z-[112] max-w-lg mx-auto">
        {stories.map((story, idx) => (
          <div key={story._id} className="h-1 flex-1 bg-white/25 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white transition-all duration-100 ease-linear rounded-full"
              style={{ 
                width: idx === currentIndex ? `${progress}%` : (idx < currentIndex ? '100%' : '0%') 
              }}
            ></div>
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="absolute top-6 left-0 right-0 px-4 flex justify-between items-center z-[112] text-white max-w-lg mx-auto">
        <div className="flex items-center gap-3">
          <img 
            src={authorAvatar}
            alt={authorName}
            className="w-10 h-10 rounded-full object-cover border-2 border-white/50"
          />
          <div>
            <p className="font-bold text-sm drop-shadow-md">{authorUsername}</p>
            <p className="text-[11px] text-white/80 drop-shadow-md">{formatTimeAgo(currentStory.createdAt)}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isOwnStory && (
            <>
              <button 
                onClick={handleOpenViewers} 
                className="btn btn-ghost btn-circle btn-sm text-white hover:bg-white/20"
                title="Viewers"
              >
                <Eye size={20} />
              </button>
              <button 
                onClick={handleDelete} 
                className="btn btn-ghost btn-circle btn-sm text-error hover:bg-white/20"
                title="Delete Story"
              >
                <Trash2 size={20} />
              </button>
            </>
          )}
          <button onClick={onClose} className="btn btn-ghost btn-circle btn-sm text-white hover:bg-white/20">
            <X size={22} />
          </button>
        </div>
      </div>

      {/* Desktop Navigation Buttons */}
      <div className="absolute inset-y-0 left-4 hidden md:flex items-center z-[112]">
        {currentIndex > 0 && (
          <button 
            onClick={(e) => { e.stopPropagation(); handlePrev(); }} 
            className="btn btn-circle bg-white/20 border-none hover:bg-white/40 text-white"
          >
            <ChevronLeft size={24} />
          </button>
        )}
      </div>
      <div className="absolute inset-y-0 right-4 hidden md:flex items-center z-[112]">
        {currentIndex < stories.length - 1 && (
          <button 
            onClick={(e) => { e.stopPropagation(); handleNext(); }} 
            className="btn btn-circle bg-white/20 border-none hover:bg-white/40 text-white"
          >
            <ChevronRight size={24} />
          </button>
        )}
      </div>

      {/* Story Content Area */}
      <div 
        className="w-full max-w-lg h-[86vh] md:rounded-3xl overflow-hidden relative bg-black flex items-center justify-center shadow-2xl"
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* Navigation tap targets */}
        <div className="absolute inset-y-0 left-0 w-1/3 z-[111]" onClick={handlePrev}></div>
        <div className="absolute inset-y-0 right-0 w-2/3 z-[111]" onClick={handleNext}></div>

        <img 
          src={currentStory.image} 
          alt="Story content" 
          className="w-full h-full object-contain md:object-cover"
        />

        {currentStory.caption && (
          <div className="absolute bottom-20 left-0 right-0 text-center px-6 pointer-events-none z-[111]">
            <span className="bg-black/70 backdrop-blur-md text-white font-medium px-4 py-2 rounded-2xl text-sm inline-block max-w-xs shadow-lg border border-white/10">
              {currentStory.caption}
            </span>
          </div>
        )}

        {/* Story Reply Bar (for non-owners) */}
        {!isOwnStory && (
          <div className="absolute bottom-4 left-0 right-0 px-4 z-[113]">
            {replySuccess ? (
              <div className="bg-success text-success-content text-xs font-bold py-2 px-4 rounded-full text-center">
                Reply sent to @{authorUsername}!
              </div>
            ) : (
              <div className="space-y-2">
                {/* Quick emoji reactions */}
                <div className="flex justify-center gap-3">
                  {STORY_REACTIONS.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => handleSendReply(emoji)}
                      className="text-xl hover:scale-130 transition-transform bg-black/40 backdrop-blur-md rounded-full w-9 h-9 flex items-center justify-center border border-white/10 text-white"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2 items-center">
                  <input 
                    type="text" 
                    placeholder={`Reply to ${authorUsername}...`}
                    className="input input-sm flex-1 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/20 focus:border-white px-4 placeholder:text-white/50 text-xs"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
                  />
                  <button 
                    onClick={() => handleSendReply()}
                    disabled={!replyText.trim() || sendingReply}
                    className="btn btn-circle btn-sm btn-primary shrink-0"
                  >
                    <Send size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Viewers Drawer Modal (for author) */}
      {showViewers && (
        <div className="absolute inset-x-0 bottom-0 max-w-lg mx-auto bg-base-100 rounded-t-3xl p-5 z-[120] border-t border-base-200 text-base-content max-h-[50vh] overflow-y-auto animate-in slide-in-from-bottom duration-200 shadow-2xl">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-base-200">
            <h4 className="font-bold text-sm flex items-center gap-2">
              <Eye size={18} className="text-primary" /> Story Viewers ({viewers.length})
            </h4>
            <button 
              onClick={() => { setShowViewers(false); setIsPaused(false); }}
              className="btn btn-ghost btn-circle btn-xs"
            >
              <X size={16} />
            </button>
          </div>

          {loadingViewers ? (
            <div className="flex justify-center p-6"><span className="loading loading-spinner text-primary"></span></div>
          ) : viewers.length === 0 ? (
            <p className="text-center text-sm text-base-content/50 py-6">No views yet.</p>
          ) : (
            <div className="space-y-3">
              {viewers.map(v => (
                <div key={v._id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img 
                      src={v.viewer?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(v.viewer?.name || 'U')}&background=random`} 
                      alt={v.viewer?.name}
                      className="w-10 h-10 rounded-full object-cover border border-base-200" 
                    />
                    <div>
                      <p className="font-bold text-xs">{v.viewer?.name}</p>
                      <p className="text-[11px] text-base-content/60">@{v.viewer?.username}</p>
                    </div>
                  </div>
                  <span className="text-[11px] text-base-content/50">{formatTimeAgo(v.createdAt)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StoryViewer;
