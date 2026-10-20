import { useState, useEffect } from 'react';
import { getNotifications, markAsRead, markAllAsRead } from '../services/notificationService';
import { formatTimeAgo } from '../utils/dateFormatter';
import { Bell, Heart, MessageCircle, UserPlus, CheckCircle } from 'lucide-react';
import { Link, useOutletContext } from 'react-router-dom';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all' | 'unread'
  const [loading, setLoading] = useState(true);
  const { setUnreadNotifications } = useOutletContext() || {};

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data } = await getNotifications();
        setNotifications(data || []);
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
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      if (setUnreadNotifications) setUnreadNotifications(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAll = async () => {
    try {
      await markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      if (setUnreadNotifications) setUnreadNotifications(0);
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type) => {
    switch(type) {
      case 'like': return <Heart size={18} className="text-error" fill="currentColor" />;
      case 'comment': return <MessageCircle size={18} className="text-primary" />;
      case 'reply': return <MessageCircle size={18} className="text-secondary" />;
      case 'follow': return <UserPlus size={18} className="text-info" />;
      default: return <Bell size={18} className="text-primary" />;
    }
  };

  const getLink = (notif) => {
    if (notif.type === 'follow') return `/profile/${notif.sender?._id || ''}`;
    const postId = notif.relatedPost?._id || notif.relatedPost || notif.post;
    if (postId) return `/post/${postId}`;
    return '#';
  };

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.isRead) 
    : notifications;

  return (
    <div className="pb-20 md:pb-6 max-w-xl mx-auto min-h-screen">
      {/* Header */}
      <div className="sticky top-16 bg-base-100 z-10 p-4 border-b border-base-200 flex justify-between items-center rounded-2xl mb-2 shadow-sm">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Bell size={22} className="text-primary" /> Notifications
          </h1>
          <div className="flex gap-2 mt-1">
            <button 
              onClick={() => setFilter('all')} 
              className={`text-xs font-semibold px-2.5 py-1 rounded-full transition-colors ${filter === 'all' ? 'bg-primary text-primary-content' : 'text-base-content/60 hover:bg-base-200'}`}
            >
              All ({notifications.length})
            </button>
            <button 
              onClick={() => setFilter('unread')} 
              className={`text-xs font-semibold px-2.5 py-1 rounded-full transition-colors ${filter === 'unread' ? 'bg-primary text-primary-content' : 'text-base-content/60 hover:bg-base-200'}`}
            >
              Unread ({notifications.filter(n => !n.isRead).length})
            </button>
          </div>
        </div>

        {notifications.some(n => !n.isRead) && (
          <button onClick={handleMarkAll} className="btn btn-sm btn-ghost text-primary text-xs flex gap-1.5 rounded-full">
            <CheckCircle size={15} /> Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <span className="loading loading-spinner text-primary loading-lg"></span>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="card bg-base-100 border border-base-200 p-12 text-center rounded-2xl mt-4">
          <div className="w-16 h-16 rounded-full bg-base-200 text-base-content/40 flex items-center justify-center mx-auto mb-4">
            <Bell size={28} />
          </div>
          <p className="text-lg font-bold mb-1">
            {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
          </p>
          <p className="text-xs text-base-content/60 max-w-xs mx-auto">
            {filter === 'unread' 
              ? "You're all caught up with everything!" 
              : "When people like your posts, comment, or follow you, updates will show up here."}
          </p>
        </div>
      ) : (
        <div className="space-y-2 mt-2">
          {filteredNotifications.map(notif => {
            const senderName = notif.sender?.name || 'Someone';
            const senderAvatar = notif.sender?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(senderName)}&background=random`;
            const linkUrl = getLink(notif);

            return (
              <div 
                key={notif._id} 
                className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex gap-3.5 items-center ${
                  notif.isRead 
                    ? 'bg-base-100 border-base-200/80 hover:border-base-300' 
                    : 'bg-primary/5 border-primary/20 hover:border-primary/40 shadow-sm'
                }`}
                onClick={() => !notif.isRead && handleMarkAsRead(notif._id)}
              >
                {/* Icon Badge */}
                <div className="p-2.5 rounded-2xl bg-base-200/80 shrink-0">
                  {getIcon(notif.type)}
                </div>

                {/* Avatar */}
                <Link to={`/profile/${notif.sender?._id || ''}`} className="shrink-0">
                  <img 
                    src={senderAvatar} 
                    alt={senderName} 
                    className="w-10 h-10 rounded-full object-cover border border-base-200" 
                  />
                </Link>

                {/* Message Body */}
                <div className="flex-1 min-w-0">
                  <Link to={linkUrl} className="block group">
                    <p className="text-xs sm:text-sm text-base-content group-hover:text-primary transition-colors leading-snug">
                      <strong className="text-base-content font-bold">{senderName}</strong>{' '}
                      {notif.message || (notif.type === 'like' ? 'liked your post' : notif.type === 'comment' ? 'commented on your post' : 'started following you')}
                    </p>
                    <span className="text-[11px] text-base-content/50 block mt-1">
                      {formatTimeAgo(notif.createdAt)}
                    </span>
                  </Link>
                </div>

                {/* Unread dot / Quick mark read */}
                {!notif.isRead && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleMarkAsRead(notif._id); }}
                    className="w-2.5 h-2.5 rounded-full bg-primary shrink-0 hover:scale-125 transition-transform"
                    title="Mark as read"
                  ></button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Notifications;
