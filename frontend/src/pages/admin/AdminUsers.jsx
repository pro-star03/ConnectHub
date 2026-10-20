import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  getUsers, 
  blockUser, 
  unblockUser, 
  toggleUserVerification, 
  updateUserRole, 
  adminResetPassword, 
  adminDeleteUser 
} from '../../services/adminService';
import { 
  Search, 
  BadgeCheck, 
  ShieldCheck, 
  Shield, 
  KeyRound, 
  Trash2, 
  ExternalLink, 
  UserCheck, 
  UserX,
  Crown
} from 'lucide-react';

const ROOT_ADMIN_EMAIL = 'alok@gmail.com';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  const fetchUsers = async () => {
    try {
      const res = await getUsers();
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleBlockUser = async (user) => {
    if (user.email === ROOT_ADMIN_EMAIL) {
      return alert('The root administrator account is protected and cannot be blocked.');
    }
    const isCurrentlyBlocked = !user.isActive;
    if (!window.confirm(`Are you sure you want to ${isCurrentlyBlocked ? 'unblock' : 'block'} @${user.username}?`)) return;
    try {
      if (isCurrentlyBlocked) {
        await unblockUser(user._id);
      } else {
        await blockUser(user._id);
      }
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating user');
    }
  };

  const handleToggleVerification = async (user) => {
    try {
      await toggleUserVerification(user._id);
      setUsers(prev => prev.map(u => u._id === user._id ? { ...u, isVerified: !u.isVerified } : u));
    } catch (err) {
      alert(err.response?.data?.message || 'Error toggling verification');
    }
  };

  const handleToggleRole = async (user) => {
    if (user.email === ROOT_ADMIN_EMAIL) {
      return alert('Root administrator permissions are permanently fixed.');
    }
    const nextRole = (user.role === 'admin' || user.isAdmin) ? 'user' : 'admin';
    if (!window.confirm(`Change @${user.username}'s role to ${nextRole.toUpperCase()}?`)) return;
    try {
      await updateUserRole(user._id, nextRole);
      setUsers(prev => prev.map(u => u._id === user._id ? { ...u, role: nextRole, isAdmin: nextRole === 'admin' } : u));
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating role');
    }
  };

  const handleResetPassword = async (user) => {
    if (user.email === ROOT_ADMIN_EMAIL) {
      return alert('Root admin password is fixed to 1234567890 by system configuration.');
    }
    const newPass = window.prompt(`Enter new password for @${user.username}:`, 'password123');
    if (!newPass) return;
    if (newPass.length < 6) return alert('Password must be at least 6 characters');
    try {
      await adminResetPassword(user._id, newPass);
      alert(`Password for @${user.username} successfully updated to: ${newPass}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Error resetting password');
    }
  };

  const handleDeleteUser = async (user) => {
    if (user.email === ROOT_ADMIN_EMAIL) {
      return alert('The root administrator account is protected and cannot be deleted.');
    }
    if (!window.confirm(`PERMANENT WARNING: Delete @${user.username} and all their posts, comments, stories, and data permanently?`)) return;
    try {
      await adminDeleteUser(user._id);
      setUsers(prev => prev.filter(u => u._id !== user._id));
      alert(`User @${user.username} has been deleted.`);
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting user');
    }
  };

  const filteredUsers = users.filter(user => {
    const q = search.toLowerCase();
    const matchesSearch = (user.name || '').toLowerCase().includes(q) || 
                          (user.username || '').toLowerCase().includes(q) ||
                          (user.email || '').toLowerCase().includes(q);

    let matchesStatus = true;
    if (statusFilter === 'active') matchesStatus = user.isActive;
    if (statusFilter === 'blocked') matchesStatus = !user.isActive;

    let matchesRole = true;
    if (roleFilter === 'admin') matchesRole = user.role === 'admin' || user.isAdmin;
    if (roleFilter === 'user') matchesRole = user.role !== 'admin' && !user.isAdmin;
    if (roleFilter === 'verified') matchesRole = user.isVerified;

    return matchesSearch && matchesStatus && matchesRole;
  });

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            User Directory & Access Control
          </h2>
          <p className="text-sm opacity-70 mt-1">Manage accounts, grant verification badges, assign admin privileges, and enforce safety.</p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto flex-wrap">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-base-content/40" />
            <input 
              type="text" 
              placeholder="Search by name, @username, or email..." 
              className="input input-bordered w-full pl-10 text-sm"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            />
          </div>

          <select 
            className="select select-bordered text-sm"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="blocked">Blocked Only</option>
          </select>

          <select 
            className="select select-bordered text-sm"
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}
          >
            <option value="all">All Roles & Badges</option>
            <option value="verified">Verified Badge</option>
            <option value="admin">Administrators</option>
            <option value="user">Standard Members</option>
          </select>
        </div>
      </div>

      <div className="card bg-base-100 shadow-sm border border-base-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr className="bg-base-200/50">
                <th>Account</th>
                <th>Role & Badges</th>
                <th>Status</th>
                <th>Registered</th>
                <th className="text-right">Administrative Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="text-center p-12"><span className="loading loading-spinner text-primary"></span></td></tr>
              ) : currentUsers.length === 0 ? (
                <tr><td colSpan="5" className="text-center p-12 text-base-content/50">No users matched your query</td></tr>
              ) : (
                currentUsers.map(user => {
                  const isRoot = user.email === ROOT_ADMIN_EMAIL;
                  const isAdmin = user.role === 'admin' || user.isAdmin;

                  return (
                    <tr key={user._id} className="hover:bg-base-200/30 transition-colors">
                      {/* Account info */}
                      <td>
                        <div className="flex items-center space-x-3">
                          <div className="avatar">
                            <div className="mask mask-squircle w-11 h-11 bg-base-300">
                              {user.profilePicture ? (
                                <img src={user.profilePicture} alt="Avatar" />
                              ) : (
                                <span className="flex items-center justify-center w-full h-full text-lg font-bold">
                                  {user.name?.charAt(0) || 'U'}
                                </span>
                              )}
                            </div>
                          </div>
                          <div>
                            <div className="font-bold flex items-center gap-1.5 text-sm">
                              {user.name}
                              {user.isVerified && (
                                <BadgeCheck className="w-4 h-4 text-primary fill-primary/20 shrink-0" title="Verified Creator" />
                              )}
                              {isRoot && (
                                <span className="badge badge-primary badge-xs gap-1 font-mono font-bold">
                                  <Crown className="w-2.5 h-2.5" /> ROOT
                                </span>
                              )}
                            </div>
                            <div className="text-xs opacity-60">@{user.username}</div>
                            <div className="text-xs opacity-50 font-mono mt-0.5">{user.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Role & Badges */}
                      <td>
                        <div className="flex flex-col items-start gap-1">
                          <span className={`badge badge-sm font-semibold ${
                            isAdmin ? 'badge-primary' : 'badge-ghost'
                          }`}>
                            {isAdmin ? 'Admin' : 'Member'}
                          </span>
                          {user.isVerified ? (
                            <span className="badge badge-info badge-outline badge-xs gap-1">
                              <BadgeCheck className="w-3 h-3" /> Verified
                            </span>
                          ) : (
                            <span className="text-[11px] opacity-40">Standard</span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td>
                        <span className={`badge badge-sm font-semibold ${
                          user.isActive ? 'badge-success badge-outline' : 'badge-error'
                        }`}>
                          {user.isActive ? 'Active' : 'Blocked'}
                        </span>
                      </td>

                      {/* Registered */}
                      <td className="text-xs text-base-content/70">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>

                      {/* Action buttons */}
                      <td>
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {/* Toggle Verified Badge */}
                          <button
                            type="button"
                            title={user.isVerified ? "Remove Verified Badge" : "Grant Verified Badge"}
                            className={`btn btn-xs gap-1 ${user.isVerified ? 'btn-info btn-outline' : 'btn-ghost text-base-content/70'}`}
                            onClick={() => handleToggleVerification(user)}
                          >
                            <BadgeCheck className="w-3.5 h-3.5" />
                            {user.isVerified ? 'Verified' : 'Verify'}
                          </button>

                          {/* Toggle Admin Role */}
                          {!isRoot && (
                            <button
                              type="button"
                              title={isAdmin ? "Revoke Admin Rights" : "Promote to Admin"}
                              className={`btn btn-xs gap-1 ${isAdmin ? 'btn-primary btn-outline' : 'btn-ghost text-base-content/70'}`}
                              onClick={() => handleToggleRole(user)}
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                              {isAdmin ? 'Demote' : 'Promote'}
                            </button>
                          )}

                          {/* Reset Password */}
                          {!isRoot && (
                            <button
                              type="button"
                              title="Reset Password"
                              className="btn btn-xs btn-ghost text-base-content/70 hover:text-warning"
                              onClick={() => handleResetPassword(user)}
                            >
                              <KeyRound className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Block / Unblock */}
                          {!isRoot && (
                            <button 
                              type="button"
                              className={`btn btn-xs ${user.isActive ? 'btn-error btn-outline' : 'btn-success btn-outline'}`}
                              onClick={() => handleBlockUser(user)}
                              title={user.isActive ? "Block Account" : "Unblock Account"}
                            >
                              {user.isActive ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                              {user.isActive ? 'Block' : 'Unblock'}
                            </button>
                          )}

                          {/* View Profile */}
                          <Link 
                            to={`/profile/${user._id}`} 
                            target="_blank" 
                            className="btn btn-xs btn-ghost text-base-content/70"
                            title="View Public Profile"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>

                          {/* Delete Account */}
                          {!isRoot && (
                            <button
                              type="button"
                              className="btn btn-xs btn-error btn-ghost text-error"
                              onClick={() => handleDeleteUser(user)}
                              title="Delete Account Permanently"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {totalPages > 1 && (
          <div className="flex justify-center p-4 border-t border-base-200">
            <div className="join">
              <button 
                className="join-item btn btn-sm"
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
              >
                «
              </button>
              <button className="join-item btn btn-sm pointer-events-none">
                Page {currentPage} of {totalPages}
              </button>
              <button 
                className="join-item btn btn-sm"
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                »
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
