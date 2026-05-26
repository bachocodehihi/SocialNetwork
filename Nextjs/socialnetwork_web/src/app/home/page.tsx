'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../../services/auth.service';
import { useAlert } from '../../components/Alert/alertcontext';
import { 
  Loader2, 
  User, 
  Settings, 
  Gamepad2, 
  LogOut, 
  ChevronRight,
  Search,
  Clock,
  X
} from 'lucide-react';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('home');
  const router = useRouter();
  const { showSuccess } = useAlert();

  const [checking, setChecking] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
        setChecking(false);
      } catch (err) {
        console.error('Lỗi lấy thông tin cá nhân:', err);
        localStorage.removeItem('token');
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        router.replace('/signin');
      }
    };

    fetchProfile();
  }, [router]);

  // Search state variables
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchHistory, setSearchHistory] = useState<any[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

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
        setSearchResults(results || []);
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

  const handleSelectQuery = (text: string) => {
    setSearchQuery(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      addToHistory({
        type: 'query',
        text: searchQuery.trim()
      });
    }
  };

  const handleLogOut = () => {
    localStorage.removeItem('token');
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    setIsDropdownOpen(false);
    showSuccess('Đăng xuất thành công!');
    router.replace('/signin');
  };

  if (checking) {
    return (
      <div className='flex h-screen items-center justify-center bg-gray-50'>
        <div className='animate-spin rounded-full h-12 w-12 border-4 border-blue border-t-transparent'></div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 font-sans'>
      {/* Top Navigation Bar */}
      {/* Search overlay backdrop */}
      {isSearchFocused && (
        <div 
          className='fixed inset-0 z-40 bg-black/5 backdrop-blur-[1px]' 
          onClick={() => setIsSearchFocused(false)} 
        />
      )}

      <nav className='fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50 shadow-sm'>
        <div className='w-full px-4 sm:px-6 md:px-8'>
          <div className='flex items-center justify-between h-16 relative w-full'>
            {/* Logo & Search Bar (Left) */}
            <div className='flex items-center gap-3 relative z-50'>
              <h1 className='text-2xl font-bold text-blue tracking-tight select-none cursor-pointer hover:opacity-90 transition'>
                SocialNetwork
              </h1>
              {/* Premium Facebook-style Search Input */}
              <div className='relative'>
                <div className={`hidden sm:flex items-center bg-gray-100 hover:bg-gray-200/80 focus-within:bg-white border focus-within:border-blue focus-within:shadow-sm transition-all duration-200 rounded-full pl-3 pr-4 py-2 h-10 ${isSearchFocused ? 'w-64 sm:w-72 lg:w-80 shadow-md' : 'w-40 lg:w-48'}`}>
                  <Search className='w-4 h-4 text-gray-500 mr-2 flex-shrink-0' />
                  <input
                    type='text'
                    placeholder='Search...'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onKeyDown={handleKeyDown}
                    className='bg-transparent border-none outline-none text-sm placeholder-gray-500 text-gray-900 w-full'
                  />
                </div>
                {/* Circular Search Icon for Mobile */}
                <button 
                  onClick={() => setIsSearchFocused(true)}
                  className='flex sm:hidden w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 items-center justify-center text-gray-600 transition duration-150'
                >
                  <Search className='w-5 h-5' />
                </button>

                {/* Dropdown Menu Overlay */}
                {isSearchFocused && (
                  <div className='absolute top-12 left-0 w-80 sm:w-96 bg-white border border-gray-200/60 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200'>
                    
                    {/* Recent searches history mode */}
                    {!searchQuery.trim() ? (
                      <>
                        <div className='flex items-center justify-between mb-3 px-1.5'>
                          <span className='font-bold text-gray-900 text-sm sm:text-base'>Recent</span>
                          {searchHistory.length > 0 && (
                            <button 
                              onClick={clearHistory}
                              className='text-blue hover:text-blue text-xs sm:text-sm font-semibold hover:underline bg-transparent border-none outline-none cursor-pointer'
                            >
                              Clear all
                            </button>
                          )}
                        </div>

                        {searchHistory.length === 0 ? (
                          <div className='text-center py-6 text-gray-400 text-xs sm:text-sm select-none'>
                            No recent searches
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
                                    handleSelectQuery(item.text);
                                  }
                                }}
                                className='flex items-center justify-between p-2 hover:bg-gray-50 active:bg-gray-100 rounded-xl cursor-pointer transition group'
                              >
                                <div className='flex items-center gap-3'>
                                  {item.type === 'user' ? (
                                    <div className='w-9 h-9 rounded-full bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center flex-shrink-0'>
                                      {item.avatar ? (
                                        <img src={item.avatar} alt={item.username} className='w-full h-full object-cover' />
                                      ) : (
                                        <User className='w-5 h-5 text-gray-500' />
                                      )}
                                    </div>
                                  ) : (
                                    <div className='w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 text-gray-500 group-hover:bg-gray-200 transition'>
                                      <Clock className='w-4.5 h-4.5' />
                                    </div>
                                  )}
                                  <span className='text-sm font-medium text-gray-800 truncate max-w-[180px] sm:max-w-[240px]'>
                                    {item.type === 'user' ? item.username : item.text}
                                  </span>
                                </div>
                                <button 
                                  onClick={(e) => removeFromHistory(e, index)}
                                  className='w-7 h-7 rounded-full hover:bg-gray-200/70 flex items-center justify-center text-gray-400 hover:text-gray-600 transition bg-transparent border-none'
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
                        {/* Dynamic search results mode */}
                        <div className='mb-2 px-1.5'>
                          <span className='font-bold text-gray-900 text-sm sm:text-base'>Search results</span>
                        </div>

                        {isSearching ? (
                          <div className='flex items-center justify-center py-8 text-gray-400 text-sm gap-2 select-none'>
                            <Loader2 className='w-4 h-4 animate-spin text-blue' />
                            <span>Searching...</span>
                          </div>
                        ) : searchResults.length === 0 ? (
                          <div className='text-center py-8 text-gray-400 text-xs sm:text-sm select-none'>
                            No users found
                          </div>
                        ) : (
                          <div className='space-y-1 max-h-[300px] overflow-y-auto scrollbar-none'>
                            {searchResults.map((item) => (
                              <div 
                                key={item._id}
                                onClick={() => handleSelectUser(item)}
                                className='flex items-center justify-between p-2 hover:bg-gray-50 active:bg-gray-100 rounded-xl cursor-pointer transition'
                              >
                                <div className='flex items-center gap-3'>
                                  <div className='w-9 h-9 rounded-full bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center flex-shrink-0'>
                                    {item.avatar ? (
                                      <img src={item.avatar} alt={item.username} className='w-full h-full object-cover' />
                                    ) : (
                                      <User className='w-5 h-5 text-gray-500' />
                                    )}
                                  </div>
                                  <div className='flex flex-col text-left'>
                                    <span className='text-sm font-semibold text-gray-800 truncate max-w-[200px] sm:max-w-[260px]'>
                                      {item.username}
                                    </span>
                                    {item.email && (
                                      <span className='text-xs text-gray-400 truncate max-w-[200px]'>
                                        {item.email}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <ChevronRight className='w-4 h-4 text-gray-400' />
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

            {/* Navigation Icons (Center - Perfectly Centered in Viewport) */}
            <div className='absolute left-1/2 transform -translate-x-1/2 hidden md:flex items-center h-full gap-1 lg:gap-2'>
              {/* Home */}
              <button
                onClick={() => setActiveTab('home')}
                className={`h-16 px-6 flex items-center justify-center border-b-4 transition-all duration-150 ${
                  activeTab === 'home'
                    ? 'text-blue border-blue'
                    : 'text-gray-500 hover:text-gray-800 border-transparent hover:bg-gray-50'
                }`}
              >
                <svg className='w-7 h-7' fill={activeTab === 'home' ? 'currentColor' : 'none'} stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' />
                </svg>
              </button>

              {/* Video/Shorts */}
              <button
                onClick={() => setActiveTab('video')}
                className={`h-16 px-6 flex items-center justify-center border-b-4 transition-all duration-150 ${
                  activeTab === 'video'
                    ? 'text-blue border-blue'
                    : 'text-gray-500 hover:text-gray-800 border-transparent hover:bg-gray-50'
                }`}
              >
                <svg className='w-7 h-7' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1.0 001.555.832l3.197-2.132a1 1 0 000-1.664z' />
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                </svg>
              </button>

              {/* Community/Friends */}
              <button
                onClick={() => setActiveTab('community')}
                className={`h-16 px-6 flex items-center justify-center border-b-4 transition-all duration-150 ${
                  activeTab === 'community'
                    ? 'text-blue border-blue'
                    : 'text-gray-500 hover:text-gray-800 border-transparent hover:bg-gray-50'
                }`}
              >
                <svg className='w-7 h-7' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' />
                </svg>
              </button>

              {/* Shop/Marketplace */}
              <button
                onClick={() => setActiveTab('shop')}
                className={`h-16 px-6 flex items-center justify-center border-b-4 transition-all duration-150 ${
                  activeTab === 'shop'
                    ? 'text-blue border-blue'
                    : 'text-gray-500 hover:text-gray-800 border-transparent hover:bg-gray-50'
                }`}
              >
                <svg className='w-7 h-7' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' />
                </svg>
              </button>

              {/* Create Post */}
              <button
                onClick={() => setActiveTab('create')}
                className={`h-16 px-6 flex items-center justify-center border-b-4 transition-all duration-150 ${
                  activeTab === 'create'
                    ? 'text-blue border-blue'
                    : 'text-gray-500 hover:text-gray-800 border-transparent hover:bg-gray-50'
                }`}
              >
                <svg className='w-7 h-7' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' />
                </svg>
              </button>
            </div>

            {/* User Avatar with Dropdown Toggle (Right) */}
            <div className='flex items-center gap-3 relative'>
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className='w-10 h-10 rounded-full overflow-hidden border border-gray-200 hover:ring-4 hover:ring-blue transition duration-200 flex items-center justify-center bg-gray-50 flex-shrink-0'
              >
                <img
                  src={user?.avatar || '/assets/avatar/avatar.jpg'}
                  alt='Avatar'
                  className='w-full h-full object-cover select-none'
                />
              </button>

              {/* Facebook-style Dropdown Menu */}
              {isDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40 cursor-default" 
                    onClick={() => setIsDropdownOpen(false)} 
                  />
                  <div className='absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 z-50 animate-scale-up origin-top-right select-none'>
                    
                    {/* User Card */}
                    <div 
                      onClick={() => {
                        setIsDropdownOpen(false);
                        router.push('/profile');
                      }}
                      className='bg-gray-50 hover:bg-gray-100/70 p-3.5 rounded-2xl border border-gray-100 transition duration-200 cursor-pointer mb-3 flex items-center gap-3'
                    >
                      <div className='w-11 h-11 rounded-full overflow-hidden border border-white shadow-sm bg-white flex-shrink-0'>
                        <img
                          src={user?.avatar || '/assets/avatar/avatar.jpg'}
                          alt='Profile Avatar'
                          className='w-full h-full object-cover'
                        />
                      </div>
                      <div className='flex-1 min-w-0'>
                        <h4 className='font-bold text-gray-900 truncate text-[15px]'>
                          {user?.username || 'User Profile'}
                        </h4>
                      </div>
                    </div>

                    {/* View all profile button */}
                    <button 
                      onClick={() => {
                        setIsDropdownOpen(false);
                        router.push('/profile');
                      }}
                      className='w-full py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition duration-200 flex items-center justify-center gap-2 text-sm shadow-sm'
                    >
                      <User className='w-4 h-4 text-gray-500' />
                      <span>Xem tất cả trang cá nhân</span>
                    </button>

                    {/* Separator */}
                    <div className='border-t border-gray-100 my-3' />

                    {/* Options List */}
                    <div className='space-y-1'>
                      {/* Cài đặt */}
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          router.push('/setting');
                        }}
                        className='w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 active:scale-[0.98] transition group'
                      >
                        <div className='flex items-center gap-3'>
                          <div className='w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-gray-700 group-hover:bg-blue group-hover:text-blue transition duration-200'>
                            <Settings className='w-5 h-5' />
                          </div>
                          <span className='text-sm font-semibold text-gray-500 group-hover:text-gray-700 transition-colors'>
                            Setting
                          </span>
                        </div>
                        <ChevronRight className='w-5 h-5 text-gray-500 group-hover:text-gray-700 transition-colors' />
                      </button>

                      {/* Game */}
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          router.push('/game');
                        }}
                        className='w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 active:scale-[0.98] transition group'
                      >
                        <div className='flex items-center gap-3'>
                          <div className='w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-gray-700 group-hover:bg-blue group-hover:text-blue transition duration-200'>
                            <Gamepad2 className='w-5 h-5' />
                          </div>
                          <span className='text-sm font-semibold text-gray-500 group-hover:text-gray-700 transition-colors'>
                            Game
                          </span>
                        </div>
                        <ChevronRight className='w-5 h-5 text-gray-500 group-hover:text-gray-700 transition-colors' />
                      </button>

                      {/* Đăng xuất - Chữ đỏ! */}
                      <button
                        onClick={handleLogOut}
                        className='w-full flex items-center justify-between p-3 rounded-xl hover:bg-red/50 active:scale-[0.98] transition group'
                      >
                        <div className='flex items-center gap-3'>
                          <div className='w-9 h-9 bg-red rounded-full flex items-center justify-center text-red group-hover:bg-red transition duration-200'>
                            <LogOut className='w-5 h-5' />
                          </div>
                          <span className='text-sm font-bold text-red group-hover:text-red transition-colors'>
                            Log out
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

      {/* Main Content */}
      <main className='pt-20 pb-8 px-4'>
        <div className='max-w-2xl mx-auto'>
          {/* Create Post Box */}
          <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-6'>
            <div className='flex gap-3 items-center'>
              <div className='w-10 h-10 rounded-full overflow-hidden border border-gray-100 bg-gray-50 flex-shrink-0 flex items-center justify-center'>
                <img
                  src={user?.avatar || '/assets/avatar/avatar.jpg'}
                  alt='Avatar'
                  className='w-full h-full object-cover'
                />
              </div>
              <div className='flex-1 flex gap-2'>
                <input
                  type='text'
                  placeholder='What is on your mind?'
                  className='flex-1 px-4 py-2.5 bg-gray-100 rounded-xl border-0 focus:ring-2 focus:ring-blue focus:bg-white transition outline-none text-sm text-gray-900 placeholder-gray-500'
                />
                <button className='px-5 py-2.5 bg-blue hover:bg-blue active:scale-[0.98] text-white font-bold rounded-xl transition duration-150 shadow-md shadow-blue/20 text-sm flex-shrink-0'>
                  Post
                </button>
              </div>
            </div>
          </div>

          {/* Sample Posts */}
          {[1, 2, 3].map((post) => (
            <div key={post} className='bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-4'>
              <div className='flex items-center gap-3 mb-3'>
                <div className='w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink flex items-center justify-center text-white font-semibold'>
                  {String.fromCharCode(64 + post)}
                </div>
                <div>
                  <h3 className='font-semibold text-gray-900'>User {post}</h3>
                  <p className='text-sm text-gray-500'>2 giờ trước</p>
                </div>
              </div>
              <p className='text-gray-800 mb-3'>
                Đây là bài viết mẫu số {post}. Nội dung bài đăng sẽ hiển thị ở đây...
              </p>
              <div className='w-full h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl mb-3'></div>
              <div className='flex items-center justify-between pt-3 border-t border-gray-100'>
                <button className='flex items-center gap-2 text-gray-600 hover:text-blue transition'>
                  <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' />
                  </svg>
                  <span className='font-medium'>Thích</span>
                </button>
                <button className='flex items-center gap-2 text-gray-600 hover:text-blue transition'>
                  <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' />
                  </svg>
                  <span className='font-medium'>Bình luận</span>
                </button>
                <button className='flex items-center gap-2 text-gray-600 hover:text-blue transition'>
                  <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z' />
                  </svg>
                  <span className='font-medium'>Chia sẻ</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Inline styles for modal animation */}
      <style jsx global>{`
        @keyframes scaleUpDropdown {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        
        .animate-scale-up {
          animation: scaleUpDropdown 0.15s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}
