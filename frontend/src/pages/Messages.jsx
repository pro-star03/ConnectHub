import { useState, useEffect, useContext, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getMessages, sendMessage, getConversations } from '../services/messageService';
import { getUserProfile } from '../services/userService';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import { Send, ArrowLeft } from 'lucide-react';
import { formatTimeAgo } from '../utils/dateFormatter';

const Messages = () => {
  const { userId } = useParams();
  const { user: currentUser } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);
  
  const [messages, setMessages] = useState([]);
  const [targetUser, setTargetUser] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState([]);
  
  const messagesEndRef = useRef(null);

  // Fetch list of conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const { data } = await getConversations();
        setConversations(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchConversations();
  }, [userId, messages]); // Refetch when a new message is sent

  // Fetch chat history
  useEffect(() => {
    const fetchChat = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const [msgRes, userRes] = await Promise.all([
          getMessages(userId),
          getUserProfile(userId)
        ]);
        setMessages(msgRes.data);
        setTargetUser(userRes.data);
        scrollToBottom();
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchChat();
  }, [userId]);

  // Listen for real-time messages
  useEffect(() => {
    if (!socket || !userId) return;
    
    const handleNewMessage = (data) => {
      if (data.sender === userId || data.receiver === userId) {
        setMessages(prev => [...prev, data]);
        scrollToBottom();
      }
    };
    
    socket.on('newMessage', handleNewMessage);
    return () => socket.off('newMessage', handleNewMessage);
  }, [socket, userId]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !userId) return;
    
    try {
      const { data } = await sendMessage(userId, messageInput);
      setMessages([...messages, data]);
      setMessageInput('');
      scrollToBottom();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex h-[calc(100vh-120px)] md:h-[calc(100vh-64px)] max-w-4xl mx-auto border-x border-base-200">
      {/* Sidebar (List of users) - hide on mobile if chat is open */}
      <div className={`w-full md:w-1/3 border-r border-base-200 bg-base-100 flex flex-col ${userId ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-base-200">
          <h2 className="font-bold text-xl">Messages</h2>
        </div>
        <div className="overflow-y-auto flex-1 p-2">
          {conversations.length > 0 ? (
            conversations.map(conv => (
              <Link 
                key={conv.user._id} 
                to={`/messages/${conv.user._id}`}
                className={`flex items-center gap-3 p-3 rounded-box hover:bg-base-200 transition-colors ${userId === conv.user._id ? 'bg-base-200' : ''}`}
              >
                <div className="avatar placeholder">
                  {conv.user.profilePicture ? (
                    <div className="w-12 h-12 rounded-full">
                      <img src={conv.user.profilePicture} alt={conv.user.name} />
                    </div>
                  ) : (
                    <div className="bg-neutral text-neutral-content rounded-full w-12 h-12">
                      <span className="text-xl">{conv.user.name?.charAt(0).toUpperCase()}</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <p className="font-bold text-sm truncate">{conv.user.name}</p>
                    <span className="text-xs text-base-content/50 whitespace-nowrap ml-2">
                      {formatTimeAgo(conv.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-base-content/70 truncate">
                    {conv.lastMessage}
                  </p>
                </div>
              </Link>
            ))
          ) : (
            <div className="text-center p-4 text-base-content/50 text-sm">
              No conversations yet. Go to a user's profile to start chatting.
            </div>
          )}
        </div>
      </div>

      {/* Chat Window */}
      <div className={`flex-1 flex flex-col bg-base-100 ${!userId ? 'hidden md:flex' : 'flex'}`}>
        {!userId ? (
          <div className="flex-1 flex items-center justify-center text-base-content/50">
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2">Your Messages</h3>
              <p>Select a user to start chatting</p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="p-3 border-b border-base-200 flex items-center gap-3 bg-base-100 sticky top-0 z-10">
              <Link to="/messages" className="md:hidden btn btn-ghost btn-circle btn-sm">
                <ArrowLeft size={20} />
              </Link>
              {targetUser && (
                <>
                  <div className="avatar placeholder">
                    <div className="bg-neutral text-neutral-content rounded-full w-10">
                      <span>{targetUser.name.charAt(0).toUpperCase()}</span>
                    </div>
                  </div>
                  <div>
                    <Link to={`/profile/${targetUser._id}`} className="font-bold hover:underline">{targetUser.name}</Link>
                    <p className="text-xs text-success flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-success inline-block"></span>
                      Online
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-base-200/20">
              {loading ? (
                <div className="flex justify-center p-4"><span className="loading loading-spinner text-primary"></span></div>
              ) : messages.length === 0 ? (
                <div className="text-center text-base-content/50 p-4 text-sm mt-10">
                  No messages yet. Say hi!
                </div>
              ) : (
                messages.map(msg => {
                  const isMe = msg.sender === currentUser?._id;
                  return (
                    <div key={msg._id} className={`chat ${isMe ? 'chat-end' : 'chat-start'}`}>
                      <div className={`chat-bubble ${isMe ? 'chat-bubble-primary' : 'chat-bubble-base-200'}`}>
                        {msg.message}
                      </div>
                      <div className="chat-footer opacity-50 text-xs mt-1">
                        {formatTimeAgo(msg.createdAt)}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-base-200 bg-base-100">
              <form onSubmit={handleSend} className="flex gap-2">
                <input 
                  type="text" 
                  className="input input-bordered flex-1 rounded-full" 
                  placeholder="Message..." 
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                />
                <button type="submit" className="btn btn-primary btn-circle" disabled={!messageInput.trim()}>
                  <Send size={18} />
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
