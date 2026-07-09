'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../../services/auth.service';
import { contentService } from '../../services/content.service';
import { useAlert } from '../../components/Alert/alertcontext';
import { 
  Loader2, 
  User, 
  Settings, 
  Gamepad2, 
  LogOut, 
  ChevronRight,
  ChevronLeft,
  Search,
  Clock,
  X,
  ThumbsUp,
  MessageCircle,
  Share2,
  Image as ImageIcon,
  Globe,
  Users,
  Lock,
  MoreHorizontal,
  Send,
  RefreshCw,
  CornerDownRight
} from 'lucide-react';
import Navbar from '../../components/Navbar';

export default function HomePage() {
  const router = useRouter();
  const { showSuccess, showError } = useAlert();

  const [checking, setChecking] = useState(true);
  const [user, setUser] = useState<any>(null);

  const [posts, setPosts] = useState<any[]>([]);
  const [isLoadingFeed, setIsLoadingFeed] = useState(true);
  const [expandedPosts, setExpandedPosts] = useState<Record<string, boolean>>({});

  const [commentSectionOpen, setCommentSectionOpen] = useState<Record<string, boolean>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [replyingTo, setReplyingTo] = useState<{
    postId: string;
    commentId: string;
    username: string;
  } | null>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostPrivacy, setNewPostPrivacy] = useState('public');
  const [newPostImages, setNewPostImages] = useState<File[]>([]);
  const [newPostPreviews, setNewPostPreviews] = useState<string[]>([]);
  const [isPosting, setIsPosting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeLightboxPost, setActiveLightboxPost] = useState<any | null>(null);
  const [activeLightboxImageIdx, setActiveLightboxImageIdx] = useState<number>(0);
  const [lightboxContentExpanded, setLightboxContentExpanded] = useState(false);

  const openLightbox = (post: any, index: number) => {
    setActiveLightboxPost(post);
    setActiveLightboxImageIdx(index);
    setLightboxContentExpanded(false);
  };

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

  useEffect(() => {
    if (activeLightboxPost) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [activeLightboxPost]);

  const fetchFeed = async () => {
    setIsLoadingFeed(true);
    try {
      const data = await contentService.getFeed();
      setPosts(Array.isArray(data) ? data : (data?.data || []));
    } catch (err) {
      console.error('Error fetching feed:', err);
      showError('Không thể tải bảng tin. Vui lòng thử lại!');
    } finally {
      setIsLoadingFeed(false);
    }
  };

  useEffect(() => {
    if (!checking) {
      fetchFeed();
    }
  }, [checking]);

  const handleLikePost = async (postId: string) => {
    if (!user) return;
    const currentUserId = user._id || user.id;

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
      fetchFeed();
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
    if (!user) return;
    const currentUserId = user._id || user.id;

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
    if (!user) return;
    const currentUserId = user._id || user.id;

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setNewPostImages(prev => [...prev, ...filesArray]);

      const previewUrls = filesArray.map(file => URL.createObjectURL(file));
      setNewPostPreviews(prev => [...prev, ...previewUrls]);
    }
  };

  const removeSelectedImage = (index: number) => {
    setNewPostImages(prev => prev.filter((_, i) => i !== index));
    URL.revokeObjectURL(newPostPreviews[index]);
    setNewPostPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim() && newPostImages.length === 0) return;
    setIsPosting(true);

    try {
      const formData = new FormData();
      formData.append('content', newPostContent);
      formData.append('postType', 'personal');
      formData.append('privacy', newPostPrivacy);

      newPostImages.forEach(file => {
        formData.append('images', file);
      });

      await contentService.createPost(formData);
      showSuccess('Đăng bài viết thành công!');

      setNewPostContent('');
      setNewPostPrivacy('public');
      newPostPreviews.forEach(url => URL.revokeObjectURL(url));
      setNewPostImages([]);
      setNewPostPreviews([]);
      setIsCreateModalOpen(false);

      fetchFeed();
    } catch (err) {
      console.error('Error creating post:', err);
      showError('Không thể tạo bài viết. Vui lòng thử lại!');
    } finally {
      setIsPosting(false);
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

  const getCommentsCount = (post: any): number => {
    const comments = post.comments || [];
    let count = comments.length;
    for (const comment of comments) {
      const replies = comment.replies || [];
      count += replies.length;
    }
    return count;
  };

  const renderPostImages = (post: any) => {
    const images = post.images || [];
    if (!images || images.length === 0) return null;

    if (images.length === 1) {
      return (
        <div 
          onClick={() => openLightbox(post, 0)}
          className="mt-3 overflow-hidden rounded-xl border border-grey/20 max-h-[500px] cursor-pointer hover:opacity-95 transition"
        >
          <img
            src={images[0]}
            alt="Post image"
            className="w-full h-auto max-h-[500px] object-cover"
          />
        </div>
      );
    }

    if (images.length === 2) {
      return (
        <div className="mt-3 grid grid-cols-2 gap-2 h-72 rounded-xl overflow-hidden">
          <img
            onClick={() => openLightbox(post, 0)}
            src={images[0]}
            alt="Post attachment 1"
            className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition"
          />
          <img
            onClick={() => openLightbox(post, 1)}
            src={images[1]}
            alt="Post attachment 2"
            className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition"
          />
        </div>
      );
    }

    const remaining = images.length - 3;
    return (
      <div className="mt-3 grid grid-cols-3 gap-2 h-80 rounded-xl overflow-hidden">
        <div className="col-span-2 h-full">
          <img
            onClick={() => openLightbox(post, 0)}
            src={images[0]}
            alt="Post attachment 1"
            className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition"
          />
        </div>
        <div className="grid grid-rows-2 gap-2 h-full">
          <div className="h-full overflow-hidden">
            <img
              onClick={() => openLightbox(post, 1)}
              src={images[1]}
              alt="Post attachment 2"
              className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition"
            />
          </div>
          <div className="h-full relative overflow-hidden">
            <img
              onClick={() => openLightbox(post, 2)}
              src={images[2]}
              alt="Post attachment 3"
              className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition"
            />
            {remaining > 0 && (
              <div 
                onClick={() => openLightbox(post, 2)}
                className="absolute inset-0 bg-black/55 flex items-center justify-center text-white text-xl font-bold select-none cursor-pointer hover:bg-black/65 transition"
              >
                +{remaining}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (checking) {
    return (
      <div className='flex h-screen items-center justify-center bg-grey/5 dark:bg-zinc-950 transition-colors duration-200'>
        <div className='animate-spin rounded-full h-12 w-12 border-4 border-blue border-t-transparent'></div>
      </div>
    );
  }

  const currentUserId = user?._id || user?.id;

  return (
    <div className='min-h-screen bg-grey/5 dark:bg-zinc-950 font-sans pb-12 transition-colors duration-200'>
      <Navbar activeTab='home' onRefreshFeed={fetchFeed} />

      <main className='pt-20 pb-8 px-4'>
        <div className='max-w-2xl mx-auto'>
          <div className='bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-grey/20 dark:border-zinc-800 p-4 mb-6 transition-colors duration-200'>
            <div className='flex gap-3 items-center'>
              <div 
                onClick={() => router.push('/profile')}
                className='w-10 h-10 rounded-full overflow-hidden border border-grey/10 dark:border-zinc-800 bg-grey/5 dark:bg-zinc-800 flex-shrink-0 flex items-center justify-center cursor-pointer'
              >
                <img
                  src={user?.avatar || '/assets/avatar/avatar.jpg'}
                  alt='Avatar'
                  className='w-full h-full object-cover'
                />
              </div>
              <div className='flex-1 flex gap-2'>
                <input
                  type='text'
                  onClick={() => setIsCreateModalOpen(true)}
                  readOnly
                  placeholder={`${user?.username || 'Bạn'} ơi, bạn đang nghĩ gì thế?`}
                  className='flex-1 px-4 py-2.5 bg-grey/10 dark:bg-zinc-850 hover:bg-grey/15 dark:hover:bg-zinc-800/80 rounded-xl border-0 transition outline-none text-sm text-grey-hover dark:text-zinc-200 placeholder-gray-500 dark:placeholder-zinc-500 cursor-pointer font-medium'
                />
                <button 
                  onClick={() => setIsCreateModalOpen(true)}
                  className='px-5 py-2.5 bg-blue hover:bg-blue-hover active:scale-[0.98] text-white font-bold rounded-xl transition duration-150 shadow-md shadow-blue/20 text-sm flex-shrink-0 cursor-pointer border-0'
                >
                  Đăng
                </button>
              </div>
            </div>
          </div>

          {isLoadingFeed && posts.length === 0 ? (
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
            <div className='bg-white dark:bg-zinc-900 rounded-2xl border border-grey/20 dark:border-zinc-800 p-12 text-center shadow-sm'>
              <div className="w-16 h-16 mx-auto mb-4 bg-blue/10 rounded-full flex items-center justify-center text-blue">
                <RefreshCw className="w-8 h-8" />
              </div>
              <h3 className='text-lg font-bold text-grey-hover dark:text-zinc-150 mb-1'>Chưa có bài viết nào</h3>
              <p className='text-sm text-grey dark:text-zinc-400 max-w-sm mx-auto mb-6'>Bảng tin hiện đang trống. Hãy đăng chia sẻ đầu tiên của bạn để kết nối với mọi người!</p>
              <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="px-5 py-2.5 bg-blue hover:bg-blue-hover text-white font-bold rounded-xl transition shadow-md shadow-blue/15 border-0 cursor-pointer text-sm"
              >
                Đăng bài viết mới
              </button>
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
                  <div key={post._id} className='bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-grey/20 dark:border-zinc-800 p-4 relative transition-colors duration-200'>
                    
                    <div className='flex items-center justify-between mb-3.5'>
                      <div className='flex items-center gap-3'>
                        <div 
                          onClick={() => router.push(`/user/${author._id || author.id}`)}
                          className='w-10 h-10 rounded-full overflow-hidden border border-grey/10 dark:border-zinc-800 bg-grey/5 dark:bg-zinc-800 flex-shrink-0 flex items-center justify-center cursor-pointer'
                        >
                          {authorAvatar ? (
                            <img src={authorAvatar} alt={authorName} className='w-full h-full object-cover' />
                          ) : (
                            <User className='w-5 h-5 text-grey dark:text-zinc-400' />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <div className='flex items-center flex-wrap gap-1'>
                            <h3 
                              onClick={() => router.push(`/user/${author._id || author.id}`)}
                              className='font-bold text-grey-hover dark:text-zinc-200 hover:underline cursor-pointer text-sm sm:text-base'
                            >
                              {authorName}
                            </h3>
                            {isGroupPost && groupName && (
                              <div className='flex items-center gap-1 text-xs text-grey dark:text-zinc-400 font-medium'>
                                <span className="text-grey/60">▸</span>
                                <span className='text-blue font-semibold hover:underline cursor-pointer'>{groupName}</span>
                              </div>
                            )}
                          </div>
                          <span className='text-xs text-grey dark:text-zinc-400 font-medium'>{timeAgoStr}</span>
                        </div>
                      </div>
                      <button className='w-8 h-8 rounded-full hover:bg-grey/10 dark:hover:bg-zinc-800 flex items-center justify-center text-grey hover:text-grey-hover dark:text-zinc-400 dark:hover:text-zinc-200 transition border-0 bg-transparent cursor-pointer'>
                        <MoreHorizontal className='w-5 h-5' />
                      </button>
                    </div>

                    <div className='text-slate-800 dark:text-zinc-200 text-sm sm:text-[15px] leading-relaxed mb-3 whitespace-pre-wrap text-justify px-1'>
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

                    {renderPostImages(post)}

                    <div className='flex items-center justify-between text-xs sm:text-sm text-grey dark:text-zinc-400 py-3 mt-3 border-t border-b border-grey/10 dark:border-zinc-800/60 select-none'>
                      <div className='flex items-center gap-1.5 font-medium'>
                        <div className="w-5 h-5 rounded-full bg-blue/10 flex items-center justify-center text-blue">
                          <ThumbsUp className="w-3.5 h-3.5 fill-blue" />
                        </div>
                        <span>{likesCount} lượt thích</span>
                      </div>
                      <div className='flex items-center gap-3 font-medium'>
                        <span>{commentsCount} bình luận</span>
                        <span>0 chia sẻ</span>
                      </div>
                    </div>

                    <div className='grid grid-cols-3 gap-1 pt-1.5 select-none'>
                      <button 
                        onClick={() => handleLikePost(post._id)}
                        className={`flex items-center justify-center gap-2 py-2 rounded-xl hover:bg-grey/5 dark:hover:bg-zinc-800/50 active:scale-[0.98] transition font-bold text-sm border-0 cursor-pointer bg-transparent ${hasLiked ? 'text-blue' : 'text-grey-hover dark:text-zinc-300'}`}
                      >
                        <ThumbsUp className={`w-5 h-5 ${hasLiked ? 'fill-blue text-blue' : ''}`} />
                        <span>Thích</span>
                      </button>
                      <button 
                        onClick={() => setCommentSectionOpen(prev => ({ ...prev, [post._id]: !isCommentsOpen }))}
                        className={`flex items-center justify-center gap-2 py-2 rounded-xl hover:bg-grey/5 dark:hover:bg-zinc-800/50 active:scale-[0.98] transition font-bold text-sm border-0 cursor-pointer bg-transparent ${isCommentsOpen ? 'text-blue bg-blue/5 dark:bg-blue-500/10' : 'text-grey-hover dark:text-zinc-300'}`}
                      >
                        <MessageCircle className="w-5 h-5" />
                        <span>Bình luận</span>
                      </button>
                      <button className='flex items-center justify-center gap-2 py-2 rounded-xl hover:bg-grey/5 dark:hover:bg-zinc-800/50 active:scale-[0.98] transition text-grey-hover dark:text-zinc-300 font-bold text-sm border-0 cursor-pointer bg-transparent'>
                        <Share2 className="w-5 h-5" />
                        <span>Chia sẻ</span>
                      </button>
                    </div>

                    {isCommentsOpen && (
                      <div className="mt-4 border-t border-grey/10 dark:border-zinc-800 pt-4 space-y-4 animate-in fade-in slide-in-from-top-3 duration-200">

                        {comments.length === 0 ? (
                          <div className="text-center py-5 text-grey dark:text-zinc-500 text-xs sm:text-sm select-none">
                            Chưa có bình luận nào. Hãy là người đầu tiên!
                          </div>
                        ) : (
                          <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1">
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
                                      onClick={() => router.push(`/user/${cAuthor._id || cAuthor.id}`)}
                                      className="w-8 h-8 rounded-full overflow-hidden border border-grey/10 dark:border-zinc-800 bg-grey/5 dark:bg-zinc-800 flex-shrink-0 flex items-center justify-center cursor-pointer"
                                    >
                                      {cAuthorAvatar ? (
                                        <img src={cAuthorAvatar} alt={cAuthorName} className="w-full h-full object-cover" />
                                      ) : (
                                        <User className="w-4.5 h-4.5 text-grey dark:text-zinc-400" />
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="bg-grey/10 dark:bg-zinc-800/80 rounded-2xl px-3.5 py-2 inline-block max-w-full">
                                        <h5 
                                          onClick={() => router.push(`/user/${cAuthor._id || cAuthor.id}`)}
                                          className="text-xs font-bold text-grey-hover dark:text-zinc-200 hover:underline cursor-pointer truncate mb-0.5"
                                        >
                                          {cAuthorName}
                                        </h5>
                                        <p className="text-sm text-gray-800 dark:text-zinc-200 whitespace-pre-wrap break-words text-justify leading-normal">
                                          {comment.content}
                                        </p>
                                      </div>
                                      
                                      <div className="flex items-center gap-3.5 text-[11px] sm:text-xs text-grey dark:text-zinc-450 mt-1 pl-2 select-none font-semibold">
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
                                          className="hover:text-blue hover:underline transition bg-transparent border-0 cursor-pointer font-bold"
                                        >
                                          Trả lời
                                        </button>
                                        <button 
                                          onClick={() => handleLikeComment(post._id, comment._id)}
                                          className={`hover:text-blue hover:underline flex items-center gap-1 transition bg-transparent border-0 cursor-pointer font-bold ${cHasLiked ? 'text-blue' : ''}`}
                                        >
                                          <ThumbsUp className={`w-3 h-3 ${cHasLiked ? 'fill-blue text-blue' : ''}`} />
                                          <span>{cLikesCount > 0 ? cLikesCount : ''} Thích</span>
                                        </button>
                                      </div>
                                    </div>
                                  </div>


                                  {replies.length > 0 && (
                                    <div className="pl-10">

                                      {!isRepliesExpanded ? (
                                        <button 
                                          onClick={() => setExpandedComments(prev => ({ ...prev, [comment._id]: true }))}
                                          className="flex items-center gap-1 text-xs text-grey hover:text-blue font-bold py-1 bg-transparent border-0 cursor-pointer"
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
                                                  onClick={() => router.push(`/user/${rAuthor._id || rAuthor.id}`)}
                                                  className="w-7 h-7 rounded-full overflow-hidden border border-grey/10 dark:border-zinc-800 bg-grey/5 dark:bg-zinc-800 flex-shrink-0 flex items-center justify-center cursor-pointer"
                                                >
                                                  {rAuthorAvatar ? (
                                                    <img src={rAuthorAvatar} alt={rAuthorName} className="w-full h-full object-cover" />
                                                  ) : (
                                                    <User className="w-4 h-4 text-grey dark:text-zinc-400" />
                                                  )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                  <div className="bg-grey/10 dark:bg-zinc-800/80 rounded-2xl px-3 py-1.5 inline-block max-w-full">
                                                    <h5 
                                                      onClick={() => router.push(`/user/${rAuthor._id || rAuthor.id}`)}
                                                      className="text-xs font-bold text-grey-hover dark:text-zinc-200 hover:underline cursor-pointer truncate mb-0.5"
                                                    >
                                                      {rAuthorName}
                                                    </h5>
                                                    <p className="text-sm text-gray-800 dark:text-zinc-200 whitespace-pre-wrap break-words text-justify leading-normal">
                                                      {reply.content}
                                                    </p>
                                                  </div>

                                                  <div className="flex items-center gap-3 text-[10px] sm:text-xs text-grey dark:text-zinc-400 mt-0.5 pl-2 select-none font-semibold">
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
                                                      className="hover:text-blue hover:underline transition bg-transparent border-0 cursor-pointer font-bold"
                                                    >
                                                      Trả lời
                                                    </button>
                                                    <button 
                                                      onClick={() => handleLikeReply(post._id, comment._id, reply._id)}
                                                      className={`hover:text-blue hover:underline flex items-center gap-1 transition bg-transparent border-0 cursor-pointer font-bold ${rHasLiked ? 'text-blue' : ''}`}
                                                    >
                                                      <ThumbsUp className={`w-3 h-3 ${rHasLiked ? 'fill-blue text-blue' : ''}`} />
                                                      <span>{rLikesCount > 0 ? rLikesCount : ''} Thích</span>
                                                    </button>
                                                  </div>
                                                </div>
                                              </div>
                                            );
                                          })}

                                          <button 
                                            onClick={() => setExpandedComments(prev => ({ ...prev, [comment._id]: false }))}
                                            className="flex items-center gap-1 text-xs text-grey hover:text-blue font-bold py-1 mt-1 bg-transparent border-0 cursor-pointer"
                                          >
                                            <ChevronRight className="w-3.5 h-3.5 -rotate-90" />
                                            <span>Ẩn phản hồi</span>
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

                        {replyingTo && replyingTo.postId === post._id && (
                          <div className="flex items-center justify-between px-3 py-2 bg-grey/10 dark:bg-zinc-800 rounded-xl text-xs sm:text-sm text-grey dark:text-zinc-300 font-medium animate-in slide-in-from-bottom-2 duration-150">
                            <div className="flex items-center gap-1.5">
                              <span className="text-blue">Đang phản hồi</span>
                              <span className="font-bold text-grey-hover dark:text-zinc-200">@{replyingTo.username}</span>
                            </div>
                            <button 
                              onClick={() => setReplyingTo(null)}
                              className="w-5 h-5 rounded-full hover:bg-grey/25 dark:hover:bg-zinc-700 flex items-center justify-center text-grey dark:text-zinc-400 transition border-0 bg-transparent cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}

                        <div className="flex gap-2 items-center pt-2">
                          <div className="w-8 h-8 rounded-full overflow-hidden border border-grey/10 dark:border-zinc-800 bg-grey/5 dark:bg-zinc-800 flex-shrink-0 flex items-center justify-center select-none">
                            <img src={user?.avatar || '/assets/avatar/avatar.jpg'} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 flex gap-2 relative">
                            <textarea
                              id={`comment-input-${post._id}`}
                              rows={1}
                              placeholder={replyingTo && replyingTo.postId === post._id ? `Phản hồi @${replyingTo.username}...` : "Viết bình luận công khai..."}
                              value={commentInputs[post._id] || ''}
                              onChange={(e) => setCommentInputs(prev => ({ ...prev, [post._id]: e.target.value }))}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  if (replyingTo && replyingTo.postId === post._id) {
                                    handleAddReply(post._id, replyingTo.commentId);
                                  } else {
                                    handleAddComment(post._id);
                                  }
                                }
                              }}
                              className="flex-1 px-4 py-2 bg-grey/10 dark:bg-zinc-800 rounded-2xl border-0 focus:ring-2 focus:ring-blue focus:bg-white dark:focus:bg-zinc-900 transition outline-none text-sm text-grey-hover dark:text-zinc-200 font-medium placeholder-gray-500 dark:placeholder-zinc-500 resize-none h-[38px] max-h-[120px] overflow-y-auto leading-normal py-2"
                            />
                            <button 
                              onClick={() => {
                                if (replyingTo && replyingTo.postId === post._id) {
                                  handleAddReply(post._id, replyingTo.commentId);
                                } else {
                                  handleAddComment(post._id);
                                }
                              }}
                              className="w-9 h-9 rounded-full bg-blue hover:bg-blue-hover text-white flex items-center justify-center shadow-md shadow-blue/20 transition cursor-pointer border-0 flex-shrink-0"
                            >
                              <Send className="w-4 h-4" />
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
      </main>

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-transparent dark:border-zinc-800 animate-scale-up origin-center">
            
            <div className="flex items-center justify-between px-4 py-3 border-b border-grey/20 dark:border-zinc-800">
              <h2 className="text-lg font-bold text-grey-hover dark:text-zinc-100 mx-auto">Tạo bài viết</h2>
              <button 
                onClick={() => {
                  setIsCreateModalOpen(false);
                  newPostPreviews.forEach(url => URL.revokeObjectURL(url));
                  setNewPostImages([]);
                  setNewPostPreviews([]);
                  setNewPostContent('');
                }}
                className="w-8 h-8 rounded-full hover:bg-grey/10 dark:hover:bg-zinc-800 flex items-center justify-center text-grey hover:text-grey-hover dark:text-zinc-400 dark:hover:text-zinc-200 transition border-0 bg-transparent cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">

              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full overflow-hidden border border-grey/10 dark:border-zinc-800 bg-grey/5 dark:bg-zinc-800">
                  <img src={user?.avatar || '/assets/avatar/avatar.jpg'} alt="Avatar" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="font-bold text-grey-hover dark:text-zinc-150 text-sm sm:text-base">{user?.username}</h4>

                  <div className="relative mt-1">
                    <select
                      value={newPostPrivacy}
                      onChange={(e) => setNewPostPrivacy(e.target.value)}
                      className="text-xs bg-grey/10 dark:bg-zinc-800 border-0 hover:bg-grey/15 dark:hover:bg-zinc-700/80 rounded-lg px-2 py-1 font-semibold text-grey-hover dark:text-zinc-350 outline-none cursor-pointer flex items-center gap-1"
                    >
                      <option value="public" className="dark:bg-zinc-900">🌐 Công khai</option>
                      <option value="friends" className="dark:bg-zinc-900">👥 Bạn bè</option>
                      <option value="private" className="dark:bg-zinc-900">🔒 Chỉ mình tôi</option>
                    </select>
                  </div>
                </div>
              </div>

              <textarea
                placeholder={`${user?.username || 'Bạn'} ơi, bạn đang nghĩ gì thế?`}
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                rows={4}
                className="w-full text-base sm:text-lg border-0 bg-transparent outline-none text-grey-hover dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 font-medium resize-none whitespace-pre-wrap"
              />

              {newPostPreviews.length > 0 && (
                <div className="grid grid-cols-2 gap-2 border border-grey/25 dark:border-zinc-800 p-2 rounded-xl max-h-[300px] overflow-y-auto">
                  {newPostPreviews.map((previewUrl, index) => (
                    <div key={index} className="relative aspect-video rounded-lg overflow-hidden border border-grey/10 dark:border-zinc-850">
                      <img src={previewUrl} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                      <button
                        onClick={() => removeSelectedImage(index)}
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 hover:bg-black/85 flex items-center justify-center text-white transition border-0 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between border border-grey/20 dark:border-zinc-800 rounded-xl p-3 bg-grey/5 dark:bg-zinc-850/40">
                <span className="text-sm font-bold text-grey-hover dark:text-zinc-200">Thêm vào bài viết của bạn</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  ref={fileInputRef}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-10 h-10 rounded-full hover:bg-grey/15 dark:hover:bg-zinc-800 flex items-center justify-center text-green hover:text-green-hover transition border-0 bg-transparent cursor-pointer"
                >
                  <ImageIcon className="w-6 h-6" />
                </button>
              </div>

            </div>

            <div className="p-4 border-t border-grey/20 dark:border-zinc-800">
              <button
                onClick={handleCreatePost}
                disabled={isPosting || (!newPostContent.trim() && newPostImages.length === 0)}
                className={`w-full py-3 rounded-xl text-white font-bold text-base transition duration-150 flex items-center justify-center gap-2 border-0 shadow-md ${
                  isPosting || (!newPostContent.trim() && newPostImages.length === 0)
                    ? 'bg-blue/50 cursor-not-allowed shadow-none'
                    : 'bg-blue hover:bg-blue-hover hover:shadow-blue/15 active:scale-[0.98] cursor-pointer'
                }`}
              >
                {isPosting && <Loader2 className="w-5 h-5 animate-spin" />}
                <span>{isPosting ? 'Đang đăng bài viết...' : 'Đăng'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {activeLightboxPost && (() => {
        const post = posts.find(p => p._id === activeLightboxPost._id) || activeLightboxPost;
        const images = post.images || [];
        const activeImageUrl = images[activeLightboxImageIdx] || '';

        const author = post.author || {};
        const authorName = author.username || 'Người dùng';
        const authorAvatar = author.avatar || '';
        const timeAgoStr = formatTimeAgo(post.createdAt);

        const hasLiked = post.likes?.includes(currentUserId) || false;
        const likesCount = post.likes?.length || 0;
        const commentsCount = getCommentsCount(post);
        const comments = post.comments || [];

        const content = post.content || '';
        const isLong = content.length > 200 || content.split('\n').length > 4;
        const displayContent = lightboxContentExpanded 
          ? content 
          : (content.split('\n').length > 4 
              ? content.split('\n').slice(0, 4).join('\n') + '...' 
              : content.substring(0, 200) + (isLong ? '...' : ''));

        return (
          <div className="fixed inset-0 z-50 flex flex-col md:flex-row bg-black/95 backdrop-blur-sm animate-in fade-in duration-200 select-none">
            
            <div className="flex-1 relative flex items-center justify-center bg-black min-h-[40vh] md:h-full">
              
              <button
                onClick={() => {
                  setActiveLightboxPost(null);
                  setReplyingTo(null);
                }}
                className="absolute top-4 left-4 z-50 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 flex items-center justify-center text-white transition border-0 cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>

              {activeImageUrl ? (
                <img
                  src={activeImageUrl}
                  alt={`Post image ${activeLightboxImageIdx + 1}`}
                  className="max-w-full max-h-[85vh] md:max-h-full object-contain select-none pointer-events-none"
                />
              ) : (
                <div className="text-white text-sm">Không thể tải ảnh</div>
              )}

              {images.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveLightboxImageIdx(prev => (prev > 0 ? prev - 1 : images.length - 1));
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/50 hover:bg-black/80 flex items-center justify-center text-white transition border-0 cursor-pointer"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveLightboxImageIdx(prev => (prev < images.length - 1 ? prev + 1 : 0));
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/50 hover:bg-black/80 flex items-center justify-center text-white transition border-0 cursor-pointer"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}

              {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full select-none font-semibold">
                  {activeLightboxImageIdx + 1} / {images.length}
                </div>
              )}
            </div>

            <div className="w-full md:w-[450px] bg-white dark:bg-zinc-900 h-[60vh] md:h-full flex flex-col shadow-2xl border-t md:border-t-0 md:border-l border-grey/25 dark:border-zinc-800 animate-in slide-in-from-bottom md:slide-in-from-right duration-300">
              
              <div className="p-4 border-b border-grey/15 dark:border-zinc-800 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div 
                    onClick={() => {
                      setActiveLightboxPost(null);
                      router.push(`/user/${author._id || author.id}`);
                    }}
                    className="w-10 h-10 rounded-full overflow-hidden border border-grey/10 dark:border-zinc-800 bg-grey/5 dark:bg-zinc-800 flex-shrink-0 flex items-center justify-center cursor-pointer"
                  >
                    {authorAvatar ? (
                      <img src={authorAvatar} alt={authorName} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-5 h-5 text-grey dark:text-zinc-400" />
                    )}
                  </div>
                  <div className="flex flex-col text-left">
                    <h3 
                      onClick={() => {
                        setActiveLightboxPost(null);
                        router.push(`/user/${author._id || author.id}`);
                      }}
                      className="font-bold text-grey-hover dark:text-zinc-150 hover:underline cursor-pointer text-sm sm:text-base"
                    >
                      {authorName}
                    </h3>
                    <span className="text-xs text-grey dark:text-zinc-400 font-medium">{timeAgoStr}</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setActiveLightboxPost(null);
                    setReplyingTo(null);
                  }}
                  className="w-8 h-8 rounded-full hover:bg-grey/10 dark:hover:bg-zinc-800 flex items-center justify-center text-grey hover:text-grey-hover dark:text-zinc-400 dark:hover:text-zinc-200 transition border-0 bg-transparent cursor-pointer md:hidden"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 text-left scrollbar-none">
                
                {content && (
                  <div className="text-slate-800 dark:text-zinc-250 text-sm leading-relaxed whitespace-pre-wrap text-justify pb-3 border-b border-grey/10 dark:border-zinc-800">
                    {displayContent}
                    {isLong && (
                      <button
                        onClick={() => setLightboxContentExpanded(prev => !prev)}
                        className="text-blue hover:text-blue-hover font-bold text-xs sm:text-sm ml-1.5 focus:outline-none bg-transparent border-0 cursor-pointer inline-block"
                      >
                        {lightboxContentExpanded ? 'Ẩn bớt' : 'Xem thêm'}
                      </button>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-grey dark:text-zinc-400 py-1 select-none">
                  <div className="flex items-center gap-1.5 font-medium">
                    <div className="w-5 h-5 rounded-full bg-blue/10 flex items-center justify-center text-blue">
                      <ThumbsUp className="w-3 h-3 fill-blue" />
                    </div>
                    <span>{likesCount} lượt thích</span>
                  </div>
                  <div className="flex items-center gap-3 font-medium">
                    <span>{commentsCount} bình luận</span>
                    <span>0 chia sẻ</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-1 py-1 border-t border-b border-grey/10 dark:border-zinc-800 select-none">
                  <button 
                    onClick={() => handleLikePost(post._id)}
                    className={`flex items-center justify-center gap-2 py-2 rounded-xl hover:bg-grey/5 dark:hover:bg-zinc-800/50 active:scale-[0.98] transition font-bold text-sm border-0 cursor-pointer bg-transparent ${hasLiked ? 'text-blue' : 'text-grey-hover dark:text-zinc-300'}`}
                  >
                    <ThumbsUp className={`w-4 h-4 ${hasLiked ? 'fill-blue text-blue' : ''}`} />
                    <span>Thích</span>
                  </button>
                  <button 
                    onClick={() => {
                      const el = document.getElementById(`lightbox-comment-input-${post._id}`);
                      el?.focus();
                    }}
                    className="flex items-center justify-center gap-2 py-2 rounded-xl hover:bg-grey/5 dark:hover:bg-zinc-800/50 active:scale-[0.98] transition text-grey-hover dark:text-zinc-300 font-bold text-sm border-0 cursor-pointer bg-transparent"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Bình luận</span>
                  </button>
                </div>

                <div className="space-y-4 pt-2">
                  <h4 className="text-xs font-bold text-grey-hover dark:text-zinc-300 uppercase tracking-wider mb-2">Bình luận</h4>
                  {comments.length === 0 ? (
                    <div className="text-center py-8 text-grey dark:text-zinc-500 text-xs sm:text-sm select-none">
                      Chưa có bình luận nào. Hãy là người đầu tiên!
                    </div>
                  ) : (
                    <div className="space-y-4">
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
                            
                            <div className="flex gap-2.5 items-start">
                              <div 
                                onClick={() => {
                                  setActiveLightboxPost(null);
                                  router.push(`/user/${cAuthor._id || cAuthor.id}`);
                                }}
                                className="w-8 h-8 rounded-full overflow-hidden border border-grey/10 dark:border-zinc-800 bg-grey/5 dark:bg-zinc-800 flex-shrink-0 flex items-center justify-center cursor-pointer"
                              >
                                {cAuthorAvatar ? (
                                  <img src={cAuthorAvatar} alt={cAuthorName} className="w-full h-full object-cover" />
                                ) : (
                                  <User className="w-4.5 h-4.5 text-grey dark:text-zinc-400" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="bg-grey/10 dark:bg-zinc-800/80 rounded-2xl px-3 py-1.5 inline-block max-w-full">
                                  <h5 
                                    onClick={() => {
                                      setActiveLightboxPost(null);
                                      router.push(`/user/${cAuthor._id || cAuthor.id}`);
                                    }}
                                    className="text-xs font-bold text-grey-hover dark:text-zinc-200 hover:underline cursor-pointer truncate mb-0.5"
                                  >
                                    {cAuthorName}
                                  </h5>
                                  <p className="text-sm text-gray-800 dark:text-zinc-200 whitespace-pre-wrap break-words text-justify leading-normal">
                                    {comment.content}
                                  </p>
                                </div>
                                
                                <div className="flex items-center gap-3.5 text-[10px] sm:text-xs text-grey dark:text-zinc-450 mt-0.5 pl-2 select-none font-semibold">
                                  <span>{cTimeAgo}</span>
                                  <button 
                                    onClick={() => {
                                      setReplyingTo({
                                        postId: post._id,
                                        commentId: comment._id,
                                        username: cAuthorName
                                      });
                                      const el = document.getElementById(`lightbox-comment-input-${post._id}`);
                                      el?.focus();
                                    }}
                                    className="hover:text-blue hover:underline transition bg-transparent border-0 cursor-pointer font-bold"
                                  >
                                    Trả lời
                                  </button>
                                  <button 
                                    onClick={() => handleLikeComment(post._id, comment._id)}
                                    className={`hover:text-blue hover:underline flex items-center gap-1 transition bg-transparent border-0 cursor-pointer font-bold ${cHasLiked ? 'text-blue' : ''}`}
                                  >
                                    <ThumbsUp className={`w-3 h-3 ${cHasLiked ? 'fill-blue text-blue' : ''}`} />
                                    <span>{cLikesCount > 0 ? cLikesCount : ''} Thích</span>
                                  </button>
                                </div>
                              </div>
                            </div>

                            {replies.length > 0 && (
                              <div className="pl-10">
                                {!isRepliesExpanded ? (
                                  <button 
                                    onClick={() => setExpandedComments(prev => ({ ...prev, [comment._id]: true }))}
                                    className="flex items-center gap-1 text-xs text-grey hover:text-blue font-bold py-1 bg-transparent border-0 cursor-pointer"
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
                                            onClick={() => {
                                              setActiveLightboxPost(null);
                                              router.push(`/user/${rAuthor._id || rAuthor.id}`);
                                            }}
                                            className="w-7 h-7 rounded-full overflow-hidden border border-grey/10 dark:border-zinc-800 bg-grey/5 dark:bg-zinc-800 flex-shrink-0 flex items-center justify-center cursor-pointer"
                                          >
                                            {rAuthorAvatar ? (
                                              <img src={rAuthorAvatar} alt={rAuthorName} className="w-full h-full object-cover" />
                                            ) : (
                                              <User className="w-4 h-4 text-grey dark:text-zinc-400" />
                                            )}
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <div className="bg-grey/10 dark:bg-zinc-800/80 rounded-2xl px-3 py-1.5 inline-block max-w-full">
                                              <h5 
                                                onClick={() => {
                                                  setActiveLightboxPost(null);
                                                  router.push(`/user/${rAuthor._id || rAuthor.id}`);
                                                }}
                                                className="text-xs font-bold text-grey-hover dark:text-zinc-200 hover:underline cursor-pointer truncate mb-0.5"
                                              >
                                                {rAuthorName}
                                              </h5>
                                              <p className="text-sm text-gray-800 dark:text-zinc-200 whitespace-pre-wrap break-words text-justify leading-normal">
                                                {reply.content}
                                              </p>
                                            </div>
                                            
                                            <div className="flex items-center gap-3 text-[10px] sm:text-xs text-grey dark:text-zinc-400 mt-0.5 pl-2 select-none font-semibold">
                                              <span>{rTimeAgo}</span>
                                              <button 
                                                onClick={() => {
                                                  setReplyingTo({
                                                    postId: post._id,
                                                    commentId: comment._id,
                                                    username: rAuthorName
                                                  });
                                                  const el = document.getElementById(`lightbox-comment-input-${post._id}`);
                                                  el?.focus();
                                                }}
                                                className="hover:text-blue hover:underline transition bg-transparent border-0 cursor-pointer font-bold"
                                              >
                                                Trả lời
                                              </button>
                                              <button 
                                                onClick={() => handleLikeReply(post._id, comment._id, reply._id)}
                                                className={`hover:text-blue hover:underline flex items-center gap-1 transition bg-transparent border-0 cursor-pointer font-bold ${rHasLiked ? 'text-blue' : ''}`}
                                              >
                                                <ThumbsUp className={`w-3 h-3 ${rHasLiked ? 'fill-blue text-blue' : ''}`} />
                                                <span>{rLikesCount > 0 ? rLikesCount : ''} Thích</span>
                                              </button>
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                    <button 
                                      onClick={() => setExpandedComments(prev => ({ ...prev, [comment._id]: false }))}
                                      className="flex items-center gap-1 text-xs text-grey hover:text-blue font-bold py-1 mt-1 bg-transparent border-0 cursor-pointer"
                                    >
                                      <ChevronRight className="w-3.5 h-3.5 -rotate-90" />
                                      <span>Ẩn phản hồi</span>
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
                </div>

              </div>

              <div className="p-4 border-t border-grey/15 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex-shrink-0">
                
                {replyingTo && replyingTo.postId === post._id && (
                  <div className="flex items-center justify-between px-3 py-1.5 bg-grey/10 dark:bg-zinc-800 rounded-xl text-xs sm:text-sm text-grey dark:text-zinc-300 font-medium mb-2 animate-in slide-in-from-bottom-2 duration-150">
                    <div className="flex items-center gap-1.5">
                      <span className="text-blue">Đang phản hồi</span>
                      <span className="font-bold text-grey-hover dark:text-zinc-200">@{replyingTo.username}</span>
                    </div>
                    <button 
                      onClick={() => setReplyingTo(null)}
                      className="w-5 h-5 rounded-full hover:bg-grey/25 dark:hover:bg-zinc-700 flex items-center justify-center text-grey dark:text-zinc-400 transition border-0 bg-transparent cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <div className="flex gap-2 items-center">
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-grey/10 dark:border-zinc-800 bg-grey/5 dark:bg-zinc-800 flex-shrink-0 flex items-center justify-center">
                    <img src={user?.avatar || '/assets/avatar/avatar.jpg'} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 flex gap-2 relative">
                    <textarea
                      id={`lightbox-comment-input-${post._id}`}
                      rows={1}
                      placeholder={replyingTo && replyingTo.postId === post._id ? `Phản hồi @${replyingTo.username}...` : "Viết bình luận công khai..."}
                      value={commentInputs[post._id] || ''}
                      onChange={(e) => setCommentInputs(prev => ({ ...prev, [post._id]: e.target.value }))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          if (replyingTo && replyingTo.postId === post._id) {
                            handleAddReply(post._id, replyingTo.commentId);
                          } else {
                            handleAddComment(post._id);
                          }
                        }
                      }}
                      className="flex-1 px-4 py-2 bg-grey/10 dark:bg-zinc-800 rounded-2xl border-0 focus:ring-2 focus:ring-blue focus:bg-white dark:focus:bg-zinc-900 transition outline-none text-sm text-grey-hover dark:text-zinc-200 font-medium placeholder-gray-500 dark:placeholder-zinc-500 resize-none h-[38px] max-h-[120px] overflow-y-auto leading-normal py-2"
                    />
                    <button 
                      onClick={() => {
                        if (replyingTo && replyingTo.postId === post._id) {
                          handleAddReply(post._id, replyingTo.commentId);
                        } else {
                          handleAddComment(post._id);
                        }
                      }}
                      className="w-9 h-9 rounded-full bg-blue hover:bg-blue-hover text-white flex items-center justify-center shadow-md shadow-blue/20 transition cursor-pointer border-0 flex-shrink-0"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>

            </div>

          </div>
        );
      })()}

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
