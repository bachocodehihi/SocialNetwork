'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { groupService } from '../../../services/group.service';
import { contentService } from '../../../services/content.service';
import { authService } from '../../../services/auth.service';
import { useAlert } from '../../../components/Alert/alertcontext';
import { 
  ArrowLeft, Search, User, Loader2, Check, Users, FileText, Settings, 
  AlertTriangle, Trash2, Shield, Eye, Compass, ThumbsUp, MessageCircle, 
  Share2, Send, ChevronRight, X, Clock, HelpCircle, Telescope
} from 'lucide-react';
import Navbar from '../../../components/Navbar';
import Loading from '../../../components/Loading';
import { motion, AnimatePresence } from 'framer-motion';

export default function GroupContentPage() {
  const router = useRouter();
  const { showSuccess, showError } = useAlert();

  const [groupId, setGroupId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [group, setGroup] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);

  const [activeFilter, setActiveFilter] = useState<'pending' | 'published' | 'rejected' | 'removed'>('pending');

  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [commentSectionOpen, setCommentSectionOpen] = useState<Record<string, boolean>>({});
  const [expandedPosts, setExpandedPosts] = useState<Record<string, boolean>>({});
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [replyingTo, setReplyingTo] = useState<{ postId: string; commentId: string; username: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/signin');
      return;
    }

    const searchParams = new URLSearchParams(window.location.search);
    const id = searchParams.get('groupId');
    if (!id) {
      router.push('/home/contact/friend');
      return;
    }
    setGroupId(id);

    const initData = async () => {
      try {
        setLoading(true);

        const profile = await authService.getProfile();
        setCurrentUser(profile);

        const res = await groupService.getGroupById(id);
        if (res.success && res.data) {
          setGroup(res.data);
        } else {
          showError('Không tìm thấy thông tin nhóm.');
          router.push('/home/contact/friend');
        }
      } catch (err: any) {
        console.error('Lỗi tải nhóm:', err);
        showError('Không thể truy cập nhóm này.');
        router.push('/home/contact/friend');
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, [router]);

  useEffect(() => {
    if (!groupId) return;

    const fetchPosts = async () => {
      try {
        setLoadingPosts(true);
        const res = await contentService.getGroupPosts(groupId);
        setPosts(Array.isArray(res) ? res : []);
      } catch (err) {
        console.error('Lỗi tải bài viết:', err);
      } finally {
        setLoadingPosts(false);
      }
    };

    fetchPosts();
  }, [groupId]);

  if (loading) {
    return <Loading message="Đang tải dữ liệu..." />;
  }

  const currentUserId = currentUser?._id || currentUser?.id;

  const myPosts = posts.filter(p => {
    const authorId = p.author?._id || p.author?.id;
    return authorId === currentUserId;
  });

  const formatTimeAgo = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 30) return `${diffDays} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  const getCommentsCount = (post: any) => {
    let count = post.comments?.length || 0;
    (post.comments || []).forEach((c: any) => {
      count += c.replies?.length || 0;
    });
    return count;
  };

  const handleLikePost = async (postId: string) => {
    if (!currentUser) return;
    setPosts(prev =>
      prev.map(p => {
        if (p._id === postId) {
          const likes = p.likes || [];
          const hasLiked = likes.includes(currentUserId);
          return {
            ...p,
            likes: hasLiked ? likes.filter((id: string) => id !== currentUserId) : [...likes, currentUserId]
          };
        }
        return p;
      })
    );
    try {
      await contentService.likePost(postId);
    } catch (err) {
      console.error('Lỗi thích bài viết:', err);
    }
  };

  const handleAddComment = async (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;
    setCommentInputs(prev => ({ ...prev, [postId]: '' }));
    try {
      const res = await contentService.commentPost(postId, text);
      if (res.success && res.post) {
        setPosts(prev => prev.map(p => p._id === postId ? res.post : p));
      }
    } catch (err) {
      console.error(err);
      showError('Có lỗi xảy ra khi thêm bình luận.');
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
      showError('Không thể gửi phản hồi.');
    }
  };

  const handleLikeComment = async (postId: string, commentId: string) => {
    setPosts(prevPosts =>
      prevPosts.map(post => {
        if (post._id === postId) {
          const updatedComments = (post.comments || []).map((c: any) => {
            if (c._id === commentId) {
              const likes = [...(c.likes || [])];
              const hasLiked = likes.includes(currentUserId);
              return {
                ...c,
                likes: hasLiked ? likes.filter(id => id !== currentUserId) : [...likes, currentUserId],
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
        setPosts(prevPosts => prevPosts.map(post => post._id === postId ? result.post : post));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLikeReply = async (postId: string, commentId: string, replyId: string) => {
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
                    likes: hasLiked ? likes.filter(id => id !== currentUserId) : [...likes, currentUserId],
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
      const result = await contentService.likeComment(replyId);
      if (result && result.post) {
        setPosts(prevPosts => prevPosts.map(post => post._id === postId ? result.post : post));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const renderPostImages = (post: any) => {
    const images = post.images || [];
    if (images.length === 0) return null;

    if (images.length === 1) {
      return (
        <div className="mt-3 overflow-hidden rounded-xl border border-grey/20 max-h-[500px]">
          <img src={images[0]} alt="Post image" className="w-full h-auto max-h-[500px] object-cover" />
        </div>
      );
    }

    if (images.length === 2) {
      return (
        <div className="mt-3 grid grid-cols-2 gap-2 h-72 rounded-xl overflow-hidden">
          <img src={images[0]} alt="Post attachment 1" className="w-full h-full object-cover" />
          <img src={images[1]} alt="Post attachment 2" className="w-full h-full object-cover" />
        </div>
      );
    }

    const remaining = images.length - 3;
    return (
      <div className="mt-3 grid grid-cols-3 gap-2 h-80 rounded-xl overflow-hidden">
        <div className="col-span-2 h-full">
          <img src={images[0]} alt="Post attachment 1" className="w-full h-full object-cover" />
        </div>
        <div className="grid grid-rows-2 gap-2 h-full">
          <div className="h-full overflow-hidden">
            <img src={images[1]} alt="Post attachment 2" className="w-full h-full object-cover" />
          </div>
          <div className="h-full relative overflow-hidden">
            <img src={images[2]} alt="Post attachment 3" className="w-full h-full object-cover" />
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

  const sidebarTabs = [
    { id: 'pending', label: 'Đang chờ', icon: Clock },
    { id: 'published', label: 'Đã đăng', icon: FileText },
    { id: 'rejected', label: 'Bị từ chối', icon: X },
    { id: 'removed', label: 'Đã gỡ', icon: Trash2 }
  ];

  const getFilteredContent = () => {
    if (activeFilter === 'published') {
      return myPosts.filter(p => p.status === 'approved' || !p.status);
    }
    if (activeFilter === 'pending') {
      return myPosts.filter(p => p.status === 'pending');
    }
    if (activeFilter === 'rejected') {
      return myPosts.filter(p => p.status === 'rejected');
    }
    return [];
  };

  const displayedPosts = getFilteredContent();

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-zinc-950 text-slate-800 dark:text-white flex flex-col font-sans">
      <Navbar />

      <div className="flex-1 pt-14 flex flex-col md:flex-row items-stretch">
        
        <aside className="w-full md:w-80 bg-white dark:bg-zinc-900 border-r border-grey/10 dark:border-zinc-800 flex flex-col p-6 text-left shrink-0">

          <div className="text-[11px] font-semibold text-slate-500 dark:text-[#b0b3b8] flex items-center gap-1.5 mb-2 truncate">
            <span className="hover:underline cursor-pointer" onClick={() => router.push(`/group?groupId=${groupId}`)}>{group?.name}</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-800 dark:text-white">Nội dung của bạn</span>
          </div>

          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
            Nội dung của bạn
          </h2>

          <p className="text-xs text-slate-500 dark:text-[#b0b3b8] leading-relaxed mb-6 font-medium text-justify">
            Quản lý và xem bài viết của bạn trong nhóm này. Quản trị viên và người kiểm duyệt có thể đóng góp ý kiến.
          </p>

          <nav className="flex flex-col gap-1.5">
            {sidebarTabs.map((tab) => {
              const isActive = activeFilter === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id as any)}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl transition font-extrabold text-xs border-none cursor-pointer text-left ${
                    isActive 
                      ? 'bg-blue/10 text-[#1877f2] dark:bg-blue-500/10 dark:text-blue-400' 
                      : 'hover:bg-slate-50 text-slate-700 dark:hover:bg-[#3a3b3c]/50 dark:text-[#b0b3b8] bg-transparent'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isActive ? 'bg-blue text-white' : 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-300'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 bg-slate-50 dark:bg-zinc-950 p-6 overflow-y-auto flex flex-col items-center">
          <div className="w-full max-w-2xl space-y-5">
            
            {loadingPosts ? (
              <div className="py-24 flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 text-blue animate-spin" />
                <p className="text-xs text-slate-500 dark:text-[#b0b3b8] font-bold">Đang tải bài viết...</p>
              </div>
            ) : displayedPosts.length === 0 ? (

              <div className="py-24 flex flex-col items-center text-center">
                <div className="relative w-36 h-36 mb-6 flex items-center justify-center bg-white dark:bg-zinc-900 rounded-full shadow-sm border border-grey/10 dark:border-zinc-800">
                  <Telescope className="w-16 h-16 text-blue/80 stroke-[1.5]" />
                </div>
                <h3 className="font-extrabold text-slate-800 dark:text-white text-base">
                  Không có bài viết nào để hiển thị
                </h3>
              </div>
            ) : (

              <div className="space-y-5">
                {displayedPosts.map((post) => {
                  const author = post.author || {};
                  const authorName = author.username || 'Người dùng';
                  const authorAvatar = author.avatar || '';
                  const timeAgoStr = formatTimeAgo(post.createdAt);
                  
                  const hasLiked = post.likes?.includes(currentUserId) || false;
                  const likesCount = post.likes?.length || 0;
                  const commentsCount = getCommentsCount(post);
                  const comments = post.comments || [];
                  const isCommentsOpen = commentSectionOpen[post._id] || false;

                  const content = post.content || '';
                  const contentLines = content.split('\n');
                  const isLongContent = content.length > 250 || contentLines.length > 5;
                  const isExpanded = expandedPosts[post._id] || false;
                  const displayContent = isExpanded 
                    ? content 
                    : (contentLines.length > 5 ? contentLines.slice(0, 5).join('\n') + '...' : content.substring(0, 250) + (isLongContent ? '...' : ''));

                  return (
                    <div key={post._id} className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-grey/20 dark:border-zinc-800 p-5 relative transition-colors duration-200 text-left">
                      
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden border border-grey/10 dark:border-zinc-800 bg-grey/5 dark:bg-zinc-800 flex-shrink-0 flex items-center justify-center">
                            {authorAvatar ? (
                              <img src={authorAvatar} alt={authorName} className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-5 h-5 text-grey dark:text-zinc-400" />
                            )}
                          </div>
                          <div className="flex flex-col">
                            <h3 className="font-bold text-slate-800 dark:text-zinc-200 text-sm sm:text-base">
                              {authorName}
                            </h3>
                            <span className="text-xs text-grey dark:text-zinc-400 font-medium">{timeAgoStr}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-slate-800 dark:text-zinc-200 text-sm sm:text-[15px] leading-relaxed mb-4 whitespace-pre-wrap text-justify px-1">
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

                      <div className="flex items-center justify-between text-xs sm:text-sm text-grey dark:text-zinc-400 py-3 mt-4 border-t border-b border-grey/10 dark:border-zinc-800/60 select-none font-semibold">
                        <div className="flex items-center gap-1.5 font-medium">
                          <div className="w-5 h-5 rounded-full bg-blue/10 flex items-center justify-center text-blue">
                            <ThumbsUp className="w-3.5 h-3.5 fill-blue" />
                          </div>
                          <span>{likesCount} lượt thích</span>
                        </div>
                        <div className="flex items-center gap-3 font-medium">
                          <span>{commentsCount} bình luận</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-1 pt-1.5 select-none">
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
                      </div>

                      {isCommentsOpen && (
                        <div className="mt-4 border-t border-grey/10 dark:border-zinc-800 pt-4 space-y-4 animate-in fade-in duration-200">
                          {comments.length === 0 ? (
                            <div className="text-center py-5 text-grey dark:text-zinc-500 text-xs sm:text-sm select-none">
                              Chưa có bình luận nào.
                            </div>
                          ) : (
                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                              {comments.map((comment: any) => {
                                const cAuthor = comment.author || {};
                                const cAuthorName = cAuthor.username || 'Người dùng';
                                const cAuthorAvatar = cAuthor.avatar || '';
                                const cHasLiked = comment.likes?.includes(currentUserId) || false;
                                const cLikesCount = comment.likes?.length || 0;
                                const cTimeAgo = formatTimeAgo(comment.createdAt);
                                const replies = comment.replies || [];
                                const isRepliesExpanded = expandedComments[comment._id] || false;

                                return (
                                  <div key={comment._id} className="space-y-2">
                                    <div className="flex gap-2.5 items-start text-left">
                                      <div className="w-8 h-8 rounded-full overflow-hidden border border-grey/10 dark:border-zinc-800 bg-grey/5 dark:bg-zinc-800 flex-shrink-0 flex items-center justify-center">
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
                                          <p className="text-sm text-gray-800 dark:text-zinc-200 whitespace-pre-wrap break-words text-justify leading-normal">
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
                                            }}
                                            className="hover:text-blue dark:hover:text-blue-400 hover:underline transition bg-transparent border-0 cursor-pointer font-bold"
                                          >
                                            Trả lời
                                          </button>
                                          <button 
                                            onClick={() => handleLikeComment(post._id, comment._id)}
                                            className={`hover:text-blue dark:hover:text-blue-400 hover:underline flex items-center gap-1 transition bg-transparent border-0 cursor-pointer font-bold ${cHasLiked ? 'text-blue' : 'text-grey dark:text-zinc-400'}`}
                                          >
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
                                              const rHasLiked = reply.likes?.includes(currentUserId) || false;
                                              const rLikesCount = reply.likes?.length || 0;
                                              const rTimeAgo = formatTimeAgo(reply.createdAt);

                                              return (
                                                <div key={reply._id} className="flex gap-2 items-start text-left">
                                                  <div className="w-7 h-7 rounded-full overflow-hidden border border-grey/10 dark:border-zinc-800 bg-grey/5 dark:bg-zinc-800 flex-shrink-0 flex items-center justify-center">
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
                                                      <p className="text-sm text-gray-800 dark:text-zinc-200 whitespace-pre-wrap break-words text-justify leading-normal">
                                                        {reply.content}
                                                      </p>
                                                    </div>
                                                    <div className="flex items-center gap-3.5 text-[10px] sm:text-[11px] text-grey dark:text-zinc-400 mt-0.5 pl-2 select-none font-semibold">
                                                      <span>{rTimeAgo}</span>
                                                      <button 
                                                        onClick={() => handleLikeReply(post._id, comment._id, reply._id)}
                                                        className={`hover:text-blue dark:hover:text-blue-400 hover:underline flex items-center gap-1 transition bg-transparent border-0 cursor-pointer font-bold ${rHasLiked ? 'text-blue' : 'text-grey dark:text-zinc-400'}`}
                                                      >
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

                          <div className="space-y-2 mt-2">
                            {replyingTo && (
                              <div className="flex items-center justify-between bg-blue/5 dark:bg-blue-500/10 px-3 py-1.5 rounded-lg text-xs text-blue font-semibold">
                                <span>Đang trả lời @{replyingTo.username}</span>
                                <button onClick={() => setReplyingTo(null)} className="text-grey hover:text-red transition bg-transparent border-0 cursor-pointer">Hủy</button>
                              </div>
                            )}
                            <div className="flex gap-2 items-center">
                              <textarea
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
      </div>
    </div>
  );
}
