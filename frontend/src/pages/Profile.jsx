import { useState, useEffect, useContext, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getUserProfile, updateUserProfile, followUser, unfollowUser } from '../services/userService';
import { getPosts } from '../services/postService';
import { AuthContext } from '../context/AuthContext';
import PostCard from '../components/PostCard';
import { Users, Edit3, Camera, MapPin, Link as LinkIcon, Calendar, Settings as SettingsIcon } from 'lucide-react';
import { imageToBase64 } from '../utils/imageToBase64';

const Profile = () => {
  const { id } = useParams();
  const { user: currentUser, loginUser, addFollowing, removeFollowing } = useContext(AuthContext); // Note: we can't easily re-trigger AuthContext without setting it directly. Let's just update local storage if needed.
  const profileId = id || currentUser?._id;
  
  const [profile, setProfile] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  // Edit State
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editImage, setEditImage] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [profileRes, postsRes] = await Promise.all([
          getUserProfile(profileId),
          getPosts()
        ]);
        
        setProfile(profileRes.data);
        setIsFollowing(profileRes.data.followers?.some(f => (typeof f === 'object' ? f._id : f) === currentUser?._id));
        setEditName(profileRes.data.name || '');
        setEditBio(profileRes.data.bio || '');
        
        const filteredPosts = postsRes.data.filter(p => p.user?._id === profileId || p.user === profileId);
        setUserPosts(filteredPosts);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    if (profileId) fetchData();
  }, [profileId, currentUser]);

  const handleFollowToggle = async () => {
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await unfollowUser(profileId);
        if (removeFollowing) removeFollowing(profileId);
        setProfile({ 
          ...profile, 
          followers: profile.followers.filter(f => (typeof f === 'object' ? f._id : f) !== currentUser._id) 
        });
      } else {
        await followUser(profileId);
        if (addFollowing) addFollowing(profileId);
        setProfile({ 
          ...profile, 
          followers: [...(profile.followers || []), { _id: currentUser._id, name: currentUser.name, username: currentUser.username, profilePicture: currentUser.profilePicture }] 
        });
      }
      setIsFollowing(!isFollowing);
    } catch (err) {
      console.error(err);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Image must be less than 2MB');
        return;
      }
      try {
        const base64 = await imageToBase64(file);
        setEditImage(base64);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      const { data } = await updateUserProfile(currentUser._id, {
        name: editName,
        bio: editBio,
        profilePicture: editImage || profile.profilePicture
      });
      setProfile({ ...profile, ...data });
      document.getElementById('edit_profile_modal').close();
      
      // Update local storage so navbar updates
      const lsUser = JSON.parse(localStorage.getItem('user'));
      localStorage.setItem('user', JSON.stringify({ ...lsUser, name: data.name, profilePicture: data.profilePicture }));
      
    } catch (err) {
      console.error(err);
      alert('Failed to update profile');
    } finally {
      setEditLoading(false);
    }
  };

  const isOwnProfile = profileId === currentUser?._id;

  if (loading) return <div className="flex justify-center p-8"><span className="loading loading-spinner text-primary loading-lg"></span></div>;
  if (!profile) return <div className="p-8 text-center text-xl">User not found</div>;

  return (
    <div className="pb-20 md:pb-4 max-w-xl mx-auto min-h-screen">
      {/* Profile Header */}
      <div className="bg-base-100 border-b border-base-200">
        <div className="h-32 bg-gradient-to-r from-primary/30 to-secondary/30"></div>
        <div className="px-4 pb-4 relative">
          <div className="flex justify-between items-end -mt-12 mb-4">
            <div className="avatar rounded-full bg-base-100 p-1">
              {profile.profilePicture ? (
                <div className="w-24 h-24 rounded-full">
                  <img src={profile.profilePicture} alt="Profile" className="object-cover" />
                </div>
              ) : (
                <div className="bg-neutral text-neutral-content rounded-full w-24 h-24 flex items-center justify-center">
                  <span className="text-3xl font-bold">{profile.name?.charAt(0).toUpperCase()}</span>
                </div>
              )}
            </div>
            
            <div className="flex gap-2">
              {!isOwnProfile && (
                <>
                  <Link to={`/messages/${profile._id}`} className="btn btn-sm rounded-full btn-outline">Message</Link>
                  <button 
                    onClick={handleFollowToggle}
                    className={`btn btn-sm rounded-full px-6 ${isFollowing ? 'btn-outline' : 'btn-primary'}`}
                    disabled={followLoading}
                  >
                    {followLoading ? <span className="loading loading-spinner loading-xs"></span> : (isFollowing ? 'Following' : 'Follow')}
                  </button>
                </>
              )}
              {isOwnProfile && (
                <button 
                  className="btn btn-sm btn-outline rounded-full px-4 gap-2"
                  onClick={() => document.getElementById('edit_profile_modal').showModal()}
                >
                  <Edit3 size={16} /> Edit Profile
                </button>
              )}
            </div>
          </div>
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold">{profile.name}</h1>
              <p className="text-base-content/60">@{profile.username}</p>
            </div>
            {isOwnProfile && (
              <Link to="/settings" className="btn btn-ghost btn-circle">
                <SettingsIcon size={24} />
              </Link>
            )}
          </div>

          {profile.bio && (
            <p className="mt-3 text-sm">{profile.bio}</p>
          )}
          
          <div className="mt-4 flex gap-4 text-sm text-base-content/70">
            <div 
              className="flex items-center gap-1 cursor-pointer hover:underline"
              onClick={() => document.getElementById('following_modal').showModal()}
            >
              <span className="font-bold text-base-content">{profile.following?.length || 0}</span> Following
            </div>
            <div 
              className="flex items-center gap-1 cursor-pointer hover:underline"
              onClick={() => document.getElementById('followers_modal').showModal()}
            >
              <span className="font-bold text-base-content">{profile.followers?.length || 0}</span> Followers
            </div>
            <div className="flex items-center gap-1"><span className="font-bold text-base-content">{userPosts.length}</span> Posts</div>
          </div>
        </div>
      </div>
      
      {/* User Posts */}
      <div className="mt-4">
        <h2 className="px-4 font-bold text-lg mb-2">Posts</h2>
        {userPosts.length === 0 ? (
          <div className="text-center p-12 text-base-content/50">
            <p className="text-xl font-medium mb-2">No posts yet</p>
          </div>
        ) : (
          userPosts.map(post => (
            <PostCard key={post._id} post={post} />
          ))
        )}
      </div>

      {/* Followers Modal */}
      <dialog id="followers_modal" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">Followers</h3>
          <div className="flex flex-col gap-4 max-h-96 overflow-y-auto">
            {profile.followers?.length === 0 ? (
              <p className="text-center text-base-content/60 py-4">No followers yet.</p>
            ) : (
              profile.followers?.map(user => (
                <Link 
                  to={`/profile/${user._id}`} 
                  key={user._id} 
                  className="flex items-center gap-3 hover:bg-base-200 p-2 rounded-lg"
                  onClick={() => document.getElementById('followers_modal').close()}
                >
                  <div className="avatar">
                    <div className="w-10 rounded-full bg-neutral text-neutral-content flex items-center justify-center">
                      {user.profilePicture ? (
                        <img src={user.profilePicture} alt="Profile" />
                      ) : (
                        <span className="text-lg">{user.name?.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="font-bold">{user.name}</p>
                    <p className="text-sm text-base-content/60">@{user.username}</p>
                  </div>
                </Link>
              ))
            )}
          </div>
          <div className="modal-action">
            <form method="dialog"><button className="btn">Close</button></form>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop"><button>close</button></form>
      </dialog>

      {/* Following Modal */}
      <dialog id="following_modal" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">Following</h3>
          <div className="flex flex-col gap-4 max-h-96 overflow-y-auto">
            {profile.following?.length === 0 ? (
              <p className="text-center text-base-content/60 py-4">Not following anyone yet.</p>
            ) : (
              profile.following?.map(user => (
                <Link 
                  to={`/profile/${user._id}`} 
                  key={user._id} 
                  className="flex items-center gap-3 hover:bg-base-200 p-2 rounded-lg"
                  onClick={() => document.getElementById('following_modal').close()}
                >
                  <div className="avatar">
                    <div className="w-10 rounded-full bg-neutral text-neutral-content flex items-center justify-center">
                      {user.profilePicture ? (
                        <img src={user.profilePicture} alt="Profile" />
                      ) : (
                        <span className="text-lg">{user.name?.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="font-bold">{user.name}</p>
                    <p className="text-sm text-base-content/60">@{user.username}</p>
                  </div>
                </Link>
              ))
            )}
          </div>
          <div className="modal-action">
            <form method="dialog"><button className="btn">Close</button></form>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop"><button>close</button></form>
      </dialog>

      {/* Edit Profile Modal */}
      {isOwnProfile && (
        <dialog id="edit_profile_modal" className="modal modal-bottom sm:modal-middle">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Edit Profile</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="flex justify-center mb-4">
                <div className="relative cursor-pointer group" onClick={() => fileInputRef.current?.click()}>
                  <div className="avatar">
                    <div className="w-24 h-24 rounded-full">
                      <img src={editImage || profile.profilePicture || `https://ui-avatars.com/api/?name=${profile.name}`} alt="Preview" className="object-cover" />
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="text-white" size={24} />
                  </div>
                </div>
                <input type="file" className="hidden" ref={fileInputRef} accept="image/*" onChange={handleImageChange} />
              </div>
              
              <div className="form-control">
                <label className="label"><span className="label-text">Name</span></label>
                <input type="text" className="input input-bordered w-full" value={editName} onChange={(e) => setEditName(e.target.value)} required />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Bio</span></label>
                <textarea className="textarea textarea-bordered h-24" value={editBio} onChange={(e) => setEditBio(e.target.value)}></textarea>
              </div>
              
              <div className="modal-action">
                <button type="button" className="btn btn-ghost" onClick={() => document.getElementById('edit_profile_modal').close()}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={editLoading}>
                  {editLoading ? <span className="loading loading-spinner"></span> : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button>close</button>
          </form>
        </dialog>
      )}
    </div>
  );
};

export default Profile;