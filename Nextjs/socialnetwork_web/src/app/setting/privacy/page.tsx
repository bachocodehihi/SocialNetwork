'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { accountService } from '../../../services/accout.service';
import { useAlert } from '../../../components/Alert/alertcontext';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  MapPin, 
  Cake, 
  Users2, 
  Briefcase, 
  Globe, 
  Loader2,
  Lock
} from 'lucide-react';

export default function PrivacyPage() {
  const router = useRouter();
  const { showSuccess, showError } = useAlert();

  const [isLoading, setIsLoading] = useState(true);
  const [privacySettings, setPrivacySettings] = useState({
    email: true,
    phone: true,
    address: true,
    birthday: true,
    gender: true,
    job: true,
    nationality: true
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await accountService.getPrivacy();
        // Backend returns privacy object
        if (data) {
          setPrivacySettings({
            email: data.email ?? true,
            phone: data.phone ?? true,
            address: data.address ?? true,
            birthday: data.birthday ?? true,
            gender: data.gender ?? true,
            job: data.job ?? true,
            nationality: data.nationality ?? true
          });
        }
      } catch (err) {
        console.error('Error fetching privacy settings:', err);
        showError('Không thể tải cài đặt quyền riêng tư');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleToggle = async (key: string, currentValue: boolean) => {
    const newValue = !currentValue;

    // Optimistic UI update
    setPrivacySettings(prev => ({ ...prev, [key]: newValue }));

    try {
      await accountService.updatePrivacy({ [key]: newValue });
      showSuccess('Cập nhật quyền riêng tư thành công!');
    } catch (err) {
      console.error('Error updating privacy:', err);
      showError('Không thể cập nhật cài đặt. Đang khôi phục...');
      // Revert if failed
      setPrivacySettings(prev => ({ ...prev, [key]: currentValue }));
    }
  };

  const privacyItems = [
    {
      key: 'email',
      title: 'Email',
      icon: Mail,
      color: 'text-blue-500 bg-blue-50'
    },
    {
      key: 'phone',
      title: 'Số điện thoại',
      icon: Phone,
      color: 'text-green bg-green/5'
    },
    {
      key: 'address',
      title: 'Địa chỉ',
      icon: MapPin,
      color: 'text-red bg-red/5'
    },
    {
      key: 'birthday',
      title: 'Ngày sinh',
      icon: Cake,
      color: 'text-pink bg-pink/5'
    },
    {
      key: 'gender',
      title: 'Giới tính',
      icon: Users2,
      color: 'text-teal-500 bg-teal-50'
    },
    {
      key: 'job',
      title: 'Công việc',
      icon: Briefcase,
      color: 'text-amber-500 bg-amber-50'
    },
    {
      key: 'nationality',
      title: 'Quốc tịch',
      icon: Globe,
      color: 'text-indigo-500 bg-indigo-50'
    }
  ];

  return (
    <div className="min-h-screen bg-grey/5 pb-16 font-sans text-grey-hover">
      {/* Header */}
      <header className="sticky top-0 bg-white border-b border-grey/20 z-40 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center gap-3.5">
          <button 
            onClick={() => router.push('/setting')}
            className="w-10 h-10 rounded-full hover:bg-grey/10 active:scale-95 flex items-center justify-center text-grey-hover transition border-0 bg-transparent cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight">Quyền riêng tư</h1>
        </div>
      </header>

      {/* Body */}
      <main className="max-w-2xl mx-auto px-4 mt-6">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-10 h-10 animate-spin text-blue" />
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-grey px-1.5 mb-2.5 select-none text-left">
                Thông tin cá nhân công khai
              </h2>
              <div className="bg-white rounded-2xl border border-grey/20 overflow-hidden shadow-sm divide-y divide-grey/10">
                {privacyItems.map((item) => {
                  const Icon = item.icon;
                  const value = (privacySettings as any)[item.key];
                  return (
                    <div 
                      key={item.key}
                      className="flex items-center justify-between p-4 text-left"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${item.color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm sm:text-base text-black">
                            {item.title}
                          </h4>
                          <p className="text-xs text-grey font-medium mt-0.5">
                            {value ? 'Đang hiển thị công khai trên trang cá nhân' : 'Đang ẩn khỏi người khác'}
                          </p>
                        </div>
                      </div>

                      {/* Custom Switch Switcher */}
                      <button 
                        onClick={() => handleToggle(item.key, value)}
                        className={`w-12 h-7 flex items-center rounded-full p-0.5 cursor-pointer transition-colors duration-300 focus:outline-none border-0 ${value ? 'bg-blue' : 'bg-grey/30'}`}
                      >
                        <div 
                          className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${value ? 'translate-x-5' : 'translate-x-0'}`}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Account Privacy section */}
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-grey px-1.5 mb-2.5 select-none text-left">
                Loại tài khoản
              </h2>
              <div className="bg-white rounded-2xl border border-grey/20 p-4 shadow-sm flex items-center justify-between text-left">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-red/10 text-red">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm sm:text-base text-black">Tài khoản riêng tư</h4>
                    <p className="text-xs text-grey font-medium mt-0.5 max-w-[280px] sm:max-w-md">
                      Chỉ cho phép những người bạn phê duyệt xem ảnh và video của bạn. (Tính năng đang phát triển)
                    </p>
                  </div>
                </div>

                <button 
                  disabled
                  className="w-12 h-7 flex items-center rounded-full p-0.5 cursor-not-allowed bg-grey/30 border-0"
                >
                  <div className="bg-white w-6 h-6 rounded-full shadow-md" />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
