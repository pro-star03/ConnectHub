import { useState, useEffect, useContext } from 'react';
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

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const { data } = await getActiveStories();
      setStoryGroups(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const userGroup = storyGroups.find(g => g.user._id === user?._id);
  const otherGroups = storyGroups.filter(g => g.user._id !== user?._id);

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
        <div className="flex flex-col items-center gap-1 min-w-[70px] cursor-pointer relative"
             onClick={() => userGroup ? setSelectedGroup(userGroup) : navigate('/create-story')}>
          <div className={`w-16 h-16 rounded-full p-[2px] ${userGroup && !userGroup.allViewed ? 'bg-gradient-to-tr from-yellow-400 to-fuchsia-600' : 'bg-base-300'}`}>
            <img 
              src={userGroup ? userGroup.stories[0].image : (user?.profilePicture || `https://ui-avatars.com/api/?name=${user?.name}&background=random`)} 
              alt="Your Story" 
              className="w-full h-full rounded-full border-2 border-base-100 object-cover"
            />
            {!userGroup && (
              <div className="absolute bottom-5 right-0 bg-primary text-primary-content rounded-full p-0.5 border-2 border-base-100">
                <Plus size={16} />
              </div>
            )}
          </div>
          <span className="text-xs truncate w-16 text-center">Your Story</span>
        </div>

        {/* Other Users' Stories */}
        {otherGroups.map((group) => (
          <div key={group.user._id} className="flex flex-col items-center gap-1 min-w-[70px] cursor-pointer"
               onClick={() => setSelectedGroup(group)}>
            <div className={`w-16 h-16 rounded-full p-[2px] ${group.allViewed ? 'bg-base-300' : 'bg-gradient-to-tr from-yellow-400 to-fuchsia-600'}`}>
              <img 
                src={group.stories[0].image || group.user.profilePicture || `https://ui-avatars.com/api/?name=${group.user.name}&background=random`} 
                alt={group.user.name} 
                className="w-full h-full rounded-full border-2 border-base-100 object-cover"
              />
            </div>
            <span className="text-xs truncate w-16 text-center text-base-content/80">{group.user.username}</span>
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
