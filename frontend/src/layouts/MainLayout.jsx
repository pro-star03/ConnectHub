import { Outlet, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import RightSidebar from '../components/RightSidebar';
import { useContext, useEffect, useState } from 'react';
import { SocketContext } from '../context/SocketContext';
import { getNotifications } from '../services/notificationService';
import api from '../services/api';
import { Bell, MessageSquare, X, Megaphone } from 'lucide-react';
import BottomNavigation from '../components/BottomNavigation';

const MainLayout = () => {
  const { socket } = useContext(SocketContext);
  const [toasts, setToasts] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [announcement, setAnnouncement] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getNotifications()
      .then(({ data }) => {
        const unread = data.filter(n => !n.isRead).length;
        setUnreadNotifications(unread);
      })
      .catch(console.error);

    api.get('/posts/announcement')
      .then(({ data }) => {
        if (data?.announcement) setAnnouncement(data.announcement);
      })
      .catch(() => {});
  }, []);

  const addToast = (message, type, image, link) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type, image, link }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

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
      addToast(
        `${data.senderData?.name || 'Someone'} sent you a message`, 
        'message', 
        data.senderData?.profilePicture, 
        `/messages/${data.sender?._id || data.sender || ''}`
      );
    };

    socket.on('notification', handleNotification);
    socket.on('newMessage', handleMessage);

    return () => {
      socket.off('notification', handleNotification);
      socket.off('newMessage', handleMessage);
    };
  }, [socket]);

  const handleToastClick = (toast) => {
    if (toast.type === 'message') {
      setUnreadMessages(0);
    } else {
      setUnreadNotifications(0);
    }
    navigate(toast.link || (toast.type === 'message' ? '/messages' : '/notifications'));
  };

  return (
    <div className="min-h-screen bg-base-200 flex flex-col relative">
      <Navbar unreadNotifications={unreadNotifications} unreadMessages={unreadMessages} />
      
      {/* Platform Announcement Banner */}
      {announcement && (
        <div className="bg-gradient-to-r from-primary to-secondary text-primary-content px-4 py-2 text-xs sm:text-sm font-medium flex items-center justify-between shadow-md z-40">
          <div className="flex items-center gap-2 max-w-5xl mx-auto overflow-hidden">
            <Megaphone className="w-4 h-4 shrink-0 animate-bounce" />
            <span className="truncate">{announcement}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setAnnouncement(null)} 
            className="btn btn-ghost btn-xs btn-circle text-primary-content ml-2 shrink-0"
            title="Dismiss announcement"
          >
            <X size={14} />
          </button>
        </div>
      )}
      
      {/* Toast Notifications Container */}
      <div className="toast toast-top toast-end z-[100] mt-16 max-w-sm">
        {toasts.map(toast => (
          <div 
            key={toast.id} 
            className="alert shadow-xl bg-base-100/95 backdrop-blur-md border border-base-200 cursor-pointer hover:border-primary/50 transition-all rounded-2xl p-3"
            onClick={() => handleToastClick(toast)}
          >
            <div className="flex items-center gap-3">
              {toast.image ? (
                <img src={toast.image} alt="User" className="w-10 h-10 rounded-full object-cover shrink-0 border border-base-200" />
              ) : toast.type === 'message' ? (
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <MessageSquare size={20} className="text-primary" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
                  <Bell size={20} className="text-secondary" />
                </div>
              )}
              <span className="font-semibold text-xs sm:text-sm line-clamp-2">{toast.message}</span>
            </div>
            <button 
              className="btn btn-ghost btn-xs btn-circle ml-1" 
              onClick={(e) => { e.stopPropagation(); setToasts(prev => prev.filter(t => t.id !== toast.id)); }}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      <div className="flex-1 w-full max-w-7xl mx-auto px-0 sm:px-4 lg:px-8 flex relative justify-center gap-6">
        <Sidebar unreadMessages={unreadMessages} unreadNotifications={unreadNotifications} />
        
        <main className="flex-1 w-full max-w-2xl min-h-screen pb-20 md:pb-8 pt-2 sm:pt-4">
          <Outlet context={{ setUnreadMessages, setUnreadNotifications }} />
        </main>
        
        <RightSidebar />
      </div>
      <BottomNavigation />
    </div>
  );
};

export default MainLayout;