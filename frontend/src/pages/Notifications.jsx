import { useState, useEffect } from 'react';
import { getNotifications, markAsRead, markAllAsRead } from '../services/notificationService';
import { formatTimeAgo } from '../utils/dateFormatter';
import { Bell, Heart, MessageCircle, UserPlus, CheckCircle } from 'lucide-react';
import { Link, useOutletContext } from 'react-router-dom';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { setUnreadNotifications } = useOutletContext();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data } = await getNotifications();
        setNotifications(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id);
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadNotifications(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAll = async () => {
    try {
      await markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      setUnreadNotifications(0);
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type) => {
    switch(type) {
      case 'like': return <Heart size={20} className="text-error" />;
      case 'comment': return <MessageCircle size={20} className="text-primary" />;
      case 'follow': return <UserPlus size={20} className="text-info" />;
      default: return <Bell size={20} />;
    }
  };

  const getLink = (notif) => {
    if (notif.type === 'follow') return `/profile/${notif.sender?._id}`;
    if (notif.post) return `/post/${notif.post}`;
    return '#';
  };

  return (
    <div className="pb-20 md:pb-4 max-w-xl mx-auto min-h-screen">
      <div className="sticky top-16 bg-base-100 z-10 p-4 border-b border-base-200 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Notifications</h1>
        {notifications.some(n => !n.isRead) && (
          <button onClick={handleMarkAll} className="btn btn-sm btn-ghost text-primary flex gap-2">
            <CheckCircle size={16} /> Mark all as read
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center p-8"><span className="loading loading-spinner text-primary loading-lg"></span></div>
      ) : notifications.length === 0 ? (
        <div className="text-center p-12 text-base-content/50">
          <p className="text-xl font-medium mb-2">No notifications yet</p>
          <p>When someone interacts with you, you'll see it here.</p>
        </div>
      ) : (
        <div className="divide-y divide-base-200">
          {notifications.map(notif => (
            <div 
              key={notif._id} 
              className={`p-4 flex gap-4 ${notif.isRead ? 'bg-base-100' : 'bg-primary/5'} hover:bg-base-200/50 transition-colors`}
              onClick={() => !notif.isRead && handleMarkAsRead(notif._id)}
            >
              <div className="mt-1">
                {getIcon(notif.type)}
              </div>
              <div className="flex-1">
                <Link to={getLink(notif)} className="block">
                  <p className="text-sm">
                    <span className="font-bold">{notif.sender?.name}</span> {notif.message || (notif.type === 'like' ? 'liked your post' : notif.type === 'comment' ? 'commented on your post' : 'followed you')}
                  </p>
                  <p className="text-xs text-base-content/60 mt-1">{formatTimeAgo(notif.createdAt)}</p>
                </Link>
              </div>
              {!notif.isRead && (
                <div className="w-2 h-2 rounded-full bg-primary self-center"></div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
