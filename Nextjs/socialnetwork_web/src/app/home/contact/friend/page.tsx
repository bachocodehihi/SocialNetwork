'use client';
import Navbar from '@/components/Navbar';
import { contactService } from '@/services/contact.service';
import { useAlert } from '@/components/Alert/alertcontext';
import { useEffect, useState } from 'react';
import { User, UserCheck, UserPlus, UserMinus, MessageSquare, Users2, Loader2, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ContactFriendPage() {
  const router = useRouter();
  const { showSuccess, showError } = useAlert();
  const [activeSubTab, setActiveSubTab] = useState<'requests' | 'friends' | 'groups'>('friends');
  
  // Data states
  const [friends, setFriends] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch real data from APIs
  const fetchFriends = async () => {
    setLoading(true);
    try {
      const res = await contactService.getFriends();
      setFriends(Array.isArray(res) ? res : (res.data || []));
    } catch (err) {
      console.error('Error fetching friends:', err);
      showError('Không thể tải danh sách bạn bè.');
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await contactService.getRequests();
      setRequests(Array.isArray(res) ? res : (res.data || []));
    } catch (err) {
      console.error('Error fetching requests:', err);
      showError('Không thể tải danh sách lời mời.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'friends') {
      fetchFriends();
    } else if (activeSubTab === 'requests') {
      fetchRequests();
    }
  }, [activeSubTab]);

  // Actions
  const handleAcceptRequest = async (requestId: string) => {
    try {
      await contactService.acceptRequest(requestId);
      showSuccess('Đã chấp nhận lời mời kết bạn!');
      fetchRequests();
    } catch (err) {
      console.error('Error accepting friend request:', err);
      showError('Chấp nhận kết bạn thất bại.');
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await contactService.rejectRequest(requestId);
      showSuccess('Đã từ chối lời mời.');
      fetchRequests();
    } catch (err) {
      console.error('Error rejecting friend request:', err);
      showError('Từ chối kết bạn thất bại.');
    }
  };

  const handleRemoveFriend = async (friendId: string) => {
    if (!confirm('Bạn có chắc chắn muốn hủy kết bạn?')) return;
    try {
      await contactService.removeFriend(friendId);
      showSuccess('Đã hủy kết bạn thành công.');
      fetchFriends();
    } catch (err) {
      console.error('Error removing friend:', err);
      showError('Hủy kết bạn thất bại.');
    }
  };

  return (
    <div className="min-h-screen bg-grey/5 dark:bg-zinc-950 flex flex-col font-sans">
      <Navbar activeTab="contact" />

      {/* Main Content Area */}
      <main className="flex-1 pt-24 pb-12 px-4 max-w-6xl mx-auto w-full">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          
          {/* LEFT SIDEBAR: Contact Navigation */}
          <div className="w-full md:w-64 lg:w-72 flex-shrink-0 bg-white dark:bg-zinc-900 rounded-2xl border border-grey/20 dark:border-zinc-800/80 p-5 shadow-sm space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
            <div className="px-1 text-left">
              <h2 className="text-lg font-black text-black dark:text-white tracking-tight">Danh bạ cá nhân</h2>
              <p className="text-xs text-grey font-semibold mt-0.5">Quản lý các kết nối của bạn</p>
            </div>
            
            <div className="space-y-1">
              <button
                onClick={() => setActiveSubTab('friends')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-extrabold transition-all duration-200 border-0 cursor-pointer text-left ${
                  activeSubTab === 'friends'
                    ? 'bg-blue text-white shadow-sm shadow-blue/20'
                    : 'text-grey-hover hover:bg-grey/5 dark:text-zinc-400 dark:hover:bg-zinc-800/50 bg-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <User className={`w-5 h-5 flex-shrink-0 ${activeSubTab === 'friends' ? 'text-white' : 'text-grey'}`} />
                  <span>Bạn bè</span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  activeSubTab === 'friends' 
                    ? 'bg-white/20 text-white' 
                    : 'bg-grey/10 dark:bg-zinc-800 text-grey-hover dark:text-zinc-400'
                }`}>
                  {friends.length}
                </span>
              </button>

              <button
                onClick={() => setActiveSubTab('requests')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-extrabold transition-all duration-200 border-0 cursor-pointer text-left ${
                  activeSubTab === 'requests'
                    ? 'bg-blue text-white shadow-sm shadow-blue/20'
                    : 'text-grey-hover hover:bg-grey/5 dark:text-zinc-400 dark:hover:bg-zinc-800/50 bg-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <UserPlus className={`w-5 h-5 flex-shrink-0 ${activeSubTab === 'requests' ? 'text-white' : 'text-grey'}`} />
                  <span>Lời mời kết bạn</span>
                </div>
                {requests.length > 0 && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    activeSubTab === 'requests' 
                      ? 'bg-white/20 text-white' 
                      : 'bg-red-500/10 text-red-600 dark:text-red-400'
                  }`}>
                    {requests.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveSubTab('groups')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-extrabold transition-all duration-200 border-0 cursor-pointer text-left ${
                  activeSubTab === 'groups'
                    ? 'bg-blue text-white shadow-sm shadow-blue/20'
                    : 'text-grey-hover hover:bg-grey/5 dark:text-zinc-400 dark:hover:bg-zinc-800/50 bg-transparent'
                }`}
              >
                <Users2 className={`w-5 h-5 flex-shrink-0 ${activeSubTab === 'groups' ? 'text-white' : 'text-grey'}`} />
                <span>Nhóm tham gia</span>
              </button>
            </div>
          </div>

          {/* RIGHT CONTENT: Subtab Content */}
          <div className="flex-1 w-full bg-white dark:bg-zinc-900 rounded-2xl border border-grey/25 dark:border-zinc-800/85 p-6 shadow-sm min-h-[400px] flex flex-col">
            
            {/* Tab Header inside Right Card */}
            <div className="border-b border-grey/10 dark:border-zinc-800 pb-5 mb-6 flex items-center justify-between gap-4">
              <div className="text-left">
                <h1 className="text-xl sm:text-2xl font-black text-black dark:text-white">
                  {activeSubTab === 'friends' && `Bạn bè (${friends.length})`}
                  {activeSubTab === 'requests' && `Lời mời kết bạn (${requests.length})`}
                  {activeSubTab === 'groups' && 'Nhóm tham gia'}
                </h1>
                <p className="text-sm font-semibold text-grey mt-0.5">
                  {activeSubTab === 'friends' && 'Danh sách những người bạn đã kết nối trên mạng xã hội.'}
                  {activeSubTab === 'requests' && 'Những người muốn kết nối và kết bạn với bạn.'}
                  {activeSubTab === 'groups' && 'Các nhóm thảo luận bạn đang tham gia.'}
                </p>
              </div>

              {/* Create Group Button */}
              {activeSubTab === 'groups' && (
                <button 
                  onClick={() => router.push('/create/group')}
                  className="flex items-center gap-2 bg-blue hover:bg-blue-hover text-white px-4 py-2.5 rounded-xl text-sm font-bold transition cursor-pointer border-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tạo nhóm mới</span>
                </button>
              )}
            </div>

            {/* List Details */}
            {loading ? (
              <div className="flex justify-center items-center py-20 flex-grow">
                <Loader2 className="w-8 h-8 animate-spin text-blue mr-2" />
                <span className="text-grey font-bold">Đang tải danh sách...</span>
              </div>
            ) : (
              <div className="flex-grow">
                
                {/* Friends List */}
                {activeSubTab === 'friends' && (
                  <div>
                    {friends.length === 0 ? (
                      <div className="text-center py-20 text-grey">
                        <User className="w-12 h-12 mx-auto mb-3 opacity-40" />
                        <p className="font-semibold">Bạn chưa kết bạn với ai.</p>
                        <p className="text-xs text-grey/60 mt-1">Sử dụng thanh tìm kiếm để tìm và kết bạn mới!</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {friends.map((item) => {
                          const friendInfo = item.friend || item;
                          return (
                            <div 
                              key={friendInfo._id || friendInfo.id}
                              className="flex items-center justify-between p-4 rounded-xl border border-grey/10 dark:border-zinc-800/60 hover:border-grey/25 dark:hover:border-zinc-700/80 transition duration-150 bg-grey/5 dark:bg-zinc-800/30"
                            >
                              <div className="flex items-center gap-3.5 min-w-0">
                                <div className="w-12 h-12 rounded-full overflow-hidden border border-grey/20 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex-shrink-0 flex items-center justify-center">
                                  {friendInfo.avatar ? (
                                    <img src={friendInfo.avatar} alt={friendInfo.username} className="w-full h-full object-cover" />
                                  ) : (
                                    <User className="w-6 h-6 text-grey/60 dark:text-zinc-500" />
                                  )}
                                </div>
                                <div className="min-w-0 text-left">
                                  <h4 className="font-extrabold text-black dark:text-white truncate text-[15px]">{friendInfo.username}</h4>
                                  <p className="text-xs text-grey/60 dark:text-zinc-400 truncate">{friendInfo.email || 'Thành viên mạng xã hội'}</p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => router.push(`/home/message?userId=${friendInfo._id || friendInfo.id}`)}
                                  title="Nhắn tin"
                                  className="p-2.5 rounded-xl bg-blue/10 hover:bg-blue/20 dark:bg-blue/20 dark:hover:bg-blue/30 text-blue border-0 cursor-pointer transition"
                                >
                                  <MessageSquare className="w-4.5 h-4.5" />
                                </button>
                                <button
                                  onClick={() => handleRemoveFriend(friendInfo._id || friendInfo.id)}
                                  title="Hủy kết bạn"
                                  className="p-2.5 rounded-xl bg-red/10 hover:bg-red/20 dark:bg-red/20 dark:hover:bg-red/30 text-red border-0 cursor-pointer transition"
                                >
                                  <UserMinus className="w-4.5 h-4.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Friend Requests List */}
                {activeSubTab === 'requests' && (
                  <div>
                    {requests.length === 0 ? (
                      <div className="text-center py-20 text-grey">
                        <UserCheck className="w-12 h-12 mx-auto mb-3 opacity-40" />
                        <p className="font-semibold">Không có lời mời kết bạn nào.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {requests.map((req) => {
                          const sender = req.sender || {};
                          return (
                            <div 
                              key={req._id || req.id}
                              className="flex items-center justify-between p-4 rounded-xl border border-grey/10 dark:border-zinc-800/60 hover:border-grey/25 dark:hover:border-zinc-700/80 transition duration-150 bg-grey/5 dark:bg-zinc-800/30"
                            >
                              <div className="flex items-center gap-3.5 min-w-0">
                                <div className="w-12 h-12 rounded-full overflow-hidden border border-grey/20 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex-shrink-0 flex items-center justify-center">
                                  {sender.avatar ? (
                                    <img src={sender.avatar} alt={sender.username} className="w-full h-full object-cover" />
                                  ) : (
                                    <User className="w-6 h-6 text-grey/60 dark:text-zinc-500" />
                                  )}
                                </div>
                                <div className="min-w-0 text-left">
                                  <h4 className="font-extrabold text-black dark:text-white truncate text-[15px]">{sender.username}</h4>
                                  <p className="text-xs text-grey/60 dark:text-zinc-400 truncate">Gửi lời mời kết bạn</p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleAcceptRequest(req._id || req.id)}
                                  className="px-3.5 py-2 bg-blue hover:bg-blue-hover text-white text-xs font-bold rounded-lg border-0 cursor-pointer transition"
                                >
                                  Đồng ý
                                </button>
                                <button
                                  onClick={() => handleRejectRequest(req._id || req.id)}
                                  className="px-3.5 py-2 bg-grey/20 hover:bg-grey/30 dark:bg-zinc-850 dark:hover:bg-zinc-800 text-grey-hover dark:text-zinc-300 text-xs font-bold rounded-lg border-0 cursor-pointer transition"
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
                )}

                {/* Groups List */}
                {activeSubTab === 'groups' && (
                  <div className="text-center py-20 text-grey">
                    <Users2 className="w-12 h-12 mx-auto mb-3 opacity-40" />
                    <p className="font-semibold">Bạn chưa tham gia nhóm nào.</p>
                    <p className="text-xs text-grey/60 mt-1">Các nhóm bạn tham gia hoặc quản trị sẽ xuất hiện tại đây.</p>
                    <button
                      onClick={() => router.push('/create/group')}
                      className="mt-5 bg-blue hover:bg-blue-hover text-white text-sm font-bold px-6 py-2.5 rounded-full transition duration-150 border-0 cursor-pointer"
                    >
                      Tạo nhóm đầu tiên
                    </button>
                  </div>
                )}

              </div>
            )}

          </div>

        </div>
      </main>
    </div>
  );
}
