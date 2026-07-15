'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../services/auth.service';
import { groupService } from '../services/group.service';
import { useAlert } from './Alert/alertcontext';
import { 
  Loader2, 
  User, 
  Settings, 
  Gamepad2, 
  LogOut, 
  ChevronRight,
  Search,
  Clock,
  X,
  Home,
  MessageSquare,
  Users,
  Bell
} from 'lucide-react';

interface NavbarProps {
  activeTab?: 'home' | 'message' | 'contact' | 'notification' | 'setting';
  onRefreshFeed?: () => void;
}

export default function Navbar({ activeTab, onRefreshFeed }: NavbarProps) {
  const router = useRouter();
  const { showSuccess, showError } = useAlert();

  const [user, setUser] = useState<any>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Search state variables
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchGroups, setSearchGroups] = useState<any[]>([]);
  const [searchHistory, setSearchHistory] = useState<any[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/signin');
      return;
    }

    const fetchProfile = async () => {
      try {
        const data = await authService.getProfile();
        setUser(data);
      } catch (err) {
        console.error('Lỗi lấy thông tin cá nhân trong Navbar:', err);
        localStorage.removeItem('token');
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        router.replace('/signin');
      }
    };

    fetchProfile();
  }, [router]);

  // Load search history from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedHistory = localStorage.getItem('recent_searches');
      if (savedHistory) {
        try {
          setSearchHistory(JSON.parse(savedHistory));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  // Debounced user and group search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearchGroups([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        // Query users
        const uRes = await authService.searchUsers(searchQuery);
        const usersList = Array.isArray(uRes.data) ? uRes.data : (Array.isArray(uRes) ? uRes : []);
        setSearchResults(usersList);

        // Query groups
        try {
          const gRes = await groupService.searchGroups(searchQuery);
          const groupsList = Array.isArray(gRes.data) ? gRes.data : (Array.isArray(gRes) ? gRes : []);
          setSearchGroups(groupsList);
        } catch (gErr) {
          console.error('Group search error:', gErr);
          setSearchGroups([]);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const addToHistory = (item: any) => {
    const filtered = searchHistory.filter(h => {
      if (item.type === 'user') return h.id !== item.id || h.type !== 'user';
      if (item.type === 'group') return h.id !== item.id || h.type !== 'group';
      return h.text !== item.text || h.type !== 'query';
    });
    const newHistory = [item, ...filtered].slice(0, 8);
    setSearchHistory(newHistory);
    localStorage.setItem('recent_searches', JSON.stringify(newHistory));
  };

  const removeFromHistory = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    const newHistory = searchHistory.filter((_, i) => i !== index);
    setSearchHistory(newHistory);
    localStorage.setItem('recent_searches', JSON.stringify(newHistory));
  };

  const clearHistory = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSearchHistory([]);
    localStorage.removeItem('recent_searches');
  };

  const handleSelectUser = (selectedUser: any) => {
    addToHistory({
      type: 'user',
      id: selectedUser._id || selectedUser.id,
      username: selectedUser.username,
      avatar: selectedUser.avatar || ''
    });
    setIsSearchFocused(false);
    router.push(`/user/${selectedUser._id || selectedUser.id}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      addToHistory({
        type: 'query',
        text: searchQuery.trim()
      });
      setIsSearchFocused(false);
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogOut = () => {
    localStorage.removeItem('token');
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    setIsDropdownOpen(false);
    showSuccess('Đăng xuất thành công!');
    router.replace('/signin');
  };

  return (
    <>
      {/* Search overlay backdrop */}
      {isSearchFocused && (
        <div 
          className='fixed inset-0 z-40 bg-black/5 dark:bg-black/40 backdrop-blur-[1px]' 
          onClick={() => setIsSearchFocused(false)} 
        />
      )}

      {/* Top Navigation Bar */}
      <nav className='fixed top-0 left-0 right-0 bg-white dark:bg-zinc-900 border-b border-grey/20 dark:border-zinc-800 z-50 shadow-sm transition-colors duration-200'>
        <div className='w-full px-4 sm:px-6 md:px-8'>
          <div className='flex items-center justify-between h-16 relative w-full'>
            {/* Logo & Search Bar */}
            <div className='flex items-center gap-3 relative z-50'>
              <h1 
                onClick={() => {
                  if (activeTab === 'home') {
                    if (onRefreshFeed) onRefreshFeed();
                  } else {
                    router.push('/home');
                  }
                }} 
                className='text-2xl font-bold text-blue tracking-tight select-none cursor-pointer hover:opacity-90 transition'
              >
                SocialNetwork
              </h1>
              <div className='relative'>
                <div className={`hidden sm:flex items-center bg-grey/10 dark:bg-zinc-800 hover:bg-grey/20 dark:hover:bg-zinc-700/80 focus-within:bg-white dark:focus-within:bg-zinc-900 border border-transparent dark:border-zinc-800 focus-within:border-blue focus-within:shadow-sm transition-all duration-200 rounded-full pl-3 pr-4 py-2 h-10 ${isSearchFocused ? 'w-64 sm:w-72 lg:w-80 shadow-md' : 'w-40 lg:w-48'}`}>
                  <Search className='w-4 h-4 text-grey dark:text-zinc-400 mr-2 flex-shrink-0' />
                  <input
                    type='text'
                    placeholder='Tìm kiếm...'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onKeyDown={handleKeyDown}
                    className='bg-transparent border-none outline-none text-sm placeholder-gray-500 dark:placeholder-zinc-500 text-zinc-900 dark:text-zinc-100 w-full font-medium'
                  />
                </div>
                <button 
                  onClick={() => setIsSearchFocused(true)}
                  className='flex sm:hidden w-10 h-10 rounded-full bg-grey/10 dark:bg-zinc-800 hover:bg-grey/20 dark:hover:bg-zinc-750 items-center justify-center text-grey-hover dark:text-zinc-200 transition duration-150 border-0 outline-none cursor-pointer'
                >
                  <Search className='w-5 h-5' />
                </button>

                {isSearchFocused && (
                  <div className='absolute top-12 left-0 w-80 sm:w-96 bg-white dark:bg-zinc-900 border border-grey/10 dark:border-zinc-800 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200'>
                    {!searchQuery.trim() ? (
                      <>
                        <div className='flex items-center justify-between mb-3 px-1.5'>
                          <span className='font-bold text-grey-hover dark:text-zinc-100 text-sm sm:text-base'>Gần đây</span>
                          {searchHistory.length > 0 && (
                            <button 
                              onClick={clearHistory}
                              className='text-blue hover:text-blue-hover text-xs sm:text-sm font-semibold hover:underline bg-transparent border-none outline-none cursor-pointer'
                            >
                              Xóa tất cả
                            </button>
                          )}
                        </div>

                        {searchHistory.length === 0 ? (
                          <div className='text-center py-6 text-grey/60 dark:text-zinc-500 text-xs sm:text-sm select-none'>
                            Không có tìm kiếm gần đây
                          </div>
                        ) : (
                          <div className='space-y-1 max-h-[300px] overflow-y-auto scrollbar-none'>
                            {searchHistory.map((item, index) => (
                              <div  
                                key={index}
                                onClick={() => {
                                  if (item.type === 'user') {
                                    router.push(`/user/${item.id}`);
                                    setIsSearchFocused(false);
                                  } else if (item.type === 'group') {
                                    router.push(`/group?groupId=${item.id}`);
                                    setIsSearchFocused(false);
                                  } else {
                                    setIsSearchFocused(false);
                                    router.push(`/search?q=${encodeURIComponent(item.text)}`);
                                  }
                                }}
                                className='flex items-center justify-between p-2 hover:bg-grey/5 dark:hover:bg-zinc-800/50 active:bg-grey/10 dark:active:bg-zinc-700/60 rounded-xl cursor-pointer transition group'
                              >
                                <div className='flex items-center gap-3'>
                                  {item.type === 'user' ? (
                                    <div className='w-9 h-9 rounded-full bg-grey/10 dark:bg-zinc-800 border border-grey/20 dark:border-zinc-700 overflow-hidden flex items-center justify-center flex-shrink-0'>
                                      {item.avatar ? (
                                        <img src={item.avatar} alt={item.username} className='w-full h-full object-cover' />
                                      ) : (
                                        <User className='w-5 h-5 text-grey dark:text-zinc-500' />
                                      )}
                                    </div>
                                  ) : item.type === 'group' ? (
                                    <div className='w-9 h-9 rounded-lg bg-grey/10 dark:bg-zinc-800 border border-grey/20 dark:border-zinc-700 overflow-hidden flex items-center justify-center flex-shrink-0'>
                                      {item.avatar ? (
                                        <img src={item.avatar} alt={item.name} className='w-full h-full object-cover' />
                                      ) : (
                                        <Users className='w-5 h-5 text-grey dark:text-zinc-500' />
                                      )}
                                    </div>
                                  ) : (
                                    <div className='w-9 h-9 rounded-full bg-grey/10 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0 text-grey dark:text-zinc-400 group-hover:bg-grey/20 dark:group-hover:bg-zinc-750 transition'>
                                      <Clock className='w-4.5 h-4.5' />
                                    </div>
                                  )}
                                  <span className='text-sm font-semibold text-grey-hover dark:text-zinc-200 truncate max-w-[180px] sm:max-w-[240px]'>
                                    {item.type === 'user' ? item.username : item.type === 'group' ? item.name : item.text}
                                  </span>
                                </div>
                                <button 
                                  onClick={(e) => removeFromHistory(e, index)}
                                  className='w-7 h-7 rounded-full hover:bg-grey/20 dark:hover:bg-zinc-750 flex items-center justify-center text-grey/60 dark:text-zinc-500 hover:text-grey-hover dark:hover:text-zinc-200 transition bg-transparent border-none'
                                >
                                  <X className='w-4 h-4' />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <div 
                          onClick={() => {
                            addToHistory({ type: 'query', text: searchQuery.trim() });
                            setIsSearchFocused(false);
                            router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                          }}
                          className="flex items-center gap-2 p-2 mb-2 hover:bg-blue/5 dark:hover:bg-zinc-800/60 rounded-xl cursor-pointer text-blue hover:text-blue-hover text-xs font-bold transition border-b border-grey/5 dark:border-zinc-800 pb-2 text-left"
                        >
                          <Search className="w-4 h-4" />
                          <span>Tìm kiếm &ldquo;{searchQuery}&rdquo; cho mọi người, nhóm và bài viết</span>
                        </div>

                        {isSearching ? (
                          <div className='flex items-center justify-center py-8 text-grey/60 dark:text-zinc-500 text-sm gap-2 select-none'>
                            <Loader2 className='w-4 h-4 animate-spin text-blue' />
                            <span>Đang tìm kiếm...</span>
                          </div>
                        ) : (searchResults.length === 0 && searchGroups.length === 0) ? (
                          <div className='text-center py-8 text-grey/60 dark:text-zinc-500 text-xs sm:text-sm select-none'>
                            Không tìm thấy kết quả phù hợp
                          </div>
                        ) : (
                          <div className='space-y-3 max-h-[320px] overflow-y-auto scrollbar-none'>
                            {/* Users Section */}
                            {searchResults.length > 0 && (
                              <div>
                                <div className="px-1.5 mb-1 text-[11px] font-bold text-grey uppercase tracking-wider text-left">Mọi người</div>
                                <div className="space-y-0.5">
                                  {searchResults.map((item) => (
                                    <div 
                                      key={item._id || item.id}
                                      onClick={() => handleSelectUser(item)}
                                      className='flex items-center justify-between p-1.5 hover:bg-grey/5 dark:hover:bg-zinc-800/50 active:bg-grey/10 rounded-xl cursor-pointer transition'
                                    >
                                      <div className='flex items-center gap-2.5 min-w-0'>
                                        <div className='w-8 h-8 rounded-full bg-grey/10 dark:bg-zinc-800 border border-grey/25 dark:border-zinc-700 overflow-hidden flex items-center justify-center flex-shrink-0'>
                                          {item.avatar ? (
                                            <img src={item.avatar} alt={item.username} className='w-full h-full object-cover' />
                                          ) : (
                                            <User className='w-4.5 h-4.5 text-grey dark:text-zinc-500' />
                                          )}
                                        </div>
                                        <div className='flex flex-col text-left min-w-0'>
                                          <span className='text-xs sm:text-sm font-bold text-slate-850 dark:text-zinc-200 truncate max-w-[170px] sm:max-w-[220px]'>
                                            {item.username}
                                          </span>
                                          {item.email && (
                                            <span className='text-[10px] text-grey/65 truncate max-w-[150px]'>
                                              {item.email}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      <ChevronRight className='w-3.5 h-3.5 text-grey/60' />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Groups Section */}
                            {searchGroups.length > 0 && (
                              <div>
                                <div className="px-1.5 mb-1 text-[11px] font-bold text-grey uppercase tracking-wider text-left">Nhóm</div>
                                <div className="space-y-0.5">
                                  {searchGroups.map((item) => {
                                    const groupId = item._id || item.id;
                                    const groupType = item.settings?.groupType || 'public';
                                    return (
                                      <div 
                                        key={groupId}
                                        onClick={() => {
                                          addToHistory({
                                            type: 'group',
                                            id: groupId,
                                            name: item.name,
                                            avatar: item.avatar || ''
                                          });
                                          setIsSearchFocused(false);
                                          router.push(`/group?groupId=${groupId}`);
                                        }}
                                        className='flex items-center justify-between p-1.5 hover:bg-grey/5 dark:hover:bg-zinc-800/50 active:bg-grey/10 rounded-xl cursor-pointer transition'
                                      >
                                        <div className='flex items-center gap-2.5 min-w-0'>
                                          <div className='w-8 h-8 rounded-lg bg-grey/10 dark:bg-zinc-800 border border-grey/25 dark:border-zinc-700 overflow-hidden flex items-center justify-center flex-shrink-0'>
                                            {item.avatar ? (
                                              <img src={item.avatar} alt={item.name} className='w-full h-full object-cover' />
                                            ) : (
                                              <Users className='w-4.5 h-4.5 text-grey dark:text-zinc-500' />
                                            )}
                                          </div>
                                          <div className='flex flex-col text-left min-w-0'>
                                            <span className='text-xs sm:text-sm font-bold text-slate-850 dark:text-zinc-200 truncate max-w-[170px] sm:max-w-[220px]'>
                                              {item.name}
                                            </span>
                                            <span className='text-[10px] text-grey/65 truncate max-w-[150px]'>
                                              {item.membersCount || 0} thành viên · {groupType === 'private' ? 'Riêng tư' : groupType === 'internal' ? 'Nội bộ' : 'Công khai'}
                                            </span>
                                          </div>
                                        </div>
                                        <ChevronRight className='w-3.5 h-3.5 text-grey/60' />
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Navigation Icons (4 core tabs: Home, Messages, Contacts, Notifications) */}
            <div className='absolute left-1/2 transform -translate-x-1/2 flex items-center h-full gap-1 sm:gap-2'>
              {/* Home */}
              <button
                onClick={() => {
                  if (activeTab === 'home') {
                    if (onRefreshFeed) onRefreshFeed();
                  } else {
                    router.push('/home');
                  }
                }}
                title="Trang chủ"
                className={`h-16 px-4 sm:px-6 flex items-center justify-center border-b-4 transition-all duration-150 cursor-pointer border-0 bg-transparent ${
                  activeTab === 'home'
                    ? 'text-blue border-blue'
                    : 'text-grey hover:text-grey-hover dark:text-zinc-400 dark:hover:text-zinc-200 border-transparent hover:bg-grey/5 dark:hover:bg-zinc-800/40'
                }`}
              >
                <Home 
                  className='w-6 h-6 sm:w-7 sm:h-7' 
                  fill={activeTab === 'home' ? 'currentColor' : 'none'} 
                  stroke='currentColor' 
                  strokeWidth={2}
                />
              </button>

              {/* Messages */}
              <button
                onClick={() => {
                  router.push('/home/message');
                }}
                title="Nhắn tin"
                className={`h-16 px-4 sm:px-6 flex items-center justify-center border-b-4 transition-all duration-150 cursor-pointer border-0 bg-transparent ${
                  activeTab === 'message'
                    ? 'text-blue border-blue'
                    : 'text-grey hover:text-grey-hover dark:text-zinc-400 dark:hover:text-zinc-200 border-transparent hover:bg-grey/5 dark:hover:bg-zinc-800/40'
                }`}
              >
                <MessageSquare 
                  className='w-6 h-6 sm:w-7 sm:h-7' 
                  fill={activeTab === 'message' ? 'currentColor' : 'none'} 
                  stroke='currentColor' 
                  strokeWidth={2}
                />
              </button>

              {/* Contacts */}
              <button
                onClick={() => {
                  router.push('/home/contact/friend');
                }}
                title="Danh bạ"
                className={`h-16 px-4 sm:px-6 flex items-center justify-center border-b-4 transition-all duration-150 cursor-pointer border-0 bg-transparent ${
                  activeTab === 'contact'
                    ? 'text-blue border-blue'
                    : 'text-grey hover:text-grey-hover dark:text-zinc-400 dark:hover:text-zinc-200 border-transparent hover:bg-grey/5 dark:hover:bg-zinc-800/40'
                }`}
              >
                <Users 
                  className='w-6 h-6 sm:w-7 sm:h-7' 
                  fill={activeTab === 'contact' ? 'currentColor' : 'none'} 
                  stroke='currentColor' 
                  strokeWidth={2}
                />
              </button>

              {/* Notifications */}
              <button
                onClick={() => {
                  router.push('/home/notification');
                }}
                title="Thông báo"
                className={`h-16 px-4 sm:px-6 flex items-center justify-center border-b-4 transition-all duration-150 cursor-pointer border-0 bg-transparent ${
                  activeTab === 'notification'
                    ? 'text-blue border-blue'
                    : 'text-grey hover:text-grey-hover dark:text-zinc-400 dark:hover:text-zinc-200 border-transparent hover:bg-grey/5 dark:hover:bg-zinc-800/40'
                }`}
              >
                <Bell 
                  className='w-6 h-6 sm:w-7 sm:h-7' 
                  fill={activeTab === 'notification' ? 'currentColor' : 'none'} 
                  stroke='currentColor' 
                  strokeWidth={2}
                />
              </button>
            </div>

            {/* User Avatar with Dropdown Toggle */}
            <div className='flex items-center gap-3 relative z-50'>
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className='w-10 h-10 rounded-full overflow-hidden border border-grey/20 dark:border-zinc-800 hover:ring-4 hover:ring-blue transition duration-200 flex items-center justify-center bg-grey/5 dark:bg-zinc-800 flex-shrink-0 cursor-pointer outline-none'
              >
                <img
                  src={user?.avatar || '/assets/avatar/avatar.jpg'}
                  alt='Avatar'
                  className='w-full h-full object-cover select-none'
                />
              </button>

              {isDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40 cursor-default" 
                    onClick={() => setIsDropdownOpen(false)} 
                  />
                  <div className='absolute right-0 top-12 w-80 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-black/5 dark:border-zinc-800/80 p-4 z-50 animate-scale-up origin-top-right select-none'>
                    
                    {/* User Card */}
                    <div 
                      onClick={() => {
                        setIsDropdownOpen(false);
                        router.push('/profile');
                      }}
                      className='bg-black/5 dark:bg-zinc-800/40 hover:bg-black/10 dark:hover:bg-zinc-800/80 p-3.5 rounded-2xl border border-black/5 dark:border-zinc-850/60 transition duration-200 cursor-pointer mb-3 flex items-center gap-3'
                    >
                      <div className='w-11 h-11 rounded-full overflow-hidden border border-white dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900 flex-shrink-0'>
                        <img
                          src={user?.avatar || '/assets/avatar/avatar.jpg'}
                          alt='Profile Avatar'
                          className='w-full h-full object-cover'
                        />
                      </div>
                      <div className='flex-1 min-w-0 text-left'>
                        <h4 className='font-bold text-black dark:text-white truncate text-[15px]'>
                          {user?.username || 'Hồ sơ người dùng'}
                        </h4>
                      </div>
                    </div>

                    {/* View profile */}
                    <button 
                      onClick={() => {
                        setIsDropdownOpen(false);
                        router.push('/profile');
                      }}
                      className='w-full py-2.5 px-4 bg-black/5 dark:bg-zinc-800/50 hover:bg-black/10 dark:hover:bg-zinc-800 text-black dark:text-white font-bold rounded-xl transition duration-200 flex items-center justify-center gap-2 text-sm shadow-sm border-0 cursor-pointer'
                    >
                      <User className='w-4 h-4 text-black/60 dark:text-zinc-400' />
                      <span>Xem tất cả trang cá nhân</span>
                    </button>

                    <div className='border-t border-black/5 dark:border-zinc-800/80 my-3' />

                    {/* Options List */}
                    <div className='space-y-1'>
                      {/* Setting */}
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          router.push('/setting');
                        }}
                        className='w-full flex items-center justify-between p-3 rounded-xl hover:bg-black/5 dark:hover:bg-zinc-800/50 active:scale-[0.98] transition group border-0 bg-transparent cursor-pointer text-left'
                      >
                        <div className='flex items-center gap-3'>
                          <div className='w-9 h-9 bg-black/5 dark:bg-zinc-800 rounded-full flex items-center justify-center text-black/80 dark:text-zinc-300 group-hover:bg-blue/10 group-hover:text-blue transition duration-200'>
                            <Settings className='w-5 h-5' />
                          </div>
                          <span className='text-sm font-semibold text-black/80 dark:text-zinc-300 group-hover:text-black dark:group-hover:text-white transition-colors'>
                            Cài đặt
                          </span>
                        </div>
                        <ChevronRight className='w-5 h-5 text-black/40 dark:text-zinc-550 group-hover:text-black dark:group-hover:text-white transition-colors' />
                      </button>

                      {/* Game */}
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          router.push('/game');
                        }}
                        className='w-full flex items-center justify-between p-3 rounded-xl hover:bg-black/5 dark:hover:bg-zinc-800/50 active:scale-[0.98] transition group border-0 bg-transparent cursor-pointer text-left'
                      >
                        <div className='flex items-center gap-3'>
                          <div className='w-9 h-9 bg-black/5 dark:bg-zinc-800 rounded-full flex items-center justify-center text-black/80 dark:text-zinc-300 group-hover:bg-blue/10 group-hover:text-blue transition duration-200'>
                            <Gamepad2 className='w-5 h-5' />
                          </div>
                          <span className='text-sm font-semibold text-black/80 dark:text-zinc-300 group-hover:text-black dark:group-hover:text-white transition-colors'>
                            Trò chơi
                          </span>
                        </div>
                        <ChevronRight className='w-5 h-5 text-black/40 dark:text-zinc-550 group-hover:text-black dark:group-hover:text-white transition-colors' />
                      </button>

                      {/* Logout */}
                      <button
                        onClick={handleLogOut}
                        className='w-full flex items-center justify-between p-3 rounded-xl hover:bg-red/10 dark:hover:bg-red-500/10 active:scale-[0.98] transition group border-0 bg-transparent cursor-pointer text-left'
                      >
                        <div className='flex items-center gap-3'>
                          <div className='w-9 h-9 bg-red/10 dark:bg-red-500/20 rounded-full flex items-center justify-center text-red group-hover:bg-red/20 transition duration-200'>
                            <LogOut className='w-5 h-5' />
                          </div>
                          <span className='text-sm font-bold text-red group-hover:text-red-hover transition-colors'>
                            Đăng xuất
                          </span>
                        </div>
                      </button>
                    </div>

                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
