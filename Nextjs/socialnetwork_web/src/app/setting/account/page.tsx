'use client';
import { useRouter } from 'next/navigation';
import { ArrowLeft, UserSquare2, KeyRound, UserX, ChevronRight } from 'lucide-react';

export default function AccountSettingsPage() {
  const router = useRouter();

  const menuItems = [
    {
      name: 'Thay đổi thông tin',
      description: 'Cập nhật ảnh đại diện, tên hiển thị, địa chỉ, số điện thoại...',
      icon: UserSquare2,
      color: 'text-blue bg-blue/5',
      path: '/setting/account/change'
    },
    {
      name: 'Thay đổi mật khẩu',
      description: 'Cập nhật mật khẩu mới để bảo vệ tài khoản',
      icon: KeyRound,
      color: 'text-purple-500 bg-purple-50',
      path: '/setting/account/change/password'
    },
    {
      name: 'Xóa tài khoản',
      description: 'Yêu cầu xóa tài khoản vĩnh viễn khỏi mạng xã hội',
      icon: UserX,
      color: 'text-red bg-red/5',
      path: '/setting/account/delete'
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
          <h1 className="text-lg sm:text-xl font-bold tracking-tight">Tài khoản</h1>
        </div>
      </header>

      {/* Body */}
      <main className="max-w-2xl mx-auto px-4 mt-6">
        <div className="bg-white rounded-2xl border border-grey/20 overflow-hidden shadow-sm divide-y divide-grey/10">
          {menuItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div 
                key={idx}
                onClick={() => router.push(item.path)}
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-grey/5 active:bg-grey/10 transition group text-left"
              >
                <div className="flex items-start gap-4 min-w-0 pr-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${item.color} transition duration-200 group-hover:scale-105`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm sm:text-base text-black group-hover:text-blue transition-colors">
                      {item.name}
                    </h4>
                    <p className="text-xs sm:text-sm text-grey font-medium mt-0.5">
                      {item.description}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-grey/40 group-hover:text-grey-hover transition-transform duration-200 group-hover:translate-x-1 flex-shrink-0" />
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
