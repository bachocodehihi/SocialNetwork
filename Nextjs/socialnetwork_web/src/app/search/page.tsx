'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { authService } from '@/services/auth.service';
import { contactService } from '@/services/contact.service';
import { groupService } from '@/services/group.service';
import { contentService } from '@/services/content.service';
import { useAlert } from '@/components/Alert/alertcontext';
import { 
  User as UserIcon, Loader2, MessageSquare, UserPlus, UserMinus, UserCheck, 
  Search, Users, FileText, Image, ThumbsUp, MessageCircle, Share2, 
  Globe, Lock, Shield, Eye, Clock, ArrowRight, Compass, Check
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';
  const { showSuccess, showError } = useAlert();
  const { t } = useLanguage();

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [relationships, setRelationships] = useState<Record<string, any>>({});
  const [processingUser, setProcessingUser] = useState<Record<string, boolean>>({});
  const [joiningGroup, setJoiningGroup] = useState<Record<string, boolean>>({});
  const [activeFilter, setActiveFilter] = useState('all'); // Default filter to show all sections

  const filterItems = [
    { id: 'all', name: 'Tất cả', icon: Search },
    { id: 'people', name: 'Mọi người', icon: Users },
    { id: 'posts', name: 'Bài viết', icon: FileText },
    { id: 'groups', name: 'Nhóm', icon: Compass },
    { id: 'photos', name: 'Hình ảnh & Video', icon: Image },
  ];

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await authService.getProfile();
        setCurrentUser(data);
      } catch (err) {
        console.error('Error fetching profile:', err);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setUsers([]);
      setGroups([]);
      setPosts([]);
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

        try {
          const gRes = await groupService.searchGroups(query);
          const groupsList = Array.isArray(gRes.data)
            ? gRes.data
            : (Array.isArray(gRes) ? gRes : []);
          setGroups(groupsList);
        } catch (gErr) {
          console.error('Error searching groups:', gErr);
          setGroups([]);
        }

        try {
          const pRes = await contentService.searchPosts(query);
          const postsList = Array.isArray(pRes.data)
            ? pRes.data
            : (Array.isArray(pRes) ? pRes : []);
          setPosts(postsList);
        } catch (pErr) {
          console.error('Error searching posts:', pErr);
          setPosts([]);
        }
      } catch (err) {
        console.error('Search page error:', err);
        showError('Không thể thực hiện tìm kiếm');
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

  const handleJoinGroup = async (groupItem: any) => {
    const groupId = groupItem._id || groupItem.id;
    setJoiningGroup(prev => ({ ...prev, [groupId]: true }));
    try {
      const res = await groupService.joinGroup(groupId);
      if (res.status === 'pending') {
        showSuccess('Đã gửi yêu cầu tham gia nhóm!');
        setGroups(prev =>
          prev.map(g =>
            (g._id === groupId || g.id === groupId) ? { ...g, isPendingJoin: true } : g
          )
        );
      } else if (res.status === 'approved') {
        showSuccess('Đã gia nhập nhóm thành công!');
        setGroups(prev =>
          prev.map(g =>
            (g._id === groupId || g.id === groupId) ? { ...g, isMember: true } : g
          )
        );
      }
    } catch (err: any) {
      console.error(err);
      const errMsg = err.response?.data?.message || 'Đã xảy ra lỗi khi tham gia nhóm';
      showError(errMsg);
    } finally {
      setJoiningGroup(prev => ({ ...prev, [groupId]: false }));
    }
  };

  const handleLikePost = async (postId: string) => {
    if (!currentUser) return;
    const currentUserId = currentUser._id || currentUser.id;

    setPosts(prevPosts =>
      prevPosts.map(post => {
        if (post._id === postId) {
          const likes = [...(post.likes || [])];
          const hasLiked = likes.includes(currentUserId);
          return {
            ...post,
            likes: hasLiked
              ? likes.filter(id => id !== currentUserId)
              : [...likes, currentUserId],
          };
        }
        return post;
      })
    );

    try {
      const result = await contentService.likePost(postId);
      if (result && result.post) {
        setPosts(prevPosts =>
          prevPosts.map(post => (post._id === postId ? result.post : post))
        );
      }
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };

  const formatTimeAgo = (dateTimeStr?: string): string => {
    if (!dateTimeStr) return '';
    try {
      const date = new Date(dateTimeStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffDays > 7) {
        return `${date.getDate()} thg ${date.getMonth() + 1}, ${date.getFullYear()}`;
      } else if (diffDays >= 1) {
        return `${diffDays} ngày trước`;
      } else if (diffHours >= 1) {
        return `${diffHours} giờ trước`;
      } else if (diffMins >= 1) {
        return `${diffMins} phút trước`;
      } else {
        return 'Vừa xong';
      }
    } catch (e) {
      return '';
    }
  };

  const renderPostImages = (post: any) => {
    const images = post.images || [];
    if (!images || images.length === 0) return null;

    if (images.length === 1) {
      return (
        <div className="mt-3 overflow-hidden rounded-xl border border-grey/20 max-h-[380px]">
          <img
            src={images[0]}
            alt="Post attachment"
            className="w-full h-auto max-h-[380px] object-cover"
          />
        </div>
      );
    }

    if (images.length === 2) {
      return (
        <div className="mt-3 grid grid-cols-2 gap-2 h-56 rounded-xl overflow-hidden">
          <img
            src={images[0]}
            alt="Post attachment 1"
            className="w-full h-full object-cover"
          />
          <img
            src={images[1]}
            alt="Post attachment 2"
            className="w-full h-full object-cover"
          />
        </div>
      );
    }

    const remaining = images.length - 3;
    return (
      <div className="mt-3 grid grid-cols-3 gap-2 h-60 rounded-xl overflow-hidden">
        <div className="col-span-2 h-full">
          <img
            src={images[0]}
            alt="Post attachment 1"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="grid grid-rows-2 gap-2 h-full">
          <div className="h-full overflow-hidden">
            <img
              src={images[1]}
              alt="Post attachment 2"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="h-full relative overflow-hidden">
            <img
              src={images[2]}
              alt="Post attachment 3"
              className="w-full h-full object-cover"
            />
            {remaining > 0 && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-base font-bold select-none">
                +{remaining}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const allPhotos = posts.flatMap(post => 
    (post.images || []).map((imgUrl: string) => ({
      imgUrl,
      post
    }))
  );

  const renderUserRow = (item: any) => {
    const userId = item._id || item.id;
    const rel = relationships[userId];
    const status = rel?.status || 'none';
    const isProcessing = processingUser[userId];

    return (
      <div key={userId} className="py-4 flex items-center justify-between gap-4 border-b border-grey/5 last:border-0">
        <div 
          onClick={() => router.push(`/user/${userId}`)}
          className="flex items-center gap-4 cursor-pointer min-w-0 flex-1 hover:opacity-90 group text-left"
        >
          <div className="w-12 h-12 rounded-full border border-grey/25 dark:border-zinc-800 bg-grey/10 overflow-hidden flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition duration-200">
            {item.avatar ? (
              <img src={item.avatar} alt={item.username} className="w-full h-full object-cover" />
            ) : (
              <UserIcon className="w-6 h-6 text-grey" />
            )}
          </div>
          <div className="min-w-0">
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-blue transition-colors truncate">
              {item.username}
            </h3>
            {item.email && (
              <p className="text-xs sm:text-sm text-grey font-medium truncate">
                {item.email}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => router.push(`/home/message?userId=${userId}`)}
            className="p-2 sm:px-3.5 sm:py-2 rounded-xl bg-grey/10 hover:bg-grey/20 dark:bg-zinc-850 dark:hover:bg-zinc-800 text-black dark:text-white font-bold text-xs sm:text-sm transition flex items-center gap-1.5 border-0 cursor-pointer"
            title="Nhắn tin"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Nhắn tin</span>
          </button>

          <button
            onClick={() => handleFriendAction(item)}
            disabled={isProcessing}
            className={`p-2 sm:px-3.5 sm:py-2 rounded-xl font-bold text-xs sm:text-sm transition flex items-center gap-1.5 border-0 cursor-pointer ${
              status === 'friend'
                ? 'bg-green-500/10 hover:bg-green-500/20 text-green-600 dark:text-green-400'
                : status === 'sent'
                ? 'bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400'
                : status === 'received'
                ? 'bg-blue text-white hover:bg-blue-hover'
                : 'bg-blue text-white hover:bg-blue'
            }`}
          >
            {isProcessing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : status === 'friend' ? (
              <>
                <UserCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Bạn bè</span>
              </>
            ) : status === 'sent' ? (
              <>
                <UserMinus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Đã gửi</span>
              </>
            ) : status === 'received' ? (
              <>
                <UserPlus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Phản hồi</span>
              </>
            ) : (
              <>
                <UserPlus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Thêm bạn</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  const renderGroupRow = (item: any) => {
    const groupId = item._id || item.id;
    const isMember = item.isMember || false;
    const isAdmin = item.isAdmin || false;
    const isPendingJoin = item.isPendingJoin || false;
    const isProcessing = joiningGroup[groupId];

    const groupType = item.settings?.groupType || 'public';

    return (
      <div key={groupId} className="py-4 flex items-center justify-between gap-4 border-b border-grey/5 last:border-0">
        <div 
          onClick={() => router.push(`/group?groupId=${groupId}`)}
          className="flex items-center gap-4 cursor-pointer min-w-0 flex-1 hover:opacity-90 group text-left"
        >
          <div className="w-12 h-12 rounded-2xl border border-grey/25 dark:border-zinc-800 bg-grey/10 overflow-hidden flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition duration-200">
            {item.avatar ? (
              <img src={item.avatar} alt={item.name} className="w-full h-full object-cover" />
            ) : (
              <Users className="w-6 h-6 text-grey" />
            )}
          </div>
          <div className="min-w-0">
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-blue transition-colors truncate flex items-center gap-1.5">
              <span>{item.name}</span>
              {groupType === 'private' ? (
                <span title="Nhóm Riêng tư">
                  <Shield className="w-3.5 h-3.5 text-orange-500" />
                </span>
              ) : groupType === 'internal' ? (
                <span title="Nhóm Nội bộ">
                  <Eye className="w-3.5 h-3.5 text-red" />
                </span>
              ) : (
                <span title="Nhóm Công khai">
                  <Globe className="w-3.5 h-3.5 text-blue" />
                </span>
              )}
            </h3>
            <p className="text-xs sm:text-sm text-grey font-medium truncate">
              {item.membersCount || 0} thành viên · Admin: {item.admin?.username || 'Ẩn'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {isAdmin ? (
            <span className="px-3 py-1.5 rounded-lg border border-grey/20 text-xs font-extrabold text-grey">
              Quản trị viên
            </span>
          ) : isMember ? (
            <button 
              onClick={() => router.push(`/group?groupId=${groupId}`)}
              className="px-3.5 py-2 rounded-xl bg-green-500/10 text-green-600 dark:text-green-400 font-extrabold text-xs sm:text-sm border-0 cursor-pointer flex items-center gap-1 hover:opacity-90 transition"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Đã tham gia</span>
            </button>
          ) : isPendingJoin ? (
            <span className="px-3.5 py-2 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 font-extrabold text-xs sm:text-sm">
              Đang chờ duyệt
            </span>
          ) : (
            <button
              onClick={() => handleJoinGroup(item)}
              disabled={isProcessing}
              className="px-3.5 py-2 rounded-xl bg-blue hover:bg-blue/90 text-white font-extrabold text-xs sm:text-sm border-0 cursor-pointer flex items-center gap-1.5 transition"
            >
              {isProcessing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Tham gia</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderPostCard = (post: any) => {
    const author = post.author || {};
    const authorName = author.username || 'Người dùng';
    const authorAvatar = author.avatar || '';
    const timeAgoStr = formatTimeAgo(post.createdAt);

    const isGroupPost = post.postType === 'group';
    const group = post.group || {};
    const groupName = group.name || '';
    
    const currentUserId = currentUser?._id || currentUser?.id;
    const hasLiked = post.likes?.includes(currentUserId) || false;
    const likesCount = post.likes?.length || 0;
    const commentsCount = (post.comments || []).length;

    return (
      <div key={post._id} className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-grey/15 dark:border-zinc-800/80 p-4 mb-4 text-left">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div 
              onClick={() => router.push(`/user/${author._id || author.id}`)}
              className="w-10 h-10 rounded-full overflow-hidden border border-grey/10 dark:border-zinc-800 bg-grey/5 dark:bg-zinc-800 flex-shrink-0 flex items-center justify-center cursor-pointer"
            >
              {authorAvatar ? (
                <img src={authorAvatar} alt={authorName} className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-5 h-5 text-grey" />
              )}
            </div>
            <div className="flex flex-col">
              <div className="flex items-center flex-wrap gap-1">
                <h4 
                  onClick={() => router.push(`/user/${author._id || author.id}`)}
                  className="font-bold text-sm sm:text-base text-slate-900 dark:text-zinc-200 hover:underline cursor-pointer"
                >
                  {authorName}
                </h4>
                {isGroupPost && groupName && (
                  <div className="flex items-center gap-1 text-xs text-grey dark:text-zinc-400 font-medium">
                    <span className="text-grey/60">▸</span>
                    <span 
                      onClick={() => router.push(`/group?groupId=${group._id}`)}
                      className="text-blue font-semibold hover:underline cursor-pointer"
                    >
                      {groupName}
                    </span>
                  </div>
                )}
              </div>
              <span className="text-xs text-grey dark:text-zinc-450 font-medium flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{timeAgoStr}</span>
              </span>
            </div>
          </div>
        </div>

        <p 
          onClick={() => {
            if (isGroupPost && group._id) {
              router.push(`/group?groupId=${group._id}`);
            } else {
              router.push(`/user/${author._id || author.id}`);
            }
          }}
          className="text-slate-800 dark:text-zinc-200 text-sm leading-relaxed mb-3 whitespace-pre-wrap text-justify cursor-pointer hover:opacity-95"
        >
          {post.content}
        </p>

        {renderPostImages(post)}

        <div className="flex items-center justify-between text-xs text-grey dark:text-zinc-450 py-3 mt-3 border-t border-b border-grey/10 dark:border-zinc-800/60 select-none">
          <div className="flex items-center gap-1 font-semibold">
            <ThumbsUp className="w-3.5 h-3.5 text-blue fill-blue/10" />
            <span>{likesCount} thích</span>
          </div>
          <div className="flex items-center gap-2 font-semibold">
            <span>{commentsCount} bình luận</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-1 pt-1.5 select-none">
          <button 
            onClick={() => handleLikePost(post._id)}
            className={`flex items-center justify-center gap-2 py-2 rounded-xl hover:bg-grey/5 dark:hover:bg-zinc-800/50 transition font-bold text-xs sm:text-sm border-0 cursor-pointer bg-transparent ${hasLiked ? 'text-blue' : 'text-grey-hover dark:text-zinc-300'}`}
          >
            <ThumbsUp className={`w-4 h-4 ${hasLiked ? 'fill-blue text-blue' : ''}`} />
            <span>Thích</span>
          </button>
          <button 
            onClick={() => {
              if (isGroupPost && group._id) {
                router.push(`/group?groupId=${group._id}`);
              } else {
                router.push(`/user/${author._id || author.id}`);
              }
            }}
            className="flex items-center justify-center gap-2 py-2 rounded-xl hover:bg-grey/5 dark:hover:bg-zinc-800/50 transition text-grey-hover dark:text-zinc-300 font-bold text-xs sm:text-sm border-0 cursor-pointer bg-transparent"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Xem bình luận</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-zinc-950 flex flex-col">
      <Navbar />

      <main className="pt-24 pb-12 px-4 max-w-6xl mx-auto w-full flex-grow">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          
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

          <div className="flex-1 w-full bg-white dark:bg-zinc-900 rounded-3xl border border-grey/15 dark:border-zinc-800/80 p-6 sm:p-8 shadow-sm">

            <div className="border-b border-grey/10 dark:border-zinc-800 pb-5 mb-6 text-left">
              <h1 className="text-xl sm:text-2xl font-black text-black dark:text-white flex items-center gap-3">
                <Search className="w-6 h-6 text-blue" />
                <span>{t('search_results') || 'Kết quả tìm kiếm'}</span>
              </h1>
              {query && (
                <div className="text-xs sm:text-sm font-semibold text-grey mt-1 space-y-1">
                  <p>Từ khóa tìm kiếm: &ldquo;<span className="text-blue">{query}</span>&rdquo;</p>
                  <p className="text-grey/60 text-xs">
                    Tìm thấy {users.length} người dùng · {groups.length} nhóm · {posts.length} bài viết
                  </p>
                </div>
              )}
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="w-10 h-10 animate-spin text-blue" />
                <p className="text-sm font-bold text-grey">Đang tải kết quả...</p>
              </div>
            ) : !query.trim() ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 rounded-full bg-blue/5 flex items-center justify-center mx-auto text-blue mb-4">
                  <Search className="w-8 h-8" />
                </div>
                <p className="text-base font-bold text-grey">Hãy nhập từ khóa để tìm kiếm</p>
                <p className="text-xs text-grey/60 mt-1">Tìm kiếm bạn bè, nhóm và các bài viết thú vị trên mạng xã hội.</p>
              </div>
            ) : (
              <div>
                
                {activeFilter === 'all' && (
                  <div className="space-y-10">
                    
                    <div className="text-left">
                      <div className="flex items-center justify-between mb-4 border-b border-grey/5 pb-2">
                        <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                          <Users className="w-5 h-5 text-blue" />
                          <span>Mọi người</span>
                        </h2>
                        {users.length > 3 && (
                          <button
                            onClick={() => setActiveFilter('people')}
                            className="text-xs font-bold text-blue hover:underline cursor-pointer border-0 bg-transparent flex items-center gap-1"
                          >
                            <span>Xem tất cả</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      
                      {users.length === 0 ? (
                        <p className="text-xs sm:text-sm text-grey font-medium py-2">Không tìm thấy người dùng phù hợp.</p>
                      ) : (
                        <div className="divide-y divide-grey/5">
                          {users.slice(0, 3).map(renderUserRow)}
                        </div>
                      )}
                    </div>

                    <div className="text-left">
                      <div className="flex items-center justify-between mb-4 border-b border-grey/5 pb-2">
                        <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                          <Compass className="w-5 h-5 text-blue" />
                          <span>Nhóm</span>
                        </h2>
                        {groups.length > 3 && (
                          <button
                            onClick={() => setActiveFilter('groups')}
                            className="text-xs font-bold text-blue hover:underline cursor-pointer border-0 bg-transparent flex items-center gap-1"
                          >
                            <span>Xem tất cả</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      
                      {groups.length === 0 ? (
                        <p className="text-xs sm:text-sm text-grey font-medium py-2">Không tìm thấy nhóm phù hợp hoặc nhóm bạn tìm kiếm là nhóm nội bộ.</p>
                      ) : (
                        <div className="divide-y divide-grey/5">
                          {groups.slice(0, 3).map(renderGroupRow)}
                        </div>
                      )}
                    </div>

                    <div className="text-left">
                      <div className="flex items-center justify-between mb-4 border-b border-grey/5 pb-2">
                        <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                          <FileText className="w-5 h-5 text-blue" />
                          <span>Bài viết</span>
                        </h2>
                        {posts.length > 3 && (
                          <button
                            onClick={() => setActiveFilter('posts')}
                            className="text-xs font-bold text-blue hover:underline cursor-pointer border-0 bg-transparent flex items-center gap-1"
                          >
                            <span>Xem tất cả</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      
                      {posts.length === 0 ? (
                        <p className="text-xs sm:text-sm text-grey font-medium py-2">Không tìm thấy bài viết nào phù hợp.</p>
                      ) : (
                        <div className="space-y-4 pt-1">
                          {posts.slice(0, 3).map(renderPostCard)}
                        </div>
                      )}
                    </div>

                    <div className="text-left">
                      <div className="flex items-center justify-between mb-4 border-b border-grey/5 pb-2">
                        <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                          <Image className="w-5 h-5 text-blue" />
                          <span>Hình ảnh & Video</span>
                        </h2>
                        {allPhotos.length > 6 && (
                          <button
                            onClick={() => setActiveFilter('photos')}
                            className="text-xs font-bold text-blue hover:underline cursor-pointer border-0 bg-transparent flex items-center gap-1"
                          >
                            <span>Xem tất cả</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      
                      {allPhotos.length === 0 ? (
                        <p className="text-xs sm:text-sm text-grey font-medium py-2">Không tìm thấy hình ảnh nào.</p>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                          {allPhotos.slice(0, 6).map((item, idx) => (
                            <div 
                              key={idx} 
                              onClick={() => router.push(item.post.postType === 'group' ? `/group?groupId=${item.post.group?._id}` : `/user/${item.post.author?._id || item.post.author?.id}`)}
                              className="aspect-square relative rounded-2xl overflow-hidden border border-grey/15 group cursor-pointer hover:opacity-95 transition"
                            >
                              <img src={item.imgUrl} alt="gallery-preview" className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex items-end p-2.5">
                                <p className="text-white text-[10px] sm:text-xs font-bold truncate">Bởi {item.post.author?.username || 'Thành viên'}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>
                )}

                {activeFilter === 'people' && (
                  <div className="divide-y divide-grey/5 text-left">
                    {users.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-sm font-bold text-grey">Không tìm thấy người dùng nào phù hợp</p>
                      </div>
                    ) : (
                      users.map(renderUserRow)
                    )}
                  </div>
                )}

                {activeFilter === 'groups' && (
                  <div className="divide-y divide-grey/5 text-left">
                    {groups.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-sm font-bold text-grey">Không tìm thấy nhóm nào phù hợp</p>
                        <p className="text-xs text-grey/65 mt-1">Lưu ý: Các nhóm được cấu hình ở chế độ Nội bộ sẽ không thể tìm thấy bằng thanh công cụ.</p>
                      </div>
                    ) : (
                      groups.map(renderGroupRow)
                    )}
                  </div>
                )}

                {activeFilter === 'posts' && (
                  <div className="text-left space-y-4">
                    {posts.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-sm font-bold text-grey">Không tìm thấy bài viết nào phù hợp</p>
                      </div>
                    ) : (
                      posts.map(renderPostCard)
                    )}
                  </div>
                )}

                {activeFilter === 'photos' && (
                  <div className="text-left">
                    {allPhotos.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-sm font-bold text-grey">Không tìm thấy hình ảnh nào phù hợp</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
                        {allPhotos.map((item, idx) => (
                          <div 
                            key={idx} 
                            onClick={() => router.push(item.post.postType === 'group' ? `/group?groupId=${item.post.group?._id}` : `/user/${item.post.author?._id || item.post.author?.id}`)}
                            className="aspect-square relative rounded-2xl overflow-hidden border border-grey/15 group cursor-pointer hover:opacity-95 transition"
                          >
                            <img src={item.imgUrl} alt="gallery-item" className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex items-end p-3">
                              <p className="text-white text-xs font-bold truncate">Bởi {item.post.author?.username || 'Thành viên'}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

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
      <div className="min-h-screen bg-slate-100 dark:bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue" />
      </div>
    }>
      <SearchResultsContent />
    </Suspense>
  );
}
