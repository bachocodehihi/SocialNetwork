'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../../services/auth.service';
import { contentService } from '../../services/content.service';
import { contactService } from '../../services/contact.service';
import { accountService } from '../../services/accout.service';
import { useAlert } from '../Alert/alertcontext';
import Navbar from '../Navbar';
import { 
  User, 
  Settings, 
  ChevronRight,
  ThumbsUp,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Cake,
  Mail,
  MapPin,
  Phone,
  Briefcase,
  Globe,
  Users,
  Lock,
  RefreshCw,
  Loader2,
  ArrowLeft,
  Calendar,
  Flag,
  UserPlus,
  UserMinus,
  UserCheck,
  MessageSquare,
  Sparkles
} from 'lucide-react';

interface ProfileViewProps {
  targetId?: string; // If empty, we load the logged-in user's profile
}

export default function ProfileView({ targetId }: ProfileViewProps) {
  const router = useRouter();
  const { showSuccess, showError } = useAlert();

  const [checking, setChecking] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [profileUser, setProfileUser] = useState<any>(null);

  // Friendship states
  const [friendshipStatus, setFriendshipStatus] = useState<'none' | 'requested' | 'received' | 'friend'>('none');
  const [requestId, setRequestId] = useState<string | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Feed states
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoadingFeed, setIsLoadingFeed] = useState(true);
  const [expandedPosts, setExpandedPosts] = useState<Record<string, boolean>>({});

  // Comments states
  const [commentSectionOpen, setCommentSectionOpen] = useState<Record<string, boolean>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [replyingTo, setReplyingTo] = useState<{
    postId: string;
    commentId: string;
    username: string;
  } | null>(null);

  const isSelf = !targetId || targetId === currentUser?._id || targetId === currentUser?.id;

  // Initialize and load data
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/signin');
      return;
    }

    const loadProfileData = async () => {
      try {
        // 1. Fetch current logged-in user profile
        const selfData = await authService.getProfile();
        setCurrentUser(selfData);

        const currentProfileId = targetId || selfData._id || selfData.id;

        // 2. Fetch target profile details
        if (!targetId || targetId === selfData._id || targetId === selfData.id) {
          setProfileUser(selfData);
        } else {
          const detailedData = await accountService.getUserById(currentProfileId);
          setProfileUser(detailedData);
        }

        // 3. Fetch user posts
        try {
          const postsData = await contentService.getUserPosts(currentProfileId);
          setPosts(Array.isArray(postsData) ? postsData : (postsData?.data || []));
        } catch (err) {
          console.error('Error fetching user posts:', err);
          setPosts([]);
        }

        // 4. Fetch friendship status if viewing someone else
        if (targetId && targetId !== selfData._id && targetId !== selfData.id) {
          try {
            const rel = await contactService.getRelationship(targetId);
            if (rel && rel.status) {
              switch (rel.status) {
                case 'requested':
                  setFriendshipStatus('requested');
                  setRequestId(rel.requestId);
                  break;
                case 'received':
                  setFriendshipStatus('received');
                  setRequestId(rel.requestId);
                  break;
                case 'friend':
                  setFriendshipStatus('friend');
                  break;
                default:
                  setFriendshipStatus('none');
                  setRequestId(null);
              }
            }
          } catch (err) {
            console.error('Error loading relationship:', err);
          }
        }

        setChecking(false);
      } catch (err) {
        console.error('Error loading profile page data:', err);
        showError('Không thể tải thông tin trang cá nhân. Vui lòng thử lại!');
        router.replace('/home');
      }
    };

    loadProfileData();
  }, [targetId, router]);

  // Loading Feed
  const fetchUserPosts = async () => {
    const currentProfileId = targetId || currentUser?._id || currentUser?.id;
    if (!currentProfileId) return;

    setIsLoadingFeed(true);
    try {
      const postsData = await contentService.getUserPosts(currentProfileId);
      setPosts(Array.isArray(postsData) ? postsData : (postsData?.data || []));
    } catch (err) {
      console.error('Error reloading user posts:', err);
    } finally {
      setIsLoadingFeed(false);
    }
  };

  useEffect(() => {
    if (!checking) {
      fetchUserPosts();
    }
  }, [checking]);

  // Friendship Actions
  const handleSendRequest = async () => {
    if (isActionLoading || !targetId) return;
    setIsActionLoading(true);
    try {
      const res = await contactService.sendRequest(targetId);
      if (res.type === 'auto_accepted') {
        setFriendshipStatus('friend');
        showSuccess('Đã tự động chấp nhận kết bạn!');
      } else {
        setFriendshipStatus('requested');
        setRequestId(res.requestId);
        showSuccess('Đã gửi yêu cầu kết bạn!');
      }
    } catch (err) {
      console.error(err);
      showError('Gửi yêu cầu kết bạn thất bại.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleCancelRequest = async () => {
    if (isActionLoading || !requestId) return;
    setIsActionLoading(true);
    try {
      await contactService.cancelRequest(requestId);
      setFriendshipStatus('none');
      setRequestId(null);
      showSuccess('Đã hủy yêu cầu kết bạn.');
    } catch (err) {
      console.error(err);
      showError('Hủy yêu cầu kết bạn thất bại.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleAcceptRequest = async () => {
    if (isActionLoading || !requestId) return;
    setIsActionLoading(true);
    try {
      await contactService.acceptRequest(requestId);
      setFriendshipStatus('friend');
      showSuccess('Hai bạn hiện đã là bạn bè!');
    } catch (err) {
      console.error(err);
      showError('Chấp nhận kết bạn thất bại.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleRejectRequest = async () => {
    if (isActionLoading || !requestId) return;
    setIsActionLoading(true);
    try {
      await contactService.rejectRequest(requestId);
      setFriendshipStatus('none');
      setRequestId(null);
      showSuccess('Đã từ chối yêu cầu kết bạn.');
    } catch (err) {
      console.error(err);
      showError('Từ chối yêu cầu kết bạn thất bại.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleUnfriend = async () => {
    if (isActionLoading || !targetId) return;
    if (!confirm('Bạn có chắc chắn muốn hủy kết bạn không?')) return;
    setIsActionLoading(true);
    try {
      await contactService.removeFriend(targetId);
      setFriendshipStatus('none');
      setRequestId(null);
      showSuccess('Đã hủy kết bạn.');
    } catch (err) {
      console.error(err);
      showError('Hủy kết bạn thất bại.');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Like & Comment Handlers (Optimistic update pattern identical to home page)
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

  const handleAddComment = async (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;

    setCommentInputs(prev => ({ ...prev, [postId]: '' }));

    try {
      const result = await contentService.commentPost(postId, text);
      if (result && result.post) {
        setPosts(prevPosts =>
          prevPosts.map(post => (post._id === postId ? result.post : post))
        );
      }
    } catch (err) {
      console.error('Error adding comment:', err);
      showError('Không thể thêm bình luận. Vui lòng thử lại!');
    }
  };

  const handleAddReply = async (postId: string, commentId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;

    setCommentInputs(prev => ({ ...prev, [postId]: '' }));
    setReplyingTo(null);

    try {
      const result = await contentService.replyComment(postId, commentId, text);
      if (result && result.post) {
        setPosts(prevPosts =>
          prevPosts.map(post => (post._id === postId ? result.post : post))
        );
        setExpandedComments(prev => ({ ...prev, [commentId]: true }));
      }
    } catch (err) {
      console.error('Error adding reply:', err);
      showError('Không thể gửi phản hồi. Vui lòng thử lại!');
    }
  };

  const handleLikeComment = async (postId: string, commentId: string) => {
    if (!currentUser) return;
    const currentUserId = currentUser._id || currentUser.id;

    setPosts(prevPosts =>
      prevPosts.map(post => {
        if (post._id === postId) {
          const updatedComments = (post.comments || []).map((c: any) => {
            if (c._id === commentId) {
              const likes = [...(c.likes || [])];
              const hasLiked = likes.includes(currentUserId);
              return {
                ...c,
                likes: hasLiked
                  ? likes.filter(id => id !== currentUserId)
                  : [...likes, currentUserId],
              };
            }
            return c;
          });
          return { ...post, comments: updatedComments };
        }
        return post;
      })
    );

    try {
      const result = await contentService.likeComment(commentId);
      if (result && result.post) {
        setPosts(prevPosts =>
          prevPosts.map(post => (post._id === postId ? result.post : post))
        );
      }
    } catch (err) {
      console.error('Error liking comment:', err);
    }
  };

  const handleLikeReply = async (postId: string, commentId: string, replyId: string) => {
    if (!currentUser) return;
    const currentUserId = currentUser._id || currentUser.id;

    setPosts(prevPosts =>
      prevPosts.map(post => {
        if (post._id === postId) {
          const updatedComments = (post.comments || []).map((c: any) => {
            if (c._id === commentId) {
              const updatedReplies = (c.replies || []).map((r: any) => {
                if (r._id === replyId) {
                  const likes = [...(r.likes || [])];
                  const hasLiked = likes.includes(currentUserId);
                  return {
                    ...r,
                    likes: hasLiked
                      ? likes.filter(id => id !== currentUserId)
                      : [...likes, currentUserId],
                  };
                }
                return r;
              });
              return { ...c, replies: updatedReplies };
            }
            return c;
          });
          return { ...post, comments: updatedComments };
        }
        return post;
      })
    );

    try {
      const result = await contentService.likeReply(commentId, replyId);
      if (result && result.post) {
        setPosts(prevPosts =>
          prevPosts.map(post => (post._id === postId ? result.post : post))
        );
      }
    } catch (err) {
      console.error('Error liking reply:', err);
    }
  };

  // Helper formatting methods
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

  const getCommentsCount = (post: any): number => {
    const comments = post.comments || [];
    let count = comments.length;
    for (const comment of comments) {
      const replies = comment.replies || [];
      count += replies.length;
    }
    return count;
  };

  const renderPostImages = (images: string[]) => {
    if (!images || images.length === 0) return null;

    if (images.length === 1) {
      return (
        <div className="mt-3 overflow-hidden rounded-xl border border-grey/20 max-h-[500px]">
          <img
            src={images[0]}
            alt="Post attachment"
            className="w-full h-auto max-h-[500px] object-cover"
          />
        </div>
      );
    }

    if (images.length === 2) {
      return (
        <div className="mt-3 grid grid-cols-2 gap-2 h-72 rounded-xl overflow-hidden">
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
      <div className="mt-3 grid grid-cols-3 gap-2 h-80 rounded-xl overflow-hidden">
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
              <div className="absolute inset-0 bg-black/55 flex items-center justify-center text-white text-xl font-bold select-none">
                +{remaining}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const getGenderText = (gender?: string) => {
    if (!gender) return '';
    if (gender === 'male' || gender === 'Nam') return 'Nam';
    if (gender === 'female' || gender === 'Nữ') return 'Nữ';
    return 'Khác';
  };

  const formatDate = (rawStr?: string) => {
    if (!rawStr) return '';
    try {
      const date = new Date(rawStr);
      return `${String(date.getDate()).padStart(2, '0')} - ${String(date.getMonth() + 1).padStart(2, '0')} - ${date.getFullYear()}`;
    } catch (_) {
      return rawStr;
    }
  };

  if (checking) {
    return (
      <div className='flex h-screen items-center justify-center bg-slate-100 dark:bg-zinc-950 transition-colors duration-200'>
        <div className='animate-spin rounded-full h-12 w-12 border-4 border-blue border-t-transparent'></div>
      </div>
    );
  }

  const currentUserId = currentUser?._id || currentUser?.id;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-zinc-950 pb-12 transition-colors duration-200">
      <Navbar />
      <div className="pt-16">
        {/* Header Container without cover photo */}
        <div className="bg-white dark:bg-zinc-900 border-b border-grey/10 dark:border-zinc-800 shadow-sm pt-6 pb-6 transition-colors duration-200">
        <div className="max-w-5xl mx-auto px-4">
          {/* Back button if viewing another user */}
          {!isSelf && (
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1.5 text-grey dark:text-zinc-450 hover:text-grey-hover dark:hover:text-zinc-200 transition border-0 bg-transparent cursor-pointer font-bold text-sm mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại</span>
            </button>
          )}

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            {/* Avatar & Username details */}
            <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border border-grey/25 dark:border-zinc-800 bg-grey/5 dark:bg-zinc-800 flex-shrink-0 flex items-center justify-center relative shadow-sm">
                {profileUser?.avatar ? (
                  <img
                    src={profileUser.avatar}
                    alt={profileUser.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-grey dark:text-zinc-400" />
                )}
              </div>

              <div className="text-left">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-zinc-100 flex items-center gap-2 justify-center sm:justify-start">
                  {profileUser?.username || 'Hồ sơ người dùng'}
                </h1>
                <p className="text-sm text-grey dark:text-zinc-400 font-medium mt-1">
                  {profileUser?.email}
                </p>
              </div>
            </div>

            {/* Profile Action Buttons */}
            <div className="flex items-center justify-center gap-2.5">
              {isSelf ? (
                <button
                  onClick={() => router.push('/setting/account/change')}
                  className="flex items-center gap-2 bg-blue hover:bg-blue-hover text-white px-5 py-2.5 rounded-xl font-bold transition shadow-md shadow-blue/20 cursor-pointer border-0 text-sm active:scale-[0.98]"
                >
                  <Settings className="w-4 h-4" />
                  <span>Chỉnh sửa thông tin</span>
                </button>
              ) : (
                <>
                  {/* Messages Button */}
                  <button
                    onClick={() => router.push(`/home/message?userId=${targetId}`)}
                    className="flex items-center gap-2 bg-grey hover:bg-grey-hover dark:bg-zinc-850 dark:hover:bg-zinc-800 text-white dark:text-zinc-200 px-4 py-2.5 rounded-xl font-bold transition cursor-pointer border-0 text-sm active:scale-[0.98]"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Nhắn tin</span>
                  </button>

                  {/* Friendship actions switch */}
                  {friendshipStatus === 'none' && (
                    <button
                      onClick={handleSendRequest}
                      disabled={isActionLoading}
                      className="flex items-center gap-2 bg-blue hover:bg-blue-hover text-white px-4 py-2.5 rounded-xl font-bold transition cursor-pointer border-0 text-sm active:scale-[0.98] disabled:opacity-50"
                    >
                      {isActionLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <UserPlus className="w-4 h-4" />
                      )}
                      <span>Thêm bạn bè</span>
                    </button>
                  )}

                  {friendshipStatus === 'requested' && (
                    <button
                      onClick={handleCancelRequest}
                      disabled={isActionLoading}
                      className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2.5 rounded-xl font-bold transition cursor-pointer border-0 text-sm active:scale-[0.98] disabled:opacity-50"
                    >
                      {isActionLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <UserMinus className="w-4 h-4" />
                      )}
                      <span>Hủy yêu cầu</span>
                    </button>
                  )}

                  {friendshipStatus === 'received' && (
                    <div className="relative">
                      <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        disabled={isActionLoading}
                        className="flex items-center gap-2 bg-green hover:bg-green-hover text-white px-4 py-2.5 rounded-xl font-bold transition cursor-pointer border-0 text-sm active:scale-[0.98] disabled:opacity-50"
                      >
                        <UserCheck className="w-4 h-4" />
                        <span>Phản hồi</span>
                      </button>

                      {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-zinc-800 rounded-xl shadow-lg border border-grey/15 dark:border-zinc-700 py-1 z-50 animate-in fade-in duration-100">
                          <button
                            onClick={() => {
                              setIsDropdownOpen(false);
                              handleAcceptRequest();
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-green hover:bg-green/5 dark:hover:bg-green-500/10 hover:font-bold border-0 bg-transparent cursor-pointer"
                          >
                            Đồng ý
                          </button>
                          <button
                            onClick={() => {
                              setIsDropdownOpen(false);
                              handleRejectRequest();
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-red hover:bg-red/5 dark:hover:bg-red-500/10 hover:font-bold border-0 bg-transparent cursor-pointer"
                          >
                            Từ chối
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {friendshipStatus === 'friend' && (
                    <button
                      onClick={handleUnfriend}
                      disabled={isActionLoading}
                      className="flex items-center gap-2 bg-grey/15 dark:bg-zinc-850 hover:bg-red/10 hover:text-red dark:hover:text-red-400 text-grey-hover dark:text-zinc-200 px-4 py-2.5 rounded-xl font-bold transition cursor-pointer border-0 text-sm active:scale-[0.98] disabled:opacity-50"
                    >
                      {isActionLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <UserCheck className="w-4 h-4" />
                      )}
                      <span>Bạn bè</span>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Bio info */}
          <div className="border-t border-grey/10 dark:border-zinc-800 pt-4 mt-6">
            <p className="text-sm text-gray-600 dark:text-zinc-400 max-w-2xl text-left leading-relaxed">
              {profileUser?.bio || 'Xin chào! Chào mừng đến với trang cá nhân của tôi. Hãy kết nối và chia sẻ những khoảnh khắc tuyệt vời cùng tôi nhé! ✨'}
            </p>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-4 gap-2 bg-grey/5 dark:bg-zinc-850/50 rounded-2xl p-4 mt-6 text-center divide-x divide-grey/10 dark:divide-zinc-800 max-w-2xl">
            <div>
              <span className="block text-base sm:text-lg font-bold text-grey-hover dark:text-zinc-100">
                {posts.length}
              </span>
              <span className="text-xs text-grey dark:text-zinc-400 font-medium">Bài viết</span>
            </div>
            <div>
              <span className="block text-base sm:text-lg font-bold text-grey-hover dark:text-zinc-100">
                {profileUser?.friendsCount || 0}
              </span>
              <span className="text-xs text-grey dark:text-zinc-400 font-medium">Bạn bè</span>
            </div>
            <div>
              <span className="block text-base sm:text-lg font-bold text-grey-hover dark:text-zinc-100">
                {profileUser?.followersCount || 0}
              </span>
              <span className="text-xs text-grey dark:text-zinc-400 font-medium">Người theo dõi</span>
            </div>
            <div>
              <span className="block text-base sm:text-lg font-bold text-grey-hover dark:text-zinc-100">
                {profileUser?.followingCount || 0}
              </span>
              <span className="text-xs text-grey dark:text-zinc-400 font-medium">Đang theo dõi</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="max-w-5xl mx-auto px-4 mt-6 grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left Column: Personal Information */}
        <div className="md:col-span-5 space-y-6">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-grey/20 dark:border-zinc-800 p-5 shadow-sm transition-colors duration-200">
            <h3 className="font-bold text-grey-hover dark:text-zinc-200 text-base mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue" />
              <span>Thông tin cá nhân</span>
            </h3>

            <div className="space-y-4">
              {/* Birthday */}
              {profileUser?.birthday && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue/10 dark:bg-blue-500/20 flex items-center justify-center text-blue flex-shrink-0">
                    <Cake className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <span className="block text-xs text-grey dark:text-zinc-405">Ngày sinh</span>
                    <span className="text-sm font-semibold text-grey-hover dark:text-zinc-200">
                      {formatDate(profileUser.birthday)}
                    </span>
                  </div>
                </div>
              )}

              {/* Gender */}
              {profileUser?.gender && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-pink/10 dark:bg-pink-500/20 flex items-center justify-center text-pink flex-shrink-0">
                    <User className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <span className="block text-xs text-grey dark:text-zinc-405">Giới tính</span>
                    <span className="text-sm font-semibold text-grey-hover dark:text-zinc-200">
                      {getGenderText(profileUser.gender)}
                    </span>
                  </div>
                </div>
              )}

              {/* Email */}
              {profileUser?.email && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-green/10 dark:bg-green-500/20 flex items-center justify-center text-green flex-shrink-0">
                    <Mail className="w-4.5 h-4.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-xs text-grey dark:text-zinc-405">Email</span>
                    <span className="text-sm font-semibold text-grey-hover dark:text-zinc-200 block truncate">
                      {profileUser.email}
                    </span>
                  </div>
                </div>
              )}

              {/* Address */}
              {profileUser?.address && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-red/10 dark:bg-red-500/20 flex items-center justify-center text-red flex-shrink-0">
                    <MapPin className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <span className="block text-xs text-grey dark:text-zinc-405">Địa chỉ</span>
                    <span className="text-sm font-semibold text-grey-hover dark:text-zinc-200">
                      {profileUser.address}
                    </span>
                  </div>
                </div>
              )}

              {/* Phone */}
              {(profileUser?.phone || profileUser?.phone_number) && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-yellow-500/10 dark:bg-yellow-500/20 flex items-center justify-center text-yellow-600 dark:text-yellow-550 flex-shrink-0">
                    <Phone className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <span className="block text-xs text-grey dark:text-zinc-405">Số điện thoại</span>
                    <span className="text-sm font-semibold text-grey-hover dark:text-zinc-200">
                      {profileUser.phone || profileUser.phone_number}
                    </span>
                  </div>
                </div>
              )}

              {/* Job */}
              {(profileUser?.job || profileUser?.occupation) && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo/10 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                    <Briefcase className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <span className="block text-xs text-grey dark:text-zinc-405">Công việc</span>
                    <span className="text-sm font-semibold text-grey-hover dark:text-zinc-200">
                      {profileUser.job || profileUser.occupation}
                    </span>
                  </div>
                </div>
              )}

              {/* Nationality */}
              {profileUser?.nationality && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 dark:bg-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400 flex-shrink-0">
                    <Flag className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <span className="block text-xs text-grey dark:text-zinc-405">Quốc tịch</span>
                    <span className="text-sm font-semibold text-grey-hover dark:text-zinc-200">
                      {profileUser.nationality}
                    </span>
                  </div>
                </div>
              )}

              {/* Empty state details */}
              {!profileUser?.birthday && !profileUser?.gender && !profileUser?.address && !profileUser?.phone && !profileUser?.job && (
                <div className="text-center py-4 text-xs text-grey dark:text-zinc-500">
                  Chưa có thêm thông tin cá nhân.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: User's Posts Feed */}
        <div className="md:col-span-7 space-y-4">
          
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-grey/20 dark:border-zinc-800 p-4 shadow-sm flex items-center justify-between transition-colors duration-200">
            <h3 className="font-extrabold text-grey-hover dark:text-zinc-200 text-base">
              Bài viết của {isSelf ? 'bạn' : profileUser?.username}
            </h3>
            <button
              onClick={fetchUserPosts}
              className="p-2 rounded-xl hover:bg-grey/10 dark:hover:bg-zinc-800 text-grey dark:text-zinc-400 transition cursor-pointer border-0 bg-transparent"
              title="Làm mới bài viết"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {isLoadingFeed ? (
            <div className="space-y-4">
              {[1, 2].map((s) => (
                <div key={s} className="bg-white dark:bg-zinc-900 rounded-2xl border border-grey/20 dark:border-zinc-800 p-5 animate-pulse">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-grey/20 dark:bg-zinc-800"></div>
                    <div className="space-y-2">
                      <div className="h-4 w-28 bg-grey/20 dark:bg-zinc-800 rounded"></div>
                      <div className="h-3 w-16 bg-grey/20 dark:bg-zinc-800 rounded"></div>
                    </div>
                  </div>
                  <div className="h-4 w-full bg-grey/20 dark:bg-zinc-800 rounded mb-3"></div>
                  <div className="h-3 w-3/4 bg-grey/20 dark:bg-zinc-800 rounded mb-4"></div>
                  <div className="h-52 w-full bg-grey/15 dark:bg-zinc-850 rounded-xl"></div>
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-grey/20 dark:border-zinc-800 p-12 text-center shadow-sm transition-colors duration-200">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue/10 dark:bg-blue-500/20 rounded-full flex items-center justify-center text-blue">
                <RefreshCw className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-grey-hover dark:text-zinc-200 mb-1">Chưa có bài viết nào</h3>
              <p className="text-sm text-grey dark:text-zinc-400 max-w-sm mx-auto">
                {isSelf ? 'Hãy đăng chia sẻ đầu tiên của bạn trên bảng tin để gắn kết với bạn bè nhé!' : 'Người dùng này chưa đăng tải bài viết nào.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => {
                const author = post.author || {};
                const authorName = author.username || 'Người dùng';
                const authorAvatar = author.avatar || '';
                const timeAgoStr = formatTimeAgo(post.createdAt);
                
                const hasLiked = post.likes?.includes(currentUserId) || false;
                const likesCount = post.likes?.length || 0;
                
                const isGroupPost = post.postType === 'group';
                const group = post.group || {};
                const groupName = group.name || '';

                const commentsCount = getCommentsCount(post);
                const comments = post.comments || [];
                const isCommentsOpen = commentSectionOpen[post._id] || false;

                // Handle post content expansion
                const content = post.content || '';
                const contentLines = content.split('\n');
                const isLongContent = content.length > 250 || contentLines.length > 5;
                const isExpanded = expandedPosts[post._id] || false;
                
                const displayContent = isExpanded 
                  ? content 
                  : (contentLines.length > 5 
                      ? contentLines.slice(0, 5).join('\n') + '...' 
                      : content.substring(0, 250) + (isLongContent ? '...' : ''));

                return (
                  <div key={post._id} className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-grey/20 dark:border-zinc-800 p-4 relative transition-colors duration-200">
                    
                    {/* Post Header */}
                    <div className="flex items-center justify-between mb-3.5">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-full overflow-hidden border border-grey/10 dark:border-zinc-800 bg-grey/5 dark:bg-zinc-800 flex-shrink-0 flex items-center justify-center"
                        >
                          {authorAvatar ? (
                            <img src={authorAvatar} alt={authorName} className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-5 h-5 text-grey dark:text-zinc-400" />
                          )}
                        </div>
                        <div className="flex flex-col text-left">
                          <div className="flex items-center flex-wrap gap-1">
                            <h3 className="font-bold text-grey-hover dark:text-zinc-200 text-sm sm:text-base">
                              {authorName}
                            </h3>
                            {isGroupPost && groupName && (
                              <div className="flex items-center gap-1 text-xs text-grey dark:text-zinc-400 font-medium">
                                <span className="text-grey/60">▸</span>
                                <span className="text-blue font-semibold hover:underline cursor-pointer">{groupName}</span>
                              </div>
                            )}
                          </div>
                          <span className="text-xs text-grey dark:text-zinc-400 font-medium">{timeAgoStr}</span>
                        </div>
                      </div>
                      <button className="w-8 h-8 rounded-full hover:bg-grey/10 dark:hover:bg-zinc-800 flex items-center justify-center text-grey dark:text-zinc-400 hover:text-grey-hover dark:hover:text-zinc-200 transition border-0 bg-transparent cursor-pointer">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Post Content */}
                    <div className="text-slate-800 dark:text-zinc-200 text-sm sm:text-[15px] leading-relaxed mb-3 whitespace-pre-wrap text-justify px-1">
                      {displayContent}
                      {isLongContent && (
                        <button
                          onClick={() => setExpandedPosts(prev => ({ ...prev, [post._id]: !isExpanded }))}
                          className="text-blue hover:text-blue-hover font-bold text-xs sm:text-sm ml-1.5 focus:outline-none bg-transparent border-0 cursor-pointer inline-block"
                        >
                          {isExpanded ? 'Ẩn bớt' : 'Xem thêm'}
                        </button>
                      )}
                    </div>

                    {/* Images attachment */}
                    {renderPostImages(post.images || [])}

                    {/* Stats summary */}
                    <div className="flex items-center justify-between text-xs sm:text-sm text-grey dark:text-zinc-400 py-3 mt-3 border-t border-b border-grey/10 dark:border-zinc-800 select-none">
                      <div className="flex items-center gap-1.5 font-medium">
                        <div className="w-5 h-5 rounded-full bg-blue/10 dark:bg-blue-500/20 flex items-center justify-center text-blue">
                          <ThumbsUp className="w-3.5 h-3.5 fill-blue" />
                        </div>
                        <span>{likesCount} lượt thích</span>
                      </div>
                      <div className="flex items-center gap-3 font-medium">
                        <span>{commentsCount} bình luận</span>
                        <span>0 chia sẻ</span>
                      </div>
                    </div>

                    {/* Actions bar */}
                    <div className="grid grid-cols-3 gap-1 pt-1.5 select-none">
                      <button 
                        onClick={() => handleLikePost(post._id)}
                        className={`flex items-center justify-center gap-2 py-2 rounded-xl hover:bg-grey/5 dark:hover:bg-zinc-800 active:scale-[0.98] transition font-bold text-sm border-0 cursor-pointer bg-transparent ${hasLiked ? 'text-blue' : 'text-grey-hover dark:text-zinc-300'}`}
                      >
                        <ThumbsUp className={`w-5 h-5 ${hasLiked ? 'fill-blue text-blue' : ''}`} />
                        <span>Thích</span>
                      </button>
                      <button 
                        onClick={() => setCommentSectionOpen(prev => ({ ...prev, [post._id]: !isCommentsOpen }))}
                        className={`flex items-center justify-center gap-2 py-2 rounded-xl hover:bg-grey/5 dark:hover:bg-zinc-800 active:scale-[0.98] transition font-bold text-sm border-0 cursor-pointer bg-transparent ${isCommentsOpen ? 'text-blue bg-blue/5 dark:bg-blue-500/10' : 'text-grey-hover dark:text-zinc-300'}`}
                      >
                        <MessageCircle className="w-5 h-5" />
                        <span>Bình luận</span>
                      </button>
                      <button className="flex items-center justify-center gap-2 py-2 rounded-xl hover:bg-grey/5 dark:hover:bg-zinc-800 active:scale-[0.98] transition text-grey-hover dark:text-zinc-300 font-bold text-sm border-0 cursor-pointer bg-transparent">
                        <Share2 className="w-5 h-5" />
                        <span>Chia sẻ</span>
                      </button>
                    </div>

                    {/* Comments section */}
                    {isCommentsOpen && (
                      <div className="mt-4 border-t border-grey/10 dark:border-zinc-800 pt-4 space-y-4 animate-in fade-in duration-200">
                        {comments.length === 0 ? (
                          <div className="text-center py-5 text-grey dark:text-zinc-400 text-xs sm:text-sm select-none">
                            Chưa có bình luận nào. Hãy là người đầu tiên!
                          </div>
                        ) : (
                          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                            {comments.map((comment: any) => {
                              const cAuthor = comment.author || {};
                              const cAuthorName = cAuthor.username || 'Người dùng';
                              const cAuthorAvatar = cAuthor.avatar || '';
                              
                              const cHasLiked = comment.likes?.includes(currentUserId) || comment.hasLiked || false;
                              const cLikesCount = comment.likes?.length || comment.likesCount || 0;
                              const cTimeAgo = formatTimeAgo(comment.createdAt);

                              const replies = comment.replies || [];
                              const isRepliesExpanded = expandedComments[comment._id] || false;

                              return (
                                <div key={comment._id} className="space-y-2">
                                  <div className="flex gap-2.5 items-start text-left">
                                    <div 
                                      className="w-8 h-8 rounded-full overflow-hidden border border-grey/10 dark:border-zinc-800 bg-grey/5 dark:bg-zinc-800 flex-shrink-0 flex items-center justify-center"
                                    >
                                      {cAuthorAvatar ? (
                                        <img src={cAuthorAvatar} alt={cAuthorName} className="w-full h-full object-cover" />
                                      ) : (
                                        <User className="w-4.5 h-4.5 text-grey dark:text-zinc-400" />
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="bg-grey/10 dark:bg-zinc-850 rounded-2xl px-3.5 py-2 inline-block max-w-full">
                                        <h5 className="text-xs font-bold text-grey-hover dark:text-zinc-200 truncate mb-0.5">
                                          {cAuthorName}
                                        </h5>
                                        <p className="text-sm text-gray-800 dark:text-zinc-255 whitespace-pre-wrap break-words text-justify leading-normal">
                                          {comment.content}
                                        </p>
                                      </div>
                                      
                                      <div className="flex items-center gap-3.5 text-[11px] sm:text-xs text-grey dark:text-zinc-400 mt-1 pl-2 select-none font-semibold">
                                        <span>{cTimeAgo}</span>
                                        <button 
                                          onClick={() => {
                                            setReplyingTo({
                                              postId: post._id,
                                              commentId: comment._id,
                                              username: cAuthorName
                                            });
                                            const el = document.getElementById(`comment-input-${post._id}`);
                                            el?.focus();
                                          }}
                                          className="hover:text-blue dark:hover:text-blue-400 hover:underline transition bg-transparent border-0 cursor-pointer font-bold"
                                        >
                                          Trả lời
                                        </button>
                                        <button 
                                          onClick={() => handleLikeComment(post._id, comment._id)}
                                          className={`hover:text-blue dark:hover:text-blue-400 hover:underline flex items-center gap-1 transition bg-transparent border-0 cursor-pointer font-bold ${cHasLiked ? 'text-blue' : 'text-grey dark:text-zinc-400'}`}
                                        >
                                          <ThumbsUp className={`w-3 h-3 ${cHasLiked ? 'fill-blue text-blue' : ''}`} />
                                          <span>{cLikesCount > 0 ? cLikesCount : ''} Thích</span>
                                        </button>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Replies */}
                                  {replies.length > 0 && (
                                    <div className="pl-10">
                                      {!isRepliesExpanded ? (
                                        <button 
                                          onClick={() => setExpandedComments(prev => ({ ...prev, [comment._id]: true }))}
                                          className="flex items-center gap-1 text-xs text-grey dark:text-zinc-400 hover:text-blue dark:hover:text-blue-400 font-bold py-1 bg-transparent border-0 cursor-pointer"
                                        >
                                          <ChevronRight className="w-3.5 h-3.5 rotate-90" />
                                          <span>Xem tất cả {replies.length} phản hồi</span>
                                        </button>
                                      ) : (
                                        <div className="space-y-3 mt-2 border-l-2 border-grey/15 dark:border-zinc-800 pl-4">
                                          {replies.map((reply: any) => {
                                            const rAuthor = reply.author || {};
                                            const rAuthorName = rAuthor.username || 'Người dùng';
                                            const rAuthorAvatar = rAuthor.avatar || '';
                                            
                                            const rHasLiked = reply.likes?.includes(currentUserId) || reply.hasLiked || false;
                                            const rLikesCount = reply.likes?.length || reply.likesCount || 0;
                                            const rTimeAgo = formatTimeAgo(reply.createdAt);

                                            return (
                                              <div key={reply._id} className="flex gap-2 items-start text-left">
                                                <div 
                                                  className="w-7 h-7 rounded-full overflow-hidden border border-grey/10 dark:border-zinc-800 bg-grey/5 dark:bg-zinc-850 flex-shrink-0 flex items-center justify-center"
                                                >
                                                  {rAuthorAvatar ? (
                                                    <img src={rAuthorAvatar} alt={rAuthorName} className="w-full h-full object-cover" />
                                                  ) : (
                                                    <User className="w-4 h-4 text-grey dark:text-zinc-400" />
                                                  )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                  <div className="bg-grey/10 dark:bg-zinc-850 rounded-2xl px-3 py-1.5 inline-block max-w-full">
                                                    <h5 className="text-[11px] font-bold text-grey-hover dark:text-zinc-200 truncate mb-0.5">
                                                      {rAuthorName}
                                                    </h5>
                                                    <p className="text-sm text-gray-800 dark:text-zinc-255 whitespace-pre-wrap break-words text-justify leading-normal">
                                                      {reply.content}
                                                    </p>
                                                  </div>
                                                  
                                                  <div className="flex items-center gap-3.5 text-[10px] sm:text-[11px] text-grey dark:text-zinc-400 mt-0.5 pl-2 select-none font-semibold">
                                                    <span>{rTimeAgo}</span>
                                                    <button 
                                                      onClick={() => {
                                                        setReplyingTo({
                                                          postId: post._id,
                                                          commentId: comment._id,
                                                          username: rAuthorName
                                                        });
                                                        const el = document.getElementById(`comment-input-${post._id}`);
                                                        el?.focus();
                                                      }}
                                                      className="hover:text-blue dark:hover:text-blue-400 hover:underline transition bg-transparent border-0 cursor-pointer font-bold"
                                                    >
                                                      Trả lời
                                                    </button>
                                                    <button 
                                                      onClick={() => handleLikeReply(post._id, comment._id, reply._id)}
                                                      className={`hover:text-blue dark:hover:text-blue-400 hover:underline flex items-center gap-1 transition bg-transparent border-0 cursor-pointer font-bold ${rHasLiked ? 'text-blue' : 'text-grey dark:text-zinc-400'}`}
                                                    >
                                                      <ThumbsUp className={`w-2.5 h-2.5 ${rHasLiked ? 'fill-blue text-blue' : ''}`} />
                                                      <span>{rLikesCount > 0 ? rLikesCount : ''} Thích</span>
                                                    </button>
                                                  </div>
                                                </div>
                                              </div>
                                            );
                                          })}

                                          <button 
                                            onClick={() => setExpandedComments(prev => ({ ...prev, [comment._id]: false }))}
                                            className="text-xs text-blue hover:text-blue-hover font-bold py-1 bg-transparent border-0 cursor-pointer"
                                          >
                                            Ẩn phản hồi
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Comment input form */}
                        <div className="space-y-2 mt-2">
                          {replyingTo && (
                            <div className="flex items-center justify-between bg-blue/5 dark:bg-blue-500/10 px-3 py-1.5 rounded-lg text-xs text-blue font-semibold">
                              <span>Đang trả lời @{replyingTo.username}</span>
                              <button 
                                onClick={() => setReplyingTo(null)}
                                className="text-grey hover:text-red transition bg-transparent border-0 cursor-pointer"
                              >
                                Hủy
                              </button>
                            </div>
                          )}
                          <div className="flex gap-2 items-center">
                            <textarea
                              id={`comment-input-${post._id}`}
                              rows={1}
                              placeholder={replyingTo ? "Viết phản hồi..." : "Viết bình luận..."}
                              value={commentInputs[post._id] || ''}
                              onChange={(e) => setCommentInputs(prev => ({ ...prev, [post._id]: e.target.value }))}
                              onKeyDown={(e) => {
                                  if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    if (replyingTo) {
                                      handleAddReply(post._id, replyingTo.commentId);
                                    } else {
                                      handleAddComment(post._id);
                                    }
                                  }
                                }}
                              className="flex-1 px-4 py-2 bg-grey/10 dark:bg-zinc-800 rounded-xl border-0 focus:bg-grey/15 dark:focus:bg-zinc-750 transition outline-none text-sm text-zinc-900 dark:text-zinc-200 placeholder-gray-500 dark:placeholder-zinc-500 font-medium resize-none h-[38px] max-h-[120px] overflow-y-auto leading-normal py-2"
                            />
                            <button 
                              onClick={() => {
                                if (replyingTo) {
                                  handleAddReply(post._id, replyingTo.commentId);
                                } else {
                                  handleAddComment(post._id);
                                }
                              }}
                              className="p-2.5 bg-blue hover:bg-blue-hover text-white rounded-xl transition cursor-pointer border-0 flex items-center justify-center active:scale-95"
                            >
                              <ThumbsUp className="w-4 h-4 fill-white" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
  );
}
