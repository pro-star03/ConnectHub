import { useState, useEffect, useContext } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { searchUsers, followUser, unfollowUser } from '../services/userService';
import { getPosts } from '../services/postService';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import PostCard from '../components/PostCard';
import { Search as SearchIcon, UserPlus, Check, Users, FileText } from 'lucide-react';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const { followingIds, addFollowing, removeFollowing } = useContext(AuthContext);
  const { isUserOnline } = useContext(SocketContext);
  
  const [searchTab, setSearchTab] = useState(query.startsWith('#') ? 'posts' : 'people');
  const [userResults, setUserResults] = useState([]);
  const [postResults, setPostResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    if (!query.trim()) {
      setUserResults([]);
      setPostResults([]);
      return;
    }

    const doSearch = async () => {
      setLoading(true);
      try {
        if (query.startsWith('#')) {
          setSearchTab('posts');
          const { data } = await getPosts({ tag: query.slice(1) });
          setPostResults(data || []);
        } else {
          const [usersRes, postsRes] = await Promise.all([
            searchUsers(query),
            getPosts({ search: query })
          ]);
          setUserResults(usersRes.data || []);
          setPostResults(postsRes.data || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    const timer = setTimeout(() => {
      doSearch();
    }, 300);
    
    return () => clearTimeout(timer);
  }, [query]);

  const handleFollowToggle = async (targetId) => {
    setActionLoading(targetId);
    try {
      if (followingIds?.has(targetId)) {
        await unfollowUser(targetId);
        removeFollowing(targetId);
      } else {
        await followUser(targetId);
        addFollowing(targetId);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="pb-20 md:pb-6 max-w-xl mx-auto min-h-screen">
      {/* Sticky Search Header */}
      <div className="sticky top-16 bg-base-100 z-10 p-4 border-b border-base-200/80 rounded-2xl mb-3 shadow-sm">
        <div className="relative">
          <SearchIcon size={18} className="absolute inset-y-0 left-3.5 top-1/2 -translate-y-1/2 text-base-content/50" />
          <input 
            type="text" 
            placeholder="Search people, hashtags, topics..." 
            className="input input-bordered w-full pl-10 h-11 rounded-full text-sm bg-base-200/60 focus:bg-base-100 transition-colors"
            value={query}
            onChange={(e) => setSearchParams(e.target.value ? { q: e.target.value } : {})}
            autoFocus
          />
        </div>

        {/* Search Mode Tabs */}
        {query && (
          <div className="flex gap-2 mt-3 pt-2 border-t border-base-200/60">
            <button
              onClick={() => setSearchTab('people')}
              className={`flex items-center gap-1.5 py-1.5 px-3.5 rounded-full text-xs font-bold transition-colors ${
                searchTab === 'people' ? 'bg-primary text-primary-content' : 'text-base-content/60 hover:bg-base-200'
              }`}
            >
              <Users size={14} /> People ({userResults.length})
            </button>
            <button
              onClick={() => setSearchTab('posts')}
              className={`flex items-center gap-1.5 py-1.5 px-3.5 rounded-full text-xs font-bold transition-colors ${
                searchTab === 'posts' ? 'bg-primary text-primary-content' : 'text-base-content/60 hover:bg-base-200'
              }`}
            >
              <FileText size={14} /> Posts ({postResults.length})
            </button>
          </div>
        )}
      </div>

      {/* Results View */}
      <div className="px-2 sm:px-0">
        {loading ? (
          <div className="flex justify-center p-12">
            <span className="loading loading-spinner text-primary loading-lg"></span>
          </div>
        ) : !query ? (
          <div className="card bg-base-100 border border-base-200 p-12 text-center rounded-2xl">
            <SearchIcon size={40} className="mx-auto mb-3 text-primary/30" />
            <p className="text-lg font-bold">Discover ConnectHub</p>
            <p className="text-xs text-base-content/60 mt-1 max-w-xs mx-auto">
              Search by name, @username, or #hashtag to explore creators and conversations.
            </p>
          </div>
        ) : searchTab === 'people' ? (
          userResults.length === 0 ? (
            <div className="card bg-base-100 border border-base-200 p-10 text-center rounded-2xl">
              <p className="text-base font-bold">No users found for "{query}"</p>
              <p className="text-xs text-base-content/50 mt-1">Try searching for posts or different keywords.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {userResults.map(u => {
                const isFollowing = followingIds.has(u._id);
                const online = isUserOnline(u._id);
                return (
                  <div key={u._id} className="flex items-center justify-between p-3.5 bg-base-100 border border-base-200/90 rounded-2xl shadow-sm hover:border-base-300 transition-colors">
                    <Link to={`/profile/${u._id}`} className="flex items-center gap-3.5 flex-1 min-w-0 group">
                      <div className="relative shrink-0">
                        <img 
                          src={u.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=random`} 
                          alt={u.name} 
                          className="w-12 h-12 rounded-full object-cover border border-base-200" 
                        />
                        {online && (
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-base-100 online-pulse"></span>
                        )}
                      </div>
                      <div className="truncate">
                        <p className="font-bold text-sm group-hover:underline truncate">{u.name}</p>
                        <p className="text-xs text-base-content/60 truncate">@{u.username}</p>
                        {u.headline && <p className="text-xs text-primary font-medium truncate mt-0.5">{u.headline}</p>}
                        {u.bio && <p className="text-xs text-base-content/70 line-clamp-1 mt-0.5">{u.bio}</p>}
                      </div>
                    </Link>

                    <button 
                      onClick={() => handleFollowToggle(u._id)}
                      className={`btn btn-xs rounded-full px-4 ml-3 shrink-0 ${isFollowing ? 'btn-outline' : 'btn-primary'}`}
                      disabled={actionLoading === u._id}
                    >
                      {actionLoading === u._id ? (
                        <span className="loading loading-spinner loading-xs"></span>
                      ) : isFollowing ? (
                        <>Following <Check size={12}/></>
                      ) : (
                        <>Follow <UserPlus size={12}/></>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          postResults.length === 0 ? (
            <div className="card bg-base-100 border border-base-200 p-10 text-center rounded-2xl">
              <p className="text-base font-bold">No posts found matching "{query}"</p>
              <p className="text-xs text-base-content/50 mt-1">Try another search term or hashtag.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {postResults.map(post => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Search;
