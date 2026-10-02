import { useState, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { createPost } from '../services/postService';
import { imageToBase64 } from '../utils/imageToBase64';
import { Image, Send, X } from 'lucide-react';

const CreatePostBox = ({ onPostCreated }) => {
  const { user } = useContext(AuthContext);
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !image) return;
    
    setLoading(true);
    try {
      const { data } = await createPost({ content, image });
      setContent('');
      setImage(null);
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
    <div className="card bg-base-100 border border-base-200 rounded-2xl shadow-sm mb-6">
      <div className="card-body p-4 sm:p-5">
        <form onSubmit={handleSubmit}>
          <div className="flex gap-3">
            <div className="avatar placeholder hidden sm:flex">
              {user?.profilePicture ? (
                <div className="w-10 h-10 rounded-full">
                  <img src={user.profilePicture} alt="Profile" />
                </div>
              ) : (
                <div className="bg-neutral text-neutral-content rounded-full w-10 h-10 flex items-center justify-center">
                  <span>{user?.name?.charAt(0).toUpperCase()}</span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <textarea
                className="textarea textarea-bordered w-full text-base resize-none focus:outline-none focus:border-primary transition-colors"
                placeholder="What's on your mind?"
                rows="3"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              ></textarea>
              
              {image && (
                <div className="relative mt-2 inline-block">
                  <img src={image} alt="Preview" className="max-h-60 rounded-xl object-cover border border-base-200" />
                  <button 
                    type="button" 
                    className="btn btn-circle btn-xs btn-error absolute top-2 right-2"
                    onClick={() => {
                      setImage(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-between items-center mt-3 pt-3 border-t border-base-200">
            <div className="flex gap-2">
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
                title="Add image"
                onClick={() => fileInputRef.current?.click()}
              >
                <Image size={18} />
              </button>
            </div>
            <button 
              type="submit" 
              className="btn btn-primary btn-sm rounded-full px-6"
              disabled={(!content.trim() && !image) || loading}
            >
              {loading ? <span className="loading loading-spinner loading-xs"></span> : (
                <>Post <Send size={14} /></>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostBox;
