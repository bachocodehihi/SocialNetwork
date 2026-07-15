'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { groupService } from '../../../services/group.service';
import { contactService } from '../../../services/contact.service';
import { useAlert } from '../../../components/Alert/alertcontext';
import { 
  ArrowLeft, Users, Loader2, Check, Shield, Eye, Compass, 
  Upload, Save, Search, User, Globe
} from 'lucide-react';
import Navbar from '../../../components/Navbar';
import Loading from '../../../components/Loading';
import { motion } from 'framer-motion';

export default function CreateGroupPage() {
  const router = useRouter();
  const { showSuccess, showError } = useAlert();

  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [friends, setFriends] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [avatar, setAvatar] = useState('');
  const [avatarBase64, setAvatarBase64] = useState<string | null>(null);

  // Group settings states
  const [groupType, setGroupType] = useState<'public' | 'private' | 'internal'>('public');
  const [joinPolicy, setJoinPolicy] = useState<'open' | 'approval'>('open');

  // Selected friends
  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/signin');
      return;
    }

    const loadFriends = async () => {
      try {
        setLoading(true);
        const res = await contactService.getFriends();
        const friendsList = Array.isArray(res) ? res : (res.data || []);
        setFriends(friendsList);
      } catch (err) {
        console.error('Lỗi tải danh sách bạn bè:', err);
        showError('Không thể tải danh sách bạn bè.');
      } finally {
        setLoading(false);
      }
    };

    loadFriends();
  }, [router]);

  // Adjust join policy automatically if group type changes
  useEffect(() => {
    if (groupType === 'private') {
      setJoinPolicy('approval');
    }
  }, [groupType]);

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

  const handleToggleFriend = (friendId: string) => {
    setSelectedFriendIds(prev => 
      prev.includes(friendId) 
        ? prev.filter(id => id !== friendId) 
        : [...prev, friendId]
    );
  };

  const handleCreateGroup = async () => {
    if (!name.trim()) {
      showError('Vui lòng nhập tên nhóm.');
      return;
    }
    if (selectedFriendIds.length < 2) {
      showError('Bạn cần chọn ít nhất 2 thành viên để tạo nhóm.');
      return;
    }

    try {
      setIsCreating(true);
      const createData: any = {
        name: name.trim(),
        description: description.trim(),
        members: selectedFriendIds,
        settings: {
          groupType,
          joinPolicy,
          postPolicy: 'open',
          memberLimit: 0,
          onlyAdminCanPost: false,
          onlyAdminCanAddMember: false,
          allowMemberInvite: true
        }
      };

      if (avatarBase64) {
        createData.avatar = avatarBase64;
      }

      const res = await groupService.createGroup(createData);
      if (res.success && res.data) {
        showSuccess('Tạo nhóm mới thành công!');
        router.push(`/group?groupId=${res.data._id || res.data.id}`);
      } else {
        showError('Không thể tạo nhóm.');
      }
    } catch (err: any) {
      console.error(err);
      showError(err.response?.data?.message || 'Có lỗi xảy ra khi tạo nhóm.');
    } finally {
      setIsCreating(false);
    }
  };

  const filteredFriends = friends.filter((f: any) => 
    f.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <Loading message="Đang tải dữ liệu..." />;
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-zinc-950 text-slate-800 dark:text-white flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 pt-20 pb-12 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-4xl bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-grey/25 dark:border-zinc-800 p-6 sm:p-8 flex flex-col md:flex-row gap-8 text-left"
        >
          {/* Left Column: Form Details & Settings */}
          <div className="flex-1 space-y-6">
            <div className="flex items-center gap-3 border-b border-grey/10 dark:border-zinc-800 pb-4">
              <button 
                onClick={() => router.back()}
                className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full transition text-slate-600 dark:text-zinc-300 border-none bg-transparent cursor-pointer flex items-center justify-center"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h3 className="font-extrabold text-xl text-slate-900 dark:text-white">
                  Tạo nhóm mới
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  Thiết lập các thông tin cơ bản và quyền riêng tư cho nhóm của bạn.
                </p>
              </div>
            </div>

            {/* Avatar Upload */}
            <div className="flex items-center gap-4 pb-4 border-b border-grey/10 dark:border-zinc-800">
              <div className="relative w-20 h-20 rounded-full overflow-hidden bg-slate-100 dark:bg-zinc-800 border-2 border-slate-200 dark:border-zinc-700 shadow-inner flex items-center justify-center flex-shrink-0">
                {avatar ? (
                  <img src={avatar} alt="Group Avatar Preview" className="w-full h-full object-cover" />
                ) : (
                  <Users className="w-9 h-9 text-slate-400 dark:text-zinc-500" />
                )}
              </div>
              <label className="flex items-center gap-2 px-3.5 py-2 border border-slate-200 dark:border-zinc-700 hover:border-blue dark:hover:border-blue rounded-xl bg-slate-50 dark:bg-zinc-800/50 hover:bg-blue/5 text-xs font-bold text-slate-700 dark:text-zinc-300 hover:text-blue transition cursor-pointer">
                <Upload className="w-4 h-4" />
                Tải ảnh đại diện nhóm
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleAvatarChange} 
                  className="hidden" 
                />
              </label>
            </div>

            {/* Group Name & Description */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-black text-slate-700 dark:text-zinc-300 uppercase tracking-wider pl-1">
                  Tên nhóm <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nhập tên nhóm..."
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-200 dark:border-zinc-800 focus:border-blue focus:bg-white dark:focus:bg-zinc-900 focus:outline-none transition text-sm font-semibold text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-black text-slate-700 dark:text-zinc-300 uppercase tracking-wider pl-1">
                  Mô tả nhóm
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mô tả mục đích hoạt động của nhóm..."
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-200 dark:border-zinc-800 focus:border-blue focus:bg-white dark:focus:bg-zinc-900 focus:outline-none transition text-sm font-semibold text-slate-900 dark:text-white resize-none"
                />
              </div>
            </div>

            {/* Privacy Section */}
            <div className="space-y-4 pt-4 border-t border-grey/10 dark:border-zinc-800">
              <div className="space-y-3">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue" />
                    <span>Quyền riêng tư của nhóm</span>
                  </h4>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {/* Public */}
                  <button
                    type="button"
                    onClick={() => setGroupType('public')}
                    className={`flex items-start gap-3 p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      groupType === 'public'
                        ? 'border-blue bg-blue/5 dark:bg-blue-900/10'
                        : 'border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800/40 bg-transparent'
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg ${groupType === 'public' ? 'bg-blue text-white' : 'bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-zinc-400'}`}>
                      <Compass className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1">
                      <span className="block text-xs font-bold text-slate-800 dark:text-white">Nhóm Công khai (Public)</span>
                      <span className="block text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5 font-medium leading-normal">
                        Bất kỳ ai cũng có thể tìm kiếm nhóm, xem thành viên và các bài đăng.
                      </span>
                    </div>
                    {groupType === 'public' && <Check className="w-3.5 h-3.5 text-blue mt-1 flex-shrink-0" />}
                  </button>

                  {/* Private */}
                  <button
                    type="button"
                    onClick={() => setGroupType('private')}
                    className={`flex items-start gap-3 p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      groupType === 'private'
                        ? 'border-blue bg-blue/5 dark:bg-blue-900/10'
                        : 'border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800/40 bg-transparent'
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg ${groupType === 'private' ? 'bg-blue text-white' : 'bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-zinc-400'}`}>
                      <Shield className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1">
                      <span className="block text-xs font-bold text-slate-800 dark:text-white">Nhóm Riêng tư (Private)</span>
                      <span className="block text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5 font-medium leading-normal">
                        Có thể tìm thấy nhóm, nhưng bài đăng và thành viên hoàn toàn ẩn đối với người ngoài. Phải yêu cầu gia nhập để xem.
                      </span>
                    </div>
                    {groupType === 'private' && <Check className="w-3.5 h-3.5 text-blue mt-1 flex-shrink-0" />}
                  </button>

                  {/* Internal */}
                  <button
                    type="button"
                    onClick={() => setGroupType('internal')}
                    className={`flex items-start gap-3 p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      groupType === 'internal'
                        ? 'border-blue bg-blue/5 dark:bg-blue-900/10'
                        : 'border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800/40 bg-transparent'
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg ${groupType === 'internal' ? 'bg-blue text-white' : 'bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-zinc-400'}`}>
                      <Eye className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1">
                      <span className="block text-xs font-bold text-slate-800 dark:text-white">Nhóm Nội bộ (Internal)</span>
                      <span className="block text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5 font-medium leading-normal">
                        Ẩn hoàn toàn khỏi kết quả tìm kiếm. Chỉ tham gia được khi nhận mã mời/đường liên kết từ thành viên bên trong.
                      </span>
                    </div>
                    {groupType === 'internal' && <Check className="w-3.5 h-3.5 text-blue mt-1 flex-shrink-0" />}
                  </button>
                </div>
              </div>

              {/* Join Policy */}
              <div className="space-y-3 pt-4 border-t border-grey/10 dark:border-zinc-800">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue" />
                    <span>Quy chế tham gia nhóm</span>
                  </h4>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    disabled={groupType === 'private'}
                    onClick={() => setJoinPolicy('open')}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      groupType === 'private'
                        ? 'opacity-40 cursor-not-allowed bg-slate-50 dark:bg-zinc-800/20 border-slate-200 dark:border-zinc-800'
                        : joinPolicy === 'open'
                        ? 'border-blue bg-blue/5 dark:bg-blue-900/10'
                        : 'border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800/40 bg-transparent'
                    }`}
                  >
                    <span className="flex-1 text-xs font-bold text-slate-800 dark:text-white">Vào tự do (Open)</span>
                    {groupType !== 'private' && joinPolicy === 'open' && <Check className="w-3.5 h-3.5 text-blue flex-shrink-0" />}
                  </button>

                  <button
                    type="button"
                    disabled={groupType === 'private'}
                    onClick={() => setJoinPolicy('approval')}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      groupType === 'private'
                        ? 'border-blue bg-blue/5 dark:bg-blue-900/10'
                        : joinPolicy === 'approval'
                        ? 'border-blue bg-blue/5 dark:bg-blue-900/10'
                        : 'border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800/40 bg-transparent'
                    }`}
                  >
                    <span className="flex-1 text-xs font-bold text-slate-800 dark:text-white">Cần duyệt (Approval)</span>
                    {(groupType === 'private' || joinPolicy === 'approval') && <Check className="w-3.5 h-3.5 text-blue flex-shrink-0" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Friend Selection */}
          <div className="w-full md:w-80 flex flex-col border-t md:border-t-0 md:border-l border-grey/15 dark:border-zinc-800 pt-6 md:pt-0 md:pl-6">
            <div className="mb-4">
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                Thêm thành viên ({selectedFriendIds.length})
              </h4>
              <p className="text-[10.5px] text-slate-500 dark:text-zinc-400 mt-0.5 leading-normal font-semibold">
                Chọn ít nhất <span className="text-[#1877f2] font-black">2 người bạn</span> để tạo nhóm (yêu cầu từ hệ thống).
              </p>
            </div>

            {/* Search Friend */}
            <div className="relative mb-4">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm bạn bè..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-zinc-800/50 border border-slate-250 dark:border-zinc-850 rounded-xl text-xs font-bold text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue placeholder-[#b0b3b8] transition"
              />
            </div>

            {/* Friends list */}
            <div className="flex-1 max-h-[300px] md:max-h-[380px] overflow-y-auto space-y-1.5 pr-1">
              {friends.length === 0 ? (
                <div className="py-12 text-center text-slate-500">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-30 text-slate-400" />
                  <p className="text-[11px] font-bold">Chưa có bạn bè</p>
                </div>
              ) : filteredFriends.length === 0 ? (
                <div className="py-12 text-center text-slate-500">
                  <p className="text-[11px] font-bold">Không tìm thấy kết quả</p>
                </div>
              ) : (
                filteredFriends.map((friend) => {
                  const isSelected = selectedFriendIds.includes(friend._id);
                  return (
                    <div 
                      key={friend._id}
                      onClick={() => handleToggleFriend(friend._id)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition ${
                        isSelected 
                          ? 'border-blue bg-blue/5 dark:bg-blue-900/10' 
                          : 'border-slate-200 dark:border-zinc-800/50 hover:bg-slate-50 dark:hover:bg-zinc-800/40'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-150 flex-shrink-0 border border-slate-200/40">
                          {friend.avatar ? (
                            <img src={friend.avatar} alt={friend.username} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-blue/10 text-blue flex items-center justify-center font-bold text-xs">
                              {friend.username?.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 text-left">
                          <h5 className="font-bold text-xs text-slate-800 dark:text-zinc-150 truncate">
                            {friend.username}
                          </h5>
                          <span className="text-[9.5px] text-grey dark:text-zinc-500 truncate block mt-0.5">
                            {friend.email}
                          </span>
                        </div>
                      </div>
                      <div className={`w-4 h-4 rounded-md border flex items-center justify-center flex-shrink-0 transition-all ${
                        isSelected 
                          ? 'border-blue bg-blue text-white' 
                          : 'border-slate-350 dark:border-zinc-700 bg-transparent'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Bottom Actions */}
            <div className="mt-6 pt-4 border-t border-grey/10 dark:border-zinc-800 flex flex-col gap-2">
              <button
                type="button"
                disabled={isCreating || !name.trim() || selectedFriendIds.length < 2}
                onClick={handleCreateGroup}
                className="w-full py-3 bg-[#1877f2] hover:bg-[#156bec] disabled:opacity-50 text-white font-extrabold text-xs rounded-xl border-none transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-blue/20"
              >
                {isCreating && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Tạo nhóm</span>
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="w-full py-3 border border-slate-250 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-850 rounded-xl text-slate-700 dark:text-zinc-350 text-xs font-bold transition cursor-pointer bg-transparent"
              >
                Hủy bỏ
              </button>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
