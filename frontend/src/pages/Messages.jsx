import { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getMessages, sendMessage, getConversations, markConversationRead } from '../services/messageService';
import { getUserProfile } from '../services/userService';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import { Send, ArrowLeft, Image as ImageIcon, Smile, X, Check, CheckCheck } from 'lucide-react';
import { formatTimeAgo } from '../utils/dateFormatter';
import { imageToBase64 } from '../utils/imageToBase64';

const CHAT_EMOJIS = ['😊', '😂', '🔥', '👍', '❤️', '🎉', '👏', '🙏'];

const Messages = () => {
  const { userId } = useParams();
  const { user: currentUser } = useContext(AuthContext);
  const { socket, isUserOnline } = useContext(SocketContext);
  
  const [messages, setMessages] = useState([]);
  const [targetUser, setTargetUser] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [media, setMedia] = useState(null);
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const scrollToBottom = useCallback((smooth = true) => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
    }, 80);
  }, []);

  // Fetch list of conversations
  const fetchConversations = useCallback(async () => {
    try {
      const { data } = await getConversations();
      setConversations(data || []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations, userId]);

  // Fetch chat history with target user
  useEffect(() => {
    if (!userId) {
      setTargetUser(null);
      setMessages([]);
      return;
    }

    const fetchChat = async () => {
      setLoading(true);
      try {
        const [msgRes, userRes] = await Promise.all([
          getMessages(userId),
          getUserProfile(userId)
        ]);
        setMessages(msgRes.data || []);
        setTargetUser(userRes.data);
        scrollToBottom(false);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchChat();
  }, [userId, scrollToBottom]);

  // Listen for real-time socket events
  useEffect(() => {
    if (!socket || !userId) return;
    
    const handleNewMessage = (data) => {
      const senderId = (typeof data.sender === 'object' ? data.sender?._id : data.sender)?.toString();
      const receiverId = (typeof data.receiver === 'object' ? data.receiver?._id : data.receiver)?.toString();

      if (senderId === userId || receiverId === userId) {
        setMessages(prev => [...prev, data]);
        scrollToBottom(true);
        // Mark as read immediately if current chat is open
        if (senderId === userId) {
          markConversationRead(userId).catch(console.error);
        }
      }
      fetchConversations();
    };

    const handleUserTyping = ({ senderId }) => {
      if (senderId === userId) {
        setIsTyping(true);
      }
    };

    const handleUserStopTyping = ({ senderId }) => {
      if (senderId === userId) {
        setIsTyping(false);
      }
    };

    const handleMessagesRead = ({ readerId }) => {
      if (readerId === userId) {
        setMessages(prev => prev.map(m => ({ ...m, read: true })));
      }
    };

    socket.on('newMessage', handleNewMessage);
    socket.on('userTyping', handleUserTyping);
    socket.on('userStopTyping', handleUserStopTyping);
    socket.on('messagesRead', handleMessagesRead);

    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.off('userTyping', handleUserTyping);
      socket.off('userStopTyping', handleUserStopTyping);
      socket.off('messagesRead', handleMessagesRead);
    };
  }, [socket, userId, scrollToBottom, fetchConversations]);

  const handleInputChange = (e) => {
    setMessageInput(e.target.value);

    if (!socket || !userId) return;

    socket.emit('typing', { receiverId: userId });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stopTyping', { receiverId: userId });
    }, 1500);
  };

  const handleMediaSelect = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image must be less than 5MB');
        return;
      }
      try {
        const base64 = await imageToBase64(file);
        setMedia(base64);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    if ((!messageInput.trim() && !media) || !userId) return;
    
    if (socket) {
      socket.emit('stopTyping', { receiverId: userId });
    }

    const textToSend = messageInput.trim();
    const mediaToSend = media;
    setMessageInput('');
    setMedia(null);
    setShowEmoji(false);
    if (fileInputRef.current) fileInputRef.current.value = '';

    try {
      const { data } = await sendMessage(userId, textToSend, mediaToSend);
      setMessages(prev => [...prev, data]);
      scrollToBottom(true);
      fetchConversations();
    } catch (err) {
      console.error(err);
      alert('Failed to send message');
    }
  };

  const isOnline = isUserOnline(userId);
  const targetAvatar = targetUser?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(targetUser?.name || 'User')}&background=random`;

  return (
    <div className="flex h-[calc(100vh-130px)] md:h-[calc(100vh-80px)] max-w-4xl mx-auto border border-base-200/90 rounded-3xl overflow-hidden bg-base-100 shadow-sm">
      {/* Sidebar (List of conversations) */}
      <div className={`w-full md:w-80 border-r border-base-200 bg-base-100 flex flex-col ${userId ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-base-200/80">
          <h2 className="font-bold text-xl tracking-tight">Messages</h2>
          <p className="text-xs text-base-content/60 mt-0.5">
            {conversations.length} {conversations.length === 1 ? 'chat' : 'chats'}
          </p>
        </div>

        <div className="overflow-y-auto flex-1 p-2 space-y-1">
          {conversations.length > 0 ? (
            conversations.map(conv => {
              if (!conv.user) return null;
              const convUserId = conv.user._id?.toString();
              const isSelected = userId === convUserId;
              const onlineStatus = isUserOnline(convUserId);

              return (
                <Link 
                  key={convUserId} 
                  to={`/messages/${convUserId}`}
                  className={`flex items-center gap-3 p-3 rounded-2xl transition-all ${
                    isSelected ? 'bg-primary/10 border border-primary/20' : 'hover:bg-base-200/60'
                  }`}
                >
                  <div className="relative shrink-0">
                    <img 
                      src={conv.user.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(conv.user.name)}&background=random`} 
                      alt={conv.user.name} 
                      className="w-12 h-12 rounded-full object-cover border border-base-200"
                    />
                    {onlineStatus && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-base-100 online-pulse"></span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <p className={`text-sm truncate ${conv.unreadCount > 0 ? 'font-black' : 'font-semibold'}`}>
                        {conv.user.name}
                      </p>
                      <span className="text-[11px] text-base-content/50 whitespace-nowrap ml-2">
                        {formatTimeAgo(conv.createdAt)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className={`text-xs truncate ${conv.unreadCount > 0 ? 'font-bold text-primary' : 'text-base-content/60'}`}>
                        {conv.lastMessage || '📷 Photo'}
                      </p>
                      {conv.unreadCount > 0 && (
                        <span className="badge badge-primary badge-xs rounded-full px-1.5 py-0.5 font-bold">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="text-center p-8 text-base-content/50 text-sm">
              <p className="font-semibold">No messages yet</p>
              <p className="text-xs mt-1">Visit a profile or search for a friend to start chatting!</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Window */}
      <div className={`flex-1 flex flex-col bg-base-100 ${!userId ? 'hidden md:flex' : 'flex'}`}>
        {!userId ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-base-content/50">
            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
              <Send size={28} />
            </div>
            <h3 className="text-xl font-bold mb-1">Your Direct Messages</h3>
            <p className="text-xs text-base-content/60 max-w-xs">
              Select an existing conversation on the left, or search for a connection to start talking.
            </p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="p-3.5 border-b border-base-200/80 flex items-center justify-between bg-base-100/90 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <Link to="/messages" className="md:hidden btn btn-ghost btn-circle btn-sm">
                  <ArrowLeft size={18} />
                </Link>
                {targetUser && (
                  <Link to={`/profile/${targetUser._id}`} className="flex items-center gap-3 group">
                    <div className="relative">
                      <img 
                        src={targetAvatar} 
                        alt={targetUser.name} 
                        className="w-10 h-10 rounded-full object-cover border border-base-200"
                      />
                      {isOnline && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-success rounded-full border-2 border-base-100 online-pulse"></span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm group-hover:underline">{targetUser.name}</h3>
                      <p className="text-[11px] flex items-center gap-1.5">
                        {isTyping ? (
                          <span className="text-primary font-bold animate-pulse">typing...</span>
                        ) : isOnline ? (
                          <span className="text-success font-medium">Online</span>
                        ) : (
                          <span className="text-base-content/50">@{targetUser.username}</span>
                        )}
                      </p>
                    </div>
                  </Link>
                )}
              </div>
            </div>

            {/* Chat Messages Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-base-200/20">
              {loading ? (
                <div className="flex justify-center p-8"><span className="loading loading-spinner text-primary"></span></div>
              ) : messages.length === 0 ? (
                <div className="text-center p-8 text-base-content/50 text-xs mt-12">
                  <p className="font-bold text-sm mb-1">No messages yet with {targetUser?.name}</p>
                  <p>Send a friendly message or photo to start the conversation!</p>
                </div>
              ) : (
                messages.map(msg => {
                  const senderId = (typeof msg.sender === 'object' ? msg.sender?._id : msg.sender)?.toString();
                  const isMe = senderId === currentUser?._id?.toString();

                  return (
                    <div key={msg._id} className={`chat ${isMe ? 'chat-end' : 'chat-start'}`}>
                      <div className={`chat-bubble rounded-2xl max-w-sm sm:max-w-md ${
                        isMe ? 'chat-bubble-primary text-primary-content' : 'bg-base-100 text-base-content border border-base-200/80 shadow-sm'
                      }`}>
                        {/* Media image if present */}
                        {msg.media && (
                          <img 
                            src={msg.media} 
                            alt="Attached file" 
                            className="rounded-xl max-h-56 object-cover mb-1.5 border border-white/10" 
                          />
                        )}
                        {msg.message && <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.message}</p>}
                      </div>
                      
                      <div className="chat-footer opacity-60 text-[10px] mt-1 flex items-center gap-1">
                        <span>{formatTimeAgo(msg.createdAt)}</span>
                        {isMe && (
                          msg.read ? (
                            <CheckCheck size={13} className="text-primary font-bold" title="Read" />
                          ) : (
                            <Check size={13} title="Sent" />
                          )
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Media Preview before send */}
            {media && (
              <div className="px-4 py-2 bg-base-200/50 border-t border-base-200 flex items-center gap-3">
                <div className="relative inline-block">
                  <img src={media} alt="Preview" className="h-16 w-16 object-cover rounded-xl border border-base-200" />
                  <button 
                    onClick={() => { setMedia(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                    className="btn btn-circle btn-xs btn-error absolute -top-1.5 -right-1.5 text-white"
                  >
                    <X size={12} />
                  </button>
                </div>
                <span className="text-xs text-base-content/70">Image ready to send</span>
              </div>
            )}

            {/* Quick Emoji Bar */}
            {showEmoji && (
              <div className="flex gap-2 p-2 bg-base-200/60 border-t border-base-200 overflow-x-auto no-scrollbar">
                {CHAT_EMOJIS.map(emoji => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setMessageInput(prev => prev + emoji)}
                    className="text-xl p-1 hover:scale-125 transition-transform"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}

            {/* Message Input Form */}
            <div className="p-3 border-t border-base-200 bg-base-100">
              <form onSubmit={handleSend} className="flex gap-2 items-center">
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={handleMediaSelect}
                />
                
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn btn-ghost btn-circle btn-sm text-primary"
                  title="Attach Photo"
                >
                  <ImageIcon size={19} />
                </button>

                <button 
                  type="button"
                  onClick={() => setShowEmoji(!showEmoji)}
                  className={`btn btn-ghost btn-circle btn-sm ${showEmoji ? 'text-primary bg-primary/10' : 'text-base-content/60'}`}
                  title="Emoji"
                >
                  <Smile size={19} />
                </button>

                <input 
                  type="text" 
                  className="input input-bordered input-sm flex-1 rounded-full px-4 text-sm" 
                  placeholder="Type a message..." 
                  value={messageInput}
                  onChange={handleInputChange}
                />

                <button 
                  type="submit" 
                  className="btn btn-primary btn-circle btn-sm shrink-0" 
                  disabled={!messageInput.trim() && !media}
                >
                  <Send size={15} />
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Messages;
