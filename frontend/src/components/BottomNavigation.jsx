import { Link, useLocation } from 'react-router-dom';
import { Home, Send, Search, User } from 'lucide-react';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const BottomNavigation = () => {
  const location = useLocation();
  const { user } = useContext(AuthContext);

  if (!user) return null;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-base-100 border-t border-base-200 flex justify-around items-center py-2 z-50 pb-safe">
      <Link to="/" className={`p-2 ${location.pathname === '/' ? 'text-primary' : 'text-base-content/60'}`}>
        <Home size={26} strokeWidth={location.pathname === '/' ? 2.5 : 2} />
      </Link>

      <Link to="/create" className={`p-2 ${location.pathname === '/create' ? 'text-primary' : 'text-base-content/60'}`}>
        <div className="bg-primary text-primary-content p-2 rounded-xl shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        </div>
      </Link>
      <Link to="/messages" className={`p-2 ${location.pathname.startsWith('/messages') ? 'text-primary' : 'text-base-content/60'}`}>
        <Send size={26} strokeWidth={location.pathname.startsWith('/messages') ? 2.5 : 2} />
      </Link>
      <Link to="/search" className={`p-2 ${location.pathname === '/search' ? 'text-primary' : 'text-base-content/60'}`}>
        <Search size={26} strokeWidth={location.pathname === '/search' ? 2.5 : 2} />
      </Link>
      <Link to="/profile" className={`p-2 ${location.pathname.startsWith('/profile') ? 'text-primary' : 'text-base-content/60'}`}>
        <User size={26} strokeWidth={location.pathname.startsWith('/profile') ? 2.5 : 2} />
      </Link>
    </div>
  );
};

export default BottomNavigation;
