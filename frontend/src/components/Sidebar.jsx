import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  User as UserIcon, 
  PlusSquare, 
  PlusCircle,
  Bookmark, 
  Bell, 
  MessageSquare, 
  Users, 
  Settings, 
  Search as SearchIcon,
  ShieldAlert
} from 'lucide-react';

const Sidebar = ({ unreadMessages = 0, unreadNotifications = 0 }) => {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  const navLinks = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Search', path: '/search', icon: SearchIcon },
    { label: 'Notifications', path: '/notifications', icon: Bell, badge: unreadNotifications },
    { label: 'Messages', path: '/messages', icon: MessageSquare, badge: unreadMessages },
    { label: 'Saved Posts', path: '/saved', icon: Bookmark },
    { label: 'Suggestions', path: '/suggestions', icon: Users },
    { label: 'Profile', path: `/profile/${user?._id || ''}`, icon: UserIcon },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 hidden md:flex flex-col h-[calc(100vh-64px)] sticky top-16 py-4 pr-4">
      {/* User Quick Card */}
      <Link 
        to={`/profile/${user?._id || ''}`} 
        className="flex items-center gap-3 mb-6 p-3 rounded-2xl bg-base-100 hover:bg-base-200/70 border border-base-200/80 transition-all shadow-sm group"
      >
        <div className="avatar">
          <div className="w-11 h-11 rounded-full ring-2 ring-primary/20 group-hover:ring-primary transition-all">
            <img 
              src={user?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=random`} 
              alt={user?.name} 
              className="object-cover"
            />
          </div>
        </div>
        <div className="overflow-hidden min-w-0 flex-1">
          <p className="font-bold text-sm truncate group-hover:text-primary transition-colors">{user?.name}</p>
          <p className="text-xs text-base-content/60 truncate">@{user?.username}</p>
        </div>
      </Link>

      {/* Nav Menu */}
      <nav className="flex-1 space-y-1">
        {navLinks.map(({ label, path, icon: Icon, badge }) => {
          const isActive = location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
          return (
            <Link
              key={label}
              to={path}
              className={`flex items-center justify-between px-4 py-3 rounded-2xl font-semibold text-sm transition-all ${
                isActive 
                  ? 'bg-primary text-primary-content shadow-md shadow-primary/20' 
                  : 'text-base-content/80 hover:bg-base-200 hover:text-base-content'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span>{label}</span>
              </div>
              {badge > 0 && (
                <span className={`badge badge-sm font-bold ${isActive ? 'bg-primary-content text-primary' : 'badge-primary'}`}>
                  {badge}
                </span>
              )}
            </Link>
          );
        })}

        {user?.isAdmin && (
          <Link
            to="/admin/dashboard"
            className="flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold text-sm text-secondary hover:bg-secondary/10 transition-colors mt-2"
          >
            <ShieldAlert size={20} />
            <span>Admin Panel</span>
          </Link>
        )}
      </nav>

      {/* Quick Create Buttons */}
      <div className="pt-4 flex flex-col gap-2">
        <Link 
          to="/create-post" 
          className="btn btn-primary w-full rounded-2xl shadow-lg shadow-primary/25 gap-2 text-base font-bold"
        >
          <PlusSquare size={20} />
          <span>New Post</span>
        </Link>
        <Link 
          to="/create-story" 
          className="btn btn-outline btn-primary w-full rounded-2xl gap-2 text-sm font-semibold hover:!text-white"
        >
          <PlusCircle size={18} />
          <span>Add Story</span>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
