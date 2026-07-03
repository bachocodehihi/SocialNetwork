'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAlert } from '../../../components/Alert/alertcontext';
import { ArrowLeft, Bell, Volume2, Mail, MessageSquare, Heart } from 'lucide-react';

export default function NotificationSettingsPage() {
  const router = useRouter();
  const { showSuccess } = useAlert();

  const [settings, setSettings] = useState({
    pushNotifications: true,
    soundEnabled: true,
    emailAlerts: false,
    messageAlerts: true,
    interactionAlerts: true
  });

  useEffect(() => {
    const saved = localStorage.getItem('notification_settings');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (err) {
        console.error('Error loading notification settings:', err);
      }
    }
  }, []);

  const handleToggle = (key: keyof typeof settings) => {
    const nextState = { ...settings, [key]: !settings[key] };
    setSettings(nextState);
    localStorage.setItem('notification_settings', JSON.stringify(nextState));
    showSuccess('Cập nhật cài đặt thông báo thành công!');
  };

  const notificationOptions = [
    {
      key: 'pushNotifications' as const,
      title: 'Thông báo đẩy',
      description: 'Nhận thông báo tức thì trên thiết bị này',
      icon: Bell,
      color: 'text-blue bg-blue/5'
    },
    {
      key: 'soundEnabled' as const,
      title: 'Âm thanh thông báo',
      description: 'Phát âm thanh khi có thông báo mới',
      icon: Volume2,
      color: 'text-purple-500 bg-purple-50'
    },
    {
      key: 'emailAlerts' as const,
      title: 'Thông báo qua Email',
      description: 'Nhận email tổng hợp hoạt động hàng ngày',
      icon: Mail,
      color: 'text-amber-500 bg-amber-50'
    },
    {
      key: 'messageAlerts' as const,
      title: 'Tin nhắn mới',
      description: 'Thông báo khi có người nhắn tin cho bạn',
      icon: MessageSquare,
      color: 'text-green bg-green/5'
    },
    {
      key: 'interactionAlerts' as const,
      title: 'Tương tác & Theo dõi',
      description: 'Thông báo khi có người thích, bình luận hoặc theo dõi',
      icon: Heart,
      color: 'text-pink bg-pink/5'
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
          <h1 className="text-lg sm:text-xl font-bold tracking-tight">Thông báo</h1>
        </div>
      </header>

      {/* Body */}
      <main className="max-w-2xl mx-auto px-4 mt-6">
        <div className="bg-white rounded-2xl border border-grey/20 overflow-hidden shadow-sm divide-y divide-grey/10 text-left">
          {notificationOptions.map((item) => {
            const Icon = item.icon;
            const value = settings[item.key];
            return (
              <div 
                key={item.key}
                className="flex items-center justify-between p-4"
              >
                <div className="flex items-start gap-4 min-w-0 pr-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${item.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm sm:text-base text-black">
                      {item.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-grey font-medium mt-0.5">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Switch Switcher */}
                <button 
                  onClick={() => handleToggle(item.key)}
                  className={`flex-shrink-0 w-12 h-7 flex items-center rounded-full p-0.5 cursor-pointer transition-colors duration-300 focus:outline-none border-0 ${value ? 'bg-blue' : 'bg-grey/30'}`}
                >
                  <div 
                    className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${value ? 'translate-x-5' : 'translate-x-0'}`}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
