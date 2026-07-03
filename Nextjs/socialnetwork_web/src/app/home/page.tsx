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

  // Create post states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostPrivacy, setNewPostPrivacy] = useState('public');
  const [newPostImages, setNewPostImages] = useState<File[]>([]);
  const [newPostPreviews, setNewPostPreviews] = useState<string[]>([]);
  const [isPosting, setIsPosting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Fetch posts feed
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

  // Liking a post (Optimistic Update)
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
      // Reload feed to revert state
      fetchFeed();
    }
  };

  // Comment on a post
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

  // Reply to a comment
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

  // Like a comment (Optimistic Update)
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

  // Like a reply (Optimistic Update)
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

  // Handle post creation file attachments
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

      // Reset
      setNewPostContent('');
      setNewPostPrivacy('public');
      newPostPreviews.forEach(url => URL.revokeObjectURL(url));
      setNewPostImages([]);
      setNewPostPreviews([]);
      setIsCreateModalOpen(false);

      // Reload
      fetchFeed();
    } catch (err) {
      console.error('Error creating post:', err);
      showError('Không thể tạo bài viết. Vui lòng thử lại!');
    } finally {
      setIsPosting(false);
    }
  };

  // Helper formats
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

  if (checking) {
    return (
      <div className='flex h-screen items-center justify-center bg-grey/5'>
        <div className='animate-spin rounded-full h-12 w-12 border-4 border-blue border-t-transparent'></div>
      </div>
    );
  }

  const currentUserId = user?._id || user?.id;

  return (
    <div className='min-h-screen bg-grey/5 font-sans pb-12'>
      <Navbar activeTab='home' onRefreshFeed={fetchFeed} />

      {/* Main Content */}
      <main className='pt-20 pb-8 px-4'>
        <div className='max-w-2xl mx-auto'>
          {/* Create Post Box */}
          <div className='bg-white rounded-2xl shadow-sm border border-grey/20 p-4 mb-6'>
            <div className='flex gap-3 items-center'>
              <div 
                onClick={() => router.push('/profile')}
                className='w-10 h-10 rounded-full overflow-hidden border border-grey/10 bg-grey/5 flex-shrink-0 flex items-center justify-center cursor-pointer'
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
                  className='flex-1 px-4 py-2.5 bg-grey/10 rounded-xl border-0 hover:bg-grey/15 transition outline-none text-sm text-grey-hover placeholder-gray-500 cursor-pointer font-medium'
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

          {/* Loading Feed Skeleton */}
          {isLoadingFeed && posts.length === 0 ? (
            <div className="space-y-4">
              {[1, 2].map((s) => (
                <div key={s} className="bg-white rounded-2xl border border-grey/20 p-5 animate-pulse">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-grey/20"></div>
                    <div className="space-y-2">
                      <div className="h-4 w-28 bg-grey/20 rounded"></div>
                      <div className="h-3 w-16 bg-grey/20 rounded"></div>
                    </div>
                  </div>
                  <div className="h-4 w-full bg-grey/20 rounded mb-3"></div>
                  <div className="h-3 w-3/4 bg-grey/20 rounded mb-4"></div>
                  <div className="h-52 w-full bg-grey/15 rounded-xl"></div>
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            /* Empty Feed View */
            <div className='bg-white rounded-2xl border border-grey/20 p-12 text-center shadow-sm'>
              <div className="w-16 h-16 mx-auto mb-4 bg-blue/10 rounded-full flex items-center justify-center text-blue">
                <RefreshCw className="w-8 h-8" />
              </div>
              <h3 className='text-lg font-bold text-grey-hover mb-1'>Chưa có bài viết nào</h3>
              <p className='text-sm text-grey max-w-sm mx-auto mb-6'>Bảng tin hiện đang trống. Hãy đăng chia sẻ đầu tiên của bạn để kết nối với mọi người!</p>
              <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="px-5 py-2.5 bg-blue hover:bg-blue-hover text-white font-bold rounded-xl transition shadow-md shadow-blue/15 border-0 cursor-pointer text-sm"
              >
                Đăng bài viết mới
              </button>
            </div>
          ) : (
            /* Real Posts Feed */
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
                  <div key={post._id} className='bg-white rounded-2xl shadow-sm border border-grey/20 p-4 relative'>
                    
                    {/* Header */}
                    <div className='flex items-center justify-between mb-3.5'>
                      <div className='flex items-center gap-3'>
                        <div 
                          onClick={() => router.push(`/user/${author._id || author.id}`)}
                          className='w-10 h-10 rounded-full overflow-hidden border border-grey/10 bg-grey/5 flex-shrink-0 flex items-center justify-center cursor-pointer'
                        >
                          {authorAvatar ? (
                            <img src={authorAvatar} alt={authorName} className='w-full h-full object-cover' />
                          ) : (
                            <User className='w-5 h-5 text-grey' />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <div className='flex items-center flex-wrap gap-1'>
                            <h3 
                              onClick={() => router.push(`/user/${author._id || author.id}`)}
                              className='font-bold text-grey-hover hover:underline cursor-pointer text-sm sm:text-base'
                            >
                              {authorName}
                            </h3>
                            {isGroupPost && groupName && (
                              <div className='flex items-center gap-1 text-xs text-grey font-medium'>
                                <span className="text-grey/60">▸</span>
                                <span className='text-blue font-semibold hover:underline cursor-pointer'>{groupName}</span>
                              </div>
                            )}
                          </div>
                          <span className='text-xs text-grey font-medium'>{timeAgoStr}</span>
                        </div>
                      </div>
                      <button className='w-8 h-8 rounded-full hover:bg-grey/10 flex items-center justify-center text-grey hover:text-grey-hover transition border-0 bg-transparent cursor-pointer'>
                        <MoreHorizontal className='w-5 h-5' />
                      </button>
                    </div>

                    {/* Content */}
                    <div className='text-grey-hover text-sm sm:text-[15px] leading-relaxed mb-3 whitespace-pre-wrap text-justify px-1'>
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

                    {/* Stats */}
                    <div className='flex items-center justify-between text-xs sm:text-sm text-grey py-3 mt-3 border-t border-b border-grey/10 select-none'>
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

                    {/* Action Bar */}
                    <div className='grid grid-cols-3 gap-1 pt-1.5 select-none'>
                      <button 
                        onClick={() => handleLikePost(post._id)}
                        className={`flex items-center justify-center gap-2 py-2 rounded-xl hover:bg-grey/5 active:scale-[0.98] transition font-bold text-sm border-0 cursor-pointer bg-transparent ${hasLiked ? 'text-blue' : 'text-grey-hover'}`}
                      >
                        <ThumbsUp className={`w-5 h-5 ${hasLiked ? 'fill-blue text-blue' : ''}`} />
                        <span>Thích</span>
                      </button>
                      <button 
                        onClick={() => setCommentSectionOpen(prev => ({ ...prev, [post._id]: !isCommentsOpen }))}
                        className={`flex items-center justify-center gap-2 py-2 rounded-xl hover:bg-grey/5 active:scale-[0.98] transition font-bold text-sm border-0 cursor-pointer bg-transparent ${isCommentsOpen ? 'text-blue bg-blue/5' : 'text-grey-hover'}`}
                      >
                        <MessageCircle className="w-5 h-5" />
                        <span>Bình luận</span>
                      </button>
                      <button className='flex items-center justify-center gap-2 py-2 rounded-xl hover:bg-grey/5 active:scale-[0.98] transition text-grey-hover font-bold text-sm border-0 cursor-pointer bg-transparent'>
                        <Share2 className="w-5 h-5" />
                        <span>Chia sẻ</span>
                      </button>
                    </div>

                    {/* Comments Collapsible Section */}
                    {isCommentsOpen && (
                      <div className="mt-4 border-t border-grey/10 pt-4 space-y-4 animate-in fade-in slide-in-from-top-3 duration-200">
                        {/* Comments List */}
                        {comments.length === 0 ? (
                          <div className="text-center py-5 text-grey text-xs sm:text-sm select-none">
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
                                  {/* Comment Main Card */}
                                  <div className="flex gap-2.5 items-start text-left">
                                    <div 
                                      onClick={() => router.push(`/user/${cAuthor._id || cAuthor.id}`)}
                                      className="w-8 h-8 rounded-full overflow-hidden border border-grey/10 bg-grey/5 flex-shrink-0 flex items-center justify-center cursor-pointer"
                                    >
                                      {cAuthorAvatar ? (
                                        <img src={cAuthorAvatar} alt={cAuthorName} className="w-full h-full object-cover" />
                                      ) : (
                                        <User className="w-4.5 h-4.5 text-grey" />
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="bg-grey/10 rounded-2xl px-3.5 py-2 inline-block max-w-full">
                                        <h5 
                                          onClick={() => router.push(`/user/${cAuthor._id || cAuthor.id}`)}
                                          className="text-xs font-bold text-grey-hover hover:underline cursor-pointer truncate mb-0.5"
                                        >
                                          {cAuthorName}
                                        </h5>
                                        <p className="text-sm text-gray-800 whitespace-pre-wrap break-words text-justify leading-normal">
                                          {comment.content}
                                        </p>
                                      </div>
                                      
                                      {/* Comment Actions */}
                                      <div className="flex items-center gap-3.5 text-[11px] sm:text-xs text-grey mt-1 pl-2 select-none font-semibold">
                                        <span>{cTimeAgo}</span>
                                        <button 
                                          onClick={() => {
                                            setReplyingTo({
                                              postId: post._id,
                                              commentId: comment._id,
                                              username: cAuthorName
                                            });
                                            // Focus input
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

                                  {/* Replies Section */}
                                  {replies.length > 0 && (
                                    <div className="pl-10">
                                      {/* View Replies Toggle */}
                                      {!isRepliesExpanded ? (
                                        <button 
                                          onClick={() => setExpandedComments(prev => ({ ...prev, [comment._id]: true }))}
                                          className="flex items-center gap-1 text-xs text-grey hover:text-blue font-bold py-1 bg-transparent border-0 cursor-pointer"
                                        >
                                          <ChevronRight className="w-3.5 h-3.5 rotate-90" />
                                          <span>Xem tất cả {replies.length} phản hồi</span>
                                        </button>
                                      ) : (
                                        <div className="space-y-3 mt-2 border-l-2 border-grey/15 pl-4">
                                          {/* Replies List */}
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
                                                  className="w-7 h-7 rounded-full overflow-hidden border border-grey/10 bg-grey/5 flex-shrink-0 flex items-center justify-center cursor-pointer"
                                                >
                                                  {rAuthorAvatar ? (
                                                    <img src={rAuthorAvatar} alt={rAuthorName} className="w-full h-full object-cover" />
                                                  ) : (
                                                    <User className="w-4 h-4 text-grey" />
                                                  )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                  <div className="bg-grey/10 rounded-2xl px-3 py-1.5 inline-block max-w-full">
                                                    <h5 
                                                      onClick={() => router.push(`/user/${rAuthor._id || rAuthor.id}`)}
                                                      className="text-xs font-bold text-grey-hover hover:underline cursor-pointer truncate mb-0.5"
                                                    >
                                                      {rAuthorName}
                                                    </h5>
                                                    <p className="text-sm text-gray-800 whitespace-pre-wrap break-words text-justify leading-normal">
                                                      {reply.content}
                                                    </p>
                                                  </div>
                                                  
                                                  {/* Reply actions */}
                                                  <div className="flex items-center gap-3 text-[10px] sm:text-xs text-grey mt-0.5 pl-2 select-none font-semibold">
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

                                          {/* Collapse replies button */}
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

                        {/* Reply Banner Notice */}
                        {replyingTo && replyingTo.postId === post._id && (
                          <div className="flex items-center justify-between px-3 py-2 bg-grey/10 rounded-xl text-xs sm:text-sm text-grey font-medium animate-in slide-in-from-bottom-2 duration-150">
                            <div className="flex items-center gap-1.5">
                              <span className="text-blue">Đang phản hồi</span>
                              <span className="font-bold text-grey-hover">@{replyingTo.username}</span>
                            </div>
                            <button 
                              onClick={() => setReplyingTo(null)}
                              className="w-5 h-5 rounded-full hover:bg-grey/20 flex items-center justify-center text-grey transition border-0 bg-transparent cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}

                        {/* Comment Input Box */}
                        <div className="flex gap-2 items-center pt-2">
                          <div className="w-8 h-8 rounded-full overflow-hidden border border-grey/10 bg-grey/5 flex-shrink-0 flex items-center justify-center select-none">
                            <img src={user?.avatar || '/assets/avatar/avatar.jpg'} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 flex gap-2 relative">
                            <input
                              id={`comment-input-${post._id}`}
                              type="text"
                              placeholder={replyingTo && replyingTo.postId === post._id ? `Phản hồi @${replyingTo.username}...` : "Viết bình luận công khai..."}
                              value={commentInputs[post._id] || ''}
                              onChange={(e) => setCommentInputs(prev => ({ ...prev, [post._id]: e.target.value }))}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  if (replyingTo && replyingTo.postId === post._id) {
                                    handleAddReply(post._id, replyingTo.commentId);
                                  } else {
                                    handleAddComment(post._id);
                                  }
                                }
                              }}
                              className="flex-1 px-4 py-2 bg-grey/10 rounded-full border-0 focus:ring-2 focus:ring-blue focus:bg-white transition outline-none text-sm text-grey-hover font-medium placeholder-gray-500"
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

      {/* CREATE POST MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-scale-up origin-center">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-grey/20">
              <h2 className="text-lg font-bold text-grey-hover mx-auto">Tạo bài viết</h2>
              <button 
                onClick={() => {
                  setIsCreateModalOpen(false);
                  newPostPreviews.forEach(url => URL.revokeObjectURL(url));
                  setNewPostImages([]);
                  setNewPostPreviews([]);
                  setNewPostContent('');
                }}
                className="w-8 h-8 rounded-full hover:bg-grey/10 flex items-center justify-center text-grey hover:text-grey-hover transition border-0 bg-transparent cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* User Profile Info */}
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full overflow-hidden border border-grey/10 bg-grey/5">
                  <img src={user?.avatar || '/assets/avatar/avatar.jpg'} alt="Avatar" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="font-bold text-grey-hover text-sm sm:text-base">{user?.username}</h4>
                  
                  {/* Privacy Selector */}
                  <div className="relative mt-1">
                    <select
                      value={newPostPrivacy}
                      onChange={(e) => setNewPostPrivacy(e.target.value)}
                      className="text-xs bg-grey/10 border-0 hover:bg-grey/15 rounded-lg px-2 py-1 font-semibold text-grey-hover outline-none cursor-pointer flex items-center gap-1"
                    >
                      <option value="public">🌐 Công khai</option>
                      <option value="friends">👥 Bạn bè</option>
                      <option value="private">🔒 Chỉ mình tôi</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Text Input */}
              <textarea
                placeholder={`${user?.username || 'Bạn'} ơi, bạn đang nghĩ gì thế?`}
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                rows={4}
                className="w-full text-base sm:text-lg border-0 outline-none text-grey-hover placeholder-gray-400 font-medium resize-none whitespace-pre-wrap"
              />

              {/* Image Previews list */}
              {newPostPreviews.length > 0 && (
                <div className="grid grid-cols-2 gap-2 border border-grey/25 p-2 rounded-xl max-h-[300px] overflow-y-auto">
                  {newPostPreviews.map((previewUrl, index) => (
                    <div key={index} className="relative aspect-video rounded-lg overflow-hidden border border-grey/10">
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

              {/* File Attachment Action */}
              <div className="flex items-center justify-between border border-grey/20 rounded-xl p-3 bg-grey/5">
                <span className="text-sm font-bold text-grey-hover">Thêm vào bài viết của bạn</span>
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
                  className="w-10 h-10 rounded-full hover:bg-grey/15 flex items-center justify-center text-green hover:text-green-hover transition border-0 bg-transparent cursor-pointer"
                >
                  <ImageIcon className="w-6 h-6" />
                </button>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-grey/20">
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

      {/* Inline styles for modal scaleUp animation */}
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
