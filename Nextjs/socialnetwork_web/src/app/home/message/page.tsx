'use client';
import Navbar from '@/components/Navbar';
import { messageService } from '@/services/message.service';
import { accountService } from '@/services/accout.service';
import { useAlert } from '@/components/Alert/alertcontext';
import { NETWORK } from '@/config/config';
import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { MessageSquare, Search, Send, User, Phone, Video, Info, Loader2, Smile } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

function MessageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const directUserId = searchParams.get('userId');
  const { showSuccess, showError } = useAlert();

  // Socket state ref
  const socketRef = useRef<Socket | null>(null);

  // States
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConv, setSelectedConv] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [messageInput, setMessageInput] = useState('');
  const [loadingConv, setLoadingConv] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Ref to always have the latest selectedConv in the socket listener without reconnecting
  const selectedConvRef = useRef(selectedConv);
  useEffect(() => {
    selectedConvRef.current = selectedConv;
  }, [selectedConv]);

  // Auto-adjust height of composer textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '40px';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [messageInput]);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load User profile from server (to get correct _id or id)
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const profile = await accountService.getProfile();
        setCurrentUser(profile);
      } catch (err) {
        console.error('Failed to load user profile in message page:', err);
      }
    };
    fetchUserProfile();
  }, []);

  // Fetch conversations list
  const fetchConversations = async (selectUserId?: string) => {
    setLoadingConv(true);
    try {
      const data = await messageService.getConversations();
      setConversations(data);

      if (selectUserId) {
        // Look for an existing direct conversation with this user
        const existing = data.find((c: any) => 
          !c.isGroup && c.members.some((m: any) => m._id === selectUserId)
        );

        if (existing) {
          setSelectedConv(existing);
        } else {
          // Create new conversation
          try {
            const newConvRes = await messageService.createConversation(selectUserId);
            const newConv = newConvRes.conversation || newConvRes;
            setConversations(prev => [newConv, ...prev]);
            setSelectedConv(newConv);
          } catch (err) {
            console.error('Failed to create new conversation:', err);
            showError('Không thể bắt đầu hội thoại.');
          }
        }
      } else if (data.length > 0 && !selectedConv) {
        setSelectedConv(data[0]);
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
      showError('Không thể tải danh sách cuộc trò chuyện.');
    } finally {
      setLoadingConv(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchConversations(directUserId || undefined);
  }, [directUserId]);

  // Connect Socket.io ONCE on mount
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) return;

    const socketUrl = NETWORK.wsUrl.replace('ws://', 'http://').replace('wss://', 'https://');
    const socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('⚡ Connected to socket server');
      // Re-join active room if connection lost and recovered
      if (selectedConvRef.current) {
        socket.emit('join_room', selectedConvRef.current._id);
      }
    });

    // Listen for new messages
    socket.on('receive_message', (message: any) => {
      setMessages(prev => {
        // Prevent duplicate messages
        if (prev.some(m => m._id === message._id)) return prev;
        if (message.conversationId === selectedConvRef.current?._id) {
          return [...prev, message];
        }
        return prev;
      });

      // Update last message in conversations list
      setConversations(prev => {
        return prev.map(c => {
          if (c._id === message.conversationId) {
            return {
              ...c,
              lastMessage: message,
              updatedAt: message.createdAt
            };
          }
          return c;
        }).sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());
      });
    });

    // Listen for general conversation updates
    socket.on('conversation_updated', (data: any) => {
      setConversations(prev => {
        const index = prev.findIndex(c => c._id === data.conversationId);
        if (index !== -1) {
          const updated = [...prev];
          updated[index] = {
            ...updated[index],
            lastMessage: data.lastMessage,
            updatedAt: data.updatedAt
          };
          return updated.sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());
        }
        return prev;
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Join selected conversation room and fetch message history when selectedConv changes
  useEffect(() => {
    if (!selectedConv) return;

    const loadMessages = async () => {
      setLoadingMsgs(true);
      try {
        const data = await messageService.getMessages(selectedConv._id);
        setMessages(data);
        // Mark as read
        await messageService.markAsRead(selectedConv._id);
      } catch (err) {
        console.error('Error fetching messages:', err);
        showError('Không thể tải tin nhắn.');
      } finally {
        setLoadingMsgs(false);
      }
    };

    loadMessages();

    // Join room on current socket instance
    if (socketRef.current) {
      socketRef.current.emit('join_room', selectedConv._id);
    }
  }, [selectedConv]);

  // Handle Send Message (Matches Flutter socket-only implementation)
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedConv) return;

    const content = messageInput.trim();
    setMessageInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = '40px';
    }

    if (socketRef.current) {
      // Emit the socket event - the backend will write this to DB and broadcast via 'receive_message'
      socketRef.current.emit('send_message', {
        conversationId: selectedConv._id,
        content,
        type: 'text'
      });
    } else {
      showError('Mất kết nối máy chủ chat.');
    }
  };

  const getChatPartner = (conv: any) => {
    if (conv.isGroup) return { name: conv.name, avatar: conv.avatar };
    const partner = conv.members?.find((m: any) => m._id !== currentUser?.id && m._id !== currentUser?._id);
    return partner || { username: 'Người dùng', avatar: '' };
  };

  const formatTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  const filteredConversations = conversations.filter(c => {
    const partner = getChatPartner(c);
    const name = c.isGroup ? c.name : (partner.username || '');
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="h-screen overflow-hidden bg-grey/5 flex flex-col font-sans">
      <Navbar activeTab="message" />

      {/* Main Messaging Container */}
      <div className="flex-1 pt-16 flex overflow-hidden h-[calc(100vh-64px)]">
        
        {/* Left Panel: Conversations List */}
        <div className="w-80 md:w-96 bg-white border-r border-grey/20 flex flex-col flex-shrink-0">
          
          {/* Search bar inside messenger */}
          <div className="p-4 border-b border-grey/10">
            <div className="flex items-center bg-grey/10 hover:bg-grey/15 transition rounded-full px-3.5 py-2">
              <Search className="w-4.5 h-4.5 text-grey mr-2 flex-shrink-0" />
              <input 
                type="text" 
                placeholder="Tìm kiếm cuộc trò chuyện..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-sm w-full placeholder-grey/60 text-grey-hover font-medium"
              />
            </div>
          </div>

          {/* Conversations list scrollable */}
          <div className="flex-1 overflow-y-auto divide-y divide-grey/5">
            {loadingConv ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-6 h-6 animate-spin text-blue mr-2" />
                <span className="text-sm text-grey font-bold">Đang tải cuộc trò chuyện...</span>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="text-center py-12 text-grey">
                <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm font-semibold">Không tìm thấy cuộc trò chuyện nào</p>
              </div>
            ) : (
              filteredConversations.map((chat) => {
                const partner = getChatPartner(chat);
                const isSelected = selectedConv?._id === chat._id;
                const partnerName = chat.isGroup ? chat.name : partner.username;
                const partnerAvatar = chat.isGroup ? chat.avatar : partner.avatar;
                
                // Active/online status
                const isOnline = !chat.isGroup && partner.isOnline;

                return (
                  <div
                    key={chat._id}
                    onClick={() => setSelectedConv(chat)}
                    className={`flex items-center gap-3.5 p-4 cursor-pointer transition duration-150 ${
                      isSelected 
                        ? 'bg-blue/5 border-l-4 border-blue' 
                        : 'hover:bg-grey/5'
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-grey/10 border border-grey/25 overflow-hidden flex items-center justify-center">
                        {partnerAvatar ? (
                          <img src={partnerAvatar} alt={partnerName} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-6 h-6 text-grey/60" />
                        )}
                      </div>
                      {isOnline && (
                        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />
                      )}
                    </div>

                    {/* Chat Text Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1">
                        <h4 className="font-bold text-grey-hover truncate text-[14.5px]">{partnerName}</h4>
                        {chat.lastMessage && (
                          <span className="text-[10px] text-grey/60">
                            {formatTime(chat.lastMessage.createdAt)}
                          </span>
                        )}
                      </div>
                      <p className="text-xs truncate text-grey/70">
                        {chat.lastMessage ? chat.lastMessage.content : 'Chưa có tin nhắn'}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Panel: Chat Room Details */}
        <div className="flex-1 bg-white flex flex-col min-w-0">
          {selectedConv ? (
            <>
              {/* Chat Header */}
              {(() => {
                const partner = getChatPartner(selectedConv);
                const partnerName = selectedConv.isGroup ? selectedConv.name : partner.username;
                const partnerAvatar = selectedConv.isGroup ? selectedConv.avatar : partner.avatar;
                const isOnline = !selectedConv.isGroup && partner.isOnline;

                return (
                  <div className="h-16 px-6 border-b border-grey/20 flex items-center justify-between flex-shrink-0 bg-white">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-grey/10 border border-grey/25 overflow-hidden flex items-center justify-center flex-shrink-0">
                        {partnerAvatar ? (
                          <img src={partnerAvatar} alt={partnerName} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-5 h-5 text-grey/60" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-grey-hover truncate text-base">{partnerName}</h3>
                        <p className={`text-[11px] font-semibold ${isOnline ? 'text-green-500' : 'text-grey/50'}`}>
                          {isOnline ? 'Đang hoạt động' : 'Ngoại tuyến'}
                        </p>
                      </div>
                    </div>

                    {/* Call controls */}
                    <div className="flex items-center gap-1">
                      <button className="p-2 rounded-full hover:bg-grey/10 text-grey transition border-0 bg-transparent cursor-pointer">
                        <Phone className="w-5 h-5" />
                      </button>
                      <button className="p-2 rounded-full hover:bg-grey/10 text-grey transition border-0 bg-transparent cursor-pointer">
                        <Video className="w-5 h-5" />
                      </button>
                      <button className="p-2 rounded-full hover:bg-grey/10 text-grey transition border-0 bg-transparent cursor-pointer">
                        <Info className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* Chat Room Messages List */}
              <div className="flex-1 p-4 bg-grey/5 overflow-y-auto space-y-4">
                {loadingMsgs ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-8 h-8 animate-spin text-blue mr-2" />
                    <span className="text-grey font-bold">Đang tải tin nhắn...</span>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6">
                    <MessageSquare className="w-12 h-12 text-blue/30 mb-2" />
                    <h4 className="font-bold text-grey-hover">Chưa có cuộc trò chuyện nào</h4>
                    <p className="text-xs text-grey/50 mt-1">Hãy bắt đầu gửi tin nhắn đầu tiên cho họ!</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const currentUserId = currentUser?._id || currentUser?.id;
                    const senderId = typeof msg.sender === 'object' ? (msg.sender?._id || msg.sender?.id) : msg.sender;
                    const isOwnMessage = senderId && currentUserId && (senderId === currentUserId);

                    const senderName = msg.sender?.username || 'Bạn bè';
                    const senderAvatar = msg.sender?.avatar;

                    return (
                      <div 
                        key={msg._id} 
                        className={`flex gap-3 max-w-[85%] ${
                          isOwnMessage ? 'ml-auto flex-row-reverse' : ''
                        }`}
                      >
                        {/* Avatar */}
                        {!isOwnMessage && selectedConv.isGroup && (
                          <div className="w-8 h-8 rounded-full overflow-hidden border border-grey/25 bg-grey/10 flex items-center justify-center flex-shrink-0">
                            {senderAvatar ? (
                              <img src={senderAvatar} alt={senderName} className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-4 h-4 text-grey/60" />
                            )}
                          </div>
                        )}

                        <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                          {/* Group sender name */}
                          {!isOwnMessage && selectedConv.isGroup && (
                            <span className="text-[10px] text-grey/60 font-semibold mb-1 ml-1">
                              {senderName}
                            </span>
                          )}

                          {/* Bubble box */}
                          <div 
                            className={`p-3 rounded-2xl text-[14px] leading-relaxed break-words max-w-xs md:max-w-md ${
                              isOwnMessage 
                                ? 'bg-blue text-white rounded-br-none' 
                                : 'bg-[#D6D6D6] text-black rounded-bl-none shadow-sm'
                            }`}
                          >
                            <p className="whitespace-pre-wrap text-justify">{msg.content}</p>
                          </div>

                          {/* Timestamp outside bubble */}
                          <span className="block text-[10px] mt-1 text-grey/50 font-semibold px-1">
                            {formatTime(msg.createdAt)}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Composer */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-grey/20 bg-white flex items-center gap-3">
                <button type="button" className="p-2 rounded-full hover:bg-grey/10 text-grey transition border-0 bg-transparent cursor-pointer flex-shrink-0">
                  <Smile className="w-5 h-5" />
                </button>

                <textarea 
                  ref={textareaRef}
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                  placeholder="Nhập tin nhắn..." 
                  rows={1}
                  className="flex-1 bg-grey/10 border-none outline-none text-sm rounded-2xl py-2.5 px-5 text-grey-hover focus:bg-white focus:ring-1 focus:ring-blue transition-all resize-none max-h-32 overflow-y-auto align-middle"
                />

                <button 
                  type="submit"
                  disabled={!messageInput.trim()}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition border-none flex-shrink-0 cursor-pointer ${
                    messageInput.trim() 
                      ? 'bg-blue text-white hover:bg-blue-hover active:scale-95 shadow-sm' 
                      : 'bg-grey/20 text-grey/40 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-4.5 h-4.5" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-grey/5">
              <div className="w-16 h-16 rounded-full bg-blue/10 text-blue flex items-center justify-center mb-4">
                <MessageSquare className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-grey-hover mb-1">Chưa chọn hội thoại</h3>
              <p className="text-sm text-grey/60">Chọn một cuộc trò chuyện từ danh sách bên trái để bắt đầu nhắn tin.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default function MessagePage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-grey/5">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue border-t-transparent"></div>
      </div>
    }>
      <MessageContent />
    </Suspense>
  );
}
