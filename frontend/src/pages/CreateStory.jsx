import { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { createStory, getActiveStories } from '../services/storyService';
import { AuthContext } from '../context/AuthContext';
import { X, Image as ImageIcon, Plus, CheckCircle, RefreshCw, Sparkles, Upload } from 'lucide-react';

const CreateStory = () => {
  const [image, setImage] = useState('');
  const [caption, setCaption] = useState('');
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [activeStoryCount, setActiveStoryCount] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  // Fetch current user's active stories count
  const checkActiveStories = async () => {
    try {
      const { data } = await getActiveStories();
      const myGroup = (data || []).find(g => g?.user?._id === user?._id);
      setActiveStoryCount(myGroup?.stories?.length || 0);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user?._id) {
      checkActiveStories();
    }
  }, [user?._id]);

  // Client-side image compression to prevent 413 Payload Too Large and load fast
  const processImageFile = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }

    setError('');
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1920;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          if (width / height > MAX_WIDTH / MAX_HEIGHT) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          } else {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setImage(compressedDataUrl);
        setPreview(compressedDataUrl);
      };
      img.onerror = () => {
        setError('Failed to process image.');
      };
      img.src = e.target.result;
    };
    reader.onerror = () => {
      setError('Failed to read file.');
    };
    reader.readAsDataURL(file);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!image) {
      setError('Please select an image for your story');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      await createStory({ image, caption });
      setSuccess(true);
      setActiveStoryCount(prev => prev + 1);
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating story');
      setLoading(false);
    }
  };

  const handleAddAnother = () => {
    setImage('');
    setPreview('');
    setCaption('');
    setSuccess(false);
    setLoading(false);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 bg-base-100 z-[110] flex flex-col md:flex-row select-none">
      {/* Top right close button */}
      <div className="absolute top-4 right-4 z-[112]">
        <button 
          onClick={() => navigate('/')} 
          className="btn btn-circle btn-ghost bg-black/40 text-white hover:bg-black/60 shadow-md backdrop-blur-md"
          title="Close"
        >
          <X size={22} />
        </button>
      </div>

      {/* Success Modal Overlay */}
      {success && (
        <div className="fixed inset-0 bg-black/80 z-[120] flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-base-100 w-full max-w-sm rounded-3xl p-6 text-center shadow-2xl flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-success/15 text-success flex items-center justify-center mb-3">
              <CheckCircle size={36} />
            </div>

            <h3 className="font-extrabold text-xl mb-1">Story Published!</h3>
            <p className="text-xs text-base-content/60 mb-6">
              Your story is now active for 24 hours. You now have {activeStoryCount} active {activeStoryCount === 1 ? 'story' : 'stories'}.
            </p>

            <div className="flex flex-col gap-2.5 w-full">
              <button 
                onClick={handleAddAnother} 
                className="btn btn-primary rounded-2xl gap-2 font-bold shadow-md shadow-primary/25"
              >
                <Plus size={18} /> Add Another Story
              </button>

              <button 
                onClick={() => navigate('/')} 
                className="btn btn-outline rounded-2xl font-semibold"
              >
                Done / Back to Feed
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview & Drag/Drop Area */}
      <div 
        className={`flex-1 bg-neutral flex items-center justify-center relative overflow-hidden h-full cursor-pointer transition-colors ${
          isDragging ? 'bg-neutral-focus border-4 border-dashed border-primary' : ''
        }`}
        onClick={() => !preview && fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        {preview ? (
          <>
            <img src={preview} alt="Story Preview" className="w-full h-full object-contain" />
            {caption && (
              <div className="absolute bottom-20 left-0 right-0 text-center px-4 pointer-events-none">
                <span className="bg-black/70 backdrop-blur-md text-white px-5 py-2.5 rounded-2xl inline-block break-words max-w-sm text-sm shadow-xl border border-white/10 font-medium">
                  {caption}
                </span>
              </div>
            )}
            
            {/* Change image floating button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="absolute top-4 left-4 btn btn-sm rounded-full bg-black/60 text-white border border-white/20 hover:bg-black/80 gap-1.5 backdrop-blur-md shadow-lg"
            >
              <RefreshCw size={15} /> Change Photo
            </button>
          </>
        ) : (
          <div className="text-neutral-content/60 flex flex-col items-center p-6 text-center">
            <div className="w-20 h-20 rounded-3xl bg-neutral-content/10 flex items-center justify-center mb-4">
              <ImageIcon size={40} className="text-primary" />
            </div>
            <p className="font-bold text-base text-neutral-content mb-1">Upload a photo for your story</p>
            <p className="text-xs text-neutral-content/60 max-w-xs mb-4">
              Click anywhere or drag and drop an image here (PNG, JPG, WebP)
            </p>
            <span className="btn btn-sm btn-primary rounded-full px-5 gap-1.5 shadow-md">
              <Upload size={15} /> Choose Photo
            </span>
          </div>
        )}
      </div>

      {/* Controls Area */}
      <div className="w-full md:w-96 bg-base-100 p-6 flex flex-col justify-between md:h-full border-l border-base-200">
        <div className="space-y-4 pt-6 md:pt-4">
          <div>
            <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
              <span>Create Story</span>
              <Sparkles size={20} className="text-primary" />
            </h2>
            <p className="text-xs text-base-content/60 mt-0.5">
              Share a moment that disappears in 24 hours.
            </p>
          </div>

          {/* Active Stories Counter Banner */}
          {activeStoryCount > 0 && (
            <div className="bg-primary/10 border border-primary/20 rounded-2xl p-3 flex items-center gap-2.5 text-xs text-primary font-medium">
              <span className="badge badge-primary badge-xs scale-95 shrink-0">●</span>
              <span>
                You currently have <strong>{activeStoryCount}</strong> active {activeStoryCount === 1 ? 'story' : 'stories'}. This will be added to your sequence.
              </span>
            </div>
          )}

          {error && <div className="alert alert-error py-2.5 text-xs shadow-sm">{error}</div>}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef}
              onChange={handleImageChange} 
              className="hidden"
            />

            <div className="form-control">
              <label className="label py-1">
                <span className="label-text font-semibold text-xs text-base-content/70">Caption (Optional)</span>
                <span className="label-text-alt text-[11px] text-base-content/40">{caption.length}/100</span>
              </label>
              <textarea 
                placeholder="Add a caption to your story..." 
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="textarea textarea-bordered h-24 w-full rounded-2xl resize-none text-sm"
                maxLength={100}
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary w-full rounded-2xl shadow-lg shadow-primary/25 gap-2 font-bold mt-2"
              disabled={!image || loading}
            >
              {loading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                <>
                  <Plus size={18} />
                  <span>{activeStoryCount > 0 ? 'Add to Your Stories' : 'Share Story'}</span>
                </>
              )}
            </button>
          </form>
        </div>

        <div className="text-[11px] text-base-content/40 text-center py-2 border-t border-base-200 mt-4">
          Visible to you and your followers for 24 hours.
        </div>
      </div>
    </div>
  );
};

export default CreateStory;
