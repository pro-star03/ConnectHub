import { useContext, useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  BarChart3 as ChartBarIcon,
  Users as UsersIcon,
  FileText as DocumentTextIcon,
  Flag as FlagIcon,
  AlertTriangle as ExclamationTriangleIcon,
  MessageSquare as ChatBubbleLeftRightIcon,
  Settings as Cog6ToothIcon,
  LogOut as ArrowLeftOnRectangleIcon,
  Menu as Bars3Icon,
  Sun as SunIcon,
  Moon as MoonIcon
} from 'lucide-react';

const AdminLayout = () => {
  const { user, logoutUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logoutUser();
    navigate('/admin/login');
  };

  const [adminTheme, setAdminTheme] = useState(() => localStorage.getItem('adminTheme') || 'dark');

  useEffect(() => {
    const handleThemeChange = () => {
      setAdminTheme(localStorage.getItem('adminTheme') || 'dark');
    };
    window.addEventListener('storage', handleThemeChange);
    window.addEventListener('adminThemeChanged', handleThemeChange);
    return () => {
      window.removeEventListener('storage', handleThemeChange);
      window.removeEventListener('adminThemeChanged', handleThemeChange);
    };
  }, []);

  const toggleTheme = () => {
    const nextTheme = adminTheme === 'dark' ? 'light' : 'dark';
    setAdminTheme(nextTheme);
    localStorage.setItem('adminTheme', nextTheme);
    window.dispatchEvent(new Event('adminThemeChanged'));
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: ChartBarIcon },
    { name: 'Users', path: '/admin/users', icon: UsersIcon },
    { name: 'Posts', path: '/admin/posts', icon: DocumentTextIcon },
    { name: 'Reports', path: '/admin/reports', icon: FlagIcon },
    { name: 'Suspicious Users', path: '/admin/suspicious-users', icon: ExclamationTriangleIcon },
    { name: 'Feedback', path: '/admin/feedback', icon: ChatBubbleLeftRightIcon },
    { name: 'Settings', path: '/admin/settings', icon: Cog6ToothIcon },
  ];

  return (
    <div className="flex h-screen bg-base-200" data-theme={adminTheme}>
      {/* Mobile Drawer */}
      <div className="drawer lg:drawer-open">
        <input id="admin-drawer" type="checkbox" className="drawer-toggle" />
        
        <div className="drawer-content flex flex-col h-screen overflow-hidden">
          {/* Navbar for mobile */}
          <div className="w-full navbar bg-base-100 lg:hidden shadow-sm">
            <div className="flex-none">
              <label htmlFor="admin-drawer" className="btn btn-square btn-ghost">
                <Bars3Icon className="w-6 h-6" />
              </label>
            </div>
            <div className="flex-1 px-2 mx-2 font-bold text-xl text-primary">ConnectHub Admin</div>
            <div className="flex-none">
              <button type="button" onClick={toggleTheme} className="btn btn-square btn-ghost">
                {adminTheme === 'dark' ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
              </button>
            </div>
          </div>
          
          {/* Main Content */}
          <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-base-200">
            <Outlet />
          </main>
        </div> 
        
        <div className="drawer-side z-50 shadow-lg">
          <label htmlFor="admin-drawer" className="drawer-overlay"></label> 
          <div className="w-72 min-h-full bg-base-100 text-base-content flex flex-col">
            <div className="p-6 mb-4">
              <h1 className="text-2xl font-black text-primary tracking-tight">Admin Panel</h1>
              <p className="text-sm opacity-70 mt-1">ConnectHub Management</p>
            </div>
            
            <ul className="menu p-4 w-full flex-1 gap-2">
              {navItems.map((item) => (
                <li key={item.name}>
                  <Link 
                    to={item.path} 
                    className={`${location.pathname === item.path ? 'active bg-primary text-primary-content' : 'hover:bg-base-200'}`}
                    onClick={() => {
                      document.getElementById('admin-drawer').checked = false;
                    }}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="p-4 mt-auto border-t border-base-300">
              <button 
                type="button"
                onClick={toggleTheme} 
                className="btn btn-outline btn-sm w-full gap-2 mb-3"
              >
                {adminTheme === 'dark' ? <SunIcon className="w-4 h-4" /> : <MoonIcon className="w-4 h-4" />}
                {adminTheme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </button>
              <div className="flex items-center gap-3 mb-4 px-2">
                <div className="avatar placeholder">
                  <div className="bg-neutral-focus text-neutral-content rounded-full w-10">
                    <span className="text-sm">{user?.name?.charAt(0) || 'A'}</span>
                  </div>
                </div>
                <div>
                  <div className="font-bold text-sm">{user?.name}</div>
                  <div className="text-xs opacity-60">Admin</div>
                </div>
              </div>
              <Link to="/" className="btn btn-ghost btn-sm w-full gap-2 mb-2 text-primary font-semibold">
                ← Community Feed
              </Link>
              <button onClick={handleLogout} className="btn btn-outline btn-error w-full gap-2">
                <ArrowLeftOnRectangleIcon className="w-5 h-5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
