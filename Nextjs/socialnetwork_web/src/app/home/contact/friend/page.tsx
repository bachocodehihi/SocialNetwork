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
    <div className="min-h-screen bg-grey/5 flex flex-col font-sans">
      <Navbar activeTab="contact" />

      {/* Main Content Area */}
      <main className="flex-1 pt-20 pb-12 px-4 max-w-4xl mx-auto w-full">
        
        {/* Contact Page Header & Tabs */}
        <div className="bg-white rounded-2xl border border-grey/20 p-5 shadow-sm mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
            <h1 className="text-2xl font-black text-grey-hover">Danh bạ cá nhân</h1>
            
            {/* Create Group Mock Button */}
            {activeSubTab === 'groups' && (
              <button 
                onClick={() => router.push('/create/group')}
                className="flex items-center gap-2 bg-blue hover:bg-blue-hover text-white px-4 py-2 rounded-xl text-sm font-bold transition cursor-pointer border-none"
              >
                <Plus className="w-4 h-4" />
                <span>Tạo nhóm mới</span>
              </button>
            )}
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex border-b border-grey/10">
            <button
              onClick={() => setActiveSubTab('friends')}
              className={`flex-1 sm:flex-initial pb-3 px-6 text-sm font-bold border-b-2 transition duration-200 cursor-pointer bg-transparent border-0 ${
                activeSubTab === 'friends'
                  ? 'text-blue border-blue'
                  : 'text-grey hover:text-grey-hover border-transparent'
              }`}
            >
              Bạn bè ({friends.length})
            </button>
            <button
              onClick={() => setActiveSubTab('requests')}
              className={`flex-1 sm:flex-initial pb-3 px-6 text-sm font-bold border-b-2 transition duration-200 cursor-pointer bg-transparent border-0 ${
                activeSubTab === 'requests'
                  ? 'text-blue border-blue'
                  : 'text-grey hover:text-grey-hover border-transparent'
              }`}
            >
              Lời mời kết bạn ({requests.length})
            </button>
            <button
              onClick={() => setActiveSubTab('groups')}
              className={`flex-1 sm:flex-initial pb-3 px-6 text-sm font-bold border-b-2 transition duration-200 cursor-pointer bg-transparent border-0 ${
                activeSubTab === 'groups'
                  ? 'text-blue border-blue'
                  : 'text-grey hover:text-grey-hover border-transparent'
              }`}
            >
              Nhóm tham gia
            </button>
          </div>
        </div>

        {/* Tab Contents */}
        {loading ? (
          <div className="flex justify-center items-center py-20 bg-white rounded-2xl border border-grey/20 shadow-sm">
            <Loader2 className="w-8 h-8 animate-spin text-blue mr-2" />
            <span className="text-grey font-bold">Đang tải danh sách...</span>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-grey/20 p-6 shadow-sm min-h-[400px]">
            
            {/* Friends Tab */}
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
                          className="flex items-center justify-between p-4 rounded-xl border border-grey/10 hover:border-grey/25 transition duration-150 bg-grey/5"
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <div className="w-12 h-12 rounded-full overflow-hidden border border-grey/20 bg-white flex-shrink-0 flex items-center justify-center">
                              {friendInfo.avatar ? (
                                <img src={friendInfo.avatar} alt={friendInfo.username} className="w-full h-full object-cover" />
                              ) : (
                                <User className="w-6 h-6 text-grey/60" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-bold text-grey-hover truncate text-[15px]">{friendInfo.username}</h4>
                              <p className="text-xs text-grey/60 truncate">{friendInfo.email || 'Thành viên mạng xã hội'}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => router.push('/home/message')}
                              title="Nhắn tin"
                              className="p-2.5 rounded-xl bg-blue/10 hover:bg-blue/20 text-blue border-none cursor-pointer transition"
                            >
                              <MessageSquare className="w-4.5 h-4.5" />
                            </button>
                            <button
                              onClick={() => handleRemoveFriend(friendInfo._id || friendInfo.id)}
                              title="Hủy kết bạn"
                              className="p-2.5 rounded-xl bg-red/10 hover:bg-red/20 text-red border-none cursor-pointer transition"
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

            {/* Friend Requests Tab */}
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
                          className="flex items-center justify-between p-4 rounded-xl border border-grey/10 hover:border-grey/25 transition duration-150 bg-grey/5"
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <div className="w-12 h-12 rounded-full overflow-hidden border border-grey/20 bg-white flex-shrink-0 flex items-center justify-center">
                              {sender.avatar ? (
                                <img src={sender.avatar} alt={sender.username} className="w-full h-full object-cover" />
                              ) : (
                                <User className="w-6 h-6 text-grey/60" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-bold text-grey-hover truncate text-[15px]">{sender.username}</h4>
                              <p className="text-xs text-grey/60 truncate">Gửi lời mời kết bạn</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleAcceptRequest(req._id || req.id)}
                              className="px-3.5 py-2 bg-blue hover:bg-blue-hover text-white text-xs font-bold rounded-lg border-none cursor-pointer transition"
                            >
                              Đồng ý
                            </button>
                            <button
                              onClick={() => handleRejectRequest(req._id || req.id)}
                              className="px-3.5 py-2 bg-grey/20 hover:bg-grey/30 text-grey-hover text-xs font-bold rounded-lg border-none cursor-pointer transition"
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

            {/* Groups Tab */}
            {activeSubTab === 'groups' && (
              <div className="text-center py-20 text-grey">
                <Users2 className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p className="font-semibold">Bạn chưa tham gia nhóm nào.</p>
                <p className="text-xs text-grey/60 mt-1">Các nhóm bạn tham gia hoặc quản trị sẽ xuất hiện tại đây.</p>
                <button
                  onClick={() => router.push('/create/group')}
                  className="mt-5 bg-blue hover:bg-blue-hover text-white text-sm font-bold px-6 py-2.5 rounded-full transition duration-150 border-none cursor-pointer"
                >
                  Tạo nhóm đầu tiên
                </button>
              </div>
            )}

          </div>
        )}

      </main>
    </div>
  );
}
