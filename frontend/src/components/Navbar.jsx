import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { PlusSquare, Heart } from 'lucide-react';

const Navbar = ({ unreadNotifications = 0, unreadMessages = 0 }) => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Create Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <div className="navbar bg-base-100 shadow-sm sticky top-0 z-50 border-b border-base-200 px-4 h-14 min-h-[3.5rem]">
      <div className="flex-none">
        {/* Empty space for flex alignment */}
      </div>
      
      <div className="flex-1 flex justify-center">
        <Link to="/" className="text-xl font-bold font-sans tracking-tight">
          ConnectHub
        </Link>
      </div>
      
      <div className="flex-none gap-2">
        {!user ? (
          <div className="flex gap-2">
            <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
          </div>
        ) : (
          <div className="relative">
            <Link 
              to="/notifications" 
              className="btn btn-ghost btn-circle p-2"
            >
              <div className="indicator">
                <Heart size={26} strokeWidth={2} />
                {unreadNotifications > 0 && (
                  <span className="badge badge-sm badge-primary indicator-item">{unreadNotifications}</span>
                )}
              </div>
            </Link>
          </div>
        )}
      </div>


    </div>
  );
};

export default Navbar;