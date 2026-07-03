'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../../services/auth.service';
import { useAlert } from '../../components/Alert/alertcontext';
import { 
  ArrowLeft,
  User, 
  Lock, 
  Activity, 
  Bell, 
  Moon, 
  Globe, 
  RefreshCw, 
  LogOut, 
  ChevronRight,
  Mail,
  Loader2,
  Settings
} from 'lucide-react';

export default function SettingPage() {
  const router = useRouter();
  const { showSuccess, showError } = useAlert();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/signin');
      return;
    }

    const fetchProfile = async () => {
      try {
        const data = await authService.getProfile();
        setUser(data);
      } catch (err) {
        console.error('Error fetching profile in settings:', err);
        localStorage.removeItem('token');
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        router.replace('/signin');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    showSuccess('Đăng xuất thành công!');
    router.replace('/signin');
  };

  if (loading) {
    return (
      <div className='flex h-screen items-center justify-center bg-grey/5'>
        <div className='animate-spin rounded-full h-12 w-12 border-4 border-blue border-t-transparent'></div>
      </div>
    );
  }

  const settingSections = [
    {
      title: 'Giao diện & Trải nghiệm',
      items: [
        {
          name: 'Chế độ tối',
          description: 'Thay đổi giao diện sáng/tối phù hợp với mắt',
          icon: Moon,
          color: 'text-purple-500 bg-purple-50',
          path: '/setting/darkmode'
        },
        {
          name: 'Ngôn ngữ',
          description: 'Chọn ngôn ngữ hiển thị hệ thống',
          icon: Globe,
          color: 'text-indigo-500 bg-indigo-50',
          path: '/setting/language'
        }
      ]
    },
    {
      title: 'Tài khoản & Bảo mật',
      items: [
        {
          name: 'Cài đặt tài khoản',
          description: 'Cập nhật thông tin cá nhân và mật khẩu',
          icon: User,
          color: 'text-blue bg-blue/5',
          path: '/setting/account'
        },
        {
          name: 'Quyền riêng tư',
          description: 'Quản lý bài viết, danh sách bạn bè và lượt thích',
          icon: Lock,
          color: 'text-green bg-green/5',
          path: '/setting/privacy'
        },
        {
          name: 'Nhật ký hoạt động',
          description: 'Xem lại lịch sử tìm kiếm, tương tác của bạn',
          icon: Activity,
          color: 'text-orange-500 bg-orange-50',
          path: '/setting/activity'
        }
      ]
    },
    {
      title: 'Thông báo',
      items: [
        {
          name: 'Cài đặt thông báo',
          description: 'Tùy chỉnh các thông báo đẩy và âm thanh',
          icon: Bell,
          color: 'text-pink bg-pink/5',
          path: '/setting/notification'
        }
      ]
    },
    {
      title: 'Đăng nhập',
      items: [
        {
          name: 'Chuyển đổi tài khoản',
          description: 'Đăng nhập nhanh vào các tài khoản khác của bạn',
          icon: RefreshCw,
          color: 'text-teal-500 bg-teal-50',
          path: '/setting/switch/account'
        }
      ]
    }
  ];

  return (
    <div className='min-h-screen bg-grey/5 pb-16 font-sans text-grey-hover'>
      {/* Top sticky header */}
      <header className='sticky top-0 bg-white border-b border-grey/20 z-40 shadow-sm'>
        <div className='max-w-2xl mx-auto px-4 h-16 flex items-center gap-3.5'>
          <button 
            onClick={() => router.push('/home')}
            className='w-10 h-10 rounded-full hover:bg-grey/10 active:scale-95 flex items-center justify-center text-grey-hover transition border-0 bg-transparent cursor-pointer'
          >
            <ArrowLeft className='w-5 h-5' />
          </button>
          <h1 className='text-lg sm:text-xl font-bold tracking-tight'>Cài đặt</h1>
        </div>
      </header>

      {/* Main settings body */}
      <main className='max-w-2xl mx-auto px-4 mt-6 space-y-6'>
        
        {/* User Card Summary */}
        <div 
          onClick={() => router.push('/profile')}
          className='bg-white rounded-2xl p-5 border border-grey/20 shadow-sm flex items-center justify-between cursor-pointer hover:bg-grey/5 hover:border-grey/30 active:scale-[0.99] transition duration-200 group'
        >
          <div className='flex items-center gap-4 min-w-0'>
            <div className='w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow bg-white flex-shrink-0'>
              <img 
                src={user?.avatar || '/assets/avatar/avatar.jpg'} 
                alt='Avatar' 
                className='w-full h-full object-cover'
              />
            </div>
            <div className='min-w-0 text-left'>
              <h3 className='font-bold text-lg text-black truncate group-hover:text-blue transition-colors'>
                {user?.username || 'Người dùng'}
              </h3>
              <div className='flex items-center gap-1.5 text-xs text-grey mt-1 font-semibold truncate'>
                <Mail className='w-3.5 h-3.5 flex-shrink-0' />
                <span>{user?.email || 'Chưa cập nhật email'}</span>
              </div>
            </div>
          </div>
          <ChevronRight className='w-5 h-5 text-grey/40 group-hover:text-grey-hover transition-transform duration-200 group-hover:translate-x-1' />
        </div>

        {/* Setting Sections */}
        {settingSections.map((section, idx) => (
          <div key={idx} className='space-y-2.5'>
            <h2 className='text-xs font-bold uppercase tracking-wider text-grey px-1.5 select-none'>
              {section.title}
            </h2>
            <div className='bg-white rounded-2xl border border-grey/20 overflow-hidden shadow-sm divide-y divide-grey/10'>
              {section.items.map((item, itemIdx) => {
                const IconComponent = item.icon;
                return (
                  <div 
                    key={itemIdx}
                    onClick={() => router.push(item.path)}
                    className='flex items-center justify-between p-4 cursor-pointer hover:bg-grey/5 active:bg-grey/10 transition group text-left'
                  >
                    <div className='flex items-start gap-4 min-w-0'>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${item.color} transition duration-200 group-hover:scale-105`}>
                        <IconComponent className='w-5 h-5' />
                      </div>
                      <div className='min-w-0 pr-2'>
                        <h4 className='font-bold text-sm sm:text-base text-black group-hover:text-blue transition-colors'>
                          {item.name}
                        </h4>
                        <p className='text-xs sm:text-sm text-grey font-medium mt-0.5 line-clamp-1'>
                          {item.description}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className='w-5 h-5 text-grey/40 group-hover:text-grey-hover transition-transform duration-200 group-hover:translate-x-1 flex-shrink-0' />
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Danger Zone / Log out */}
        <div className='pt-2'>
          <button
            onClick={handleLogout}
            className='w-full flex items-center justify-between p-4 bg-white hover:bg-red/5 active:scale-[0.99] border border-grey/20 hover:border-red/20 rounded-2xl shadow-sm transition duration-200 group cursor-pointer text-left'
          >
            <div className='flex items-center gap-4 min-w-0'>
              <div className='w-10 h-10 rounded-full bg-red/10 flex items-center justify-center text-red group-hover:bg-red/20 transition duration-200 flex-shrink-0'>
                <LogOut className='w-5 h-5' />
              </div>
              <div>
                <h4 className='font-bold text-sm sm:text-base text-red group-hover:text-red-hover transition-colors'>
                  Đăng xuất
                </h4>
                <p className='text-xs sm:text-sm text-grey font-medium mt-0.5'>
                  Thoát tài khoản hiện tại khỏi thiết bị này
                </p>
              </div>
            </div>
          </button>
        </div>

      </main>
    </div>
  );
}
