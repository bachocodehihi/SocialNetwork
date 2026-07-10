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
  Search, MoreHorizontal, Share2, ChevronDown, Smile, FileText
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

  // Tabs state: 'discussion' | 'about' | 'members'
  const [activeTab, setActiveTab] = useState<'discussion' | 'about' | 'members'>('discussion');
  const [memberSearchQuery, setMemberSearchQuery] = useState('');

  // Edit settings state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Create post modal state (FB style modal)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostImages, setNewPostImages] = useState<File[]>([]);
  const [newPostPreviews, setNewPostPreviews] = useState<string[]>([]);
  const [isPosting, setIsPosting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Comments state
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [commentSectionOpen, setCommentSectionOpen] = useState<Record<string, boolean>>({});

  // Dropdown states
  const [isJoinedDropdownOpen, setIsJoinedDropdownOpen] = useState(false);

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
        // Load User
        const profile = await authService.getProfile();
        setCurrentUser(profile);

        // Load Group
        const res = await groupService.getGroupById(id);
        if (res.success && res.data) {
          setGroup(res.data);
          setEditName(res.data.name);
          setEditDescription(res.data.description || '');
          setEditAvatar(res.data.avatar || '');
        } else {
          showError('Không tìm thấy thông tin nhóm.');
          router.push('/home/contact/friend');
        }
      } catch (err: any) {
        console.error('Lỗi tải nhóm:', err);
        showError('Không thể truy cập nhóm này. Bạn có thể không phải thành viên.');
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
        console.error('Lỗi tải bài viết nhóm:', err);
      } finally {
        setLoadingPosts(false);
      }
    };

    fetchPosts();
  }, [groupId]);

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
        setPosts(prev => [res.post, ...prev]);
        setNewPostContent('');
        setNewPostImages([]);
        setNewPostPreviews([]);
        setIsCreateModalOpen(false);
        showSuccess('Đã đăng bài viết thành công!');
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

  const isAdmin = group?.admin?._id === currentUser?._id;

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
                
                <p className="text-sm text-slate-500 dark:text-[#b0b3b8] font-semibold flex items-center gap-1">
                  <Globe className="w-4 h-4 text-slate-500 dark:text-[#b0b3b8]" />
                  <span>Nhóm Công khai</span>
                  <span>·</span>
                  <span className="text-slate-900 dark:text-white font-bold">{group.members?.length || 0} thành viên</span>
                </p>

                {/* Overlapping Members Avatars */}
                {group.members && group.members.length > 0 && (
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
                            <button
                              onClick={() => {
                                setIsJoinedDropdownOpen(false);
                                setIsEditModalOpen(true);
                              }}
                              className="w-full text-left px-4 py-3 hover:bg-slate-100 dark:hover:bg-[#3a3b3c] text-slate-800 dark:text-white text-xs font-bold transition flex items-center gap-2 border-none bg-transparent cursor-pointer"
                            >
                              <Settings className="w-4 h-4" />
                              <span>Cài đặt nhóm</span>
                            </button>
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

              </div>

            </div>

            {/* Navigation Tabs (Facebook Style) */}
            <div className="px-4 flex items-center gap-1 overflow-x-auto text-slate-500 dark:text-[#b0b3b8]">
              {[
                { id: 'discussion', label: 'Thảo luận' },
                { id: 'members', label: 'Mọi người' }
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-4 py-4 text-sm font-bold border-b-4 transition cursor-pointer bg-transparent border-none ${
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

          </div>
        </div>

        {/* Content Body Grid */}
        <div className="w-full max-w-6xl px-4 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Discussion tab (Feed + Sidebar) */}
            {activeTab === 'discussion' && (
              <>
                {/* Left Column - Main Feed */}
                <div className={`${recentPhotos.length > 0 ? 'lg:col-span-8' : 'lg:col-span-12 max-w-3xl mx-auto'} w-full space-y-5`}>
                  
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
                        const hasLiked = post.likes?.includes(currentUser?._id || currentUser?.id);
                        const isCommentOpen = commentSectionOpen[post._id];

                        return (
                          <div 
                            key={post._id} 
                            className="bg-white dark:bg-zinc-900 rounded-2xl border border-grey/20 dark:border-zinc-800 shadow-sm p-4 space-y-4 text-left"
                          >
                            {/* Author Info */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200 dark:border-[#3e4042]">
                                  {post.author?.avatar ? (
                                    <img src={post.author.avatar} alt="Author" className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full bg-blue-100/10 text-blue flex items-center justify-center">
                                      <User className="w-5 h-5" />
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <h4 className="font-extrabold text-sm text-slate-850 dark:text-white hover:underline cursor-pointer">
                                    {post.author?.username || 'Ẩn danh'}
                                  </h4>
                                  <span className="text-[11px] text-slate-500 dark:text-[#b0b3b8] font-medium">
                                    {new Date(post.createdAt).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Content */}
                            {post.content && (
                              <p className="text-sm text-slate-800 dark:text-[#e4e6eb] leading-relaxed font-semibold whitespace-pre-line">
                                {post.content}
                              </p>
                            )}

                            {/* Images Grid */}
                            {post.images && post.images.length > 0 && (
                              <div className={`grid gap-2 rounded-xl overflow-hidden ${
                                post.images.length === 1 ? 'grid-cols-1' : post.images.length === 2 ? 'grid-cols-2' : 'grid-cols-3'
                              }`}>
                                {post.images.map((img: string, idx: number) => (
                                  <div key={idx} className="relative aspect-video bg-slate-100 dark:bg-[#18191a] border border-slate-200 dark:border-[#3e4042]/20 overflow-hidden">
                                    <img src={img} alt="Post content" className="w-full h-full object-cover" />
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Stats */}
                            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 font-bold border-y border-grey/10 dark:border-zinc-800 py-3">
                              <span className="flex items-center gap-1.5">
                                <ThumbsUp className={`w-4 h-4 ${hasLiked ? 'text-[#1877f2] fill-[#1877f2]' : 'text-slate-500 dark:text-[#b0b3b8]'}`} />
                                {post.likes?.length || 0} lượt thích
                              </span>
                              <span className="cursor-pointer hover:underline flex items-center gap-1.5" onClick={() => setCommentSectionOpen(p => ({ ...p, [post._id]: !p[post._id] }))}>
                                <MessageCircle className="w-4 h-4 text-slate-500 dark:text-[#b0b3b8]" />
                                {post.comments?.length || 0} bình luận
                              </span>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-4 border-b border-grey/10 dark:border-zinc-800 pb-2">
                              <button
                                onClick={() => handleLikePost(post._id)}
                                className={`flex-1 py-2 hover:bg-slate-100 dark:hover:bg-[#3a3b3c] rounded-lg transition text-xs font-bold flex items-center justify-center gap-2 border-0 cursor-pointer bg-transparent ${
                                  hasLiked ? 'text-[#1877f2]' : 'text-slate-600 dark:text-[#b0b3b8]'
                                }`}
                              >
                                <ThumbsUp className="w-4 h-4" />
                                <span>Thích</span>
                              </button>
                              <button
                                onClick={() => setCommentSectionOpen(p => ({ ...p, [post._id]: !p[post._id] }))}
                                className="flex-1 py-2 hover:bg-slate-100 dark:hover:bg-[#3a3b3c] rounded-lg transition text-xs font-bold text-slate-600 dark:text-[#b0b3b8] flex items-center justify-center gap-2 border-0 cursor-pointer bg-transparent"
                              >
                                <MessageCircle className="w-4 h-4" />
                                <span>Bình luận</span>
                              </button>
                            </div>

                            {/* Comments Section */}
                            {isCommentOpen && (
                              <div className="pt-2 space-y-4">
                                {/* Write Comment */}
                                <div className="flex gap-3">
                                  <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 flex-shrink-0">
                                    {currentUser?.avatar ? (
                                      <img src={currentUser.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="w-full h-full bg-blue-100/10 text-blue flex items-center justify-center">
                                        <User className="w-4 h-4" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1 flex gap-2">
                                    <input
                                      type="text"
                                      placeholder="Viết bình luận..."
                                      value={commentInputs[post._id] || ''}
                                      onChange={(e) => setCommentInputs(prev => ({ ...prev, [post._id]: e.target.value }))}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleAddComment(post._id);
                                      }}
                                      className="flex-1 bg-slate-100 dark:bg-[#3a3b3c] border-0 rounded-xl px-4 py-2 text-xs font-medium text-slate-850 dark:text-white focus:outline-none placeholder-slate-400 dark:placeholder-[#b0b3b8] focus:ring-1 focus:ring-blue"
                                    />
                                    <button
                                      onClick={() => handleAddComment(post._id)}
                                      className="p-2 bg-blue hover:bg-blue-hover text-white rounded-xl transition border-none cursor-pointer"
                                    >
                                      <Check className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>

                                {/* Comments List */}
                                {post.comments && post.comments.length > 0 && (
                                  <div className="space-y-3 pl-2">
                                    {post.comments.map((c: any) => (
                                      <div key={c._id} className="flex gap-3 text-left">
                                        <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 flex-shrink-0">
                                          {c.author?.avatar ? (
                                            <img src={c.author.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                          ) : (
                                            <div className="w-full h-full bg-blue-100/10 text-blue flex items-center justify-center">
                                              <User className="w-4 h-4" />
                                            </div>
                                          )}
                                        </div>
                                        <div className="flex-1 bg-slate-100 dark:bg-[#3a3b3c] rounded-2xl px-4 py-2.5 max-w-max">
                                          <div className="flex items-center gap-2">
                                            <span className="font-extrabold text-xs text-slate-850 dark:text-white hover:underline cursor-pointer">
                                              {c.author?.username || 'Ẩn danh'}
                                            </span>
                                          </div>
                                          <p className="text-xs text-slate-750 dark:text-[#e4e6eb] mt-1 font-semibold leading-relaxed">
                                            {c.content}
                                          </p>
                                        </div>
                                      </div>
                                    ))}
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
                        const isMemberAdmin = m._id === group.admin?._id;
                        const isSelf = m._id === currentUser?._id;

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

          </div>
        </div>

      </div>

      {/* FB Style Create Post Modal */}
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
              {/* Modal Header */}
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

              {/* Modal Body */}
              <div className="p-4 overflow-y-auto space-y-4 flex-1 text-left">
                {/* User details */}
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

                {/* Text area */}
                <textarea
                  rows={4}
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder={`Bạn đang nghĩ gì trong nhóm ${group?.name}?`}
                  className="w-full border-0 focus:ring-0 resize-none font-semibold text-sm text-slate-850 dark:text-white bg-transparent placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none"
                />

                {/* Image Previews */}
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

              {/* Modal Footer */}
              <div className="p-4 border-t border-grey/10 dark:border-zinc-800 space-y-3">
                {/* Actions widget */}
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

                {/* Submit button */}
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

      {/* Edit Group Settings Modal */}
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

    </div>
  );
}
