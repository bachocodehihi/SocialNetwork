'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../../../../services/auth.service';
import { accountService } from '../../../../services/accout.service';
import { useAlert } from '../../../../components/Alert/alertcontext';
import { ArrowLeft, AlertTriangle, Eye, EyeOff, Loader2, Trash2 } from 'lucide-react';

export default function DeleteAccountPage() {
  const router = useRouter();
  const { showSuccess, showError } = useAlert();

  const [email, setEmail] = useState('');
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await authService.getProfile();
        setEmail(data.email);
      } catch (err) {
        console.error('Error fetching email for deletion:', err);
        showError('Không thể lấy thông tin tài khoản');
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, []);

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password) {
      showError('Vui lòng nhập mật khẩu xác nhận');
      return;
    }

    setIsDeleting(true);
    try {
      // 1. Verify password using login with isVerifying flag
      await authService.login({ email, password, isVerifying: true });

      // 2. Request account deletion
      await accountService.requestDeleteAccount();

      showSuccess('Yêu cầu xóa tài khoản thành công! Tài khoản của bạn sẽ bị xóa sau 30 ngày.');
      
      // 3. Clear auth and redirect
      localStorage.removeItem('token');
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      router.replace('/signin');
    } catch (err: any) {
      console.error('Error requesting delete account:', err);
      showError(err.response?.data?.message || 'Mật khẩu xác nhận không chính xác');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loadingProfile) {
    return (
      <div className="flex h-screen items-center justify-center bg-grey/5">
        <Loader2 className="w-10 h-10 animate-spin text-blue" />
      </div>
    );
  }

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
          <h1 className="text-lg sm:text-xl font-bold tracking-tight">Xóa tài khoản</h1>
        </div>
      </header>

      {/* Body */}
      <main className="max-w-2xl mx-auto px-4 mt-6">
        <div className="bg-white rounded-2xl p-6 border border-grey/20 shadow-sm space-y-6">
          
          {/* Warning Card */}
          <div className="bg-red/5 border border-red/20 rounded-2xl p-5 flex gap-4 text-left">
            <div className="w-12 h-12 rounded-full bg-red/10 text-red flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-red text-base">Cảnh báo quan trọng</h3>
              <p className="text-xs sm:text-sm text-grey-hover font-medium mt-1 leading-relaxed text-justify">
                Việc xóa tài khoản là vĩnh viễn và không thể đảo ngược sau 30 ngày. Khi xóa tài khoản, tất cả bài viết, bạn bè, tin nhắn và thông tin cá nhân của bạn sẽ bị gỡ bỏ vĩnh viễn khỏi hệ thống.
              </p>
            </div>
          </div>

          <form onSubmit={handleDelete} className="space-y-5 text-left">
            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-grey uppercase tracking-wider">
                Nhập mật khẩu để xác nhận
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu tài khoản hiện tại"
                  className="w-full bg-grey/5 border border-grey/20 rounded-xl pl-4 pr-11 py-2.5 text-sm focus:outline-none focus:border-blue transition font-semibold text-black"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-grey hover:text-grey-hover bg-transparent border-0 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => router.push('/setting/account')}
                className="flex-1 bg-grey/10 hover:bg-grey/20 text-grey-hover py-3 rounded-xl text-center text-sm sm:text-base font-bold transition cursor-pointer border-0 active:scale-95"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={isDeleting}
                className="flex-1 bg-red hover:bg-red-hover text-white py-3 rounded-xl flex items-center justify-center gap-2 text-sm sm:text-base font-bold shadow active:scale-[0.99] transition duration-200 cursor-pointer border-0"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Đang xử lý...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-5 h-5" /> Xác nhận xóa tài khoản
                  </>
                )}
              </button>
            </div>
          </form>

        </div>
      </main>
    </div>
  );
}
