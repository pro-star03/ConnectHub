import { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, UserX, Search, ShieldCheck, ShieldAlert, UserCheck, AlertCircle, Plus } from 'lucide-react';
import { getBlockedUsers, unblockUser, blockUser, searchUsers } from '../services/userService';
import { AuthContext } from '../context/AuthContext';

const BlockedUsers = () => {
  const navigate = useNavigate();
  const { removeBlockedId, addBlockedId } = useContext(AuthContext);

  const [blockedList, setBlockedList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [unblockingId, setUnblockingId] = useState(null);
  const [feedbackMsg, setFeedbackMsg] = useState({ type: '', text: '' });

  // Add block modal state
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchNewUserQuery, setSearchNewUserQuery] = useState('');
  const [searchUserResults, setSearchUserResults] = useState([]);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [blockingId, setBlockingId] = useState(null);

  const fetchBlockedList = async () => {
    setLoading(true);
    try {
      const { data } = await getBlockedUsers();
      setBlockedList(data || []);
    } catch (err) {
      console.error(err);
      setFeedbackMsg({ type: 'error', text: 'Failed to load blocked users list.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlockedList();
  }, []);

  const handleUnblock = async (targetUser) => {
    const confirmUnblock = window.confirm(
      `Unblock @${targetUser.username}? They will now be able to view your profile, posts, and message you.`
    );
    if (!confirmUnblock) return;

    setUnblockingId(targetUser._id);
    try {
      await unblockUser(targetUser._id);
      removeBlockedId(targetUser._id);
      setBlockedList(prev => prev.filter(u => u._id !== targetUser._id));
      setFeedbackMsg({ type: 'success', text: `@${targetUser.username} has been unblocked.` });
      setTimeout(() => setFeedbackMsg({ type: '', text: '' }), 3500);
    } catch (err) {
      console.error(err);
      setFeedbackMsg({ type: 'error', text: err.response?.data?.message || 'Failed to unblock user.' });
    } finally {
      setUnblockingId(null);
    }
  };

  const handleSearchNewUsers = async (e) => {
    e.preventDefault();
    if (!searchNewUserQuery.trim()) return;

    setSearchingUsers(true);
    try {
      const { data } = await searchUsers(searchNewUserQuery.trim());
      // Filter out users already in blocked list
      const blockedSet = new Set(blockedList.map(u => u._id));
      setSearchUserResults((data || []).filter(u => !blockedSet.has(u._id)));
    } catch (err) {
      console.error(err);
    } finally {
      setSearchingUsers(false);
    }
  };

  const handleBlockFromSearch = async (targetUser) => {
    const confirmBlock = window.confirm(
      `Block @${targetUser.username}? They will no longer be able to follow you, view your posts, or message you. Any existing follow connection will be removed.`
    );
    if (!confirmBlock) return;

    setBlockingId(targetUser._id);
    try {
      await blockUser(targetUser._id);
      addBlockedId(targetUser._id);
      setBlockedList(prev => [targetUser, ...prev]);
      setSearchUserResults(prev => prev.filter(u => u._id !== targetUser._id));
      setFeedbackMsg({ type: 'success', text: `@${targetUser.username} is now blocked.` });
      setTimeout(() => setFeedbackMsg({ type: '', text: '' }), 3500);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to block user');
    } finally {
      setBlockingId(null);
    }
  };

  const filteredBlockedList = blockedList.filter(user => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      user.name?.toLowerCase().includes(q) ||
      user.username?.toLowerCase().includes(q) ||
      user.headline?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="pb-20 md:pb-6 max-w-xl mx-auto min-h-screen bg-base-100">
      {/* Header */}
      <div className="sticky top-0 bg-base-100/90 backdrop-blur-md z-10 p-4 border-b border-base-200 flex items-center justify-between h-14">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/settings')} 
            className="btn btn-ghost btn-circle btn-sm"
            title="Back to Settings"
          >
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-lg font-bold flex items-center gap-2">
              <UserX size={18} className="text-error" />
              <span>Block List</span>
            </h1>
          </div>
        </div>
        <button 
          onClick={() => {
            setShowSearchModal(true);
            setSearchNewUserQuery('');
            setSearchUserResults([]);
          }}
          className="btn btn-sm btn-ghost gap-1.5 text-xs text-primary font-semibold hover:bg-primary/10 rounded-full"
        >
          <Plus size={16} /> Block User
        </button>
      </div>

      <div className="p-4 flex flex-col gap-4">
        {/* Informative Banner */}
        <div className="bg-base-200/50 border border-base-200 rounded-2xl p-3.5 text-xs text-base-content/70 flex items-start gap-2.5">
          <ShieldAlert size={18} className="text-warning shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            When you block someone, they won't be able to see your profile or posts, follow you, or send you direct messages. Existing follow connections are automatically removed.
          </p>
        </div>

        {/* Feedback message */}
        {feedbackMsg.text && (
          <div className={`alert ${feedbackMsg.type === 'error' ? 'alert-error' : 'alert-success'} text-sm py-2.5 shadow-sm`}>
            <span>{feedbackMsg.text}</span>
          </div>
        )}

        {/* Search within list */}
        {blockedList.length > 0 && (
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40" />
            <input 
              type="text" 
              placeholder="Filter blocked accounts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input input-sm input-bordered w-full pl-9 rounded-full bg-base-100"
            />
          </div>
        )}

        {/* Blocked Accounts List */}
        {loading ? (
          <div className="flex justify-center p-12">
            <span className="loading loading-spinner text-primary loading-md"></span>
          </div>
        ) : filteredBlockedList.length === 0 ? (
          <div className="text-center py-16 px-4 bg-base-100 border border-base-200 rounded-3xl mt-2 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-success/10 text-success flex items-center justify-center mb-3">
              <ShieldCheck size={32} />
            </div>
            <h3 className="font-bold text-base mb-1">
              {blockedList.length === 0 ? 'No Blocked Accounts' : 'No matches found'}
            </h3>
            <p className="text-xs text-base-content/60 max-w-sm mb-4">
              {blockedList.length === 0 
                ? 'Your block list is currently clean. Anyone you block will appear here and can be unblocked anytime.'
                : `No blocked accounts matched "${searchQuery}".`}
            </p>
            {blockedList.length === 0 && (
              <button 
                onClick={() => setShowSearchModal(true)} 
                className="btn btn-sm btn-outline rounded-full gap-2"
              >
                <Plus size={16} /> Block an Account
              </button>
            )}
          </div>
        ) : (
          <div className="bg-base-100 border border-base-200 rounded-2xl overflow-hidden divide-y divide-base-200 shadow-sm">
            {filteredBlockedList.map(blockedUser => {
              const avatar = blockedUser.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(blockedUser.name)}&background=random`;
              const isProcessing = unblockingId === blockedUser._id;

              return (
                <div key={blockedUser._id} className="p-4 flex items-center justify-between gap-3 hover:bg-base-200/40 transition-colors">
                  <Link to={`/profile/${blockedUser._id}`} className="flex items-center gap-3 min-w-0 group flex-1">
                    <img 
                      src={avatar} 
                      alt={blockedUser.name} 
                      className="w-11 h-11 rounded-full object-cover border border-base-200 shrink-0" 
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-sm truncate group-hover:underline flex items-center gap-1">
                        <span>{blockedUser.name}</span>
                        {blockedUser.isVerified && (
                          <span className="badge badge-primary badge-xs scale-90">✓</span>
                        )}
                      </h4>
                      <p className="text-xs text-base-content/60 truncate">@{blockedUser.username}</p>
                      {blockedUser.headline && (
                        <p className="text-[11px] text-base-content/50 truncate mt-0.5">{blockedUser.headline}</p>
                      )}
                    </div>
                  </Link>

                  <button 
                    onClick={() => handleUnblock(blockedUser)}
                    disabled={isProcessing}
                    className="btn btn-sm btn-outline hover:btn-success rounded-full px-4 text-xs shrink-0 transition-all"
                  >
                    {isProcessing ? (
                      <span className="loading loading-spinner loading-xs"></span>
                    ) : (
                      'Unblock'
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Block Someone Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-base-100 w-full max-w-md rounded-2xl p-5 shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <UserX size={19} className="text-error" /> Block a User
              </h3>
              <button 
                onClick={() => setShowSearchModal(false)}
                className="btn btn-ghost btn-circle btn-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-base-content/60 mb-3">
              Search by name or username to block a user from viewing your profile, posts, or contacting you.
            </p>

            <form onSubmit={handleSearchNewUsers} className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
                <input 
                  type="text"
                  placeholder="Search user..."
                  value={searchNewUserQuery}
                  onChange={(e) => setSearchNewUserQuery(e.target.value)}
                  className="input input-sm input-bordered w-full pl-9 rounded-xl"
                  autoFocus
                />
              </div>
              <button 
                type="submit" 
                className="btn btn-sm btn-primary rounded-xl"
                disabled={searchingUsers || !searchNewUserQuery.trim()}
              >
                {searchingUsers ? <span className="loading loading-spinner loading-xs"></span> : 'Search'}
              </button>
            </form>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {searchingUsers ? (
                <div className="flex justify-center p-6"><span className="loading loading-spinner text-primary"></span></div>
              ) : searchUserResults.length > 0 ? (
                searchUserResults.map(u => (
                  <div key={u._id} className="p-3 border border-base-200 rounded-xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <img 
                        src={u.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=random`} 
                        alt={u.name} 
                        className="w-9 h-9 rounded-full object-cover shrink-0" 
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-xs truncate">{u.name}</p>
                        <p className="text-[11px] text-base-content/50 truncate">@{u.username}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleBlockFromSearch(u)}
                      disabled={blockingId === u._id}
                      className="btn btn-xs btn-error btn-outline rounded-full px-3"
                    >
                      {blockingId === u._id ? <span className="loading loading-spinner loading-xs"></span> : 'Block'}
                    </button>
                  </div>
                ))
              ) : searchNewUserQuery.trim() && !searchingUsers ? (
                <p className="text-center text-xs text-base-content/50 py-6">No users found.</p>
              ) : null}
            </div>

            <div className="mt-4 pt-3 border-t border-base-200 flex justify-end">
              <button 
                onClick={() => setShowSearchModal(false)} 
                className="btn btn-sm btn-ghost rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlockedUsers;
