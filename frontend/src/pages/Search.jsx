import { useState, useEffect, useContext } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { searchUsers, followUser, unfollowUser, getUserProfile } from '../services/userService';
import { AuthContext } from '../context/AuthContext';
import { Search as SearchIcon, UserPlus, Check } from 'lucide-react';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const { user: currentUser, followingIds, addFollowing, removeFollowing } = useContext(AuthContext);
  
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    const doSearch = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const { data } = await searchUsers(query);
        setResults(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    // Add small debounce
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
        if (removeFollowing) removeFollowing(targetId);
      } else {
        await followUser(targetId);
        if (addFollowing) addFollowing(targetId);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="pb-20 md:pb-4 max-w-xl mx-auto min-h-screen">
      <div className="sticky top-14 md:top-0 bg-base-100 z-10 p-4 border-b border-base-200">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-base-content/50">
            <SearchIcon size={20} />
          </div>
          <input 
            type="text" 
            placeholder="Search ConnectHub users..." 
            className="input input-bordered w-full pl-10 rounded-full"
            value={query}
            onChange={(e) => setSearchParams(e.target.value ? { q: e.target.value } : {})}
            autoFocus
          />
        </div>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="flex justify-center p-8"><span className="loading loading-spinner text-primary loading-lg"></span></div>
        ) : !query ? (
          <div className="text-center p-12 text-base-content/50">
            <SearchIcon size={48} className="mx-auto mb-4 opacity-20" />
            <p className="text-xl">Search for friends and colleagues</p>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center p-12 text-base-content/50">
            <p className="text-xl">No users found for "{query}"</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {results.map(u => {
              const isFollowing = followingIds.has(u._id);
              return (
                <div key={u._id} className="flex items-center justify-between p-4 bg-base-100 border border-base-200 rounded-2xl shadow-sm hover:border-base-300 transition-colors">
                  <Link to={`/profile/${u._id}`} className="flex items-center gap-4 flex-1">
                    <div className="avatar">
                      {u.profilePicture ? (
                        <div className="w-14 h-14 rounded-full">
                          <img src={u.profilePicture} alt={u.name} className="object-cover" />
                        </div>
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-neutral text-neutral-content flex items-center justify-center">
                          <span className="text-xl">{u.name.charAt(0).toUpperCase()}</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-lg leading-tight hover:underline">{u.name}</p>
                      <p className="text-sm text-base-content/60">@{u.username}</p>
                      {u.bio && <p className="text-sm mt-1 text-base-content/80 line-clamp-1">{u.bio}</p>}
                    </div>
                  </Link>
                  <button 
                    onClick={() => handleFollowToggle(u._id)}
                    className={`btn btn-sm rounded-full ml-4 ${isFollowing ? 'btn-outline' : 'btn-primary'}`}
                    disabled={actionLoading === u._id}
                  >
                    {actionLoading === u._id ? (
                      <span className="loading loading-spinner loading-xs"></span>
                    ) : isFollowing ? (
                      <>Following <Check size={14}/></>
                    ) : (
                      <>Follow <UserPlus size={14}/></>
                    )}
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
