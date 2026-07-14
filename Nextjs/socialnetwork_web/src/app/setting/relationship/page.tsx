'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { accountService } from '../../../services/accout.service';
import { contactService } from '../../../services/contact.service';
import { authService } from '../../../services/auth.service';
import { useAlert } from '../../../components/Alert/alertcontext';
import Navbar from '../../../components/Navbar';
import { 
  ArrowLeft, 
  Heart, 
  Check, 
  X, 
  ChevronDown, 
  Loader2, 
  User, 
  Search, 
  UserCheck, 
  Clock 
} from 'lucide-react';

interface Friend {
  _id: string;
  username: string;
  avatar?: string;
}

interface RelationshipRequest {
  _id: string;
  username: string;
  avatar?: string;
  relationship?: {
    status: string;
  };
}

export default function RelationshipSettingPage() {
  const router = useRouter();
  const { showSuccess, showError } = useAlert();
  
  const [profile, setProfile] = useState<any>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [relationshipRequests, setRelationshipRequests] = useState<RelationshipRequest[]>([]);
  
  const [relStatus, setRelStatus] = useState<string>('single');
  const [relPartner, setRelPartner] = useState<string>('');
  
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isProcessingRequest, setIsProcessingRequest] = useState<string | null>(null);
  
  // Custom dropdown states
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showPartnerDropdown, setShowPartnerDropdown] = useState(false);
  const [partnerSearchQuery, setPartnerSearchQuery] = useState('');
  
  const statusDropdownRef = useRef<HTMLDivElement>(null);
  const partnerDropdownRef = useRef<HTMLDivElement>(null);

  const STATUS_LABELS: Record<string, string> = {
    single: 'Độc thân',
    dating: 'Đang hẹn hò',
    engaged: 'Đã đính hôn',
    married: 'Đã kết hôn'
  };

  const RELATIONSHIP_STATUSES = [
    { value: 'single', label: 'Độc thân' },
    { value: 'dating', label: 'Đang hẹn hò' },
    { value: 'engaged', label: 'Đã đính hôn' },
    { value: 'married', label: 'Đã kết hôn' }
  ];

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setShowStatusDropdown(false);
      }
      if (partnerDropdownRef.current && !partnerDropdownRef.current.contains(event.target as Node)) {
        setShowPartnerDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch initial profile & friends data
  const loadData = async () => {
    try {
      const data = await accountService.getProfile();
      setProfile(data);
      
      // Map existing status (if complicated or none, default to single)
      const currentStatus = data.relationship?.status || 'single';
      if (RELATIONSHIP_STATUSES.some(item => item.value === currentStatus)) {
        setRelStatus(currentStatus);
      } else {
        setRelStatus('single');
      }

      setRelPartner(data.relationship?.partner?._id || data.relationship?.partner || '');
      setRelationshipRequests(data.relationshipRequests || []);

      try {
        const friendsData = await contactService.getFriends();
        if (friendsData && friendsData.success) {
          setFriends(friendsData.friends || []);
        } else if (Array.isArray(friendsData)) {
          setFriends(friendsData);
        }
      } catch (e) {
        console.error('Error fetching friends list:', e);
      }
    } catch (err) {
      console.error(err);
      showError('Không thể tải thông tin mối quan hệ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/signin');
      return;
    }
    loadData();
  }, [router]);

  const handleSaveRelationship = async () => {
    setIsSaving(true);
    try {
      const payload = {
        status: relStatus,
        partner: relStatus === 'single' ? null : relPartner
      };
      
      const res = await accountService.updateProfile({
        relationship: JSON.stringify(payload)
      });
      
      if (res && res.success) {
        showSuccess('Cập nhật trạng thái mối quan hệ thành công!');
        await loadData();
      } else {
        showError('Không thể cập nhật trạng thái mối quan hệ.');
      }
    } catch (err: any) {
      console.error(err);
      showError(err.response?.data?.message || 'Không thể cập nhật trạng thái mối quan hệ.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAcceptRelationshipRequest = async (requesterId: string) => {
    setIsProcessingRequest(requesterId);
    try {
      const res = await accountService.acceptRelationship(requesterId);
      if (res && res.success) {
        showSuccess('Đã đồng ý lời mời kết đôi!');
        await loadData();
      } else {
        showError('Không thể thực hiện hành động này.');
      }
    } catch (err: any) {
      console.error(err);
      showError(err.response?.data?.message || 'Lỗi xảy ra khi đồng ý kết đôi.');
    } finally {
      setIsProcessingRequest(null);
    }
  };

  const handleRejectRelationshipRequest = async (requesterId: string) => {
    setIsProcessingRequest(requesterId);
    try {
      const res = await accountService.rejectRelationship(requesterId);
      if (res && res.success) {
        showSuccess('Đã từ chối lời mời kết đôi.');
        await loadData();
      } else {
        showError('Không thể thực hiện hành động này.');
      }
    } catch (err: any) {
      console.error(err);
      showError(err.response?.data?.message || 'Lỗi xảy ra khi từ chối.');
    } finally {
      setIsProcessingRequest(null);
    }
  };

  const handleCancelRelationshipRequest = async () => {
    setIsSaving(true);
    try {
      const res = await accountService.cancelRelationshipRequest();
      if (res && res.success) {
        showSuccess('Đã hủy lời mời kết đôi.');
        await loadData();
      } else {
        showError('Không thể hủy lời mời.');
      }
    } catch (err: any) {
      console.error(err);
      showError(err.response?.data?.message || 'Lỗi xảy ra khi hủy lời mời.');
    } finally {
      setIsSaving(false);
    }
  };

  const selectedPartnerObj = friends.find(f => f._id === relPartner);

  const filteredFriends = friends.filter(f =>
    f.username.toLowerCase().includes(partnerSearchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-100 dark:bg-zinc-950">
        <Loader2 className="animate-spin rounded-full h-12 w-12 text-blue" />
      </div>
    );
  }

  const isPendingOutgoing = profile?.relationship?.isPending && profile?.relationship?.pendingPartner;
  const pendingPartnerName = profile?.relationship?.pendingPartner?.username || 'đối tác';
  const pendingPartnerAvatar = profile?.relationship?.pendingPartner?.avatar || '/assets/avatar/avatar.jpg';

  const hasActivePartner = profile?.relationship && profile.relationship.status !== 'none' && profile.relationship.status !== 'single' && profile.relationship.partner;
  const activePartnerName = profile?.relationship?.partner?.username;
  const activePartnerAvatar = profile?.relationship?.partner?.avatar || '/assets/avatar/avatar.jpg';
  const activePartnerStatus = STATUS_LABELS[profile?.relationship?.status] || 'Đang hẹn hò';

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-zinc-950 font-sans text-grey-hover transition-colors duration-300">
      <Navbar activeTab="setting" />

      <main className="pt-24 pb-12 px-4 max-w-2xl mx-auto">
        {/* Back navigation */}
        <button 
          onClick={() => router.push('/setting?tab=change-info')}
          className="flex items-center gap-2 mb-6 text-sm font-semibold text-blue hover:text-blue-hover cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại Cài đặt</span>
        </button>

        <div className="bg-white dark:bg-zinc-900 border border-grey/20 dark:border-zinc-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-8 text-left">
          
          {/* Header Title */}
          <div className="flex items-center gap-3.5 border-b border-grey/10 dark:border-zinc-800 pb-5">
            <div className="w-11 h-11 rounded-full bg-pink-500/10 dark:bg-pink-500/20 flex items-center justify-center text-pink-500">
              <Heart className="w-5.5 h-5.5 fill-pink-500" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-black dark:text-white">Thiết lập mối quan hệ</h1>
              <p className="text-xs text-grey font-medium mt-0.5">Đặt tình trạng hôn nhân, hẹn hò với bạn bè của bạn</p>
            </div>
          </div>

          {/* 1. CURRENT ACTIVE RELATIONSHIP CARD */}
          {hasActivePartner && (
            <div className="p-4 bg-pink-50 dark:bg-pink-950/20 border border-pink-100 dark:border-pink-900/30 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-full overflow-hidden border border-pink-200 dark:border-pink-900 flex-shrink-0">
                  <img src={activePartnerAvatar} alt="Partner Avatar" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-pink-600 dark:text-pink-400">
                    {activePartnerStatus} với {activePartnerName}
                  </h4>
                  <p className="text-xs text-grey font-medium mt-0.5">Hai bạn đã liên kết tài khoản mối quan hệ</p>
                </div>
              </div>
            </div>
          )}

          {/* 2. PENDING OUTGOING REQUEST CARD */}
          {isPendingOutgoing && (
            <div className="p-4 bg-amber-50 dark:bg-amber-950/15 border border-amber-100 dark:border-amber-900/30 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 animate-pulse">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-full overflow-hidden border border-amber-200 dark:border-amber-900 flex-shrink-0">
                  <img src={pendingPartnerAvatar} alt="Pending Partner Avatar" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-amber-700 dark:text-amber-400">
                    Đang chờ {pendingPartnerName} xác nhận
                  </h4>
                  <p className="text-xs text-grey font-medium mt-0.5">Lời mời hẹn hò/kết hôn đang ở trạng thái chờ</p>
                </div>
              </div>
              <button
                onClick={handleCancelRelationshipRequest}
                disabled={isSaving}
                className="px-4 py-2 text-xs font-bold text-amber-700 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300 bg-amber-100 dark:bg-amber-950/40 rounded-xl transition duration-150 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                Hủy yêu cầu
              </button>
            </div>
          )}

          {/* 3. INCOMING RELATIONSHIP REQUESTS */}
          {relationshipRequests.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-grey uppercase tracking-wider">
                Yêu cầu kết đôi mới ({relationshipRequests.length})
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {relationshipRequests.map((req) => (
                  <div 
                    key={req._id}
                    className="p-4 bg-slate-50 dark:bg-zinc-800/40 border border-grey/10 dark:border-zinc-850 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-full overflow-hidden border border-grey/20 dark:border-zinc-800 flex-shrink-0">
                        <img src={req.avatar || '/assets/avatar/avatar.jpg'} alt={req.username} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-black dark:text-white">
                          {req.username}
                        </h4>
                        <p className="text-xs text-pink-500 font-semibold flex items-center gap-1 mt-0.5">
                          <Heart className="w-3 h-3 fill-pink-500" />
                          Muốn thiết lập mối quan hệ với bạn
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAcceptRelationshipRequest(req._id)}
                        disabled={isProcessingRequest !== null}
                        className="px-4 py-2 text-xs font-bold text-white bg-blue hover:bg-blue-hover rounded-xl shadow-sm transition duration-150 flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        {isProcessingRequest === req._id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Check className="w-3.5 h-3.5" />
                        )}
                        Đồng ý
                      </button>
                      <button
                        onClick={() => handleRejectRelationshipRequest(req._id)}
                        disabled={isProcessingRequest !== null}
                        className="px-4 py-2 text-xs font-bold text-grey hover:bg-grey/10 dark:hover:bg-zinc-800 rounded-xl transition duration-150 flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        {isProcessingRequest === req._id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <X className="w-3.5 h-3.5" />
                        )}
                        Từ chối
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. SETUP FORM */}
          <div className="space-y-5 pt-3 border-t border-grey/10 dark:border-zinc-800">
            <h3 className="text-sm font-bold text-black dark:text-white">
              Cập nhật mối quan hệ của bạn
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* STATUS CUSTOM DROPDOWN */}
              <div className="space-y-2 relative" ref={statusDropdownRef}>
                <label className="block text-xs font-bold text-grey uppercase tracking-wider">Trạng thái</label>
                
                <button
                  type="button"
                  onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                  className="w-full flex items-center justify-between bg-grey/5 dark:bg-zinc-800/50 border border-grey/20 dark:border-zinc-800 rounded-2xl px-4 py-3.5 text-sm font-semibold text-black dark:text-white text-left focus:outline-none focus:border-blue transition cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
                    {STATUS_LABELS[relStatus] || 'Độc thân'}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-grey transition-transform duration-200 ${showStatusDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showStatusDropdown && (
                  <div className="absolute z-35 top-full left-0 w-full mt-2 bg-white dark:bg-zinc-900 border border-grey/20 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden py-1 divide-y divide-grey/5 dark:divide-zinc-800 animate-in fade-in slide-in-from-top-2 duration-150">
                    {RELATIONSHIP_STATUSES.map((status) => (
                      <button
                        key={status.value}
                        type="button"
                        onClick={() => {
                          setRelStatus(status.value);
                          setShowStatusDropdown(false);
                        }}
                        className={`w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-left transition-colors cursor-pointer ${
                          relStatus === status.value
                            ? 'bg-blue/5 dark:bg-blue-950/20 text-blue'
                            : 'text-black dark:text-white hover:bg-grey/5 dark:hover:bg-zinc-800/30'
                        }`}
                      >
                        <span>{status.label}</span>
                        {relStatus === status.value && <Check className="w-4 h-4 text-blue" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* PARTNER CUSTOM DROPDOWN (ONLY SHOWS IF NOT SINGLE) */}
              {relStatus !== 'single' && (
                <div className="space-y-2 relative" ref={partnerDropdownRef}>
                  <label className="block text-xs font-bold text-grey uppercase tracking-wider">Đối tác</label>
                  
                  <button
                    type="button"
                    onClick={() => setShowPartnerDropdown(!showPartnerDropdown)}
                    className="w-full flex items-center justify-between bg-grey/5 dark:bg-zinc-800/50 border border-grey/20 dark:border-zinc-800 rounded-2xl px-4 py-3.5 text-sm font-semibold text-black dark:text-white text-left focus:outline-none focus:border-blue transition cursor-pointer"
                  >
                    {selectedPartnerObj ? (
                      <span className="flex items-center gap-2.5">
                        <img 
                          src={selectedPartnerObj.avatar || '/assets/avatar/avatar.jpg'} 
                          alt="Partner" 
                          className="w-5 h-5 rounded-full object-cover"
                        />
                        <span>{selectedPartnerObj.username}</span>
                      </span>
                    ) : (
                      <span className="text-grey font-medium">Chọn đối tác (bắt buộc)</span>
                    )}
                    <ChevronDown className={`w-4 h-4 text-grey transition-transform duration-200 ${showPartnerDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {showPartnerDropdown && (
                    <div className="absolute z-35 top-full left-0 w-full mt-2 bg-white dark:bg-zinc-900 border border-grey/20 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-64 animate-in fade-in slide-in-from-top-2 duration-150">
                      {/* Dropdown Search Input */}
                      <div className="p-2 border-b border-grey/10 dark:border-zinc-800 sticky top-0 bg-white dark:bg-zinc-900">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-grey" />
                          <input
                            type="text"
                            placeholder="Tìm bạn bè..."
                            value={partnerSearchQuery}
                            onChange={(e) => setPartnerSearchQuery(e.target.value)}
                            className="w-full bg-grey/5 dark:bg-zinc-800/50 border border-grey/15 dark:border-zinc-850 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-blue transition font-semibold text-black dark:text-white"
                          />
                        </div>
                      </div>

                      {/* Dropdown Options List */}
                      <div className="overflow-y-auto py-1 divide-y divide-grey/5 dark:divide-zinc-800">
                        {filteredFriends.length === 0 ? (
                          <div className="text-center py-6 text-xs text-grey font-medium">
                            Không tìm thấy bạn bè nào
                          </div>
                        ) : (
                          filteredFriends.map((friend) => (
                            <button
                              key={friend._id}
                              type="button"
                              onClick={() => {
                                setRelPartner(friend._id);
                                setShowPartnerDropdown(false);
                              }}
                              className={`w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-left transition-colors cursor-pointer ${
                                relPartner === friend._id
                                  ? 'bg-blue/5 dark:bg-blue-950/20 text-blue'
                                  : 'text-black dark:text-white hover:bg-grey/5 dark:hover:bg-zinc-800/30'
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <img 
                                  src={friend.avatar || '/assets/avatar/avatar.jpg'} 
                                  alt={friend.username} 
                                  className="w-6 h-6 rounded-full object-cover"
                                />
                                <span>{friend.username}</span>
                              </div>
                              {relPartner === friend._id && <Check className="w-4 h-4 text-blue" />}
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Error messaging for missing partner */}
            {relStatus !== 'single' && !relPartner && (
              <p className="text-xs text-red font-medium leading-normal animate-pulse">
                * Vui lòng chọn một người bạn để gửi lời mời thiết lập mối quan hệ.
              </p>
            )}

            {/* Save Button */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleSaveRelationship}
                disabled={isSaving || (relStatus !== 'single' && !relPartner)}
                className="px-6 py-3 font-bold text-white bg-blue hover:bg-blue-hover rounded-2xl shadow-md shadow-blue/15 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01]"
              >
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Heart className="w-5 h-5 fill-white" />}
                Lưu thay đổi
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
