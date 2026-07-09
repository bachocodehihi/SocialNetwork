'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { authService } from '@/services/auth.service';
import { contactService } from '@/services/contact.service';
import { useAlert } from '@/components/Alert/alertcontext';
import { User as UserIcon, Loader2, MessageSquare, UserPlus, UserMinus, UserCheck, Search, Users, FileText, Image } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';
  const { showSuccess, showError } = useAlert();
  const { t } = useLanguage();

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [relationships, setRelationships] = useState<Record<string, any>>({});
  const [processingUser, setProcessingUser] = useState<Record<string, boolean>>({});
  const [activeFilter, setActiveFilter] = useState('people'); // Default filter matches the user search result

  const filterItems = [
    { id: 'all', name: 'Tất cả', icon: Search },
    { id: 'people', name: 'Mọi người', icon: Users },
    { id: 'posts', name: 'Bài viết', icon: FileText },
    { id: 'groups', name: 'Nhóm', icon: Users },
    { id: 'photos', name: 'Hình ảnh & Video', icon: Image },
  ];

  useEffect(() => {
    if (!query.trim()) {
      setUsers([]);
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      try {
        const results = await authService.searchUsers(query);
        const usersList = Array.isArray(results.data) 
          ? results.data 
          : (Array.isArray(results) ? results : []);
        setUsers(usersList);

        // Fetch relationship status for each user
        const rels: Record<string, any> = {};
        for (const u of usersList) {
          try {
            const relData = await contactService.getRelationship(u._id || u.id);
            rels[u._id || u.id] = relData;
          } catch (e) {
            console.error('Error fetching relationship:', e);
          }
        }
        setRelationships(rels);
      } catch (err) {
        console.error('Search page error:', err);
        showError('Không thể tìm kiếm người dùng');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, showError]);

  const handleFriendAction = async (targetUser: any) => {
    const userId = targetUser._id || targetUser.id;
    const rel = relationships[userId];
    const status = rel?.status || 'none';

    setProcessingUser(prev => ({ ...prev, [userId]: true }));
    try {
      if (status === 'none') {
        const res = await contactService.sendRequest(userId);
        setRelationships(prev => ({
          ...prev,
          [userId]: { status: 'sent', requestId: res.data?._id || res._id }
        }));
        showSuccess(`Đã gửi lời mời kết bạn đến ${targetUser.username}`);
      } else if (status === 'sent') {
        const requestId = rel?.requestId;
        if (requestId) {
          await contactService.cancelRequest(requestId);
          setRelationships(prev => ({
            ...prev,
            [userId]: { status: 'none' }
          }));
          showSuccess('Đã hủy lời mời kết bạn');
        }
      } else if (status === 'received') {
        const requestId = rel?.requestId;
        if (requestId) {
          await contactService.acceptRequest(requestId);
          setRelationships(prev => ({
            ...prev,
            [userId]: { status: 'friend' }
          }));
          showSuccess(`Đã chấp nhận kết bạn với ${targetUser.username}`);
        }
      } else if (status === 'friend') {
        if (window.confirm(`Bạn có chắc chắn muốn hủy kết bạn với ${targetUser.username}?`)) {
          await contactService.removeFriend(userId);
          setRelationships(prev => ({
            ...prev,
            [userId]: { status: 'none' }
          }));
          showSuccess('Đã hủy kết bạn');
        }
      }
    } catch (err) {
      console.error(err);
      showError('Đã xảy ra lỗi khi thực hiện thao tác');
    } finally {
      setProcessingUser(prev => ({ ...prev, [userId]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-grey/5 dark:bg-zinc-950 flex flex-col">
      <Navbar />

      <main className="pt-24 pb-12 px-4 max-w-6xl mx-auto w-full flex-grow">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          
          {/* LEFT SIDEBAR: Search Filters */}
          <div className="w-full md:w-64 lg:w-72 flex-shrink-0 bg-white dark:bg-zinc-900 rounded-3xl border border-grey/15 dark:border-zinc-800/80 p-5 shadow-sm space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
            <div className="px-1 text-left">
              <h2 className="text-lg font-extrabold text-black dark:text-white tracking-tight">Bộ lọc tìm kiếm</h2>
              <p className="text-xs text-grey font-semibold mt-0.5">Thu hẹp phạm vi tìm kiếm của bạn</p>
            </div>
            
            <div className="space-y-1">
              {filterItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = activeFilter === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveFilter(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-extrabold transition-all duration-200 border-0 cursor-pointer text-left ${
                      isActive
                        ? 'bg-blue text-white shadow-sm shadow-blue/20'
                        : 'text-grey-hover hover:bg-grey/5 dark:text-zinc-400 dark:hover:bg-zinc-800/50 bg-transparent'
                    }`}
                  >
                    <IconComponent className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-grey'}`} />
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* RIGHT CONTENT: Search Results */}
          <div className="flex-1 w-full bg-white dark:bg-zinc-900 rounded-3xl border border-grey/15 dark:border-zinc-800/80 p-6 sm:p-8 shadow-sm">
            {/* Header */}
            <div className="border-b border-grey/10 dark:border-zinc-800 pb-5 mb-6 text-left">
              <h1 className="text-xl sm:text-2xl font-black text-black dark:text-white flex items-center gap-3">
                <Search className="w-6 h-6 text-blue" />
                <span>{t('search_results') || 'Kết quả tìm kiếm'}</span>
              </h1>
              {query && (
                <p className="text-sm font-semibold text-grey mt-1">
                  Tìm thấy {users.length} người dùng cho từ khóa &ldquo;<span className="text-blue">{query}</span>&rdquo;
                </p>
              )}
            </div>

            {/* List of matched accounts */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="w-10 h-10 animate-spin text-blue" />
                <p className="text-sm font-bold text-grey">Đang tải kết quả...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-base font-bold text-grey">Không tìm thấy người dùng phù hợp với từ khóa &ldquo;{query}&rdquo;</p>
                <p className="text-xs text-grey/60 mt-1">Hãy thử tìm với tên khác hoặc từ khóa khác.</p>
              </div>
            ) : (
              <div className="divide-y divide-grey/10 dark:divide-zinc-800/60">
                {users.map((item) => {
                  const userId = item._id || item.id;
                  const rel = relationships[userId];
                  const status = rel?.status || 'none';
                  const isProcessing = processingUser[userId];

                  return (
                    <div key={userId} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                      {/* User Card Info */}
                      <div 
                        onClick={() => router.push(`/user/${userId}`)}
                        className="flex items-center gap-4 cursor-pointer min-w-0 flex-1 hover:opacity-90 group text-left"
                      >
                        <div className="w-14 h-14 rounded-full border border-grey/25 dark:border-zinc-800 bg-grey/10 overflow-hidden flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition duration-200">
                          {item.avatar ? (
                            <img src={item.avatar} alt={item.username} className="w-full h-full object-cover" />
                          ) : (
                            <UserIcon className="w-7 h-7 text-grey" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-extrabold text-base text-black dark:text-white group-hover:text-blue transition-colors truncate">
                            {item.username}
                          </h3>
                          {item.email && (
                            <p className="text-sm text-grey font-medium truncate">
                              {item.email}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => router.push(`/home/message?userId=${userId}`)}
                          className="p-2 sm:px-4 sm:py-2.5 rounded-xl bg-grey/10 hover:bg-grey/20 dark:bg-zinc-800/60 dark:hover:bg-zinc-800 text-black dark:text-white font-bold text-sm transition flex items-center gap-1.5 border-0 cursor-pointer"
                          title="Nhắn tin"
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span className="hidden sm:inline">Nhắn tin</span>
                        </button>

                        <button
                          onClick={() => handleFriendAction(item)}
                          disabled={isProcessing}
                          className={`p-2 sm:px-4 sm:py-2.5 rounded-xl font-bold text-sm transition flex items-center gap-1.5 border-0 cursor-pointer ${
                            status === 'friend'
                              ? 'bg-green-500/10 hover:bg-green-500/20 text-green-600 dark:text-green-400'
                              : status === 'sent'
                              ? 'bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400'
                              : status === 'received'
                              ? 'bg-blue text-white hover:bg-blue-hover'
                              : 'bg-blue text-white hover:bg-blue-hover'
                          }`}
                        >
                          {isProcessing ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : status === 'friend' ? (
                            <>
                              <UserCheck className="w-4 h-4" />
                              <span className="hidden sm:inline">Bạn bè</span>
                            </>
                          ) : status === 'sent' ? (
                            <>
                              <UserMinus className="w-4 h-4" />
                              <span className="hidden sm:inline">Đã gửi</span>
                            </>
                          ) : status === 'received' ? (
                            <>
                              <UserPlus className="w-4 h-4" />
                              <span className="hidden sm:inline">Phản hồi</span>
                            </>
                          ) : (
                            <>
                              <UserPlus className="w-4 h-4" />
                              <span className="hidden sm:inline">Thêm bạn bè</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-grey/5 dark:bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue" />
      </div>
    }>
      <SearchResultsContent />
    </Suspense>
  );
}
