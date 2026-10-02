import { useState, useEffect } from 'react';
import api from '../../services/api';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBlockUser = async (id, isCurrentlyBlocked) => {
    if (!window.confirm(`Are you sure you want to ${isCurrentlyBlocked ? 'unblock' : 'block'} this user?`)) return;
    try {
      if (isCurrentlyBlocked) {
        await api.put(`/admin/users/${id}/unblock`);
      } else {
        await api.put(`/admin/users/${id}/block`);
      }
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating user');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(search.toLowerCase()) || 
                          user.username.toLowerCase().includes(search.toLowerCase()) ||
                          user.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' ? true : 
                          statusFilter === 'active' ? user.isActive : !user.isActive;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h2 className="text-3xl font-bold">Manage Users</h2>
        
        <div className="flex gap-2 w-full md:w-auto">
          <input 
            type="text" 
            placeholder="Search users..." 
            className="input input-bordered w-full md:w-64"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select 
            className="select select-bordered"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>
      </div>

      <div className="card bg-base-100 shadow-sm border border-base-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="text-center p-8"><span className="loading loading-spinner"></span></td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan="6" className="text-center p-8 text-base-content/50">No users found</td></tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user._id}>
                    <td>
                      <div className="flex items-center space-x-3">
                        <div className="avatar">
                          <div className="mask mask-squircle w-10 h-10 bg-base-300">
                            {user.profilePicture ? (
                              <img src={user.profilePicture} alt="Avatar" />
                            ) : (
                              <span className="flex items-center justify-center w-full h-full text-lg">
                                {user.name.charAt(0)}
                              </span>
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="font-bold">{user.name}</div>
                          <div className="text-sm opacity-50">@{user.username}</div>
                        </div>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`badge ${user.role === 'admin' || user.isAdmin ? 'badge-primary' : 'badge-ghost'}`}>
                        {user.role === 'admin' || user.isAdmin ? 'Admin' : 'User'}
                      </span>
                    </td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge ${user.isActive ? 'badge-success badge-outline' : 'badge-error badge-outline'}`}>
                        {user.isActive ? 'Active' : 'Blocked'}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        {user.role !== 'admin' && !user.isAdmin && (
                          <button 
                            className={`btn btn-xs ${user.isActive ? 'btn-error btn-outline' : 'btn-success btn-outline'}`}
                            onClick={() => handleBlockUser(user._id, !user.isActive)}
                          >
                            {user.isActive ? 'Block' : 'Unblock'}
                          </button>
                        )}
                        <a href={`/profile/${user._id}`} target="_blank" rel="noopener noreferrer" className="btn btn-xs btn-ghost">View</a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
