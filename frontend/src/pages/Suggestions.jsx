import { useState, useEffect, useContext } from 'react';
import { getSuggestedUsers, followUser, unfollowUser } from '../services/userService';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Suggestions = () => {
  const { user: currentUser, followingIds, addFollowing, removeFollowing } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const suggRes = await getSuggestedUsers();
        // Do not show the currently logged-in user
        setUsers((suggRes.data || []).filter(u => u._id !== currentUser._id));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    if (currentUser?._id) fetchData();
  }, [currentUser]);

  const handleFollowToggle = async (userToToggle) => {
    try {
      const isFollowing = followingIds?.has(userToToggle._id);
      
      if (isFollowing) {
        await unfollowUser(userToToggle._id);
        if (removeFollowing) removeFollowing(userToToggle._id);
      } else {
        await followUser(userToToggle._id);
        if (addFollowing) addFollowing(userToToggle._id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="pb-20 md:pb-4 pt-4 sm:pt-6 max-w-xl mx-auto px-4">
      <h1 className="text-2xl font-bold mb-6">Suggested Users</h1>
      
      {loading ? (
        <div className="flex justify-center p-8">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : users.length === 0 ? (
        <div className="text-center p-12 text-base-content/50">
          <p className="text-xl font-medium mb-2">No suggestions right now</p>
          <p>You might be following everyone!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {users.map(u => {
            const isFollowing = followingIds.has(u._id);
            return (
              <div key={u._id} className="flex items-center justify-between p-4 bg-base-100 border border-base-200 rounded-2xl shadow-sm hover:border-base-300 transition-colors">
                <Link to={`/profile/${u._id}`} className="flex items-center gap-4 flex-1 overflow-hidden">
                  <div className="avatar">
                    {u.profilePicture ? (
                      <div className="w-12 h-12 rounded-full">
                        <img src={u.profilePicture} alt="Profile" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-neutral text-neutral-content flex items-center justify-center">
                        <span className="text-lg">{u.name.charAt(0).toUpperCase()}</span>
                      </div>
                    )}
                  </div>
                  <div className="truncate">
                    <p className="font-semibold text-base leading-tight hover:underline truncate">{u.name}</p>
                    <p className="text-sm text-base-content/60 truncate">@{u.username}</p>
                  </div>
                </Link>
                <button 
                  onClick={() => handleFollowToggle(u)}
                  className={`btn btn-sm rounded-full px-6 ml-4 ${isFollowing ? 'btn-outline' : 'btn-primary'}`}
                >
                  {isFollowing ? 'Unfollow' : 'Follow'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Suggestions;
