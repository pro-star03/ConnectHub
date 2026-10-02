import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createStory } from '../services/storyService';
import { X, Image as ImageIcon } from 'lucide-react';

const CreateStory = () => {
  const [image, setImage] = useState('');
  const [caption, setCaption] = useState('');
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) {
      setError('Please select an image for your story');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      await createStory({ image, caption });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating story');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-base-100 z-[110] flex flex-col md:flex-row">
      <div className="absolute top-4 right-4 z-[111]">
        <button onClick={() => navigate(-1)} className="btn btn-circle btn-ghost">
          <X size={24} />
        </button>
      </div>

      {/* Preview Area */}
      <div className="flex-1 bg-neutral flex items-center justify-center relative overflow-hidden h-full">
        {preview ? (
          <>
            <img src={preview} alt="Preview" className="w-full h-full object-contain" />
            {caption && (
              <div className="absolute bottom-20 left-0 right-0 text-center px-4">
                <span className="bg-black/60 text-white px-4 py-2 rounded-lg inline-block break-words max-w-full">
                  {caption}
                </span>
              </div>
            )}
          </>
        ) : (
          <div className="text-neutral-content/50 flex flex-col items-center">
            <ImageIcon size={64} className="mb-4 opacity-50" />
            <p>Select an image to preview</p>
          </div>
        )}
      </div>

      {/* Controls Area */}
      <div className="w-full md:w-80 bg-base-100 p-6 flex flex-col gap-6 md:h-full justify-end md:justify-start">
        <h2 className="text-2xl font-bold hidden md:block mt-8">Create Story</h2>
        
        {error && <div className="alert alert-error py-2 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 flex-1 justify-end md:justify-start pb-safe">
          <div className="form-control">
            <label className="label"><span className="label-text font-medium">Image</span></label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageChange} 
              className="file-input file-input-bordered file-input-primary w-full"
            />
          </div>

          <div className="form-control">
            <label className="label"><span className="label-text font-medium">Caption (Optional)</span></label>
            <input 
              type="text" 
              placeholder="Add a caption..." 
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="input input-bordered w-full"
              maxLength={100}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary w-full mt-4"
            disabled={!image || loading}
          >
            {loading ? <span className="loading loading-spinner"></span> : 'Share Story'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateStory;
