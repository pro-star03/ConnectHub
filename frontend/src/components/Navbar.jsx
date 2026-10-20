import { Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Heart, MessageSquare, Sun, Moon, Shield, Settings, LogOut, Hexagon } from 'lucide-react';

const Navbar = ({ unreadNotifications = 0, unreadMessages = 0 }) => {
  const { user, updateUser, logoutUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const currentTheme = user?.themePreference || localStorage.getItem('theme') || 'system';
  const isDark = currentTheme === 'dark' || (currentTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const toggleTheme = () => {
    const nextTheme = isDark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('theme', nextTheme);
    updateUser({ themePreference: nextTheme });
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  return (
    <header className="navbar glass-nav sticky top-0 z-50 px-4 sm:px-6 h-16 min-h-[4rem] border-b border-base-200/80">
      {/* Brand Logo */}
      <div className="flex-1 flex items-center gap-2">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary via-secondary to-accent flex items-center justify-center text-primary-content shadow-md group-hover:scale-105 transition-transform">
            <Hexagon size={22} className="stroke-[2.5]" />
          </div>
          <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            ConnectHub
          </span>
        </Link>
      </div>
      
      {/* Right Action Icons */}
      <div className="flex-none flex items-center gap-1.5 sm:gap-2">
        {/* Theme Toggle Button */}
        <button 
          onClick={toggleTheme} 
          className="btn btn-ghost btn-circle btn-sm text-base-content/80 hover:text-primary transition-colors"
          title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        >
          {isDark ? <Sun size={19} className="text-warning" /> : <Moon size={19} />}
        </button>

        {!user ? (
          <div className="flex items-center gap-2 ml-2">
            <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
            <Link to="/register" className="btn btn-primary btn-sm rounded-full px-4">Sign Up</Link>
          </div>
        ) : (
          <>
            {/* Messages Quick Access */}
            <Link 
              to="/messages" 
              className="btn btn-ghost btn-circle btn-sm relative text-base-content/80 hover:text-primary"
              title="Messages"
            >
              <div className="indicator">
                <MessageSquare size={20} />
                {unreadMessages > 0 && (
                  <span className="badge badge-xs badge-primary indicator-item">{unreadMessages}</span>
                )}
              </div>
            </Link>

            {/* Notifications Heart */}
            <Link 
              to="/notifications" 
              className="btn btn-ghost btn-circle btn-sm relative text-base-content/80 hover:text-error"
              title="Notifications"
            >
              <div className="indicator">
                <Heart size={20} />
                {unreadNotifications > 0 && (
                  <span className="badge badge-xs badge-error indicator-item">{unreadNotifications}</span>
                )}
              </div>
            </Link>

            {/* User Dropdown */}
            <div className="dropdown dropdown-end ml-1">
              <label tabIndex={0} className="btn btn-ghost btn-circle avatar btn-sm cursor-pointer ring-2 ring-primary/20 hover:ring-primary transition-all">
                <div className="w-8 rounded-full">
                  <img 
                    src={user.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`} 
                    alt={user.name} 
                  />
                </div>
              </label>
              <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow-2xl bg-base-100 rounded-2xl w-56 border border-base-200 mt-3 space-y-1">
                <li className="menu-title px-3 py-2 border-b border-base-200">
                  <span className="font-bold text-sm text-base-content">{user.name}</span>
                  <span className="text-xs text-base-content/60 font-normal">@{user.username}</span>
                </li>
                <li>
                  <Link to={`/profile/${user._id}`} className="py-2.5 rounded-xl">
                    View Profile
                  </Link>
                </li>
                <li>
                  <Link to="/saved" className="py-2.5 rounded-xl">
                    Saved Posts
                  </Link>
                </li>
                <li>
                  <Link to="/settings" className="py-2.5 rounded-xl">
                    <Settings size={16} /> Settings
                  </Link>
                </li>
                {user.isAdmin && (
                  <li>
                    <Link to="/admin/dashboard" className="py-2.5 rounded-xl text-primary font-semibold">
                      <Shield size={16} /> Admin Panel
                    </Link>
                  </li>
                )}
                <div className="divider my-1"></div>
                <li>
                  <button onClick={handleLogout} className="py-2.5 rounded-xl text-error hover:bg-error/10">
                    <LogOut size={16} /> Logout
                  </button>
                </li>
              </ul>
            </div>
          </>
        )}
      </div>
    </header>
  );
};

export default Navbar;