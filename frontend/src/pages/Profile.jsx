import { useState, useEffect, useContext, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getUserProfile, updateUserProfile, followUser, unfollowUser } from '../services/userService';
import { getPosts, getSavedPosts } from '../services/postService';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import PostCard from '../components/PostCard';
import { Edit3, Camera, Settings as SettingsIcon, MessageSquare, Bookmark, Image as ImageIcon, FileText, BadgeCheck } from 'lucide-react';
import { imageToBase64 } from '../utils/imageToBase64';

const Profile = () => {
  const { id } = useParams();
  const { user: currentUser, updateUser, addFollowing, removeFollowing } = useContext(AuthContext);
  const { isUserOnline } = useContext(SocketContext);
  const profileId = id || currentUser?._id;
  
  const [profile, setProfile] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('posts'); // 'posts' | 'media' | 'saved'
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  // Edit State
  const [editName, setEditName] = useState('');
  const [editHeadline, setEditHeadline] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editImage, setEditImage] = useState(null);
  const [editCover, setEditCover] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const fileInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const isOwnProfile = profileId?.toString() === currentUser?._id?.toString();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const promises = [
          getUserProfile(profileId),
          getPosts()
        ];
        if (isOwnProfile) {
          promises.push(getSavedPosts().catch(() => ({ data: [] })));
        }

        const [profileRes, postsRes, savedRes] = await Promise.all(promises);
        
        setProfile(profileRes.data);
        const myId = currentUser?._id?.toString();
        setIsFollowing(
          (profileRes.data.followers || []).some(f => (typeof f === 'object' ? f._id : f)?.toString() === myId)
        );
        setEditName(profileRes.data.name || '');
        setEditHeadline(profileRes.data.headline || '');
        setEditBio(profileRes.data.bio || '');
        
        const filteredPosts = (postsRes.data || []).filter(
          p => (typeof p.user === 'object' ? p.user?._id : p.user)?.toString() === profileId?.toString()
        );
        setUserPosts(filteredPosts);

        if (savedRes && savedRes.data) {
          setSavedPosts(savedRes.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    if (profileId) fetchData();
  }, [profileId, currentUser?._id, isOwnProfile]);

  const handleFollowToggle = async () => {
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await unfollowUser(profileId);
        removeFollowing(profileId);
        setProfile(prev => ({ 
          ...prev, 
          followers: (prev.followers || []).filter(f => (typeof f === 'object' ? f._id : f)?.toString() !== currentUser._id?.toString()) 
        }));
      } else {
        await followUser(profileId);
        addFollowing(profileId);
        setProfile(prev => ({ 
          ...prev, 
          followers: [...(prev.followers || []), { 
            _id: currentUser._id, 
            name: currentUser.name, 
            username: currentUser.username, 
            profilePicture: currentUser.profilePicture 
          }] 
        }));
      }
      setIsFollowing(!isFollowing);
    } catch (err) {
      console.error(err);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image must be less than 5MB');
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

  const handleCoverChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Cover image must be less than 5MB');
        return;
      }
      try {
        const base64 = await imageToBase64(file);
        setEditCover(base64);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      const updates = {
        name: editName.trim(),
        headline: editHeadline.trim(),
        bio: editBio.trim(),
        profilePicture: editImage || profile.profilePicture,
        coverPhoto: editCover || profile.coverPhoto
      };

      const { data } = await updateUserProfile(currentUser._id, updates);
      setProfile(prev => ({ ...prev, ...data }));
      updateUser(data);
      document.getElementById('edit_profile_modal')?.close();
    } catch (err) {
      console.error(err);
      alert('Failed to update profile');
    } finally {
      setEditLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <span className="loading loading-spinner text-primary loading-lg"></span>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-12 text-center">
        <p className="text-xl font-bold mb-2">User not found</p>
        <Link to="/" className="btn btn-primary btn-sm rounded-full">Back to Home</Link>
      </div>
    );
  }

  const mediaPosts = userPosts.filter(p => !!p.image);
  const isOnline = isUserOnline(profile._id);

  return (
    <div className="pb-20 md:pb-6 max-w-xl mx-auto min-h-screen">
      {/* Profile Card Container */}
      <div className="bg-base-100 border border-base-200/90 rounded-3xl shadow-sm overflow-hidden mb-6">
        {/* Banner Cover */}
        <div className="h-36 sm:h-44 w-full relative bg-gradient-to-r from-primary/30 via-secondary/20 to-accent/30">
          {profile.coverPhoto && (
            <img src={profile.coverPhoto} alt="Cover" className="w-full h-full object-cover" />
          )}
        </div>

        {/* Profile Info Bar */}
        <div className="px-5 pb-5 relative">
          <div className="flex justify-between items-end -mt-14 mb-4">
            {/* Avatar */}
            <div className="relative">
              <div className="avatar rounded-full bg-base-100 p-1.5 shadow-lg">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden">
                  <img 
                    src={profile.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=random`} 
                    alt={profile.name} 
                    className="object-cover w-full h-full" 
                  />
                </div>
              </div>
              {isOnline && (
                <span className="absolute bottom-2 right-2 w-4 h-4 bg-success rounded-full border-2 border-base-100 online-pulse"></span>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {!isOwnProfile ? (
                <>
                  <Link 
                    to={`/messages/${profile._id}`} 
                    className="btn btn-sm rounded-full btn-outline gap-1.5"
                  >
                    <MessageSquare size={16} /> Message
                  </Link>
                  <button 
                    onClick={handleFollowToggle}
                    className={`btn btn-sm rounded-full px-5 ${isFollowing ? 'btn-outline' : 'btn-primary'}`}
                    disabled={followLoading}
                  >
                    {followLoading ? <span className="loading loading-spinner loading-xs"></span> : (isFollowing ? 'Following' : 'Follow')}
                  </button>
                </>
              ) : (
                <>
                  <button 
                    className="btn btn-sm btn-outline rounded-full px-4 gap-1.5"
                    onClick={() => document.getElementById('edit_profile_modal')?.showModal()}
                  >
                    <Edit3 size={15} /> Edit Profile
                  </button>
                  <Link to="/settings" className="btn btn-ghost btn-circle btn-sm" title="Settings">
                    <SettingsIcon size={20} />
                  </Link>
                </>
              )}
            </div>
          </div>
          
          {/* Names & Headline */}
          <div>
            <h1 className="text-2xl font-bold leading-tight flex items-center gap-1.5 flex-wrap">
              <span>{profile.name}</span>
              {profile.isVerified && (
                <BadgeCheck className="w-5 h-5 text-primary fill-primary/20 shrink-0" title="Verified Creator" />
              )}
              {(profile.role === 'admin' || profile.isAdmin) && (
                <span className="badge badge-primary badge-xs">Admin</span>
              )}
            </h1>
            <p className="text-sm text-base-content/60">@{profile.username}</p>
            {profile.headline && (
              <p className="text-xs sm:text-sm text-primary font-semibold mt-1">{profile.headline}</p>
            )}
          </div>

          {/* Bio */}
          {profile.bio && (
            <p className="mt-3 text-sm text-base-content/85 leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
          )}
          
          {/* Counters */}
          <div className="mt-4 pt-3 border-t border-base-200/80 flex gap-6 text-sm text-base-content/70">
            <div 
              className="flex items-center gap-1.5 cursor-pointer hover:text-primary transition-colors"
              onClick={() => document.getElementById('following_modal')?.showModal()}
            >
              <strong className="text-base-content font-bold">{profile.following?.length || 0}</strong> Following
            </div>
            <div 
              className="flex items-center gap-1.5 cursor-pointer hover:text-primary transition-colors"
              onClick={() => document.getElementById('followers_modal')?.showModal()}
            >
              <strong className="text-base-content font-bold">{profile.followers?.length || 0}</strong> Followers
            </div>
            <div className="flex items-center gap-1.5">
              <strong className="text-base-content font-bold">{userPosts.length}</strong> Posts
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-base-100 border border-base-200/80 rounded-2xl p-1 mb-4 flex">
        <button
          onClick={() => setActiveTab('posts')}
          className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'posts' ? 'bg-primary text-primary-content shadow-sm' : 'text-base-content/60 hover:text-base-content'
          }`}
        >
          <FileText size={16} /> Posts ({userPosts.length})
        </button>

        <button
          onClick={() => setActiveTab('media')}
          className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'media' ? 'bg-primary text-primary-content shadow-sm' : 'text-base-content/60 hover:text-base-content'
          }`}
        >
          <ImageIcon size={16} /> Media ({mediaPosts.length})
        </button>

        {isOwnProfile && (
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'saved' ? 'bg-primary text-primary-content shadow-sm' : 'text-base-content/60 hover:text-base-content'
            }`}
          >
            <Bookmark size={16} /> Saved ({savedPosts.length})
          </button>
        )}
      </div>

      {/* Posts Stream for Active Tab */}
      <div>
        {activeTab === 'posts' && (
          userPosts.length === 0 ? (
            <div className="card bg-base-100 border border-base-200 p-12 text-center rounded-2xl">
              <p className="text-lg font-bold mb-1">No posts yet</p>
              <p className="text-xs text-base-content/50">When this user shares thoughts or photos, they will show up here.</p>
            </div>
          ) : (
            userPosts.map(post => <PostCard key={post._id} post={post} />)
          )
        )}

        {activeTab === 'media' && (
          mediaPosts.length === 0 ? (
            <div className="card bg-base-100 border border-base-200 p-12 text-center rounded-2xl">
              <p className="text-lg font-bold mb-1">No media shared</p>
              <p className="text-xs text-base-content/50">Photos attached to posts will appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {mediaPosts.map(post => (
                <Link 
                  key={post._id} 
                  to={`/post/${post._id}`}
                  className="aspect-square rounded-2xl overflow-hidden bg-base-200/40 border border-base-200 group relative block"
                >
                  <img src={post.image} alt="Media" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </Link>
              ))}
            </div>
          )
        )}

        {activeTab === 'saved' && isOwnProfile && (
          savedPosts.length === 0 ? (
            <div className="card bg-base-100 border border-base-200 p-12 text-center rounded-2xl">
              <p className="text-lg font-bold mb-1">No saved posts</p>
              <p className="text-xs text-base-content/50">Bookmarks you save will appear here.</p>
            </div>
          ) : (
            savedPosts.map(post => <PostCard key={post._id} post={post} />)
          )
        )}
      </div>

      {/* Followers Modal */}
      <dialog id="followers_modal" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box rounded-3xl">
          <h3 className="font-bold text-lg mb-4">Followers ({profile.followers?.length || 0})</h3>
          <div className="flex flex-col gap-2.5 max-h-80 overflow-y-auto">
            {profile.followers?.length === 0 ? (
              <p className="text-center text-sm text-base-content/50 py-6">No followers yet.</p>
            ) : (
              profile.followers?.map(u => (
                <Link 
                  to={`/profile/${u._id}`} 
                  key={u._id} 
                  className="flex items-center gap-3 hover:bg-base-200/60 p-2.5 rounded-2xl transition-colors"
                  onClick={() => document.getElementById('followers_modal')?.close()}
                >
                  <img 
                    src={u.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=random`} 
                    alt={u.name}
                    className="w-10 h-10 rounded-full object-cover border border-base-200" 
                  />
                  <div>
                    <p className="font-bold text-sm">{u.name}</p>
                    <p className="text-xs text-base-content/60">@{u.username}</p>
                  </div>
                </Link>
              ))
            )}
          </div>
          <div className="modal-action">
            <form method="dialog"><button className="btn btn-sm btn-ghost rounded-full">Close</button></form>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop"><button>close</button></form>
      </dialog>

      {/* Following Modal */}
      <dialog id="following_modal" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box rounded-3xl">
          <h3 className="font-bold text-lg mb-4">Following ({profile.following?.length || 0})</h3>
          <div className="flex flex-col gap-2.5 max-h-80 overflow-y-auto">
            {profile.following?.length === 0 ? (
              <p className="text-center text-sm text-base-content/50 py-6">Not following anyone yet.</p>
            ) : (
              profile.following?.map(u => (
                <Link 
                  to={`/profile/${u._id}`} 
                  key={u._id} 
                  className="flex items-center gap-3 hover:bg-base-200/60 p-2.5 rounded-2xl transition-colors"
                  onClick={() => document.getElementById('following_modal')?.close()}
                >
                  <img 
                    src={u.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=random`} 
                    alt={u.name}
                    className="w-10 h-10 rounded-full object-cover border border-base-200" 
                  />
                  <div>
                    <p className="font-bold text-sm">{u.name}</p>
                    <p className="text-xs text-base-content/60">@{u.username}</p>
                  </div>
                </Link>
              ))
            )}
          </div>
          <div className="modal-action">
            <form method="dialog"><button className="btn btn-sm btn-ghost rounded-full">Close</button></form>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop"><button>close</button></form>
      </dialog>

      {/* Edit Profile Modal */}
      {isOwnProfile && (
        <dialog id="edit_profile_modal" className="modal modal-bottom sm:modal-middle">
          <div className="modal-box rounded-3xl max-w-lg">
            <h3 className="font-bold text-xl mb-4">Edit Profile</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              {/* Cover photo preview / picker */}
              <div className="form-control">
                <label className="label"><span className="label-text font-semibold">Cover Banner</span></label>
                <div 
                  className="h-28 rounded-2xl border-2 border-dashed border-base-300 relative cursor-pointer overflow-hidden flex items-center justify-center bg-base-200/40 hover:bg-base-200 transition-colors"
                  onClick={() => coverInputRef.current?.click()}
                >
                  {(editCover || profile.coverPhoto) ? (
                    <img src={editCover || profile.coverPhoto} alt="Cover preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs text-base-content/60 flex items-center gap-1.5 font-medium">
                      <Camera size={16} /> Choose Cover Photo
                    </span>
                  )}
                  <input type="file" ref={coverInputRef} className="hidden" accept="image/*" onChange={handleCoverChange} />
                </div>
              </div>

              {/* Avatar picker */}
              <div className="flex justify-center mb-2">
                <div className="relative cursor-pointer group" onClick={() => fileInputRef.current?.click()}>
                  <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-primary ring-2 ring-primary/20">
                    <img 
                      src={editImage || profile.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}`} 
                      alt="Avatar preview" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="text-white" size={20} />
                  </div>
                </div>
                <input type="file" className="hidden" ref={fileInputRef} accept="image/*" onChange={handleAvatarChange} />
              </div>
              
              <div className="form-control">
                <label className="label"><span className="label-text font-semibold">Full Name</span></label>
                <input 
                  type="text" 
                  className="input input-bordered w-full rounded-xl" 
                  value={editName} 
                  onChange={(e) => setEditName(e.target.value)} 
                  required 
                />
              </div>

              <div className="form-control">
                <label className="label"><span className="label-text font-semibold">Headline / Tagline</span></label>
                <input 
                  type="text" 
                  placeholder="e.g. Software Engineer | Designer | Coffee Lover" 
                  className="input input-bordered w-full rounded-xl" 
                  value={editHeadline} 
                  onChange={(e) => setEditHeadline(e.target.value)} 
                  maxLength={70}
                />
              </div>

              <div className="form-control">
                <label className="label"><span className="label-text font-semibold">Bio</span></label>
                <textarea 
                  className="textarea textarea-bordered h-24 rounded-xl resize-none" 
                  placeholder="Tell the community about yourself..."
                  value={editBio} 
                  onChange={(e) => setEditBio(e.target.value)}
                  maxLength={250}
                ></textarea>
              </div>
              
              <div className="modal-action pt-2">
                <button 
                  type="button" 
                  className="btn btn-ghost rounded-full" 
                  onClick={() => document.getElementById('edit_profile_modal')?.close()}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary rounded-full px-6" 
                  disabled={editLoading}
                >
                  {editLoading ? <span className="loading loading-spinner loading-xs"></span> : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
          <form method="dialog" className="modal-backdrop"><button>close</button></form>
        </dialog>
      )}
    </div>
  );
};

export default Profile;