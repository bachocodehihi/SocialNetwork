'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { groupService } from '../../../services/group.service';
import { contactService } from '../../../services/contact.service';
import { useAlert } from '../../../components/Alert/alertcontext';
import { 
  ArrowLeft, Search, User, Loader2, UserPlus, Check, Users 
} from 'lucide-react';
import Navbar from '../../../components/Navbar';
import Loading from '../../../components/Loading';
import { motion } from 'framer-motion';

export default function GroupInvitePage() {
  const router = useRouter();
  const { showSuccess, showError } = useAlert();

  const [groupId, setGroupId] = useState<string | null>(null);
  const [group, setGroup] = useState<any>(null);
  const [friends, setFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Track invited userIds to disable the button
  const [invitedUserIds, setInvitedUserIds] = useState<Record<string, boolean>>({});
  const [invitingState, setInvitingState] = useState<Record<string, boolean>>({});

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
        // Load group info
        const groupRes = await groupService.getGroupById(id);
        if (groupRes.success && groupRes.data) {
          setGroup(groupRes.data);
          
          // Load friends
          const friendsRes = await contactService.getFriends();
          const friendsList = Array.isArray(friendsRes) ? friendsRes : (friendsRes.data || []);
          setFriends(friendsList);
        } else {
          showError('Không tìm thấy thông tin nhóm.');
          router.push('/home/contact/friend');
        }
      } catch (err: any) {
        console.error('Lỗi tải trang mời nhóm:', err);
        showError('Không thể tải trang mời. Bạn có thể không phải thành viên của nhóm này.');
        router.push('/home/contact/friend');
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, [router]);

  const handleInvite = async (friendId: string, username: string) => {
    if (!groupId) return;

    try {
      setInvitingState(prev => ({ ...prev, [friendId]: true }));
      const res = await groupService.inviteToGroup(groupId, friendId);
      if (res.success) {
        showSuccess(`Đã gửi lời mời tham gia nhóm tới ${username}!`);
        setInvitedUserIds(prev => ({ ...prev, [friendId]: true }));
      } else {
        showError('Không thể gửi lời mời.');
      }
    } catch (err: any) {
      console.error('Lỗi mời thành viên:', err);
      showError(err.response?.data?.message || 'Có lỗi xảy ra khi gửi lời mời.');
    } finally {
      setInvitingState(prev => ({ ...prev, [friendId]: false }));
    }
  };

  const memberIds = (group?.members || []).map((m: any) => m._id || m.id);

  // Filter friends list by search query
  const filteredFriends = friends.filter((f: any) => 
    f.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <Loading message="Đang tải danh sách bạn bè..." />;
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#18191a] flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 pt-24 pb-12 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-xl bg-white dark:bg-zinc-900 rounded-2xl shadow-sm overflow-hidden border border-grey/20 dark:border-zinc-800 p-6 flex flex-col relative text-left"
        >
          {/* Header */}
          <div className="flex items-center gap-4 border-b border-grey/10 dark:border-zinc-800 pb-5 mb-5">
            <button
              onClick={() => router.push(`/group?groupId=${groupId}`)}
              className="p-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-zinc-800 dark:hover:bg-zinc-700/80 rounded-full text-slate-600 dark:text-zinc-300 transition cursor-pointer border-none"
              title="Quay lại trang nhóm"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h2 className="text-xl font-black text-black dark:text-white">
                Mời bạn bè vào nhóm
              </h2>
              <p className="text-xs text-grey dark:text-zinc-400 font-semibold mt-0.5 truncate max-w-sm">
                Nhóm: <span className="text-blue font-extrabold">{group?.name}</span>
              </p>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative mb-5">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-grey" />
            <input
              type="text"
              placeholder="Tìm kiếm bạn bè..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200/40 rounded-full text-sm font-semibold text-black placeholder-[#b0b3b8] dark:bg-zinc-800 dark:border-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue focus:bg-white dark:focus:bg-zinc-900 transition"
            />
          </div>

          {/* Friends List */}
          <div className="flex-1 min-h-[300px] max-h-[400px] overflow-y-auto pr-1">
            {friends.length === 0 ? (
              <div className="py-16 text-center text-grey">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-30 text-slate-400" />
                <h4 className="font-bold text-slate-800 dark:text-white">Chưa có bạn bè nào</h4>
                <p className="text-xs text-grey mt-1 max-w-xs mx-auto">Hãy kết bạn để có thể mời họ tham gia nhóm.</p>
              </div>
            ) : filteredFriends.length === 0 ? (
              <div className="py-16 text-center text-grey">
                <Search className="w-12 h-12 mx-auto mb-3 opacity-30 text-slate-400" />
                <h4 className="font-bold text-slate-800 dark:text-white">Không tìm thấy bạn bè</h4>
                <p className="text-xs text-grey mt-1">Không tìm thấy kết quả phù hợp với từ khóa tìm kiếm của bạn.</p>
              </div>
            ) : (
              <div className="divide-y divide-grey/10 dark:divide-zinc-800">
                {filteredFriends.map((friend) => {
                  const isInvited = invitedUserIds[friend._id];
                  const isInviting = invitingState[friend._id];
                  const isJoined = memberIds.includes(friend._id || friend.id);

                  return (
                    <div key={friend._id} className="py-3.5 flex items-center justify-between gap-4 text-left">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-11 h-11 rounded-full overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200/40">
                          {friend.avatar ? (
                            <img src={friend.avatar} alt={friend.username} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-blue/10 text-blue flex items-center justify-center">
                              <User className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-extrabold text-sm text-slate-850 dark:text-white truncate">
                            {friend.username}
                          </h4>
                          <span className="text-[11px] text-grey dark:text-[#b0b3b8] font-semibold truncate block mt-0.5">
                            {friend.email}
                          </span>
                        </div>
                      </div>

                      {/* Action Button */}
                      {isJoined ? (
                        <span className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-[#3a3b3c] text-grey dark:text-[#b0b3b8] font-extrabold text-xs flex items-center gap-1.5 border border-slate-200/20">
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Đã tham gia</span>
                        </span>
                      ) : isInvited ? (
                        <span className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-[#3a3b3c] text-grey dark:text-[#b0b3b8] font-extrabold text-xs flex items-center gap-1.5 border border-slate-200/20">
                          <Check className="w-3.5 h-3.5 text-slate-400" />
                          <span>Đã mời</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => handleInvite(friend._id, friend.username)}
                          disabled={isInviting}
                          className="px-4 py-2.5 bg-blue hover:bg-blue-hover disabled:opacity-75 text-white font-extrabold text-xs rounded-xl transition flex items-center gap-1.5 border-none cursor-pointer shadow-sm shadow-blue/20"
                        >
                          {isInviting ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <UserPlus className="w-3.5 h-3.5" />
                          )}
                          <span>Mời</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
