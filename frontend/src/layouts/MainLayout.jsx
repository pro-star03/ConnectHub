import { Outlet, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useContext, useEffect, useState } from 'react';
import { SocketContext } from '../context/SocketContext';
import { Bell, MessageSquare, X } from 'lucide-react';
import BottomNavigation from '../components/BottomNavigation';

const MainLayout = () => {
  const { socket } = useContext(SocketContext);
  const [toasts, setToasts] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch initial unread notifications
    import('../services/notificationService').then(({ getNotifications }) => {
      getNotifications().then(({ data }) => {
        const unread = data.filter(n => !n.isRead).length;
        setUnreadNotifications(unread);
      }).catch(err => console.error(err));
    });
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleNotification = (data) => {
      setUnreadNotifications(prev => prev + 1);
      
      let link = '/notifications';
      if (data.type === 'follow') link = `/profile/${data.sender?._id}`;
      else if (data.relatedPost) link = `/post/${data.relatedPost}`;
      
      addToast(data.message, 'notification', data.sender?.profilePicture, link);
    };

    const handleMessage = (data) => {
      setUnreadMessages(prev => prev + 1);
      addToast(`${data.senderData?.name || 'Someone'} sent you a message`, 'message', data.senderData?.profilePicture, `/messages/${data.sender || ''}`);
    };

    socket.on('notification', handleNotification);
    socket.on('newMessage', handleMessage);

    return () => {
      socket.off('notification', handleNotification);
      socket.off('newMessage', handleMessage);
    };
  }, [socket]);

  const addToast = (message, type, image, link) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type, image, link }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  const handleToastClick = (toast) => {
    if (toast.type === 'message') {
      setUnreadMessages(0);
    } else {
      setUnreadNotifications(0);
    }
    navigate(toast.link || (toast.type === 'message' ? '/messages' : '/notifications'));
  };

  return (
    <div className="min-h-screen bg-base-100 flex flex-col relative">
      <Navbar unreadNotifications={unreadNotifications} unreadMessages={unreadMessages} />
      
      {/* Toast Container */}
      <div className="toast toast-top toast-end z-[100] mt-16">
        {toasts.map(toast => (
          <div 
            key={toast.id} 
            className="alert shadow-lg bg-base-100 border border-base-200 cursor-pointer hover:bg-base-200 transition-colors rounded-xl"
            onClick={() => handleToastClick(toast)}
          >
            <div className="flex items-center gap-3">
              {toast.image ? (
                <img src={toast.image} alt="User" className="w-10 h-10 rounded-full object-cover" />
              ) : toast.type === 'message' ? (
                <MessageSquare className="text-primary" />
              ) : (
                <Bell className="text-primary" />
              )}
              <span className="font-medium text-sm">{toast.message}</span>
            </div>
            <button 
              className="btn btn-ghost btn-xs btn-circle ml-2" 
              onClick={(e) => { e.stopPropagation(); setToasts(prev => prev.filter(t => t.id !== toast.id)) }}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      <div className="flex-1 w-full max-w-6xl mx-auto px-0 sm:px-4 lg:px-8 flex relative justify-center gap-6">
        <Sidebar unreadMessages={unreadMessages} />
        
        <main className="flex-1 w-full max-w-2xl min-h-screen pb-20 md:pb-8 pt-4 sm:pt-6">
          <Outlet context={{ setUnreadMessages, setUnreadNotifications }} />
        </main>
        
        <div className="hidden lg:block w-64 pt-6">
          {/* Right column placeholder for balance */}
        </div>
      </div>
      <BottomNavigation />
    </div>
  );
};

export default MainLayout;