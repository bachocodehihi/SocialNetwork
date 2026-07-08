'use client';
import Navbar from '@/components/Navbar';
import { messageService } from '@/services/message.service';
import { accountService } from '@/services/accout.service';
import { useAlert } from '@/components/Alert/alertcontext';
import { NETWORK } from '@/config/config';
import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { MessageSquare, Search, Send, User, Phone, Video, Info, Loader2, Smile, FileText, Download, Play, Pause, Paperclip, Image as ImageIcon, Bell, QrCode, Trash2, LogOut, Edit, AlertTriangle, Slash, Users } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { useCall } from '@/components/Call/CallProvider';

// Custom Audio Player Bubble matching Flutter's layout
function AudioPlayerBubble({ url, isOwnMessage }: { url: string; isOwnMessage: boolean }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(err => console.error("Play failed:", err));
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const formatDuration = (secs: number) => {
    if (isNaN(secs)) return '00:00';
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = Math.floor(secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="flex items-center gap-3 py-1">
      <audio 
        ref={audioRef} 
        src={url} 
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />
      <button 
        type="button"
        onClick={togglePlay}
        className={`w-9 h-9 rounded-full flex items-center justify-center cursor-pointer border-0 transition-all flex-shrink-0 ${
          isOwnMessage 
            ? 'bg-white/20 text-white hover:bg-white/30' 
            : 'bg-blue text-white hover:bg-blue/90'
        }`}
      >
        {isPlaying ? (
          <Pause className="w-4 h-4 fill-current" />
        ) : (
          <Play className="w-4 h-4 fill-current ml-0.5" />
        )}
      </button>

      <div className="flex flex-col gap-1 min-w-[120px]">
        {/* Progress bar */}
        <div className={`h-1 rounded-full relative w-full ${isOwnMessage ? 'bg-white/30' : 'bg-black/10'}`}>
          <div 
            className={`h-full rounded-full ${isOwnMessage ? 'bg-white' : 'bg-blue'}`}
            style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
          />
        </div>
        {/* Time info */}
        <span className={`text-[10px] font-semibold ${isOwnMessage ? 'text-white/80' : 'text-grey/70'}`}>
          {formatDuration(currentTime)} / {formatDuration(duration || 0)}
        </span>
      </div>
    </div>
  );
}

// Custom File Bubble matching Flutter's layout and icon mappings
function FileBubble({ url, filename, isOwnMessage }: { url: string; filename: string; isOwnMessage: boolean }) {
  const ext = filename.split('.').pop()?.toLowerCase() || '';

  const getFileAssetAndMeta = () => {
    switch (ext) {
      case 'doc':
      case 'docx':
        return { path: '/assets/file/word.png', bg: 'bg-blue/10 text-blue', label: 'Word Document' };
      case 'xls':
      case 'xlsx':
        return { path: '/assets/file/excel.png', bg: 'bg-green-600/10 text-green-600', label: 'Excel Spreadsheet' };
      case 'ppt':
      case 'pptx':
        return { path: '/assets/file/powerpoint.png', bg: 'bg-orange-600/10 text-orange-600', label: 'PowerPoint' };
      case 'py':
        return { path: '/assets/file/python.png', bg: 'bg-yellow-600/10 text-yellow-600', label: 'Python Script' };
      case 'mdb':
      case 'accdb':
        return { path: '/assets/file/access.png', bg: 'bg-red-600/10 text-red-600', label: 'Access Database' };
      case 'zip':
      case 'rar':
      case '7z':
      case 'tar':
      case 'gz':
        return { path: '/assets/file/zip.png', bg: 'bg-amber-600/10 text-amber-600', label: 'Archive' };
      case 'mp4':
      case 'avi':
      case 'mkv':
      case 'mov':
      case 'flv':
      case 'wmv':
      case 'mpeg':
      case 'mpg':
      case 'mp3':
      case 'wav':
      case 'wma':
      case 'm4a':
      case 'flac':
      case 'ogg':
        return { path: '/assets/file/windowsmediaplayer.png', bg: 'bg-purple-600/10 text-purple-600', label: 'Media File' };
      default:
        return { path: '/assets/file/document.png', bg: 'bg-grey/15 text-grey-hover', label: 'Document' };
    }
  };

  const fileMeta = getFileAssetAndMeta();

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      // Fallback: Use Supabase/Cloudinary query param or direct link
      const downloadUrl = url.includes('?') 
        ? `${url}&download=${encodeURIComponent(filename)}` 
        : `${url}?download=${encodeURIComponent(filename)}`;
      window.open(downloadUrl, '_blank');
    }
  };

  return (
    <div 
      onClick={handleDownload}
      className="flex items-center gap-3 py-1 text-inherit no-underline cursor-pointer group"
    >
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-white p-1.5 shadow-sm`}>
        <img 
          src={fileMeta.path} 
          alt={fileMeta.label} 
          className="w-full h-full object-contain" 
        />
      </div>

      <div className="flex-1 min-w-0 max-w-[200px]">
        <p className={`text-sm font-semibold truncate ${isOwnMessage ? 'text-white' : 'text-black'}`}>
          {filename}
        </p>
        <span className={`text-[10px] block ${isOwnMessage ? 'text-white/75' : 'text-grey/60'}`}>
          {ext.toUpperCase()} • {fileMeta.label}
        </span>
      </div>

      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition ${
        isOwnMessage 
          ? 'bg-white/10 hover:bg-white/20 text-white' 
          : 'bg-grey/10 hover:bg-grey/25 text-grey-hover'
      }`}>
        <Download className="w-4 h-4" />
      </div>
    </div>
  );
}

// Custom Link Preview Card using Google's Favicon service
interface LinkPreviewData {
  title: string;
  image: string;
  description: string;
}

function LinkPreviewCard({ url, isOwnMessage }: { url: string; isOwnMessage: boolean }) {
  const [preview, setPreview] = useState<LinkPreviewData | null>(null);
  const [loading, setLoading] = useState(true);

  let domain = '';
  try {
    domain = new URL(url).hostname;
  } catch (e) {
    return null;
  }

  useEffect(() => {
    let active = true;
    setLoading(true);
    messageService.getLinkPreview(url)
      .then(res => {
        if (active && res.success) {
          setPreview({
            title: res.title,
            image: res.image,
            description: res.description
          });
        }
      })
      .catch(err => {
        console.error('Failed to load link preview', err);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [url]);

  const getPlatformIcon = () => {
    try {
      const parsedUrl = new URL(url);
      const host = parsedUrl.hostname.toLowerCase();
      const path = parsedUrl.pathname.toLowerCase();

      if (host.includes('youtube.com') || host.includes('youtu.be')) {
        return '/assets/link/youtube.png';
      }
      if (host.includes('facebook.com') || host.includes('fb.com')) {
        return '/assets/link/facebook.png';
      }
      if (host.includes('tiktok.com')) {
        return '/assets/link/tiktok.png';
      }
      if (host.includes('zalo.me')) {
        return '/assets/link/zalo.png';
      }
      if (host.includes('instagram.com')) {
        return '/assets/link/instagram.png';
      }
      if (host.includes('linkedin.com')) {
        return '/assets/link/linkedin.png';
      }
      if (host.includes('drive.google.com')) {
        return '/assets/link/googledrive.png';
      }
      if (host.includes('google.com') && (path.includes('/maps') || host.includes('maps.google.com'))) {
        return '/assets/link/googlemaps.png';
      }
      if (host.includes('steampowered.com') || host.includes('steamcommunity.com')) {
        return '/assets/link/steam.png';
      }
      
      return `https://www.google.com/s2/favicons?domain=${host}&sz=64`;
    } catch (e) {
      return '/assets/link/chrome.png';
    }
  };

  const iconUrl = getPlatformIcon();

  if (loading) {
    return (
      <div className="mt-2 flex items-center gap-2 p-2 rounded-xl border bg-grey/5 border-grey/10 animate-pulse w-60">
        <div className="w-6 h-6 rounded-md bg-grey/20 flex-shrink-0" />
        <div className="flex-1 space-y-1">
          <div className="h-3 bg-grey/20 rounded w-1/3" />
          <div className="h-2.5 bg-grey/20 rounded w-1/2" />
        </div>
      </div>
    );
  }

  if (!preview || (!preview.title && !preview.image)) {
    return (
      <a 
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={`mt-2 flex items-center gap-2.5 p-2 rounded-xl text-inherit no-underline border transition-all hover:bg-grey/10 cursor-pointer block ${
          isOwnMessage 
            ? 'bg-white/10 border-white/10 hover:border-white/20' 
            : 'bg-grey/5 border-grey/10 hover:border-grey/20'
        }`}
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md overflow-hidden bg-white flex items-center justify-center flex-shrink-0 shadow-sm border border-grey/10">
            <img 
              src={iconUrl} 
              alt={domain} 
              className="w-4.5 h-4.5 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/assets/link/chrome.png'; 
              }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs font-semibold truncate block">
              {domain}
            </span>
            <span className={`text-[9px] block ${isOwnMessage ? 'text-white/70' : 'text-grey/60'} truncate`}>
              Nhấp để truy cập trang web
            </span>
          </div>
        </div>
      </a>
    );
  }

  return (
    <a 
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`mt-2 flex flex-col rounded-xl overflow-hidden text-inherit no-underline border transition-all hover:bg-grey/10 cursor-pointer max-w-xs md:max-w-md ${
        isOwnMessage 
          ? 'bg-white/10 border-white/10 hover:border-white/20' 
          : 'bg-white border-grey/15 hover:border-grey/30 text-black'
      }`}
    >
      {preview.image && (
        <div className="w-full aspect-video relative overflow-hidden bg-grey/5 border-b border-grey/10">
          <img 
            src={preview.image} 
            alt={preview.title || domain}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-3 flex flex-col gap-1">
        <div className="flex items-center gap-1.5 mb-1">
          <img 
            src={iconUrl} 
            alt={domain} 
            className="w-4 h-4 object-contain rounded-sm"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/assets/link/chrome.png'; 
            }}
          />
          <span className={`text-[10px] font-bold uppercase tracking-wider ${isOwnMessage ? 'text-white/80' : 'text-grey/70'}`}>
            {domain}
          </span>
        </div>
        
        {preview.title && (
          <h4 className={`text-sm font-bold line-clamp-2 ${isOwnMessage ? 'text-white' : 'text-grey-hover'}`}>
            {preview.title}
          </h4>
        )}
        
        {preview.description && (
          <p className={`text-xs line-clamp-2 mt-0.5 leading-normal ${isOwnMessage ? 'text-white/80' : 'text-grey'}`}>
            {preview.description}
          </p>
        )}
      </div>
    </a>
  );
}

function renderTextWithLinks(content: string, isOwnMessage: boolean) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = content.split(urlRegex);
  const urls = content.match(urlRegex) || [];

  return (
    <>
      <p className="whitespace-pre-wrap text-justify">
        {parts.map((part, index) => {
          if (part.match(urlRegex)) {
            return (
              <a
                key={index}
                href={part}
                target="_blank"
                rel="noopener noreferrer"
                className={`underline break-all ${isOwnMessage ? 'text-white hover:text-white/80' : 'text-blue hover:text-blue-hover'}`}
              >
                {part}
              </a>
            );
          }
          return part;
        })}
      </p>
      {urls.map((url, index) => (
        <LinkPreviewCard key={index} url={url} isOwnMessage={isOwnMessage} />
      ))}
    </>
  );
}

// Custom Image Grid Bubble matching Flutter's image rendering
function ImageBubble({ urls }: { urls: string[] }) {
  if (!urls || urls.length === 0) return null;

  return (
    <div className="grid gap-2 max-w-sm rounded-lg overflow-hidden">
      {urls.map((url, idx) => (
        <img 
          key={idx} 
          src={url} 
          alt={`Attachment ${idx + 1}`} 
          className="max-h-60 w-full object-cover rounded-lg cursor-pointer hover:opacity-95 transition"
          onClick={() => window.open(url, '_blank')}
        />
      ))}
    </div>
  );
}

function MessageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const directUserId = searchParams.get('userId');
  const { showSuccess, showError } = useAlert();

  const { socket, startCall } = useCall();

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
  const [showInfoPanel, setShowInfoPanel] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Ref to always have the latest selectedConv in the socket listener without reconnecting
  const selectedConvRef = useRef(selectedConv);
  useEffect(() => {
    selectedConvRef.current = selectedConv;
  }, [selectedConv]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedConv) return;
    
    try {
      setIsUploading(true);
      const res = await messageService.uploadImage(file);
      if (res.success && res.url) {
        if (socketRef.current) {
          socketRef.current.emit('send_message', {
            conversationId: selectedConv._id,
            content: file.name,
            type: 'image',
            attachments: [res.url]
          });
        }
      } else {
        showError('Không thể tải ảnh lên.');
      }
    } catch (err) {
      console.error(err);
      showError('Gửi ảnh thất bại.');
    } finally {
      setIsUploading(false);
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedConv) return;

    try {
      setIsUploading(true);
      const isAudio = file.type.startsWith('audio/') || ['.mp3', '.wav', '.m4a', '.wma', '.flac', '.ogg'].some(ext => file.name.toLowerCase().endsWith(ext));
      
      let res;
      let msgType = 'file';
      if (isAudio) {
        res = await messageService.uploadAudio(file);
        msgType = 'audio';
      } else {
        res = await messageService.uploadFile(file);
      }

      if (res.success && res.url) {
        if (socketRef.current) {
          socketRef.current.emit('send_message', {
            conversationId: selectedConv._id,
            content: file.name,
            type: msgType,
            attachments: [res.url]
          });
        }
      } else {
        showError('Không thể tải tệp lên.');
      }
    } catch (err) {
      console.error(err);
      showError('Gửi tệp thất bại.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Auto-adjust height of composer textarea
  useEffect(() => {
    if (textareaRef.current) {
      if (messageInput) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
      } else {
        textareaRef.current.style.height = '40px';
      }
    }
  }, [messageInput]);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isUploading]);

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
    if (!socket) return;
    socketRef.current = socket;

    // Join room if already selected
    if (selectedConvRef.current) {
      socket.emit('join_room', selectedConvRef.current._id);
    }

    const handleReceiveMessage = (message: any) => {
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
    };

    const handleConversationUpdated = (data: any) => {
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
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('conversation_updated', handleConversationUpdated);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('conversation_updated', handleConversationUpdated);
    };
  }, [socket]);

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
        <div className="flex-1 bg-white flex min-w-0 relative">
          {selectedConv ? (
            <div className="flex-1 flex h-full min-w-0 overflow-hidden">
              {/* Main Chat Column */}
              <div className="flex-1 flex flex-col h-full min-w-0">
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
                        {!selectedConv.isGroup && (
                          <>
                            <button 
                              type="button"
                              onClick={() => startCall(partner._id || partner.id, selectedConv._id, partner, 'voice')}
                              className="p-2 rounded-full hover:bg-grey/10 text-grey transition border-0 bg-transparent cursor-pointer"
                            >
                              <Phone className="w-5 h-5" />
                            </button>
                            <button 
                              type="button"
                              onClick={() => startCall(partner._id || partner.id, selectedConv._id, partner, 'video')}
                              className="p-2 rounded-full hover:bg-grey/10 text-grey transition border-0 bg-transparent cursor-pointer"
                            >
                              <Video className="w-5 h-5" />
                            </button>
                          </>
                        )}
                        <button 
                          type="button"
                          onClick={() => setShowInfoPanel(!showInfoPanel)}
                          className={`p-2 rounded-full hover:bg-grey/10 transition border-0 bg-transparent cursor-pointer ${showInfoPanel ? 'text-blue bg-blue/5' : 'text-grey'}`}
                        >
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
                    <>
                      {messages.map((msg) => {
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
                                className={`rounded-2xl text-[14px] leading-relaxed break-words max-w-xs md:max-w-md shadow-sm ${
                                  msg.type === 'image' && msg.attachments?.length > 0
                                    ? 'bg-transparent text-black' 
                                    : msg.type === 'audio'
                                      ? 'p-2'
                                      : 'p-3'
                                } ${
                                  isOwnMessage 
                                    ? msg.type === 'image' && msg.attachments?.length > 0 ? '' : 'bg-blue text-white rounded-br-none' 
                                    : msg.type === 'image' && msg.attachments?.length > 0 ? '' : 'bg-[#D6D6D6] text-black rounded-bl-none'
                                }`}
                              >
                                {msg.type === 'image' && msg.attachments?.length > 0 ? (
                                  <ImageBubble urls={msg.attachments} />
                                ) : msg.type === 'audio' && msg.attachments?.length > 0 ? (
                                  <AudioPlayerBubble url={msg.attachments[0]} isOwnMessage={isOwnMessage} />
                                ) : msg.type === 'file' && msg.attachments?.length > 0 ? (
                                  <FileBubble url={msg.attachments[0]} filename={msg.content || 'Tài liệu'} isOwnMessage={isOwnMessage} />
                                ) : (
                                  renderTextWithLinks(msg.content, isOwnMessage)
                                )}
                              </div>

                              {/* Timestamp outside bubble */}
                              <span className="block text-[10px] mt-1 text-grey/50 font-semibold px-1">
                                {formatTime(msg.createdAt)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                      {isUploading && (
                        <div className="flex gap-3 max-w-[85%] ml-auto flex-row-reverse items-center">
                          <div className="bg-blue/10 text-blue/70 p-3 rounded-2xl rounded-br-none flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-blue" />
                            <span>Đang gửi tệp...</span>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input Composer */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-grey/20 bg-white flex items-center gap-3 relative">
                  {/* Hidden File Inputs */}
                  <input 
                    type="file" 
                    ref={imageInputRef} 
                    onChange={handleImageSelect} 
                    accept="image/*" 
                    className="hidden" 
                  />
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileSelect} 
                    accept="*/*" 
                    className="hidden" 
                  />

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button 
                      type="button" 
                      onClick={() => imageInputRef.current?.click()}
                      disabled={isUploading}
                      className="p-2 rounded-full hover:bg-grey/10 text-grey transition border-0 bg-transparent cursor-pointer disabled:opacity-50"
                      title="Gửi hình ảnh"
                    >
                      <ImageIcon className="w-5 h-5" />
                    </button>

                    <button 
                      type="button" 
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="p-2 rounded-full hover:bg-grey/10 text-grey transition border-0 bg-transparent cursor-pointer disabled:opacity-50"
                      title="Gửi tài liệu hoặc âm thanh"
                    >
                      <Paperclip className="w-5 h-5" />
                    </button>

                    <button type="button" className="p-2 rounded-full hover:bg-grey/10 text-grey transition border-0 bg-transparent cursor-pointer">
                      <Smile className="w-5 h-5" />
                    </button>
                  </div>

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
                    disabled={isUploading}
                    placeholder={isUploading ? "Đang tải tệp lên..." : "Nhập tin nhắn..."} 
                    rows={1}
                    className="flex-1 bg-grey/10 border-none outline-none text-sm rounded-2xl py-2.5 px-5 text-grey-hover focus:bg-white focus:ring-1 focus:ring-blue transition-all resize-none max-h-32 overflow-y-auto align-middle text-justify disabled:opacity-50"
                  />

                  <button 
                    type="submit"
                    disabled={!messageInput.trim() || isUploading}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition border-none flex-shrink-0 cursor-pointer ${
                      messageInput.trim() && !isUploading
                        ? 'bg-blue text-white hover:bg-blue-hover active:scale-95 shadow-sm' 
                        : 'bg-grey/20 text-grey/40 cursor-not-allowed'
                    }`}
                  >
                    {isUploading ? (
                      <Loader2 className="w-4.5 h-4.5 animate-spin" />
                    ) : (
                      <Send className="w-4.5 h-4.5" />
                    )}
                  </button>
                </form>
              </div>

              {/* Side Info Panel */}
              {showInfoPanel && (() => {
                const partner = getChatPartner(selectedConv);
                const partnerName = selectedConv.isGroup ? selectedConv.name : partner.username;
                const partnerAvatar = selectedConv.isGroup ? selectedConv.avatar : partner.avatar;
                const isOnline = !selectedConv.isGroup && partner.isOnline;

                return (
                  <div className="w-80 border-l border-grey/20 bg-white flex flex-col h-full overflow-y-auto flex-shrink-0 animate-in slide-in-from-right duration-300">
                    <div className="p-6 flex flex-col items-center border-b border-grey/10">
                      <div className="w-20 h-20 rounded-full bg-grey/10 border border-grey/25 overflow-hidden flex items-center justify-center mb-3.5 shadow-sm">
                        {partnerAvatar ? (
                          <img src={partnerAvatar} alt={partnerName} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-10 h-10 text-grey/60" />
                        )}
                      </div>
                      <h3 className="font-bold text-grey-hover text-base text-center mb-1 truncate w-full px-2">{partnerName}</h3>
                      {!selectedConv.isGroup && (
                        <p className={`text-[11px] font-semibold ${isOnline ? 'text-green-500' : 'text-grey/50'}`}>
                          {isOnline ? 'Đang hoạt động' : 'Ngoại tuyến'}
                        </p>
                      )}
                    </div>

                    {/* Function row */}
                    <div className="p-4 border-b border-grey/10 flex justify-around">
                      {selectedConv.isGroup ? (
                        <>
                          <button 
                            type="button"
                            onClick={() => {
                              showSuccess('Xem danh sách thành viên');
                            }}
                            className="flex flex-col items-center gap-1.5 bg-transparent border-0 cursor-pointer text-grey hover:text-blue transition"
                          >
                            <div className="w-10 h-10 rounded-full bg-grey/10 hover:bg-grey/15 flex items-center justify-center transition">
                              <Users className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-bold">Thành viên</span>
                          </button>
                          <button 
                            type="button"
                            className="flex flex-col items-center gap-1.5 bg-transparent border-0 cursor-pointer text-grey hover:text-blue transition"
                          >
                            <div className="w-10 h-10 rounded-full bg-grey/10 hover:bg-grey/15 flex items-center justify-center transition">
                              <Search className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-bold">Tìm kiếm</span>
                          </button>
                          <button 
                            type="button"
                            className="flex flex-col items-center gap-1.5 bg-transparent border-0 cursor-pointer text-grey hover:text-blue transition"
                          >
                            <div className="w-10 h-10 rounded-full bg-grey/10 hover:bg-grey/15 flex items-center justify-center transition">
                              <Bell className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-bold">Thông báo</span>
                          </button>
                        </>
                      ) : (
                        <>
                          <button 
                            type="button"
                            onClick={() => router.push(`/user/${partner._id || partner.id}`)}
                            className="flex flex-col items-center gap-1.5 bg-transparent border-0 cursor-pointer text-grey hover:text-blue transition"
                          >
                            <div className="w-10 h-10 rounded-full bg-grey/10 hover:bg-grey/15 flex items-center justify-center transition">
                              <User className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-bold">Cá nhân</span>
                          </button>
                          <button 
                            type="button"
                            className="flex flex-col items-center gap-1.5 bg-transparent border-0 cursor-pointer text-grey hover:text-blue transition"
                          >
                            <div className="w-10 h-10 rounded-full bg-grey/10 hover:bg-grey/15 flex items-center justify-center transition">
                              <Edit className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-bold">Biệt danh</span>
                          </button>
                          <button 
                            type="button"
                            className="flex flex-col items-center gap-1.5 bg-transparent border-0 cursor-pointer text-grey hover:text-blue transition"
                          >
                            <div className="w-10 h-10 rounded-full bg-grey/10 hover:bg-grey/15 flex items-center justify-center transition">
                              <Bell className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-bold">Thông báo</span>
                          </button>
                        </>
                      )}
                    </div>

                    {/* Settings list */}
                    <div className="flex-1 p-2 space-y-1">
                      <button type="button" className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-grey/5 transition border-0 bg-transparent text-left cursor-pointer text-grey-hover">
                        <div className="flex items-center gap-3">
                          <ImageIcon className="w-5 h-5 text-grey" />
                          <span className="text-sm font-semibold">Ảnh, file & liên kết</span>
                        </div>
                      </button>

                      {selectedConv.isGroup && (
                        <>
                          <button 
                            type="button"
                            onClick={() => {
                              showSuccess('Xem danh sách thành viên');
                            }}
                            className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-grey/5 transition border-0 bg-transparent text-left cursor-pointer text-grey-hover"
                          >
                            <div className="flex items-center gap-3">
                              <Users className="w-5 h-5 text-grey" />
                              <span className="text-sm font-semibold">Thành viên nhóm</span>
                            </div>
                          </button>
                          <button type="button" className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-grey/5 transition border-0 bg-transparent text-left cursor-pointer text-grey-hover">
                            <div className="flex items-center gap-3">
                              <QrCode className="w-5 h-5 text-grey" />
                              <span className="text-sm font-semibold">QR Nhóm</span>
                            </div>
                          </button>
                        </>
                      )}

                      <button type="button" className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-grey/5 transition border-0 bg-transparent text-left cursor-pointer text-grey-hover">
                        <div className="flex items-center gap-3">
                          <Phone className="w-5 h-5 text-grey" />
                          <span className="text-sm font-semibold">Lịch sử cuộc gọi</span>
                        </div>
                      </button>

                      {!selectedConv.isGroup && (
                        <>
                          <button type="button" className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-grey/5 transition border-0 bg-transparent text-left cursor-pointer text-grey-hover">
                            <div className="flex items-center gap-3">
                              <AlertTriangle className="w-5 h-5 text-grey" />
                              <span className="text-sm font-semibold">Báo cáo</span>
                            </div>
                          </button>
                          <button type="button" className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-grey/5 transition border-0 bg-transparent text-left cursor-pointer text-grey-hover">
                            <div className="flex items-center gap-3">
                              <Slash className="w-5 h-5 text-grey" />
                              <span className="text-sm font-semibold">Chặn</span>
                            </div>
                          </button>
                        </>
                      )}

                      <button type="button" className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-grey/5 transition border-0 bg-transparent text-left cursor-pointer text-red-500 hover:bg-red-50/50">
                        <div className="flex items-center gap-3">
                          <Trash2 className="w-5 h-5" />
                          <span className="text-sm font-semibold">Xóa lịch sử trò chuyện</span>
                        </div>
                      </button>

                      {selectedConv.isGroup && (
                        <button type="button" className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-grey/5 transition border-0 bg-transparent text-left cursor-pointer text-red-500 hover:bg-red-50/50">
                          <div className="flex items-center gap-3">
                            <LogOut className="w-5 h-5" />
                            <span className="text-sm font-semibold">Rời khỏi nhóm</span>
                          </div>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
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
