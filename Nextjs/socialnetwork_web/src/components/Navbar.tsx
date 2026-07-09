'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../services/auth.service';
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

  // Debounced user search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await authService.searchUsers(searchQuery);
        setSearchResults(Array.isArray(results.data) ? results.data : (Array.isArray(results) ? results : []));
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const addToHistory = (item: any) => {
    const filtered = searchHistory.filter(h => 
      h.type === 'user' ? h.id !== item.id : h.text !== item.text
    );
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
          className='fixed inset-0 z-40 bg-black/5 backdrop-blur-[1px]' 
          onClick={() => setIsSearchFocused(false)} 
        />
      )}

      {/* Top Navigation Bar */}
      <nav className='fixed top-0 left-0 right-0 bg-white border-b border-grey/20 z-50 shadow-sm'>
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
                <div className={`hidden sm:flex items-center bg-grey/10 hover:bg-grey/20 focus-within:bg-white border focus-within:border-blue focus-within:shadow-sm transition-all duration-200 rounded-full pl-3 pr-4 py-2 h-10 ${isSearchFocused ? 'w-64 sm:w-72 lg:w-80 shadow-md' : 'w-40 lg:w-48'}`}>
                  <Search className='w-4 h-4 text-grey mr-2 flex-shrink-0' />
                  <input
                    type='text'
                    placeholder='Tìm kiếm người dùng...'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onKeyDown={handleKeyDown}
                    className='bg-transparent border-none outline-none text-sm placeholder-gray-500 text-grey-hover w-full font-medium'
                  />
                </div>
                <button 
                  onClick={() => setIsSearchFocused(true)}
                  className='flex sm:hidden w-10 h-10 rounded-full bg-grey/10 hover:bg-grey/20 items-center justify-center text-grey-hover transition duration-150 border-0 outline-none cursor-pointer'
                >
                  <Search className='w-5 h-5' />
                </button>

                {isSearchFocused && (
                  <div className='absolute top-12 left-0 w-80 sm:w-96 bg-white border border-grey/10 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200'>
                    {!searchQuery.trim() ? (
                      <>
                        <div className='flex items-center justify-between mb-3 px-1.5'>
                          <span className='font-bold text-grey-hover text-sm sm:text-base'>Gần đây</span>
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
                          <div className='text-center py-6 text-grey/60 text-xs sm:text-sm select-none'>
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
                                  } else {
                                    setIsSearchFocused(false);
                                    router.push(`/search?q=${encodeURIComponent(item.text)}`);
                                  }
                                }}
                                className='flex items-center justify-between p-2 hover:bg-grey/5 active:bg-grey/10 rounded-xl cursor-pointer transition group'
                              >
                                <div className='flex items-center gap-3'>
                                  {item.type === 'user' ? (
                                    <div className='w-9 h-9 rounded-full bg-grey/10 border border-grey/20 overflow-hidden flex items-center justify-center flex-shrink-0'>
                                      {item.avatar ? (
                                        <img src={item.avatar} alt={item.username} className='w-full h-full object-cover' />
                                      ) : (
                                        <User className='w-5 h-5 text-grey' />
                                      )}
                                    </div>
                                  ) : (
                                    <div className='w-9 h-9 rounded-full bg-grey/10 flex items-center justify-center flex-shrink-0 text-grey group-hover:bg-grey/20 transition'>
                                      <Clock className='w-4.5 h-4.5' />
                                    </div>
                                  )}
                                  <span className='text-sm font-semibold text-grey-hover truncate max-w-[180px] sm:max-w-[240px]'>
                                    {item.type === 'user' ? item.username : item.text}
                                  </span>
                                </div>
                                <button 
                                  onClick={(e) => removeFromHistory(e, index)}
                                  className='w-7 h-7 rounded-full hover:bg-grey/20 flex items-center justify-center text-grey/60 hover:text-grey-hover transition bg-transparent border-none'
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
                        <div className='mb-2 px-1.5'>
                          <span className='font-bold text-grey-hover text-sm sm:text-base'>Kết quả tìm kiếm</span>
                        </div>

                        {isSearching ? (
                          <div className='flex items-center justify-center py-8 text-grey/60 text-sm gap-2 select-none'>
                            <Loader2 className='w-4 h-4 animate-spin text-blue' />
                            <span>Đang tìm kiếm...</span>
                          </div>
                        ) : searchResults.length === 0 ? (
                          <div className='text-center py-8 text-grey/60 text-xs sm:text-sm select-none'>
                            Không tìm thấy người dùng
                          </div>
                        ) : (
                          <div className='space-y-1 max-h-[300px] overflow-y-auto scrollbar-none'>
                            {searchResults.map((item) => (
                              <div 
                                key={item._id}
                                onClick={() => handleSelectUser(item)}
                                className='flex items-center justify-between p-2 hover:bg-grey/5 active:bg-grey/10 rounded-xl cursor-pointer transition'
                              >
                                <div className='flex items-center gap-3'>
                                  <div className='w-9 h-9 rounded-full bg-grey/10 border border-grey/20 overflow-hidden flex items-center justify-center flex-shrink-0'>
                                    {item.avatar ? (
                                      <img src={item.avatar} alt={item.username} className='w-full h-full object-cover' />
                                    ) : (
                                      <User className='w-5 h-5 text-grey' />
                                    )}
                                  </div>
                                  <div className='flex flex-col text-left'>
                                    <span className='text-sm font-bold text-grey-hover truncate max-w-[200px] sm:max-w-[260px]'>
                                      {item.username}
                                    </span>
                                    {item.email && (
                                      <span className='text-xs text-grey/60 truncate max-w-[200px]'>
                                        {item.email}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <ChevronRight className='w-4 h-4 text-grey/60' />
                              </div>
                            ))}
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
                    : 'text-grey hover:text-grey-hover border-transparent hover:bg-grey/5'
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
                    : 'text-grey hover:text-grey-hover border-transparent hover:bg-grey/5'
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
                    : 'text-grey hover:text-grey-hover border-transparent hover:bg-grey/5'
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
                    : 'text-grey hover:text-grey-hover border-transparent hover:bg-grey/5'
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
                className='w-10 h-10 rounded-full overflow-hidden border border-grey/20 hover:ring-4 hover:ring-blue transition duration-200 flex items-center justify-center bg-grey/5 flex-shrink-0 cursor-pointer outline-none'
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
                  <div className='absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-black/5 p-4 z-50 animate-scale-up origin-top-right select-none'>
                    
                    {/* User Card */}
                    <div 
                      onClick={() => {
                        setIsDropdownOpen(false);
                        router.push('/profile');
                      }}
                      className='bg-black/5 hover:bg-black/10 p-3.5 rounded-2xl border border-black/5 transition duration-200 cursor-pointer mb-3 flex items-center gap-3'
                    >
                      <div className='w-11 h-11 rounded-full overflow-hidden border border-white shadow-sm bg-white flex-shrink-0'>
                        <img
                          src={user?.avatar || '/assets/avatar/avatar.jpg'}
                          alt='Profile Avatar'
                          className='w-full h-full object-cover'
                        />
                      </div>
                      <div className='flex-1 min-w-0'>
                        <h4 className='font-bold text-black truncate text-[15px]'>
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
                      className='w-full py-2.5 px-4 bg-black/5 hover:bg-black/10 text-black font-bold rounded-xl transition duration-200 flex items-center justify-center gap-2 text-sm shadow-sm border-0 cursor-pointer'
                    >
                      <User className='w-4 h-4 text-black/60' />
                      <span>Xem tất cả trang cá nhân</span>
                    </button>

                    <div className='border-t border-black/5 my-3' />

                    {/* Options List */}
                    <div className='space-y-1'>
                      {/* Setting */}
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          router.push('/setting');
                        }}
                        className='w-full flex items-center justify-between p-3 rounded-xl hover:bg-black/5 active:scale-[0.98] transition group border-0 bg-transparent cursor-pointer text-left'
                      >
                        <div className='flex items-center gap-3'>
                          <div className='w-9 h-9 bg-black/5 rounded-full flex items-center justify-center text-black/80 group-hover:bg-blue/10 group-hover:text-blue transition duration-200'>
                            <Settings className='w-5 h-5' />
                          </div>
                          <span className='text-sm font-semibold text-black/80 group-hover:text-black transition-colors'>
                            Cài đặt
                          </span>
                        </div>
                        <ChevronRight className='w-5 h-5 text-black/40 group-hover:text-black transition-colors' />
                      </button>

                      {/* Game */}
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          router.push('/game');
                        }}
                        className='w-full flex items-center justify-between p-3 rounded-xl hover:bg-black/5 active:scale-[0.98] transition group border-0 bg-transparent cursor-pointer text-left'
                      >
                        <div className='flex items-center gap-3'>
                          <div className='w-9 h-9 bg-black/5 rounded-full flex items-center justify-center text-black/80 group-hover:bg-blue/10 group-hover:text-blue transition duration-200'>
                            <Gamepad2 className='w-5 h-5' />
                          </div>
                          <span className='text-sm font-semibold text-black/80 group-hover:text-black transition-colors'>
                            Trò chơi
                          </span>
                        </div>
                        <ChevronRight className='w-5 h-5 text-black/40 group-hover:text-black transition-colors' />
                      </button>

                      {/* Logout */}
                      <button
                        onClick={handleLogOut}
                        className='w-full flex items-center justify-between p-3 rounded-xl hover:bg-red/10 active:scale-[0.98] transition group border-0 bg-transparent cursor-pointer text-left'
                      >
                        <div className='flex items-center gap-3'>
                          <div className='w-9 h-9 bg-red/10 rounded-full flex items-center justify-center text-red group-hover:bg-red/20 transition duration-200'>
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
