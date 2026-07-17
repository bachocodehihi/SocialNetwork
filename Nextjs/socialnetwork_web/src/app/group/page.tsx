'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { groupService } from '../../services/group.service';
import { contentService } from '../../services/content.service';
import { authService } from '../../services/auth.service';
import { useAlert } from '../../components/Alert/alertcontext';
import { 
  Users, User, MessageSquare, Settings, Plus, X, Loader2, 
  ThumbsUp, MessageCircle, Image as ImageIcon, Trash2, Camera, 
  Check, LogOut, Edit3, AlertTriangle, ArrowLeft, Globe, Eye, MapPin, 
  Search, MoreHorizontal, Share2, ChevronDown, Smile, FileText,
  ChevronLeft, ChevronRight, Send, Shield, Clock
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import Loading from '../../components/Loading';
import { motion, AnimatePresence } from 'framer-motion';

export default function GroupPage() {
  const router = useRouter();
  const { showSuccess, showError } = useAlert();

  const [groupId, setGroupId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [group, setGroup] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);

  const [joinRequests, setJoinRequests] = useState<any[]>([]);
  const [pendingPosts, setPendingPosts] = useState<any[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [loadingPendingPosts, setLoadingPendingPosts] = useState(false);

  const [isNotMember, setIsNotMember] = useState(false);
  const [isPendingJoin, setIsPendingJoin] = useState(false);
  const [joining, setJoining] = useState(false);

  const [activeTab, setActiveTab] = useState<'discussion' | 'about' | 'members' | 'join_requests' | 'pending_posts'>('discussion');
  const [memberSearchQuery, setMemberSearchQuery] = useState('');

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostImages, setNewPostImages] = useState<File[]>([]);
  const [newPostPreviews, setNewPostPreviews] = useState<string[]>([]);
  const [isPosting, setIsPosting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [commentSectionOpen, setCommentSectionOpen] = useState<Record<string, boolean>>({});

  const [expandedPosts, setExpandedPosts] = useState<Record<string, boolean>>({});
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [replyingTo, setReplyingTo] = useState<{ postId: string; commentId: string; username: string } | null>(null);

  const [activeLightboxPost, setActiveLightboxPost] = useState<any | null>(null);
  const [activeLightboxImageIdx, setActiveLightboxImageIdx] = useState<number>(0);
  const [lightboxContentExpanded, setLightboxContentExpanded] = useState<boolean>(false);

  const [isJoinedDropdownOpen, setIsJoinedDropdownOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  const isAdmin = group?.admin?._id 
    ? (group.admin._id === currentUser?._id || group.admin._id === currentUser?.id)
    : (group?.admin === currentUser?._id || group?.admin === currentUser?.id);

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
          setEditName(res.data.name);
          setEditDescription(res.data.description || '');
          setEditAvatar(res.data.avatar || '');
          setIsNotMember(false);
        } else {
          showError('Không tìm thấy thông tin nhóm.');
          router.push('/home/contact/friend');
        }
      } catch (err: any) {
        console.error('Lỗi tải nhóm:', err);
        const errorData = err.response?.data;
        if (errorData && errorData.code === 'NOT_GROUP_MEMBER' && errorData.data) {
          setGroup(errorData.data);
          setIsNotMember(true);
          setIsPendingJoin(errorData.data.isPendingJoin || false);
        } else {
          showError('Không thể truy cập nhóm này. Bạn có thể không phải thành viên.');
          router.push('/home/contact/friend');
        }
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
        console.error('Lỗi tải bài viết nhóm:', err);
      } finally {
        setLoadingPosts(false);
      }
    };

    fetchPosts();
  }, [groupId]);

  useEffect(() => {
    if (!groupId || !isAdmin) return;

    const fetchJoinRequests = async () => {
      try {
        setLoadingRequests(true);
        const res = await groupService.getJoinRequests(groupId);
        if (res.success) {
          setJoinRequests(res.data || []);
        }
      } catch (err) {
        console.error('Lỗi tải danh sách chờ duyệt:', err);
      } finally {
        setLoadingRequests(false);
      }
    };

    const fetchPendingPosts = async () => {
      try {
        setLoadingPendingPosts(true);
        const res = await groupService.getPendingPosts(groupId);
        if (res.success) {
          setPendingPosts(res.data || []);
        }
      } catch (err) {
        console.error('Lỗi tải danh sách bài viết chờ duyệt:', err);
      } finally {
        setLoadingPendingPosts(false);
      }
    };

    fetchJoinRequests();
    fetchPendingPosts();
  }, [groupId, isAdmin]);

  const handleJoinGroup = async () => {
    if (!groupId) return;
    try {
      setJoining(true);
      const res = await groupService.joinGroup(groupId);
      if (res.success) {
        if (res.status === 'approved') {
          showSuccess('Bạn đã tham gia nhóm thành công!');
          setIsNotMember(false);

          const updatedGroup = await groupService.getGroupById(groupId);
          if (updatedGroup.success && updatedGroup.data) {
            setGroup(updatedGroup.data);
          }
        } else {
          showSuccess('Yêu cầu tham gia của bạn đã được gửi cho Quản trị viên nhóm phê duyệt.');
          setIsPendingJoin(true);
        }
      } else {
        showError('Không thể tham gia nhóm.');
      }
    } catch (err: any) {
      console.error(err);
      if (err.response?.data?.code === 'GROUP_FULL') {
        showError('Nhóm đã đạt giới hạn tối đa số lượng thành viên.');
      } else {
        showError('Có lỗi xảy ra khi tham gia nhóm.');
      }
    } finally {
      setJoining(false);
    }
  };

  const handleActionJoinRequest = async (requestUserId: string, action: 'approve' | 'reject') => {
    if (!groupId) return;
    try {
      const res = await groupService.handleJoinRequest(groupId, requestUserId, action);
      if (res.success) {
        showSuccess(action === 'approve' ? 'Đã phê duyệt thành viên mới!' : 'Đã từ chối yêu cầu.');
        setJoinRequests(prev => prev.filter(r => r._id !== requestUserId));
        if (action === 'approve') {

          const updatedGroup = await groupService.getGroupById(groupId);
          if (updatedGroup.success && updatedGroup.data) {
            setGroup(updatedGroup.data);
          }
        }
      } else {
        showError('Không thể thực hiện thao tác.');
      }
    } catch (err: any) {
      console.error(err);
      showError('Có lỗi xảy ra khi phê duyệt thành viên.');
    }
  };

  const handleActionPendingPost = async (postId: string, action: 'approve' | 'reject') => {
    if (!groupId) return;
    try {
      const res = await groupService.handlePendingPost(groupId, postId, action);
      if (res.success) {
        showSuccess(action === 'approve' ? 'Đã phê duyệt bài viết!' : 'Đã từ chối bài viết.');
        setPendingPosts(prev => prev.filter(p => p._id !== postId));
        if (action === 'approve') {

          const postsRes = await contentService.getGroupPosts(groupId);
          setPosts(Array.isArray(postsRes) ? postsRes : []);
        }
      } else {
        showError('Không thể thực hiện thao tác.');
      }
    } catch (err: any) {
      console.error(err);
      showError('Có lỗi xảy ra khi phê duyệt bài viết.');
    }
  };

  const handleUpdateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupId || !editName.trim()) return;

    try {
      setIsUpdating(true);
      const res = await groupService.updateGroup(groupId, {
        name: editName.trim(),
        description: editDescription.trim(),
        avatar: editAvatar.trim(),
      });
      if (res.success && res.group) {
        setGroup({
          ...group,
          name: res.group.name,
          description: res.group.description,
          avatar: res.group.avatar
        });
        showSuccess('Cập nhật thông tin nhóm thành công!');
        setIsEditModalOpen(false);
      } else {
        showError('Không thể cập nhật thông tin nhóm.');
      }
    } catch (err: any) {
      console.error(err);
      showError(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật nhóm.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteGroup = async () => {
    if (!groupId || !window.confirm('Bạn có chắc chắn muốn giải tán nhóm này không? Toàn bộ tin nhắn và bài viết sẽ bị xóa vĩnh viễn.')) return;

    try {
      setLoading(true);
      const res = await groupService.deleteGroup(groupId);
      if (res.success) {
        showSuccess('Đã giải tán nhóm thành công.');
        router.push('/home/contact/friend');
      } else {
        showError('Không thể xóa nhóm.');
      }
    } catch (err: any) {
      console.error(err);
      showError('Có lỗi xảy ra khi xóa nhóm.');
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string, username: string) => {
    if (!groupId || !window.confirm(`Bạn có chắc chắn muốn xóa thành viên "${username}" ra khỏi nhóm?`)) return;

    try {
      const res = await groupService.removeMember(groupId, memberId);
      if (res.success) {
        setGroup((prev: any) => ({
          ...prev,
          members: prev.members.filter((m: any) => m._id !== memberId)
        }));
        showSuccess(`Đã xóa ${username} khỏi nhóm.`);
      } else {
        showError('Không thể xóa thành viên.');
      }
    } catch (err: any) {
      console.error(err);
      showError('Có lỗi xảy ra khi xóa thành viên.');
    }
  };

  const handleLeaveGroup = async () => {
    if (!groupId || !currentUser || !window.confirm('Bạn có chắc chắn muốn rời khỏi nhóm này không?')) return;

    try {
      const currentUserId = currentUser._id || currentUser.id;
      const res = await groupService.removeMember(groupId, currentUserId);
      if (res.success) {
        showSuccess('Bạn đã rời khỏi nhóm.');
        router.push('/home/contact/friend');
      } else {
        showError('Không thể rời nhóm.');
      }
    } catch (err: any) {
      console.error(err);
      showError('Có lỗi xảy ra khi rời nhóm.');
    }
  };

  const handleSelectImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setNewPostImages(prev => [...prev, ...filesArray]);

      const previews = filesArray.map(file => URL.createObjectURL(file));
      setNewPostPreviews(prev => [...prev, ...previews]);
    }
  };

  const handleRemovePreview = (index: number) => {
    setNewPostImages(prev => prev.filter((_, i) => i !== index));
    setNewPostPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim() && newPostImages.length === 0) return;
    if (!groupId) return;

    try {
      setIsPosting(true);
      const formData = new FormData();
      formData.append('content', newPostContent.trim());
      formData.append('postType', 'group');
      formData.append('group', groupId);

      newPostImages.forEach(file => {
        formData.append('images', file);
      });

      const res = await contentService.createPost(formData);
      if (res.success && res.post) {
        if (res.post.status === 'pending') {
          showSuccess('Bài viết của bạn đã được gửi và đang chờ duyệt.');
        } else {
          setPosts(prev => [res.post, ...prev]);
          showSuccess('Đã đăng bài viết thành công!');
        }
        setNewPostContent('');
        setNewPostImages([]);
        setNewPostPreviews([]);
        setIsCreateModalOpen(false);
      } else {
        showError('Không thể tạo bài viết.');
      }
    } catch (err: any) {
      console.error(err);
      showError('Có lỗi xảy ra khi đăng bài viết.');
    } finally {
      setIsPosting(false);
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    try {
      const now = new Date();
      const date = new Date(dateStr);
      const diffMs = now.getTime() - date.getTime();
      if (diffMs < 0) return 'Vừa xong';
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffDays > 30) {
        return date.toLocaleDateString('vi-VN');
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

  const openLightbox = (post: any, index: number) => {
    setActiveLightboxPost(post);
    setActiveLightboxImageIdx(index);
    setLightboxContentExpanded(false);
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

  const handleLikePost = async (postId: string) => {
    if (!currentUser) return;
    const currentUserId = currentUser._id || currentUser.id;

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
      const result = await contentService.likeComment(replyId);
      if (result && result.post) {
        setPosts(prevPosts =>
          prevPosts.map(post => (post._id === postId ? result.post : post))
        );
      }
    } catch (err) {
      console.error('Error liking reply:', err);
    }
  };

  const copyInviteLink = () => {
    if (group?.inviteLink) {
      navigator.clipboard.writeText(group.inviteLink);
      showSuccess('Đã sao chép liên kết mời tham gia nhóm!');
    } else {
      const inviteUrl = `${window.location.origin}/group/join?inviteCode=${group?.inviteCode}`;
      navigator.clipboard.writeText(inviteUrl);
      showSuccess('Đã sao chép liên kết mời tham gia nhóm!');
    }
  };

  if (loading) {
    return <Loading message="Đang tải trang nhóm..." />;
  }


  // Extract photos from posts to show under "File phương tiện mới đây"
  const recentPhotos = posts
    .flatMap(p => p.images || [])
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-zinc-950 text-slate-800 dark:text-white flex flex-col font-sans selection:bg-blue selection:text-white">
      <Navbar />

      {/* Main Wrapper */}
      <div className="flex-1 pt-14 pb-12 flex flex-col items-center">
        {/* Cover + Header Area */}
        <div className="w-full bg-white dark:bg-zinc-900 border-b border-grey/10 dark:border-zinc-800 flex justify-center shadow-sm">
          <div className="w-full max-w-6xl flex flex-col">
            
            {/* Header Content */}
            <div className="px-4 py-6 flex flex-col md:flex-row items-center md:items-end justify-between gap-6 border-b border-grey/10 dark:border-zinc-800">
              
              {/* Group Metadata */}
              <div className="flex flex-col items-center md:items-start text-center md:text-left min-w-0">
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-2">
                  {group.name}
                </h1>
                
                <p className="text-sm text-slate-500 dark:text-[#b0b3b8] font-semibold flex items-center gap-1.5 justify-center md:justify-start">
                  {group.settings?.groupType === 'private' ? (
                    <>
                      <Shield className="w-4 h-4 text-slate-500 dark:text-[#b0b3b8]" />
                      <span>Nhóm Riêng tư</span>
                    </>
                  ) : group.settings?.groupType === 'internal' ? (
                    <>
                      <Eye className="w-4 h-4 text-slate-500 dark:text-[#b0b3b8]" />
                      <span>Nhóm Nội bộ</span>
                    </>
                  ) : (
                    <>
                      <Globe className="w-4 h-4 text-slate-500 dark:text-[#b0b3b8]" />
                      <span>Nhóm Công khai</span>
                    </>
                  )}
                  <span>·</span>
                  <span className="text-slate-900 dark:text-white font-bold">{group.members?.length ?? group.membersCount ?? 0} thành viên</span>
                </p>

                {/* Overlapping Members Avatars */}
                {!isNotMember && group.members && group.members.length > 0 && (
                  <div className="flex items-center -space-x-2 mt-4 overflow-hidden">
                    {group.members.slice(0, 8).map((m: any, idx: number) => (
                      <div 
                        key={m._id || idx} 
                        className="w-8 h-8 rounded-full border-2 border-white dark:border-[#242526] bg-slate-100 dark:bg-[#18191a] overflow-hidden flex-shrink-0 flex items-center justify-center text-xs font-bold"
                        title={m.username}
                      >
                        {m.avatar ? (
                          <img src={m.avatar} alt={m.username} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-blue-100/10 text-blue flex items-center justify-center">
                            {m.username?.charAt(0).toUpperCase() || 'U'}
                          </div>
                        )}
                      </div>
                    ))}
                    {group.members.length > 8 && (
                      <div className="w-8 h-8 rounded-full border-2 border-white dark:border-[#242526] bg-slate-200 dark:bg-[#3a3b3c] flex items-center justify-center text-[10px] font-black text-slate-600 dark:text-[#b0b3b8] flex-shrink-0">
                        +{group.members.length - 8}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center flex-wrap justify-center gap-2 flex-shrink-0 relative">
                {isNotMember ? (
                  isPendingJoin ? (
                    <button
                      disabled
                      className="px-6 py-2.5 rounded-lg bg-slate-200 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 font-extrabold text-sm flex items-center gap-2 transition border-none cursor-not-allowed"
                    >
                      <Clock className="w-4 h-4" />
                      <span>Đang chờ duyệt</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleJoinGroup}
                      disabled={joining}
                      className="px-6 py-2.5 rounded-lg bg-[#1877f2] hover:bg-[#156bec] text-white font-extrabold text-sm flex items-center gap-2 transition cursor-pointer border-none shadow-md disabled:opacity-50"
                    >
                      {joining ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                      <span>Tham gia nhóm</span>
                    </button>
                  )
                ) : (
                  <>
                    {/* Invite Button (Blue) */}
                    <button
                      onClick={() => router.push(`/group/invite?groupId=${group._id}`)}
                      className="px-5 py-2.5 rounded-lg bg-[#1877f2] hover:bg-[#156bec] text-white font-extrabold text-sm flex items-center gap-2 transition cursor-pointer border-none shadow-md"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Mời</span>
                    </button>

                    {/* Share Button (Grey) */}
                    <button
                      onClick={copyInviteLink}
                      className="px-5 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-[#3a3b3c] dark:hover:bg-[#4e4f50] dark:text-white font-extrabold text-sm flex items-center gap-2 transition cursor-pointer border-none"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Chia sẻ</span>
                    </button>

                    {/* Chat Button (Grey) */}
                    <button
                      onClick={() => router.push(`/home/message?groupId=${group._id}`)}
                      className="px-5 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-[#3a3b3c] dark:hover:bg-[#4e4f50] dark:text-white font-extrabold text-sm flex items-center gap-2 transition cursor-pointer border-none"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Nhắn tin</span>
                    </button>

                    {/* Joined/Admin Dropdown */}
                    <div className="relative">
                      <button
                        onClick={() => setIsJoinedDropdownOpen(!isJoinedDropdownOpen)}
                        className="px-4 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-[#3a3b3c] dark:hover:bg-[#4e4f50] dark:text-white font-extrabold text-sm flex items-center gap-1.5 transition cursor-pointer border-none"
                      >
                        <span>{isAdmin ? 'Quản trị viên' : 'Đã tham gia'}</span>
                        <ChevronDown className="w-4 h-4 text-slate-800 dark:text-white" />
                      </button>

                      <AnimatePresence>
                        {isJoinedDropdownOpen && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setIsJoinedDropdownOpen(false)}></div>
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 10 }}
                              className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 dark:bg-[#242526] dark:border-[#3e4042] rounded-xl overflow-hidden shadow-2xl z-20"
                            >
                              {isAdmin && (
                                <>
                                  <button
                                    onClick={() => {
                                      setIsJoinedDropdownOpen(false);
                                      router.push(`/group/setting?groupId=${group._id}`);
                                    }}
                                    className="w-full text-left px-4 py-3 hover:bg-slate-100 dark:hover:bg-[#3a3b3c] text-slate-800 dark:text-white text-xs font-bold transition flex items-center gap-2 border-none bg-transparent cursor-pointer"
                                  >
                                    <Settings className="w-4 h-4 text-slate-500 dark:text-[#b0b3b8]" />
                                    <span>Cài đặt nhóm</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      setIsJoinedDropdownOpen(false);
                                      setActiveTab('join_requests');
                                    }}
                                    className="w-full text-left px-4 py-3 hover:bg-slate-100 dark:hover:bg-[#3a3b3c] text-slate-800 dark:text-white text-xs font-bold transition flex items-center gap-2 border-none bg-transparent cursor-pointer"
                                  >
                                    <Users className="w-4 h-4 text-slate-500 dark:text-[#b0b3b8]" />
                                    <span>Duyệt thành viên ({joinRequests.length})</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      setIsJoinedDropdownOpen(false);
                                      setActiveTab('pending_posts');
                                    }}
                                    className="w-full text-left px-4 py-3 hover:bg-slate-100 dark:hover:bg-[#3a3b3c] text-slate-800 dark:text-white text-xs font-bold transition flex items-center gap-2 border-none bg-transparent cursor-pointer"
                                  >
                                    <FileText className="w-4 h-4 text-slate-500 dark:text-[#b0b3b8]" />
                                    <span>Duyệt bài viết ({pendingPosts.length})</span>
                                  </button>
                                </>
                              )}

                              {!isAdmin ? (
                                <button
                                  onClick={() => {
                                    setIsJoinedDropdownOpen(false);
                                    handleLeaveGroup();
                                  }}
                                  className="w-full text-left px-4 py-3 hover:bg-red/10 text-red text-xs font-bold transition flex items-center gap-2 border-none bg-transparent cursor-pointer"
                                >
                                  <LogOut className="w-4 h-4" />
                                  <span>Rời nhóm</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    setIsJoinedDropdownOpen(false);
                                    handleDeleteGroup();
                                  }}
                                  className="w-full text-left px-4 py-3 hover:bg-red/10 text-red text-xs font-bold transition flex items-center gap-2 border-none bg-transparent cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  <span>Giải tán nhóm</span>
                                </button>
                              )}
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>
                  </>
                )}
              </div>

            </div>

            {/* Navigation Tabs (Facebook Style) */}
            <div className="px-4 flex items-center justify-between text-slate-500 dark:text-[#b0b3b8]">
              <div className="flex items-center gap-1 overflow-x-auto">
                {[
                  { id: 'discussion', label: 'Thảo luận' },
                  { id: 'members', label: 'Mọi người' },
                  ...(isAdmin ? [
                    { id: 'join_requests', label: `Duyệt thành viên (${joinRequests.length})` },
                    { id: 'pending_posts', label: `Duyệt bài viết (${pendingPosts.length})` }
                  ] : [])
                ].map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`px-4 py-4 text-sm font-bold border-b-4 transition cursor-pointer bg-transparent border-none shrink-0 ${
                        isActive 
                          ? 'border-[#1877f2] text-[#1877f2]' 
                          : 'border-transparent text-slate-500 dark:text-[#b0b3b8] hover:bg-slate-100 dark:hover:bg-[#3a3b3c]/50 rounded-t-lg'
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Search and More buttons */}
              <div className="flex items-center gap-2 pb-1 pr-2">
                <button 
                  className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-[#3a3b3c] dark:hover:bg-[#4e4f50] text-slate-800 dark:text-white flex items-center justify-center transition border-none cursor-pointer"
                  title="Tìm kiếm"
                >
                  <Search className="w-4 h-4" />
                </button>
                <div className="relative">
                  <button 
                    onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                    className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-[#3a3b3c] dark:hover:bg-[#4e4f50] text-slate-800 dark:text-white flex items-center justify-center transition border-none cursor-pointer"
                    title="Xem thêm"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>

                  <AnimatePresence>
                    {isMoreMenuOpen && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setIsMoreMenuOpen(false)}></div>
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 dark:bg-[#242526] dark:border-[#3e4042] rounded-xl overflow-hidden shadow-2xl z-20"
                        >
                          <button
                            onClick={() => {
                              setIsMoreMenuOpen(false);
                              router.push(`/group/content?groupId=${group._id}`);
                            }}
                            className="w-full text-left px-4 py-3 hover:bg-slate-100 dark:hover:bg-[#3a3b3c] text-slate-800 dark:text-white text-xs font-bold transition flex items-center gap-2 border-none bg-transparent cursor-pointer"
                          >
                            <FileText className="w-4 h-4 text-slate-500 dark:text-[#b0b3b8]" />
                            <span>Nội dung của bạn</span>
                          </button>
                          
                          <button
                            onClick={() => {
                              setIsMoreMenuOpen(false);
                              showSuccess("Tính năng 'Quản lý thông báo' đang được phát triển!");
                            }}
                            className="w-full text-left px-4 py-3 hover:bg-slate-100 dark:hover:bg-[#3a3b3c] text-slate-800 dark:text-white text-xs font-bold transition flex items-center gap-2 border-none bg-transparent cursor-pointer"
                          >
                            <Settings className="w-4 h-4 text-slate-500 dark:text-[#b0b3b8]" />
                            <span>Quản lý thông báo</span>
                          </button>

                          <button
                            onClick={() => {
                              setIsMoreMenuOpen(false);
                              showSuccess("Tính năng 'Báo cáo nhóm' đang được phát triển!");
                            }}
                            className="w-full text-left px-4 py-3 hover:bg-red/10 text-red text-xs font-bold transition flex items-center gap-2 border-none bg-transparent cursor-pointer"
                          >
                            <AlertTriangle className="w-4 h-4" />
                            <span>Báo cáo nhóm</span>
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Content Body Grid */}
        <div className="w-full max-w-6xl px-4 mt-6">
          {isNotMember ? (
            <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-[#3e4042]/50 p-8 md:p-12 text-center shadow-xl space-y-6 mx-auto mt-4">
              <div className="w-20 h-20 rounded-full bg-blue/5 dark:bg-blue-500/10 flex items-center justify-center mx-auto text-[#1877f2]">
                <Shield className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">
                  Đây là nhóm {group.settings?.groupType === 'private' ? 'riêng tư' : 'nội bộ'}
                </h2>
                <p className="text-sm text-slate-500 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
                  Hãy gửi yêu cầu tham gia nhóm để xem các bài viết, thành viên và các cuộc trò chuyện của nhóm này.
                </p>
              </div>
              <div className="pt-2">
                {isPendingJoin ? (
                  <div className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 font-bold text-sm">
                    <Clock className="w-4 h-4 animate-pulse text-[#f7b928]" />
                    <span>Yêu cầu tham gia của bạn đang chờ phê duyệt</span>
                  </div>
                ) : (
                  <button
                    onClick={handleJoinGroup}
                    disabled={joining}
                    className="px-8 py-3.5 bg-[#1877f2] hover:bg-[#156bec] text-white rounded-2xl font-extrabold text-sm shadow-lg shadow-blue/20 transition-all active:scale-[0.98] cursor-pointer border-none flex items-center gap-2 mx-auto disabled:opacity-50"
                  >
                    {joining && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>Gửi yêu cầu tham gia nhóm</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Discussion tab (Feed + Sidebar) */}
              {activeTab === 'discussion' && (
                <>
                  {/* Left Column - Main Feed */}
                  <div className={`${recentPhotos.length > 0 ? 'lg:col-span-8' : 'lg:col-span-12 max-w-3xl mx-auto'} w-full space-y-5`}>
                    
                    {/* Admin Pending Activities Alert */}
                    {isAdmin && (joinRequests.length > 0 || pendingPosts.length > 0) && (
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-zinc-900 dark:to-zinc-800 rounded-2xl border border-blue-200 dark:border-zinc-700/60 p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-left">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue/10 dark:bg-blue-500/20 flex items-center justify-center text-[#1877f2] flex-shrink-0">
                            <Shield className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-extrabold text-sm text-slate-800 dark:text-zinc-100">Cần phê duyệt hoạt động nhóm</h4>
                            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 leading-normal font-semibold">
                              {joinRequests.length > 0 && `Có ${joinRequests.length} yêu cầu tham gia`}
                              {joinRequests.length > 0 && pendingPosts.length > 0 && ' và '}
                              {pendingPosts.length > 0 && `Có ${pendingPosts.length} bài viết chờ phê duyệt`}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                          {joinRequests.length > 0 && (
                            <button
                              onClick={() => setActiveTab('join_requests')}
                              className="flex-1 sm:flex-initial px-3.5 py-2 bg-[#1877f2] hover:bg-[#156bec] text-white text-xs font-bold rounded-lg border-none transition cursor-pointer shadow-sm shadow-blue/10"
                            >
                              Duyệt thành viên
                            </button>
                          )}
                          {pendingPosts.length > 0 && (
                            <button
                              onClick={() => setActiveTab('pending_posts')}
                              className="flex-1 sm:flex-initial px-3.5 py-2 bg-slate-100 dark:bg-zinc-850 hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-700 dark:text-white text-xs font-bold rounded-lg border-none transition cursor-pointer"
                            >
                              Duyệt bài viết
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Create Post Card (FB style) */}
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-grey/20 dark:border-zinc-800 shadow-sm p-4">
                      <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 flex-shrink-0">
                          {currentUser?.avatar ? (
                            <img src={currentUser.avatar} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-blue-100/10 text-blue flex items-center justify-center">
                              <User className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                        
                        {/* Fake Input trigger */}
                        <div 
                          onClick={() => setIsCreateModalOpen(true)}
                          className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-500 dark:bg-[#3a3b3c] dark:hover:bg-[#4e4f50] dark:text-[#b0b3b8] rounded-full px-5 py-2.5 text-sm font-semibold cursor-pointer transition flex items-center justify-start"
                        >
                          Bạn viết gì đi...
                        </div>
                      </div>

                      <div className="border-t border-grey/10 dark:border-zinc-800 mt-4 pt-3 flex gap-2">
                        <button
                          onClick={() => {
                            setIsCreateModalOpen(true);
                            setTimeout(() => fileInputRef.current?.click(), 100);
                          }}
                          className="flex-1 py-2 hover:bg-slate-100 dark:hover:bg-[#3a3b3c] rounded-lg transition text-xs font-bold text-slate-600 dark:text-[#b0b3b8] flex items-center justify-center gap-2 border-0 bg-transparent cursor-pointer"
                        >
                          <ImageIcon className="w-5 h-5 text-[#45bd62]" />
                          <span>Ảnh/video</span>
                        </button>
                        
                        <button
                          onClick={() => setIsCreateModalOpen(true)}
                          className="flex-1 py-2 hover:bg-slate-100 dark:hover:bg-[#3a3b3c] rounded-lg transition text-xs font-bold text-slate-600 dark:text-[#b0b3b8] flex items-center justify-center gap-2 border-0 bg-transparent cursor-pointer"
                        >
                          <Smile className="w-5 h-5 text-[#f7b928]" />
                          <span>Cảm xúc/hoạt động</span>
                        </button>
                      </div>
                    </div>

                    {/* Feed list */}
                    {loadingPosts ? (
                      <div className="py-16 flex flex-col items-center gap-3">
                        <Loader2 className="w-8 h-8 text-blue animate-spin" />
                        <p className="text-xs text-slate-500 dark:text-[#b0b3b8] font-bold">Đang tải bài viết...</p>
                      </div>
                    ) : posts.length === 0 ? (
                      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-grey/20 dark:border-zinc-800 p-12 text-center text-slate-500 dark:text-zinc-400">
                        <Users className="w-12 h-12 mx-auto mb-3 opacity-30 text-slate-500 dark:text-zinc-400" />
                        <h3 className="font-bold text-slate-850 dark:text-white text-base">Chưa có bài viết nào</h3>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">Hãy là người đầu tiên chia sẻ thông tin hoặc hình ảnh trong nhóm này!</p>
                      </div>
                    ) : (
                      <div className="space-y-5">
                        {posts.map((post) => {
                          const author = post.author || {};
                          const authorName = author.username || 'Người dùng';
                          const authorAvatar = author.avatar || '';
                          const timeAgoStr = formatTimeAgo(post.createdAt);
                          
                          const currentUserId = currentUser?._id || currentUser?.id;
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
                            : (contentLines.length > 5 
                                ? contentLines.slice(0, 5).join('\n') + '...' 
                                : content.substring(0, 250) + (isLongContent ? '...' : ''));

                          return (
                            <div key={post._id} className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-grey/20 dark:border-zinc-800 p-4 relative transition-colors duration-200 text-left">
                              
                              <div className="flex items-center justify-between mb-3.5">
                                <div className="flex items-center gap-3">
                                  <div 
                                    onClick={() => router.push(`/user/${author._id || author.id}`)}
                                    className="w-10 h-10 rounded-full overflow-hidden border border-grey/10 dark:border-zinc-800 bg-grey/5 dark:bg-zinc-800 flex-shrink-0 flex items-center justify-center cursor-pointer"
                                  >
                                    {authorAvatar ? (
                                      <img src={authorAvatar} alt={authorName} className="w-full h-full object-cover" />
                                    ) : (
                                      <User className="w-5 h-5 text-grey dark:text-zinc-400" />
                                    )}
                                  </div>
                                  <div className="flex flex-col">
                                    <h3 
                                      onClick={() => router.push(`/user/${author._id || author.id}`)}
                                      className="font-bold text-grey-hover dark:text-zinc-200 hover:underline cursor-pointer text-sm sm:text-base"
                                    >
                                      {authorName}
                                    </h3>
                                    <span className="text-xs text-grey dark:text-zinc-400 font-medium">{timeAgoStr}</span>
                                  </div>
                                </div>
                                <button className="w-8 h-8 rounded-full hover:bg-grey/10 dark:hover:bg-zinc-800 flex items-center justify-center text-grey hover:text-grey-hover dark:text-zinc-400 dark:hover:text-zinc-200 transition border-0 bg-transparent cursor-pointer">
                                  <MoreHorizontal className="w-5 h-5" />
                                </button>
                              </div>

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

                              {renderPostImages(post)}

                              <div className="flex items-center justify-between text-xs sm:text-sm text-grey dark:text-zinc-400 py-3 mt-3 border-t border-b border-grey/10 dark:border-zinc-800/60 select-none font-semibold">
                                <div className="flex items-center gap-1.5 font-medium">
                                  <div className="w-5 h-5 rounded-full bg-blue/10 flex items-center justify-center text-blue">
                                    <ThumbsUp className="w-3.5 h-3.5 fill-blue" />
                                  </div>
                                  <span>{likesCount} lượt thích</span>
                                </div>
                                <div className="flex items-center gap-3 font-medium">
                                  <span>{commentsCount} bình luận</span>
                                  <span>0 chia sẻ</span>
                                </div>
                              </div>

                              <div className="grid grid-cols-3 gap-1 pt-1.5 select-none">
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
                                <button className="flex items-center justify-center gap-2 py-2 rounded-xl hover:bg-grey/5 dark:hover:bg-zinc-800/50 active:scale-[0.98] transition text-grey-hover dark:text-zinc-300 font-bold text-sm border-0 cursor-pointer bg-transparent">
                                  <Share2 className="w-5 h-5" />
                                  <span>Chia sẻ</span>
                                </button>
                              </div>

                              {isCommentsOpen && (
                                <div className="mt-4 border-t border-grey/10 dark:border-zinc-800 pt-4 space-y-4 animate-in fade-in duration-200">

                                  {comments.length === 0 ? (
                                    <div className="text-center py-5 text-grey dark:text-zinc-500 text-xs sm:text-sm select-none">
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
                                                <div className="bg-grey/10 dark:bg-zinc-850 rounded-2xl px-3.5 py-2 inline-block max-w-full">
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
                                                            <div className="bg-grey/10 dark:bg-zinc-850 rounded-2xl px-3 py-1.5 inline-block max-w-full">
                                                              <h5 
                                                                onClick={() => router.push(`/user/${rAuthor._id || rAuthor.id}`)}
                                                                className="text-[11px] font-bold text-grey-hover dark:text-zinc-200 hover:underline cursor-pointer truncate mb-0.5"
                                                              >
                                                                {rAuthorName}
                                                              </h5>
                                                              <p className="text-sm text-gray-800 dark:text-zinc-200 whitespace-pre-wrap break-words text-justify leading-normal">
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

                  {/* Right Column - Sidebar Widgets */}
                  <div className="lg:col-span-4 space-y-5">
                    
                    {/* Recent Media Widget */}
                    {recentPhotos.length > 0 && (
                      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-grey/20 dark:border-zinc-800 shadow-sm p-4 text-left space-y-4">
                        <h3 className="font-extrabold text-sm text-slate-850 dark:text-white tracking-wide uppercase">
                          File phương tiện mới đây
                        </h3>
                        <div className="grid grid-cols-2 gap-2">
                          {recentPhotos.map((photo, index) => (
                            <div key={index} className="aspect-square bg-slate-100 dark:bg-[#18191a] rounded-lg overflow-hidden border border-slate-200 dark:border-[#3e4042]/40 relative group">
                              <img src={photo} alt="Recent media" className="w-full h-full object-cover group-hover:scale-105 transition duration-200" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                </>
              )}

              {/* Members tab view */}
              {activeTab === 'members' && (
                <div className="lg:col-span-12">
                  <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-grey/20 dark:border-zinc-800 shadow-sm p-6 text-left max-w-2xl mx-auto space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-black text-slate-850 dark:text-white">Thành viên ({group.members?.length || 0})</h2>
                    </div>

                    {/* Search Member input */}
                    <div className="relative">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 dark:text-[#b0b3b8]" />
                      <input
                        type="text"
                        placeholder="Tìm thành viên"
                        value={memberSearchQuery}
                        onChange={(e) => setMemberSearchQuery(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-[#18191a] border border-slate-200 dark:border-[#3e4042] rounded-full pl-10 pr-4 py-2.5 text-sm text-slate-850 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue placeholder-slate-400 dark:placeholder-[#b0b3b8] font-semibold"
                      />
                    </div>

                    <div className="divide-y divide-grey/10 dark:divide-zinc-800">
                      {group.members
                        ?.filter((m: any) => m.username?.toLowerCase().includes(memberSearchQuery.toLowerCase()))
                        .map((m: any) => {
                           const isMemberAdmin = group?.admin?._id 
                            ? (m._id === group.admin._id || m._id === group.admin)
                            : (m._id === group.admin);
                          const isSelf = m._id === currentUser?._id || m._id === currentUser?.id;

                        return (
                          <div key={m._id} className="py-4 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <div className="w-11 h-11 rounded-full overflow-hidden bg-slate-100 border border-slate-200 dark:border-[#3e4042]/60">
                                  {m.avatar ? (
                                    <img src={m.avatar} alt={m.username} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full bg-blue-100/10 text-blue flex items-center justify-center font-bold">
                                      {m.username?.charAt(0).toUpperCase()}
                                    </div>
                                  )}
                                </div>
                                {m.isOnline && (
                                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green border-2 border-white dark:border-[#242526] rounded-full"></span>
                                )}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-extrabold text-sm text-slate-850 dark:text-white hover:underline cursor-pointer">
                                    {m.username}
                                  </span>
                                  {isSelf && (
                                    <span className="text-[9px] bg-slate-100 dark:bg-[#3a3b3c] text-slate-600 dark:text-[#b0b3b8] font-bold px-1.5 py-0.5 rounded">
                                      BẠN
                                    </span>
                                  )}
                                </div>
                                <span className="text-[11px] text-slate-500 dark:text-[#b0b3b8] font-semibold">
                                  {isMemberAdmin ? 'Trưởng nhóm' : 'Thành viên'}
                                </span>
                              </div>
                            </div>

                            {/* Admin actions */}
                            {isAdmin && !isMemberAdmin && (
                              <button
                                onClick={() => handleRemoveMember(m._id, m.username)}
                                className="px-3 py-1.5 bg-red/10 hover:bg-red/20 text-red text-xs font-bold rounded-lg border-none transition cursor-pointer"
                                title="Xóa khỏi nhóm"
                              >
                                Xóa thành viên
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Join Requests tab view */}
              {activeTab === 'join_requests' && (
                <div className="lg:col-span-12">
                  <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-grey/20 dark:border-zinc-800 shadow-sm p-6 text-left max-w-2xl mx-auto space-y-6">
                    <div>
                      <h2 className="text-xl font-black text-slate-850 dark:text-white">Yêu cầu tham gia ({joinRequests.length})</h2>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 font-semibold">Phê duyệt thành viên mới xin vào nhóm.</p>
                    </div>

                    {loadingRequests ? (
                      <div className="py-8 flex flex-col items-center gap-2 justify-center">
                        <Loader2 className="w-6 h-6 text-blue animate-spin" />
                        <span className="text-xs text-slate-500 dark:text-zinc-400 font-bold">Đang tải yêu cầu...</span>
                      </div>
                    ) : joinRequests.length === 0 ? (
                      <div className="py-12 text-center text-slate-500 dark:text-zinc-400">
                        <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                        <span className="text-sm font-bold">Không có yêu cầu nào đang chờ duyệt.</span>
                      </div>
                    ) : (
                      <div className="divide-y divide-grey/10 dark:divide-zinc-800">
                        {joinRequests.map((req: any) => {
                          const user = req.user || req;
                          const username = user.username || 'Người dùng';
                          const avatar = user.avatar || '';
                          
                          return (
                            <div key={user._id} className="py-4 flex items-center justify-between gap-4">
                              <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-full overflow-hidden bg-slate-100 border border-slate-200 dark:border-[#3e4042]/60">
                                  {avatar ? (
                                    <img src={avatar} alt={username} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full bg-blue-100/10 text-blue flex items-center justify-center font-bold">
                                      {username.charAt(0).toUpperCase()}
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <span className="font-extrabold text-sm text-slate-850 dark:text-white hover:underline cursor-pointer">
                                    {username}
                                  </span>
                                  <span className="block text-[10px] text-slate-500 dark:text-zinc-400 font-semibold mt-0.5">
                                    Muốn tham gia nhóm
                                  </span>
                                </div>
                              </div>

                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleActionJoinRequest(user._id, 'approve')}
                                  className="px-3 py-1.5 bg-blue/10 hover:bg-blue/20 text-[#1877f2] text-xs font-bold rounded-lg border-none transition cursor-pointer"
                                >
                                  Chấp nhận
                                </button>
                                <button
                                  onClick={() => handleActionJoinRequest(user._id, 'reject')}
                                  className="px-3 py-1.5 bg-red/10 hover:bg-red/20 text-red text-xs font-bold rounded-lg border-none transition cursor-pointer"
                                >
                                  Từ chối
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'pending_posts' && (
                <div className="lg:col-span-12">
                  <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-grey/20 dark:border-zinc-800 shadow-sm p-6 text-left max-w-2xl mx-auto space-y-6">
                    <div>
                      <h2 className="text-xl font-black text-slate-850 dark:text-white">Bài viết chờ duyệt ({pendingPosts.length})</h2>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 font-semibold">Phê duyệt hoặc từ chối bài viết của thành viên trước khi hiển thị công khai.</p>
                    </div>

                    {loadingPendingPosts ? (
                      <div className="py-8 flex flex-col items-center gap-2 justify-center">
                        <Loader2 className="w-6 h-6 text-blue animate-spin" />
                        <span className="text-xs text-slate-500 dark:text-zinc-400 font-bold">Đang tải bài viết...</span>
                      </div>
                    ) : pendingPosts.length === 0 ? (
                      <div className="py-12 text-center text-slate-500 dark:text-zinc-400">
                        <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
                        <span className="text-sm font-bold">Không có bài viết nào đang chờ duyệt.</span>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {pendingPosts.map((post: any) => {
                          const author = post.author || {};
                          const authorName = author.username || 'Người dùng';
                          const authorAvatar = author.avatar || '';
                          const timeAgoStr = formatTimeAgo(post.createdAt);
                          const content = post.content || '';
                          
                          return (
                            <div key={post._id} className="bg-slate-50 dark:bg-zinc-850 rounded-2xl border border-slate-250 dark:border-zinc-800 p-4 relative transition-colors duration-200 text-left space-y-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full overflow-hidden border border-grey/10 dark:border-zinc-800 bg-grey/5 dark:bg-zinc-800 flex-shrink-0 flex items-center justify-center">
                                    {authorAvatar ? (
                                      <img src={authorAvatar} alt={authorName} className="w-full h-full object-cover" />
                                    ) : (
                                      <User className="w-5 h-5 text-grey dark:text-zinc-400" />
                                    )}
                                  </div>
                                  <div className="flex flex-col">
                                    <h3 className="font-bold text-grey-hover dark:text-zinc-200 text-sm">
                                      {authorName}
                                    </h3>
                                    <span className="text-xs text-grey dark:text-zinc-400 font-medium">{timeAgoStr}</span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1 text-[11px] font-bold text-[#f7b928] bg-yellow-550/10 px-2 py-1 rounded-full">
                                  <Clock className="w-3.5 h-3.5" />
                                  <span>Chờ duyệt</span>
                                </div>
                              </div>

                              <div className="text-slate-800 dark:text-zinc-200 text-sm leading-relaxed whitespace-pre-wrap text-justify">
                                {content}
                              </div>

                              {renderPostImages(post)}

                              <div className="border-t border-grey/10 dark:border-zinc-800 pt-3 flex justify-end gap-2.5">
                                <button
                                  onClick={() => handleActionPendingPost(post._id, 'approve')}
                                  className="px-4 py-2 bg-[#1877f2] hover:bg-[#156bec] text-white text-xs font-bold rounded-lg border-none transition cursor-pointer flex items-center gap-1.5"
                                >
                                  <Check className="w-4 h-4" />
                                  Phê duyệt
                                </button>
                                <button
                                  onClick={() => handleActionPendingPost(post._id, 'reject')}
                                  className="px-4 py-2 bg-red/10 hover:bg-red/20 text-red text-xs font-bold rounded-lg border-none transition cursor-pointer flex items-center gap-1.5"
                                >
                                  <X className="w-4 h-4" />
                                  Từ chối
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>

      </div>

      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            ></motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl relative z-10 border border-grey/20 dark:border-zinc-800 flex flex-col max-h-[90vh]"
            >

              <div className="p-4 border-b border-grey/10 dark:border-zinc-800 flex items-center justify-between text-center">
                <div className="w-8"></div>
                <h3 className="text-base font-extrabold text-slate-850 dark:text-white">Tạo bài viết</h3>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-[#3a3b3c] rounded-full text-slate-500 dark:text-[#b0b3b8] transition border-none cursor-pointer bg-transparent"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 overflow-y-auto space-y-4 flex-1 text-left">

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 flex-shrink-0">
                    {currentUser?.avatar ? (
                      <img src={currentUser.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-blue-100/10 text-blue flex items-center justify-center">
                        <User className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-850 dark:text-white">{currentUser?.username}</h4>
                    <span className="inline-block mt-0.5 px-2 py-0.5 bg-slate-100 dark:bg-[#3a3b3c] text-slate-600 dark:text-[#b0b3b8] text-[10px] font-bold rounded">
                      Đăng trong: {group?.name}
                    </span>
                  </div>
                </div>

                <textarea
                  rows={4}
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder={`Bạn đang nghĩ gì trong nhóm ${group?.name}?`}
                  className="w-full border-0 focus:ring-0 resize-none font-semibold text-sm text-slate-850 dark:text-white bg-transparent placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none"
                />

                {newPostPreviews.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {newPostPreviews.map((preview, idx) => (
                      <div key={idx} className="relative aspect-video rounded-xl overflow-hidden bg-slate-50 dark:bg-[#18191a] border border-slate-200 dark:border-[#3e4042]/50">
                        <img src={preview} alt="preview" className="w-full h-full object-cover" />
                        <button
                          onClick={() => handleRemovePreview(idx)}
                          className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/85 rounded-full text-white transition border-none cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-grey/10 dark:border-zinc-800 space-y-3">

                <div className="border border-slate-200 dark:border-[#3e4042] rounded-lg p-3 flex items-center justify-between bg-slate-50 dark:bg-[#18191a]">
                  <span className="text-xs font-extrabold text-slate-850 dark:text-white">Thêm vào bài viết của bạn</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-[#3a3b3c] rounded-full transition bg-transparent border-0 cursor-pointer text-[#45bd62]"
                      title="Ảnh/Video"
                    >
                      <ImageIcon className="w-5 h-5" />
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleSelectImages}
                      multiple
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                </div>

                <button
                  onClick={handleCreatePost}
                  disabled={isPosting || (!newPostContent.trim() && newPostImages.length === 0)}
                  className="w-full py-2.5 bg-[#1877f2] hover:bg-[#156bec] disabled:opacity-50 disabled:hover:bg-[#1877f2] text-white text-sm font-extrabold rounded-lg transition border-0 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {isPosting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  <span>Đăng</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditModalOpen(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            ></motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl relative z-10 border border-grey/20 dark:border-zinc-800 p-5 space-y-5 text-left"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-slate-850 dark:text-white flex items-center gap-2">
                  <Settings className="w-5 h-5 text-blue" />
                  Cài đặt nhóm
                </h3>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-[#3a3b3c] rounded-full text-slate-500 dark:text-[#b0b3b8] transition border-none cursor-pointer bg-transparent"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateGroup} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-slate-500 dark:text-[#b0b3b8] uppercase tracking-wider block">
                    Tên nhóm
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Nhập tên nhóm mới"
                    className="w-full bg-slate-50 dark:bg-[#18191a] border border-slate-200 dark:border-[#3e4042] rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-850 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-slate-500 dark:text-[#b0b3b8] uppercase tracking-wider block">
                    Mô tả nhóm
                  </label>
                  <textarea
                    rows={3}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Mô tả nhóm hoạt động"
                    className="w-full bg-slate-50 dark:bg-[#18191a] border border-slate-200 dark:border-[#3e4042] rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-850 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-slate-500 dark:text-[#b0b3b8] uppercase tracking-wider block">
                    URL Ảnh đại diện
                  </label>
                  <input
                    type="url"
                    value={editAvatar}
                    onChange={(e) => setEditAvatar(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                    className="w-full bg-slate-50 dark:bg-[#18191a] border border-slate-200 dark:border-[#3e4042] rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-850 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue"
                  />
                </div>

                <div className="flex gap-2 pt-4 border-t border-grey/10 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={handleDeleteGroup}
                    className="px-4 py-2.5 bg-red/10 hover:bg-red/15 text-red font-bold text-xs rounded-lg transition border-none cursor-pointer flex items-center gap-1.5"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Giải tán nhóm</span>
                  </button>

                  <div className="flex-1 flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setIsEditModalOpen(false)}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-[#3a3b3c] dark:hover:bg-[#4e4f50] dark:text-white font-bold text-xs rounded-lg transition border-none cursor-pointer"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={isUpdating}
                      className="px-4 py-2.5 bg-blue hover:bg-blue-hover disabled:opacity-50 text-white font-extrabold text-xs rounded-lg transition border-none cursor-pointer flex items-center gap-1.5 shadow-md shadow-blue/20"
                    >
                      {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                      <span>Lưu thay đổi</span>
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {activeLightboxPost && (() => {
        const post = posts.find(p => p._id === activeLightboxPost._id) || activeLightboxPost;
        const images = post.images || [];
        const activeImageUrl = images[activeLightboxImageIdx] || '';

        const author = post.author || {};
        const authorName = author.username || 'Người dùng';
        const authorAvatar = author.avatar || '';
        const timeAgoStr = formatTimeAgo(post.createdAt);

        const currentUserId = currentUser?._id || currentUser?.id;
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
                      className="font-bold text-grey-hover dark:text-zinc-200 hover:underline cursor-pointer text-sm sm:text-base"
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
                  <div className="text-slate-800 dark:text-zinc-200 text-sm leading-relaxed whitespace-pre-wrap text-justify pb-3 border-b border-grey/10 dark:border-zinc-800">
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
                                <div className="bg-grey/10 dark:bg-zinc-850 rounded-2xl px-3 py-1.5 inline-block max-w-full">
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
                                
                                <div className="flex items-center gap-3.5 text-[10px] sm:text-xs text-grey dark:text-zinc-400 mt-0.5 pl-2 select-none font-semibold">
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
                                    className={`hover:text-blue hover:underline flex items-center gap-1 transition bg-transparent border-0 cursor-pointer font-bold ${cHasLiked ? 'text-blue font-bold' : 'text-grey dark:text-zinc-400'}`}
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
                                            <div className="bg-grey/10 dark:bg-zinc-850 rounded-2xl px-3 py-1.5 inline-block max-w-full">
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
                                                className={`hover:text-blue hover:underline flex items-center gap-1 transition bg-transparent border-0 cursor-pointer font-bold ${rHasLiked ? 'text-blue font-bold' : 'text-grey dark:text-zinc-400'}`}
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
                    <img src={currentUser?.avatar || '/assets/avatar/avatar.jpg'} className="w-full h-full object-cover" />
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
                      className="flex-1 px-4 py-2 bg-grey/10 dark:bg-zinc-800 rounded-2xl border-0 focus:ring-2 focus:ring-blue focus:bg-white dark:focus:bg-zinc-900 transition outline-none text-sm text-zinc-900 dark:text-zinc-200 font-medium placeholder-gray-500 dark:placeholder-zinc-500 resize-none h-[38px] max-h-[120px] overflow-y-auto leading-normal py-2"
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

    </div>
  );
}
