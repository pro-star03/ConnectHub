import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Home, User, PlusSquare, Bookmark, Bell, MessageSquare, Users, Settings, LogOut, Search as SearchIcon } from 'lucide-react';

const Sidebar = ({ unreadMessages = 0 }) => {
  const { logoutUser, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  return (
    <div className="w-64 hidden md:flex flex-col h-[calc(100vh-64px)] sticky top-16 py-6 pr-4">
      <div className="flex items-center gap-3 mb-8 px-4">
        <div className="avatar placeholder">
          <div className="bg-neutral text-neutral-content rounded-full w-12 h-12 shadow-sm">
            <span className="text-xl font-bold">{user?.name?.charAt(0).toUpperCase()}</span>
          </div>
        </div>
        <div className="overflow-hidden">
          <p className="font-bold text-base truncate">{user?.name}</p>
          <p className="text-sm text-base-content/60 truncate">@{user?.username}</p>
        </div>
      </div>

      <ul className="menu w-full p-0 flex-1 gap-2 text-base font-medium">
        <li><Link to="/" className="py-3 rounded-xl hover:bg-base-200"><Home size={22} className="mr-2"/> Home</Link></li>
        <li><Link to="/search" className="py-3 rounded-xl hover:bg-base-200"><SearchIcon size={22} className="mr-2"/> Search</Link></li>
        <li><Link to="/profile" className="py-3 rounded-xl hover:bg-base-200"><User size={22} className="mr-2"/> Profile</Link></li>
        <li><Link to="/create" className="py-3 rounded-xl hover:bg-base-200"><PlusSquare size={22} className="mr-2"/> Create</Link></li>
        <li><Link to="/saved" className="py-3 rounded-xl hover:bg-base-200"><Bookmark size={22} className="mr-2"/> Saved Posts</Link></li>

        <li>
          <Link to="/messages" className="py-3 rounded-xl hover:bg-base-200 justify-between">
            <div className="flex items-center gap-2"><MessageSquare size={22} className="mr-2"/> Messages</div>
            {unreadMessages > 0 && <span className="badge badge-primary badge-sm">{unreadMessages}</span>}
          </Link>
        </li>
        <li><Link to="/suggestions" className="py-3 rounded-xl hover:bg-base-200"><Users size={22} className="mr-2"/> Suggestions</Link></li>
        
        {user?.isAdmin && (
          <li><Link to="/admin/dashboard" className="py-3 rounded-xl hover:bg-base-200 text-primary"><Settings size={22} className="mr-2"/> Admin Panel</Link></li>
        )}
      </ul>
      
    </div>
  );
};

export default Sidebar;
