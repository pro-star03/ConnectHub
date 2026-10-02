import { useState, useEffect, useContext } from 'react';
import { X, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { deleteStory, viewStory } from '../services/storyService';
import { formatTimeAgo } from '../utils/dateFormatter';

const StoryViewer = ({ group, onClose, onDelete }) => {
  const { stories } = group;
  
  // Find first unviewed story
  const firstUnviewed = stories.findIndex(s => !s.isViewed);
  const initialIndex = firstUnviewed === -1 ? 0 : firstUnviewed;

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    // Record view for current story
    const currentStory = stories[currentIndex];
    if (currentStory && !currentStory.isViewed && currentStory.user._id !== user._id) {
      viewStory(currentStory._id).catch(console.error);
      currentStory.isViewed = true; // Optimistic update
    }

    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + 2; // 5 seconds per story (100 / 50 * 100ms = 5s)
      });
    }, 100);
    return () => clearInterval(interval);
  }, [currentIndex]);

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const currentStory = stories[currentIndex];
  const isOwnStory = currentStory.user._id === user._id;

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this story?')) {
      try {
        await deleteStory(currentStory._id);
        onDelete();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-[110] flex items-center justify-center">
      {/* Progress Bars */}
      <div className="absolute top-4 left-0 right-0 px-4 flex gap-1 z-[111]">
        {stories.map((story, idx) => (
          <div key={story._id} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white transition-all duration-100 ease-linear"
              style={{ 
                width: idx === currentIndex ? `${progress}%` : (idx < currentIndex ? '100%' : '0%') 
              }}
            ></div>
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="absolute top-8 left-0 right-0 px-4 flex justify-between items-center z-[111] text-white">
        <div className="flex items-center gap-3">
          <img 
            src={currentStory.user.profilePicture || `https://ui-avatars.com/api/?name=${currentStory.user.name}&background=random`}
            alt={currentStory.user.name}
            className="w-10 h-10 rounded-full object-cover border border-white/30"
          />
          <div>
            <p className="font-bold text-sm drop-shadow-md">{currentStory.user.username}</p>
            <p className="text-xs text-white/80 drop-shadow-md">{formatTimeAgo(currentStory.createdAt)}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {isOwnStory && (
            <button onClick={handleDelete} className="btn btn-ghost btn-circle btn-sm text-white">
              <Trash2 size={20} />
            </button>
          )}
          <button onClick={onClose} className="btn btn-ghost btn-circle btn-sm text-white">
            <X size={24} />
          </button>
        </div>
      </div>

      {/* Navigation areas */}
      <div className="absolute inset-y-0 left-0 w-1/3 z-[110]" onClick={handlePrev}></div>
      <div className="absolute inset-y-0 right-0 w-2/3 z-[110]" onClick={handleNext}></div>

      {/* Desktop Navigation Buttons */}
      <div className="absolute inset-y-0 left-4 hidden md:flex items-center z-[111] pointer-events-none">
        {currentIndex > 0 && (
          <button onClick={(e) => { e.stopPropagation(); handlePrev(); }} className="btn btn-circle pointer-events-auto bg-white/20 border-none hover:bg-white/40 text-white">
            <ChevronLeft size={24} />
          </button>
        )}
      </div>
      <div className="absolute inset-y-0 right-4 hidden md:flex items-center z-[111] pointer-events-none">
        {currentIndex < stories.length - 1 && (
          <button onClick={(e) => { e.stopPropagation(); handleNext(); }} className="btn btn-circle pointer-events-auto bg-white/20 border-none hover:bg-white/40 text-white">
            <ChevronRight size={24} />
          </button>
        )}
      </div>

      {/* Story Content */}
      <div className="w-full max-w-lg h-[90vh] md:h-[85vh] md:rounded-xl overflow-hidden relative bg-neutral flex items-center justify-center">
        <img 
          src={currentStory.image} 
          alt="Story" 
          className="w-full h-full object-contain md:object-cover"
        />
        {currentStory.caption && (
          <div className="absolute bottom-10 left-0 right-0 text-center px-6 pointer-events-none">
            <span className="bg-black/60 text-white px-4 py-2 rounded-lg text-sm inline-block">
              {currentStory.caption}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoryViewer;
