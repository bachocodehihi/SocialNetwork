'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { groupService } from '../../../services/group.service';
import { useAlert } from '../../../components/Alert/alertcontext';
import { Loader2, Users, User, MessageSquare, AlertTriangle, ArrowRight } from 'lucide-react';
import Navbar from '../../../components/Navbar';
import { motion } from 'framer-motion';

export default function JoinGroupPage() {
  const params = useParams();
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const { showError, showSuccess } = useAlert();

  const [group, setGroup] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const code = (params.inviteCode as string) || new URLSearchParams(window.location.search).get('inviteCode');
    setInviteCode(code);
  }, [params]);

  useEffect(() => {
    if (!inviteCode) {

      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      localStorage.setItem('redirectAfterLogin', window.location.pathname);
      router.push('/signin');
      return;
    }

    const fetchGroupInfo = async () => {
      try {
        setLoading(true);
        const res = await groupService.getGroupByInviteCode(inviteCode);
        if (res.success && res.data) {
          setGroup(res.data);
        } else {
          setErrorMsg('Không tìm thấy thông tin nhóm.');
        }
      } catch (err: any) {
        console.error('Lỗi lấy thông tin nhóm:', err);
        const code = err.response?.data?.code || '';
        if (code === 'GROUP_NOT_FOUND' || err.response?.status === 404) {
          setErrorMsg('Liên kết mời này không tồn tại hoặc đã hết hạn.');
        } else {
          setErrorMsg('Đã có lỗi xảy ra. Vui lòng thử lại sau.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchGroupInfo();
  }, [inviteCode, router]);

  const handleJoin = async () => {
    if (joining || !inviteCode) return;

    try {
      setJoining(true);
      const res = await groupService.joinByInviteCode(inviteCode);
      if (res.success) {
        showSuccess('Tham gia nhóm thành công!');
        router.push('/home/message');
      } else {
        showError('Không thể tham gia nhóm. Vui lòng thử lại.');
      }
    } catch (err: any) {
      console.error('Lỗi tham gia nhóm:', err);
      const code = err.response?.data?.code || '';
      if (code === 'ALREADY_IN_GROUP') {
        showSuccess('Bạn đã là thành viên của nhóm này.');
        router.push('/home/message');
      } else {
        showError(err.response?.data?.message || 'Có lỗi xảy ra khi tham gia nhóm.');
      }
    } finally {
      setJoining(false);
    }
  };

  const handleGoToChat = () => {
    router.push('/home/message');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 flex flex-col font-sans">
      <Navbar activeTab="message" />

      <div className="flex-1 pt-24 pb-12 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/20 p-8 flex flex-col items-center text-center relative"
        >
          {loading ? (
            <div className="py-12 flex flex-col items-center gap-4">
              <Loader2 className="w-12 h-12 text-blue animate-spin" />
              <p className="text-grey font-bold text-sm">Đang tải thông tin nhóm...</p>
            </div>
          ) : errorMsg ? (
            <div className="py-8 flex flex-col items-center gap-5">
              <div className="w-16 h-16 bg-red/10 rounded-full flex items-center justify-center text-red">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-black">Liên kết không hợp lệ</h2>
                <p className="text-sm text-grey px-4 leading-relaxed">{errorMsg}</p>
              </div>
              <button
                onClick={() => router.push('/home')}
                className="mt-4 px-6 py-2.5 bg-blue hover:bg-blue-hover text-white font-bold rounded-xl transition duration-200"
              >
                Về trang chủ
              </button>
            </div>
          ) : (
            group && (
              <div className="w-full flex flex-col items-center gap-6">
                <div className="relative">
                  {group.avatar ? (
                    <img
                      src={group.avatar}
                      alt={group.name}
                      className="w-24 h-24 rounded-full object-cover shadow-md border-4 border-slate-100"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-blue/10 flex items-center justify-center text-blue shadow-md border-4 border-slate-100">
                      <Users className="w-10 h-10" />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <span className="inline-block px-3 py-1 bg-blue/15 text-blue text-xs font-extrabold uppercase tracking-wider rounded-full">
                    Lời mời tham gia nhóm
                  </span>
                  <h2 className="text-2xl font-bold text-black tracking-tight px-2">
                    {group.name}
                  </h2>
                  {group.description && (
                    <p className="text-sm text-grey line-clamp-3 leading-relaxed px-4">
                      {group.description}
                    </p>
                  )}
                </div>

                <div className="w-full grid grid-cols-2 gap-3 py-2 border-y border-slate-100">
                  <div className="flex flex-col items-center p-2 rounded-xl bg-slate-50">
                    <span className="text-[10px] font-bold text-grey uppercase tracking-wider">
                      Thành viên
                    </span>
                    <span className="text-base font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                      <Users className="w-4 h-4 text-blue" />
                      {group.members?.length || 0}
                    </span>
                  </div>
                  <div className="flex flex-col items-center p-2 rounded-xl bg-slate-50">
                    <span className="text-[10px] font-bold text-grey uppercase tracking-wider">
                      Trưởng nhóm
                    </span>
                    <span className="text-sm font-bold text-slate-800 truncate max-w-[120px] flex items-center gap-1 mt-0.5">
                      <User className="w-3.5 h-3.5 text-blue" />
                      {group.admin?.username || 'Ẩn danh'}
                    </span>
                  </div>
                </div>

                <div className="w-full pt-2">
                  {group.isMember ? (
                    <button
                      onClick={handleGoToChat}
                      className="w-full bg-green hover:bg-green-hover active:scale-[0.98] text-white font-bold py-3.5 rounded-xl transition duration-200 shadow-lg shadow-green/25 flex items-center justify-center gap-2 cursor-pointer border-none"
                    >
                      <MessageSquare className="w-5 h-5" />
                      <span>Nhắn tin ngay</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleJoin}
                      disabled={joining}
                      className="w-full bg-blue hover:bg-blue-hover active:scale-[0.98] disabled:opacity-75 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition duration-200 shadow-lg shadow-blue/25 flex items-center justify-center gap-2 cursor-pointer border-none"
                    >
                      {joining ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <ArrowRight className="w-5 h-5" />
                      )}
                      <span>Tham gia nhóm</span>
                    </button>
                  )}
                </div>
              </div>
            )
          )}
        </motion.div>
      </div>
    </div>
  );
}
