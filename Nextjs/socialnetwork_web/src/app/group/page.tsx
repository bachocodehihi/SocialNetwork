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
  Check, LogOut, Edit3, AlertTriangle, ArrowLeft
} from 'lucide-react';
import Navbar from '../../components/Navbar';
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

  // Edit settings state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Create post state
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostImages, setNewPostImages] = useState<File[]>([]);
  const [newPostPreviews, setNewPostPreviews] = useState<string[]>([]);
  const [isPosting, setIsPosting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Comments state
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [commentSectionOpen, setCommentSectionOpen] = useState<Record<string, boolean>>({});

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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-blue animate-spin" />
          <p className="text-grey font-bold text-sm">Đang tải trang nhóm...</p>
        </div>
      </div>
    );
  }

  const isAdmin = group?.admin?._id === currentUser?._id;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans dark:bg-zinc-950">
      <Navbar />

      <main className="flex-1 pt-16 pb-12">
        {/* Banner/Header */}
        <div className="relative w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 h-64 md:h-80 shadow-inner flex items-end">
          <div className="absolute inset-0 bg-black/15"></div>
          
          <button 
            onClick={() => router.push('/home/contact/friend')}
            className="absolute top-6 left-6 z-10 p-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full border border-white/10 text-white transition cursor-pointer"
            title="Quay lại"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="w-full max-w-6xl mx-auto px-4 pb-6 flex flex-col md:flex-row items-center md:items-end gap-6 relative z-10">
            {/* Avatar */}
            <div className="w-28 h-28 md:w-36 md:h-36 rounded-full border-4 border-white bg-slate-200 overflow-hidden shadow-xl flex-shrink-0 relative group">
              {group.avatar ? (
                <img src={group.avatar} alt={group.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-blue-100 text-blue flex items-center justify-center font-black text-4xl">
                  <Users className="w-14 h-14 md:w-16 md:h-16" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left text-white space-y-2">
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight drop-shadow-sm">
                {group.name}
              </h1>
              {group.description && (
                <p className="text-sm md:text-base text-white/80 max-w-2xl line-clamp-2 leading-relaxed">
                  {group.description}
                </p>
              )}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-semibold text-white/90">
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {group.members?.length || 0} thành viên
                </span>
                <span className="w-1.5 h-1.5 bg-white/50 rounded-full"></span>
                <span className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  Trưởng nhóm: <span className="underline">{group.admin?.username || 'Ẩn danh'}</span>
                </span>
              </div>
            </div>

            {/* Top level actions */}
            <div className="flex items-center gap-2 mt-4 md:mt-0 flex-shrink-0">
              <button
                onClick={() => router.push(`/home/message?groupId=${group._id}`)}
                className="px-5 py-3 rounded-xl bg-blue hover:bg-blue-hover text-white font-extrabold text-sm flex items-center gap-2 transition cursor-pointer border-none shadow-md"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Nhắn tin nhóm</span>
              </button>
              
              <button
                onClick={() => router.push(`/group/invite?groupId=${group._id}`)}
                className="px-5 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-extrabold text-sm flex items-center gap-2 transition cursor-pointer border-none shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Mời bạn bè</span>
              </button>

              {isAdmin ? (
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="p-3 rounded-xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm border border-white/20 transition cursor-pointer"
                  title="Cài đặt nhóm"
                >
                  <Settings className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={handleLeaveGroup}
                  className="p-3 rounded-xl bg-red/10 hover:bg-red/20 text-red border border-red/20 transition cursor-pointer"
                  title="Rời nhóm"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-6xl mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Feed Column */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Create Post Widget */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-slate-200/80 dark:border-zinc-800 p-5">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 flex-shrink-0">
                  {currentUser?.avatar ? (
                    <img src={currentUser.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-blue/10 text-blue flex items-center justify-center">
                      <User className="w-5 h-5" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <textarea
                    rows={2}
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    placeholder={`Bạn đang nghĩ gì trong nhóm ${group.name}?`}
                    className="w-full border-0 focus:ring-0 resize-none font-medium text-sm text-black dark:text-white dark:bg-transparent placeholder-slate-400 focus:outline-none"
                  />

                  {/* Previews */}
                  {newPostPreviews.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      {newPostPreviews.map((preview, idx) => (
                        <div key={idx} className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                          <img src={preview} alt="preview" className="w-full h-full object-cover" />
                          <button
                            onClick={() => handleRemovePreview(idx)}
                            className="absolute top-1.5 right-1.5 p-1 bg-black/60 hover:bg-black/80 rounded-full text-white transition border-none cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between border-t border-slate-100 dark:border-zinc-800 pt-4 mt-3">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue dark:text-zinc-400 transition bg-transparent border-0 cursor-pointer"
                    >
                      <ImageIcon className="w-5 h-5 text-green-500" />
                      <span>Ảnh/Video</span>
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleSelectImages}
                      multiple
                      accept="image/*"
                      className="hidden"
                    />

                    <button
                      onClick={handleCreatePost}
                      disabled={isPosting || (!newPostContent.trim() && newPostImages.length === 0)}
                      className="px-5 py-2 bg-blue hover:bg-blue-hover disabled:opacity-50 disabled:hover:bg-blue text-white text-xs font-extrabold rounded-lg transition border-0 cursor-pointer flex items-center gap-1.5 shadow-sm"
                    >
                      {isPosting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                      <span>Đăng bài</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Group Feed list */}
            {loadingPosts ? (
              <div className="py-16 flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 text-blue animate-spin" />
                <p className="text-xs text-grey font-bold">Đang tải bài viết...</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-12 text-center text-grey">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-30 text-slate-400" />
                <h3 className="font-bold text-slate-800 dark:text-white">Chưa có bài viết nào</h3>
                <p className="text-xs text-grey dark:text-zinc-500 mt-1 max-w-sm mx-auto">Hãy là người đầu tiên chia sẻ thông tin hoặc hình ảnh trong nhóm này!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {posts.map((post) => {
                  const hasLiked = post.likes?.includes(currentUser?._id || currentUser?.id);
                  const isCommentOpen = commentSectionOpen[post._id];

                  return (
                    <div 
                      key={post._id} 
                      className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-slate-200/80 dark:border-zinc-800 p-5 space-y-4"
                    >
                      {/* Author Info */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-100">
                            {post.author?.avatar ? (
                              <img src={post.author.avatar} alt="Author" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-blue/10 text-blue flex items-center justify-center">
                                <User className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                          <div>
                            <h4 className="font-extrabold text-sm text-black dark:text-white hover:underline cursor-pointer">
                              {post.author?.username || 'Ẩn danh'}
                            </h4>
                            <span className="text-[10px] text-grey dark:text-zinc-400 font-medium">
                              {new Date(post.createdAt).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      {post.content && (
                        <p className="text-sm text-slate-800 dark:text-zinc-200 leading-relaxed font-medium whitespace-pre-line">
                          {post.content}
                        </p>
                      )}

                      {/* Images Grid */}
                      {post.images && post.images.length > 0 && (
                        <div className={`grid gap-2 rounded-xl overflow-hidden ${
                          post.images.length === 1 ? 'grid-cols-1' : post.images.length === 2 ? 'grid-cols-2' : 'grid-cols-3'
                        }`}>
                          {post.images.map((img: string, idx: number) => (
                            <div key={idx} className="relative aspect-video bg-slate-100 border border-slate-100 overflow-hidden">
                              <img src={img} alt="Post content" className="w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Stats */}
                      <div className="flex items-center justify-between text-xs text-grey dark:text-zinc-400 font-bold border-y border-slate-100 dark:border-zinc-800 py-3">
                        <span className="flex items-center gap-1.5">
                          <ThumbsUp className={`w-4 h-4 ${hasLiked ? 'text-blue fill-blue' : 'text-slate-400'}`} />
                          {post.likes?.length || 0} lượt thích
                        </span>
                        <span className="cursor-pointer hover:underline flex items-center gap-1.5" onClick={() => setCommentSectionOpen(p => ({ ...p, [post._id]: !p[post._id] }))}>
                          <MessageCircle className="w-4 h-4 text-slate-400" />
                          {post.comments?.length || 0} bình luận
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-4">
                        <button
                          onClick={() => handleLikePost(post._id)}
                          className={`flex-1 py-2 hover:bg-slate-50 dark:hover:bg-zinc-850 rounded-xl transition text-xs font-bold flex items-center justify-center gap-2 border-0 cursor-pointer bg-transparent ${
                            hasLiked ? 'text-blue' : 'text-slate-500 dark:text-zinc-400'
                          }`}
                        >
                          <ThumbsUp className="w-4 h-4" />
                          <span>Thích</span>
                        </button>
                        <button
                          onClick={() => setCommentSectionOpen(p => ({ ...p, [post._id]: !p[post._id] }))}
                          className="flex-1 py-2 hover:bg-slate-50 dark:hover:bg-zinc-850 rounded-xl transition text-xs font-bold text-slate-500 dark:text-zinc-400 flex items-center justify-center gap-2 border-0 cursor-pointer bg-transparent"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>Bình luận</span>
                        </button>
                      </div>

                      {/* Comments Section */}
                      {isCommentOpen && (
                        <div className="border-t border-slate-100 dark:border-zinc-800 pt-4 space-y-4">
                          {/* Write Comment */}
                          <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 flex-shrink-0">
                              {currentUser?.avatar ? (
                                <img src={currentUser.avatar} alt="Avatar" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-blue/10 text-blue flex items-center justify-center">
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
                                className="flex-1 bg-slate-50 dark:bg-zinc-850 border-0 rounded-xl px-4 py-2 text-xs font-medium text-black dark:text-white focus:outline-none placeholder-slate-400 focus:ring-1 focus:ring-blue"
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
                                      <div className="w-full h-full bg-blue/10 text-blue flex items-center justify-center">
                                        <User className="w-4 h-4" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1 bg-slate-50 dark:bg-zinc-850 rounded-2xl px-4 py-2.5 max-w-max">
                                    <div className="flex items-center gap-2">
                                      <span className="font-extrabold text-xs text-black dark:text-white hover:underline cursor-pointer">
                                        {c.author?.username || 'Ẩn danh'}
                                      </span>
                                    </div>
                                    <p className="text-xs text-slate-800 dark:text-zinc-200 mt-1 font-medium leading-relaxed">
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

          {/* Members / Details Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Group details Card */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-slate-200/80 dark:border-zinc-800 p-5 space-y-4">
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-white uppercase tracking-wider">
                Giới thiệu nhóm
              </h3>
              
              {group.description ? (
                <p className="text-xs text-slate-600 dark:text-zinc-300 font-medium leading-relaxed">
                  {group.description}
                </p>
              ) : (
                <p className="text-xs text-grey dark:text-zinc-500 font-semibold italic">
                  Chưa có mô tả chi tiết cho nhóm này.
                </p>
              )}

              <div className="border-t border-slate-100 dark:border-zinc-800 pt-4 space-y-3 text-xs font-semibold text-slate-700 dark:text-zinc-300">
                <div className="flex justify-between">
                  <span className="text-slate-400 dark:text-zinc-500">Mã mời:</span>
                  <span className="font-mono bg-slate-50 dark:bg-zinc-850 px-2 py-0.5 rounded border border-slate-200/40 text-blue font-extrabold">
                    {group.inviteCode}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 dark:text-zinc-500">Ngày tạo:</span>
                  <span>{new Date(group.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
              </div>
            </div>

            {/* Members List Card */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-slate-200/80 dark:border-zinc-800 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-sm text-slate-800 dark:text-white uppercase tracking-wider">
                  Thành viên ({group.members?.length || 0})
                </h3>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-zinc-800/60 max-h-96 overflow-y-auto pr-1">
                {group.members?.map((m: any) => {
                  const isMemberAdmin = m._id === group.admin?._id;
                  const isSelf = m._id === currentUser?._id;

                  return (
                    <div key={m._id} className="py-3 flex items-center justify-between gap-3 text-left">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative flex-shrink-0">
                          <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-100 border border-slate-200/40">
                            {m.avatar ? (
                              <img src={m.avatar} alt={m.username} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-blue/10 text-blue flex items-center justify-center">
                                <User className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                          {m.isOnline && (
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green border-2 border-white rounded-full"></span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-xs text-slate-850 dark:text-white truncate">
                              {m.username}
                            </span>
                            {isSelf && (
                              <span className="text-[9px] bg-slate-100 dark:bg-zinc-800 text-slate-500 font-extrabold px-1 py-0.2 rounded uppercase">
                                Bạn
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-grey dark:text-zinc-500 font-semibold truncate block">
                            {isMemberAdmin ? 'Trưởng nhóm' : 'Thành viên'}
                          </span>
                        </div>
                      </div>

                      {/* Admin actions over members */}
                      {isAdmin && !isMemberAdmin && (
                        <button
                          onClick={() => handleRemoveMember(m._id, m.username)}
                          className="p-1.5 hover:bg-red/10 text-red rounded-lg transition border-none cursor-pointer bg-transparent opacity-0 hover:opacity-100 group-hover:opacity-100 flex-shrink-0"
                          title="Xóa khỏi nhóm"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* Edit Group Settings Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            ></motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl relative z-10 border border-slate-100 dark:border-zinc-800 p-6 space-y-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-black dark:text-white flex items-center gap-2">
                  <Settings className="w-5 h-5 text-blue" />
                  Cài đặt nhóm
                </h3>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full text-slate-500 transition border-none cursor-pointer bg-transparent"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateGroup} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-slate-500 uppercase tracking-wider block">
                    Tên nhóm
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Nhập tên nhóm mới"
                    className="w-full border border-slate-200 dark:border-zinc-800 dark:bg-zinc-900 rounded-xl px-4 py-3 text-sm font-medium text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-slate-500 uppercase tracking-wider block">
                    Mô tả nhóm
                  </label>
                  <textarea
                    rows={3}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Mô tả nhóm hoạt động"
                    className="w-full border border-slate-200 dark:border-zinc-800 dark:bg-zinc-900 rounded-xl px-4 py-3 text-sm font-medium text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-slate-500 uppercase tracking-wider block">
                    URL Ảnh đại diện
                  </label>
                  <input
                    type="url"
                    value={editAvatar}
                    onChange={(e) => setEditAvatar(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                    className="w-full border border-slate-200 dark:border-zinc-800 dark:bg-zinc-900 rounded-xl px-4 py-3 text-sm font-medium text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue"
                  />
                </div>

                <div className="flex gap-2 pt-4 border-t border-slate-100 dark:border-zinc-850">
                  <button
                    type="button"
                    onClick={handleDeleteGroup}
                    className="px-4 py-3 bg-red/10 hover:bg-red/15 text-red font-bold text-xs rounded-xl transition border-none cursor-pointer flex items-center gap-1.5 shadow-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Giải tán nhóm</span>
                  </button>

                  <div className="flex-1 flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setIsEditModalOpen(false)}
                      className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition border-none cursor-pointer"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={isUpdating}
                      className="px-5 py-3 bg-blue hover:bg-blue-hover disabled:opacity-50 text-white font-extrabold text-xs rounded-xl transition border-none cursor-pointer flex items-center gap-1.5 shadow-md shadow-blue/20"
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
