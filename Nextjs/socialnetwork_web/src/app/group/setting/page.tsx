'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { groupService } from '../../../services/group.service';
import { authService } from '../../../services/auth.service';
import { useAlert } from '../../../components/Alert/alertcontext';
import { 
  ArrowLeft, User, Loader2, Check, Users, FileText, Settings, 
  AlertTriangle, Trash2, Shield, Eye, Compass, ThumbsUp, MessageCircle, 
  Send, ChevronRight, X, Clock, HelpCircle, Upload, Save
} from 'lucide-react';
import Navbar from '../../../components/Navbar';
import Loading from '../../../components/Loading';

export default function GroupSettingPage() {
  const router = useRouter();
  const { showSuccess, showError } = useAlert();

  const [groupId, setGroupId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [group, setGroup] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [avatar, setAvatar] = useState('');
  const [avatarBase64, setAvatarBase64] = useState<string | null>(null);

  // Group settings states
  const [onlyAdminCanPost, setOnlyAdminCanPost] = useState(false);
  const [onlyAdminCanAddMember, setOnlyAdminCanAddMember] = useState(false);
  const [allowMemberInvite, setAllowMemberInvite] = useState(true);

  // Active Settings Tab: 'basic' | 'privacy'
  const [activeTab, setActiveTab] = useState<'basic' | 'privacy'>('basic');

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
          const gData = res.data;
          setGroup(gData);

          // Verify if user is admin
          const isUserAdmin = gData.admin?._id === profile?._id || gData.admin === profile?._id;
          if (!isUserAdmin) {
            showError('Bạn không phải quản trị viên nhóm này.');
            router.push(`/group?groupId=${id}`);
            return;
          }

          // Populate states
          setName(gData.name || '');
          setDescription(gData.description || '');
          setAvatar(gData.avatar || '');
          
          const settings = gData.settings || {};
          setOnlyAdminCanPost(settings.onlyAdminCanPost ?? false);
          setOnlyAdminCanAddMember(settings.onlyAdminCanAddMember ?? false);
          setAllowMemberInvite(settings.allowMemberInvite ?? true);
        } else {
          showError('Không tìm thấy thông tin nhóm.');
          router.push('/home/contact/friend');
        }
      } catch (err: any) {
        console.error('Lỗi tải cài đặt nhóm:', err);
        showError('Không thể tải cài đặt nhóm.');
        router.push('/home/contact/friend');
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, [router]);

  if (loading) {
    return <Loading message="Đang tải cấu hình..." />;
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showError('Kích thước ảnh đại diện tối đa là 2MB!');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Str = reader.result as string;
      setAvatarBase64(base64Str);
      setAvatar(base64Str);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveSettings = async () => {
    if (!groupId) return;
    if (!name.trim()) {
      showError('Tên nhóm không được để trống.');
      return;
    }

    try {
      setIsSaving(true);
      const updateData: any = {
        name: name.trim(),
        description: description.trim(),
        settings: {
          onlyAdminCanPost,
          onlyAdminCanAddMember,
          allowMemberInvite
        }
      };

      if (avatarBase64) {
        updateData.avatar = avatarBase64;
      }

      const res = await groupService.updateGroup(groupId, updateData);
      if (res.success) {
        showSuccess('Cập nhật cài đặt nhóm thành công!');
        // Update local group details
        setGroup(res.group);
      } else {
        showError('Không thể cập nhật cài đặt nhóm.');
      }
    } catch (err) {
      console.error(err);
      showError('Có lỗi xảy ra khi cập nhật cài đặt nhóm.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-zinc-950 text-slate-800 dark:text-white flex flex-col font-sans">
      <Navbar />

      <div className="flex-1 pt-14 flex flex-col md:flex-row items-stretch">
        
        {/* Left Sidebar */}
        <aside className="w-full md:w-80 bg-white dark:bg-zinc-900 border-r border-grey/10 dark:border-zinc-800 flex flex-col p-6 text-left shrink-0">
          {/* Breadcrumb */}
          <div className="text-[11px] font-semibold text-slate-500 dark:text-[#b0b3b8] flex items-center gap-1.5 mb-2 truncate">
            <span className="hover:underline cursor-pointer" onClick={() => router.push(`/group?groupId=${groupId}`)}>{group?.name}</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-800 dark:text-white">Cài đặt nhóm</span>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
            Cài đặt nhóm
          </h2>

          <p className="text-xs text-slate-500 dark:text-[#b0b3b8] leading-relaxed mb-6 font-medium text-justify">
            Quản lý thông tin cơ bản của nhóm và cấu hình các quyền hạn của thành viên khi tham gia hoạt động trong nhóm.
          </p>

          {/* Sidebar Menu Options */}
          <nav className="flex flex-col gap-1.5">
            <button
              onClick={() => setActiveTab('basic')}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl transition font-extrabold text-xs border-none cursor-pointer text-left ${
                activeTab === 'basic' 
                  ? 'bg-blue/10 text-[#1877f2] dark:bg-blue-500/10 dark:text-blue-400' 
                  : 'hover:bg-slate-50 text-slate-700 dark:hover:bg-[#3a3b3c]/50 dark:text-[#b0b3b8] bg-transparent'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeTab === 'basic' ? 'bg-blue text-white' : 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-300'}`}>
                <Settings className="w-4 h-4" />
              </div>
              <span>Thông tin cơ bản</span>
            </button>

            <button
              onClick={() => setActiveTab('privacy')}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl transition font-extrabold text-xs border-none cursor-pointer text-left ${
                activeTab === 'privacy' 
                  ? 'bg-blue/10 text-[#1877f2] dark:bg-blue-500/10 dark:text-blue-400' 
                  : 'hover:bg-slate-50 text-slate-700 dark:hover:bg-[#3a3b3c]/50 dark:text-[#b0b3b8] bg-transparent'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeTab === 'privacy' ? 'bg-blue text-white' : 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-300'}`}>
                <Shield className="w-4 h-4" />
              </div>
              <span>Quyền riêng tư & Quản trị</span>
            </button>
          </nav>
        </aside>

        {/* Right Content Area */}
        <main className="flex-1 bg-slate-50 dark:bg-zinc-950 p-6 overflow-y-auto flex flex-col items-center">
          <div className="w-full max-w-xl space-y-6">
            
            {/* Header Title with Back button */}
            <div className="flex items-center gap-3 border-b border-grey/10 dark:border-zinc-800 pb-4 text-left">
              <button 
                onClick={() => router.push(`/group?groupId=${groupId}`)}
                className="p-2 hover:bg-slate-200 dark:hover:bg-zinc-800 rounded-full transition text-slate-650 dark:text-zinc-300 border-none bg-transparent cursor-pointer flex items-center justify-center"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                  {activeTab === 'basic' ? 'Cài đặt thông tin cơ bản' : 'Cấu hình quyền riêng tư & Quản trị'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  {activeTab === 'basic' ? 'Thay đổi tên nhóm, mô tả và ảnh đại diện nhóm.' : 'Cấu hình quyền đăng bài, phê duyệt thành viên và lời mời.'}
                </p>
              </div>
            </div>

            {/* TAB: Basic Settings Form */}
            {activeTab === 'basic' && (
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-grey/20 dark:border-zinc-800 shadow-sm p-6 space-y-5 text-left">
                {/* Group Avatar Upload */}
                <div className="flex flex-col items-center gap-3 pb-3 border-b border-grey/10 dark:border-zinc-800">
                  <div className="relative w-28 h-28 rounded-full overflow-hidden bg-slate-100 dark:bg-zinc-800 border-4 border-slate-200 dark:border-zinc-700 shadow-inner flex items-center justify-center">
                    {avatar ? (
                      <img src={avatar} alt="Group Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <Users className="w-12 h-12 text-slate-400 dark:text-zinc-500" />
                    )}
                  </div>
                  <label className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-zinc-700 hover:border-blue dark:hover:border-blue rounded-xl bg-slate-50 dark:bg-zinc-800/50 hover:bg-blue/5 text-xs font-bold text-slate-700 dark:text-zinc-300 hover:text-blue transition cursor-pointer">
                    <Upload className="w-4 h-4" />
                    Tải ảnh đại diện mới
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleAvatarChange} 
                      className="hidden" 
                    />
                  </label>
                </div>

                {/* Group Name input */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-black text-slate-700 dark:text-zinc-300 uppercase tracking-wider pl-1">
                    Tên nhóm
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nhập tên nhóm mới..."
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-200 dark:border-zinc-800 focus:border-blue focus:bg-white dark:focus:bg-zinc-900 focus:outline-none transition text-sm font-semibold text-slate-900 dark:text-white"
                  />
                </div>

                {/* Group Description input */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-black text-slate-700 dark:text-zinc-300 uppercase tracking-wider pl-1">
                    Mô tả nhóm
                  </label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Nhập mô tả hoạt động của nhóm..."
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-200 dark:border-zinc-800 focus:border-blue focus:bg-white dark:focus:bg-zinc-900 focus:outline-none transition text-sm font-semibold text-slate-900 dark:text-white resize-none"
                  />
                </div>
              </div>
            )}

            {/* TAB: Privacy & Admin Settings Form */}
            {activeTab === 'privacy' && (
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-grey/20 dark:border-zinc-800 shadow-sm p-6 space-y-6 text-left">
                {/* setting item 1 */}
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Quyền đăng bài viết</h4>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 pr-4 leading-normal">
                      Khi bật, chỉ quản trị viên mới được tạo bài viết mới trong nhóm này. Thành viên bình thường chỉ có thể xem và tương tác.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={onlyAdminCanPost}
                      onChange={(e) => setOnlyAdminCanPost(e.target.checked)}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-slate-200 dark:bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue"></div>
                  </label>
                </div>

                {/* setting item 2 */}
                <div className="flex items-start justify-between gap-4 pt-4 border-t border-grey/10 dark:border-zinc-800">
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Duyệt thành viên mới</h4>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 pr-4 leading-normal">
                      Khi bật, chỉ có quản trị viên mới có thể trực tiếp thêm hoặc phê duyệt thành viên mới tham gia nhóm này.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={onlyAdminCanAddMember}
                      onChange={(e) => setOnlyAdminCanAddMember(e.target.checked)}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-slate-200 dark:bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue"></div>
                  </label>
                </div>

                {/* setting item 3 */}
                <div className="flex items-start justify-between gap-4 pt-4 border-t border-grey/10 dark:border-zinc-800">
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Cho phép mời bạn bè</h4>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 pr-4 leading-normal">
                      Cho phép thành viên bình thường gửi lời mời bạn bè tham gia nhóm này.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={allowMemberInvite}
                      onChange={(e) => setAllowMemberInvite(e.target.checked)}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-slate-200 dark:bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue"></div>
                  </label>
                </div>
              </div>
            )}

            {/* Save Button Row */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => router.push(`/group?groupId=${groupId}`)}
                className="px-5 py-3 border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-900 rounded-xl text-xs font-bold text-slate-700 dark:text-zinc-300 transition cursor-pointer bg-transparent active:scale-[0.98]"
              >
                Hủy thay đổi
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={handleSaveSettings}
                className="px-5 py-3 bg-blue hover:bg-blue-hover text-white rounded-xl text-xs font-bold transition cursor-pointer border-none flex items-center gap-2 active:scale-[0.98] disabled:opacity-55 shadow-md shadow-blue/20"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Lưu cài đặt
              </button>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
