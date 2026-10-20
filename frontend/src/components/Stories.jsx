import { useState, useEffect, useCallback, useContext } from 'react';
import { getActiveStories } from '../services/storyService';
import { AuthContext } from '../context/AuthContext';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StoryViewer from './StoryViewer';

const Stories = () => {
  const [storyGroups, setStoryGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [selectedGroup, setSelectedGroup] = useState(null);

  const fetchStories = useCallback(async () => {
    try {
      const { data } = await getActiveStories();
      setStoryGroups(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  const validGroups = storyGroups.filter(g => g?.user?._id && Array.isArray(g.stories) && g.stories.length > 0);
  const userGroup = validGroups.find(g => g.user._id === user?._id);
  const otherGroups = validGroups.filter(g => g.user._id !== user?._id);

  if (loading) {
    return (
      <div className="flex gap-4 p-4 overflow-x-auto">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-1 min-w-[70px]">
            <div className="w-16 h-16 rounded-full skeleton"></div>
            <div className="h-3 w-12 skeleton mt-1"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="border-b border-base-200 bg-base-100">
      <div className="flex gap-4 p-4 overflow-x-auto no-scrollbar">
        {/* Current User Story or Create */}
        <div 
          className="flex flex-col items-center gap-1 min-w-[70px] cursor-pointer relative"
          onClick={() => userGroup ? setSelectedGroup(userGroup) : navigate('/create-story')}
        >
          <div className={`w-16 h-16 rounded-full p-[2px] transition-transform hover:scale-105 ${userGroup && !userGroup.allViewed ? 'bg-gradient-to-tr from-yellow-400 to-fuchsia-600' : 'bg-base-300'}`}>
            <img 
              src={userGroup?.stories[0]?.image || user?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=random`} 
              alt="Your Story" 
              className="w-full h-full rounded-full border-2 border-base-100 object-cover"
            />
            {!userGroup && (
              <div className="absolute bottom-5 right-0 bg-primary text-primary-content rounded-full p-0.5 border-2 border-base-100 shadow-sm">
                <Plus size={16} />
              </div>
            )}
          </div>
          <span className="text-xs truncate w-16 text-center font-medium">Your Story</span>
        </div>

        {/* Other Users' Stories */}
        {otherGroups.map((group) => (
          <div 
            key={group.user._id} 
            className="flex flex-col items-center gap-1 min-w-[70px] cursor-pointer"
            onClick={() => setSelectedGroup(group)}
          >
            <div className={`w-16 h-16 rounded-full p-[2px] transition-transform hover:scale-105 ${group.allViewed ? 'bg-base-300' : 'bg-gradient-to-tr from-yellow-400 to-fuchsia-600'}`}>
              <img 
                src={group.stories[0]?.image || group.user?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(group.user?.name || 'User')}&background=random`} 
                alt={group.user?.name || 'User'} 
                className="w-full h-full rounded-full border-2 border-base-100 object-cover"
              />
            </div>
            <span className="text-xs truncate w-16 text-center text-base-content/80 font-medium">
              {group.user?.username || 'User'}
            </span>
          </div>
        ))}
      </div>

      {selectedGroup && (
        <StoryViewer 
          group={selectedGroup} 
          onClose={() => {
            fetchStories();
            setSelectedGroup(null);
          }}
          onDelete={() => {
            fetchStories();
            setSelectedGroup(null);
          }}
        />
      )}
    </div>
  );
};

export default Stories;
