import { useState, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { createPost } from '../services/postService';
import { imageToBase64 } from '../utils/imageToBase64';
import { Image, Send, X, BarChart2, Smile, Plus, Trash2 } from 'lucide-react';

const QUICK_EMOJIS = ['✨', '🚀', '🔥', '❤️', '👏', '💡', '☕', '🎉'];
const POPULAR_TAGS = ['ConnectHub', 'Tech', 'Design', 'Community', 'Innovation'];

const CreatePostBox = ({ onPostCreated }) => {
  const { user } = useContext(AuthContext);
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [showPoll, setShowPoll] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [loading, setLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image must be less than 5MB');
        return;
      }
      try {
        const base64 = await imageToBase64(file);
        setImage(base64);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleAddPollOption = () => {
    if (pollOptions.length < 4) {
      setPollOptions([...pollOptions, '']);
    }
  };

  const handleRemovePollOption = (idx) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== idx));
    }
  };

  const handlePollOptionChange = (val, idx) => {
    const next = [...pollOptions];
    next[idx] = val;
    setPollOptions(next);
  };

  const insertEmoji = (emoji) => {
    setContent(prev => prev + emoji);
  };

  const insertTag = (tag) => {
    setContent(prev => {
      const trimmed = prev.trim();
      return trimmed ? `${trimmed} #${tag} ` : `#${tag} `;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const hasContent = content.trim().length > 0;
    const hasImage = !!image;
    const hasPoll = showPoll && pollQuestion.trim().length > 0 && pollOptions.filter(o => o.trim()).length >= 2;

    if (!hasContent && !hasImage && !hasPoll) return;
    
    setLoading(true);
    try {
      const payload = {
        content: content.trim(),
        image
      };

      if (hasPoll) {
        payload.poll = {
          question: pollQuestion.trim(),
          options: pollOptions.filter(o => o.trim()).map(text => ({ text: text.trim() }))
        };
      }

      const { data } = await createPost(payload);
      setContent('');
      setImage(null);
      setShowPoll(false);
      setPollQuestion('');
      setPollOptions(['', '']);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (onPostCreated) onPostCreated(data);
    } catch (err) {
      console.error('Failed to create post', err);
      alert('Failed to create post. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card bg-base-100 border border-base-200/90 rounded-2xl shadow-sm mb-6 transition-all hover:border-base-300">
      <div className="card-body p-4 sm:p-5">
        <form onSubmit={handleSubmit}>
          <div className="flex gap-3">
            <div className="avatar hidden sm:flex shrink-0">
              <div className="w-10 h-10 rounded-full ring-2 ring-primary/20">
                <img 
                  src={user?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=random`} 
                  alt="Avatar" 
                  className="object-cover"
                />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <textarea
                className="textarea textarea-ghost w-full p-2 text-base resize-none focus:outline-none focus:bg-base-200/40 rounded-xl transition-all"
                placeholder="What's happening in your world?"
                rows={content.length > 80 ? 4 : 2}
                value={content}
                onChange={(e) => setContent(e.target.value)}
              ></textarea>
              
              {/* Image Preview */}
              {image && (
                <div className="relative mt-2 inline-block rounded-2xl overflow-hidden border border-base-200 shadow-sm max-w-full">
                  <img src={image} alt="Preview" className="max-h-64 w-auto object-cover rounded-2xl" />
                  <button 
                    type="button" 
                    className="btn btn-circle btn-xs btn-neutral bg-black/60 text-white absolute top-2 right-2 border-none hover:bg-black"
                    onClick={() => {
                      setImage(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              {/* Poll Builder */}
              {showPoll && (
                <div className="mt-3 p-3.5 bg-base-200/50 rounded-2xl border border-base-200 space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-xs uppercase tracking-wide text-primary flex items-center gap-1.5">
                      <BarChart2 size={14} /> Create a Poll
                    </span>
                    <button 
                      type="button" 
                      onClick={() => setShowPoll(false)}
                      className="btn btn-ghost btn-xs btn-circle text-base-content/60"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <input 
                    type="text" 
                    placeholder="Ask a question..." 
                    className="input input-bordered input-sm w-full rounded-xl"
                    value={pollQuestion}
                    onChange={(e) => setPollQuestion(e.target.value)}
                  />
                  <div className="space-y-2">
                    {pollOptions.map((opt, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <input 
                          type="text" 
                          placeholder={`Option ${idx + 1}`} 
                          className="input input-bordered input-sm flex-1 rounded-xl"
                          value={opt}
                          onChange={(e) => handlePollOptionChange(e.target.value, idx)}
                        />
                        {pollOptions.length > 2 && (
                          <button 
                            type="button" 
                            onClick={() => handleRemovePollOption(idx)}
                            className="btn btn-ghost btn-xs btn-circle text-error"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  {pollOptions.length < 4 && (
                    <button 
                      type="button" 
                      onClick={handleAddPollOption}
                      className="btn btn-ghost btn-xs text-primary gap-1"
                    >
                      <Plus size={14} /> Add Option
                    </button>
                  )}
                </div>
              )}

              {/* Quick Emojis Row */}
              {showEmojiPicker && (
                <div className="flex flex-wrap gap-1.5 mt-2 p-2 bg-base-200/50 rounded-xl border border-base-200">
                  {QUICK_EMOJIS.map(emoji => (
                    <button 
                      key={emoji}
                      type="button" 
                      onClick={() => insertEmoji(emoji)}
                      className="text-lg p-1 hover:scale-125 transition-transform"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}

              {/* Tag suggestions */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {POPULAR_TAGS.map(tag => (
                  <button 
                    key={tag}
                    type="button"
                    onClick={() => insertTag(tag)}
                    className="badge badge-sm badge-ghost hover:badge-primary text-[11px] cursor-pointer transition-colors"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex justify-between items-center mt-3 pt-3 border-t border-base-200">
            <div className="flex items-center gap-1">
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleImageChange}
              />
              <button 
                type="button" 
                className="btn btn-ghost btn-sm btn-circle text-primary hover:bg-primary/10" 
                title="Add Image"
                onClick={() => fileInputRef.current?.click()}
              >
                <Image size={19} />
              </button>

              <button 
                type="button" 
                className={`btn btn-ghost btn-sm btn-circle ${showPoll ? 'text-primary bg-primary/10' : 'text-base-content/70 hover:text-primary'}`}
                title="Create Poll"
                onClick={() => setShowPoll(!showPoll)}
              >
                <BarChart2 size={19} />
              </button>

              <button 
                type="button" 
                className={`btn btn-ghost btn-sm btn-circle ${showEmojiPicker ? 'text-primary bg-primary/10' : 'text-base-content/70 hover:text-primary'}`}
                title="Quick Emoji"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                <Smile size={19} />
              </button>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-sm rounded-full px-5 shadow-sm shadow-primary/20 gap-1.5 font-bold"
              disabled={(!content.trim() && !image && !showPoll) || loading}
            >
              {loading ? <span className="loading loading-spinner loading-xs"></span> : (
                <>Post <Send size={13} /></>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostBox;
