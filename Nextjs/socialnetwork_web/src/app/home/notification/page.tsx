'use client';
import Navbar from '@/components/Navbar';
import { notificationService } from '@/services/notification.service';
import { contactService } from '@/services/contact.service';
import { useAlert } from '@/components/Alert/alertcontext';
import { useEffect, useState } from 'react';
import { 
  Bell, 
  ThumbsUp, 
  MessageSquare, 
  UserPlus, 
  Loader2, 
  Check, 
  User, 
  Circle,
  Calendar
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NotificationPage() {
  const router = useRouter();
  const { showSuccess, showError } = useAlert();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getNotifications();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      showError('Không thể tải thông báo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      showSuccess('Đã đánh dấu tất cả thông báo là đã đọc!');
    } catch (err) {
      console.error('Error marking notifications as read:', err);
      showError('Không thể thực hiện thao tác này.');
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await contactService.acceptRequest(requestId);
      showSuccess('Đã đồng ý kết bạn!');
      // Update state locally
      setNotifications(prev => prev.map(n => 
        n.relatedId === requestId ? { ...n, requestStatus: 'accepted' } : n
      ));
    } catch (err) {
      console.error('Error accepting request:', err);
      showError('Thất bại khi chấp nhận lời mời.');
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await contactService.rejectRequest(requestId);
      showSuccess('Đã từ chối kết bạn.');
      // Update state locally
      setNotifications(prev => prev.map(n => 
        n.relatedId === requestId ? { ...n, requestStatus: 'rejected' } : n
      ));
    } catch (err) {
      console.error('Error rejecting request:', err);
      showError('Thất bại khi từ chối lời mời.');
    }
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'like':
        return (
          <div className="w-8 h-8 rounded-full bg-red/10 flex items-center justify-center text-red">
            <ThumbsUp className="w-4 h-4 fill-current" />
          </div>
        );
      case 'comment':
      case 'reply':
        return (
          <div className="w-8 h-8 rounded-full bg-blue/10 flex items-center justify-center text-blue">
            <MessageSquare className="w-4 h-4" />
          </div>
        );
      case 'friend_request':
        return (
          <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
            <UserPlus className="w-4 h-4" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-grey/10 dark:bg-zinc-850 flex items-center justify-center text-grey dark:text-zinc-400">
            <Bell className="w-4 h-4" />
          </div>
        );
    }
  };

  const formatTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return 'Vừa xong';
      if (diffMins < 60) return `${diffMins} phút trước`;
      if (diffHours < 24) return `${diffHours} giờ trước`;
      if (diffDays < 7) return `${diffDays} ngày trước`;
      return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch (e) {
      return '';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col font-sans transition-colors duration-200">
      <Navbar activeTab="notification" />

      {/* Main Container */}
      <main className="flex-1 pt-20 pb-12 px-4 max-w-2xl mx-auto w-full">
        
        {/* Header card */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-grey/20 dark:border-zinc-800 p-5 shadow-sm mb-6 flex items-center justify-between transition-colors duration-200">
          <h1 className="text-2xl font-black text-grey-hover dark:text-zinc-100">Thông báo</h1>
          {notifications.some(n => !n.isRead) && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-blue hover:text-blue-hover bg-transparent border-0 outline-none cursor-pointer hover:underline transition animate-in fade-in duration-255"
            >
              <Check className="w-4 h-4" />
              <span>Đánh dấu tất cả đã đọc</span>
            </button>
          )}
        </div>

        {/* Notifications list */}
        {loading ? (
          <div className="flex justify-center items-center py-20 bg-white dark:bg-zinc-900 rounded-2xl border border-grey/20 dark:border-zinc-800 shadow-sm transition-colors duration-200">
            <Loader2 className="w-8 h-8 animate-spin text-blue mr-2" />
            <span className="text-grey dark:text-zinc-400 font-bold">Đang tải thông báo...</span>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-2xl border border-grey/20 dark:border-zinc-800 shadow-sm text-grey dark:text-zinc-400 transition-colors duration-200">
            <Bell className="w-12 h-12 mx-auto mb-3 opacity-40 animate-pulse" />
            <p className="font-semibold">Bạn không có thông báo nào mới.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-grey/20 dark:border-zinc-800 overflow-hidden shadow-sm divide-y divide-grey/10 dark:divide-zinc-800/80 transition-colors duration-200">
            {notifications.map((notif) => {
              const sender = notif.sender || {};
              return (
                <div 
                  key={notif._id || notif.id}
                  className={`p-4 transition duration-150 flex gap-3.5 relative ${
                    !notif.isRead ? 'bg-blue/5 dark:bg-blue-500/10' : 'hover:bg-grey/5 dark:hover:bg-zinc-800/40'
                  }`}
                >
                  {/* Left: Avatar with type icon badge */}
                  <div className="relative flex-shrink-0">
                    <div className="w-11 h-11 rounded-full overflow-hidden border border-grey/20 dark:border-zinc-800 bg-grey/5 dark:bg-zinc-800 flex items-center justify-center">
                      {sender.avatar ? (
                        <img src={sender.avatar} alt={sender.username} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-5 h-5 text-grey/60 dark:text-zinc-500" />
                      )}
                    </div>
                    <div className="absolute -bottom-1 -right-1">
                      {getNotifIcon(notif.type)}
                    </div>
                  </div>

                  {/* Middle: Content */}
                  <div className="flex-1 min-w-0 text-left">
                    <h4 className="text-sm text-black dark:text-zinc-300 leading-relaxed">
                      <span className="font-bold text-grey-hover dark:text-zinc-100 cursor-pointer hover:underline" onClick={() => router.push(`/user/${sender._id || sender.id}`)}>
                        {sender.username || 'Thành viên'}
                      </span>{' '}
                      {notif.body}
                    </h4>

                    {/* Timestamp */}
                    <div className="flex items-center gap-1.5 mt-1 text-[11px] text-grey/60 dark:text-zinc-500 font-semibold">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{formatTime(notif.createdAt)}</span>
                    </div>

                    {/* Friend Request action buttons */}
                    {notif.type === 'friend_request' && notif.relatedId && (
                      <div className="mt-3 flex items-center gap-2">
                        {notif.requestStatus === 'pending' ? (
                          <>
                            <button
                              onClick={() => handleAcceptRequest(notif.relatedId)}
                              className="px-4 py-1.5 bg-blue hover:bg-blue-hover text-white text-xs font-bold rounded-lg border-none cursor-pointer transition shadow-sm"
                            >
                              Đồng ý
                            </button>
                            <button
                              onClick={() => handleRejectRequest(notif.relatedId)}
                              className="px-4 py-1.5 bg-grey/25 dark:bg-zinc-800 hover:bg-grey/30 dark:hover:bg-zinc-700 text-grey-hover dark:text-zinc-200 text-xs font-bold rounded-lg border-none cursor-pointer transition"
                            >
                              Từ chối
                            </button>
                          </>
                        ) : notif.requestStatus === 'accepted' ? (
                          <span className="text-xs font-bold text-green-500 bg-green-500/10 dark:bg-green-500/20 px-2.5 py-1 rounded-md">
                            Đã đồng ý kết bạn
                          </span>
                        ) : notif.requestStatus === 'rejected' ? (
                          <span className="text-xs font-semibold text-grey/60 dark:text-zinc-400 bg-grey/10 dark:bg-zinc-800/80 px-2.5 py-1 rounded-md">
                            Đã từ chối kết bạn
                          </span>
                        ) : (
                          <span className="text-xs text-grey/50 dark:text-zinc-500 italic">
                            Lời mời đã hết hạn
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right: Unread Indicator Dot */}
                  {!notif.isRead && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center">
                      <Circle className="w-2.5 h-2.5 fill-blue text-blue" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </main>
    </div>
  );
}
