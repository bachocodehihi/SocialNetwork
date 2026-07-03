'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { accountService } from '../../../../services/accout.service';
import { useAlert } from '../../../../components/Alert/alertcontext';
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  Briefcase, 
  Globe, 
  User, 
  Mail, 
  Cake, 
  Users2,
  Loader2,
  Save
} from 'lucide-react';

export default function ChangeInfoPage() {
  const router = useRouter();
  const { showSuccess, showError } = useAlert();

  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  // Editable fields state
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [job, setJob] = useState('');
  const [nationality, setNationality] = useState('');

  // Saving states
  const [isSaving, setIsSaving] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await accountService.getProfile();
        setProfile(data);
        setAddress(data.address || '');
        setPhone(data.phone || '');
        setJob(data.job || '');
        setNationality(data.nationality || '');
      } catch (err) {
        console.error('Error fetching profile:', err);
        showError('Không thể tải thông tin tài khoản');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSaveField = async (field: 'address' | 'phone' | 'job' | 'nationality', value: string) => {
    setIsSaving(prev => ({ ...prev, [field]: true }));
    try {
      if (field === 'address') {
        await accountService.addAddress(value);
      } else if (field === 'phone') {
        await accountService.addPhone(value);
      } else if (field === 'job') {
        await accountService.addJob(value);
      } else if (field === 'nationality') {
        await accountService.addNationality(value);
      }
      showSuccess(`Cập nhật ${field === 'address' ? 'địa chỉ' : field === 'phone' ? 'số điện thoại' : field === 'job' ? 'công việc' : 'quốc tịch'} thành công!`);
    } catch (err) {
      console.error(`Error saving ${field}:`, err);
      showError('Không thể cập nhật thông tin. Vui lòng thử lại.');
    } finally {
      setIsSaving(prev => ({ ...prev, [field]: false }));
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-grey/5">
        <Loader2 className="w-10 h-10 animate-spin text-blue" />
      </div>
    );
  }

  const readOnlyFields = [
    { label: 'Tên người dùng', value: profile?.username || 'Chưa cập nhật', icon: User },
    { label: 'Email', value: profile?.email || 'Chưa cập nhật', icon: Mail },
    { label: 'Ngày sinh', value: profile?.birthday ? new Date(profile.birthday).toLocaleDateString('vi-VN') : 'Chưa cập nhật', icon: Cake },
    { label: 'Giới tính', value: profile?.gender === 'male' ? 'Nam' : profile?.gender === 'female' ? 'Nữ' : 'Khác', icon: Users2 }
  ];

  return (
    <div className="min-h-screen bg-grey/5 pb-16 font-sans text-grey-hover">
      {/* Header */}
      <header className="sticky top-0 bg-white border-b border-grey/20 z-40 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center gap-3.5">
          <button 
            onClick={() => router.push('/setting/account')}
            className="w-10 h-10 rounded-full hover:bg-grey/10 active:scale-95 flex items-center justify-center text-grey-hover transition border-0 bg-transparent cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight">Thay đổi thông tin</h1>
        </div>
      </header>

      {/* Body */}
      <main className="max-w-2xl mx-auto px-4 mt-6 space-y-6">
        
        {/* Editable Fields Section */}
        <div className="bg-white rounded-2xl p-6 border border-grey/20 shadow-sm space-y-5">
          <h2 className="text-sm font-bold text-black border-b border-grey/10 pb-3 text-left">
            Thông tin có thể chỉnh sửa
          </h2>

          {/* Address */}
          <div className="space-y-1.5 text-left">
            <label className="text-xs font-bold text-grey uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" /> Địa chỉ
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Nhập địa chỉ của bạn"
                className="flex-1 bg-grey/5 border border-grey/20 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue transition font-semibold text-black"
              />
              <button
                onClick={() => handleSaveField('address', address)}
                disabled={isSaving['address']}
                className="bg-blue hover:bg-blue-hover text-white px-4 rounded-xl flex items-center justify-center gap-1.5 text-sm font-bold shadow-sm active:scale-95 transition cursor-pointer border-0"
              >
                {isSaving['address'] ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Lưu
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-1.5 text-left">
            <label className="text-xs font-bold text-grey uppercase tracking-wider flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" /> Số điện thoại
            </label>
            <div className="flex gap-2">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Nhập số điện thoại"
                className="flex-1 bg-grey/5 border border-grey/20 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue transition font-semibold text-black"
              />
              <button
                onClick={() => handleSaveField('phone', phone)}
                disabled={isSaving['phone']}
                className="bg-blue hover:bg-blue-hover text-white px-4 rounded-xl flex items-center justify-center gap-1.5 text-sm font-bold shadow-sm active:scale-95 transition cursor-pointer border-0"
              >
                {isSaving['phone'] ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Lưu
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Job */}
          <div className="space-y-1.5 text-left">
            <label className="text-xs font-bold text-grey uppercase tracking-wider flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5" /> Công việc
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={job}
                onChange={(e) => setJob(e.target.value)}
                placeholder="Công việc hiện tại"
                className="flex-1 bg-grey/5 border border-grey/20 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue transition font-semibold text-black"
              />
              <button
                onClick={() => handleSaveField('job', job)}
                disabled={isSaving['job']}
                className="bg-blue hover:bg-blue-hover text-white px-4 rounded-xl flex items-center justify-center gap-1.5 text-sm font-bold shadow-sm active:scale-95 transition cursor-pointer border-0"
              >
                {isSaving['job'] ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Lưu
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Nationality */}
          <div className="space-y-1.5 text-left">
            <label className="text-xs font-bold text-grey uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" /> Quốc tịch
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={nationality}
                onChange={(e) => setNationality(e.target.value)}
                placeholder="Quốc gia / Quốc tịch"
                className="flex-1 bg-grey/5 border border-grey/20 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue transition font-semibold text-black"
              />
              <button
                onClick={() => handleSaveField('nationality', nationality)}
                disabled={isSaving['nationality']}
                className="bg-blue hover:bg-blue-hover text-white px-4 rounded-xl flex items-center justify-center gap-1.5 text-sm font-bold shadow-sm active:scale-95 transition cursor-pointer border-0"
              >
                {isSaving['nationality'] ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Lưu
                  </>
                )}
              </button>
            </div>
          </div>

        </div>

        {/* Read-Only Profile Info Section */}
        <div className="bg-white rounded-2xl p-6 border border-grey/20 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-black border-b border-grey/10 pb-3 text-left">
            Thông tin hệ thống cố định
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {readOnlyFields.map((field, idx) => {
              const Icon = field.icon;
              return (
                <div key={idx} className="flex items-center gap-3 bg-grey/5 p-3 rounded-xl border border-grey/10 text-left">
                  <div className="w-9 h-9 rounded-full bg-grey/10 flex items-center justify-center text-grey flex-shrink-0">
                    <Icon className="w-4 h-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] font-bold text-grey uppercase tracking-wider block">
                      {field.label}
                    </span>
                    <span className="text-sm font-bold text-black truncate block mt-0.5">
                      {field.value}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-grey text-left mt-2 italic">
            * Các thông tin hệ thống cố định được thiết lập khi đăng ký tài khoản và không thể tự ý thay đổi.
          </p>
        </div>

      </main>
    </div>
  );
}
